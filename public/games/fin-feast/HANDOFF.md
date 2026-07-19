# Fin Feast — Handoff

**Updated:** 2026-07-19
**Build:** `fin-feast.html` (single self-contained file, no build step)
**LIVE:** https://peach-thistle-120.higgsfield.gg/
**game_id:** `968d08ef-ad78-4c22-a7f8-dc18c46c5e43` — MUST reuse on every deploy.

---

## What it is

A pure-fun arcade game for the **Power Up & Play** store. Feeding Frenzy-style:
you are a fish, eat what is smaller, avoid what is bigger, grow through 9 stages
(guppy to reef shark), then take on the Great White.

**NOT an academic title.** There is no math, no grades, no curriculum, and no
mode toggle. This was deliberately stripped on 2026-07-19 — do not re-add it.

---

## Current build state

Growth stages, level-gate interstitials, combo/frenzy system, power-ups, dash
(Shift) with cooldown HUD, high-score persistence, music and SFX, screen shake,
timed levels. Hazards: jellyfish (stage 2), toxic fish (3), mines (4), snapping
clams (5).

### Visual system (2026-07-19 overhaul)

**2.5D fish.** Sprites are flat art. Each one gets a cached shading canvas built
once (`buildShade`): the sprite silhouette filled with a top-lit vertical ramp
plus a specular hotspot on the upper back, composited over the artwork with the
canvas `overlay` blend. Result measured at 3.2x more top-to-bottom luminance
falloff than the flat original — reads as a rounded body, not a decal.

**Procedural swim.** `drawWavy()` draws each fish as vertical slices riding a
travelling sine wave. Sprites face RIGHT, so the LEFT edge is the tail and gets
the most travel (weighted `t*t`); the head stays steady. Plus a breathing squash
and slight pitch rotation. No rigged animation, no spritesheets.
Slice count scales with size (7 for big fish, 3 for small) to protect mobile fps.

**Player identification.** Research finding: Feeding Frenzy never rings the
player — the hero is a unique named species (Andy, a purple angelfish) visually
distinct from all background fish, and edibility info lives in the HUD. Our
player shares the stage sprite set with the reef, which is exactly why the player
was unfindable. Fix: a gold rim (`getSil` silhouette drawn slightly larger behind
the art, so it hugs the fish shape — never a circle) plus a bobbing gold chevron
above the player (`drawPlayerMarker`).

**No rings on background fish.** The old green "edible" / red "danger" ellipses
and the orange hunt halo are DELETED. Do not bring them back.

### Threat feedback (replaces the rings)

`updateDanger()` tracks the nearest bigger fish (and the shark) and eases a
`dangerLevel` 0..1. That drives two things: a red screen-edge vignette
(`drawDangerVignette`) and a pulsing low warning sound that gets faster and
higher as the threat closes. Suppressed while shielded.

### Audio

- `sfxStageUp` — 5-note rising fanfare on growing into a new stage.
- `sfxBigEat` — low crunch + shake when eating a fish >= 55% of your size.
- `sfxDanger` — proximity warning, pitch/volume/rate ride `dangerLevel`.
- Existing: eat, hurt, frenzy, dash, shark cue, win, game over, music.

---

## Tuning knobs

- Swim: `amp` (`drawH*0.085`) and slice counts in `drawSprite`.
- Volume shading: colour stops in `buildShade`, overlay alpha `0.85` in `drawSprite`.
- Hero rim colour `#FFD34D` and `pad` in `drawSprite`; chevron in `drawPlayerMarker`.
- Danger: `reach` and the `0.34` trigger threshold in `updateDanger`; vignette
  alpha in `drawDangerVignette`.
- Big-eat threshold: `f.r >= player.r*0.55` in `eatFish`.
- Hazard caps: `TOXIC_MAX`, `CLAM_MAX` (drop to 1 if stages 4-5 feel crowded).

---

## Open playtest questions

1. Is the gold chevron + rim enough to find yourself instantly? (Main fix — verify first.)
2. Does the swim wobble read as swimming, or is `amp` too strong/weak?
3. Is the danger vignette + sound clear enough now that the red rings are gone,
   or does the game need a small "what you can eat" HUD like Feeding Frenzy has?
4. Frame rate on a real phone — the slice rendering is the main new cost.
5. Hazard density at stages 4-5.

---

## Deploy

Sandbox CAN reach upload.higgsfield.ai directly. Flow: zip -> `media_upload` ->
PUT bytes -> `media_confirm` (type `file`) -> `deploy_game` **passing game_id**.

**Packaging gotcha:** the validator rejects an index.html-only zip. The zip root
MUST also contain the no-op `logic.js` stub (exports meta/setup/validateAction/
applyAction/isGameOver/viewFor). The game itself runs entirely in index.html.

**Marketplace publish: DELIBERATELY DECLINED.** Michelle keeps this a private
shareable link while playtesting. Do NOT call `publish_game` unless she asks.

---

## Files

- `fin-feast.html` — the game.
- `handoff.md` — this file.
- `FinFeast-Unity.zip` — parallel Unity build (now far behind; HTML is the source of truth).
