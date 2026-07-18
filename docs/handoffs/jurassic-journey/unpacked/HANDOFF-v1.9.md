# Jurassic Journey — Handoff v1.9

Continuity notes so any next session can pick up cleanly.

## What this is
Jurassic Journey: Volcanic Escape — a 3D educational browser game (Three.js, single-page, no build step). A gyrosphere rolls through 8 volcano-themed levels; adaptive math at checkpoints powers the way forward.

**Live:** https://pearl-patch-438.higgsfield.gg/
**game_id (reuse, never regenerate):** `0b9c56a0-6c6c-4933-8bd8-52953198e75d`
**In-game version label:** Jurassic Journey v1.9

## Files in the application bundle
- `index.html` — entry point; loads `game.js` as a module.
- `game.js` — the whole engine and game (~3,000 lines).
- `mathgen.js` — question generators for Grade 3, 4, and 5 (`makeProblem`, `makeProblemG4`, `makeProblemG5` + `FAMILY_LABELS*`).
- `strings.js` — all display text, the version label, the HOW TO PLAY rules, and the S.P.A.R.K. hint library.
- `audio.js`, `assets-config.js` — sound engine and asset references.
- `logic.js` — no-op Higgsfield validator stub (required at zip root for deploy).
- `voIntro-astral.mp3` — bundled intro voiceover (Alistair voice).
- `trex.glb`, `raptor.glb`, `brachio.glb` — bundled, optimized dinosaur models.
- `vendor/` — Three.js and the GLTF loader.
- `docs/` — this folder (changelog + handoff).

## Deploy pipeline (Higgsfield)
1. Zip the application files (all of the above at the zip root, plus `vendor/`).
2. `media_upload` (type file) -> PUT the bytes to the presigned URL -> `media_confirm` (type file).
3. `deploy_game` passing the existing `game_id`, the source zip URL, plus title/description/thumbnail/favicon.
4. **Verify after deploy** by fetching the live URL: `game.js` should be ~140 KB (not a 2-byte "ok" placeholder), and every bundled asset (`.glb`, `.mp3`) should return HTTP 200. Do not trust the "deployed" message alone.
- Reusable thumbnail: `423ec41f-33d3-48bf-9c90-809e2597b181.png`; favicon: `cadf6ee9-3990-4e28-865a-e0a0b0622756.png`.
- Higgsfield's deploy service occasionally returns a generic "Something went wrong" error; it is transient. Uploads/confirm/audio-gen working while deploy fails = their build service, not the files.

## Hard-won lessons (do not relearn)
- **Higgsfield 3D/CDN links expire (~7 days).** Never reference generated assets by their Higgsfield CDN URL in a shipped build. Download and BUNDLE them.
- **Verify the live files after every deploy**, not just the success message — a build can succeed at the API and fail silently at the host, leaving an "ok" placeholder.
- **Bundle custom-processed audio/models** and load them by relative path (same-origin, no CORS, no expiry).

## Open items / roadmap
1. **Playtest** with the target-age child — the only real validation left.
2. **Confirm raptor vs brachiosaurus level mapping** (identified by shape; swap is trivial if wrong).
3. **Automatic grade assignment.** Today grade is a manual toggle. The design: the game reads one value (`track`) through one function; where that value comes from is swappable. Near-term options that need no backend — a class code / URL param, or a short placement test. Full "student ID -> assigned grade" needs a backend (accounts, database, COPPA/FERPA) and is its own phase.
4. **Grade 6** generator (ratios, expressions, negative numbers, statistics — the hardest one; warrants a plan first because negatives break the positive-integer distractor assumptions).
5. Execute refactor briefs `13-monolith-split` and `14-grade-track-router` when ready.

## Suggested future polish (from the v19 design consult, not yet built)
- Add passed-question families to the win-screen report (shows what a child is *avoiding*, not just missing).
- Consider easing very first checkpoint if 3-in-a-row feels long to the youngest players.
