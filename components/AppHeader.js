"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";

export default function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const toggleHelpline = useStore((s) => s.toggleHelpline);
  const language = useStore((s) => s.language);
  const setLanguage = useStore((s) => s.setLanguage);
  const auth = useStore((s) => s.auth);
  const logout = useStore((s) => s.logout);
  const t = useStore((s) => s.t);
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
        fontSize: 13.5,
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
        backdropFilter: "blur(10px)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              background: "linear-gradient(135deg, #4fd1c5 0%, #319795 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#0f1a1c",
              fontWeight: 800,
              fontSize: 14,
            }}
          >
            FS
          </div>
          <div>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 18,
                color: "var(--text-primary)",
                letterSpacing: "-0.01em",
                display: "block",
                lineHeight: 1.1,
              }}
            >
              {t("brandName")}
            </span>
            <span style={{ fontSize: 10, color: "var(--text-faint)", fontWeight: 500 }}>
              {t("brandSubtitle")}
            </span>
          </div>
        </Link>

        <nav className="app-nav" style={{ display: "flex", gap: 4 }}>
          {navItem("/", t("navLiveMap"))}
          {navItem("/rescue", t("navRescueDashboard"))}
        </nav>
      </div>

      <div
        className="header-actions"
        style={{ display: "flex", alignItems: "center", gap: 10 }}
      >
        {/* Language Switcher */}
        <div
          style={{
            display: "flex",
            background: "var(--bg-panel-raised)",
            border: "1px solid var(--line)",
            borderRadius: 6,
            padding: 2,
          }}
        >
          <button
            onClick={() => setLanguage("en")}
            style={{
              padding: "4px 8px",
              borderRadius: 4,
              border: "none",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              background: language === "en" ? "var(--accent)" : "transparent",
              color: language === "en" ? "#0f1a1c" : "var(--text-muted)",
            }}
          >
            EN
          </button>
          <button
            onClick={() => setLanguage("hi")}
            style={{
              padding: "4px 8px",
              borderRadius: 4,
              border: "none",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              background: language === "hi" ? "var(--accent)" : "transparent",
              color: language === "hi" ? "#0f1a1c" : "var(--text-muted)",
            }}
          >
            हिन्दी
          </button>
        </div>

        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          aria-label={`Switch theme`}
          title={`Switch theme`}
          style={{
            width: 34,
            height: 34,
            border: "1px solid var(--line)",
            borderRadius: 6,
            background: "var(--bg-panel)",
            color: "var(--text-primary)",
            fontSize: 15,
            cursor: "pointer",
          }}
        >
          {theme === "dark" ? "☼" : "☾"}
        </button>

        {/* Helpline Button */}
        <button
          onClick={() => toggleHelpline(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "rgba(214, 65, 44, 0.12)",
            color: "var(--risk-critical)",
            border: "1px solid rgba(214, 65, 44, 0.4)",
            borderRadius: 6,
            padding: "7px 12px",
            fontSize: 12.5,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          🚨 {t("emergencyHelplines")}
        </button>

        {/* Disaster Management Login / Officer Status */}
        {auth.isAuthenticated ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                fontSize: 11.5,
                padding: "5px 10px",
                borderRadius: 6,
                background: "var(--bg-panel-raised)",
                border: "1px solid var(--line)",
                color: "var(--accent)",
                fontWeight: 600,
              }}
            >
              🛡️ {auth.user?.name || "NDMA Officer"}
            </div>
            <button
              onClick={() => {
                logout();
                router.push("/");
              }}
              style={{
                padding: "6px 10px",
                borderRadius: 6,
                border: "1px solid var(--line)",
                background: "transparent",
                color: "var(--text-muted)",
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              {t("logout")}
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "var(--accent)",
              color: "#0f1a1c",
              border: "none",
              borderRadius: 6,
              padding: "7px 14px",
              fontSize: 12.5,
              fontWeight: 700,
              textDecoration: "none",
              boxShadow: "0 2px 10px rgba(79, 209, 197, 0.25)",
            }}
          >
            🛡️ {t("disasterLogin")}
          </Link>
        )}
      </div>
    </header>
  );
}
