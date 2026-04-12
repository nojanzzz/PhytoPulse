import { useEffect, useRef } from 'react';
import { fetchWeather } from '../engine/weatherApi';
import { simulateSensors } from '../engine/simulationEngine';
import usePhytoStore from '../store/usePhytoStore';

const WEATHER_INTERVAL_MS = 5 * 60 * 1000; 
const SIM_INTERVAL_MS = 5000;               

export function useDataEngine() {
  const updateWeather   = usePhytoStore((s) => s.updateWeather);
  const updateSimulated = usePhytoStore((s) => s.updateSimulated);

  // Simulation engine always reads from `weather` (raw OWM anchor), not `current`
  const weatherRef   = useRef(usePhytoStore.getState().weather);
  const actuatorsRef = useRef(usePhytoStore.getState().actuators);

  useEffect(() => {
    const unsub = usePhytoStore.subscribe((state) => {
      weatherRef.current   = state.weather;
      actuatorsRef.current = state.actuators;
    });

    // Fetch immediately on mount
    fetchWeather().then(updateWeather);

    // Re-fetch every 5 minutes
    const weatherTimer = setInterval(() => {
      fetchWeather().then(updateWeather);
    }, WEATHER_INTERVAL_MS);

    // Simulation tick every 2 seconds
    const simTimer = setInterval(() => {
      const simData = simulateSensors(weatherRef.current, actuatorsRef.current);
      updateSimulated(simData);
    }, SIM_INTERVAL_MS);

    return () => {
      unsub();
      clearInterval(weatherTimer);
      clearInterval(simTimer);
    };
  }, []);
}
