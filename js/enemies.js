// Enemy + elite + boss definitions and intent AI. Pure — no DOM. RNG injected.
// Move: { id, type:'attack'|'block'|'buff'|'debuff', amount, times?, status?, weight }
// (Numbers tuned in the Phase 6 balance pass via the fuzzer.)

export const ENEMIES = {
  // ---- common ----
  goblin: { id:'goblin', name:'Goblin', emoji:'👺', hp:[24,30], moves:[
    { id:'scimitar', type:'attack', amount:8, weight:5 },
    { id:'shortbow', type:'attack', amount:5, weight:3 },
    { id:'skirmish', type:'block',  amount:5, weight:2 } ] },
  skeleton: { id:'skeleton', name:'Skeleton', emoji:'💀', hp:[30,38], moves:[
    { id:'bone_strike', type:'attack', amount:9, weight:5 },
    { id:'rattle',      type:'debuff', status:'weak', amount:2, weight:2 },
    { id:'guard',       type:'block',  amount:7, weight:2 } ] },
  direwolf: { id:'direwolf', name:'Dire Wolf', emoji:'🐺', hp:[28,34], moves:[
    { id:'bite', type:'attack', amount:7, weight:4 },
    { id:'hunger', type:'ramp', amount:1, weight:3 }, // grows hungrier each turn — punishes stalling
    { id:'maul', type:'attack', amount:11, weight:2 } ] },
  bandit: { id:'bandit', name:'Bandit', emoji:'🗡️', hp:[32,40], moves:[
    { id:'cut',   type:'attack', amount:8, weight:4 },
    { id:'feint', type:'debuff', status:'weak', amount:2, weight:2 },
    { id:'guard', type:'block',  amount:6, weight:2 } ] },
  orc: { id:'orc', name:'Orc Raider', emoji:'👹', hp:[42,52], moves:[
    { id:'cleave', type:'attack', amount:12, weight:4 },
    { id:'roar',   type:'buff', status:'strength', amount:3, weight:2 },
    { id:'brace',  type:'block',  amount:8, weight:2 } ] },
  cultist: { id:'cultist', name:'Ashen Cultist', emoji:'🕯️', hp:[30,36], moves:[
    { id:'hex',    type:'debuff', status:'vulnerable', amount:2, weight:3 },
    { id:'dagger', type:'attack', amount:7, weight:3 },
    { id:'chant',  type:'buff', status:'strength', amount:2, weight:2 } ] },

  // ---- elites ----
  orc_berserker: { id:'orc_berserker', name:'Orc Berserker', emoji:'😤', elite:true, hp:[96,112], moves:[
    { id:'smash',  type:'attack', amount:18, weight:3 },
    { id:'wind_up', type:'charge', amount:30, releaseId:'devastate', weight:2 }, // telegraphed two-beat blow
    { id:'enrage', type:'buff', status:'strength', amount:4, weight:2 },
    { id:'flurry', type:'attack', amount:9, times:2, weight:2 } ] },
  cult_zealot: { id:'cult_zealot', name:'Cult Zealot', emoji:'🔥', elite:true, hp:[90,106], moves:[
    { id:'searing', type:'attack', amount:16, weight:4 },
    { id:'raise_dead', type:'summon', summonId:'skeleton', cap:3, weight:2 }, // raises skeletons (capped)
    { id:'ward',    type:'block',  amount:16, weight:2 } ] },

  // ---- boss: High Priest of Ash (3 phases) ----
  high_priest: { id:'high_priest', name:'High Priest of Ash', emoji:'☠️', boss:true, hp:[270,270],
    phases:[
      { line:'You smell of hope. We will render it down to ash.', moves:[
        { id:'ash_bolt', type:'attack', amount:13, weight:5 },
        { id:'dark_ward', type:'block', amount:14, weight:2 },
        { id:'ember_growth', type:'ramp', amount:1, weight:2 }, // stalling lets his fire grow
        { id:'hex', type:'debuff', status:'weak', amount:2, weight:2 } ] },
      { line:'The Hollow stirs — can you not hear it breathing beneath your feet?', enterBlock:18, moves:[
        { id:'searing', type:'attack', amount:19, weight:4 },
        { id:'conflagration', type:'attack', amount:11, times:2, weight:3 },
        { id:'call_faithful', type:'summon', summonId:'cultist', cap:3, weight:2 }, // raises the faithful (capped)
        { id:'curse', type:'debuff', status:'vulnerable', amount:3, weight:2 } ] },
      { line:'Too late — the door is OPEN!', enterStrength:5, moves:[
        { id:'annihilation', type:'charge', amount:28, releaseId:'cataclysm', weight:4 }, // winds up a killing blow
        { id:'frenzy', type:'attack', amount:8, times:3, weight:3 } ] },
    ] },
};

export const ENEMY_INTENT_ICON = { attack:'⚔️', block:'🛡️', buff:'⬆️', debuff:'🌀', charge:'💥', summon:'☠️', ramp:'📈' };

let _eid = 0;
export function makeEnemy(rng, id) {
  const def = ENEMIES[id];
  if (!def) throw new Error('Unknown enemy: ' + id);
  const maxHp = rng.int(def.hp[0], def.hp[1]);
  const e = {
    uid: 'e' + (++_eid), id: def.id, name: def.name, emoji: def.emoji,
    maxHp, hp: maxHp, block: 0, statuses: {}, def, history: [], intent: null,
    boss: !!def.boss, elite: !!def.elite, phase: 0,
    moves: def.boss ? def.phases[0].moves : def.moves,
  };
  rollIntent(rng, e);
  return e;
}

export function rollIntent(rng, e) {
  if (e.forcedNext) { // a charge release is queued — it bypasses the weighted roll
    const f = e.forcedNext; e.forcedNext = null;
    e.intent = { moveId: f.moveId, type: f.type, amount: f.amount || 0, times: f.times || 1,
      status: f.status || null, icon: ENEMY_INTENT_ICON[f.type] || '❔' };
    e.history.push(f.moveId);
    return e.intent;
  }
  const moves = e.moves || e.def.moves;
  const last2 = e.history.slice(-2);
  let pool = moves.filter((m) => !(last2.length === 2 && last2.every((x) => x === m.id)));
  if (pool.length === 0) pool = moves;
  const total = pool.reduce((s, m) => s + m.weight, 0);
  let r = rng.next() * total, move = pool[pool.length - 1];
  for (const m of pool) { if ((r -= m.weight) < 0) { move = m; break; } }
  e.intent = {
    moveId: move.id, type: move.type, amount: move.amount || 0, times: move.times || 1,
    status: move.status || null, icon: ENEMY_INTENT_ICON[move.type] || '❔',
    summonId: move.summonId, cap: move.cap, releaseId: move.releaseId, max: move.max, // charge/summon/ramp params
  };
  e.history.push(move.id);
  return e.intent;
}

export function advanceBoss(rng, e) {
  if (!e.boss) return;
  const frac = e.hp / e.maxHp;
  const target = frac <= 0.33 ? 2 : frac <= 0.66 ? 1 : 0;
  if (target > e.phase) {
    e.phase = target;
    const ph = e.def.phases[target];
    e.moves = ph.moves; e.history = []; e.forcedNext = null; // a new phase overrides any queued charge
    if (ph.enterBlock) e.block += ph.enterBlock;
    if (ph.enterStrength) e.statuses.strength = (e.statuses.strength || 0) + ph.enterStrength;
    e.transition = ph.line;
    rollIntent(rng, e);
  }
}
