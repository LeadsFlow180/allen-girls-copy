import styles from "@/app/parent/family.module.css";

const STEPS = [
  {
    title: "Create a profile",
    text: "Set display name, sign-in email, and password from Family Controls.",
  },
  {
    title: "Child signs in",
    text: "Each learner uses their own email and password at Account → Learner.",
  },
  {
    title: "Track progress",
    text: "Slides, quizzes, placement, and rewards appear on your Progress dashboard.",
  },
] as const;

export function FamilyPathway() {
  return (
    <div className={styles.pathway} aria-label="How family accounts work">
      {STEPS.map((step, index) => (
        <div key={step.title} className={styles.pathStep}>
          <span className={styles.pathNum}>{index + 1}</span>
          <p className={styles.pathTitle}>{step.title}</p>
          <p className={styles.pathText}>{step.text}</p>
        </div>
      ))}
    </div>
  );
}
