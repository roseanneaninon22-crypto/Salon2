"use client";
import { useState } from "react";
import { TIME_SLOTS } from "../data";

type Props = {
  selectedDate: string; selectedTime: string;
  onDateChange: (d: string) => void; onTimeChange: (t: string) => void;
  onNext: () => void; onBack: () => void;
};

const WDAYS = ["Su","Mo","Tu","We","Th","Fr","Sa"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default function SelectDateTime({ selectedDate, selectedTime, onDateChange, onTimeChange, onNext, onBack }: Props) {
  const [yr, setYr] = useState(2026);
  const [mo, setMo] = useState(8);

  const firstDay = new Date(yr, mo, 1).getDay();
  const daysInMo = new Date(yr, mo + 1, 0).getDate();
  const cells = Array(firstDay).fill(null).concat(Array.from({ length: daysInMo }, (_, i) => i + 1));

  const mkDate = (d: number) => `${MONTHS[mo]} ${d}, ${yr}`;
  const prev = () => mo === 0 ? (setMo(11), setYr(y => y - 1)) : setMo(m => m - 1);
  const next = () => mo === 11 ? (setMo(0), setYr(y => y + 1)) : setMo(m => m + 1);

  return (
    <div className="page">
      <div className="top-bar">
        <div className="back-btn" onClick={onBack}>‹</div>
        <p style={{ fontWeight: 700, fontSize: 16 }}>Select Date & Time</p>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "8px 16px 16px", display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Calendar */}
        <div className="card" style={{ padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <button onClick={prev} style={{ background: "none", border: "none", color: "var(--gold)", fontSize: 20, cursor: "pointer" }}>‹</button>
            <p style={{ fontWeight: 700, fontSize: 13, color: "var(--gold)" }}>{MONTHS[mo]} {yr}</p>
            <button onClick={next} style={{ background: "none", border: "none", color: "var(--gold)", fontSize: 20, cursor: "pointer" }}>›</button>
          </div>
          {/* Day headers */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", marginBottom: 6 }}>
            {WDAYS.map(d => <div key={d} style={{ textAlign: "center", fontSize: 11, fontWeight: 700, color: "rgba(201,168,76,0.6)" }}>{d}</div>)}
          </div>
          {/* Days */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2 }}>
            {cells.map((day, i) => (
              <div key={i} className={`cal-day ${!day ? "empty" : ""} ${day && mkDate(day) === selectedDate ? "sel" : ""}`}
                onClick={() => day && onDateChange(mkDate(day))}>
                {day || ""}
              </div>
            ))}
          </div>
        </div>

        {/* Time slots */}
        <div>
          <p style={{ fontWeight: 700, fontSize: 13, color: "var(--gold)", marginBottom: 10 }}>Available Time</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
            {TIME_SLOTS.map(t => (
              <div key={t} className={`time-slot ${selectedTime === t ? "sel" : ""}`} onClick={() => onTimeChange(t)}>{t}</div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: "12px 16px 20px" }}>
        <button className="btn-pink" onClick={onNext} disabled={!selectedDate || !selectedTime}>
          Continue
        </button>
      </div>
    </div>
  );
}
