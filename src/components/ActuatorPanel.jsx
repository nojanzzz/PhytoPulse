import usePhytoStore from '../store/usePhytoStore';

const ACTUATORS = [
  { key: 'fan', label: 'Exhaust Fan', desc: 'Ventilation + temperature control', onColor: '#4ade80' },
  { key: 'lights', label: 'Grow Lights', desc: 'LED spectrum supplemental lighting', onColor: '#e879f9' },
  { key: 'irrigation', label: 'Irrigation', desc: 'Drip system — soil moisture boost', onColor: '#38bdf8' },
];

export default function ActuatorPanel() {
  const actuators = usePhytoStore((s) => s.actuators);
  const setActuator = usePhytoStore((s) => s.setActuator);

  return (
    <div className="glass rounded-xl p-3 flex flex-col gap-2">
      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Actuator Control</span>
      {ACTUATORS.map(({ key, label, desc, onColor }) => {
        const on = actuators[key];
        return (
          <div key={key} className="flex items-center justify-between rounded-lg px-3 py-2 transition-all duration-300"
            style={{ background: on ? `${onColor}12` : 'rgba(255,255,255,0.03)', border: `1px solid ${on ? onColor + '30' : 'rgba(255,255,255,0.06)'}` }}>
            <div>
              <div style={{ fontSize: 13, color: on ? onColor : 'rgba(255,255,255,0.6)', fontWeight: 500, transition: 'color 0.3s' }}>{label}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginTop: 1 }}>{desc}</div>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" checked={on} onChange={(e) => setActuator(key, e.target.checked)} />
              <div className="toggle-track" style={{ background: on ? `${onColor}30` : undefined, borderColor: on ? `${onColor}50` : undefined }}>
                <div className="toggle-thumb" style={{ background: on ? onColor : undefined }} />
              </div>
            </label>
          </div>
        );
      })}
    </div>
  );
}
