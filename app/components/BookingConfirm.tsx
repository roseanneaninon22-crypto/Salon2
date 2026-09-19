"use client";
import { useEffect, useRef } from "react";
import { SERVICES, STYLISTS, saveBooking } from "../data";

type Props = {
  serviceIds: number[]; stylistId: number | null;
  date: string; time: string;
  customerName: string; customerPhone: string; customerNotes: string;
  onDone: () => void; onNewBooking: () => void;
};

export default function BookingConfirm({ serviceIds, stylistId, date, time, customerName, customerPhone, customerNotes, onDone, onNewBooking }: Props) {
  const saved = useRef(false);

  const services = SERVICES.filter(s => serviceIds.includes(s.id));
  const stylist  = stylistId ? STYLISTS.find(s => s.id === stylistId) : null;
  const total    = services.reduce((sum, s) => sum + s.price, 0);

  useEffect(() => {
    if (saved.current) return;
    saved.current = true;
    saveBooking({ customer: customerName, phone: customerPhone, serviceIds, stylistId, date, time, notes: customerNotes });
  }, []);

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
      </nav>

      <div className="page-content" style={{ display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 60 }}>
        <div style={{ width: "100%", maxWidth: 680 }}>

          {/* Success header */}
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{
              width: 80, height: 80, borderRadius: "50%", margin: "0 auto 20px",
              background: "rgba(76,175,80,0.15)", border: "3px solid #4caf50",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ fontSize: 36, color: "#4caf50" }}>✓</span>
            </div>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: "#4caf50", marginBottom: 8 }}>Booking Submitted!</h1>
            <p style={{ fontSize: 15, color: "var(--text-muted)" }}>
              Your appointment is <span style={{ color: "#ffc107", fontWeight: 700 }}>pending approval</span> from your stylist.
              We'll notify you once it's confirmed.
            </p>
          </div>

          {/* Details card */}
          <div className="card" style={{ padding: 32, marginBottom: 24 }}>
            <p style={{ fontWeight: 700, fontSize: 13, color: "var(--gold)", letterSpacing: 1, marginBottom: 20 }}>BOOKING DETAILS</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
              {[
                ["Services",  services.map(s => s.name).join(", ")],
                ["Stylist",   stylist ? stylist.name : "Any available"],
                ["Date",      date],
                ["Time",      time],
                ["Customer",  customerName],
                ["Phone",     customerPhone],
              ].map(([label, value]) => (
                <div key={label} style={{ padding: "12px 0", borderBottom: "1px solid rgba(201,168,76,0.08)" }}>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>{label}</p>
                  <p style={{ fontSize: 14, fontWeight: 600 }}>{value}</p>
                </div>
              ))}
            </div>

            <div className="divider" />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Status</p>
                <span className="badge badge-pending">pending approval</span>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Total Amount</p>
                <p style={{ fontSize: 28, fontWeight: 800, color: "var(--pink)" }}>₱{total}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 16 }}>
            <button className="btn-pink" onClick={onDone} style={{ flex: 1, padding: "14px", fontSize: 15, borderRadius: 10 }}>
              📋 View My Bookings
            </button>
            <button className="btn-outline" onClick={onNewBooking} style={{ flex: 1, padding: "14px", fontSize: 15, borderRadius: 10 }}>
              + Book Another Appointment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
