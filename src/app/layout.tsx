import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Catchment Early Warning — Prototype",
  description:
    "Village-level flood & landslide risk dashboard with tiered alert cascade simulation.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
