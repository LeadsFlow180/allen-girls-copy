// Gyrosphere math challenge generator.
// Grade 3 multiplication & division (products/dividends within 100, factors 2-9).
// Mirrors the 6 problem families of the source packet:
//  1 equal groups (mult)  2 arrays (mult)  3 sharing equally (div)
//  4 making equal groups (div)  5 interpreting meaning / vocabulary  6 mixed equations
// Problems are generated fresh from a seeded RNG - never a fixed list.
import { STR } from "./strings.js";

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const NAMES = ["Maya", "Alana", "Natalia", "Ray", "Aaron", "Jalisa", "Courtney", "Zoe", "Marcus", "Kim"];
const ITEMS = ["crystals", "ember rocks", "dino eggs", "fossils", "amber stones", "batteries", "moon berries", "robo-bolts", "glow shells", "apples", "stickers", "marbles"];

function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }
function pickWeighted(rng, arr, weights) {
  // weights: map family->number. Missing/invalid falls back to uniform.
  if (!weights) return pick(rng, arr);
  let total = 0;
  const w = arr.map((f) => { const x = Math.max(0.0001, weights[f] || 1); total += x; return x; });
  let r = rng() * total;
  for (let i = 0; i < arr.length; i++) { r -= w[i]; if (r <= 0) return arr[i]; }
  return arr[arr.length - 1];
}
function ri(rng, min, max) { return min + Math.floor(rng() * (max - min + 1)); }

// Build 4 unique numeric options including the answer, using smart distractors.
function numericOptions(rng, answer, a, b) {
  const set = new Set([answer]);
  const candidates = [answer + 1, answer - 1, answer + a, answer - a, answer + b, answer - b, a + b, a * b, Math.max(1, answer + ri(rng, 2, 4)), Math.max(1, answer - ri(rng, 2, 4))];
  // shuffle candidates
  for (let i = candidates.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [candidates[i], candidates[j]] = [candidates[j], candidates[i]]; }
  for (const c of candidates) {
    if (set.size >= 4) break;
    if (Number.isInteger(c) && c > 0 && c !== answer && !set.has(c)) set.add(c);
  }
  let filler = answer + 5;
  while (set.size < 4) { if (!set.has(filler) && filler > 0) set.add(filler); filler += 3; }
  const opts = [...set];
  for (let i = opts.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [opts[i], opts[j]] = [opts[j], opts[i]]; }
  return opts.map(String);
}

function shuffleWithAnswer(rng, correct, wrongs) {
  // dedupe distractors; backfill with unique numbers if needed
  const seen = new Set([correct]);
  const clean = [];
  for (const w of wrongs) { if (!seen.has(w)) { seen.add(w); clean.push(w); } }
  let filler = 2;
  while (clean.length < 3) {
    const cand = String(filler * 7 + 1);
    if (!seen.has(cand)) { seen.add(cand); clean.push(cand); }
    filler++;
  }
  const opts = [correct, ...clean];
  for (let i = opts.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [opts[i], opts[j]] = [opts[j], opts[i]]; }
  return opts;
}

// tier: {fmin, fmax, families[]} - families is the pool of generator keys allowed.
export const TIERS = [
  { fmin: 2, fmax: 5, families: ["equalGroups", "array", "share", "makeGroups", "equation"] },
  { fmin: 2, fmax: 6, families: ["equalGroups", "array", "share", "makeGroups", "equation", "missing"] },
  { fmin: 2, fmax: 7, families: ["equalGroups", "array", "share", "makeGroups", "equation", "missing", "meaning"] },
  { fmin: 3, fmax: 8, families: ["equalGroups", "array", "share", "makeGroups", "equation", "missing", "meaning", "vocab"] },
  { fmin: 3, fmax: 9, families: ["array", "share", "makeGroups", "equation", "missing", "meaning", "vocab", "equalGroups"] }
];

const GEN = {
  equalGroups(rng, t) {
    const a = ri(rng, t.fmin, t.fmax), b = ri(rng, t.fmin, t.fmax);
    const ans = a * b, item = pick(rng, ITEMS);
    const text = rng() < 0.5 ? STR.q_equalGroups(a, b, item, pick(rng, NAMES)) : STR.q_equalGroups2(a, b, item);
    return { text, answer: String(ans), options: numericOptions(rng, ans, a, b) };
  },
  array(rng, t) {
    const r = ri(rng, t.fmin, t.fmax), c = ri(rng, t.fmin, t.fmax);
    const ans = r * c, item = pick(rng, ITEMS);
    const text = rng() < 0.5 ? STR.q_array(r, c, item) : STR.q_array2(r, c, item);
    return { text, answer: String(ans), options: numericOptions(rng, ans, r, c) };
  },
  share(rng, t) {
    const groups = ri(rng, t.fmin, t.fmax), each = ri(rng, t.fmin, t.fmax);
    const total = groups * each, item = pick(rng, ITEMS);
    const text = rng() < 0.5 ? STR.q_shareEqually(total, groups, item, pick(rng, NAMES)) : STR.q_shareEqually2(total, groups, item);
    return { text, answer: String(each), options: numericOptions(rng, each, groups, 2) };
  },
  makeGroups(rng, t) {
    const per = ri(rng, t.fmin, t.fmax), count = ri(rng, t.fmin, t.fmax);
    const total = per * count, item = pick(rng, ITEMS);
    const text = rng() < 0.5 ? STR.q_makeGroups(total, per, item) : STR.q_makeGroups2(total, per, item, pick(rng, NAMES));
    return { text, answer: String(count), options: numericOptions(rng, count, per, 2) };
  },
  equation(rng, t) {
    const a = ri(rng, t.fmin, t.fmax), b = ri(rng, t.fmin, t.fmax);
    if (rng() < 0.5) {
      const ans = a * b;
      return { text: STR.q_equation_mult(a, b), answer: String(ans), options: numericOptions(rng, ans, a, b) };
    }
    const total = a * b;
    return { text: STR.q_equation_div(total, a), answer: String(b), options: numericOptions(rng, b, a, 2) };
  },
  missing(rng, t) {
    const a = ri(rng, t.fmin, t.fmax), b = ri(rng, t.fmin, t.fmax);
    if (rng() < 0.5) {
      const prod = a * b;
      return { text: STR.q_missingFactor(a, prod), answer: String(b), options: numericOptions(rng, b, a, 2) };
    }
    const total = a * b;
    return { text: STR.q_missingDivisor(total, b), answer: String(a), options: numericOptions(rng, a, b, 2) };
  },
  meaning(rng, t) {
    const a = ri(rng, t.fmin, t.fmax), b = ri(rng, t.fmin, t.fmax);
    const item = pick(rng, ITEMS);
    const correct = STR.q_meaning_story(a, b, item);
    const wrongs = [STR.q_meaning_story_wrong1(a, b, item), STR.q_meaning_story_wrong2(a, b, item), STR.q_meaning_story_wrong3(a, b, item)];
    return { text: STR.q_meaning_mult(a, b), answer: correct, options: shuffleWithAnswer(rng, correct, wrongs) };
  },
  vocab(rng, t) {
    const a = ri(rng, t.fmin, t.fmax);
    let b = ri(rng, t.fmin, t.fmax);
    if (b === a) b = (b < t.fmax) ? b + 1 : b - 1;
    const prod = a * b;
    const kind = ri(rng, 0, 4);
    if (kind === 0) {
      return { text: STR.q_vocab_product(a, b, prod), answer: String(prod), options: shuffleWithAnswer(rng, String(prod), [String(a), String(b), STR.vocab_pair(a, b)]) };
    }
    if (kind === 1) {
      const correct = STR.vocab_pair(a, b);
      return { text: STR.q_vocab_factor(a, b, prod), answer: correct, options: shuffleWithAnswer(rng, correct, [String(prod), STR.vocab_pair(a, prod), STR.vocab_pair(b, prod)]) };
    }
    if (kind === 2) {
      return { text: STR.q_vocab_quotient(prod, a, b), answer: String(b), options: shuffleWithAnswer(rng, String(b), [String(prod), String(a), STR.vocab_pair(prod, a)]) };
    }
    if (kind === 3) {
      return { text: STR.q_vocab_dividend(prod, a, b), answer: String(prod), options: shuffleWithAnswer(rng, String(prod), [String(a), String(b), STR.vocab_pair(a, b)]) };
    }
    return { text: STR.q_vocab_divisor(prod, a, b), answer: String(a), options: shuffleWithAnswer(rng, String(a), [String(prod), String(b), STR.vocab_pair(prod, b)]) };
  }
};

export function makeProblem(rng, levelIndex, weights) {
  const t = TIERS[Math.max(0, Math.min(TIERS.length - 1, levelIndex))];
  const fam = pickWeighted(rng, t.families, weights);
  const p = GEN[fam](rng, t);
  p.family = fam;
  return p;
}

// kid-friendly labels for the performance report
export const FAMILY_LABELS = {
  equalGroups: "Equal groups", array: "Arrays", share: "Division (sharing)",
  makeGroups: "Division (grouping)", equation: "Equations", missing: "Missing factor",
  meaning: "Word problems", vocab: "Math vocabulary"
};

// ================================================================
// GRADE 4 TRACK - MA/CCSS aligned (AGA-CUR-001 M4.1-OA + M4.2-NBT)
// 8 families: mulCompare, multiStep, factors, patterns,
//             placeValue, rounding, bigMul, remainders
// Same contract as Grade 3: { text, answer, options, family }
// ================================================================
function fmtNum(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }

const G4TIERS = [
  { lo: 0, families: ["mulCompare", "bigMul", "rounding", "factors"] },
  { lo: 0, families: ["mulCompare", "bigMul", "rounding", "factors", "remainders"] },
  { lo: 0, families: ["mulCompare", "bigMul", "rounding", "factors", "remainders", "patterns"] },
  { lo: 0, families: ["mulCompare", "bigMul", "rounding", "factors", "remainders", "patterns", "placeValue"] },
  { lo: 0, families: ["mulCompare", "bigMul", "rounding", "factors", "remainders", "patterns", "placeValue", "multiStep"] }
];

const G4_PRIMES = [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97];
const G4_COMPOSITES = [4,6,8,9,10,12,14,15,16,18,20,21,22,24,25,26,27,28,30,33,34,35,36,38,39,40,44,45,46,49,50,51,55,57,63,65,77,91];

const G4GEN = {
  mulCompare(rng, t) {
    const mult = ri(rng, 3, 9), small = ri(rng, 3, 12), big = mult * small;
    const v = ri(rng, 0, 2);
    if (v === 0) {
      const item = pick(rng, ITEMS), n1 = pick(rng, NAMES);
      return { text: `A T-rex is ${mult} times as heavy as a boulder. The boulder weighs ${small} tons. How many tons does the T-rex weigh?`, answer: String(big), options: numericOptions(rng, big, mult, small) };
    }
    if (v === 1) {
      const n1 = pick(rng, NAMES); let n2 = pick(rng, NAMES); if (n2 === n1) n2 = "Ray";
      const item = pick(rng, ITEMS);
      return { text: `${n1} collected ${big} ${item}. That is ${mult} times as many as ${n2}. How many did ${n2} collect?`, answer: String(small), options: numericOptions(rng, small, mult, 2) };
    }
    return { text: `${big} is how many times as many as ${small}?`, answer: String(mult), options: numericOptions(rng, mult, small, 2) };
  },
  multiStep(rng, t) {
    const v = ri(rng, 0, 1);
    const item = pick(rng, ITEMS);
    if (v === 0) {
      const a = ri(rng, 3, 6), b = ri(rng, 4, 9), c = ri(rng, 5, 15), ans = a * b + c;
      return { text: `Each checkpoint gives ${b} ${item}. You pass ${a} checkpoints and find ${c} bonus ${item}. How many ${item} in all?`, answer: String(ans), options: numericOptions(rng, ans, a * b, c) };
    }
    const g = ri(rng, 4, 8), e = ri(rng, 3, 7), start = g * e + ri(rng, 2, 9), ans = start - g * e;
    return { text: `You have ${start} ${item}. You give ${e} to each of ${g} explorers. How many ${item} are left?`, answer: String(ans), options: numericOptions(rng, ans, g, e) };
  },
  factors(rng, t) {
    const v = ri(rng, 0, 2);
    if (v === 0) {
      const isP = rng() < 0.5;
      const n = isP ? pick(rng, G4_PRIMES.filter(p => p > 3)) : pick(rng, G4_COMPOSITES);
      const ans = isP ? "prime" : "composite";
      return { text: `Is ${n} prime or composite?`, answer: ans, options: shuffleWithAnswer(rng, ans, [isP ? "composite" : "prime", "even", "odd"]) };
    }
    if (v === 1) {
      const f = ri(rng, 3, 9), q = ri(rng, 4, 12);
      return { text: `Find the missing factor:  ___ \u00d7 ${f} = ${f * q}`, answer: String(q), options: numericOptions(rng, q, f, 2) };
    }
    const c = pick(rng, G4_COMPOSITES);
    let sf = 2; while (c % sf !== 0) sf++;
    return { text: `What is the smallest factor of ${c} other than 1?`, answer: String(sf), options: numericOptions(rng, sf, 2, 3) };
  },
  patterns(rng, t) {
    if (rng() < 0.6) {
      const start = ri(rng, 1, 9), step = ri(rng, 3, 9), pos = ri(rng, 4, 6), ans = start + step * (pos - 1);
      return { text: `Pattern rule: start at ${start}, add ${step} each time. What is the ${pos}th number?`, answer: String(ans), options: numericOptions(rng, ans, step, step * 2) };
    }
    const s = ri(rng, 1, 3), m = ri(rng, 2, 3), p = ri(rng, 3, 4);
    let ans = s; for (let i = 1; i < p; i++) ans *= m;
    return { text: `Pattern rule: start at ${s}, multiply by ${m} each time. What is the ${p}th number?`, answer: String(ans), options: numericOptions(rng, ans, m, s * m) };
  },
  placeValue(rng, t) {
    const v = ri(rng, 0, 1);
    if (v === 0) {
      const digits = [ri(rng, 1, 9), ri(rng, 0, 9), ri(rng, 0, 9), ri(rng, 0, 9), ri(rng, 0, 9)];
      let idx = ri(rng, 0, 2); while (digits[idx] === 0) idx = ri(rng, 0, 2);
      const pv = Math.pow(10, 4 - idx), num = parseInt(digits.join(""), 10), val = digits[idx] * pv;
      const pname = { 10000: "ten-thousands", 1000: "thousands", 100: "hundreds" }[pv];
      const wrong1 = String(digits[idx]), wrong2 = fmtNum(digits[idx] * pv / 10), wrong3 = fmtNum(digits[idx] * pv * 10);
      return { text: `In the number ${fmtNum(num)}, what is the VALUE of the digit ${digits[idx]} in the ${pname} place?`, answer: fmtNum(val), options: shuffleWithAnswer(rng, fmtNum(val), [wrong1, wrong2, wrong3]) };
    }
    const a = ri(rng, 10000, 99999), b = a + (rng() < 0.5 ? -1 : 1) * ri(rng, 1, 900);
    const bigger = Math.max(a, b);
    return { text: `Which number is greater: ${fmtNum(a)} or ${fmtNum(b)}?`, answer: fmtNum(bigger), options: shuffleWithAnswer(rng, fmtNum(bigger), [fmtNum(Math.min(a, b)), "They are equal", fmtNum(bigger + 1000)]) };
  },
  rounding(rng, t) {
    const place = pick(rng, [10, 100, 1000]);
    let n = ri(rng, 1200, 9800);
    if (n % place === 0) n += ri(rng, 1, place - 1);
    const rounded = Math.round(n / place) * place;
    const pname = { 10: "ten", 100: "hundred", 1000: "thousand" }[place];
    const w1 = fmtNum(rounded + place), w2 = fmtNum(Math.max(place, rounded - place)), w3 = fmtNum(Math.floor(n / place) * place === rounded ? rounded + place * 2 : Math.floor(n / place) * place);
    return { text: `Round ${fmtNum(n)} to the nearest ${pname}.`, answer: fmtNum(rounded), options: shuffleWithAnswer(rng, fmtNum(rounded), [w1, w2, w3]) };
  },
  bigMul(rng, t) {
    if (rng() < 0.65) {
      const a = ri(rng, 13, 79), b = ri(rng, 3, 9), ans = a * b;
      return { text: `What is ${a} \u00d7 ${b}?`, answer: String(ans), options: numericOptions(rng, ans, b, 10) };
    }
    const c = ri(rng, 11, 25), d = ri(rng, 11, 19), ans = c * d;
    return { text: `What is ${c} \u00d7 ${d}?`, answer: String(ans), options: numericOptions(rng, ans, c, d) };
  },
  remainders(rng, t) {
    const v = ri(rng, 0, 2);
    if (v === 0) {
      const b = ri(rng, 3, 9), q = ri(rng, 12, 40);
      return { text: `What is ${b * q} \u00f7 ${b}?`, answer: String(q), options: numericOptions(rng, q, b, 10) };
    }
    if (v === 1) {
      const d = ri(rng, 4, 9), q = ri(rng, 11, 35), r = ri(rng, 1, d - 1);
      return { text: `What is the REMAINDER when ${d * q + r} is divided by ${d}?`, answer: String(r), options: numericOptions(rng, r, 1, 2) };
    }
    const per = ri(rng, 4, 9), each = ri(rng, 5, 9), left = ri(rng, 1, per - 1);
    const item = pick(rng, ITEMS);
    return { text: `Split ${per * each + left} ${item} equally among ${per} explorers. How many ${item} are LEFT OVER?`, answer: String(left), options: numericOptions(rng, left, 1, 2) };
  }
};

export function makeProblemG4(rng, levelIndex, weights) {
  const t = G4TIERS[Math.max(0, Math.min(G4TIERS.length - 1, levelIndex))];
  const fam = pickWeighted(rng, t.families, weights);
  const p = G4GEN[fam](rng, t);
  p.family = fam;
  return p;
}

export const FAMILY_LABELS_G4 = {
  mulCompare: "Times-as-many", multiStep: "Multi-step problems", factors: "Factors & primes",
  patterns: "Number patterns", placeValue: "Place value", rounding: "Rounding",
  bigMul: "Big multiplication", remainders: "Division & remainders"
};

// ================================================================
// GRADE 5 TRACK - MA/CCSS aligned (AGA-CUR-001 M5.1 - M5.5)
// 12 families across all five Grade 5 modules:
//   OA  (M5.1): orderOps, expression
//   NBT (M5.2): decimalCompare, roundDecimal, decimalOps, bigDivide
//   NF  (M5.3): fractionAddSub, fractionMultiply
//   MD  (M5.4): unitConvert, volume
//   GEO (M5.5): coordinate, classifyShape
// Same contract as G3/G4: { text, answer, options, family }
// ================================================================
function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { const t = a % b; a = b; b = t; } return a || 1; }
function fracStr(n, d) {
  if (d < 0) { n = -n; d = -d; }
  const g = gcd(n, d); n /= g; d /= g;
  if (d === 1) return String(n);
  if (Math.abs(n) > d) { const whole = Math.trunc(n / d), rem = Math.abs(n % d); return rem === 0 ? String(whole) : `${whole} ${rem}/${d}`; }
  return `${n}/${d}`;
}
function decStr(x) { return parseFloat(x.toFixed(4)).toString(); }
// Return exactly 3 distinct wrong strings, drawn from cands first, then (for numeric answers)
// numeric nudges around the answer in the answer's own format (int, comma-int, or decimal).
// Text-answer families must supply >=3 clean distractors themselves; fracWrongs handles fractions.
function threeWrongs(answer, cands) {
  const A = String(answer), out = [], seen = new Set([A]);
  for (const c of cands) { const s = String(c); if (s && !seen.has(s)) { seen.add(s); out.push(s); if (out.length === 3) break; } }
  if (out.length < 3) {
    const plain = A.replace(/,/g, "");
    if (/^-?\d+(\.\d+)?$/.test(plain)) {
      const base = parseFloat(plain), dec = plain.includes("."), comma = A.includes(",");
      const fmt = (v) => dec ? decStr(v) : (comma ? fmtNum(Math.round(v)) : String(Math.round(v)));
      for (let k = 1; out.length < 3 && k < 60; k++) {
        for (const sign of [1, -1]) {
          const v = base + sign * (dec ? 0.01 : 1) * k;
          if (dec && v <= 0) continue;
          const s = fmt(v);
          if (!seen.has(s)) { seen.add(s); out.push(s); if (out.length === 3) break; }
        }
      }
    }
  }
  while (out.length < 3) { out.push(A + " ".repeat(out.length + 1)); } // unreachable in practice; keeps options valid
  return out;
}
// Guaranteed-distinct fraction distractors: try the misconception strings first, then answer-adjacent
// fractions (same denominator) which are always distinct values from the answer.
function fracWrongs(num, den, extra) {
  const answer = fracStr(num, den), out = [], seen = new Set([answer]);
  for (const c of extra) { if (c && !seen.has(c)) { seen.add(c); out.push(c); if (out.length === 3) break; } }
  for (let k = 1; out.length < 3 && k < 40; k++) {
    for (const s of [num + k, num - k]) {
      if (s > 0) { const f = fracStr(s, den); if (!seen.has(f)) { seen.add(f); out.push(f); if (out.length === 3) break; } }
    }
  }
  return out;
}
function opts4(rng, answer, cands) { return shuffleWithAnswer(rng, String(answer), threeWrongs(String(answer), cands)); }

const G5TIERS = [
  { families: ["orderOps", "decimalCompare", "unitConvert", "roundDecimal"] },
  { families: ["orderOps", "decimalCompare", "unitConvert", "roundDecimal", "decimalOps", "volume"] },
  { families: ["orderOps", "decimalCompare", "unitConvert", "roundDecimal", "decimalOps", "volume", "bigDivide", "coordinate"] },
  { families: ["orderOps", "decimalCompare", "unitConvert", "roundDecimal", "decimalOps", "volume", "bigDivide", "coordinate", "fractionAddSub", "classifyShape"] },
  { families: ["orderOps", "expression", "decimalCompare", "roundDecimal", "decimalOps", "bigDivide", "unitConvert", "volume", "coordinate", "classifyShape", "fractionAddSub", "fractionMultiply"] }
];

const G5GEN = {
  // ---- OA: order of operations (PEMDAS) ----
  orderOps(rng, t) {
    const a = ri(rng, 2, 9), b = ri(rng, 2, 9), c = ri(rng, 2, 6);
    const v = ri(rng, 0, 2);
    if (v === 0) { // (a + b) x c
      const ans = (a + b) * c, wrongLR = a + b * c;
      return { text: `Evaluate:  (${a} + ${b}) \u00d7 ${c}`, answer: String(ans), options: opts4(rng, ans, [wrongLR, a + b + c, (a + b) * c + c, a * c + b]) };
    }
    if (v === 1) { // a + b x c  (no parens - precedence)
      const ans = a + b * c, wrongLR = (a + b) * c;
      return { text: `Evaluate:  ${a} + ${b} \u00d7 ${c}`, answer: String(ans), options: opts4(rng, ans, [wrongLR, a + b + c, a * b + c, a + b - c + b]) };
    }
    const d = ri(rng, 1, Math.max(1, b - 1)); // a x (b - d)
    const ans = a * (b - d), wrongLR = a * b - d;
    return { text: `Evaluate:  ${a} \u00d7 (${b} - ${d})`, answer: String(ans), options: opts4(rng, ans, [wrongLR, a * b, a * (b - d) + a, a + (b - d), a * b - d - 1]) };
  },
  // ---- OA: translate words to an expression ----
  expression(rng, t) {
    const a = ri(rng, 2, 9), b = ri(rng, 2, 9), c = ri(rng, 2, 8);
    const correct = `(${a} + ${b}) \u00d7 ${c}`;
    return {
      text: `Which expression means: add ${a} and ${b}, then multiply the sum by ${c}?`,
      answer: correct,
      options: opts4(rng, correct, [`${a} + ${b} \u00d7 ${c}`, `${a} + (${b} \u00d7 ${c})`, `${c} \u00d7 ${a} + ${b}`])
    };
  },
  // ---- NBT: compare decimals to thousandths ----
  decimalCompare(rng, t) {
    let x = ri(rng, 1, 9999) / 1000, y = ri(rng, 1, 9999) / 1000;
    if (x === y) y = y + 0.001;
    const bigger = Math.max(x, y), smaller = Math.min(x, y);
    return { text: `Which is greater:  ${decStr(x)}  or  ${decStr(y)}?`, answer: decStr(bigger), options: opts4(rng, decStr(bigger), [decStr(smaller), "They are equal", decStr(bigger + 0.01)]) };
  },
  // ---- NBT: round decimals ----
  roundDecimal(rng, t) {
    const place = pick(rng, [0.1, 0.01]);
    const n = ri(rng, 105, 9899) / 1000; // thousandths
    const rounded = Math.round(n / place) * place;
    const pname = place === 0.1 ? "tenth" : "hundredth";
    return { text: `Round ${decStr(n)} to the nearest ${pname}.`, answer: decStr(rounded), options: opts4(rng, decStr(rounded), [decStr(rounded + place), decStr(Math.max(0, rounded - place)), decStr(rounded + 2 * place), decStr(Math.floor(n / place) * place), decStr(Math.ceil(n / place) * place)]) };
  },
  // ---- NBT: operate with decimals (hundredths) ----
  decimalOps(rng, t) {
    const v = ri(rng, 0, 2);
    if (v === 0) { const a = ri(rng, 10, 900), b = ri(rng, 10, 900); const ans = (a + b) / 100; return { text: `What is ${decStr(a / 100)} + ${decStr(b / 100)}?`, answer: decStr(ans), options: opts4(rng, decStr(ans), [decStr((a + b + 10) / 100), decStr(Math.abs(a - b) / 100), decStr((a + b) / 100 + 0.1)]) }; }
    if (v === 1) { let a = ri(rng, 50, 990), b = ri(rng, 10, 940); if (b > a) { const s = a; a = b; b = s; } const ans = (a - b) / 100; return { text: `What is ${decStr(a / 100)} - ${decStr(b / 100)}?`, answer: decStr(ans), options: opts4(rng, decStr(ans), [decStr((a - b + 10) / 100), decStr((a + b) / 100), decStr(Math.max(0, (a - b - 10) / 100))]) }; }
    const a = ri(rng, 11, 99), whole = ri(rng, 2, 9); const ans = (a * whole) / 100; return { text: `What is ${decStr(a / 100)} \u00d7 ${whole}?`, answer: decStr(ans), options: opts4(rng, decStr(ans), [decStr((a * whole) / 100 + whole / 10), decStr((a * (whole + 1)) / 100), decStr(a / 100 + whole)]) };
  },
  // ---- NBT: divide with two-digit divisors (exact) ----
  bigDivide(rng, t) {
    const d = ri(rng, 11, 40), q = ri(rng, 12, 90), dividend = d * q;
    return { text: `What is ${fmtNum(dividend)} \u00f7 ${d}?`, answer: String(q), options: numericOptions(rng, q, d, 10) };
  },
  // ---- NF: add / subtract fractions, unlike denominators ----
  fractionAddSub(rng, t) {
    const dens = [2, 3, 4, 5, 6, 8, 10, 12];
    let d1 = pick(rng, dens), d2 = pick(rng, dens); if (d1 === d2) d2 = dens[(dens.indexOf(d2) + 1) % dens.length];
    const n1 = ri(rng, 1, d1 - 1), n2 = ri(rng, 1, d2 - 1);
    const lcm = d1 * d2 / gcd(d1, d2);
    const add = rng() < 0.5;
    let num = add ? (n1 * (lcm / d1) + n2 * (lcm / d2)) : (n1 * (lcm / d1) - n2 * (lcm / d2));
    if (!add && num <= 0) return G5GEN.fractionAddSub(rng, t); // retry for positive difference
    const ans = fracStr(num, lcm);
    const wrongAddBoth = fracStr(add ? n1 + n2 : Math.abs(n1 - n2), d1 + d2);      // added/subtracted denominators too
    const wrongKeepDen = fracStr(add ? n1 + n2 : Math.abs(n1 - n2), Math.max(d1, d2)); // combined numerators, kept a denominator
    return { text: `${n1}/${d1} ${add ? "+" : "-"} ${n2}/${d2} = ?`, answer: ans, options: shuffleWithAnswer(rng, ans, fracWrongs(num, lcm, [wrongAddBoth, wrongKeepDen])) };
  },
  // ---- NF: multiply fractions / fraction x whole ----
  fractionMultiply(rng, t) {
    if (rng() < 0.5) {
      const n1 = ri(rng, 1, 5), d1 = ri(rng, 2, 6), n2 = ri(rng, 1, 5), d2 = ri(rng, 2, 6);
      const ans = fracStr(n1 * n2, d1 * d2);
      return { text: `${n1}/${d1} \u00d7 ${n2}/${d2} = ?`, answer: ans, options: shuffleWithAnswer(rng, ans, fracWrongs(n1 * n2, d1 * d2, [fracStr(n1 + n2, d1 + d2), fracStr(n1 * d2, d1 * n2)])) };
    }
    const n = ri(rng, 1, 5), d = ri(rng, 2, 8), whole = ri(rng, 2, 9);
    const ans = fracStr(n * whole, d);
    return { text: `${n}/${d} \u00d7 ${whole} = ?`, answer: ans, options: shuffleWithAnswer(rng, ans, fracWrongs(n * whole, d, [fracStr(n, d * whole), fracStr(n + whole, d)])) };
  },
  // ---- MD: convert measurement units ----
  unitConvert(rng, t) {
    const conv = pick(rng, [
      { f: 100, from: "meters", to: "centimeters", lo: 2, hi: 40 },
      { f: 1000, from: "kilometers", to: "meters", lo: 2, hi: 20 },
      { f: 1000, from: "liters", to: "milliliters", lo: 2, hi: 25 },
      { f: 1000, from: "kilograms", to: "grams", lo: 2, hi: 30 },
      { f: 12, from: "feet", to: "inches", lo: 2, hi: 20 },
      { f: 3, from: "yards", to: "feet", lo: 2, hi: 30 },
      { f: 60, from: "hours", to: "minutes", lo: 2, hi: 12 }
    ]);
    const v = ri(rng, conv.lo, conv.hi), ans = v * conv.f;
    return { text: `Convert ${v} ${conv.from} to ${conv.to}.`, answer: fmtNum(ans), options: opts4(rng, fmtNum(ans), [fmtNum(v * conv.f * 10), fmtNum(Math.round(v * conv.f / 10)), fmtNum(v + conv.f)]) };
  },
  // ---- MD: volume V = l x w x h ----
  volume(rng, t) {
    const l = ri(rng, 2, 9), w = ri(rng, 2, 9), h = ri(rng, 2, 9), V = l * w * h;
    const v = ri(rng, 0, 1);
    if (v === 0) return { text: `A box is ${l} by ${w} by ${h} units. What is its volume in cubic units?`, answer: String(V), options: numericOptions(rng, V, l * w, h) };
    return { text: `A prism is built from unit cubes: ${l} long, ${w} wide, ${h} tall. How many unit cubes does it hold?`, answer: String(V), options: opts4(rng, V, [l * w + h, l + w + h, l * w * h + l, (l + 1) * w * h]) };
  },
  // ---- GEO: coordinate plane (first quadrant) ----
  coordinate(rng, t) {
    let x = ri(rng, 1, 9), y = ri(rng, 1, 9);
    const v = ri(rng, 0, 1);
    if (v === 0) {
      if (y === x) y = x < 9 ? x + 1 : x - 1; // keep swap-distractor distinct from the answer
      const ans = `(${x}, ${y})`;
      return { text: `Start at the origin (0, 0). Move right ${x}, then up ${y}. What ordered pair are you at?`, answer: ans, options: opts4(rng, ans, [`(${y}, ${x})`, `(${x}, ${y + 1})`, `(${x + 1}, ${y})`, `(${y}, ${x + 1})`]) };
    }
    const ans = String(x); return { text: `The point (${x}, ${y}) is plotted. How far is it from the y-axis (its x-coordinate)?`, answer: ans, options: opts4(rng, ans, [String(y), String(x + 1), String(x + y)]) };
  },
  // ---- GEO: classify 2D figures / hierarchy ----
  classifyShape(rng, t) {
    const bank = [
      { q: "A quadrilateral with 4 equal sides and 4 right angles is a ___.", a: "square", w: ["rectangle", "rhombus", "trapezoid"] },
      { q: "A parallelogram with 4 right angles (but not all sides equal) is a ___.", a: "rectangle", w: ["square", "rhombus", "trapezoid"] },
      { q: "A quadrilateral with exactly one pair of parallel sides is a ___.", a: "trapezoid", w: ["parallelogram", "rhombus", "rectangle"] },
      { q: "Every square is ALSO always a ___.", a: "rectangle", w: ["triangle", "pentagon", "circle"] },
      { q: "A parallelogram with 4 equal sides (but not right angles) is a ___.", a: "rhombus", w: ["rectangle", "square", "trapezoid"] },
      { q: "A polygon with 6 sides is a ___.", a: "hexagon", w: ["pentagon", "octagon", "quadrilateral"] },
      { q: "A triangle with all three sides equal is ___.", a: "equilateral", w: ["isosceles", "scalene", "right"] }
    ];
    const b = pick(rng, bank);
    return { text: b.q, answer: b.a, options: opts4(rng, b.a, b.w) };
  }
};

export function makeProblemG5(rng, levelIndex, weights) {
  const t = G5TIERS[Math.max(0, Math.min(G5TIERS.length - 1, levelIndex))];
  const fam = pickWeighted(rng, t.families, weights);
  const p = G5GEN[fam](rng, t);
  p.family = fam;
  return p;
}

export const FAMILY_LABELS_G5 = {
  orderOps: "Order of operations", expression: "Writing expressions",
  decimalCompare: "Comparing decimals", roundDecimal: "Rounding decimals",
  decimalOps: "Decimal operations", bigDivide: "Long division",
  fractionAddSub: "Add/subtract fractions", fractionMultiply: "Multiply fractions",
  unitConvert: "Unit conversion", volume: "Volume", coordinate: "Coordinate plane",
  classifyShape: "Classifying shapes"
};
