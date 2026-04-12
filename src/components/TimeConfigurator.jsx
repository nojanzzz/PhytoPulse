import { useState, useEffect } from "react";
import useTimeStore from "../store/useTimeStore";

const HOUR_LABELS = {
  0: "00:00",
  3: "03:00",
  6: "06:00",
  9: "09:00",
  12: "12:00",
  15: "15:00",
  18: "18:00",
  21: "21:00",
  23: "23:00",
};

function getTimeOfDay(hour) {
  if (hour >= 5 && hour < 7) return { label: "Dawn", color: "#f97316" };
  if (hour >= 7 && hour < 11) return { label: "Morning", color: "#fbbf24" };
  if (hour >= 11 && hour < 14) return { label: "Midday", color: "#4ade80" };
  if (hour >= 14 && hour < 17) return { label: "Afternoon", color: "#84cc16" };
  if (hour >= 17 && hour < 19) return { label: "Dusk", color: "#f97316" };
  return { label: "Night", color: "#818cf8" };
}

function getSunIcon(hour) {
  if (hour >= 6 && hour < 18) {
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="3" stroke="currentColor" strokeWidth="1.2" />
        <path
          d="M7 1V2.5M7 11.5V13M1 7H2.5M11.5 7H13M2.93 2.93L3.99 3.99M10.01 10.01L11.07 11.07M11.07 2.93L10.01 3.99M3.99 10.01L2.93 11.07"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M11.5 8.5A4.5 4.5 0 015.5 2.5a5 5 0 100 9 4.5 4.5 0 006-3z"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="none"
      />
    </svg>
  );
}

export default function TimeConfigurator() {
  const mode = useTimeStore((s) => s.mode);
  const manualHour = useTimeStore((s) => s.manualHour);
  const setMode = useTimeStore((s) => s.setMode);
  const setManualHour = useTimeStore((s) => s.setManualHour);

  const [now, setNow] = useState(new Date());
  const liveHour = now.getHours();
  const displayHour = mode === "live" ? liveHour : manualHour;
  useEffect(() => {
    if (mode !== "live") return;
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, [mode]);
  const tod = getTimeOfDay(displayHour);
  const progress = (displayHour / 23) * 100;

  return (
    <div className="glass rounded-xl p-3 flex flex-col gap-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span
          style={{
            fontSize: 11,
            color: "rgba(255,255,255,0.3)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          Time Mode
        </span>
        <div className="flex items-center gap-1" style={{ color: tod.color }}>
          {getSunIcon(displayHour)}
          <span
            style={{
              fontSize: 11,
              color: tod.color,
              fontFamily: "JetBrains Mono, monospace",
            }}
          >
            {tod.label}
          </span>
        </div>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-1.5">
        {["live", "manual"].map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{
              flex: 1,
              padding: "5px 0",
              borderRadius: 6,
              border: `1px solid ${mode === m ? "rgba(74,222,128,0.4)" : "rgba(255,255,255,0.08)"}`,
              background: mode === m ? "rgba(74,222,128,0.12)" : "transparent",
              color: mode === m ? "#4ade80" : "rgba(255,255,255,0.35)",
              fontSize: 11,
              fontFamily: "JetBrains Mono, monospace",
              cursor: "pointer",
              transition: "all 0.2s",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            {m === "live" ? "⬤ Live" : "⚙ Manual"}
          </button>
        ))}
      </div>

      {/* Time display */}
      <div className="flex items-center justify-between">
        <span
          style={{
            fontSize: 22,
            fontFamily: "JetBrains Mono, monospace",
            color: tod.color,
            fontWeight: 500,
          }}
        >
          {String(displayHour).padStart(2, "0")}:
          {mode === "live" ? String(now.getMinutes()).padStart(2, "0") : "00"}
        </span>
        {mode === "live" && (
          <div className="flex items-center gap-1.5">
            <span
              className="live-dot"
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#4ade80",
                display: "inline-block",
              }}
            />
            <span
              style={{
                fontSize: 10,
                color: "#4ade80",
                fontFamily: "JetBrains Mono, monospace",
              }}
            >
              REALTIME
            </span>
          </div>
        )}
      </div>

      {/* Slider — only in manual mode */}
      {mode === "manual" && (
        <>
          <input
            type="range"
            min={0}
            max={23}
            step={1}
            value={manualHour}
            onChange={(e) => setManualHour(parseInt(e.target.value))}
            style={{ "--progress": `${progress}%` }}
          />
          {/* Hour markers */}
          <div
            className="flex justify-between"
            style={{
              fontSize: 9,
              color: "rgba(255,255,255,0.2)",
              fontFamily: "JetBrains Mono, monospace",
            }}
          >
            <span>00</span>
            <span>06</span>
            <span>12</span>
            <span>18</span>
            <span>23</span>
          </div>

          {/* Quick presets */}
          <div className="flex gap-1 flex-wrap">
            {[
              { label: "Dawn", hour: 6 },
              { label: "Noon", hour: 12 },
              { label: "Dusk", hour: 18 },
              { label: "Night", hour: 22 },
            ].map(({ label, hour }) => (
              <button
                key={label}
                onClick={() => setManualHour(hour)}
                style={{
                  flex: 1,
                  padding: "3px 0",
                  borderRadius: 4,
                  border: `1px solid ${manualHour === hour ? `${getTimeOfDay(hour).color}50` : "rgba(255,255,255,0.07)"}`,
                  background:
                    manualHour === hour
                      ? `${getTimeOfDay(hour).color}15`
                      : "transparent",
                  color:
                    manualHour === hour
                      ? getTimeOfDay(hour).color
                      : "rgba(255,255,255,0.3)",
                  fontSize: 10,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  fontFamily: "JetBrains Mono, monospace",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
