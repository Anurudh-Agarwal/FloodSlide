// Representative historical event points near the demo catchment's real
// villages (Uttarkashi district). These are NOT pulled from ISRO's Landslide
// Atlas — that portal isn't reachable from this build environment.
//
// To use REAL points before submission:
//   Visit https://www.isro.gov.in/Landslide_Atlas_India.html or the NRSC
//   Bhuvan landslide layer, find events near 30.6–30.95N / 78.35–78.75E
//   (Uttarkashi district, 1998–2022 inventory), and replace the array below
//   with the real name/lat/lng/year values. Even 5–8 real points is enough
//   to make this an honest validation overlay.

export interface HistoricalEvent {
  name: string;
  lat: number;
  lng: number;
  year: number;
}

export const HISTORICAL_EVENTS: HistoricalEvent[] = [
  { name: "Slope failure near Gangnani", lat: 30.87, lng: 78.44, year: 2013 },
  { name: "Slope failure near Sunagar", lat: 30.92, lng: 78.39, year: 2021 },
  { name: "Debris flow near Dharasu", lat: 30.82, lng: 78.48, year: 2019 },
  { name: "Slope failure near Bhatwari", lat: 30.76, lng: 78.64, year: 2012 },
  { name: "Debris flow, Bhagirathi valley", lat: 30.78, lng: 78.53, year: 2013 },
  { name: "Slope failure near Netala", lat: 30.73, lng: 78.56, year: 2010 },
];
