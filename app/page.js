"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import Link from "next/link";
import { useStore } from "@/store/useStore";
import SeverityBanner from "@/components/SeverityBanner";
import ReportForm from "@/components/ReportForm";
import RiskBadge from "@/components/RiskBadge";
import DataModeBadge from "@/components/DataModeBadge";
import SimulationPanel from "@/components/SimulationPanel";
import CascadeAlerts from "@/components/CascadeAlerts";
import { RISK_LEVELS, RISK_META } from "@/data/mockData";

const VillageMap = dynamic(() => import("@/components/VillageMap"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--text-faint)",
        fontSize: 13,
      }}
    >
      Loading map…
    </div>
  ),
});

export default function HomePage() {
  const villages = useStore((s) => s.villages);
  const t = useStore((s) => s.t);
  const language = useStore((s) => s.language);
  const auth = useStore((s) => s.auth);
  const dataMode = useStore((s) => s.dataMode);
  const liveMeta = useStore((s) => s.liveMeta);

  const [reportOpen, setReportOpen] = useState(false);
  const [mapFocus, setMapFocus] = useState({ center: [30.365, 78.91], zoom: 12 });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRiskFilter, setSelectedRiskFilter] = useState("all");

  const criticalVillages = villages.filter((v) => v.riskLevel === "critical" || v.riskLevel === "warning");
  const mostSevere = useStore((s) => s.getMostSevereVillage());

  const filteredVillages = villages.filter((v) => {
    const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) || v.ward.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRisk = selectedRiskFilter === "all" || v.riskLevel === selectedRiskFilter;
    return matchesSearch && matchesRisk;
  });

  const handleFocusChange = (mode) => {
    if (mode === "india") {
      setMapFocus({ center: [22.5, 82.5], zoom: 4.8 });
    } else {
      setMapFocus({ center: [30.365, 78.91], zoom: 12 });
    }
  };

  return (
    <div style={{ minHeight: "calc(100vh - 65px)", background: "var(--bg-deep)" }}>
      {/* Top Urgent Severity Banner if critical alert active */}
      <SeverityBanner />

      {/* Hero Platform Banner */}
      <section
        style={{
          padding: "36px 24px 28px",
          borderBottom: "1px solid var(--line)",
          background: "linear-gradient(180deg, rgba(79, 209, 197, 0.04) 0%, transparent 100%)",
        }}
      >
        <div style={{ maxWidth: 1300, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 20 }}>
            <div style={{ maxWidth: 720 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "4px 10px", borderRadius: 999, background: "rgba(79, 209, 197, 0.12)", border: "1px solid rgba(79, 209, 197, 0.3)", color: "var(--accent)", fontSize: 11.5, fontWeight: 600, marginBottom: 12 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: dataMode === "live" && liveMeta?.ok ? "var(--accent)" : "var(--risk-warning)" }} />
                {dataMode === "live" && liveMeta?.ok ? t("heroStatusLive") : t("heroStatusSimulation")}
                <DataModeBadge mode={dataMode} liveOk={!!liveMeta?.ok} compact />
              </div>
              <h1
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(24px, 3.5vw, 36px)",
                  fontWeight: 700,
                  margin: "0 0 10px",
                  lineHeight: 1.2,
                  letterSpacing: "-0.02em",
                  color: "var(--text-primary)",
                }}
              >
                {t("heroTitle")}
              </h1>
              <p style={{ fontSize: 14.5, color: "var(--text-muted)", margin: 0, lineHeight: 1.5, maxWidth: 640 }}>
                {t("heroSubtitle")}
              </p>
            </div>

            {/* Platform Quick Actions */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                onClick={() => setReportOpen(true)}
                style={{
                  padding: "11px 18px",
                  borderRadius: 8,
                  border: "none",
                  background: "var(--risk-critical)",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: 13.5,
                  cursor: "pointer",
                  boxShadow: "0 4px 16px rgba(214, 65, 44, 0.3)",
                }}
              >
                🚨 {t("btnReportIncident")}
              </button>
              {!auth.isAuthenticated && (
                <Link
                  href="/login"
                  style={{
                    padding: "11px 18px",
                    borderRadius: 8,
                    border: "1px solid var(--accent)",
                    background: "rgba(79, 209, 197, 0.1)",
                    color: "var(--accent)",
                    fontWeight: 700,
                    fontSize: 13.5,
                    textDecoration: "none",
                  }}
                >
                  🛡️ {t("disasterLogin")}
                </Link>
              )}
            </div>
          </div>

          {/* Metric Bar */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: 12,
              marginTop: 24,
              paddingTop: 20,
              borderTop: "1px solid var(--line-soft)",
            }}
          >
            <div style={metricBoxStyle}>
              <span style={metricLabelStyle}>{t("metricMonitoredSettlements")}</span>
              <span className="mono" style={metricValueStyle}>{villages.length}</span>
            </div>
            <div style={metricBoxStyle}>
              <span style={metricLabelStyle}>{t("metricCriticalAlerts")}</span>
              <span className="mono" style={{ ...metricValueStyle, color: "var(--risk-critical)" }}>
                {villages.filter((v) => v.riskLevel === "critical").length}
              </span>
            </div>
            <div style={metricBoxStyle}>
              <span style={metricLabelStyle}>{t("metricWarningAlerts")}</span>
              <span className="mono" style={{ ...metricValueStyle, color: "var(--risk-warning)" }}>
                {villages.filter((v) => v.riskLevel === "warning").length}
              </span>
            </div>
            <div style={metricBoxStyle}>
              <span style={metricLabelStyle}>{t("metricMeshUptime")}</span>
              <span className="mono" style={{ ...metricValueStyle, color: "var(--risk-normal)" }}>99.4%</span>
            </div>
            <div style={metricBoxStyle}>
              <span style={metricLabelStyle}>{t("metricEstLeadTime")}</span>
              <span className="mono" style={metricValueStyle}>35 mins</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid: Resized Map + Alert Summary Panel */}
      <section style={{ maxWidth: 1300, margin: "0 auto", padding: "24px 20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1fr", gap: 20, alignItems: "start" }}>
          {/* Left: Resized Map Container */}
          <div
            style={{
              background: "var(--bg-panel-raised)",
              border: "1px solid var(--line)",
              borderRadius: 12,
              overflow: "hidden",
              boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
            }}
          >
            <div
              style={{
                padding: "14px 18px",
                borderBottom: "1px solid var(--line)",
                background: "var(--bg-panel)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: 16, margin: 0, fontWeight: 700 }}>
                  🗺️ {t("mapTitle")}
                </h2>
                <p style={{ fontSize: 11.5, color: "var(--text-faint)", margin: "2px 0 0" }}>
                  {t("mapSubtitle")}
                </p>
              </div>
            </div>

            {/* Smaller Resized Map Viewport (Height 440px instead of full screen) */}
            <div style={{ height: 440, position: "relative" }}>
              <VillageMap
                villages={villages}
                center={mapFocus.center}
                zoom={mapFocus.zoom}
                height="440px"
                onFocusChange={handleFocusChange}
              />
            </div>
          </div>

          {/* Right: Live Alert Summary Cards & High Risk Highlight */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div
              style={{
                background: "var(--bg-panel-raised)",
                border: "1px solid var(--line)",
                borderRadius: 12,
                padding: 18,
              }}
            >
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15, margin: "0 0 12px", fontWeight: 700 }}>
                ⚡ {t("liveAlertSummary")}
              </h3>

              {mostSevere && mostSevere.riskLevel !== "normal" ? (
                <div
                  style={{
                    padding: 14,
                    borderRadius: 8,
                    background: `${RISK_META[mostSevere.riskLevel].color}15`,
                    border: `1px solid ${RISK_META[mostSevere.riskLevel].color}55`,
                    marginBottom: 12,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 700 }}>{mostSevere.name}</span>
                    <RiskBadge level={mostSevere.riskLevel} size="sm" />
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>
                    {mostSevere.ward} · {t("population")} {mostSevere.population.toLocaleString()}
                    {mostSevere.prediction ? (
                      <>
                        {" "}
                        · {t("floodProbability")} {(mostSevere.prediction.probability * 100).toFixed(0)}%
                      </>
                    ) : null}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-primary)", marginBottom: 10 }}>
                    {RISK_META[mostSevere.riskLevel].short}
                  </div>
                  <CascadeAlerts riskLevel={mostSevere.riskLevel} t={t} />
                  <Link
                    href={`/village/${mostSevere.id}`}
                    style={{
                      display: "inline-block",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--accent)",
                      textDecoration: "none",
                      marginTop: 10,
                    }}
                  >
                    {t("btnViewDetails")} →
                  </Link>
                </div>
              ) : (
                <p style={{ fontSize: 12.5, color: "var(--text-faint)" }}>
                  {t("noElevatedRisk")}
                </p>
              )}

              {/* Secondary Alert List */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {criticalVillages.map((v) => (
                  <Link
                    key={v.id}
                    href={`/village/${v.id}`}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "10px 12px",
                      borderRadius: 6,
                      background: "var(--bg-panel)",
                      border: "1px solid var(--line-soft)",
                      textDecoration: "none",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{v.name}</div>
                      <div style={{ fontSize: 11, color: "var(--text-faint)" }}>{v.hazardType} hazard</div>
                    </div>
                    <RiskBadge level={v.riskLevel} size="sm" />
                  </Link>
                ))}
              </div>
            </div>

            <SimulationPanel />
          </div>
        </div>
      </section>

      {/* Monitored Villages Searchable Grid */}
      <section style={{ maxWidth: 1300, margin: "0 auto", padding: "0 20px 48px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, margin: 0, fontWeight: 700 }}>
            🏘️ {t("monitoredVillagesTitle")} ({filteredVillages.length})
          </h2>

          {/* Controls: Search & Risk Filter */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="Search village or ward..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: "7px 12px",
                borderRadius: 6,
                border: "1px solid var(--line)",
                background: "var(--bg-panel)",
                color: "var(--text-primary)",
                fontSize: 12.5,
                width: 200,
              }}
            />
            <select
              value={selectedRiskFilter}
              onChange={(e) => setSelectedRiskFilter(e.target.value)}
              style={{
                padding: "7px 10px",
                borderRadius: 6,
                border: "1px solid var(--line)",
                background: "var(--bg-panel)",
                color: "var(--text-primary)",
                fontSize: 12.5,
              }}
            >
              <option value="all">All Risk Levels</option>
              {RISK_LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {RISK_META[lvl].label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
          {filteredVillages.map((v) => (
            <Link
              key={v.id}
              href={`/village/${v.id}`}
              style={{
                display: "block",
                padding: 16,
                borderRadius: 10,
                background: "var(--bg-panel-raised)",
                border: "1px solid var(--line)",
                textDecoration: "none",
                transition: "transform 140ms ease, border-color 140ms ease",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>{v.name}</h3>
                  <div style={{ fontSize: 11.5, color: "var(--text-faint)", marginTop: 2 }}>{v.ward}</div>
                </div>
                <RiskBadge level={v.riskLevel} size="sm" />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, marginTop: 12, paddingTop: 10, borderTop: "1px solid var(--line-soft)" }}>
                <span style={{ color: "var(--text-muted)" }}>Pop: {v.population.toLocaleString()}</span>
                <span className="mono" style={{ fontWeight: 600, color: "var(--accent)" }}>
                  {t("floodProbability")}: {v.prediction ? `${(v.prediction.probability * 100).toFixed(0)}%` : `${v.riskScore}`}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Incident Report Modal */}
      {reportOpen && <ReportForm villages={villages} onClose={() => setReportOpen(false)} />}
    </div>
  );
}

const metricBoxStyle = {
  background: "var(--bg-panel)",
  border: "1px solid var(--line-soft)",
  borderRadius: 8,
  padding: "10px 14px",
  display: "flex",
  flexDirection: "column",
};

const metricLabelStyle = {
  fontSize: 10.5,
  color: "var(--text-faint)",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  marginBottom: 4,
};

const metricValueStyle = {
  fontSize: 18,
  fontWeight: 700,
  color: "var(--text-primary)",
};
