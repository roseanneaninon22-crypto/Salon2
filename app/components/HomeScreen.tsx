"use client";
import { SERVICES } from "../data";

const CATS = [
  { icon: "✂️", label: "Hair Cut" },
  { icon: "💆", label: "Hair Spa" },
  { icon: "💅", label: "Manicure" },
  { icon: "🎨", label: "Hair Color" },
  { icon: "🧖", label: "Facial" },
  { icon: "💄", label: "Makeup" },
];

type Props = { onBook: () => void; onMyBookings: () => void; onLogout: () => void };

export default function HomeScreen({ onBook, onMyBookings, onLogout }: Props) {
  return (
    <div className="page">
      {/* Hero */}
      <div className="hero-img" style={{ height: 210, flexShrink: 0 }}>
        <div className="hero-silhouette">👩</div>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(10,3,0,0.3) 0%, rgba(10,3,0,0.85) 100%)" }} />
        {/* Top row */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div className="logo-circle" style={{ width: 42, height: 42, fontSize: 18 }}><span>💇</span></div>
            <div>
              <p style={{ fontWeight: 800, fontSize: 13, color: "var(--pink)" }}>RosseyGirl</p>
              <p style={{ fontSize: 9, color: "var(--gold)", letterSpacing: 2 }}>SALON</p>
            </div>
          </div>
          <button onClick={onLogout} style={{ fontSize: 11, padding: "5px 12px", borderRadius: 20, border: "1px solid rgba(201,168,76,0.35)", background: "transparent", color: "rgba(245,230,208,0.6)", cursor: "pointer" }}>
            Logout
          </button>
        </div>
        {/* Bottom text */}
        <div style={{ position: "relative", zIndex: 2, padding: "0 16px 14px" }}>
          <p style={{ fontSize: 10, color: "var(--gold)", letterSpacing: 2, textTransform: "uppercase" }}>Look Good. Feel Great.</p>
          <p style={{ fontSize: 20, fontWeight: 800, marginTop: 2, lineHeight: 1.25 }}>
            Book Your<br /><span style={{ color: "var(--pink)" }}>Perfect Look</span>
          </p>
        </div>
      </div>

      {/* Book Now */}
      <div style={{ padding: "0 16px", marginTop: -18, position: "relative", zIndex: 3 }}>
        <button className="btn-pink" onClick={onBook} style={{ fontSize: 15, padding: "13px 24px" }}>
          BOOK NOW
        </button>
      </div>

      {/* Categories */}
      <div style={{ padding: "18px 16px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <p style={{ fontWeight: 700, fontSize: 14 }}>Our Services</p>
          <span style={{ fontSize: 12, color: "var(--pink)", cursor: "pointer" }}>View all</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
          {CATS.map(c => (
            <div key={c.label} className="card2" onClick={onBook}
              style={{ padding: "12px 8px", display: "flex", flexDirection: "column", alignItems: "center", gap: 5, cursor: "pointer" }}>
              <span style={{ fontSize: 22 }}>{c.icon}</span>
              <span style={{ fontSize: 10, textAlign: "center", color: "var(--text-muted)" }}>{c.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Popular */}
      <div style={{ padding: "16px 16px 0", flex: 1 }}>
        <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>Popular Services</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {SERVICES.slice(0, 3).map(s => (
            <div key={s.id} className="svc-card" onClick={onBook}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(232,25,125,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                {s.img}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, fontSize: 13 }}>{s.name}</p>
                <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{s.desc}</p>
                <p style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 1 }}>{s.duration}</p>
              </div>
              <p style={{ color: "var(--pink)", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>₱{s.price}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="bottom-nav" style={{ marginTop: 16 }}>
        {[
          { icon: "🏠", label: "Home", on: true, fn: () => {} },
          { icon: "📅", label: "Book", on: false, fn: onBook },
          { icon: "📋", label: "Bookings", on: false, fn: onMyBookings },
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
