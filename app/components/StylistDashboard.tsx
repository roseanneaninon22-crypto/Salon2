"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import SalonLogo from "./SalonLogo";

type StylistProfile = { id: string; name: string; role: string; img: string | null; photo_url?: string | null; rating?: number | null; rating_count?: number | null };
type Appointment = {
  id: string;
  customer_name: string;
  customer_phone: string;
  services: string;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  total: number;
  payment_method?: string;
  notes: string;
  rated?: boolean;
  service_rating?: number | null;
  stylist_rating?: number | null;
  review_text?: string | null;
};

type Props = { onLogout: () => void; userName: string };
type DashboardTab = "Bookings" | "Ratings" | "Payments";

const nextStatus: Record<Appointment["status"], { label: string; status: Appointment["status"] } | null> = {
  pending: { label: "Confirm appointment", status: "confirmed" },
  confirmed: { label: "Mark completed", status: "completed" },
  completed: null,
  cancelled: null,
};

export default function StylistDashboard({ onLogout, userName }: Props) {
  const [stylist, setStylist] = useState<StylistProfile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<DashboardTab>("Bookings");

  const loadDashboard = useCallback(async () => {
    setError("");
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      setError("Your session could not be verified. Sign in again.");
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("stylists")
      .select("id, name, role, img, photo_url, rating, rating_count")
      .eq("user_id", user.id)
      .maybeSingle();
    if (profileError || !profile) {
      setError(profileError?.message ?? "Your stylist profile could not be found. Ask the salon admin to check your account.");
      setLoading(false);
      return;
    }

    setStylist(profile);
    const { data, error: appointmentsError } = await supabase
      .from("bookings")
      .select("id, customer_name, customer_phone, services, date, time, status, total, payment_method, notes, rated, service_rating, stylist_rating, review_text")
      .eq("stylist_id", profile.id)
      .order("created_at", { ascending: true });
    if (appointmentsError) setError(`Could not load appointments: ${appointmentsError.message}`);
    else setAppointments((data ?? []) as Appointment[]);
    setLoading(false);
  }, []);

  useEffect(() => { void loadDashboard(); }, [loadDashboard]);

  const changeStatus = async (appointment: Appointment) => {
    const action = nextStatus[appointment.status];
    if (!action) return;
    setSavingId(appointment.id);
    const { error: updateError } = await supabase
      .from("bookings")
      .update({ status: action.status })
      .eq("id", appointment.id);
    if (updateError) setError(`Could not update appointment: ${updateError.message}`);
    else setAppointments(current => current.map(item => item.id === appointment.id ? { ...item, status: action.status } : item));
    setSavingId(null);
  };

  const pending = appointments.filter(item => item.status === "pending").length;
  const upcoming = appointments.filter(item => item.status === "confirmed").length;
  const completed = appointments.filter(item => item.status === "completed").length;
  const completedValue = appointments
    .filter(item => item.status === "completed")
    .reduce((sum, item) => sum + Number(item.total || 0), 0);
  const scheduledValue = appointments
    .filter(item => item.status === "pending" || item.status === "confirmed")
    .reduce((sum, item) => sum + Number(item.total || 0), 0);
  const rating = Number(stylist?.rating ?? 0);
  const ratingCount = Number(stylist?.rating_count ?? 0);

  return (
    <div className="stylist-dashboard-layout">
      <aside className="stylist-sidebar">
        <div className="stylist-sidebar-brand"><SalonLogo /></div>
        <div className="stylist-sidebar-label">PERSONAL WORKSPACE</div>
        <nav className="stylist-sidebar-nav" aria-label="Stylist dashboard">
          {([ ["Bookings", "▣"], ["Ratings", "★"], ["Payments", "₱"] ] as [DashboardTab, string][]).map(([tab, icon]) => (
            <button key={tab} type="button" onClick={() => setActiveTab(tab)} aria-current={activeTab === tab ? "page" : undefined}
              className={`stylist-sidebar-item ${activeTab === tab ? "active" : ""}`}>
              <span aria-hidden="true">{icon}</span>{tab}
            </button>
          ))}
        </nav>
        <button type="button" onClick={onLogout} className="stylist-sidebar-item stylist-sidebar-logout"><span aria-hidden="true">↪</span>Log out</button>
      </aside>

      <main className="stylist-dashboard-main">
        <header className="stylist-dashboard-header">
          <div>
            <p>STYLIST WORKSPACE</p>
            <h1>{activeTab === "Bookings" ? "My Bookings" : activeTab}</h1>
          </div>
          {activeTab === "Bookings" && <button onClick={() => { setLoading(true); void loadDashboard(); }} className="btn-outline" style={{ padding: "8px 14px", fontSize: 12 }}>Refresh</button>}
        </header>

      <section className="stylist-dashboard-content">

        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
          <div style={{ width: 52, height: 52, borderRadius: "50%", overflow: "hidden", display: "grid", placeItems: "center", background: "rgba(232,25,125,.15)", fontSize: 26 }}>
            {stylist?.photo_url ? <img src={stylist.photo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : stylist?.img || "✂️"}
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 20 }}>{stylist?.name ?? userName}</h2>
            <p style={{ margin: "4px 0 0", color: "rgba(255,255,255,.55)", fontSize: 13 }}>{stylist?.role ?? "Stylist"}</p>
          </div>
        </div>

        {error && <p role="alert" style={{ padding: 12, borderRadius: 10, background: "rgba(244,67,54,.12)", color: "#ff8a80", marginBottom: 18 }}>{error}</p>}

        {activeTab === "Bookings" && <>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 24 }}>
          {[["Needs your attention", pending], ["Upcoming", upcoming], ["Completed", completed]].map(([label, value]) => (
            <div key={String(label)} style={{ padding: 18, borderRadius: 14, background: "rgba(255,255,255,.045)", border: "1px solid rgba(255,255,255,.08)" }}>
              <p style={{ color: "var(--pink)", fontWeight: 800, fontSize: 24, margin: 0 }}>{loading ? "…" : value}</p>
              <p style={{ color: "rgba(255,255,255,.6)", fontSize: 12, margin: "6px 0 0" }}>{label}</p>
            </div>
          ))}
        </div>

        <h2 style={{ fontSize: 18, margin: "0 0 14px" }}>Appointments</h2>
        {loading ? <p style={{ color: "rgba(255,255,255,.55)", padding: 24 }}>Loading appointments…</p> : appointments.length === 0 ? (
          <div style={{ padding: 28, borderRadius: 14, background: "rgba(255,255,255,.035)", color: "rgba(255,255,255,.55)", textAlign: "center" }}>No appointments assigned to you yet.</div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {appointments.map(appointment => {
              const action = nextStatus[appointment.status];
              return (
                <article key={appointment.id} style={{ padding: 18, borderRadius: 14, background: "rgba(255,255,255,.045)", border: "1px solid rgba(255,255,255,.08)" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
                    <div>
                      <p style={{ fontWeight: 750, margin: 0 }}>{appointment.customer_name}</p>
                      <p style={{ color: "rgba(255,255,255,.6)", fontSize: 13, margin: "5px 0" }}>{appointment.services}</p>
                      <p style={{ color: "rgba(255,255,255,.5)", fontSize: 12, margin: 0 }}>{appointment.date} · {appointment.time} · ₱{Number(appointment.total || 0).toLocaleString()}</p>
                      {appointment.notes && <p style={{ color: "rgba(255,255,255,.45)", fontSize: 12, margin: "8px 0 0" }}>Notes: {appointment.notes}</p>}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ padding: "5px 9px", borderRadius: 20, textTransform: "capitalize", background: "rgba(232,25,125,.12)", color: "#ff8ab9", fontSize: 11 }}>{appointment.status}</span>
                      {action && <button className="btn-pink" disabled={savingId === appointment.id} onClick={() => void changeStatus(appointment)} style={{ padding: "8px 12px", fontSize: 12 }}>
                        {savingId === appointment.id ? "Saving…" : action.label}
                      </button>}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
        </>}

        {activeTab === "Ratings" && (
          <section aria-labelledby="stylist-ratings-title" style={{ padding: 24, borderRadius: 16, background: "rgba(255,255,255,.045)", border: "1px solid rgba(255,255,255,.08)" }}>
            <h2 id="stylist-ratings-title" style={{ fontSize: 18, margin: "0 0 20px" }}>My Ratings</h2>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 24 }}>
              <div>
                <p style={{ color: "var(--gold)", fontSize: 40, fontWeight: 850, margin: 0 }}>{loading ? "…" : rating.toFixed(1)} <span style={{ fontSize: 23 }}>★</span></p>
                <p style={{ color: "rgba(255,255,255,.55)", fontSize: 13, margin: "6px 0 0" }}>Average customer rating</p>
              </div>
              <div style={{ width: 1, height: 52, background: "rgba(255,255,255,.12)" }} />
              <div>
                <p style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>{loading ? "…" : ratingCount}</p>
                <p style={{ color: "rgba(255,255,255,.55)", fontSize: 13, margin: "6px 0 0" }}>Ratings received</p>
              </div>
            </div>
            {!loading && ratingCount === 0 && <p style={{ color: "rgba(255,255,255,.5)", fontSize: 13, margin: "24px 0 0" }}>You have no customer ratings yet. Ratings will appear here after customers review completed appointments.</p>}
            <div style={{ display: "grid", gap: 12, marginTop: 22 }}>
              {appointments.filter(item => item.rated && item.review_text).map(item => (
                <article key={item.id} style={{ padding: 16, borderRadius: 12, background: "rgba(0,0,0,.2)", border: "1px solid rgba(255,255,255,.08)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <strong>{item.customer_name}</strong><span style={{ color: "var(--gold)", fontSize: 13 }}>Service {item.service_rating}/5 · Stylist {item.stylist_rating}/5</span>
                  </div>
                  <p style={{ color: "rgba(255,255,255,.55)", fontSize: 12, margin: "6px 0" }}>{item.services} · {item.date}</p>
                  <p style={{ margin: "10px 0 0", lineHeight: 1.55 }}>{item.review_text}</p>
                </article>
              ))}
            </div>
          </section>
        )}

        {activeTab === "Payments" && (
          <section aria-labelledby="stylist-payments-title">
            <h2 id="stylist-payments-title" style={{ fontSize: 18, margin: "0 0 8px" }}>Payments</h2>
            <p style={{ color: "rgba(255,255,255,.5)", fontSize: 12, margin: "0 0 16px" }}>Service totals based on appointment records; this page does not confirm that a payment was collected.</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 14, marginBottom: 20 }}>
              <div style={{ padding: 18, borderRadius: 14, background: "rgba(255,255,255,.045)", border: "1px solid rgba(255,255,255,.08)" }}>
                <p style={{ color: "var(--pink)", fontWeight: 800, fontSize: 24, margin: 0 }}>{loading ? "…" : `₱${completedValue.toLocaleString()}`}</p>
                <p style={{ color: "rgba(255,255,255,.6)", fontSize: 12, margin: "6px 0 0" }}>Completed appointment value</p>
              </div>
              <div style={{ padding: 18, borderRadius: 14, background: "rgba(255,255,255,.045)", border: "1px solid rgba(255,255,255,.08)" }}>
                <p style={{ color: "var(--gold)", fontWeight: 800, fontSize: 24, margin: 0 }}>{loading ? "…" : `₱${scheduledValue.toLocaleString()}`}</p>
                <p style={{ color: "rgba(255,255,255,.6)", fontSize: 12, margin: "6px 0 0" }}>Scheduled appointment value</p>
              </div>
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              {appointments.filter(item => item.status === "completed").map(item => (
                <article key={item.id} style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 12, padding: 16, borderRadius: 12, background: "rgba(255,255,255,.045)", border: "1px solid rgba(255,255,255,.08)" }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700 }}>{item.customer_name}</p>
                    <p style={{ margin: "5px 0 0", color: "rgba(255,255,255,.55)", fontSize: 12 }}>{item.services} · {item.date}</p>
                  </div>
                  <p style={{ margin: 0, color: "var(--gold)", fontWeight: 800 }}>₱{Number(item.total || 0).toLocaleString()}</p>
                </article>
              ))}
              {!loading && completed === 0 && <p style={{ color: "rgba(255,255,255,.5)", padding: 22, textAlign: "center" }}>Completed appointment totals will appear here.</p>}
            </div>
          </section>
        )}
      </section>
      </main>
    </div>
  );
}
