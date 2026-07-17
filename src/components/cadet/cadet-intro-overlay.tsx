"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { getCadetIntroVideoSrc } from "@/lib/media/cdn-video";
import {
  markCadetIntroVideoSeen,
  placementNextPathForWorld,
  setPendingWorldSlug,
} from "@/lib/onboarding/cadet-progress";

type Props = {
  worldSlug: string;
  onClose?: () => void;
};

/**
 * Full-screen first-time cadet intro.
 * When the video ends (or Skip), fade to black → placement assessment.
 */
export function CadetIntroOverlay({ worldSlug, onClose }: Props) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [fading, setFading] = useState(false);
  const finishingRef = useRef(false);

  const finishToAssessment = useCallback(() => {
    if (finishingRef.current) return;
    finishingRef.current = true;

    markCadetIntroVideoSeen();
    setPendingWorldSlug(worldSlug);
    setFading(true);

    window.setTimeout(() => {
      router.push(placementNextPathForWorld(worldSlug));
      onClose?.();
    }, 900);
  }, [onClose, router, worldSlug]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const play = async () => {
      try {
        await el.play();
      } catch {
        /* autoplay blocked — user can press play / Skip */
      }
    };
    void play();
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Cadet introduction"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        background: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <video
        ref={videoRef}
        src={getCadetIntroVideoSrc()}
        playsInline
        controls
        onEnded={finishToAssessment}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          background: "#000",
          opacity: fading ? 0 : 1,
          transition: "opacity 0.85s ease",
        }}
      />

      <button
        type="button"
        onClick={finishToAssessment}
        className="font-nunito"
        style={{
          position: "absolute",
          top: "1.1rem",
          right: "1.1rem",
          zIndex: 2,
          padding: "0.65rem 1.15rem",
          borderRadius: "999px",
          border: "1px solid rgba(255,255,255,0.35)",
          background: "rgba(0,0,0,0.55)",
          color: "#fff",
          fontWeight: 800,
          cursor: "pointer",
          backdropFilter: "blur(6px)",
        }}
      >
        Skip intro →
      </button>

      {/* Fade-to-black curtain */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: "#000",
          opacity: fading ? 1 : 0,
          transition: "opacity 0.85s ease",
          pointerEvents: fading ? "auto" : "none",
        }}
      />
    </div>
  );
}
