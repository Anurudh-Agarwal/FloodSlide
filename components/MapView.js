'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { computeState } from '@/lib/utils';
import { SHELTER_SEED, STATE_STYLES } from '@/lib/constants';

function pinIcon(color, pulse) {
  return L.divIcon({
    html: `<div style="width:30px;height:30px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:bold;font-size:14px;${pulse ? 'animation:pulse 1.3s infinite;' : ''}">⚠</div>`,
    className: '',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}

function shelterIcon() {
  return L.divIcon({
    html: '<div style="width:26px;height:26px;border-radius:50%;background:#14506b;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;color:#fff;font-size:13px;">🏠</div>',
    className: '',
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
}

function userIcon() {
  return L.divIcon({
    html: '<div style="width:16px;height:16px;border-radius:50%;background:#2563eb;border:2px solid #fff;box-shadow:0 0 0 6px rgba(37,99,235,0.25);"></div>',
    className: '',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

function clearLeafletContainer(container) {
  if (container?._leaflet_id) {
    delete container._leaflet_id;
  }
}

export default function MapView({ onReportHere }) {
  const router = useRouter();
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const userLocation = useStore((s) => s.userLocation);
  const villages = useStore((s) => s.villages);
  const showRiskLayer = useStore((s) => s.showRiskLayer);

  useEffect(() => {
    if (!userLocation || !containerRef.current) return undefined;

    const container = containerRef.current;
    clearLeafletContainer(container);
    const { lat, lng } = userLocation;
    const map = L.map(container).setView([lat, lng], 13);
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    L.marker([lat, lng], { icon: userIcon() }).addTo(map).bindPopup('You are here');

    SHELTER_SEED.forEach((shelter) => {
      L.marker([lat + shelter.latOffset, lng + shelter.lngOffset], { icon: shelterIcon() })
        .addTo(map)
        .bindPopup(`<b>${shelter.name}</b><br />Capacity: ${shelter.capacity}`);
    });

    villages.forEach((village) => {
      const state = computeState(village);
      const style = STATE_STYLES[state];
      const visible = state === 'SUSPECTED' || state === 'VERIFIED';
      const position = [lat + village.latOffset, lng + village.lngOffset];
      const marker = L.marker(position, {
        icon: visible
          ? pinIcon(state === 'VERIFIED' ? '#c1432d' : '#d9a441', state === 'VERIFIED')
          : pinIcon('#94a3b8', false),
      }).addTo(map);

      marker.bindPopup(`
        <b>${village.name}</b><br />
        <span style="color:${style.color};font-weight:600">${style.label}</span>
        <div class="popupBtnRow">
          <button data-action="explain" data-village="${village.id}">Why is this predicted?</button>
          <button data-action="report" data-village="${village.id}">Report here</button>
        </div>
      `);

      marker.on('popupopen', (event) => {
        const popup = event.popup.getElement();
        popup?.querySelector('[data-action="explain"]')?.addEventListener('click', () => router.push(`/village/${village.id}`));
        popup?.querySelector('[data-action="report"]')?.addEventListener('click', () => onReportHere(village.id));
      });

      L.circle(position, {
        radius: 1200,
        color: '#d9a441',
        dashArray: '6,6',
        fill: false,
        opacity: showRiskLayer && (state === 'NORMAL' || state === 'WATCH') ? 0.9 : 0,
      }).addTo(map);
    });

    return () => {
      map.remove();
      mapRef.current = null;
      clearLeafletContainer(container);
    };
  }, [userLocation, villages, showRiskLayer, onReportHere, router]);

  return <div ref={containerRef} style={{ width: '100%', height: 440, borderRadius: 16, border: '2px solid #cbd5e1' }} />;
}
