"""
Shared feature engineering (training + prediction use the SAME code).
Input : hourly DataFrame (time index) with
        PRECTOTCORR (mm/hr), RH2M (%), T2M (C), T2MDEW (C), PS (kPa), WS10M (m/s)
Output: same DataFrame + engineered features.
"""
import numpy as np
import pandas as pd
from scipy.signal import lfilter

BASE = ["PRECTOTCORR", "RH2M", "T2M", "T2MDEW", "T2MWET", "PS", "QV2M", "WS10M", "TS"]

API_K = 0.98
ID_DURATIONS = (3, 6, 12, 24)
CAINE_A, CAINE_B = 14.82, -0.39          # Caine (1980) I = 14.82 * D^-0.39

# ---- feature groups ----------------------------------------------------------
RAW_FEATURES = [
    "PRECTOTCORR", "RH2M", "T2M",
    "rain_3hr_sum", "rain_6hr_sum", "rain_12hr_sum", "rain_24hr_sum", "rain_48hr_sum",
    "rain_max_24hr", "rh_24hr_mean",
]
PHYSICS_FEATURES = (["api"] + [f"id_ratio_{d}h" for d in ID_DURATIONS]
                    + ["id_ratio_max", "sat_hours"])

# Local-normalisation: percentile of the value within THAT location's own history
PCT_SOURCES = ["PRECTOTCORR", "rain_6hr_sum", "rain_24hr_sum", "rain_48hr_sum", "api"]
PCT_FEATURES = [f"pct_{c}" for c in PCT_SOURCES]

# Atmosphere / snowmelt features
ATMOS_FEATURES = ["dew_dep", "ps_change_3h", "ps_change_6h", "ps_drop_12h",
                  "t_change_3h", "warm_hours_24h", "posdeg_hours_24h", "WS10M"]

SCALEFREE_FEATURES = PCT_FEATURES + ATMOS_FEATURES + ["rh_24hr_mean", "sat_hours", "T2M"]

MONOTONIC_UP = {
    "rain_3hr_sum", "rain_6hr_sum", "rain_12hr_sum", "rain_24hr_sum", "rain_48hr_sum",
    "rain_max_24hr", "api", "id_ratio_3h", "id_ratio_6h", "id_ratio_12h",
    "id_ratio_24h", "id_ratio_max", "sat_hours",
} | set(PCT_FEATURES)


def build_climatology(df: pd.DataFrame) -> dict:
    """Sorted reference values per PCT source, from ONE location's history (no labels used)."""
    return {c: np.sort(df[c].dropna().values) for c in PCT_SOURCES}


def add_features(df: pd.DataFrame, clim: dict | None = None) -> pd.DataFrame:
    df = df.copy()
    r = df["PRECTOTCORR"].clip(lower=0)

    for h in (3, 6, 12, 24, 48):
        df[f"rain_{h}hr_sum"] = r.rolling(h, min_periods=1).sum()
    df["rain_max_24hr"] = r.rolling(24, min_periods=1).max()
    df["rh_24hr_mean"] = df["RH2M"].rolling(24, min_periods=1).mean()

    # physics: Antecedent Precipitation Index, Intensity-Duration ratio, saturation
    df["api"] = lfilter([1.0], [1.0, -API_K], r.values)
    for d in ID_DURATIONS:
        df[f"id_ratio_{d}h"] = r.rolling(d, min_periods=1).mean() / (CAINE_A * d ** CAINE_B)
    df["id_ratio_max"] = df[[f"id_ratio_{d}h" for d in ID_DURATIONS]].max(axis=1)
    sat = (df["RH2M"] >= 99).astype(int)
    df["sat_hours"] = sat.groupby((sat == 0).cumsum()).cumsum()

    # atmosphere
    ps_hpa = df["PS"] * 10.0                       # kPa -> hPa
    df["dew_dep"] = df["T2M"] - df["T2MDEW"]
    df["ps_change_3h"] = ps_hpa.diff(3).fillna(0)
    df["ps_change_6h"] = ps_hpa.diff(6).fillna(0)
    df["ps_drop_12h"] = (ps_hpa.rolling(12, min_periods=1).max() - ps_hpa).clip(lower=0)
    df["t_change_3h"] = df["T2M"].diff(3).fillna(0)
    df["warm_hours_24h"] = (df["T2M"] > 0).astype(int).rolling(24, min_periods=1).sum()
    df["posdeg_hours_24h"] = df["T2M"].clip(lower=0).rolling(24, min_periods=1).sum()

    # local normalisation (percentile within this location's own climatology)
    ref = clim if clim is not None else build_climatology(df)
    for c in PCT_SOURCES:
        arr = ref[c]
        df[f"pct_{c}"] = np.searchsorted(arr, df[c].values, side="right") / len(arr)
    return df
