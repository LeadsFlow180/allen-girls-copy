import studio from "./learner-account-studio.module.css";

/** Subtle brand backdrop for learner account — no motion clutter. */
export function LearnerAccountBackdrop() {
  return <div className={studio.backdrop} aria-hidden />;
}
