"use client";

import { useState } from "react";
import { KIDS_HAIRCUTS, MENS_HAIRCUTS, SERVICES, WOMENS_HAIRCUTS } from "../data";
import AuthScreen from "./AuthScreen";
import SalonLogo from "./SalonLogo";

type AppRole = "user" | "admin" | "stylist";
type Props = { serviceId: number; onBack: () => void; onLogin: (role: AppRole) => void; onBook?: (serviceId: number) => void };

const KIDS_HAIRCUT_IMAGES: Record<string, string> = {
  "Kids Bob Cut": "/kidshaircut/bobcut.png",
  "Kids Layered Cut": "/kidshaircut/kid%20layered.png",
  "Kids Pixie Cut": "/kidshaircut/pixie%20cut.png",
  "Classic Short Cut": "/kidshaircut/classic.png",
  "Kids Fade": "/kidshaircut/kids%20fade.png",
  "Kids Crew Cut": "/kidshaircut/crew%20cut.png",
  "Kids Undercut": "/kidshaircut/kids%20undercut.png",
  "Kids Mullet": "/kidshaircut/kids%20mullet.png",
};

const WOMENS_HAIRCUT_IMAGES: Record<string, string> = {
  "Long Layers": "/womens%20hair/long_layers.png",
  "Short Layers": "/womens%20hair/short_layers.png",
  "Bob Cut": "/womens%20hair/bob_cut.png",
  "Lob (Long Bob)": "/womens%20hair/lob_long_bob.png",
  "Pixie Cut": "/womens%20hair/pixie_cut.png",
  "Wolf Cut": "/womens%20hair/wolf_cut.png",
  "Butterfly Cut": "/womens%20hair/butterfly_cut.png",
  "Shag Cut": "/womens%20hair/shag_cut.png",
  "Blunt Cut": "/womens%20hair/blunt_cut.png",
  "U-Cut": "/womens%20hair/u_cut.png",
  "V-Cut": "/womens%20hair/v_cut.png",
  "Face-Framing Cut": "/womens%20hair/face_framing_cut.png",
  "Curtain Bangs": "/womens%20hair/curtain_bangs.png",
  "Side-Swept Bangs": "/womens%20hair/side_swept_bangs.png",
  "Wispy Bangs": "/womens%20hair/wispy_bangs.png",
};

const MENS_HAIRCUT_IMAGES: Record<string, string> = {
  "Classic Cut": "/services/01_Classic_Cut.jpg",
  "Buzz Cut": "/services/02_Buzz_Cut.jpg",
  "Crew Cut": "/services/03_Crew_Cut.jpg",
  "Fade Cut": "/services/04_Fade_Cut.jpg",
  "Low Fade": "/services/05_Low_Fade.jpg",
  "Mid Fade": "/services/06_Mid_Fade.jpg",
  "High Fade": "/services/07_High_Fade.jpg",
  "Taper Fade": "/services/08_Taper_Fade.jpg",
  "Undercut": "/services/09_Undercut.jpg",
  "French Crop": "/services/10_French_Crop.jpg",
  "Caesar Cut": "/services/16_Caesar_Cut.jpg",
  "Two-Block Cut": "/services/17_Two_Block_Cut.jpg",
  "Comma Haircut": "/services/18_Comma_Hairstyle.jpg",
  "Textured Crop": "/services/19_Textured_Crop.jpg",
  "Pompadour": "/services/20_Pompadour.jpg",
  "Quiff": "/services/20_Pompadour.jpg",
  "Side Part": "/services/01_Classic_Cut.jpg",
  "Slick Back": "/services/14_Undercut_Longer_Top.jpg",
  "Mullet": "/services/12_High_Fade_Long.jpg",
  "Curtain Haircut": "/services/18_Comma_Hairstyle.jpg",
};

const HAIR_SPA_IMAGES: Record<string, string> = {
  "Basic Hair Spa": "/Hair%20spa/01_Basic_Hair_Spa.jpg",
  "Keratin Hair Spa": "/Hair%20spa/02_Keratin_Hair_Spa.jpg",
  "Deep Conditioning Spa": "/Hair%20spa/03_Deep_Conditioning_Spa.jpg",
  "Scalp Detox Spa": "/Hair%20spa/04_Scalp_Detox_Spa.jpg",
  "Anti-Dandruff Hair Spa": "/Hair%20spa/05_Anti_Dandruff_Hair_Spa.jpg",
  "Hair Fall Control Spa": "/Hair%20spa/06_Hair_Fall_Control_Spa.jpg",
  "Dry & Damaged Hair Spa": "/Hair%20spa/07_Dry_Damaged_Hair_Spa.jpg",
  "Oil Therapy Hair Spa": "/Hair%20spa/08_Oil_Therapy_Hair_Spa.jpg",
  "Color Protection Spa": "/Hair%20spa/09_Color_Protection_Spa.jpg",
  "Protein Hair Spa": "/Hair%20spa/10_Protein_Hair_Spa.jpg",
  "Scalp Massage Spa": "/Hair%20spa/11_Scalp_Massage_Spa.jpg",
  "Anti-Frizz Hair Spa": "/Hair%20spa/12_Anti_Frizz_Hair_Spa.jpg",
  "Rebonded Hair Spa": "/Hair%20spa/13_Rebonded_Hair_Spa.jpg",
  "Hair Growth Care Spa": "/Hair%20spa/14_Hair_Growth_Care_Spa.jpg",
  "Luxury Hair Spa": "/Hair%20spa/15_Luxury_Hair_Spa.jpg",
};

const HAIR_COLOR_IMAGES: Record<string, string> = {
  "Full Hair Color": "/hair%20color/Full_Hair_Color.png",
  "Root Touch-Up": "/hair%20color/Root_Touch_Up.png",
  "Jet Black": "/hair%20color/Jet_Black.png",
  "Dark Brown": "/hair%20color/Dark_Brown.png",
  "Chocolate Brown": "/hair%20color/Chocolate_Brown.png",
  "Light Brown": "/hair%20color/Light_Brown.png",
  "Honey Blonde": "/hair%20color/Honey_Blonde.png",
  "Ash Blonde": "/hair%20color/Ash_Blonde.png",
  "Platinum Blonde": "/hair%20color/Platinum_Blonde.png",
  "Ash Brown": "/hair%20color/Ash_Brown.png",
  "Burgundy": "/hair%20color/Burgundy.png",
  "Mahogany": "/hair%20color/Mahogany.png",
  "Wine Red": "/hair%20color/Wine_Red.png",
  "Copper": "/hair%20color/Copper.png",
  "Silver Grey": "/hair%20color/Silver_Grey.png",
  "Mocha Brown": "/hair%20color/Mocha_Brown.png",
  "Chestnut Brown": "/hair%20color/Chestnut_Brown.png",
  "Black Hair Color": "/hair%20color/Black_Hair_Color.png",
  "Fashion Colors": "/hair%20color/Full_Hair_Color.png",
  "Color Correction": "/hair%20color/Color_Correction.png",
};

const MANICURE_IMAGES: Record<string, string> = {
  "Classic Manicure": "/Manicure/Classic_Manicure.png",
  "Gel Manicure": "/Manicure/Gel_Manicure.png",
  "Acrylic Nails": "/Manicure/Acrylic_Nails.png",
  "Nail Extension": "/Manicure/Nail_Extension.png",
  "Nail Art (per nail)": "/Manicure/Nail_Art.png",
};

export function getServiceOptionImage(serviceId: number, optionName: string): string | undefined {
  if (serviceId === 1) return KIDS_HAIRCUT_IMAGES[optionName] ?? WOMENS_HAIRCUT_IMAGES[optionName] ?? MENS_HAIRCUT_IMAGES[optionName] ?? "/services/hair-cut-card.webp";
  if (serviceId === 2) return HAIR_SPA_IMAGES[optionName];
  if (serviceId === 3) return MANICURE_IMAGES[optionName];
  if (serviceId === 4) return HAIR_COLOR_IMAGES[optionName];
  return undefined;
}

export default function ServiceDetailsPage({ serviceId, onBack, onLogin, onBook }: Props) {
  const [authOpen, setAuthOpen] = useState(false);
  const [haircutCategory, setHaircutCategory] = useState<"All" | "Women" | "Men" | "Kids">("All");
  const [haircutSearch, setHaircutSearch] = useState("");
  const [haircutPriceFilter, setHaircutPriceFilter] = useState("all");
  const [treatmentSearch, setTreatmentSearch] = useState("");
  const [treatmentPriceFilter, setTreatmentPriceFilter] = useState("all");
  const service = SERVICES.find(item => item.id === serviceId);
  const haircutOptions = {
    All: [...WOMENS_HAIRCUTS, ...MENS_HAIRCUTS, ...KIDS_HAIRCUTS],
    Women: WOMENS_HAIRCUTS,
    Men: MENS_HAIRCUTS,
    Kids: KIDS_HAIRCUTS,
  }[haircutCategory];
  const visibleHaircutOptions = haircutOptions.filter(option => {
    const matchesSearch = option.name.toLowerCase().includes(haircutSearch.trim().toLowerCase());
    const matchesPrice = haircutPriceFilter === "all"
      || (haircutPriceFilter === "under-300" && option.price <= 300)
      || (haircutPriceFilter === "301-450" && option.price > 300 && option.price <= 450)
      || (haircutPriceFilter === "over-450" && option.price > 450);
    return matchesSearch && matchesPrice;
  });
  const visibleTreatmentOptions = (service?.types ?? []).filter(option => {
    const matchesSearch = option.name.toLowerCase().includes(treatmentSearch.trim().toLowerCase());
    const matchesPrice = treatmentPriceFilter === "all"
      || (treatmentPriceFilter === "under-1000" && option.price < 1000)
      || (treatmentPriceFilter === "1000-1499" && option.price >= 1000 && option.price < 1500)
      || (treatmentPriceFilter === "1500-up" && option.price >= 1500);
    return matchesSearch && matchesPrice;
  });

  return (
    <main className="service-details-page">
      <nav className="site-nav">
        <SalonLogo />
        <button className="btn-ghost" type="button" onClick={onBack}>{onBook ? "Back to Home" : "Back to Services"}</button>
      </nav>

      {!service ? (
        <section className="service-details-content"><h1>Service not found</h1></section>
      ) : (
        <section className={`service-details-content${[1, 3, 4, 7, 9].includes(service.id) ? " service-details-expanded-content" : ""}`}>
          <p className="landing-eyebrow">{service.category}</p>
          <div className="service-details-heading">
            <div>
              <h1>{service.name}</h1>
              <p>{service.desc}</p>
            </div>
            <span className="service-details-icon" aria-hidden="true">{service.img}</span>
          </div>

          <h2 className="service-options-title">{service.types?.length ? "Available Options" : "Service Details"}</h2>
          {service.types?.length ? (
            <>
              {service.id === 1 && (
                <div className="haircut-category-tabs" role="tablist" aria-label="Haircut category">
                  {(["All", "Women", "Men", "Kids"] as const).map(category => (
                    <button
                      key={category}
                      type="button"
                      role="tab"
                      aria-selected={haircutCategory === category}
                      className={haircutCategory === category ? "haircut-category-tab active" : "haircut-category-tab"}
                      onClick={() => setHaircutCategory(category)}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              )}
              {service.id === 1 && (
                <div className="haircut-search-filters">
                  <input
                    type="search"
                    value={haircutSearch}
                    onChange={event => setHaircutSearch(event.target.value)}
                    placeholder={haircutCategory === "All" ? "Search all haircuts" : `Search ${haircutCategory.toLowerCase()} haircuts`}
                    aria-label="Search haircut styles"
                  />
                  <select
                    value={haircutPriceFilter}
                    onChange={event => setHaircutPriceFilter(event.target.value)}
                    aria-label="Filter haircuts by price"
                  >
                    <option value="all">All prices</option>
                    <option value="under-300">Up to &#8369;300</option>
                    <option value="301-450">&#8369;301&#8211;&#8369;450</option>
                    <option value="over-450">Over &#8369;450</option>
                  </select>
                </div>
              )}
              {(service.id === 2 || service.id === 4) && (
                <div className="haircut-search-filters">
                  <input
                    type="search"
                    value={treatmentSearch}
                    onChange={event => setTreatmentSearch(event.target.value)}
                    placeholder={`Search ${service.name.toLowerCase()} options`}
                    aria-label={`Search ${service.name} options`}
                  />
                  <select
                    value={treatmentPriceFilter}
                    onChange={event => setTreatmentPriceFilter(event.target.value)}
                    aria-label={`Filter ${service.name} options by price`}
                  >
                    <option value="all">All prices</option>
                    <option value="under-1000">Under &#8369;1,000</option>
                    <option value="1000-1499">&#8369;1,000–&#8369;1,499</option>
                    <option value="1500-up">&#8369;1,500 and up</option>
                  </select>
                </div>
              )}
              <div className="service-options-list">
              {(service.id === 1 ? visibleHaircutOptions : service.id === 2 || service.id === 4 ? visibleTreatmentOptions : service.types).map(option => (
                <article className="service-option-card" key={option.name}>
                  {([1, 2, 3, 4].includes(service.id)) && (
                    <img
                      className="service-option-image"
                      src={service.id === 2
                        ? HAIR_SPA_IMAGES[option.name]
                        : service.id === 3
                          ? MANICURE_IMAGES[option.name]
                        : service.id === 4
                          ? HAIR_COLOR_IMAGES[option.name]
                          : KIDS_HAIRCUT_IMAGES[option.name] ?? WOMENS_HAIRCUT_IMAGES[option.name] ?? MENS_HAIRCUT_IMAGES[option.name] ?? "/services/hair-cut-card.webp"}
                      alt={`${option.name} ${service.name.toLowerCase()}`}
                    />
                  )}
                  <div>
                    <h3>{option.name}</h3>
                    <p>{option.time}</p>
                  </div>
                  <strong>₱{option.price}</strong>
                  <button className="btn-pink" type="button" onClick={() => (onBook ? onBook(service.id) : setAuthOpen(true))}>Book Now</button>
                </article>
              ))}
              {service.id === 1 && visibleHaircutOptions.length === 0 && (
                <p className="haircut-no-results">No haircuts match your search and price filter.</p>
              )}
              {(service.id === 2 || service.id === 4) && visibleTreatmentOptions.length === 0 && (
                <p className="haircut-no-results">No options match your search and price filter.</p>
              )}
              </div>
            </>
          ) : (
            <article className="service-option-card service-fixed-option">
              <div>
                <h3>{service.name}</h3>
                <p>{service.duration}</p>
              </div>
              <strong>₱{service.price}</strong>
              <button className="btn-pink" type="button" onClick={() => (onBook ? onBook(service.id) : setAuthOpen(true))}>Book Now</button>
            </article>
          )}
        </section>
      )}

      {authOpen && <AuthScreen modal onLogin={onLogin} onClose={() => setAuthOpen(false)} />}
    </main>
  );
}
