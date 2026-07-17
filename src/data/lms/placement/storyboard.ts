import { characterProductionCanon } from "../../canon/character-production";

export type PlacementStoryboardCharacter =
  | "astral_realm_stone"
  | "lieutenant_kalhor"
  | "kalhor_army"
  | "commander_carter"
  | "spark"
  | "nova_system";

export type AnimationPrinciple =
  | "squash_and_stretch"
  | "anticipation"
  | "staging"
  | "straight_ahead_or_pose_to_pose"
  | "follow_through_and_overlapping_action"
  | "slow_in_and_slow_out"
  | "arc"
  | "secondary_action"
  | "timing"
  | "exaggeration"
  | "solid_drawing"
  | "appeal";

export interface AnimationPrincipleApplication {
  principle: AnimationPrinciple;
  application: string;
}

export interface PlacementStoryboardShot {
  id: string;
  timecode: `${number}:${number}-${number}:${number}`;
  durationSeconds: number;
  title: string;
  characters: PlacementStoryboardCharacter[];
  scriptLineIds: string[];
  emotionalIntent: string;
  animationPrinciples: AnimationPrincipleApplication[];
  framing: string;
  action: string;
  camera: string;
  lighting: string;
  sound: string;
  transition: string;
  muteTest: string;
  reducedMotionAlternative: string;
}

/**
 * Production storyboard for the skippable placement-test opening.
 *
 * Total runtime: approximately 60 seconds. Dialogue timing may be adjusted to
 * fit the approved voice performances, but the story order must not change.
 */
export const placementOpeningStoryboard = {
  title: "The Signal and the Stone",
  estimatedDurationSeconds: 60,
  aspectRatio: "16:9",
  visualDirection: characterProductionCanon.visualDirection,
  cinematicQualityGates: {
    causeAndTest:
      "The ordinary need to understand a cadet’s learning strengths causes the extraordinary Signal Clarity Scan; every visual beat must move toward that test.",
    muteTest:
      "With dialogue muted, viewers must still understand that Kalhor wants the Stone, Carter needs help protecting it, and S.P.A.R.K. offers the cadet a safe first step.",
    motionRule:
      "Every movement must reveal intention, emotion, character, or story information.",
    geographyRule:
      "Keep screen direction, eyelines, scale, and command-deck geography consistent across cuts.",
    actionMethod:
      "Animate the choreographed action pose to pose. Allow small reactions, antenna movement, and console activity to overlap naturally.",
  },
  guardrails: [
    "Use the owner-approved character references without redesigning them.",
    "Keep the action exciting and child-safe; no gore, injuries, or horror imagery.",
    "Never show Kalhor’s unnamed Master.",
    "Keep captions visible for every spoken line.",
    "Show a Skip Scene control from the first frame.",
    "Avoid rapid flashing, shaky camera movement, and motion behind reading text.",
  ],
  shots: [
    {
      id: "shot-01-stone-signal",
      timecode: "0:00-0:04",
      durationSeconds: 4,
      title: "The Stone Awakens",
      characters: ["astral_realm_stone", "nova_system"],
      scriptLineIds: ["system-priority-alert"],
      emotionalIntent:
        "Create wonder first, then a clear feeling that something important has been detected.",
      animationPrinciples: [
        {
          principle: "anticipation",
          application:
            "Hold the Stone still for a beat before the first pulse so the awakening feels important.",
        },
        {
          principle: "slow_in_and_slow_out",
          application:
            "Ease the camera into the push and let the final symbol glow linger.",
        },
        {
          principle: "appeal",
          application:
            "Make the Stone beautiful and mysterious enough that viewers immediately care about it.",
        },
      ],
      framing:
        "Extreme close-up of the Astral Realm Stone floating in darkness, then widen enough to reveal nine glowing world symbols.",
      action:
        "A pulse travels through the Stone. Each world symbol lights in sequence as the priority alert appears.",
      camera: "Slow cinematic push toward the Stone; perfectly stable.",
      lighting:
        "Cool cosmic darkness pierced by bright cyan, gold, and violet light from the Stone.",
      sound:
        "Low energy hum, one clean alert tone, then the Nova system announcement.",
      transition: "The final light pulse becomes the flare of a distant battlefield.",
      muteTest:
        "The Stone and all nine world symbols visibly activate, communicating that a powerful nine-world event has begun.",
      reducedMotionAlternative:
        "Static Stone hero image with the nine symbols fading on together.",
    },
    {
      id: "shot-02-army-advance",
      timecode: "0:04-0:09",
      durationSeconds: 5,
      title: "The Conqueror’s Army",
      characters: ["lieutenant_kalhor", "kalhor_army"],
      scriptLineIds: [],
      emotionalIntent:
        "Show Kalhor’s power through discipline and instant obedience rather than horror.",
      animationPrinciples: [
        {
          principle: "staging",
          application:
            "Keep Kalhor isolated at the visual point of the formation so command is readable instantly.",
        },
        {
          principle: "straight_ahead_or_pose_to_pose",
          application:
            "Use strong planned poses for march, raised fist, and complete stop.",
        },
        {
          principle: "timing",
          application:
            "Let synchronized footsteps build rhythm, then stop every soldier on the same sharp beat.",
        },
        {
          principle: "solid_drawing",
          application:
            "Maintain army spacing, scale, screen direction, and readable silhouettes throughout the tracking move.",
        },
      ],
      framing:
        "Wide cinematic invasion composition: Lieutenant Kalhor alone in the immediate foreground as leader. Behind him, a legion of similar troll/brute/rock soldiers in staggered ranks with clear breathing room between figures so each character stays distinct and readable—not a dense Where's-Waldo crowd mash. Still feels like a real army (about a dozen clear midground soldiers plus softer distant silhouettes).",
      action:
        "Kalhor advances a few paces ahead, raises one fist to halt. The legion behind him carries clubs, maces, spears, hammers, and other medieval blunt/pole weapons only—no swords. The image must feel like they are about to conquer a planet: disciplined, aggressive, menacing, but kid-safe.",
      camera:
        "Low-angle wide shot; Kalhor nearest camera; spaced ranks recede into depth with visible gaps of ground/atmosphere between soldiers.",
      lighting:
        "Epic conquest lighting: controlled ember/orange world-glow with cool rim on Kalhor; atmospheric dust and scale, not horror darkness.",
      sound:
        "Heavy synchronized footsteps, armor and weapon clatter, distant wind, then sudden silence when Kalhor signals.",
      transition: "Hard cut on Kalhor turning toward camera.",
      muteTest:
        "Muted viewers instantly read: Kalhor leads; a spaced rock-brute legion with blunt medieval weapons stands ready behind him to conquer, and individual soldiers are still recognizable.",
      reducedMotionAlternative:
        "Still composition with Kalhor forward and staggered, spaced depth layers of club-wielding similar brutes behind him.",
    },
    {
      id: "shot-03-kalhor-order",
      timecode: "0:09-0:18",
      durationSeconds: 9,
      title: "Kalhor Gives the Order",
      characters: ["lieutenant_kalhor", "kalhor_army"],
      scriptLineIds: ["kalhor-order"],
      emotionalIntent:
        "Make Kalhor feel like a certain, battle-tested conqueror whose control is more dangerous than shouting.",
      animationPrinciples: [
        {
          principle: "anticipation",
          application:
            "Pause on Kalhor’s closed fist before he opens it toward the worlds.",
        },
        {
          principle: "secondary_action",
          application:
            "Let armor plates settle and distant soldiers prepare while Kalhor remains controlled.",
        },
        {
          principle: "exaggeration",
          application:
            "Push his stillness and deliberate hand movement about ten percent to emphasize authority.",
        },
        {
          principle: "slow_in_and_slow_out",
          application:
            "Use a restrained push-in that arrives on the words “absolute control.”",
        },
      ],
      framing:
        "Medium close-up matching Kalhor’s approved face and armor reference; soldiers remain out of focus behind him.",
      action:
        "Kalhor delivers the order with controlled certainty. His fist opens toward a hologram of the nine worlds.",
      camera:
        "Very slow push-in. No Dutch angle, horror framing, or exaggerated monster movement.",
      lighting:
        "Cold rim light defines his silhouette; restrained ember light crosses the armor.",
      sound:
        "Lieutenant-Kalhor custom voice over a quiet battlefield rumble.",
      transition: "The world hologram expands until it fills the frame.",
      muteTest:
        "Kalhor opens his fist toward the nine-world map and the army prepares to deploy, clearly showing his objective.",
      reducedMotionAlternative:
        "Single approved Kalhor close-up with a gentle light change and captions.",
    },
    {
      id: "shot-04-search-across-worlds",
      timecode: "0:18-0:23",
      durationSeconds: 5,
      title: "The Search Begins",
      characters: ["kalhor_army"],
      scriptLineIds: [],
      emotionalIntent:
        "Turn Kalhor’s order into immediate, large-scale action without showing violence.",
      animationPrinciples: [
        {
          principle: "arc",
          application:
            "Carriers bank through broad curves and ground units follow clean arcing paths into portals.",
        },
        {
          principle: "follow_through_and_overlapping_action",
          application:
            "Dust, banners, and armor movement trail the army’s acceleration.",
        },
        {
          principle: "timing",
          application:
            "Use three quick deployment beats that become faster without becoming hard to follow.",
        },
        {
          principle: "solid_drawing",
          application:
            "Preserve left-to-right travel across every world so the chase direction remains clear.",
        },
      ],
      framing:
        "Three fast, readable action vignettes showing soldiers entering different world gateways.",
      action:
        "Aerial carriers bank toward portals while ground units fan out. No civilians or battles are shown.",
      camera:
        "One flowing left-to-right move connects the three worlds without shaky motion.",
      lighting:
        "Each portal carries a distinct world color while the soldiers remain visually consistent.",
      sound:
        "Rising propulsion, portal energy, and a short musical acceleration.",
      transition: "A portal becomes Nova Star Command’s circular main display.",
      muteTest:
        "Soldiers divide among multiple portals, showing that Kalhor’s search now threatens many worlds.",
      reducedMotionAlternative:
        "Three world images crossfade slowly with a small army silhouette in each.",
    },
    {
      id: "shot-05-command-alert",
      timecode: "0:23-0:28",
      durationSeconds: 5,
      title: "Nova Star Command Responds",
      characters: ["commander_carter", "nova_system", "astral_realm_stone"],
      scriptLineIds: [],
      emotionalIntent:
        "Replace fear with capable leadership and make the command deck feel like a place viewers want to join.",
      animationPrinciples: [
        {
          principle: "staging",
          application:
            "Place Carter beneath the Stone display and give her the clearest light and silhouette.",
        },
        {
          principle: "arc",
          application:
            "The crane move follows a gentle arc that lands naturally at Carter’s eye level.",
        },
        {
          principle: "appeal",
          application:
            "Use welcoming color, readable technology, and confident body language to invite the cadet into the world.",
        },
      ],
      framing:
        "Wide establishing view of the bright command deck with Carter centered beneath the Stone display.",
      action:
        "Displays wake around the room. Carter steps onto the central platform as the nine-world map forms.",
      camera: "Descending crane move that settles at Carter’s eye level.",
      lighting:
        "Bright blue and gold command-deck lighting; adventurous rather than alarming.",
      sound:
        "The threat music resolves into a confident command theme with soft console tones.",
      transition: "Smooth push toward Commander Carter.",
      muteTest:
        "Carter steps into command as the threat map appears, showing that she understands the danger and has a plan.",
      reducedMotionAlternative:
        "Static command-deck image with displays fading on in two stages.",
    },
    {
      id: "shot-06-carter-briefing",
      timecode: "0:28-0:45",
      durationSeconds: 17,
      title: "The Cadet’s Mission",
      characters: ["commander_carter", "astral_realm_stone"],
      scriptLineIds: ["carter-welcome", "carter-purpose"],
      emotionalIntent:
        "Make the cadet feel trusted and needed without making the placement activity feel like a frightening test.",
      animationPrinciples: [
        {
          principle: "secondary_action",
          application:
            "Carter calmly reorganizes the threat map into two training systems while she speaks.",
        },
        {
          principle: "follow_through_and_overlapping_action",
          application:
            "Her hand settles before the interface completes its delayed transformation.",
        },
        {
          principle: "staging",
          application:
            "Keep Carter, the Stone, and the two system icons as the only important visual information.",
        },
        {
          principle: "timing",
          application:
            "Pause briefly after the nine-world danger, then brighten the rhythm when the safe training plan appears.",
        },
      ],
      framing:
        "Alternate between Carter’s welcoming medium shot and an over-shoulder view of the Stone and nine-world map.",
      action:
        "Carter explains the danger, then turns the display from a threat map into two clear training systems: communication and navigation.",
      camera:
        "Two deliberate cuts with gentle pushes; keep Carter’s expression warm and confident.",
      lighting:
        "Warm key light on Carter with cool holographic accents from the map.",
      sound:
        "Tasha voice for Carter. Music lowers under dialogue and becomes hopeful when the training systems appear.",
      transition: "A small wheel streaks through the bottom of frame.",
      muteTest:
        "Carter changes the dangerous red threat map into two calm training paths and gestures toward the cadet’s place in the plan.",
      reducedMotionAlternative:
        "Two static Carter compositions with a crossfade at the change to training systems.",
    },
    {
      id: "shot-07-spark-action-entrance",
      timecode: "0:45-0:50",
      durationSeconds: 5,
      title: "S.P.A.R.K. Rolls In",
      characters: ["spark"],
      scriptLineIds: [],
      emotionalIntent:
        "Release tension with speed, warmth, and visual comedy while introducing a capable robot teammate.",
      animationPrinciples: [
        {
          principle: "anticipation",
          application:
            "Show a tiny wheel shadow and antenna glow before S.P.A.R.K. enters frame.",
        },
        {
          principle: "squash_and_stretch",
          application:
            "Use a subtle body compression on braking and recovery without making his solid robot design feel rubbery.",
        },
        {
          principle: "arc",
          application:
            "S.P.A.R.K. follows a clean curved path around the console into his final mark.",
        },
        {
          principle: "follow_through_and_overlapping_action",
          application:
            "His antenna and arms settle one beat after the wheel stops.",
        },
        {
          principle: "appeal",
          application:
            "End on an open, friendly pose that keeps his wheel, face screen, colors, and silhouette readable.",
        },
      ],
      framing:
        "Low-angle tracking shot matched to S.P.A.R.K.’s approved white, blue, and yellow design.",
      action:
        "S.P.A.R.K. speeds around a console, brakes in a playful half-turn, and projects two clean system icons.",
      camera:
        "Quick but smooth wheel-height tracking move ending in a centered medium shot.",
      lighting:
        "Bright command-deck light with a cyan antenna pulse and yellow highlights.",
      sound:
        "Friendly motor movement, two original electronic chirps, and a soft confirmation chime.",
      transition: "S.P.A.R.K.’s projected icons expand into the scan interface.",
      muteTest:
        "S.P.A.R.K. arrives quickly, stops to face the cadet, and presents two helpful icons, clearly identifying him as the guide.",
      reducedMotionAlternative:
        "S.P.A.R.K. appears centered; the two system icons fade in beside him.",
    },
    {
      id: "shot-08-scan-ready",
      timecode: "0:50-1:00",
      durationSeconds: 10,
      title: "The Signal Clarity Scan",
      characters: ["spark"],
      scriptLineIds: ["spark-scan-intro"],
      emotionalIntent:
        "End with safety, curiosity, and agency: the cadet chooses when to begin.",
      animationPrinciples: [
        {
          principle: "secondary_action",
          application:
            "Use small antenna tilts and eye-screen expressions while the readable card remains still.",
        },
        {
          principle: "timing",
          application:
            "Give each reassurance its own beat and hold before revealing Start Mission.",
        },
        {
          principle: "slow_in_and_slow_out",
          application:
            "Ease interface pulses gently and let all motion settle before interaction begins.",
        },
        {
          principle: "staging",
          application:
            "Keep S.P.A.R.K., the two system icons, and Start Mission in one clear visual hierarchy.",
        },
      ],
      framing:
        "S.P.A.R.K. beside the solid, readable scan card; communication and navigation icons remain visible.",
      action:
        "S.P.A.R.K. introduces the scan. The interface responds with gentle pulses, ending on the Start Mission button.",
      camera: "Locked camera for reading comfort.",
      lighting:
        "Calm blue, yellow, and white interface lighting with strong text contrast.",
      sound:
        "Spark custom voice with very light original electronic chirps between sentences; music resolves softly.",
      transition: "Hold on the interactive Start Mission screen; do not autoplay the assessment.",
      muteTest:
        "S.P.A.R.K. presents two friendly systems and waits beside the Start Mission button, showing that the cadet controls the beginning.",
      reducedMotionAlternative:
        "Identical composition with no pulses or animated background.",
    },
  ] satisfies PlacementStoryboardShot[],
} as const;

