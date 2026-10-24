import { CATEGORIES } from "../data";

type Props = {
  onHome: () => void;
  onAbout: () => void;
  onServices: () => void;
  onBook: () => void;
  onMyBookings?: () => void;
};

export default function AboutFooter({ onHome, onAbout, onServices, onBook, onMyBookings }: Props) {
  return (
    <footer className="about-footer" id="about-contact">
      <div className="about-footer-grid">
        <section>
          <h2>Quick Links</h2>
          <button onClick={onHome}>Home</button>
          <button onClick={onAbout}>About Us</button>
          <button onClick={onServices}>Services</button>
          {onMyBookings ? <button onClick={onMyBookings}>My Bookings</button> : <button onClick={() => document.getElementById("about-contact")?.scrollIntoView({ behavior: "smooth" })}>Contact Us</button>}
        </section>
        <section>
          <h2>Services</h2>
          {CATEGORIES.map(category => <button key={category.label} onClick={onServices}>{category.name}</button>)}
        </section>
        <section>
          <h2>Contact Us</h2>
          <p><span aria-hidden="true">&#9742;</span> 09916550457</p>
          <p><span aria-hidden="true">&#9993;</span> 23rosseygirl@gmail.com</p>
          <p><span aria-hidden="true">&#9906;</span> Poblacion, Oslob, Cebu</p>
        </section>
        <section>
          <h2>Opening Hours</h2>
          <p><span>Monday - Friday</span><span>10:00 AM - 8:00 PM</span></p>
          <p><span>Saturday</span><span>10:00 AM - 9:00 PM</span></p>
          <p><span>Sunday</span><span>10:00 AM - 6:00 PM</span></p>
          <button className="about-footer-book" onClick={onBook}>Book Appointment</button>
        </section>
      </div>
      <div className="about-footer-bottom">Copyright 2026 Rosseygirl Salon. All rights reserved.</div>
    </footer>
  );
}
