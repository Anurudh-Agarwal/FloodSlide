"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { RISK_LEVELS, RISK_META } from "@/data/mockData";

export default function DemoControls({ villages }) {
  const [open, setOpen] = useState(false);
  const [villageId, setVillageId] = useState(villages[0]?.id || "");
  const simulateSensorTrigger = useStore((s) => s.simulateSensorTrigger);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 16,
        left: 16,
        zIndex: 400,
        width: open ? 280 : "auto",
      }}
    >
      {open ? (
        <div
          style={{
            background: "var(--bg-panel-raised)",
            border: "1px solid var(--line)",
            borderRadius: 10,
            padding: 14,
            boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span
              className="mono"
              style={{ fontSize: 11, color: "var(--risk-warning)", fontWeight: 600, letterSpacing: "0.03em" }}
            >
              DEMO CONTROLS
            </span>
            <button
              onClick={() => setOpen(false)}
              style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 14 }}
              aria-label="Collapse demo controls"
            >
              ✕
            </button>
          </div>
          <p style={{ fontSize: 11.5, color: "var(--text-muted)", margin: "0 0 10px" }}>
            No live sensors are connected. Use this to simulate a sensor pushing a new risk level for testing.
          </p>
          <select
            value={villageId}
            onChange={(e) => setVillageId(e.target.value)}
            style={{
              width: "100%",
              marginBottom: 10,
              padding: "7px 8px",
              borderRadius: 6,
              border: "1px solid var(--line)",
              background: "var(--bg-panel)",
              color: "var(--text-primary)",
              fontSize: 12.5,
            }}
          >
            {villages.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {RISK_LEVELS.map((lvl) => (
              <button
                key={lvl}
                onClick={() => simulateSensorTrigger(villageId, lvl)}
                style={{
                  padding: "7px 0",
                  borderRadius: 6,
                  fontSize: 11.5,
                  fontWeight: 500,
                  cursor: "pointer",
                  border: `1px solid ${RISK_META[lvl].color}55`,
                  background: `${RISK_META[lvl].color}18`,
                  color: RISK_META[lvl].color,
                }}
              >
                Set {RISK_META[lvl].label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="mono"
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid var(--line)",
            background: "var(--bg-panel-raised)",
            color: "var(--risk-warning)",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.03em",
            cursor: "pointer",
            boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
          }}
        >
          ⚙ DEMO CONTROLS
        </button>
      )}
    </div>
  );
}
