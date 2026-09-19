export type HairType = { name: string; time: string };

export const BOYS_HAIRCUTS: HairType[] = [
  { name: "Classic Cut",   time: "30 min" },
  { name: "Crew Cut",      time: "30 min" },
  { name: "Buzz Cut",      time: "20–30 min" },
  { name: "Fade Cut",      time: "30–45 min" },
  { name: "Low Fade",      time: "30–45 min" },
  { name: "Mid Fade",      time: "30–45 min" },
  { name: "High Fade",     time: "30–45 min" },
  { name: "Taper Cut",     time: "30–45 min" },
  { name: "Undercut",      time: "30–45 min" },
  { name: "Textured Cut",  time: "30–45 min" },
  { name: "Two-Block Cut", time: "45 min" },
  { name: "Side Part",     time: "30–45 min" },
];

export const GIRLS_HAIRCUTS: HairType[] = [
  { name: "Classic Bob",           time: "45 min" },
  { name: "Layered Cut",           time: "45–60 min" },
  { name: "Long Layer Cut",        time: "45–60 min" },
  { name: "Short Bob",             time: "45 min" },
  { name: "Lob (Long Bob)",        time: "45–60 min" },
  { name: "Wolf Cut",              time: "60 min" },
  { name: "Butterfly Cut",         time: "60 min" },
  { name: "Shag Cut",              time: "45–60 min" },
  { name: "U-Cut",                 time: "45 min" },
  { name: "V-Cut",                 time: "45 min" },
  { name: "Pixie Cut",             time: "45 min" },
  { name: "Curtain Bangs + Trim",  time: "30–45 min" },
];

export const SERVICES = [
  { id: 1, name: "Hair Cut", desc: "Professional Hair Cut and style", duration: "45 min", price: 350, img: "✂️" },
  { id: 2, name: "Hair Spa", desc: "Deep conditioning treatment", duration: "60 min", price: 480, img: "💆" },
  { id: 3, name: "Manicure", desc: "Nail care & Polish", duration: "40 min", price: 290, img: "💅" },
  { id: 4, name: "Hair Color", desc: "Professional Hair Coloring", duration: "90 min", price: 1200, img: "🎨" },
  { id: 5, name: "Facial", desc: "Deep cleansing facial", duration: "60 min", price: 550, img: "🧖" },
  { id: 6, name: "Blowout", desc: "Wash & blowdry styling", duration: "45 min", price: 320, img: "💨" },
];

export const STYLISTS = [
  { id: 1, name: "Christine Rory", role: "Hair Specialist", rating: 4.9, img: "👩" },
  { id: 2, name: "Monica Vargas", role: "Hair & Makeup", rating: 4.8, img: "👩‍🦱" },
  { id: 3, name: "Elisa Coppenger", role: "Nail Technician", rating: 4.7, img: "👩‍🦳" },
];

export const TIME_SLOTS = [
  "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "1:00 PM", "1:30 PM",
  "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM",
  "4:00 PM", "4:30 PM",
];

export const MOCK_BOOKINGS = [
  { id: 1, service: "Hair Cut", stylist: "Christine Rory", date: "Sep 10, 2026", time: "10:00 AM", status: "confirmed", price: 350 },
  { id: 2, service: "Hair Spa", stylist: "Monica Vargas", date: "Sep 14, 2026", time: "2:00 PM", status: "pending", price: 480 },
  { id: 3, service: "Manicure", stylist: "Elisa Coppenger", date: "Sep 18, 2026", time: "11:00 AM", status: "cancelled", price: 290 },
];

export const ADMIN_BOOKINGS = [
  { id: 1, customer: "Maria Santos", service: "Hair Cut", stylist: "Christine Rory", date: "Sep 10", time: "10:00 AM", status: "confirmed" },
  { id: 2, customer: "Ana Reyes", service: "Hair Spa", stylist: "Monica Vargas", date: "Sep 10", time: "11:00 AM", status: "pending" },
  { id: 3, customer: "Joy Cruz", service: "Manicure", stylist: "Elisa Coppenger", date: "Sep 11", time: "1:00 PM", status: "confirmed" },
  { id: 4, customer: "Lea Gomez", service: "Hair Color", stylist: "Christine Rory", date: "Sep 11", time: "2:00 PM", status: "pending" },
  { id: 5, customer: "Rose Tan", service: "Facial", stylist: "Monica Vargas", date: "Sep 12", time: "3:00 PM", status: "cancelled" },
];

// ── Booking store (localStorage) ──────────────────────────────────────────
export type Booking = {
  id: string;
  customer: string;
  phone: string;
  serviceIds: number[];
  stylistId: number | null;
  date: string;
  time: string;
  notes: string;
  status: "pending" | "confirmed" | "cancelled";
  createdAt: string;
};

const STORE_KEY = "salon_bookings";

export function getBookings(): Booking[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) || "[]");
  } catch { return []; }
}

export function saveBooking(b: Omit<Booking, "id" | "status" | "createdAt">): Booking {
  const bookings = getBookings();
  const newBooking: Booking = {
    ...b,
    id: Date.now().toString(),
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  bookings.unshift(newBooking);
  localStorage.setItem(STORE_KEY, JSON.stringify(bookings));
  return newBooking;
}

export function updateBookingStatus(id: string, status: Booking["status"]): void {
  const bookings = getBookings();
  const idx = bookings.findIndex(b => b.id === id);
  if (idx !== -1) {
    bookings[idx].status = status;
    localStorage.setItem(STORE_KEY, JSON.stringify(bookings));
  }
}
