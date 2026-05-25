// Headless auto-play fuzzer + balance probe. Random AI plays many seeded runs across
// ALL classes/races/relics/potions and every encounter tier to surface crashes,
// soft-locks, NaN/negative HP, hand overflow, non-termination.
//   node test/fuzzer.mjs [runs]

import { Combat } from '../js/combat.js';
import { RNG } from '../js/rng.js';
import { buildDeck } from '../js/cards.js';
import { CLASSES } from '../js/data/classes.js';
import { RELIC_LIST } from '../js/relics.js';
import { POTION_LIST } from '../js/potions.js';

const CLASS_IDS = CLASSES.map((c) => c.id);
const CLASS_HP = Object.fromEntries(CLASSES.map((c) => [c.id, c.hp]));
const RACES = ['human','elf','dwarf','halfling','gnome','halforc','dragonborn','tiefling','goliath'];
const ENCOUNTERS = [
  ['goblin'], ['goblin','goblin'], ['skeleton','direwolf'], ['bandit','goblin'],
  ['orc','cultist'], ['orc_berserker'], ['cult_zealot'], ['high_priest'],
];
const RELICS = RELIC_LIST.map((r) => r.id);
const POTIONS = POTION_LIST.map((p) => p.id);

function checkInvariants(c, ctx) {
  for (const e of [c.player, ...c.enemies]) {
    if (Number.isNaN(e.hp)) throw new Error(`NaN hp — ${ctx}`);
    if (e.hp < 0) throw new Error(`negative hp — ${ctx}`);
    if (e.block < 0) throw new Error(`negative block — ${ctx}`);
  }
  if (c.player.hp > c.player.maxHp) throw new Error(`overheal — ${ctx}`);
  if (c.hand.length > 10) throw new Error(`hand overflow ${c.hand.length} — ${ctx}`);
}

function autoplay(seed) {
  const rng = new RNG(seed);
  const cls = rng.pick(CLASS_IDS), race = rng.pick(RACES), enc = rng.pick(ENCOUNTERS);
  const ctx = `seed ${seed} ${race}/${cls} vs ${enc.join('+')}`;
  const player = {
    maxHp: CLASS_HP[cls], raceId: race, deck: buildDeck(cls, race),
    relics: rng.chance(0.6) ? [rng.pick(RELICS)] : [],
    potions: rng.chance(0.6) ? [rng.pick(POTIONS), rng.pick(POTIONS)] : [],
  };
  const c = new Combat({ rng, player, enemyIds: enc });
  c.start();
  let turnGuard = 0;
  while (!c.over && turnGuard++ < 600) {
    if (c.potions.length && rng.chance(0.3)) c.usePotion(0);
    let plays = c.validPlays(), safety = 0;
    while (plays.length && safety++ < 80 && !c.over) {
      const m = rng.pick(plays);
      c.play(m.uid, m.targetUid);
      plays = c.validPlays();
    }
    if (c.over) break;
    c.endTurn();
    checkInvariants(c, ctx);
  }
  if (turnGuard >= 600) throw new Error(`non-termination / soft-lock — ${ctx}`);
  checkInvariants(c, ctx);
  return { result: c.result, boss: enc[0] === 'high_priest' };
}

const N = Number(process.argv[2] || 4000);
let wins = 0, bossRuns = 0, bossWins = 0;
for (let s = 1; s <= N; s++) {
  const r = autoplay(s);
  if (r.result === 'win') wins++;
  if (r.boss) { bossRuns++; if (r.result === 'win') bossWins++; }
}
console.log(`fuzz OK — ${N} runs across all classes/races/relics/potions/enemies; no crashes / soft-locks / invariant breaks.`);
console.log(`random-AI overall win rate: ${(wins / N * 100).toFixed(1)}%  |  boss win rate: ${bossRuns ? (bossWins / bossRuns * 100).toFixed(1) : '0'}% (${bossRuns} boss runs)`);
