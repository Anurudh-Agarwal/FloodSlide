/**
 * Synthetic/demo fallback prediction pipeline:
 * Input → preprocess → physics features → XGBoost → probability → risk level.
 *
 * Distinguishes data kinds:
 *   synthetic — training corpus only
 *   simulated — operator/demo sliders or fallback hydrology
 *   live      — Open-Meteo (or other) weather when the fetch succeeds
 */

import modelPayload from "@/data/ml/xgboost_flood.json";
import { enrichFeatures } from "@/lib/physicsFeatures";
import { predictProbability } from "@/lib/xgboostPredict";
import { ratingFlow, VILLAGE_TERRAIN } from "@/lib/villageTerrain";
import { RISK_LEVELS } from "@/data/mockData";

const RISK_FROM_PROB = [
  { max: 0.25, level: "normal" },
  { max: 0.45, level: "watch" },
  { max: 0.7, level: "warning" },
  { max: 1.01, level: "critical" },
];

export function probabilityToRiskLevel(p) {
  const row = RISK_FROM_PROB.find((r) => p < r.max) || RISK_FROM_PROB.at(-1);
  return row.level;
}

export function cascadeAlertFor(level) {
  if (level === "critical") return "imminent";
  if (level === "warning") return "catchment";
  if (level === "watch") return "regional";
  return "none";
}

export function cascadeLabel(level) {
  const map = {
    none: "Normal",
    regional: "Regional Watch",
    catchment: "Catchment Warning",
    imminent: "Imminent Alert",
  };
  return map[cascadeAlertFor(level)] || map.none;
}

function nowParts(date = new Date()) {
  return { month: date.getMonth() + 1, hour: date.getHours() };
}

export function preprocessInput(partial, village) {
  const terrain = VILLAGE_TERRAIN[village.id] || VILLAGE_TERRAIN["kv-01"];
  const signals = village.signals || {};
  const { month, hour } = nowParts();
  const rainfall3 = num(partial.rainfall_mm_3h, signals.rainfallMm3h, 0);
  const rainfall24 = num(partial.rainfall_mm_24h, signals.rainfallMm24h, rainfall3 * 2.2);
  const rainfall72 = num(partial.rainfall_mm_72h, signals.rainfallMm72h, rainfall24 * 1.8);
  const soil = clip(num(partial.soil_moisture_pct, signals.soilMoisturePct, 40), 0, 100);
  const stage = num(partial.river_level_m, signals.riverLevelM, 1);
  const thresh = num(partial.river_threshold_m, signals.riverThresholdM, 3.5);
  const flow = num(
    partial.river_flow_m3s,
    signals.riverFlowM3s,
    ratingFlow(stage, terrain)
  );
  const tilt = partial.tilt_sensor ?? (signals.tiltSensorAlert ? 1 : 0);
  const stability = num(
    partial.slope_stability_index,
    signals.slopeStabilityIndex,
    clip(0.9 - soil / 220 - rainfall24 / 400, 0.12, 0.95)
  );

  return {
    rainfall_mm_3h: rainfall3,
    rainfall_mm_24h: rainfall24,
    rainfall_mm_72h: rainfall72,
    soil_moisture_pct: soil,
    river_level_m: stage,
    river_threshold_m: thresh,
    river_flow_m3s: flow,
    slope_deg: terrain.slope_deg,
    elevation_m: terrain.elevation_m,
    twi: terrain.twi,
    curve_number: terrain.curve_number,
    ksat_mm_hr: terrain.ksat_mm_hr,
    distance_to_river_m: terrain.distance_to_river_m,
    catchment_area_km2: terrain.catchment_area_km2,
    slope_stability_index: stability,
    tilt_sensor: tilt ? 1 : 0,
    month: num(partial.month, month, month),
    hour: num(partial.hour, hour, hour),
  };
}

export function runPredictionPipeline({
  village,
  overrides = {},
  dataMode = "simulation",
  liveFields = [],
}) {
  const raw = preprocessInput(overrides, village);
  const features = enrichFeatures(raw);
  const probability = clip(predictProbability(modelPayload, features), 0, 1);
  const riskLevel = probabilityToRiskLevel(probability);
  const riskScore = Math.round(probability * 100);
  const cascade = cascadeAlertFor(riskLevel);
  const leadTimeMin =
    riskLevel === "normal"
      ? null
      : Math.max(15, Math.round((1 - probability) * 280));

  const keyFactors = buildKeyFactors(features, probability, dataMode);

  return {
    villageId: village.id,
    probability,
    riskLevel,
    riskScore,
    cascadeAlert: cascade,
    cascadeRank: RISK_LEVELS.indexOf(riskLevel),
    leadTimeMin,
    physics: {
      runoff_proxy_mm: features.runoff_proxy_mm,
      scs_runoff_mm: features.scs_runoff_mm,
      soil_wetness_risk: features.soil_wetness_risk,
      hydrological_load: features.hydrological_load,
      terrain_saturation_interaction: features.terrain_saturation_interaction,
      channel_stress: features.channel_stress,
    },
    inputs: raw,
    keyFactors,
    dataMode,
    liveFields,
    dataKind:
      dataMode === "live" && liveFields.length > 0 ? "live" : "simulated",
    model: {
      name: "xgboost_flood",
      objective: "binary:logistic",
      trainedOn: "synthetic",
    },
    predictedAt: Date.now(),
  };
}

function buildKeyFactors(f, p, mode) {
  const factors = [];
  if (f.hydrological_load >= 1) {
    factors.push(
      `Hydrological load ${f.hydrological_load.toFixed(2)} — stage near or above danger mark`
    );
  }
  if (f.runoff_proxy_mm > 12) {
    factors.push(
      `Runoff proxy ${f.runoff_proxy_mm.toFixed(1)} mm over 3h after infiltration`
    );
  }
  if (f.soil_wetness_risk > 1.1) {
    factors.push(
      `Soil/wetness risk ${f.soil_wetness_risk.toFixed(2)} (antecedent moisture elevated)`
    );
  }
  if (f.terrain_saturation_interaction > 0.35) {
    factors.push(
      `Terrain–saturation interaction ${f.terrain_saturation_interaction.toFixed(2)}`
    );
  }
  if (f.tilt_sensor >= 1) {
    factors.push("Tilt sensor tripped — slope movement coincident with wet soils");
  }
  if (factors.length === 0) {
    factors.push("Physics-informed features within seasonal envelope for this catchment");
  }
  factors.push(
    mode === "live"
      ? "Probability from XGBoost using live weather where available"
      : "Probability from XGBoost on simulated / last-known hydrology (not a live gauge)"
  );
  factors.push(`Model P(flood_occurred) = ${(p * 100).toFixed(1)}%`);
  return factors;
}

function num(...vals) {
  for (const v of vals) {
    if (v === null || v === undefined || v === "") continue;
    const n = Number(v);
    if (!Number.isNaN(n)) return n;
  }
  return 0;
}

function clip(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

export { modelPayload };
