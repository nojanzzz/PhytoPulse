import usePhytoStore from '../store/usePhytoStore';

const S = {
  critical: { color: '#f87171', bg: '#f871711a', border: '#f8717140', label: 'CRIT' },
  warning:  { color: '#fbbf24', bg: '#fbbf241a', border: '#fbbf2440', label: 'WARN' },
};

function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

export default function AlertLog() {
  const alerts = usePhytoStore((s) => s.alerts);
  const dismissAlert = usePhytoStore((s) => s.dismissAlert);

  return (
    <div className="glass rounded-xl p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Alert Log</span>
        {alerts.length > 0 && (
          <span style={{ fontSize: 10, color: '#f87171', padding: '1px 6px', borderRadius: 20, background: '#f871711a', border: '1px solid #f8717140', animation: alerts.some((a) => a.severity === 'critical') ? 'alertPulse 1.2s ease-in-out infinite' : 'none' }}>
            {alerts.length} active
          </span>
        )}
      </div>
      {alerts.length === 0 ? (
        <div className="flex items-center justify-center rounded-lg" style={{ height: 52, background: 'rgba(74,222,128,0.05)', border: '1px solid rgba(74,222,128,0.1)' }}>
          <span style={{ fontSize: 12, color: '#4ade8070' }}>All parameters within range</span>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5 overflow-y-auto" style={{ maxHeight: 180 }}>
          {alerts.map((alert) => {
            const s = S[alert.severity] ?? S.warning;
            return (
              <div key={alert.id} className="alert-new flex items-start gap-2 rounded-lg px-2.5 py-2" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                <span style={{ fontSize: 9, fontFamily: 'JetBrains Mono, monospace', color: s.color, padding: '2px 4px', borderRadius: 3, background: `${s.color}22`, marginTop: 1, flexShrink: 0 }}>{s.label}</span>
                <div className="flex-1 min-w-0">
                  <div style={{ fontSize: 12, color: s.color }}>{alert.message}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 1 }}>{alert.value} · threshold {alert.threshold}</div>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)' }}>{timeAgo(alert.timestamp)}</span>
                  <button onClick={() => dismissAlert(alert.id)} style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', background: 'none', border: 'none', cursor: 'pointer', padding: '1px 4px', borderRadius: 3 }}
                    onMouseEnter={(e) => (e.target.style.color = '#f87171')} onMouseLeave={(e) => (e.target.style.color = 'rgba(255,255,255,0.25)')}>
                    dismiss
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
