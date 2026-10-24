"use client";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { SERVICES, STYLISTS, CATEGORIES, ADMIN_ONLY_SERVICES } from "../data";
import SalonLogo from "./SalonLogo";
import ServiceCard from "./ServiceCard";
import { getServiceOptionImage } from "./ServiceDetailsPage";
import MessageCenter from "./MessageCenter";

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

type ArchivedService = { id: string; name: string; category: string; duration: string; price: string; img: string; deletedAt: string };

const SERVICE_ARCHIVE_KEY = "salon-admin-service-archive";

const readServiceArchive = (): ArchivedService[] => {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(SERVICE_ARCHIVE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeServiceArchive = (items: ArchivedService[]) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SERVICE_ARCHIVE_KEY, JSON.stringify(items));
};

const MENU = [
  { group: "Overview", items: [
    { icon: "▣", label: "Dashboard" },
  ] },
  { group: "Clients & Bookings", items: [
    { icon: "👥", label: "Customers" },
    { icon: "📅", label: "Appointments" },
    { icon: "📋", label: "Reports" },
  ] },
  { group: "Messages", items: [
    { icon: "Message", label: "Messages" },
  ] },
  { group: "Services & Catalog", items: [
    { icon: "✂️", label: "Services" },
    { icon: "🗂️", label: "Service Items" },
    { icon: "🗄️", label: "Archive" },
  ] },
  { group: "Staff & Payroll", items: [
    { icon: "👩", label: "Stylists" },
  ] },
];

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
  const [archivedServices, setArchivedServices] = useState<ArchivedService[]>(readServiceArchive);
  const [showAddStylist, setShowAddStylist] = useState(false);
  const [newStylist, setNewStylist] = useState({ name: "", role: "", img: "👩", email: "", password: "" });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [showAddService, setShowAddService] = useState(false);
  const [newService, setNewService] = useState({ name: "", category: "Hair", duration: "", price: "", img: "✂️" });
  const [serviceError, setServiceError] = useState("");
  const [activeSvcCat, setActiveSvcCat] = useState<string | null>(null);
  const [itemCategory, setItemCategory] = useState<string | null>(null);
  const [reportRange, setReportRange] = useState<"all" | "month" | "30days">("all");
  const [chartRange, setChartRange] = useState<"all" | "30" | "7">("all");
  const [bookingError, setBookingError] = useState("");
  const [savingBookingId, setSavingBookingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchBookings = async () => {
    setLoading(true);
    const [{ data: bData, error: bErr }, { data: cData }, { data: sData, error: sErr }, { data: svData, error: svErr }] = await Promise.all([
      supabase.from("bookings").select("*").order("created_at", { ascending: false }),
      supabase.from("users").select("*").eq("role", "user").order("created_at", { ascending: false }),
      supabase.from("stylists").select("*").order("created_at", { ascending: true }),
      // The admin catalogue is the source of record: show every saved service
      // here, even if it is not offered on the public booking screen.
      supabase.from("services").select("*").order("created_at", { ascending: true }),
    ]);
    if (bErr) {
      console.error("bookings error:", bErr);
      setBookingError(`Could not load appointments: ${bErr.message}`);
    } else {
      setBookingError("");
    }
    if (svErr) console.error("services error:", svErr);
    setBookings(bData ?? []);
    setCustomers(cData ?? []);
    setStylists(sData ?? []);
    setStylistLoadError(sErr?.message ?? "");
    // If Supabase services table is empty or missing, fall back to static data
    const archivedIds = new Set(readServiceArchive().map(item => item.id));
    const fallbackServices = [...SERVICES, ...ADMIN_ONLY_SERVICES].map(s => ({
      id: String(s.id),
      name: s.name,
      category: s.category,
      duration: s.duration,
      price: s.price,
      img: s.img,
    }));
    const loadedServices = (svData && svData.length > 0 ? svData : fallbackServices) as DBService[];
    // Services already in the archive stay out of the active list.
    setDbServices(loadedServices.filter(service => !archivedIds.has(service.id)));
    setLoading(false);
  };

  useEffect(() => {
    void fetchBookings();

    let isChannelActive = true;
    const refreshBookingsFromDatabase = async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false });
      if (!isChannelActive || error) return;
      setBookings(data ?? []);
    };

    const channel = supabase
      .channel(`admin-bookings-live-${crypto.randomUUID()}`)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "bookings",
      }, () => {
        void refreshBookingsFromDatabase();
      })
      .subscribe(status => {
        if (!isChannelActive) return;

        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          void refreshBookingsFromDatabase();
        }
      });
    const refreshTimer = setInterval(() => {
      void refreshBookingsFromDatabase();
    }, 10000);

    return () => {
      isChannelActive = false;
      clearInterval(refreshTimer);
      void supabase.removeChannel(channel);
    };
  }, []);

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
    if (!confirm("Delete this service? It will be moved to the Archive.")) return;
    setServiceError("");
    const service = dbServices.find(s => s.id === id);
    /* Numbers-only ids come from the static fallback list, not from Supabase. */
    const isStored = Boolean(id) && !/^-?\d+$/.test(id);
    if (isStored) {
      const { error } = await supabase.from("services").delete().eq("id", id);
      if (error) {
        setServiceError(error.message);
        return;
      }
    }
    setDbServices(prev => prev.filter(s => s.id !== id));
    if (!service) return;
    setArchivedServices(prev => {
      const next = [{
        ...service,
        id: service.id,
        price: String(service.price),
        deletedAt: new Date().toLocaleString(),
      }, ...prev.filter(item => item.id !== service.id)];
      writeServiceArchive(next);
      return next;
    });
  };

  const restoreService = async (item: ArchivedService) => {
    setServiceError("");
    /* The numeric id belongs to the static menu entry, which is already back in
       the list, so there is nothing to re-insert in Supabase. */
    const isStored = Boolean(item.id) && !/^-?\d+$/.test(item.id);
    if (isStored) {
      const { data, error } = await supabase.from("services").insert({
        name: item.name,
        category: item.category,
        duration: item.duration,
        price: parseFloat(item.price) || 0,
        img: item.img,
      }).select().single();
      if (error) {
        setServiceError(error.message);
        return;
      }
      if (data) setDbServices(prev => [...prev, data]);
    } else {
      const staticService = [...SERVICES, ...ADMIN_ONLY_SERVICES].find(s => String(s.id) === item.id);
      if (staticService) {
        setDbServices(prev => [...prev, {
          id: staticService.id.toString(),
          name: staticService.name,
          category: staticService.category,
          duration: staticService.duration,
          price: staticService.price,
          img: staticService.img,
        }]);
      }
    }
    setArchivedServices(prev => {
      const next = prev.filter(archived => archived.id !== item.id);
      writeServiceArchive(next);
      return next;
    });
  };

  const purgeArchivedService = (item: ArchivedService) => {
    if (!confirm(`Remove "${item.name}" from the archive permanently?`)) return;
    setArchivedServices(prev => {
      const next = prev.filter(archived => archived.id !== item.id);
      writeServiceArchive(next);
      return next;
    });
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
      if (upErr) {
        setAddError(`Could not upload the stylist photo: ${upErr.message}`);
        setStylistLoading(false);
        return;
      }
      const { data: urlData } = supabase.storage.from("stylist-photos").getPublicUrl(fileName);
      photo_url = urlData.publicUrl;
    }

    const { data: { session }, error: sessionError } = await supabase.auth.refreshSession();
    if (sessionError || !session) {
      setAddError(sessionError?.message ?? "Your admin session expired. Log in again, then retry.");
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
    setActive("Stylists");
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
    setSavingBookingId(id);
    setBookingError("");
    const { data, error } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", id)
      .select("id, status");
    setSavingBookingId(null);
    if (error) {
      setBookingError(`Could not update appointment: ${error.message}`);
      return;
    }
    // No rows updated means the account is not recognized as an admin by the
    // bookings policies, so report it instead of silently doing nothing.
    if (!data || data.length === 0) {
      setBookingError("Could not update appointment: changes did not reach the database. Make sure this account has the 'admin' role in the users table.");
      return;
    }
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  };

  const deleteBooking = async (id: string) => {
    setBookingError("");
    const booking = bookings.find(item => item.id === id);
    if (booking?.status === "confirmed" || booking?.status === "completed") {
      setBookingError("Confirmed and completed appointments cannot be deleted.");
      return;
    }
    const { error } = await supabase.from("bookings").delete().eq("id", id);
    if (error) {
      setBookingError(`Could not delete appointment: ${error.message}`);
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

  const reportBookings = bookings.filter(booking => {
    if (reportRange === "all") return true;
    const appointmentDate = new Date(`${booking.date}T00:00:00`);
    if (Number.isNaN(appointmentDate.getTime())) return false;
    const now = new Date();
    if (reportRange === "month") return appointmentDate.getFullYear() === now.getFullYear() && appointmentDate.getMonth() === now.getMonth();
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() - 30);
    return appointmentDate >= cutoff && appointmentDate <= now;
  });
  const reportCompleted = reportBookings.filter(booking => booking.status === "completed");
  const reportRevenue = reportCompleted.reduce((sum, booking) => sum + Number(booking.total || 0), 0);
  const reportServices = reportBookings.reduce<Record<string, number>>((counts, booking) => {
    booking.services.split(",").forEach(value => {
      const serviceName = value.replace(/\s*\([^)]*\)/g, "").trim();
      if (serviceName) counts[serviceName] = (counts[serviceName] ?? 0) + 1;
    });
    return counts;
  }, {});
  const popularServices = Object.entries(reportServices).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const parseBookingDate = (value: string) => {
    const parsed = new Date(`${value}T00:00:00`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  /* Charts are date-filtered on their own control, independent of the Reports
     page, so changing the range rebuilds both charts from the same bookings. */
  const chartBookings = bookings.filter(booking => {
    if (chartRange === "all") return true;
    const appointmentDate = parseBookingDate(booking.date);
    if (!appointmentDate) return false;
    const now = new Date();
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() - Number(chartRange));
    return appointmentDate >= cutoff && appointmentDate <= now;
  });

  const statusCounts = [
    { key: "pending", label: "Pending", color: "#f2b705" },
    { key: "confirmed", label: "Confirmed", color: "#2e9bd6" },
    { key: "completed", label: "Completed", color: "#3faa5b" },
    { key: "cancelled", label: "Cancelled", color: "#e0463c" },
  ].map(item => ({ ...item, count: chartBookings.filter(b => b.status === item.key).length }));

  /* Bar chart buckets follow the selected range: 6 months for "all", weeks for
     30 days, days for 7 days. */
  const trendBuckets = (() => {
    const now = new Date();
    if (chartRange === "all") {
      return Array.from({ length: 6 }, (_, index) => {
        const month = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
        return {
          label: month.toLocaleDateString("en-US", { month: "short" }),
          matches: (date: Date) => date.getFullYear() === month.getFullYear() && date.getMonth() === month.getMonth(),
        };
      });
    }
    const days = Number(chartRange);
    if (days <= 7) {
      return Array.from({ length: days }, (_, index) => {
        const day = new Date(now);
        day.setDate(day.getDate() - (days - 1 - index));
        const key = day.toDateString();
        return {
          label: day.toLocaleDateString("en-US", { weekday: "short" }),
          matches: (date: Date) => date.toDateString() === key,
        };
      });
    }
    /* 30 days: one bar per week (this week first, oldest last). */
    const weeks = Math.ceil(days / 7);
    return Array.from({ length: weeks }, (_, index) => {
      const end = new Date(now);
      end.setDate(end.getDate() - (weeks - 1 - index) * 7);
      end.setHours(23, 59, 59, 999);
      const start = new Date(end);
      start.setDate(start.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      return {
        label: start.toLocaleDateString("en-US", { month: "numeric", day: "numeric" }),
        matches: (date: Date) => date >= start && date <= end,
      };
    });
  })();

  const monthlyTrend = trendBuckets.map(bucket => {
    const inBucket = chartBookings.filter(booking => {
      const date = parseBookingDate(booking.date);
      return date ? bucket.matches(date) : false;
    });
    return {
      label: bucket.label,
      bookings: inBucket.length,
      revenue: inBucket.filter(b => b.status === "completed").reduce((sum, b) => sum + Number(b.total || 0), 0),
    };
  });
  const trendMax = Math.max(1, ...monthlyTrend.map(point => point.revenue));
  const statusTotal = Math.max(1, statusCounts.reduce((sum, item) => sum + item.count, 0));
  const chartRangeLabel = chartRange === "all" ? "Last 6 months" : chartRange === "7" ? "Last 7 days" : "Last 30 days";

  /* Supabase service rows merged onto the static menu, grouped by category.
     Categories that differ only by case (e.g. "Nails" vs "nails") are folded
     together so a category never renders twice. */
  const mergedSvcCategories = CATEGORIES.map(cat => {
    const staticServices = [...cat.services, ...ADMIN_ONLY_SERVICES.filter(service => service.category === cat.label)];
    const allServices = dbServices
      .filter(service => service.category.toLowerCase() === cat.label.toLowerCase())
      .map((service, index) => {
        const staticService = staticServices.find(item => item.name.toLowerCase() === service.name.toLowerCase());
        return staticService
          ? { ...staticService, duration: service.duration, price: service.price, img: service.img, dbId: service.id }
          : { id: -1 - index, name: service.name, desc: "", duration: service.duration, price: service.price, img: service.img, dbId: service.id, priced: false };
      });
    return { ...cat, allServices };
  });
  /* Keep the Service Items register complete when an admin has added a
     category that is not part of the built-in customer-facing catalogue. */
  const knownCategoryLabels = new Set(mergedSvcCategories.map(category => category.label.toLowerCase()));
  const extraServiceCategories = Array.from(new Set(
    dbServices
      .map(service => service.category.trim())
      .filter(category => category && !knownCategoryLabels.has(category.toLowerCase()))
  )).map((label, categoryIndex) => ({
    icon: "✨",
    label,
    name: label,
    desc: "Custom service category",
    services: [],
    allServices: dbServices
      .filter(service => service.category.trim().toLowerCase() === label.toLowerCase())
      .map((service, serviceIndex) => ({
        id: -10000 - categoryIndex * 1000 - serviceIndex,
        name: service.name,
        desc: "",
        duration: service.duration,
        price: service.price,
        img: service.img,
        dbId: service.id,
        priced: false,
      })),
  }));
  const allSvcCategories = [...mergedSvcCategories, ...extraServiceCategories];
  const normalizedSearch = searchQuery.trim().toLowerCase();
  const searchResults = normalizedSearch ? [
    ...bookings.filter(booking => [booking.customer_name, booking.customer_phone, booking.services, booking.stylist, booking.status].some(value => value?.toLowerCase().includes(normalizedSearch))).map(booking => ({ id: `booking-${booking.id}`, section: "Appointments", title: booking.customer_name, detail: `${booking.services} · ${booking.date}` })),
    ...customers.filter(customer => [customer.full_name, customer.email, customer.phone].some(value => value?.toLowerCase().includes(normalizedSearch))).map(customer => ({ id: `customer-${customer.id}`, section: "Customers", title: customer.full_name, detail: customer.email || customer.phone })),
    ...dbServices.filter(service => [service.name, service.category, service.duration].some(value => value?.toLowerCase().includes(normalizedSearch))).map(service => ({ id: `service-${service.id}`, section: "Service Items", title: service.name, detail: service.category })),
    ...stylists.filter(stylist => [stylist.name, stylist.role].some(value => value?.toLowerCase().includes(normalizedSearch))).map(stylist => ({ id: `stylist-${stylist.id}`, section: "Stylists", title: stylist.name, detail: stylist.role })),
  ].slice(0, 8) : [];

  const exportReport = () => {
    const escapeCsv = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;
    const rows = [
      ["Appointment Date", "Customer", "Phone", "Service", "Stylist", "Status", "Total"],
      ...reportBookings.map(booking => [booking.date, booking.customer_name, booking.customer_phone, booking.services, booking.stylist, booking.status, booking.total]),
    ];
    const csv = rows.map(row => row.map(escapeCsv).join(",")).join("\r\n");
    const fileUrl = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = `salon-report-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(fileUrl);
  };

  const stats = [
    { label: "Total Appointments", value: bookings.length.toString(), color: "#e8197d", icon: "📅" },
    { label: "Pending", value: bookings.filter(b => b.status === "pending").length.toString(), color: "#ffc107", icon: "⏳" },
    { label: "Total Customers", value: uniqueCustomers.toString(), color: "#2196f3", icon: "👥" },
    { label: "Total Revenue", value: `₱${totalRevenue.toLocaleString()}`, color: "#4caf50", icon: "💰" },
  ];

  const todayLabel = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  return (
    <div className="admin-wrap admin-wrap--light">
      {sideOpen && (
        <div className="admin-side admin-side--dark">
          <div className="admin-brand">
            <SalonLogo />
          </div>
          <div className="admin-nav-scroll">
            {MENU.map(group => (
              <div key={group.group} className="admin-nav-group">
                <p className="admin-nav-label">{group.group}</p>
                {group.items.map(m => (
                  <button key={m.label} type="button" className={`admin-nav-item ${active === m.label ? "on" : ""}`} onClick={() => go(m.label)}>
                    <span className="admin-nav-icon">{m.icon}</span>
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>
            ))}
            <div className="admin-nav-group">
              <button type="button" className="admin-nav-item" onClick={() => go("Logout")}>
                <span className="admin-nav-icon">🚪</span>
                <span>Logout</span>
              </button>
            </div>
          </div>
          <div className="admin-side-foot">
            <span className="admin-side-avatar">RG</span>
            <div style={{ minWidth: 0 }}>
              <p className="admin-side-name">Rosseygirl Salon</p>
              <p className="admin-side-date">Monday, {todayLabel}</p>
            </div>
          </div>
        </div>
      )}

      <div className="admin-main admin-main--light">
        <div className="admin-topbar admin-topbar--light">
          <div className="admin-topbar-left">
            <button type="button" aria-label="Toggle sidebar" onClick={() => setSideOpen(o => !o)} className="admin-menu-btn">☰</button>
            <div className="admin-search">
              <span aria-hidden="true">🔍</span>
              <input
                placeholder="Search records across system..."
                aria-label="Search records"
                value={searchQuery}
                onChange={event => setSearchQuery(event.target.value)}
              />
            </div>
            {normalizedSearch && (
              <div className="admin-search-results" role="listbox" aria-label="Search results">
                {searchResults.length ? searchResults.map(result => (
                  <button key={result.id} type="button" role="option" className="admin-search-result" onClick={() => { setActive(result.section); setSearchQuery(""); }}>
                    <span>{result.title}</span><small>{result.section} · {result.detail}</small>
                  </button>
                )) : <p className="admin-search-empty">No matching records.</p>}
              </div>
            )}
          </div>
          <div className="admin-topbar-right">
            <button type="button" className="btn-pink admin-quick-btn" onClick={() => setActive("Appointments")}>+ Quick Appointment</button>
          </div>
        </div>

        <div className="admin-content">

          {/* ── DASHBOARD ── */}
          {active === "Dashboard" && (
            <>
              <div className="admin-page-head">
                <h1>📊 Main Dashboard</h1>
                <p>Real-time overview of your salon performance</p>
              </div>

              <div className="admin-stat-grid">
                {stats.map(s => (
                  <div key={s.label} className="stat-card admin-stat-card">
                    <div className="admin-stat-top">
                      <span>{s.label}</span>
                      <span className="admin-stat-ico" style={{ color: s.color }}>{s.icon}</span>
                    </div>
                    <p className="admin-stat-value" style={{ color: s.color }}>{loading ? "..." : s.value}</p>
                  </div>
                ))}
              </div>

              {/* Charts — rebuilt from the bookings that fall inside the selected range */}
              <div className="admin-chart-head">
                <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "#2a1219" }}>Performance Overview</p>
                <div className="admin-chart-range" role="group" aria-label="Chart date range">
                  {([["all", "6 months"], ["30", "30 days"], ["7", "7 days"]] as const).map(([value, label]) => (
                    <button key={value} type="button" onClick={() => setChartRange(value)}
                      aria-pressed={chartRange === value}
                      className={`admin-chart-range-btn ${chartRange === value ? "on" : ""}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="admin-chart-grid">
                <div className="stat-card admin-chart-card">
                  <div className="admin-panel-head">
                    <p style={{ fontWeight: 700, fontSize: 14, color: "#f0d28a" }}>Revenue &amp; Appointments</p>
                    <span className="admin-panel-pill">{chartRangeLabel}</span>
                  </div>
                  {loading ? <p className="admin-chart-empty">Loading chart...</p> : (
                    <div className="admin-bar-chart" style={{ gridTemplateColumns: `repeat(${monthlyTrend.length}, minmax(0, 1fr))` }} role="img" aria-label={`Revenue for ${chartRangeLabel}: ${monthlyTrend.map(point => `${point.label} ₱${point.revenue}`).join(", ")}`}>
                      {monthlyTrend.map((point, index) => (
                        <div key={point.label + "-" + index} className="admin-bar-col">
                          <span className="admin-bar-value">{point.bookings}</span>
                          <div className="admin-bar-track">
                            <div
                              className="admin-bar-fill"
                              style={{ height: `${Math.max(point.revenue > 0 ? 6 : 0, (point.revenue / trendMax) * 100)}%` }}
                              title={`${point.label}: ₱${point.revenue.toLocaleString()} completed, ${point.bookings} appointment${point.bookings === 1 ? "" : "s"}`}
                            />
                          </div>
                          <span className="admin-bar-label">{point.label}</span>
                          <span className="admin-bar-revenue">{point.revenue >= 1000 ? `${(point.revenue / 1000).toFixed(1)}k` : point.revenue}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="admin-chart-legend"><span className="admin-legend-swatch admin-legend-bar" /> Bar height = completed revenue (₱) · number above = appointments booked</p>
                </div>

                <div className="stat-card admin-chart-card">
                  <div className="admin-panel-head">
                    <p style={{ fontWeight: 700, fontSize: 14, color: "#f0d28a" }}>Appointment Status</p>
                    <span className="admin-panel-pill">{chartBookings.length} in {chartRangeLabel.toLowerCase()}</span>
                  </div>
                  {loading ? <p className="admin-chart-empty">Loading chart...</p> : (
                    <div className="admin-donut-wrap">
                      <svg viewBox="0 0 42 42" className="admin-donut" role="img" aria-label={`Appointment status split: ${statusCounts.map(item => `${item.label} ${item.count}`).join(", ")}`}>
                        <circle cx="21" cy="21" r="15.9155" className="admin-donut-bg" />
                        {(() => {
                          let offset = 0;
                          return statusCounts.map(item => {
                            const share = chartBookings.length === 0 ? 0 : (item.count / statusTotal) * 100;
                            const dash = `${share} ${100 - share}`;
                            const element = share > 0 ? (
                              <circle
                                key={item.key}
                                cx="21" cy="21" r="15.9155"
                                fill="none"
                                stroke={item.color}
                                strokeWidth="6"
                                strokeDasharray={dash}
                                strokeDashoffset={-offset}
                              >
                                <title>{`${item.label}: ${item.count}`}</title>
                              </circle>
                            ) : null;
                            offset += share;
                            return element;
                          });
                        })()}
                        <text x="21" y="20" className="admin-donut-total">{chartBookings.length}</text>
                        <text x="21" y="25.5" className="admin-donut-caption">appointments</text>
                      </svg>
                      <ul className="admin-chart-legend admin-legend-list">
                        {statusCounts.map(item => (
                          <li key={item.key}>
                            <span className="admin-legend-swatch" style={{ background: item.color }} />
                            <span>{item.label}</span>
                            <strong>{item.count}</strong>
                            <span className="admin-legend-pct">{chartBookings.length === 0 ? 0 : Math.round((item.count / statusTotal) * 100)}%</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="stat-card" style={{ padding: 20 }}>
                  <div className="admin-panel-head">
                    <p style={{ fontWeight: 700, fontSize: 14, color: "#fff" }}>Recent Appointments</p>
                    <span className="admin-panel-pill">Latest 5</span>
                  </div>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        {["Customer","Service","Stylist","Date","Time","Status"].map(h => (
                          <th key={h} style={{ textAlign: "left", paddingBottom: 10, paddingRight: 10, fontWeight: 600 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr><td colSpan={6} style={{ padding: 20, textAlign: "center", color: "#9a8b90" }}>Loading...</td></tr>
                      ) : bookings.length === 0 ? (
                        <tr><td colSpan={6} style={{ padding: 20, textAlign: "center", color: "#9a8b90" }}>No bookings yet</td></tr>
                      ) : bookings.slice(0, 5).map(b => (
                        <tr key={b.id}>
                          <td style={{ padding: "10px 10px 10px 0", fontWeight: 600 }}>{b.customer_name}</td>
                          <td style={{ padding: "10px 10px 10px 0" }}>{b.services}</td>
                          <td style={{ padding: "10px 10px 10px 0" }}>{b.stylist?.split(" ")[0]}</td>
                          <td style={{ padding: "10px 10px 10px 0" }}>{b.date}</td>
                          <td style={{ padding: "10px 10px 10px 0" }}>{b.time}</td>
                          <td style={{ padding: "10px 0" }}><span className={`badge badge-${b.status}`}>{b.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ── APPOINTMENTS ── */}
          {active === "Appointments" && (
            <div className="stat-card" style={{ padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <p style={{ fontWeight: 700, color: "#fff" }}>All Appointments</p>
                <span style={{ fontSize: 12, color: "#8b7a81" }}>{bookings.length} total</span>
              </div>
              {bookingError && (
                <p role="alert" style={{ margin: "0 0 12px", padding: "9px 12px", borderRadius: 8, background: "rgba(244,67,54,0.12)", border: "1px solid rgba(244,67,54,0.35)", color: "#f44336", fontSize: 12 }}>
                  {bookingError}
                </p>
              )}
              {loading ? (
                <p style={{ textAlign: "center", padding: 30, color: "#8b7a81" }}>Loading...</p>
              ) : bookings.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <p style={{ fontSize: 32, marginBottom: 10 }}>📋</p>
                  <p style={{ color: "#8b7a81", fontSize: 13 }}>No bookings yet</p>
                </div>
              ) : (
                <div className="admin-appt-list">
                  <div className="admin-appt-list-head" aria-hidden="true">
                    <span>Client</span>
                    <span>Appointment details</span>
                    <span>Status</span>
                    <span>Actions</span>
                  </div>
                  {bookings.map(b => (
                    <div key={b.id} style={{ padding: "14px" }} className="admin-appt-row">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                        <div>
                          <p style={{ fontWeight: 700, fontSize: 13, color: "#fff" }}>{b.customer_name}</p>
                          <p style={{ fontSize: 11, color: "#fff", marginTop: 2 }}>{b.services}</p>
                          <p style={{ fontSize: 11, color: "#fff" }}>{b.stylist}</p>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                          <span className={`badge badge-${b.status}`}>{b.status}</span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>₱{b.total}</span>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 12, fontSize: 11, color: "#fff", marginBottom: 10 }}>
                        <span>📅 {b.date}</span>
                        <span>🕐 {b.time}</span>
                        {b.customer_phone && <span>📱 {b.customer_phone}</span>}
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        {b.status === "pending" && (
                          <button onClick={() => updateStatus(b.id, "confirmed")}
                            disabled={savingBookingId === b.id}
                            style={{ flex: 1, padding: "7px 0", borderRadius: 8, background: "linear-gradient(135deg,#4caf50,#388e3c)", border: "none", color: "#fff", fontSize: 12, fontWeight: 700, cursor: savingBookingId === b.id ? "wait" : "pointer", opacity: savingBookingId === b.id ? 0.6 : 1 }}>
                            {savingBookingId === b.id ? "Saving..." : "✓ Approve"}
                          </button>
                        )}
                        {b.status === "pending" && (
                          <button onClick={() => updateStatus(b.id, "cancelled")}
                            disabled={savingBookingId === b.id}
                            style={{ flex: 1, padding: "7px 0", borderRadius: 8, background: "rgba(244,67,54,0.12)", border: "1px solid rgba(244,67,54,0.35)", color: "#f44336", fontSize: 12, fontWeight: 700, cursor: savingBookingId === b.id ? "wait" : "pointer", opacity: savingBookingId === b.id ? 0.6 : 1 }}>
                            ✕ Cancel
                          </button>
                        )}
                        {b.status === "confirmed" && (
                          <button onClick={() => updateStatus(b.id, "completed")}
                            disabled={savingBookingId === b.id}
                            style={{ flex: 1, padding: "7px 0", borderRadius: 8, background: "linear-gradient(135deg,#2196f3,#1565c0)", border: "none", color: "#fff", fontSize: 12, fontWeight: 700, cursor: savingBookingId === b.id ? "wait" : "pointer", opacity: savingBookingId === b.id ? 0.6 : 1 }}>
                            {savingBookingId === b.id ? "Saving..." : "Complete Appointment"}
                          </button>
                        )}
                        {b.status !== "confirmed" && b.status !== "completed" && (
                        <button onClick={() => deleteBooking(b.id)}
                          className="admin-appt-delete"
                          style={{ padding: "7px 12px", borderRadius: 8, fontSize: 12, cursor: "pointer" }}>
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
          {active === "Reports" && (
            <section aria-label="Appointment reports">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 18 }}>
                <div>
                  <h2 style={{ color: "var(--gold)", fontSize: 18, margin: 0 }}>Salon Reports</h2>
                  <p style={{ color: "rgba(255,255,255,.45)", fontSize: 12, margin: "5px 0 0" }}>Appointment and completed-service revenue summary</p>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <select aria-label="Report date range" value={reportRange} onChange={event => setReportRange(event.target.value as typeof reportRange)} className="inp" style={{ width: "auto", minWidth: 150 }}>
                    <option value="all">All time</option>
                    <option value="month">This month</option>
                    <option value="30days">Last 30 days</option>
                  </select>
                  <button className="btn-pink" onClick={exportReport} style={{ width: "auto", padding: "9px 16px", fontSize: 12 }}>Export CSV</button>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12, marginBottom: 18 }}>
                {[
                  ["Appointments", reportBookings.length, "#e879b0"],
                  ["Completed", reportCompleted.length, "#4caf50"],
                  ["Pending", reportBookings.filter(booking => booking.status === "pending").length, "#ffc107"],
                  ["Cancelled", reportBookings.filter(booking => booking.status === "cancelled").length, "#f44336"],
                  ["Completed Revenue", `₱${reportRevenue.toLocaleString()}`, "#9cdb9f"],
                ].map(([label, value, color]) => (
                  <div key={String(label)} className="stat-card" style={{ padding: 16 }}>
                    <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: String(color) }}>{loading ? "..." : value}</p>
                    <p style={{ margin: "6px 0 0", fontSize: 11, color: "rgba(255,255,255,.48)" }}>{label}</p>
                  </div>
                ))}
              </div>
              <div className="stat-card" style={{ padding: 18 }}>
                <h3 style={{ margin: "0 0 14px", fontSize: 14, color: "var(--gold)" }}>Most Booked Services</h3>
                {loading ? <p style={{ color: "var(--text-muted)" }}>Loading report...</p> : popularServices.length === 0 ? <p style={{ color: "var(--text-muted)", fontSize: 13 }}>No appointments in this date range.</p> : (
                  <div style={{ display: "grid", gap: 12 }}>
                    {popularServices.map(([name, count]) => {
                      const max = popularServices[0][1] || 1;
                      return <div key={name}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 5, fontSize: 12 }}><span>{name}</span><span style={{ color: "var(--text-muted)" }}>{count} booking{count === 1 ? "" : "s"}</span></div>
                        <div style={{ height: 7, borderRadius: 9, background: "rgba(255,255,255,.08)" }}><div style={{ height: "100%", width: `${Math.max(8, count / max * 100)}%`, borderRadius: 9, background: "linear-gradient(90deg,#e8197d,#c44b79)" }} /></div>
                      </div>;
                    })}
                  </div>
                )}
              </div>
            </section>
          )}

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
                <table className="admin-table">
                  <thead>
                    <tr>
                      {["#","Full Name","Email","Phone","Role","Joined"].map(h => (
                        <th key={h} style={{ textAlign: "left", paddingBottom: 10, paddingRight: 14, fontWeight: 600 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((c, i) => (
                      <tr key={c.id}>
                        <td style={{ padding: "10px 14px 10px 0", color: "#9a8b90" }}>{i + 1}</td>
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
            const activeCatData = allSvcCategories.find(c => c.label === activeSvcCat) ?? null;

            /* Service Items page: always one flat list of the items in the chosen
               category (or every item when no category is set). */
            const itemCat = allSvcCategories.find(c => c.label === itemCategory) ?? null;

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

                {/* Category tabs — clicking one lists that category's service items below */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
                  {allSvcCategories.map(cat => (
                    <button
                      key={cat.label}
                      type="button"
                      className={`admin-service-category-button ${activeSvcCat === cat.label ? "is-active" : ""}`}
                      aria-pressed={activeSvcCat === cat.label}
                      onClick={() => setActiveSvcCat(prev => prev === cat.label ? null : cat.label)}
                      style={
                      {
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "7px 14px", borderRadius: 999, fontSize: 12, fontWeight: 700, cursor: "pointer",
                      }}>
                      <span>{cat.icon}</span> {cat.label}
                      <span style={{ background: "rgba(255,255,255,0.1)", borderRadius: 10, padding: "1px 7px", fontSize: 10 }}>
                        {cat.allServices.length}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Hint until a category is picked */}
                {!activeCatData && (
                  <div className="stat-card" style={{ padding: 30, textAlign: "center" }}>
                    <p style={{ fontSize: 30, marginBottom: 8 }}>🗂️</p>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginBottom: 18 }}>Select a service card to view its service items.</p>
                    <div className="admin-service-grid">
                      {allSvcCategories.flatMap(cat => cat.allServices.map((svc, index) => (
                        <ServiceCard
                          key={`${cat.label}-${svc.id}-${index}`}
                          service={{ ...svc, category: cat.label, desc: svc.desc || cat.desc }}
                          onExplore={() => setActiveSvcCat(cat.label)}
                        />
                      )))}
                    </div>
                  </div>
                )}

                {/* Active category — its service items listed one per row */}
                {activeCatData && (
                <div className="stat-card" style={{ padding: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                    <span style={{ fontSize: 24 }}>{activeCatData.icon}</span>
                    <div>
                      <p style={{ fontWeight: 800, fontSize: 15, color: "var(--gold)" }}>{activeCatData.name}</p>
                      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{activeCatData.desc}</p>
                    </div>
                  </div>

                  <div className="admin-service-grid">
                    {activeCatData.allServices.length === 0 && (
                      <p className="admin-svc-empty">No service items in this category yet.</p>
                    )}
                    {activeCatData.allServices.map((svc, i) => (
                      <ServiceCard
                        key={svc.id + "-" + i}
                        service={{ ...svc, category: activeCatData.label, desc: svc.desc || activeCatData.desc }}
                        onExplore={() => undefined}
                      />
                    ))}
                  </div>
                </div>
                )}
              </div>
            );
          })()}

          {/* ── SERVICE ITEMS (flat list) ── */}
          {active === "Service Items" && (() => {
            /* The landing page opens a parent service card (e.g. Hair Cut), then
               shows its selectable options. This register mirrors those actual
               options so every landing-page service item is visible to admins. */
            const itemCat = allSvcCategories.find(c => c.label === itemCategory) ?? null;
            const itemCategories = itemCat ? [itemCat] : allSvcCategories;
            const itemList = itemCategories.flatMap(cat => cat.allServices.flatMap(svc => {
              const source = svc as {
                id: number;
                name: string;
                desc: string;
                duration: string;
                price: number;
                img: string;
                dbId?: string;
                types?: { name: string; time: string; price: number }[];
              };
              const base = { category: cat.label, serviceName: source.name, img: source.img, dbId: source.dbId };
              return source.types?.length
                ? source.types.map(option => ({ ...base, id: `${source.id}-${option.name}`, name: option.name, desc: `Option under ${source.name}`, duration: option.time, price: option.price, image: getServiceOptionImage(source.id, option.name), isOption: true }))
                : [{ ...base, id: String(source.id), name: source.name, desc: source.desc, duration: source.duration, price: source.price, image: undefined, isOption: false }];
            }));
            return (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 15, color: "var(--gold)" }}>Service Items ({itemList.length})</p>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
                    {itemCat ? `Showing the landing-page service options under ${itemCat.name}.` : "Showing every service option from the landing page."}
                  </p>
                </div>
                <select className="inp admin-service-items-filter" aria-label="Filter service items by category" value={itemCategory ?? ""} onChange={e => setItemCategory(e.target.value || null)} style={{ width: "auto", minWidth: 180 }}>
                  <option value="">All categories</option>
                  {allSvcCategories.map(cat => <option key={cat.label} value={cat.label}>{cat.icon} {cat.name}</option>)}
                </select>
              </div>

              {serviceError && <p role="alert" style={{ color: "#f44336", fontSize: 13, marginBottom: 12 }}>{serviceError}</p>}

              <div className="stat-card" style={{ padding: 20 }}>
                <div className="admin-svc-list">
                  {itemList.length === 0 && <p className="admin-svc-empty">No service items to show.</p>}
                  {itemList.map((svc, i) => (
                      <div key={svc.id + "-" + i} className="admin-svc-row">
                       {svc.image ? <img className="admin-svc-image" src={svc.image} alt="" /> : <span className="admin-svc-emoji">{svc.img}</span>}
                      <div className="admin-svc-main">
                        <p className="admin-svc-name">{svc.name}</p>
                        {svc.desc && <p className="admin-svc-desc">{svc.desc}</p>}
                        {(svc as any).types && (svc as any).types.length > 0 && (
                          <p className="admin-svc-types">{(svc as any).types.length} sub-types: {(svc as any).types.slice(0, 4).map((t: { name: string }) => t.name).join(", ")}{(svc as any).types.length > 4 ? "…" : ""}</p>
                        )}
                      </div>
                      <span className="admin-svc-cat">{svc.category}</span>
                      <span className="admin-svc-duration">{svc.duration}</span>
                      <span className="admin-svc-price">₱{Number(svc.price || 0).toLocaleString()}</span>
                      <button onClick={() => { if (!svc.isOption && svc.dbId) deleteService(svc.dbId); }}
                        aria-label={`Delete ${svc.name}`}
                        className="admin-svc-delete">🗑️</button>
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
                        <p style={{ fontWeight: 600, color: "#fff" }}>{s.name}</p>
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

          {/* ── ARCHIVE ── */}
          {active === "Archive" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 15, color: "var(--gold)" }}>Archived Services ({archivedServices.length})</p>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>Services deleted from the Services page are kept here. Restore one to put it back on the menu.</p>
                </div>
              </div>

              {serviceError && <p role="alert" style={{ color: "#f44336", fontSize: 13, marginBottom: 12 }}>{serviceError}</p>}

              {archivedServices.length === 0 ? (
                <div className="stat-card" style={{ padding: 40, textAlign: "center" }}>
                  <p style={{ fontSize: 36, marginBottom: 10 }}>🗄️</p>
                  <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>The archive is empty. Deleted services will appear here.</p>
                </div>
              ) : (
                <div style={{ display: "grid", gap: 10 }}>
                  {archivedServices.map(item => (
                    <div key={item.id} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,168,76,0.12)", borderRadius: 12, padding: 12, display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ width: 46, height: 46, borderRadius: 10, background: "rgba(232,25,125,0.1)", display: "grid", placeItems: "center", fontSize: 22, flexShrink: 0 }}>{item.img}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 600 }}>{item.name}</p>
                        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                          {item.category} · {item.duration} · ₱{Number(item.price || 0).toLocaleString()} · Deleted {item.deletedAt}
                        </p>
                      </div>
                      <button onClick={() => void restoreService(item)}
                        style={{ background: "rgba(232,25,125,0.12)", border: "1px solid rgba(232,25,125,0.4)", borderRadius: 8, padding: "6px 12px", color: "var(--pink)", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
                        ♻️ Restore
                      </button>
                      <button onClick={() => purgeArchivedService(item)}
                        aria-label={`Remove ${item.name} from archive`}
                        style={{ background: "rgba(244,67,54,0.12)", border: "1px solid rgba(244,67,54,0.35)", borderRadius: 8, padding: "6px 10px", color: "#f44336", cursor: "pointer", fontSize: 13 }}>
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {active === "Messages" && <MessageCenter admin />}

          {!["Dashboard","Appointments","Reports","Services","Service Items","Archive","Stylists","Customers","Messages"].includes(active) && (
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
