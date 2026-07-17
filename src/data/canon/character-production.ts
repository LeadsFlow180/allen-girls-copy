/**
 * Owner-approved character production direction.
 * Updated 2026-07-15.
 */
export const characterProductionCanon = {
  visualDirection: {
    format: "Cinematic stylized 3D family-adventure animation",
    references: ["DreamWorks Trollhunters", "Disney/Pixar animation"],
    sceneEnergy: "Fast, exciting action with readable poses and expressions",
    characterRule:
      "Use the owner-approved locked references for S.P.A.R.K., Lieutenant Kalhor, and Commander Carter. Do not revert Carter to the older short-haired group-photo design.",
  },
  visualLocks: {
    spark: {
      status: "approved",
      approvedDate: "2026-07-15",
      higgsfieldElementName: "SPARK-Exact",
      higgsfieldElementId: "c7945c6b-fb5b-4e73-96bb-d789f2a71997",
      lockedSceneAssetPath: "src/assets/spark/spark-locked-on-deck.png",
      notes:
        "Owner-approved shape and size. Preserve exact spherical head proportions, black face panel with cyan eye, thin antenna with yellow tip, white torso, blue lower body, yellow joints, short segmented arms with yellow hands, and two large black wheels. Do not redesign into a taller humanoid, add legs, change wheel count, or alter head-to-body ratio. The SPARK on Deck consistency frame is the locked scene proof.",
    },
    lieutenantKalhor: {
      status: "approved",
      approvedDate: "2026-07-15",
      higgsfieldElementName: "Lieutenant-FINAL",
      higgsfieldElementId: "daf8d14d-e004-48e2-9bb7-d4994ba47bae",
      lockedTurnaroundAssetPath:
        "src/assets/kalhor/Lieutenant Kalhor - Final-03716d93-bf91-4004-9675-a0cd0b321dae.png",
      armyCompositionRule:
        "Shot 2: sunset conquest legion still with Kalhor front matching locked turnaround (shot-02-army-advance.png). Shot 3: Kalhor holds holographic worlds in palm (shot-03-kalhor-order.png; backup WORLDS-BACKUP).",
      notes:
        "Match locked Kalhor turnaround: dark charcoal/obsidian rock armor, horizontal side horns, upward tusks, pale grey chin/muzzle, glowing orange eyes, black crest, spiked pauldrons; magma glow mainly at neck seams, knuckles/hands, and feet. Army soldiers share the same rock/troll brute family with variation.",
    },
    commanderCarter: {
      status: "approved",
      approvedDate: "2026-07-15",
      higgsfieldElementName: "Carter-Exact",
      higgsfieldElementId: "79b8443e-6063-40ce-9422-bc9b816d0f62",
      replacesOlderDesign:
        "Older short-haired crew portrait (carter-original-group-C.png) is archived only and must not drive new generation.",
      primaryLook: "A_command",
      looks: {
        A_command: {
          label: "Command-deck presence",
          hair: "Neat high bun",
          assetPath: "src/assets/carter/carter-locked-A-command.png",
          usage: "Establishing shots, command-deck hero framing, authority beats",
        },
        B_briefing: {
          label: "Briefing / coaching presence",
          hair: "Braids gathered into a voluminous ponytail",
          assetPath: "src/assets/carter/carter-locked-B-briefing.png",
          usage: "Cadet briefing, training explanations, warm coaching scenes",
        },
      },
      sharedIdentity: {
        displayName: "Commander Aaliyah Carter",
        appearance:
          "Young Black woman; brown skin; warm confident expression; navy/royal blue command uniform with gold accents and star insignia",
        voice: "Tasha",
      },
    },
  },
  voices: {
    lieutenantKalhor: {
      provider: "Higgsfield",
      name: "Lieutenant-Kalhor",
      voiceId: "98867f20-ed22-4e90-a34f-f1d7d7f7c6ef",
      voiceType: "element",
    },
    spark: {
      provider: "Higgsfield",
      name: "Spark",
      voiceId: "73eb3b80-356a-43b9-8d7b-efe7fbf977ce",
      voiceType: "element",
    },
    commanderCarter: {
      provider: "Higgsfield",
      name: "Tasha",
      voiceId: "e0d40568-8c85-4c9b-bdb2-b638b253a24f",
      voiceType: "preset",
    },
    novaSystem: {
      provider: "Higgsfield",
      name: "Sterling",
      voiceId: "dc382508-c8bd-443c-8cb2-46e57b8d2e6f",
      voiceType: "preset",
      notes: "Clear, neutral command-center alert voice for Nova Star system lines.",
    },
  },
} as const;
