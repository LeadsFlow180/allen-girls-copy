// Audio engine: generated clips stream from CDN, procedural sounds synthesize
// in WebAudio. Mix levels: voice loudest, SFX under voice, music quiet bed.
import { ASSETS } from "./assets-config.js";

const MIX = { music: 0.14, sfx: 0.32, voice: 0.55 };

export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.buffers = {};
    this.musicSrc = null;
    this.muted = false;
    this.rumble = null;
    this.started = false;
  }
  // Must be called from a user gesture.
  init() {
    if (this.ctx) { if (this.ctx.state === "suspended") this.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = 1;
    this.master.connect(this.ctx.destination);
    this.musicGain = this.ctx.createGain(); this.musicGain.gain.value = MIX.music; this.musicGain.connect(this.master);
    this.sfxGain = this.ctx.createGain(); this.sfxGain.gain.value = MIX.sfx; this.sfxGain.connect(this.master);
    this.voiceGain = this.ctx.createGain(); this.voiceGain.gain.value = MIX.voice; this.voiceGain.connect(this.master);
    this.loadAll();
    this.makeRumble();
  }
  setMuted(m) {
    this.muted = m;
    if (this.master) this.master.gain.value = m ? 0 : 1;
  }
  async loadOne(key, url) {
    if (!url) return;
    try {
      const res = await fetch(url, { mode: "cors" });
      const ab = await res.arrayBuffer();
      this.buffers[key] = await this.ctx.decodeAudioData(ab);
      if (key === "music" && this.wantMusic) this.playMusic();
      if (key === "ambience" && this.wantMusic) this.playAmbience();
    } catch (e) { /* fallback: silence for this clip */ }
  }
  playAmbience() {
    if (!this.ctx || !this.buffers.ambience || this.ambSrc) return;
    if (!this.ambGain) { this.ambGain = this.ctx.createGain(); this.ambGain.gain.value = 0.5; this.ambGain.connect(this.musicGain); }
    const src = this.ctx.createBufferSource();
    src.buffer = this.buffers.ambience; src.loop = true;
    src.connect(this.ambGain); src.start();
    this.ambSrc = src;
  }
  loadAll() {
    const a = ASSETS.audio;
    this.loadOne("music", a.music);
    this.loadOne("geyser", a.sfxGeyser);
    this.loadOne("pickup", a.sfxPickup);
    this.loadOne("correct", a.sfxCorrect);
    this.loadOne("pop", a.sfxPop);
    this.loadOne("portal", a.sfxPortal);
    this.loadOne("voCorrect", a.voCorrect);
    this.loadOne("voRetry", a.voRetry);
    this.loadOne("ambience", a.ambience);
    this.loadOne("snap", a.sfxSnap);
    this.loadOne("voBites", a.voBites);
    this.loadOne("voIntro", a.voIntro);
    this.loadOne("voCheckpoint", a.voCheckpoint);
    this.loadOne("voWin", a.voWin);
  }
  playMusic() {
    if (!this.ctx) return;
    this.wantMusic = true;
    this.playAmbience();
    if (!this.buffers.music || this.musicSrc) return;
    const src = this.ctx.createBufferSource();
    src.buffer = this.buffers.music; src.loop = true;
    src.connect(this.musicGain); src.start();
    this.musicSrc = src;
  }
  stopMusic() {
    this.wantMusic = false;
    if (this.musicSrc) { try { this.musicSrc.stop(); } catch (e) {} this.musicSrc = null; }
  }
  play(key, isVoice) {
    if (!this.ctx) return;
    const buf = this.buffers[key];
    if (buf) {
      if (isVoice) {
        // one voice at a time: stop any line still playing before starting the new one
        if (this.voiceSrc) { try { this.voiceSrc.stop(); } catch (e) {} this.voiceSrc = null; }
      }
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      src.connect(isVoice ? this.voiceGain : this.sfxGain);
      src.start();
      if (isVoice) {
        this.voiceSrc = src;
        src.onended = () => { if (this.voiceSrc === src) this.voiceSrc = null; };
      }
      return;
    }
    // procedural stand-ins for missing clips
    if (key === "pickup" || key === "correct" || key === "portal") this.chime(key === "portal" ? 3 : key === "correct" ? 2 : 1);
    if (key === "pop") this.popSound();
    if (key === "geyser") this.whoosh(0.7);
  }
  // ---- procedural sounds (always available) ----
  tone(freq, dur, type, gainV, when) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime + (when || 0);
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type || "sine"; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gainV || 0.5, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(this.sfxGain);
    o.start(t); o.stop(t + dur + 0.05);
  }
  chime(n) { for (let i = 0; i < n + 1; i++) this.tone(520 * Math.pow(1.26, i), 0.35, "sine", 0.5, i * 0.09); }
  wrongTone() { this.tone(220, 0.25, "triangle", 0.4, 0); this.tone(180, 0.3, "triangle", 0.35, 0.12); }
  popSound() { this.tone(300, 0.12, "square", 0.3, 0); this.tone(900, 0.3, "sine", 0.25, 0.05); }
  whoosh(dur) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const len = Math.floor(this.ctx.sampleRate * dur);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = this.ctx.createBufferSource(); src.buffer = buf;
    const f = this.ctx.createBiquadFilter(); f.type = "bandpass";
    f.frequency.setValueAtTime(400, t); f.frequency.exponentialRampToValueAtTime(1800, t + dur * 0.6);
    const g = this.ctx.createGain(); g.gain.value = 0.5;
    src.connect(f); f.connect(g); g.connect(this.sfxGain); src.start();
  }
  makeRumble() {
    // continuous rolling rumble, gain driven by sphere speed
    const len = this.ctx.sampleRate * 2;
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; }
    const src = this.ctx.createBufferSource(); src.buffer = buf; src.loop = true;
    const f = this.ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 220;
    this.rumbleGain = this.ctx.createGain(); this.rumbleGain.gain.value = 0;
    src.connect(f); f.connect(this.rumbleGain); this.rumbleGain.connect(this.sfxGain);
    src.start();
  }
  setRumble(level) { if (this.rumbleGain) this.rumbleGain.gain.value = Math.min(0.5, level * 0.5); }
}
