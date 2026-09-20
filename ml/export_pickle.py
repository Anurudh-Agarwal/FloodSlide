"""Export trusted Joblib training artifacts with the conventional .pkl suffix.

Run from the repository root after retraining:
    python ml/export_pickle.py
"""

from pathlib import Path

import joblib


ML_DIR = Path(__file__).resolve().parent

for name in ("flood_model", "climatology"):
    artifact = joblib.load(ML_DIR / f"{name}.joblib")
    joblib.dump(artifact, ML_DIR / f"{name}.pkl")
    print(f"Exported {name}.pkl")
