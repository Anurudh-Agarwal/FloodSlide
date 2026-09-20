"use client";

import { RISK_META } from "@/data/mockData";

export default function RiskSparkline({ series = [], height = 72 }) {
  const w = 320;
  const h = height;
  const pad = 6;
  if (!series.length) {
    return (
      <div style={{ fontSize: 12, color: "var(--text-faint)", padding: "8px 0" }}>
        No probability trace yet — adjust simulation sliders or fetch live weather.
      </div>
    );
  }
  const ys = series.map((p) => Number(p.probability) || 0);
  const min = 0;
  const max = 1;
  const pts = ys
    .map((y, i) => {
      const x = pad + (i / Math.max(ys.length - 1, 1)) * (w - pad * 2);
      const yy = h - pad - ((y - min) / (max - min)) * (h - pad * 2);
      return `${x},${yy}`;
    })
    .join(" ");
  const last = ys[ys.length - 1];
  const color =
    last >= 0.7
      ? RISK_META.critical.color
      : last >= 0.45
      ? RISK_META.warning.color
      : last >= 0.25
      ? RISK_META.watch.color
      : RISK_META.normal.color;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} role="img" aria-label="Flood probability over this session">
      <polyline fill="none" stroke={color} strokeWidth="2" points={pts} />
      {[0.25, 0.45, 0.7].map((thr) => {
        const yy = h - pad - ((thr - min) / (max - min)) * (h - pad * 2);
        return (
          <line
            key={thr}
            x1={pad}
            x2={w - pad}
            y1={yy}
            y2={yy}
            stroke="currentColor"
            strokeOpacity="0.18"
            strokeDasharray="3 3"
          />
        );
      })}
    </svg>
  );
}
