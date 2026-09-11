# RakshaSetu — Next.js

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Architecture

```
app/
  layout.js            Root shell, loads globals.css
  page.js               "/"          Live area map (home)
  rescue/page.js         "/rescue"    Rescue team dashboard
  village/[id]/page.js   "/village/x" Why-is-this-predicted explain view
  globals.css           All styling, ported from the original prototype

components/
  Header.js             Top nav (Helplines / Rescue Dashboard / Report Crisis)
  Banner.js             Most-severe-village status strip
  MapView.js             Leaflet map (react-leaflet), dynamically imported
                          with ssr:false since Leaflet needs `window`
  ReportModal.js         Crisis report form
  HelplinesModal.js      Static helpline numbers
  DemoControls.js        Manual sensor-trigger buttons (prototype only)

lib/
  store.js               Zustand store — single source of truth for
                          villages/reports/user location, shared by every
                          page (this replaces the old single-file `state`
                          object + renderAll() pattern)
  constants.js            Seed data: villages, shelters, helplines, colors
  utils.js                Pure functions: computeState, distanceKm,
                          explanationText, nearestVillageId
```

## Why Zustand

The original prototype was one HTML file with one global `state` object.
In Next.js, `/`, `/rescue`, and `/village/[id]` are separate route
components that mount and unmount independently — they need one shared
client-side store so a report submitted on the map instantly shows up on
the rescue dashboard. Zustand keeps that without prop-drilling through
layouts.

## Why react-leaflet instead of raw Leaflet

Raw Leaflet is imperative (`marker.setIcon(...)`, manual DOM refs) and
fights React's declarative rendering model. `react-leaflet` wraps it in
components (`<Marker>`, `<Circle>`, `<Popup>`) that re-render naturally
when the Zustand store changes — no manual sync code needed.

## Notes

- Needs live internet at runtime to load OpenStreetMap tiles.
- Geolocation requires HTTPS (or localhost) to work in most browsers.
- State resets on page refresh (in-memory store, no persistence) — add
  `zustand/middleware`'s `persist` if you want it to survive reloads.
