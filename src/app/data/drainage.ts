// Representative stream network for the demo catchment, hand-drawn to
// converge plausibly toward the Bhagirathi valley that these villages sit in
// (Uttarkashi district, Uttarakhand). This is NOT derived from a processed
// DEM — it's a stand-in so the map, toggle, and layering are real and working.
//
// To replace with a REAL drainage network before submission:
//   1. Download an SRTM tile covering ~30.6–30.95N, 78.35–78.75E from
//      USGS EarthExplorer (https://earthexplorer.usgs.gov) or Bhuvan
//      (https://bhuvan.nrsc.gov.in) — free, no approval needed for SRTM.
//   2. pip install pysheds
//   3. Run flow-direction -> flow-accumulation -> stream extraction
//      (pysheds docs: https://mattbartos.com/pysheds/) and export as GeoJSON.
//   4. Replace STREAMS below with your GeoJSON `features[].geometry.coordinates`
//      (swap [lng, lat] pairs into the [lat, lng] tuples react-leaflet expects).

export interface StreamSegment {
  id: string;
  points: [number, number][]; // [lat, lng]
}

export const STREAMS: StreamSegment[] = [
  {
    id: "main-stem",
    points: [
      [30.90, 78.40],
      [30.85, 78.45],
      [30.80, 78.50],
      [30.75, 78.55],
      [30.68, 78.62],
    ],
  },
  {
    id: "bhatwari-tributary",
    points: [
      [30.75, 78.62],
      [30.72, 78.60],
      [30.68, 78.70],
    ],
  },
  {
    id: "netala-feeder",
    points: [
      [30.72, 78.58],
      [30.75, 78.60],
    ],
  },
];
