export interface Village {
  name: string;
  lat: number;
  lng: number;
  rainfall_mm: number;
  soil_moisture_pct: number;
  slope_angle_deg: number;
  population: number;
  households: number;
  lastReading: string;
}

export const initialVillages: Village[] = [
  {
    name: "Bhatwari",
    lat: 30.75,
    lng: 78.62,
    rainfall_mm: 42,
    soil_moisture_pct: 68,
    slope_angle_deg: 34,
    population: 1840,
    households: 412,
    lastReading: "2 min ago",
  },
  {
    name: "Gangnani",
    lat: 30.85,
    lng: 78.45,
    rainfall_mm: 88,
    soil_moisture_pct: 81,
    slope_angle_deg: 41,
    population: 1260,
    households: 286,
    lastReading: "1 min ago",
  },
  {
    name: "Sirwari",
    lat: 30.68,
    lng: 78.7,
    rainfall_mm: 15,
    soil_moisture_pct: 40,
    slope_angle_deg: 22,
    population: 740,
    households: 168,
    lastReading: "4 min ago",
  },
  {
    name: "Dharasu",
    lat: 30.8,
    lng: 78.5,
    rainfall_mm: 65,
    soil_moisture_pct: 74,
    slope_angle_deg: 37,
    population: 2210,
    households: 504,
    lastReading: "2 min ago",
  },
  {
    name: "Netala",
    lat: 30.72,
    lng: 78.58,
    rainfall_mm: 25,
    soil_moisture_pct: 52,
    slope_angle_deg: 28,
    population: 980,
    households: 224,
    lastReading: "3 min ago",
  },
  {
    name: "Sunagar",
    lat: 30.9,
    lng: 78.4,
    rainfall_mm: 95,
    soil_moisture_pct: 85,
    slope_angle_deg: 45,
    population: 610,
    households: 139,
    lastReading: "1 min ago",
  },
];

// Villages whose rainfall spikes when the "Simulate Heavy Rainfall Event" button fires
export const SIMULATION_TARGETS = ["Gangnani", "Sunagar"];
export const SIMULATION_RAINFALL_BUMP = 40;
