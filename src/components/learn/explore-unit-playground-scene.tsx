"use client";

import { useId } from "react";
import { getSectionPlaygroundTheme } from "./explore-section-playground-themes";
import { SectionPlaygroundDecorUnit } from "./explore-section-playground-decor";
import styles from "./explore-unit-view.module.css";

type ExploreUnitPlaygroundSceneProps = {
  sectionId: number;
  themeColor: string;
  isLocked: boolean;
};

/** Per-unit illustrated scene — matches active section theme; ladder unchanged on top */
export function ExploreUnitPlaygroundScene({
  sectionId,
  themeColor,
  isLocked,
}: ExploreUnitPlaygroundSceneProps) {
  const theme = getSectionPlaygroundTheme(sectionId);
  const uid = useId().replace(/:/g, "");
  const accent = isLocked ? "#9ca3af" : themeColor;
  const skyGrad = `sky-${uid}`;
  const hillFar = `hillFar-${uid}`;
  const hillNear = `hillNear-${uid}`;
  const grassFront = `grassFront-${uid}`;
  const pathDirt = `pathDirt-${uid}`;
  const sunGlow = `sunGlow-${uid}`;
  const softShadow = `softShadow-${uid}`;
  const grassDots = `grassDots-${uid}`;

  const showSwing =
    !isLocked && (theme.decor === "meadow" || theme.decor === "games");
  const showTrees =
    theme.decor === "meadow" ||
    theme.decor === "garden" ||
    theme.decor === "grove";

  return (
    <svg
      className={`${styles.sceneSvg} ${isLocked ? styles.sceneLocked : ""}`}
      viewBox="0 0 400 200"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <linearGradient id={skyGrad} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={theme.skyTop} />
          <stop offset="55%" stopColor={theme.skyMid} />
          <stop offset="100%" stopColor={theme.skyBottom} />
        </linearGradient>
        <linearGradient id={hillFar} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={theme.hillFarTop} />
          <stop offset="100%" stopColor={theme.hillFarBottom} />
        </linearGradient>
        <linearGradient id={hillNear} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={theme.hillNearTop} />
          <stop offset="100%" stopColor={theme.hillNearBottom} />
        </linearGradient>
        <linearGradient id={grassFront} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={theme.groundTop} />
          <stop offset="100%" stopColor={theme.groundBottom} />
        </linearGradient>
        <linearGradient id={pathDirt} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={theme.pathLight} />
          <stop offset="50%" stopColor={theme.pathMid} />
          <stop offset="100%" stopColor={theme.pathDark} />
        </linearGradient>
        <radialGradient id={sunGlow} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff9e6" />
          <stop offset="45%" stopColor="#ffe566" />
          <stop offset="100%" stopColor="#ffb020" />
        </radialGradient>
        <filter id={softShadow} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.2" />
        </filter>
        <pattern
          id={grassDots}
          width="8"
          height="8"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="2" cy="6" r="0.8" fill={theme.groundBottom} opacity="0.35" />
          <circle cx="6" cy="3" r="0.6" fill={theme.groundTop} opacity="0.25" />
        </pattern>
      </defs>

      <rect width="400" height="200" fill={`url(#${skyGrad})`} />

      {theme.sunVisible && (
        <>
          <circle cx="330" cy="38" r="42" fill="#fff8e0" opacity="0.35" />
          <circle
            cx="330"
            cy="38"
            r="22"
            fill={`url(#${sunGlow})`}
            opacity={isLocked ? 0.5 : 1}
          />
        </>
      )}

      <g opacity={isLocked ? 0.45 : 0.88}>
        <ellipse cx="70" cy="42" rx="36" ry="14" fill="#fff" />
        <ellipse cx="95" cy="38" rx="28" ry="12" fill="#f8fcff" />
        {theme.cloudDensity !== "light" && (
          <>
            <ellipse cx="55" cy="48" rx="22" ry="10" fill="#eef6fc" />
            <ellipse cx="260" cy="52" rx="32" ry="12" fill="#fff" />
            <ellipse cx="285" cy="48" rx="24" ry="10" fill="#f5faff" />
          </>
        )}
        {theme.cloudDensity === "heavy" && (
          <ellipse cx="180" cy="35" rx="48" ry="16" fill="#eef2f6" />
        )}
      </g>

      <path
        d="M0 118 Q80 88 160 108 T320 98 T400 112 L400 200 L0 200 Z"
        fill={`url(#${hillFar})`}
        opacity="0.85"
      />
      <path
        d="M0 132 Q120 108 220 125 T400 118 L400 200 L0 200 Z"
        fill={`url(#${hillNear})`}
      />

      <rect x="0" y="128" width="400" height="72" fill={`url(#${grassFront})`} />
      <rect x="0" y="128" width="400" height="72" fill={`url(#${grassDots})`} />

      <path
        d="M168 200 C168 175 178 145 188 115 C195 95 198 72 200 52 C202 72 205 95 212 115 C222 145 232 175 232 200 Z"
        fill={`url(#${pathDirt})`}
        opacity="0.88"
        filter={`url(#${softShadow})`}
      />

      {showTrees && (
        <>
          <g filter={`url(#${softShadow})`} opacity={isLocked ? 0.55 : 1}>
            <rect x="28" y="108" width="10" height="42" rx="2" fill="#6b4f3a" />
            <ellipse cx="33" cy="98" rx="28" ry="32" fill="#3d6b35" />
            <ellipse cx="28" cy="92" rx="20" ry="24" fill="#4a853c" />
            <ellipse cx="40" cy="90" rx="18" ry="22" fill="#5c9e4a" />
          </g>
          <g filter={`url(#${softShadow})`} opacity={isLocked ? 0.55 : 1}>
            <rect x="352" y="112" width="9" height="38" rx="2" fill="#6b4f3a" />
            <ellipse cx="356" cy="102" rx="26" ry="30" fill="#3d6b35" />
            <ellipse cx="350" cy="96" rx="18" ry="22" fill="#4a853c" />
          </g>
        </>
      )}

      {theme.decor === "meadow" && (
        <>
          <ellipse cx="108" cy="148" rx="22" ry="14" fill="#4a853c" opacity="0.9" />
          <ellipse cx="295" cy="152" rx="26" ry="15" fill="#3d6b35" opacity="0.9" />
        </>
      )}

      <SectionPlaygroundDecorUnit
        decor={theme.decor}
        accent={accent}
        locked={isLocked}
      />

      {showSwing && (
        <g opacity="0.75">
          <line
            x1="318"
            y1="155"
            x2="338"
            y2="118"
            stroke="#5c4a3a"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <line
            x1="358"
            y1="155"
            x2="338"
            y2="118"
            stroke="#5c4a3a"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <line x1="318" y1="155" x2="358" y2="155" stroke="#5c4a3a" strokeWidth="2" />
          <line x1="338" y1="118" x2="338" y2="138" stroke="#6b5a48" strokeWidth="1.5" />
          <rect x="332" y="136" width="12" height="4" rx="1" fill={accent} opacity="0.7" />
        </g>
      )}

      {!isLocked && theme.decor === "meadow" && (
        <g>
          <circle cx="88" cy="162" r="3" fill="#f472b6" />
          <line x1="88" y1="165" x2="88" y2="172" stroke="#4a853c" strokeWidth="1.2" />
          <circle cx="125" cy="168" r="2.5" fill="#fbbf24" />
          <circle cx="272" cy="165" r="3" fill="#c084fc" />
          <circle cx="185" cy="175" r="2" fill="#fff" stroke={accent} strokeWidth="0.8" />
        </g>
      )}

      <ellipse cx="200" cy="115" rx="88" ry="65" fill="#fff" opacity="0.05" />
    </svg>
  );
}
