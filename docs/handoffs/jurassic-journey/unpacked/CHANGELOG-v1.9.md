# Jurassic Journey: Volcanic Escape — Changelog v1.9

**Version:** Jurassic Journey v1.9 (shown bottom-right on the game menu)
**Live URL:** https://pearl-patch-438.higgsfield.gg/
**Higgsfield game_id:** `0b9c56a0-6c6c-4933-8bd8-52953198e75d` (always reuse to keep the same URL)
**Date of this build:** July 17, 2026

This document summarizes everything changed across this working session (builds v15 through v19, now labeled v1.9 in-game). Newest work is at the top.

---

## Gameplay & education features (v19)

**Hints on retry.** When a student misses a checkpoint question and chooses TRY AGAIN, the *same* question comes back with a one-line hint from S.P.A.R.K. that teaches the method without giving the answer (example: "You need the SAME denominator first. Then add or subtract only the tops."). There is a written hint for all 28 math families across Grades 3, 4, and 5, plus a general fallback so no question is ever left without help. Hints appear only on retry, not on the first attempt — the first try tests what the student knows; the hint arrives at the moment of confusion, which is when it teaches.

**Jewel trail.** Small teal gems now curve along the safe line between checkpoints. The trail is generated to skip gaps and hazard zones automatically, so besides rewarding good steering it quietly shows students where the solid path is. Each gem gives +1 jewel and a soft chime (no popup).

**Perfect-checkpoint speed glow.** Clear a checkpoint with zero misses and the sphere turns gold — pulsing shell, sparkle trail, and 30% faster acceleration — until the next checkpoint. Using a pass counts as a miss, so the glow can't be bought.

**HUD passes counter + question pips.** "PASSES: 2" now shows in the HUD in gold from the moment a level starts. Checkpoint questions display as filling circles (●●○○) above the charge bar so the "how many questions left" is legible at a glance.

**Checkpoint counts eased to 3-4-4.** The first checkpoint of a level asks 3 questions; the next two ask 4.

## Checkpoint & flow rework (v18)

- **Three math checkpoints per level**, spaced roughly at the thirds — one partway in, one near the end, one just before the exit gate.
- **Obstacles no longer interrupt with math.** Gates, ditches, lifts, bridges, and geyser fields used to each pop their own quiz (6-8 stops per level). They now auto-power when you roll up to them ("S.P.A.R.K. powers it with stored calculation energy!"). Math lives *only* at the 3 checkpoints now.
- **Pass system.** Miss a question and choose TRY AGAIN or USE A PASS. Each level gives 2 passes. A passed question advances progress but earns no points.
- **HOW TO PLAY screen rewritten** to explain checkpoints, passes, the perfect bonus, and the jewel trail.

## Physics fix — the fall-through bug (v18)

Root cause found and fixed. The sphere could sink through the solid track. The ground detector always returned the *highest* platform in a column; because checkpoint stations float *above* the track, in their shadow the game treated the floating platform as "the floor" and the real track beneath it stopped registering. Now the ground detector only counts surfaces the sphere can actually stand on, elevated platforms are solid from the sides (you bonk off instead of tunneling through), and you can still roll underneath floating platforms. Verified in a headless browser: sphere driven under a floating checkpoint stays grounded with no sinking.

## Dinosaurs restored (v17)

The T-Rex, raptor, and brachiosaurus had turned into stiff flat "stickers." Root cause: their 3D model files were hosted on Higgsfield's model CDN, whose links expire after about 7 days. Once expired, the game fell back to a flat 2D placeholder.

Fix: the original model files were re-supplied, optimized from ~28 MB each down to ~1.7 MB (mesh simplified from ~288K to ~38K vertices; 4K textures reduced to 1024 JPEG; plain GLB that needs no special decoder), and **bundled inside the game** so no CDN clock can ever take them down again. Because the models are static (no rig), the walk is driven in code — a step-and-bob with a gait roll for the T-Rex and raptor, and a slow lumber for the brachiosaurus.

*Open item:* please confirm on playtest that the raptor and brachiosaurus are mapped to the right levels (identified from their shape; a mismatch would be obvious on sight and is a two-minute fix).

## Story rename + voiceover (v15b/v16)

- **"The Trinket" renamed to "The Astral Realm Stone"** everywhere in the game, including the spoken intro.
- **Intro voiceover re-recorded** in the Alistair voice. The original spoken line was transcribed from the live game first, which revealed the voice uses a first-person script ("...sends *me* calculation energy... *my* beacon anchors") that differs from the third-person on-screen briefing — so the new recording matches how S.P.A.R.K. actually talks, not a robotic read of the card. The ending was smoothed and padded so it no longer clips. The audio file is bundled in the game.

## Grade 5 math added (v15)

- A full **Grade 5 question generator** was added, covering all five Grade 5 modules: order of operations and expressions (OA), decimals and long division (NBT), adding/subtracting and multiplying fractions (NF), unit conversion and volume (MD), and the coordinate plane and classifying shapes (GEO) — 12 question families in all.
- The title-screen math toggle now cycles **Grade 3 → Grade 4 → Grade 5**, each with its own question set and its own adaptive stats.
- Quality-tested with 20,000 generated problems (0 malformed) and 12,004 answers independently recomputed (0 incorrect).

---

## Known open items (not yet done)

- **Playtest everything** with the target-age player — engine-verified is not kid-verified.
- **Confirm raptor/brachiosaurus level mapping** (see Dinosaurs section).
- **Grade assignment is still a manual toggle.** Automatic grade assignment (by placement test or student ID) is designed but not built — see the handoff doc.
- **Grade 6** generator not yet built.
- Two refactor briefs (`13-monolith-split`, `14-grade-track-router`) are written but not executed.

## Deploy notes (for reference)

- Deploys go to Higgsfield reusing `game_id 0b9c56a0-6c6c-4933-8bd8-52953198e75d` so the public URL never changes.
- The game bundle must contain `index.html` plus a `logic.js` validator stub at the zip root.
- All audio and 3D models are now bundled inside the game (no external CDN links that can expire).
