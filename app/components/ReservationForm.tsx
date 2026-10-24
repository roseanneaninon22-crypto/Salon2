"use client";
import SalonLogo from "./SalonLogo";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { SERVICES, HairType } from "../data";

type Props = {
  serviceIds: number[]; stylistId: string | null; stylistName: string | null;
  date: string; time: string;
  chosen: Record<number, HairType>;
  onConfirm: (info: { name: string; phone: string; notes: string }) => void;
  onBack: () => void;
};

export default function ReservationForm({ serviceIds, stylistId, stylistName, date, time, chosen, onConfirm, onBack }: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Auto-fill from logged in user's customer profile
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("users")
        .select("full_name, phone")
        .eq("user_id", user.id)
        .single();
      if (data) {
        if (data.full_name) setName(data.full_name);
        if (data.phone) setPhone(data.phone);
      }
    };
    fetchProfile();
  }, []);

  const services = SERVICES.filter(s => serviceIds.includes(s.id));
  const priceOf = (s: { id: number; price: number; priced?: boolean }) =>
    s.priced ? (chosen[s.id]?.price ?? s.price) : s.price;
  const total = services.reduce((sum, s) => sum + priceOf(s), 0);

  const handleConfirm = async () => {
    if (!name || !phone) return;
    setLoading(true);
    setError("");

    const { data: { user } } = await supabase.auth.getUser();

    const typeNotes = services
      .filter(s => chosen[s.id])
      .map(s => `${s.name}: ${chosen[s.id].name}`)
      .join("; ");
    const fullNotes = [notes, typeNotes].filter(Boolean).join(" | ");

    const { error: err } = await supabase.from("bookings").insert({
      user_id: user?.id ?? null,
      stylist_id: stylistId && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(stylistId) ? stylistId : null,
      customer_name: name,
      customer_phone: phone,
      services: services.map(s => chosen[s.id] ? `${s.name} (${chosen[s.id].name})` : s.name).join(", "),
      stylist: stylistName || "Any available",
      date,
      time,
      notes: fullNotes,
      total,
      payment_method: "Cash",
      status: "pending",
    });

    setLoading(false);
    if (err) {
      setError(err.code === "23505"
        ? "This stylist is already booked for that date and time. Please go back and choose another time or stylist."
        : "Failed to save booking: " + err.message);
      return;
    }
    onConfirm({ name, phone, notes });
  };

  const row = (label: string, value: string) => (
    <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(201,168,76,0.08)" }}>
      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 600 }}>{value}</span>
    </div>
  );

  return (
    <div className="page">
      <nav className="site-nav">
        <div className="site-nav-brand">
          <SalonLogo />
        </div>
        <button className="btn-ghost" onClick={onBack} style={{ fontSize: 13 }}>‹ Back</button>
      </nav>

      <div className="page-content" style={{ maxWidth: 680, margin: "0 auto" }}>
        <h1 className="page-title">Reservation Details</h1>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="card" style={{ padding: 24 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "var(--gold)", letterSpacing: 1.5, marginBottom: 14 }}>SERVICE DETAILS</p>
            {services.map(s => (
              <div key={s.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(201,168,76,0.08)" }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600 }}>{s.name}</p>
                  {chosen[s.id] && <p style={{ fontSize: 12, color: "var(--gold)", marginTop: 2 }}>{chosen[s.id].name}</p>}
                  <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{chosen[s.id]?.time ?? s.duration}</p>
                </div>
                <p style={{ color: "var(--pink)", fontWeight: 700, fontSize: 14 }}>₱{priceOf(s)}</p>
              </div>
            ))}
            {row("Stylist", stylistName || "Any available")}
            {row("Date", date)}
            {row("Time", time)}
            <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 14, marginTop: 4 }}>
              <span style={{ fontWeight: 700, fontSize: 15 }}>Total</span>
              <span style={{ fontWeight: 800, fontSize: 20, color: "var(--pink)" }}>₱{total}</span>
            </div>
          </div>

          <div className="card" style={{ padding: 24 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "var(--gold)", letterSpacing: 1.5, marginBottom: 10 }}>PAYMENT METHOD</p>
            <p style={{ fontSize: 15, fontWeight: 700 }}>Cash only</p>
            <p style={{ marginTop: 5, fontSize: 12, color: "var(--text-muted)" }}>Please pay at the salon after your appointment.</p>
          </div>

          <div className="card" style={{ padding: 24 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "var(--gold)", letterSpacing: 1.5, marginBottom: 16 }}>CUSTOMER INFORMATION</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input className="inp" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} suppressHydrationWarning />
              <input className="inp" placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} suppressHydrationWarning />
              <textarea className="inp" placeholder="Special Request (optional)" value={notes}
                onChange={e => setNotes(e.target.value)} rows={3} style={{ resize: "none" }} />
            </div>
          </div>

          {error && (
            <div style={{ padding: "12px 16px", borderRadius: 10, fontSize: 13, background: "rgba(232,25,125,0.15)", border: "1px solid rgba(232,25,125,0.4)", color: "#ff6b9d" }}>
              {error}
            </div>
          )}

          <button className="btn-pink" onClick={handleConfirm} disabled={!name || !phone || loading}
            style={{ borderRadius: 12, padding: "15px", fontSize: 15, opacity: !name || !phone || loading ? 0.5 : 1 }}>
            {loading ? "Saving..." : "CONFIRM BOOKING"}
          </button>
        </div>
      </div>
    </div>
  );
}
