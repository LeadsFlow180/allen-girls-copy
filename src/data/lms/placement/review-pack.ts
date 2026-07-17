import { placementMissionBriefing } from "./mission-briefing";
import { placementOpeningStoryboard } from "./storyboard";

export type ShotApprovalStatus =
  | "ready_for_owner_review"
  | "character_lock_ok"
  | "needs_consistency_fix"
  | "approved"
  | "rejected";

export type PlacementOpeningReviewShot = {
  shotNumber: number;
  id: string;
  timecode: string;
  title: string;
  durationSeconds: number;
  imageFile: string;
  /** Relative to src/assets/storyboard-review */
  imagePath: string;
  description: string;
  framing: string;
  action: string;
  camera: string;
  emotionalIntent: string;
  dialogue: Array<{
    speaker: string;
    voiceover: string;
    caption: string;
  }>;
  approvalStatus: ShotApprovalStatus;
  reviewNote: string;
};

function linesFor(scriptLineIds: string[]) {
  return scriptLineIds.map((id) => {
    const line = placementMissionBriefing.find((entry) => entry.id === id);
    if (!line) {
      return {
        speaker: "unknown",
        voiceover: `(Missing script line: ${id})`,
        caption: "",
      };
    }
    return {
      speaker: line.speaker,
      voiceover: line.voiceover,
      caption: line.caption,
    };
  });
}

const imageByShotId: Record<string, { file: string; status: ShotApprovalStatus; note: string }> = {
  "shot-01-stone-signal": {
    file: "shot-01-stone-signal.png",
    status: "approved",
    note: "OWNER APPROVED 2026-07-15 with full opening storyboard pack.",
  },
  "shot-02-army-advance": {
    file: "shot-02-army-advance.png",
    status: "approved",
    note: "OWNER APPROVED 2026-07-15: Sunset conquest legion; Kalhor front matched to locked turnaround / Lieutenant-FINAL.",
  },
  "shot-03-kalhor-order": {
    file: "shot-03-kalhor-order.png",
    status: "approved",
    note: "OWNER APPROVED 2026-07-15: Kalhor holds holographic worlds. Backup: shot-03-kalhor-order-WORLDS-BACKUP.png.",
  },
  "shot-04-world-search": {
    file: "shot-04-world-search.png",
    status: "approved",
    note: "OWNER APPROVED 2026-07-15 with full opening storyboard pack.",
  },
  "shot-05-command-alert": {
    file: "shot-05-command-alert.png",
    status: "approved",
    note: "OWNER APPROVED 2026-07-15: Carter look A (high bun).",
  },
  "shot-06-carter-briefing": {
    file: "shot-06-carter-briefing.png",
    status: "approved",
    note: "OWNER APPROVED 2026-07-15: Carter look B (braids/ponytail).",
  },
  "shot-07-spark-entrance": {
    file: "shot-07-spark-entrance.png",
    status: "approved",
    note: "OWNER APPROVED 2026-07-15: SPARK-Exact facing forward.",
  },
  "shot-08-scan-ready": {
    file: "shot-08-scan-ready.png",
    status: "approved",
    note: "OWNER APPROVED 2026-07-15: SPARK matched to Shot 7 / SPARK-Exact; Start Mission scene.",
  },
};

export const placementOpeningReviewPack = {
  title: placementOpeningStoryboard.title,
  estimatedDurationSeconds: placementOpeningStoryboard.estimatedDurationSeconds,
  ownerApproval: {
    status: "approved" as const,
    approvedDate: "2026-07-15",
    note: "Owner approved the updated opening storyboard pack as good to go. Stills are locked for voiceover and video production; finished video must be CDN-hosted only.",
  },
  purpose:
    "Owner-approved keyframe package for the placement opener. Use these stills as the visual lock before spending video credits.",
  videoHostingRule:
    "When rendered, store the finished clip on CDN/object storage only. The app keeps a short URL via src/lib/media/cdn-video.ts.",
  shots: placementOpeningStoryboard.shots.map((shot, index): PlacementOpeningReviewShot => {
    const meta = imageByShotId[shot.id] ?? {
      file: `${shot.id}.png`,
      status: "ready_for_owner_review" as const,
      note: "Keyframe pending review.",
    };
    return {
      shotNumber: index + 1,
      id: shot.id,
      timecode: shot.timecode,
      title: shot.title,
      durationSeconds: shot.durationSeconds,
      imageFile: meta.file,
      imagePath: `src/assets/storyboard-review/${meta.file}`,
      description: `${shot.emotionalIntent} ${shot.action}`,
      framing: shot.framing,
      action: shot.action,
      camera: shot.camera,
      emotionalIntent: shot.emotionalIntent,
      dialogue: linesFor([...shot.scriptLineIds]),
      approvalStatus: meta.status,
      reviewNote: meta.note,
    };
  }),
} as const;
