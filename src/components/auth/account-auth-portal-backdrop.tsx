"use client";

import guardian from "@/components/account/guardian-family-controls.module.css";

import styles from "./account-auth.module.css";

/** Cinematic background for /account/login and /account/signup. */
export function AccountAuthPortalBackdrop() {
  return (
    <div className={guardian.world} aria-hidden>
      <div className={guardian.auroraA} />
      <div className={guardian.auroraB} />
      <div className={guardian.hexGrid} />
      <div className={guardian.scanlines} />

      {[
        { cls: guardian.star1, delay: "0s" },
        { cls: guardian.star2, delay: "-0.5s" },
        { cls: guardian.star3, delay: "-1s" },
        { cls: guardian.star4, delay: "-1.4s" },
      ].map((s, i) => (
        <span key={i} className={`${guardian.star} ${s.cls}`} style={{ animationDelay: s.delay }} />
      ))}

      <span className={`${guardian.orb} ${guardian.orbViolet}`} />
      <span className={`${guardian.orb} ${guardian.orbGold}`} />

      <span className={styles.floatKey} aria-hidden>
        🔑
      </span>
      <span className={styles.floatBackpack} aria-hidden>
        🎒
      </span>
      <span className={styles.floatSpark} aria-hidden>
        ✨
      </span>
    </div>
  );
}
