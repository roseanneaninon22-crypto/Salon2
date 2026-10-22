"use client";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { SERVICES, STYLISTS, CATEGORIES } from "../data";

type Props = { onLogout: () => void };

type Booking = {
  id: string;
  customer_name: string;
  customer_phone: string;
  services: string;
  stylist: string;
  date: string;
  time: string;
  status: string;
  total: number;
  notes: string;
};

type Stylist = { id: string; name: string; role: string; rating: number; img: string; photo_url?: string };

type DBService = { id: string; name: string; category: string; duration: string; price: number; img: string; };

const MENU = [
  { icon: "▣", label: "Dashboard" },
  { icon: "📅", label: "Appointments" },
  { icon: "👥", label: "Customers" },
  { icon: "✂️", label: "Services" },
  { icon: "👩", label: "Stylists" },
  { icon: "💳", label: "Payments" },
  { icon: "⭐", label: "Reviews" },
  { icon: "⚙️", label: "Settings" },
  { icon: "🚪", label: "Logout" },
];

const WDAYS = ["Su","Mo","Tu","We","Th","Fr","Sa"];
const SEP_FIRST = 2;
const SEP_DAYS = 30;
const cells = Array(SEP_FIRST).fill(null).concat(Array.from({ length: SEP_DAYS }, (_, i) => i + 1));

export default function AdminDashboard({ onLogout }: Props) {
  const [active, setActive] = useState("Dashboard");
  const [sideOpen, setSideOpen] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customers, setCustomers] = useState<{id:string; full_name:string; email:string; phone:string; role:string; created_at:string}[]>([]);
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [stylistLoadError, setStylistLoadError] = useState("");
  const [loading, setLoading] = useState(true);
  const [stylistLoading, setStylistLoading] = useState(false);
  const [dbServices, setDbServices] = useState<DBService[]>([]);
  const [showAddStylist, setShowAddStylist] = useState(false);
  const [newStylist, setNewStylist] = useState({ name: "", role: "", img: "👩", email: "", password: "" });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [showAddService, setShowAddService] = useState(false);
  const [newService, setNewService] = useState({ name: "", category: "Hair", duration: "", price: "", img: "✂️" });
  const [serviceError, setServiceError] = useState("");
  const [activeSvcCat, setActiveSvcCat] = useState("Hair");

  const fetchBookings = async () => {
    setLoading(true);
    const [{ data: bData, error: bErr }, { data: cData }, { data: sData, error: sErr }, { data: svData, error: svErr }] = await Promise.all([
      supabase.from("bookings").select("*").order("created_at", { ascending: false }),
      supabase.from("users").select("*").eq("role", "user").order("created_at", { ascending: false }),
      supabase.from("stylists").select("*").order("created_at", { ascending: true }),
      supabase.from("services").select("*").order("created_at", { ascending: true }),
    ]);
    if (bErr) console.error("bookings error:", bErr);
    if (svErr) console.error("services error:", svErr);
    setBookings(bData ?? []);
    setCustomers(cData ?? []);
    setStylists(sData ?? []);
    setStylistLoadError(sErr?.message ?? "");
    // If Supabase services table is empty or missing, fall back to static data
    setDbServices(svData && svData.length > 0 ? svData : SERVICES.map(s => ({
      id: String(s.id),
      name: s.name,
      category: s.category,
      duration: s.duration,
      price: s.price,
      img: s.img,
    })));
    setLoading(false);
  };

  useEffect(() => { fetchBookings(); }, []);

  const [addError, setAddError] = useState("");

  const addService = async () => {
    if (!newService.name || !newService.duration || !newService.price) return;
    setServiceError("");
    const { data, error } = await supabase.from("services").insert({
      name: newService.name,
      category: newService.category,
      duration: newService.duration,
      price: parseFloat(newService.price),
      img: newService.img,
    }).select().single();
    if (error) {
      console.error("addService error:", error);
      setServiceError(error.message);
      return;
    }
    if (data) setDbServices(prev => [...prev, data]);
    setNewService({ name: "", category: "Hair", duration: "", price: "", img: "✂️" });
    setShowAddService(false);
  };

  const deleteService = async (id: string) => {
    if (!confirm("Delete this service?")) return;
    await supabase.from("services").delete().eq("id", id);
    setDbServices(prev => prev.filter(s => s.id !== id));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const addStylist = async () => {
    if (!newStylist.name || !newStylist.role || !newStylist.email || !newStylist.password) return;
    setStylistLoading(true);
    setAddError("");

    // Upload photo if provided
    let photo_url: string | null = null;
    if (photoFile) {
      const ext = photoFile.name.split(".").pop();
      const fileName = `${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("stylist-photos")
        .upload(fileName, photoFile, { upsert: true });
      if (!upErr) {
        const { data: urlData } = supabase.storage.from("stylist-photos").getPublicUrl(fileName);
        photo_url = urlData.publicUrl;
      }
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setAddError("Your admin session expired. Log in again, then retry.");
      setStylistLoading(false);
      return;
    }

    let response: Response;
    try {
      response = await fetch("/api/admin/stylists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          name: newStylist.name,
          role: newStylist.role,
          email: newStylist.email,
          password: newStylist.password,
          img: newStylist.img,
          photo_url,
        }),
      });
    } catch {
      setAddError("Could not reach the server. Check your connection and try again.");
      setStylistLoading(false);
      return;
    }
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      setAddError(result.error ?? "Could not create the stylist account. Please try again.");
      setStylistLoading(false);
      return;
    }
    const data = result.stylist as Stylist | undefined;
    if (!data) {
      setAddError("The account was created, but the stylist profile was not returned.");
      setStylistLoading(false);
      return;
    }
    setStylists(prev => [...prev, data]);
    setNewStylist({ name: "", role: "", img: "👩", email: "", password: "" });
    setPhotoFile(null);
    setPhotoPreview(null);
    setShowAddStylist(false);
    setStylistLoading(false);
  };

  const deleteStylist = async (id: string) => {
    if (!confirm("Delete this stylist?")) return;
    await supabase.from("stylists").delete().eq("id", id);
    setStylists(prev => prev.filter(s => s.id !== id));
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (error) {
      window.alert(`Could not update appointment: ${error.message}`);
      return;
    }
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  };

  const deleteBooking = async (id: string) => {
    const { error } = await supabase.from("bookings").delete().eq("id", id);
    if (error) {
      window.alert(`Could not delete appointment: ${error.message}`);
      return;
    }
    setBookings(prev => prev.filter(b => b.id !== id));
  };

  const go = (label: string) => {
    if (label === "Logout") { onLogout(); return; }
    setActive(label);
  };

  const totalRevenue = bookings.reduce((s, b) => s + (b.total ?? 0), 0);
  const uniqueCustomers = customers.length;

  const stats = [
    { label: "Total Appointments", value: bookings.length.toString(), color: "#e8197d", icon: "📅" },
    { label: "Pending", value: bookings.filter(b => b.status === "pending").length.toString(), color: "#ffc107", icon: "⏳" },
    { label: "Total Customers", value: uniqueCustomers.toString(), color: "#2196f3", icon: "👥" },
    { label: "Total Revenue", value: `₱${totalRevenue.toLocaleString()}`, color: "#4caf50", icon: "💰" },
  ];

  return (
    <div className="admin-wrap">
      {sideOpen && (
        <div className="admin-side">
          <div style={{ padding: "16px 18px 12px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(232,25,125,0.2)", border: "1.5px solid var(--pink)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>💇</div>
              <div>
                <p style={{ fontSize: 12, fontWeight: 800, color: "var(--pink)" }}>Rossey Girl</p>
                <p style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: 1 }}>SALON</p>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#e8197d,#b5105e)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>A</div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: "#fff" }}>Admin User</p>
                <p style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>Administrator</p>
              </div>
            </div>
          </div>
          {MENU.map(m => (
            <div key={m.label} className={`admin-side-item ${active === m.label ? "on" : ""}`} onClick={() => go(m.label)}>
              <span style={{ fontSize: 14 }}>{m.icon}</span>
              <span>{m.label}</span>
            </div>
          ))}
        </div>
      )}

      <div className="admin-main">
        <div className="admin-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={() => setSideOpen(o => !o)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", fontSize: 18, cursor: "pointer" }}>☰</button>
            <p style={{ fontWeight: 700, fontSize: 15 }}>{active}</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button onClick={fetchBookings} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", fontSize: 16, cursor: "pointer" }} title="Refresh">🔄</button>
            <span style={{ fontSize: 16, cursor: "pointer", color: "rgba(255,255,255,0.5)" }}>🔔</span>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#e8197d,#b5105e)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>A</div>
          </div>
        </div>

        <div style={{ padding: 20 }}>

          {/* ── DASHBOARD ── */}
          {active === "Dashboard" && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
                {stats.map(s => (
                  <div key={s.label} className="stat-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={{ fontSize: 20 }}>{s.icon}</span>
                    </div>
                    <p style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{loading ? "..." : s.value}</p>
                    <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 3 }}>{s.label}</p>
                  </div>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 16 }}>
                <div className="stat-card" style={{ padding: 16 }}>
                  <p style={{ fontWeight: 700, fontSize: 13, color: "var(--gold)", marginBottom: 12 }}>Recent Appointments</p>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                    <thead>
                      <tr style={{ color: "rgba(255,255,255,0.35)" }}>
                        {["Customer","Service","Stylist","Date","Time","Status"].map(h => (
                          <th key={h} style={{ textAlign: "left", paddingBottom: 8, paddingRight: 10, fontWeight: 600 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr><td colSpan={6} style={{ padding: 20, textAlign: "center", color: "rgba(255,255,255,0.3)" }}>Loading...</td></tr>
                      ) : bookings.length === 0 ? (
                        <tr><td colSpan={6} style={{ padding: 20, textAlign: "center", color: "rgba(255,255,255,0.3)" }}>No bookings yet</td></tr>
                      ) : bookings.slice(0, 5).map(b => (
                        <tr key={b.id} style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                          <td style={{ padding: "8px 10px 8px 0" }}>{b.customer_name}</td>
                          <td style={{ padding: "8px 10px 8px 0" }}>{b.services}</td>
                          <td style={{ padding: "8px 10px 8px 0" }}>{b.stylist?.split(" ")[0]}</td>
                          <td style={{ padding: "8px 10px 8px 0" }}>{b.date}</td>
                          <td style={{ padding: "8px 10px 8px 0" }}>{b.time}</td>
                          <td style={{ padding: "8px 0" }}><span className={`badge badge-${b.status}`}>{b.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="stat-card" style={{ padding: 16 }}>
                  <p style={{ fontWeight: 700, fontSize: 13, color: "var(--gold)", marginBottom: 12 }}>September 2026</p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", marginBottom: 6 }}>
                    {WDAYS.map(d => <div key={d} style={{ textAlign: "center", fontSize: 10, fontWeight: 700, color: "rgba(201,168,76,0.55)" }}>{d}</div>)}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2 }}>
                    {cells.map((day, i) => (
                      <div key={i} className={`cal-day ${day === 10 ? "sel" : ""}`} style={{ fontSize: 11 }}>{day || ""}</div>
                    ))}
                  </div>
                  <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 6 }}>
                    {bookings.slice(0, 3).map(b => (
                      <div key={b.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                        <span style={{ color: "rgba(255,255,255,0.6)" }}>{b.customer_name}</span>
                        <span className={`badge badge-${b.status}`}>{b.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── APPOINTMENTS ── */}
          {active === "Appointments" && (
            <div className="stat-card" style={{ padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <p style={{ fontWeight: 700, color: "var(--gold)" }}>All Appointments</p>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{bookings.length} total</span>
              </div>
              {loading ? (
                <p style={{ textAlign: "center", padding: 30, color: "rgba(255,255,255,0.3)" }}>Loading...</p>
              ) : bookings.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <p style={{ fontSize: 32, marginBottom: 10 }}>📋</p>
                  <p style={{ color: "var(--text-muted)", fontSize: 13 }}>No bookings yet</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {bookings.map(b => (
                    <div key={b.id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "12px 14px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                        <div>
                          <p style={{ fontWeight: 700, fontSize: 13 }}>{b.customer_name}</p>
                          <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{b.services}</p>
                          <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{b.stylist}</p>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                          <span className={`badge badge-${b.status}`}>{b.status}</span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--pink)" }}>₱{b.total}</span>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 12, fontSize: 11, color: "var(--text-muted)", marginBottom: 10 }}>
                        <span>📅 {b.date}</span>
                        <span>🕐 {b.time}</span>
                        {b.customer_phone && <span>📱 {b.customer_phone}</span>}
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        {b.status === "pending" && (
                          <button onClick={() => updateStatus(b.id, "confirmed")}
                            style={{ flex: 1, padding: "7px 0", borderRadius: 8, background: "linear-gradient(135deg,#4caf50,#388e3c)", border: "none", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                            ✓ Approve
                          </button>
                        )}
                        {b.status === "pending" && (
                          <button onClick={() => updateStatus(b.id, "cancelled")}
                            style={{ flex: 1, padding: "7px 0", borderRadius: 8, background: "rgba(244,67,54,0.12)", border: "1px solid rgba(244,67,54,0.35)", color: "#f44336", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                            ✕ Cancel
                          </button>
                        )}
                        {b.status === "confirmed" && (
                          <button onClick={() => updateStatus(b.id, "completed")}
                            style={{ flex: 1, padding: "7px 0", borderRadius: 8, background: "linear-gradient(135deg,#2196f3,#1565c0)", border: "none", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                            Complete Appointment
                          </button>
                        )}
                        {b.status !== "confirmed" && (
                        <button onClick={() => deleteBooking(b.id)}
                          style={{ padding: "7px 12px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)", fontSize: 12, cursor: "pointer" }}>
                          🗑️
                        </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── CUSTOMERS ── */}
          {active === "Customers" && (
            <div className="stat-card" style={{ padding: 16 }}>
              <p style={{ fontWeight: 700, color: "var(--gold)", marginBottom: 14 }}>Customers ({customers.length})</p>
              {loading ? (
                <p style={{ textAlign: "center", padding: 30, color: "rgba(255,255,255,0.3)" }}>Loading...</p>
              ) : customers.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <p style={{ fontSize: 32, marginBottom: 10 }}>👥</p>
                  <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>No registered customers yet</p>
                </div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr style={{ color: "rgba(255,255,255,0.35)" }}>
                      {["#","Full Name","Email","Phone","Role","Joined"].map(h => (
                        <th key={h} style={{ textAlign: "left", paddingBottom: 10, paddingRight: 14, fontWeight: 600 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((c, i) => (
                      <tr key={c.id} style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                        <td style={{ padding: "10px 14px 10px 0", color: "rgba(255,255,255,0.3)" }}>{i + 1}</td>
                        <td style={{ padding: "10px 14px 10px 0", fontWeight: 600 }}>{c.full_name}</td>
                        <td style={{ padding: "10px 14px 10px 0", color: "rgba(255,255,255,0.6)" }}>{c.email}</td>
                        <td style={{ padding: "10px 14px 10px 0", color: "rgba(255,255,255,0.6)" }}>{c.phone || "—"}</td>
                        <td style={{ padding: "10px 14px 10px 0" }}>
                          <span style={{
                            padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                            background: c.role === "admin" ? "rgba(232,25,125,0.2)" : "rgba(33,150,243,0.2)",
                            color: c.role === "admin" ? "var(--pink)" : "#2196f3",
                          }}>{c.role ?? "user"}</span>
                        </td>
                        <td style={{ padding: "10px 0", color: "rgba(255,255,255,0.4)" }}>
                          {new Date(c.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ── SERVICES ── */}
          {active === "Services" && (() => {
            // Merge DB services over static, grouped by category
            const mergedByCategory = CATEGORIES.map(cat => {
              const catServices = cat.services.map(staticSvc => {
                const db = dbServices.find(d => d.name.toLowerCase() === staticSvc.name.toLowerCase() && d.category === cat.label);
                return db ? { ...staticSvc, price: db.price, duration: db.duration, img: db.img, dbId: db.id } : { ...staticSvc, dbId: null };
              });
              const extraDb = dbServices
                .filter(d => d.category === cat.label && !cat.services.find(s => s.name.toLowerCase() === d.name.toLowerCase()))
                .map(d => ({ id: -1, name: d.name, desc: "", duration: d.duration, price: d.price, img: d.img, dbId: d.id, priced: false }));
              return { ...cat, allServices: [...catServices, ...extraDb] };
            });
            const activeCatData = mergedByCategory.find(c => c.label === activeSvcCat) ?? mergedByCategory[0];
            return (
              <div>
                {/* Add Service Modal */}
                {showAddService && (
                  <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
                    <div style={{ background: "#1a1a1a", border: "1px solid rgba(232,25,125,0.3)", borderRadius: 16, padding: 28, width: 380 }}>
                      <p style={{ fontWeight: 700, fontSize: 16, color: "var(--gold)", marginBottom: 20 }}>Add New Service</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        <input className="inp" placeholder="Service Name" value={newService.name} onChange={e => setNewService(p => ({ ...p, name: e.target.value }))} suppressHydrationWarning />
                        <select className="inp" value={newService.category} onChange={e => setNewService(p => ({ ...p, category: e.target.value }))}>
                          {CATEGORIES.map(c => <option key={c.label} value={c.label}>{c.icon} {c.label}</option>)}
                        </select>
                        <input className="inp" placeholder="Duration (e.g. 45 min)" value={newService.duration} onChange={e => setNewService(p => ({ ...p, duration: e.target.value }))} suppressHydrationWarning />
                        <input className="inp" placeholder="Price (₱)" type="number" value={newService.price} onChange={e => setNewService(p => ({ ...p, price: e.target.value }))} suppressHydrationWarning />
                        <select className="inp" value={newService.img} onChange={e => setNewService(p => ({ ...p, img: e.target.value }))}>
                          {["✂️","💆","🎨","💨","💅","🦶","💆♀️","💄","🧖","👁️","🧴","✨"].map(e => <option key={e} value={e}>{e}</option>)}
                        </select>
                        {serviceError && <p style={{ color: "#f44336", fontSize: 12 }}>{serviceError}</p>}
                      </div>
                      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                        <button className="btn-outline" style={{ fontSize: 13 }} onClick={() => setShowAddService(false)}>Cancel</button>
                        <button className="btn-pink" style={{ fontSize: 13 }} onClick={addService} disabled={!newService.name || !newService.duration || !newService.price}>Add Service</button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <p style={{ fontWeight: 700, fontSize: 15, color: "var(--gold)" }}>Services ({dbServices.length})</p>
                  <button className="btn-pink" style={{ width: "auto", padding: "6px 16px", fontSize: 12 }} onClick={() => setShowAddService(true)}>+ Add Service</button>
                </div>

                {/* Category tabs */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
                  {mergedByCategory.map(cat => (
                    <button key={cat.label} onClick={() => setActiveSvcCat(cat.label)} style={{
                      display: "flex", alignItems: "center", gap: 6,
                      padding: "7px 14px", borderRadius: 999, fontSize: 12, fontWeight: 700, cursor: "pointer",
                      background: activeSvcCat === cat.label ? "rgba(232,25,125,0.18)" : "rgba(255,255,255,0.04)",
                      border: `1px solid ${activeSvcCat === cat.label ? "var(--pink)" : "rgba(201,168,76,0.2)"}`,
                      color: activeSvcCat === cat.label ? "var(--pink)" : "rgba(255,255,255,0.6)",
                    }}>
                      <span>{cat.icon}</span> {cat.label}
                      <span style={{ background: "rgba(255,255,255,0.1)", borderRadius: 10, padding: "1px 7px", fontSize: 10 }}>
                        {cat.allServices.length}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Active category card */}
                <div className="stat-card" style={{ padding: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                    <span style={{ fontSize: 24 }}>{activeCatData.icon}</span>
                    <div>
                      <p style={{ fontWeight: 800, fontSize: 15, color: "var(--gold)" }}>{activeCatData.name}</p>
                      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{activeCatData.desc}</p>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {activeCatData.allServices.map((svc, i) => (
                      <div key={svc.id + "-" + i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(201,168,76,0.1)", borderRadius: 12, overflow: "hidden" }}>
                        {/* Service header row */}
                        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px" }}>
                          <div style={{ width: 44, height: 44, borderRadius: 10, background: "linear-gradient(135deg,rgba(232,25,125,0.2),rgba(180,80,20,0.2))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                            {svc.img}
                          </div>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontWeight: 700, fontSize: 13 }}>{svc.name}</p>
                            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>⏱ {svc.duration}</p>
                          </div>
                          <p style={{ color: "var(--pink)", fontWeight: 800, fontSize: 14, marginRight: 10 }}>₱{svc.price}</p>
                          {(svc as any).dbId && (
                            <button onClick={() => deleteService((svc as any).dbId)}
                              style={{ background: "rgba(244,67,54,0.12)", border: "1px solid rgba(244,67,54,0.3)", borderRadius: 8, padding: "5px 9px", color: "#f44336", cursor: "pointer", fontSize: 12 }}>🗑️</button>
                          )}
                        </div>

                        {/* Sub-types list */}
                        {(svc as any).types && (svc as any).types.length > 0 && (
                          <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "8px 14px 12px" }}>
                            <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(201,168,76,0.6)", letterSpacing: 1, marginBottom: 8 }}>SUB-TYPES</p>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 6 }}>
                              {(svc as any).types.map((t: any) => (
                                <div key={t.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "5px 10px" }}>
                                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}>{t.name}</span>
                                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{t.time}</span>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: "var(--pink)" }}>₱{t.price}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ── STYLISTS ── */}
          {active === "Stylists" && (
            <div className="stat-card" style={{ padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <p style={{ fontWeight: 700, color: "var(--gold)" }}>Stylists</p>
                <button className="btn-pink" style={{ width: "auto", padding: "6px 14px", fontSize: 12 }}
                  onClick={() => setShowAddStylist(true)}>+ Add Stylist</button>
              </div>

              {/* Add Stylist Modal */}
              {showAddStylist && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
                  <div style={{ background: "#1a1a1a", border: "1px solid rgba(232,25,125,0.3)", borderRadius: 16, padding: 28, width: 380 }}>
                    <p style={{ fontWeight: 700, fontSize: 16, color: "var(--gold)", marginBottom: 20 }}>Add New Stylist</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {/* Photo picker */}
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                        <div style={{
                          width: 90, height: 90, borderRadius: "50%",
                          background: "rgba(232,25,125,0.1)",
                          border: "2px dashed rgba(232,25,125,0.4)",
                          overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: photoPreview ? 0 : 36,
                        }}>
                          {photoPreview
                            ? <img src={photoPreview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            : <span>{newStylist.img}</span>}
                        </div>
                        <label style={{
                          cursor: "pointer", fontSize: 12, color: "var(--pink)", fontWeight: 700,
                          padding: "6px 16px", borderRadius: 20,
                          border: "1px solid rgba(232,25,125,0.4)",
                          background: "rgba(232,25,125,0.08)",
                        }}>
                          📷 Pick Photo
                          <input type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhotoChange} />
                        </label>
                        {photoPreview && (
                          <button onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
                            style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", background: "none", border: "none", cursor: "pointer" }}>
                            ✕ Remove photo
                          </button>
                        )}
                      </div>
                      <input className="inp" placeholder="Full Name" value={newStylist.name} onChange={e => setNewStylist(p => ({ ...p, name: e.target.value }))} suppressHydrationWarning />
                      <input className="inp" placeholder="Role (e.g. Hair Specialist)" value={newStylist.role} onChange={e => setNewStylist(p => ({ ...p, role: e.target.value }))} suppressHydrationWarning />
                      <input className="inp" placeholder="Email" type="email" value={newStylist.email} onChange={e => setNewStylist(p => ({ ...p, email: e.target.value }))} suppressHydrationWarning />
                      <input className="inp" placeholder="Password" type="password" value={newStylist.password} onChange={e => setNewStylist(p => ({ ...p, password: e.target.value }))} suppressHydrationWarning />
                      <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, marginTop: -6 }}>The stylist can sign in with this email and password.</p>
                      {!photoPreview && (
                        <select className="inp" value={newStylist.img} onChange={e => setNewStylist(p => ({ ...p, img: e.target.value }))}>
                          {["👩","👩🦱","👩🦳","👩🦰","👨","👨🦱","👨🦳","💇"].map(e => <option key={e} value={e}>{e}</option>)}
                        </select>
                      )}
                      {addError && <p style={{ color: "#f44336", fontSize: 12 }}>{addError}</p>}
                    </div>
                    <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                      <button className="btn-outline" style={{ fontSize: 13 }} onClick={() => setShowAddStylist(false)}>Cancel</button>
                      <button className="btn-pink" style={{ fontSize: 13 }} onClick={addStylist} disabled={!newStylist.name || !newStylist.role || !newStylist.email || !newStylist.password}>
                        {stylistLoading ? "Saving..." : "Add Stylist"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {stylistLoading && !showAddStylist ? (
                <p style={{ textAlign: "center", padding: 30, color: "rgba(255,255,255,0.3)" }}>Loading...</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {stylistLoadError && <p role="alert" style={{ color: "#f44336", fontSize: 13, marginBottom: 12 }}>Could not load saved stylists: {stylistLoadError}</p>}
                  {stylists.map(s => (
                    <div key={s.id} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,168,76,0.12)", borderRadius: 12, padding: 12, display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 52, height: 52, borderRadius: "50%", overflow: "hidden", flexShrink: 0, background: "rgba(232,25,125,0.1)", border: "2px solid rgba(232,25,125,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>
                        {s.photo_url
                          ? <img src={s.photo_url} alt={s.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          : <span>{s.img}</span>}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 600 }}>{s.name}</p>
                        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{s.role}</p>
                      </div>
                      <span style={{ color: "#ffc107", marginRight: 8 }}>★ {s.rating > 0 ? s.rating.toFixed(1) : "No ratings"}</span>
                      <button onClick={() => deleteStylist(s.id)}
                        style={{ background: "rgba(244,67,54,0.12)", border: "1px solid rgba(244,67,54,0.35)", borderRadius: 8, padding: "6px 10px", color: "#f44336", cursor: "pointer", fontSize: 13 }}>
                        🗑️
                      </button>
                    </div>
                  ))}
                  {stylists.length === 0 && (
                    <div style={{ textAlign: "center", padding: "30px 0", color: "rgba(255,255,255,0.3)" }}>
                      <p style={{ fontSize: 32, marginBottom: 8 }}>👩</p>
                      <p>No stylists yet. Add one!</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {!["Dashboard","Appointments","Services","Stylists","Customers"].includes(active) && (
            <div className="stat-card" style={{ padding: 40, textAlign: "center" }}>
              <p style={{ fontSize: 40, marginBottom: 10 }}>🚧</p>
              <p style={{ fontWeight: 700, color: "var(--gold)", fontSize: 16 }}>{active}</p>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginTop: 6 }}>This section is coming soon</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
