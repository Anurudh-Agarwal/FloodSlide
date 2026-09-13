"use client";

import { useStore } from "@/store/useStore";
import { HELPLINES } from "@/data/mockData";

export default function HelplineModal() {
  const open = useStore((s) => s.helplineOpen);
  const toggleHelpline = useStore((s) => s.toggleHelpline);

  if (!open) return null;

  return (
    <div
      onClick={() => toggleHelpline(false)}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(6, 12, 13, 0.7)",
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
          width: "min(420px, 100%)",
          background: "var(--bg-panel-raised)",
          border: "1px solid var(--line)",
          borderRadius: 10,
          padding: 22,
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
            }}
          >
            Emergency helplines
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
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 6 }}>
          Numbers are shown for reference only in this prototype — tapping a
          number does not place a call.
        </p>
        <ul style={{ listStyle: "none", margin: "14px 0 0", padding: 0 }}>
          {HELPLINES.map((h) => (
            <li
              key={h.number}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 0",
                borderTop: "1px solid var(--line-soft)",
              }}
            >
              <span style={{ fontSize: 14 }}>{h.name}</span>
              <span
                className="mono"
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "var(--accent)",
                }}
              >
                {h.number}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
