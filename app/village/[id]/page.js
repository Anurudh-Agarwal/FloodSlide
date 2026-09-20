"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useStore } from "@/store/useStore";
import RiskBadge from "@/components/RiskBadge";
import { RISK_META } from "@/data/mockData";
import SimulationPanel from "@/components/SimulationPanel";
import CascadeAlerts from "@/components/CascadeAlerts";
import RiskSparkline from "@/components/RiskSparkline";
import DataModeBadge from "@/components/DataModeBadge";

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
      <span style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 500 }}>{label}</span>
      <span style={{ textAlign: "right" }}>
        <span
          className="mono"
          style={{ fontSize: 14, fontWeight: 700, color: danger ? "var(--risk-critical)" : "var(--text-primary)" }}
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
  const t = useStore((s) => s.t);
  const language = useStore((s) => s.language);
  const dataMode = useStore((s) => s.dataMode);
  const liveMeta = useStore((s) => s.liveMeta);

  if (!village) {
    notFound();
  }

  const s = village.signals;
  const meta = RISK_META[village.riskLevel];

  return (
    <div style={{ maxWidth: 1080, margin: "0 auto", padding: "24px 20px 60px" }}>
      <Link href="/" style={{ fontSize: 13, color: "var(--accent)", textDecoration: "none", fontWeight: 600 }}>
        {t("backToMap")}
      </Link>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginTop: 14,
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, margin: 0, fontWeight: 700 }}>
            {village.name}
          </h1>
          <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: "4px 0 0" }}>
            {village.ward} · {t("population")}: {village.population.toLocaleString()} · {t("hazardType")}: <span style={{ textTransform: "capitalize", fontWeight: 600 }}>{village.hazardType}</span>
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <DataModeBadge mode={dataMode} liveOk={!!liveMeta?.ok} />
          <RiskBadge level={village.riskLevel} />
          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={() => setVillageStatus(village.id, "verified")}
              disabled={village.status === "verified"}
              style={pillBtn(village.status === "verified", "var(--accent)")}
            >
              {t("btnVerify")}
            </button>
            <button
              onClick={() => setVillageStatus(village.id, "resolved")}
              disabled={village.status === "resolved"}
              style={pillBtn(village.status === "resolved", "var(--text-muted)")}
            >
              {t("btnResolve")}
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 20 }}>
        <div>
          <section style={cardStyle}>
            <h2 style={cardTitle}>🎯 {t("whyRiskLevel")}</h2>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 0 }}>
              {meta.short}. {t("metricEstLeadTime")}:{" "}
              <span className="mono" style={{ color: "var(--accent)", fontWeight: 700 }}>
                {s.leadTimeMin ? `${s.leadTimeMin} min` : "n/a"}
              </span>
              {village.prediction && (
                <>
                  {" "}
                  · {t("floodProbability")}{" "}
                  <span className="mono" style={{ fontWeight: 700 }}>
                    {(village.prediction.probability * 100).toFixed(1)}%
                  </span>
                </>
              )}
            </p>
            {village.prediction && (
              <p style={{ fontSize: 11.5, color: "var(--text-faint)", marginTop: 0 }}>
                {t("dataKind")}: {village.prediction.dataKind} · {village.prediction.dataKind === "ml-service" ? "Python ML service" : "XGBoost trained on synthetic rows"}
              </p>
            )}
            <ul style={{ margin: "12px 0 0", paddingLeft: 18, fontSize: 13, lineHeight: 1.5 }}>
              {village.keyFactors.map((f, i) => (
                <li key={i} style={{ marginBottom: 8, color: "var(--text-primary)" }}>
                  {f}
                </li>
              ))}
            </ul>
          </section>

          <section style={cardStyle}>
            <h2 style={cardTitle}>📡 {t("signalReadings")}</h2>
            <SignalRow
              label={t("rainfall")}
              value={`${s.rainfallMm3h} mm`}
            />
            <SignalRow
              label={t("soilMoisture")}
              value={`${s.soilMoisturePct}%`}
              danger={s.soilMoisturePct > 85}
            />
            <SignalRow
              label={t("riverLevel")}
              value={`${s.riverLevelM} m`}
              sub={`${t("dangerMark")} ${s.riverThresholdM} m`}
              danger={s.riverLevelM >= s.riverThresholdM}
            />
            <SignalRow
              label={t("riverFlow")}
              value={`${Number(s.riverFlowM3s || 0).toFixed(1)} m³/s`}
            />
            <SignalRow
              label={t("slopeStability")}
              value={s.slopeStabilityIndex.toFixed(2)}
              sub="0 = unstable, 1 = stable"
              danger={s.slopeStabilityIndex < 0.4}
            />
            <SignalRow
              label={t("tiltSensor")}
              value={s.tiltSensorAlert ? t("alertTriggered") : t("normalStatus")}
              danger={s.tiltSensorAlert}
            />
          </section>

          {village.prediction && (
            <section style={cardStyle}>
              <h2 style={cardTitle}>⚗ {t("physicsFeatures")}</h2>
              {Object.entries(village.prediction.physics).map(([k, val]) => (
                <SignalRow key={k} label={k.replace(/_/g, " ")} value={Number(val).toFixed(3)} />
              ))}
            </section>
          )}

          <section style={cardStyle}>
            <h2 style={cardTitle}>📈 {t("riskVariation")}</h2>
            <RiskSparkline series={village.probabilitySeries || []} />
          </section>

          <section style={cardStyle}>
            <h2 style={cardTitle}>📜 {t("riskHistory")}</h2>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {village.history.map((h, i) => (
                <div
                  key={i}
                  className="mono"
                  style={{
                    fontSize: 11,
                    padding: "6px 10px",
                    borderRadius: 999,
                    background: `${RISK_META[h.level].color}1f`,
                    color: RISK_META[h.level].color,
                    border: `1px solid ${RISK_META[h.level].color}55`,
                    fontWeight: 600,
                  }}
                >
                  {new Date(h.t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · {RISK_META[h.level].label}
                </div>
              ))}
            </div>
          </section>

          {reports.length > 0 && (
            <section style={cardStyle}>
              <h2 style={cardTitle}>📢 {t("communityReports")}</h2>
              {reports.map((r) => (
                <div key={r.id} style={{ padding: "10px 0", borderBottom: "1px solid var(--line-soft)" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)" }}>{r.type}</div>
                  <p style={{ fontSize: 12.5, color: "var(--text-muted)", margin: "4px 0" }}>{r.description}</p>
                </div>
              ))}
            </section>
          )}
        </div>

        <div>
          <section style={{ ...cardStyle, padding: 0, overflow: "hidden", height: 340, borderRadius: 12, border: "1px solid var(--line)" }}>
            <VillageMap villages={[village]} center={[village.lat, village.lng]} height="340px" showControls={false} />
          </section>
          <section style={cardStyle}>
            <h2 style={cardTitle}>🚨 {t("liveAlertSummary")}</h2>
            <CascadeAlerts riskLevel={village.riskLevel} t={t} />
          </section>
          <SimulationPanel villageId={village.id} />
          <section style={cardStyle}>
            <h2 style={cardTitle}>⚙ Operational Status</h2>
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
              Rescue status:{" "}
              <span style={{ color: "var(--accent)", fontWeight: 700, textTransform: "capitalize" }}>
                {village.status}
              </span>
            </div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 8 }}>
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
  background: "var(--bg-panel-raised)",
  border: "1px solid var(--line)",
  borderRadius: 12,
  padding: 20,
  marginBottom: 18,
};

const cardTitle = {
  fontFamily: "var(--font-display)",
  fontSize: 15,
  margin: "0 0 12px",
  fontWeight: 700,
};

function pillBtn(active, color) {
  return {
    padding: "7px 14px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
    cursor: active ? "default" : "pointer",
    border: `1px solid ${active ? color : "var(--line)"}`,
    background: active ? `${color}22` : "transparent",
    color: active ? color : "var(--text-muted)",
  };
}
