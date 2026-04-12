import { useEffect, useState } from "react";

const STEPS = [
  "Connecting to weather API...",
  "Initializing sensor simulation...",
  "Building 3D greenhouse...",
  "Calibrating thresholds...",
  "PhytoPulse ready.",
];

export default function LoadingScreen({ onDone }) {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      setStep(Math.min(current, STEPS.length - 1));
      setProgress(Math.min((current / STEPS.length) * 100, 100));
      if (current >= STEPS.length) {
        clearInterval(interval);
        setTimeout(() => {
          setDone(true);
          setTimeout(onDone, 400);
        }, 500);
      }
    }, 520);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#080f09",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 32,
        opacity: done ? 0 : 1,
        transition: "opacity 0.4s ease",
        zIndex: 1000,
      }}
    >
      {/* Logo */}
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontSize: 11,
            color: "rgba(255,255,255,0.3)",
            letterSpacing: "0.3em",
            marginBottom: 8,
          }}
        >
          SMART GREENHOUSE MONITOR
        </div>
        <div
          style={{
            fontSize: 36,
            fontWeight: 700,
            color: "#ddeedd",
            letterSpacing: "0.08em",
          }}
        >
          PHYTO<span style={{ color: "#4ade80" }}>PULSE</span>
        </div>
      </div>

      {/* Progress bar */}
      <div
        style={{
          width: 280,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <div
          style={{
            height: 2,
            background: "rgba(255,255,255,0.08)",
            borderRadius: 1,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              background: "#4ade80",
              borderRadius: 1,
              transition: "width 0.5s ease",
              boxShadow: "0 0 8px rgba(74,222,128,0.6)",
            }}
          />
        </div>
        <div
          style={{
            fontSize: 11,
            color: "rgba(74,222,128,0.7)",
            fontFamily: "JetBrains Mono, monospace",
            height: 16,
          }}
        >
          {STEPS[step]}
        </div>
      </div>

      {/* Version */}
      <div
        style={{
          fontSize: 10,
          color: "rgba(255,255,255,0.15)",
          fontFamily: "JetBrains Mono, monospace",
        }}
      >
        v1.0 · Bogor, West Java
      </div>
    </div>
  );
}
