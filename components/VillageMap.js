"use client";

import { useMemo, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMap } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import "leaflet/dist/leaflet.css";
import { RISK_META } from "@/data/mockData";
import { INDIA_GEOJSON, WORLD_MASK_GEOJSON } from "@/data/indiaGeoJSON";
import { useStore } from "@/store/useStore";

function MapViewHandler({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && zoom) {
      map.flyTo(center, zoom, { duration: 1.2 });
    }
  }, [center, zoom, map]);
  return null;
}

function iconFor(level, pulse) {
  const color = RISK_META[level]?.color || RISK_META.normal.color;
  return L.divIcon({
    className: "",
    html: `<div style="
      width:18px;height:18px;border-radius:50%;
      background:${color};
      border:2.5px solid rgba(255,255,255,0.95);
      box-shadow: 0 2px 10px rgba(0,0,0,0.5), 0 0 0 3px ${color}33;
      cursor: pointer;
      ${pulse ? `animation: risk-pulse 1.8s ease-in-out infinite;` : ""}
    "></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

export default function VillageMap({
  villages = [],
  center,
  zoom = 12,
  height = "100%",
  showControls = true,
  onFocusChange,
}) {
  const t = useStore((s) => s.t);
  const language = useStore((s) => s.language);

  const defaultCenter = useMemo(() => center || [30.365, 78.91], [center]);

  const indiaStyle = {
    color: "var(--accent)",
    weight: 2.2,
    opacity: 0.9,
    fillColor: "transparent",
    fillOpacity: 0,
    dashArray: "4, 2",
  };

  const maskStyle = {
    color: "none",
    fillColor: "#050b0c",
    fillOpacity: 0.65,
    stroke: false,
  };

  return (
    <div style={{ position: "relative", width: "100%", height, minHeight: 380, borderRadius: "inherit", overflow: "hidden" }}>
      <MapContainer
        center={defaultCenter}
        zoom={zoom}
        style={{ height: "100%", width: "100%", background: "#0a1315" }}
        scrollWheelZoom
      >
        <MapViewHandler center={center} zoom={zoom} />
        
        {/* Base Map Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Outer Mask to subdue surrounding non-India regions when zoomed out */}
        <GeoJSON data={WORLD_MASK_GEOJSON} style={maskStyle} />

        {/* Official High-Resolution India GeoJSON Boundary */}
        <GeoJSON data={INDIA_GEOJSON} style={indiaStyle} />

        {/* Monitored Settlement Markers */}
        {villages.map((v) => (
          <Marker
            key={v.id}
            position={[v.lat, v.lng]}
            icon={iconFor(v.riskLevel, v.riskLevel === "critical")}
          >
            <Popup>
              <div style={{ minWidth: 170, padding: 2 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <strong style={{ fontSize: 14, color: "var(--text-primary)" }}>{v.name}</strong>
                  <span
                    className="mono"
                    style={{
                      fontSize: 10,
                      padding: "2px 6px",
                      borderRadius: 4,
                      background: `${RISK_META[v.riskLevel].color}22`,
                      color: RISK_META[v.riskLevel].color,
                      fontWeight: 600,
                    }}
                  >
                    {v.riskScore} PTS
                  </span>
                </div>
                <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginBottom: 8 }}>
                  {v.ward} · {t("population")} {v.population.toLocaleString()}
                </div>
                <div style={{ fontSize: 12, fontWeight: 500, color: RISK_META[v.riskLevel].color, marginBottom: 10 }}>
                  {language === "hi"
                    ? (v.riskLevel === "critical" ? "अति-गंभीर अलर्ट" : v.riskLevel === "warning" ? "कैचमेंट चेतावनी" : v.riskLevel === "watch" ? "क्षेत्रीय निगरानी" : "सामान्य")
                    : RISK_META[v.riskLevel].label}
                </div>
                <Link
                  href={`/village/${v.id}`}
                  style={{
                    display: "inline-block",
                    width: "100%",
                    textAlign: "center",
                    padding: "6px 0",
                    borderRadius: 6,
                    background: "var(--accent)",
                    color: "#0f1a1c",
                    fontSize: 11.5,
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  {t("btnViewDetails")} →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Map Control Bar & Legend Overlay */}
      {showControls && (
        <div
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            zIndex: 400,
            display: "flex",
            flexDirection: "column",
            gap: 8,
            alignItems: "flex-end",
          }}
        >
          {onFocusChange && (
            <div
              style={{
                display: "flex",
                gap: 6,
                background: "rgba(15, 26, 28, 0.88)",
                backdropFilter: "blur(8px)",
                padding: 4,
                borderRadius: 8,
                border: "1px solid var(--line)",
              }}
            >
              <button
                onClick={() => onFocusChange("india")}
                style={{
                  padding: "5px 10px",
                  borderRadius: 6,
                  border: "none",
                  background: "var(--bg-panel-raised)",
                  color: "var(--text-primary)",
                  fontSize: 11.5,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                🇮🇳 {t("btnFocusIndia")}
              </button>
              <button
                onClick={() => onFocusChange("hotspot")}
                style={{
                  padding: "5px 10px",
                  borderRadius: 6,
                  border: "none",
                  background: "var(--accent)",
                  color: "#0f1a1c",
                  fontSize: 11.5,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                ⛰️ {t("btnFocusHotspot")}
              </button>
            </div>
          )}

          {/* Compact Risk Legend */}
          <div
            style={{
              background: "rgba(15, 26, 28, 0.9)",
              backdropFilter: "blur(8px)",
              border: "1px solid var(--line)",
              borderRadius: 8,
              padding: "10px 12px",
              fontSize: 11,
              boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
              maxWidth: 220,
            }}
          >
            <div style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: 6 }}>
              {t("mapLegendTitle")}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 8px" }}>
              {Object.entries(RISK_META).map(([key, meta]) => (
                <div key={key} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: meta.color, flexShrink: 0 }} />
                  <span style={{ color: "var(--text-muted)", fontSize: 10.5 }}>
                    {language === "hi"
                      ? (key === "critical" ? "अति-गंभीर" : key === "warning" ? "चेतावनी" : key === "watch" ? "निगरानी" : "सामान्य")
                      : meta.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
