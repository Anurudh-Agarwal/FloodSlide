"use client";

import { useState } from "react";

const STEPS = [
  { label: "DEM / IMD / CWC / IoT data", color: "var(--water)" },
  { label: "Drainage-Graph + Physics-Informed Model", color: "var(--terrain)" },
  { label: "Risk Engine", color: "var(--watch)" },
  { label: "SACHET-aligned Multi-Channel Delivery", color: "var(--imminent)" },
];

export default function ArchitectureStrip() {
  const [open, setOpen] = useState(false);

  return (
    <div className="strip">
      <button className="toggle" onClick={() => setOpen((o) => !o)}>
        {open ? "Hide" : "How this connects to real infrastructure"}
      </button>

      {open && (
        <div className="flow">
          {STEPS.map((s, i) => (
            <div key={s.label} className="flow-item">
              <div className="chip" style={{ borderColor: s.color }}>
                {s.label}
              </div>
              {i < STEPS.length - 1 && <span className="arrow">→</span>}
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .strip {
          padding: 16px 24px 24px;
        }
        .toggle {
          background: none;
          border: 1px solid var(--hairline);
          padding: 8px 14px;
          font-size: 13px;
          font-weight: 500;
          color: var(--ink);
          border-radius: 3px;
        }
        .flow {
          margin-top: 16px;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 10px;
        }
        .flow-item {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .chip {
          border: 1.5px solid;
          border-radius: 3px;
          padding: 10px 14px;
          font-size: 13px;
          font-weight: 500;
          max-width: 220px;
        }
        .arrow {
          color: #8a919b;
        }
      `}</style>
    </div>
  );
}
