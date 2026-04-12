import { useRef } from "react";
import usePhytoStore from "../store/usePhytoStore";
import { exportHistoryCSV } from "../engine/exportCsv";

function fmt(ts) {
  return new Date(ts).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export default function TimeScrubber() {
  const history = usePhytoStore((s) => s.history);
  const scrubberIndex = usePhytoStore((s) => s.scrubberIndex);
  const isLive = usePhytoStore((s) => s.isLive);
  const setScrubberIndex = usePhytoStore((s) => s.setScrubberIndex);

  const total = history.length;
  const currentIndex = scrubberIndex !== null ? scrubberIndex : total - 1;
  const progress = total > 1 ? (currentIndex / (total - 1)) * 100 : 100;
  const displayEntry = history[currentIndex];

  return (
    <div className="glass rounded-xl p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span
          style={{
            fontSize: 11,
            color: "rgba(255,255,255,0.3)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          Time Scrubber
        </span>
        {isLive ? (
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
                fontSize: 11,
                color: "#4ade80",
                fontFamily: "JetBrains Mono, monospace",
              }}
            >
              LIVE
            </span>
          </div>
        ) : (
          <button
            onClick={() => setScrubberIndex(null)}
            style={{
              fontSize: 10,
              color: "#4ade80",
              background: "rgba(74,222,128,0.1)",
              border: "1px solid rgba(74,222,128,0.3)",
              borderRadius: 4,
              padding: "2px 8px",
              cursor: "pointer",
              fontFamily: "JetBrains Mono, monospace",
            }}
          >
            → LIVE
          </button>
        )}
      </div>
      {total < 2 ? (
        <div
          style={{
            fontSize: 11,
            color: "rgba(255,255,255,0.2)",
            textAlign: "center",
            padding: "8px 0",
          }}
        >
          Collecting history…
        </div>
      ) : (
        <>
          <input
            type="range"
            min={0}
            max={total - 1}
            value={currentIndex}
            onChange={(e) => {
              const idx = parseInt(e.target.value);
              setScrubberIndex(idx >= total - 1 ? null : idx);
            }}
            style={{ "--progress": `${progress}%` }}
          />
          <div
            className="flex justify-between"
            style={{
              fontSize: 10,
              color: "rgba(255,255,255,0.25)",
              fontFamily: "JetBrains Mono, monospace",
            }}
          >
            <span>{history[0] ? fmt(history[0].timestamp) : "--:--"}</span>
            <span style={{ color: isLive ? "#4ade80" : "#fbbf24" }}>
              {displayEntry ? fmt(displayEntry.timestamp) : "--:--"}
            </span>
            <span>Now</span>
          </div>
          {!isLive && displayEntry && (
            <div
              className="rounded-lg px-2 py-1.5 flex flex-wrap gap-x-3 gap-y-1"
              style={{
                background: "rgba(251,191,36,0.06)",
                border: "1px solid rgba(251,191,36,0.15)",
              }}
            >
              {["temperature", "humidity", "soilMoisture", "co2"].map((k) => (
                <span
                  key={k}
                  style={{
                    fontSize: 10,
                    fontFamily: "JetBrains Mono, monospace",
                    color: "#fbbf24",
                  }}
                >
                  {k.slice(0, 4)}: {displayEntry[k]?.toFixed?.(1) ?? "--"}
                </span>
              ))}
            </div>
          )}
        </>
      )}

      <button
        onClick={() => exportHistoryCSV(history)}
        disabled={history.length === 0}
        style={{
          width: "100%",
          padding: "5px 0",
          borderRadius: 6,
          cursor: "pointer",
          border: "1px solid rgba(74,222,128,0.25)",
          background: "rgba(74,222,128,0.06)",
          color: history.length ? "#4ade80" : "rgba(255,255,255,0.2)",
          fontSize: 11,
          fontFamily: "JetBrains Mono, monospace",
          letterSpacing: "0.06em",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          if (history.length)
            e.target.style.background = "rgba(74,222,128,0.12)";
        }}
        onMouseLeave={(e) => {
          e.target.style.background = "rgba(74,222,128,0.06)";
        }}
      >
        ↓ Export CSV ({history.length} records)
      </button>
    </div>
  );
}
