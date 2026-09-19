"use client";
import { useState } from "react";
import { SERVICES, BOYS_HAIRCUTS, GIRLS_HAIRCUTS, HairType } from "../data";

type Props = { selected: number[]; onToggle: (id: number) => void; onNext: () => void; onBack: () => void };

/* Haircut price list shown under the "Hair Cut" service card */
function HaircutList({ title, icon, list }: { title: string; icon: string; list: HairType[] }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <p style={{ fontSize: 12, fontWeight: 800, color: "var(--gold)", letterSpacing: 0.5, marginBottom: 6 }}>
        {icon} {title}
      </p>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid rgba(201,168,76,0.12)" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)" }}>Haircut</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)" }}>Estimated Time</span>
        </div>
        {list.map(h => (
          <div key={h.name} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <span style={{ fontSize: 12, color: "var(--text-light)" }}>{h.name}</span>
            <span style={{ fontSize: 12, color: "var(--pink)", fontWeight: 600 }}>{h.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SelectService({ selected, onToggle, onNext, onBack }: Props) {
  const [openId, setOpenId] = useState<number | null>(null);
  const total = SERVICES.filter(s => selected.includes(s.id)).reduce((sum, s) => sum + s.price, 0);

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
            <p className="page-subtitle">Choose one or more services for your appointment</p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
              {SERVICES.map(s => {
                const isHairCut = s.name === "Hair Cut";
                const isOpen = openId === s.id;
                return (
                  <div key={s.id} className={`svc-card ${selected.includes(s.id) ? "sel" : ""}`}
                    onClick={() => { onToggle(s.id); if (isHairCut) setOpenId(isOpen ? null : s.id); }}
                    style={{ position: "relative" }}>
                    {/* Checkmark */}
                    {selected.includes(s.id) && (
                      <div style={{
                        position: "absolute", top: 12, right: 12,
                        width: 24, height: 24, borderRadius: "50%",
                        background: "var(--pink)", display: "flex", alignItems: "center",
                        justifyContent: "center", fontSize: 13, color: "#fff", fontWeight: 700,
                      }}>✓</div>
                    )}
                    <div style={{
                      width: 64, height: 64, borderRadius: 14,
                      background: "linear-gradient(135deg,rgba(232,25,125,0.2),rgba(180,80,20,0.2))",
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32,
                    }}>{s.img}</div>
                    <div>
                      <p style={{ fontWeight: 800, fontSize: 14 }}>{s.name}</p>
                      <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{s.desc}</p>
                      <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3 }}>⏱ {s.duration}</p>
                    </div>
                    <p style={{ color: "var(--pink)", fontWeight: 800, fontSize: 18, marginTop: 4 }}>₱{s.price}</p>

                    {/* Hair Cut — hint that clicking shows the haircut types */}
                    {isHairCut && (
                      <p style={{
                        marginTop: 8, color: "var(--gold)", fontSize: 12, fontWeight: 700,
                        display: "flex", alignItems: "center", gap: 5,
                      }}>
                        {isOpen ? "▾" : "▸"} View haircut types
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Hair Cut type list (Boys & Girls) */}
            {openId !== null && SERVICES.some(s => s.id === openId && s.name === "Hair Cut") && (
              <div className="card" style={{ padding: 20, marginTop: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <p style={{ fontWeight: 800, fontSize: 15, color: "var(--gold)" }}>✂️ Hair Cut — Types & Estimated Time</p>
                  <button onClick={() => setOpenId(null)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 18 }}>×</button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                  <HaircutList title="Haircuts for Boys" icon="👦" list={BOYS_HAIRCUTS} />
                  <HaircutList title="Haircuts for Girls" icon="👧" list={GIRLS_HAIRCUTS} />
                </div>
              </div>
            )}
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
                        <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{s.duration}</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "var(--pink)" }}>₱{s.price}</span>
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
