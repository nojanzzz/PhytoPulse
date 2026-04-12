import { create } from 'zustand';

const useTimeStore = create((set, get) => ({
  mode: 'live',      // 'live' | 'manual'
  manualHour: 12,    // 0-23, only used in manual mode

  getHour: () => {
    const state = get();
    if (state.mode === 'live') return new Date().getHours();
    return state.manualHour;
  },

  setMode: (mode) => set({ mode }),
  setManualHour: (hour) => set({ manualHour: hour }),
}));

export default useTimeStore;
