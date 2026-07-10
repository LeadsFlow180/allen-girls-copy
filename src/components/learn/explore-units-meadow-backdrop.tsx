"use client";

import { useId } from "react";
import { getSectionPlaygroundTheme } from "./explore-section-playground-themes";
import { SectionPlaygroundDecorWide } from "./explore-section-playground-decor";
import styles from "./explore-unit-view.module.css";

type ExploreUnitsMeadowBackdropProps = {
  sectionId: number;
};

/** Wide meadow backdrop — palette and scenery change per section */
export function ExploreUnitsMeadowBackdrop({
  sectionId,
}: ExploreUnitsMeadowBackdropProps) {
  const theme = getSectionPlaygroundTheme(sectionId);
  const uid = useId().replace(/:/g, "");
  const meadowSky = `meadowSky-${uid}`;
  const meadowHill1 = `meadowHill1-${uid}`;
  const meadowHill2 = `meadowHill2-${uid}`;
  const meadowGround = `meadowGround-${uid}`;

  const extraClouds =
    theme.cloudDensity === "heavy"
      ? [
          { cx: 300, cy: 45, rx: 60, ry: 20 },
          { cx: 340, cy: 38, rx: 45, ry: 15 },
        ]
      : theme.cloudDensity === "medium"
        ? [{ cx: 280, cy: 50, rx: 50, ry: 17 }]
        : [];

  return (
    <svg
      className={styles.meadowSvg}
      viewBox="0 0 800 320"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <linearGradient id={meadowSky} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={theme.skyTop} />
          <stop offset="40%" stopColor={theme.skyMid} />
          <stop offset="100%" stopColor={theme.skyBottom} />
        </linearGradient>
        <linearGradient id={meadowHill1} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={theme.hillFarTop} />
          <stop offset="100%" stopColor={theme.hillFarBottom} />
        </linearGradient>
        <linearGradient id={meadowHill2} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={theme.hillNearTop} />
          <stop offset="100%" stopColor={theme.hillNearBottom} />
        </linearGradient>
        <linearGradient id={meadowGround} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={theme.groundTop} />
          <stop offset="100%" stopColor={theme.groundBottom} />
        </linearGradient>
      </defs>

      <rect width="800" height="320" fill={`url(#${meadowSky})`} />

      {theme.sunVisible && (
        <>
          <circle cx="680" cy="55" r="50" fill="#fff9e0" opacity="0.4" />
          <circle cx="680" cy="55" r="28" fill="#ffe566" opacity="0.85" />
          <circle cx="680" cy="55" r="22" fill="#ffc800" />
        </>
      )}

      <g opacity="0.9">
        <ellipse cx="120" cy="70" rx="55" ry="18" fill="#fff" />
        <ellipse cx="155" cy="64" rx="40" ry="14" fill="#f5faff" />
        <ellipse cx="400" cy="58" rx="48" ry="16" fill="#fff" />
        <ellipse cx="430" cy="52" rx="35" ry="12" fill="#eef6fc" />
        <ellipse cx="620" cy="78" rx="42" ry="14" fill="#fff" opacity="0.85" />
        {extraClouds.map((c) => (
          <ellipse
            key={`${c.cx}-${c.cy}`}
            cx={c.cx}
            cy={c.cy}
            rx={c.rx}
            ry={c.ry}
            fill="#f0f4f8"
          />
        ))}
      </g>

      <path
        d="M0 160 Q200 120 400 145 T800 130 L800 320 L0 320 Z"
        fill={`url(#${meadowHill1})`}
      />
      <path
        d="M0 190 Q250 155 500 175 T800 165 L800 320 L0 320 Z"
        fill={`url(#${meadowHill2})`}
      />
      <rect x="0" y="200" width="800" height="120" fill={`url(#${meadowGround})`} />

      {theme.decor === "meadow" &&
        [60, 110, 160, 520, 580, 640, 720].map((x, i) => (
          <g key={x} opacity={0.5 + (i % 3) * 0.1}>
            <rect x={x} y={168 - (i % 2) * 8} width={6} height={28} fill="#5c4a3a" />
            <ellipse
              cx={x + 3}
              cy={158 - (i % 2) * 8}
              rx={16 + (i % 2) * 4}
              ry={20}
              fill="#4a7538"
            />
          </g>
        ))}

      <SectionPlaygroundDecorWide
        decor={theme.decor}
        accent={theme.borderColor}
        locked={false}
      />

      <path
        d="M400 320 C400 260 380 220 360 190 C340 160 320 140 300 120 C280 100 290 90 310 95 C330 100 350 108 380 100 C410 92 430 85 450 78 C470 72 480 85 470 100 C455 125 430 150 410 175 C395 195 385 215 380 240 Z"
        fill={theme.pathMid}
        opacity="0.15"
      />
    </svg>
  );
}
