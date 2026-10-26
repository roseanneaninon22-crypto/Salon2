"use client";
import SalonLogo from "./SalonLogo";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

type Booking = {
  id: string;
  user_id?: string;
  services: string;
  stylist: string;
  date: string;
  time: string;
  status: string;
  total: number;
  notes?: string | null;
  customer_name?: string | null;
  customer_phone?: string | null;
  payment_method?: string | null;
  rated?: boolean;
  service_rating?: number | null;
  stylist_rating?: number | null;
  review_text?: string | null;
  created_at?: string;
};

type Props = { onBack: () => void; onBook: () => void };
const TABS = ["Upcoming", "Completed", "Cancelled"];

export default function MyBookings({ onBack, onBook }: Props) {
  const [tab, setTab] = useState(0);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratingBooking, setRatingBooking] = useState<Booking | null>(null);
  const [serviceStars, setServiceStars] = useState(0);
  const [stylistStars, setStylistStars] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [ratingError, setRatingError] = useState("");
  const [ratingLoading, setRatingLoading] = useState(false);

  useEffect(() => {
    let disposed = false;
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let refreshTimer: ReturnType<typeof setInterval> | null = null;
    const realtimeChanges = new Map<string, Booking | null>();
    let reconnecting = false;

    const subscribeToBookings = (userId: string) => {
      channel = supabase
        .channel(`bookings-for-${userId}-${crypto.randomUUID()}`)
        .on("postgres_changes", {
          event: "*",
          schema: "public",
          table: "bookings",
          filter: `user_id=eq.${userId}`,
        }, payload => {
          if (payload.eventType === "DELETE") {
            const removed = payload.old as Partial<Booking>;
            if (!removed.id) return;
            realtimeChanges.set(removed.id, null);
            setBookings(current => current.filter(b => b.id !== removed.id));
            return;
          }
          const changed = payload.new as Booking;
          if (!changed.id) return;
          realtimeChanges.set(changed.id, changed);
          setBookings(current =>
            current.some(b => b.id === changed.id)
              ? current.map(b => b.id === changed.id ? { ...b, ...changed } : b)
              : [changed, ...current]
          );
        })
        .subscribe((status, error) => {
          if (disposed) return;
          if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
            const message = error?.message ?? "Realtime connection failed";
            if (/InvalidJWTToken|token has expired/i.test(message) && !reconnecting) {
              reconnecting = true;
              void supabase.auth.refreshSession().then(async ({ data, error: refreshError }) => {
                if (disposed) return;
                if (refreshError || !data.session) return;
                await supabase.realtime.setAuth(data.session.access_token);
                if (disposed) return;
                const old = channel;
                channel = null;
                if (old) await supabase.removeChannel(old);
                if (!disposed) subscribeToBookings(userId);
              }).finally(() => { reconnecting = false; });
            }
          }
        });
    };

    const load = async () => {
      setLoading(true);
      const { data: { session }, error: sessionError } = await supabase.auth.refreshSession();
      if (disposed) return;
      const user = session?.user;
      if (!user) {
        if (sessionError) console.error("Session error:", sessionError.message);
        setLoading(false);
        return;
      }
      await supabase.realtime.setAuth(session.access_token);
      if (disposed) return;
      subscribeToBookings(user.id);

      const { data } = await supabase
        .from("bookings")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (disposed) return;

      const latest = new Map((data ?? []).map(b => [b.id, b]));
      for (const [id, b] of realtimeChanges) {
        if (b) latest.set(id, b);
        else latest.delete(id);
      }
      setBookings([...latest.values()]);
      setLoading(false);

      refreshTimer = setInterval(() => {
        void supabase
          .from("bookings")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .then(({ data: fresh }) => {
            if (!disposed && fresh) setBookings(fresh);
          });
      }, 5000);
    };

    void load();
    return () => {
      disposed = true;
      if (refreshTimer) clearInterval(refreshTimer);
      if (channel) void supabase.removeChannel(channel);
    };
  }, []);

  const filtered = bookings.filter(b => {
    if (tab === 0) return b.status === "pending" || b.status === "confirmed";
    if (tab === 1) return b.status === "completed";
    return b.status === "cancelled";
  });

  const cancel = async (id: string) => {
    const booking = bookings.find(b => b.id === id);
    if (!booking || booking.status !== "pending") return;
    const { error } = await supabase.from("bookings").update({ status: "cancelled" }).eq("id", id);
    if (error) { window.alert(`Could not cancel: ${error.message}`); return; }
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: "cancelled" } : b));
  };

  const submitRating = async () => {
    if (!ratingBooking) return;
    if (!serviceStars || !stylistStars || !reviewText.trim()) {
      setRatingError("Please rate the service and stylist, then write a review.");
      return;
    }
    setRatingLoading(true);
    setRatingError("");
    const review = reviewText.trim();
    const { data, error } = await supabase.from("bookings")
      .update({ service_rating: serviceStars, stylist_rating: stylistStars, review_text: review, rated: true })
      .eq("id", ratingBooking.id).eq("status", "completed").eq("rated", false)
      .select("id").maybeSingle();
    if (error || !data) {
      setRatingError(error?.message ?? "Already rated or not available.");
      setRatingLoading(false);
      return;
    }
    setBookings(prev => prev.map(b =>
      b.id === ratingBooking.id
        ? { ...b, rated: true, service_rating: serviceStars, stylist_rating: stylistStars, review_text: review }
        : b
    ));
    setRatingBooking(null);
    setRatingLoading(false);
  };

  return (
    <div className="page">

      {/* ── Rating Modal ── */}
      {ratingBooking && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <div style={{ background: "#1a1a1a", border: "1px solid rgba(232,25,125,0.3)", borderRadius: 16, padding: 28, width: "min(440px, calc(100vw - 32px))", maxHeight: "90vh", overflowY: "auto" }}>
            <p style={{ fontWeight: 700, fontSize: 18, color: "var(--gold)", marginBottom: 6, textAlign: "center" }}>Rate Your Experience</p>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 20, textAlign: "center" }}>{ratingBooking.services} · {ratingBooking.stylist}</p>
            {[
              { label: "Service experience", value: serviceStars, set: setServiceStars },
              { label: "Stylist performance", value: stylistStars, set: setStylistStars },
            ].map(g => (
              <fieldset key={g.label} style={{ border: 0, padding: 0, margin: "0 0 16px" }}>
                <legend style={{ color: "#fff", fontSize: 13, marginBottom: 6 }}>{g.label}</legend>
                <div style={{ display: "flex", gap: 8 }}>
                  {[1,2,3,4,5].map(n => (
                    <button key={n} type="button" aria-label={`${n} stars`} aria-pressed={g.value === n}
                      onClick={() => g.set(n)}
                      style={{ border: 0, background: "transparent", fontSize: 30, cursor: "pointer", color: n <= g.value ? "#ffc107" : "rgba(255,255,255,.25)" }}>★</button>
                  ))}
                </div>
              </fieldset>
            ))}
            <label htmlFor="booking-review" style={{ display: "block", color: "#fff", fontSize: 13, marginBottom: 8 }}>Your review</label>
            <textarea id="booking-review" value={reviewText} maxLength={1000}
              onChange={e => setReviewText(e.target.value)}
              placeholder="Tell us about your visit..." rows={4}
              style={{ width: "100%", resize: "vertical", padding: 12, borderRadius: 10, background: "#111", color: "#fff", border: "1px solid rgba(255,255,255,.2)", font: "inherit", boxSizing: "border-box" }} />
            {ratingError && <p role="alert" style={{ color: "#ff8a80", fontSize: 12 }}>{ratingError}</p>}
            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              <button className="btn-outline" style={{ fontSize: 13 }} onClick={() => setRatingBooking(null)}>Cancel</button>
              <button className="btn-pink" style={{ fontSize: 13 }} onClick={submitRating} disabled={ratingLoading}>
                {ratingLoading ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className="site-nav">
        <div className="site-nav-brand"><SalonLogo /></div>
        <button className="btn-ghost" onClick={onBack} style={{ fontSize: 13 }}>‹ Back to Home</button>
      </nav>

      <div className="page-content">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <h1 className="page-title" style={{ margin: 0 }}>My Bookings</h1>
          <button className="btn-pink" onClick={onBook} style={{ width: "auto", padding: "10px 24px", borderRadius: 10 }}>+ New Booking</button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
          {TABS.map((t, i) => (
            <button key={t} onClick={() => setTab(i)} style={{
              padding: "9px 20px", borderRadius: 20, fontSize: 13, fontWeight: 700, cursor: "pointer",
              border: i === tab ? "none" : "1.5px solid var(--pink)",
              background: i === tab ? "linear-gradient(135deg,#e8197d,#b5105e)" : "transparent",
              color: i === tab ? "#fff" : "var(--pink)",
            }}>{t}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>Loading bookings...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60 }}>
            <p style={{ fontSize: 48, marginBottom: 14 }}>📋</p>
            <p style={{ color: "var(--text-muted)", fontSize: 15 }}>No bookings found</p>
            <button className="btn-pink" onClick={onBook} style={{ marginTop: 20, width: "auto", padding: "12px 32px", borderRadius: 10 }}>Book Now</button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {filtered.map(b => (
              <div key={b.id} className="card" style={{
                padding: 0, overflow: "hidden",
                border: b.status === "confirmed" ? "1.5px solid #4caf50" : undefined,
              }}>

                {/* Confirmed banner */}
                {b.status === "confirmed" && (
                  <div style={{
                    display: "flex", alignItems: "center", gap: 10,
                    background: "rgba(76,175,80,0.13)",
                    borderBottom: "1px solid rgba(76,175,80,0.25)",
                    padding: "11px 20px",
                  }}>
                    <span style={{ fontSize: 22 }}>✅</span>
                    <div>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: "#4caf50" }}>
                        Appointment Confirmed!
                      </p>
                      <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
                        The salon has approved your booking. Full details below.
                      </p>
                    </div>
                  </div>
                )}

                <div style={{ padding: 20 }}>
                  {/* Service + status header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                    <div style={{ flex: 1, minWidth: 0, paddingRight: 12 }}>
                      <p style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>{b.services}</p>
                      <p style={{ fontSize: 12, color: "var(--text-muted)" }}>💇 {b.stylist}</p>
                    </div>
                    <span className={`badge badge-${b.status}`} style={{ flexShrink: 0, textTransform: "capitalize" }}>
                      {b.status}
                    </span>
                  </div>

                  {/* Full details */}
                  <div style={{
                    display: "grid", gridTemplateColumns: "1fr 1fr",
                    gap: "12px 20px", fontSize: 13,
                    background: "rgba(255,255,255,0.03)",
                    borderRadius: 10, padding: 14, marginBottom: 14,
                  }}>
                    <div>
                      <p style={{ fontSize: 10, color: "rgba(255,255,255,0.38)", fontWeight: 700, letterSpacing: 1, marginBottom: 3 }}>DATE</p>
                      <p style={{ fontWeight: 600 }}>📅 {b.date}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: 10, color: "rgba(255,255,255,0.38)", fontWeight: 700, letterSpacing: 1, marginBottom: 3 }}>TIME</p>
                      <p style={{ fontWeight: 600 }}>🕐 {b.time}</p>
                    </div>
                    {b.customer_name && (
                      <div>
                        <p style={{ fontSize: 10, color: "rgba(255,255,255,0.38)", fontWeight: 700, letterSpacing: 1, marginBottom: 3 }}>NAME</p>
                        <p style={{ fontWeight: 600 }}>👤 {b.customer_name}</p>
                      </div>
                    )}
                    {b.customer_phone && (
                      <div>
                        <p style={{ fontSize: 10, color: "rgba(255,255,255,0.38)", fontWeight: 700, letterSpacing: 1, marginBottom: 3 }}>PHONE</p>
                        <p style={{ fontWeight: 600 }}>📞 {b.customer_phone}</p>
                      </div>
                    )}
                    <div>
                      <p style={{ fontSize: 10, color: "rgba(255,255,255,0.38)", fontWeight: 700, letterSpacing: 1, marginBottom: 3 }}>PAYMENT</p>
                      <p style={{ fontWeight: 600 }}>💳 {b.payment_method ?? "Cash"}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: 10, color: "rgba(255,255,255,0.38)", fontWeight: 700, letterSpacing: 1, marginBottom: 3 }}>TOTAL</p>
                      <p style={{ fontWeight: 800, color: "var(--pink)", fontSize: 17 }}>₱{Number(b.total).toLocaleString()}</p>
                    </div>
                    {b.notes && (
                      <div style={{ gridColumn: "1 / -1" }}>
                        <p style={{ fontSize: 10, color: "rgba(255,255,255,0.38)", fontWeight: 700, letterSpacing: 1, marginBottom: 3 }}>NOTES</p>
                        <p style={{ color: "rgba(255,255,255,0.65)", fontStyle: "italic" }}>📝 {b.notes}</p>
                      </div>
                    )}
                    {b.created_at && (
                      <div style={{ gridColumn: "1 / -1" }}>
                        <p style={{ fontSize: 10, color: "rgba(255,255,255,0.38)", fontWeight: 700, letterSpacing: 1, marginBottom: 3 }}>BOOKED ON</p>
                        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.38)" }}>{new Date(b.created_at).toLocaleString()}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {b.status === "pending" && (
                    <button className="btn-outline" style={{ padding: "8px 20px", fontSize: 12 }} onClick={() => cancel(b.id)}>
                      Cancel Booking
                    </button>
                  )}
                  {b.status === "completed" && !b.rated && (
                    <button className="btn-pink"
                      style={{ width: "auto", padding: "8px 20px", fontSize: 12, borderRadius: 10 }}
                      onClick={() => { setServiceStars(0); setStylistStars(0); setReviewText(""); setRatingError(""); setRatingBooking(b); }}>
                      ★ Rate & Review
                    </button>
                  )}
                  {b.status === "completed" && b.rated && (
                    <div style={{ fontSize: 13, color: "#ffc107", background: "rgba(255,193,7,0.08)", borderRadius: 8, padding: "10px 14px" }}>
                      <p style={{ margin: 0, fontWeight: 700 }}>Your Review</p>
                      <p style={{ margin: "4px 0 0" }}>
                        Service: {"★".repeat(b.service_rating ?? 0)} {b.service_rating}/5
                        {" · "}
                        Stylist: {"★".repeat(b.stylist_rating ?? 0)} {b.stylist_rating}/5
                      </p>
                      {b.review_text && (
                        <p style={{ color: "rgba(255,255,255,0.6)", margin: "6px 0 0", fontStyle: "italic" }}>"{b.review_text}"</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
