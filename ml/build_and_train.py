"""
Multi-year pipeline. Put files in ml/raw/ named <village>_<year>.json, e.g. dharali_2023.json.
Run from inside ml/:  python build_and_train.py
"""
import glob, json
import numpy as np
import pandas as pd
import joblib
from sklearn.metrics import roc_auc_score, average_precision_score, roc_curve
from xgboost import XGBClassifier
 
from flood_features import (BASE, RAW_FEATURES, PHYSICS_FEATURES, PCT_FEATURES,
                            ATMOS_FEATURES, SCALEFREE_FEATURES, MONOTONIC_UP,
                            add_features, build_climatology)
 
# ---- CONFIG -----------------------------------------------------------------
RAW_DIR = "raw"
VILLAGES = ["Dharali", "Chositi", "Malana"]
# Verified events only (news/IMD-confirmed, same district as the village).
EVENTS = {
    "Dharali": ["2025-08-05"],                                   # Uttarkashi flash flood (NB: cause debated, see note)
    "Chositi": ["2025-08-14"],                                   # Kishtwar cloudburst, 68 deaths
    "Malana":  ["2025-08-03",                                    # NOTE: date still UNVERIFIED - please confirm
                "2023-07-09",                                    # Kullu/Manali floods, 8-11 Jul 2023 (IMD/MAUSAM study)
                "2024-08-01",                                    # Kullu cloudburst; Malana power-project dam damaged
                "2025-06-25"],                                   # Manikaran-valley cloudbursts, Kullu
}
# Heavy-rain days we could NOT confirm as a local flood -> removed from training/testing
# (labeling them 0 would teach "heavy rain = safe"; labeling them 1 would be unverified).
EXCLUDE = {
    "Dharali": [("2023-08-13 12:00", "2023-08-15 12:00"),      # Uttarakhand red alert 14 Aug 2023, Uttarkashi impact unverified
                ("2024-07-31 12:00", "2024-08-02 12:00"),
                ("2023-07-08 12:00", "2023-07-10 12:00")],
    "Chositi": [("2025-08-25 12:00", "2025-08-27 12:00"),      # J&K floods 26 Aug 2025
                ("2023-07-07 12:00", "2023-07-09 12:00")],
    "Malana":  [("2023-08-13 12:00", "2023-08-15 12:00"),      # Himachal extreme spell 14-15 Aug 2023, Kullu-specific impact unverified
                ("2025-08-25 12:00", "2025-08-27 12:00")],
}
MONSOON_ONLY = True          # train/test only on Jun-Sep (removes the "it's summer" shortcut)
MONSOON_MONTHS = (6, 7, 8, 9)
PRE_H, POST_H = 12, 36
ALERT_THRESHOLD = 0.5
FINAL_CONFIG = "auto"        # "auto" = config with best mean AUC, or set a name below
# -----------------------------------------------------------------------------
 
 
def load_village(v):
    files = sorted(glob.glob(f"{RAW_DIR}/{v.lower()}_*.json"))
    if not files:
        raise FileNotFoundError(f"no files like {RAW_DIR}/{v.lower()}_*.json")
    parts = []
    for f in files:
        p = json.load(open(f))["properties"]["parameter"]
        parts.append(pd.DataFrame({k: pd.Series(p[k]) for k in BASE if k in p}))
    df = pd.concat(parts)
    df.index = pd.to_datetime(df.index, format="%Y%m%d%H")
    df = df[~df.index.duplicated()].sort_index()
    df = df.replace(-999, np.nan)
    missing = [c for c in BASE if c not in df.columns]
    if missing:
        raise ValueError(f"{v}: missing parameters {missing}")
    df = df.asfreq("h").interpolate(limit=3)
    print(f"  {v}: {len(files)} files, {len(df)} hours, {df.index[0].date()} -> {df.index[-1].date()}, "
          f"NaN left: {int(df[BASE].isna().sum().sum())}")
    return df
 
 
def label(df, v):
    df["flood_occurred"] = 0
    for e in EVENTS[v]:
        ev = pd.Timestamp(e)
        lo, hi = ev - pd.Timedelta(hours=PRE_H), ev + pd.Timedelta(hours=POST_H)
        df.loc[(df.index >= lo) & (df.index <= hi), "flood_occurred"] = 1
    return df
 
 
print("Loading:")
frames, clims, heavy = [], {}, []
for v in VILLAGES:
    raw = load_village(v)
    tmp = add_features(raw)
    ref = tmp[tmp.index.month.isin(MONSOON_MONTHS)] if MONSOON_ONLY else tmp
    clims[v] = build_climatology(ref)          # local normal (monsoon-only if MONSOON_ONLY)
    d = add_features(raw, clim=clims[v])
    d = label(d, v)
    if MONSOON_ONLY:
        d = d[d.index.month.isin(MONSOON_MONTHS)]
    d["village"] = v
    # list heaviest UNLABELED rain days so you can check for real events labeled 0 by mistake
    neg = d[d.flood_occurred == 0]
    daily = neg["rain_24hr_sum"].resample("D").max().dropna().sort_values(ascending=False)
    picked = []
    for day, val in daily.items():
        if all(abs((day - p).days) > 2 for p, _ in picked):
            picked.append((day, val))
        if len(picked) == 8:
            break
    heavy += [dict(village=v, date=str(p.date()), rain_24hr_mm=round(x, 1)) for p, x in picked]
    for a, b in EXCLUDE.get(v, []):
        d = d[~((d.index >= a) & (d.index <= b))]
    frames.append(d)
 
data = pd.concat(frames).dropna(subset=BASE + ["flood_occurred"])
data.index.name = "time"
data.to_csv("flood_dataset_hourly.csv")
pd.DataFrame(heavy).to_csv("unlabeled_heavy_rain.csv", index=False)
print(f"\nrows={len(data)}  positives={data.flood_occurred.sum()} ({data.flood_occurred.mean():.2%})")
print("\nHeaviest UNLABELED rain days (check: were any of these real floods/landslides?):")
print(pd.DataFrame(heavy).to_string(index=False))
 
CONFIGS = {
    "A_baseline":           dict(features=RAW_FEATURES, mono=False),
    "B_physics":            dict(features=RAW_FEATURES + PHYSICS_FEATURES, mono=False),
    "C_phys+localnorm":     dict(features=RAW_FEATURES + PHYSICS_FEATURES + PCT_FEATURES, mono=False),
    "D_all_features":       dict(features=RAW_FEATURES + PHYSICS_FEATURES + PCT_FEATURES + ATMOS_FEATURES, mono=False),
    "E_all+monotonic":      dict(features=RAW_FEATURES + PHYSICS_FEATURES + PCT_FEATURES + ATMOS_FEATURES, mono=True),
    "F_scale_free":         dict(features=SCALEFREE_FEATURES, mono=False),
}
 
 
def make_model(y, features, mono):
    kw = {}
    if mono:
        kw["monotone_constraints"] = tuple(1 if f in MONOTONIC_UP else 0 for f in features)
    spw = np.sqrt((y == 0).sum() / max((y == 1).sum(), 1))
    return XGBClassifier(n_estimators=250, max_depth=3, learning_rate=0.05, subsample=0.8,
                         colsample_bytree=0.8, min_child_weight=5, eval_metric="logloss",
                         random_state=42, scale_pos_weight=spw, **kw)
 
 
rows, roc_store = [], {}
for name, cfg in CONFIGS.items():
    F = cfg["features"]
    for v in VILLAGES:
        tr, te = data[data.village != v], data[data.village == v]
        m = make_model(tr.flood_occurred, F, cfg["mono"]).fit(tr[F], tr.flood_occurred)
        prob = m.predict_proba(te[F])[:, 1]
        y = te.flood_occurred.values
        alert = prob >= ALERT_THRESHOLD
        gid = np.cumsum(np.diff(y, prepend=0) == 1) * (y == 1)      # one id per event window
        ids = [i for i in np.unique(gid) if i > 0]
        detected = float(np.mean([alert[gid == i].any() for i in ids])) if ids else np.nan
        fa_days = pd.Series(te.index[(alert) & (y == 0)]).dt.date.nunique()
        years = max(te.index.year.nunique(), 1)          # seasons in test data
        rows.append(dict(config=name, test_village=v,
                         auc=roc_auc_score(y, prob), pr_auc=average_precision_score(y, prob),
                         event_detected=detected, false_alarm_days_per_season=fa_days / years))
        roc_store[(name, v)] = roc_curve(y, prob)
 
res = pd.DataFrame(rows)
res.round(3).to_csv("ablation_results.csv", index=False)
summary = res.groupby("config")[["auc", "pr_auc", "event_detected", "false_alarm_days_per_season"]].mean().round(3)
print("\nPer-village (leave-one-village-out):")
print(res.round(3).to_string(index=False))
print("\nMEAN across held-out villages  <- PPT table:")
print(summary.to_string())
print("\n(random guess AUC = 0.5; PR-AUC baseline = positive rate "
      f"{data.flood_occurred.mean():.3f})")
 
try:
    import matplotlib; matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    fig, axes = plt.subplots(1, 3, figsize=(16, 4.8), sharey=True)
    for ax, v in zip(axes, VILLAGES):
        for name in CONFIGS:
            fpr, tpr, _ = roc_store[(name, v)]
            a = res[(res.config == name) & (res.test_village == v)].auc.iloc[0]
            ax.plot(fpr, tpr, label=f"{name} ({a:.2f})")
        ax.plot([0, 1], [0, 1], "k--", lw=.8); ax.set_title(f"Held-out: {v}")
        ax.set_xlabel("FPR"); ax.legend(fontsize=6)
    axes[0].set_ylabel("TPR"); plt.tight_layout(); plt.savefig("roc_ablation.png", dpi=150)
except Exception as e:
    print("ROC plot skipped:", e)
 
best = summary.auc.idxmax() if FINAL_CONFIG == "auto" else FINAL_CONFIG
cfg = CONFIGS[best]; F = cfg["features"]
model = make_model(data.flood_occurred, F, cfg["mono"]).fit(data[F], data.flood_occurred)
joblib.dump(model, "flood_model.joblib")
joblib.dump(clims, "climatology.joblib")
json.dump(F, open("features.json", "w"))
imp = pd.Series(model.feature_importances_, index=F).sort_values(ascending=False)
print(f"\nSaved final model = {best}. Top features:")
print(imp.head(8).round(3).to_string())
 
