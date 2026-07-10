/**
 * Placement intro + results copy. Use {name} in introLead for personalization.
 */

import type { PlacementTier } from "./types";

export const placementIntro = {
  eyebrow: "Mission Ready",
  title: "The Artifact Challenge",
  /** After {name} is replaced — story hook */
  introLead: (name: string) =>
    `The Allen Girls have discovered an artifact that has the power to either save or destroy all nine worlds—but it’s at risk. The villains, of course, have plans to take over the worlds. But you, ${name}—and the Allen Girls—are the heroes that can protect them. Let’s see if you’ve got what it takes!`,

  /** Shown on the intro card, after introLead and before the name field */
  sparkBriefingTitle: "S.P.A.R.K. Opening Briefing",
  /** S.P.A.R.K. dialogue (Signal Clarity Scan framing) */
  sparkBriefingDialogue: `Recruit, before I can assign you to a mission, I need to run a quick diagnostic. This is the Signal Clarity Scan — three skill checks that tell me exactly how sharp your communication systems are. No grades. No scores on a board. Just you and the data. Ready? Let's go.`,

  nameLabel: "What should we call you?",
  namePlaceholder: "Your first name or nickname",
  beginCta: "Begin Cadet Training",
} as const;

export const placementSectionTitles = {
  ela: { title: "Reading & language", subtitle: "5 questions — take your time." },
  math: { title: "Math check-in", subtitle: "5 questions — show what you know." },
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
