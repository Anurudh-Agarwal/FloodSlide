"""FastAPI serving layer for the existing FloodSlide Python model.

The feature engineering and artifacts remain owned by ``ml/``. This service
only validates a canonical hourly-history request and invokes that code.
"""

from __future__ import annotations

import hashlib
import json
import sys
from datetime import datetime, timedelta
from pathlib import Path
from typing import Annotated

import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

ROOT_DIR = Path(__file__).resolve().parents[1]
ML_DIR = ROOT_DIR / "ml"
sys.path.insert(0, str(ML_DIR))

from flood_features import BASE, add_features  # noqa: E402

MODEL_PATH = ML_DIR / "flood_model.joblib"
CLIMATOLOGY_PATH = ML_DIR / "climatology.joblib"
FEATURES_PATH = ML_DIR / "features.json"

MODEL = joblib.load(MODEL_PATH)
CLIMATOLOGY = joblib.load(CLIMATOLOGY_PATH)
FEATURES = json.loads(FEATURES_PATH.read_text(encoding="utf-8"))
MODEL_VERSION = hashlib.sha256(MODEL_PATH.read_bytes()).hexdigest()[:12]
SUPPORTED_VILLAGES = {name.lower(): name for name in CLIMATOLOGY}


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
