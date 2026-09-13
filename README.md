# FloodSlide — prototype front end

A frontend-only prototype for the SIH26192 problem statement ("Flash Flood
Prediction system for Hilly Regions using Multi-Source Data"). This build
focuses on the emergency-response UI: a live risk map, a rescue dashboard,
and per-village risk explanations — all running on seeded mock data so the
design and interaction model can be reviewed before any real backend, ML
model, or sensor network exists.

## Run it

```bash
npm install
npm run dev
```

Then open http://localhost:3000. First run needs internet access once to
fetch the Google Fonts used (Space Grotesk / IBM Plex) and to load
OpenStreetMap tiles for the map.

## Routes

- `/` — live map. Severity banner for the most at-risk active village,
  Leaflet map with all villages color-coded by risk, a sortable village list,
  a "Report incident" button, and a collapsible **Demo Controls** panel that
  simulates a sensor pushing a new risk level (there are no real sensors
  wired up).
- `/rescue` — rescue dashboard. Table of every village with its risk level,
  score, and last-update time, with buttons to mark a village **Verified**
  or **Resolved**. A side feed shows community-submitted reports.
- `/village/[id]` — explains the signals behind one village's risk score
  (rainfall, soil moisture, river level vs. danger mark, slope-stability
  index, tilt sensor), a short history of level changes this session, and
  the same verify/resolve controls.

## State model

Everything lives in a single Zustand store (`store/useStore.js`), seeded
from `data/mockData.js`:

- `villages` — id, location, population, risk level/score, signal readings,
  key factors, history, and a rescue `status` (`unverified` / `verified` /
  `resolved`).
- `reports` — community-submitted incident reports (type, description,
  optional photo, target village).

## Known limitations (by design, for this stage)

- **Frontend only.** No backend, database, auth, or API.
- **Mock data.** Villages, signal readings, and reports are seeded fixtures,
  not live sensor or forecast output. Nothing here should be read as a real
  flood/landslide risk assessment.
- **In-memory state.** The Zustand store resets on page refresh — there is
  no persistence layer yet.
- **No real alerting.** The helpline modal displays numbers for reference
  only; it does not place calls, send SMS, or notify anyone.
- **No real sensors.** The "Demo Controls" panel exists specifically to
  simulate a sensor/IoT trigger changing a village's risk level, since no
  physical sensor mesh is connected.
- **Map tiles need internet.** The Leaflet map pulls OpenStreetMap tiles at
  runtime.

## Next steps (not yet built)

- Replace `data/mockData.js` with a real API layer (own backend, or directly
  the physics-informed risk engine described in the problem statement).
- Add persistence (e.g. Supabase/Postgres, as sketched in the technical
  approach) so village status and reports survive a refresh and are shared
  across rescue operators in real time.
- Wire the "Demo Controls" simulated triggers to real IoT/MQTT ingestion.
- Replace the display-only helpline modal with real click-to-call / SMS
  integration (e.g. via SACHET, FCM/SMS APIs).
