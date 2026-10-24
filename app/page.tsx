"use client";
import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import { HairType, getService } from "./data";
import AuthScreen from "./components/AuthScreen";
import LandingPage from "./components/LandingPage";
import AllServicesPage from "./components/AllServicesPage";
import ServiceDetailsPage from "./components/ServiceDetailsPage";
import HomeScreen from "./components/HomeScreen";
import SelectService from "./components/SelectService";
import SelectDateTime from "./components/SelectDateTime";
import ChooseStylist from "./components/ChooseStylist";
import ReservationForm from "./components/ReservationForm";
import BookingConfirm from "./components/BookingConfirm";
import MyBookings from "./components/MyBookings";
import AdminDashboard from "./components/AdminDashboard";
import StylistDashboard from "./components/StylistDashboard";
import SiteFooter from "./components/SiteFooter";
import AboutScreen from "./components/AboutScreen";
import SalonLogo from "./components/SalonLogo";
import MessageCenter from "./components/MessageCenter";

type AppRole = "user" | "admin" | "stylist";
type Screen = "landing" | "all-services" | "service-details" | "auth" | "home" | "about" | "select-service" | "select-datetime" | "choose-stylist" | "reservation" | "confirm" | "my-bookings" | "messages" | "admin" | "stylist";

function getDisplayName(profileName: unknown, metadata: Record<string, unknown>) {
  const candidates = [profileName, metadata.full_name, metadata.name];
  return candidates.find(
    (value): value is string => typeof value === "string" && value.trim().length > 0 && !value.includes("@"),
  )?.trim() ?? "there";
}

async function getAppRole(userId: string, profileRole: unknown): Promise<AppRole> {
  if (profileRole === "admin") return "admin";
  if (profileRole === "stylist") return "stylist";
  const { data: stylist } = await supabase.from("stylists").select("id").eq("user_id", userId).maybeSingle();
  return stylist ? "stylist" : "user";
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [chosen, setChosen] = useState<Record<number, HairType>>({});
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedStylist, setSelectedStylist] = useState<string | null>(null);
  const [selectedStylistName, setSelectedStylistName] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [userName, setUserName] = useState("");
  const [checking, setChecking] = useState(true);
  const [initialCategory, setInitialCategory] = useState<string | undefined>(undefined);
  const [detailServiceId, setDetailServiceId] = useState<number>(0);
  const [detailReturnScreen, setDetailReturnScreen] = useState<"landing" | "home" | "all-services">("landing");

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        // Resolve privileged app roles from the profile and stylist assignment.
        const { data: customer } = await supabase
          .from("users")
          .select("role, full_name")
          .eq("user_id", session.user.id)
          .maybeSingle();
        const role = await getAppRole(session.user.id, customer?.role);
        setUserName(getDisplayName(customer?.full_name, session.user.user_metadata));
        setScreen(role === "admin" ? "admin" : role === "stylist" ? "stylist" : "home");
      }
      setChecking(false);
    });
  }, []);

  const handleLogin = (role: AppRole) => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        const { data: customer } = await supabase
          .from("users")
          .select("full_name")
          .eq("user_id", user.id)
          .maybeSingle();
        setUserName(getDisplayName(customer?.full_name, user.user_metadata));
      }
    });
    setScreen(role === "admin" ? "admin" : role === "stylist" ? "stylist" : "home");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setScreen("landing");
    setSelectedServices([]);
    setChosen({});
    setSelectedDate("");
    setSelectedTime("");
    setSelectedStylist(null);
    setSelectedStylistName(null);
    setUserName("");
  };

  const toggleService = (id: number) =>
    setSelectedServices(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);

  const handleChoose = (serviceId: number, t: HairType) =>
    setChosen(prev => ({ ...prev, [serviceId]: t }));

  const handleBook = (category?: string) => {
    setInitialCategory(category);
    setScreen("select-service");
  };

  /* A signed-in customer who clicks "Book Now" on a card goes straight to Date & Time with that
     service already picked — the service selection step is skipped instead of restarted. */
  const bookService = (serviceId: number, typeName?: string) => {
    const service = getService(serviceId);
    const type = typeName !== undefined
      ? service?.types?.find(t => t.name === typeName)
      : undefined;
    setSelectedServices(prev => prev.includes(serviceId) ? prev : [...prev, serviceId]);
    if (type) setChosen(prev => ({ ...prev, [serviceId]: type }));
    setInitialCategory(service?.category);
    setScreen("select-datetime");
  };

  const openServiceDetails = (serviceId: number, returnTo: "landing" | "home" | "all-services") => {
    setDetailServiceId(serviceId);
    setDetailReturnScreen(returnTo);
    setScreen("service-details");
  };

  /* "See All Services" from the signed-in home page opens the same full services list as the landing page,
     but remembers the home page so Back returns there instead of the public landing page. */
  const openAllServices = (returnTo: "landing" | "home") => {
    setDetailReturnScreen(returnTo);
    setScreen("all-services");
  };

  const handleConfirm = ({ name, phone, notes }: { name: string; phone: string; notes: string }) => {
    setCustomerName(name);
    setCustomerPhone(phone);
    setCustomerNotes(notes);
    setScreen("confirm");
  };

  const resetBooking = () => {
    setSelectedServices([]);
    setChosen({});
    setSelectedDate("");
    setSelectedTime("");
    setSelectedStylist(null);
    setSelectedStylistName(null);
    setScreen("select-service");
  };

  if (checking) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0e0600" }}>
        <div style={{ textAlign: "center" }}>
          <SalonLogo />
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, marginTop: 8 }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {screen === "landing" && <LandingPage onLogin={handleLogin} onSeeAllServices={() => openAllServices("landing")} onOpenService={serviceId => openServiceDetails(serviceId, "landing")} />}
      {screen === "all-services" && <AllServicesPage onBack={() => setScreen(detailReturnScreen === "home" ? "home" : "landing")} onOpenService={serviceId => openServiceDetails(serviceId, "all-services")} />}
      
{screen === "service-details" && (
  <ServiceDetailsPage
    serviceId={detailServiceId}
    onBack={() => setScreen(detailReturnScreen)}
    onLogin={handleLogin}
    onBook={
      detailReturnScreen === "home"
        ? (serviceId) => bookService(serviceId)
        : undefined
    }
  />
)}

      {screen === "auth" && <AuthScreen onLogin={handleLogin} />}
      {screen === "home" && <HomeScreen onBook={handleBook} onMyBookings={() => setScreen("my-bookings")} onMessages={() => setScreen("messages")} onAbout={() => setScreen("about")} onLogout={handleLogout} onSeeAllServices={() => openAllServices("home")} onOpenService={serviceId => openServiceDetails(serviceId, "home")} userName={userName} />}
      {screen === "about" && <AboutScreen onHome={() => setScreen("home")} onBook={() => handleBook()} onMyBookings={() => setScreen("my-bookings")} onLogout={handleLogout} userName={userName} />}
      {screen === "select-service" && <SelectService selected={selectedServices} onToggle={toggleService} chosen={chosen} onChoose={handleChoose} onNext={() => setScreen("select-datetime")} onBack={() => setScreen("home")} initialCategory={initialCategory} />}
      {screen === "select-datetime" && <SelectDateTime selectedDate={selectedDate} selectedTime={selectedTime} onDateChange={setSelectedDate} onTimeChange={setSelectedTime} onNext={() => setScreen("choose-stylist")} onBack={() => setScreen("select-service")} />}
      {screen === "choose-stylist" && <ChooseStylist selected={selectedStylist} onSelect={(id, name) => { setSelectedStylist(id); setSelectedStylistName(name); }} onNext={() => setScreen("reservation")} onBack={() => setScreen("select-datetime")} />}
      {screen === "reservation" && <ReservationForm serviceIds={selectedServices} stylistId={selectedStylist} stylistName={selectedStylistName} date={selectedDate} time={selectedTime} chosen={chosen} onConfirm={handleConfirm} onBack={() => setScreen("choose-stylist")} />}
      {screen === "confirm" && <BookingConfirm serviceIds={selectedServices} stylistId={selectedStylist} stylistName={selectedStylistName} date={selectedDate} time={selectedTime} chosen={chosen} customerName={customerName} customerPhone={customerPhone} customerNotes={customerNotes} onDone={() => setScreen("my-bookings")} onNewBooking={resetBooking} />}

{screen === "service-details" && (
  <ServiceDetailsPage
    serviceId={detailServiceId}
    onBack={() => setScreen(detailReturnScreen)}
    onLogin={handleLogin}
   onBook={
  detailReturnScreen === "home"
    ? (serviceId) => bookService(serviceId)
    : undefined
}
  />
)}

      {screen === "messages" && <MessageCenter onBack={() => setScreen("home")} />}
      {screen === "admin" && <AdminDashboard onLogout={handleLogout} />}
      {screen === "stylist" && <StylistDashboard onLogout={handleLogout} userName={userName} />}
      {screen !== "admin" && screen !== "stylist" && screen !== "landing" && screen !== "home" && screen !== "about" && <SiteFooter />}
    </>
  );
}
