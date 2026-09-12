"use client";
import { useState } from "react";
import { MOCK_BOOKINGS } from "../data";

type Props = { onBack: () => void; onBook: () => void };

const TABS = ["Upcoming", "Completed", "Cancelled"];

export default function MyBookings({ onBack, onBook }: Props) {
  const [tab, setTab] = useState(0);

  return (
    <div className="page">
      <div className="top-bar">
        <div className="back-btn" onClick={onBack}>‹</div>
        <p style={{ fontWeight: 700, fontSize: 16 }}>My Bookings</p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, padding: "4px 16px 12px" }}>
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setTab(i)}
            style={{
              padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: "pointer",
              border: i === tab ? "none" : "1.5px solid var(--pink)",
              background: i === tab ? "linear-gradient(135deg,#e8197d,#b5105e)" : "transparent",
              color: i === tab ? "#fff" : "var(--pink)"
            }}>
            {t}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "0 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {MOCK_BOOKINGS.map(b => (
          <div key={b.id} className="card" style={{ padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: 14 }}>{b.service}</p>
                <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{b.stylist}</p>
              </div>
              <span className={`badge badge-${b.status}`}>{b.status}</span>
            </div>
            <div style={{ display: "flex", gap: 14, fontSize: 11, color: "var(--text-muted)", alignItems: "center" }}>
              <span>📅 {b.date}</span>
              <span>🕐 {b.time}</span>
              <span style={{ marginLeft: "auto", color: "var(--pink)", fontWeight: 700, fontSize: 13 }}>₱{b.price}</span>
            </div>
            {b.status === "pending" && (
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <button className="btn-outline" style={{ padding: "5px 12px", fontSize: 11 }}>Cancel</button>
                <button className="btn-pink" style={{ padding: "5px 12px", fontSize: 11 }}>Reschedule</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bottom Nav */}
      <div className="bottom-nav" style={{ marginTop: 16 }}>
        {[
          { icon: "🏠", label: "Home", on: false, fn: onBack },
          { icon: "📅", label: "Book", on: false, fn: onBook },
          { icon: "📋", label: "Bookings", on: true, fn: () => {} },
          { icon: "👤", label: "Profile", on: false, fn: () => {} },
        ].map(n => (
          <div key={n.label} className={`nav-item ${n.on ? "on" : ""}`} onClick={n.fn}>
            <span style={{ fontSize: 18 }}>{n.icon}</span>
            <span>{n.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
