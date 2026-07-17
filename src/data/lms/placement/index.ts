import { placementItems } from "./items";
import type { PlacementQuestion, PlacementSectionId } from "./types";

function toPlacementQuestion(item: import("./items").PlacementItem): PlacementQuestion {
  const [a, b, c, d] = item.choices;
  return {
    id: item.id,
    section: item.section,
    ...(item.passage != null && item.passageTitle != null
      ? { passage: item.passage, passageTitle: item.passageTitle }
      : {}),
    prompt: item.prompt,
    choices: [a, b, c, d],
    correctIndex: item.correctIndex as 0 | 1 | 2 | 3,
  };
}

export const placementQuestions: PlacementQuestion[] = placementItems.map(toPlacementQuestion);

export function getQuestionsBySection(section: PlacementSectionId): PlacementQuestion[] {
  return placementQuestions.filter((q) => q.section === section);
}

export type {
  PlacementQuestion,
  PlacementSectionId,
  PlacementTier,
  PlacementScoreResult,
} from "./types";
export type { PlacementItem } from "./items";
export { placementItems } from "./items";
export { scorePlacement, tierFromPercent } from "./scoring";
export { placementIntro, placementSectionTitles, placementTierCopy } from "./copy";
export {
  placementMissionBriefing,
  placementSpeakerNotes,
} from "./mission-briefing";
export type {
  PlacementBriefingLine,
  PlacementBriefingSceneId,
  PlacementBriefingSpeaker,
} from "./mission-briefing";
export { placementOpeningStoryboard } from "./storyboard";
export type {
  AnimationPrinciple,
  AnimationPrincipleApplication,
  PlacementStoryboardCharacter,
  PlacementStoryboardShot,
} from "./storyboard";
export { placementOpeningReviewPack } from "./review-pack";
export type {
  PlacementOpeningReviewShot,
  ShotApprovalStatus,
} from "./review-pack";
