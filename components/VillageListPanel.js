"use client";

import Link from "next/link";
import RiskBadge from "@/components/RiskBadge";
import { RISK_LEVELS } from "@/data/mockData";

export default function VillageListPanel({ villages }) {
  const sorted = [...villages].sort(
    (a, b) =>
      RISK_LEVELS.indexOf(b.riskLevel) - RISK_LEVELS.indexOf(a.riskLevel) ||
      b.riskScore - a.riskScore
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "14px 16px 10px",
          borderBottom: "1px solid var(--line)",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 15,
            margin: 0,
            fontWeight: 600,
          }}
        >
          Monitored villages
        </h2>
        <p style={{ margin: "3px 0 0", fontSize: 12, color: "var(--text-faint)" }}>
          {villages.length} settlements · sorted by risk
        </p>
      </div>
      <div style={{ overflowY: "auto", flex: 1 }}>
        {sorted.map((v) => (
          <Link
            key={v.id}
            href={`/village/${v.id}`}
            style={{
              display: "block",
              padding: "12px 16px",
              borderBottom: "1px solid var(--line-soft)",
              textDecoration: "none",
              color: "var(--text-primary)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 6,
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 500 }}>{v.name}</span>
              <span className="mono" style={{ fontSize: 11, color: "var(--text-faint)" }}>
                {v.riskScore}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <RiskBadge level={v.riskLevel} size="sm" />
              {v.status !== "unverified" && (
                <span
                  className="mono"
                  style={{
                    fontSize: 10,
                    color: v.status === "verified" ? "var(--accent)" : "var(--text-faint)",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  {v.status}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
