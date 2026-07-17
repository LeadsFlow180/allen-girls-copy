/**
 * Animation-ready storyboard for Seedance 2.0.
 *
 * The owner-approved images remain unchanged. Longer dialogue scenes are split
 * into multiple moving beats so the final opener never freezes while voices play.
 */

export type SeedanceStoryboardBeat = {
  id: string;
  sourceImage: string;
  durationSeconds: 5 | 10;
  voiceoverFile: string | null;
  prompt: string;
};

const visualLock =
  "Cinematic stylized 3D family-adventure animation. Match the approved source image exactly: preserve every character's face, body proportions, clothing or armor, colors, props, environment, and composition. Natural dimensional movement with stable geometry. Child-safe. No redesign, morphing, extra limbs, duplicate characters, new text, captions, watermark, shaky camera, rapid flashing, gore, or horror.";

export const placementSeedanceStoryboard: SeedanceStoryboardBeat[] = [
  {
    id: "seedance-01-stone-awakens",
    sourceImage: "shot-01-stone-signal.png",
    durationSeconds: 5,
    voiceoverFile: "01-system-priority-alert.wav",
    prompt: `${visualLock} Hold briefly, then slowly push toward the Astral Realm Stone. A controlled cyan, gold, and violet pulse travels through it. The nine world symbols illuminate one after another and settle into a powerful glow. Cosmic particles drift subtly around the Stone.`,
  },
  {
    id: "seedance-02-army-halts",
    sourceImage: "shot-02-army-advance.png",
    durationSeconds: 5,
    voiceoverFile: null,
    prompt: `${visualLock} Low-angle conquest shot. Lieutenant Kalhor advances two deliberate steps ahead of his spaced legion, then raises one fist. Every soldier halts together on the same sharp beat. Dust, armor plates, banners, and weapon straps settle naturally. Keep Kalhor clearly isolated as the leader.`,
  },
  {
    id: "seedance-03-kalhor-order",
    sourceImage: "shot-03-kalhor-order.png",
    durationSeconds: 10,
    voiceoverFile: "02-kalhor-order.wav",
    prompt: `${visualLock} Very slow restrained push toward Lieutenant Kalhor. He begins with a closed fist, pauses with cold certainty, then deliberately opens his hand toward the holographic nine worlds. His armor settles subtly while distant soldiers prepare behind him. Keep his performance controlled rather than shouting.`,
  },
  {
    id: "seedance-04-search-begins",
    sourceImage: "shot-04-world-search.png",
    durationSeconds: 5,
    voiceoverFile: null,
    prompt: `${visualLock} One smooth left-to-right deployment move. Aerial carriers bank in broad arcs toward glowing portals while ground units fan out in organized paths. Dust, banners, and armor trail their acceleration. Show three fast but readable world-deployment beats with no civilians or combat.`,
  },
  {
    id: "seedance-05-command-responds",
    sourceImage: "shot-05-command-alert.png",
    durationSeconds: 5,
    voiceoverFile: null,
    prompt: `${visualLock} Descending cinematic crane move settles at Commander Carter's eye level. Command-deck displays wake in sequence, the circular Stone display brightens, and Carter steps confidently onto the central platform. Blue and gold holographic light moves softly across the room.`,
  },
  {
    id: "seedance-06a-carter-stakes",
    sourceImage: "shot-06-carter-briefing.png",
    durationSeconds: 10,
    voiceoverFile: "03-carter-welcome.wav",
    prompt: `${visualLock} Warm medium shot of Commander Carter speaking directly to the cadet with calm authority. Use natural mouth movement and restrained hand gestures. The Astral Realm Stone and nine-world threat map rotate slowly beside her. Gentle camera push; keep her face and uniform exact.`,
  },
  {
    id: "seedance-06b-carter-plan",
    sourceImage: "shot-06-carter-briefing.png",
    durationSeconds: 10,
    voiceoverFile: "04-carter-purpose.wav",
    prompt: `${visualLock} Continue Commander Carter's briefing with natural speaking motion. She turns toward the hologram and calmly reorganizes the dangerous nine-world map into two clear training systems: communication and navigation. Her hand settles first, then the interface completes its transformation. Hopeful, reassuring rhythm.`,
  },
  {
    id: "seedance-06c-carter-handoff",
    sourceImage: "shot-06-carter-briefing.png",
    durationSeconds: 5,
    voiceoverFile: null,
    prompt: `${visualLock} Carter completes her explanation, lowers her hand, and turns her attention toward an approaching teammate just off frame. The two training-system holograms remain stable and readable. A small wheel shadow and cyan antenna glow sweep across the bottom edge to motivate the next cut.`,
  },
  {
    id: "seedance-07-spark-arrives",
    sourceImage: "shot-07-spark-entrance.png",
    durationSeconds: 5,
    voiceoverFile: null,
    prompt: `${visualLock} S.P.A.R.K. rolls quickly around the console on a clean curved path, performs a playful controlled half-turn, brakes with subtle mechanical compression, and faces the cadet. His antenna and arms settle one beat after his wheels stop. End in a warm open pose with exact robot proportions.`,
  },
  {
    id: "seedance-08a-scan-intro",
    sourceImage: "shot-08-scan-ready.png",
    durationSeconds: 10,
    voiceoverFile: "05-spark-scan-intro.wav",
    prompt: `${visualLock} Locked camera for reading comfort. S.P.A.R.K. speaks with friendly natural face-screen expressions, small arm gestures, and gentle antenna tilts. Communication and navigation icons pulse softly one at a time. Keep the scan card solid and stable; do not generate readable text.`,
  },
  {
    id: "seedance-08b-ready",
    sourceImage: "shot-08-scan-ready.png",
    durationSeconds: 5,
    voiceoverFile: null,
    prompt: `${visualLock} S.P.A.R.K. finishes speaking, gives a small encouraging nod, and settles beside the scan interface. One soft confirmation pulse travels through both system icons and ends at the Start Mission area. All movement comes to rest so the cadet clearly controls when to begin.`,
  },
];

export const placementSeedanceProduction = {
  model: "seedance_2_0",
  resolution: "720p",
  aspectRatio: "16:9",
  approvedImagesReused: true,
  beatCount: placementSeedanceStoryboard.length,
  totalDurationSeconds: placementSeedanceStoryboard.reduce(
    (total, beat) => total + beat.durationSeconds,
    0,
  ),
  status: "ready_for_generation" as const,
} as const;
