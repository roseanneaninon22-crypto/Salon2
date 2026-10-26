"use client";

import { useEffect, useState } from "react";
import { SERVICES } from "../data";
import { supabase } from "../lib/supabase";
import SalonLogo from "./SalonLogo";
import ServiceCard, { DisplayService } from "./ServiceCard";

type Props = { onBack: () => void; onOpenService: (serviceId: number) => void };
type DBService = { id: string; name: string; category: string; duration: string; price: number; img: string };

export default function AllServicesPage({ onBack, onOpenService }: Props) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All categories");
  const [catalog, setCatalog] = useState<DisplayService[]>(SERVICES);

  useEffect(() => {
    let active = true;

    const loadAdminServices = async () => {
      const { data, error } = await supabase
        .from("services")
        .select("id, name, category, duration, price, img")
        .order("created_at", { ascending: true });

      if (error || !data?.length || !active) return;

      const HIDDEN = ["full body massage", "blowout", "blow out"];

      const services = (data as DBService[])
        .filter(item => !HIDDEN.includes(item.name.toLowerCase().trim()) && item.category !== "Packages")
        .map(item => {
        const savedService = SERVICES.find(service =>
          service.name.toLowerCase() === item.name.toLowerCase() && service.category === item.category,
        );

        return {
          id: savedService?.id ?? item.id,
          name: item.name,
          category: item.category,
          desc: savedService?.desc ?? `${item.category} service`,
          duration: item.duration,
          price: Number(item.price),
          img: item.img,
          priced: savedService?.priced,
          types: savedService?.types,
          typeLabel: savedService?.typeLabel,
          columnsHeader: savedService?.columnsHeader,
        };
      });

      setCatalog(services);
    };

    void loadAdminServices();
    return () => { active = false; };
  }, []);

  const matches = (service: DisplayService) => {
    const query = search.trim().toLowerCase();
    const matchesCategory = category === "All categories" || service.category === category;
    const matchesSearch = !query || `${service.name} ${service.desc} ${service.category}`.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  };
  const services = catalog.filter(matches);
  const categories = [...new Set(catalog.map(service => service.category))];

  return (
    <main className="all-services-page">
      <nav className="site-nav">
        <SalonLogo />
        <button className="btn-ghost" type="button" onClick={onBack}>Back to Home</button>
      </nav>

      <section className="landing-services section">
        <div className="container">
          <p className="landing-eyebrow">Rosseygirl Salon</p>
          <h2>All Services</h2>
          <p style={{ color: "rgba(245,230,208,0.65)", marginBottom: 24, fontSize: 15 }}>Explore our full menu of salon services and treatments.</p>

          <div className="all-services-filters">
            <input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search services" aria-label="Search all services" />
            <select value={category} onChange={event => setCategory(event.target.value)} aria-label="Filter services by category">
              <option>All categories</option>
              {categories.map(item => <option key={item}>{item}</option>)}
            </select>
          </div>

          <div className="landing-service-grid">
            {services.map(service => (
              <ServiceCard
                key={service.id}
                service={service}
                onExplore={() => { if (typeof service.id === "number") onOpenService(service.id); }}
              />
            ))}
          </div>

          {services.length === 0 && <p className="all-services-empty">No services match your search or category filter.</p>}
        </div>
      </section>
    </main>
  );
}
