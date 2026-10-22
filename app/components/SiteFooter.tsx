import SalonLogo from "./SalonLogo";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-brand"><SalonLogo /></div>
      <p className="site-footer-copy">(c) 2026 All rights reserved</p>
      <p className="site-footer-note">Beauty, care, and confidence.</p>
    </footer>
  );
}
