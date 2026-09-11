'use client';

import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { computeState } from '@/lib/utils';
import { STATE_STYLES, SEVERITY_RANK } from '@/lib/constants';

export default function Banner() {
  const router = useRouter();
  const villages = useStore((s) => s.villages);

  const lv = villages.map((v) => ({ ...v, _state: computeState(v) }));
  const most = lv.reduce((a, b) => (SEVERITY_RANK[b._state] > SEVERITY_RANK[a._state] ? b : a), lv[0]);
  const style = STATE_STYLES[most._state];
  const anyActive = lv.some((v) => v._state === 'SUSPECTED' || v._state === 'VERIFIED');

  return (
    <div className="banner" style={{ background: style.bg }}>
      <div>
        <span className={`dot ${most._state === 'VERIFIED' ? 'pulse' : ''}`} style={{ background: style.color }} />
        <b style={{ color: style.color }}>{style.label}</b>{' '}
        <span style={{ color: 'var(--muted)' }}>— {most.name}</span>
      </div>
      {anyActive ? (
        <button
          className="btn"
          style={{ border: 'none', background: 'none', padding: 0 }}
          onClick={() => router.push(`/village/${most.id}`)}
        >
          Why is this predicted? ›
        </button>
      ) : (
        <span />
      )}
    </div>
  );
}
