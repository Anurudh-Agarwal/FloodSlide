'use client';

import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { computeState } from '@/lib/utils';
import { STATE_STYLES } from '@/lib/constants';

export default function RescueDashboardPage() {
  const router = useRouter();
  const villages = useStore((s) => s.villages);
  const updateVillage = useStore((s) => s.updateVillage);

  function confirmVerified(id) {
    updateVillage(id, { resolved: false, rescueConfirmed: true });
  }
  function markResolved(id) {
    updateVillage(id, { resolved: true, rescueConfirmed: false, reports: [], sensorConfidence: 8 });
  }

  return (
    <main style={{ maxWidth: 1000, margin: '0 auto', padding: 20 }}>
      <button className="backLink" onClick={() => router.push('/')}>← Back to map</button>
      <h1 style={{ marginBottom: 14 }}>Rescue Team Dashboard</h1>

      {villages.map((v) => {
        const st = computeState(v);
        const style = STATE_STYLES[st];
        return (
          <div className="card" style={{ background: style.bg }} key={v.id}>
            <div className="rowBetween" style={{ marginBottom: 8 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{v.name}</div>
                <div style={{ fontSize: 12, color: style.color, fontWeight: 600 }}>
                  {style.label} · {v.reports.length} report(s) · Sensor {v.sensorConfidence}%
                </div>
              </div>
              <button
                style={{ border: 'none', background: 'none', fontSize: 12, color: 'var(--muted)', cursor: 'pointer' }}
                onClick={() => router.push(`/village/${v.id}`)}
              >
                Details ›
              </button>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn dark"
                style={{ flex: 1, justifyContent: 'center' }}
                disabled={st === 'VERIFIED' || st === 'RESOLVED'}
                onClick={() => confirmVerified(v.id)}
              >
                ✔ Confirm Verified
              </button>
              <button
                className="btn"
                style={{ flex: 1, justifyContent: 'center' }}
                disabled={st !== 'VERIFIED'}
                onClick={() => markResolved(v.id)}
              >
                Mark Resolved
              </button>
            </div>
          </div>
        );
      })}

      <div className="footnote">
        "Confirm Verified" is a human override per village — it moves that village straight to Verified regardless of its sensor/report count.
      </div>
    </main>
  );
}
