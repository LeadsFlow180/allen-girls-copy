export type {
  SubjectCategory,
  CurriculumModule,
  CurriculumSkill,
  AssessmentItem,
} from "./types";

export { curriculumModules, mod01Skills, getSkillsByModuleId } from "./skills/modules";
export {
  LOCKED_DISTRIBUTION_RATIOS,
  SUBJECT_MAPPINGS,
  DISTRIBUTION_BREAKDOWN_LINES,
  MIN_ITEMS_FOR_EXACT_DISTRIBUTION,
} from "./distribution/constants";
export type { DistributionKey } from "./distribution/constants";
export {
  validateModuleDistributionExact,
  validateModuleDistributionApproximate,
} from "./distribution/validator";

export {
  buildLearningPathRecommendation,
  domainTiersFromPlacementScore,
  focusDomainFromTiers,
  pickRecommendedWorld,
  PLACEMENT_WORLD_OPTIONS,
} from "../mission-engine";
