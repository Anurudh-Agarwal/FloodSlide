"use client";

import Link from "next/link";
import { useStore } from "@/store/useStore";
import { RISK_META } from "@/data/mockData";

export default function SeverityBanner() {
  const village = useStore((s) => s.getMostSevereVillage());
  const t = useStore((s) => s.t);
  const language = useStore((s) => s.language);

  if (!village || village.riskLevel === "normal") {
    return (
      <div
        style={{
          padding: "10px 20px",
          background: "var(--bg-panel)",
          borderBottom: "1px solid var(--line)",
          fontSize: 13,
          color: "var(--text-muted)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>
          🟢 {t("noElevatedRisk")}
        </span>
        <span className="mono" style={{ fontSize: 11, color: "var(--text-faint)" }}>
          {t("demoDataNotice")}
        </span>
      </div>
    );
  }

  const meta = RISK_META[village.riskLevel];
  const isCritical = village.riskLevel === "critical";

  const translatedLabel =
    language === "hi"
      ? (village.riskLevel === "critical" ? "अति-गंभीर अलर्ट" : village.riskLevel === "warning" ? "कैचमेंट चेतावनी" : "क्षेत्रीय निगरानी")
      : meta.label;

  return (
    <Link
      href={`/village/${village.id}`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "12px 20px",
        background: `${meta.color}18`,
        borderBottom: `1px solid ${meta.color}55`,
        textDecoration: "none",
        color: "var(--text-primary)",
      }}
    >
      <span
        className={isCritical ? "risk-pulse" : undefined}
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: meta.color,
          flexShrink: 0,
        }}
      />
      <span style={{ fontSize: 13.5 }}>
        <strong style={{ fontWeight: 700, color: meta.color }}>
          {translatedLabel}: {village.name}
        </strong>{" "}
        <span style={{ color: "var(--text-muted)" }}>
          ({village.ward}) — {meta.short}
        </span>
      </span>
      <span
        className="mono"
        style={{
          marginLeft: "auto",
          fontSize: 12,
          color: "var(--accent)",
          fontWeight: 600,
        }}
      >
        Score {village.riskScore} · {t("btnViewDetails")} →
      </span>
    </Link>
  );
}
