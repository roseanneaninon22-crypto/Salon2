import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rossey Girl Salon",
  description: "Online Reservation System",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
