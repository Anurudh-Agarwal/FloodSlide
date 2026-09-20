/**
 * Physics-informed feature layer.
 * Keep formulas in lockstep with ml/physics.py.
 */

export const RAW_FEATURES = [
  "rainfall_mm_3h",
  "rainfall_mm_24h",
  "rainfall_mm_72h",
  "soil_moisture_pct",
  "river_level_m",
  "river_threshold_m",
  "river_flow_m3s",
  "slope_deg",
  "elevation_m",
  "twi",
  "curve_number",
  "ksat_mm_hr",
  "distance_to_river_m",
  "catchment_area_km2",
  "slope_stability_index",
  "tilt_sensor",
  "month",
  "hour",
];

export const PHYSICS_FEATURES = [
  "infiltration_mm",
  "runoff_proxy_mm",
  "scs_runoff_mm",
  "antecedent_precip_index",
  "soil_wetness_risk",
  "terrain_saturation_interaction",
  "hydrological_load",
  "excess_stage_m",
  "slope_runoff_amp",
  "channel_stress",
  "storage_deficit",
  "proximity_load",
];

export const FEATURE_NAMES = [...RAW_FEATURES, ...PHYSICS_FEATURES];

function clip(value, lo, hi) {
  return Math.max(lo, Math.min(hi, value));
}

export function scsCurveNumberRunoff(rainfallMm, curveNumber) {
  const cn = clip(curveNumber, 30, 98);
  const s = 25400 / cn - 254;
  const ia = 0.2 * s;
  if (rainfallMm <= ia) return 0;
  const num = rainfallMm - ia;
  return (num * num) / (num + s);
}

export function derivePhysics(row) {
  const rain3 = Number(row.rainfall_mm_3h);
  const rain24 = Number(row.rainfall_mm_24h);
  const rain72 = Number(row.rainfall_mm_72h);
  const soil = Number(row.soil_moisture_pct);
  const stage = Number(row.river_level_m);
  const thresh = Math.max(Number(row.river_threshold_m), 0.4);
  const flow = Math.max(Number(row.river_flow_m3s), 0);
  const slope = Number(row.slope_deg);
  const twi = Number(row.twi);
  const cn = Number(row.curve_number);
  const ksat = Number(row.ksat_mm_hr);
  const dist = Math.max(Number(row.distance_to_river_m), 1);
  const area = Math.max(Number(row.catchment_area_km2), 0.2);
  const tilt = Number(row.tilt_sensor) >= 0.5 ? 1 : 0;

  const satFrac = clip(soil / 100, 0, 1);
  const infiltration = Math.min(rain3, ksat * 3 * (1 - 0.85 * satFrac));
  const runoffProxy = Math.max(0, rain3 - infiltration);
  const scsRunoff = scsCurveNumberRunoff(rain3, cn);
  const api = 0.55 * rain3 + 0.3 * (rain24 / 8) + 0.15 * (rain72 / 24);
  const soilWetnessRisk = satFrac * (1 + rain24 / 80);
  const terrainSat = (twi / 12) * satFrac * (runoffProxy / 40);
  const hydroLoad = stage / thresh + 0.15 * Math.log1p(flow);
  const excessStage = stage - thresh;
  const slopeRunoffAmp = runoffProxy * (slope / 30);
  const channelStress = hydroLoad * (1 + 0.35 * tilt) * Math.sqrt(area);
  const storageDeficit = Math.max(0, 100 - soil) * (50 / Math.max(cn, 1));
  const proximityLoad = (1 / Math.log1p(dist)) * Math.max(0, hydroLoad);

  return {
    infiltration_mm: round4(infiltration),
    runoff_proxy_mm: round4(runoffProxy),
    scs_runoff_mm: round4(scsRunoff),
    antecedent_precip_index: round4(api),
    soil_wetness_risk: round4(soilWetnessRisk),
    terrain_saturation_interaction: round4(terrainSat),
    hydrological_load: round4(hydroLoad),
    excess_stage_m: round4(excessStage),
    slope_runoff_amp: round4(slopeRunoffAmp),
    channel_stress: round4(channelStress),
    storage_deficit: round4(storageDeficit),
    proximity_load: round4(proximityLoad),
  };
}

export function enrichFeatures(row) {
  return { ...row, ...derivePhysics(row) };
}

function round4(n) {
  return Math.round(n * 10000) / 10000;
}
