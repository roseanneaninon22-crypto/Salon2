"use client";
import { STYLISTS } from "../data";

type Props = { selected: number | null; onSelect: (id: number) => void; onNext: () => void; onBack: () => void };

export default function ChooseStylist({ selected, onSelect, onNext, onBack }: Props) {
  return (
    <div className="page">
      <div className="top-bar">
        <div className="back-btn" onClick={onBack}>‹</div>
        <p style={{ fontWeight: 700, fontSize: 16 }}>Choose Your Stylist</p>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "8px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {STYLISTS.map(s => (
          <div key={s.id} className={`stylist-card ${selected === s.id ? "sel" : ""}`} onClick={() => onSelect(s.id)}>
            {/* Avatar */}
            <div style={{
              width: 52, height: 52, borderRadius: "50%", flexShrink: 0,
              background: "linear-gradient(135deg, rgba(232,25,125,0.25), rgba(180,80,20,0.25))",
              border: "2px solid rgba(232,25,125,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26
            }}>
              {s.img}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, fontSize: 13 }}>{s.name}</p>
              <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{s.role}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                <span style={{ color: "#ffc107", fontSize: 12 }}>★</span>
                <span style={{ fontSize: 11, color: "var(--gold)" }}>{s.rating}</span>
              </div>
            </div>
            <button className="btn-pink" onClick={e => { e.stopPropagation(); onSelect(s.id); }}
              style={{ width: "auto", padding: "6px 14px", fontSize: 11 }}>
              SELECT
            </button>
          </div>
        ))}

        {/* Any stylist option */}
        <div className={`stylist-card ${selected === 0 ? "sel" : ""}`}
          style={{ justifyContent: "center", borderStyle: "dashed" }}
          onClick={() => onSelect(0)}>
          <p style={{ fontSize: 12, color: "var(--text-muted)" }}>No preference — Any available stylist</p>
        </div>
      </div>

      <div style={{ padding: "12px 16px 20px" }}>
        <button className="btn-pink" onClick={onNext} disabled={selected === null}>
          Continue
        </button>
      </div>
    </div>
  );
}
