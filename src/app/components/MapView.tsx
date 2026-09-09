"use client";

import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Tooltip,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Village } from "../data/villages";
import { calculateRisk, riskColor } from "../lib/risk";
import { STREAMS } from "../data/drainage";
import { HISTORICAL_EVENTS } from "../data/historicalEvents";

interface MapViewProps {
  villages: Village[];
  selected: string | null;
  onSelect: (name: string) => void;
  pulsing: string[];
  showDrainage: boolean;
  showHistorical: boolean;
}

export default function MapView({
  villages,
  selected,
  onSelect,
  pulsing,
  showDrainage,
  showHistorical,
}: MapViewProps) {
  const center: [number, number] = [30.8, 78.55];

  return (
    <div className="map-shell">
      <MapContainer
        center={center}
        zoom={10}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {showDrainage &&
          STREAMS.map((s) => (
            <Polyline
              key={s.id}
              positions={s.points}
              pathOptions={{
                color: "var(--water)",
                weight: 3,
                opacity: 0.55,
              }}
            />
          ))}

        {showHistorical &&
          HISTORICAL_EVENTS.map((e) => (
            <CircleMarker
              key={e.name}
              center={[e.lat, e.lng]}
              radius={5}
              pathOptions={{
                color: "#6b6f76",
                fillColor: "#9a9ea5",
                fillOpacity: 0.9,
                weight: 1,
                dashArray: "2,2",
              }}
            >
              <Tooltip direction="top" offset={[0, -6]} opacity={1}>
                {e.name} ({e.year})
              </Tooltip>
            </CircleMarker>
          ))}

        {villages.map((v) => {
          const { level } = calculateRisk(v);
          const isPulsing = pulsing.includes(v.name);
          const isSelected = selected === v.name;
          return (
            <CircleMarker
              key={v.name}
              center={[v.lat, v.lng]}
              radius={isSelected ? 16 : 12}
              pathOptions={{
                color: riskColor(level),
                fillColor: riskColor(level),
                fillOpacity: 0.75,
                weight: isSelected ? 3 : 1.5,
              }}
              className={isPulsing ? "risk-pulse" : undefined}
              eventHandlers={{
                click: () => onSelect(v.name),
              }}
            >
              <Tooltip direction="top" offset={[0, -8]} opacity={1}>
                {v.name} — {level}
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>

      <style jsx global>{`
        .map-shell {
          height: 100%;
          width: 100%;
          border: 1px solid var(--hairline);
        }
        .risk-pulse {
          animation: riskPulse 1.5s ease-out;
        }
        @keyframes riskPulse {
          0% {
            filter: drop-shadow(0 0 0 rgba(193, 67, 45, 0.6));
          }
          50% {
            filter: drop-shadow(0 0 14px rgba(193, 67, 45, 0.55));
          }
          100% {
            filter: drop-shadow(0 0 0 rgba(193, 67, 45, 0));
          }
        }
      `}</style>
    </div>
  );
}
