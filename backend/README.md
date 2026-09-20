# FloodSlide model service

This FastAPI service loads the existing artifacts in `../ml/`; it does not
retrain or copy the model's feature engineering.

From the repository root:

```powershell
python -m pip install -r backend/requirements.txt
python -m uvicorn backend.main:app --reload --port 8000
```

The service is then available at `http://127.0.0.1:8000`, with a health check
at `/health` and interactive API documentation at `/docs`.
