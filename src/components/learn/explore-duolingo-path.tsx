"use client";

import { motion } from "framer-motion";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  BookOpen,
  Check,
  Flag,
  Gift,
  Lock,
  Play,
  Target,
} from "lucide-react";

export type UnitStepStatus = "locked" | "current" | "completed";

const STEP_LABELS = ["Start", "Learn", "Reward", "Practice", "Finish"];

const STEP_ICONS = [Play, BookOpen, Gift, Target, Flag];

/** Subtle zigzag — compact like the original layout */
const OFFSETS = [-1, 0, 1, 0, -1] as const;
const OFFSET_PCT_DEFAULT = 22;
const OFFSET_PCT_NARROW = 16;
const NODE_SIZE_DEFAULT = 52;
const NODE_SIZE_NARROW = 44;

function useNarrowViewport() {
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 480px)");
    const update = () => setNarrow(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return narrow;
}

interface LineSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  stroke: string;
  dashed: boolean;
  opacity: number;
}

interface ExploreDuolingoPathProps {
  steps: UnitStepStatus[];
  themeColor: string;
  currentCount?: number;
  onStepClick?: (stepIndex: number) => void;
}

function segmentStroke(
  from: UnitStepStatus,
  to: UnitStepStatus,
  themeColor: string,
): { stroke: string; dashed: boolean; opacity: number } {
  const done = from === "completed" || to === "completed";
  const active = from === "current" || to === "current";
  if (done) return { stroke: "#58cc02", dashed: false, opacity: 1 };
  if (active) return { stroke: themeColor, dashed: true, opacity: 0.9 };
  return { stroke: "#c4c4c4", dashed: true, opacity: 0.55 };
}

function trimToCircleEdges(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  radius: number,
): { x1: number; y1: number; x2: number; y2: number } {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  if (len <= radius * 2) {
    return { x1, y1, x2, y2 };
  }
  const ux = dx / len;
  const uy = dy / len;
  return {
    x1: x1 + ux * radius,
    y1: y1 + uy * radius,
    x2: x2 - ux * radius,
    y2: y2 - uy * radius,
  };
}

export function ExploreDuolingoPath({
  steps,
  themeColor,
  currentCount = 0,
  onStepClick,
}: ExploreDuolingoPathProps) {
  const narrow = useNarrowViewport();
  const nodeSize = narrow ? NODE_SIZE_NARROW : NODE_SIZE_DEFAULT;
  const offsetPct = narrow ? OFFSET_PCT_NARROW : OFFSET_PCT_DEFAULT;
  const nodeRadius = nodeSize / 2;

  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [lines, setLines] = useState<LineSegment[]>([]);

  const measureLines = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const box = container.getBoundingClientRect();
    const centers = steps.map((_, index) => {
      const el = nodeRefs.current[index];
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return {
        x: r.left + r.width / 2 - box.left,
        y: r.top + r.height / 2 - box.top,
      };
    });

    const next: LineSegment[] = [];
    for (let i = 0; i < steps.length - 1; i++) {
      const a = centers[i];
      const b = centers[i + 1];
      if (!a || !b) continue;

      const trimmed = trimToCircleEdges(a.x, a.y, b.x, b.y, nodeRadius);
      const style = segmentStroke(steps[i], steps[i + 1], themeColor);
      next.push({ ...trimmed, ...style });
    }
    setLines(next);
  }, [steps, themeColor, nodeRadius]);

  useLayoutEffect(() => {
    measureLines();
    const raf = requestAnimationFrame(measureLines);
    const container = containerRef.current;
    if (!container) return () => cancelAnimationFrame(raf);

    const ro = new ResizeObserver(() => measureLines());
    ro.observe(container);
    window.addEventListener("resize", measureLines);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", measureLines);
    };
  }, [measureLines]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        marginTop: "0.35rem",
        alignSelf: "stretch",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
      }}
    >
      <div
        ref={containerRef}
        style={{
          position: "relative",
          padding: "0.65rem 0.5rem 0.55rem",
          borderRadius: "1.1rem",
          background:
            "linear-gradient(180deg, rgba(215,255,184,0.55) 0%, rgba(255,255,255,0.92) 100%)",
          border: "2px solid rgba(88,204,2,0.22)",
          boxShadow: "inset 0 2px 0 rgba(255,255,255,0.9)",
        }}
      >
        <svg
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: 0,
            overflow: "visible",
          }}
        >
          {lines.map((line, index) => (
            <line
              key={`line-${index}`}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke={line.stroke}
              strokeWidth={2}
              strokeLinecap="round"
              strokeDasharray={line.dashed ? "5 5" : undefined}
              opacity={line.opacity}
            />
          ))}
        </svg>

        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {steps.map((status, index) => {
            const Icon = STEP_ICONS[index];
            const isCurrent = status === "current";
            const isCompleted = status === "completed";
            const isLocked = status === "locked";
            const offset = OFFSETS[index];

            const faceColor = isCompleted
              ? "#58cc02"
              : isCurrent
                ? themeColor
                : "#e5e5e5";
            const rimColor = isCompleted
              ? "#46a302"
              : isCurrent
                ? themeColor
                : "#afafaf";

            return (
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  transform: `translateX(${offset * offsetPct}%)`,
                }}
              >
                <button
                  type="button"
                  disabled={isLocked || !onStepClick}
                  onClick={() => {
                    if (isLocked || !onStepClick) return;
                    onStepClick(index);
                  }}
                  aria-label={`${STEP_LABELS[index]} — ${status}`}
                  style={{
                    border: "none",
                    background: "transparent",
                    padding: 0,
                    cursor:
                      isLocked || !onStepClick ? "default" : "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.35rem",
                  }}
                >
                  <motion.div
                    ref={(el) => {
                      nodeRefs.current[index] = el;
                    }}
                    whileHover={
                      !isLocked && onStepClick
                        ? { scale: 1.04 }
                        : undefined
                    }
                    whileTap={
                      !isLocked && onStepClick ? { scale: 0.96 } : undefined
                    }
                    animate={
                      isCurrent
                        ? {
                            scale: [1, 1.05, 1],
                            boxShadow: [
                              `0 4px 0 ${rimColor}, 0 0 0 0 rgba(88,204,2,0)`,
                              `0 4px 0 ${rimColor}, 0 0 0 6px rgba(88,204,2,0.2)`,
                              `0 4px 0 ${rimColor}, 0 0 0 0 rgba(88,204,2,0)`,
                            ],
                          }
                        : undefined
                    }
                    transition={
                      isCurrent
                        ? { duration: 1.8, repeat: Infinity }
                        : undefined
                    }
                    style={{
                      width: nodeSize,
                      height: nodeSize,
                      borderRadius: "50%",
                      background: `linear-gradient(180deg, ${faceColor} 0%, ${faceColor}dd 100%)`,
                      boxShadow: `0 4px 0 ${rimColor}, 0 6px 14px rgba(15,23,42,${isCurrent ? 0.16 : 0.08})`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                    }}
                  >
                    {isCompleted ? (
                      <Check size={22} color="#fff" strokeWidth={3} />
                    ) : isLocked ? (
                      <Lock size={18} color="#9ca3af" />
                    ) : (
                      <Icon size={20} color="#fff" strokeWidth={2.5} />
                    )}
                    {isCurrent && (
                      <span
                        style={{
                          position: "absolute",
                          top: -6,
                          right: -4,
                          width: 18,
                          height: 18,
                          borderRadius: "50%",
                          background: "#ffc800",
                          border: "2px solid #fff",
                          fontSize: "0.55rem",
                          fontWeight: 900,
                          color: "#7c2d12",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        !
                      </span>
                    )}
                  </motion.div>
                  <span
                    className="font-nunito"
                    style={{
                      fontSize: "0.68rem",
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      color: isCurrent
                        ? "#3c3c3c"
                        : isCompleted
                          ? "#46a302"
                          : "#9ca3af",
                    }}
                  >
                    {STEP_LABELS[index]}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div
        className="font-nunito"
        style={{
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "0.35rem 0.8rem",
          fontSize: "0.72rem",
          fontWeight: 700,
          color: "#777",
        }}
      >
        <span>
          Progress: {Math.min(currentCount, STEP_LABELS.length)}/
          {STEP_LABELS.length}
        </span>
        <span style={{ color: themeColor }}>
          Next: {STEP_LABELS[Math.min(currentCount, STEP_LABELS.length - 1)]}
        </span>
      </div>
    </motion.div>
  );
}
