/**
 * Assembled placement opener (picture + owner-approved VOs + burned captions).
 * Local preview file only — finished delivery must be CDN-hosted.
 */

export const placementOpeningAssembly = {
  title: "The Signal and the Stone",
  assembledDate: "2026-07-15",
  status: "ready_for_owner_review" as const,
  localFile: "src/assets/videos/placement-opening/the-signal-and-the-stone-with-vo.mp4",
  watchPage: "src/assets/videos/placement-opening/WATCH-ASSEMBLED-OPENER.html",
  durationSeconds: 73.29,
  model: "kling3_0_turbo",
  voiceovers: "owner_approved",
  stills: "owner_approved",
  notes: [
    "Clips padded with freeze-frame where VO is longer than the 5s animated clip (shots 3, 6, 8).",
    "Original generated clip audio muted; only approved WAVs are mixed in.",
    "Captions burned from mission-briefing caption text.",
    "CDN URL stays empty until owner locks this cut.",
  ],
  timeline: [
    { shot: 1, startSeconds: 0.0, voiceover: "01-system-priority-alert.wav" },
    { shot: 2, startSeconds: 5.04, voiceover: null },
    { shot: 3, startSeconds: 10.08, voiceover: "02-kalhor-order.wav" },
    { shot: 4, startSeconds: 19.13, voiceover: null },
    { shot: 5, startSeconds: 24.17, voiceover: null },
    {
      shot: 6,
      startSeconds: 29.21,
      voiceover: ["03-carter-welcome.wav", "04-carter-purpose.wav"],
    },
    { shot: 7, startSeconds: 54.21, voiceover: null },
    { shot: 8, startSeconds: 59.25, voiceover: "05-spark-scan-intro.wav" },
  ],
  cdnUrl: null as string | null,
} as const;
