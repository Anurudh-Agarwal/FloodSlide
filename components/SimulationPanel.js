"use client";

import { useStore } from "@/store/useStore";
import DataModeBadge from "@/components/DataModeBadge";

function SliderRow({ label, min, max, step, value, unit, onChange }) {
  return (
    <label style={{ display: "block", marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, marginBottom: 4 }}>
        <span style={{ color: "var(--text-muted)" }}>{label}</span>
        <span className="mono" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
          {typeof value === "boolean" ? "" : `${value}${unit || ""}`}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%" }}
      />
    </label>
  );
}

export default function SimulationPanel({ villageId }) {
  const villages = useStore((s) => s.villages);
  const dataMode = useStore((s) => s.dataMode);
  const liveMeta = useStore((s) => s.liveMeta);
  const setDataMode = useStore((s) => s.setDataMode);
  const refreshLive = useStore((s) => s.refreshLive);
  const updateSimulatedSignals = useStore((s) => s.updateSimulatedSignals);
  const simVillageId = useStore((s) => s.simVillageId);
  const setSimVillageId = useStore((s) => s.setSimVillageId);
  const t = useStore((s) => s.t);
  const liveBusy = useStore((s) => s.liveBusy);

  const id = villageId || simVillageId || villages[0]?.id;
  const village = villages.find((v) => v.id === id);
  if (!village) return null;
  const s = village.signals;

  const liveOk = dataMode === "live" && liveMeta?.ok;

  return (
    <div
      style={{
        background: "var(--bg-panel-raised)",
        border: "1px solid var(--line)",
        borderRadius: 12,
        padding: 16,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15, margin: 0, fontWeight: 700 }}>
          {t("modelPanelTitle")}
        </h3>
        <DataModeBadge mode={dataMode} liveOk={!!liveOk} />
      </div>
      <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 12px", lineHeight: 1.45 }}>
        {liveOk ? t("liveModeNotice") : t("simulationModeNotice")}
      </p>

      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        <button
          type="button"
          onClick={() => setDataMode("simulation")}
          style={modeBtn(dataMode !== "live")}
        >
          {t("modeSimulation")}
        </button>
        <button
          type="button"
          onClick={() => refreshLive()}
          disabled={liveBusy}
          style={modeBtn(dataMode === "live")}
        >
          {liveBusy ? t("fetchingLive") : t("modeLive")}
        </button>
      </div>

      {liveMeta?.error && dataMode !== "live" && (
        <div style={{ fontSize: 11.5, color: "var(--risk-warning)", marginBottom: 10 }}>
          {t("liveFallback")}: {liveMeta.error}
        </div>
      )}

      {!villageId && (
        <select
          value={id}
          onChange={(e) => setSimVillageId(e.target.value)}
          style={{
            width: "100%",
            marginBottom: 12,
            padding: "7px 8px",
            borderRadius: 6,
            border: "1px solid var(--line)",
            background: "var(--bg-panel)",
            color: "var(--text-primary)",
            fontSize: 12.5,
          }}
        >
          {villages.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>
      )}

      <fieldset disabled={liveOk} style={{ border: 0, padding: 0, margin: 0, opacity: liveOk ? 0.55 : 1 }}>
        <SliderRow
          label={t("rainfall")}
          min={0}
          max={150}
          step={1}
          value={s.rainfallMm3h}
          unit=" mm / 3h"
          onChange={(rainfallMm3h) => updateSimulatedSignals(id, { rainfallMm3h })}
        />
        <SliderRow
          label={t("soilMoisture")}
          min={15}
          max={99}
          step={1}
          value={s.soilMoisturePct}
          unit="%"
          onChange={(soilMoisturePct) => updateSimulatedSignals(id, { soilMoisturePct })}
        />
        <SliderRow
          label={t("riverLevel")}
          min={0.2}
          max={7}
          step={0.1}
          value={s.riverLevelM}
          unit=" m"
          onChange={(riverLevelM) => updateSimulatedSignals(id, { riverLevelM })}
        />
        <SliderRow
          label={t("riverFlow")}
          min={0}
          max={250}
          step={1}
          value={Math.round(s.riverFlowM3s || 0)}
          unit=" m³/s"
          onChange={(riverFlowM3s) => updateSimulatedSignals(id, { riverFlowM3s })}
        />
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--text-muted)" }}>
          <input
            type="checkbox"
            checked={!!s.tiltSensorAlert}
            onChange={(e) => updateSimulatedSignals(id, { tiltSensorAlert: e.target.checked })}
          />
          {t("tiltSensor")}
        </label>
      </fieldset>

      {village.prediction && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--line-soft)", fontSize: 12.5 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--text-muted)" }}>{t("floodProbability")}</span>
            <span className="mono" style={{ fontWeight: 700 }}>
              {(village.prediction.probability * 100).toFixed(1)}%
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
            <span style={{ color: "var(--text-muted)" }}>{t("dataKind")}</span>
            <span className="mono">{village.prediction.dataKind}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function modeBtn(active) {
  return {
    flex: 1,
    padding: "8px 10px",
    borderRadius: 8,
    border: active ? "1px solid var(--accent)" : "1px solid var(--line)",
    background: active ? "rgba(79, 209, 197, 0.15)" : "var(--bg-panel)",
    color: active ? "var(--accent)" : "var(--text-muted)",
    fontWeight: 700,
    fontSize: 12,
    cursor: "pointer",
  };
}
