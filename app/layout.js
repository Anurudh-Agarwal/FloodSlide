import { Space_Grotesk, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import AppHeader from "@/components/AppHeader";
import HelplineModal from "@/components/HelplineModal";
import LiveDataLoader from "@/components/LiveDataLoader";

const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display-src",
});
const body = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body-src",
});
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono-src",
});

export const metadata = {
  title: "FloodSlide — Hyper-Local Flood & Landslide Alerts",
  description:
    "Early-warning console for flash floods and landslides in hilly regions.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${display.variable} ${body.variable} ${mono.variable}`}
        style={{
          "--font-display": "var(--font-display-src), Segoe UI, sans-serif",
          "--font-body": "var(--font-body-src), Segoe UI, sans-serif",
          "--font-mono": "var(--font-mono-src), monospace",
        }}
      >
        <AppHeader />
        <LiveDataLoader />
        <main>{children}</main>
        <HelplineModal />
      </body>
    </html>
  );
}
