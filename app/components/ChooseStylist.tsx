"use client";
import SalonLogo from "./SalonLogo";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { STYLISTS as DEFAULT_STYLISTS } from "../data";

type Stylist = { id: string; name: string; role: string; rating: number | null; img: string | null; photo_url?: string | null };
type Props = { selected: string | null; onSelect: (id: string, name: string) => void; onNext: () => void; onBack: () => void };

export default function ChooseStylist({ selected, onSelect, onNext, onBack }: Props) {
  const [databaseStylists, setDatabaseStylists] = useState<Stylist[]>([]);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const loadStylists = async () => {
      const { data, error } = await supabase
        .from("stylists")
        .select("id, name, role, rating, img, photo_url")
        .order("created_at", { ascending: true });
      if (error) setLoadError(error.message);
      else setDatabaseStylists((data ?? []) as Stylist[]);
    };
    void loadStylists();
  }, []);

  const stylists: Stylist[] = [
    ...databaseStylists,
    ...DEFAULT_STYLISTS
      .filter(defaultStylist => !databaseStylists.some(stylist => stylist.name.toLowerCase() === defaultStylist.name.toLowerCase()))
      .map(stylist => ({ ...stylist, id: `default-${stylist.id}` })),
  ];

  return (
    <div className="page">
      {/* Navbar */}
      <nav className="site-nav">
        <div className="site-nav-brand">
          <SalonLogo />
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
        {loadError && <p role="alert" style={{ color: "#ff6b9d", marginBottom: 16 }}>Could not load saved stylists: {loadError}</p>}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 24, marginBottom: 24 }}>
          {stylists.map(s => (
            <div key={s.id}
              className={`stylist-card ${selected === s.id ? "sel" : ""}`}
              onClick={() => onSelect(s.id, s.name)}>
              <div style={{
                width: 90, height: 90, borderRadius: "50%", fontSize: 48,
                background: "linear-gradient(135deg,rgba(232,25,125,0.2),rgba(180,80,20,0.2))",
                border: `3px solid ${selected === s.id ? "var(--pink)" : "rgba(201,168,76,0.2)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "border-color 0.2s",
              }}>{s.photo_url ? <img src={s.photo_url} alt={s.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : s.img}</div>
              <div>
                <p style={{ fontWeight: 800, fontSize: 16 }}>{s.name}</p>
                <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>{s.role}</p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, marginTop: 8 }}>
                  <span style={{ color: "#ffc107", fontSize: 16 }}>★</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "var(--gold)" }}>{s.rating ? s.rating.toFixed(1) : "New"}</span>
                </div>
              </div>
              <button className={selected === s.id ? "btn-pink" : "btn-outline"}
                onClick={e => { e.stopPropagation(); onSelect(s.id, s.name); }}
                style={{ padding: "10px 28px", borderRadius: 10 }}>
                {selected === s.id ? "✓ Selected" : "Select"}
              </button>
            </div>
          ))}
        </div>

        {/* Any stylist option */}
        <div
          className={`card card-hover ${selected === "any" ? "sel" : ""}`}
          style={{
            padding: "20px 28px", display: "flex", alignItems: "center", gap: 16,
            cursor: "pointer", marginBottom: 32,
            border: selected === "any" ? "1.5px solid var(--pink)" : "1.5px dashed rgba(201,168,76,0.3)",
          }}
          onClick={() => onSelect("any", "Any available stylist")}>
          <span style={{ fontSize: 32 }}>🎲</span>
          <div>
            <p style={{ fontWeight: 700, fontSize: 15 }}>No preference — Any available stylist</p>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>We'll assign the best available stylist for your appointment</p>
          </div>
          {selected === "any" && <span style={{ marginLeft: "auto", color: "var(--pink)", fontWeight: 700 }}>✓ Selected</span>}
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
