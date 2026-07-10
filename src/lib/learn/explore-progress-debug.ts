/** Dev-only console helpers to verify whose progress Explore is loading. */

const PREFIX = "[Explore progress check]";

export type ExploreProgressDebugPayload = {
  signedIn: boolean;
  authUserId: string | null;
  authEmail: string | null;
  profileRole: string | null;
  profileDisplayName: string | null;
  ownerMode: "learner_id" | "guest_session_id" | "none";
  ownerId: string | null;
  localGuestSessionId: string | null;
  apiStudentsOnly?: boolean;
  rowLearnerId: string | null;
  rowGuestSessionId: string | null;
  sectionPercent: number;
  currentUnit: number;
  currentStep: number;
  completedStepsByUnit: Record<number, number>;
  stepProgressKeyCount: number;
};

export function logExploreProgressCheck(
  payload: ExploreProgressDebugPayload,
): void {
  if (process.env.NODE_ENV === "production") return;

  console.groupCollapsed(PREFIX);
  console.log("Who is signed in & which cloud row was used:");
  console.table({
    "Auth user id": payload.authUserId ?? "—",
    "Auth email": payload.authEmail ?? "—",
    "Profile role": payload.profileRole ?? "—",
    "Display name": payload.profileDisplayName ?? "—",
    "Progress owner mode": payload.ownerMode,
    "Progress owner id": payload.ownerId ?? "—",
    "localStorage guest id (ignored when signed in)":
      payload.localGuestSessionId ?? "—",
  });
  console.table({
    "API studentsOnly (parent blocked)": payload.apiStudentsOnly ?? false,
    "DB row learner_id": payload.rowLearnerId ?? "—",
    "DB row guest_session_id": payload.rowGuestSessionId ?? "—",
    "Section %": payload.sectionPercent,
    "Current unit (0-based)": payload.currentUnit,
    "Current step (0-based)": payload.currentStep,
    "stepProgress keys": payload.stepProgressKeyCount,
  });
  if (Object.keys(payload.completedStepsByUnit).length > 0) {
    console.log("Completed ladder steps per unit:", payload.completedStepsByUnit);
  }
  console.groupEnd();
}
