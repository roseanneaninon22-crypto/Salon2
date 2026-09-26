"use client";
import { useState, useEffect } from "react";
import { SERVICES, STYLISTS, getBookings, totalForServices, Booking } from "../data";

type Props = { onBack: () => void; onBook: () => void };

const TABS = ["All", "Pending", "Confirmed", "Cancelled"];

export default function MyBookings({ onBack, onBook }: Props) {
  const [tab, setTab]         = useState(0);
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Load from localStorage on mount and whenever tab changes
  useEffect(() => {
    setBookings(getBookings());
  }, [tab]);

  const filtered = bookings.filter(b => {
    if (tab === 0) return true;
    if (tab === 1) return b.status === "pending";
    if (tab === 2) return b.status === "confirmed";
    if (tab === 3) return b.status === "cancelled";
    return true;
  });

  const getServiceNames = (ids: number[]) =>
    SERVICES.filter(s => ids.includes(s.id)).map(s => s.name).join(", ");

  const getStylistName = (id: number | null) =>
    id ? (STYLISTS.find(s => s.id === id)?.name ?? "Any available") : "Any available";

  const getTotal = (ids: number[], notes = "") => totalForServices(ids, notes);

  return (
    <div className="page">
      {/* ── Top Navbar (website style) ── */}
      <nav className="site-nav">
        <div className="site-nav-brand">
          <div className="logo-circle"><span>💇</span></div>
          <div>
            <p style={{ fontWeight: 800, fontSize: 15, color: "var(--pink)" }}>RosseyGirl</p>
            <p style={{ fontSize: 9, color: "var(--gold)", letterSpacing: 3 }}>SALON</p>
          </div>
        </div>
        <div className="site-nav-links">
          <button className="site-nav-link" onClick={onBack}>Home</button>
          <button className="site-nav-link" onClick={onBook}>Services</button>
          <button className="site-nav-link active">My Bookings</button>
        </div>
        <button className="btn-ghost" onClick={onBack} style={{ fontSize: 13 }}>‹ Back to Home</button>
      </nav>

      <div className="page-content">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <span onClick={onBack}>Home</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-current">My Bookings</span>
        </div>

        {/* Page header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28 }}>
          <div>
            <h1 className="page-title">My Bookings</h1>
            <p className="page-subtitle" style={{ marginBottom: 0 }}>Track and manage all your salon appointments in one place</p>
          </div>
          <button className="btn-pink" onClick={onBook} style={{ padding: "12px 28px", borderRadius: 10 }}>
            + New Appointment
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 10, marginBottom: 24, borderBottom: "1px solid rgba(201,168,76,0.12)", paddingBottom: 12 }}>
          {TABS.map((t, i) => (
            <button key={t} onClick={() => setTab(i)} style={{
              padding: "8px 20px", borderRadius: 8, fontSize: 13, fontWeight: 700,
              cursor: "pointer",
              border: i === tab ? "none" : "1.5px solid rgba(201,168,76,0.25)",
              background: i === tab ? "linear-gradient(135deg,#e8197d,#b5105e)" : "transparent",
              color: i === tab ? "#fff" : "var(--text-muted)",
              transition: "all 0.15s",
            }}>
              {t}
            </button>
          ))}
        </div>

        {/* Bookings grid */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <p style={{ fontSize: 48, marginBottom: 14 }}>📋</p>
            <p style={{ fontWeight: 700, fontSize: 18, color: "var(--gold)" }}>No bookings found</p>
            <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 8 }}>
              {tab === 0 ? "You haven't made any reservations yet." : `No ${TABS[tab].toLowerCase()} bookings.`}
            </p>
            <button className="btn-pink" onClick={onBook} style={{ marginTop: 24, borderRadius: 10 }}>Book Now</button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 20 }}>
            {filtered.map(b => (
              <div key={b.id} className="card" style={{ padding: 24 }}>
                {/* Header row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                  <div style={{ flex: 1, marginRight: 12 }}>
                    <p style={{ fontWeight: 800, fontSize: 17 }}>{getServiceNames(b.serviceIds)}</p>
                    <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>{getStylistName(b.stylistId)}</p>
                  </div>
                  <span className={`badge badge-${b.status}`}>{b.status}</span>
                </div>

                <div className="divider" style={{ margin: "14px 0" }} />

                {/* Info row */}
                <div style={{ display: "flex", gap: 20, fontSize: 13, color: "var(--text-muted)", alignItems: "center", flexWrap: "wrap" }}>
                  <span>📅 {b.date}</span>
                  <span>🕐 {b.time}</span>
                  <span style={{ marginLeft: "auto", color: "var(--pink)", fontWeight: 800, fontSize: 20 }}>
                    ₱{getTotal(b.serviceIds, b.notes)}
                  </span>
                </div>

                {/* Status message */}
                {b.status === "pending" && (
                  <div style={{
                    marginTop: 14, padding: "10px 14px", borderRadius: 10,
                    background: "rgba(255,193,7,0.08)", border: "1px solid rgba(255,193,7,0.2)",
                    fontSize: 12, color: "#ffc107",
                  }}>
                    ⏳ Waiting for stylist approval
                  </div>
                )}
                {b.status === "confirmed" && (
                  <div style={{
                    marginTop: 14, padding: "10px 14px", borderRadius: 10,
                    background: "rgba(76,175,80,0.08)", border: "1px solid rgba(76,175,80,0.2)",
                    fontSize: 12, color: "#4caf50",
                  }}>
                    ✓ Your appointment is confirmed!
                  </div>
                )}
                {b.status === "cancelled" && (
                  <div style={{
                    marginTop: 14, padding: "10px 14px", borderRadius: 10,
                    background: "rgba(244,67,54,0.08)", border: "1px solid rgba(244,67,54,0.2)",
                    fontSize: 12, color: "#f44336",
                  }}>
                    ✕ This appointment was cancelled
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
