import { Village } from "../data/villages";

export type RiskLevel = "Safe" | "Watch" | "Imminent";

export interface RiskResult {
  score: number;
  level: RiskLevel;
}

/**
 * Weighted composite of three physical factors.
 * This is a deliberately simple, explainable stand-in for the
 * drainage-graph + physics-informed ML model described in the
 * production architecture.
 */
export function calculateRisk(village: Village): RiskResult {
  const score =
    (village.rainfall_mm / 100) * 0.4 +
    (village.soil_moisture_pct / 100) * 0.35 +
    (village.slope_angle_deg / 90) * 0.25;

  let level: RiskLevel = "Safe";
  if (score > 0.6) level = "Imminent";
  else if (score >= 0.35) level = "Watch";

  return { score: Math.round(score * 1000) / 1000, level };
}

export interface RiskContribution {
  label: string;
  contribution: number; // weighted contribution, 0-1 scale
  share: number; // this factor's % share of the total score
}

/**
 * Breaks the risk score into its three weighted inputs so the UI can show
 * "why" a village scored the way it did. Uses the same 0.4 / 0.35 / 0.25
 * weights as calculateRisk — this is a direct readout of the formula, not
 * a separate model, so it's accurately labeled as a "risk factor breakdown"
 * rather than an AI-generated explanation.
 */
export function riskBreakdown(village: {
  rainfall_mm: number;
  soil_moisture_pct: number;
  slope_angle_deg: number;
}): RiskContribution[] {
  const rainfall = (village.rainfall_mm / 100) * 0.4;
  const soil = (village.soil_moisture_pct / 100) * 0.35;
  const slope = (village.slope_angle_deg / 90) * 0.25;
  const total = rainfall + soil + slope || 1;

  return [
    { label: "Rainfall", contribution: rainfall, share: rainfall / total },
    { label: "Soil moisture", contribution: soil, share: soil / total },
    { label: "Slope", contribution: slope, share: slope / total },
  ];
}

export function riskColor(level: RiskLevel): string {
  switch (level) {
    case "Safe":
      return "var(--safe)";
    case "Watch":
      return "var(--watch)";
    case "Imminent":
      return "var(--imminent)";
  }
}
