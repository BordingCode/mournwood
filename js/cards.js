// All card definitions. Pure data; effects are op-lists interpreted by combat.js.
// Op amounts may be a number or a scaling spec {base, scale:{stat,per}, perCombo}.

export const CARDS = {
  /* ---------------- universal ---------------- */
  strike: { id:'strike', name:'Strike', type:'attack', cost:1, rarity:'starter', target:'enemy',
    text:'Deal 6 damage.', flavor:'Simple. Honest. Final.', effects:[{ k:'damage', amount:6 }] },
  defend: { id:'defend', name:'Defend', type:'skill', cost:1, rarity:'starter', target:'self',
    text:'Gain 5 Block.', flavor:'Brace.', effects:[{ k:'block', amount:5 }] },
  shiv:   { id:'shiv', name:'Shiv', type:'attack', cost:0, rarity:'token', target:'enemy',
    text:'Deal 4 damage.', flavor:'Quick and quiet.', effects:[{ k:'damage', amount:4 }] },
  ashen_doubt: { id:'ashen_doubt', name:'Ashen Doubt', type:'curse', cost:1, rarity:'curse', target:'none',
    unplayable:true, text:'Unplayable. A whisper you cannot silence.', flavor:'…are you sure?', effects:[] },

  /* ---------------- Fighter ---------------- */
  f_strike:{ id:'f_strike', name:'Slash', type:'attack', cost:1, rarity:'starter', target:'enemy',
    text:'Deal 6 damage.', effects:[{ k:'damage', amount:6 }] },
  f_defend:{ id:'f_defend', name:'Defend', type:'skill', cost:1, rarity:'starter', target:'self',
    text:'Gain 5 Block.', effects:[{ k:'block', amount:5 }] },
  f_shield_bash:{ id:'f_shield_bash', name:'Shield Bash', type:'attack', cost:1, rarity:'starter', target:'enemy',
    text:'Deal 4 damage. Gain 4 Block.', effects:[{ k:'damage', amount:4 }, { k:'block', amount:4 }] },
  f_brace:{ id:'f_brace', name:'Brace', type:'skill', cost:1, rarity:'starter', target:'self',
    text:'Gain 8 Block.', effects:[{ k:'block', amount:8 }] },
  f_barricade:{ id:'f_barricade', name:'Barricade', type:'power', cost:2, rarity:'starter', target:'self',
    text:'Block is no longer lost at the start of your turn.', flavor:'Hold the line.',
    effects:[{ k:'status', status:'retain', amount:1, to:'self' }] },
  f_hone:{ id:'f_hone', name:'Hone Edge', type:'power', cost:1, rarity:'common', target:'self',
    text:'Gain 1 Strength.', effects:[{ k:'status', status:'strength', amount:1, to:'self' }] },

  /* ---------------- Barbarian ---------------- */
  b_bash:{ id:'b_bash', name:'Bash', type:'attack', cost:1, rarity:'starter', target:'enemy',
    text:'Deal 8 damage. Apply 1 Vulnerable.', effects:[{ k:'damage', amount:8 }, { k:'status', status:'vulnerable', amount:1, to:'target' }] },
  b_reckless:{ id:'b_reckless', name:'Reckless Swing', type:'attack', cost:1, rarity:'starter', target:'enemy',
    text:'Deal 10 damage. Lose 2 HP.', effects:[{ k:'damage', amount:10 }, { k:'selfDamage', amount:2 }] },
  b_rage:{ id:'b_rage', name:'Rage', type:'skill', cost:0, rarity:'starter', target:'self',
    text:'Gain 2 Rage. Lose 1 HP.', flavor:'Let it burn.', effects:[{ k:'status', status:'rage', amount:2, to:'self' }, { k:'selfDamage', amount:1 }] },
  b_cleave:{ id:'b_cleave', name:'Cleave', type:'attack', cost:1, rarity:'starter', target:'all',
    text:'Deal 5 damage to ALL enemies.', effects:[{ k:'damage', amount:5 }] },
  b_savage:{ id:'b_savage', name:'Savage Blow', type:'attack', cost:2, rarity:'starter', target:'enemy',
    text:'Deal 8 damage, +2 per Rage.', effects:[{ k:'damage', amount:{ base:8, scale:{ stat:'rage', per:2 } } }] },
  b_defend:{ id:'b_defend', name:'Defend', type:'skill', cost:1, rarity:'starter', target:'self',
    text:'Gain 5 Block.', effects:[{ k:'block', amount:5 }] },

  /* ---------------- Rogue ---------------- */
  r_strike:{ id:'r_strike', name:'Quick Strike', type:'attack', cost:1, rarity:'starter', target:'enemy',
    text:'Deal 5 damage.', effects:[{ k:'damage', amount:5 }] },
  r_defend:{ id:'r_defend', name:'Defend', type:'skill', cost:1, rarity:'starter', target:'self',
    text:'Gain 5 Block.', effects:[{ k:'block', amount:5 }] },
  r_shiv:{ id:'r_shiv', name:'Throw Shiv', type:'attack', cost:0, rarity:'starter', target:'enemy',
    text:'Deal 4 damage.', flavor:'No backswing.', effects:[{ k:'damage', amount:4 }] },
  r_envenom:{ id:'r_envenom', name:'Envenom', type:'skill', cost:1, rarity:'starter', target:'enemy',
    text:'Apply 4 Poison.', effects:[{ k:'status', status:'poison', amount:4, to:'target' }] },
  r_backstab:{ id:'r_backstab', name:'Backstab', type:'attack', cost:1, rarity:'starter', target:'enemy',
    text:'Deal 6 damage, +2 per card played this turn.', effects:[{ k:'damage', amount:{ base:6, perCombo:2 } }] },
  r_prepare:{ id:'r_prepare', name:'Prepare', type:'skill', cost:0, rarity:'starter', target:'self',
    text:'Draw 1 card.', effects:[{ k:'draw', amount:1 }] },

  /* ---------------- Ranger ---------------- */
  ra_shot:{ id:'ra_shot', name:'Bow Shot', type:'attack', cost:1, rarity:'starter', target:'enemy',
    text:'Deal 5 damage.', effects:[{ k:'damage', amount:5 }] },
  ra_defend:{ id:'ra_defend', name:'Sidestep', type:'skill', cost:1, rarity:'starter', target:'self',
    text:'Gain 5 Block.', effects:[{ k:'block', amount:5 }] },
  ra_focus:{ id:'ra_focus', name:'Take Aim', type:'skill', cost:1, rarity:'starter', target:'self',
    text:'Gain 2 Focus. Draw 1.', effects:[{ k:'status', status:'focus', amount:2, to:'self' }, { k:'draw', amount:1 }] },
  ra_companion:{ id:'ra_companion', name:'Summon Companion', type:'power', cost:2, rarity:'starter', target:'self',
    text:'A beast strikes a foe (+Focus) at the end of each turn.', flavor:'Loyal and lean.',
    effects:[{ k:'status', status:'companion', amount:4, to:'self' }] },
  ra_volley:{ id:'ra_volley', name:'Volley', type:'attack', cost:1, rarity:'starter', target:'all',
    text:'Deal 4 damage to ALL enemies.', effects:[{ k:'damage', amount:4 }] },
  ra_aimed:{ id:'ra_aimed', name:'Aimed Shot', type:'attack', cost:1, rarity:'starter', target:'enemy',
    text:'Deal 5 damage, +1 per Focus.', effects:[{ k:'damage', amount:{ base:5, scale:{ stat:'focus', per:1 } } }] },

  /* ---------------- Wizard ---------------- */
  bolt:{ id:'bolt', name:'Arcane Bolt', type:'attack', cost:1, rarity:'starter', target:'enemy', spell:true,
    text:'Deal 5 damage. (Scales with Spellpower.)', effects:[{ k:'damage', amount:5 }] },
  ward:{ id:'ward', name:'Ward', type:'skill', cost:1, rarity:'starter', target:'self',
    text:'Gain 5 Block.', effects:[{ k:'block', amount:5 }] },
  frost:{ id:'frost', name:'Frost Lance', type:'attack', cost:1, rarity:'starter', target:'enemy', spell:true,
    text:'Deal 4 damage. Apply 1 Weak.', effects:[{ k:'damage', amount:4 }, { k:'status', status:'weak', amount:1, to:'target' }] },
  arcane_surge:{ id:'arcane_surge', name:'Arcane Surge', type:'power', cost:1, rarity:'starter', target:'self',
    text:'Gain 1 Spellpower. Draw 1.', effects:[{ k:'status', status:'spellpower', amount:1, to:'self' }, { k:'draw', amount:1 }] },
  fireball:{ id:'fireball', name:'Fireball', type:'attack', cost:2, rarity:'starter', target:'all', spell:true,
    text:'Deal 9 damage to ALL enemies.', effects:[{ k:'damage', amount:9 }] },

  /* ---------------- Sorcerer ---------------- */
  so_wildbolt:{ id:'so_wildbolt', name:'Wild Bolt', type:'attack', cost:1, rarity:'starter', target:'enemy', spell:true,
    text:'Deal 5 damage, then a random boon.', flavor:'Magic with a mind of its own.',
    effects:[{ k:'damage', amount:5 }, { k:'random', options:[ { k:'draw', amount:1 }, { k:'status', status:'spellpower', amount:1, to:'self' }, { k:'energy', amount:1 } ] }] },
  so_ward:{ id:'so_ward', name:'Ward', type:'skill', cost:1, rarity:'starter', target:'self',
    text:'Gain 5 Block.', effects:[{ k:'block', amount:5 }] },
  so_chaos:{ id:'so_chaos', name:'Chaos Surge', type:'skill', cost:1, rarity:'starter', target:'self',
    text:'A random effect: Block, Spellpower, or a bolt.',
    effects:[{ k:'random', options:[ { k:'block', amount:7 }, { k:'status', status:'spellpower', amount:2, to:'self' }, { k:'damage', amount:6, target:'random' } ] }] },
  so_surge:{ id:'so_surge', name:'Mana Surge', type:'power', cost:1, rarity:'starter', target:'self',
    text:'Gain 1 Spellpower. Draw 1.', effects:[{ k:'status', status:'spellpower', amount:1, to:'self' }, { k:'draw', amount:1 }] },
  so_meteor:{ id:'so_meteor', name:'Meteor', type:'attack', cost:2, rarity:'starter', target:'all', spell:true,
    text:'Deal 7 damage to ALL enemies.', effects:[{ k:'damage', amount:7 }] },

  /* ---------------- Cleric ---------------- */
  cl_mace:{ id:'cl_mace', name:'Mace Strike', type:'attack', cost:1, rarity:'starter', target:'enemy',
    text:'Deal 5 damage.', effects:[{ k:'damage', amount:5 }] },
  cl_defend:{ id:'cl_defend', name:'Defend', type:'skill', cost:1, rarity:'starter', target:'self',
    text:'Gain 5 Block.', effects:[{ k:'block', amount:5 }] },
  cl_pray:{ id:'cl_pray', name:'Prayer', type:'skill', cost:0, rarity:'starter', target:'self',
    text:'Gain 1 Piety. Draw 1.', effects:[{ k:'status', status:'piety', amount:1, to:'self' }, { k:'draw', amount:1 }] },
  cl_blessing:{ id:'cl_blessing', name:'Blessing', type:'skill', cost:1, rarity:'starter', target:'self',
    text:'Heal 5. Gain 1 Piety.', effects:[{ k:'heal', amount:5 }, { k:'status', status:'piety', amount:1, to:'self' }] },
  cl_smite:{ id:'cl_smite', name:'Smite', type:'attack', cost:1, rarity:'starter', target:'enemy',
    text:'Deal 6 damage, +2 per Piety.', effects:[{ k:'damage', amount:{ base:6, scale:{ stat:'piety', per:2 } } }] },
  cl_sanctuary:{ id:'cl_sanctuary', name:'Sanctuary', type:'skill', cost:1, rarity:'starter', target:'self',
    text:'Gain 8 Block.', effects:[{ k:'block', amount:8 }] },

  /* ---------------- Druid ---------------- */
  d_claw:{ id:'d_claw', name:'Claw', type:'attack', cost:1, rarity:'starter', target:'enemy',
    text:'Deal 5 damage, +1 per Beast Form.', effects:[{ k:'damage', amount:{ base:5, scale:{ stat:'beast', per:1 } } }] },
  d_bark:{ id:'d_bark', name:'Barkskin', type:'skill', cost:1, rarity:'starter', target:'self',
    text:'Gain 6 Block.', effects:[{ k:'block', amount:6 }] },
  d_beast:{ id:'d_beast', name:'Beast Form', type:'skill', cost:0, rarity:'starter', target:'self',
    text:'Gain 2 Beast Form.', flavor:'Fur and fang.', effects:[{ k:'status', status:'beast', amount:2, to:'self' }] },
  d_caster:{ id:'d_caster', name:'Caster Form', type:'skill', cost:0, rarity:'starter', target:'self',
    text:'Gain 2 Caster Form. Draw 1.', effects:[{ k:'status', status:'caster', amount:2, to:'self' }, { k:'draw', amount:1 }] },
  d_spores:{ id:'d_spores', name:'Spore Cloud', type:'skill', cost:1, rarity:'starter', target:'enemy',
    text:'Apply 4 Poison.', effects:[{ k:'status', status:'poison', amount:4, to:'target' }] },
  d_starfire:{ id:'d_starfire', name:'Starfire', type:'attack', cost:1, rarity:'starter', target:'enemy', spell:true,
    text:'Deal 4 damage, +1 per Caster Form.', effects:[{ k:'damage', amount:{ base:4, scale:{ stat:'caster', per:1 } } }] },

  /* ---------------- Paladin ---------------- */
  p_holy_strike:{ id:'p_holy_strike', name:'Holy Strike', type:'attack', cost:1, rarity:'starter', target:'enemy',
    text:'Deal 5 damage. Gain 1 Conviction.', effects:[{ k:'damage', amount:5 }, { k:'status', status:'conviction', amount:1, to:'self' }] },
  p_defend:{ id:'p_defend', name:'Defend', type:'skill', cost:1, rarity:'starter', target:'self',
    text:'Gain 5 Block.', effects:[{ k:'block', amount:5 }] },
  p_oath:{ id:'p_oath', name:'Oath', type:'skill', cost:0, rarity:'starter', target:'self',
    text:'Gain 1 Conviction. Draw 1.', effects:[{ k:'status', status:'conviction', amount:1, to:'self' }, { k:'draw', amount:1 }] },
  p_smite:{ id:'p_smite', name:'Divine Smite', type:'attack', cost:1, rarity:'starter', target:'enemy',
    text:'Deal 6 damage, +2 per Conviction.', effects:[{ k:'damage', amount:{ base:6, scale:{ stat:'conviction', per:2 } } }] },
  p_consecrate:{ id:'p_consecrate', name:'Consecrate', type:'skill', cost:1, rarity:'starter', target:'self',
    text:'Gain 4 Block, +2 per Conviction.', effects:[{ k:'block', amount:{ base:4, scale:{ stat:'conviction', per:2 } } }] },
  p_blessing:{ id:'p_blessing', name:'Bless', type:'skill', cost:1, rarity:'starter', target:'self',
    text:'Heal 3, +1 per Conviction.', effects:[{ k:'heal', amount:{ base:3, scale:{ stat:'conviction', per:1 } } }] },

  /* ---------------- race signature cards ---------------- */
  sig_second_wind:{ id:'sig_second_wind', name:'Second Wind', type:'skill', cost:0, rarity:'signature', target:'self', exhaust:true,
    text:'Gain 1 Energy. Draw 1. Exhaust.', flavor:'Dig deep.', effects:[{ k:'energy', amount:1 }, { k:'draw', amount:1 }] },
  sig_elven_grace:{ id:'sig_elven_grace', name:'Elven Grace', type:'skill', cost:0, rarity:'signature', target:'self', exhaust:true,
    text:'Gain 3 Block and 1 Focus. Exhaust.', effects:[{ k:'block', amount:3 }, { k:'status', status:'focus', amount:1, to:'self' }] },
  sig_dwarven_fortitude:{ id:'sig_dwarven_fortitude', name:'Dwarven Fortitude', type:'skill', cost:1, rarity:'signature', target:'self',
    text:'Gain 8 Block.', effects:[{ k:'block', amount:8 }] },
  sig_lucky_strike:{ id:'sig_lucky_strike', name:'Lucky Strike', type:'attack', cost:1, rarity:'signature', target:'enemy',
    text:'Deal 6 damage. Maybe draw a card.', effects:[{ k:'damage', amount:6 }, { k:'random', options:[ { k:'draw', amount:1 }, [] ] }] },
  sig_arcane_insight:{ id:'sig_arcane_insight', name:'Arcane Insight', type:'skill', cost:0, rarity:'signature', target:'self', exhaust:true,
    text:'Draw 1. Gain 1 Spellpower. Exhaust.', effects:[{ k:'draw', amount:1 }, { k:'status', status:'spellpower', amount:1, to:'self' }] },
  sig_savage_blow:{ id:'sig_savage_blow', name:'Savage Blow', type:'attack', cost:2, rarity:'signature', target:'enemy',
    text:'Deal 12 damage. Lose 2 HP. Gain 1 Strength.', effects:[{ k:'damage', amount:12 }, { k:'selfDamage', amount:2 }, { k:'status', status:'strength', amount:1, to:'self' }] },
  sig_breath:{ id:'sig_breath', name:'Elemental Breath', type:'attack', cost:1, rarity:'signature', target:'all', spell:true, exhaust:true,
    text:'Deal 6 damage to ALL enemies. Exhaust.', flavor:'Inhale… exhale ruin.', effects:[{ k:'damage', amount:6 }] },
  sig_infernal_pact:{ id:'sig_infernal_pact', name:'Infernal Pact', type:'attack', cost:1, rarity:'signature', target:'enemy',
    text:'Deal 5 damage. Apply 5 Poison.', effects:[{ k:'damage', amount:5 }, { k:'status', status:'poison', amount:5, to:'target' }] },
  sig_stone_endurance:{ id:'sig_stone_endurance', name:'Stone Endurance', type:'skill', cost:1, rarity:'signature', target:'self',
    text:'Gain 10 Block and 1 Dexterity.', effects:[{ k:'block', amount:10 }, { k:'status', status:'dexterity', amount:1, to:'self' }] },

  /* ---------------- neutral reward-pool commons (any class) ---------------- */
  heavy_strike:{ id:'heavy_strike', name:'Heavy Strike', type:'attack', cost:2, rarity:'common', target:'enemy',
    text:'Deal 9 damage.', effects:[{ k:'damage', amount:9 }] },
  iron_wave:{ id:'iron_wave', name:'Iron Wave', type:'attack', cost:1, rarity:'common', target:'enemy',
    text:'Deal 5 damage. Gain 5 Block.', effects:[{ k:'damage', amount:5 }, { k:'block', amount:5 }] },
  precise_strike:{ id:'precise_strike', name:'Precise Strike', type:'attack', cost:1, rarity:'common', target:'enemy',
    text:'Deal 7 damage.', effects:[{ k:'damage', amount:7 }] },
  bulwark:{ id:'bulwark', name:'Bulwark', type:'skill', cost:1, rarity:'common', target:'self',
    text:'Gain 8 Block.', effects:[{ k:'block', amount:8 }] },
  quick_step:{ id:'quick_step', name:'Quick Step', type:'skill', cost:0, rarity:'common', target:'self',
    text:'Gain 3 Block. Draw 1.', effects:[{ k:'block', amount:3 }, { k:'draw', amount:1 }] },
  toxic_dart:{ id:'toxic_dart', name:'Toxic Dart', type:'attack', cost:1, rarity:'common', target:'enemy',
    text:'Deal 3 damage. Apply 3 Poison.', effects:[{ k:'damage', amount:3 }, { k:'status', status:'poison', amount:3, to:'target' }] },
  rally:{ id:'rally', name:'Rally', type:'skill', cost:1, rarity:'common', target:'self',
    text:'Gain 5 Block. Draw 1.', effects:[{ k:'block', amount:5 }, { k:'draw', amount:1 }] },
  empower:{ id:'empower', name:'Empower', type:'power', cost:1, rarity:'common', target:'self',
    text:'Gain 1 Strength.', effects:[{ k:'status', status:'strength', amount:1, to:'self' }] },
};

export const REWARD_POOL = ['heavy_strike','iron_wave','precise_strike','bulwark','quick_step','toxic_dart','rally','empower'];

export const STARTER_DECKS = {
  fighter:  ['f_strike','f_strike','f_strike','f_defend','f_defend','f_defend','f_shield_bash','f_shield_bash','f_brace','f_barricade'],
  barbarian:['b_bash','b_bash','b_bash','b_reckless','b_reckless','b_rage','b_rage','b_cleave','b_savage','b_defend'],
  rogue:    ['r_strike','r_strike','r_strike','r_defend','r_defend','r_shiv','r_shiv','r_envenom','r_backstab','r_prepare'],
  ranger:   ['ra_shot','ra_shot','ra_shot','ra_defend','ra_defend','ra_focus','ra_focus','ra_companion','ra_volley','ra_aimed'],
  wizard:   ['bolt','bolt','bolt','bolt','ward','ward','ward','frost','arcane_surge','fireball'],
  sorcerer: ['so_wildbolt','so_wildbolt','so_wildbolt','so_wildbolt','so_ward','so_ward','so_chaos','so_chaos','so_surge','so_meteor'],
  cleric:   ['cl_mace','cl_mace','cl_mace','cl_defend','cl_defend','cl_pray','cl_pray','cl_smite','cl_blessing','cl_sanctuary'],
  druid:    ['d_claw','d_claw','d_claw','d_bark','d_bark','d_beast','d_caster','d_spores','d_starfire','d_starfire'],
  paladin:  ['p_holy_strike','p_holy_strike','p_holy_strike','p_defend','p_defend','p_oath','p_oath','p_smite','p_consecrate','p_blessing'],
};

export const RACE_SIGNATURE = {
  human:'sig_second_wind', elf:'sig_elven_grace', dwarf:'sig_dwarven_fortitude',
  halfling:'sig_lucky_strike', gnome:'sig_arcane_insight', halforc:'sig_savage_blow',
  dragonborn:'sig_breath', tiefling:'sig_infernal_pact', goliath:'sig_stone_endurance',
};

export function starterFor(classId) {
  return STARTER_DECKS[classId] || ['strike','strike','strike','strike','defend','defend','defend','defend','strike','defend'];
}

/** Full opening deck = class starter + race signature card. */
export function buildDeck(classId, raceId) {
  const deck = starterFor(classId).slice();
  const sig = RACE_SIGNATURE[raceId];
  if (sig && CARDS[sig]) deck.push(sig);
  return deck;
}

let _uid = 0;
export function instantiate(id) {
  const def = CARDS[id];
  if (!def) throw new Error('Unknown card: ' + id);
  return { uid: 'c' + (++_uid), ...def };
}
