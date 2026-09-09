"use client";

import { Village } from "../data/villages";
import { calculateRisk, riskColor, riskBreakdown } from "../lib/risk";
import RiskFactorBreakdown from "./RiskFactorBreakdown";

export default function VillageDetail({ village }: { village: Village }) {
  const { score, level } = calculateRisk(village);
  const breakdown = riskBreakdown(village);

  return (
    <div className="detail">
      <div className="detail-head">
        <h3>{village.name}</h3>
        <span className="pill" style={{ background: riskColor(level) }}>
          {level}
        </span>
      </div>
      <dl className="mono">
        <div>
          <dt>Rainfall</dt>
          <dd>{village.rainfall_mm} mm</dd>
        </div>
        <div>
          <dt>Soil moisture</dt>
          <dd>{village.soil_moisture_pct}%</dd>
        </div>
        <div>
          <dt>Slope angle</dt>
          <dd>{village.slope_angle_deg}°</dd>
        </div>
        <div>
          <dt>Risk score</dt>
          <dd>{score.toFixed(3)}</dd>
        </div>
        <div>
          <dt>Coordinates</dt>
          <dd>
            {village.lat.toFixed(2)}, {village.lng.toFixed(2)}
          </dd>
        </div>
      </dl>

      <RiskFactorBreakdown breakdown={breakdown} />

      <style jsx>{`
        .detail {
          border: 1px solid var(--hairline);
          background: var(--panel-bg);
          padding: 14px 16px;
          margin-top: 12px;
        }
        .detail-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .pill {
          color: #fff;
          font-size: 12px;
          font-weight: 600;
          padding: 3px 10px;
          border-radius: 3px;
        }
        dl {
          display: grid;
          grid-template-columns: 1fr;
          gap: 4px;
          font-size: 13px;
        }
        dl > div {
          display: flex;
          justify-content: space-between;
          border-bottom: 1px dashed var(--hairline);
          padding: 3px 0;
        }
        dt {
          color: #5a6572;
        }
        dd {
          margin: 0;
        }
      `}</style>
    </div>
  );
}
