"use client";
import { useState, useEffect } from "react";
import { SERVICES, STYLISTS, HairType } from "../data";
import { USER_KEY } from "./AuthScreen";

type Props = {
  serviceIds: number[]; stylistId: number | null;
  date: string; time: string;
  chosen: Record<number, HairType>;
  defaultName?: string; defaultPhone?: string;
  onConfirm: (info: { name: string; phone: string; notes: string }) => void;
  onBack: () => void;
};

/* Registered details, used as a fallback when the parent has no session
   state yet (for example right after a page refresh). */
function storedProfile(): { name: string; phone: string } {
  if (typeof window === "undefined") return { name: "", phone: "" };
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return { name: "", phone: "" };
    const u = JSON.parse(raw) as { name?: string; phone?: string };
    return { name: u.name ?? "", phone: u.phone ?? "" };
  } catch {
    return { name: "", phone: "" };
  }
}

export default function ReservationForm({ serviceIds, stylistId, date, time, chosen, defaultName = "", defaultPhone = "", onConfirm, onBack }: Props) {
  const [name, setName]   = useState(() => defaultName);
  const [phone, setPhone] = useState(() => defaultPhone);
  const [notes, setNotes] = useState("");

  /* Auto-fill the customer information from the registered profile. Values
     passed down by the parent win; otherwise fall back to localStorage. */
  useEffect(() => {
    const stored = storedProfile();
    setName(prev => defaultName || prev || stored.name);
    setPhone(prev => defaultPhone || prev || stored.phone);
  }, [defaultName, defaultPhone]);

  const services = SERVICES.filter(s => serviceIds.includes(s.id));
  const stylist  = stylistId ? STYLISTS.find(s => s.id === stylistId) : null;
  /* Price uses the chosen type where the service is type-based */
  const priceOf  = (s: { id: number; price: number; priced?: boolean }) =>
    s.priced ? (chosen[s.id]?.price ?? 0) : s.price;
  const total    = services.reduce((sum, s) => sum + priceOf(s), 0);

  return (
    <div className="page">
      {/* Navbar */}
      <nav className="site-nav">
        <div className="site-nav-brand">
          <div className="logo-circle"><span>💇</span></div>
          <div>
            <p style={{ fontWeight: 800, fontSize: 15, color: "var(--pink)" }}>RosseyGirl</p>
            <p style={{ fontSize: 9, color: "var(--gold)", letterSpacing: 3 }}>SALON</p>
          </div>
        </div>
        <button className="btn-ghost" onClick={onBack} style={{ fontSize: 13 }}>‹ Back</button>
      </nav>

      <div className="page-content">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <span>Home</span><span className="breadcrumb-sep">›</span>
          <span>Services</span><span className="breadcrumb-sep">›</span>
          <span onClick={onBack}>Stylist</span><span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-current">Your Details</span>
        </div>

        {/* Step bar */}
        <div className="steps-bar">
          {["Select Services","Date & Time","Choose Stylist","Your Details","Confirm"].map((s,i) => (
            <div key={s} className="step-item">
              <div className={`step-num ${i < 3 ? "done" : i === 3 ? "active" : ""}`}>
                {i < 3 ? "✓" : i+1}
              </div>
              <span className={`step-label ${i < 3 ? "done" : i === 3 ? "active" : ""}`}>{s}</span>
              {i < 4 && <div className="step-line" />}
            </div>
          ))}
        </div>

        <h1 className="page-title">Reservation Details</h1>
        <p className="page-subtitle">Review your booking and fill in your contact information</p>

        {/* Two-column layout */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: 32, alignItems: "start" }}>

          {/* Left — customer form */}
          <div className="card" style={{ padding: 32 }}>
            <p style={{ fontWeight: 700, fontSize: 14, color: "var(--gold)", letterSpacing: 1, marginBottom: 24 }}>CUSTOMER INFORMATION</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <label className="inp-label">Full Name</label>
                <input className="inp" placeholder="Your full name" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div>
                <label className="inp-label">Phone Number</label>
                <input className="inp" placeholder="Your phone number" value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
              <div>
                <label className="inp-label">Special Request <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(optional)</span></label>
                <textarea className="inp" placeholder="Any special requests or notes..."
                  value={notes} onChange={e => setNotes(e.target.value)}
                  rows={4} style={{ resize: "vertical" }} />
              </div>
            </div>

            <div style={{ marginTop: 32, display: "flex", gap: 14 }}>
              <button className="btn-ghost" onClick={onBack} style={{ flex: 1 }}>‹ Back</button>
              <button className="btn-pink" style={{ flex: 2, borderRadius: 10 }}
                onClick={() => onConfirm({ name, phone, notes })}
                disabled={!name || !phone}>
                Confirm Booking →
              </button>
            </div>
          </div>

          {/* Right — booking summary */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Services */}
            <div className="card" style={{ padding: 24 }}>
              <p style={{ fontWeight: 700, fontSize: 13, color: "var(--gold)", letterSpacing: 1, marginBottom: 16 }}>SERVICE DETAILS</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {services.map(s => (
                  <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 22 }}>{s.img}</span>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 600 }}>{s.name}</p>
                        <p style={{ fontSize: 11, color: "var(--text-muted)" }}>
                          {chosen[s.id] ? `${chosen[s.id].name} • ${chosen[s.id].time}` : `⏱ ${s.duration}`}
                        </p>
                      </div>
                    </div>
                    <span style={{ color: "var(--pink)", fontWeight: 700 }}>₱{priceOf(s)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Appointment info */}
            <div className="card" style={{ padding: 24 }}>
              <p style={{ fontWeight: 700, fontSize: 13, color: "var(--gold)", letterSpacing: 1, marginBottom: 16 }}>APPOINTMENT INFO</p>
              {[
                ["Stylist",  stylist ? stylist.name : "Any available"],
                ["Date",     date],
                ["Time",     time],
              ].map(([label, value]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(201,168,76,0.08)" }}>
                  <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{value}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 14, marginTop: 4 }}>
                <span style={{ fontWeight: 700, fontSize: 15 }}>Total</span>
                <span style={{ fontWeight: 800, fontSize: 22, color: "var(--pink)" }}>₱{total}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
