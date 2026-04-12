import usePhytoStore, { THRESHOLDS } from '../store/usePhytoStore';

const CONFIG = {
  temperature:  { label: 'Temperature', unit: '°C',   decimals: 1 },
  humidity:     { label: 'Humidity',    unit: '%',    decimals: 0 },
  soilMoisture: { label: 'Soil',        unit: '%',    decimals: 1 },
  co2:          { label: 'CO₂',         unit: ' ppm', decimals: 0 },
  lightLevel:   { label: 'Light',       unit: '%',    decimals: 1 },
  uv:           { label: 'UV Index',    unit: '',     decimals: 1 },
  rainfall:     { label: 'Rainfall',    unit: ' mm',  decimals: 1 },
};

function getStatus(key, value) {
  const t = THRESHOLDS[key];
  if (!t) return 'normal';
  if (value < t.min * 0.85 || value > t.max * 1.15) return 'critical';
  if (value < t.min || value > t.max) return 'warning';
  return 'normal';
}

const COLORS = {
  normal:   { value: '#4ade80', bar: '#4ade80', label: '#6b8a6b' },
  warning:  { value: '#fbbf24', bar: '#fbbf24', label: '#92740a' },
  critical: { value: '#f87171', bar: '#f87171', label: '#7a3030' },
};

export default function MetricCard({ metricKey }) {
  const value = usePhytoStore((s) => s.current[metricKey]);
  const { label, unit, decimals } = CONFIG[metricKey] ?? {};
  const status = getStatus(metricKey, value);
  const c = COLORS[status];
  const t = THRESHOLDS[metricKey];
  const progress = t ? Math.max(0, Math.min(100, ((value - t.min * 0.7) / (t.max * 1.3 - t.min * 0.7)) * 100)) : (value / 100) * 100;

  return (
    <div className="glass rounded-xl p-3 flex flex-col gap-2 transition-colors duration-300"
      style={{ borderColor: status !== 'normal' ? `${c.bar}33` : 'rgba(255,255,255,0.08)' }}>
      <div className="flex items-center justify-between">
        <span style={{ fontSize: 11, color: c.label, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</span>
        {status !== 'normal' && (
          <span style={{ fontSize: 10, color: c.value, padding: '1px 6px', borderRadius: 20, background: `${c.value}18`, border: `1px solid ${c.value}40`, animation: status === 'critical' ? 'alertPulse 1.2s ease-in-out infinite' : 'none' }}>
            {status}
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="metric-value" style={{ fontSize: 26, color: c.value, lineHeight: 1 }}>
          {value !== undefined ? value.toFixed(decimals) : '--'}
        </span>
        <span style={{ fontSize: 12, color: c.label }}>{unit}</span>
      </div>
      <div style={{ height: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 1, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${progress}%`, background: c.bar, borderRadius: 1, transition: 'width 1s ease, background 0.5s', opacity: 0.8 }} />
      </div>
      {t && (
        <div className="flex justify-between" style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>
          <span>{t.min}{unit}</span><span>{t.max}{unit}</span>
        </div>
      )}
    </div>
  );
}
