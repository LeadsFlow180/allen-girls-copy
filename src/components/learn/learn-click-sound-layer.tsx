"use client";

import { useEffect, useRef, type ReactNode } from "react";
import {
  playUiClick,
  resolveClickSoundTarget,
  soundVariantFromElement,
  warmUpUiAudio,
} from "@/lib/sound/ui-click-sound";

type LearnClickSoundLayerProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Plays a tap on button clicks inside the learn shell (capture phase).
 */
export function LearnClickSoundLayer({
  children,
  className,
}: LearnClickSoundLayerProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const onClick = (event: MouseEvent) => {
      if (event.button !== 0) return;

      const el = resolveClickSoundTarget(event.target);
      if (!el || !root.contains(el)) return;

      warmUpUiAudio();
      playUiClick(soundVariantFromElement(el));
    };

    root.addEventListener("click", onClick, true);

    return () => {
      root.removeEventListener("click", onClick, true);
    };
  }, []);

  return (
    <div ref={rootRef} className={className}>
      {children}
    </div>
  );
}
