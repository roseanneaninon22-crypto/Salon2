"use client";
import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import { HairType } from "./data";
import AuthScreen from "./components/AuthScreen";
import HomeScreen from "./components/HomeScreen";
import SelectService from "./components/SelectService";
import SelectDateTime from "./components/SelectDateTime";
import ChooseStylist from "./components/ChooseStylist";
import ReservationForm from "./components/ReservationForm";
import BookingConfirm from "./components/BookingConfirm";
import MyBookings from "./components/MyBookings";
import AdminDashboard from "./components/AdminDashboard";
import SiteFooter from "./components/SiteFooter";
import AboutScreen from "./components/AboutScreen";

type Screen = "auth" | "home" | "about" | "select-service" | "select-datetime" | "choose-stylist" | "reservation" | "confirm" | "my-bookings" | "admin";

function getDisplayName(profileName: unknown, metadata: Record<string, unknown>) {
  const candidates = [profileName, metadata.full_name, metadata.name];
  return candidates.find(
    (value): value is string => typeof value === "string" && value.trim().length > 0 && !value.includes("@"),
  )?.trim() ?? "there";
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("auth");
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

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        // Read role from customers table so admin changes take effect immediately
        const { data: customer } = await supabase
          .from("users")
          .select("role, full_name")
          .eq("user_id", session.user.id)
          .maybeSingle();
        const role = customer?.role ?? "user";
        setUserName(getDisplayName(customer?.full_name, session.user.user_metadata));
        setScreen(role === "admin" ? "admin" : "home");
      }
      setChecking(false);
    });
  }, []);

  const handleLogin = (role: "user" | "admin") => {
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
    setScreen(role === "admin" ? "admin" : "home");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setScreen("auth");
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
          <p style={{ fontSize: 40, marginBottom: 12 }}>💇</p>
          <p style={{ color: "var(--pink)", fontWeight: 700, fontSize: 16 }}>ROSSEY GIRL SALON</p>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, marginTop: 8 }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {screen === "auth" && <AuthScreen onLogin={handleLogin} />}
      {screen === "home" && <HomeScreen onBook={handleBook} onMyBookings={() => setScreen("my-bookings")} onAbout={() => setScreen("about")} onLogout={handleLogout} userName={userName} />}
      {screen === "about" && <AboutScreen onHome={() => setScreen("home")} onBook={() => handleBook()} onMyBookings={() => setScreen("my-bookings")} onLogout={handleLogout} userName={userName} />}
      {screen === "select-service" && <SelectService selected={selectedServices} onToggle={toggleService} chosen={chosen} onChoose={handleChoose} onNext={() => setScreen("select-datetime")} onBack={() => setScreen("home")} initialCategory={initialCategory} />}
      {screen === "select-datetime" && <SelectDateTime selectedDate={selectedDate} selectedTime={selectedTime} onDateChange={setSelectedDate} onTimeChange={setSelectedTime} onNext={() => setScreen("choose-stylist")} onBack={() => setScreen("select-service")} />}
      {screen === "choose-stylist" && <ChooseStylist selected={selectedStylist} onSelect={(id, name) => { setSelectedStylist(id); setSelectedStylistName(name); }} onNext={() => setScreen("reservation")} onBack={() => setScreen("select-datetime")} />}
      {screen === "reservation" && <ReservationForm serviceIds={selectedServices} stylistName={selectedStylistName} date={selectedDate} time={selectedTime} chosen={chosen} onConfirm={handleConfirm} onBack={() => setScreen("choose-stylist")} />}
      {screen === "confirm" && <BookingConfirm serviceIds={selectedServices} stylistId={selectedStylist} stylistName={selectedStylistName} date={selectedDate} time={selectedTime} chosen={chosen} customerName={customerName} customerPhone={customerPhone} customerNotes={customerNotes} onDone={() => setScreen("my-bookings")} onNewBooking={resetBooking} />}
      {screen === "my-bookings" && <MyBookings onBack={() => setScreen("home")} onBook={() => setScreen("select-service")} />}
      {screen === "admin" && <AdminDashboard onLogout={handleLogout} />}
      {screen !== "admin" && <SiteFooter />}
    </>
  );
}
