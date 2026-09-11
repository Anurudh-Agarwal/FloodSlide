'use client';

import { useRouter } from 'next/navigation';

export default function Header({ onReport, onHelplines }) {
  const router = useRouter();

  return (
    <header>
      <div className="headerRow">
        <div className="brand">
          <span className="brandIcon">🚨</span> RakshaSetu
        </div>
        <div className="navBtns">
          <button className="btn" onClick={onHelplines}>📞 Helplines</button>
          <button className="btn" onClick={() => router.push('/rescue')}>🛡️ Rescue Dashboard</button>
          <button className="btn primary" onClick={onReport}>⚠️ Report Crisis</button>
        </div>
      </div>
    </header>
  );
}
