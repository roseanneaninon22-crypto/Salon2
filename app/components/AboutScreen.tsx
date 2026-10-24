"use client";
import SalonLogo from "./SalonLogo";
import AboutFooter from "./AboutFooter";

type Props = {
  onHome: () => void;
  onBook: () => void;
  onMyBookings: () => void;
  onLogout: () => void;
  userName: string;
};

export default function AboutScreen({ onHome, onBook, onMyBookings, onLogout, userName }: Props) {
  return (
    <main className="about-page">
      <header className="about-nav">
        <SalonLogo />
        <nav className="about-nav-links" aria-label="Main navigation">
          <button onClick={onHome}>Home</button>
          <button onClick={onBook}>Services</button>
          <button onClick={onMyBookings}>My Bookings</button>
          <button className="selected" aria-current="page">About Us</button>
        </nav>
        <div className="about-nav-user">
          <span>{userName}</span>
          <button onClick={onLogout}>Log out</button>
        </div>
      </header>

      <section className="about-hero">
        <div className="about-hero-copy">
          <p className="about-eyebrow">ABOUT US</p>
          <h1>Rosseygirl Salon<br /><em>Online Appointment</em></h1>
          <p className="about-tagline">Your Beauty, Our Passion</p>
          <span className="about-short-rule" />
        </div>
      </section>

      <section className="about-welcome">
        <div className="about-photo-card" role="img" aria-label="A warm, welcoming salon interior">
          <div className="about-photo-caption">A moment for you</div>
        </div>
        <div className="about-copy-block">
          <p className="about-eyebrow">WHO WE ARE</p>
          <h2>Welcome to Rosseygirl Salon</h2>
          <p>Welcome to <strong>Rosseygirl Salon</strong>, where beauty, confidence, and self-care come together. We are dedicated to providing quality salon services in a comfortable, welcoming, and relaxing environment.</p>
          <p>At Rosseygirl Salon, we believe that everyone deserves to feel beautiful and confident. Our goal is to provide professional beauty services while making every visit a pleasant and enjoyable experience.</p>
          <p><strong>Please visit our branch in Poblacion, Oslob.</strong></p>
        </div>
      </section>

      <section className="about-values">
        <article className="about-value-card">
          <span className="about-value-icon" aria-hidden="true">✧</span>
          <div>
            <p className="about-eyebrow">OUR MISSION</p>
            <h2>Quality Service,<br />Excellent Customer Care</h2>
            <p>Our mission is to provide <strong>quality beauty services, excellent customer care, and a convenient appointment experience</strong>. We strive to make every customer feel valued, comfortable, and confident.</p>
          </div>
        </article>
        <article className="about-value-card">
          <span className="about-value-icon" aria-hidden="true">♡</span>
          <div>
            <p className="about-eyebrow">OUR VISION</p>
            <h2>A Trusted Salon<br />for Every You</h2>
            <p>Our vision is to become a trusted salon known for <strong>quality service, customer satisfaction, professionalism, and convenient online booking</strong>.</p>
          </div>
        </article>
      </section>

      <section className="about-belief">
        <p className="about-eyebrow">BEAUTY STARTS WITH YOU</p>
        <h2>Feel beautiful. Feel confident. Feel like you.</h2>
        <p>Whether you're preparing for a special occasion or simply want to treat yourself, <strong>Rosseygirl Salon is here to help you look and feel your best.</strong></p>
      </section>

      <section className="about-cta">
        <p className="about-eyebrow">READY TO LOOK AND FEEL YOUR BEST?</p>
        <h2>Book Your Appointment Today</h2>
        <p>Let Rosseygirl Salon take care of your beauty needs.</p>
        <button onClick={onBook}>♧ &nbsp; Book an Appointment</button>
      </section>
      <AboutFooter onHome={onHome} onAbout={() => window.scrollTo({ top: 0, behavior: "smooth" })} onServices={onBook} onBook={onBook} onMyBookings={onMyBookings} />
    </main>
  );
}
