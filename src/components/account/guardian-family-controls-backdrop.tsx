"use client";

import guardian from "./guardian-family-controls.module.css";

/** Soft static backdrop — no floating emojis or grid motion. */
export function GuardianFamilyControlsBackdrop() {
  return (
    <div className={guardian.world} aria-hidden>
      <div className={guardian.auroraA} />
      <div className={guardian.auroraB} />
    </div>
  );
}
