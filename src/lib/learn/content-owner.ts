import type { PlaybackOwner } from "@/lib/learn/persist-playback";

/** Prefer signed-in learner over guest when resolving storage owner. */
export function resolveContentOwner(
  learnerId: string | null | undefined,
  guestSessionId: string | null | undefined,
): PlaybackOwner | null {
  const learner = learnerId?.trim() || null;
  const guest = guestSessionId?.trim() || null;
  if (learner) return { learnerId: learner, guestSessionId: null };
  if (guest) return { learnerId: null, guestSessionId: guest };
  return null;
}

export function ownerUserId(owner: PlaybackOwner): string {
  return owner.learnerId ?? owner.guestSessionId!;
}

export function ownerUserType(owner: PlaybackOwner): "learner" | "guest" {
  return owner.learnerId ? "learner" : "guest";
}

export function withDetailsUserId(
  details: Record<string, unknown>,
  owner: PlaybackOwner,
): Record<string, unknown> {
  const userId = ownerUserId(owner);
  return { ...details, userId };
}

export type ContentSavedPayload = {
  userId: string;
  userType: "learner" | "guest";
  classroomId: string;
  ladderStep: string;
  sceneIndex: number;
  currentSceneId: string | null;
  playbackCompleted: boolean;
  status: string;
  updatedAt: string;
};

export function buildContentSavedPayload(
  owner: PlaybackOwner,
  input: {
    classroomId: string;
    ladderStep: string;
    sceneIndex: number;
    currentSceneId: string | null;
    playbackCompleted: boolean;
    status: string;
    updatedAt: string;
  },
): ContentSavedPayload {
  return {
    userId: ownerUserId(owner),
    userType: ownerUserType(owner),
    classroomId: input.classroomId,
    ladderStep: input.ladderStep,
    sceneIndex: input.sceneIndex,
    currentSceneId: input.currentSceneId,
    playbackCompleted: input.playbackCompleted,
    status: input.status,
    updatedAt: input.updatedAt,
  };
}
