"use client";
import { useState, useEffect } from "react";
import { ADMIN_BOOKINGS, SERVICES, STYLISTS, servicePrice, getBookings, updateBookingStatus, Booking } from "../data";

type Props = { onLogout: () => void };

const MENU = [
  { icon: "▣", label: "Dashboard" },
  { icon: "📅", label: "Appointments" },
  { icon: "👥", label: "Customers" },
  { icon: "✂️", label: "Services" },
  { icon: "👩", label: "Stylists" },
  { icon: "💳", label: "Payments" },
  { icon: "⭐", label: "Reviews" },
  { icon: "⚙️", label: "Settings" },
  { icon: "🚪", label: "Logout" },
];

const WDAYS = ["Su","Mo","Tu","We","Th","Fr","Sa"];
const SEP_FIRST = 2; // Sep 2026 starts Tuesday
const SEP_DAYS = 30;
const cells = Array(SEP_FIRST).fill(null).concat(Array.from({ length: SEP_DAYS }, (_, i) => i + 1));

export default function AdminDashboard({ onLogout }: Props) {
  const [active, setActive] = useState("Dashboard");
  const [sideOpen, setSideOpen] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => { setBookings(getBookings()); }, [active]);

  const handleStatus = (id: string, status: Booking["status"]) => {
    updateBookingStatus(id, status);
    setBookings(getBookings());
  };

  const getServiceNames = (ids: number[]) =>
    SERVICES.filter(s => ids.includes(s.id)).map(s => s.name).join(", ");
  const getStylistName = (id: number | null) =>
    id ? (STYLISTS.find(s => s.id === id)?.name ?? "Any available") : "Any available";

  const pendingCount   = bookings.filter(b => b.status === "pending").length;
  const confirmedCount = bookings.filter(b => b.status === "confirmed").length;

  const go = (label: string) => { if (label === "Logout") { onLogout(); return; } setActive(label); };

  const stats = [
    { label: "Total Appointments", value: String(bookings.length || ADMIN_BOOKINGS.length), color: "#e8197d", icon: "📅" },
    { label: "Pending Appointments", value: String(pendingCount || 14), color: "#ffc107", icon: "⏳" },
    { label: "Confirmed", value: String(confirmedCount || 0), color: "#4caf50", icon: "✅" },
    { label: "Total Revenue", value: "₱42,500", color: "#2196f3", icon: "💰" },
  ];

  return (
    <div className="admin-wrap">
      {/* Sidebar */}
      {sideOpen && (
        <div className="admin-side">
          {/* Brand */}
          <div style={{ padding: "16px 18px 12px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(232,25,125,0.2)", border: "1.5px solid var(--pink)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>💇</div>
              <div>
                <p style={{ fontSize: 12, fontWeight: 800, color: "var(--pink)" }}>Rossey Girl</p>
                <p style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: 1 }}>SALON</p>
              </div>
            </div>
            {/* Admin user */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#e8197d,#b5105e)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>A</div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: "#fff" }}>Admin User</p>
                <p style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>Administrator</p>
              </div>
            </div>
          </div>
          {/* Menu */}
          {MENU.map(m => (
            <div key={m.label} className={`admin-side-item ${active === m.label ? "on" : ""}`} onClick={() => go(m.label)}>
              <span style={{ fontSize: 14 }}>{m.icon}</span>
              <span>{m.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Main content */}
      <div className="admin-main">
        {/* Top bar */}
        <div className="admin-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={() => setSideOpen(o => !o)}
              style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", fontSize: 18, cursor: "pointer" }}>☰</button>
            <p style={{ fontWeight: 700, fontSize: 15 }}>{active}</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: 16, cursor: "pointer", color: "rgba(255,255,255,0.5)" }}>🔔</span>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#e8197d,#b5105e)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>A</div>
          </div>
        </div>

        <div style={{ padding: 20 }}>
          {/* ── DASHBOARD ── */}
          {active === "Dashboard" && (
            <>
              {/* Stats row */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
                {stats.map(s => (
                  <div key={s.label} className="stat-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={{ fontSize: 20 }}>{s.icon}</span>
                      <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: `${s.color}22`, color: s.color }}>+12%</span>
                    </div>
                    <p style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</p>
                    <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 3 }}>{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Table + Calendar */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 16 }}>
                {/* Appointments table */}
                <div className="stat-card" style={{ padding: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <p style={{ fontWeight: 700, fontSize: 13, color: "var(--gold)" }}>Recent Appointments</p>
                    <button className="btn-pink" style={{ width: "auto", padding: "5px 12px", fontSize: 11 }}>+ New</button>
                  </div>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                    <thead>
                      <tr style={{ color: "rgba(255,255,255,0.35)" }}>
                        {["Customer","Service","Stylist","Date","Time","Status"].map(h => (
                          <th key={h} style={{ textAlign: "left", paddingBottom: 8, paddingRight: 10, fontWeight: 600 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(bookings.length > 0 ? bookings : ADMIN_BOOKINGS).slice(0, 5).map((b: any) => (
                        <tr key={b.id} style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                          <td style={{ padding: "8px 10px 8px 0" }}>{b.customer}</td>
                          <td style={{ padding: "8px 10px 8px 0" }}>{b.serviceIds ? getServiceNames(b.serviceIds) : b.service}</td>
                          <td style={{ padding: "8px 10px 8px 0" }}>{b.stylistId != null ? getStylistName(b.stylistId) : b.stylist?.split(" ")[0]}</td>
                          <td style={{ padding: "8px 10px 8px 0" }}>{b.date}</td>
                          <td style={{ padding: "8px 10px 8px 0" }}>{b.time}</td>
                          <td style={{ padding: "8px 0" }}>
                            <span className={`badge badge-${b.status}`}>{b.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Calendar */}
                <div className="stat-card" style={{ padding: 16 }}>
                  <p style={{ fontWeight: 700, fontSize: 13, color: "var(--gold)", marginBottom: 12 }}>September 2026</p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", marginBottom: 6 }}>
                    {WDAYS.map(d => <div key={d} style={{ textAlign: "center", fontSize: 10, fontWeight: 700, color: "rgba(201,168,76,0.55)" }}>{d}</div>)}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2 }}>
                    {cells.map((day, i) => (
                      <div key={i} className={`cal-day ${day === 10 ? "sel" : ""}`} style={{ fontSize: 11 }}>
                        {day || ""}
                      </div>
                    ))}
                  </div>
                  {/* Legend */}
                  <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 6 }}>
                    {ADMIN_BOOKINGS.slice(0, 3).map(b => (
                      <div key={b.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                        <span style={{ color: "rgba(255,255,255,0.6)" }}>{b.customer}</span>
                        <span className={`badge badge-${b.status}`}>{b.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── APPOINTMENTS ── */}
          {active === "Appointments" && (
            <div className="stat-card" style={{ padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <p style={{ fontWeight: 700, color: "var(--gold)" }}>All Appointments</p>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{bookings.length} total</span>
              </div>
              {bookings.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <p style={{ fontSize: 32, marginBottom: 10 }}>📋</p>
                  <p style={{ color: "var(--text-muted)", fontSize: 13 }}>No bookings yet</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {bookings.map(b => (
                    <div key={b.id} style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      borderRadius: 12, padding: "12px 14px",
                    }}>
                      {/* top row */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                        <div>
                          <p style={{ fontWeight: 700, fontSize: 13 }}>{b.customer}</p>
                          <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{getServiceNames(b.serviceIds)}</p>
                          <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{getStylistName(b.stylistId)}</p>
                        </div>
                        <span className={`badge badge-${b.status}`}>{b.status}</span>
                      </div>
                      {/* info row */}
                      <div style={{ display: "flex", gap: 12, fontSize: 11, color: "var(--text-muted)", marginBottom: 10 }}>
                        <span>📅 {b.date}</span>
                        <span>🕐 {b.time}</span>
                        {b.phone && <span>📱 {b.phone}</span>}
                      </div>
                      {/* action buttons — only for pending */}
                      {b.status === "pending" && (
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            onClick={() => handleStatus(b.id, "confirmed")}
                            style={{
                              flex: 1, padding: "7px 0", borderRadius: 8,
                              background: "linear-gradient(135deg,#4caf50,#388e3c)",
                              border: "none", color: "#fff",
                              fontSize: 12, fontWeight: 700, cursor: "pointer",
                            }}>
                            ✓ Approve
                          </button>
                          <button
                            onClick={() => handleStatus(b.id, "cancelled")}
                            style={{
                              flex: 1, padding: "7px 0", borderRadius: 8,
                              background: "rgba(244,67,54,0.15)",
                              border: "1px solid rgba(244,67,54,0.4)",
                              color: "#f44336",
                              fontSize: 12, fontWeight: 700, cursor: "pointer",
                            }}>
                            ✕ Cancel
                          </button>
                        </div>
                      )}
                      {b.status === "confirmed" && (
                        <button
                          onClick={() => handleStatus(b.id, "cancelled")}
                          style={{
                            width: "100%", padding: "7px 0", borderRadius: 8,
                            background: "rgba(244,67,54,0.1)",
                            border: "1px solid rgba(244,67,54,0.3)",
                            color: "#f44336",
                            fontSize: 12, fontWeight: 700, cursor: "pointer",
                          }}>
                          ✕ Cancel Appointment
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── SERVICES ── */}
          {active === "Services" && (
            <div className="stat-card" style={{ padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <p style={{ fontWeight: 700, color: "var(--gold)" }}>Services</p>
                <button className="btn-pink" style={{ width: "auto", padding: "6px 14px", fontSize: 12 }}>+ Add Service</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
                {SERVICES.map(s => (
                  <div key={s.id} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,168,76,0.12)", borderRadius: 12, padding: 12, display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 24 }}>{s.img}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, fontSize: 13 }}>{s.name}</p>
                      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                        {s.priced ? `${s.types?.length ?? 0} types` : s.duration}
                      </p>
                    </div>
                    <p style={{ color: "var(--pink)", fontWeight: 700, fontSize: 13 }}>
                      {s.priced ? `From ₱${servicePrice(s.id)}` : `₱${s.price}`}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── STYLISTS ── */}
          {active === "Stylists" && (
            <div className="stat-card" style={{ padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <p style={{ fontWeight: 700, color: "var(--gold)" }}>Stylists</p>
                <button className="btn-pink" style={{ width: "auto", padding: "6px 14px", fontSize: 12 }}>+ Add Stylist</button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {STYLISTS.map(s => (
                  <div key={s.id} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,168,76,0.12)", borderRadius: 12, padding: 12, display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 30 }}>{s.img}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600 }}>{s.name}</p>
                      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{s.role}</p>
                    </div>
                    <span style={{ color: "#ffc107" }}>★ {s.rating}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── CUSTOMERS ── */}
          {active === "Customers" && (
            <div className="stat-card" style={{ padding: 16 }}>
              <p style={{ fontWeight: 700, color: "var(--gold)", marginBottom: 14 }}>Customers</p>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ color: "rgba(255,255,255,0.35)" }}>
                    {["Name","Service","Date","Status"].map(h => (
                      <th key={h} style={{ textAlign: "left", paddingBottom: 10, paddingRight: 12, fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ADMIN_BOOKINGS.map(b => (
                    <tr key={b.id} style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                      <td style={{ padding: "9px 12px 9px 0" }}>{b.customer}</td>
                      <td style={{ padding: "9px 12px 9px 0" }}>{b.service}</td>
                      <td style={{ padding: "9px 12px 9px 0" }}>{b.date}</td>
                      <td style={{ padding: "9px 0" }}><span className={`badge badge-${b.status}`}>{b.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── OTHER ── */}
          {!["Dashboard","Appointments","Services","Stylists","Customers"].includes(active) && (
            <div className="stat-card" style={{ padding: 40, textAlign: "center" }}>
              <p style={{ fontSize: 40, marginBottom: 10 }}>🚧</p>
              <p style={{ fontWeight: 700, color: "var(--gold)", fontSize: 16 }}>{active}</p>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginTop: 6 }}>This section is coming soon</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
