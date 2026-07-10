"use client";

import learner from "./learner-adventure-hub.module.css";

/** Playful animated sky for learner Adventure HQ. */
export function LearnerAdventureHubBackdrop() {
  return (
    <div className={learner.world} aria-hidden>
      <div className={learner.sun} />
      <div className={`${learner.cloud} ${learner.cloudA}`} />
      <div className={`${learner.cloud} ${learner.cloudB}`} />
      <div className={`${learner.cloud} ${learner.cloudC}`} />

      {[
        { cls: learner.spark1, glyph: "✨" },
        { cls: learner.spark2, glyph: "⭐" },
        { cls: learner.spark3, glyph: "💫" },
        { cls: learner.spark4, glyph: "✨" },
        { cls: learner.spark5, glyph: "🌟" },
      ].map((s, i) => (
        <span key={i} className={`${learner.spark} ${s.cls}`} aria-hidden>
          {s.glyph}
        </span>
      ))}

      <span className={`${learner.bubble} ${learner.bubble1}`} />
      <span className={`${learner.bubble} ${learner.bubble2}`} />
      <span className={`${learner.bubble} ${learner.bubble3}`} />

      <span className={learner.floatButterfly}>🦋</span>
      <span className={learner.floatStar}>⭐</span>
      <span className={learner.floatGem}>💎</span>
    </div>
  );
}
