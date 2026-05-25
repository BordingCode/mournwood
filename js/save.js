// Multi-slot save/resume. Runs are plain serializable data, so we JSON them into
// localStorage (tiny, synchronous, reliable). 3 slots. Combat is not persisted
// mid-fight; resuming returns you to the map at your last position.

const KEY = 'mournwood_saves_v1';
const SLOTS = 3;

function readAll() {
  try { const d = JSON.parse(localStorage.getItem(KEY)); if (d && Array.isArray(d.slots)) return d; } catch (_) {}
  return { v: 1, slots: Array(SLOTS).fill(null) };
}
function writeAll(d) { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (_) {} }

export const SLOT_COUNT = SLOTS;

export function slotSummaries() {
  return readAll().slots.map((s, i) => {
    if (!s) return { i, empty: true };
    const r = s.run;
    const total = r.region.pois.filter((p) => p.type !== 'hub').length;
    const done = Object.keys(r.cleared || {}).length;
    return { i, empty: false, name: r.name, mode: r.mode, hp: r.hp, maxHp: r.maxHp,
      gold: r.gold, progress: `${done}/${total} cleared`, savedAt: s.savedAt };
  });
}

export function hasAny() { return readAll().slots.some(Boolean); }

export function saveRun(run) {
  if (run == null || run.slot == null) return;
  const d = readAll();
  d.slots[run.slot] = { savedAt: Date.now(), run };  // run is plain data
  writeAll(d);
}

export function loadRun(i) {
  const s = readAll().slots[i];
  if (!s) return null;
  const run = s.run;
  if (run) run.slot = i;
  return run;
}

export function clearSlot(i) { const d = readAll(); d.slots[i] = null; writeAll(d); }
