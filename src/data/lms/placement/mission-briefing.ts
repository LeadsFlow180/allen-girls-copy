/**
 * Nova Star Command placement briefing.
 *
 * Canon rules:
 * - Nova Star Command is a gateway, training, and mission-control hub.
 * - Owner-approved canon (2026-07-14): the Astral Realm Stone can save or
 *   destroy all nine worlds. Lieutenant Kalhor ("Kal-whore"), his unnamed
 *   Master, and their armies are hunting it.
 * - S.P.A.R.K. is Earth-engineered and acts as a thinking coach.
 * - Child-facing language uses mission bands, never shame or failure.
 * - A child's real name must not be sent to an AI or prerecorded voice service.
 *
 * This file is a production script, not assessment logic. Question routing and
 * grade-band decisions remain blocked until the authoritative placement source
 * documents and educator-approved rules are available.
 */

import { astralRealmStoneCanon } from "../../canon/astral-realm-stone";

export type PlacementBriefingSpeaker =
  | "commander_carter"
  | "lieutenant_kalhor"
  | "spark"
  | "nova_system";

export type PlacementBriefingSceneId =
  | "threat_prologue"
  | "command_arrival"
  | "scan_briefing"
  | "ela_transition"
  | "math_transition"
  | "results_processing"
  | "mission_assignment";

export interface PlacementBriefingLine {
  id: string;
  scene: PlacementBriefingSceneId;
  speaker: PlacementBriefingSpeaker;
  /** Direction for voice casting and performance; never spoken aloud. */
  delivery: string;
  /** Generic prerecorded voiceover. Personalization stays in local on-screen text. */
  voiceover: string;
  /** Caption shown with the voiceover. */
  caption: string;
  visualCue: string;
}

export const placementSpeakerNotes: Record<
  PlacementBriefingSpeaker,
  { displayName: string; voiceDirection: string }
> = {
  commander_carter: {
    displayName: "Commander Aaliyah Carter",
    voiceDirection:
      "Warm, calm command authority. Firm without sounding military or severe. Medium pace.",
  },
  lieutenant_kalhor: {
    displayName: astralRealmStoneCanon.antagonists.lieutenant.name,
    voiceDirection:
      `Pronounced “${astralRealmStoneCanon.antagonists.lieutenant.pronunciation}.” Deep, controlled, and ruthless. He does not shout; certainty makes him threatening.`,
  },
  spark: {
    displayName: "S.P.A.R.K.",
    voiceDirection:
      "Bright, curious, nerdy, and lightly witty. Protective teammate—not a servant or answer machine.",
  },
  nova_system: {
    displayName: "Nova Star Command",
    voiceDirection:
      "Short, neutral system confirmations. Clear and friendly; never ominous.",
  },
};

export const placementMissionBriefing: PlacementBriefingLine[] = [
  {
    id: "system-priority-alert",
    scene: "threat_prologue",
    speaker: "nova_system",
    delivery: "Urgent but composed; a command-center alert, not a horror cue.",
    voiceover: "Priority alert. Astral Realm Stone signal detected.",
    caption: "PRIORITY ALERT · ASTRAL REALM STONE SIGNAL DETECTED",
    visualCue:
      "Begin on the approved Astral Realm Stone reference. Its world symbols illuminate as the command-deck displays come online.",
  },
  {
    id: "kalhor-order",
    scene: "threat_prologue",
    speaker: "lieutenant_kalhor",
    delivery: "Cold, quiet command. Pause after “Stone.”",
    voiceover:
      "Find the Stone. Search every world. Nothing will stand between my Master and absolute control.",
    caption:
      "“Find the Stone. Search every world.” — Lieutenant Kalhor",
    visualCue:
      "Cut between the approved Kalhor close-up, full-body reference, and soldier turnarounds. Keep the unnamed Master off-screen.",
  },
  {
    id: "carter-welcome",
    scene: "command_arrival",
    speaker: "commander_carter",
    delivery: "Welcoming a capable new recruit; measured and reassuring.",
    voiceover:
      "The Allen Girls have discovered the Astral Realm Stone. In the right hands, it can save all nine worlds. In the wrong hands, it can destroy them.",
    caption:
      "The Astral Realm Stone can save—or destroy—all nine worlds.",
    visualCue:
      "Open on the command-deck reference image. Use a slow push toward the central platform; keep unconfirmed crew identities in the background.",
  },
  {
    id: "carter-purpose",
    scene: "command_arrival",
    speaker: "commander_carter",
    delivery: "Direct and kind; emphasize that this is preparation, not judgment.",
    voiceover:
      "Kalhor and his armies are already searching. You and the Allen Girls can help protect the Stone—but first, we need to learn how you solve different kinds of challenges. S.P.A.R.K. will guide your Signal Clarity Scan.",
    caption:
      "Help the Allen Girls protect the Stone. Complete the Signal Clarity Scan to receive your mission path.",
    visualCue:
      "The Stone rotates above the central console as nine world symbols orbit it. Transition from the threat into the bright cadet-training interface.",
  },
  {
    id: "spark-scan-intro",
    scene: "scan_briefing",
    speaker: "spark",
    delivery: "Nerdy enthusiasm with a small smile in the final sentence.",
    voiceover:
      "Cadet, I’ll check two systems: communication and navigation. This is not pass or fail, and it is not a race. Your answers help us choose the right training for each subject. Ready? Let’s make the data sparkle.",
    caption:
      "I’ll check communication and navigation systems. This is not pass or fail, and it is not a race.",
    visualCue:
      "Reveal S.P.A.R.K. using the approved blue-and-yellow design. His antenna ring pulses cyan; no alien transformation or new powers.",
  },
  {
    id: "system-ela-ready",
    scene: "ela_transition",
    speaker: "nova_system",
    delivery: "Brief, friendly confirmation.",
    voiceover: "Communication systems ready.",
    caption: "Communication systems ready",
    visualCue:
      "Shift the mission card accent to purple. Keep the question surface solid and still for reading comfort.",
  },
  {
    id: "spark-ela-guidance",
    scene: "ela_transition",
    speaker: "spark",
    delivery: "Quiet coaching; no pressure.",
    voiceover:
      "Read carefully and choose the answer that makes the most sense. If one signal feels tricky, that only tells us where training can help.",
    caption:
      "Read carefully. A tricky signal simply helps us choose useful training.",
    visualCue:
      "S.P.A.R.K. docks beside the card as a small comms portrait. He does not point to an answer.",
  },
  {
    id: "system-math-ready",
    scene: "math_transition",
    speaker: "nova_system",
    delivery: "Brief, friendly confirmation.",
    voiceover: "Navigation systems ready.",
    caption: "Navigation systems ready",
    visualCue:
      "Shift the mission card accent to green. Show a calm star-map grid behind the solid question card.",
  },
  {
    id: "spark-math-guidance",
    scene: "math_transition",
    speaker: "spark",
    delivery: "Encouraging and matter-of-fact.",
    voiceover:
      "Use any strategy that helps you think. The goal is not speed. I’m looking for the clearest starting point for your math missions.",
    caption:
      "Use any strategy that helps you think. The goal is not speed.",
    visualCue:
      "Display navigation lines and coordinates as decoration only. Do not animate behind the problem text.",
  },
  {
    id: "spark-processing",
    scene: "results_processing",
    speaker: "spark",
    delivery: "Playful technical confidence; short enough to mask processing.",
    voiceover:
      "Signal scan complete. Sorting strengths, support systems, and the best next challenges. Very tidy data, if I may say so.",
    caption: "Signal scan complete. Preparing your mission bands…",
    visualCue:
      "Use a brief Astral Realm Stone symbol-alignment animation while local scoring and the debrief load. No spinner labeled grading.",
  },
  {
    id: "carter-assignment",
    scene: "mission_assignment",
    speaker: "commander_carter",
    delivery: "Celebratory but grounded; every result is a valid beginning.",
    voiceover:
      "Your mission bands are ready. Reading and math may begin at different levels—that is exactly why we scan them separately. Your path will adjust as you learn.",
    caption:
      "Reading and math may begin at different mission bands. Your path will adjust as you learn.",
    visualCue:
      "Reveal two separate mission-band cards, then transition to the circulating worlds. Do not combine the subjects into one child-facing score.",
  },
  {
    id: "spark-launch",
    scene: "mission_assignment",
    speaker: "spark",
    delivery: "Excited, warm, and concise.",
    voiceover:
      "Clearance confirmed. Pick a world, Cadet. I’ll bring the field notes.",
    caption: "Clearance confirmed. Choose your first world.",
    visualCue:
      "End on the world-map transition. S.P.A.R.K. remains a teammate and guide, not the decision-maker.",
  },
];

