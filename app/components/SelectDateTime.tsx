"use client";
import { useState } from "react";
import { TIME_SLOTS } from "../data";

type Props = {
  selectedDate: string; selectedTime: string;
  onDateChange: (d: string) => void; onTimeChange: (t: string) => void;
  onNext: () => void; onBack: () => void;
};

const WDAYS  = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default function SelectDateTime({ selectedDate, selectedTime, onDateChange, onTimeChange, onNext, onBack }: Props) {
  // ── "Today" reference — past dates are not bookable ──
  const today        = new Date();
  const todayYear    = today.getFullYear();
  const todayMonth   = today.getMonth();   // 0-based
  const todayDate    = today.getDate();

  const [yr, setYr] = useState(todayYear);
  const [mo, setMo] = useState(todayMonth);

  const firstDay  = new Date(yr, mo, 1).getDay();
  const daysInMo  = new Date(yr, mo + 1, 0).getDate();
  const cells     = Array(firstDay).fill(null).concat(Array.from({ length: daysInMo }, (_, i) => i + 1));
  const mkDate    = (d: number) => `${MONTHS[mo]} ${d}, ${yr}`;

  // Is the given day in the currently-viewed month before today?
  const isPastDay = (d: number) => {
    if (yr < todayYear) return true;
    if (yr > todayYear) return false;
    if (mo < todayMonth) return true;
    if (mo > todayMonth) return false;
    return d < todayDate;
  };

  // Can we navigate to the previous month? (i.e. viewed month is after the current one)
  const canGoPrev = yr > todayYear || (yr === todayYear && mo > todayMonth);

  const prev = () => {
    if (!canGoPrev) return;
    if (mo === 0) { setMo(11); setYr(y => y-1); } else setMo(m => m-1);
  };
  const next = () => { if (mo === 11) { setMo(0); setYr(y => y+1); } else setMo(m => m+1); };

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
          <span onClick={onBack}>Services</span><span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-current">Date & Time</span>
        </div>

        {/* Step bar */}
        <div className="steps-bar">
          {["Select Services","Date & Time","Choose Stylist","Your Details","Confirm"].map((s,i) => (
            <div key={s} className="step-item">
              <div className={`step-num ${i === 0 ? "done" : i === 1 ? "active" : ""}`}>
                {i === 0 ? "✓" : i+1}
              </div>
              <span className={`step-label ${i === 0 ? "done" : i === 1 ? "active" : ""}`}>{s}</span>
              {i < 4 && <div className="step-line" />}
            </div>
          ))}
        </div>

        <h1 className="page-title">Select Date & Time</h1>
        <p className="page-subtitle">Pick a date and a time slot for your appointment</p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, alignItems: "start" }}>

          {/* Calendar */}
          <div className="card" style={{ padding: 28 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <button onClick={prev} disabled={!canGoPrev} style={{ background: "none", border: "none", color: canGoPrev ? "var(--gold)" : "rgba(201,168,76,0.25)", fontSize: 22, cursor: canGoPrev ? "pointer" : "not-allowed", padding: "4px 10px" }}>‹</button>
              <p style={{ fontWeight: 700, fontSize: 16, color: "var(--gold)" }}>{MONTHS[mo]} {yr}</p>
              <button onClick={next} style={{ background: "none", border: "none", color: "var(--gold)", fontSize: 22, cursor: "pointer", padding: "4px 10px" }}>›</button>
            </div>
            {/* Day headers */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", marginBottom: 8 }}>
              {WDAYS.map(d => (
                <div key={d} style={{ textAlign: "center", fontSize: 12, fontWeight: 700, color: "rgba(201,168,76,0.6)", padding: "6px 0" }}>{d}</div>
              ))}
            </div>
            {/* Days */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
              {cells.map((day, i) => {
                const past = day ? isPastDay(day) : false;
                return (
                  <div key={i}
                    className={`cal-day ${!day ? "empty" : ""} ${day && !past && mkDate(day) === selectedDate ? "sel" : ""} ${past ? "past" : ""}`}
                    style={!day ? { pointerEvents: "none" } : past ? { pointerEvents: "none", opacity: 0.28, cursor: "not-allowed" } : undefined}
                    onClick={() => { if (day && !past) onDateChange(mkDate(day)); }}>
                    {day || ""}
                  </div>
                );
              })}
            </div>
            {selectedDate && (
              <div style={{ marginTop: 16, padding: "10px 14px", background: "rgba(232,25,125,0.1)", borderRadius: 10, border: "1px solid rgba(232,25,125,0.2)" }}>
                <p style={{ fontSize: 13, color: "var(--pink)", fontWeight: 600 }}>📅 {selectedDate}</p>
              </div>
            )}
          </div>

          {/* Time slots + action */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div className="card" style={{ padding: 28 }}>
              <p style={{ fontWeight: 700, fontSize: 14, color: "var(--gold)", marginBottom: 16 }}>Available Time Slots</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
                {TIME_SLOTS.map(t => (
                  <div key={t} className={`time-slot ${selectedTime === t ? "sel" : ""}`} onClick={() => onTimeChange(t)}>{t}</div>
                ))}
              </div>
              {selectedTime && (
                <div style={{ marginTop: 16, padding: "10px 14px", background: "rgba(232,25,125,0.1)", borderRadius: 10, border: "1px solid rgba(232,25,125,0.2)" }}>
                  <p style={{ fontSize: 13, color: "var(--pink)", fontWeight: 600 }}>🕐 {selectedTime}</p>
                </div>
              )}
            </div>

            {/* Summary + continue */}
            <div className="card" style={{ padding: 24 }}>
              <p style={{ fontWeight: 700, fontSize: 14, color: "var(--gold)", marginBottom: 16 }}>Selection Summary</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)", fontSize: 13 }}>Date</span>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{selectedDate || "—"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)", fontSize: 13 }}>Time</span>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{selectedTime || "—"}</span>
                </div>
              </div>
              <button className="btn-pink wide" onClick={onNext} disabled={!selectedDate || !selectedTime} style={{ borderRadius: 10 }}>
                Continue to Choose Stylist
              </button>
              <button className="btn-ghost wide" onClick={onBack} style={{ marginTop: 10 }}>
                ‹ Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
