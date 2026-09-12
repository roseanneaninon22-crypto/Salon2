"use client";
import { SERVICES, STYLISTS } from "../data";

type Props = {
  serviceIds: number[]; stylistId: number | null;
  date: string; time: string; customerName: string;
  onDone: () => void; onNewBooking: () => void;
};

export default function BookingConfirm({ serviceIds, stylistId, date, time, customerName, onDone, onNewBooking }: Props) {
  const services = SERVICES.filter(s => serviceIds.includes(s.id));
  const stylist = stylistId ? STYLISTS.find(s => s.id === stylistId) : null;

  const rows = [
    ["Service", services.map(s => s.name).join(", ")],
    ["Stylist", stylist ? stylist.name : "Any available"],
    ["Date", date],
    ["Time", time],
    ["Customer", customerName],
  ];

  return (
    <div className="page" style={{ alignItems: "center", justifyContent: "center", padding: "0 20px" }}>
      <div className="card" style={{ width: "100%", padding: 24, textAlign: "center" }}>
        {/* Check icon */}
        <div style={{
          width: 64, height: 64, borderRadius: "50%", margin: "0 auto 14px",
          background: "rgba(76,175,80,0.15)", border: "2px solid #4caf50",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <span style={{ fontSize: 28, color: "#4caf50" }}>✓</span>
        </div>
        <p style={{ fontSize: 20, fontWeight: 800, color: "#4caf50", marginBottom: 4 }}>Booking Confirmed!</p>
        <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 20 }}>Your appointment has been booked successfully</p>

        {/* Details */}
        <div style={{ textAlign: "left", marginBottom: 20 }}>
          {rows.map(([label, value]) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(201,168,76,0.08)" }}>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{label}</span>
              <span style={{ fontSize: 12, fontWeight: 600, maxWidth: "60%", textAlign: "right" }}>{value}</span>
            </div>
          ))}
        </div>

        <button className="btn-pink" onClick={onDone} style={{ marginBottom: 10 }}>View My Bookings</button>
        <button className="btn-outline" onClick={onNewBooking}>Book Another Appointment</button>
      </div>
    </div>
  );
}
