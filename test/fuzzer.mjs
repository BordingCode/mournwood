// Headless auto-play fuzzer + balance probe. Random AI plays many seeded runs to
// surface crashes, soft-locks, NaN/negative HP, hand overflow, non-termination.
//   node test/fuzzer.mjs [runs]

import { Combat } from '../js/combat.js';
import { RNG } from '../js/rng.js';
import { starterFor } from '../js/cards.js';

function checkInvariants(c, seed) {
  for (const e of [c.player, ...c.enemies]) {
    if (Number.isNaN(e.hp)) throw new Error(`NaN hp (seed ${seed})`);
    if (e.hp < 0) throw new Error(`negative hp (seed ${seed})`);
  }
  if (c.player.hp > c.player.maxHp) throw new Error(`overheal (seed ${seed})`);
  if (c.hand.length > 10) throw new Error(`hand overflow ${c.hand.length} (seed ${seed})`);
}

function autoplay(seed) {
  const rng = new RNG(seed);
  const enemyIds = rng.chance(0.5) ? ['goblin', 'goblin'] : ['goblin', 'direwolf'];
  const c = new Combat({ rng, player: { maxHp: 68, deck: starterFor('wizard') }, enemyIds });
  c.start();
  let turnGuard = 0;
  while (!c.over && turnGuard++ < 500) {
    let plays = c.validPlays(), safety = 0;
    while (plays.length && safety++ < 60 && !c.over) {
      const m = rng.pick(plays);
      c.play(m.uid, m.targetUid);
      plays = c.validPlays();
    }
    if (c.over) break;
    c.endTurn();
    checkInvariants(c, seed);
  }
  if (turnGuard >= 500) throw new Error(`non-termination / soft-lock (seed ${seed})`);
  checkInvariants(c, seed);
  return c.result;
}

const N = Number(process.argv[2] || 3000);
let wins = 0;
for (let s = 1; s <= N; s++) if (autoplay(s) === 'win') wins++;
console.log(`fuzz OK — ${N} runs, no crashes / soft-locks / invariant breaks.`);
console.log(`random-AI win rate vs early pack: ${(wins / N * 100).toFixed(1)}%`);
