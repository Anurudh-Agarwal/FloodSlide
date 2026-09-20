"""
predict_flood_risk(history_df, village) -> dict(risk, confidence_pct, ...)
history_df: hourly DataFrame (time index) with all BASE columns
            (PRECTOTCORR, RH2M, T2M, T2MDEW, T2MWET, PS, QV2M, WS10M, TS).
            Give the LAST 72 hours ending at "now".
village   : key in climatology.joblib (its local normal used for percentile features).
"""
import json, joblib
import pandas as pd
from flood_features import add_features, BASE

_model = joblib.load("flood_model.pkl")
_features = json.load(open("features.json"))
_clims = joblib.load("climatology.pkl")


def predict_flood_risk(history_df: pd.DataFrame, village: str) -> dict:
    feats = add_features(history_df, clim=_clims[village])
    prob = float(_model.predict_proba(feats[_features].iloc[[-1]])[:, 1][0])
    risk = "HIGH" if prob >= 0.6 else "MODERATE" if prob >= 0.3 else "LOW"
    return {"risk": risk, "confidence_pct": round(prob * 100, 1),
            "probability": round(prob, 4), "as_of": str(history_df.index[-1])}


if __name__ == "__main__":
    raw = pd.read_csv("flood_dataset_hourly.csv", index_col="time", parse_dates=True)
    d = raw[raw.village == "Dharali"][BASE]
    for title, t in {"Flood-like (Dharali, 5 Aug 2025 14:00)": "2025-08-05 14:00",
                     "Normal     (Dharali, 8 Aug 2025 06:00)": "2025-08-08 06:00"}.items():
        print(title, "->", predict_flood_risk(d.loc[:t].tail(72), "Dharali"))
    print("\nNOTE: both demo points are IN-SAMPLE (model trained on them) - demo only, not validation.")
