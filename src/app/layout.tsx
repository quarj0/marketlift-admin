import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Marketlift Admin", template: "%s | Marketlift Admin" },
  description: "Marketlift marketplace administration, trust, revenue and operations console",
  robots: { index: false, follow: false },
  icons: { icon: "/brand/marketlift-mark.png" },
};

export const viewport: Viewport = {
  themeColor: "#02122f",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html data-scroll-behavior="smooth" lang="en" className="antialiased">
      <body>
        <a href="#admin-main-content" className="skip-link">Skip to main content</a>
        {children}
      </body>
    </html>
  );
}
