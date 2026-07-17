/**
 * Placement opener video clips animated from owner-approved storyboard stills.
 * Finished assembled opener should be CDN-hosted (see src/lib/media/cdn-video.ts).
 */

export type OpeningVideoClip = {
  id: string;
  shotId: string;
  title: string;
  startImageFile: string;
  jobId: string;
  remoteUrl: string | null;
  localFile: string | null;
  status: "queued" | "generated" | "owner_approved" | "failed";
  notes: string;
};

export const placementOpeningVideos: OpeningVideoClip[] = [
  {
    id: "vid-shot-01",
    shotId: "shot-01-stone-signal",
    title: "The Stone Awakens",
    startImageFile: "shot-01-stone-signal.png",
    jobId: "69c49f0f-1c2a-4aca-905b-9bb27cd64c31",
    remoteUrl:
      "https://d8j0ntlcm91z4.cloudfront.net/user_36WhJm9G1dLQpS5pEP9lbzca22L/hf_20260715_142433_69c49f0f-1c2a-4aca-905b-9bb27cd64c31.mp4",
    localFile: "src/assets/videos/placement-opening/shot-01-stone-signal.mp4",
    status: "generated",
    notes: "Image-to-video from approved Shot 1 still; Nova system VO overlays in assembly.",
  },
  {
    id: "vid-shot-02",
    shotId: "shot-02-army-advance",
    title: "The Conqueror's Army",
    startImageFile: "shot-02-army-advance.png",
    jobId: "7c7f37da-d7de-4479-8412-8f2508e6af0e",
    remoteUrl:
      "https://d8j0ntlcm91z4.cloudfront.net/user_36WhJm9G1dLQpS5pEP9lbzca22L/hf_20260715_142734_7c7f37da-d7de-4479-8412-8f2508e6af0e.mp4",
    localFile: "src/assets/videos/placement-opening/shot-02-army-advance.mp4",
    status: "generated",
    notes: "Image-to-video from approved Shot 2 still.",
  },
  {
    id: "vid-shot-03",
    shotId: "shot-03-kalhor-order",
    title: "Kalhor's Order",
    startImageFile: "shot-03-kalhor-order.png",
    jobId: "68c44a5d-e173-42e4-b9fb-827b5da5b850",
    remoteUrl:
      "https://d8j0ntlcm91z4.cloudfront.net/user_36WhJm9G1dLQpS5pEP9lbzca22L/hf_20260715_142731_68c44a5d-e173-42e4-b9fb-827b5da5b850.mp4",
    localFile: "src/assets/videos/placement-opening/shot-03-kalhor-order.mp4",
    status: "generated",
    notes: "Image-to-video from approved Shot 3 still; Kalhor VO overlays in assembly.",
  },
  {
    id: "vid-shot-04",
    shotId: "shot-04-search-across-worlds",
    title: "The Search Begins",
    startImageFile: "shot-04-world-search.png",
    jobId: "a5c98df1-2b3b-47d4-b515-76d05e832c40",
    remoteUrl:
      "https://d8j0ntlcm91z4.cloudfront.net/user_36WhJm9G1dLQpS5pEP9lbzca22L/hf_20260715_144357_a5c98df1-2b3b-47d4-b515-76d05e832c40.mp4",
    localFile: "src/assets/videos/placement-opening/shot-04-world-search.mp4",
    status: "generated",
    notes: "Image-to-video from approved Shot 4 still.",
  },
  {
    id: "vid-shot-05",
    shotId: "shot-05-command-alert",
    title: "Nova Star Command Responds",
    startImageFile: "shot-05-command-alert.png",
    jobId: "c3789439-0332-4541-8484-2f03825e0b90",
    remoteUrl:
      "https://d8j0ntlcm91z4.cloudfront.net/user_36WhJm9G1dLQpS5pEP9lbzca22L/hf_20260715_144417_c3789439-0332-4541-8484-2f03825e0b90.mp4",
    localFile: "src/assets/videos/placement-opening/shot-05-command-alert.mp4",
    status: "generated",
    notes: "Image-to-video from approved Shot 5 still.",
  },
  {
    id: "vid-shot-06",
    shotId: "shot-06-carter-briefing",
    title: "The Cadet’s Mission",
    startImageFile: "shot-06-carter-briefing.png",
    jobId: "dce6e950-d331-4213-8942-66ad2d771899",
    remoteUrl:
      "https://d8j0ntlcm91z4.cloudfront.net/user_36WhJm9G1dLQpS5pEP9lbzca22L/hf_20260715_144823_dce6e950-d331-4213-8942-66ad2d771899.mp4",
    localFile: "src/assets/videos/placement-opening/shot-06-carter-briefing.mp4",
    status: "generated",
    notes: "5s clip; Carter VO lines overlay in assembly (full briefing ~17s).",
  },
  {
    id: "vid-shot-07",
    shotId: "shot-07-spark-action-entrance",
    title: "S.P.A.R.K. Rolls In",
    startImageFile: "shot-07-spark-entrance.png",
    jobId: "2bd63307-bbb0-4e69-8817-f670ee1466bf",
    remoteUrl:
      "https://d8j0ntlcm91z4.cloudfront.net/user_36WhJm9G1dLQpS5pEP9lbzca22L/hf_20260715_144823_2bd63307-bbb0-4e69-8817-f670ee1466bf.mp4",
    localFile: "src/assets/videos/placement-opening/shot-07-spark-entrance.mp4",
    status: "generated",
    notes: "Image-to-video from approved Shot 7 still.",
  },
  {
    id: "vid-shot-08",
    shotId: "shot-08-scan-ready",
    title: "The Signal Clarity Scan",
    startImageFile: "shot-08-scan-ready.png",
    jobId: "288f820d-a7eb-4cc7-a645-e645dbac47ce",
    remoteUrl:
      "https://d8j0ntlcm91z4.cloudfront.net/user_36WhJm9G1dLQpS5pEP9lbzca22L/hf_20260715_144824_288f820d-a7eb-4cc7-a645-e645dbac47ce.mp4",
    localFile: "src/assets/videos/placement-opening/shot-08-scan-ready.mp4",
    status: "generated",
    notes: "5s clip; Spark VO overlays in assembly (scan intro ~10s).",
  },
];

export const placementOpeningVideoManifest = {
  startedDate: "2026-07-15",
  voiceoversApproved: true,
  stillsApproved: true,
  model: "kling3_0_turbo",
  aspectRatio: "16:9",
  progress: "8 of 8 shot videos generated — ready for owner clip review",
  clips: placementOpeningVideos,
} as const;
