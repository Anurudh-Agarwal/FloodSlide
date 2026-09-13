"use client";

import Link from "next/link";
import { useStore } from "@/store/useStore";
import RiskBadge from "@/components/RiskBadge";
import { RISK_LEVELS } from "@/data/mockData";

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

  const sorted = [...villages].sort(
    (a, b) =>
      RISK_LEVELS.indexOf(b.riskLevel) - RISK_LEVELS.indexOf(a.riskLevel) ||
      b.riskScore - a.riskScore
  );

  return (
    <div style={{ display: "flex", height: "calc(100vh - 57px)" }}>
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
        <header style={{ marginBottom: 16 }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22, margin: 0 }}>
            Rescue dashboard
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "4px 0 0" }}>
            Confirm a village once ground truth is available, or mark it resolved once the hazard has passed.
          </p>
        </header>

        <div
          style={{
            border: "1px solid var(--line)",
            borderRadius: 10,
            overflow: "hidden",
          }}
        >
          <div
            className="mono"
            style={{
              display: "grid",
              gridTemplateColumns: "1.6fr 1fr 0.8fr 1fr 1.4fr",
              gap: 8,
              padding: "10px 16px",
              background: "var(--bg-panel)",
              fontSize: 10.5,
              color: "var(--text-faint)",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              borderBottom: "1px solid var(--line)",
            }}
          >
            <span>Village</span>
            <span>Risk</span>
            <span>Score</span>
            <span>Updated</span>
            <span>Actions</span>
          </div>
          {sorted.map((v) => (
            <div
              key={v.id}
              style={{
                display: "grid",
                gridTemplateColumns: "1.6fr 1fr 0.8fr 1fr 1.4fr",
                gap: 8,
                alignItems: "center",
                padding: "12px 16px",
                borderBottom: "1px solid var(--line-soft)",
                background: "var(--bg-panel-raised)",
              }}
            >
              <div>
                <Link href={`/village/${v.id}`} style={{ fontWeight: 500, fontSize: 13.5, textDecoration: "none" }}>
                  {v.name}
                </Link>
                <div style={{ fontSize: 11.5, color: "var(--text-faint)" }}>
                  {v.ward} · pop. {v.population.toLocaleString()}
                </div>
              </div>
              <RiskBadge level={v.riskLevel} size="sm" />
              <span className="mono" style={{ fontSize: 13 }}>{v.riskScore}</span>
              <span className="mono" style={{ fontSize: 11.5, color: "var(--text-faint)" }}>
                {timeAgo(v.lastUpdated)}
              </span>
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  onClick={() => setVillageStatus(v.id, "verified")}
                  disabled={v.status === "verified"}
                  style={actionBtn(v.status === "verified", "var(--accent)")}
                >
                  Verified
                </button>
                <button
                  onClick={() => setVillageStatus(v.id, "resolved")}
                  disabled={v.status === "resolved"}
                  style={actionBtn(v.status === "resolved", "var(--text-muted)")}
                >
                  Resolved
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <aside
        style={{
          width: 340,
          flexShrink: 0,
          borderLeft: "1px solid var(--line)",
          background: "var(--bg-panel)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ padding: "16px 18px 10px", borderBottom: "1px solid var(--line)" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 15, margin: 0 }}>
            Community reports
          </h2>
          <p style={{ fontSize: 11.5, color: "var(--text-faint)", margin: "3px 0 0" }}>
            {reports.length} submitted this session
          </p>
        </div>
        <div style={{ overflowY: "auto", flex: 1 }}>
          {reports.length === 0 && (
            <p style={{ padding: 18, fontSize: 12.5, color: "var(--text-faint)" }}>
              No reports yet.
            </p>
          )}
          {reports.map((r) => {
            const village = villages.find((v) => v.id === r.villageId);
            return (
              <div
                key={r.id}
                style={{
                  padding: "12px 18px",
                  borderBottom: "1px solid var(--line-soft)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 600 }}>{r.type}</span>
                  <span className="mono" style={{ fontSize: 10.5, color: "var(--text-faint)" }}>
                    {timeAgo(r.timestamp)}
                  </span>
                </div>
                {village && (
                  <div style={{ fontSize: 11.5, color: "var(--accent)", marginBottom: 4 }}>
                    {village.name}
                  </div>
                )}
                <p style={{ fontSize: 12.5, color: "var(--text-muted)", margin: "0 0 6px" }}>
                  {r.description}
                </p>
                {r.image && (
                  <img
                    src={r.image}
                    alt="Report attachment"
                    style={{ maxHeight: 110, borderRadius: 6, border: "1px solid var(--line)" }}
                  />
                )}
                <div style={{ fontSize: 10.5, color: "var(--text-faint)", marginTop: 6 }}>
                  {r.reporterName}
                </div>
              </div>
            );
          })}
        </div>
      </aside>
    </div>
  );
}

function actionBtn(active, color) {
  return {
    padding: "5px 10px",
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 500,
    cursor: active ? "default" : "pointer",
    border: `1px solid ${active ? color : "var(--line)"}`,
    background: active ? `${color}22` : "transparent",
    color: active ? color : "var(--text-muted)",
    opacity: active ? 1 : 0.9,
  };
}
