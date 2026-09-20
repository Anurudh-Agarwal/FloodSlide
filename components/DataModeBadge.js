"use client";

export default function DataModeBadge({ mode, liveOk, compact }) {
  const isLive = mode === "live" && liveOk;
  const label = isLive ? "LIVE WEATHER" : "LOADING WEATHER";
  const color = isLive ? "var(--risk-normal)" : "var(--risk-warning)";
  return (
    <span
      className="mono"
      title={isLive ? "NASA POWER weather snapshot. River, soil, and tilt telemetry are not connected." : "The live weather snapshot is loading or unavailable."}
      style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: compact ? "3px 8px" : "5px 10px", borderRadius: 999, border: `1px solid ${color}`, background: isLive ? "rgba(63,167,150,0.12)" : "rgba(232,184,75,0.12)", color, fontSize: compact ? 10 : 11, fontWeight: 800, letterSpacing: "0.06em" }}
    >
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: color }} />
      {label}
    </span>
  );
}
