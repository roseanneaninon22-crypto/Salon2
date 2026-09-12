"use client";
import { useState } from "react";
import { SERVICES, STYLISTS } from "../data";

type Props = {
  serviceIds: number[]; stylistId: number | null;
  date: string; time: string;
  onConfirm: (info: { name: string; phone: string; notes: string }) => void;
  onBack: () => void;
};

export default function ReservationForm({ serviceIds, stylistId, date, time, onConfirm, onBack }: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  const services = SERVICES.filter(s => serviceIds.includes(s.id));
  const stylist = stylistId ? STYLISTS.find(s => s.id === stylistId) : null;
  const total = services.reduce((sum, s) => sum + s.price, 0);

  const row = (label: string, value: string) => (
    <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(201,168,76,0.08)" }}>
      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 600 }}>{value}</span>
    </div>
  );

  return (
    <div className="page">
      <div className="top-bar">
        <div className="back-btn" onClick={onBack}>‹</div>
        <p style={{ fontWeight: 700, fontSize: 16 }}>Reservation Details</p>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "8px 16px 16px", display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Service Details */}
        <div className="card" style={{ padding: 16 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "var(--gold)", letterSpacing: 1.5, marginBottom: 10 }}>SERVICE DETAILS</p>
          {services.map(s => (
            <div key={s.id} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid rgba(201,168,76,0.08)" }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600 }}>{s.name}</p>
                <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{s.duration}</p>
              </div>
              <p style={{ color: "var(--pink)", fontWeight: 700, fontSize: 13 }}>₱{s.price}</p>
            </div>
          ))}
          {row("Stylist", stylist ? stylist.name : "Any available")}
          {row("Date", date)}
          {row("Time", time)}
          <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 10, marginTop: 4 }}>
            <span style={{ fontWeight: 700, fontSize: 14 }}>Total</span>
            <span style={{ fontWeight: 800, fontSize: 16, color: "var(--pink)" }}>₱{total}</span>
          </div>
        </div>

        {/* Customer Info */}
        <div className="card" style={{ padding: 16 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "var(--gold)", letterSpacing: 1.5, marginBottom: 12 }}>CUSTOMER INFORMATION</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input className="inp" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} />
            <input className="inp" placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} />
            <textarea className="inp" placeholder="Special Request (optional)" value={notes}
              onChange={e => setNotes(e.target.value)} rows={3} style={{ resize: "none" }} />
          </div>
        </div>
      </div>

      <div style={{ padding: "12px 16px 20px" }}>
        <button className="btn-pink" onClick={() => onConfirm({ name, phone, notes })} disabled={!name || !phone}>
          CONFIRM BOOKING
        </button>
      </div>
    </div>
  );
}
