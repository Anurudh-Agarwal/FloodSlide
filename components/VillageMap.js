"use client";

import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import "leaflet/dist/leaflet.css";
import { RISK_META } from "@/data/mockData";

function iconFor(level, pulse) {
  const color = RISK_META[level]?.color || RISK_META.normal.color;
  return L.divIcon({
    className: "",
    html: `<div style="
      width:16px;height:16px;border-radius:50%;
      background:${color};
      border:2px solid rgba(255,255,255,0.85);
      box-shadow:0 0 0 3px ${color}33;
      ${pulse ? `animation: risk-pulse 1.8s ease-in-out infinite;` : ""}
    "></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

export default function VillageMap({ villages, center, height = "100%" }) {
  const mapCenter = useMemo(
    () => center || [30.365, 78.91],
    [center]
  );

  return (
    <MapContainer
      center={mapCenter}
      zoom={12}
      style={{ height, width: "100%", background: "#0c1517" }}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {villages.map((v) => (
        <Marker
          key={v.id}
          position={[v.lat, v.lng]}
          icon={iconFor(v.riskLevel, v.riskLevel === "critical")}
        >
          <Popup>
            <div style={{ minWidth: 160 }}>
              <strong>{v.name}</strong>
              <div style={{ fontSize: 12, color: "#5b7376", margin: "2px 0 8px" }}>
                {v.ward} · pop. {v.population.toLocaleString()}
              </div>
              <div style={{ fontSize: 12, marginBottom: 8 }}>
                {RISK_META[v.riskLevel].label} — score {v.riskScore}
              </div>
              <Link
                href={`/village/${v.id}`}
                style={{ fontSize: 12, fontWeight: 600, color: "#0f6c62" }}
              >
                View risk breakdown →
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
