'use client';

import { useRouter, useParams } from 'next/navigation';
import { useStore } from '@/lib/store';
import { computeState, explanationText } from '@/lib/utils';
import { STATE_STYLES } from '@/lib/constants';

export default function VillageExplainPage() {
  const router = useRouter();
  const { id } = useParams();
  const villages = useStore((s) => s.villages);
  const v = villages.find((x) => x.id === id);

  if (!v) {
    return (
      <main style={{ maxWidth: 1000, margin: '0 auto', padding: 20 }}>
        <p>Village not found.</p>
        <button className="backLink" onClick={() => router.push('/')}>← Back to map</button>
      </main>
    );
  }

  const st = computeState(v);
  const style = STATE_STYLES[st];

  return (
    <main style={{ maxWidth: 1000, margin: '0 auto', padding: 20 }}>
      <button className="backLink" onClick={() => router.push('/')}>← Back to map</button>
      <h1>Why is this predicted?</h1>
      <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16 }}>{v.name}</div>

      <div className="card" style={{ background: style.bg, border: 'none' }}>
        <div style={{ fontWeight: 700, color: style.color, marginBottom: 4 }}>Current Status: {style.label}</div>
        <div style={{ fontSize: 14 }}>{explanationText(st, v.sensorConfidence, v.reports)}</div>
      </div>

      <h2 style={{ fontSize: 14 }}>Contributing Signals</h2>
      <div className="signalRow"><span>ℹ️ Sensor Confidence</span><span className="mono">{v.sensorConfidence}%</span></div>
      <div className="signalRow"><span>ℹ️ Citizen Reports Received</span><span className="mono">{v.reports.length}</span></div>
      <div className="signalRow"><span>ℹ️ Rescue Team Confirmed</span><span className="mono">{v.rescueConfirmed ? 'Yes' : 'No'}</span></div>

      {v.reports.length > 0 && (
        <>
          <h2 style={{ fontSize: 14 }}>Citizen Report Log</h2>
          {v.reports.map((r) => (
            <div className="reportItem" key={r.id}>
              {r.photoUrl ? <img className="thumb" src={r.photoUrl} alt="" /> : <div className="thumbPlaceholder">📷</div>}
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{r.category}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{r.time}</div>
              </div>
            </div>
          ))}
        </>
      )}

      <div className="footnote">This explanation is generated directly from the structured signals above — not an independent AI judgment.</div>
    </main>
  );
}
