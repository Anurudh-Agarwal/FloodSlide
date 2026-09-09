"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import {
  initialVillages,
  SIMULATION_TARGETS,
  SIMULATION_RAINFALL_BUMP,
  Village,
} from "../data/villages";
import { calculateRisk } from "../lib/risk";
import AlertPanel, { CascadeStage } from "./AlertPanel";
import StatsBar from "./StatsBar";
import VillageDetail from "./VillageDetail";
import ArchitectureStrip from "./ArchitectureStrip";

// Leaflet touches window at import time, so the map must be client-only.
const MapView = dynamic(() => import("./MapView"), { ssr: false });

export default function Dashboard() {
  const [villages, setVillages] = useState<Village[]>(initialVillages);
  const [selected, setSelected] = useState<string | null>(null);
  const [activeStages, setActiveStages] = useState<CascadeStage[]>([]);
  const [channelsActive, setChannelsActive] = useState<boolean[]>([
    false,
    false,
    false,
  ]);
  const [pulsing, setPulsing] = useState<string[]>([]);
  const [simulating, setSimulating] = useState(false);
  const [showDrainage, setShowDrainage] = useState(false);
  const [showHistorical, setShowHistorical] = useState(false);

  const selectedVillage = useMemo(
    () => villages.find((v) => v.name === selected) || null,
    [villages, selected]
  );

  const activeAlertCount = useMemo(
    () => villages.filter((v) => calculateRisk(v).level !== "Safe").length,
    [villages]
  );

  function runSimulation() {
    if (simulating) return;
    setSimulating(true);
    setActiveStages([]);
    setChannelsActive([false, false, false]);

    // 1. Bump rainfall for target villages and pulse their markers
    setVillages((prev) =>
      prev.map((v) =>
        SIMULATION_TARGETS.includes(v.name)
          ? { ...v, rainfall_mm: v.rainfall_mm + SIMULATION_RAINFALL_BUMP }
          : v
      )
    );
    setPulsing(SIMULATION_TARGETS);

    // 2. Stagger the alert cascade stages, ~0.5s apart
    const stageTimers = [
      setTimeout(() => setActiveStages(["regional"]), 400),
      setTimeout(() => setActiveStages(["regional", "catchment"]), 900),
      setTimeout(
        () => setActiveStages(["regional", "catchment", "imminent"]),
        1400
      ),
    ];

    // 3. Once Imminent Alert fires, light up delivery channels one by one
    const channelTimers = [
      setTimeout(() => setChannelsActive([true, false, false]), 1700),
      setTimeout(() => setChannelsActive([true, true, false]), 2000),
      setTimeout(() => setChannelsActive([true, true, true]), 2300),
    ];

    const cleanup = setTimeout(() => {
      setPulsing([]);
      setSimulating(false);
    }, 3000);

    // (timers self-clear via component lifetime; fine for a demo prototype)
    void stageTimers;
    void channelTimers;
    void cleanup;
  }

  return (
    <div className="dashboard">
      <header className="header">
        <h1>Catchment Early Warning</h1>
        <p className="subtitle">
          Flash flood &amp; landslide risk — Uttarakhand hill catchment prototype
        </p>
      </header>

      <StatsBar villages={villages} activeAlertCount={activeAlertCount} />

      <div className="main">
        <div className="map-col">
          <div className="layer-toggles">
            <button
              className={showDrainage ? "toggle on" : "toggle"}
              onClick={() => setShowDrainage((s) => !s)}
            >
              Show Drainage Network
            </button>
            <button
              className={showHistorical ? "toggle on" : "toggle"}
              onClick={() => setShowHistorical((s) => !s)}
            >
              Show Historical Events (1998–2022)
            </button>
          </div>
          <div className="map-frame">
            <MapView
              villages={villages}
              selected={selected}
              onSelect={setSelected}
              pulsing={pulsing}
              showDrainage={showDrainage}
              showHistorical={showHistorical}
            />
          </div>
        </div>

        <div className="side-col">
          {selectedVillage && <VillageDetail village={selectedVillage} />}
          <AlertPanel
            activeStages={activeStages}
            channelsActive={channelsActive}
            onSimulate={runSimulation}
            simulating={simulating}
          />
        </div>
      </div>

      <ArchitectureStrip />

      <style jsx>{`
        .dashboard {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        .header {
          padding: 20px 24px 14px;
        }
        .subtitle {
          margin: 4px 0 0;
          color: #5a6572;
          font-size: 14px;
        }
        .main {
          display: flex;
          gap: 20px;
          padding: 20px 24px;
          min-height: 520px;
        }
        .map-col {
          flex: 0 0 60%;
          min-height: 520px;
          display: flex;
          flex-direction: column;
        }
        .layer-toggles {
          display: flex;
          gap: 8px;
          margin-bottom: 10px;
        }
        .map-frame {
          flex: 1 1 auto;
          min-height: 400px;
          position: relative;
        }
        .layer-toggles :global(.toggle) {
          background: #fff;
          border: 1px solid var(--hairline);
          color: #5a6572;
          font-size: 12px;
          font-weight: 500;
          padding: 6px 12px;
          border-radius: 3px;
        }
        .layer-toggles :global(.toggle.on) {
          background: var(--water);
          border-color: var(--water);
          color: #fff;
        }
        .side-col {
          flex: 0 0 38%;
          display: flex;
          flex-direction: column;
        }
        @media (max-width: 900px) {
          .main {
            flex-direction: column;
          }
          .map-col,
          .side-col {
            flex: 1 1 auto;
          }
          .map-col {
            min-height: 360px;
          }
        }
      `}</style>
    </div>
  );
}
