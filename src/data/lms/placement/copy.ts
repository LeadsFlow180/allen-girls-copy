/**
 * Placement intro + results copy. Use {name} in introLead for personalization.
 */

import type { PlacementTier } from "./types";
import { placementItemCounts } from "./items";
import { astralRealmStoneCanon } from "../../canon/astral-realm-stone";

export const placementIntro = {
  eyebrow: "Nova Star Command",
  title: "Cadet Signal Clarity Scan",
  /** After {name} is replaced — story hook */
  introLead: (name: string) =>
    `The Allen Girls have discovered an artifact—${astralRealmStoneCanon.artifact.name}—that has the power to either save or destroy all nine worlds. ${astralRealmStoneCanon.antagonists.lieutenant.name}, his Master, and their armies are ruthless in their pursuit of it. But you, ${name}, and the Allen Girls are the heroes who can protect it. Let’s see if you’ve got what it takes!`,

  /** Shown on the intro card, after introLead and before the name field */
  sparkBriefingTitle: "S.P.A.R.K. Opening Briefing",
  /** S.P.A.R.K. dialogue (Signal Clarity Scan framing) */
  sparkBriefingDialogue: `Cadet, I’ll check two systems: communication and navigation. This is not pass or fail, and it is not a race. Your answers simply help us choose the right place for each part of your training. Ready? Let’s make the data sparkle.`,

  nameLabel: "What should we call you?",
  namePlaceholder: "Your first name or nickname",
  beginCta: "Begin Cadet Training",
} as const;

export const placementSectionTitles = {
  ela: {
    title: "Communication systems",
    subtitle: `${placementItemCounts.ela} reading and language signals — take your time.`,
  },
  math: {
    title: "Navigation systems",
    subtitle: `${placementItemCounts.math} math signals — show what you know.`,
  },
} as const;

export const placementTierCopy: Record<
  PlacementTier,
  { title: string; body: string; badge: string }
> = {
  emerging: {
    badge: "Launch path: Foundations",
    title: "Strong start — we’ll build the base with you.",
    body:
      "Your results point to extra practice in a few spots. That’s normal — heroes train before the big mission. We’ll start with clear steps and lots of support.",
  },
  on_track: {
    badge: "Launch path: On track",
    title: "Nice! You’re right where many heroes begin.",
    body:
      "You showed solid skills in reading and math. Next up: missions that match your level and stretch you a little at a time.",
  },
  stretch: {
    badge: "Launch path: Ready to stretch",
    title: "Wow — you brought serious skills today!",
    body:
      "You solved a lot of tricky questions. Get ready for challenges that go deeper — the Allen Girls love a teammate who loves to learn.",
  },
};
