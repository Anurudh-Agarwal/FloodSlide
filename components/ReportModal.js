'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { CATEGORIES } from '@/lib/constants';
import { nearestVillageId } from '@/lib/utils';

export default function ReportModal({ initialVillageId, onClose }) {
  const villages = useStore((s) => s.villages);
  const userLocation = useStore((s) => s.userLocation);
  const addReport = useStore((s) => s.addReport);

  const [villageId, setVillageId] = useState(initialVillageId || nearestVillageId(villages, userLocation));
  const [category, setCategory] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoName, setPhotoName] = useState('');

  function handlePhotoChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPhotoUrl(url);
    setPhotoName(file.name);
  }

  function submitReport() {
    if (!category) return;
    addReport(villageId, {
      id: Date.now(),
      category,
      photoUrl,
      photoName,
      time: new Date().toLocaleTimeString(),
    });
    onClose();
  }

  return (
    <div className="overlay">
      <div className="modal">
        <div className="modalHead">
          <h2 style={{ margin: 0, fontSize: 18 }}>Report a Crisis</h2>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 18 }}>✕</button>
        </div>

        <label style={{ fontSize: 12, color: 'var(--muted)' }}>Village / Area</label>
        <select value={villageId} onChange={(e) => setVillageId(e.target.value)}>
          {villages.map((v) => (
            <option key={v.id} value={v.id}>{v.name}</option>
          ))}
        </select>

        <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>
          Select the type of emergency you're witnessing
        </div>
        <div className="catGrid">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              className={`catBtn${category === c ? ' active' : ''}`}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>

        <label className={`photoLabel${photoUrl ? ' active' : ''}`}>
          📷 <span>{photoUrl ? 'Photo attached' : 'Attach photo (optional)'}</span>
          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
        </label>

        {photoUrl && (
          <div className="previewRow">
            <img src={photoUrl} alt="" />
            <span>{photoName}</span>
          </div>
        )}

        <button
          className="fullBtn primary"
          style={{ background: 'var(--imminent)', color: '#fff' }}
          onClick={submitReport}
          disabled={!category}
        >
          Submit Report
        </button>
      </div>
    </div>
  );
}
