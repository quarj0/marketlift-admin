import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Figtree, Geist_Mono } from "next/font/google";
import "./globals.css";

const figtree = Figtree({ variable: "--font-figtree", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

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
    <html lang="en" className={`${figtree.variable} ${geistMono.variable} antialiased`}>
      <body>
        <a href="#admin-main-content" className="skip-link">Skip to main content</a>
        {children}
      </body>
    </html>
  );
}
