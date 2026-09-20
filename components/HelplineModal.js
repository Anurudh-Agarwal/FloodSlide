"use client";

import { useStore } from "@/store/useStore";
import { HELPLINES } from "@/data/mockData";

export default function HelplineModal() {
  const open = useStore((s) => s.helplineOpen);
  const toggleHelpline = useStore((s) => s.toggleHelpline);
  const t = useStore((s) => s.t);
  const language = useStore((s) => s.language);

  if (!open) return null;

  return (
    <div
      onClick={() => toggleHelpline(false)}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(6, 12, 13, 0.75)",
        backdropFilter: "blur(4px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(440px, 100%)",
          background: "var(--bg-panel-raised)",
          border: "1px solid var(--line)",
          borderRadius: 12,
          padding: 24,
          boxShadow: "0 16px 40px rgba(0,0,0,0.5)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 4,
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 19,
              margin: 0,
              fontWeight: 700,
            }}
          >
            🚨 {t("helplineTitle")}
          </h2>
          <button
            onClick={() => toggleHelpline(false)}
            aria-label="Close"
            style={{
              background: "none",
              border: "none",
              color: "var(--text-muted)",
              fontSize: 18,
              cursor: "pointer",
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 6, lineHeight: 1.4 }}>
          {t("helplineNotice")}
        </p>
        <ul style={{ listStyle: "none", margin: "16px 0 0", padding: 0 }}>
          {HELPLINES.map((h) => {
            const translatedName =
              language === "hi"
                ? (h.number === "1078"
                    ? "राष्ट्रीय आपदा प्रबंधन प्राधिकरण (NDRF)"
                    : h.number === "1070"
                    ? "राज्य आपत्कालीन परिचालन केंद्र"
                    : h.number === "100"
                    ? "पुलिस आपत्कालीन सेवा"
                    : h.number === "108"
                    ? "एम्बुलेंस सेवा"
                    : "स्थानीय पंचायत नियंत्रण कक्ष")
                : h.name;
            return (
              <li
                key={h.number}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 0",
                  borderTop: "1px solid var(--line-soft)",
                }}
              >
                <span style={{ fontSize: 13.5, fontWeight: 500 }}>{translatedName}</span>
                <span
                  className="mono"
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "var(--accent)",
                  }}
                >
                  {h.number}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
