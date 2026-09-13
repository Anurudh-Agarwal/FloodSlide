"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useStore } from "@/store/useStore";
import RiskBadge from "@/components/RiskBadge";
import { RISK_META } from "@/data/mockData";

const VillageMap = dynamic(() => import("@/components/VillageMap"), { ssr: false });

function SignalRow({ label, value, sub, danger }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        padding: "10px 0",
        borderBottom: "1px solid var(--line-soft)",
      }}
    >
      <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{label}</span>
      <span style={{ textAlign: "right" }}>
        <span
          className="mono"
          style={{ fontSize: 14, fontWeight: 600, color: danger ? "var(--risk-critical)" : "var(--text-primary)" }}
        >
          {value}
        </span>
        {sub && (
          <div className="mono" style={{ fontSize: 10.5, color: "var(--text-faint)" }}>
            {sub}
          </div>
        )}
      </span>
    </div>
  );
}

export default function VillageDetailPage({ params }) {
  const village = useStore((s) => s.getVillage(params.id));
  const setVillageStatus = useStore((s) => s.setVillageStatus);
  const reports = useStore((s) => s.getReportsForVillage(params.id));

  if (!village) {
    notFound();
  }

  const s = village.signals;
  const meta = RISK_META[village.riskLevel];

  return (
    <div style={{ maxWidth: 1040, margin: "0 auto", padding: "20px 24px 60px" }}>
      <Link href="/" style={{ fontSize: 12.5, color: "var(--text-faint)", textDecoration: "none" }}>
        ← Back to live map
      </Link>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginTop: 10,
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, margin: 0 }}>
            {village.name}
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "4px 0 0" }}>
            {village.ward} · population {village.population.toLocaleString()} · hazard type: {village.hazardType}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <RiskBadge level={village.riskLevel} />
          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={() => setVillageStatus(village.id, "verified")}
              disabled={village.status === "verified"}
              style={pillBtn(village.status === "verified", "var(--accent)")}
            >
              Mark verified
            </button>
            <button
              onClick={() => setVillageStatus(village.id, "resolved")}
              disabled={village.status === "resolved"}
              style={pillBtn(village.status === "resolved", "var(--text-muted)")}
            >
              Mark resolved
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 20 }}>
        <div>
          <section style={cardStyle}>
            <h2 style={cardTitle}>Why this risk level</h2>
            <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 0 }}>
              {meta.short}. Estimated lead time:{" "}
              <span className="mono" style={{ color: "var(--text-primary)" }}>
                {s.leadTimeMin ? `${s.leadTimeMin} min` : "n/a"}
              </span>
            </p>
            <ul style={{ margin: "10px 0 0", paddingLeft: 18, fontSize: 13 }}>
              {village.keyFactors.map((f, i) => (
                <li key={i} style={{ marginBottom: 6, color: "var(--text-primary)" }}>
                  {f}
                </li>
              ))}
            </ul>
          </section>

          <section style={cardStyle}>
            <h2 style={cardTitle}>Signal readings</h2>
            <SignalRow
              label="Rainfall (last 3h)"
              value={`${s.rainfallMm3h} mm`}
            />
            <SignalRow
              label="Soil moisture"
              value={`${s.soilMoisturePct}%`}
              danger={s.soilMoisturePct > 85}
            />
            <SignalRow
              label="River level"
              value={`${s.riverLevelM} m`}
              sub={`danger mark ${s.riverThresholdM} m`}
              danger={s.riverLevelM >= s.riverThresholdM}
            />
            <SignalRow
              label="Slope stability index"
              value={s.slopeStabilityIndex.toFixed(2)}
              sub="0 = unstable, 1 = stable"
              danger={s.slopeStabilityIndex < 0.4}
            />
            <SignalRow
              label="Tilt sensor"
              value={s.tiltSensorAlert ? "ALERT" : "Normal"}
              danger={s.tiltSensorAlert}
            />
          </section>

          <section style={cardStyle}>
            <h2 style={cardTitle}>Risk history (this session)</h2>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {village.history.map((h, i) => (
                <div
                  key={i}
                  className="mono"
                  style={{
                    fontSize: 10.5,
                    padding: "5px 9px",
                    borderRadius: 999,
                    background: `${RISK_META[h.level].color}1f`,
                    color: RISK_META[h.level].color,
                    border: `1px solid ${RISK_META[h.level].color}55`,
                  }}
                >
                  {new Date(h.t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · {RISK_META[h.level].label}
                </div>
              ))}
            </div>
          </section>

          {reports.length > 0 && (
            <section style={cardStyle}>
              <h2 style={cardTitle}>Community reports here</h2>
              {reports.map((r) => (
                <div key={r.id} style={{ padding: "8px 0", borderBottom: "1px solid var(--line-soft)" }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600 }}>{r.type}</div>
                  <p style={{ fontSize: 12.5, color: "var(--text-muted)", margin: "2px 0" }}>{r.description}</p>
                </div>
              ))}
            </section>
          )}
        </div>

        <div>
          <section style={{ ...cardStyle, padding: 0, overflow: "hidden", height: 320 }}>
            <VillageMap villages={[village]} center={[village.lat, village.lng]} height="320px" />
          </section>
          <section style={cardStyle}>
            <h2 style={cardTitle}>Status</h2>
            <div style={{ fontSize: 12.5, color: "var(--text-muted)" }}>
              Rescue status:{" "}
              <span style={{ color: "var(--text-primary)", fontWeight: 500, textTransform: "capitalize" }}>
                {village.status}
              </span>
            </div>
            <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 6 }}>
              Last updated:{" "}
              <span className="mono" style={{ color: "var(--text-primary)" }}>
                {new Date(village.lastUpdated).toLocaleString()}
              </span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

const cardStyle = {
  background: "var(--bg-panel)",
  border: "1px solid var(--line)",
  borderRadius: 10,
  padding: 18,
  marginBottom: 16,
};

const cardTitle = {
  fontFamily: "var(--font-display)",
  fontSize: 14.5,
  margin: "0 0 10px",
  fontWeight: 600,
};

function pillBtn(active, color) {
  return {
    padding: "7px 12px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 500,
    cursor: active ? "default" : "pointer",
    border: `1px solid ${active ? color : "var(--line)"}`,
    background: active ? `${color}22` : "transparent",
    color: active ? color : "var(--text-muted)",
  };
}
