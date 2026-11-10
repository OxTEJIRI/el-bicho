'use client';

// Reaction sounds: voiced "Wowww", "Siuuu", "Awww" and a memory chime (public/sounds). Played on a tap, which is
// the user gesture browsers require. A short buzz on phones that support it.
export type Sfx = 'wow' | 'siuuu' | 'tears' | 'memory';

const FILES: Record<Sfx, string> = { wow: '/sounds/wow.mp3', siuuu: '/sounds/siuuu.mp3', tears: '/sounds/tears.mp3', memory: '/sounds/memory.mp3' };
const cache: Partial<Record<Sfx, HTMLAudioElement>> = {};

export const SFX_FOR_REACTION: Record<string, Sfx> = { Unreal: 'wow', SIUUU: 'siuuu', Tears: 'tears', Remember: 'memory' };

export function preloadSfx() {
  (Object.keys(FILES) as Sfx[]).forEach((k) => {
    if (cache[k]) return;
    try { const a = new Audio(FILES[k]); a.preload = 'auto'; cache[k] = a; } catch { /* no audio support */ }
  });
}

export function playSfx(name: Sfx) {
  try {
    preloadSfx();
    const a = cache[name];
    if (a) { a.currentTime = 0; void a.play().catch(() => {}); }
    navigator.vibrate?.(name === 'siuuu' ? [18, 40, 28] : 14);
  } catch { /* sound is a bonus, never an error */ }
}
