import {create} from 'zustand';

interface HealthState {
  metrics: any[];
  setMetrics: (metrics: any[]) => void;
}

export const useHealthStore = create<HealthState>((set) => ({
  metrics: [],
  setMetrics: (metrics) => set({metrics}),
}));
