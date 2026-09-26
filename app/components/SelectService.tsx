"use client";
import { useState } from "react";
import { CATEGORIES, SERVICES, HairType } from "../data";

type Props = { selected: number[]; onToggle: (id: number) => void; onNext: () => void; onBack: () => void;
  chosen: Record<number, HairType>; onChoose: (serviceId: number, t: HairType) => void;
  initialCategory?: string };

/* A service whose price comes from the chosen type instead of a fixed price */
type Priced = { priced?: boolean; types?: HairType[]; typeLabel?: string; columnsHeader?: string };

/* Type list for one service — every type has its own price and "Book Now" button */
function TypeList({ service, booked, onBook }: {
  service: Priced & { name: string; img: string };
  booked: string | null;
  onBook: (h: HairType) => void;
}) {
  const types = service.types ?? [];
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid rgba(201,168,76,0.12)" }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)" }}>{service.columnsHeader ?? "Type"}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)" }}>Price</span>
      </div>
      {types.map(h => {
        const isBooked = booked === h.name;
        return (
          <div key={h.name} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
            padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}>
            <span style={{ fontSize: 12, flex: 1, color: isBooked ? "var(--gold)" : "var(--text-light)", fontWeight: isBooked ? 700 : 400 }}>
              {h.name}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, color: "var(--text-muted)", whiteSpace: "nowrap" }}>⏱ {h.time}</span>
              <span style={{ fontSize: 12, color: "var(--pink)", fontWeight: 800, whiteSpace: "nowrap", minWidth: 50, textAlign: "right" }}>
                ₱{h.price}
              </span>
              <button
                className={isBooked ? "btn-ghost" : "btn-pink"}
                onClick={() => onBook(h)}
                style={{ fontSize: 11, padding: "5px 10px", borderRadius: 8, whiteSpace: "nowrap", minWidth: 84 }}
              >
                {isBooked ? "✓ Booked" : "Book Now"}
              </button>
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function SelectService({ selected, onToggle, onNext, onBack, chosen, onChoose, initialCategory }: Props) {
  /* Which category is open; defaults to the first one (or the one clicked on the home page) */
  const [activeCat, setActiveCat] = useState<string>(initialCategory || CATEGORIES[0].label);
  /* Which service inside the category has its types expanded */
  const [openSvc, setOpenSvc] = useState<number | null>(null);

  const category = CATEGORIES.find(c => c.label === activeCat) ?? CATEGORIES[0];

  /* Price of a service: the chosen type's price for priced services, else its fixed price */
  const priceOf = (s: { id: number; price: number } & Priced) =>
    s.priced ? (chosen[s.id]?.price ?? 0) : s.price;

  const total = SERVICES.filter(s => selected.includes(s.id))
    .reduce((sum, s) => sum + priceOf(s), 0);

  const switchCategory = (label: string) => {
    setActiveCat(label);
    setOpenSvc(null);
  };

  /* Book a type: select it, and make sure its parent service is in the booking */
  const bookType = (serviceId: number, h: HairType) => {
    onChoose(serviceId, h);
    if (!selected.includes(serviceId)) onToggle(serviceId);
  };

  /* Services with types open their list instead of selecting right away */
  const toggleService = (s: { id: number } & Priced) => {
    if (s.priced) setOpenSvc(prev => (prev === s.id ? null : s.id));
    else onToggle(s.id);
  };

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
        <button className="btn-ghost" onClick={onBack} style={{ fontSize: 13 }}>‹ Back to Home</button>
      </nav>

      <div className="page-content">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <span onClick={onBack}>Home</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-current">Select Services</span>
        </div>

        {/* Step bar */}
        <div className="steps-bar">
          {["Select Services","Date & Time","Choose Stylist","Your Details","Confirm"].map((s,i) => (
            <div key={s} className="step-item">
              <div className={`step-num ${i === 0 ? "active" : ""}`}>{i+1}</div>
              <span className={`step-label ${i === 0 ? "active" : ""}`}>{s}</span>
              {i < 4 && <div className="step-line" />}
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 32, alignItems: "start" }}>

          {/* Left — services grid */}
          <div>
            <h1 className="page-title">Select Services</h1>
            <p className="page-subtitle">Choose a category, then book the service you want</p>

            {/* Category pills */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, margin: "4px 0 24px" }}>
              {CATEGORIES.map(c => {
                const isActive = c.label === activeCat;
                return (
                  <button key={c.label} onClick={() => switchCategory(c.label)} style={{
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

            {/* Active category */}
            <div className="card" style={{ padding: 24 }}>
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontWeight: 800, fontSize: 17, color: "var(--gold)" }}>{category.icon} {category.name}</p>
                <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 4 }}>{category.desc}</p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {category.services.map(s => {
                  const isOpen = openSvc === s.id;
                  const choice = chosen[s.id];
                  const isSelected = selected.includes(s.id);
                  return (
                    <div key={s.id} style={{
                      border: `1px solid ${isSelected ? "var(--pink)" : "rgba(255,255,255,0.07)"}`,
                      borderRadius: 14, overflow: "hidden",
                      background: isSelected ? "rgba(232,25,125,0.05)" : "rgba(255,255,255,0.015)",
                    }}>
                      {/* Service row */}
                      <div onClick={() => toggleService(s)} style={{
                        display: "flex", alignItems: "center", gap: 16, padding: 16, cursor: "pointer",
                      }}>
                        <div style={{
                          width: 52, height: 52, borderRadius: 12, flexShrink: 0,
                          background: "linear-gradient(135deg,rgba(232,25,125,0.2),rgba(180,80,20,0.2))",
                          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26,
                        }}>{s.img}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontWeight: 800, fontSize: 14 }}>{s.name}</p>
                          <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3 }}>{s.desc}</p>
                          <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3 }}>
                            ⏱ {choice ? choice.time : s.duration}
                          </p>
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <p style={{ color: "var(--pink)", fontWeight: 800, fontSize: 17 }}>
                            {s.priced ? (choice ? `₱${choice.price}` : "See prices") : `₱${s.price}`}
                          </p>
                          {s.priced ? (
                            <p style={{ color: "var(--gold)", fontSize: 11.5, fontWeight: 700, marginTop: 4 }}>
                              {isOpen ? "▾ Hide" : "▸ View"} {s.typeLabel} types
                            </p>
                          ) : (
                            isSelected && (
                              <p style={{ color: "var(--gold)", fontSize: 11.5, fontWeight: 700, marginTop: 4 }}>✓ Added</p>
                            )
                          )}
                        </div>
                      </div>

                      {/* Type picker */}
                      {s.priced && isOpen && (
                        <div style={{ padding: "0 16px 16px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                          {choice && (
                            <p style={{ fontSize: 12, color: "var(--gold)", fontWeight: 700, paddingTop: 12 }}>
                              Selected: {choice.name} — ₱{choice.price}
                            </p>
                          )}
                          <div style={{ paddingTop: 10 }}>
                            <TypeList service={s} booked={choice?.name ?? null}
                              onBook={h => bookType(s.id, h)} />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right — summary panel */}
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
                {SERVICES.filter(s => selected.includes(s.id)).map(s => (
                  <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 18 }}>{s.img}</span>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600 }}>{s.name}</p>
                        <p style={{ fontSize: 11, color: "var(--text-muted)" }}>
                          {chosen[s.id] ? `${chosen[s.id].name} • ${chosen[s.id].time}` : s.duration}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "var(--pink)" }}>
                        ₱{priceOf(s)}
                      </span>
                      <button onClick={e => { e.stopPropagation(); onToggle(s.id); }}
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

            <button className="btn-pink wide" onClick={onNext} disabled={selected.length === 0}
              style={{ borderRadius: 10 }}>
              Continue {selected.length > 0 ? `(${selected.length})` : ""}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
