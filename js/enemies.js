// Enemy definitions + intent AI. Pure — no DOM. RNG is injected.
// Moves: { id, type:'attack'|'block'|'buff'|'debuff', amount, status?, weight }
// Intent selection = weighted random with an anti-repeat rule (no same move 3x running).

export const ENEMIES = {
  goblin: { id:'goblin', name:'Goblin', emoji:'👺', hp:[20,26],
    moves:[
      { id:'scimitar', type:'attack', amount:6, weight:5 },
      { id:'shortbow', type:'attack', amount:4, weight:3 },
      { id:'skirmish', type:'block',  amount:5, weight:2 },
    ] },
  skeleton: { id:'skeleton', name:'Skeleton', emoji:'💀', hp:[26,32],
    moves:[
      { id:'bone_strike', type:'attack', amount:7, weight:5 },
      { id:'rattle',      type:'debuff', status:'weak', amount:1, weight:2 },
      { id:'guard',       type:'block',  amount:6, weight:2 },
    ] },
  direwolf: { id:'direwolf', name:'Dire Wolf', emoji:'🐺', hp:[24,30],
    moves:[
      { id:'bite', type:'attack', amount:5, weight:4 },
      { id:'howl', type:'buff', status:'strength', amount:2, weight:2 },
      { id:'maul', type:'attack', amount:9, weight:2 },
    ] },
};

export const ENEMY_INTENT_ICON = { attack:'⚔️', block:'🛡️', buff:'⬆️', debuff:'🌀' };

let _eid = 0;
export function makeEnemy(rng, id) {
  const def = ENEMIES[id];
  if (!def) throw new Error('Unknown enemy: ' + id);
  const maxHp = rng.int(def.hp[0], def.hp[1]);
  const e = {
    uid: 'e' + (++_eid), id: def.id, name: def.name, emoji: def.emoji,
    maxHp, hp: maxHp, block: 0, statuses: {}, def, history: [], intent: null,
  };
  rollIntent(rng, e);
  return e;
}

export function rollIntent(rng, e) {
  const moves = e.def.moves;
  // anti-repeat: forbid a move that was the last two intents
  const last2 = e.history.slice(-2);
  let pool = moves.filter((m) => !(last2.length === 2 && last2.every((x) => x === m.id)));
  if (pool.length === 0) pool = moves;
  const total = pool.reduce((s, m) => s + m.weight, 0);
  let r = rng.next() * total;
  let move = pool[pool.length - 1];
  for (const m of pool) { if ((r -= m.weight) < 0) { move = m; break; } }
  e.intent = {
    moveId: move.id, type: move.type, amount: move.amount || 0,
    status: move.status || null, icon: ENEMY_INTENT_ICON[move.type] || '❔',
  };
  e.history.push(move.id);
  return e.intent;
}
