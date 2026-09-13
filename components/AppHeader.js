"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";

export default function AppHeader() {
  const pathname = usePathname();
  const toggleHelpline = useStore((s) => s.toggleHelpline);
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("floodslide-theme");
    const preferredTheme = window.matchMedia("(prefers-color-scheme: light)")
      .matches
      ? "light"
      : "dark";
    const nextTheme = savedTheme || preferredTheme;
    document.documentElement.dataset.theme = nextTheme;
    setTheme(nextTheme);
  }, []);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem("floodslide-theme", nextTheme);
    setTheme(nextTheme);
  }

  const navItem = (href, label) => (
    <Link
      href={href}
      style={{
        padding: "6px 12px",
        borderRadius: 6,
        fontSize: 14,
        fontWeight: 500,
        color: pathname === href ? "#0f1a1c" : "var(--text-muted)",
        background: pathname === href ? "var(--accent)" : "transparent",
        textDecoration: "none",
        transition: "background 120ms ease, color 120ms ease",
      }}
    >
      {label}
    </Link>
  );

  return (
    <header
      className="app-header"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 500,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 20px",
        borderBottom: "1px solid var(--line)",
        background: "var(--header-bg)",
        backdropFilter: "blur(6px)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 8,
            textDecoration: "none",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 19,
              color: "var(--text-primary)",
              letterSpacing: "-0.01em",
            }}
          >
            FloodSlide
          </span>
        </Link>
        <nav className="app-nav" style={{ display: "flex", gap: 4 }}>
          {navItem("/", "Live Map")}
          {navItem("/rescue", "Rescue Dashboard")}
        </nav>
      </div>

      <div
        className="header-actions"
        style={{ display: "flex", alignItems: "center", gap: 8 }}
      >
        <button
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          style={{
            width: 36,
            height: 36,
            border: "1px solid var(--line)",
            borderRadius: 6,
            background: "var(--bg-panel)",
            color: "var(--text-primary)",
            fontSize: 16,
            cursor: "pointer",
          }}
        >
          {theme === "dark" ? "☼" : "☾"}
        </button>
        <button
          onClick={() => toggleHelpline(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "var(--risk-critical)",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "8px 14px",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Emergency Helplines
        </button>
      </div>
    </header>
  );
}
