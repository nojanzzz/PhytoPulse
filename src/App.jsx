import { Suspense, Component, useState, useEffect } from "react";
import { useDataEngine } from "./hooks/useDataEngine";
import StatusHeader from "./components/StatusHeader";
import GreenhouseScene from "./components/GreenhouseScene";
import MetricCard from "./components/MetricCard";
import SparklineChart from "./components/SparklineChart";
import ActuatorPanel from "./components/ActuatorPanel";
import AlertLog from "./components/AlertLog";
import TimeScrubber from "./components/TimeScrubber";
import TimeConfigurator from "./components/TimeConfigurator";
import LoadingScreen from "./components/LoadingScreen";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            padding: 24,
            color: "#f87171",
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 13,
            background: "#080f09",
            height: "100%",
          }}
        >
          <div style={{ marginBottom: 8, color: "#fbbf24" }}>
            ⚠ Scene error — check console:
          </div>
          <pre style={{ whiteSpace: "pre-wrap" }}>
            {this.state.error.message}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function Dashboard() {
  useDataEngine();
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Auto-handle mobile state on resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Optional: Auto-close sidebar on mobile if desired, but here we'll let user toggle
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {loading && <LoadingScreen onDone={() => setLoading(false)} />}
      <div
        className="flex flex-col"
        style={{ height: "100vh", background: "#080f09" }}
      >
        <StatusHeader />
        <div className={`flex flex-1 min-h-0 ${isMobile ? "flex-col" : "flex-row"}`}>
          {/* Left/Top: Three.js Scene */}
          <div className="flex-1 relative min-w-0" style={{ minHeight: isMobile ? "40vh" : "auto" }}>
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                zIndex: 10,
                background: "rgba(0,0,0,0.5)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 6,
                padding: "4px 10px",
                cursor: "pointer",
                color: "rgba(255,255,255,0.5)",
                fontSize: 11,
                fontFamily: "JetBrains Mono, monospace",
              }}
            >
              {sidebarOpen ? "→ hide" : "← show"}
            </button>
            <ErrorBoundary>
              <Suspense fallback={<SceneLoader />}>
                <GreenhouseScene />
              </Suspense>
            </ErrorBoundary>
            <div
              className="absolute bottom-3 left-3"
              style={{
                fontSize: 10,
                color: "rgba(255,255,255,0.2)",
                pointerEvents: "none",
                fontFamily: "JetBrains Mono, monospace",
              }}
            >
              drag to orbit · scroll to zoom
            </div>
          </div>

          {/* Right/Bottom: Dashboard Panel */}
          <div
            className="flex flex-col gap-2 p-3 overflow-y-auto"
            style={{
              width: isMobile ? "100%" : (sidebarOpen ? 340 : 0),
              minWidth: isMobile ? "100%" : (sidebarOpen ? 340 : 0),
              height: isMobile ? (sidebarOpen ? "60vh" : 0) : "100%",
              flexShrink: 0,
              borderLeft: !isMobile && sidebarOpen
                ? "1px solid rgba(255,255,255,0.06)"
                : "none",
              borderTop: isMobile && sidebarOpen
                ? "1px solid rgba(255,255,255,0.06)"
                : "none",
              background: "rgba(0,0,0,0.2)",
              overflow: sidebarOpen ? "auto" : "hidden",
              transition: "width 0.3s ease, height 0.3s ease, min-width 0.3s ease",
            }}
          >
            <div className="grid grid-cols-2 gap-2">
              <MetricCard metricKey="temperature" />
              <MetricCard metricKey="humidity" />
              <MetricCard metricKey="soilMoisture" />
              <MetricCard metricKey="co2" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <MetricCard metricKey="lightLevel" />
              <MetricCard metricKey="uv" />
            </div>
            <div className="flex flex-col gap-1.5">
              <SparklineChart metricKey="temperature" />
              <SparklineChart metricKey="soilMoisture" />
              <SparklineChart metricKey="co2" />
              <SparklineChart metricKey="lightLevel" />
            </div>
            <ActuatorPanel />
            <AlertLog />
            <TimeConfigurator />
            <TimeScrubber />
            <div
              className="flex items-center justify-between px-1 pb-1"
              style={{
                fontSize: 10,
                color: "rgba(255,255,255,0.15)",
                fontFamily: "JetBrains Mono, monospace",
              }}
            >
              <span>Bogor, West Java · −6.59°N 106.80°E</span>
              <span>PhytoPulse v1.0</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function SceneLoader() {
  return (
    <div
      className="flex items-center justify-center w-full h-full"
      style={{
        color: "rgba(74,222,128,0.4)",
        fontSize: 12,
        fontFamily: "JetBrains Mono, monospace",
      }}
    >
      Initializing scene…
    </div>
  );
}

export default Dashboard;
