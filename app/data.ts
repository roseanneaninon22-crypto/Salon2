export type HairType = { name: string; time: string; price: number };

/* Service categories shown on the home page and the Select Services page.
   Each category groups one or more bookable services. */
export type ServiceItem = {
  id: number;
  name: string;
  desc: string;
  duration: string;
  price: number;        // used when the service has a single fixed price
  img: string;
  priced?: boolean;     // true when the price comes from the chosen type instead
  types?: HairType[];   // selectable types / variants for this service
  typeLabel?: string;   // singular noun used in "View ... types"
  columnsHeader?: string;
};

export type Category = {
  icon: string;
  label: string;
  name: string;
  desc: string;
  services: ServiceItem[];
};

/* Women's haircut types */
export const WOMENS_HAIRCUTS: HairType[] = [
  { name: "Long Layers",        time: "45–60 min", price: 450 },
  { name: "Short Layers",       time: "45–60 min", price: 420 },
  { name: "Bob Cut",            time: "45 min",     price: 400 },
  { name: "Lob (Long Bob)",     time: "45–60 min", price: 450 },
  { name: "Pixie Cut",          time: "45 min",     price: 380 },
  { name: "Wolf Cut",           time: "60 min",     price: 550 },
  { name: "Butterfly Cut",      time: "60 min",     price: 550 },
  { name: "Shag Cut",           time: "45–60 min", price: 480 },
  { name: "Blunt Cut",          time: "45 min",     price: 400 },
  { name: "U-Cut",              time: "45 min",     price: 380 },
  { name: "V-Cut",              time: "45 min",     price: 380 },
  { name: "Face-Framing Cut",   time: "45–60 min", price: 420 },
  { name: "Curtain Bangs",      time: "30–45 min", price: 250 },
  { name: "Side-Swept Bangs",   time: "30–45 min", price: 250 },
  { name: "Wispy Bangs",        time: "30–45 min", price: 250 },
];

/* Men's haircut types */
export const MENS_HAIRCUTS: HairType[] = [
  { name: "Classic Cut",     time: "30 min",     price: 300 },
  { name: "Buzz Cut",        time: "20–30 min", price: 250 },
  { name: "Crew Cut",        time: "30 min",     price: 280 },
  { name: "Fade Cut",        time: "30–45 min", price: 320 },
  { name: "Low Fade",        time: "30–45 min", price: 330 },
  { name: "Mid Fade",        time: "30–45 min", price: 330 },
  { name: "High Fade",       time: "30–45 min", price: 340 },
  { name: "Taper Fade",      time: "30–45 min", price: 320 },
  { name: "Undercut",        time: "30–45 min", price: 350 },
  { name: "French Crop",     time: "30–45 min", price: 320 },
  { name: "Caesar Cut",      time: "30 min",     price: 280 },
  { name: "Two-Block Cut",   time: "45 min",     price: 380 },
  { name: "Comma Haircut",   time: "30–45 min", price: 350 },
  { name: "Textured Crop",   time: "30–45 min", price: 330 },
  { name: "Pompadour",       time: "30–45 min", price: 350 },
  { name: "Quiff",           time: "30–45 min", price: 350 },
  { name: "Side Part",       time: "30–45 min", price: 320 },
  { name: "Slick Back",      time: "30–45 min", price: 340 },
  { name: "Mullet",          time: "45 min",     price: 380 },
  { name: "Curtain Haircut", time: "45 min",     price: 380 },
];

/* Kids' haircut types */
export const KIDS_HAIRCUTS: HairType[] = [
  { name: "Kids Bob Cut",       time: "30–45 min", price: 250 },
  { name: "Kids Layered Cut",   time: "30–45 min", price: 260 },
  { name: "Kids Pixie Cut",     time: "30 min",     price: 220 },
  { name: "Classic Short Cut",  time: "30 min",     price: 220 },
  { name: "Kids Fade",          time: "20–30 min", price: 200 },
  { name: "Kids Crew Cut",      time: "20–30 min", price: 200 },
  { name: "Kids Undercut",      time: "30 min",     price: 240 },
  { name: "Kids Mullet",        time: "30–45 min", price: 260 },
];

/* Hair color types (🎨 Hair Color) */
export const HAIR_COLOR_TYPES: HairType[] = [
  { name: "Full Hair Color",      time: "90 min", price: 1200 },
  { name: "Root Touch-Up",        time: "45 min", price: 650 },
  { name: "Jet Black",            time: "75 min", price: 950 },
  { name: "Dark Brown",           time: "90 min", price: 1100 },
  { name: "Chocolate Brown",      time: "90 min", price: 1150 },
  { name: "Light Brown",          time: "90 min", price: 1100 },
  { name: "Honey Blonde",         time: "120 min", price: 1400 },
  { name: "Ash Blonde",           time: "120 min", price: 1400 },
  { name: "Platinum Blonde",      time: "150 min", price: 1700 },
  { name: "Ash Brown",            time: "90 min", price: 1150 },
  { name: "Burgundy",             time: "90 min", price: 1200 },
  { name: "Mahogany",             time: "90 min", price: 1200 },
  { name: "Wine Red",             time: "90 min", price: 1200 },
  { name: "Copper",               time: "90 min", price: 1200 },
  { name: "Silver Grey",          time: "150 min", price: 1700 },
  { name: "Mocha Brown",          time: "90 min", price: 1150 },
  { name: "Chestnut Brown",       time: "90 min", price: 1150 },
  { name: "Black Hair Color",     time: "75 min", price: 950 },
  { name: "Fashion Colors",       time: "120 min", price: 1800 },
  { name: "Color Correction",     time: "150 min", price: 2500 },
];

/* Hair spa types */
export const HAIR_SPA_TYPES: HairType[] = [
  { name: "Basic Hair Spa",           time: "45 min", price: 480 },
  { name: "Keratin Hair Spa",         time: "90 min", price: 1200 },
  { name: "Deep Conditioning Spa",    time: "60 min", price: 650 },
  { name: "Scalp Detox Spa",          time: "60 min", price: 700 },
  { name: "Anti-Dandruff Hair Spa",   time: "60 min", price: 620 },
  { name: "Hair Fall Control Spa",    time: "75 min", price: 850 },
  { name: "Dry & Damaged Hair Spa",   time: "75 min", price: 800 },
  { name: "Oil Therapy Hair Spa",     time: "60 min", price: 600 },
  { name: "Color Protection Spa",     time: "60 min", price: 750 },
  { name: "Protein Hair Spa",         time: "90 min", price: 950 },
  { name: "Scalp Massage Spa",        time: "45 min", price: 520 },
  { name: "Anti-Frizz Hair Spa",      time: "60 min", price: 680 },
  { name: "Rebonded Hair Spa",        time: "90 min", price: 1000 },
  { name: "Hair Growth Care Spa",     time: "75 min", price: 880 },
  { name: "Luxury Hair Spa",          time: "120 min", price: 1500 },
];

/* ── Nails ── */
export const MANICURE_TYPES: HairType[] = [
  { name: "Classic Manicure",     time: "40 min", price: 290 },
  { name: "Gel Manicure",         time: "60 min", price: 550 },
  { name: "Acrylic Nails",        time: "90 min", price: 850 },
  { name: "Nail Extension",       time: "90 min", price: 900 },
  { name: "Nail Art (per nail)",  time: "15 min", price: 60 },
];

export const PEDICURE_TYPES: HairType[] = [
  { name: "Classic Pedicure",   time: "45 min", price: 350 },
  { name: "Gel Pedicure",       time: "60 min", price: 600 },
  { name: "Spa Pedicure",       time: "75 min", price: 750 },
  { name: "Foot Spa & Scrub",   time: "60 min", price: 650 },
];

/* ── Spa ── */
export const BODY_MASSAGE_TYPES: HairType[] = [
  { name: "Swedish Massage",     time: "60 min",  price: 800 },
  { name: "Deep Tissue Massage", time: "60 min",  price: 950 },
  { name: "Hot Stone Massage",   time: "75 min",  price: 1100 },
  { name: "Aromatherapy Massage",time: "90 min",  price: 1250 },
];

/* ── Makeup ── */
export const MAKEUP_TYPES: HairType[] = [
  { name: "Natural Day Makeup",   time: "45 min",  price: 700 },
  { name: "Glam Evening Makeup",  time: "75 min",  price: 1200 },
  { name: "Bridal Makeup",        time: "120 min", price: 2500 },
  { name: "Photoshoot Makeup",    time: "90 min",  price: 1500 },
];

/* ── Face ── */
export const FACIAL_TYPES: HairType[] = [
  { name: "Classic Facial",        time: "60 min", price: 550 },
  { name: "Hydrating Facial",      time: "60 min", price: 700 },
  { name: "Anti-Aging Facial",     time: "75 min", price: 950 },
  { name: "Acne Treatment Facial", time: "75 min", price: 850 },
  { name: "Diamond Peel",          time: "60 min", price: 1000 },
];

export const EYEBROW_TYPES: HairType[] = [
  { name: "Eyebrow Threading", time: "20 min", price: 150 },
  { name: "Eyebrow Shaping",   time: "30 min", price: 200 },
  { name: "Eyebrow Tint",      time: "30 min", price: 350 },
  { name: "Eyelash Extension", time: "90 min", price: 900 },
];

/* ── Waxing ── */
export const WAXING_TYPES: HairType[] = [
  { name: "Underarm Wax",      time: "20 min", price: 250 },
  { name: "Half Leg Wax",      time: "30 min", price: 400 },
  { name: "Full Leg Wax",      time: "45 min", price: 650 },
  { name: "Arm Wax",           time: "30 min", price: 350 },
  { name: "Full Body Wax",     time: "90 min", price: 1800 },
  { name: "Bikini Wax",        time: "30 min", price: 550 },
  { name: "Chest & Back Wax",  time: "45 min", price: 800 },
];

export const CATEGORIES: Category[] = [
  {
    icon: "💇", label: "Hair", name: "Hair Services", desc: "Cuts, styling and treatments",
    services: [
      { id: 1, name: "Hair Cut", desc: "Professional Hair Cut and style", duration: "45 min", price: 350, img: "✂️",
        priced: true, typeLabel: "haircut", columnsHeader: "Haircut", types: [...WOMENS_HAIRCUTS, ...MENS_HAIRCUTS, ...KIDS_HAIRCUTS] },
      { id: 2, name: "Hair Spa", desc: "Deep conditioning treatment", duration: "60 min", price: 480, img: "💆",
        priced: true, typeLabel: "hair spa", columnsHeader: "Hair Spa", types: HAIR_SPA_TYPES },
      { id: 4, name: "Hair Color", desc: "Professional Hair Coloring", duration: "90 min", price: 1200, img: "🎨",
        priced: true, typeLabel: "hair color", columnsHeader: "Hair Color", types: HAIR_COLOR_TYPES },
    ],
  },
  {
    icon: "💅", label: "Nails", name: "Nail Care", desc: "Manicure and nail art",
    services: [
      { id: 3, name: "Manicure", desc: "Nail care & polish", duration: "40 min", price: 290, img: "💅",
        priced: true, typeLabel: "manicure", columnsHeader: "Manicure", types: MANICURE_TYPES },
    ],
  },
  {
    icon: "💄", label: "Makeup", name: "Makeup", desc: "For events and everyday looks",
    services: [
      { id: 9, name: "Makeup", desc: "Professional makeup application", duration: "75 min", price: 1200, img: "💄",
        priced: true, typeLabel: "makeup", columnsHeader: "Makeup", types: MAKEUP_TYPES },
    ],
  },
  {
    icon: "👩", label: "Face", name: "Face Care", desc: "Facials and brow services",
    services: [
      { id: 5, name: "Facial", desc: "Deep cleansing facial", duration: "60 min", price: 550, img: "🧖",
        priced: true, typeLabel: "facial", columnsHeader: "Facial", types: FACIAL_TYPES },
      { id: 10, name: "Eyebrow & Lashes", desc: "Brow shaping and lash services", duration: "30 min", price: 200, img: "👁️",
        priced: true, typeLabel: "brow", columnsHeader: "Treatment", types: EYEBROW_TYPES },
    ],
  },
  {
    icon: "🧴", label: "Waxing", name: "Waxing", desc: "Smooth skin treatments",
    services: [
      { id: 11, name: "Waxing", desc: "Smooth hair removal", duration: "45 min", price: 650, img: "🧴",
        priced: true, typeLabel: "waxing", columnsHeader: "Waxing", types: WAXING_TYPES },
    ],
  },
];

/* Flat list of every bookable service, with its category attached */
export const SERVICES: (ServiceItem & { category: string })[] = CATEGORIES.flatMap(c =>
  c.services.map(s => ({ ...s, category: c.label }))
);

/* The home and public landing page show a compact preview.  Keep it derived
   from the public catalog so every preview card is also available in the
   complete "See All Services" list. */
export const FEATURED_SERVICES = SERVICES.slice(0, 4);

/* Services that are retired from the booking menu but are still listed in the
   admin dashboard's Services page (so they can be deleted from Supabase). */
export const ADMIN_ONLY_SERVICES: (ServiceItem & { category: string })[] = [
  { id: 7, name: "Pedicure", desc: "Foot care & polish", duration: "45 min", price: 350, img: "🦶",
    priced: true, typeLabel: "pedicure", columnsHeader: "Pedicure", types: PEDICURE_TYPES, category: "Nails" },
];

/* Move a retired service from ADMIN_ONLY_SERVICES into CATEGORIES to bring it
   back to the customer-facing menu. */

/* Look up a service by id */
export function getService(id: number) {
  return SERVICES.find(s => s.id === id);
}

/* Price to show for a service: the cheapest of its types when the service is
   type-based (its own `price` field is only a starting reference), else its fixed price. */
export function servicePrice(id: number): number {
  const s = getService(id);
  if (!s) return 0;
  if (s.priced && s.types?.length) return Math.min(...s.types.map(t => t.price));
  return s.price;
}

/* Find a type (e.g. "Bob Cut") anywhere across all services */
export function findType(name: string, serviceId?: number): HairType | undefined {
  if (serviceId != null) {
    const s = getService(serviceId);
    const hit = s?.types?.find(t => t.name === name);
    if (hit) return hit;
  }
  for (const s of SERVICES) {
    const hit = s.types?.find(t => t.name === name);
    if (hit) return hit;
  }
  return undefined;
}

/* Total for a set of services, resolving types from the booking notes */
export function totalForServices(ids: number[], notes = ""): number {
  return ids.reduce((sum, id) => {
    const s = getService(id);
    if (!s) return sum;
    if (s.priced && s.types?.length) {
      /* Prefer a type the customer named in the notes, else the cheapest */
      const named = s.types.find(t => notes.includes(t.name));
      return sum + (named?.price ?? Math.min(...s.types.map(t => t.price)));
    }
    return sum + s.price;
  }, 0);
}


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
  stylistId: string | null;
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
