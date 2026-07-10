"use client";

/** Subtle ambient backdrop for the reader — no busy imagery. */
export function LibraryEnvironment() {
  return (
    <div className="lib-env" aria-hidden>
      <div className="lib-env-ambient" />
    </div>
  );
}
