'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Banner from '@/components/Banner';
import ReportModal from '@/components/ReportModal';
import HelplinesModal from '@/components/HelplinesModal';
import DemoControls from '@/components/DemoControls';
import { useStore } from '@/lib/store';
import { FALLBACK_LOCATION } from '@/lib/constants';

// Leaflet touches `window`, so the map must never render on the server.
const MapView = dynamic(() => import('@/components/MapView'), { ssr: false });

export default function HomePage() {
  const userLocation = useStore((s) => s.userLocation);
  const setUserLocation = useStore((s) => s.setUserLocation);
  const showRiskLayer = useStore((s) => s.showRiskLayer);
  const toggleRiskLayer = useStore((s) => s.toggleRiskLayer);

  const [locText, setLocText] = useState('📍 Getting your location…');
  const [reportVillageId, setReportVillageId] = useState(undefined);
  const [showReport, setShowReport] = useState(false);
  const [showHelplines, setShowHelplines] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) {
      setUserLocation({ ...FALLBACK_LOCATION, approx: true });
      setLocText(
        `📍 ${FALLBACK_LOCATION.lat.toFixed(4)}, ${FALLBACK_LOCATION.lng.toFixed(4)} (approximate demo location — geolocation unsupported)`
      );
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude, approx: false };
        setUserLocation(loc);
        setLocText(`📍 ${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)} (your real device location)`);
      },
      () => {
        setUserLocation({ ...FALLBACK_LOCATION, approx: true });
        setLocText(
          `📍 ${FALLBACK_LOCATION.lat.toFixed(4)}, ${FALLBACK_LOCATION.lng.toFixed(4)} (approximate demo location — permission not granted)`
        );
      },
      { timeout: 6000 }
    );
  }, [setUserLocation]);

  function openReportModal(villageId) {
    setReportVillageId(villageId);
    setShowReport(true);
  }

  return (
    <>
      <Header onReport={() => openReportModal(undefined)} onHelplines={() => setShowHelplines(true)} />
      <Banner />

      <main style={{ maxWidth: 1000, margin: '0 auto', padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <h1>Live Area Map</h1>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>{locText}</div>
          </div>
          <button className="btn" onClick={toggleRiskLayer}>
            {showRiskLayer ? '🙈 Hide' : '👁️ Show'} Risk Zones
          </button>
        </div>

        {userLocation && <MapView onReportHere={openReportModal} />}

        <DemoControls />
      </main>

      {showReport && <ReportModal initialVillageId={reportVillageId} onClose={() => setShowReport(false)} />}
      {showHelplines && <HelplinesModal onClose={() => setShowHelplines(false)} />}
    </>
  );
}
