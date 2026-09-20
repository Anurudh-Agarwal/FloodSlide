"use client";

import { create } from "zustand";
import {
  initialVillages,
  initialReports,
  RISK_LEVELS,
} from "@/data/mockData";
import { translations } from "@/data/translations";
import { runPredictionPipeline } from "@/lib/predictionPipeline";
import { ratingFlow, VILLAGE_TERRAIN } from "@/lib/villageTerrain";

let reportCounter = initialReports.length + 1;

function severityRank(level) {
  return RISK_LEVELS.indexOf(level);
}

const getInitialLang = () => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("floodslide-lang");
    if (saved === "en" || saved === "hi") return saved;
  }
  return "en";
};

const getInitialAuth = () => {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("floodslide-auth");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
  }
  return {
    isAuthenticated: false,
    user: null,
  };
};

function withPrediction(village, extras = {}) {
  const result = runPredictionPipeline({
    village,
    overrides: extras.overrides || {},
    dataMode: extras.dataMode || "simulation",
    liveFields: extras.liveFields || [],
  });
  const lastHist = village.history?.[village.history.length - 1];
  const history =
    lastHist?.level === result.riskLevel
      ? village.history
      : [...(village.history || []), { t: result.predictedAt, level: result.riskLevel, probability: result.probability }];

  return {
    ...village,
    riskLevel: result.riskLevel,
    riskScore: result.riskScore,
    lastUpdated: result.predictedAt,
    keyFactors: result.keyFactors,
    prediction: result,
    probabilitySeries: [
      ...(village.probabilitySeries || []),
      { t: result.predictedAt, probability: result.probability },
    ].slice(-40),
    signals: {
      ...village.signals,
      rainfallMm3h: result.inputs.rainfall_mm_3h,
      rainfallMm24h: result.inputs.rainfall_mm_24h,
      rainfallMm72h: result.inputs.rainfall_mm_72h,
      soilMoisturePct: result.inputs.soil_moisture_pct,
      riverLevelM: result.inputs.river_level_m,
      riverFlowM3s: result.inputs.river_flow_m3s,
      tiltSensorAlert: !!result.inputs.tilt_sensor,
      slopeStabilityIndex: result.inputs.slope_stability_index,
      leadTimeMin: result.leadTimeMin,
    },
    history: (history || []).slice(-16),
  };
}

function modelRiskToUiRisk(risk) {
  if (risk === "HIGH") return "warning";
  if (risk === "MODERATE") return "watch";
  return "normal";
}

function applyMlPrediction(village, result) {
  const riskLevel = modelRiskToUiRisk(result.risk);
  const predictedAt = Date.parse(result.as_of) || Date.now();
  const lastHist = village.history?.[village.history.length - 1];
  const history =
    lastHist?.level === riskLevel
      ? village.history
      : [...(village.history || []), { t: predictedAt, level: riskLevel, probability: result.probability }];

  return {
    ...village,
    riskLevel,
    riskScore: Math.round(result.probability * 100),
    lastUpdated: predictedAt,
    keyFactors: [
      `Fixed weather snapshot: ${result.weather?.rainfall_mm_24h ?? "—"} mm rainfall in the last 24 hours.`,
      `Fixed demo risk = ${(result.probability * 100).toFixed(1)}% low risk.`,
      "Demo risk is intentionally separate from live weather; ML integration is pending.",
    ],
    prediction: {
      ...result,
      riskLevel,
      riskScore: Math.round(result.probability * 100),
      dataKind: result.prediction_mode === "fixed-demo" ? "fixed-demo" : "ml-service",
      physics: {},
      leadTimeMin: null,
      model: result.prediction_mode === "fixed-demo"
        ? { name: "Fixed demo prediction", objective: "not connected to ML" }
        : { name: "flood_model.pkl", objective: "binary:logistic" },
    },
    signals: {
      ...village.signals,
      rainfallMm3h: result.weather?.rainfall_mm_3h ?? 0,
      rainfallMm24h: result.weather?.rainfall_mm_24h ?? 0,
      rainfallMm72h: result.weather?.rainfall_mm_72h ?? 0,
      airTemperatureC: result.weather?.air_temperature_c ?? null,
      relativeHumidityPct: result.weather?.relative_humidity_pct ?? null,
      windSpeedMps: result.weather?.wind_speed_mps ?? null,
      surfacePressureKpa: result.weather?.surface_pressure_kpa ?? null,
      observationTime: result.weather?.observation_time ?? result.as_of,
    },
    probabilitySeries: [
      ...(village.probabilitySeries || []),
      { t: predictedAt, probability: result.probability },
    ].slice(-40),
    history: (history || []).slice(-16),
  };
}

function seedVillages() {
  // Keep placeholders empty while the live snapshot loads; never present a
  // client-generated risk score as a real village prediction.
  return initialVillages.map((v) => ({ ...v, probabilitySeries: [] }));
}

export const useStore = create((set, get) => ({
  villages: seedVillages(),
  reports: initialReports,
  helplineOpen: false,
  language: getInitialLang(),
  auth: getInitialAuth(),
  authError: null,
  dataMode: "simulation",
  liveMeta: { ok: false, source: null, error: null, fetchedAt: null, disclaimer: null },
  liveBusy: false,
  simVillageId: "dharali",
  modelMetrics: null,

  t: (key) => {
    const lang = get().language;
    return translations[lang]?.[key] || translations.en[key] || key;
  },

  setLanguage: (lang) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("floodslide-lang", lang);
    }
    set({ language: lang });
  },

  login: ({ username, password, department }) => {
    if (!username || !password) {
      set({ authError: "Please enter Officer ID and Password." });
      return false;
    }
    const userObj = {
      username: username.toUpperCase(),
      name: username.toUpperCase().includes("SHARMA") ? "Cmdt. R. Sharma" : `Officer ${username}`,
      agency: department || "National Disaster Management Authority (NDMA)",
      role: "Field Operational Commander",
      badgeId: "NDMA-IND-8841",
      loggedInAt: Date.now(),
    };

    const authState = {
      isAuthenticated: true,
      user: userObj,
    };

    if (typeof window !== "undefined") {
      localStorage.setItem("floodslide-auth", JSON.stringify(authState));
    }
    set({ auth: authState, authError: null });
    return true;
  },

  logout: () => {
    const authState = { isAuthenticated: false, user: null };
    if (typeof window !== "undefined") {
      localStorage.removeItem("floodslide-auth");
    }
    set({ auth: authState, authError: null });
  },

  getVillage: (id) => get().villages.find((v) => v.id === id),

  getMostSevereVillage: () => {
    const active = get().villages.filter((v) => v.status !== "resolved");
    if (active.length === 0) return null;
    return [...active].sort(
      (a, b) => severityRank(b.riskLevel) - severityRank(a.riskLevel) || b.riskScore - a.riskScore
    )[0];
  },

  getReportsForVillage: (villageId) =>
    get().reports.filter((r) => r.villageId === villageId),

  addReport: ({ villageId, type, description, image, reporterName }) => {
    const report = {
      id: `rep-${String(reportCounter++).padStart(2, "0")}`,
      villageId: villageId || null,
      type,
      description,
      image: image || null,
      reporterName: reporterName || "Anonymous report",
      timestamp: Date.now(),
    };
    set((state) => ({ reports: [report, ...state.reports] }));
    return report;
  },

  setVillageStatus: (villageId, status) => {
    set((state) => ({
      villages: state.villages.map((v) =>
        v.id === villageId ? { ...v, status } : v
      ),
    }));
  },

  setSimVillageId: (id) => set({ simVillageId: id }),

  setDataMode: (mode) => {
    if (mode === "live") {
      get().refreshLive();
      return;
    }
    set((state) => ({
      dataMode: "simulation",
      liveMeta: {
        ...state.liveMeta,
        ok: false,
        disclaimer:
          "Simulation / last-known hydrology. Not live river gauges.",
      },
      villages: state.villages.map((v) =>
        withPrediction(v, { dataMode: "simulation", liveFields: [] })
      ),
    }));
  },

  updateSimulatedSignals: (villageId, patch) => {
    set((state) => ({
      dataMode: "simulation",
      liveMeta: {
        ...state.liveMeta,
        ok: false,
      },
      villages: state.villages.map((v) => {
        if (v.id !== villageId) return v;
        const signals = { ...v.signals, ...patch };
        if (patch.riverLevelM != null && patch.riverFlowM3s == null) {
          signals.riverFlowM3s = Number(
            ratingFlow(patch.riverLevelM, VILLAGE_TERRAIN[v.id]).toFixed(1)
          );
        }
        return withPrediction({ ...v, signals }, { dataMode: "simulation" });
      }),
    }));
  },

  // Call the real Python model through the same-origin Next.js proxy. Callers
  // must supply the complete 72-hour, original ML-schema history; the current
  // fictional seeded villages intentionally have no such history or mapping.
  requestMlPrediction: async ({ villageId, village_id, as_of, observations }) => {
    const village = get().getVillage(villageId);
    if (!village) return { ok: false, error: "Unknown UI village" };
    if (!village_id) {
      return { ok: false, error: "No supported model village is configured" };
    }

    try {
      const res = await fetch("/api/predict", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ village_id, as_of, observations }),
      });
      const result = await res.json();
      if (!res.ok) {
        return { ok: false, error: result.detail || result.error || "ML prediction failed" };
      }
      set((state) => ({
        villages: state.villages.map((item) =>
          item.id === villageId ? applyMlPrediction(item, result) : item
        ),
      }));
      return { ok: true, result };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "ML prediction request failed",
      };
    }
  },

  // Existing demo control: map a forced risk band onto hydrology, then run the model.
  simulateSensorTrigger: (villageId, riskLevel) => {
    const presets = {
      critical: {
        rainfallMm3h: 92,
        rainfallMm24h: 150,
        rainfallMm72h: 210,
        soilMoisturePct: 94,
        riverLevelM: 4.7,
        tiltSensorAlert: true,
      },
      warning: {
        rainfallMm3h: 58,
        rainfallMm24h: 96,
        rainfallMm72h: 140,
        soilMoisturePct: 84,
        riverLevelM: 3.3,
        tiltSensorAlert: false,
      },
      watch: {
        rainfallMm3h: 30,
        rainfallMm24h: 48,
        rainfallMm72h: 70,
        soilMoisturePct: 66,
        riverLevelM: 1.7,
        tiltSensorAlert: false,
      },
      normal: {
        rainfallMm3h: 5,
        rainfallMm24h: 10,
        rainfallMm72h: 16,
        soilMoisturePct: 38,
        riverLevelM: 0.8,
        tiltSensorAlert: false,
      },
    };
    get().updateSimulatedSignals(villageId, presets[riskLevel] || presets.normal);
  },

  refreshLive: async () => {
    if (get().liveBusy) return;
    set({ liveBusy: true });
    try {
      const res = await fetch("/api/live", { cache: "no-store" });
      const json = await res.json();
      if (!json.ok) {
        set((state) => ({
          liveBusy: false,
          dataMode: "simulation",
          liveMeta: {
            ok: false,
            source: null,
            error: json.error || "Live fetch failed",
            fetchedAt: Date.now(),
            disclaimer: json.disclaimer,
          },
          villages: state.villages,
        }));
        return;
      }
      set((state) => ({
        liveBusy: false,
        dataMode: "live",
        liveMeta: {
          ok: true,
          source: json.source,
          error: null,
          fetchedAt: json.fetchedAt,
          disclaimer: json.disclaimer,
          snapshotId: json.snapshot_id,
          validUntil: json.valid_until,
        },
        villages: state.villages.map((v) => {
          const prediction = json.predictions?.[v.id];
          return prediction ? applyMlPrediction(v, { ...prediction, snapshot_id: json.snapshot_id }) : v;
        }),
      }));
    } catch (err) {
      set((state) => ({
        liveBusy: false,
        dataMode: "simulation",
        liveMeta: {
          ok: false,
          source: null,
          error: err instanceof Error ? err.message : "Network error",
          fetchedAt: Date.now(),
          disclaimer:
            "Live weather could not be reached. Using simulated hydrology.",
        },
        villages: state.villages,
      }));
    }
  },

  loadModelMetrics: async () => {
    if (get().modelMetrics) return;
    try {
      const res = await fetch("/api/model-metrics");
      const json = await res.json();
      set({ modelMetrics: json });
    } catch (e) {
      console.error(e);
    }
  },

  toggleHelpline: (open) =>
    set((state) => ({
      helplineOpen: open !== undefined ? open : !state.helplineOpen,
    })),
}));
