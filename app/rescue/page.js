"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useStore } from "@/store/useStore";
import RiskBadge from "@/components/RiskBadge";
import SimulationPanel from "@/components/SimulationPanel";
import DataModeBadge from "@/components/DataModeBadge";
import RiskSparkline from "@/components/RiskSparkline";
import { RISK_LEVELS } from "@/data/mockData";

const VillageMap = dynamic(() => import("@/components/VillageMap"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-faint)" }}>
      Loading Operational Map…
    </div>
  ),
});

function timeAgo(ts) {
  const mins = Math.round((Date.now() - ts) / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  return `${hrs}h ago`;
}

export default function RescueDashboard() {
  const villages = useStore((s) => s.villages);
  const reports = useStore((s) => s.reports);
  const setVillageStatus = useStore((s) => s.setVillageStatus);
  const auth = useStore((s) => s.auth);
  const t = useStore((s) => s.t);
  const language = useStore((s) => s.language);

  const [activeTab, setActiveTab] = useState("overview");
  const dataMode = useStore((s) => s.dataMode);
  const liveMeta = useStore((s) => s.liveMeta);
  const modelMetrics = useStore((s) => s.modelMetrics);
  const loadModelMetrics = useStore((s) => s.loadModelMetrics);

  useEffect(() => {
    loadModelMetrics();
  }, [loadModelMetrics]);

  // Route Protection: If not authenticated, show Auth Guard Wall
  if (!auth.isAuthenticated) {
    return (
      <div
        style={{
          minHeight: "calc(100vh - 65px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
        }}
      >
        <div
          style={{
            width: "min(440px, 100%)",
            background: "var(--bg-panel-raised)",
            border: "1px solid var(--line)",
            borderRadius: 12,
            padding: 30,
            textAlign: "center",
            boxShadow: "0 16px 40px rgba(0,0,0,0.4)",
          }}
        >
          <div style={{ fontSize: 42, marginBottom: 12 }}>🔒</div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: 0, color: "var(--text-primary)" }}>
            {t("authNotice")}
          </h2>
          <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "10px 0 20px" }}>
            The Disaster Operations Dashboard is restricted to authorized personnel from NDMA, SDRF, and local administration.
          </p>
          <Link
            href="/login"
            style={{
              display: "inline-block",
              width: "100%",
              padding: "12px",
              borderRadius: 8,
              background: "var(--accent)",
              color: "#0f1a1c",
              fontWeight: 700,
              fontSize: 14,
              textDecoration: "none",
            }}
          >
            🛡️ {t("disasterLogin")} →
          </Link>
        </div>
      </div>
    );
  }

  const criticalCount = villages.filter((v) => v.riskLevel === "critical").length;
  const warningCount = villages.filter((v) => v.riskLevel === "warning").length;
  const unverifiedCount = villages.filter((v) => v.status === "unverified" && v.riskLevel !== "normal").length;
  const verifiedCount = villages.filter((v) => v.status === "verified").length;
  const tiltAlertCount = villages.filter((v) => v.signals?.tiltSensorAlert).length;

  const sortedVillages = [...villages].sort(
    (a, b) =>
      RISK_LEVELS.indexOf(b.riskLevel) - RISK_LEVELS.indexOf(a.riskLevel) ||
      b.riskScore - a.riskScore
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "calc(100vh - 65px)" }}>
      {/* Officer Command Banner */}
      <div
        style={{
          padding: "12px 24px",
          background: "var(--bg-panel-raised)",
          borderBottom: "1px solid var(--line)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "rgba(79, 209, 197, 0.15)",
              border: "1px solid var(--accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
            }}
          >
            🛡️
          </div>
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 16, margin: 0, fontWeight: 700 }}>
              {t("dashboardTitle")}
            </h1>
            <div style={{ fontSize: 11.5, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 8 }}>
              {auth.user?.name} · {auth.user?.agency} · {auth.user?.badgeId}
              <DataModeBadge mode={dataMode} liveOk={!!liveMeta?.ok} compact />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: "flex", gap: 6, background: "var(--bg-panel)", padding: 3, borderRadius: 8, border: "1px solid var(--line)" }}>
          {[
            { id: "overview", label: t("statsOverview") },
            { id: "map", label: t("navLiveMap") },
            { id: "reports", label: `${t("citizenReportsCount")} (${reports.length})` },
            { id: "sensors", label: t("sensorMeshHealth") },
            { id: "model", label: t("navModel") },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                border: "none",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                background: activeTab === tab.id ? "var(--accent)" : "transparent",
                color: activeTab === tab.id ? "#0f1a1c" : "var(--text-muted)",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Dashboard Workspace */}
      <div style={{ flex: 1, padding: 24, maxWidth: 1400, margin: "0 auto", width: "100%" }}>
        {/* Executive Stats Bar */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 14,
            marginBottom: 24,
          }}
        >
          <div style={statCardStyle}>
            <div style={statLabelStyle}>{t("metricCriticalAlerts")}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: criticalCount > 0 ? "var(--risk-critical)" : "var(--text-primary)" }}>
              {criticalCount}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 4 }}>
              {criticalCount > 0 ? "Immediate dispatch required" : "No critical breaches"}
            </div>
          </div>

          <div style={statCardStyle}>
            <div style={statLabelStyle}>{t("metricWarningAlerts")}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: warningCount > 0 ? "var(--risk-warning)" : "var(--text-primary)" }}>
              {warningCount}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 4 }}>
              Elevated catchment nowcast
            </div>
          </div>

          <div style={statCardStyle}>
            <div style={statLabelStyle}>{t("unverifiedIncidents")}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: "var(--accent)" }}>
              {unverifiedCount}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 4 }}>
              Awaiting ground verification
            </div>
          </div>

          <div style={statCardStyle}>
            <div style={statLabelStyle}>{t("citizenReportsCount")}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: "var(--text-primary)" }}>
              {reports.length}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 4 }}>
              Submitted this session
            </div>
          </div>

          <div style={statCardStyle}>
            <div style={statLabelStyle}>{t("sensorMeshHealth")}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: tiltAlertCount > 0 ? "var(--risk-critical)" : "var(--risk-normal)" }}>
              {tiltAlertCount > 0 ? `${tiltAlertCount} ALERT` : "100% OK"}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 4 }}>
              18 Telemetered Sensor Nodes
            </div>
          </div>
        </div>

        {/* Tab Content 1: Overview (Live Action Table + Reports Quick Feed) */}
        {activeTab === "overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr", gap: 20 }}>
            {/* Operational Village Table */}
            <div
              style={{
                background: "var(--bg-panel-raised)",
                border: "1px solid var(--line)",
                borderRadius: 10,
                overflow: "hidden",
              }}
            >
              <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--line)", background: "var(--bg-panel)" }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15, margin: 0 }}>
                  {t("monitoredVillagesTitle")} ({villages.length})
                </h3>
              </div>
              <div
                className="mono"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.5fr 1fr 0.8fr 1fr 1.5fr",
                  gap: 8,
                  padding: "10px 16px",
                  background: "var(--bg-panel)",
                  fontSize: 10.5,
                  color: "var(--text-faint)",
                  textTransform: "uppercase",
                  borderBottom: "1px solid var(--line)",
                }}
              >
                <span>{t("tableHeaderVillage")}</span>
                <span>{t("tableHeaderRisk")}</span>
                <span>{t("tableHeaderScore")}</span>
                <span>{t("tableHeaderProb")}</span>
                <span>{t("tableHeaderUpdated")}</span>
                <span>{t("tableHeaderActions")}</span>
              </div>
              <div>
                {sortedVillages.map((v) => (
                  <div
                    key={v.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1.5fr 1fr 0.8fr 0.8fr 1fr 1.5fr",
                      gap: 8,
                      alignItems: "center",
                      padding: "12px 16px",
                      borderBottom: "1px solid var(--line-soft)",
                    }}
                  >
                    <div>
                      <Link href={`/village/${v.id}`} style={{ fontWeight: 600, fontSize: 13.5, textDecoration: "none", color: "var(--text-primary)" }}>
                        {v.name}
                      </Link>
                      <div style={{ fontSize: 11, color: "var(--text-faint)" }}>
                        {v.ward} · {t("population")} {v.population.toLocaleString()}
                      </div>
                    </div>
                    <RiskBadge level={v.riskLevel} size="sm" />
                    <span className="mono" style={{ fontSize: 13, fontWeight: 600 }}>{v.riskScore}</span>
                    <span className="mono" style={{ fontSize: 12, fontWeight: 600 }}>
                      {v.prediction ? `${(v.prediction.probability * 100).toFixed(0)}%` : "—"}
                    </span>
                    <span className="mono" style={{ fontSize: 11, color: "var(--text-faint)" }}>
                      {timeAgo(v.lastUpdated)}
                    </span>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        onClick={() => setVillageStatus(v.id, "verified")}
                        disabled={v.status === "verified"}
                        style={actionBtnStyle(v.status === "verified", "var(--accent)")}
                      >
                        {t("btnVerify")}
                      </button>
                      <button
                        onClick={() => setVillageStatus(v.id, "resolved")}
                        disabled={v.status === "resolved"}
                        style={actionBtnStyle(v.status === "resolved", "var(--text-muted)")}
                      >
                        {t("btnResolve")}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Side Incident Feed */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Recent Community Reports Feed */}
              <div
                style={{
                  background: "var(--bg-panel-raised)",
                  border: "1px solid var(--line)",
                  borderRadius: 10,
                  padding: 16,
                  flex: 1,
                }}
              >
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15, margin: "0 0 12px" }}>
                  {t("communityReports")} ({reports.length})
                </h3>
                {reports.length === 0 ? (
                  <p style={{ fontSize: 12.5, color: "var(--text-faint)" }}>No citizen reports submitted yet.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: 420, overflowY: "auto" }}>
                    {reports.map((r) => {
                      const v = villages.find((v) => v.id === r.villageId);
                      return (
                        <div
                          key={r.id}
                          style={{
                            padding: 12,
                            borderRadius: 8,
                            background: "var(--bg-panel)",
                            border: "1px solid var(--line-soft)",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                            <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--accent)" }}>{r.type}</span>
                            <span className="mono" style={{ fontSize: 10.5, color: "var(--text-faint)" }}>{timeAgo(r.timestamp)}</span>
                          </div>
                          {v && <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--text-primary)" }}>{v.name} ({v.ward})</div>}
                          <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "4px 0 6px" }}>{r.description}</p>
                          {r.image && (
                            <img src={r.image} alt="Report evidence" style={{ maxHeight: 100, borderRadius: 6, border: "1px solid var(--line)" }} />
                          )}
                          <div style={{ fontSize: 10.5, color: "var(--text-faint)", marginTop: 6 }}>
                            Reported by: {r.reporterName}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab Content 2: Operational Map */}
        {activeTab === "map" && (
          <div style={{ height: 600, borderRadius: 12, overflow: "hidden", border: "1px solid var(--line)", position: "relative" }}>
            <VillageMap villages={villages} height="600px" />
          </div>
        )}

        {/* Tab Content 3: Full Reports Stream */}
        {activeTab === "reports" && (
          <div style={{ background: "var(--bg-panel-raised)", border: "1px solid var(--line)", borderRadius: 10, padding: 20 }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 17, margin: "0 0 16px" }}>
              {t("activeIncidents")}
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
              {reports.map((r) => (
                <div key={r.id} style={{ padding: 16, background: "var(--bg-panel)", border: "1px solid var(--line)", borderRadius: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontWeight: 700, color: "var(--accent)" }}>{r.type}</span>
                    <span className="mono" style={{ fontSize: 11, color: "var(--text-faint)" }}>{timeAgo(r.timestamp)}</span>
                  </div>
                  <p style={{ fontSize: 13, color: "var(--text-primary)", margin: "8px 0" }}>{r.description}</p>
                  {r.image && <img src={r.image} alt="Evidence" style={{ maxWidth: "100%", height: 140, objectFit: "cover", borderRadius: 6 }} />}
                  <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 10 }}>Submitted by: {r.reporterName}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Content 4: Sensor Mesh Health */}
        {activeTab === "sensors" && (
          <div style={{ background: "var(--bg-panel-raised)", border: "1px solid var(--line)", borderRadius: 10, padding: 20 }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 17, margin: "0 0 14px" }}>
              {t("sensorMeshHealth")} (18 Telemetered Nodes)
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
              {villages.map((v) => {
                const s = v.signals;
                return (
                  <div key={v.id} style={{ padding: 14, background: "var(--bg-panel)", border: "1px solid var(--line)", borderRadius: 8 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{v.name} Sensor Suite</div>
                    <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginBottom: 10 }}>ID: {v.id.toUpperCase()}</div>
                    <div style={{ fontSize: 12, display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid var(--line-soft)" }}>
                      <span>Rain Gauge:</span> <span className="mono">{s.rainfallMm3h} mm/3h</span>
                    </div>
                    <div style={{ fontSize: 12, display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid var(--line-soft)" }}>
                      <span>River Stage:</span> <span className="mono">{s.riverLevelM} m / {s.riverThresholdM} m</span>
                    </div>
                    <div style={{ fontSize: 12, display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid var(--line-soft)" }}>
                      <span>Soil Probe:</span> <span className="mono">{s.soilMoisturePct}%</span>
                    </div>
                    <div style={{ fontSize: 12, display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
                      <span>Tilt Sensor:</span>
                      <span className="mono" style={{ color: s.tiltSensorAlert ? "var(--risk-critical)" : "var(--risk-normal)", fontWeight: 700 }}>
                        {s.tiltSensorAlert ? "ALERT" : "NORMAL"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const statCardStyle = {
  background: "var(--bg-panel-raised)",
  border: "1px solid var(--line)",
  borderRadius: 10,
  padding: 16,
};

const statLabelStyle = {
  fontSize: 11.5,
  color: "var(--text-muted)",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.03em",
  marginBottom: 4,
};

function actionBtnStyle(active, color) {
  return {
    padding: "5px 10px",
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 600,
    cursor: active ? "default" : "pointer",
    border: `1px solid ${active ? color : "var(--line)"}`,
    background: active ? `${color}22` : "transparent",
    color: active ? color : "var(--text-muted)",
  };
}
