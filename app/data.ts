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
