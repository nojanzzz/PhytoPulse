import { createNoise2D } from 'simplex-noise';
import useTimeStore from '../store/useTimeStore';

const soilNoise  = createNoise2D();
const co2Noise   = createNoise2D();
const lightNoise = createNoise2D();

let tick = 0;
let irrigationCredit = 0;
let fanCooldown = 0;

export function simulateSensors(weather, actuators) {
  tick += 1;
  const t = tick * 0.004;

  const ambientTemp     = typeof weather.temperature === 'number' ? weather.temperature : 28;
  const ambientHumidity = typeof weather.humidity    === 'number' ? weather.humidity    : 70;
  const cloudCover      = typeof weather.cloudCover  === 'number' ? weather.cloudCover  : 40;
  const rainfall        = typeof weather.rainfall    === 'number' ? weather.rainfall    : 0;

  // Read hour from time store (supports manual override)
  const hour = useTimeStore.getState().getHour();
  const minute = useTimeStore.getState().mode === 'live' ? new Date().getMinutes() : 0;
  const timeDecimal = hour + minute / 60;

  // ── Soil moisture ──────────────────────────────────────────────────
  const evapRate = Math.max(0, (ambientTemp - 20) * 0.04);
  const rainBoost = rainfall * 2.5;
  if (actuators && actuators.irrigation) {
    irrigationCredit = Math.min(irrigationCredit + 0.8, 30);
  } else {
    irrigationCredit = Math.max(0, irrigationCredit - 0.04);
  }
  const soilBase = 42 + ambientHumidity * 0.38 + rainBoost + irrigationCredit - evapRate;
  const soilMoisture = clamp(soilBase + soilNoise(t * 0.4, 0) * 10, 5, 98);

  // ── CO₂ ───────────────────────────────────────────────────────────
  const photoWindow = Math.max(0, Math.sin(((timeDecimal - 8) / 7) * Math.PI));
  const co2 = clamp(700 + ambientTemp * 5 - photoWindow * 100 + co2Noise(0, t * 0.3) * 80, 380, 1800);

  // ── Light level ────────────────────────────────────────────────────
  const dayArc = Math.max(0, Math.sin(((timeDecimal - 6) / 12) * Math.PI));
  const cloudFactor = 1 - (cloudCover / 100) * 0.85;
  const lampBoost = (actuators && actuators.lights) ? 40 : 0;
  const naturalLight = dayArc * cloudFactor * 95;
  const lightLevel = clamp(naturalLight + lampBoost + lightNoise(t * 0.5, 2) * 4, 0, 100);

  // ── Greenhouse temperature ─────────────────────────────────────────
  if (actuators && actuators.fan) {
    fanCooldown = Math.min(fanCooldown + 0.08, 4.5);
  } else {
    fanCooldown = Math.max(0, fanCooldown - 0.02);
  }
  const ghEffect = 2 + naturalLight * 0.03;
  const temperature = clamp(ambientTemp + ghEffect - fanCooldown, 10, 45);

  return {
    soilMoisture: r1(soilMoisture),
    co2: Math.round(co2),
    lightLevel: r1(lightLevel),
    temperature: r1(temperature),
  };
}

export function resetSimulation() {
  tick = 0;
  irrigationCredit = 0;
  fanCooldown = 0;
}

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function r1(v) { return Math.round(v * 10) / 10; }
