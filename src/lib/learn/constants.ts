/** Single classroom used for all external lesson embeds (AI School). */
export const DEFAULT_LEARN_CLASSROOM_ID =
  process.env.NEXT_PUBLIC_LEARN_CLASSROOM_ID?.trim() ||
  process.env.AI_SCHOOL_DEFAULT_CLASSROOM_ID?.trim() ||
  "l4gHC6hvRo";

export const LEARN_GUEST_SESSION_STORAGE_KEY = "learn.guestSessionId";

/** Slides inside one classroom session (AI School reports scene_index 0..N-1). */
export const SLIDES_PER_CLASSROOM =
  Number(process.env.NEXT_PUBLIC_LEARN_SLIDES_PER_CLASSROOM) || 5;

/** Ladder nodes per unit — each node = one full classroom completion. */
export const LADDER_STEPS_PER_UNIT = 5;

/** Default units per section on Explore (bundled curriculum). */
export const DEFAULT_UNITS_PER_SECTION = 10;
