import { useState, useEffect } from "react";
import usePhytoStore from "../store/usePhytoStore";

export default function StatusHeader() {
  const current = usePhytoStore((s) => s.current);
  const isLive = usePhytoStore((s) => s.isLive);
  const alerts = usePhytoStore((s) => s.alerts);
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const criticalCount = alerts.filter((a) => a.severity === "critical").length;
  const warningCount = alerts.filter((a) => a.severity === "warning").length;
  const systemStatus =
    criticalCount > 0 ? "critical" : warningCount > 0 ? "warning" : "normal";
  const sc = {
    normal: { color: "#4ade80", label: "NORMAL" },
    warning: { color: "#fbbf24", label: "WARNING" },
    critical: { color: "#f87171", label: "CRITICAL" },
  }[systemStatus];

  return (
    <div
      className="glass flex items-center justify-between px-4 py-2.5"
      style={{
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        flexShrink: 0,
      }}
    >
      <div className="flex items-center gap-3">
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            background: "rgba(74,222,128,0.12)",
            border: "1px solid rgba(74,222,128,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
          }}
        >
          ◈
        </div>
        <div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "#ddeedd",
              letterSpacing: "0.04em",
            }}
          >
            PHYTO<span style={{ color: "#4ade80" }}>PULSE</span>
          </div>
          <div
            style={{
              fontSize: 9,
              color: "rgba(255,255,255,0.25)",
              letterSpacing: "0.1em",
              marginTop: -1,
            }}
          >
            SMART GREENHOUSE MONITOR · BOGOR
          </div>
        </div>
      </div>
      <div className="hidden sm:flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: sc.color,
              display: "inline-block",
              boxShadow: `0 0 6px ${sc.color}`,
              animation:
                systemStatus !== "normal"
                  ? "alertPulse 1.2s ease-in-out infinite"
                  : "none",
            }}
          />
          <span
            style={{
              fontSize: 11,
              color: sc.color,
              fontFamily: "JetBrains Mono, monospace",
              letterSpacing: "0.08em",
            }}
          >
            {sc.label}
          </span>
        </div>
        <div
          style={{ width: 1, height: 16, background: "rgba(255,255,255,0.1)" }}
        />
        <div
          className="flex items-center gap-3"
          style={{
            fontSize: 11,
            color: "rgba(255,255,255,0.4)",
            fontFamily: "JetBrains Mono, monospace",
          }}
        >
          <span>
            <span style={{ color: "rgba(255,255,255,0.2)" }}>ext </span>
            {current.temperature?.toFixed(1)}°C
          </span>
          <span>
            <span style={{ color: "rgba(255,255,255,0.2)" }}>rh </span>
            {current.humidity}%
          </span>
          <span>
            <span style={{ color: "rgba(255,255,255,0.2)" }}>uv </span>
            {current.uv?.toFixed(1)}
          </span>
          {current.rainfall > 0 && (
            <span style={{ color: "#38bdf8" }}>
              <span style={{ color: "rgba(255,255,255,0.2)" }}>rain </span>
              {current.rainfall}mm
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {criticalCount > 0 && (
          <div
            style={{
              fontSize: 10,
              color: "#f87171",
              padding: "2px 8px",
              borderRadius: 20,
              background: "rgba(248,113,113,0.12)",
              border: "1px solid rgba(248,113,113,0.3)",
              fontFamily: "JetBrains Mono, monospace",
              animation: "alertPulse 1.2s ease-in-out infinite",
            }}
          >
            {criticalCount} CRIT
          </div>
        )}
        <div className="flex items-center gap-2">
          {isLive && (
            <span
              className="live-dot"
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#4ade80",
                display: "inline-block",
                boxShadow: "0 0 6px #4ade80",
              }}
            />
          )}
          <span
            style={{
              fontSize: 12,
              fontFamily: "JetBrains Mono, monospace",
              color: "rgba(255,255,255,0.5)",
            }}
          >
            {time.toLocaleTimeString("en-US", { hour12: false })}
          </span>
        </div>
      </div>
    </div>
  );
}
