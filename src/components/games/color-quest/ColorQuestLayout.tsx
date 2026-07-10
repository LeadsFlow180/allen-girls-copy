import type { ReactNode } from "react";

// Fixed star positions/opacities so server and client render the same (avoids hydration mismatch)
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

interface ColorQuestLayoutProps {
  badge?: string;
  title: string;
  subtitle?: string;
  sparkMessage: ReactNode;
  progressPercent: number;
  isComplete: boolean;
  rightAside: ReactNode;
  children: ReactNode;
}

export function ColorQuestLayout({
  badge = "Game Zone",
  title,
  subtitle,
  sparkMessage,
  progressPercent,
  isComplete,
  rightAside,
  children,
}: ColorQuestLayoutProps) {
  return (
    <div
      className="font-nunito"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1a0533 0%, #2d1060 40%, #0d2060 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "16px",
        position: "relative",
        overflow: "hidden",
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
          {title}
        </h1>
        {subtitle ? (
          <p style={{ color: "#c4b5fd", fontSize: 14, marginTop: 4 }}>{subtitle}</p>
        ) : null}
      </div>

      {/* S.P.A.R.K. message */}
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
        <span style={{ fontWeight: 700, color: "#c084fc" }}>S.P.A.R.K.:</span> {sparkMessage}
      </div>

      {/* Progress bar */}
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
          <span>{progressPercent}%</span>
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
              width: `${progressPercent}%`,
            }}
          />
        </div>
      </div>

      {/* Main layout: canvas + sidebar */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 16,
          justifyContent: "center",
          alignItems: "flex-start",
          zIndex: 1,
          width: "100%",
          maxWidth: 900,
        }}
      >
        <div style={{ flex: "1 1 320px", minWidth: 0 }}>{children}</div>
        <div style={{ flex: "0 0 auto", minWidth: 200 }}>{rightAside}</div>
      </div>
    </div>
  );
}
