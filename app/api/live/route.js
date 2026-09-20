import { NextResponse } from "next/server";
import { initialVillages } from "@/data/mockData";
import { VILLAGE_TERRAIN, ratingFlow } from "@/lib/villageTerrain";

function sumWindow(values, startIdx, hours) {
  const slice = values.slice(Math.max(0, startIdx - hours + 1), startIdx + 1);
  return slice.reduce((a, b) => a + (Number(b) || 0), 0);
}

async function fetchOpenMeteo(lat, lng) {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
    `&hourly=precipitation,soil_moisture_0_to_7cm` +
    `&past_days=3&forecast_days=1&timezone=Asia%2FKolkata`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Open-Meteo HTTP ${res.status}`);
  }
  return res.json();
}

export async function GET() {
  try {
    const byVillage = {};
    for (const v of initialVillages) {
      const json = await fetchOpenMeteo(v.lat, v.lng);
      const precip = json.hourly?.precipitation || [];
      const soil = json.hourly?.soil_moisture_0_to_7cm || [];
      const times = json.hourly?.time || [];
      const nowIso = new Date().toISOString().slice(0, 13);
      let idx = times.findIndex((t) => t.startsWith(nowIso));
      if (idx < 0) idx = precip.length - 1;

      const rainfall3 = sumWindow(precip, idx, 3);
      const rainfall24 = sumWindow(precip, idx, 24);
      const rainfall72 = sumWindow(precip, idx, 72);
      const smVol = soil[idx];
      // volumetric m3/m3 ~ 0.1–0.45 → map to 20–95% display scale
      const soilPct =
        smVol == null || Number.isNaN(Number(smVol))
          ? null
          : Math.round(Math.min(95, Math.max(18, Number(smVol) * 220)));

      const terrain = VILLAGE_TERRAIN[v.id];
      const stage = v.signals.riverLevelM;
      byVillage[v.id] = {
        rainfall_mm_3h: Math.round(rainfall3 * 10) / 10,
        rainfall_mm_24h: Math.round(rainfall24 * 10) / 10,
        rainfall_mm_72h: Math.round(rainfall72 * 10) / 10,
        soil_moisture_pct: soilPct,
        // No public live river/tilt mesh is connected in this prototype.
        river_level_m: stage,
        river_flow_m3s: ratingFlow(stage, terrain),
        tilt_sensor: v.signals.tiltSensorAlert ? 1 : 0,
        liveFields: [
          "rainfall_mm_3h",
          "rainfall_mm_24h",
          "rainfall_mm_72h",
          ...(soilPct != null ? ["soil_moisture_pct"] : []),
        ],
        simulatedFields: ["river_level_m", "river_flow_m3s", "tilt_sensor"],
        source: "open-meteo",
      };
    }

    return NextResponse.json({
      ok: true,
      mode: "live",
      fetchedAt: Date.now(),
      source: "Open-Meteo (precipitation / soil moisture)",
      disclaimer:
        "Rainfall and soil moisture are live weather-model fields. River stage, flow and tilt remain last-known / simulated — this app has no IoT river gauges.",
      villages: byVillage,
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        mode: "simulation",
        error: err instanceof Error ? err.message : "Live fetch failed",
        disclaimer:
          "Live weather could not be reached. Showing simulation / last-known hydrology only.",
      },
      { status: 200 }
    );
  }
}
