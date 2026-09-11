'use client';

import { HELPLINES } from '@/lib/constants';

export default function HelplinesModal({ onClose }) {
  return (
    <div className="overlay">
      <div className="modal">
        <div className="modalHead">
          <h2 style={{ margin: 0, fontSize: 18 }}>Emergency Helplines</h2>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 18 }}>✕</button>
        </div>
        {HELPLINES.map((h) => (
          <div className="helplineRow" key={h.number}>
            <span>📞 {h.name}</span>
            <span className="mono">{h.number}</span>
          </div>
        ))}
        <div className="footnote">Displayed for reference only — this prototype does not place real calls.</div>
      </div>
    </div>
  );
}
