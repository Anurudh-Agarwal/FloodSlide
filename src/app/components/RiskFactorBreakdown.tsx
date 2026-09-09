"use client";

import { RiskContribution } from "../lib/risk";

const BAR_COLORS: Record<string, string> = {
  Rainfall: "var(--water)",
  "Soil moisture": "var(--terrain)",
  Slope: "var(--imminent)",
};

export default function RiskFactorBreakdown({
  breakdown,
}: {
  breakdown: RiskContribution[];
}) {
  return (
    <div className="breakdown">
      <h4>Why this risk score</h4>
      <div className="bars">
        {breakdown.map((b) => (
          <div key={b.label} className="row">
            <span className="row-label">{b.label}</span>
            <div className="track">
              <div
                className="fill"
                style={{
                  width: `${Math.round(b.share * 100)}%`,
                  background: BAR_COLORS[b.label],
                }}
              />
            </div>
            <span className="mono row-pct">{Math.round(b.share * 100)}%</span>
          </div>
        ))}
      </div>

      <style jsx>{`
        .breakdown {
          margin-top: 12px;
        }
        h4 {
          font-size: 12px;
          text-transform: none;
          color: #5a6572;
          font-weight: 600;
          margin: 0 0 8px;
        }
        .bars {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .row {
          display: grid;
          grid-template-columns: 90px 1fr 34px;
          align-items: center;
          gap: 8px;
        }
        .row-label {
          font-size: 12px;
          color: var(--ink);
        }
        .track {
          height: 8px;
          background: #ece9e3;
          border-radius: 2px;
          overflow: hidden;
        }
        .fill {
          height: 100%;
          border-radius: 2px;
          transition: width 0.5s ease;
        }
        .row-pct {
          font-size: 11px;
          color: #5a6572;
          text-align: right;
        }
      `}</style>
    </div>
  );
}
