"use client";
import { FEATURED_SERVICES } from "../data";
import SalonLogo from "./SalonLogo";
import ServiceCard from "./ServiceCard";
import AboutFooter from "./AboutFooter";

type Props = { onBook: (category?: string) => void; onMyBookings: () => void; onMessages: () => void; onAbout: () => void; onLogout: () => void; onSeeAllServices: () => void; onOpenService: (serviceId: number) => void; userName: string };

export default function HomeScreen({ onBook, onMyBookings, onMessages, onAbout, onLogout, onSeeAllServices, onOpenService, userName }: Props) {
  return (
    <div className="page">

      {/* ── Top Navbar ── */}
      <nav className="site-nav">
        <SalonLogo />

        <div className="site-nav-links">
          <button className="site-nav-link active">Home</button>
          <button className="site-nav-link" onClick={() => document.getElementById("customer-services")?.scrollIntoView({ behavior: "smooth" })}>Services</button>
          <button className="site-nav-link" onClick={onMyBookings}>My Bookings</button>
          <button className="site-nav-link" onClick={onMessages}>Messages</button>
          <button className="site-nav-link" onClick={() => document.getElementById("customer-about")?.scrollIntoView({ behavior: "smooth" })}>About</button>
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
            <button className="btn-pink" onClick={() => onBook()} style={{ padding: "14px 36px", fontSize: 15, borderRadius: 12 }}>
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

        {/* ── Services (same display as the public landing page) ── */}
        <section id="customer-services" className="landing-services section">
          <div className="container">
            <p className="landing-eyebrow">What We Offer</p>
            <h2>Beauty services made for you</h2>
            <div className="landing-service-grid">
              {FEATURED_SERVICES.map(service => (
                <ServiceCard key={service.id} service={service} onExplore={() => onOpenService(service.id)} />
              ))}
            </div>
            <button className="btn-outline landing-services-all" onClick={onSeeAllServices}>See All Services</button>
          </div>
        </section>

        <section id="customer-about" className="landing-about">
          <p className="landing-eyebrow">ABOUT ROSSEYGIRL SALON</p>
          <h2>Your Beauty, Our Passion</h2>
          <p>We provide quality beauty services in a comfortable, welcoming space. Our team is here to help you feel confident and cared for at every visit.</p>
          <p><strong>Visit our salon in Poblacion, Oslob.</strong></p>
          <button className="btn-outline" onClick={onAbout}>Learn More About Us</button>
        </section>

      </div>
      <AboutFooter
        onHome={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        onAbout={() => document.getElementById("customer-about")?.scrollIntoView({ behavior: "smooth" })}
        onServices={() => onBook()}
        onBook={() => onBook()}
        onMyBookings={onMyBookings}
      />
    </div>
  );
}
