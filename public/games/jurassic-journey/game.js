// Gyrosphere: Volcanic Escape - main game module.
// Three.js rendering, custom fixed-timestep sphere physics, DOM UI overlays.
import * as THREE from "./vendor/three.module.min.js";
import { GLTFLoader } from "./vendor/GLTFLoader.js";
import { STR } from "./strings.js";
import { ASSETS } from "./assets-config.js";
import { AudioEngine } from "./audio.js";
import { mulberry32, makeProblem, FAMILY_LABELS, makeProblemG4, FAMILY_LABELS_G4, makeProblemG5, FAMILY_LABELS_G5 } from "./mathgen.js";

// ── AGA platform bridge ────────────────────────────────────────────────
// Tells the Allen Girls Adventures site when a checkpoint question is answered
// and how many jewels (coins) have been earned, so real store points +
// parent/teacher reports work. Safe no-op when played outside the site.
function agaPost(msg) {
  try {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(Object.assign({ source: "aga-game" }, msg), window.location.origin);
    }
  } catch (e) { /* not embedded — ignore */ }
}
let _agaLastCoins = -1;
function agaReportCoins(total) {
  if (typeof total !== "number" || total === _agaLastCoins) return;
  _agaLastCoins = total;
  agaPost({ type: "coins", total });
}

// ---------------------------------------------------------------- constants
const STEP = 1 / 60;
const GRAV = 22;
const SPH_R = 0.8;
const ACCEL = 20;
const BRAKE = 34;
const MAXSPD = 13;
const FRICTION = 2.2;       // per-second velocity damping when grounded
const AIR_FRICTION = 0.25;
const HOP_VY = 7.6;
const KILL_Y = -12;
const DPR_CAP = 1.5;
const SKINS = {
  classic:  { name: "Classic",   color: 0xbfeff5, emissive: 0x0a2a30, price: 0 },
  ember:    { name: "Ember",     color: 0xff7a2a, emissive: 0x5a1a00, price: 20 },
  jade:     { name: "Jade",      color: 0x4ff0a0, emissive: 0x043a24, price: 20 },
  amethyst: { name: "Amethyst",  color: 0xb46eff, emissive: 0x2a0a4a, price: 30 },
  gold:     { name: "Gold",      color: 0xffd23a, emissive: 0x4a3200, price: 40 }
};
const BOOSTS = {
  startTurbo:  { name: "Starting Turbo", tag: "Begin each level with a turbo", price: 60 },
  extraSphere: { name: "Extra Sphere",   tag: "Begin with +1 life",          price: 80 }
};
// Terrain difficulty. Explorer/Cadet/Commander are reserved as progression
// RANK titles (AGA-TEC-002) - these names are trail intensity, not rank.
// hazard scales dino aggression + pterodactyl dive speed/frequency. Math
// difficulty is NOT tied to this; it comes from level tier + adaptive weights.
const DIFFICULTY = {
  scenic: { timer: 1.3, hazard: 0.75, label: "SCENIC TRAIL" },
  wild:   { timer: 1.0, hazard: 1.0,  label: "WILD RIDE" },
  rush:   { timer: 0.8, hazard: 1.35, label: "VOLCANO RUSH" }
};
const THEMES = [
  { sky: "sky1", fog: 0x8fa06a, fogNear: 40, fogFar: 145, ground: 0xffffff, station: 0x2ee6ef },   // Ember Landing: sunny valley
  { sky: "sky2", fog: 0xcbb083, fogNear: 30, fogFar: 105, ground: 0xd8c8a8, station: 0xffd23a },   // Geyser Fields: golden mist
  { sky: "sky3", fog: 0x232c26, fogNear: 28, fogFar: 95, ground: 0x9ab89a, station: 0x5df08a },    // Crumbling Span: dark swamp
  { sky: "sky4", fog: 0x6a4632, fogNear: 36, fogFar: 125, ground: 0xc89868, station: 0xff6a2a },   // Magma Terraces: red canyon
  { sky: "sky5", fog: 0x2c3a30, fogNear: 34, fogFar: 115, ground: 0xffffff, station: 0xff4a6a },   // Caldera Gauntlet: storm jungle
  { sky: "sky6", fog: 0x4a3028, fogNear: 32, fogFar: 110, ground: 0x9a7860, station: 0xffa030 },   // Firefall Ridge: ash twilight
  { sky: "sky7", fog: 0x7ab8c0, fogNear: 42, fogFar: 145, ground: 0xa8d8b8, station: 0x3ad8ff },   // Rapids Run: tropical lagoon
  { sky: "sky8", fog: 0x51345e, fogNear: 36, fogFar: 130, ground: 0xb8a4c0, station: 0xb46eff }    // Summit of the Titans: sunset peaks
];
const SISTERS = [
  { key: "natalia", name: STR.natalia, desc: STR.nataliaDesc, color: "#a06ee0", img: () => ASSETS.images.charNatalia },
  { key: "alana", name: STR.alana, desc: STR.alanaDesc, color: "#8a4fd8", img: () => ASSETS.images.charAlana },
  { key: "maya", name: STR.maya, desc: STR.mayaDesc, color: "#f0c93c", img: () => ASSETS.images.charMaya }
];

// ---------------------------------------------------------------- utilities
const $ = (id) => document.getElementById(id);
function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
function lerp(a, b, t) { return a + (b - a) * t; }

let saveData = { unlocked: 1, best: [0, 0, 0, 0, 0, 0, 0, 0], jewels: 0, difficulty: "wild", grade: "g3", owned: [], equippedSkin: "classic", boosts: [], famStats: {}, famStatsG4: {}, famStatsG5: {}, daily: null, aga: 0, rating: [0, 0, 0, 0, 0, 0, 0, 0], cleared: [false, false, false, false, false, false, false, false] };
try {
  const raw = localStorage.getItem("gyrosphere_save");
  if (raw) saveData = Object.assign(saveData, JSON.parse(raw));
} catch (e) {}
// migrate pre-rename difficulty keys (explorer/cadet/commander are now reserved rank titles)
const DIFF_MIGRATE = { explorer: "scenic", cadet: "wild", commander: "rush" };
if (DIFF_MIGRATE[saveData.difficulty]) saveData.difficulty = DIFF_MIGRATE[saveData.difficulty];
function persist() { try { localStorage.setItem("gyrosphere_save", JSON.stringify(saveData)); } catch (e) {} }

// ------------------------------------------------------- procedural texture
// Periodic value noise => mathematically seamless basalt tile + magma veins.
function makeBasaltTextures(size) {
  const N = 8; // lattice period
  const seedRng = mulberry32(20260703);
  const grid = [];
  for (let i = 0; i < N * N; i++) grid.push(seedRng());
  const val = (x, y) => grid[((y % N + N) % N) * N + ((x % N + N) % N)];
  const smooth = (t) => t * t * (3 - 2 * t);
  function noise(fx, fy) {
    const x0 = Math.floor(fx), y0 = Math.floor(fy);
    const tx = smooth(fx - x0), ty = smooth(fy - y0);
    const a = val(x0, y0), b = val(x0 + 1, y0), c = val(x0, y0 + 1), d = val(x0 + 1, y0 + 1);
    return lerp(lerp(a, b, tx), lerp(c, d, tx), ty);
  }
  function fbm(u, v) { // periodic by construction (all octaves integer multiples)
    return 0.55 * noise(u * N, v * N) + 0.3 * noise(u * 2 * N, v * 2 * N) + 0.15 * noise(u * 4 * N, v * 4 * N);
  }
  const cv = document.createElement("canvas"); cv.width = cv.height = size;
  const ex = document.createElement("canvas"); ex.width = ex.height = size;
  const c1 = cv.getContext("2d"), c2 = ex.getContext("2d");
  const img = c1.createImageData(size, size), eimg = c2.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / size, v = y / size;
      const n = fbm(u, v);
      const ridg = Math.abs(fbm(u + 0.31, v + 0.17) - 0.5) * 2; // vein field
      const vein = ridg < 0.06 ? (1 - ridg / 0.06) : 0;
      const base = 26 + n * 34;
      const i = (y * size + x) * 4;
      img.data[i] = base + vein * 30; img.data[i + 1] = base * 0.95; img.data[i + 2] = base * 1.05 + 6;
      img.data[i + 3] = 255;
      const g = vein * (0.6 + 0.4 * fbm(u * 2, v * 2));
      eimg.data[i] = 255 * g; eimg.data[i + 1] = 110 * g; eimg.data[i + 2] = 20 * g; eimg.data[i + 3] = 255;
    }
  }
  c1.putImageData(img, 0, 0); c2.putImageData(eimg, 0, 0);
  const t1 = new THREE.CanvasTexture(cv), t2 = new THREE.CanvasTexture(ex);
  for (const t of [t1, t2]) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; }
  return { map: t1, emissive: t2 };
}

function makeJungleTexture(size) {
  const N = 8;
  const rng = mulberry32(99117);
  const grid = []; for (let i = 0; i < N * N; i++) grid.push(rng());
  const val = (x, y) => grid[((y % N + N) % N) * N + ((x % N + N) % N)];
  const sm = (t) => t * t * (3 - 2 * t);
  function noise(fx, fy) {
    const x0 = Math.floor(fx), y0 = Math.floor(fy);
    const tx = sm(fx - x0), ty = sm(fy - y0);
    return lerp(lerp(val(x0, y0), val(x0 + 1, y0), tx), lerp(val(x0, y0 + 1), val(x0 + 1, y0 + 1), tx), ty);
  }
  const fbm = (u, v) => 0.55 * noise(u * N, v * N) + 0.3 * noise(u * 2 * N, v * 2 * N) + 0.15 * noise(u * 4 * N, v * 4 * N);
  const cv = document.createElement("canvas"); cv.width = cv.height = size;
  const c = cv.getContext("2d");
  const img = c.createImageData(size, size);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const u = x / size, v = y / size;
    const n = fbm(u, v), n2 = fbm(u + 0.4, v + 0.6);
    const i = (y * size + x) * 4;
    img.data[i] = 26 + n2 * 30;
    img.data[i + 1] = 48 + n * 46;
    img.data[i + 2] = 24 + n2 * 22;
    img.data[i + 3] = 255;
  }
  c.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(cv);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function makeWaterTexture(size) {
  const N = 8;
  const rng = mulberry32(424242);
  const grid = []; for (let i = 0; i < N * N; i++) grid.push(rng());
  const val = (x, y) => grid[((y % N + N) % N) * N + ((x % N + N) % N)];
  const sm = (t) => t * t * (3 - 2 * t);
  function noise(fx, fy) {
    const x0 = Math.floor(fx), y0 = Math.floor(fy);
    const tx = sm(fx - x0), ty = sm(fy - y0);
    return lerp(lerp(val(x0, y0), val(x0 + 1, y0), tx), lerp(val(x0, y0 + 1), val(x0 + 1, y0 + 1), tx), ty);
  }
  const fbm = (u, v) => 0.6 * noise(u * N, v * N) + 0.4 * noise(u * 3 * N, v * 3 * N);
  const cv = document.createElement("canvas"); cv.width = cv.height = size;
  const c = cv.getContext("2d");
  const img = c.createImageData(size, size);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const u = x / size, v = y / size;
    const n = fbm(u, v);
    const caustic = Math.pow(Math.abs(fbm(u + 0.5, v + 0.2) - 0.5) * 2, 2);
    const i = (y * size + x) * 4;
    img.data[i] = 30 + caustic * 120;
    img.data[i + 1] = 90 + n * 60 + caustic * 90;
    img.data[i + 2] = 140 + n * 70 + caustic * 60;
    img.data[i + 3] = 255;
  }
  c.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(cv);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function makeFallbackSky() {
  const cv = document.createElement("canvas"); cv.width = 1024; cv.height = 512;
  const c = cv.getContext("2d");
  const g = c.createLinearGradient(0, 0, 0, 512);
  g.addColorStop(0, "#1a1030"); g.addColorStop(0.55, "#3a1f4e"); g.addColorStop(0.8, "#6e3140"); g.addColorStop(1, "#7d3a2a");
  c.fillStyle = g; c.fillRect(0, 0, 1024, 512);
  const rng = mulberry32(7);
  c.fillStyle = "#ffffff";
  for (let i = 0; i < 220; i++) { const y = rng() * 300; c.globalAlpha = 0.3 + rng() * 0.7; c.fillRect(rng() * 1024, y, 1.5, 1.5); }
  c.globalAlpha = 1;
  const tex = new THREE.CanvasTexture(cv);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Load an image and remove its solid green key background in-browser.
// Resolves to a canvas with alpha; rejects if load or keying fails.
function loadKeyedImage(url, key = "green") {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const cv = document.createElement("canvas");
        cv.width = img.width; cv.height = img.height;
        const c = cv.getContext("2d");
        c.drawImage(img, 0, 0);
        const d = c.getImageData(0, 0, cv.width, cv.height);
        const px = d.data;
        for (let i = 0; i < px.length; i += 4) {
          const r = px[i], g = px[i + 1], b = px[i + 2];
          // dominance of the key color = background
          const greenness = key === "magenta" ? Math.min(r, b) - g : g - Math.max(r, b);
          const keyHigh = key === "magenta" ? Math.min(r, b) : g;
          if (keyHigh > 90 && greenness > 34) {
            const t = clamp((greenness - 34) / 60, 0, 1);
            px[i + 3] = Math.round(255 * (1 - t));
            // despill edge pixels
            if (t < 1) { if (key === "magenta") { px[i] = px[i + 2] = g; } else px[i + 1] = Math.max(r, b); }
          } else if (greenness > 14 && keyHigh > 110) {
            if (key === "magenta") { const m = Math.round((g + Math.min(r, b)) / 2); px[i] = Math.min(px[i], m + 30); px[i + 2] = Math.min(px[i + 2], m + 30); }
            else px[i + 1] = Math.round((r + b) / 2 + greenness * 0.3); // soft despill
          }
        }
        c.putImageData(d, 0, 0);
        resolve(cv);
      } catch (err) { reject(err); } // canvas tainted (no CORS) or other failure
    };
    img.onerror = () => reject(new Error("img load failed"));
    img.src = url;
  });
}


function makeQuestionTexture() {
  const cv = document.createElement("canvas"); cv.width = cv.height = 128;
  const c = cv.getContext("2d");
  c.fillStyle = "#f5c518"; c.beginPath(); c.arc(64, 64, 58, 0, 6.3); c.fill();
  c.fillStyle = "#241a44"; c.font = "bold 84px sans-serif"; c.textAlign = "center"; c.textBaseline = "middle";
  c.fillText("?", 64, 70);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function makeSisterFallback(s) {
  const cv = document.createElement("canvas"); cv.width = cv.height = 128;
  const c = cv.getContext("2d");
  c.fillStyle = s.color; c.beginPath(); c.arc(64, 64, 56, 0, 6.3); c.fill();
  c.fillStyle = "#fff"; c.font = "bold 64px sans-serif"; c.textAlign = "center"; c.textBaseline = "middle";
  c.fillText(s.name[0], 64, 68);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// ---------------------------------------------------------------- levels
// Platform: {x,y,z,w,h,d, ramp:{axis:'z',y0,y1}?, breakable?, id}
// Everything is authored along +Z. y = TOP surface height of the platform.
function buildLevels() {
  const L = [];
  let pid = 0;
  function mk() {
    const lv = { platforms: [], ents: [], spawn: { x: 0, z: 2 }, timer: 120, tier: 0 };
    lv.P = (x, z, w, d, y = 0, opts = {}) => {
      lv.platforms.push(Object.assign({ id: pid++, x, z, w, d, y, h: 1.2 }, opts));
    };
    lv.ramp = (x, z0, z1, w, y0, y1) => {
      lv.platforms.push({ id: pid++, x, z: (z0 + z1) / 2, w, d: z1 - z0, y: Math.max(y0, y1), h: 1.2, ramp: { z0, z1, y0, y1 } });
    };
    lv.E = (type, x, z, opts = {}) => lv.ents.push(Object.assign({ type, x, z }, opts));
    return lv;
  }

  // ---- LEVEL 1 - EMBER LANDING (tutorial, wide, gentle)
  {
    const lv = mk(); lv.timer = 210; lv.tier = 0; lv.name = STR.level1;
    lv.P(0, 10, 10, 24);                      // start pad z -2..22
    lv.P(0, 40, 8, 36);                       // z 22..58
    lv.E("crystal", -2, 34); lv.E("crystal", 2, 44); lv.E("crystal", 0, 52);
    lv.E("pad", 2.4, 50);                     // bounce up to the bonus ledge
    lv.P(2.4, 55, 4, 8, 4.4);                 // bonus ledge above the road
    lv.E("star", 2.4, 55, { y: 4.4 }); lv.E("crystal", 2.4, 58, { y: 4.4 });
    lv.ramp(0, 58, 78, 8, 0, -2);             // gentle downhill
    lv.E("checkpoint", 0, 70, { y: -2 });
    lv.E("checkpoint", 0, 98, { y: -2 });
    lv.P(0, 92, 8, 28, -2);                   // z 78..106
    lv.E("challenge", 0, 90, { kind: "gate", y: -2 });
    lv.E("star", 3.2, 100, { y: -2 });
    lv.E("geyser", 0, 112, { y: -2 });
    lv.P(0, 118, 6, 24, -2);                  // z 106..130
    lv.ramp(0, 130, 150, 6, -2, 1);           // up
    lv.E("checkpoint", 0, 152, { y: 1 });
    lv.P(0, 156, 8, 12, 1);                   // z 150..162
    // ditch: pit floor lower, end wall
    lv.P(0, 169, 8, 14, -2.6, { pit: true }); // pit z 162..176
    lv.E("challenge", 0, 170, { kind: "ditch", y: -2.6 });
    lv.E("wall", 0, 176.6, { w: 8, h: 4.2, y: 1 });
    lv.P(0, 182.5, 6, 13, 1);                 // z 176..189
    lv.P(0, 200.2, 6, 15.6, 1);               // z 192.4..208 (hop gap 189..192.4)
    lv.E("crystal", -1.5, 186, { y: 1 }); lv.E("crystal", 1.5, 196, { y: 1 });
    lv.E("life", 2.4, 204, { y: 1 });
    lv.P(0, 218, 8, 20, 1);                   // z 208..228
    lv.E("portal", 0, 222, { y: 1 });
    lv.tut = [[4, STR.tutMoveDesktop], [30, STR.tutBrake], [84, STR.tutChallenge], [180, STR.tutHop]];
    L.push(lv);
  }

  // ---- LEVEL 2 - GEYSER FIELDS
  {
    const lv = mk(); lv.timer = 200; lv.tier = 1; lv.name = STR.level2;
    lv.P(0, 8, 8, 20);
    lv.P(0, 34, 6, 32);
    lv.E("crystal", 0, 26); lv.E("crystal", -1.5, 40);
    lv.E("checkpoint", 0, 48);
    lv.E("challenge", 0, 62, { kind: "geyserfield" });
    lv.P(0, 78, 7, 56);                       // z 50..106 geyser plain
    for (const [gx, gz] of [[-2, 68], [2, 76], [0, 84], [-2.2, 92], [2.2, 98], [0, 104]]) lv.E("geyser", gx, gz);
    lv.E("crystal", 0, 76); lv.E("star", -2.6, 92);
    lv.P(0, 118, 3, 24);                      // narrow z 106..130
    lv.E("crystal", 0, 120);
    lv.E("checkpoint", 0, 116);
    // breakable tile field z 130..154 (two columns of tiles)
    for (let i = 0; i < 6; i++) {
      lv.P(-1.3, 132 + i * 4, 2.4, 3.6, 0, { breakable: true });
      lv.P(1.3, 134 + i * 4, 2.4, 3.6, 0, { breakable: true });
    }
    lv.P(0, 160, 6, 12);                      // z 154..166
    lv.E("checkpoint", 0, 160);
    lv.E("challenge", 0, 172, { kind: "gate" });
    lv.P(0, 178, 6, 24);                      // z 166..190
    lv.E("crystal", 1.5, 182);
    lv.E("pad", -1.8, 180);                   // bounce up to the life sphere
    lv.P(-1.8, 186, 3.4, 7, 4.4);
    lv.E("life", -1.8, 186, { y: 4.4 });
    lv.E("challenge", 0, 194, { kind: "lift", rise: 4 });
    lv.E("wall", 0, 195.6, { w: 6, h: 5.4, y: 4 });
    lv.P(0, 212, 6, 32, 4);                   // upper z 196..228
    lv.E("crystal", 0, 206, { y: 4 }); lv.E("star", 2.4, 216, { y: 4 });
    lv.P(0, 238, 8, 20, 4);
    lv.E("portal", 0, 242, { y: 4 });
    L.push(lv);
  }

  // ---- LEVEL 3 - THE CRUMBLING SPAN
  {
    const lv = mk(); lv.timer = 190; lv.tier = 2; lv.name = STR.level3;
    lv.P(0, 8, 8, 20);
    lv.P(0, 55, 3.5, 74);                     // long span z 18..92
    lv.E("bumper", 0, 38, { range: 2.6, speed: 1.6 });
    lv.E("bumper", 0, 66, { range: 2.6, speed: 2.1 });
    lv.E("crystal", 0, 30); lv.E("crystal", 0, 52); lv.E("crystal", 0, 78);
    lv.E("star", 1.4, 60);
    lv.E("checkpoint", 0, 94);
    lv.P(0, 100, 6, 16);                      // z 92..108
    lv.emberZone = [92, 200];
    lv.E("challenge", 0, 106, { kind: "bridge", gapZ: [108, 122], width: 4 });
    lv.P(0, 130, 5, 16);                      // z 122..138 (after gap)
    lv.E("crystal", 0, 128);
    lv.P(0, 148, 5, 20);                      // z 138..158
    lv.E("checkpoint", 0, 145);
    lv.E("challenge", 0, 152, { kind: "gate" });
    lv.E("pad", 1.4, 152);                    // bounce over the breakable field (risky shortcut)
    lv.P(1.4, 166, 3, 6, 4.4);
    lv.E("star", 1.4, 166, { y: 4.4 });
    for (let i = 0; i < 5; i++) lv.P((i % 2 ? 1.2 : -1.2), 160 + i * 4, 2.4, 3.6, 0, { breakable: true });
    lv.P(0, 186, 5, 12);                      // z 180..192
    lv.E("checkpoint", 0, 186);
    lv.P(0, 203, 1.8, 22);                    // beam z 192..214
    lv.E("star", 0, 206); lv.E("life", 0, 210);
    lv.P(0, 219, 6, 10, 0);                   // z 214..224
    lv.P(0, 231, 6, 14, -2.6, { pit: true }); // ditch z 224..238
    lv.E("challenge", 0, 232, { kind: "ditch", y: -2.6 });
    lv.E("wall", 0, 238.6, { w: 6, h: 4.2, y: 1 });
    lv.P(0, 250, 7, 22, 1);
    lv.E("crystal", 0, 246, { y: 1 });
    lv.E("portal", 0, 256, { y: 1 });
    L.push(lv);
  }

  // ---- LEVEL 4 - MAGMA TERRACES
  {
    const lv = mk(); lv.timer = 180; lv.tier = 3; lv.name = STR.level4;
    lv.P(0, 8, 8, 20);
    lv.ramp(0, 18, 44, 6, 0, -3);             // steep down
    lv.P(-3, 52, 8, 16, -3);                  // terrace with S-curve
    lv.E("vent", -5, 52, { w: 2.5, d: 6, y: -3, period: 2.4, duty: 0.45 });
    lv.E("crystal", -3, 50, { y: -3 });
    lv.E("checkpoint", -3, 58, { y: -3 });
    lv.ramp(-3, 60, 82, 5, -3, -6);
    lv.P(2, 90, 9, 16, -6);
    lv.E("vent", 4.5, 88, { w: 3, d: 5, y: -6, period: 2.0, duty: 0.4 });
    lv.E("crystal", 2, 92, { y: -6 });
    lv.E("challenge", 2, 100, { kind: "lift", rise: 3 });
    lv.E("wall", 2, 101.6, { w: 9, h: 4.4, y: -3 });
    lv.P(2, 112, 5, 20, -3);
    lv.E("checkpoint", 2, 108, { y: -3 });
    lv.P(2, 131, 1.8, 18, -3);                // beam
    lv.E("star", 2, 134, { y: -3 });
    lv.E("challenge", 2, 144, { kind: "geyserfield", y: -3 });
    lv.P(2, 156, 7, 32, -3);                  // geyser terrace z 140..172
    for (const [gx, gz] of [[0, 150], [4, 158], [1, 166]]) lv.E("geyser", gx, gz, { y: -3 });
    lv.E("crystal", 2, 160, { y: -3 });
    lv.E("bumper", 2, 168, { range: 3, speed: 2.4, y: -3 });
    lv.E("checkpoint", 2, 176, { y: -3 });
    lv.E("challenge", 2, 184, { kind: "gate", y: -3 });
    lv.P(2, 182, 6, 20, -3);                  // z 172..192
    lv.ramp(2, 192, 216, 5, -3, -7);          // steep down with vents at bottom
    lv.P(-2, 224, 8, 16, -7);
    lv.E("vent", -4, 222, { w: 2.5, d: 6, y: -7, period: 1.8, duty: 0.5 });
    lv.E("life", -2, 228, { y: -7 });
    lv.P(-2, 239, 6, 14, -9.6, { pit: true }); // ditch
    lv.E("challenge", -2, 240, { kind: "ditch", y: -9.6 });
    lv.E("wall", -2, 246.6, { w: 6, h: 4.2, y: -6 });
    lv.P(-2, 258, 7, 22, -6);
    lv.E("crystal", -2, 254, { y: -6 });
    lv.E("portal", -2, 264, { y: -6 });
    L.push(lv);
  }

  // ---- LEVEL 5 - THE CALDERA GAUNTLET
  {
    const lv = mk(); lv.timer = 185; lv.tier = 4; lv.name = STR.level5;
    lv.emberZone = [10, 300];
    lv.P(0, 8, 8, 20);
    lv.E("challenge", 0, 26, { kind: "gate" });
    lv.P(0, 34, 6, 32);                       // z 18..50
    lv.E("crystal", 0, 40);
    lv.E("challenge", 0, 52, { kind: "geyserfield" });
    lv.P(0, 66, 7, 36);                       // geysers z 50..84
    lv.E("checkpoint", 3, 56);
    for (const [gx, gz] of [[-2, 58], [2, 64], [0, 72], [-2.2, 80]]) lv.E("geyser", gx, gz);
    lv.E("crystal", -2, 70); lv.E("star", 2.6, 76);
    for (let i = 0; i < 6; i++) lv.P((i % 2 ? 1.2 : -1.2), 88 + i * 4, 2.4, 3.6, 0, { breakable: true });
    lv.P(0, 118, 6, 12);                      // z 112..124
    lv.E("checkpoint", 0, 118);
    lv.P(0, 138, 4, 28);                      // bumper alley z 124..152
    lv.E("bumper", 0, 132, { range: 2.2, speed: 2.6 });
    lv.E("bumper", 0, 144, { range: 2.2, speed: 3.1 });
    lv.E("crystal", 0, 138);
    lv.E("challenge", 0, 158, { kind: "bridge", gapZ: [160, 174], width: 3.5 });
    lv.P(0, 156, 5, 8);                       // z 152..160
    lv.P(0, 182, 5, 16);                      // z 174..190
    lv.E("checkpoint", 0, 182);
    lv.E("vent", -1.5, 196, { w: 2.2, d: 8, period: 1.7, duty: 0.5 });
    lv.E("vent", 1.5, 206, { w: 2.2, d: 8, period: 2.1, duty: 0.5 });
    lv.P(0, 202, 5, 24);                      // vent corridor z 190..214
    lv.E("crystal", 0, 210);
    lv.P(0, 219, 6, 10, 0);
    lv.P(0, 231, 6, 14, -2.6, { pit: true }); // ditch z 224..238
    lv.E("challenge", 0, 232, { kind: "ditch", y: -2.6 });
    lv.E("wall", 0, 238.6, { w: 6, h: 4.2, y: 1 });
    lv.P(0, 246, 6, 14, 1);
    lv.E("challenge", 0, 254, { kind: "lift", rise: 3, y: 1 });
    lv.E("wall", 0, 255.6, { w: 6, h: 4.4, y: 4 });
    lv.P(0, 268, 5, 24, 4);
    lv.E("life", 0, 262, { y: 4 });
    lv.P(0, 288, 1.6, 16, 4);                 // final beam z 280..296
    lv.E("star", 0, 290, { y: 4 });
    lv.P(0, 302, 8, 14, 4);
    lv.E("portal", 0, 304, { y: 4 });
    L.push(lv);
  }

  // ---- LEVEL 6 - FIREFALL RIDGE (fireball rain + big climb and descent)
  {
    const lv = mk(); lv.timer = 190; lv.tier = 4; lv.name = STR.level6;
    lv.fireZone = [40, 205, 2.4];
    lv.P(0, 8, 8, 20);
    lv.ramp(0, 18, 42, 6, 0, 3);              // climb tier 1
    lv.E("crystal", 0, 30, { y: 1.5 });
    lv.P(0, 54, 6, 24, 3);                    // z 42..66
    lv.E("challenge", 0, 56, { kind: "gate", y: 3 });
    lv.tut = [[36, STR.tutFire]];
    lv.E("crystal", -1.5, 62, { y: 3 });
    lv.ramp(0, 66, 88, 5, 3, 6);              // climb tier 2
    lv.P(0, 100, 6, 24, 6);                   // z 88..112
    lv.E("checkpoint", 0, 96, { y: 6 });
    lv.E("pad", 2, 104, { y: 6 });
    lv.P(2, 109, 3.4, 6, 10.4);
    lv.E("star", 2, 109, { y: 10.4 });
    lv.P(0, 126, 4, 28, 6);                   // bumper ridge z 112..140
    lv.E("bumper", 0, 120, { range: 2, speed: 2.6, y: 6 });
    lv.E("bumper", 0, 132, { range: 2, speed: 3.2, y: 6 });
    lv.E("crystal", 0, 126, { y: 6 });
    lv.P(0, 146, 6, 12, 6);                   // z 140..152
    lv.P(0, 159, 6, 14, 2.4, { pit: true });  // ditch z 152..166
    lv.E("challenge", 0, 160, { kind: "ditch", y: 2.4 });
    lv.E("wall", 0, 166.6, { w: 6, h: 4.2, y: 6 });
    lv.P(0, 172, 6, 12, 6);                   // z 166..178
    lv.E("checkpoint", 0, 174, { y: 6 });
    lv.ramp(-2, 178, 214, 5, 6, -4);          // steep switchback descent
    lv.E("crystal", -2, 196, { y: 1 });
    lv.P(-2, 224, 8, 20, -4);                 // z 214..234
    lv.E("checkpoint", -2, 222, { y: -4 });
    lv.E("vent", -4.5, 220, { w: 2.4, d: 6, y: -4, period: 1.9, duty: 0.5 });
    lv.E("challenge", -2, 238, { kind: "geyserfield", y: -4 });
    lv.P(-2, 250, 7, 32, -4);                 // geysers z 234..266
    for (const [gx, gz] of [[-4, 244], [0, 252], [-3, 260]]) lv.E("geyser", gx, gz, { y: -4 });
    lv.E("crystal", -2, 256, { y: -4 }); lv.E("life", 0, 262, { y: -4 });
    lv.E("challenge", -2, 270, { kind: "lift", rise: 4, y: -4 });
    lv.E("wall", -2, 271.6, { w: 7, h: 5.4, y: 0 });
    lv.P(-2, 284, 5, 24, 0);
    lv.E("crystal", -2, 280, { y: 0 });
    lv.P(-2, 302, 8, 14, 0);
    lv.E("portal", -2, 304, { y: 0 });
    L.push(lv);
  }

  // ---- LEVEL 7 - RAPIDS RUN (water crossings on rising boulders)
  {
    const lv = mk(); lv.timer = 190; lv.tier = 4; lv.name = STR.level7;
    lv.P(0, 8, 8, 20);
    lv.P(0, 32, 6, 28);                       // z 18..46
    lv.E("crystal", 0, 28); lv.E("crystal", -1.5, 38);
    lv.E("checkpoint", 0, 42);
    lv.tut = [[40, STR.tutBoulder]];
    // CROSSING 1: z 46..90 - five bobbing boulders over the water
    for (let i = 0; i < 5; i++) {
      lv.P((i % 2 ? 1.2 : -1.2), 52 + i * 6.5, 3.2, 3.2, 0.4, { bob: { amp: 1.1, period: 3.2, phase: i * 1.3 } });
    }
    lv.E("crystal", 0, 68, { y: 1.2 });
    lv.P(0, 97, 7, 26, 0);                    // isle z 84..110
    lv.E("challenge", 0, 102, { kind: "gate" });
    lv.E("crystal", 1.5, 108);
    lv.E("challenge", 0, 116, { kind: "bridge", gapZ: [118, 132], width: 4 });
    lv.P(0, 115, 5, 6, 0);                    // lip z 112..118
    lv.P(0, 140, 6, 16, 0);                   // z 132..148
    lv.E("checkpoint", 0, 144);
    lv.E("pad", -2, 146, { y: 0 });
    lv.P(-2, 152, 3.4, 7, 4.4);
    lv.E("life", -2, 152, { y: 4.4 });
    // CROSSING 2: z 148..204 - seven boulders, deeper bob, star mid-water
    for (let i = 0; i < 7; i++) {
      lv.P((i % 2 ? 1.4 : -1.4), 154 + i * 6.4, 3.0, 3.0, 0.4, { bob: { amp: 1.3, period: 2.8, phase: i * 1.1 } });
    }
    lv.E("star", 0, 176, { y: 1.6 });
    lv.P(0, 210, 7, 24, 0);                   // isle z 198..222
    lv.E("checkpoint", 0, 210);
    lv.P(0, 231, 6, 14, -2.6, { pit: true }); // ditch z 224..238
    lv.E("challenge", 0, 232, { kind: "ditch", y: -2.6 });
    lv.E("wall", 0, 238.6, { w: 6, h: 4.2, y: 1 });
    lv.P(0, 252, 5, 28, 1);                   // z 238..266
    lv.E("geyser", -1, 250, { y: 1 }); lv.E("geyser", 1.5, 258, { y: 1 });
    lv.E("crystal", 0, 262, { y: 1 });
    lv.P(0, 276, 8, 16, 1);
    lv.E("portal", 0, 278, { y: 1 });
    L.push(lv);
  }

  // ---- LEVEL 8 - SKYFALL SUMMIT (speed-jump gaps + everything, the graduation exam)
  {
    const lv = mk(); lv.timer = 200; lv.tier = 4; lv.name = STR.level8;
    lv.fireZone = [85, 260, 2.8];
    lv.P(0, 8, 8, 20);
    lv.tut = [[14, STR.tutSpeedJump]];
    lv.ramp(0, 18, 44, 6, 0, -3);             // SPEED RUN 1
    lv.P(0, 50, 6, 12, -3);                   // launch lip z 44..56
    // GAP z 56..64 (8 units - needs speed + hop)
    lv.P(0, 74.75, 7, 26.5, -4.5);            // landing z 61.5..88 (gap 5.5)
    lv.E("crystal", 0, 80, { y: -4.5 });
    lv.E("checkpoint", 0, 90, { y: -4.5 });
    lv.ramp(0, 92, 126, 5, -4.5, 2);          // long climb with vents
    lv.P(0, 134, 6, 16, 2);                   // z 126..142
    lv.E("vent", 1.8, 132, { w: 2.2, d: 6, y: 2, period: 1.8, duty: 0.5 });
    lv.E("challenge", 0, 146, { kind: "gate", y: 2 });
    lv.P(0, 150, 6, 12, 2);                   // z 142..154
    // bobbing platform ridge z 154..184
    for (let i = 0; i < 4; i++) {
      lv.P((i % 2 ? 1.5 : -1.5), 158 + i * 7.5, 2.8, 2.8, 2.4, { bob: { amp: 1.2, period: 3, phase: i * 1.4 } });
    }
    lv.E("crystal", 0, 168, { y: 3.4 });
    lv.P(0, 192, 6, 14, 2);                   // z 184..198
    lv.E("checkpoint", 0, 194, { y: 2 });
    lv.ramp(0, 198, 218, 5, 2, -2);           // SPEED RUN 2
    lv.P(0, 222, 5, 10, -2);                  // lip z 218..227
    // GAP z 227..236 (9 units)
    lv.P(0, 246.75, 7, 26.5, -3.8);           // landing z 233.5..260 (gap 6.5)
    lv.E("crystal", 0, 252, { y: -3.8 });
    lv.E("challenge", 0, 264, { kind: "geyserfield", y: -3.8 });
    lv.P(0, 274, 7, 28, -3.8);                // geysers z 260..288
    for (const [gx, gz] of [[-2, 268], [2, 276], [0, 284]]) lv.E("geyser", gx, gz, { y: -3.8 });
    lv.E("life", 2, 280, { y: -3.8 });
    lv.E("challenge", 0, 292, { kind: "lift", rise: 5, y: -3.8 });
    lv.E("wall", 0, 293.6, { w: 7, h: 6.4, y: 1.2 });
    lv.P(0, 306, 5, 22, 1.2);                 // z 294..316
    lv.E("checkpoint", 0, 300, { y: 1.2 });
    lv.E("crystal", 0, 310, { y: 1.2 });
    lv.P(0, 326, 1.6, 18, 1.2);               // final summit beam z 316..334
    lv.E("star", 0, 328, { y: 1.2 });
    lv.P(0, 342, 8, 14, 1.2);
    lv.E("portal", 0, 344, { y: 1.2 });
    L.push(lv);
  }
  return L;
}

// =================================================================== GAME
export class Game {
  constructor() {
    this.audio = new AudioEngine();
    this.levels = buildLevels();
    this.state = "menu";           // menu|select|levels|howto|playing|quiz|paused|fail|win|final
    this.sisterIdx = 0;
    this.levelIdx = 0;
    this.isTouch = ("ontouchstart" in window);
    this.tiltOn = false;
    this.tiltVec = { x: 0, z: 0 };
    this.joy = null;
    this.held = new Set();
    this.dev = new URLSearchParams(location.search).has("dev");
    this.initThree();
    this.initInput();
    this.initUI();
    this.frames = 0; this.fpsAt = performance.now(); this.fps = 0;
    this.acc = 0; this.last = performance.now(); this.blurPaused = false;
    addEventListener("blur", () => { this.blurPaused = true; if (this.state === "playing") this.showPause(); });
    addEventListener("focus", () => { this.blurPaused = false; this.last = performance.now(); });
    requestAnimationFrame((t) => this.frame(t));
    window.__g = this;
  }

  // ------------------------------------------------------------- three.js
  initThree() {
    this.renderer = new THREE.WebGLRenderer({ canvas: $("c"), antialias: true });
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x2c3a30, 34, 115);
    this.camera = new THREE.PerspectiveCamera(58, 1, 0.1, 400);
    this.resize();
    addEventListener("resize", () => this.resize());
    addEventListener("orientationchange", () => this.resize());

    this.scene.add(new THREE.AmbientLight(0x8877aa, 1.1));
    const sun = new THREE.DirectionalLight(0xffb070, 1.6);
    sun.position.set(-30, 50, -20);
    this.scene.add(sun);
    const rim = new THREE.DirectionalLight(0x40e0e8, 0.5);
    rim.position.set(20, 30, 60);
    this.scene.add(rim);

    // sky
    this.scene.background = makeFallbackSky();
    if (ASSETS.images.skybox) {
      new THREE.TextureLoader().load(ASSETS.images.skybox, (t) => {
        t.mapping = THREE.EquirectangularReflectionMapping;
        t.colorSpace = THREE.SRGBColorSpace;
        this.scene.background = t;
      }, undefined, () => {});
    }

    const tex = makeBasaltTextures(512);
    this.matRock = new THREE.MeshStandardMaterial({
      map: tex.map, emissiveMap: tex.emissive, emissive: new THREE.Color(0xff7020),
      emissiveIntensity: 0.9, roughness: 0.95, metalness: 0.05
    });
    this.texRock = tex;

    this.matTeal = new THREE.MeshStandardMaterial({ color: 0x1a7d84, emissive: 0x2ee6ef, emissiveIntensity: 1.4, roughness: 0.4 });
    this.matTealGlass = new THREE.MeshStandardMaterial({ color: 0x2ee6ef, emissive: 0x2ee6ef, emissiveIntensity: 0.9, transparent: true, opacity: 0.4, side: THREE.DoubleSide });
    this.matStar = new THREE.MeshStandardMaterial({ color: 0xf5c518, emissive: 0xf5a018, emissiveIntensity: 1.2 });
    this.matLife = new THREE.MeshStandardMaterial({ color: 0xa06ee0, emissive: 0x8a4fd8, emissiveIntensity: 1.0 });
    this.matVent = new THREE.MeshStandardMaterial({ color: 0x551a08, emissive: 0xff5010, emissiveIntensity: 0 });
    this.matBumper = new THREE.MeshStandardMaterial({ color: 0x8a8f9a, emissive: 0x2ee6ef, emissiveIntensity: 0.25, metalness: 0.7, roughness: 0.35 });

    // player sphere group
    this.sphere = new THREE.Group();
    const skin = SKINS[saveData.equippedSkin] || SKINS.classic;
    const shell = new THREE.Mesh(
      new THREE.SphereGeometry(SPH_R, 24, 18),
      new THREE.MeshPhongMaterial({ color: skin.color, emissive: skin.emissive, transparent: true, opacity: 0.26, shininess: 90, specular: 0xffffff })
    );
    shell.material.depthWrite = false;
    shell.renderOrder = 10;
    this.shell = shell;
    const ringGeo = new THREE.TorusGeometry(SPH_R * 1.02, 0.05, 8, 40);
    const ringMat = new THREE.MeshStandardMaterial({ color: 0xb9c2cc, metalness: 0.85, roughness: 0.3 });
    this.ring1 = new THREE.Mesh(ringGeo, ringMat);
    this.ring2 = new THREE.Mesh(ringGeo, ringMat); this.ring2.rotation.y = Math.PI / 2;
    this.riderMat = new THREE.SpriteMaterial({ transparent: true });
    this.rider = new THREE.Sprite(this.riderMat);
    this.rider.scale.set(1.0, 1.0, 1);
    this.rider.position.y = -0.06;
    const blobShadow = new THREE.Mesh(
      new THREE.CircleGeometry(SPH_R * 0.95, 20),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35 })
    );
    blobShadow.rotation.x = -Math.PI / 2;
    this.blobShadow = blobShadow;
    this.sphere.add(shell, this.ring1, this.ring2, this.rider);
    this.sphere.traverse((o) => { o.frustumCulled = false; });
    this.scene.add(this.sphere, blobShadow);

    // particle pool
    const PMAX = 420;
    this.pGeo = new THREE.BufferGeometry();
    this.pPos = new Float32Array(PMAX * 3);
    this.pCol = new Float32Array(PMAX * 3);
    this.pGeo.setAttribute("position", new THREE.BufferAttribute(this.pPos, 3));
    this.pGeo.setAttribute("color", new THREE.BufferAttribute(this.pCol, 3));
    this.particles = [];
    for (let i = 0; i < PMAX; i++) this.particles.push({ life: 0, vx: 0, vy: 0, vz: 0 });
    this.points = new THREE.Points(this.pGeo, new THREE.PointsMaterial({ size: 0.22, vertexColors: true, transparent: true, opacity: 0.95 }));
    this.points.frustumCulled = false;
    this.scene.add(this.points);

    this.levelGroup = new THREE.Group();
    this.scene.add(this.levelGroup);
    this.shake = 0;
  }
  resize() {
    const dpr = Math.min(devicePixelRatio || 1, DPR_CAP);
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(innerWidth, innerHeight);
    this.camera.aspect = innerWidth / innerHeight;
    this.camera.updateProjectionMatrix();
  }

  // --------------------------------------------------------------- input
  initInput() {
    const BIND = {
      KeyW: "up", KeyS: "down", KeyA: "left", KeyD: "right",
      ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
      Numpad8: "up", Numpad2: "down", Numpad5: "down", Numpad4: "left", Numpad6: "right",
      Numpad0: "hop", Space: "hop", ShiftLeft: "turbo", ShiftRight: "turbo", NumpadEnter: "turbo"
    };
    addEventListener("keydown", (e) => {
      if (e.code === "Escape" || e.code === "KeyP") { this.togglePause(); return; }
      const c = BIND[e.code];
      if (c) { const fresh = !this.held.has(c); this.held.add(c); if (c === "hop") { this.hopQueued = performance.now(); if (fresh) this.hopPressed = true; } e.preventDefault(); }
    });
    addEventListener("keyup", (e) => { const c = BIND[e.code]; if (c) this.held.delete(c); });

    // virtual joystick (left zone)
    const jz = $("joyZone"), base = $("joyBase"), knob = $("joyKnob");
    let jid = null, ox = 0, oy = 0;
    const setKnob = (dx, dy) => { knob.style.transform = `translate(${dx}px,${dy}px)`; };
    jz.addEventListener("touchstart", (e) => {
      const t = e.changedTouches[0]; jid = t.identifier;
      ox = t.clientX; oy = t.clientY;
      base.style.display = "block";
      base.style.left = (ox - 56) + "px"; base.style.top = (oy - 56) + "px";
      setKnob(0, 0);
      this.joy = { x: 0, z: 0 };
      e.preventDefault();
    }, { passive: false });
    jz.addEventListener("touchmove", (e) => {
      for (const t of e.changedTouches) {
        if (t.identifier !== jid) continue;
        let dx = t.clientX - ox, dy = t.clientY - oy;
        const m = Math.hypot(dx, dy), R = 48;
        if (m > R) { dx = dx / m * R; dy = dy / m * R; }
        setKnob(dx, dy);
        this.joy = { x: dx / R, z: dy / R };
      }
      e.preventDefault();
    }, { passive: false });
    const jend = (e) => {
      for (const t of e.changedTouches) if (t.identifier === jid) {
        jid = null; this.joy = null; base.style.display = "none";
      }
      e.preventDefault();
    };
    jz.addEventListener("touchend", jend, { passive: false });
    jz.addEventListener("touchcancel", jend, { passive: false });

    const bindBtn = (id, cmd) => {
      const el = $(id);
      const dn = (e) => { const fresh = !this.held.has(cmd); this.held.add(cmd); if (cmd === "hop") { this.hopQueued = performance.now(); if (fresh) this.hopPressed = true; } e.preventDefault(); };
      const up = (e) => { this.held.delete(cmd); e.preventDefault(); };
      el.addEventListener("touchstart", dn, { passive: false });
      el.addEventListener("touchend", up, { passive: false });
      el.addEventListener("touchcancel", up, { passive: false });
      el.addEventListener("mousedown", dn); el.addEventListener("mouseup", up);
    };
    bindBtn("btnHop", "hop");
    bindBtn("btnTurbo", "turbo");
    $("btnPause").addEventListener("click", () => this.togglePause());

    // device tilt
    addEventListener("deviceorientation", (e) => {
      if (!this.tiltOn || e.gamma == null) return;
      const landscape = innerWidth > innerHeight;
      let x, z;
      if (landscape) { x = clamp((e.beta || 0) / -25, -1, 1); z = clamp((e.gamma || 0) / 25, -1, 1); }
      else { x = clamp((e.gamma || 0) / 25, -1, 1); z = clamp((e.beta || 0) / 25 - 1.2, -1, 1); }
      this.tiltVec = { x, z };
    });
  }
  requestTilt() {
    const D = window.DeviceOrientationEvent;
    if (D && typeof D.requestPermission === "function") {
      D.requestPermission().then((r) => { if (r !== "granted") { this.tiltOn = false; this.updateToggles(); } }).catch(() => { this.tiltOn = false; this.updateToggles(); });
    }
  }
  gamepadVec() {
    const out = { x: 0, z: 0, hop: false, turbo: false, pause: false };
    for (const gp of (navigator.getGamepads?.() ?? [])) {
      if (!gp) continue;
      if (Math.abs(gp.axes[0]) > 0.18) out.x += gp.axes[0];
      if (Math.abs(gp.axes[1]) > 0.18) out.z += gp.axes[1];
      if (gp.buttons[12]?.pressed) out.z -= 1;
      if (gp.buttons[13]?.pressed) out.z += 1;
      if (gp.buttons[14]?.pressed) out.x -= 1;
      if (gp.buttons[15]?.pressed) out.x += 1;
      if (gp.buttons[0]?.pressed) out.hop = true;
      if (gp.buttons[2]?.pressed || gp.buttons[7]?.pressed) out.turbo = true;
      if (gp.buttons[9]?.pressed) out.pause = true;
    }
    out.x = clamp(out.x, -1, 1); out.z = clamp(out.z, -1, 1);
    return out;
  }
  inputVec() {
    // +z = forward (level direction), x = lateral
    let x = 0, z = 0;
    if (this.held.has("up")) z += 1;
    if (this.held.has("down")) z -= 1;
    if (this.held.has("left")) x -= 1;
    if (this.held.has("right")) x += 1;
    if (this.joy) { x += this.joy.x; z += -this.joy.z; }
    if (this.tiltOn) { x += this.tiltVec.x; z += -this.tiltVec.z; }
    const gp = this.gamepadVec();
    x += gp.x; z += -gp.z;
    this.gpHop = gp.hop; this.gpTurbo = gp.turbo;
    if (gp.pause && !this.gpPauseHeld) this.togglePause();
    this.gpPauseHeld = gp.pause;
    const m = Math.hypot(x, z);
    if (m > 1) { x /= m; z /= m; }
    // camera sits behind the sphere looking forward (+z), so screen-right is world -x
    return { x: -x, z };
  }

  // ------------------------------------------------------------ level load
  applyTheme(idx) {
    const th = THEMES[idx] || THEMES[0];
    this.scene.fog.color.setHex(th.fog);
    this.scene.fog.near = th.fogNear; this.scene.fog.far = th.fogFar;
    this.groundTint = th.ground;
    if (!this.skyCache) this.skyCache = {};
    const url = ASSETS.images[th.sky];
    if (!url) return;
    if (this.skyCache[th.sky]) { this.scene.background = this.skyCache[th.sky]; return; }
    new THREE.TextureLoader().load(url, (t) => {
      t.mapping = THREE.EquirectangularReflectionMapping;
      t.colorSpace = THREE.SRGBColorSpace;
      this.skyCache[th.sky] = t;
      if (this.levelIdx === idx) this.scene.background = t;
    }, undefined, () => {});
  }
  loadLevel(idx) {
    this.levelIdx = idx;
    this.applyTheme(idx);
    const lv = this.levels[idx];
    // clear
    while (this.levelGroup.children.length) {
      const c = this.levelGroup.children.pop();
      this.levelGroup.remove(c);
      if (c.geometry) c.geometry.dispose();
    }
    this.plats = [];
    this.ents = [];
    this.gates = [];
    this.walls = [];
    const rockGeo = new THREE.BoxGeometry(1, 1, 1);
    for (const p of lv.platforms) {
      const P = Object.assign({}, p, { broken: false, breakT: -1 });
      let mesh;
      if (p.ramp) {
        mesh = new THREE.Mesh(rockGeo, this.matRock.clone());
        const len = Math.hypot(p.ramp.z1 - p.ramp.z0, p.ramp.y1 - p.ramp.y0);
        mesh.scale.set(p.w, p.h, len);
        mesh.position.set(p.x, (p.ramp.y0 + p.ramp.y1) / 2 - p.h / 2, (p.ramp.z0 + p.ramp.z1) / 2);
        mesh.rotation.x = Math.atan2(p.ramp.y1 - p.ramp.y0, p.ramp.z1 - p.ramp.z0);
      } else {
        mesh = new THREE.Mesh(rockGeo, this.matRock.clone());
        mesh.scale.set(p.w, p.h, p.d);
        mesh.position.set(p.x, p.y - p.h / 2, p.z);
      }
      const m = mesh.material;
      m.map = this.texRock.map.clone(); m.emissiveMap = this.texRock.emissive.clone();
      const rw = Math.max(1, Math.round((p.w || 4) / 4)), rd = Math.max(1, Math.round((p.d || 4) / 4));
      m.map.repeat.set(rw, rd); m.emissiveMap.repeat.set(rw, rd);
      m.map.needsUpdate = m.emissiveMap.needsUpdate = true;
      if (p.breakable) { m.emissive = new THREE.Color(0x88f0f5); m.emissiveIntensity = 0.25; mesh.material.transparent = true; }
      P.mesh = mesh;
      this.levelGroup.add(mesh);
      this.plats.push(P);
    }
    // entities
    for (const e of lv.ents) {
      const E = Object.assign({ y: 0, taken: false, solved: false, t: Math.random() * 6 }, e);
      this.makeEntMesh(E);
      this.ents.push(E);
    }
    this.emberZone = lv.emberZone || null;
    this.emberTimer = 2;
    this.emberMarks = [];
    this.fireZone = lv.fireZone || null;
    this.fireTimer = 2;
    this.fireballs = [];
    if (!this.fireballGeo) {
      this.fireballGeo = new THREE.SphereGeometry(0.55, 10, 8);
      this.fireballMat = new THREE.MeshBasicMaterial({ color: 0xff7a20 });
    }
    this.fireZones = (lv.fireZones || []).map((z) => ({ z0: z[0], z1: z[1], interval: z[2] / ((DIFFICULTY[saveData.difficulty] || DIFFICULTY.wild).hazard), t: 1.5 }));
    this.meteors = [];
    // player state
    this.spawn = { x: lv.spawn.x, y: 2.5, z: lv.spawn.z };
    this.pos = new THREE.Vector3(this.spawn.x, this.spawn.y, this.spawn.z);
    this.vel = new THREE.Vector3();
    this.grounded = false;
    // 4-hit pool (owner-approved hybrid): hits 1-2 on dino bites = shield
    // (stun + time penalty, no respawn), hit 3 = checkpoint respawn,
    // hit 4 = sphere expires. Falls always respawn (shield can't catch a fall).
    this.lives = 4;
    this.score = 0;
    this.mathSolved = 0;
    this.famStats = {};
    this.starsGot = 0;
    this.jewels = 0;
    const diff = DIFFICULTY[saveData.difficulty] || DIFFICULTY.wild;
    this.hazardMul = diff.hazard;           // scales dino/ptero terrain intensity
    this.difficultyTierOffset = 0;          // math tier no longer tied to terrain difficulty
    this.timeLeft = this.practice ? lv.timer : Math.round(lv.timer * diff.timer);
    this.levelTimer0 = this.timeLeft;       // starting time, for mission-rating time fraction
    this.stationsCleared = 0;               // checkpoints + challenges solved this run (AGA points)
    this.bites = [];                        // T-rex track chomps carved this run (dynamic hazard holes)
    // starting boosts from the store
    saveData.boosts = saveData.boosts || [];
    this.turboStored = saveData.boosts.includes("startTurbo") ? 1 : 0;
    if (saveData.boosts.includes("extraSphere")) this.lives = 5;
    this.geyserFreeze = 0;
    this.deadT = 0;
    this.stunT = 0;
    this.prevBottom = undefined;
    this.liftAnim = null;
    this.rng = mulberry32((Date.now() & 0xffffff) ^ (idx * 7919));
    this.tutShown = new Set();
    this.cpVoiced = false;
    this.camX = this.pos.x;
    this.updateHUD();
    this.rollAngle = 0;
    this.sphere.visible = true;
    this.addScenery(lv);
    this.addWater(lv);
    this.addPteros();
    this.buildJewelTrail();
  }

  addScenery(lv) {
    // ferns: shared geometry, seeded placement on wide platforms
    const rng = mulberry32(1234 + this.levelIdx * 77);
    const frondGeo = new THREE.ConeGeometry(0.55, 1.6, 6);
    const trunkGeo = new THREE.CylinderGeometry(0.09, 0.13, 0.9, 6);
    const frondMat = new THREE.MeshStandardMaterial({ color: 0x2e7d4f, roughness: 0.9 });
    const frondMat2 = new THREE.MeshStandardMaterial({ color: 0x3f9b5a, roughness: 0.9 });
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5a4632, roughness: 1 });
    let ferns = 0;
    for (const p of this.plats) {
      if (ferns >= 26) break;
      if (p.ramp || p.pit || p.breakable || p.w < 6) continue;
      const n = 1 + Math.floor(rng() * 2);
      for (let i = 0; i < n && ferns < 26; i++) {
        const side = rng() < 0.5 ? -1 : 1;
        const fx = p.x + side * (p.w / 2 - 0.55);
        const fz = p.z + (rng() - 0.5) * (p.d - 2);
        const g = new THREE.Group();
        const trunk = new THREE.Mesh(trunkGeo, trunkMat); trunk.position.y = 0.45;
        const f1 = new THREE.Mesh(frondGeo, rng() < 0.5 ? frondMat : frondMat2); f1.position.y = 1.5;
        const f2 = new THREE.Mesh(frondGeo, frondMat2); f2.position.y = 1.1; f2.scale.setScalar(0.7); f2.rotation.y = 0.6;
        g.add(trunk, f1, f2);
        const sc = 0.8 + rng() * 0.7;
        g.scale.setScalar(sc);
        g.position.set(fx, p.y, fz);
        this.levelGroup.add(g);
        ferns++;
      }
    }
    // jungle floor terrain beneath the track
    const minY = Math.min(...this.plats.map((p) => p.ramp ? Math.min(p.ramp.y0, p.ramp.y1) : p.y));
    const maxZ = Math.max(...this.plats.map((p) => p.ramp ? p.ramp.z1 : p.z + p.d / 2));
    this.terrainY = minY - 7;
    if (!this.jungleTex) this.jungleTex = makeJungleTexture(512);
    const tTex = this.jungleTex.clone();
    tTex.repeat.set(30, Math.max(10, Math.round((maxZ + 120) / 10))); tTex.needsUpdate = true;
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(320, maxZ + 160),
      new THREE.MeshStandardMaterial({ map: tTex, roughness: 1, color: this.groundTint || 0xffffff })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, this.terrainY, maxZ / 2);
    this.levelGroup.add(floor);
    // canopy trees scattered across the valley (outside the track corridor)
    const trunkG = new THREE.CylinderGeometry(0.25, 0.4, 1, 6);
    const canG = new THREE.ConeGeometry(1, 1.6, 7);
    const trunkM = new THREE.MeshStandardMaterial({ color: 0x4a3826, roughness: 1 });
    const canM1 = new THREE.MeshStandardMaterial({ color: 0x1f5c38, roughness: 0.95 });
    const canM2 = new THREE.MeshStandardMaterial({ color: 0x2a7346, roughness: 0.95 });
    for (let i = 0; i < 46; i++) {
      const tz = rng() * (maxZ + 40) - 10;
      const side = rng() < 0.5 ? -1 : 1;
      const tx = side * (12 + rng() * 60);
      const h = 5 + rng() * 6;
      const g = new THREE.Group();
      const trunk = new THREE.Mesh(trunkG, trunkM); trunk.scale.y = h; trunk.position.y = h / 2;
      const c1 = new THREE.Mesh(canG, rng() < 0.5 ? canM1 : canM2); c1.scale.set(2.4, 2.6, 2.4); c1.position.y = h + 1;
      const c2 = new THREE.Mesh(canG, canM2); c2.scale.set(1.7, 1.9, 1.7); c2.position.y = h + 2.4;
      g.add(trunk, c1, c2);
      g.position.set(tx, this.terrainY, tz);
      this.levelGroup.add(g);
    }
    // dinosaurs standing in the jungle - predators lunge and snap at the sphere
    if (!this.dinoMats) {
      const loadMat = (u) => {
        const mat = new THREE.SpriteMaterial({ transparent: true, opacity: 0 });
        if (u) loadKeyedImage(u, "magenta").then((cv) => {
          const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
          mat.map = t; mat.opacity = 1; mat.needsUpdate = true;
        }).catch(() => {});
        return mat;
      };
      this.dinoMats = [ASSETS.images.dinoTrex, ASSETS.images.dinoBrachio, ASSETS.images.dinoRaptor].map(loadMat);
      this.dinoAtkMats = [ASSETS.images.dinoTrexAttack, null, ASSETS.images.dinoRaptorAttack].map((u) => u ? loadMat(u) : null);
    }
    this.dinos = [];
    this.dinoWarned = false;
    if (!this.gltfLoader) this.gltfLoader = new GLTFLoader();
    let di = 0;
    for (let z = 72; z < maxZ - 15; z += 55) {
      const near = this.plats.filter((p) => !p.ramp && Math.abs(p.z - z) < 30);
      if (!near.length) continue;
      const base = near[0];
      if (base.y - this.terrainY > 9) continue; // too high for ground predators - pteros rule up here
      const side = di % 2 ? -1 : 1;
      const kind = di % 3; // 0 trex, 1 brachio (peaceful), 2 raptor
      const sp = new THREE.Sprite(this.dinoMats[kind]);
      const sc = kind === 1 ? 14 : kind === 0 ? 10 : 6;
      sp.scale.set(sc, sc, 1);
      const hx = base.x + side * (kind === 1 ? base.w / 2 + 14 : base.w / 2 + 7.5);
      const hy = this.terrainY + sc * 0.46;
      sp.position.set(hx, hy, z);
      this.levelGroup.add(sp);
      const d = {
        sp, node: sp, kind, side, z, sc, is3d: false,
        homeX: hx, homeY: hy, groundY: this.terrainY,
        trackX: base.x + side * (base.w / 2 + 0.5),
        trackY: base.y + sc * 0.34, trackTopY: base.y,
        state: "idle", t: 0, cool: 2 + di,
        patrolDir: 1, worldH: kind === 1 ? 9.5 : kind === 0 ? 4.6 : 2.0
      };
      this.dinos.push(d);
      this.load3dDino(d);
      di++;
    }
  }
  buildJewelTrail() {
    // small gems along the track's safe line between start and portal; the trail
    // follows solid ground (gaps skip themselves), giving a reason to steer well
    const portal = this.ents.find((e) => e.type === "portal");
    if (!portal) return;
    const gemGeo = new THREE.OctahedronGeometry(0.22);
    let placed = 0;
    for (let z = 14; z < portal.z - 6 && placed < 40; z += 7) {
      const wob = Math.sin(z * 0.35) * 2.2; // gentle curve across the lane
      const gh = this.groundAt(wob, z).h;
      if (!isFinite(gh)) continue;                                   // gap: skip (trail marks safety)
      if (this.ents.some((e) => (e.type === "checkpoint" || e.type === "crystal" || e.type === "star") && Math.abs(e.z - z) < 4)) continue;
      const mesh = new THREE.Mesh(gemGeo, this.matTeal);
      mesh.position.set(wob, gh + 0.9, z);
      this.levelGroup.add(mesh);
      this.ents.push({ type: "gem", x: wob, y: gh, z, t: Math.random() * 6, taken: false, mesh });
      placed++;
    }
  }
  load3dDino(d) {
    const url = [ASSETS.models.trex, ASSETS.models.brachio, ASSETS.models.raptor][d.kind];
    if (!url) return;
    this.gltfLoader.load(url, (gltf) => {
      try {
        const model = gltf.scene;
        // normalize to real-world height, feet on the jungle floor
        const box = new THREE.Box3().setFromObject(model);
        const size = new THREE.Vector3(); box.getSize(size);
        const k = d.worldH / (size.y || 1);
        model.scale.setScalar(k);
        const box2 = new THREE.Box3().setFromObject(model);
        model.position.y = -box2.min.y;
        const wrap = new THREE.Group();
        wrap.add(model);
        wrap.position.set(d.homeX, this.terrainY, d.z);
        this.levelGroup.add(wrap);
        d.sp.visible = false;
        d.node = wrap; d.is3d = true;
        d.homeY = this.terrainY;
        d.trackY3d = d.trackTopY; // stands at track height when mauling? no - stays on ground, head reaches track
        if (gltf.animations && gltf.animations.length) {
          d.mixer = new THREE.AnimationMixer(model);
          for (const clip of gltf.animations) d.mixer.clipAction(clip).play();
        }
      } catch (err) { /* keep sprite fallback */ }
    }, undefined, () => { /* keep sprite fallback */ });
  }


  riverPathX(z) {
    const cross = this.riverCrossZ;
    let x = -17 + Math.sin(z * 0.045) * 5;
    if (cross !== null) {
      const k = clamp((z - (cross - 22)) / 44, 0, 1);
      x += 34 * (k * k * (3 - 2 * k));
    }
    return x;
  }
  addWater(lv) {
    if (!this.waterTex) this.waterTex = makeWaterTexture(256);
    this.waters = { rivers: [], lakes: [], falls: [], time: 0 };
    const maxZ = Math.max(...this.plats.map((p) => p.ramp ? p.ramp.z1 : p.z + p.d / 2));
    // a bridge-gap level routes the river to cross beneath the gap
    const bridge = lv.ents.find((e) => e.type === "challenge" && e.kind === "bridge");
    this.riverCrossZ = bridge ? (bridge.gapZ[0] + bridge.gapZ[1]) / 2 : null;
    const wTex = this.waterTex.clone(); wTex.repeat.set(2, 24); wTex.needsUpdate = true;
    const wMat = new THREE.MeshStandardMaterial({
      map: wTex, transparent: true, opacity: 0.78, roughness: 0.12, metalness: 0.15,
      color: 0x9fd8e8, emissive: 0x104a60, emissiveIntensity: 0.35, depthWrite: false
    });
    // river: winding ribbon on the jungle floor
    const L = maxZ + 140;
    const geo = new THREE.PlaneGeometry(8, L, 4, 70);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position;
    const base = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i++) {
      const z = pos.getZ(i) + L / 2 - 10; // world z
      pos.setZ(i, z);
      pos.setX(i, pos.getX(i) + this.riverPathX(z));
      base[i * 3] = pos.getX(i); base[i * 3 + 1] = 0; base[i * 3 + 2] = z;
    }
    geo.computeVertexNormals();
    const river = new THREE.Mesh(geo, wMat);
    river.position.y = this.terrainY + 0.14;
    river.renderOrder = 2;
    this.levelGroup.add(river);
    this.waters.rivers.push({ mesh: river, geo, base, tex: wTex });
    // lakes: still pools that shimmer
    const lakePos = [[22, maxZ * 0.35], [26, maxZ * 0.8]];
    for (const [lx, lz] of lakePos) {
      const lTex = this.waterTex.clone(); lTex.repeat.set(3, 3); lTex.needsUpdate = true;
      const lake = new THREE.Mesh(new THREE.CircleGeometry(9, 26),
        new THREE.MeshStandardMaterial({ map: lTex, transparent: true, opacity: 0.72, roughness: 0.1, metalness: 0.15, color: 0x9fd8e8, emissive: 0x104a60, emissiveIntensity: 0.3, depthWrite: false }));
      lake.rotation.x = -Math.PI / 2;
      lake.scale.set(1.25, 0.75, 1);
      lake.position.set(lx, this.terrainY + 0.12, lz);
      lake.renderOrder = 2;
      this.levelGroup.add(lake);
      this.waters.lakes.push({ mesh: lake, tex: lTex });
    }
    // deadly pools authored in the level get shimmering water surfaces
    for (const e of this.ents) {
      if (e.type !== "pool") continue;
      const pTex = this.waterTex.clone(); pTex.repeat.set(Math.max(1, e.w / 8), Math.max(1, e.d / 8)); pTex.needsUpdate = true;
      const pool = new THREE.Mesh(new THREE.PlaneGeometry(e.w, e.d),
        new THREE.MeshStandardMaterial({ map: pTex, transparent: true, opacity: 0.8, roughness: 0.1, metalness: 0.15, color: 0x8fd0e4, emissive: 0x0e4258, emissiveIntensity: 0.4, depthWrite: false }));
      pool.rotation.x = -Math.PI / 2;
      pool.position.set(e.x, e.y, e.z);
      pool.renderOrder = 2;
      this.levelGroup.add(pool);
      this.waters.lakes.push({ mesh: pool, tex: pTex });
    }
    // waterfalls: scrolling curtains on rock slabs (per-level layout)
    const FALLS = [[], [{ x: -30, z: 120 }], [{ x: -32, z: 60 }, { x: 30, z: 150 }], [], [{ x: -32, z: 200 }], [], [{ x: -30, z: 90 }, { x: 30, z: 150 }], [{ x: -34, z: 100 }]];
    for (const f of (FALLS[this.levelIdx] || [])) {
      const rock = new THREE.Mesh(new THREE.BoxGeometry(10, 15, 3),
        new THREE.MeshStandardMaterial({ color: 0x35302e, roughness: 1 }));
      rock.position.set(f.x, this.terrainY + 7.5, f.z);
      const fTex = this.waterTex.clone(); fTex.repeat.set(1.5, 3); fTex.needsUpdate = true;
      const fall = new THREE.Mesh(new THREE.PlaneGeometry(6, 14),
        new THREE.MeshStandardMaterial({ map: fTex, transparent: true, opacity: 0.85, roughness: 0.1, color: 0xcfeef8, emissive: 0x2a6a80, emissiveIntensity: 0.4, side: THREE.DoubleSide, depthWrite: false }));
      fall.position.set(f.x + (f.x < 0 ? 1.8 : -1.8), this.terrainY + 7.2, f.z);
      fall.rotation.y = f.x < 0 ? Math.PI / 2 : -Math.PI / 2;
      const foam = new THREE.Mesh(new THREE.CircleGeometry(3.2, 18),
        new THREE.MeshBasicMaterial({ color: 0xe8f6fa, transparent: true, opacity: 0.5, depthWrite: false }));
      foam.rotation.x = -Math.PI / 2;
      foam.position.set(f.x + (f.x < 0 ? 2.6 : -2.6), this.terrainY + 0.18, f.z);
      this.levelGroup.add(rock, fall, foam);
      this.waters.falls.push({ fall, tex: fTex, foam });
    }
  }
  updateWater(dt) {
    if (!this.waters) return;
    const w = this.waters;
    w.time += dt;
    for (const r of w.rivers) {
      r.tex.offset.y -= dt * 0.14; // downstream drift
      const pos = r.geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const bx = r.base[i * 3], bz = r.base[i * 3 + 2];
        pos.setY(i, Math.sin(bz * 0.5 + w.time * 2.1) * 0.09 + Math.sin(bx * 0.9 + w.time * 3.2) * 0.05);
      }
      pos.needsUpdate = true;
    }
    for (const l of w.lakes) {
      l.tex.offset.x = Math.sin(w.time * 0.22) * 0.06;
      l.tex.offset.y += dt * 0.02;
      l.mesh.material.opacity = 0.68 + Math.sin(w.time * 1.4) * 0.05;
    }
    for (const f of w.falls) {
      f.tex.offset.y -= dt * 0.9; // plunging curtain
      f.foam.material.opacity = 0.4 + Math.abs(Math.sin(w.time * 4)) * 0.2;
      f.foam.scale.setScalar(1 + Math.sin(w.time * 4) * 0.06);
    }
  }
  addPteros() {
    this.pteros = [];
    if (!this.pteroMat) {
      this.pteroMat = new THREE.SpriteMaterial({ transparent: true, opacity: 0 });
      if (ASSETS.images.ptero) loadKeyedImage(ASSETS.images.ptero, "magenta").then((cv) => {
        const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
        this.pteroMat.map = t; this.pteroMat.opacity = 1; this.pteroMat.needsUpdate = true;
      }).catch(() => {});
    }
    const maxZ = Math.max(...this.plats.map((p) => p.ramp ? p.ramp.z1 : p.z + p.d / 2));
    const count = Math.min(4, 1 + this.levelIdx);
    for (let i = 0; i < count; i++) {
      const anchorZ = 60 + (i + 0.5) * (maxZ - 90) / count;
      const near = this.plats.filter((p) => !p.ramp && Math.abs(p.z - anchorZ) < 40);
      if (!near.length) continue;
      const base = near[0];
      const sp = new THREE.Sprite(this.pteroMat);
      sp.scale.set(4.2, 4.2, 1);
      this.levelGroup.add(sp);
      const shadow = new THREE.Mesh(new THREE.CircleGeometry(1.0, 18),
        new THREE.MeshBasicMaterial({ color: 0x100808, transparent: true, opacity: 0 }));
      shadow.rotation.x = -Math.PI / 2;
      this.levelGroup.add(shadow);
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.5),
        new THREE.MeshStandardMaterial({ color: 0x6b625a, roughness: 1 }));
      this.levelGroup.add(rock);
      this.pteros.push({ sp, shadow, rock, anchorX: base.x, anchorZ, baseY: base.y, t: Math.random() * 6, state: "circle", cool: (4 + i * 2) * (this.levelIdx === 0 ? 2 : 1) });
    }
  }
  updatePteros(dt) {
    if (!this.pteros) return;
    for (const p of this.pteros) {
      p.t += dt;
      p.sp.scale.y = 4.2 * (0.85 + Math.abs(Math.sin(p.t * 5)) * 0.3); // wing flap
      // the carried boulder rides just below the claws whenever not falling
      const carry = (p.state === "circle" || p.state === "approach" || p.state === "warn");
      if (carry) { p.rock.visible = true; p.rock.position.set(p.sp.position.x, p.sp.position.y - 1.1, p.sp.position.z); }
      p.rock.rotation.x += dt * 2; p.rock.rotation.z += dt * 1.5;

      if (p.state === "circle") {
        const a = p.t * 0.7;
        p.sp.position.set(p.anchorX + Math.cos(a) * 8, p.baseY + 9 + Math.sin(p.t * 1.3) * 0.8, p.anchorZ + Math.sin(a) * 5);
        p.sp.material.rotation = Math.sin(a) * 0.15;
        p.cool -= dt;
        if (p.cool <= 0 && Math.abs(this.pos.z - p.anchorZ) < 18 && this.state === "playing" && this.deadT <= 0) {
          p.state = "approach"; p.st = 0;
          p.fromX = p.sp.position.x; p.fromY = p.sp.position.y; p.fromZ = p.sp.position.z;
        }
      } else if (p.state === "approach") {
        // swoop ahead of the sphere, lining up the drop
        p.st += dt / 1.1;
        const k = Math.min(1, p.st);
        p.leadX = this.pos.x; p.leadZ = this.pos.z + Math.max(6, this.vel.z * 0.8);
        p.sp.position.x = lerp(p.fromX, p.leadX, k);
        p.sp.position.z = lerp(p.fromZ, p.leadZ, k);
        p.sp.position.y = lerp(p.fromY, p.baseY + 6.5, k);
        p.sp.material.rotation = -0.15;
        if (k >= 1) { p.state = "warn"; p.st = 0; p.dropX = p.sp.position.x; p.dropZ = p.sp.position.z; }
      } else if (p.state === "warn") {
        // hover with the rock, shadow flashes on the track below
        p.st += dt;
        p.sp.position.x = p.dropX; p.sp.position.z = p.dropZ; p.sp.position.y = p.baseY + 6.5 + Math.sin(p.st * 8) * 0.2;
        p.shadow.position.set(p.dropX, p.baseY + 0.06, p.dropZ);
        p.shadow.material.opacity = 0.25 + Math.abs(Math.sin(p.st * 12)) * 0.35;
        p.shadow.scale.setScalar(0.7 + Math.abs(Math.sin(p.st * 12)) * 0.3);
        if (p.st > 0.9) {
          p.state = "drop"; p.st = 0;
          p.rock.position.set(p.dropX, p.baseY + 5.4, p.dropZ); // released from the claws
          this.audio.tone(700, 0.2, "sawtooth", 0.2, 0); // screech
        }
      } else if (p.state === "drop") {
        // rock falls straight down onto the marked spot; ptero peels away
        p.st += dt;
        p.rock.visible = true;
        p.rock.position.y -= (5 + p.st * 22) * dt;
        p.rock.rotation.x += dt * 10; p.rock.rotation.z += dt * 8;
        p.sp.position.x += (p.sp.position.x < 0 ? -6 : 6) * dt; // bank away empty-clawed
        p.sp.position.y += 2 * dt;
        p.shadow.material.opacity = 0.4 + Math.abs(Math.sin(p.t * 20)) * 0.2;
        if (p.rock.position.y <= p.baseY + 0.4) {
          this.burst(p.dropX, p.baseY + 0.4, p.dropZ, 16, 0.5, 0.44, 0.36);
          this.shake = Math.max(this.shake, 0.35);
          this.audio.tone(80, 0.4, "sawtooth", 0.45, 0); // boom
          const d = Math.hypot(this.pos.x - p.dropX, this.pos.z - p.dropZ);
          if (d < 2.2 && Math.abs(this.pos.y - p.baseY) < 2.6 && this.deadT <= 0) {
            this.vel.x += (this.pos.x - p.dropX) / (d || 1) * 9; // knocked clear, never crushed
            this.vel.z += (this.pos.z - p.dropZ) / (d || 1) * 5;
            this.vel.y = Math.max(this.vel.y, 5);
            this.grounded = false;
            this.audio.play("snap");
          }
          p.rock.visible = false;
          p.shadow.material.opacity = 0;
          p.state = "circle"; p.cool = (5 + Math.random() * 3) / (this.hazardMul || 1);
        }
      }
    }
  }
  updateDinos(dt) {
    if (!this.dinos) return;
    for (const d of this.dinos) {
      d.t = (d.t || 0) + dt;
      const camDist = Math.abs(this.pos.z - d.node.position.z);
      if (d.mixer && camDist < 75) d.mixer.update(dt * (d.animScale || 1));
      if (d.kind === 1) { // brachiosaurus: peaceful giant
        if (d.is3d) {
          d.node.rotation.y = Math.sin(d.t * 0.1) * 0.5 + (d.side > 0 ? Math.PI : 0);
          d.node.position.z = d.z + Math.sin(d.t * 0.12) * 3;
          d.node.position.y = this.terrainY + Math.abs(Math.sin(d.t * 1.1)) * 0.15;
          d.node.rotation.z = Math.sin(d.t * 1.1) * 0.02;
        } else {
          d.sp.material.rotation = Math.sin(d.t * 0.4) * 0.04;
          d.sp.position.z = d.z + Math.sin(d.t * 0.15) * 3;
          d.sp.scale.y = d.sc * (1 + Math.sin(d.t * 0.8) * 0.012);
        }
        continue;
      }
      const isRaptor = d.kind === 2;
      const face = (dx, dz) => { if (d.is3d && (dx || dz)) d.node.rotation.y = Math.atan2(dx, dz); };
      if (d.state === "idle") {
        if (d.is3d) {
          // patrol the jungle floor on walking legs
          d.animScale = 1;
          const speed = isRaptor ? 2.0 : 1.1;
          d.node.position.z += d.patrolDir * speed * dt;
          face(0, d.patrolDir);
          if (d.node.position.z > d.z + 6) d.patrolDir = -1;
          if (d.node.position.z < d.z - 6) d.patrolDir = 1;
          d.node.position.x = d.homeX;
          // procedural walk cycle (static meshes carry no baked animation): step bob + gait roll
          const stepF = isRaptor ? 8 : 5;
          const gait = Math.sin(d.t * stepF);
          d.node.position.y = this.terrainY + Math.abs(gait) * (isRaptor ? 0.12 : 0.18);
          d.node.rotation.z = gait * (isRaptor ? 0.06 : 0.04);
          d.node.rotation.x = Math.sin(d.t * stepF * 2) * 0.02;
        } else {
          d.sp.position.x = d.homeX + Math.sin(d.t * (isRaptor ? 0.9 : 0.45)) * 1.2 * -d.side;
          d.sp.position.z = d.z + Math.sin(d.t * (isRaptor ? 0.7 : 0.3) + 2) * 2.4;
          d.sp.position.y = d.homeY;
          d.sp.scale.y = d.sc * (1 + Math.sin(d.t * (isRaptor ? 3.2 : 1.8)) * 0.02);
          d.sp.material.rotation = Math.sin(d.t * 0.9) * 0.05;
        }
        d.cool -= dt;
        const dz = Math.abs(this.pos.z - d.node.position.z);
        if (d.cool <= 0 && dz < (this.levelIdx === 0 ? 5 : 6.5) && this.state === "playing" && this.deadT <= 0) {
          d.state = "crouch"; d.st = 0;
          this.audio.tone(65, 0.5, "sawtooth", 0.35, 0); // low warning growl
          d.lungeFromX = d.node.position.x; d.lungeFromZ = d.node.position.z;
          d.lungeFromY = d.node.position.y;
          d.targetZ = this.pos.z + this.vel.z * 0.35; // lead the shot
        }
      } else if (d.state === "crouch") {
        d.st += dt;
        const k = Math.min(1, d.st / 0.42);
        if (d.is3d) {
          d.animScale = 0.15; // freeze mid-stride, locked on
          face(this.pos.x - d.node.position.x, this.pos.z - d.node.position.z);
        } else {
          d.sp.scale.y = d.sc * (1 - k * 0.14);
          d.sp.scale.x = d.sc * (1 + k * 0.06);
        }
        if (k >= 1) {
          d.state = "dash"; d.st = 0;
          if (!d.is3d) {
            const atk = this.dinoAtkMats[d.kind];
            if (atk) d.sp.material = atk;
          } else d.animScale = 2.6; // full sprint
          this.burst(d.node.position.x, this.terrainY + 0.4, d.node.position.z, 8, 0.45, 0.38, 0.3);
        }
      } else if (d.state === "dash") {
        d.st += dt * (isRaptor ? 3.2 : 1.9);
        const k = Math.min(1, d.st);
        const e = k * k;
        d.node.position.x = lerp(d.lungeFromX, d.trackX, e);
        d.node.position.z = lerp(d.lungeFromZ, d.targetZ, e);
        if (d.is3d) {
          d.node.position.y = this.terrainY; // charging on foot
          face(d.trackX - d.lungeFromX, d.targetZ - d.lungeFromZ);
        } else {
          d.sp.position.y = lerp(d.homeY, d.trackY + Math.sin(k * Math.PI) * 0.8, e);
          d.sp.scale.y = d.sc * (1 + k * 0.08);
          d.sp.scale.x = d.sc;
          d.sp.material.rotation = -d.side * e * 0.22;
        }
        if (k >= 1) {
          d.state = "maul"; d.st = 0; d.jabs = 0; d.hitDone = false;
          this.audio.play("snap");
          this.shake = Math.max(this.shake, 0.35);
          if (!this.dinoWarned) { this.dinoWarned = true; this.audio.play("voBites", true); }
          // --- T-REX TRACK CHOMP: the big guy tears a bite out of the track corner ---
          if (d.kind === 0 && !d.chompDone) {
            const bz = d.node ? d.node.position.z : d.targetZ;
            const g = this.groundAt(d.trackX, bz);
            const pw = g.p ? g.p.w : 0;
            // only carve when the lane is wide enough that a corner bite leaves the center clear
            if (g.p && pw >= 7 && isFinite(g.h)) {
              d.chompDone = true;
              const r = 2.1;
              const px = (g.p.curX !== undefined) ? g.p.curX : g.p.x;
              // bite the outer corner on the T-rex's side; clamp so the hole never reaches the center lane
              let bx = px + d.side * (pw / 2 - r * 0.6);
              const inner = Math.abs(bx) - r;               // nearest the hole comes to center
              if (inner < 1.3) bx = d.side * (1.3 + r);     // push the bite outward, keep a clear center path
              this.carveBite(bx, bz, r, g.h);
            }
          }
        }
      } else if (d.state === "maul") {
        d.st += dt;
        const jab = Math.sin(d.st * 18);
        if (d.is3d) {
          d.animScale = 2.2;
          face(this.pos.x - d.node.position.x, this.pos.z - d.node.position.z);
          d.node.position.x = d.trackX + -d.side * Math.max(0, jab) * 0.7;
        } else {
          d.sp.position.x = d.trackX + -d.side * Math.max(0, jab) * 0.7;
          d.sp.material.rotation = -d.side * (0.22 + jab * 0.1);
        }
        const jn = Math.floor(d.st * 18 / Math.PI);
        if (jn > d.jabs) {
          d.jabs = jn;
          if (d.jabs > 1) this.audio.tone(90 + Math.random() * 40, 0.1, "sawtooth", 0.3, 0);
          this.burst(d.trackX, d.trackTopY + 0.5, d.node.position.z, 5, 0.5, 0.42, 0.32);
          if (!d.hitDone && this.deadT <= 0) {
            const dx = this.pos.x - d.node.position.x, dz2 = this.pos.z - d.node.position.z;
            if (Math.hypot(dx, dz2) < 3.2 && Math.abs(this.pos.y - d.trackTopY) < 3) {
              d.hitDone = true; // full bite: knockback + shield absorb or life loss
              this.vel.x += -d.side * 8;
              this.vel.y = Math.max(this.vel.y, 4.5);
              this.vel.z += 2;
              this.grounded = false;
              this.audio.play("snap");
              this.hitByDino(); // shield absorbs hits 1-2; hit 3 respawns; hit 4 expires
            }
          }
        }
        if (d.st > 0.62) { d.state = "retreat"; d.st = 0; }
      } else if (d.state === "retreat") {
        d.st += dt * 0.9;
        const k = Math.min(1, d.st);
        d.node.position.x = lerp(d.trackX, d.homeX, k);
        d.node.position.z = lerp(d.targetZ, d.z, k);
        if (d.is3d) {
          d.animScale = 1;
          face(d.homeX - d.trackX, d.z - d.targetZ);
          d.node.position.y = this.terrainY;
        } else {
          if (k > 0.35 && this.dinoAtkMats[d.kind]) d.sp.material = this.dinoMats[d.kind];
          d.sp.position.y = lerp(d.trackY, d.homeY, k);
          d.sp.material.rotation = -d.side * (1 - k) * 0.22;
          d.sp.scale.set(d.sc, d.sc, 1);
        }
        if (k >= 1) { d.state = "idle"; d.cool = (3 + Math.random() * 3) * (this.levelIdx === 0 ? 2 : this.levelIdx === 1 ? 1.4 : 1) / (this.hazardMul || 1); }
      }
    }
  }
  makeEntMesh(E) {
    let m = null;
    if (E.type === "crystal") {
      m = new THREE.Mesh(new THREE.OctahedronGeometry(0.42), this.matTeal);
      m.position.set(E.x, E.y + 1.1, E.z);
    } else if (E.type === "star") {
      m = new THREE.Mesh(new THREE.OctahedronGeometry(0.45, 0), this.matStar);
      m.position.set(E.x, E.y + 1.15, E.z);
    } else if (E.type === "life") {
      m = new THREE.Mesh(new THREE.SphereGeometry(0.38, 14, 10), this.matLife);
      m.position.set(E.x, E.y + 1.1, E.z);
    } else if (E.type === "checkpoint") {
      m = new THREE.Group();
      const arc = new THREE.Mesh(new THREE.TorusGeometry(2.6, 0.14, 8, 40, Math.PI), this.matTeal);
      const barrier = new THREE.Mesh(new THREE.BoxGeometry(6, 3.4, 0.35), this.matTealGlass.clone());
      barrier.position.set(0, 1.7, 0.4);
      m.add(arc, barrier);
      m.position.set(E.x, E.y + 0.15, E.z);
      E.arc = arc; E.barrier = barrier;
      // blocking wall in front of the checkpoint until 3 questions solved
      this.walls.push({ x: E.x, z: E.z + 0.4, w: 6, h: 3.4, y: E.y, open: false, mesh: barrier, cp: E });
    } else if (E.type === "portal") {
      m = new THREE.Group();
      const ring = new THREE.Mesh(new THREE.TorusGeometry(1.9, 0.22, 12, 48), this.matTeal);
      const disc = new THREE.Mesh(new THREE.CircleGeometry(1.7, 40), this.matTealGlass);
      m.add(ring, disc);
      m.position.set(E.x, E.y + 2.2, E.z);
      E.spin = m;
    } else if (E.type === "geyser") {
      m = new THREE.Group();
      // fire pit: dark crater ring with glowing lava core
      const rim = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.3, 0.22, 18), new THREE.MeshStandardMaterial({ color: 0x2b2026, roughness: 1 }));
      const lava = new THREE.Mesh(new THREE.CircleGeometry(0.95, 18),
        new THREE.MeshStandardMaterial({ color: 0x903010, emissive: 0xff5a10, emissiveIntensity: 0.5 }));
      lava.rotation.x = -Math.PI / 2; lava.position.y = 0.12;
      // flame jet: inner bright core + outer orange sheath, grows on eruption
      const flameOuter = new THREE.Mesh(new THREE.ConeGeometry(0.85, 6.5, 10, 1, true),
        new THREE.MeshBasicMaterial({ color: 0xff6a1a, transparent: true, opacity: 0.55, depthWrite: false, side: THREE.DoubleSide }));
      const flameInner = new THREE.Mesh(new THREE.ConeGeometry(0.45, 5.2, 8, 1, true),
        new THREE.MeshBasicMaterial({ color: 0xffd23a, transparent: true, opacity: 0.85, depthWrite: false }));
      for (const f of [flameOuter, flameInner]) {
        f.rotation.x = Math.PI; // cone points up from the pit
        f.position.y = 0.1; f.scale.y = 0.01;
        f.renderOrder = 5;
      }
      flameOuter.geometry.translate(0, -3.25, 0);
      flameInner.geometry.translate(0, -2.6, 0);
      m.add(rim, lava, flameOuter, flameInner);
      m.position.set(E.x, E.y + 0.11, E.z);
      E.lava = lava; E.f1 = flameOuter; E.f2 = flameInner;
      E.phase = Math.random() * 4;
    } else if (E.type === "bumper") {
      m = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.1, 0.9), this.matBumper);
      m.position.set(E.x, E.y + 0.55, E.z);
      E.baseX = E.x;
    } else if (E.type === "vent") {
      m = new THREE.Mesh(new THREE.BoxGeometry(E.w, 0.12, E.d), this.matVent.clone());
      m.position.set(E.x, E.y + 0.07, E.z);
      E.mat = m.material;
      E.phase = Math.random() * E.period;
    } else if (E.type === "pad") {
      m = new THREE.Group();
      const disc = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.3, 0.28, 16),
        new THREE.MeshStandardMaterial({ color: 0x0e4a50, emissive: 0x2ee6ef, emissiveIntensity: 1.2 }));
      const ring = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.09, 8, 24),
        new THREE.MeshStandardMaterial({ color: 0xff9c3a, emissive: 0xff7a1a, emissiveIntensity: 1.4 }));
      ring.rotation.x = Math.PI / 2; ring.position.y = 0.18;
      m.add(disc, ring);
      m.position.set(E.x, E.y + 0.14, E.z);
      E.disc = disc;
    } else if (E.type === "wall") {
      m = new THREE.Mesh(new THREE.BoxGeometry(E.w, E.h, 1), this.matRock);
      m.position.set(E.x, E.y + E.h / 2 - E.h, E.z); // top at E.y
      m.position.y = E.y - E.h / 2 + E.h / 2; // wall spans from (E.y - h) up to E.y... set center:
      m.position.y = E.y - E.h / 2 + E.h; // recompute below
      m.position.y = E.y + E.h / 2 - E.h + E.h / 2;
      // simpler: wall top = E.y +? Author intent: wall rises from pit floor to path height + extra.
      m.position.set(E.x, E.y - E.h / 2 + E.h * 0.5 + 0.0, E.z);
      m.position.y = E.y + 0.9; // visual: mostly above path level E.y
      this.walls.push({ x: E.x, z: E.z, w: E.w, h: E.h, y: E.y, open: false, mesh: m });
    }
    if (E.type === "challenge") {
      if (!this.qTex) this.qTex = makeQuestionTexture();
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.qTex, transparent: true }));
      sp.scale.set(1.1, 1.1, 1);
      sp.position.set(E.x, (E.y || 0) + 3.1, E.z);
      this.levelGroup.add(sp);
      E.beacon = sp;
    }
    if (E.type === "challenge" && E.kind === "gate") {
      m = new THREE.Mesh(new THREE.BoxGeometry(7, 3.4, 0.35), this.matTealGlass.clone());
      m.position.set(E.x, E.y + 1.7, E.z);
      E.gateMesh = m;
      this.gates.push(E);
    }
    if (m) { this.levelGroup.add(m); E.mesh = m; }
  }

  // -------------------------------------------------------------- physics
  bobY(p) {
    if (!p.bob) return 0;
    return Math.sin((this.simT || 0) * Math.PI * 2 / p.bob.period + p.bob.phase) * p.bob.amp;
  }
  groundAt(x, z, belowY) {
    // belowY (optional): only platform tops at/below this height count as ground.
    // Without it, an overhead floating platform would register as "the floor" and
    // the real track beneath it would stop existing (the sink-through bug).
    let best = -Infinity, bestP = null;
    for (const p of this.plats) {
      if (p.broken) continue;
      const px = (p.curX !== undefined) ? p.curX : p.x;
      const hw = p.w / 2 + SPH_R * 0.25, hd = (p.ramp ? (p.ramp.z1 - p.ramp.z0) / 2 : p.d / 2) + SPH_R * 0.25;
      const pz = p.ramp ? (p.ramp.z0 + p.ramp.z1) / 2 : p.z;
      if (Math.abs(x - px) > hw || Math.abs(z - pz) > hd) continue;
      let top;
      if (p.ramp) {
        const t = clamp((z - p.ramp.z0) / (p.ramp.z1 - p.ramp.z0), 0, 1);
        top = lerp(p.ramp.y0, p.ramp.y1, t);
      } else top = (p.curY !== undefined) ? p.curY : p.y;
      if (belowY !== undefined && top > belowY) continue;
      if (top > best) { best = top; bestP = p; }
    }
    // T-rex track chomps: a carved bite removes footing at that spot (sphere falls through the hole)
    if (bestP && this.bites) {
      for (const bt of this.bites) {
        if ((x - bt.x) * (x - bt.x) + (z - bt.z) * (z - bt.z) < bt.r * bt.r) return { h: -Infinity, p: null };
      }
    }
    return { h: best, p: bestP };
  }
  updateDynamicPlats(dt) {
    this.platTime = (this.platTime || 0) + dt;
    for (const p of this.plats) {
      if (p.bob) {
        p.prevY = (p.curY !== undefined) ? p.curY : p.y;
        p.curY = p.y + Math.sin(this.platTime / p.bob.period * Math.PI * 2 + p.bob.phase) * p.bob.amp;
        p.mesh.position.y = p.curY - p.h / 2;
      }
      if (p.slide) {
        p.prevX = (p.curX !== undefined) ? p.curX : p.x;
        p.curX = p.x + Math.sin(this.platTime / p.slide.period * Math.PI * 2 + (p.slide.phase || 0)) * p.slide.range;
        p.mesh.position.x = p.curX;
      }
    }
  }
  update(dt) {
    const lv = this.levels[this.levelIdx];
    if (this.state !== "playing") return;

    // timer (frozen in practice mode)
    if (!this.practice) {
      this.timeLeft -= dt;
      if (this.timeLeft <= 0) { this.timeLeft = 0; this.fail(STR.timesUp); return; }
    }

    // tutorial toasts
    if (lv.tut) for (const [z, msg] of lv.tut) {
      if (this.pos.z > z && !this.tutShown.has(z)) {
        this.tutShown.add(z);
        this.toast(this.isTouch && msg === STR.tutMoveDesktop ? STR.tutMove : msg);
      }
    }

    if (this.deadT > 0) {
      this.deadT -= dt;
      if (this.deadT <= 0) this.respawn();
      return;
    }
    if (this.liftAnim) {
      const a = this.liftAnim;
      a.t += dt;
      const k = clamp(a.t / a.dur, 0, 1);
      this.pos.y = lerp(a.y0, a.y1, k * k * (3 - 2 * k));
      this.vel.set(0, 0, 2);
      if (k >= 1) { this.liftAnim = null; this.vel.set(0, 0, 5); }
      this.syncSphere(dt);
      return;
    }

    this.updateDynamicPlats(dt);
    const inp = this.inputVec();
    if (this.stunT > 0) { // shield absorb: sphere tumbles freely, steering locked for a beat
      this.stunT -= dt;
      inp.x = 0; inp.z = 0;
    }
    const wantHop = this.held.has("hop") || this.gpHop || (this.hopQueued > 0 && performance.now() - this.hopQueued < 150);
    const wantTurbo = this.held.has("turbo") || this.gpTurbo;

    // acceleration
    const glowMul = this.speedGlow ? 1.3 : 1;
    const acc = (this.grounded ? ACCEL : ACCEL * 0.45) * glowMul;
    // perfect-run glow: shell shines gold + sparkle trail while rolling
    if (this.shell) {
      if (this.speedGlow) {
        this.shell.material.emissive.setHex(0xf5c518);
        this.shell.material.opacity = 0.34 + Math.sin((this.simT || 0) * 8) * 0.08;
        this.glowT = (this.glowT || 0) + dt;
        if (this.glowT > 0.09 && Math.hypot(this.vel.x, this.vel.z) > 5) {
          this.glowT = 0;
          this.burst(this.pos.x, this.pos.y - SPH_R * 0.5, this.pos.z - 0.5, 2, 0.95, 0.8, 0.2);
        }
      } else if (this._glowWas) {
        const skin = SKINS[saveData.equippedSkin] || SKINS.classic;
        this.shell.material.emissive.setHex(skin.emissive);
        this.shell.material.opacity = 0.26;
      }
      this._glowWas = this.speedGlow;
    }
    // braking: pressing opposite to velocity decelerates faster
    const vdotZ = this.vel.z * inp.z, vdotX = this.vel.x * inp.x;
    const az = inp.z * ((vdotZ < 0) ? BRAKE : acc);
    const ax = inp.x * ((vdotX < 0) ? BRAKE : acc);
    this.vel.x += ax * dt;
    this.vel.z += az * dt;

    // slope: sample ground gradient
    if (this.grounded) {
      const rY = this.pos.y - SPH_R + 0.5;
      const g0 = this.groundAt(this.pos.x, this.pos.z, rY).h;
      const gz = this.groundAt(this.pos.x, this.pos.z + 0.5, rY).h;
      const gx = this.groundAt(this.pos.x + 0.5, this.pos.z, rY).h;
      if (isFinite(g0) && isFinite(gz)) this.vel.z += clamp((g0 - gz), -1, 1) * GRAV * 0.78 * dt;
      if (isFinite(g0) && isFinite(gx)) this.vel.x += clamp((g0 - gx), -1, 1) * GRAV * 0.78 * dt;
    }

    // friction
    const fr = this.grounded ? FRICTION : AIR_FRICTION;
    this.vel.x -= this.vel.x * fr * dt;
    this.vel.z -= this.vel.z * fr * dt;
    const spd = Math.hypot(this.vel.x, this.vel.z);
    if (spd > MAXSPD) { this.vel.x *= MAXSPD / spd; this.vel.z *= MAXSPD / spd; }

    // hop / double-jump
    if (this.jumps === undefined) this.jumps = 0;
    if (this.grounded && wantHop) {
      // first jump: forgiving 150ms buffer so a slightly-early press still fires
      this.vel.y = HOP_VY; this.grounded = false; this.jumps = 1;
      this.hopQueued = 0; this.hopPressed = false;
      this.audio.tone(340, 0.15, "sine", 0.35, 0);
    } else if (!this.grounded && this.hopPressed && this.jumps === 1) {
      // second jump: requires a FRESH press in the air (edge), never chains from a held key
      this.vel.y = HOP_VY * 0.95; this.jumps = 2;
      this.hopPressed = false; // consume only on a successful air-jump
      this.burst(this.pos.x, this.pos.y - SPH_R, this.pos.z, 8, 0.3, 0.9, 0.95);
      this.audio.tone(440, 0.15, "sine", 0.35, 0);
    }
    // turbo
    if (wantTurbo && this.turboStored > 0 && !this.turboLatch) {
      this.turboStored--;
      this.turboLatch = true;
      this.vel.z += 15; this.vel.y = Math.max(this.vel.y, 3.5);
      this.audio.whoosh(0.8);
      this.burst(this.pos.x, this.pos.y, this.pos.z, 26, 0.3, 0.9, 1.0);
      this.updateHUD();
    }
    if (!wantTurbo) this.turboLatch = false;

    // gravity
    this.vel.y -= GRAV * dt;

    // integrate
    this.pos.x += this.vel.x * dt;
    this.pos.z += this.vel.z * dt;
    this.pos.y += this.vel.y * dt;

    // wall collisions (gates + pit walls)
    for (const w of this.walls) {
      if (w.open) continue;
      const hw = w.w / 2 + SPH_R, hh = w.h;
      if (Math.abs(this.pos.x - w.x) < hw && this.pos.y - SPH_R < w.y + 1.2 && this.pos.y + SPH_R > w.y - hh) {
        if (Math.abs(this.pos.z - w.z) < 0.6 + SPH_R) {
          this.pos.z = w.z - (0.6 + SPH_R) * Math.sign(w.z - this.pos.z) * -1;
          if (this.pos.z > w.z) this.pos.z = w.z + 0.6 + SPH_R; else this.pos.z = w.z - (0.6 + SPH_R);
          this.vel.z *= -0.15;
        }
      }
    }
    for (const g of this.gates) {
      if (g.solved) continue;
      if (Math.abs(this.pos.x - g.x) < 3.5 + SPH_R && Math.abs(this.pos.y - (g.y + 1.7)) < 3 && this.pos.z > g.z - (0.4 + SPH_R) && this.pos.z < g.z + 1) {
        // challenges are physical obstacles S.P.A.R.K. auto-powers with stored
        // calculation energy - math lives only at the 3 checkpoints per level
        this.quizEnt = g;
        this.toast(STR.sparkPowers);
        this.audio.chime(1);
        this.resolveChallenge();
      }
    }

    // ground collision (swept: also catches high-speed falls that cross the
    // platform top between two fixed steps - the "roll through the floor" bug).
    // Ground = highest platform top the sphere can actually stand on (feet + step
    // allowance), so a floating platform overhead never hides the real track below.
    const reachY = this.pos.y - SPH_R + 0.5;
    const g = this.groundAt(this.pos.x, this.pos.z, reachY);
    // elevated slabs (tops above reach) are solid from the side: push the sphere
    // out of the volume instead of letting it tunnel through and fall out the bottom
    for (const p of this.plats) {
      if (p.broken) continue;
      const top = p.ramp ? Math.max(p.ramp.y0, p.ramp.y1) : ((p.curY !== undefined) ? p.curY : p.y);
      if (top <= reachY) continue;                       // walkable: handled as ground below
      const slabBottom = top - (p.h || 1);
      if (this.pos.y + SPH_R <= slabBottom + 0.02) continue; // fully under a floater: pass freely
      if (this.pos.y - SPH_R >= top - 0.02) continue;        // fully above: not touching
      const px = (p.curX !== undefined) ? p.curX : p.x;
      const pz = p.ramp ? (p.ramp.z0 + p.ramp.z1) / 2 : p.z;
      const hw = p.w / 2, hd = p.ramp ? (p.ramp.z1 - p.ramp.z0) / 2 : p.d / 2;
      const penX = hw + SPH_R - Math.abs(this.pos.x - px);
      const penZ = hd + SPH_R - Math.abs(this.pos.z - pz);
      if (penX <= 0 || penZ <= 0) continue;              // no horizontal overlap
      if (penX < penZ) {
        this.pos.x = px + Math.sign(this.pos.x - px || 1) * (hw + SPH_R);
        this.vel.x *= -0.1;
      } else {
        this.pos.z = pz + Math.sign(this.pos.z - pz || 1) * (hd + SPH_R);
        this.vel.z *= -0.1;
      }
    }
    this.grounded = false;
    const bottom = this.pos.y - SPH_R;
    const prevBottom = (this.prevBottom !== undefined) ? this.prevBottom : bottom;
    this.prevBottom = bottom;
    const sink = isFinite(g.h) ? g.h - bottom : -1;
    const sweptThrough = isFinite(g.h) && this.vel.y < 0 && prevBottom >= g.h - 0.02 && bottom < g.h;
    if (isFinite(g.h) && ((sink >= -0.02 && sink <= 0.45) || sweptThrough)) {
      if (this.vel.y <= 0.01) {
        this.pos.y = g.h + SPH_R;
        if (g.p && g.p.bob) this.ridingBob = g.p; else this.ridingBob = null;
        if (this.vel.y < -9) this.burst(this.pos.x, g.h, this.pos.z, 8, 0.25, 0.5, 0.55);
        this.vel.y = 0;
        this.grounded = true;
        this.jumps = 0;
        this.hopPressed = false;
        if (g.p) {
          if (g.p.breakable && g.p.breakT < 0) { g.p.breakT = 0.8; }
          if (g.p.pit) this.onPit(g.p);
          if (g.p.slide && g.p.prevX !== undefined) this.pos.x += g.p.curX - g.p.prevX; // ride the ferry
          if (g.p.bob && g.p.prevY !== undefined && g.p.curY > g.p.prevY) this.pos.y += g.p.curY - g.p.prevY; // rise with the stone
        }
      }
    } else if (isFinite(g.h) && sink > 0.45) {
      // hit the side of a platform: bonk, kill horizontal speed, slide down the face
      this.vel.x *= 0.15; this.vel.z *= 0.15;
    }

    this.simT = (this.simT || 0) + dt;
    // breakable timers + bobbing platform meshes
    for (const p of this.plats) {
      if (p.bob && p.mesh) p.mesh.position.y = p.y - p.h / 2 + this.bobY(p);
    }
    for (const p of this.plats) {
      if (p.breakT >= 0 && !p.broken) {
        p.breakT -= dt;
        p.mesh.material.opacity = 0.4 + 0.6 * clamp(p.breakT / 0.8, 0, 1);
        p.mesh.position.x = p.x + (Math.random() - 0.5) * 0.06;
        if (p.breakT <= 0) {
          p.broken = true; p.mesh.visible = false;
          this.burst(p.x, p.y, p.z, 14, 0.5, 0.8, 0.85);
          this.audio.tone(700, 0.2, "triangle", 0.3, 0);
        }
      }
    }

    // entity updates + pickups + triggers
    this.updateEntities(dt);
    this.updateDinos(dt);
    this.updatePteros(dt);
    this.updateWater(dt);

    // crashed into the jungle floor below
    const killAt = (this.terrainY !== undefined) ? this.terrainY + 0.35 : KILL_Y;
    if (this.pos.y - SPH_R < killAt) {
      if (this.deadT <= 0) {
        const overWater = Math.abs(this.pos.x - this.riverPathX(this.pos.z)) < 4.5;
        if (overWater) this.burst(this.pos.x, killAt + 0.4, this.pos.z, 22, 0.55, 0.85, 0.95);
        else this.burst(this.pos.x, killAt + 0.4, this.pos.z, 16, 0.3, 0.6, 0.3);
      }
      this.die();
    }

    this.syncSphere(dt);
    this.updateHUD();
  }
  onPit(p) {
    for (const e of this.ents) {
      if (e.type === "challenge" && e.kind === "ditch" && Math.abs(e.z - p.z) < p.d) {
        if (!e.solved) { this.openQuiz(e); return; }
        // already solved: free auto-launch so respawned players can't get stuck
        if (!this.relaunchLatch) {
          this.relaunchLatch = true;
          setTimeout(() => { this.relaunchLatch = false; }, 1500);
          for (const w of this.walls) if (Math.abs(w.z - (e.z + 6.6)) < 3) { w.open = true; w.mesh.visible = false; }
          this.vel.z = 14; this.vel.y = 13.5; this.grounded = false;
          this.audio.whoosh(0.9);
        }
        return;
      }
    }
  }
  updateEntities(dt) {
    for (const e of this.ents) {
      e.t += dt;
      const dx = this.pos.x - e.x, dz = this.pos.z - e.z;
      const dist = Math.hypot(dx, dz);
      if (e.type === "crystal" && !e.taken) {
        e.mesh.rotation.y += dt * 2;
        e.mesh.position.y = e.y + 1.1 + Math.sin(e.t * 2.4) * 0.12;
        if (dist < 1.15 && Math.abs(this.pos.y - e.mesh.position.y) < 1.6) {
          e.taken = true; e.mesh.visible = false;
          this.timeLeft += 10; this.jewels += 1; this.audio.play("pickup");
          this.toast(STR.timeBonus);
          this.burst(e.x, e.mesh.position.y, e.z, 10, 0.2, 0.9, 0.95);
        }
      } else if (e.type === "gem" && !e.taken) {
        e.mesh.rotation.y += dt * 3;
        e.mesh.position.y = e.y + 0.9 + Math.sin(e.t * 3) * 0.1;
        if (dist < 1.2 && Math.abs(this.pos.y - e.mesh.position.y) < 1.8) {
          e.taken = true; e.mesh.visible = false;
          this.jewels += 1; this.score += 10;
          this.audio.tone(700 + Math.random() * 200, 0.08, "sine", 0.25, 0); // soft chik, no toast spam
        }
      } else if (e.type === "star" && !e.taken) {
        e.mesh.rotation.y += dt * 3;
        if (dist < 1.15 && Math.abs(this.pos.y - e.mesh.position.y) < 1.6) {
          e.taken = true; e.mesh.visible = false;
          this.score += 100; this.starsGot++; this.jewels += 5;
          this.audio.play("pickup"); this.toast(STR.bonusStar);
          this.burst(e.x, e.mesh.position.y, e.z, 12, 0.95, 0.8, 0.2);
        }
      } else if (e.type === "life" && !e.taken) {
        e.mesh.position.y = e.y + 1.1 + Math.sin(e.t * 2) * 0.14;
        if (dist < 1.15) {
          e.taken = true; e.mesh.visible = false;
          this.lives = Math.min(5, this.lives + 1);
          this.audio.play("pickup"); this.toast(STR.extraLife);
        }
      } else if (e.type === "checkpoint") {
        if (!e.solved && dist < 3.2 && this.pos.z < e.z + 0.4 && this.pos.z > e.z - 4 && Math.abs(this.pos.y - e.y) < 3) {
          this.openCheckpoint(e);
        }
      } else if (e.type === "portal") {
        e.spin.rotation.z += dt * 1.4;
        if (dist < 1.9 && Math.abs(this.pos.y - (e.y + 1)) < 3) { this.winLevel(); return; }
      } else if (e.type === "geyser") {
        const frozen = this.geyserFreeze > 0;
        const cyc = frozen ? 999 : ((e.t + e.phase) % 3.4);
        const warning = cyc > 2.0 && cyc < 2.6;
        const blasting = cyc >= 2.6 && cyc < 3.2;
        // lava core glow: dim idle, pulsing bright warning, blinding on blast
        e.lava.material.emissiveIntensity = frozen ? 0.15 : blasting ? 2.6 : warning ? 1.2 + Math.sin(e.t * 22) * 0.6 : 0.5;
        const jet = blasting ? Math.min(1, (cyc - 2.6) / 0.14) * (1 - Math.max(0, (cyc - 3.02) / 0.18)) : 0.01;
        e.f1.scale.y = jet; e.f2.scale.y = jet * 0.95;
        e.f1.rotation.y += dt * 3.5; e.f2.rotation.y -= dt * 5;
        if (blasting && cyc < 2.66) {
          if (dist < 12) this.audio.play("geyser");
          this.burst(e.x, (e.y || 0) + 1.2, e.z, 10, 1, 0.5, 0.1);
        }
        if (blasting && dist < 1.35 && Math.abs(this.pos.y - e.y) < 2 && this.deadT <= 0) {
          this.vel.y = 13; this.grounded = false;
          this.vel.x += (this.rng() - 0.5) * 3;
          this.shake = 0.4;
        }
      } else if (e.type === "bumper") {
        e.mesh.position.x = e.baseX + Math.sin(e.t * e.speed) * e.range;
        const bx = e.mesh.position.x;
        if (Math.abs(this.pos.x - bx) < 1.1 + SPH_R && Math.abs(this.pos.z - e.z) < 0.45 + SPH_R && Math.abs(this.pos.y - (e.y + 0.55)) < 1.4) {
          const push = Math.sign(this.pos.x - bx) || 1;
          this.vel.x = push * 6.5 + Math.cos(e.t * e.speed) * e.range * e.speed * 0.7;
          this.vel.z += 2;
          this.audio.tone(160, 0.15, "square", 0.35, 0);
          this.shake = 0.25;
        }
      } else if (e.type === "pad") {
        e.mesh.scale.y = 1 + Math.max(0, (e.squash || 0)) * 1.6;
        if (e.squash > 0) e.squash -= dt * 3;
        e.disc.material.emissiveIntensity = 1.0 + Math.sin(e.t * 4) * 0.5;
        if (this.grounded && dist < 1.35 && Math.abs(this.pos.y - SPH_R - e.y) < 0.5) {
          this.vel.y = 15.5; this.vel.x *= 0.35; this.vel.z *= 0.35; this.grounded = false; e.squash = 1;
          this.audio.whoosh(0.5); this.audio.tone(240, 0.25, "sine", 0.4, 0);
          this.burst(e.x, e.y + 0.4, e.z, 12, 0.3, 0.9, 0.95);
        }
      } else if (e.type === "pool") {
        if (Math.abs(dx) < e.w / 2 && Math.abs(dz) < e.d / 2 && this.pos.y - SPH_R < e.y + 0.12 && this.deadT <= 0) {
          this.burst(this.pos.x, e.y + 0.3, this.pos.z, 22, 0.55, 0.85, 0.95); // splash!
          this.audio.play("pop");
          this.die();
        }
      } else if (e.type === "vent") {
        const on = ((e.t + e.phase) % e.period) < e.period * e.duty;
        e.mat.emissiveIntensity = on ? 1.8 : 0.12;
        if (on && Math.abs(dx) < e.w / 2 && Math.abs(dz) < e.d / 2 && Math.abs(this.pos.y - SPH_R - e.y) < 0.35 && this.deadT <= 0) {
          this.die();
        }
      } else if (e.type === "challenge") {
        if (e.beacon) {
          e.beacon.visible = !e.solved;
          e.beacon.position.y = (e.y || 0) + 3.1 + Math.sin(e.t * 2.2) * 0.18;
        }
        if (e.solved) { /* handled below for re-entry */ }
      }
      if (e.type === "challenge" && !e.solved) {
        if (e.kind === "gate") {
          e.gateMesh.material.opacity = 0.35 + Math.sin(e.t * 3) * 0.12;
        } else if (e.kind === "geyserfield" || e.kind === "bridge" || e.kind === "lift") {
          if (dist < 2.6 && Math.abs(this.pos.y - (e.y || 0)) < 2.5) this.openQuiz(e);
        }
      } else if (e.type === "challenge" && e.solved && e.kind === "lift") {
        // free re-lift for respawned players approaching from below
        if (!this.liftAnim && dist < 2.4 && this.pos.y < (e.y || 0) + e.rise - 0.5 && Math.abs(this.pos.y - (e.y || 0)) < 2.5) {
          this.liftAnim = { t: 0, dur: 1.3, y0: this.pos.y, y1: (e.y || 0) + e.rise + SPH_R + 0.4 };
          this.audio.whoosh(1.2);
        }
      }
    }
    // geyser freeze timer
    if (this.geyserFreeze > 0) {
      this.geyserFreeze -= dt;
      $("hudFreeze").textContent = `${STR.geysersCalmed}: ${Math.ceil(this.geyserFreeze)}s`;
      $("hudFreeze").style.display = this.geyserFreeze > 0 ? "block" : "none";
    }
    // ember zone
    if (this.emberZone && this.pos.z > this.emberZone[0] && this.pos.z < this.emberZone[1]) {
      this.emberTimer -= dt;
      if (this.emberTimer <= 0) {
        this.emberTimer = 2.4 + this.rng() * 1.6;
        const tx = this.pos.x + (this.rng() - 0.5) * 6;
        const tz = this.pos.z + 4 + this.rng() * 10;
        const gh = this.groundAt(tx, tz).h;
        if (isFinite(gh)) this.emberMarks.push({ x: tx, z: tz, y: gh, t: 1.5, mesh: this.makeRing(tx, gh, tz) });
      }
    }
    // fireball meteors
    for (const fz of this.fireZones) {
      if (this.pos.z > fz.z0 && this.pos.z < fz.z1) {
        fz.t -= dt;
        if (fz.t <= 0) {
          fz.t = fz.interval * (0.8 + this.rng() * 0.5);
          const tx = this.pos.x + (this.rng() - 0.5) * 7;
          const tz = this.pos.z + 5 + this.rng() * 14;
          const gh = this.groundAt(tx, tz).h;
          if (isFinite(gh)) {
            const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.55, 10, 8),
              new THREE.MeshStandardMaterial({ color: 0x903010, emissive: 0xff6a10, emissiveIntensity: 2.2 }));
            mesh.position.set(tx + 4, gh + 24, tz + 3);
            this.levelGroup.add(mesh);
            this.meteors.push({ mesh, tx, tz, ty: gh, t: 0, dur: 1.4, ring: this.makeRing(tx, gh, tz) });
          }
        }
      }
    }
    for (let i = this.meteors.length - 1; i >= 0; i--) {
      const m = this.meteors[i];
      m.t += dt;
      const k = Math.min(1, m.t / m.dur);
      m.mesh.position.x = lerp(m.tx + 4, m.tx, k);
      m.mesh.position.z = lerp(m.tz + 3, m.tz, k);
      m.mesh.position.y = lerp(m.ty + 24, m.ty + 0.4, k * k);
      m.ring.material.opacity = 0.35 + 0.45 * Math.abs(Math.sin(m.t * 12));
      if (Math.random() < 0.5) this.burst(m.mesh.position.x, m.mesh.position.y, m.mesh.position.z, 2, 1, 0.5, 0.1); // flame trail
      if (k >= 1) {
        this.levelGroup.remove(m.mesh, m.ring);
        m.mesh.geometry.dispose(); m.ring.geometry.dispose();
        this.burst(m.tx, m.ty + 0.4, m.tz, 24, 1, 0.45, 0.08);
        this.shake = Math.max(this.shake, 0.55);
        this.audio.tone(70, 0.5, "sawtooth", 0.45, 0);
        const d = Math.hypot(this.pos.x - m.tx, this.pos.z - m.tz);
        if (d < 2.2 && this.deadT <= 0 && Math.abs(this.pos.y - m.ty) < 3) {
          this.vel.x += (this.pos.x - m.tx) / (d || 1) * 7;
          this.vel.z += (this.pos.z - m.tz) / (d || 1) * 7;
          this.vel.y = 5.5; this.grounded = false;
        }
        this.meteors.splice(i, 1);
      }
    }
    // fireball rain: warning ring, then a visible fireball plunges onto the track
    if (this.fireZone && this.pos.z > this.fireZone[0] && this.pos.z < this.fireZone[1]) {
      this.fireTimer -= dt;
      if (this.fireTimer <= 0) {
        this.fireTimer = (this.fireZone[2] || 2.2) + this.rng() * 1.2;
        const tx = this.pos.x + (this.rng() - 0.5) * 7;
        const tz = this.pos.z + 5 + this.rng() * 12;
        const gh = this.groundAt(tx, tz).h;
        if (isFinite(gh)) {
          const ring = this.makeRing(tx, gh, tz);
          const mesh = new THREE.Mesh(this.fireballGeo, this.fireballMat);
          mesh.position.set(tx, gh + 26, tz);
          this.levelGroup.add(mesh);
          this.fireballs.push({ mesh, ring, tx, tz, gh, vy: 0 });
        }
      }
    }
    for (let i = this.fireballs.length - 1; i >= 0; i--) {
      const f = this.fireballs[i];
      f.vy += 30 * dt;
      f.mesh.position.y -= f.vy * dt;
      f.ring.material.opacity = 0.4 + 0.4 * Math.abs(Math.sin((this.simT || 0) * 12));
      if (Math.random() < 0.5) this.burst(f.mesh.position.x, f.mesh.position.y, f.mesh.position.z, 1, 1, 0.5, 0.1);
      if (f.mesh.position.y <= f.gh + 0.5) {
        this.levelGroup.remove(f.mesh);
        this.levelGroup.remove(f.ring); f.ring.geometry.dispose();
        this.burst(f.tx, f.gh + 0.5, f.tz, 26, 1, 0.42, 0.08);
        this.shake = Math.max(this.shake, 0.55);
        this.audio.tone(70, 0.5, "sawtooth", 0.45, 0);
        const d = Math.hypot(this.pos.x - f.tx, this.pos.z - f.tz);
        if (d < 2.6 && this.deadT <= 0) {
          this.vel.x += (this.pos.x - f.tx) / (d || 1) * 10;
          this.vel.z += (this.pos.z - f.tz) / (d || 1) * 10;
          this.vel.y = 7; this.grounded = false;
        }
        this.fireballs.splice(i, 1);
      }
    }
    for (let i = this.emberMarks.length - 1; i >= 0; i--) {
      const m = this.emberMarks[i];
      m.t -= dt;
      m.mesh.material.opacity = 0.35 + 0.45 * Math.abs(Math.sin(m.t * 10));
      if (m.t <= 0) {
        this.levelGroup.remove(m.mesh); m.mesh.geometry.dispose();
        this.burst(m.x, m.y + 0.3, m.z, 20, 1, 0.45, 0.1);
        this.shake = Math.max(this.shake, 0.5);
        this.audio.tone(90, 0.4, "sawtooth", 0.4, 0);
        const d = Math.hypot(this.pos.x - m.x, this.pos.z - m.z);
        if (d < 2.2 && this.deadT <= 0) {
          this.vel.x += (this.pos.x - m.x) / (d || 1) * 8;
          this.vel.z += (this.pos.z - m.z) / (d || 1) * 8;
          this.vel.y = 6; this.grounded = false;
        }
        this.emberMarks.splice(i, 1);
      }
    }
  }
  makeRing(x, y, z) {
    const m = new THREE.Mesh(new THREE.RingGeometry(0.7, 1.05, 24), new THREE.MeshBasicMaterial({ color: 0xff3020, transparent: true, opacity: 0.6, side: THREE.DoubleSide }));
    m.rotation.x = -Math.PI / 2;
    m.position.set(x, y + 0.06, z);
    this.levelGroup.add(m);
    return m;
  }
  burst(x, y, z, n, r, g, b) {
    let used = 0;
    for (const p of this.particles) {
      if (p.life > 0) continue;
      p.life = 0.5 + Math.random() * 0.5;
      p.x = x; p.y = y; p.z = z;
      const a = Math.random() * Math.PI * 2, s = 2 + Math.random() * 5;
      p.vx = Math.cos(a) * s; p.vz = Math.sin(a) * s; p.vy = 2 + Math.random() * 5;
      p.r = r; p.g = g; p.b = b;
      if (++used >= n) break;
    }
  }
  updateParticles(dt) {
    let i = 0;
    for (const p of this.particles) {
      if (p.life > 0) {
        p.life -= dt;
        p.vy -= 14 * dt;
        p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
        this.pPos[i * 3] = p.x; this.pPos[i * 3 + 1] = p.y; this.pPos[i * 3 + 2] = p.z;
        this.pCol[i * 3] = p.r; this.pCol[i * 3 + 1] = p.g; this.pCol[i * 3 + 2] = p.b;
      } else {
        this.pPos[i * 3 + 1] = -999;
      }
      i++;
    }
    this.pGeo.attributes.position.needsUpdate = true;
    this.pGeo.attributes.color.needsUpdate = true;
  }
  hitByDino() {
    // Owner-approved hybrid (exception to strict no-lives canon):
    // hits 1-2 = EXPLORER SHIELD - the sphere cracks and stuns but keeps
    // rolling from where it is (no respawn). Hit 3 falls through to die()
    // (checkpoint respawn), hit 4 expires the sphere.
    if (this.deadT > 0 || this.stunT > 0) return;
    if (this.lives > 2) {
      this.lives--;
      if (!this.practice) this.timeLeft = Math.max(1, this.timeLeft - 5);
      this.stunT = 0.9;                       // brief input lockout - the "shield holding" beat
      this.audio.play("pop");
      this.burst(this.pos.x, this.pos.y, this.pos.z, 16, 0.55, 0.9, 1.0);
      this.flashShield();
      this.toast(STR.shieldHolding);
      this.updateHUD();
      return;
    }
    this.die();
  }
  carveBite(x, z, r, topY) {
    // T-rex tears a bite out of the track corner: a permanent hole + debris + roar + heavy shake.
    this.bites.push({ x, z, r });
    // dark crater ring sitting just below the track surface
    try {
      const geo = new THREE.CircleGeometry(r, 20);
      const mat = new THREE.MeshBasicMaterial({ color: 0x1a0e08 });
      const crater = new THREE.Mesh(geo, mat);
      crater.rotation.x = -Math.PI / 2;
      crater.position.set(x, topY - 0.05, z);
      this.levelGroup.add(crater);
      const rimGeo = new THREE.RingGeometry(r * 0.82, r, 20);
      const rim = new THREE.Mesh(rimGeo, new THREE.MeshBasicMaterial({ color: 0xff7a2a }));
      rim.rotation.x = -Math.PI / 2;
      rim.position.set(x, topY - 0.02, z);
      this.levelGroup.add(rim);
    } catch (e) {}
    // debris burst + audio + camera shake (the spectacle beat)
    this.burst(x, topY + 0.4, z, 34, 1.1, 0.55, 0.25);
    this.shake = Math.max(this.shake, 0.85);
    this.audio.play("snap");
    this.audio.tone(70, 0.5, "sawtooth", 0.35, 0);   // low roar under the snap
    this.toast(STR.trackChomp);
  }
  flashShield() {
    // on-screen cyan pulse so the shield absorb is legible even when the shell flash is subtle
    const sf = $("shieldFlash");
    if (sf) { sf.classList.remove("on"); void sf.offsetWidth; sf.classList.add("on"); }
    // cyan shockwave flash on the shell - visual crack/absorb cue
    const m = this.shell && this.shell.material;
    if (!m) return;
    const orig = m.emissive ? m.emissive.getHex() : null;
    if (m.emissive) {
      m.emissive.setHex(0x2ee6ef);
      setTimeout(() => { try { m.emissive.setHex(orig || 0x000000); } catch (e) {} }, 350);
    }
  }
  die() {
    if (this.deadT > 0) return;
    this.audio.play("pop");
    this.burst(this.pos.x, this.pos.y, this.pos.z, 24, 0.4, 0.85, 0.95);
    this.lives--;
    this.updateHUD();
    this.sphere.visible = false;
    if (this.lives <= 0) { this.fail(STR.outOfSpheres); return; }
    this.deadT = 0.8;
  }
  respawn() {
    this.pos.set(this.spawn.x, this.spawn.y, this.spawn.z);
    this.vel.set(0, 0, 0);
    this.prevBottom = undefined; // reset swept-collision tracker after teleport
    this.sphere.visible = true;
    // restore breakables behind the checkpoint
    for (const p of this.plats) if (p.broken || p.breakT >= 0) {
      p.broken = false; p.breakT = -1; p.mesh.visible = true; p.mesh.material.opacity = 1; p.mesh.position.x = p.x;
    }
  }
  syncSphere(dt) {
    this.sphere.position.copy(this.pos);
    this.sphere.position.y += 0.1; // visual insurance against z-fighting with platform tops
    // roll the shell + rings by horizontal speed
    const spd = Math.hypot(this.vel.x, this.vel.z);
    this.rollAngle += (spd / SPH_R) * dt;
    this.shell.rotation.x = this.rollAngle;
    this.ring1.rotation.x += (this.vel.z / SPH_R) * dt;
    this.ring2.rotation.z -= (this.vel.x / SPH_R) * dt;
    this.rider.material.rotation = Math.sin(this.rollAngle * 0.5) * 0.12;
    const gh = this.groundAt(this.pos.x, this.pos.z).h;
    if (this.grounded && isFinite(gh)) this.sphere.position.y = Math.max(this.sphere.position.y, gh + SPH_R + 0.1);
    this.blobShadow.visible = isFinite(gh);
    if (isFinite(gh)) {
      this.blobShadow.position.set(this.pos.x, gh + 0.03, this.pos.z);
      const k = clamp(1 - (this.pos.y - SPH_R - gh) / 6, 0.2, 1);
      this.blobShadow.scale.setScalar(k);
      this.blobShadow.material.opacity = 0.35 * k;
    }
    this.audio.setRumble(this.grounded ? spd / MAXSPD : 0);
  }
  updateCamera(dt) {
    this.camX = lerp(this.camX, this.pos.x, 1 - Math.exp(-4 * dt));
    const ty = this.pos.y + 5.6, tz = this.pos.z - 9.5;
    this.camera.position.x = lerp(this.camera.position.x, this.camX, 1 - Math.exp(-6 * dt));
    this.camera.position.y = lerp(this.camera.position.y, ty, 1 - Math.exp(-5 * dt));
    this.camera.position.z = lerp(this.camera.position.z, tz, 1 - Math.exp(-6 * dt));
    if (this.shake > 0) {
      this.shake -= dt;
      this.camera.position.x += (Math.random() - 0.5) * this.shake * 0.6;
      this.camera.position.y += (Math.random() - 0.5) * this.shake * 0.6;
    }
    this.camera.lookAt(this.camX, this.pos.y + 1.2, this.pos.z + 5);
  }

  // ------------------------------------------------------------------ quiz
  openCheckpoint(e) {
    if (this.state !== "playing" || e.solved) return;
    this.state = "quiz";
    const cpDone = this.ents.filter((x) => x.type === "checkpoint" && x.solved).length;
    this.cpQuiz = { ent: e, need: cpDone === 0 ? 3 : 4, got: 0, misses: 0 };
    this.speedGlow = false; // glow carries only to the next checkpoint
    this.quizEnt = null;
    const col = (THEMES[this.levelIdx] || THEMES[0]).station;
    const hex = "#" + col.toString(16).padStart(6, "0");
    $("quizPanel").style.borderColor = hex;
    $("stationBar").style.display = "block";
    $("stationFill").style.background = hex;
    $("stationFill").style.width = "0%";
    $("stationFill").style.boxShadow = "0 0 16px " + hex;
    this.showCpQuestion();
    $("quiz").style.display = "flex";
  }
  showCpQuestion(retrySame) {
    const cp = this.cpQuiz;
    if (!retrySame || !this.problem) this.problem = this.nextProblem();
    $("quizIntro").textContent = STR.cpIntro;
    $("quizHeader").textContent = STR.cpProgress(cp.got + 1, cp.need);
    $("quizQ").textContent = this.problem.text;
    // pips: one circle per question, filled as they're earned (kid-legible progress)
    $("stationPips").textContent = "\u25CF".repeat(cp.got) + "\u25CB".repeat(cp.need - cp.got);
    if (retrySame) {
      // S.P.A.R.K. hint on retry of the SAME question - where the learning happens
      $("quizFeedback").textContent = "\uD83D\uDCA1 " + (STR.hints[this.problem.family] || STR.hintDefault);
      $("quizFeedback").style.color = "#7fd8ff";
    } else {
      $("quizFeedback").textContent = "";
    }
    const box = $("quizOpts");
    box.innerHTML = "";
    for (const opt of this.problem.options) {
      const b = document.createElement("button");
      b.className = "qopt";
      b.textContent = opt;
      b.addEventListener("click", () => this.answerCheckpoint(opt, b));
      box.appendChild(b);
    }
  }
  answerCheckpoint(opt, btn) {
    if (this.state !== "quiz" || !this.cpQuiz) return;
    const cp = this.cpQuiz;
    const fam = this.problem.family;
    if (opt === this.problem.answer) {
      this.recordAnswer(fam, true);
      cp.got++;
      $("stationFill").style.width = Math.round(cp.got / cp.need * 100) + "%";
      $("stationPips").textContent = "\u25CF".repeat(cp.got) + "\u25CB".repeat(cp.need - cp.got);
      this.audio.tone(300 + cp.got * 120, 0.25, "sine", 0.4, 0); // rising charge tone
      this.score += 50; this.mathSolved++;
      this.audio.play("correct");
      btn.classList.add("good");
      if (cp.got >= cp.need) {
        this.audio.play("voCorrect", true);
        $("quizFeedback").textContent = STR.cpCleared;
        $("quizFeedback").style.color = "#5df08a";
        setTimeout(() => this.resolveCheckpoint(), 700);
      } else {
        $("quizFeedback").textContent = STR.cpNext(cp.got, cp.need);
        $("quizFeedback").style.color = "#5df08a";
        setTimeout(() => { if (this.state === "quiz" && this.cpQuiz) this.showCpQuestion(); }, 700);
      }
    } else {
      this.recordAnswer(fam, false);
      cp.misses = (cp.misses || 0) + 1;
      this.timeLeft = this.practice ? this.timeLeft : Math.max(1, this.timeLeft - 5);
      this.audio.wrongTone();
      this.audio.play("voRetry", true);
      $("quizFeedback").textContent = STR.tryAgain;
      $("quizFeedback").style.color = "#ff8f6a";
      btn.classList.add("bad");
      const panel = $("quizPanel");
      panel.classList.remove("shakeAnim"); void panel.offsetWidth; panel.classList.add("shakeAnim");
      // choice: try again, or spend one of the level's 2 passes to move on
      const box = $("quizOpts");
      box.innerHTML = "";
      const retry = document.createElement("button");
      retry.className = "qopt";
      retry.textContent = STR.tryAgainBtn;
      retry.addEventListener("click", () => { if (this.state === "quiz" && this.cpQuiz) this.showCpQuestion(true); });
      box.appendChild(retry);
      if ((this.passesLeft || 0) > 0) {
        const pass = document.createElement("button");
        pass.className = "qopt";
        pass.textContent = STR.passBtn(this.passesLeft);
        pass.addEventListener("click", () => {
          if (this.state !== "quiz" || !this.cpQuiz) return;
          this.passesLeft--;
          const cp = this.cpQuiz;
          cp.got++; // passed question advances progress, earns no points
          $("stationFill").style.width = Math.round(cp.got / cp.need * 100) + "%";
          this.toast(STR.passUsed(this.passesLeft));
          if (cp.got >= cp.need) this.resolveCheckpoint();
          else this.showCpQuestion();
        });
        box.appendChild(pass);
      }
      this.updateHUD();
    }
  }
  resolveCheckpoint() {
    const e = this.cpQuiz.ent;
    const perfect = (this.cpQuiz.misses || 0) === 0;
    e.solved = true;
    this.cpQuiz = null;
    this.stationsCleared++;
    $("quiz").style.display = "none";
    $("quizHeader").textContent = STR.challengeGate;
    this.state = "playing";
    this.last = performance.now();
    // reward: jewels + a stored turbo booster + save spawn + drop the barrier
    this.jewels += 3;
    this.turboStored++;
    this.spawn = { x: e.x, y: e.y + 2, z: e.z + 1.5 };
    if (e.arc) e.arc.material = this.matStar;
    for (const w of this.walls) if (w.cp === e) { w.open = true; w.mesh.visible = false; }
    if (perfect) {
      this.speedGlow = true;
      this.toast(STR.perfectGlow);
      this.audio.chime(3);
    } else {
      this.toast(STR.cpRewards);
      this.audio.chime(2);
    }
    if (!this.cpVoiced) { this.cpVoiced = true; this.audio.play("voCheckpoint", true); }
    this.burst(e.x, e.y + 1.5, e.z, 22, 0.3, 0.9, 0.95);
    this.updateHUD();
  }
  famWeights() {
    // adaptive: weight = 1 + 3*(missed/seen), floored at 1 so every family still appears.
    // Blend lifetime (saveData) + this session so it adapts fast but remembers across runs.
    if (this.adaptive === false) return undefined;
    const life = this.lifeFamStats() || {};
    const w = {};
    const keys = new Set([...Object.keys(life), ...Object.keys(this.famStats)]);
    for (const k of keys) {
      const s = (life[k]?.seen || 0) + (this.famStats[k]?.seen || 0);
      const m = (life[k]?.missed || 0) + (this.famStats[k]?.missed || 0);
      w[k] = s > 0 ? 1 + 3 * (m / s) : 1;
    }
    return w;
  }
  lifeFamStats() {
    // separate lifetime adaptive stats per grade so one grade's misses don't skew another's weighting
    const key = saveData.grade === "g5" ? "famStatsG5" : saveData.grade === "g4" ? "famStatsG4" : "famStats";
    return (saveData[key] = saveData[key] || {});
  }
  nextProblem() {
    const tier = Math.max(0, Math.min(4, this.levels[this.levelIdx].tier));
    const w = this.famWeights();
    if (saveData.grade === "g5") return makeProblemG5(this.rng, tier, w);
    if (saveData.grade === "g4") return makeProblemG4(this.rng, tier, w);
    return makeProblem(this.rng, tier, w);
  }
  recordAnswer(fam, correct) {
    if (!fam) return;
    for (const store of [this.famStats, this.lifeFamStats()]) {
      store[fam] = store[fam] || { seen: 0, missed: 0 };
      store[fam].seen++;
      if (!correct) store[fam].missed++;
    }
    agaPost({ type: "attempt", skillId: "JJ-" + fam, subject: "math", correct: !!correct, firstTry: !!correct });
  }
  openQuiz(e) {
    if (this.state !== "playing" || e.solved || this.quizEnt === e && this.state === "quiz") return;
    this.state = "quiz";
    this.quizEnt = e;
    $("stationBar").style.display = "none";
    $("quizPanel").style.borderColor = "#2ee6ef";
    this.problem = this.nextProblem();
    $("quizIntro").textContent = STR.challengeIntro[e.kind] || STR.challengeIntro.gate;
    $("quizQ").textContent = this.problem.text;
    $("quizFeedback").textContent = "";
    const box = $("quizOpts");
    box.innerHTML = "";
    for (const opt of this.problem.options) {
      const b = document.createElement("button");
      b.className = "qopt";
      b.textContent = opt;
      b.addEventListener("click", () => this.answer(opt, b));
      box.appendChild(b);
    }
    $("quiz").style.display = "flex";
  }
  answer(opt, btn) {
    if (this.state !== "quiz") return;
    const fam = this.problem.family;
    if (opt === this.problem.answer) {
      this.recordAnswer(fam, true);
      this.score += 50;
      this.mathSolved++;
      this.audio.play("correct");
      this.audio.play("voCorrect", true);
      $("quizFeedback").textContent = STR.correct;
      $("quizFeedback").style.color = "#5df08a";
      btn.classList.add("good");
      setTimeout(() => this.resolveChallenge(), 650);
    } else {
      this.recordAnswer(fam, false);
      cp.misses = (cp.misses || 0) + 1;
      this.timeLeft = this.practice ? this.timeLeft : Math.max(1, this.timeLeft - 5);
      this.audio.wrongTone();
      this.audio.play("voRetry", true);
      $("quizFeedback").textContent = STR.tryAgain;
      $("quizFeedback").style.color = "#ff8f6a";
      btn.classList.add("bad");
      const panel = $("quizPanel");
      panel.classList.remove("shakeAnim"); void panel.offsetWidth; panel.classList.add("shakeAnim");
      // new problem of the same tier after a beat
      setTimeout(() => {
        if (this.state !== "quiz") return;
        this.problem = this.nextProblem();
        $("quizQ").textContent = this.problem.text;
        $("quizFeedback").textContent = "";
        const box = $("quizOpts");
        box.innerHTML = "";
        for (const o of this.problem.options) {
          const b = document.createElement("button");
          b.className = "qopt"; b.textContent = o;
          b.addEventListener("click", () => this.answer(o, b));
          box.appendChild(b);
        }
        this.updateHUD();
      }, 900);
      this.updateHUD();
    }
  }
  resolveChallenge() {
    const e = this.quizEnt;
    e.solved = true;
    this.stationsCleared++;
    $("quiz").style.display = "none";
    this.state = "playing";
    this.last = performance.now();
    if (e.kind === "gate") {
      e.gateMesh.visible = false;
      this.burst(e.x, e.y + 1.5, e.z, 20, 0.3, 0.9, 0.95);
    } else if (e.kind === "ditch") {
      this.turboStored++;
      this.toast(STR.turboReady);
      // auto-fire the escape boost + open the pit wall briefly
      for (const w of this.walls) if (Math.abs(w.z - (e.z + 6.6)) < 3) { w.open = true; w.mesh.visible = false; }
      this.vel.z = 14; this.vel.y = 13.5; this.grounded = false;
      this.audio.whoosh(0.9);
      this.burst(this.pos.x, this.pos.y, this.pos.z, 30, 1, 0.6, 0.15);
    } else if (e.kind === "lift") {
      for (const w of this.walls) if (Math.abs(w.z - (e.z + 1.6)) < 3) { w.open = true; w.mesh.visible = false; }
      this.liftAnim = { t: 0, dur: 1.3, y0: this.pos.y, y1: (e.y || 0) + e.rise + SPH_R + 0.4 };
      this.audio.whoosh(1.2);
    } else if (e.kind === "bridge") {
      const [z0, z1] = e.gapZ;
      const segs = 4, segD = (z1 - z0) / segs;
      for (let i = 0; i < segs; i++) {
        setTimeout(() => {
          if (this.state === "menu") return;
          const p = { id: 9000 + i, x: e.x, z: z0 + segD * (i + 0.5), w: e.width, d: segD, y: e.y || 0, h: 0.5, broken: false, breakT: -1 };
          const mesh = new THREE.Mesh(new THREE.BoxGeometry(p.w, p.h, p.d), this.matTeal);
          mesh.position.set(p.x, p.y - p.h / 2, p.z);
          p.mesh = mesh;
          this.levelGroup.add(mesh);
          this.plats.push(p);
          this.audio.tone(420 + i * 90, 0.2, "sine", 0.35, 0);
        }, i * 260);
      }
    } else if (e.kind === "geyserfield") {
      this.geyserFreeze = 12;
    }
    this.updateHUD();
  }

  // ------------------------------------------------------------------- UI
  initUI() {
    $("menuTitle").textContent = STR.title;
    $("menuSub").textContent = STR.subtitle;
    $("menuTag").textContent = STR.tagline;
    $("btnPlay").textContent = STR.play;
    $("btnHow").textContent = STR.howToPlay;
    $("menuVersion").textContent = STR.version;
    this.refreshMenuStats();
    $("selTitle").textContent = STR.chooseCadet;
    $("lvlTitle").textContent = STR.levelSelect;
    $("howTitle").textContent = STR.htpTitle;
    $("btnHop").textContent = STR.hop;
    $("btnTurbo").textContent = STR.turbo;
    $("pauseTitle").textContent = STR.paused;
    $("btnResume").textContent = STR.resume;
    $("btnRestart").textContent = STR.restartLevel;
    $("btnPauseMenu").textContent = STR.mainMenu;
    $("btnRetry").textContent = STR.retryLevel;
    $("btnFailMenu").textContent = STR.mainMenu;
    $("btnNext").textContent = STR.nextLevel;
    $("btnReplay").textContent = STR.replay;
    $("btnWinMenu").textContent = STR.mainMenu;
    $("finalTitle").textContent = STR.gameWon;
    $("btnFinalMenu").textContent = STR.playAgain;
    $("howBody").innerHTML = STR.htpLines.map((l) => `<p>${l}</p>`).join("");
    $("btnHowBack").textContent = STR.back;

    $("btnPlay").addEventListener("click", () => { this.audio.init(); this.show("select"); });
    $("btnHow").addEventListener("click", () => this.show("howto"));
    $("btnHow2").addEventListener("click", () => this.show("howto"));
    $("btnPractice").addEventListener("click", () => { this.audio.init(); this.practiceArm = true; this.show("select"); });
    $("btnStore").addEventListener("click", () => { this.audio.init(); this.openStore(); });
    $("btnStoreClose").addEventListener("click", () => this.show("menu"));
    $("btnDaily").addEventListener("click", () => { this.audio.init(); this.startDaily(); });
    $("btnDifficulty").addEventListener("click", () => {
      const order = ["scenic", "wild", "rush"];
      const i = order.indexOf(saveData.difficulty);
      saveData.difficulty = order[(i + 1) % 3]; persist(); this.updateToggles();
    });
    $("btnGrade").addEventListener("click", () => {
      saveData.grade = saveData.grade === "g3" ? "g4" : saveData.grade === "g4" ? "g5" : "g3";
      persist(); this.updateToggles();
    });
    $("btnHowBack").addEventListener("click", () => this.show("menu"));
    $("btnTilt").addEventListener("click", () => {
      this.tiltOn = !this.tiltOn;
      if (this.tiltOn) this.requestTilt();
      this.updateToggles();
    });
    $("btnSound").addEventListener("click", () => {
      this.audio.init();
      this.audio.setMuted(!this.audio.muted);
      this.updateToggles();
    });
    $("btnResume").addEventListener("click", () => this.togglePause());
    $("btnRestart").addEventListener("click", () => { $("pause").style.display = "none"; this.startLevel(this.levelIdx); });
    $("btnPauseMenu").addEventListener("click", () => { $("pause").style.display = "none"; this.show("menu"); });
    $("btnRetry").addEventListener("click", () => { $("fail").style.display = "none"; this.startLevel(this.levelIdx); });
    $("btnFailMenu").addEventListener("click", () => { $("fail").style.display = "none"; this.show("menu"); });
    $("btnNext").addEventListener("click", () => {
      $("win").style.display = "none";
      if (this.levelIdx + 1 < this.levels.length) {
        const next = this.levelIdx + 1;
        this.playCinematic(next, () => this.startLevel(next));
      } else this.show("menu");
    });
    $("btnReplay").addEventListener("click", () => { $("win").style.display = "none"; this.startLevel(this.levelIdx); });
    $("btnWinMenu").addEventListener("click", () => { $("win").style.display = "none"; this.show("menu"); });
    $("btnFinalMenu").addEventListener("click", () => { $("final").style.display = "none"; this.show("menu"); });
    $("btnBegin").addEventListener("click", () => {
      this.storyShown = true;
      $("story").style.display = "none";
      this.audio.init();
      // intro already played when the briefing appeared; only play here as a fallback
      if (!this.introVoiced) this.audio.play("voIntro", true);
      this.startLevel(this.pendingLevel ?? 0);
    });

    // sister cards
    const sc = $("sisterCards");
    SISTERS.forEach((s, i) => {
      const card = document.createElement("div");
      card.className = "card";
      const imgUrl = s.img();
      card.innerHTML = `<div class="cardImg" style="border-color:${s.color}">${imgUrl ? `<img src="${imgUrl}" alt="${s.name}" crossorigin="anonymous">` : `<div class="cardFallback" style="background:${s.color}">${s.name[0]}</div>`}</div><div class="cardName">${s.name}</div><div class="cardDesc">${s.desc}</div>`;
      if (imgUrl) {
        const holder = card.querySelector(".cardImg");
        loadKeyedImage(imgUrl).then((cv) => {
          cv.style.width = "100%"; cv.style.height = "100%"; cv.style.objectFit = "cover";
          holder.innerHTML = ""; holder.appendChild(cv);
          holder.style.background = "radial-gradient(circle at 50% 35%, #3a2a5e, #241a3e)";
        }).catch(() => {
          const im = card.querySelector("img");
          if (im) im.onerror = () => { holder.innerHTML = `<div class="cardFallback" style="background:${s.color}">${s.name[0]}</div>`; };
        });
      }
      card.addEventListener("click", () => { this.sisterIdx = i; this.setRider(); this.show("levels"); });
      sc.appendChild(card);
    });
    this.buildLevelButtons();
    this.updateToggles();
  }
  buildLevelButtons() {
    const box = $("lvlButtons");
    box.innerHTML = "";
    this.levels.forEach((lv, i) => {
      const b = document.createElement("button");
      const locked = i + 1 > saveData.unlocked;
      b.className = "lvlBtn" + (locked ? " locked" : "");
      b.innerHTML = `<span class="lvlNum">${i + 1}</span><span class="lvlName">${locked ? "\u{1F512} " + STR.locked : lv.name}</span>${(saveData.rating && saveData.rating[i]) ? `<span class="lvlMedal">${["", "\u{1F949}", "\u{1F948}", "\u{1F947}"][saveData.rating[i]]}</span>` : ""}${saveData.best[i] ? `<span class="lvlBest">\u2605 ${saveData.best[i]}</span>` : ""}`;
      if (!locked) b.addEventListener("click", () => this.startLevel(i));
      box.appendChild(b);
    });
  }
  setRider() {
    const s = SISTERS[this.sisterIdx];
    const url = s.img();
    const useFallback = () => { this.riderMat.map = makeSisterFallback(s); this.riderMat.needsUpdate = true; };
    if (!url) { useFallback(); return; }
    loadKeyedImage(url).then((cv) => {
      const t = new THREE.CanvasTexture(cv);
      t.colorSpace = THREE.SRGBColorSpace;
      this.riderMat.map = t; this.riderMat.needsUpdate = true;
    }).catch(() => {
      // keying failed (CORS taint) - try the raw image, else fallback avatar
      new THREE.TextureLoader().load(url, (t) => { t.colorSpace = THREE.SRGBColorSpace; this.riderMat.map = t; this.riderMat.needsUpdate = true; },
        undefined, useFallback);
    });
  }
  openStore() {
    const grid = $("storeGrid");
    grid.innerHTML = "";
    $("storeJewels").textContent = "\u25C6 " + (saveData.jewels || 0);
    saveData.owned = saveData.owned || [];
    saveData.boosts = saveData.boosts || [];
    // skins
    for (const [key, sk] of Object.entries(SKINS)) {
      const owned = key === "classic" || saveData.owned.includes(key);
      const equipped = (saveData.equippedSkin || "classic") === key;
      const afford = (saveData.jewels || 0) >= sk.price;
      const div = document.createElement("div");
      div.className = "storeItem" + (equipped ? " equipped" : owned ? " owned" : afford ? "" : " cant");
      const hex = "#" + sk.color.toString(16).padStart(6, "0");
      div.innerHTML = `<div class="storeSwatch" style="background:radial-gradient(circle at 34% 30%, #fff, ${hex} 55%, #222)"></div>`
        + `<div class="storeName">${sk.name}</div>`
        + (owned ? `<div class="storeTag" style="color:${equipped ? "#ffd23a" : "#5df08a"}">${equipped ? "EQUIPPED" : "TAP TO EQUIP"}</div>`
                 : `<div class="storePrice">\u25C6 ${sk.price}</div>`);
      div.addEventListener("click", () => {
        if (owned) { saveData.equippedSkin = key; persist(); this.audio.chime(2); this.openStore(); }
        else if (afford) { saveData.jewels -= sk.price; saveData.owned.push(key); saveData.equippedSkin = key; persist(); this.audio.chime(3); this.openStore(); }
        else { this.audio.wrongTone(); }
      });
      grid.appendChild(div);
    }
    // boosts
    for (const [key, bo] of Object.entries(BOOSTS)) {
      const owned = saveData.boosts.includes(key);
      const afford = (saveData.jewels || 0) >= bo.price;
      const div = document.createElement("div");
      div.className = "storeItem" + (owned ? " owned" : afford ? "" : " cant");
      div.innerHTML = `<div class="storeSwatch" style="background:radial-gradient(circle at 40% 30%, #fff, #ff9c3a 60%, #6b3fae)"></div>`
        + `<div class="storeName">${bo.name}</div>`
        + `<div class="storeTag" style="color:#c9b6f2">${bo.tag}</div>`
        + (owned ? `<div class="storeTag" style="color:#5df08a">OWNED</div>` : `<div class="storePrice">\u25C6 ${bo.price}</div>`);
      div.addEventListener("click", () => {
        if (owned) return;
        if (afford) { saveData.jewels -= bo.price; saveData.boosts.push(key); persist(); this.audio.chime(3); this.openStore(); }
        else { this.audio.wrongTone(); }
      });
      grid.appendChild(div);
    }
    for (const id of ["menu", "select", "levels", "howto"]) $(id).style.display = "none";
    $("hud").style.display = "none"; $("touchUI").style.display = "none";
    $("store").style.display = "flex";
    this.state = "store";
  }
  startDaily() {
    const d = new Date();
    const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
    this.dailySeed = seed;
    this.dailyMode = true;
    // daily always runs level index (seed % 8) so it varies day to day
    this.startLevel(seed % this.levels.length);
  }
  show(name) {
    this.state = name === "howto" || name === "select" || name === "levels" ? name : name;
    for (const id of ["menu", "select", "levels", "howto"]) $(id).style.display = "none";
    $("hud").style.display = "none";
    $("touchUI").style.display = "none";
    if (name === "menu") { this.state = "menu"; $("menu").style.display = "flex"; this.buildLevelButtons(); this.refreshMenuStats(); }
    if (name === "select") $("select").style.display = "flex";
    if (name === "levels") { $("levels").style.display = "flex"; this.buildLevelButtons(); }
    if (name === "howto") $("howto").style.display = "flex";
  }
  startLevel(i) {
    if (i === 0 && !this.storyShown) {
      for (const id of ["menu", "select", "levels", "howto"]) $(id).style.display = "none";
      $("storyTitle").textContent = STR.storyTitle;
      $("storyBody").textContent = STR.storyBody;
      $("btnBegin").textContent = STR.beginMission;
      $("story").style.display = "flex";
      this.pendingLevel = i;
      this.introVoiced = true;
      this.audio.play("voIntro", true);
      return;
    }
    for (const id of ["menu", "select", "levels", "howto", "win", "fail", "final", "store"]) $(id).style.display = "none";
    this.passesLeft = 2; // 2 question passes per level board
    this.speedGlow = false;
    this.practice = !!this.practiceArm;   // set by PRACTICE menu button; normal play = false
    this.loadLevel(i);
    this.setRider();
    this.state = "playing";
    this.last = performance.now();
    $("hud").style.display = "block";
    $("touchUI").style.display = this.isTouch ? "block" : "none";
    $("hudLevel").textContent = this.levels[i].name;
    const sp = $("splash");
    sp.innerHTML = `<div class="splashNum">LEVEL ${i + 1}</div><div class="splashName">${this.levels[i].name}</div>`;
    sp.classList.remove("splashAnim"); void sp.offsetWidth; sp.classList.add("splashAnim");
    this.audio.init && this.audio.ctx && this.audio.playMusic();
    if (this.audio.ctx) this.audio.playMusic();
  }
  togglePause() {
    if (this.state === "playing") this.showPause();
    else if (this.state === "paused") {
      $("pause").style.display = "none";
      this.state = "playing";
      this.last = performance.now();
    }
  }
  updateToggles() {
    $("btnTilt").textContent = this.tiltOn ? STR.tiltToggleOn : STR.tiltToggleOff;
    $("btnSound").textContent = this.audio.muted ? STR.soundOff : STR.soundOn;
    $("btnDifficulty").textContent = "TRAIL: " + (DIFFICULTY[saveData.difficulty] || DIFFICULTY.wild).label;
    $("btnGrade").textContent = "MATH: GRADE " + (saveData.grade === "g5" ? "5" : saveData.grade === "g4" ? "4" : "3");
  }
  showPause() {
    if (this.state !== "playing") return;
    this.state = "paused";
    $("pause").style.display = "flex";
  }
  fail(msg) {
    this.state = "fail";
    $("failTitle").textContent = msg;
    $("fail").style.display = "flex";
    this.audio.wrongTone();
  }
  playCinematic(nextIdx, done) {
    // guard: done() must fire exactly once (skip, natural end, or timeout all route here)
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      cancelAnimationFrame(raf);
      clearTimeout(hardStop);
      window.removeEventListener("keydown", onSkip);
      cvEl.removeEventListener("pointerdown", onSkip);
      $("cine").style.display = "none";
      if (renderer) { try { renderer.dispose(); } catch (e) {} }
      done();
    };

    const cvEl = $("cineCanvas");
    $("cine").style.display = "flex";
    const onSkip = () => finish();
    window.addEventListener("keydown", onSkip);
    cvEl.addEventListener("pointerdown", onSkip);
    const hardStop = setTimeout(finish, 3500); // absolute safety net

    let renderer, raf;
    try {
      const w = cvEl.clientWidth || window.innerWidth, h = cvEl.clientHeight || window.innerHeight;
      renderer = new THREE.WebGLRenderer({ canvas: cvEl, antialias: true });
      renderer.setSize(w, h, false);
      renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
      const scene = new THREE.Scene();
      const cam = new THREE.PerspectiveCamera(75, w / h, 0.1, 200);
      // destination color = next level's station/theme tint
      const th = THEMES[nextIdx] || THEMES[0];
      const tint = new THREE.Color(th.station);
      scene.fog = new THREE.FogExp2(0x05010a, 0.06);

      // portal tunnel: stacked glowing rings the camera flies through
      const rings = [];
      const ringGeo = new THREE.TorusGeometry(3.2, 0.16, 8, 32);
      for (let i = 0; i < 40; i++) {
        const c = new THREE.Color().setHSL((i / 40 + 0.5) % 1, 0.7, 0.55).lerp(tint, 0.5);
        const m = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: c }));
        m.position.z = -i * 4;
        m.rotation.z = i * 0.3;
        scene.add(m);
        rings.push(m);
      }
      // the sphere hero, rocketing ahead
      const ball = new THREE.Mesh(new THREE.SphereGeometry(0.8, 20, 16),
        new THREE.MeshBasicMaterial({ color: (SKINS[saveData.equippedSkin] || SKINS.classic).color }));
      scene.add(ball);
      // streak particles
      const streaks = [];
      for (let i = 0; i < 120; i++) {
        const s = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 2),
          new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 }));
        s.position.set((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10, -Math.random() * 120);
        scene.add(s); streaks.push(s);
      }
      cam.position.set(0, 0, 6);
      this.audio.whoosh(1.4);
      this.audio.tone(180, 1.2, "sawtooth", 0.3, 0);
      this.audio.tone(360, 1.4, "sine", 0.25, 0.2);

      const t0 = performance.now();
      const tick = () => {
        const t = (performance.now() - t0) / 1000;
        const speed = 26;
        for (const r of rings) {
          r.position.z += speed * 0.016;
          r.rotation.z += 0.02;
          if (r.position.z > 8) r.position.z -= 160;
        }
        for (const s of streaks) {
          s.position.z += speed * 2 * 0.016;
          if (s.position.z > 8) s.position.z -= 120;
        }
        ball.position.z = -6 + Math.sin(t * 3) * 0.3;
        ball.position.y = Math.sin(t * 2) * 0.5;
        ball.position.x = Math.cos(t * 2.3) * 0.5;
        ball.rotation.x += 0.1; ball.rotation.y += 0.08;
        renderer.render(scene, cam);
        if (t < 3.0) raf = requestAnimationFrame(tick);
        else finish();
      };
      raf = requestAnimationFrame(tick);
    } catch (err) {
      finish(); // any WebGL failure → skip straight to the next level
    }
  }
  sessionStats() {
    let seen = 0, missed = 0;
    for (const st of Object.values(this.famStats)) { seen += st.seen || 0; missed += st.missed || 0; }
    const accuracy = seen > 0 ? (seen - missed) / seen : 1;
    return { seen, missed, accuracy };
  }
  missionMedal(accuracy) {
    // Bronze/Silver/Gold from accuracy + time left. Non-punitive: finishing is always >= Bronze.
    const timeFrac = this.practice ? 1 : (this.levelTimer0 ? this.timeLeft / this.levelTimer0 : 0);
    if (accuracy >= 0.85 && timeFrac >= 0.30) return 3; // Gold: sharp math + finished with time to spare
    if (accuracy >= 0.65 || timeFrac >= 0.20) return 2; // Silver: strong on one axis
    return 1;                                            // Bronze: floor for finishing
  }
  winLevel() {
    this.state = "win";
    this.audio.play("portal");
    this.audio.play("voWin", true);
    const timeBonus = Math.floor(this.timeLeft) * 10;
    const livesBonus = this.lives * 200;
    const total = this.score + timeBonus + livesBonus;
    if (this.levelIdx + 1 >= saveData.unlocked && this.levelIdx + 1 < this.levels.length + 1) {
      saveData.unlocked = Math.max(saveData.unlocked, this.levelIdx + 2);
    }
    if (total > (saveData.best[this.levelIdx] || 0)) saveData.best[this.levelIdx] = total;
    saveData.jewels = (saveData.jewels || 0) + this.jewels;
    // ---- AGA Points economy (AGA-TEC-002) ----
    const idx = this.levelIdx;
    const ss = this.sessionStats();
    const firstTime = !(saveData.cleared && saveData.cleared[idx]);
    const cleanRun = ss.missed === 0;
    const stationPts = this.stationsCleared * 19;   // each checkpoint/challenge cleared
    const completePts = 25;                          // level complete
    const firstPts = firstTime ? 6 : 0;              // first-time completion
    const cleanPts = cleanRun ? 3 : 0;               // no wrong answers
    const agaEarned = stationPts + completePts + firstPts + cleanPts;
    this._winAgaEarned = agaEarned;
    saveData.aga = (saveData.aga || 0) + agaEarned;
    saveData.cleared = saveData.cleared || [];
    saveData.cleared[idx] = true;
    // ---- Mission rating (best medal kept per level) ----
    const medal = this.missionMedal(ss.accuracy);
    saveData.rating = saveData.rating || [];
    saveData.rating[idx] = Math.max(saveData.rating[idx] || 0, medal);
    persist();  // famStats already mutated in-place on saveData
    const stars = total > 1400 ? 3 : total > 900 ? 2 : 1;
    $("winTitle").textContent = STR.levelComplete;
    const medalIcon = ["", "\u{1F949}", "\u{1F948}", "\u{1F947}"][medal];   // bronze / silver / gold
    const medalName = [STR.medalBronze, STR.medalSilver, STR.medalGold][medal - 1];
    const medalCol = ["", "#cd7f32", "#c7d0da", "#f5c518"][medal];
    const starSpans = [0, 1, 2].map(i => `<span class="starU">${i < stars ? "\u2605" : "\u2606"}</span>`).join("");
    $("winStars").innerHTML = `<div class="medalBadge" style="color:${medalCol}">${medalIcon} ${medalName}</div>`
      + `<div class="medalStars">${starSpans}</div>`;
    $("winRows").innerHTML =
      `<div><span>${STR.timeBonusLabel}</span><span>${timeBonus}</span></div>` +
      `<div><span>${STR.livesBonusLabel}</span><span>${livesBonus}</span></div>` +
      `<div><span>${STR.mathSolvedLabel}</span><span>${this.mathSolved} \u00d7 50</span></div>` +
      `<div><span>${STR.starsLabel}</span><span>${this.starsGot} \u00d7 100</span></div>` +
      `<div class="totalRow"><span>${STR.totalLabel}</span><span>${total}</span></div>` +
      `<div class="agaBlock"><div class="agaHead">${STR.agaPointsLabel} <span id="agaEarnedNum">+${agaEarned}</span></div>` +
        `<div class="agaLine"><span>${STR.agaStations}</span><span>${this.stationsCleared} \u00d7 19</span></div>` +
        `<div class="agaLine"><span>${STR.agaComplete}</span><span>+25</span></div>` +
        (firstPts ? `<div class="agaLine"><span>${STR.agaFirst}</span><span>+6</span></div>` : "") +
        (cleanPts ? `<div class="agaLine"><span>${STR.agaClean}</span><span>+3</span></div>` : "") +
        `<div class="agaLine agaTotal"><span>${STR.agaTotal}</span><span id="agaTotalNum">${saveData.aga}</span></div></div>`;
    // math performance report: only families attempted THIS session
    let report = "";
    for (const [fam, st] of Object.entries(this.famStats)) {
      if (!st.seen) continue;
      const acc = Math.round((st.seen - st.missed) / st.seen * 100);
      const col = acc >= 80 ? "#5df08a" : acc >= 50 ? "#ffd23a" : "#ff6a6a";
      const tag = acc >= 80 ? STR.aced : STR.practiceThis;
      report += `<div class="repRow"><span>${(saveData.grade === "g5" ? FAMILY_LABELS_G5 : saveData.grade === "g4" ? FAMILY_LABELS_G4 : FAMILY_LABELS)[fam] || FAMILY_LABELS[fam] || FAMILY_LABELS_G4[fam] || FAMILY_LABELS_G5[fam] || fam}</span>`
        + `<span class="repBarWrap"><span class="repBar" style="width:${acc}%;background:${col}"></span></span>`
        + `<span class="repTag" style="color:${col}">${acc}% ${tag}</span></div>`;
    }
    $("mathReport").innerHTML = report ? `<div class="repTitle">${STR.mathReport} \u2014 GRADE ${saveData.grade === "g5" ? "5" : saveData.grade === "g4" ? "4" : "3"}</div>` + report : "";
    // daily best tracking
    if (this.dailyMode) {
      const today = this.dailySeed;
      if (!saveData.daily || saveData.daily.date !== today || total > saveData.daily.score) {
        saveData.daily = { date: today, score: total }; persist();
      }
    }
    this.confetti();
    if (this.levelIdx === this.levels.length - 1) {
      $("btnNext").style.display = "none";
      $("win").style.display = "flex";
      this.revealWin();
      setTimeout(() => {
        $("win").style.display = "none";
        $("finalScore").textContent = `${STR.finalScore}: ${saveData.best.reduce((a, b) => a + b, 0)}`;
        $("final").style.display = "flex";
      }, 2600);
    } else {
      $("btnNext").style.display = "inline-block";
      $("win").style.display = "flex";
      this.revealWin();
    }
  }
  // staged, kid-satisfying reveal of the win panel: panel pops, medal bounces,
  // stars pop in one at a time, score rows slide in, AGA numbers count up.
  revealWin() {
    const panel = $("win").querySelector(".panel");
    if (panel) { panel.classList.remove("revealPanel"); void panel.offsetWidth; panel.classList.add("revealPanel"); }
    const badge = $("winStars").querySelector(".medalBadge");
    if (badge) { badge.style.animation = "none"; void badge.offsetWidth; badge.style.animation = "badgePop .6s ease-out"; }
    $("winStars").querySelectorAll(".starU").forEach((s, i) => {
      s.style.animation = "none"; void s.offsetWidth;
      s.style.animation = `starPop .4s ease-out ${(0.55 + i * 0.18).toFixed(2)}s both`;
    });
    $("winRows").querySelectorAll(":scope > div").forEach((r, i) => {
      r.style.animation = "none"; void r.offsetWidth;
      r.style.animation = `rowSlide .4s ease-out ${(0.2 + i * 0.07).toFixed(2)}s both`;
    });
    this.countUp($("agaEarnedNum"), this._winAgaEarned || 0, 700, "+");
    this.countUp($("agaTotalNum"), saveData.aga || 0, 950);
  }
  confetti() {
    const box = $("confetti");
    box.innerHTML = "";
    const colors = ["#ff6a2a", "#ffd23a", "#5df08a", "#3ad8ff", "#b46eff", "#ff4a6a"];
    for (let i = 0; i < 70; i++) {
      const p = document.createElement("div");
      p.className = "confPiece";
      p.style.left = Math.random() * 100 + "%";
      p.style.top = "-20px";
      p.style.background = colors[i % colors.length];
      p.style.animationDuration = (1.8 + Math.random() * 1.6) + "s";
      p.style.animationDelay = (Math.random() * 0.5) + "s";
      box.appendChild(p);
    }
    setTimeout(() => { box.innerHTML = ""; }, 4000);
  }
  toast(msg) {
    const t = $("toast");
    t.textContent = msg;
    t.style.display = "block";
    t.classList.remove("toastAnim"); void t.offsetWidth; t.classList.add("toastAnim");
    clearTimeout(this.toastTO);
    this.toastTO = setTimeout(() => { t.style.display = "none"; }, 1900);
  }
  // animate a number from 0 up to `to`. Final value is written first so a
  // missing rAF (e.g. headless) still shows the correct number.
  countUp(el, to, ms = 800, prefix = "") {
    if (!el) return;
    el.textContent = prefix + to;
    const t0 = (typeof performance !== "undefined" ? performance.now() : Date.now());
    const step = (now) => {
      const p = Math.min(1, (now - t0) / ms);
      const e = 1 - Math.pow(1 - p, 3); // easeOutCubic
      el.textContent = prefix + Math.round(to * e);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = prefix + to;
    };
    requestAnimationFrame(step);
  }
  // lifetime AGA points badge on the menu, so kids watch the number grow across sessions
  refreshMenuStats() {
    const el = $("menuAga");
    if (!el) return;
    const pts = saveData.aga || 0;
    if (pts > 0) { el.innerHTML = `${STR.agaMenuLabel} <b>${pts}</b>`; el.style.display = "inline-block"; }
    else el.style.display = "none";
  }
  updateHUD() {
    const t = Math.max(0, this.timeLeft);
    const mm = Math.floor(t / 60), ss = Math.floor(t % 60);
    const timer = $("hudTimer");
    timer.textContent = `${mm}:${ss < 10 ? "0" : ""}${ss}`;
    timer.classList.toggle("danger", t < 20);
    $("hudScore").textContent = `${STR.score}: ${this.score}`;
    $("hudJewels").textContent = `\u25C6 ${this.jewels}`;
    agaReportCoins(this.jewels);
    $("hudPasses").textContent = STR.hudPasses(this.passesLeft === undefined ? 2 : this.passesLeft);
{
      const box = $("hudLives");
      const n = Math.max(0, Math.min(5, this.lives));
      if (this._livesShown !== n) {
        this._livesShown = n;
        box.textContent = "";
        for (let i = 0; i < n; i++) {
          const s = document.createElement("span");
          s.className = "lifeSphere";
          box.appendChild(s);
        }
      }
    }
    $("hudTurbo").style.display = this.turboStored > 0 ? "block" : "none";
    $("btnTurbo").classList.toggle("ready", this.turboStored > 0);
  }

  // ------------------------------------------------------------- main loop
  frame(now) {
    requestAnimationFrame((t) => this.frame(t));
    if (this.blurPaused) { this.last = now; return; }
    this.acc += Math.min(now - this.last, 100);
    this.last = now;
    const dt = STEP;
    while (this.acc >= STEP * 1000) {
      if (this.state === "playing") this.update(dt);
      this.updateParticles(dt);
      this.acc -= STEP * 1000;
    }
    if (this.state === "playing" || this.state === "quiz" || this.state === "paused") {
      this.updateCamera(dt);
    } else {
      // menu idle camera
      const t = now * 0.0002;
      this.camera.position.set(Math.sin(t) * 14, 6, Math.cos(t) * 14 - 4);
      this.camera.lookAt(0, 0, 8);
    }
    this.renderer.render(this.scene, this.camera);
    if (this.dev) {
      this.frames++;
      if (now - this.fpsAt >= 500) {
        this.fps = Math.round(this.frames * 1000 / (now - this.fpsAt));
        this.frames = 0; this.fpsAt = now;
        $("dev").textContent = `${this.fps} fps | draws ${this.renderer.info.render.calls} | tris ${this.renderer.info.render.triangles}`;
      }
      $("dev").style.display = "block";
    }
  }
}

new Game();
