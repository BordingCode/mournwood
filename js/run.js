// Run state — the persistent-across-combats data for one attempt through Aldermoor.
// A "run" holds the hero (deck/hp/relics/gold/potions), the generated region, which
// POIs are cleared, story flags, and quest progress. Combat reads/writes hp here.

import { CLASS_BY_ID } from './data/classes.js';
import { RACE_BY_ID } from './data/races.js';
import { buildDeck } from './cards.js';

const HERO_R = 16;

export function createRun({ race, cls, mode, rng, slot = null }) {
  const cdef = CLASS_BY_ID[cls];
  const maxHp = cdef.hp + (race === 'human' ? 5 : 0);
  const region = makeRegion(mode, rng);
  return {
    slot,
    race, cls, mode,
    name: `${RACE_BY_ID[race].name} ${cdef.name}`,
    maxHp, hp: maxHp,
    deck: buildDeck(cls, race),
    relics: ['ashen_idol'],
    potions: [],
    gold: 40,
    region,
    pos: { ...region.spawn },
    cleared: {},
    flags: {},        // wardStone, etc.
    log: [],
  };
}

// Player object handed to the Combat engine, derived from the run.
export function combatant(run) {
  return {
    name: run.name, raceId: run.race,
    maxHp: run.maxHp, hp: run.hp,
    deck: run.deck.slice(), relics: run.relics.slice(), potions: run.potions.slice(),
    statuses: {},
  };
}

/* ---------------- region generation ---------------- */
// A walkable field with a meandering trail of POIs from Hearthvale (bottom) to the
// Sanctum (top). Free-roam; nodes are interactable on proximity.
export function makeRegion(mode, rng) {
  const quick = mode === 'quick';
  const W = 1400, rows = quick ? 5 : 8;
  const rowH = 360;
  const H = rows * rowH + 360;
  const spawn = { x: W / 2, y: H - 180 };
  const pois = [
    { id: 'hub', type: 'hub', name: 'Hearthvale', icon: '🏠', x: spawn.x, y: spawn.y - 40 },
  ];

  // node-type plan per row (bottom→top), guaranteeing a rest, shop, event, ward, elite
  const plan = quick
    ? ['combat', 'event', 'shop', 'rest', 'ward', 'elite']
    : ['combat', 'combat', 'event', 'shop', 'combat', 'rest', 'ward', 'elite', 'combat', 'shop'];
  let r = 0; let lastX = spawn.x;
  for (const type of plan) {
    r++;
    const y = H - 180 - r * rowH + rng.int(-40, 40);
    const x = Math.max(180, Math.min(W - 180, lastX + rng.int(-360, 360)));
    lastX = x;
    pois.push({ id: type + r, type, x, y,
      name: nodeName(type), icon: nodeIcon(type), tier: r <= 2 ? 'easy' : r <= 5 ? 'mid' : 'hard' });
  }
  // boss gate at the top, locked until the Ward-Stone is recovered
  pois.push({ id: 'boss', type: 'boss', name: 'The Sanctum', icon: '☠️', x: W / 2, y: 120, locked: true });

  return { W, H, spawn, pois, heroR: HERO_R };
}

function nodeName(t) { return ({ combat: 'Wilds', elite: 'Elite Foe', shop: 'Wandering Merchant', rest: 'Campfire', event: 'Mystery', ward: 'Sunken Chapel' })[t] || t; }
function nodeIcon(t) { return ({ combat: '⚔️', elite: '☠', shop: '🪙', rest: '🔥', event: '❓', ward: '🔯' })[t] || '•'; }

/* ---------------- node → encounter ---------------- */
export function encounterFor(poi, rng) {
  if (poi.type === 'boss') return ['high_priest'];
  if (poi.type === 'elite') return [rng.pick(['orc_berserker', 'cult_zealot'])];
  // combat packs by tier
  const easy = [['goblin'], ['goblin', 'goblin'], ['skeleton'], ['goblin', 'bandit']];
  const mid = [['skeleton', 'direwolf'], ['orc'], ['bandit', 'cultist'], ['goblin', 'goblin', 'cultist']];
  const hard = [['orc', 'cultist'], ['orc', 'skeleton', 'goblin'], ['cult_zealot'], ['direwolf', 'direwolf']];
  const pool = poi.tier === 'hard' ? hard : poi.tier === 'mid' ? mid : easy;
  return rng.pick(pool).slice();
}

export function goldReward(poi, rng) {
  if (poi.type === 'boss') return rng.int(40, 60);
  if (poi.type === 'elite') return rng.int(25, 40);
  return rng.int(10, 20);
}

export function bossUnlocked(run) { return !!run.flags.wardStone; }
