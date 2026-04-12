import { create } from 'zustand';

export const THRESHOLDS = {
  temperature:  { min: 18, max: 35,   unit: '°C',  label: 'Temperature' },
  humidity:     { min: 40, max: 85,   unit: '%',   label: 'Humidity' },
  soilMoisture: { min: 30, max: 95,   unit: '%',   label: 'Soil Moisture' },
  co2:          { min: 400, max: 1200, unit: 'ppm', label: 'CO2' },
  lightLevel:   { min: 5,  max: 100,  unit: '%',   label: 'Light Level' },
};

const HISTORY_SIZE = 360;

// Separate: raw OWM weather anchor vs displayed/simulated values
const initialWeather = {
  temperature: 28,
  humidity: 70,
  uv: 0,
  rainfall: 0,
  cloudCover: 40,
};

const initialCurrent = {
  ...initialWeather,
  soilMoisture: 72,
  co2: 680,
  lightLevel: 60,
};

const usePhytoStore = create((set, get) => ({
  // Raw weather from OWM — simulation engine reads THIS as anchor
  weather: initialWeather,

  // Displayed values — mix of weather + simulated sensors
  current: initialCurrent,

  history: [],
  actuators: { fan: false, lights: false, irrigation: false },
  alerts: [],
  isLive: true,
  scrubberIndex: null,
  lastWeatherUpdate: null,

  // Called by weatherApi — only updates weather anchor + weather fields in current
  updateWeather: (weatherData) => {
    set((state) => ({
      weather: { ...state.weather, ...weatherData },
      current: { ...state.current, ...weatherData },
      lastWeatherUpdate: Date.now(),
    }));
  },

  // Called by simulationEngine — updates only simulated sensors
  // temperature here is greenhouse temp (ambient + offset), NOT raw OWM
  updateSimulated: (simData) => {
    const state = get();
    if (!state.isLive) return;

    const newCurrent = { ...state.current, ...simData };

    // Threshold checking
    const newAlerts = [];
    Object.entries(THRESHOLDS).forEach(([key, { min, max, unit, label }]) => {
      const val = newCurrent[key];
      if (val === undefined) return;
      if (val < min) {
        newAlerts.push({
          id: key + '-low-' + Date.now(),
          timestamp: Date.now(),
          parameter: key,
          severity: val < min * 0.7 ? 'critical' : 'warning',
          message: label + ' too low',
          value: val.toFixed(1) + unit,
          threshold: 'min ' + min + unit,
        });
      } else if (val > max) {
        newAlerts.push({
          id: key + '-high-' + Date.now(),
          timestamp: Date.now(),
          parameter: key,
          severity: val > max * 1.2 ? 'critical' : 'warning',
          message: label + ' too high',
          value: val.toFixed(1) + unit,
          threshold: 'max ' + max + unit,
        });
      }
    });

    const entry = { timestamp: Date.now(), ...newCurrent };
    const newHistory = [...state.history, entry].slice(-HISTORY_SIZE);
    const alertingParams = new Set(newAlerts.map((a) => a.parameter));
    const filteredOld = state.alerts.filter((a) => {
      // Pertahankan alert lama hanya kalau parameternya masih di luar threshold
      return alertingParams.has(a.parameter) === false
        ? false  // parameter sudah normal → hapus
        : !newAlerts.some((n) => n.parameter === a.parameter && n.severity === a.severity);
    });

    set({
      current: newCurrent,
      history: newHistory,
      alerts: [...newAlerts, ...filteredOld].slice(0, 20),
    });
  },

  setActuator: (name, value) =>
    set((state) => ({ actuators: { ...state.actuators, [name]: value } })),

  setScrubberIndex: (index) =>
    set({ scrubberIndex: index, isLive: index === null }),

  dismissAlert: (id) =>
    set((state) => ({ alerts: state.alerts.filter((a) => a.id !== id) })),
}));

export default usePhytoStore;
