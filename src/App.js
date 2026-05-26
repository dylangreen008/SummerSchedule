import { useState, useEffect, useCallback } from "react";

const BLOCKS = [
  { id: "sat", label: "SAT Study", emoji: "📚", color: "#f97316", endsJune6: true },
  { id: "learn", label: "Learning", emoji: "🧠", color: "#6366f1" },
  { id: "workout", label: "Workout", emoji: "💪", color: "#10b981" },
  { id: "hangout", label: "Hangout", emoji: "🤙", color: "#ec4899" },
  { id: "free", label: "Free Time", emoji: "☀️", color: "#facc15" },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const TIMES = [
  "7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM",
  "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM",
];

const STORAGE_KEY = "summer-schedule-v1";

const buildDefaultGrid = () => {
  const grid = {};
  DAYS.forEach(day => {
    grid[day] = {};
    TIMES.forEach(t => { grid[day][t] = null; });
  });

  ["Mon", "Tue", "Wed", "Thu", "Fri"].forEach(d => {
    grid[d]["9:00 AM"] = "sat";
    grid[d]["10:00 AM"] = "sat";
  });

  DAYS.forEach(d => { grid[d]["7:00 AM"] = "workout"; });

  ["Mon", "Wed", "Fri"].forEach(d => {
    grid[d]["3:00 PM"] = "learn";
    grid[d]["4:00 PM"] = "learn";
  });

  ["Tue", "Thu"].forEach(d => {
    grid[d]["3:00 PM"] = "hangout";
    grid[d]["4:00 PM"] = "hangout";
  });

  ["Sat", "Sun"].forEach(d => {
    grid[d]["12:00 PM"] = "hangout";
    grid[d]["1:00 PM"] = "hangout";
    grid[d]["2:00 PM"] = "hangout";
    grid[d]["3:00 PM"] = "free";
    grid[d]["4:00 PM"] = "free";
  });

  return grid;
};

const loadState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const saveState = (state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
};

export default function App() {
  const [grid, setGrid] = useState(() => {
    const saved = loadState();
    return saved?.grid ?? buildDefaultGrid();
  });
  const [satDone, setSatDone] = useState(() => {
    const saved = loadState();
    return saved?.satDone ?? false;
  });
  const [selected, setSelected] = useState("workout");
  const [erasing, setErasing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [saveFlash, setSaveFlash] = useState(false);

  // Auto-save whenever grid or satDone changes
  useEffect(() => {
    saveState({ grid, satDone });
    setSaveFlash(true);
    const t = setTimeout(() => setSaveFlash(false), 1200);
    return () => clearTimeout(t);
  }, [grid, satDone]);

  const paint = useCallback((day, time) => {
    setGrid(g => {
      const next = { ...g, [day]: { ...g[day] } };
      next[day][time] = erasing ? null : selected;
      return next;
    });
  }, [erasing, selected]);

  const handleMouseDown = (day, time) => {
    setDragging(true);
    paint(day, time);
  };
  const handleMouseEnter = (day, time) => {
    if (dragging) paint(day, time);
  };
  const handleMouseUp = () => setDragging(false);

  const blockMap = Object.fromEntries(BLOCKS.map(b => [b.id, b]));
  const visibleBlocks = BLOCKS.filter(b => !b.endsJune6 || !satDone);

  const resetGrid = () => {
    setGrid(buildDefaultGrid());
    setSatDone(false);
  };

  return (
    <div
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
        fontFamily: "'DM Sans', sans-serif",
        color: "#f8fafc",
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", padding: "36px 24px 16px" }}>
        <div style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 12,
          letterSpacing: 5,
          color: "#a78bfa",
          marginBottom: 10,
          textTransform: "uppercase",
        }}>
          Summer 2025
        </div>
        <h1 style={{
          margin: 0,
          fontSize: "clamp(28px, 5vw, 42px)",
          fontWeight: 700,
          background: "linear-gradient(90deg, #c084fc, #60a5fa, #34d399)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}>
          My Weekly Schedule
        </h1>
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          marginTop: 10,
          padding: "4px 14px",
          borderRadius: 20,
          background: saveFlash ? "#052e16" : "#0f172a",
          border: `1px solid ${saveFlash ? "#16a34a" : "#1e293b"}`,
          transition: "all 0.3s ease",
          fontSize: 12,
          color: saveFlash ? "#4ade80" : "#475569",
        }}>
          <span style={{ fontSize: 10 }}>{saveFlash ? "●" : "○"}</span>
          {saveFlash ? "Saved" : "Auto-saves as you edit"}
        </div>
      </div>

      {/* SAT Toggle */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
        <label style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "#1e1b4b",
          border: "1px solid #4338ca",
          borderRadius: 24,
          padding: "8px 20px",
          cursor: "pointer",
          fontSize: 13,
          color: "#c7d2fe",
        }}>
          <input
            type="checkbox"
            checked={satDone}
            onChange={e => setSatDone(e.target.checked)}
            style={{ accentColor: "#818cf8", width: 16, height: 16, cursor: "pointer" }}
          />
          SAT done after June 6 — hide SAT blocks
        </label>
      </div>

      {/* Palette */}
      <div style={{
        display: "flex",
        gap: 8,
        justifyContent: "center",
        flexWrap: "wrap",
        padding: "0 20px 20px",
      }}>
        <button
          onClick={() => setErasing(e => !e)}
          style={{
            padding: "8px 16px",
            borderRadius: 20,
            border: erasing ? "2px solid #f87171" : "2px solid #334155",
            background: erasing ? "rgba(239,68,68,0.15)" : "#1e293b",
            color: erasing ? "#fca5a5" : "#64748b",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: 13,
            fontFamily: "'DM Sans', sans-serif",
            transition: "all .15s",
          }}
        >
          🧹 {erasing ? "Erasing" : "Erase"}
        </button>

        {visibleBlocks.map(b => (
          <button
            key={b.id}
            onClick={() => { setSelected(b.id); setErasing(false); }}
            style={{
              padding: "8px 16px",
              borderRadius: 20,
              border: selected === b.id && !erasing ? `2px solid ${b.color}` : "2px solid transparent",
              background: selected === b.id && !erasing ? `${b.color}22` : "#1e293b",
              color: b.color,
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 13,
              fontFamily: "'DM Sans', sans-serif",
              transition: "all .15s",
              boxShadow: selected === b.id && !erasing ? `0 0 16px ${b.color}44` : "none",
            }}
          >
            {b.emoji} {b.label}
          </button>
        ))}

        <button
          onClick={resetGrid}
          style={{
            padding: "8px 16px",
            borderRadius: 20,
            border: "2px solid #334155",
            background: "#0f172a",
            color: "#475569",
            cursor: "pointer",
            fontSize: 13,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Reset
        </button>
      </div>

      {/* Grid */}
      <div style={{ overflowX: "auto", padding: "0 16px 32px" }}>
        <div style={{ minWidth: 680, maxWidth: 1000, margin: "0 auto" }}>

          {/* Day headers */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "72px repeat(7, 1fr)",
            gap: 4,
            marginBottom: 4,
          }}>
            <div />
            {DAYS.map(d => (
              <div key={d} style={{
                textAlign: "center",
                fontSize: 11,
                fontWeight: 700,
                color: "#64748b",
                padding: "6px 0",
                letterSpacing: 2,
                fontFamily: "'Space Mono', monospace",
              }}>
                {d.toUpperCase()}
              </div>
            ))}
          </div>

          {/* Rows */}
          {TIMES.map(time => (
            <div key={time} style={{
              display: "grid",
              gridTemplateColumns: "72px repeat(7, 1fr)",
              gap: 4,
              marginBottom: 4,
            }}>
              <div style={{
                fontSize: 10,
                color: "#334155",
                textAlign: "right",
                paddingRight: 10,
                paddingTop: 10,
                fontFamily: "'Space Mono', monospace",
                whiteSpace: "nowrap",
              }}>
                {time}
              </div>
              {DAYS.map(day => {
                const blockId = grid[day]?.[time];
                const block = blockId ? blockMap[blockId] : null;
                const hidden = block?.endsJune6 && satDone;
                const display = hidden ? null : block;
                return (
                  <div
                    key={day}
                    onMouseDown={() => handleMouseDown(day, time)}
                    onMouseEnter={() => handleMouseEnter(day, time)}
                    title={display ? `${display.label} · ${day} ${time}` : `${day} · ${time}`}
                    style={{
                      height: 38,
                      borderRadius: 8,
                      cursor: "pointer",
                      background: display
                        ? `${display.color}28`
                        : "rgba(255,255,255,0.03)",
                      border: display
                        ? `1px solid ${display.color}66`
                        : "1px solid rgba(255,255,255,0.04)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 18,
                      transition: "background 0.1s, border 0.1s",
                    }}
                  >
                    {display?.emoji ?? ""}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div style={{ padding: "0 16px 48px", maxWidth: 1000, margin: "0 auto" }}>
        <div style={{
          background: "rgba(15, 23, 42, 0.8)",
          borderRadius: 16,
          padding: "20px 24px",
          border: "1px solid #1e293b",
          backdropFilter: "blur(10px)",
        }}>
          <div style={{
            fontSize: 11,
            fontFamily: "'Space Mono', monospace",
            color: "#334155",
            marginBottom: 16,
            letterSpacing: 3,
          }}>
            WEEKLY HOURS
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
            {visibleBlocks.map(b => {
              const count = DAYS.reduce((acc, day) =>
                acc + TIMES.filter(t => grid[day]?.[t] === b.id).length, 0);
              return (
                <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 10,
                    height: 10,
                    borderRadius: 3,
                    background: b.color,
                    flexShrink: 0,
                  }} />
                  <span style={{ fontSize: 13, color: "#64748b" }}>{b.label}</span>
                  <span style={{
                    fontSize: 15,
                    color: b.color,
                    fontWeight: 700,
                    fontFamily: "'Space Mono', monospace",
                  }}>
                    {count}h
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
