"use client";
import { SERVICES } from "../data";

type Props = { selected: number[]; onToggle: (id: number) => void; onNext: () => void; onBack: () => void };

export default function SelectService({ selected, onToggle, onNext, onBack }: Props) {
  return (
    <div className="page">
      <div className="top-bar">
        <div className="back-btn" onClick={onBack}>‹</div>
        <p style={{ fontWeight: 700, fontSize: 16 }}>Select Services</p>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "8px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {SERVICES.map(s => (
          <div key={s.id} className={`svc-card ${selected.includes(s.id) ? "sel" : ""}`} onClick={() => onToggle(s.id)}>
            {/* Thumbnail */}
            <div style={{
              width: 60, height: 60, borderRadius: 12, flexShrink: 0,
              background: "linear-gradient(135deg, rgba(232,25,125,0.2), rgba(180,80,20,0.2))",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26
            }}>
              {s.img}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, fontSize: 13 }}>{s.name}</p>
              <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{s.desc}</p>
              <p style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>{s.duration}</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
              <p style={{ color: "var(--pink)", fontWeight: 700, fontSize: 13 }}>₱{s.price}</p>
              <div style={{
                width: 20, height: 20, borderRadius: "50%",
                border: `2px solid ${selected.includes(s.id) ? "var(--pink)" : "rgba(245,230,208,0.3)"}`,
                background: selected.includes(s.id) ? "var(--pink)" : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, color: "#fff"
              }}>
                {selected.includes(s.id) ? "✓" : ""}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: "12px 16px 20px" }}>
        <button className="btn-pink" onClick={onNext} disabled={selected.length === 0}>
          Continue {selected.length > 0 ? `(${selected.length} selected)` : ""}
        </button>
      </div>
    </div>
  );
}
