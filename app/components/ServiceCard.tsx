import { servicePrice, SERVICES } from "../data";

export type DisplayService = Omit<(typeof SERVICES)[number], "id"> & { id: number | string };
type Props = { service: DisplayService; onExplore: () => void };

const servicePhotos: Record<string, string> = {
  Hair: "https://images.unsplash.com/photo-1634449571010-02389ed0f9b0?auto=format&fit=crop&w=800&q=85",
  Nails: "https://cdn1.treatwell.net/images/view/v2.i860551.w1080.h720.x2047EAD3/",
  Spa: "https://jaesthetic.com.au/cdn/shop/files/GOLD_Pedicure_Shellac_Jaesthetic.jpg?v=1755056407&width=1070",
};

const localServicePhotos: Record<number, string> = {
  1: "/services/hair-cut-card.webp",
  4: "/services/hair%20color.png",
  5: "/services/deepcleansing.jpg",
  7: "/services/footspa1.png",
  9: "/services/makeup.jpg",
  10: "/services/eyebrow%20and%20lashes.jpg",
  11: "/services/waxing.jpg",
};

export default function ServiceCard({ service, onExplore }: Props) {
  const staticId = typeof service.id === "number" ? service.id : undefined;
  const price = staticId === undefined ? service.price : servicePrice(staticId) || service.price;
  const photo = (staticId === undefined ? undefined : localServicePhotos[staticId]) ?? servicePhotos[service.category] ?? "/back.png";

  return (
    <button
      type="button"
      className="landing-service"
      onClick={onExplore}
      aria-label={`Explore ${service.name}, ${service.category} service, from ${price} pesos`}
      style={{ backgroundImage: `linear-gradient(180deg, rgba(9,7,5,.58), rgba(9,7,5,.04) 48%, rgba(9,7,5,.76)), url("${photo}")` }}
    >
      <span className="landing-service-heading">{service.name}</span>
      <span className="landing-service-script">{service.category}</span>
      <span className="landing-service-description">{service.desc}</span>
      {staticId === 1 ? (
        <span className="landing-service-icon haircut-service-logo" aria-hidden="true">
          <img src="/haircutlogo.png" alt="" />
        </span>
      ) : (
        <span className="landing-service-icon" aria-hidden="true">{service.img}</span>
      )}
      <span className="landing-service-price">From ₱{price}</span>
      <span className="landing-service-explore">Explore Service →</span>
    </button>
  );
}
