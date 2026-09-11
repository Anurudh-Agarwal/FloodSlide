import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RakshaSetu — District Emergency Intelligence",
  description:
    "Village-level flood and landslide risk monitoring for the Bhagirathi catchment.",
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
