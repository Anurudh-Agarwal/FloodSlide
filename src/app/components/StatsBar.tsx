"use client";

import { Village } from "../data/villages";
import { calculateRisk } from "../lib/risk";

export default function StatsBar({
  villages,
  activeAlertCount,
}: {
  villages: Village[];
  activeAlertCount: number;
}) {
  const withRisk = villages.map((v) => ({ v, r: calculateRisk(v) }));
  const highest = withRisk.reduce((a, b) => (b.r.score > a.r.score ? b : a));

  return (
    <div className="stats-bar">
      <div className="stat">
        <span className="mono value">{villages.length}</span>
        <span className="label">Villages monitored</span>
      </div>
      <div className="stat">
        <span className="mono value">{highest.v.name}</span>
        <span className="label">Highest risk village</span>
      </div>
      <div className="stat">
        <span className="mono value">{activeAlertCount}</span>
        <span className="label">Active alerts</span>
      </div>

      <style jsx>{`
        .stats-bar {
          display: flex;
          gap: 32px;
          padding: 10px 24px;
          border-bottom: 1px solid var(--hairline);
          border-top: 1px solid var(--hairline);
        }
        .stat {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .value {
          font-size: 15px;
          font-weight: 500;
        }
        .label {
          font-size: 11px;
          color: #8a919b;
        }
      `}</style>
    </div>
  );
}
