"use client";
import SalonLogo from "./SalonLogo";
import ServiceCard from "./ServiceCard";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { CATEGORIES, HairType, ServiceItem } from "../data";

type DBService = { id: string; name: string; category: string; duration: string; price: number; img: string };
type Props = {
  selected: number[]; onToggle: (id: number) => void; onNext: () => void; onBack: () => void;
  chosen: Record<number, HairType>; onChoose: (serviceId: number, t: HairType) => void;
  initialCategory?: string;
};
type Priced = { priced?: boolean; types?: HairType[]; typeLabel?: string; columnsHeader?: string };
type DisplayService = ServiceItem & { category?: string };

function TypePicker({ service, chosen, onBook }: {
  service: DisplayService & Priced;
  chosen: HairType | undefined;
  onBook: (h: HairType) => void;
}) {
  const types = service.types ?? [];
  if (!types.length) return null;
  return (
    <div style={{ marginTop: 16 }}>
      <p style={{ fontSize: 11, fontWeight: 800, color: "var(--gold)", letterSpacing: 1, marginBottom: 10 }}>
        CHOOSE {(service.typeLabel ?? "option").toUpperCase()}
      </p>
      <div className="service-type-grid">
        {types.map(h => {
          const isBooked = chosen?.name === h.name;
          return (
            <div key={h.name} className={`service-type-card ${isBooked ? "selected" : ""}`}>
              <span className="service-type-name">{h.name}</span>
              <span style={{ display: "flex", width: "100%", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>⏱ {h.time}</span>
                <span style={{ fontSize: 12, color: "var(--pink)", fontWeight: 800 }}>₱{h.price}</span>
                <button
                  className={isBooked ? "btn-ghost" : "btn-pink"}
                  onClick={() => onBook(h)}
                  style={{ fontSize: 11, padding: "5px 10px", borderRadius: 8, whiteSpace: "nowrap" }}
                >
                  {isBooked ? "✓ Booked" : "Book"}
                </button>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function SelectService({ selected, onToggle, onNext, onBack, chosen, onChoose, initialCategory }: Props) {
  const [activeCat, setActiveCat] = useState<string>(() =>
    initialCategory && CATEGORIES.some(c => c.label === initialCategory) ? initialCategory : CATEGORIES[0].label,
  );
  const [openSvc, setOpenSvc] = useState<number | null>(null);
  const [dbServices, setDbServices] = useState<DBService[]>([]);

  useEffect(() => {
    supabase.from("services").select("*")
      .neq("name", "Full Body Massage").neq("name", "Blowout")
      .order("created_at", { ascending: true })
      .then(({ data }) => { if (data) setDbServices(data); });
  }, []);

  useEffect(() => {
    if (initialCategory && CATEGORIES.some(c => c.label === initialCategory)) {
      setActiveCat(initialCategory);
      setOpenSvc(null);
    }
  }, [initialCategory]);

  const category = CATEGORIES.find(c => c.label === activeCat) ?? CATEGORIES[0];

  const allServices: DisplayService[] = dbServices.length
    ? dbServices
        .filter(s => s.category === activeCat)
        .map((s, i) => {
          const stat = category.services.find(item => item.name.toLowerCase() === s.name.toLowerCase());
          return stat
            ? { ...stat, price: s.price, duration: s.duration, img: s.img }
            : { id: 1000 + i, name: s.name, desc: s.name, duration: s.duration, price: s.price, img: s.img, category: s.category };
        })
    : category.services;

  const priceOf = (s: { id: number; price: number } & Priced) =>
    s.priced ? (chosen[s.id]?.price ?? 0) : s.price;

  const total = allServices.filter(s => selected.includes(s.id)).reduce((sum, s) => sum + priceOf(s), 0);

  const handleCardClick = (s: DisplayService & Priced) => {
    if (s.priced && s.types?.length) {
      // Toggle the type picker
      setOpenSvc(prev => (prev === s.id ? null : s.id));
    } else {
      onToggle(s.id);
    }
  };

  const bookType = (serviceId: number, h: HairType) => {
    onChoose(serviceId, h);
    if (!selected.includes(serviceId)) onToggle(serviceId);
  };

  return (
    <div className="page">
      <nav className="site-nav">
        <div className="site-nav-brand"><SalonLogo /></div>
        <button className="btn-ghost" onClick={onBack} style={{ fontSize: 13 }}>‹ Back to Home</button>
      </nav>

      <div className="page-content">
        {/* Step bar */}
        <div className="steps-bar">
          {["Select Services", "Date & Time", "Choose Stylist", "Your Details", "Confirm"].map((s, i) => (
            <div key={s} className="step-item">
              <div className={`step-num ${i === 0 ? "active" : ""}`}>{i + 1}</div>
              <span className={`step-label ${i === 0 ? "active" : ""}`}>{s}</span>
              {i < 4 && <div className="step-line" />}
            </div>
          ))}
        </div>

        <h1 className="page-title">Select Services</h1>
        <p className="page-subtitle">Choose a category, then pick the service you want</p>

        {/* Category pills */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, margin: "4px 0 28px" }}>
          {CATEGORIES.map(c => {
            const isActive = c.label === activeCat;
            return (
              <button key={c.label} onClick={() => { setActiveCat(c.label); setOpenSvc(null); }} style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "8px 15px", borderRadius: 999,
                background: isActive ? "rgba(232,25,125,0.16)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${isActive ? "var(--pink)" : "rgba(201,168,76,0.22)"}`,
                fontSize: 12.5, fontWeight: 700,
                color: isActive ? "var(--pink)" : "var(--text-light)",
                cursor: "pointer",
              }}>
                <span style={{ fontSize: 15 }}>{c.icon}</span> {c.label}
              </button>
            );
          })}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 32, alignItems: "start" }}>

          {/* Left — service cards same as landing page */}
          <div>
            {/* Landing-style service grid */}
            <div className="landing-service-grid" style={{ marginBottom: 0 }}>
              {allServices.map(s => {
                const isSelected = selected.includes(s.id);
                const isOpen = openSvc === s.id;
                const chosenType = chosen[s.id];
                return (
                  <div key={s.id} style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                    {/* The same ServiceCard as landing/home, with a selected ring */}
                    <div style={{
                      borderRadius: 16,
                      outline: isSelected ? "2.5px solid var(--pink)" : "2.5px solid transparent",
                      outlineOffset: 2,
                      transition: "outline-color .18s",
                      cursor: "pointer",
                    }}>
                      <ServiceCard
                        service={{ ...s, category: s.category ?? activeCat }}
                        onExplore={() => handleCardClick(s as DisplayService & Priced)}
                      />
                    </div>

                    {/* Status badge below card */}
                    {isSelected && (
                      <div style={{
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                        padding: "6px 0", background: "rgba(232,25,125,0.12)",
                        border: "1px solid rgba(232,25,125,0.3)", borderTop: "none",
                        borderRadius: "0 0 14px 14px", fontSize: 12, fontWeight: 700, color: "var(--pink)",
                      }}>
                        ✓ {chosenType ? chosenType.name : "Added"}
                        <button
                          onClick={e => { e.stopPropagation(); onToggle(s.id); }}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 15, lineHeight: 1, padding: "0 2px" }}
                          aria-label="Remove"
                        >×</button>
                      </div>
                    )}

                    {/* Inline type picker — slides open below the card */}
                    {isOpen && (s as Priced).priced && (
                      <div className="card" style={{
                        padding: 18, marginTop: 8, borderRadius: 14,
                        border: "1px solid rgba(232,25,125,0.25)",
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                          <p style={{ fontWeight: 800, fontSize: 14, color: "var(--gold)" }}>{s.name} Options</p>
                          <button onClick={() => setOpenSvc(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 20 }}>×</button>
                        </div>
                        <TypePicker
                          service={s as DisplayService & Priced}
                          chosen={chosenType}
                          onBook={h => { bookType(s.id, h); setOpenSvc(null); }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {allServices.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
                <p style={{ fontSize: 32, marginBottom: 10 }}>✂️</p>
                <p>No services found in this category.</p>
              </div>
            )}
          </div>

          {/* Right — booking summary */}
          <div className="card" style={{ padding: 24, position: "sticky", top: 80 }}>
            <p style={{ fontWeight: 700, fontSize: 14, color: "var(--gold)", letterSpacing: 1, marginBottom: 16 }}>
              BOOKING SUMMARY
            </p>

            {selected.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 0" }}>
                <p style={{ fontSize: 32, marginBottom: 10 }}>🛒</p>
                <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No services selected yet</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
                {allServices.filter(s => selected.includes(s.id)).map(s => (
                  <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 18 }}>{s.img}</span>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600 }}>{s.name}</p>
                        <p style={{ fontSize: 11, color: "var(--text-muted)" }}>
                          {chosen[s.id] ? `${chosen[s.id].name} · ${chosen[s.id].time}` : s.duration}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "var(--pink)" }}>₱{priceOf(s as DisplayService & Priced)}</span>
                      <button onClick={() => onToggle(s.id)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 16 }}>×</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selected.length > 0 && (
              <>
                <div className="divider" />
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                  <span style={{ fontWeight: 700 }}>Total</span>
                  <span style={{ fontWeight: 800, fontSize: 20, color: "var(--pink)" }}>₱{total}</span>
                </div>
              </>
            )}

            <button className="btn-pink wide" onClick={onNext} disabled={selected.length === 0} style={{ borderRadius: 10 }}>
              Continue {selected.length > 0 ? `(${selected.length})` : ""}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
