export interface Village {
  name: string;
  lat: number;
  lng: number;
  rainfall_mm: number;
  soil_moisture_pct: number;
  slope_angle_deg: number;
}

export const initialVillages: Village[] = [
  { name: "Bhatwari", lat: 30.75, lng: 78.62, rainfall_mm: 42, soil_moisture_pct: 68, slope_angle_deg: 34 },
  { name: "Gangnani", lat: 30.85, lng: 78.45, rainfall_mm: 88, soil_moisture_pct: 81, slope_angle_deg: 41 },
  { name: "Sirwari", lat: 30.68, lng: 78.70, rainfall_mm: 15, soil_moisture_pct: 40, slope_angle_deg: 22 },
  { name: "Dharasu", lat: 30.80, lng: 78.50, rainfall_mm: 65, soil_moisture_pct: 74, slope_angle_deg: 37 },
  { name: "Netala", lat: 30.72, lng: 78.58, rainfall_mm: 25, soil_moisture_pct: 52, slope_angle_deg: 28 },
  { name: "Sunagar", lat: 30.90, lng: 78.40, rainfall_mm: 95, soil_moisture_pct: 85, slope_angle_deg: 45 },
];

// Villages whose rainfall spikes when the "Simulate Heavy Rainfall Event" button fires
export const SIMULATION_TARGETS = ["Gangnani", "Sunagar"];
export const SIMULATION_RAINFALL_BUMP = 40;
