export type UiClickVariant = "tap" | "success" | "claim";

const STORAGE_KEY = "learn.soundEnabled";

let audioCtx: AudioContext | null = null;
let playChain: Promise<void> = Promise.resolve();

export function isUiSoundEnabled(): boolean {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(STORAGE_KEY) !== "0";
}

export function setUiSoundEnabled(enabled: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, enabled ? "1" : "0");
}

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctx) return null;
    audioCtx = audioCtx ?? new Ctx();
    return audioCtx;
  } catch {
    return null;
  }
}

async function ensureAudioReady(): Promise<AudioContext | null> {
  const ctx = getAudioContext();
  if (!ctx) return null;
  if (ctx.state === "suspended") {
    try {
      await ctx.resume();
    } catch {
      return null;
    }
  }
  return ctx;
}

function playBufferClick(
  ctx: AudioContext,
  variant: UiClickVariant,
): void {
  const sampleRate = ctx.sampleRate;
  const duration = variant === "claim" ? 0.14 : variant === "success" ? 0.1 : 0.07;
  const frameCount = Math.floor(sampleRate * duration);
  const buffer = ctx.createBuffer(1, frameCount, sampleRate);
  const data = buffer.getChannelData(0);

  const freqs =
    variant === "claim"
      ? [523, 784, 1046]
      : variant === "success"
        ? [440, 660]
        : [720, 480];

  for (let i = 0; i < frameCount; i++) {
    const t = i / sampleRate;
    const env = Math.exp(-t * (variant === "tap" ? 55 : 28));
    let sample = 0;
    for (const f of freqs) {
      sample += Math.sin(2 * Math.PI * f * t);
    }
    sample /= freqs.length;
    data[i] = sample * env * (variant === "tap" ? 0.55 : 0.45);
  }

  const source = ctx.createBufferSource();
  const gain = ctx.createGain();
  gain.gain.value = variant === "tap" ? 0.85 : 0.75;
  source.buffer = buffer;
  source.connect(gain);
  gain.connect(ctx.destination);
  source.start();
}

async function playUiClickNow(variant: UiClickVariant = "tap"): Promise<void> {
  if (!isUiSoundEnabled()) return;

  const ctx = await ensureAudioReady();
  if (!ctx) return;

  playBufferClick(ctx, variant);
}

/** Short tap — call from click handlers (awaits AudioContext unlock). */
export function playUiClick(variant: UiClickVariant = "tap"): void {
  playChain = playChain
    .then(() => playUiClickNow(variant))
    .catch(() => undefined);
}

export function warmUpUiAudio(): void {
  playChain = playChain
    .then(() => ensureAudioReady())
    .catch(() => undefined);
}

/** Any native <button> (CSS module class names are not used here). */
export function resolveClickSoundTarget(
  target: EventTarget | null,
): HTMLElement | null {
  if (!target || !(target instanceof HTMLElement)) return null;

  const el = target.closest(
    "button, [role='button'], input[type='button'], input[type='submit']",
  );
  if (!(el instanceof HTMLElement)) return null;
  if (
    el.hasAttribute("disabled") ||
    el.getAttribute("aria-disabled") === "true" ||
    el.getAttribute("data-ui-sound") === "off"
  ) {
    return null;
  }
  return el;
}

export function soundVariantFromElement(el: HTMLElement): UiClickVariant {
  const raw = el.getAttribute("data-ui-sound");
  if (raw === "success" || raw === "claim" || raw === "tap") return raw;
  return "tap";
}
