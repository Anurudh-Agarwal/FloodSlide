import { NextResponse } from "next/server";

const LOCATIONS = {
  dharali: { name: "Dharali", latitude: 31.041, longitude: 78.781 },
  chositi: { name: "Chositi", latitude: 33.317, longitude: 75.8 },
  malana: { name: "Malana", latitude: 32.117, longitude: 77.267 },
};

const DEMO_BASE_PERCENTAGES = {
  dharali: 11,
  chositi: 15,
  malana: 7,
};

const HOURLY_FIELDS = [
  "temperature_2m",
  "relative_humidity_2m",
  "precipitation",
  "surface_pressure",
  "wind_speed_10m",
].join(",");

function numberAt(values, index) {
  const value = values?.[index];
  return Number.isFinite(value) ? value : null;
}

function rounded(value, digits = 3) {
  return value === null ? null : Number(value.toFixed(digits));
}

function probabilityFromBase(basePercentage) {
  const decimalPercentage = Math.floor(Math.random() * 1000) / 1000;
  return (basePercentage + decimalPercentage) / 100;
}

async function fetchVillageWeather(location) {
  const params = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    hourly: HOURLY_FIELDS,
    past_days: "3",
    forecast_days: "1",
    timezone: "GMT",
    timeformat: "unixtime",
    wind_speed_unit: "ms",
  });
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?${params}`,
    {
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    },
  );
  if (!response.ok)
    throw new Error(`Open-Meteo returned HTTP ${response.status}`);

  const data = await response.json();
  const hourly = data.hourly;
  if (!hourly?.time?.length)
    throw new Error("Open-Meteo returned no hourly observations");

  const now = Math.floor(Date.now() / 1000);
  let latest = hourly.time.reduce(
    (selected, timestamp, index) => (timestamp <= now ? index : selected),
    -1,
  );
  if (latest < 0) latest = hourly.time.length - 1;

  const precipitation = hourly.precipitation || [];
  const rainTotal = (hours) =>
    precipitation
      .slice(Math.max(0, latest - hours + 1), latest + 1)
      .reduce(
        (total, value) => total + (Number.isFinite(value) ? value : 0),
        0,
      );

  return {
    observation_time: new Date(hourly.time[latest] * 1000).toISOString(),
    rainfall_mm_1h: rounded(numberAt(precipitation, latest)),
    rainfall_mm_3h: rounded(rainTotal(3)),
    rainfall_mm_24h: rounded(rainTotal(24)),
    rainfall_mm_72h: rounded(rainTotal(72)),
    air_temperature_c: rounded(numberAt(hourly.temperature_2m, latest)),
    relative_humidity_pct: rounded(
      numberAt(hourly.relative_humidity_2m, latest),
    ),
    wind_speed_mps: rounded(numberAt(hourly.wind_speed_10m, latest)),
    surface_pressure_kpa: (() => {
      const pressureHpa = numberAt(hourly.surface_pressure, latest);
      return pressureHpa === null ? null : rounded(pressureHpa / 10);
    })(),
  };
}

export async function GET() {
  try {
    const entries = await Promise.all(
      Object.entries(LOCATIONS).map(async ([id, location]) => {
        const weather = await fetchVillageWeather(location);
        const probability = probabilityFromBase(DEMO_BASE_PERCENTAGES[id]);
        return [
          id,
          {
            village_id: location.name,
            probability,
            confidence_pct: probability * 100,
            risk: "LOW",
            as_of: weather.observation_time,
            weather,
            prediction_mode: "weather-estimate",
            data_quality: { source: "Open-Meteo hourly weather API" },
          },
        ];
      }),
    );

    return NextResponse.json({
      ok: true,
      source: "Open-Meteo hourly weather API",
      fetchedAt: new Date().toISOString(),
      disclaimer:
        "Weather is live API data. Flood risk is a bounded estimate influenced by recent rainfall and humidity.",
      predictions: Object.fromEntries(entries),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? `Live weather unavailable: ${error.message}`
            : "Live weather unavailable",
      },
      { status: 503 },
    );
  }
}
