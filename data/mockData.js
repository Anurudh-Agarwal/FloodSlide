// The dashboard is limited to the three locations supported by the current ML
// model. Initial values are placeholders until NASA POWER live history loads.
export const RISK_LEVELS = ["normal", "watch", "warning", "critical"];
export const RISK_META = {
  normal: { label: "Normal", short: "No active risk signals", color: "#3FA796" },
  watch: { label: "Regional Watch", short: "Elevated weather risk", color: "#E8B84B" },
  warning: { label: "Catchment Warning", short: "Flood risk rising", color: "#E8763C" },
  critical: { label: "Imminent Alert", short: "Act immediately", color: "#D6412C" },
};

const pendingVillage = (id, name, lat, lng) => ({
  id, name, ward: "Model monitoring location", lat, lng, population: 0,
  hazardType: "flood", riskLevel: "normal", riskScore: 0, status: "unverified",
  lastUpdated: Date.now(), keyFactors: ["Waiting for NASA POWER live weather history."],
  history: [{ t: Date.now(), level: "normal" }],
  signals: { rainfallMm3h: null, rainfallMm24h: null, rainfallMm72h: null, soilMoisturePct: null,
    riverLevelM: null, riverThresholdM: null, riverFlowM3s: null, slopeStabilityIndex: null,
    tiltSensorAlert: false, leadTimeMin: null },
});

export const initialVillages = [
  pendingVillage("dharali", "Dharali", 31.041, 78.781),
  pendingVillage("chositi", "Chositi", 33.317, 75.8),
  pendingVillage("malana", "Malana", 32.117, 77.267),
];

export const initialReports = [];
export const HELPLINES = [
  { name: "National Disaster Management (NDRF)", number: "1078" },
  { name: "State Emergency Operations Centre", number: "1070" },
  { name: "Police", number: "100" },
  { name: "Ambulance", number: "108" },
];
