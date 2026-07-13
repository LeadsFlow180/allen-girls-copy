const STORAGE_KEY = "library.flipSoundEnabled";
const PAGE_FLIP_SOUND_SRC = "/library/sounds/page-flip-01a.mp3";
const PAGE_FLIP_VOLUME = 0.92;

let playChain: Promise<void> = Promise.resolve();
let warmedAudio: HTMLAudioElement | null = null;

export function isPageTurnSoundEnabled(): boolean {
  if (typeof window === "undefined") return true;

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "0") return false;
  if (stored === "1") return true;

  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function setPageTurnSoundEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, enabled ? "1" : "0");
}

function createFlipAudio(): HTMLAudioElement {
  const audio = new Audio(PAGE_FLIP_SOUND_SRC);
  audio.preload = "auto";
  audio.volume = PAGE_FLIP_VOLUME;
  return audio;
}

function getWarmedAudio(): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;
  warmedAudio = warmedAudio ?? createFlipAudio();
  return warmedAudio;
}

async function playPageTurnNow(): Promise<void> {
  if (!isPageTurnSoundEnabled()) return;
  if (typeof window === "undefined") return;

  const audio = createFlipAudio();
  try {
    await audio.play();
  } catch {
    // Browser blocked playback until a user gesture unlocks audio.
  }
}

/** Page flip sample — call when the flip animation starts. */
export function playPageTurnSound(): void {
  playChain = playChain
    .then(() => playPageTurnNow())
    .catch(() => undefined);
}

export function warmUpPageTurnAudio(): void {
  const audio = getWarmedAudio();
  if (!audio) return;

  playChain = playChain
    .then(async () => {
      try {
        audio.load();
        if (audio.paused) {
          await audio.play();
          audio.pause();
          audio.currentTime = 0;
        }
      } catch {
        // Ignore — first real flip will try again after user interaction.
      }
    })
    .catch(() => undefined);
}
