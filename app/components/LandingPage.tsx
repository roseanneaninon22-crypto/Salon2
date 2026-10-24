"use client";

import { useState } from "react";
import { FEATURED_SERVICES } from "../data";
import AuthScreen from "./AuthScreen";
import SalonLogo from "./SalonLogo";
import ServiceCard from "./ServiceCard";
import AboutFooter from "./AboutFooter";

type AppRole = "user" | "admin" | "stylist";
type Props = { onLogin: (role: AppRole) => void; onSeeAllServices: () => void; onOpenService: (serviceId: number) => void };

export default function LandingPage({ onLogin, onSeeAllServices, onOpenService }: Props) {
  const [authOpen, setAuthOpen] = useState(false);
  const scrollTo = (sectionId: string) => document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
  const openLogin = () => setAuthOpen(true);

  return (
    <main className="landing-page">
      <nav className="site-nav landing-nav">
        <SalonLogo />
        <div className="site-nav-links landing-nav-links">
          <button className="site-nav-link active">Home</button>
          <button className="site-nav-link" onClick={() => scrollTo("landing-services")}>Services</button>
          <button className="site-nav-link" onClick={() => scrollTo("landing-about")}>About</button>
        </div>
      </nav>

      <section className="landing-hero">
        <div className="landing-hero-overlay" />
        <div className="landing-copy">
          <p className="landing-eyebrow">Look Good · Feel Great · Be Confident</p>
          <h1>Welcome to<br /><span>Rosseygirl Salon</span><br />Book Your <strong>Perfect Look</strong></h1>
          <p className="landing-description">Treat yourself to a premium salon experience. Choose from our wide range of services and expert stylists.</p>
          <div className="landing-actions">
          <button className="btn-pink" onClick={openLogin}>📅 Book Now</button>
          <button className="btn-outline" onClick={openLogin}>Log In</button>
          </div>
        </div>
      </section>

      <section id="landing-services" className="landing-services section">
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

      <section id="landing-about" className="landing-about">
        <p className="landing-eyebrow">Rosseygirl Salon</p>
        <h2>Your beauty, our passion.</h2>
        <p>Sign in to explore services, choose a stylist, and book your appointment online.</p>
        <button className="btn-pink" onClick={openLogin}>Log In to Get Started</button>
      </section>
      <AboutFooter
        onHome={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        onAbout={() => scrollTo("landing-about")}
        onServices={() => scrollTo("landing-services")}
        onBook={openLogin}
      />
      {authOpen && <AuthScreen modal initialMode="login" onLogin={onLogin} onClose={() => setAuthOpen(false)} />}
    </main>
  );
}
