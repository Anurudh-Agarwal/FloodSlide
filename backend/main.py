"""FastAPI serving layer for the existing FloodSlide Python model.

The feature engineering and artifacts remain owned by ``ml/``. This service
only validates a canonical hourly-history request and invokes that code.
"""

from __future__ import annotations

import hashlib
import json
import os
import sys
from threading import Lock
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Annotated
from urllib.parse import urlencode
from urllib.request import urlopen

import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

ROOT_DIR = Path(__file__).resolve().parents[1]
ML_DIR = ROOT_DIR / "ml"
sys.path.insert(0, str(ML_DIR))

from flood_features import BASE, add_features  # noqa: E402

# These pickle-compatible artifacts are committed with the service so a Render
# instance can load the exact model that was tested locally.
MODEL_PATH = ML_DIR / "flood_model.pkl"
CLIMATOLOGY_PATH = ML_DIR / "climatology.pkl"
FEATURES_PATH = ML_DIR / "features.json"

MODEL = joblib.load(MODEL_PATH)
CLIMATOLOGY = joblib.load(CLIMATOLOGY_PATH)
FEATURES = json.loads(FEATURES_PATH.read_text(encoding="utf-8"))
MODEL_VERSION = hashlib.sha256(MODEL_PATH.read_bytes()).hexdigest()[:12]
SUPPORTED_VILLAGES = {name.lower(): name for name in CLIMATOLOGY}
VILLAGE_LOCATIONS = {
    "Dharali": {"latitude": 31.041, "longitude": 78.781},
    "Chositi": {"latitude": 33.317, "longitude": 75.800},
    "Malana": {"latitude": 32.117, "longitude": 77.267},
}
LIVE_SNAPSHOT_TTL = timedelta(hours=int(os.getenv("LIVE_SNAPSHOT_TTL_HOURS", "6")))
_live_snapshot: dict | None = None
_live_snapshot_lock = Lock()


class HourlyObservation(BaseModel):
    """One complete hourly record in the original model's input schema."""

    model_config = ConfigDict(extra="forbid")

    timestamp: datetime
    PRECTOTCORR: float
    RH2M: float
    T2M: float
    T2MDEW: float
    T2MWET: float
    PS: float
    QV2M: float
    WS10M: float
    TS: float


class PredictionRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    village_id: Annotated[str, Field(min_length=1)]
    as_of: datetime
    observations: Annotated[list[HourlyObservation], Field(min_length=72, max_length=72)]

    @field_validator("village_id")
    @classmethod
    def supported_village(cls, value: str) -> str:
        canonical = SUPPORTED_VILLAGES.get(value.strip().lower())
        if not canonical:
            supported = ", ".join(sorted(CLIMATOLOGY))
            raise ValueError(f"Unsupported village_id. Supported villages: {supported}")
        return canonical

    @model_validator(mode="after")
    def validate_hourly_history(self):
        timestamps = [row.timestamp for row in self.observations]
        if any(ts.tzinfo is None for ts in timestamps) or self.as_of.tzinfo is None:
            raise ValueError("as_of and every observation timestamp must include a timezone")
        if len(set(timestamps)) != len(timestamps):
            raise ValueError("observations must not contain duplicate timestamps")
        ordered = sorted(timestamps)
        for previous, current in zip(ordered, ordered[1:]):
            if current - previous != timedelta(hours=1):
                raise ValueError("observations must be a contiguous 72-hour hourly history")
        if ordered[-1] != self.as_of:
            raise ValueError("as_of must exactly match the latest observation timestamp")
        return self


app = FastAPI(title="FloodSlide ML Service", version="1.0.0")


@app.get("/health")
def health():
    return {
        "ok": True,
        "model_version": MODEL_VERSION,
        "supported_villages": sorted(CLIMATOLOGY),
    }


@app.post("/v1/predictions")
def create_prediction(payload: PredictionRequest):
    try:
        rows = [row.model_dump(exclude={"timestamp"}) for row in payload.observations]
        index = pd.DatetimeIndex([row.timestamp for row in payload.observations])
        history = pd.DataFrame(rows, index=index).sort_index()
        history.index.name = "time"
        feature_frame = add_features(history, clim=CLIMATOLOGY[payload.village_id])
        probability = float(MODEL.predict_proba(feature_frame[FEATURES].iloc[[-1]])[:, 1][0])
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Model prediction failed") from exc

    risk = "HIGH" if probability >= 0.6 else "MODERATE" if probability >= 0.3 else "LOW"
    return {
        "village_id": payload.village_id,
        "probability": round(probability, 4),
        "risk": risk,
        "confidence_pct": round(probability * 100, 1),
        "as_of": payload.as_of.isoformat(),
        "model_version": MODEL_VERSION,
        "data_quality": {
            "expected_observations": 72,
            "received_observations": len(payload.observations),
            "hourly_contiguous": True,
            "required_fields": BASE,
            "missing_fields": [],
        },
    }


def nasa_power_history(village: str) -> list[dict]:
    """Fetch the newest complete 72-hour NASA POWER history for a model village."""
    location = VILLAGE_LOCATIONS[village]
    end = datetime.now().astimezone().date()
    start = end - timedelta(days=5)
    query = urlencode({
        "parameters": ",".join(BASE), "community": "AG",
        "longitude": location["longitude"], "latitude": location["latitude"],
        "start": start.strftime("%Y%m%d"), "end": end.strftime("%Y%m%d"),
        "format": "JSON", "time-standard": "UTC",
    })
    url = f"https://power.larc.nasa.gov/api/temporal/hourly/point?{query}"
    with urlopen(url, timeout=30) as response:
        parameters = json.load(response)["properties"]["parameter"]
    rows = []
    for key in sorted(parameters[BASE[0]]):
        values = {name: parameters[name].get(key) for name in BASE}
        if any(value is None or float(value) <= -999 for value in values.values()):
            continue
        timestamp = datetime.strptime(key, "%Y%m%d%H").replace(tzinfo=timezone.utc)
        rows.append({"timestamp": timestamp.isoformat(), **values})
    contiguous = []
    for row in rows:
        if not contiguous or datetime.fromisoformat(row["timestamp"]) - datetime.fromisoformat(contiguous[-1]["timestamp"]) == timedelta(hours=1):
            contiguous.append(row)
        else:
            contiguous = [row]
    if len(contiguous) < 72:
        raise HTTPException(status_code=503, detail="NASA POWER has fewer than 72 complete recent hourly records")
    return contiguous[-72:]


def open_meteo_history(village: str) -> list[dict]:
    """Fallback weather history when NASA POWER is temporarily unreachable.

    Open-Meteo does not provide all of the NASA POWER fields used at training
    time, so wet-bulb temperature and specific humidity are derived. The
    response is explicitly marked as a fallback in the API payload.
    """
    location = VILLAGE_LOCATIONS[village]
    query = urlencode({
        "latitude": location["latitude"],
        "longitude": location["longitude"],
        "hourly": "temperature_2m,relative_humidity_2m,dew_point_2m,precipitation,surface_pressure,wind_speed_10m,soil_temperature_0cm",
        "past_days": 4,
        "forecast_days": 1,
        "timezone": "UTC",
        "wind_speed_unit": "ms",
    })
    with urlopen(f"https://api.open-meteo.com/v1/forecast?{query}", timeout=30) as response:
        hourly = json.load(response)["hourly"]

    rows = []
    for index, timestamp in enumerate(hourly["time"]):
        values = {name: hourly[name][index] for name in hourly if name != "time"}
        if any(value is None for value in values.values()):
            continue
        temperature = float(values["temperature_2m"])
        humidity = float(values["relative_humidity_2m"])
        pressure_kpa = float(values["surface_pressure"]) / 10
        # Tetens approximation for specific humidity (kg/kg).
        vapor_pressure = (humidity / 100) * 0.61078 * pow(2.718281828, (17.2694 * temperature) / (temperature + 237.3))
        specific_humidity = 0.622 * vapor_pressure / max(pressure_kpa - 0.378 * vapor_pressure, 0.01)
        rows.append({
            "timestamp": f"{timestamp}:00+00:00",
            "PRECTOTCORR": float(values["precipitation"]),
            "RH2M": humidity,
            "T2M": temperature,
            "T2MDEW": float(values["dew_point_2m"]),
            "T2MWET": (temperature + float(values["dew_point_2m"])) / 2,
            "PS": pressure_kpa,
            "QV2M": specific_humidity,
            "WS10M": float(values["wind_speed_10m"]),
            "TS": float(values["soil_temperature_0cm"]),
        })
    if len(rows) < 72:
        raise HTTPException(status_code=503, detail="Open-Meteo has fewer than 72 usable hourly records")
    return rows[-72:]


def weather_summary(observations: list[dict]) -> dict:
    """Expose only weather values supplied by NASA POWER, never fabricated gauges."""
    latest = observations[-1]
    rainfall = lambda hours: sum(float(row["PRECTOTCORR"]) for row in observations[-hours:])
    return {
        "observation_time": latest["timestamp"],
        "rainfall_mm_1h": round(float(latest["PRECTOTCORR"]), 2),
        "rainfall_mm_3h": round(rainfall(3), 2),
        "rainfall_mm_24h": round(rainfall(24), 2),
        "rainfall_mm_72h": round(rainfall(72), 2),
        "relative_humidity_pct": round(float(latest["RH2M"]), 1),
        "air_temperature_c": round(float(latest["T2M"]), 1),
        "dew_point_c": round(float(latest["T2MDEW"]), 1),
        "surface_pressure_kpa": round(float(latest["PS"]), 2),
        "wind_speed_mps": round(float(latest["WS10M"]), 2),
    }


def build_live_snapshot() -> dict:
    predictions = {}
    sources = set()
    for village in sorted(CLIMATOLOGY):
        try:
            observations = nasa_power_history(village)
            sources.add("NASA POWER hourly weather API")
        except Exception:
            observations = open_meteo_history(village)
            sources.add("Open-Meteo hourly weather API (fallback; derived model fields)")
        payload = PredictionRequest(
            village_id=village,
            as_of=observations[-1]["timestamp"],
            observations=observations,
        )
        prediction = create_prediction(payload)
        prediction["weather"] = weather_summary(observations)
        predictions[village.lower()] = prediction

    generated_at = datetime.now(timezone.utc)
    expires_at = generated_at + LIVE_SNAPSHOT_TTL
    return {
        "ok": True,
        "source": "; ".join(sorted(sources)),
        "predictions": predictions,
        "fetchedAt": generated_at.isoformat(),
        "snapshot_id": generated_at.strftime("%Y%m%dT%H%M%SZ"),
        "valid_until": expires_at.isoformat(),
        "disclaimer": (
            "Weather observations are from NASA POWER. This is a fixed model "
            "snapshot for the next six hours, not live river, soil, or tilt telemetry."
        ),
    }


@app.get("/v1/live-predictions")
def live_predictions():
    global _live_snapshot
    now = datetime.now(timezone.utc)
    with _live_snapshot_lock:
        if _live_snapshot and now < datetime.fromisoformat(_live_snapshot["valid_until"]):
            return _live_snapshot
        try:
            _live_snapshot = build_live_snapshot()
            return _live_snapshot
        except Exception as exc:
            raise HTTPException(status_code=503, detail="Live weather providers are unavailable") from exc
