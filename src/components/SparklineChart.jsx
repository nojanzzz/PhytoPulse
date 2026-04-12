import { useMemo } from 'react';
import { ResponsiveContainer, AreaChart, Area, YAxis, Tooltip } from 'recharts';
import usePhytoStore from '../store/usePhytoStore';

const CFG = {
  temperature:  { label: 'Temperature', unit: '°C',  color: '#f97316', decimals: 1 },
  humidity:     { label: 'Humidity',    unit: '%',   color: '#38bdf8', decimals: 0 },
  soilMoisture: { label: 'Soil',        unit: '%',   color: '#84cc16', decimals: 1 },
  co2:          { label: 'CO₂',         unit: 'ppm', color: '#a78bfa', decimals: 0 },
  lightLevel:   { label: 'Light',       unit: '%',   color: '#fbbf24', decimals: 1 },
};

const CT = ({ active, payload, config: c }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'rgba(8,15,9,0.95)', border: `1px solid ${c.color}40`, borderRadius: 6, padding: '4px 8px', fontSize: 11, color: c.color, fontFamily: 'JetBrains Mono, monospace' }}>
      {payload[0]?.value?.toFixed(c.decimals)}{c.unit}
    </div>
  );
};

export default function SparklineChart({ metricKey }) {
  const history = usePhytoStore((s) => s.history);
  const c = CFG[metricKey];
  if (!c) return null;
  const data = useMemo(() => history.map((h) => ({ value: h[metricKey] })).filter((d) => d.value !== undefined), [history, metricKey]);
  const cur = data[data.length - 1]?.value;
  const prev = data[data.length - 2]?.value;
  const trend = cur !== undefined && prev !== undefined ? (cur > prev ? '↑' : cur < prev ? '↓' : '—') : '—';

  return (
    <div className="glass rounded-xl px-3 py-2">
      <div className="flex items-center justify-between mb-1">
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{c.label}</span>
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 10, color: trend === '↑' ? '#f97316' : trend === '↓' ? '#38bdf8' : 'rgba(255,255,255,0.3)' }}>{trend}</span>
          <span style={{ fontSize: 13, fontFamily: 'JetBrains Mono, monospace', color: c.color }}>{cur !== undefined ? `${cur.toFixed(c.decimals)}${c.unit}` : '--'}</span>
        </div>
      </div>
      <div style={{ height: 40 }}>
        {data.length > 1 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`g-${metricKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={c.color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={c.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <YAxis domain={['auto', 'auto']} hide />
              <Tooltip content={<CT config={c} />} cursor={{ stroke: c.color, strokeWidth: 1, strokeOpacity: 0.4 }} />
              <Area type="monotone" dataKey="value" stroke={c.color} strokeWidth={1.5} fill={`url(#g-${metricKey})`} dot={false} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full" style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>Collecting data…</div>
        )}
      </div>
    </div>
  );
}
