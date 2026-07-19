"use client";

import { useState, useRef, useEffect, useCallback } from "react";

import {
  COLOR_LAB_PALETTE,
  COLOR_LAB_SCENES,
  type ColorLabRegion,
} from "@/data/games/color-lab-scenes";

const COLORS = COLOR_LAB_PALETTE;

// Fixed star positions/opacities so server and client match (avoids hydration mismatch)
const STARS = [
  { top: 8, left: 12, opacity: 0.35 },
  { top: 15, left: 88, opacity: 0.52 },
  { top: 22, left: 45, opacity: 0.41 },
  { top: 31, left: 6, opacity: 0.28 },
  { top: 38, left: 72, opacity: 0.61 },
  { top: 44, left: 33, opacity: 0.47 },
  { top: 52, left: 95, opacity: 0.39 },
  { top: 58, left: 19, opacity: 0.54 },
  { top: 63, left: 61, opacity: 0.43 },
  { top: 71, left: 4, opacity: 0.31 },
  { top: 76, left: 78, opacity: 0.48 },
  { top: 82, left: 26, opacity: 0.59 },
  { top: 90, left: 54, opacity: 0.37 },
  { top: 5, left: 67, opacity: 0.44 },
  { top: 41, left: 91, opacity: 0.56 },
  { top: 67, left: 39, opacity: 0.29 },
  { top: 12, left: 23, opacity: 0.63 },
  { top: 85, left: 14, opacity: 0.46 },
  { top: 49, left: 81, opacity: 0.51 },
  { top: 96, left: 48, opacity: 0.33 },
];

type FilledState = Record<string, string>;

const defaultSceneId = COLOR_LAB_SCENES[0].id;

export default function ButterflyColorLab() {
  const [sceneId, setSceneId] = useState(defaultSceneId);
  const [selected, setSelected] = useState(COLORS[0]);
  const [filled, setFilled] = useState<FilledState>({});
  const [undoStack, setUndoStack] = useState<FilledState[]>([]);
  const [redoStack, setRedoStack] = useState<FilledState[]>([]);
  const [hovered, setHovered] = useState<string | null>(null);
  const [sparkMsg, setSparkMsg] = useState(
    "Hi! I'm S.P.A.R.K. 🦋 Pick a color and tap a numbered section!",
  );
  const [confetti, setConfetti] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const scene = COLOR_LAB_SCENES.find((s) => s.id === sceneId) ?? COLOR_LAB_SCENES[0];
  const REGIONS = scene.regions;
  const totalRegions = REGIONS.length;
  const filledCount = Object.keys(filled).length;
  const progress = totalRegions > 0 ? Math.round((filledCount / totalRegions) * 100) : 0;

  useEffect(() => {
    if (filledCount === totalRegions && totalRegions > 0) {
      setSparkMsg("🎉 Amazing work! Your butterfly is BEAUTIFUL! You're a true artist!");
      setConfetti(true);
      const t = setTimeout(() => setConfetti(false), 4000);
      return () => clearTimeout(t);
    }
  }, [filledCount, totalRegions]);

  const handleRegionClick = useCallback(
    (region: ColorLabRegion) => {
      setUndoStack((s) => [...s, filled]);
      setRedoStack([]);
      setFilled((prev) => ({ ...prev, [region.id]: selected.hex }));
      const hints = [
        `Great choice! ${selected.name} looks magical! ✨`,
        `Ooh, ${selected.name}! The butterfly loves it! 🦋`,
        `Keep going! You're doing amazing! 💜`,
        `Look at those beautiful wings coming to life! 🌟`,
        `S.P.A.R.K. says: You have a gift for color! 🎨`,
      ];
      if (filledCount < totalRegions - 1) {
        setSparkMsg(hints[Math.floor(Math.random() * hints.length)]);
      }
    },
    [selected, filledCount, totalRegions, filled],
  );

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const nextFilled = undoStack[undoStack.length - 1];
    setRedoStack((r) => [...r, filled]);
    setFilled(nextFilled);
    setUndoStack((s) => s.slice(0, -1));
    setSparkMsg("Undid that step! You can redo if you change your mind. ↩️");
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const nextFilled = redoStack[redoStack.length - 1];
    setUndoStack((u) => [...u, filled]);
    setFilled(nextFilled);
    setRedoStack((r) => r.slice(0, -1));
    setSparkMsg("Redid it! Keep coloring! 🎨");
  };

  const handleReset = () => {
    setFilled({});
    setUndoStack([]);
    setRedoStack([]);
    setSparkMsg("Let's start fresh! Pick a color and make magic! ✨");
  };

  const handleSwitchScene = (newSceneId: string) => {
    if (newSceneId === sceneId) return;
    setSceneId(newSceneId);
    setFilled({});
    setUndoStack([]);
    setRedoStack([]);
    const sceneTitle = COLOR_LAB_SCENES.find((s) => s.id === newSceneId)?.title ?? "picture";
    setSparkMsg(`Now coloring ${sceneTitle}! Pick a color and tap a section. 🎨`);
  };

  const handleHint = () => {
    const unfilled = REGIONS.find((r) => !filled[r.id]);
    if (unfilled) {
      const color = COLORS.find((c) => c.id === unfilled.colorId);
      setSparkMsg(`💡 Hint: Try using ${color?.name ?? "a color"} on section #${unfilled.label}!`);
    } else {
      setSparkMsg("You've filled everything! 🎉");
    }
  };

  return (
    <div
      className="font-nunito game-play-shell"
      suppressHydrationWarning={true}
      style={{
        minHeight: "100%",
        background: "linear-gradient(135deg, #1a0533 0%, #2d1060 40%, #0d2060 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "max(12px, env(safe-area-inset-top)) max(12px, env(safe-area-inset-right)) max(16px, env(safe-area-inset-bottom)) max(12px, env(safe-area-inset-left))",
        position: "relative",
        overflowX: "clip",
        overflowY: "auto",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* Starfield — fixed positions to avoid hydration mismatch */}
      {STARS.map((star, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: 3,
            height: 3,
            borderRadius: "50%",
            background: "#fff",
            opacity: star.opacity,
            top: `${star.top}%`,
            left: `${star.left}%`,
            animation: "twinkle 3s infinite alternate",
          }}
        />
      ))}

      {confetti &&
        [...Array(30)].map((_, i) => (
          <div
            key={i}
            style={{
              position: "fixed",
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: COLORS[i % COLORS.length].hex,
              top: "50%",
              left: "50%",
              animation: `burst${i % 5} 1.5s ease-out forwards`,
              transform: `rotate(${i * 12}deg) translateY(0)`,
              zIndex: 999,
            }}
          />
        ))}

      <div style={{ textAlign: "center", marginBottom: 12, zIndex: 1 }}>
        <div
          style={{
            fontSize: 13,
            letterSpacing: 4,
            color: "#c084fc",
            textTransform: "uppercase",
            marginBottom: 4,
          }}
          >
            Allen Girls Adventures
          </div>
          <h1
            className="font-fredoka"
            style={{
              fontSize: "clamp(24px, 5vw, 36px)",
              margin: 0,
              background: "linear-gradient(90deg, #FF6B9D, #A855F7, #00C6FF)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: 900,
              letterSpacing: 1,
            }}
          >
            🦋 Butterfly Sisters Color Lab
          </h1>
        </div>

      {/* Picture selector */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 12,
          zIndex: 1,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {COLOR_LAB_SCENES.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => handleSwitchScene(s.id)}
            style={{
              padding: "8px 16px",
              borderRadius: 999,
              border: sceneId === s.id ? "2px solid #A855F7" : "2px solid rgba(255,255,255,0.3)",
              background: sceneId === s.id ? "rgba(168,85,247,0.25)" : "rgba(255,255,255,0.08)",
              color: "#e9d5ff",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {s.id === "butterfly" ? "🦋 Butterfly" : "👧 " + s.title}
          </button>
        ))}
      </div>

      <div
        style={{
          background: "rgba(168, 85, 247, 0.15)",
          border: "1px solid rgba(168,85,247,0.4)",
          borderRadius: 16,
          padding: "10px 18px",
          color: "#e9d5ff",
          fontSize: 14,
          maxWidth: 480,
          textAlign: "center",
          marginBottom: 12,
          zIndex: 1,
          backdropFilter: "blur(8px)",
        }}
      >
        <span style={{ fontWeight: 700, color: "#c084fc" }}>S.P.A.R.K.:</span> {sparkMsg}
      </div>

      <div style={{ width: "min(400px, 90vw)", marginBottom: 12, zIndex: 1 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            color: "#c4b5fd",
            fontSize: 12,
            marginBottom: 4,
          }}
        >
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div
          style={{
            height: 10,
            background: "rgba(255,255,255,0.1)",
            borderRadius: 99,
          }}
        >
          <div
            style={{
              height: "100%",
              borderRadius: 99,
              transition: "width 0.4s ease",
              background: "linear-gradient(90deg, #FF6B9D, #A855F7)",
              width: `${progress}%`,
            }}
          />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 16,
          justifyContent: "center",
          alignItems: "flex-start",
          zIndex: 1,
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.95)",
            borderRadius: 20,
            padding: 8,
            boxShadow: "0 0 40px rgba(168,85,247,0.4), 0 0 80px rgba(168,85,247,0.1)",
          }}
        >
          <svg
            ref={svgRef}
            viewBox={scene.viewBox}
            style={{ display: "block", cursor: "crosshair", width: "min(380px, 90vw)", height: "auto", maxWidth: "100%" }}
          >
            {scene.image ? (
              <>
                {/* Image scene: colors fill underneath, line art on top via multiply */}
                {REGIONS.map((region) => (
                  <path
                    key={`fill-${region.id}`}
                    d={region.path}
                    fill={filled[region.id] ?? "#FFFFFF"}
                    style={{ transition: "fill 0.2s" }}
                  />
                ))}

                {(() => {
                  const rect = scene.imageRect;
                  if (rect) {
                    return (
                      <image
                        href={scene.image.src}
                        x={rect.x}
                        y={rect.y}
                        width={rect.width}
                        height={rect.height}
                        preserveAspectRatio="none"
                        style={{ pointerEvents: "none", mixBlendMode: "multiply" }}
                      />
                    );
                  }
                  const parts = scene.viewBox.trim().split(/\s+/);
                  const w = Number(parts[2]) || 400;
                  const h = Number(parts[3]) || 600;
                  return (
                    <image
                      href={scene.image.src}
                      x={0}
                      y={0}
                      width={w}
                      height={h}
                      preserveAspectRatio="xMidYMid meet"
                      style={{ pointerEvents: "none", mixBlendMode: "multiply" }}
                    />
                  );
                })()}

                {/* Invisible interactive targets on top */}
                {REGIONS.map((region) => {
                  const isHov = hovered === region.id;
                  return (
                    <path
                      key={`click-${region.id}`}
                      d={region.path}
                      fill={isHov ? "rgba(168,85,247,0.12)" : "transparent"}
                      stroke="none"
                      style={{ cursor: "pointer", transition: "fill 0.15s" }}
                      onMouseEnter={() => setHovered(region.id)}
                      onMouseLeave={() => setHovered(null)}
                      onClick={() => handleRegionClick(region)}
                      onTouchStart={(e) => {
                        e.preventDefault();
                        handleRegionClick(region);
                      }}
                    />
                  );
                })}

                {/* Number labels on top of everything */}
                {REGIONS.map((region) => {
                  const intendedHex = COLORS.find((c) => c.id === region.colorId)?.hex;
                  const isCorrect = filled[region.id] && filled[region.id] === intendedHex;
                  return (
                    <g key={`label-${region.id}`}>
                      {!filled[region.id] && (
                        <text
                          x={region.cx}
                          y={region.cy + 5}
                          textAnchor="middle"
                          fontSize={16}
                          fontWeight="bold"
                          fill="#333"
                          stroke="white"
                          strokeWidth={2.5}
                          paintOrder="stroke fill"
                          style={{ pointerEvents: "none", userSelect: "none" }}
                        >
                          {region.label}
                        </text>
                      )}
                      {isCorrect && (
                        <text
                          x={region.cx}
                          y={region.cy + 5}
                          textAnchor="middle"
                          fontSize={14}
                          fontWeight="bold"
                          fill="white"
                          stroke="#333"
                          strokeWidth={1.5}
                          paintOrder="stroke fill"
                          style={{ pointerEvents: "none" }}
                        >
                          ✓
                        </text>
                      )}
                    </g>
                  );
                })}
              </>
            ) : (
              <>
                {/* Non-image scene (butterfly): standard rendering */}
                {scene.extraPaths?.map((p, i) => (
                  <path
                    key={i}
                    d={p.d}
                    fill="none"
                    stroke={p.stroke ?? "#2F3640"}
                    strokeWidth={p.strokeWidth ?? 2}
                    strokeLinecap="round"
                  />
                ))}
                {REGIONS.map((region) => {
                  const fillColor = filled[region.id] ?? "#F0F0F0";
                  const isHov = hovered === region.id;
                  const intendedHex = COLORS.find((c) => c.id === region.colorId)?.hex;
                  const isCorrect = filled[region.id] && filled[region.id] === intendedHex;
                  return (
                    <g key={region.id}>
                      <path
                        d={region.path}
                        fill={fillColor}
                        stroke={isHov ? "#A855F7" : "#999"}
                        strokeWidth={isHov ? 2.5 : 1.5}
                        style={{
                          transition: "fill 0.2s",
                          cursor: "pointer",
                          filter: isHov ? "brightness(1.1)" : "none",
                        }}
                        onMouseEnter={() => setHovered(region.id)}
                        onMouseLeave={() => setHovered(null)}
                        onClick={() => handleRegionClick(region)}
                        onTouchStart={(e) => {
                          e.preventDefault();
                          handleRegionClick(region);
                        }}
                      />
                      {!filled[region.id] && (
                        <text
                          x={region.cx}
                          y={region.cy + 5}
                          textAnchor="middle"
                          fontSize={region.id.startsWith("spot") ? 9 : 13}
                          fontWeight="bold"
                          fill="#333"
                          style={{ pointerEvents: "none", userSelect: "none" }}
                        >
                          {region.label}
                        </text>
                      )}
                      {isCorrect && (
                        <text
                          x={region.cx}
                          y={region.cy + 5}
                          textAnchor="middle"
                          fontSize={10}
                          fontWeight="bold"
                          fill="white"
                          stroke="#333"
                          strokeWidth={1}
                          paintOrder="stroke fill"
                          style={{ pointerEvents: "none" }}
                        >
                          ✓
                        </text>
                      )}
                    </g>
                  );
                })}
              </>
            )}
          </svg>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 160 }}>
          <div
            style={{
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 16,
              padding: 14,
              backdropFilter: "blur(8px)",
            }}
          >
            <div
              style={{
                color: "#c4b5fd",
                fontSize: 12,
                fontWeight: 700,
                marginBottom: 10,
                textTransform: "uppercase",
                letterSpacing: 2,
              }}
            >
              Color Palette
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {COLORS.map((color) => (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => {
                    setSelected(color);
                    setSparkMsg(`${color.name} selected! Now tap a section! 🎨`);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    background: selected.id === color.id ? "rgba(168,85,247,0.3)" : "rgba(255,255,255,0.05)",
                    border:
                      selected.id === color.id ? "2px solid #A855F7" : "2px solid transparent",
                    borderRadius: 10,
                    padding: "6px 8px",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: color.hex,
                      border: "2px solid rgba(255,255,255,0.3)",
                      flexShrink: 0,
                      boxShadow: color.hex === "#FFFFFF" ? "0 0 0 1px #ccc inset" : "none",
                    }}
                  />
                  <div style={{ textAlign: "left" }}>
                    <div style={{ color: "#fff", fontSize: 10, fontWeight: 700 }}>{color.id}</div>
                    <div style={{ color: "#c4b5fd", fontSize: 9 }}>{color.name}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleHint}
            style={{
              background: "linear-gradient(135deg, #00C6FF, #0072ff)",
              border: "none",
              borderRadius: 12,
              padding: "10px 0",
              color: "#fff",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              width: "100%",
            }}
          >
            💡 Ask S.P.A.R.K.
          </button>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={handleUndo}
              disabled={undoStack.length === 0}
              title="Undo last color"
              style={{
                flex: 1,
                background: undoStack.length === 0 ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: 12,
                padding: "10px 0",
                color: undoStack.length === 0 ? "#6b7280" : "#c4b5fd",
                fontSize: 14,
                fontWeight: 700,
                cursor: undoStack.length === 0 ? "not-allowed" : "pointer",
                opacity: undoStack.length === 0 ? 0.6 : 1,
              }}
            >
              ↩️ Undo
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={redoStack.length === 0}
              title="Redo"
              style={{
                flex: 1,
                background: redoStack.length === 0 ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: 12,
                padding: "10px 0",
                color: redoStack.length === 0 ? "#6b7280" : "#c4b5fd",
                fontSize: 14,
                fontWeight: 700,
                cursor: redoStack.length === 0 ? "not-allowed" : "pointer",
                opacity: redoStack.length === 0 ? 0.6 : 1,
              }}
            >
              ↪️ Redo
            </button>
          </div>

          <button
            type="button"
            onClick={handleReset}
            style={{
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 12,
              padding: "10px 0",
              color: "#c4b5fd",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              width: "100%",
            }}
          >
            🔄 Start Over
          </button>

          <div
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 12,
              padding: 12,
            }}
          >
            <div
              style={{
                color: "#c4b5fd",
                fontSize: 11,
                fontWeight: 700,
                marginBottom: 8,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Color Guide
            </div>
            {COLORS.map((c) => (
              <div
                key={c.id}
                style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}
              >
                <div
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 3,
                    background: c.hex,
                    flexShrink: 0,
                    border: "1px solid rgba(255,255,255,0.3)",
                  }}
                />
                <span style={{ color: "#e9d5ff", fontSize: 11 }}>
                  <b style={{ color: "#fff" }}>{c.id}</b> — {c.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
