// Tiny audio manager (Howler). No sound files ship yet (Phase 6), so play() is a
// safe no-op until sounds are registered — never throws, never spams the console.

const KEY = 'mw_muted';
const state = { muted: localStorage.getItem(KEY) === '1', sounds: Object.create(null) };

export const Audio = {
  /** Register a sound: Audio.load('hit', ['audio/hit.webm','audio/hit.mp3']) */
  load(name, src) {
    if (!window.Howl) return;
    try { state.sounds[name] = new window.Howl({ src, preload: true, volume: 0.8 }); } catch (_) {}
  },
  play(name) {
    if (state.muted) return;
    const s = state.sounds[name];
    if (s) { try { s.play(); } catch (_) {} }
  },
  setMuted(m) { state.muted = !!m; localStorage.setItem(KEY, m ? '1' : '0'); },
  isMuted() { return state.muted; },
};
