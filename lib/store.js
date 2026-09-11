import { create } from 'zustand';
import { VILLAGE_SEED } from './constants';

export const useStore = create((set) => ({
  userLocation: null,
  showRiskLayer: false,
  villages: VILLAGE_SEED.map((v) => ({
    ...v,
    sensorConfidence: 8,
    reports: [],
    rescueConfirmed: false,
    resolved: false,
  })),

  setUserLocation: (loc) => set({ userLocation: loc }),

  toggleRiskLayer: () => set((s) => ({ showRiskLayer: !s.showRiskLayer })),

  updateVillage: (id, patch) =>
    set((s) => ({
      villages: s.villages.map((v) => (v.id === id ? { ...v, ...patch } : v)),
    })),

  addReport: (villageId, report) =>
    set((s) => ({
      villages: s.villages.map((v) =>
        v.id === villageId ? { ...v, reports: [...v.reports, report], resolved: false } : v
      ),
    })),

  // Demo-only helper (mirrors the "Trigger sensor" buttons in the prototype)
  simulateSensorTrigger: (id) =>
    set((s) => ({
      villages: s.villages.map((v) =>
        v.id === id ? { ...v, resolved: false, sensorConfidence: 65 } : v
      ),
    })),
}));
