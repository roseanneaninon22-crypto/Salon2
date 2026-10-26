"use client";
import SalonLogo from "./SalonLogo";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

type Booking = {
  id: string;
  user_id?: string | null;
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
  const [fetchError, setFetchError] = useState("");
  const [viewBooking, setViewBooking] = useState<Booking | null>(null);
  const [ratingBooking, setRatingBooking] = useState<Booking | null>(null);
  const [serviceStars, setServiceStars] = useState(0);
  const [stylistStars, setStylistStars] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [ratingError, setRatingError] = useState("");
  const [ratingLoading, setRatingLoading] = useState(false);

  useEffect(() => {
    let disposed = false;
    let timer: ReturnType<typeof setInterval> | null = null;

    const load = async () => {
      setLoading(true);
      setFetchError("");
      const { data: { session } } = await supabase.auth.refreshSession();
      if (disposed || !session?.user) { setLoading(false); return; }
      const uid = session.user.id;

      const { data: profile } = await supabase.from("users").select("phone").eq("user_id", uid).maybeSingle();
      const phone = profile?.phone ?? "";
      const orFilter = phone ? `user_id.eq.${uid},customer_phone.eq.${phone}` : `user_id.eq.${uid}`;

      const { data, error } = await supabase
        .from("bookings").select("*").or(orFilter).order("created_at", { ascending: false });
      if (disposed) return;
      if (error) { setFetchError(error.message); setLoading(false); return; }
      setBookings((data ?? []) as Booking[]);
      setLoading(false);

      timer = setInterval(async () => {
        if (disposed) return;
        const { data: fresh } = await supabase.from("bookings").select("*").or(orFilter).order("created_at", { ascending: false });
        if (!disposed && fresh) setBookings(fresh as Booking[]);
      }, 6000);
    };

    void load();
    return () => { disposed = true; if (timer) clearInterval(timer); };
  }, []);

  const filtered = bookings.filter(b => {
    if (tab === 0) return b.status === "pending" || b.status === "confirmed";
    if (tab === 1) return b.status === "completed";
    return b.status === "cancelled";
  });

  const cancel = async (id: string) => {
    const { error } = await supabase.from("bookings").update({ status: "cancelled" }).eq("id", id);
    if (error) { window.alert(error.message); return; }
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: "cancelled" } : b));
    setViewBooking(null);
  };

  const submitRating = async () => {
    if (!ratingBooking || !serviceStars || !stylistStars || !reviewText.trim()) {
      setRatingError("Please fill in all fields."); return;
    }
    setRatingLoading(true);
    const { error } = await supabase.from("bookings")
      .update({ service_rating: serviceStars, stylist_rating: stylistStars, review_text: reviewText.trim(), rated: true })
      .eq("id", ratingBooking.id);
    setRatingLoading(false);
    if (error) { setRatingError(error.message); return; }
    setBookings(prev => prev.map(b => b.id === ratingBooking.id
      ? { ...b, rated: true, service_rating: serviceStars, stylist_rating: stylistStars, review_text: reviewText.trim() } : b));
    setRatingBooking(null);
  };

  const statusColor: Record<string, string> = { pending: "#ffc107", confirmed: "#4caf50", completed: "#2196f3", cancelled: "#f44336" };

  return (
    <div className="page">

      {/* ── View Booking Modal ── */}
      {viewBooking && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, padding: 16 }}
          onClick={() => setViewBooking(null)}>
          <div style={{ background: "#1a1a1a", border: viewBooking.status === "confirmed" ? "1.5px solid #4caf50" : "1px solid rgba(255,255,255,0.12)", borderRadius: 18, width: "min(520px,100%)", maxHeight: "90vh", overflowY: "auto" }}
            onClick={e => e.stopPropagation()}>

            {viewBooking.status === "confirmed" && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(76,175,80,0.15)", borderBottom: "1px solid rgba(76,175,80,0.3)", padding: "12px 20px", borderRadius: "16px 16px 0 0" }}>
                <span style={{ fontSize: 22 }}>✅</span>
                <div>
                  <p style={{ margin: 0, fontWeight: 800, fontSize: 14, color: "#4caf50" }}>Appointment Confirmed!</p>
                  <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.5)" }}>The salon has approved your booking.</p>
                </div>
              </div>
            )}

            <div style={{ padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
                <div>
                  <p style={{ fontWeight: 800, fontSize: 17, marginBottom: 4 }}>{viewBooking.services}</p>
                  <p style={{ fontSize: 13, color: "var(--text-muted)" }}>💇 {viewBooking.stylist}</p>
                </div>
                <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: `${statusColor[viewBooking.status]}22`, color: statusColor[viewBooking.status], textTransform: "capitalize", flexShrink: 0 }}>
                  {viewBooking.status}
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 20px", background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: 16, marginBottom: 20 }}>
                {[
                  ["DATE",    "📅 " + viewBooking.date],
                  ["TIME",    "🕐 " + viewBooking.time],
                  ["NAME",    viewBooking.customer_name ? "👤 " + viewBooking.customer_name : null],
                  ["PHONE",   viewBooking.customer_phone ? "📞 " + viewBooking.customer_phone : null],
                  ["PAYMENT", "💳 " + (viewBooking.payment_method ?? "Cash")],
                  ["TOTAL",   "₱" + Number(viewBooking.total).toLocaleString()],
                ].filter(([, v]) => v).map(([label, value]) => (
                  <div key={String(label)}>
                    <p style={{ fontSize: 10, color: "rgba(255,255,255,0.38)", fontWeight: 700, letterSpacing: 1, marginBottom: 3 }}>{String(label)}</p>
                    <p style={{ fontWeight: 600, fontSize: 14, color: String(label) === "TOTAL" ? "var(--pink)" : "#fff" }}>{String(value)}</p>
                  </div>
                ))}
                {viewBooking.notes && (
                  <div style={{ gridColumn: "1/-1" }}>
                    <p style={{ fontSize: 10, color: "rgba(255,255,255,0.38)", fontWeight: 700, letterSpacing: 1, marginBottom: 3 }}>NOTES</p>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", fontStyle: "italic" }}>📝 {viewBooking.notes}</p>
                  </div>
                )}
                {viewBooking.created_at && (
                  <div style={{ gridColumn: "1/-1" }}>
                    <p style={{ fontSize: 10, color: "rgba(255,255,255,0.38)", fontWeight: 700, letterSpacing: 1, marginBottom: 3 }}>BOOKED ON</p>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.38)" }}>{new Date(viewBooking.created_at).toLocaleString()}</p>
                  </div>
                )}
              </div>

              {viewBooking.status === "completed" && viewBooking.rated && (
                <div style={{ background: "rgba(255,193,7,0.08)", borderRadius: 10, padding: "12px 16px", marginBottom: 16 }}>
                  <p style={{ fontWeight: 700, color: "#ffc107", marginBottom: 4 }}>Your Review</p>
                  <p style={{ color: "#ffc107", fontSize: 13 }}>Service {viewBooking.service_rating}/5 · Stylist {viewBooking.stylist_rating}/5</p>
                  {viewBooking.review_text && <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, fontStyle: "italic", marginTop: 4 }}>"{viewBooking.review_text}"</p>}
                </div>
              )}

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button className="btn-outline" style={{ flex: 1 }} onClick={() => setViewBooking(null)}>Close</button>
                {viewBooking.status === "pending" && (
                  <button className="btn-outline" style={{ flex: 1, borderColor: "#f44336", color: "#f44336" }} onClick={() => cancel(viewBooking.id)}>
                    Cancel Booking
                  </button>
                )}
                {viewBooking.status === "completed" && !viewBooking.rated && (
                  <button className="btn-pink" style={{ flex: 1 }} onClick={() => { setServiceStars(0); setStylistStars(0); setReviewText(""); setRatingError(""); setRatingBooking(viewBooking); setViewBooking(null); }}>
                    ★ Rate & Review
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Rating Modal ── */}
      {ratingBooking && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, padding: 16 }}>
          <div style={{ background: "#1a1a1a", border: "1px solid rgba(232,25,125,0.3)", borderRadius: 16, padding: 28, width: "min(440px,100%)", maxHeight: "90vh", overflowY: "auto" }}>
            <p style={{ fontWeight: 700, fontSize: 18, color: "var(--gold)", marginBottom: 6, textAlign: "center" }}>Rate Your Experience</p>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 20, textAlign: "center" }}>{ratingBooking.services} · {ratingBooking.stylist}</p>
            {[{ label: "Service", val: serviceStars, set: setServiceStars }, { label: "Stylist", val: stylistStars, set: setStylistStars }].map(g => (
              <fieldset key={g.label} style={{ border: 0, padding: 0, margin: "0 0 14px" }}>
                <legend style={{ color: "#fff", fontSize: 13, marginBottom: 6 }}>{g.label}</legend>
                <div style={{ display: "flex", gap: 8 }}>
                  {[1,2,3,4,5].map(n => (
                    <button key={n} type="button" onClick={() => g.set(n)}
                      style={{ border: 0, background: "transparent", fontSize: 30, cursor: "pointer", color: n <= g.val ? "#ffc107" : "rgba(255,255,255,.2)" }}>★</button>
                  ))}
                </div>
              </fieldset>
            ))}
            <label style={{ display: "block", color: "#fff", fontSize: 13, marginBottom: 8 }}>Your review</label>
            <textarea value={reviewText} maxLength={1000} rows={4} onChange={e => setReviewText(e.target.value)}
              placeholder="Tell us about your visit..."
              style={{ width: "100%", resize: "vertical", padding: 12, borderRadius: 10, background: "#111", color: "#fff", border: "1px solid rgba(255,255,255,.2)", font: "inherit", boxSizing: "border-box" }} />
            {ratingError && <p style={{ color: "#ff8a80", fontSize: 12 }}>{ratingError}</p>}
            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              <button className="btn-outline" onClick={() => setRatingBooking(null)}>Cancel</button>
              <button className="btn-pink" onClick={submitRating} disabled={ratingLoading}>{ratingLoading ? "Submitting..." : "Submit"}</button>
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

        {fetchError && (
          <div style={{ background: "rgba(244,67,54,0.1)", border: "1px solid rgba(244,67,54,0.3)", borderRadius: 10, padding: 16, marginBottom: 20 }}>
            <p style={{ color: "#ff6b6b", fontSize: 13, margin: 0 }}>⚠️ {fetchError}</p>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>Loading bookings...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60 }}>
            <p style={{ fontSize: 48, marginBottom: 14 }}>📋</p>
            <p style={{ color: "var(--text-muted)", fontSize: 15 }}>No bookings found</p>
            <button className="btn-pink" onClick={onBook} style={{ marginTop: 20, width: "auto", padding: "12px 32px", borderRadius: 10 }}>Book Now</button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filtered.map(b => (
              <div key={b.id} className="card" style={{
                padding: 18, cursor: "pointer",
                border: b.status === "confirmed" ? "1.5px solid #4caf50" : "1px solid rgba(255,255,255,0.07)",
              }} onClick={() => setViewBooking(b)}>

                {b.status === "confirmed" && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                    <span>✅</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#4caf50" }}>Confirmed by salon — tap to view full details</span>
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div style={{ flex: 1, paddingRight: 10 }}>
                    <p style={{ fontWeight: 800, fontSize: 14, marginBottom: 3 }}>{b.services}</p>
                    <p style={{ fontSize: 12, color: "var(--text-muted)" }}>💇 {b.stylist}</p>
                  </div>
                  <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: `${statusColor[b.status]}22`, color: statusColor[b.status], textTransform: "capitalize", flexShrink: 0 }}>
                    {b.status}
                  </span>
                </div>

                <div style={{ display: "flex", gap: 16, fontSize: 12, color: "var(--text-muted)", alignItems: "center" }}>
                  <span>📅 {b.date}</span>
                  <span>🕐 {b.time}</span>
                  <span style={{ marginLeft: "auto", color: "var(--pink)", fontWeight: 800, fontSize: 15 }}>₱{Number(b.total).toLocaleString()}</span>
                </div>

                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 8, textAlign: "right" }}>Tap to view full details →</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
