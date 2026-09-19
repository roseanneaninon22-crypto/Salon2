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

type Props = { onBook: () => void; onMyBookings: () => void; onLogout: () => void; userName: string };

export default function HomeScreen({ onBook, onMyBookings, onLogout, userName }: Props) {
  return (
    <div className="page">

      {/* ── Top Navbar ── */}
      <nav className="site-nav">
        <div className="site-nav-brand">
          <div className="logo-circle"><span>💇</span></div>
          <div>
            <p style={{ fontWeight: 800, fontSize: 15, color: "var(--pink)" }}>RosseyGirl</p>
            <p style={{ fontSize: 9, color: "var(--gold)", letterSpacing: 3 }}>SALON</p>
          </div>
        </div>

        <div className="site-nav-links">
          <button className="site-nav-link active">Home</button>
          <button className="site-nav-link" onClick={onBook}>Services</button>
          <button className="site-nav-link" onClick={onMyBookings}>My Bookings</button>
          <button className="site-nav-link">About</button>
          <button className="site-nav-link">Contact</button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{userName || "Guest"}</p>
            <p style={{ fontSize: 11, color: "var(--text-muted)" }}>Welcome back 👋</p>
          </div>
          <button onClick={onLogout} className="btn-ghost" style={{ padding: "8px 18px", fontSize: 13 }}>
            Logout
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <div className="hero" style={{ minHeight: 620 }}>
        {/* background image */}
        <img src="/back.png" alt="" style={{
          position: "absolute", inset: 0, width: "100%", height: "100%",
          objectFit: "cover", objectPosition: "76% 20%", pointerEvents: "none",
        }} />
        <div className="hero-overlay" />

        <div className="hero-content">
          <p style={{ fontSize: 13, color: "var(--gold)", letterSpacing: 3, textTransform: "uppercase", marginBottom: 16 }}>
            Look Good · Feel Great · Be Confident
          </p>
          <h1 style={{ fontSize: 52, fontWeight: 900, lineHeight: 1.15, marginBottom: 16, maxWidth: 560 }}>
            Welcome, <span style={{ color: "var(--pink)" }}>{userName || "Guest"}</span>!<br />
            Book Your <span style={{ color: "var(--gold)" }}>Perfect Look</span>
          </h1>
          <p style={{ fontSize: 16, color: "rgba(245,230,208,0.65)", marginBottom: 36, maxWidth: 460, lineHeight: 1.65 }}>
            Treat yourself to a premium salon experience. Choose from our wide range of services and expert stylists.
          </p>
          <div style={{ display: "flex", gap: 16 }}>
            <button className="btn-pink" onClick={onBook} style={{ padding: "14px 36px", fontSize: 15, borderRadius: 12 }}>
              📅 Book Now
            </button>
            <button className="btn-outline" onClick={onMyBookings} style={{ padding: "14px 36px", fontSize: 15, borderRadius: 12 }}>
              My Bookings
            </button>
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div style={{ flex: 1 }}>

        {/* ── Service Categories ── */}
        <section className="section" style={{ background: "rgba(255,255,255,0.01)" }}>
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <p style={{ fontSize: 12, color: "var(--gold)", letterSpacing: 3, textTransform: "uppercase", marginBottom: 10 }}>What We Offer</p>
              <h2 style={{ fontSize: 32, fontWeight: 800 }}>Our Services</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 16 }}>
              {CATS.map(c => (
                <div key={c.label} className="card card-hover" onClick={onBook}
                  style={{ padding: "28px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12, cursor: "pointer", textAlign: "center" }}>
                  <span style={{ fontSize: 36 }}>{c.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-light)" }}>{c.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Popular Services ── */}
        <section className="section">
          <div className="container">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32 }}>
              <div>
                <p style={{ fontSize: 12, color: "var(--gold)", letterSpacing: 3, textTransform: "uppercase", marginBottom: 8 }}>Top Picks</p>
                <h2 style={{ fontSize: 28, fontWeight: 800 }}>Popular Services</h2>
              </div>
              <button className="btn-outline" onClick={onBook} style={{ padding: "10px 24px" }}>View All Services</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
              {SERVICES.slice(0, 3).map(s => (
                <div key={s.id} className="card card-hover" onClick={onBook}
                  style={{ padding: 24, cursor: "pointer" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
                    <div style={{
                      width: 60, height: 60, borderRadius: 14,
                      background: "rgba(232,25,125,0.12)",
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0,
                    }}>{s.img}</div>
                    <div>
                      <p style={{ fontWeight: 800, fontSize: 15 }}>{s.name}</p>
                      <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3 }}>{s.desc}</p>
                    </div>
                  </div>
                  <div className="divider" style={{ margin: "12px 0" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>⏱ {s.duration}</span>
                    <span style={{ color: "var(--pink)", fontWeight: 800, fontSize: 18 }}>₱{s.price}</span>
                  </div>
                  <button className="btn-pink wide" onClick={onBook} style={{ marginTop: 16, borderRadius: 10 }}>
                    Book This Service
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA Banner ── */}
        <section style={{
          background: "linear-gradient(135deg, rgba(232,25,125,0.15) 0%, rgba(180,60,20,0.1) 100%)",
          borderTop: "1px solid rgba(232,25,125,0.12)",
          borderBottom: "1px solid rgba(232,25,125,0.12)",
          padding: "60px 40px",
          textAlign: "center",
        }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12 }}>
            Ready for Your Next Appointment?
          </h2>
          <p style={{ fontSize: 15, color: "var(--text-muted)", marginBottom: 28 }}>
            Book in minutes and let our experts take care of the rest.
          </p>
          <button className="btn-pink" onClick={onBook} style={{ padding: "16px 48px", fontSize: 16, borderRadius: 12 }}>
            Book an Appointment
          </button>
        </section>

        {/* ── Footer ── */}
        <footer style={{
          background: "rgba(0,0,0,0.3)",
          borderTop: "1px solid rgba(201,168,76,0.1)",
          padding: "30px 40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div className="logo-circle" style={{ width: 36, height: 36, fontSize: 16 }}><span>💇</span></div>
            <div>
              <p style={{ fontWeight: 800, fontSize: 13, color: "var(--pink)" }}>RosseyGirl Salon</p>
              <p style={{ fontSize: 10, color: "var(--text-muted)" }}>© 2026 All rights reserved</p>
            </div>
          </div>
          <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Made with ♥ for beauty lovers</p>
        </footer>
      </div>
    </div>
  );
}
