"use client";

export type CascadeStage = "regional" | "catchment" | "imminent";

interface AlertPanelProps {
  activeStages: CascadeStage[];
  channelsActive: boolean[]; // [SMS, Siren, IVR]
  onSimulate: () => void;
  simulating: boolean;
}

const STAGES: { key: CascadeStage; label: string; color: string }[] = [
  { key: "regional", label: "Regional Watch", color: "var(--watch)" },
  { key: "catchment", label: "Catchment Warning", color: "var(--terrain)" },
  { key: "imminent", label: "Imminent Alert", color: "var(--imminent)" },
];

const CHANNELS = ["SMS", "Siren", "IVR"];

export default function AlertPanel({
  activeStages,
  channelsActive,
  onSimulate,
  simulating,
}: AlertPanelProps) {
  return (
    <div className="alert-panel">
      <h3>Alert Cascade</h3>
      <div className="stages">
        {STAGES.map((s) => {
          const isActive = activeStages.includes(s.key);
          return (
            <div
              key={s.key}
              className={`stage ${isActive ? "active" : ""}`}
              style={isActive ? { borderColor: s.color, background: s.color } : {}}
            >
              {s.label}
            </div>
          );
        })}
      </div>

      <div className="channels">
        {CHANNELS.map((c, i) => (
          <div key={c} className={`channel ${channelsActive[i] ? "on" : ""}`}>
            <span className="dot" />
            {c}
          </div>
        ))}
      </div>

      <button
        className="simulate-btn"
        onClick={onSimulate}
        disabled={simulating}
      >
        {simulating ? "Simulating…" : "Simulate Heavy Rainfall Event"}
      </button>

      <style jsx>{`
        .alert-panel {
          border: 1px solid var(--hairline);
          background: var(--panel-bg);
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .stages {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .stage {
          border: 1.5px solid var(--hairline);
          border-radius: 3px;
          padding: 12px 14px;
          font-weight: 600;
          font-size: 14px;
          color: #8a919b;
          background: #fff;
          transition: background 0.4s ease, color 0.4s ease,
            border-color 0.4s ease;
        }
        .stage.active {
          color: #fff;
        }
        .channels {
          display: flex;
          gap: 14px;
        }
        .channel {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #8a919b;
          transition: color 0.3s ease;
        }
        .channel .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #d8d5cd;
          transition: background 0.3s ease, box-shadow 0.3s ease;
        }
        .channel.on {
          color: var(--imminent);
        }
        .channel.on .dot {
          background: var(--imminent);
          box-shadow: 0 0 6px rgba(193, 67, 45, 0.7);
        }
        .simulate-btn {
          background: var(--water);
          color: #fff;
          border: none;
          padding: 12px 16px;
          font-weight: 600;
          font-size: 14px;
          border-radius: 3px;
        }
        .simulate-btn:disabled {
          opacity: 0.6;
          cursor: default;
        }
      `}</style>
    </div>
  );
}
