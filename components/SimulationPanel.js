"use client";

import { useStore } from "@/store/useStore";
import DataModeBadge from "@/components/DataModeBadge";

export default function SimulationPanel({ villageId }) {
  const villages = useStore((state) => state.villages);
  const dataMode = useStore((state) => state.dataMode);
  const liveMeta = useStore((state) => state.liveMeta);
  const liveBusy = useStore((state) => state.liveBusy);
  const refreshLive = useStore((state) => state.refreshLive);
  const village = villages.find(
    (item) => item.id === (villageId || villages[0]?.id),
  );
  if (!village) return null;
  const weather = village.prediction?.weather;

  return (
    <section
      style={{
        background: "var(--bg-panel-raised)",
        border: "1px solid var(--line)",
        borderRadius: 12,
        padding: 16,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 8,
          marginBottom: 10,
        }}
      >
        <h3
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 15,
            margin: 0,
            fontWeight: 700,
          }}
        >
          Live weather model snapshot
        </h3>
        <DataModeBadge mode={dataMode} liveOk={!!liveMeta?.ok} />
      </div>
      <p
        style={{
          fontSize: 12,
          color: "var(--text-muted)",
          margin: "0 0 10px",
          lineHeight: 1.45,
        }}
      >
        {liveMeta?.disclaimer ||
          "Loading the latest available weather snapshot."}
      </p>
      {weather && (
        <div
          className="mono"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "7px 12px",
            fontSize: 11.5,
            marginBottom: 12,
          }}
        >
          <span>
            Rain 24h: <strong>{weather.rainfall_mm_24h} mm</strong>
          </span>
          <span>
            Temperature: <strong>{weather.air_temperature_c} °C</strong>
          </span>
          <span>
            Humidity: <strong>{weather.relative_humidity_pct}%</strong>
          </span>
          <span>
            Wind: <strong>{weather.wind_speed_mps} m/s</strong>
          </span>
        </div>
      )}
      <button
        type="button"
        onClick={refreshLive}
        disabled={liveBusy}
        style={{
          width: "100%",
          padding: "8px 10px",
          borderRadius: 7,
          border: "1px solid var(--accent)",
          background: "rgba(79,209,197,.1)",
          color: "var(--accent)",
          fontSize: 12,
          fontWeight: 700,
          cursor: liveBusy ? "wait" : "pointer",
        }}
      >
        {liveBusy ? "Loading snapshot…" : "Load current snapshot"}
      </button>
      {liveMeta?.validUntil && (
        <div
          className="mono"
          style={{ marginTop: 9, fontSize: 10.5, color: "var(--text-faint)" }}
        >
          Valid until {new Date(liveMeta.validUntil).toLocaleString()}
        </div>
      )}
    </section>
  );
}
