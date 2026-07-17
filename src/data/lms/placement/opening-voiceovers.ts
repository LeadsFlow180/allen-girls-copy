/**
 * Owner-approved opening storyboard voiceovers (generated 2026-07-15).
 * Files live under src/assets/voiceovers/placement-opening/.
 * CDN hosting applies to finished video; these local WAVs are production sources.
 */

import { characterProductionCanon } from "../../canon/character-production";

export type OpeningVoiceoverClip = {
  id: string;
  scriptLineId: string;
  speaker: "nova_system" | "lieutenant_kalhor" | "commander_carter" | "spark";
  voiceName: string;
  voiceId: string;
  voiceType: "preset" | "element";
  file: string;
  /** Relative to project root */
  assetPath: string;
  remoteUrl: string;
  jobId: string;
  status: "generated" | "owner_approved";
};

export const placementOpeningVoiceovers: OpeningVoiceoverClip[] = [
  {
    id: "vo-system-priority-alert",
    scriptLineId: "system-priority-alert",
    speaker: "nova_system",
    voiceName: "Sterling",
    voiceId: "dc382508-c8bd-443c-8cb2-46e57b8d2e6f",
    voiceType: "preset",
    file: "01-system-priority-alert.wav",
    assetPath: "src/assets/voiceovers/placement-opening/01-system-priority-alert.wav",
    remoteUrl:
      "https://d8j0ntlcm91z4.cloudfront.net/user_36WhJm9G1dLQpS5pEP9lbzca22L/hf_20260715_130956_c89e8907-63f1-451f-b3c0-b49f095e9d80.wav",
    jobId: "c89e8907-63f1-451f-b3c0-b49f095e9d80",
    status: "owner_approved",
  },
  {
    id: "vo-kalhor-order",
    scriptLineId: "kalhor-order",
    speaker: "lieutenant_kalhor",
    voiceName: characterProductionCanon.voices.lieutenantKalhor.name,
    voiceId: characterProductionCanon.voices.lieutenantKalhor.voiceId,
    voiceType: "element",
    file: "02-kalhor-order.wav",
    assetPath: "src/assets/voiceovers/placement-opening/02-kalhor-order.wav",
    remoteUrl:
      "https://d8j0ntlcm91z4.cloudfront.net/user_36WhJm9G1dLQpS5pEP9lbzca22L/hf_20260715_130956_9325c941-3948-4144-b97e-1e1237bbb332.wav",
    jobId: "9325c941-3948-4144-b97e-1e1237bbb332",
    status: "owner_approved",
  },
  {
    id: "vo-carter-welcome",
    scriptLineId: "carter-welcome",
    speaker: "commander_carter",
    voiceName: characterProductionCanon.voices.commanderCarter.name,
    voiceId: characterProductionCanon.voices.commanderCarter.voiceId,
    voiceType: "preset",
    file: "03-carter-welcome.wav",
    assetPath: "src/assets/voiceovers/placement-opening/03-carter-welcome.wav",
    remoteUrl:
      "https://d8j0ntlcm91z4.cloudfront.net/user_36WhJm9G1dLQpS5pEP9lbzca22L/hf_20260715_130958_d0e35390-268a-48f6-841e-fc35eed26e8a.wav",
    jobId: "d0e35390-268a-48f6-841e-fc35eed26e8a",
    status: "owner_approved",
  },
  {
    id: "vo-carter-purpose",
    scriptLineId: "carter-purpose",
    speaker: "commander_carter",
    voiceName: characterProductionCanon.voices.commanderCarter.name,
    voiceId: characterProductionCanon.voices.commanderCarter.voiceId,
    voiceType: "preset",
    file: "04-carter-purpose.wav",
    assetPath: "src/assets/voiceovers/placement-opening/04-carter-purpose.wav",
    remoteUrl:
      "https://d8j0ntlcm91z4.cloudfront.net/user_36WhJm9G1dLQpS5pEP9lbzca22L/hf_20260715_131001_012038f3-a3e3-4990-8f52-ff09cadf9edb.wav",
    jobId: "012038f3-a3e3-4990-8f52-ff09cadf9edb",
    status: "owner_approved",
  },
  {
    id: "vo-spark-scan-intro",
    scriptLineId: "spark-scan-intro",
    speaker: "spark",
    voiceName: characterProductionCanon.voices.spark.name,
    voiceId: characterProductionCanon.voices.spark.voiceId,
    voiceType: "element",
    file: "05-spark-scan-intro.wav",
    assetPath: "src/assets/voiceovers/placement-opening/05-spark-scan-intro.wav",
    remoteUrl:
      "https://d8j0ntlcm91z4.cloudfront.net/user_36WhJm9G1dLQpS5pEP9lbzca22L/hf_20260715_131001_126cc273-53a0-4821-966e-3d5c7b9c1d3f.wav",
    jobId: "126cc273-53a0-4821-966e-3d5c7b9c1d3f",
    status: "owner_approved",
  },
];

export const placementOpeningVoiceoverManifest = {
  approvedDate: "2026-07-15",
  ownerApproval: {
    status: "approved" as const,
    note: "Owner approved all five opening voiceovers. Ready for video animation assembly.",
  },
  note: "Opening ~60s storyboard dialogue locked. Remaining placement briefing lines can generate after opener video.",
  clips: placementOpeningVoiceovers,
} as const;
