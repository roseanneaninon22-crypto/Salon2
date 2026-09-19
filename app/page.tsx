"use client";
import { useState } from "react";
import AuthScreen from "./components/AuthScreen";
import HomeScreen from "./components/HomeScreen";
import SelectService from "./components/SelectService";
import SelectDateTime from "./components/SelectDateTime";
import ChooseStylist from "./components/ChooseStylist";
import ReservationForm from "./components/ReservationForm";
import BookingConfirm from "./components/BookingConfirm";
import MyBookings from "./components/MyBookings";
import AdminDashboard from "./components/AdminDashboard";

type Screen = "auth" | "home" | "select-service" | "select-datetime" | "choose-stylist" | "reservation" | "confirm" | "my-bookings" | "admin";

export default function App() {
  const [screen, setScreen] = useState<Screen>("auth");
  const [role, setRole] = useState<"user" | "admin">("user");

  // Booking state
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedStylist, setSelectedStylist] = useState<number | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [loggedInName, setLoggedInName]     = useState("");
  const [loggedInPhone, setLoggedInPhone]   = useState("");
  const [loggedInUsername, setLoggedInUsername] = useState("");

  const handleLogin = (r: "user" | "admin", name: string, phone: string, username: string) => {
    setRole(r);
    setLoggedInName(name);
    setLoggedInPhone(phone);
    setLoggedInUsername(username);
    setScreen(r === "admin" ? "admin" : "home");
  };

  const handleLogout = () => {
    setScreen("auth");
    setSelectedServices([]);
    setSelectedDate("");
    setSelectedTime("");
    setSelectedStylist(null);
  };

  const toggleService = (id: number) =>
    setSelectedServices(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);

  const handleConfirm = ({ name, phone, notes }: { name: string; phone: string; notes: string }) => {
    setCustomerName(name);
    setCustomerPhone(phone);
    setCustomerNotes(notes);
    setScreen("confirm");
  };

  const resetBooking = () => {
    setSelectedServices([]);
    setSelectedDate("");
    setSelectedTime("");
    setSelectedStylist(null);
    setScreen("select-service");
  };

  return (
    <>
      {screen === "auth" && <AuthScreen onLogin={handleLogin} />}
      {screen === "home" && (
        <HomeScreen
          onBook={() => setScreen("select-service")}
          onMyBookings={() => setScreen("my-bookings")}
          onLogout={handleLogout}
          userName={loggedInUsername || loggedInName}
        />
      )}
      {screen === "select-service" && (
        <SelectService
          selected={selectedServices}
          onToggle={toggleService}
          onNext={() => setScreen("select-datetime")}
          onBack={() => setScreen("home")}
        />
      )}
      {screen === "select-datetime" && (
        <SelectDateTime
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          onDateChange={setSelectedDate}
          onTimeChange={setSelectedTime}
          onNext={() => setScreen("choose-stylist")}
          onBack={() => setScreen("select-service")}
        />
      )}
      {screen === "choose-stylist" && (
        <ChooseStylist
          selected={selectedStylist}
          onSelect={setSelectedStylist}
          onNext={() => setScreen("reservation")}
          onBack={() => setScreen("select-datetime")}
        />
      )}
      {screen === "reservation" && (
        <ReservationForm
          serviceIds={selectedServices}
          stylistId={selectedStylist}
          date={selectedDate}
          time={selectedTime}
          defaultName={loggedInName}
          defaultPhone={loggedInPhone}
          onConfirm={handleConfirm}
          onBack={() => setScreen("choose-stylist")}
        />
      )}
      {screen === "confirm" && (
        <BookingConfirm
          serviceIds={selectedServices}
          stylistId={selectedStylist}
          date={selectedDate}
          time={selectedTime}
          customerName={customerName}
          customerPhone={customerPhone}
          customerNotes={customerNotes}
          onDone={() => setScreen("my-bookings")}
          onNewBooking={resetBooking}
        />
      )}
      {screen === "my-bookings" && <MyBookings onBack={() => setScreen("home")} onBook={() => setScreen("select-service")} />}
      {screen === "admin" && <AdminDashboard onLogout={handleLogout} />}
    </>
  );
}
