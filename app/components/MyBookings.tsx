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
            setBookings(current => current.filter(booking => booking.id !== removed.id));
            return;
          }

          const changed = payload.new as Booking;
          if (!changed.id) return;
          realtimeChanges.set(changed.id, changed);
          setBookings(current => current.some(booking => booking.id === changed.id)
            ? current.map(booking => booking.id === changed.id ? { ...booking, ...changed } : booking)
            : [changed, ...current]);
        })
        .subscribe((status, error) => {
          if (disposed) return;

          if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
            const message = error?.message ?? "Realtime connection failed";
            if (/InvalidJWTToken|token has expired/i.test(message) && !reconnecting) {
              reconnecting = true;
              void supabase.auth.refreshSession().then(async ({ data, error: refreshError }) => {
                if (disposed) return;
                if (refreshError || !data.session) {
                  console.error("Could not refresh the session for booking updates:", refreshError?.message ?? "Please sign in again.");
                  return;
                }
                await supabase.realtime.setAuth(data.session.access_token);
                if (disposed) return;
                const expiredChannel = channel;
                channel = null;
                if (expiredChannel) await supabase.removeChannel(expiredChannel);
                if (!disposed) subscribeToBookings(userId);
              }).finally(() => { reconnecting = false; });
              return;
            }
            console.warn("Customer booking realtime is unavailable; periodic refresh remains active:", message);
          }
        });
    };

    const fetch = async () => {
      setLoading(true);
      // Refresh once before joining Realtime so it doesn't subscribe with an
      // expired access token restored from a long-idle browser tab.
      const { data: { session }, error: sessionError } = await supabase.auth.refreshSession();
      if (disposed) return;
      const user = session?.user;
      if (!user) {
        if (sessionError) console.error("Could not refresh the booking session:", sessionError.message);
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

      const latest = new Map((data ?? []).map(booking => [booking.id, booking]));
      for (const [id, booking] of realtimeChanges) {
        if (booking) latest.set(id, booking);
        else latest.delete(id);
      }
      setBookings([...latest.values()]);
      setLoading(false);

      // Keep the customer page current even if Realtime is not enabled for
      // public.bookings in the Supabase project. Realtime still updates instantly
      // when available; this is a lightweight fallback while this page is open.
      refreshTimer = setInterval(() => {
        void supabase
          .from("bookings")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .then(({ data: latestBookings, error }) => {
            if (disposed) return;
            if (error) {
              console.error("Could not refresh customer bookings:", error);
              return;
            }
            setBookings(latestBookings ?? []);
          });
      }, 5000);
    };
    void fetch();

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
    const booking = bookings.find(item => item.id === id);
    if (!booking || booking.status !== "pending") return;
    const { error } = await supabase.from("bookings").update({ status: "cancelled" }).eq("id", id);
    if (error) {
      window.alert(`Could not cancel appointment: ${error.message}`);
      return;
    }
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
      setRatingError(error?.message ?? "This booking was already rated or is not available for review.");
      setRatingLoading(false);
      return;
    }
    setBookings(prev => prev.map(b => b.id === ratingBooking.id ? { ...b, rated: true, service_rating: serviceStars, stylist_rating: stylistStars, review_text: review } : b));
    setRatingBooking(null);
    setRatingLoading(false);
  };

  return (
    <div className="page">
      {/* Rating Modal */}
      {ratingBooking && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <div style={{ background: "#1a1a1a", border: "1px solid rgba(232,25,125,0.3)", borderRadius: 16, padding: 28, width: "min(440px, calc(100vw - 32px))", maxHeight: "90vh", overflowY: "auto" }}>
            <p style={{ fontWeight: 700, fontSize: 18, color: "var(--gold)", marginBottom: 6, textAlign: "center" }}>Rate Your Experience</p>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 20, textAlign: "center" }}>{ratingBooking.services} · {ratingBooking.stylist}</p>
            {[{ label: "Service experience", value: serviceStars, set: setServiceStars }, { label: "Stylist performance", value: stylistStars, set: setStylistStars }].map(group => (
              <fieldset key={group.label} style={{ border: 0, padding: 0, margin: "0 0 16px" }}>
                <legend style={{ color: "#fff", fontSize: 13, marginBottom: 6 }}>{group.label}</legend>
                <div style={{ display: "flex", gap: 8 }} role="group" aria-label={group.label}>
                  {[1, 2, 3, 4, 5].map(n => <button key={n} type="button" aria-label={`${n} stars`} aria-pressed={group.value === n} onClick={() => group.set(n)} style={{ border: 0, background: "transparent", fontSize: 30, cursor: "pointer", color: n <= group.value ? "#ffc107" : "rgba(255,255,255,.25)" }}>★</button>)}
                </div>
              </fieldset>
            ))}
            <label htmlFor="booking-review" style={{ display: "block", color: "#fff", fontSize: 13, marginBottom: 8 }}>Your review</label>
            <textarea id="booking-review" value={reviewText} maxLength={1000} onChange={event => setReviewText(event.target.value)} placeholder="Tell us about your visit..." rows={4} style={{ width: "100%", resize: "vertical", padding: 12, borderRadius: 10, background: "#111", color: "#fff", border: "1px solid rgba(255,255,255,.2)", font: "inherit", boxSizing: "border-box" }} />
            {ratingError && <p role="alert" style={{ color: "#ff8a80", fontSize: 12 }}>{ratingError}</p>}
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn-outline" style={{ fontSize: 13 }} onClick={() => setRatingBooking(null)}>Cancel</button>
              <button className="btn-pink" style={{ fontSize: 13 }} onClick={submitRating} disabled={ratingLoading}>
                {ratingLoading ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className="site-nav">
        <div className="site-nav-brand">
          <SalonLogo />
        </div>
        <button className="btn-ghost" onClick={onBack} style={{ fontSize: 13 }}>‹ Back to Home</button>
      </nav>

      <div className="page-content">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <h1 className="page-title" style={{ margin: 0 }}>My Bookings</h1>
          <button className="btn-pink" onClick={onBook} style={{ width: "auto", padding: "10px 24px", borderRadius: 10 }}>+ New Booking</button>
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
          {TABS.map((t, i) => (
            <button key={t} onClick={() => setTab(i)} style={{
              padding: "9px 20px", borderRadius: 20, fontSize: 13, fontWeight: 700, cursor: "pointer",
              border: i === tab ? "none" : "1.5px solid var(--pink)",
              background: i === tab ? "linear-gradient(135deg,#e8197d,#b5105e)" : "transparent",
              color: i === tab ? "#fff" : "var(--pink)"
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
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {filtered.map(b => (
              <div key={b.id} className="card" style={{ padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 15 }}>{b.services}</p>
                    <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3 }}>{b.stylist}</p>
                  </div>
                  <span className={`badge badge-${b.status}`}>{b.status}</span>
                </div>
                <div style={{ display: "flex", gap: 16, fontSize: 12, color: "var(--text-muted)", alignItems: "center" }}>
                  <span>📅 {b.date}</span>
                  <span>🕐 {b.time}</span>
                  <span style={{ marginLeft: "auto", color: "var(--pink)", fontWeight: 800, fontSize: 16 }}>₱{b.total}</span>
                </div>
                {b.status === "pending" && (
                  <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                    <button className="btn-outline" style={{ padding: "8px 20px", fontSize: 12 }} onClick={() => cancel(b.id)}>Cancel</button>
                  </div>
                )}
                {b.status === "completed" && !b.rated && (
                  <div style={{ marginTop: 14 }}>
                    <button className="btn-pink" style={{ width: "auto", padding: "8px 20px", fontSize: 12, borderRadius: 10 }}
                      onClick={() => { setServiceStars(0); setStylistStars(0); setReviewText(""); setRatingError(""); setRatingBooking(b); }}>★ Rate & Review</button>
                  </div>
                )}
                {b.status === "completed" && b.rated && (
                  <div style={{ marginTop: 12, fontSize: 13, color: "#ffc107" }}>
                    <p style={{ margin: 0 }}>Service: {b.service_rating ?? "—"}/5 · Stylist: {b.stylist_rating ?? "—"}/5</p>
                    {b.review_text && <p style={{ color: "var(--text-muted)", margin: "6px 0 0" }}>“{b.review_text}”</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
