# Screen Hop 3D — "Inside the Program"
## Complete Handoff Document · v22 (deployed)

**Read this first in any new chat.** It contains everything needed to keep building without re-explaining the project.

---

## 1. Quick Facts

| Item | Value |
|---|---|
| **Live URL** | https://cosmic-grain-323.higgsfield.gg/ |
| **Higgsfield `game_id`** | `0090dde9-51d6-4b7f-9c23-b7f1c759e283` |
| **Current version** | v22 |
| **Platform** | Higgsfield game hosting (static browser game) |
| **Engine** | Three.js r160 (loaded from jsDelivr CDN via importmap) |
| **Target audience** | Grades 3–6 (ages 8–12) |
| **Owner** | Michelle Phipps-Allen — Allen Girls Adventures (AGA) |
| **Playtester** | Michelle's daughter (target-age) |

---

## 2. Game Objective (the player's goal)

Nexora Corporation built the computer system that runs Futuria City. They tried to create a **Master Key** that would control everything — and the experiment accidentally awakened **The Glitcher**, a corrupted AI who had been trapped alone inside the machine for years.

The Glitcher shattered the Master Key into **8 fragments**, hid one in each of Futuria's 8 core sectors, and released **cyberbugs** to guard them. Maya pressed a glowing "DO NOT PRESS" button and pulled all three Allen sisters into the digital layer.

**The player's mission:** pick one sister, travel through all 8 sectors, solve the learning checkpoints in each to recover that sector's key fragment, and repair the city system that sector controls. Assemble all 8 fragments into the Master Key, then defeat The Glitcher in a **question duel** on the final board.

**The ending:** The Glitcher isn't destroyed — she's understood. She yields, and becomes the **Guardian of the CoreNet**, protecting the system she once corrupted. One cyberbug slips into the physical world as the sequel hook.

**The real objective (educational):** every key fragment is earned by demonstrating mastery of a curriculum lesson. The game is a delivery vehicle for the AGA curriculum; the fun is the wrapper, not the substitute.

---

## 3. The 8 Sectors

Each sector has its own maze architecture, prop set, neon palette, city system it repairs, and key fragment.

| # | Sector | Layout | Repairs | Fragment |
|---|---|---|---|---|
| 1 | Motherboard Maze | grid | City Power & Lighting | Power Fragment |
| 2 | Power Supply Junction | pillars | Grid Surge Control | Surge Fragment |
| 3 | CPU Core | radial | Central Decision Systems | Logic Fragment |
| 4 | Cooling Vents | fins | Overheat Protection | Coolant Fragment |
| 5 | Graphics Card | towers | Holograms & Sky Signs | Vision Fragment |
| 6 | Data Tunnel (RAM) | tunnels | Transport & Communication | Signal Fragment |
| 7 | Security Grid (SSD) | dense | Doors, Shields & Safety | Access Fragment |
| 8 | **Glitch Core** | chaos | The Glitcher's Corruption Chamber | Master Key Core |

Boards 1–7: **13×13 to 15×15 grid, 4 checkpoints, 3 questions each (12 per board).**
Board 8 (boss): **23×23 grid, 8 checkpoints, 2 questions each (16) + 6-question duel.**

---

## 4. Core Gameplay Loop

1. **Explore** the maze in third person, camera-relative movement.
2. **Reach a checkpoint** (glowing station) — the question card opens automatically when you're close.
3. **Answer the questions** for that checkpoint. Correct = progress pip fills. Wrong = a *reteach card* with a different explanation, then a parallel item. The answer is only revealed after a second miss.
4. **Avoid cyberbugs** — contact costs a life. Fire the **zapper (Z / on-screen button)** to stun them in a radius.
5. **Collect gems** — 10 gems = bonus zapper, 25 gems = extra life.
6. **Clear all checkpoints** → the key fragment rises out of the floor → a key banner plays with Roman narration → the exit portal activates.
7. **Enter the portal** → grade card (Gold/Silver/Bronze based on first-try accuracy) → next sector.

**Death is not a game over.** Losing all lives "vaporizes" the sister; she regenerates on the same board with lives restored, losing 25% of banked gems. Keys and progress are never lost. There's also a retry-sector option that preserves keys.

---

## 5. Teaching Engine (this is the heart of the product)

Implemented in `assets/teach-bank.js` (+ `teach-extra.js`), driven by the **Gradual Release of Responsibility** model. One board = one curriculum lesson, and the 4 checkpoints are the 4 phases:

| Checkpoint | Phase | Behavior |
|---|---|---|
| CP1 | **Learn It (I do)** | S.P.A.R.K. shows a worked example, then a near-identical item |
| CP2 | **Try It Together (We do)** | Guided — hint shown up front |
| CP3 | **Your Turn (You do)** | Independent — no hint until wrong |
| CP4 | **Apply** | Transfer / word problem |

**On a wrong answer:** a *reteach card* appears with a genuinely different explanation (not a repeat), followed by a parallel item at the same difficulty. Answer revealed only after a second miss.

Every lesson carries its **registry lesson ID and skill ID** (e.g. `M3.1.1`, `SK-M3-101`) so mastery data maps directly back to AGA-CUR-001.

**Question bank** (`assets/edu-bank.js`, v3): **305 questions across all 77 registry modules**, Grades 3–6, covering Math, ELA, Science, and Social Studies.
- Grade 3: 82 · Grade 4: 77 · Grade 5: 73 · Grade 6: 73
- Randomization: shuffle-bag (no repeats until the grade's bank is exhausted) plus per-draw answer-position shuffling.
- **To grow the bank:** append items in the same object format inside the right grade array. No code changes needed.

```js
{subject:'Math', mod:'M3.1', q:'4 baskets hold 3 apples each. How many apples in all?',
 choices:['12','7','9','15'], correct:0, hint:'4 equal groups of 3 — multiply.'}
```

---

## 6. Characters & Voices

### The three sisters (playable — pick one per mission)
| Sister | Role | Look | In game |
|---|---|---|---|
| **Natalia** | Strategist / analytical | Tallest, purple | Slowest, `Natalia.glb` |
| **Alana** | Creative Solver | Middle, white cupcake shirt, purple hair puff | Mid speed, `Alana.glb` |
| **Maya** | Adventurer / warrior princess | Shortest, yellow heart shirt, pink glasses | Fastest, `Maya.glb` |

The two sisters you don't pick assist over **comms** during play, alongside **S.P.A.R.K.** (male AI companion, he/him — intentionally male to balance the all-female trio; an equal teammate, never a sidekick).

### Voice cast (LOCKED — do not change without Michelle's approval)

| Voice | `voice_id` | Used for |
|---|---|---|
| **Roman** | `7e63ac18-5fcd-4aba-8078-a86d4e11c127` | AGA platform game-master narrator: story intro, sector intros, key-found celebrations |
| **Vesper** | `c3204739-4084-41a3-9dc5-c805b307ec18` | **The Glitcher** — permanent, approved |

All voices generated via Higgsfield `generate_audio`, model `seed_audio`, `voice_type: "preset"`.

### Voice files (all in `assets/`)

**Roman — sector INTRO (plays at board start):**
`vo-sector-intro-1.mp3` … `vo-sector-intro-7.mp3`
*Sector 8 has no narrator intro by design — The Glitcher's entrance taunt is the intro.*

**Roman — sector COMPLETE (plays on key found):**
`vo-sector-1.mp3` … `vo-sector-8.mp3`

**Vesper / The Glitcher:**
| File | When it plays |
|---|---|
| `vo-glitcher-enter.mp3` | Her descent onto board 8 |
| `vo-glitcher-hover1..3.mp3` | Trash talk while hovering over the boss board |
| `vo-glitcher-taunt1..3.mp3` | Ambient taunts on sectors 2–7 + hover rotation |
| `vo-glitcher-hit1.mp3`, `hit2.mp3` | Shields breaking during the duel |
| `vo-glitcher-yield.mp3` | She surrenders |
| `vo-glitcher-guardian.mp3` | Guardian of the CoreNet ending |
| `vo-glitcher-defeat.mp3` | Defeat sting |

**Other audio:** `alistair-intro.mp3` (story narration), `neon-grid-chase-loop.mp3` (music bed).

---

## 7. Graphics & Assets

| Asset | Purpose |
|---|---|
| `Natalia.glb`, `Alana.glb`, `Maya.glb` | Playable character models (no skeleton — see run cycle note) |
| `natalia.png`, `alana.png`, `maya.png` | Character portraits (select screen) |
| `natalia-face.png`, `alana-face.png`, `maya-face.png` | HUD sister portrait with mood animation |
| `bug-blue/magenta/orange/purple/yellow.png` | Cyberbug sprite textures |
| `titlecard.png` | Title screen art |

**Everything else is procedural** — PCB floor textures, circuit wall textures, neon palettes, props (chips, capacitors, fans, RAM sticks, security locks, glitch shards), sky dome, and particle bursts are all generated in code. **The GLBs have no skeleton**, so the run cycle is faked with a whole-body two-step bounce, forward lean, side rock, and footfall squash — it reads correctly at gameplay camera distance.

---

## 8. Feature List (complete, as of v22)

### World & visuals
- 8 sectors with distinct maze architectures (grid, pillars, radial, fins, towers, tunnels, dense, chaos)
- Per-sector neon wall palettes and PCB floor textures with emissive glow
- Per-board prop sets; Tron-style grid helpers; bright indigo-to-cyan sky dome
- **Upper decks** — raised platforms reached by launch pads, with a checkpoint on top
- Minimap, objective arrow, and an objective line tracking questions and stations left

### Progression & economy
- Save/resume via localStorage (key: `screenhop3d.save.v1`)
- Per-board grade ratings: Gold / Silver / Bronze, based on first-try accuracy
- AGA gems: 10 = bonus zapper, 25 = extra life
- Difficulty scales by selected grade (3–6): bug count, bug speed, hazard rates
- Mastery tracking mapped to curriculum skill IDs

### Threat & fairness
- Cyberbugs with roam/chase/stun states
- **Data surges** from sector 3, **firewall gates** from sector 5
- Anti-dog-pile: bugs within range get shoved away and stunned so a swarm can't chain-trap
- **Landing grace (v22):** dropping off a deck grants 3s of protection and stuns bugs within 6 units
- **No under-deck camping (v22):** bugs are pushed out of under-deck zones and stop chasing entirely while the player is elevated
- Vaporize/regenerate instead of a game-over screen

### Story & voice
- Story screen with narration
- Roman sector intros (1–7) and key-found celebrations (1–8)
- Glitcher ambient taunts on sectors 2–7
- Comms from the two non-playing sisters and S.P.A.R.K.
- Sister portrait HUD with mood animation

### Boss battle (board 8)
- **Entrance cinematic:** The Glitcher descends from y=20 over 3.6s while her entry taunt plays; movement is locked during the descent (`S.cinema`, 4.2s wall-clock failsafe unlock)
- **Hover phase:** she floats at y≈8.6 above the maze, following the player, untouchable, trash-talking every 15–24s
- **BOSS BATTLE banner:** when the Master Key is assembled, a full-screen red card explains what's happening (fixes the "everything went dark and I didn't know" confusion)
- **Descend phase:** 2.2s drop to the floor
- **Question duel:** 6 correct answers to win. Wrong answers *repair* her shields; on Grades 5–6 they also spawn cyberbugs. 3 shields × 2 segments each.
- **Guardian ending** with Vesper's yield and guardian speeches

---

## 9. Technical Notes (hard-won — don't relearn these)

### Higgsfield deploy pipeline
```
media_upload  →  PUT to presigned S3 URL (with Content-Type header)  →  media_confirm  →  deploy_game
```
- Always pass the **existing `game_id`** to `deploy_game` so the URL stays stable.
- `media_confirm` type: `"file"` for zips, `"image"` for images.
- **Every deploy zip MUST contain a no-op `logic.js` stub at the zip root** or the validator rejects it with *"zip must contain server.js or logic.js at its root."* The stub is in this package.
- The sandbox **can** PUT directly to `upload.higgsfield.ai` — fully automated, no user step.
- **CDN links for generated assets expire in ~7 days.** Always download and bundle assets in the zip; never reference the CDN URL from game code.
- Verify a deploy by fetching `?__raw=1` on the game URL, or by curling a specific asset path for a 200.

### Audio on Higgsfield
Higgsfield serves `.mp3` as `application/octet-stream`, which strict browsers (Safari especially) refuse to play. **Fix, already implemented as `rehostAudio()`:** fetch the file, wrap the ArrayBuffer in `new Blob([buf], {type:'audio/mpeg'})`, and assign a blob URL to the audio element. This runs at load so the src is swapped before the first tap, keeping `play()` synchronous inside the user gesture.

### Headless testing
SwiftShader runs at **2–4 fps**, so:
- All Playwright/Puppeteer waits must be multi-second.
- **Any timed animation must use wall-clock time (`performance.now()`), not accumulated `dt`** — the entrance cinematic and descend phases both do this, plus failsafe unlock timers.
- Launch flags that work: `--no-sandbox --enable-unsafe-swiftshader --use-angle=swiftshader --enable-webgl --ignore-gpu-blocklist`
- Serve with `setsid python3 -m http.server 8099` (plain `&` gets reaped between bash calls).
- **Fastest way to reach any board:** seed a save before scripts run, then click resume:
```js
await page.evaluateOnNewDocument(() => {
  localStorage.setItem('screenhop3d.save.v1', JSON.stringify(
    {chosen:'natalia', grade:'3', board:7, keys:7, gems:20, score:900, grades:{}, mastery:{}, ts:Date.now()}));
});
// then click #resumeBtn
```
(`board` is 0-indexed: `board:7` = sector 8, the boss.)

### Debug hooks (exposed on `window`)
`__v22()` (full state snapshot: board, decks, pads, quota, boss mode/height, iframes), `__bossState()`, `__forceExpose()` (skip to duel), `__tpToBoss()`, `__tpToPortal()`, `__solveAll()`, `__openCP()`, `__jump()`, `__jumpPad()`, `__zap()`, `__killAll()`, `__diag()`, `__voState()`, `__glitcherVO()`, `__st()`, `S_test_clear()`.

---

## 10. File Structure

```
/
├── index.html              (476 lines — all UI, CSS, screens, HUD, modals)
├── logic.js                (REQUIRED no-op stub for the Higgsfield validator)
└── assets/
    ├── game3d.js           (2,185 lines — the entire game engine)
    ├── edu-bank.js         (305-question AGA curriculum bank v3)
    ├── teach-bank.js       (teaching engine: lessons, reteach cards)
    ├── teach-extra.js      (additional lesson content)
    ├── *.glb               (3 character models)
    ├── *.png               (portraits, faces, bug sprites, title card)
    └── *.mp3               (music, story narration, 25 voice files)
```

**`game3d.js` is the whole game** — board generation, physics, AI, boss state machine, puzzle flow, HUD, minimap, audio, save/load. It's a single ES module imported via importmap.

---

## 11. Key Code Landmarks in `game3d.js`

| What | Where / how to find it |
|---|---|
| Board configs (all 8 sectors) | `const BOARDS = [` near line 51 |
| Audio setup + `rehostAudio()` | ~line 159 |
| `playGlitcher()`, `showBossBanner()`, `scheduleHoverTaunt()` | after the VO loaders |
| `playIntroVO()` / `playSectorVO()` | Roman narration |
| `buildBoard()` | ~line 432 — maze gen, decks, pads, stations, bugs, hazards, boss |
| Deck/platform creation | `deckSpots` → `S.decks[]` inside `buildBoard()` |
| `stationQuota()` | questions per checkpoint (2 on boss board, 3 elsewhere) |
| `makeBoss()` | boss object; starts at `y:20`, `mode:'arrive'` |
| Boss state machine | `// ---- The Glitcher ----` in `update()` — arrive → hover → descend → duel |
| Vertical physics / landing grace | `// ---- vertical physics` in `update()` |
| Bug AI | `// ---- bugs ----` in `update()` |
| `openPuzzle()` / `openBattle()` | checkpoint and duel question flow |
| Save/resume | `SAVE_KEY = 'screenhop3d.save.v1'` ~line 1983 |

---

## 12. AGA Universe Canon (locked — respect in all content)

- **Screen Hop is a digital layer inside Futuria World**, which is world #5 of the 8 Primary Adventure Worlds.
- **The three sisters:** Natalia (Strategist), Alana (Creative Solver), Maya (Adventurer).
- **S.P.A.R.K.** is male (he/him), an equal teammate. Four tone modes: nerdy enthusiasm, genuine wonder, deadpan one-liners, protective big-brother energy. Never appears in episode opening discovery scenes.
- **The Glitcher is wound-based, not evil** — she was trapped and forgotten. The ending is redemption, not destruction. (Creative reference: *Tales of Arcadia*.)
- **Girls should not sound too knowledgeable** when learning STEM/business — adults, mentors, and S.P.A.R.K. guide them.
- Target audience: **ages 8–12.**

---

## 13. Open Items / Next Steps

1. **Re-playtest v22 with Michelle's daughter.** Specifically: does the 22-question finale (16 checkpoint + 6 duel) feel epic or exhausting? That number is easy to tune. Also confirm the landing grace feels fair and the BOSS BATTLE banner removes the confusion.
2. **Image-based component textures** — Michelle has photos of real computer components to replace the procedural wall/floor textures. Not yet supplied.
3. **Question bank growth** — 305 items is thin for replayability across 4 grades. Append to `edu-bank.js` in the existing format; no code changes needed.

---

## 14. Working Preferences (Michelle)

- Direct, honest, no sugar-coating. No unnecessary praise. "Business shark" feedback when reviewing work.
- Eighth-grade reading level, novice-friendly, step-by-step when building.
- Preferred name: Michelle.
