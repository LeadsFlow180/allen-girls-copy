import educator from "./teacher-educator.module.css";

export function TeacherEducatorBackdrop() {
  return (
    <div className={educator.world} aria-hidden>
      <div className={educator.auroraA} />
      <div className={educator.auroraB} />
      <div className={educator.grid} />
    </div>
  );
}
