// Central game state + a debug/test hook on window.__gameState so Playwright
// (and the console) can read/assert state without inspecting canvas pixels.

import { RNG } from './rng.js';

export const Game = {
  screen: 'title',        // title | select | hub | map | combat | ...
  mode: 'normal',         // normal | quick
  rng: new RNG(),
  // run/meta state get filled in later phases
  selection: { raceId: null, classId: null },
  run: null,
  meta: null,
};

// Keep a flat snapshot on window for testing/debugging.
export function syncDebug(extra = {}) {
  window.__gameState = {
    screen: Game.screen,
    mode: Game.mode,
    seed: Game.rng.seed,
    selection: { ...Game.selection },
    ...extra,
  };
  return window.__gameState;
}

// Collect console/runtime errors for the smoke-test gate.
window.__errors = window.__errors || [];
window.addEventListener('error', (e) => window.__errors.push(String(e.message || e)));
window.addEventListener('unhandledrejection', (e) => window.__errors.push('promise: ' + e.reason));
