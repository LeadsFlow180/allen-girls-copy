"use client";

/**
 * Alana Color Scene — SVG color-by-number for the Alana line art.
 * Regions are defined in src/data/games/color-lab-scenes.ts (ALANA_REGIONS)
 * and shared with ButterflyColorLab.
 * This standalone component exists for external reference/reuse.
 */

import { COLOR_LAB_SCENES, COLOR_LAB_PALETTE, type ColorLabRegion } from "@/data/games/color-lab-scenes";

const alanaScene = COLOR_LAB_SCENES.find((s) => s.id === "alana")!;

export type AlanaColorSceneProps = {
  filled: Record<string, string>;
  onRegionClick: (region: ColorLabRegion) => void;
  hovered: string | null;
  onHover: (id: string | null) => void;
  imageSrc: string;
};

export function AlanaColorScene({
  filled,
  onRegionClick,
  hovered,
  onHover,
  imageSrc,
}: AlanaColorSceneProps) {
  return (
    <svg
      viewBox={alanaScene.viewBox}
      width="min(380px, 90vw)"
      style={{ display: "block", cursor: "crosshair" }}
    >
      <image
        href={imageSrc}
        x={0}
        y={0}
        width={400}
        height={600}
        preserveAspectRatio="xMidYMid meet"
        style={{ pointerEvents: "none" }}
      />
      {alanaScene.regions.map((region) => {
        const fillColor = filled[region.id] ?? "transparent";
        const isHov = hovered === region.id;
        const intendedHex = COLOR_LAB_PALETTE.find((c) => c.id === region.colorId)?.hex;
        const isCorrect = filled[region.id] && intendedHex && filled[region.id] === intendedHex;
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
              onMouseEnter={() => onHover(region.id)}
              onMouseLeave={() => onHover(null)}
              onClick={() => onRegionClick(region)}
              onTouchStart={(e) => {
                e.preventDefault();
                onRegionClick(region);
              }}
            />
            {!filled[region.id] && (
              <text
                x={region.cx}
                y={region.cy + 5}
                textAnchor="middle"
                fontSize={18}
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
    </svg>
  );
}
