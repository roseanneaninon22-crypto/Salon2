"use client";
import { STYLISTS } from "../data";

type Props = { selected: number | null; onSelect: (id: number) => void; onNext: () => void; onBack: () => void };

export default function ChooseStylist({ selected, onSelect, onNext, onBack }: Props) {
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
          <span onClick={onBack}>Date & Time</span><span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-current">Choose Stylist</span>
        </div>

        {/* Step bar */}
        <div className="steps-bar">
          {["Select Services","Date & Time","Choose Stylist","Your Details","Confirm"].map((s,i) => (
            <div key={s} className="step-item">
              <div className={`step-num ${i < 2 ? "done" : i === 2 ? "active" : ""}`}>
                {i < 2 ? "✓" : i+1}
              </div>
              <span className={`step-label ${i < 2 ? "done" : i === 2 ? "active" : ""}`}>{s}</span>
              {i < 4 && <div className="step-line" />}
            </div>
          ))}
        </div>

        <h1 className="page-title">Choose Your Stylist</h1>
        <p className="page-subtitle">Select one of our expert stylists or leave it to us</p>

        {/* Stylist cards — horizontal row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24, marginBottom: 24 }}>
          {STYLISTS.map(s => (
            <div key={s.id}
              className={`stylist-card ${selected === s.id ? "sel" : ""}`}
              onClick={() => onSelect(s.id)}>
              <div style={{
                width: 90, height: 90, borderRadius: "50%", fontSize: 48,
                background: "linear-gradient(135deg,rgba(232,25,125,0.2),rgba(180,80,20,0.2))",
                border: `3px solid ${selected === s.id ? "var(--pink)" : "rgba(201,168,76,0.2)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "border-color 0.2s",
              }}>{s.img}</div>
              <div>
                <p style={{ fontWeight: 800, fontSize: 16 }}>{s.name}</p>
                <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>{s.role}</p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, marginTop: 8 }}>
                  <span style={{ color: "#ffc107", fontSize: 16 }}>★</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "var(--gold)" }}>{s.rating}</span>
                </div>
              </div>
              <button className={selected === s.id ? "btn-pink" : "btn-outline"}
                onClick={e => { e.stopPropagation(); onSelect(s.id); }}
                style={{ padding: "10px 28px", borderRadius: 10 }}>
                {selected === s.id ? "✓ Selected" : "Select"}
              </button>
            </div>
          ))}
        </div>

        {/* Any stylist option */}
        <div
          className={`card card-hover ${selected === 0 ? "sel" : ""}`}
          style={{
            padding: "20px 28px", display: "flex", alignItems: "center", gap: 16,
            cursor: "pointer", marginBottom: 32,
            border: selected === 0 ? "1.5px solid var(--pink)" : "1.5px dashed rgba(201,168,76,0.3)",
          }}
          onClick={() => onSelect(0)}>
          <span style={{ fontSize: 32 }}>🎲</span>
          <div>
            <p style={{ fontWeight: 700, fontSize: 15 }}>No preference — Any available stylist</p>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>We'll assign the best available stylist for your appointment</p>
          </div>
          {selected === 0 && <span style={{ marginLeft: "auto", color: "var(--pink)", fontWeight: 700 }}>✓ Selected</span>}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button className="btn-ghost" onClick={onBack}>‹ Back</button>
          <button className="btn-pink" onClick={onNext} disabled={selected === null}
            style={{ padding: "13px 40px", borderRadius: 10, fontSize: 15 }}>
            Continue to Your Details
          </button>
        </div>
      </div>
    </div>
  );
}
