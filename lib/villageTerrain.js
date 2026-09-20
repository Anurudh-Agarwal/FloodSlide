/**
 * Static catchment traits used by the physics + XGBoost pipeline.
 * Hydrology parameters are synthetic / literature-typical for Himalayan foothills,
 * aligned with the seeded villages in data/mockData.js — not surveyed DEMs.
 */

export const VILLAGE_TERRAIN = {
  "kv-01": {
    village_id: "kv-01",
    slope_deg: 22,
    elevation_m: 1280,
    twi: 9.4,
    curve_number: 78,
    ksat_mm_hr: 4.2,
    distance_to_river_m: 90,
    catchment_area_km2: 18.5,
    rating_a: 12,
    rating_b: 1.55,
  },
  "kv-02": {
    village_id: "kv-02",
    slope_deg: 31,
    elevation_m: 1460,
    twi: 7.1,
    curve_number: 74,
    ksat_mm_hr: 3.1,
    distance_to_river_m: 240,
    catchment_area_km2: 9.2,
    rating_a: 8,
    rating_b: 1.45,
  },
  "kv-03": {
    village_id: "kv-03",
    slope_deg: 26,
    elevation_m: 1195,
    twi: 10.8,
    curve_number: 82,
    ksat_mm_hr: 2.6,
    distance_to_river_m: 70,
    catchment_area_km2: 24,
    rating_a: 14,
    rating_b: 1.6,
  },
  "kv-04": {
    village_id: "kv-04",
    slope_deg: 18,
    elevation_m: 1340,
    twi: 8.2,
    curve_number: 72,
    ksat_mm_hr: 5.0,
    distance_to_river_m: 160,
    catchment_area_km2: 11.4,
    rating_a: 9,
    rating_b: 1.5,
  },
  "kv-05": {
    village_id: "kv-05",
    slope_deg: 28,
    elevation_m: 1510,
    twi: 6.4,
    curve_number: 70,
    ksat_mm_hr: 3.8,
    distance_to_river_m: 310,
    catchment_area_km2: 7.6,
    rating_a: 6.5,
    rating_b: 1.4,
  },
  "kv-06": {
    village_id: "kv-06",
    slope_deg: 16,
    elevation_m: 1410,
    twi: 7.8,
    curve_number: 68,
    ksat_mm_hr: 5.4,
    distance_to_river_m: 220,
    catchment_area_km2: 8.1,
    rating_a: 7,
    rating_b: 1.42,
  },
  "kv-07": {
    village_id: "kv-07",
    slope_deg: 29,
    elevation_m: 1230,
    twi: 8.9,
    curve_number: 76,
    ksat_mm_hr: 3.4,
    distance_to_river_m: 130,
    catchment_area_km2: 6.8,
    rating_a: 7.2,
    rating_b: 1.48,
  },
  "kv-08": {
    village_id: "kv-08",
    slope_deg: 19,
    elevation_m: 1375,
    twi: 8.0,
    curve_number: 71,
    ksat_mm_hr: 4.6,
    distance_to_river_m: 180,
    catchment_area_km2: 12.2,
    rating_a: 8.5,
    rating_b: 1.5,
  },
};

export const TARGET_VILLAGE_IDS = ["kv-01", "kv-02", "kv-03"];

export function ratingFlow(stageM, terrain) {
  const a = terrain?.rating_a ?? 8;
  const b = terrain?.rating_b ?? 1.5;
  return a * Math.pow(Math.max(stageM, 0.2), b);
}
