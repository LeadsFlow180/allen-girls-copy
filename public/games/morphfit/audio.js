// Audio: lightweight WebAudio synthesis. No external files are fetched (so there
// are no 404s); every sound effect is generated in code.
//
// Sound effects (place, clear, level, over) are ON.
// The looping background music is intentionally disabled.

let ctx = null;
let musicSource = null;
let musicGain = null;
let started = false;

function ac() {
  if (!ctx) {
    try { ctx = new (window.AudioContext || window.webkitAudioContext)(); }
    catch (e) { ctx = null; }
  }
  return ctx;
}

export const AUDIO = {
  // no external audio to preload; kept for API compatibility
  async preload() { /* synth-only: nothing to fetch */ },

  resume() {
    const a = ac();
    if (a && a.state === "suspended") a.resume();
  },

  play(key, combo = 1) {
    const a = ac();
    if (!a) return;
    this.resume();
    synth(a, key, combo);
  },

  startMusic() {
    // looping background music disabled; sound effects still play
  },

  stopMusic() {
    if (musicSource) { try { musicSource.stop(); } catch (e) {} musicSource = null; }
    if (musicGain) { try { musicGain.disconnect(); } catch (e) {} musicGain = null; }
    started = false;
  }
};

// --- synthesized cues: soft sine blips, no harsh transients ---
function synth(a, key, combo) {
  const now = a.currentTime;
  const beep = (freq, dur, gain, type = "sine", delay = 0) => {
    const o = a.createOscillator(), g = a.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(0, now + delay);
    g.gain.linearRampToValueAtTime(gain, now + delay + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, now + delay + dur);
    o.connect(g); g.connect(a.destination);
    o.start(now + delay); o.stop(now + delay + dur + 0.02);
  };
  if (key === "place") beep(280, 0.09, 0.18, "triangle");
  else if (key === "clear") {
    // chime rises in pitch with the number of simultaneous lines
    const base = 520 + (combo - 1) * 90;
    beep(base, 0.14, 0.16); beep(base * 1.25, 0.16, 0.14, "sine", 0.06);
  } else if (key === "level") {
    [523, 659, 784, 1047].forEach((f, i) => beep(f, 0.22, 0.15, "sine", i * 0.08));
  } else if (key === "over") {
    [392, 330, 262].forEach((f, i) => beep(f, 0.34, 0.14, "sine", i * 0.12));
  }
}
