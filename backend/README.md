# FloodSlide model API

This FastAPI service serves the production FloodSlide model from `ml/`:

- `flood_model.pkl` — trained `xgboost.XGBClassifier`
- `climatology.pkl` — location baselines required by feature engineering
- `features.json` — ordered list of the 30 features accepted by the classifier

The `.pkl` files were exported with Joblib, which uses Python's pickle format.
They must be loaded only from this trusted repository; never unpickle a model
file received from an untrusted source.

## Local run

Use Python **3.13.9** and run the following from the repository root:

```powershell
python -m pip install -r backend/requirements.txt
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

Open `http://localhost:8000/docs` for the interactive API documentation or
`http://localhost:8000/health` for a health check.

## Deploy to Render

1. Commit and push this repository (including both `.pkl` files) to GitHub.
2. In Render, select **New > Blueprint** and choose the repository. Render
   reads the root `render.yaml` and creates the API service.
3. After the deploy completes, open
   `https://YOUR-SERVICE.onrender.com/health`. A response with `"ok": true`
   confirms that the model loaded.
4. Set `FLOOD_MODEL_API_URL=https://YOUR-SERVICE.onrender.com` in the
   environment variables of the separately deployed Next.js frontend. Do not
   add a trailing slash.

The public API is then accessible from any device. Its interactive contract is
available at `https://YOUR-SERVICE.onrender.com/docs`.

The free Render plan can spin down after inactivity, so the first request may
take longer. Use a paid plan for a continuously warm API.
