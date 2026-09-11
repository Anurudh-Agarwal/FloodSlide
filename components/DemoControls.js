'use client';

import { useStore } from '@/lib/store';

export default function DemoControls() {
  const villages = useStore((s) => s.villages);
  const simulateSensorTrigger = useStore((s) => s.simulateSensorTrigger);

  return (
    <div className="demoBox">
      <div><b>⚡ Demo Controls (not part of the real product)</b></div>
      <div>In production this comes from real IoT/weather sensors, per village. For this prototype, trigger one manually:</div>
      <div className="demoBtns">
        {villages.map((v) => (
          <button key={v.id} className="chip" onClick={() => simulateSensorTrigger(v.id)}>
            Trigger sensor: {v.name}
          </button>
        ))}
      </div>
    </div>
  );
}
