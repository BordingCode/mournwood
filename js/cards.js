// All card definitions. Pure data; effects are op-lists interpreted by combat.js.
// Each class has a DISTINCT identity (unique defense + a basic that feeds its scaling
// stat + synergy payoffs) — no reskinned Strike/Defend clones.
// Op amounts may be a number or a scaling spec {base, scale:{stat,per}} / {base, perCombo}.
// 'block' is a virtual scale stat (= floor(currentBlock/4)). Ops: damage(+times,+target),
// block, heal, draw, energy, status, selfDamage, addCard, random, loseStatus, if.

export const CARDS = {
  /* ---------------- universal (fallback / tokens / curse) ---------------- */
  strike: { id:'strike', name:'Strike', type:'attack', cost:1, rarity:'starter', target:'enemy',
    text:'Deal 6 damage.', effects:[{ k:'damage', amount:6 }] },
  defend: { id:'defend', name:'Defend', type:'skill', cost:1, rarity:'starter', target:'self',
    text:'Gain 5 Block.', effects:[{ k:'block', amount:5 }] },
  shiv:   { id:'shiv', name:'Shiv', type:'attack', cost:0, rarity:'token', target:'enemy',
    text:'Deal 4 damage.', effects:[{ k:'damage', amount:4 }] },
  ashen_doubt: { id:'ashen_doubt', name:'Ashen Doubt', type:'curse', cost:1, rarity:'curse', target:'none',
    unplayable:true, text:'Unplayable. A whisper you cannot silence.', effects:[] },

  /* ---------------- Fighter — Block is a weapon ---------------- */
  f_guard:{ id:'f_guard', name:'Guard Stance', type:'skill', cost:1, rarity:'starter', target:'self',
    text:'Gain 6 Block. If Barricaded, gain 3 more.',
    effects:[{ k:'block', amount:6 }, { k:'if', on:'self', status:'retain', then:[{ k:'block', amount:3 }] }] },
  f_riposte:{ id:'f_riposte', name:'Riposte', type:'attack', cost:1, rarity:'starter', target:'enemy',
    text:'Deal 4 damage, +1 per 4 Block you have.',
    effects:[{ k:'damage', amount:{ base:4, scale:{ stat:'block', per:1 } } }] },
  f_shield_bash:{ id:'f_shield_bash', name:'Shield Bash', type:'attack', cost:1, rarity:'starter', target:'enemy',
    text:'Deal 5 damage. Gain 4 Block. If Barricaded, apply 1 Vulnerable.',
    effects:[{ k:'damage', amount:5 }, { k:'block', amount:4 }, { k:'if', on:'self', status:'retain', then:[{ k:'status', status:'vulnerable', amount:1, to:'target' }] }] },
  f_brace:{ id:'f_brace', name:'Iron Brace', type:'skill', cost:1, rarity:'starter', target:'self',
    text:'Gain 9 Block.', effects:[{ k:'block', amount:9 }] },
  f_counter:{ id:'f_counter', name:'Counterstrike', type:'attack', cost:1, rarity:'common', target:'enemy',
    text:'Deal 6 damage. If you have Block, deal 4 more.',
    effects:[{ k:'damage', amount:6 }, { k:'if', on:'self', status:'block', then:[{ k:'damage', amount:4 }] }] },
  f_perfect_block:{ id:'f_perfect_block', name:'Perfect Block', type:'skill', cost:0, rarity:'uncommon', target:'self',
    text:'Gain 4 Block. Draw 1.', effects:[{ k:'block', amount:4 }, { k:'draw', amount:1 }] },
  f_barricade:{ id:'f_barricade', name:'Barricade', type:'power', cost:2, rarity:'starter', target:'self',
    text:'Block is no longer lost at the start of your turn.',
    effects:[{ k:'status', status:'retain', amount:1, to:'self' }] },
  f_hone:{ id:'f_hone', name:'Hone Edge', type:'power', cost:1, rarity:'starter', target:'self',
    text:'Gain 1 Strength.', effects:[{ k:'status', status:'strength', amount:1, to:'self' }] },

  /* ---------------- Barbarian — pay in blood (Rage, no safe defense) ---------------- */
  b_hew:{ id:'b_hew', name:'Hew', type:'attack', cost:1, rarity:'starter', target:'enemy',
    text:'Deal 7 damage, +1 per Rage.', effects:[{ k:'damage', amount:{ base:7, scale:{ stat:'rage', per:1 } } }] },
  b_reckless:{ id:'b_reckless', name:'Reckless Swing', type:'attack', cost:1, rarity:'starter', target:'enemy',
    text:'Deal 11 damage. Lose 3 HP. Gain 1 Rage.',
    effects:[{ k:'damage', amount:11 }, { k:'selfDamage', amount:3 }, { k:'status', status:'rage', amount:1, to:'self' }] },
  b_bloodied_hide:{ id:'b_bloodied_hide', name:'Bloodied Hide', type:'skill', cost:1, rarity:'starter', target:'self',
    text:'Gain 8 Block. Lose 2 HP. Gain 1 Rage.',
    effects:[{ k:'block', amount:8 }, { k:'selfDamage', amount:2 }, { k:'status', status:'rage', amount:1, to:'self' }] },
  b_rage:{ id:'b_rage', name:'Rage', type:'skill', cost:0, rarity:'starter', target:'self',
    text:'Gain 2 Rage. Lose 1 HP.', effects:[{ k:'status', status:'rage', amount:2, to:'self' }, { k:'selfDamage', amount:1 }] },
  b_cleave:{ id:'b_cleave', name:'Cleave', type:'attack', cost:1, rarity:'starter', target:'all',
    text:'Deal 5 damage to ALL, +1 per Rage.', effects:[{ k:'damage', amount:{ base:5, scale:{ stat:'rage', per:1 } } }] },
  b_bash:{ id:'b_bash', name:'Crushing Bash', type:'attack', cost:1, rarity:'starter', target:'enemy',
    text:'Deal 8 damage. Apply 2 Vulnerable.', effects:[{ k:'damage', amount:8 }, { k:'status', status:'vulnerable', amount:2, to:'target' }] },
  b_frenzy:{ id:'b_frenzy', name:'Frenzy', type:'skill', cost:0, rarity:'uncommon', target:'self',
    text:'Gain 1 Rage. Gain 4 Block. Lose 3 HP.',
    effects:[{ k:'status', status:'rage', amount:1, to:'self' }, { k:'block', amount:4 }, { k:'selfDamage', amount:3 }] },
  b_bloodlust:{ id:'b_bloodlust', name:'Bloodlust', type:'attack', cost:2, rarity:'rare', target:'enemy',
    text:'Deal 9 damage +5 per Rage, then lose all Rage.',
    effects:[{ k:'damage', amount:{ base:9, scale:{ stat:'rage', per:5 } } }, { k:'loseStatus', status:'rage', all:true }] },

  /* ---------------- Rogue — death by a thousand cuts (Momentum + Poison) ---------------- */
  r_quick:{ id:'r_quick', name:'Quick Strike', type:'attack', cost:1, rarity:'starter', target:'enemy',
    text:'Deal 5 damage. Gain 1 Momentum.', effects:[{ k:'damage', amount:5 }, { k:'status', status:'momentum', amount:1, to:'self' }] },
  r_smoke:{ id:'r_smoke', name:'Smoke & Mirrors', type:'skill', cost:1, rarity:'starter', target:'self',
    text:'Gain 5 Block. Draw 1. Gain 1 Momentum.',
    effects:[{ k:'block', amount:5 }, { k:'draw', amount:1 }, { k:'status', status:'momentum', amount:1, to:'self' }] },
  r_shiv:{ id:'r_shiv', name:'Throw Shiv', type:'attack', cost:0, rarity:'starter', target:'enemy',
    text:'Deal 4 damage. Gain 1 Momentum.', effects:[{ k:'damage', amount:4 }, { k:'status', status:'momentum', amount:1, to:'self' }] },
  r_envenom:{ id:'r_envenom', name:'Envenom', type:'skill', cost:1, rarity:'starter', target:'enemy',
    text:'Apply 4 Poison, +1 per Momentum.', effects:[{ k:'status', status:'poison', amount:{ base:4, scale:{ stat:'momentum', per:1 } }, to:'target' }] },
  r_backstab:{ id:'r_backstab', name:'Backstab', type:'attack', cost:1, rarity:'starter', target:'enemy',
    text:'Deal 6 damage, +2 per card played this turn.', effects:[{ k:'damage', amount:{ base:6, perCombo:2 } }] },
  r_prepare:{ id:'r_prepare', name:'Prepare', type:'skill', cost:0, rarity:'starter', target:'self',
    text:'Draw 1. Gain 1 Momentum.', effects:[{ k:'draw', amount:1 }, { k:'status', status:'momentum', amount:1, to:'self' }] },
  r_eviscerate:{ id:'r_eviscerate', name:'Eviscerate', type:'attack', cost:2, rarity:'rare', target:'enemy',
    text:'Deal 8 damage +3 per Momentum, then lose all Momentum.',
    effects:[{ k:'damage', amount:{ base:8, scale:{ stat:'momentum', per:3 } } }, { k:'loseStatus', status:'momentum', all:true }] },

  /* ---------------- Ranger — mark and unleash (Focus + companion) ---------------- */
  ra_mark:{ id:'ra_mark', name:"Hunter's Mark", type:'attack', cost:1, rarity:'starter', target:'enemy',
    text:'Deal 4 damage. Apply 1 Vulnerable. Gain 1 Focus.',
    effects:[{ k:'damage', amount:4 }, { k:'status', status:'vulnerable', amount:1, to:'target' }, { k:'status', status:'focus', amount:1, to:'self' }] },
  ra_roll:{ id:'ra_roll', name:'Roll Away', type:'skill', cost:1, rarity:'starter', target:'self',
    text:'Gain 5 Block and 1 Focus.', effects:[{ k:'block', amount:5 }, { k:'status', status:'focus', amount:1, to:'self' }] },
  ra_take_aim:{ id:'ra_take_aim', name:'Take Aim', type:'skill', cost:1, rarity:'starter', target:'self',
    text:'Gain 2 Focus. Draw 1.', effects:[{ k:'status', status:'focus', amount:2, to:'self' }, { k:'draw', amount:1 }] },
  ra_companion:{ id:'ra_companion', name:'Summon Companion', type:'power', cost:2, rarity:'starter', target:'self',
    text:'A beast strikes a foe (+Focus) at the end of each turn.',
    effects:[{ k:'status', status:'companion', amount:4, to:'self' }] },
  ra_aimed:{ id:'ra_aimed', name:'Aimed Shot', type:'attack', cost:1, rarity:'starter', target:'enemy',
    text:'Deal 5 damage, +2 per Focus.', effects:[{ k:'damage', amount:{ base:5, scale:{ stat:'focus', per:2 } } }] },
  ra_volley:{ id:'ra_volley', name:'Volley', type:'attack', cost:1, rarity:'starter', target:'all',
    text:'Deal 4 damage to ALL, +1 per Focus.', effects:[{ k:'damage', amount:{ base:4, scale:{ stat:'focus', per:1 } } }] },
  ra_twin:{ id:'ra_twin', name:'Twin Shot', type:'attack', cost:1, rarity:'starter', target:'enemy',
    text:'Deal 3 damage 2 times.', effects:[{ k:'damage', amount:3, times:2 }] },
  ra_rapid:{ id:'ra_rapid', name:'Rapid Fire', type:'attack', cost:1, rarity:'uncommon', target:'enemy',
    text:'Deal 2 damage 3 times, +1 each per Focus.', effects:[{ k:'damage', amount:{ base:2, scale:{ stat:'focus', per:1 } }, times:3 }] },

  /* ---------------- Wizard — patient detonation (Spellpower) ---------------- */
  w_bolt:{ id:'w_bolt', name:'Arc Bolt', type:'attack', cost:1, rarity:'starter', target:'enemy', spell:true,
    text:'Deal 5 damage. (Scales with Spellpower.)', effects:[{ k:'damage', amount:5 }] },
  w_mana_shield:{ id:'w_mana_shield', name:'Mana Shield', type:'skill', cost:1, rarity:'starter', target:'self',
    text:'Gain 4 Block, +2 per Spellpower.', effects:[{ k:'block', amount:{ base:4, scale:{ stat:'spellpower', per:2 } } }] },
  w_frost:{ id:'w_frost', name:'Frost Lance', type:'attack', cost:1, rarity:'starter', target:'enemy', spell:true,
    text:'Deal 4 damage. Apply 1 Weak.', effects:[{ k:'damage', amount:4 }, { k:'status', status:'weak', amount:1, to:'target' }] },
  w_arcane_surge:{ id:'w_arcane_surge', name:'Arcane Surge', type:'power', cost:1, rarity:'starter', target:'self',
    text:'Gain 1 Spellpower. Draw 1.', effects:[{ k:'status', status:'spellpower', amount:1, to:'self' }, { k:'draw', amount:1 }] },
  w_kindle:{ id:'w_kindle', name:'Kindle', type:'skill', cost:0, rarity:'starter', target:'self',
    text:'Gain 1 Spellpower.', effects:[{ k:'status', status:'spellpower', amount:1, to:'self' }] },
  w_magic_missile:{ id:'w_magic_missile', name:'Magic Missiles', type:'attack', cost:1, rarity:'starter', target:'enemy', spell:true,
    text:'Deal 2 damage 3 times.', effects:[{ k:'damage', amount:2, times:3 }] },
  w_fireball:{ id:'w_fireball', name:'Fireball', type:'attack', cost:2, rarity:'starter', target:'all', spell:true,
    text:'Deal 9 damage to ALL enemies.', effects:[{ k:'damage', amount:9 }] },
  w_arcane_blast:{ id:'w_arcane_blast', name:'Arcane Blast', type:'attack', cost:2, rarity:'rare', target:'enemy', spell:true,
    text:'Deal 10 damage. (Scales with Spellpower.)', effects:[{ k:'damage', amount:10 }] },

  /* ---------------- Sorcerer — beautiful chaos (random) ---------------- */
  so_surgebolt:{ id:'so_surgebolt', name:'Surge Bolt', type:'attack', cost:1, rarity:'starter', target:'enemy', spell:true,
    text:'Deal 5 damage, then a random boon.',
    effects:[{ k:'damage', amount:5 }, { k:'random', options:[ { k:'draw', amount:1 }, { k:'status', status:'spellpower', amount:1, to:'self' }, { k:'energy', amount:1 }, { k:'damage', amount:3, target:'random' } ] }] },
  so_wild_ward:{ id:'so_wild_ward', name:'Wild Ward', type:'skill', cost:1, rarity:'starter', target:'self',
    text:'A random defense.',
    effects:[{ k:'random', options:[ { k:'block', amount:9 }, [{ k:'block', amount:5 }, { k:'status', status:'spellpower', amount:1, to:'self' }], [{ k:'block', amount:4 }, { k:'draw', amount:1 }] ] }] },
  so_chaos:{ id:'so_chaos', name:'Chaos Surge', type:'skill', cost:1, rarity:'starter', target:'self',
    text:'A random effect: Block, Spellpower, or a bolt.',
    effects:[{ k:'random', options:[ { k:'block', amount:7 }, { k:'status', status:'spellpower', amount:2, to:'self' }, { k:'damage', amount:6, target:'random' } ] }] },
  so_overload:{ id:'so_overload', name:'Overload', type:'attack', cost:1, rarity:'starter', target:'enemy', spell:true,
    text:'Deal 4 damage. 50%: deal 4 again.',
    effects:[{ k:'damage', amount:4 }, { k:'random', options:[ { k:'damage', amount:4 }, [] ] }] },
  so_mana_surge:{ id:'so_mana_surge', name:'Mana Surge', type:'power', cost:1, rarity:'starter', target:'self',
    text:'Gain 1 Spellpower. Draw 1.', effects:[{ k:'status', status:'spellpower', amount:1, to:'self' }, { k:'draw', amount:1 }] },
  so_meteor:{ id:'so_meteor', name:'Meteor', type:'attack', cost:2, rarity:'starter', target:'all', spell:true,
    text:'Deal 7 damage to ALL enemies.', effects:[{ k:'damage', amount:7 }] },
  so_pandemonium:{ id:'so_pandemonium', name:'Pandemonium', type:'skill', cost:1, rarity:'rare', target:'self',
    text:'A wild surge: big Block, Spellpower, a strike, or a deep draw.',
    effects:[{ k:'random', options:[ { k:'block', amount:12 }, { k:'status', status:'spellpower', amount:3, to:'self' }, { k:'damage', amount:10, target:'random' }, { k:'draw', amount:3 } ] }] },

  /* ---------------- Cleric — faith made manifest (Piety) ---------------- */
  cl_censure:{ id:'cl_censure', name:'Censure', type:'attack', cost:1, rarity:'starter', target:'enemy',
    text:'Deal 5 damage. Heal 2.', effects:[{ k:'damage', amount:5 }, { k:'heal', amount:2 }] },
  cl_aegis:{ id:'cl_aegis', name:'Aegis of Faith', type:'skill', cost:1, rarity:'starter', target:'self',
    text:'Gain 5 Block, +2 per Piety.', effects:[{ k:'block', amount:{ base:5, scale:{ stat:'piety', per:2 } } }] },
  cl_pray:{ id:'cl_pray', name:'Prayer', type:'skill', cost:0, rarity:'starter', target:'self',
    text:'Gain 1 Piety. Draw 1.', effects:[{ k:'status', status:'piety', amount:1, to:'self' }, { k:'draw', amount:1 }] },
  cl_smite:{ id:'cl_smite', name:'Smite', type:'attack', cost:1, rarity:'starter', target:'enemy',
    text:'Deal 6 damage, +2 per Piety.', effects:[{ k:'damage', amount:{ base:6, scale:{ stat:'piety', per:2 } } }] },
  cl_blessing:{ id:'cl_blessing', name:'Blessing', type:'skill', cost:1, rarity:'starter', target:'self',
    text:'Heal 4 +1 per Piety. Gain 1 Piety.', effects:[{ k:'heal', amount:{ base:4, scale:{ stat:'piety', per:1 } } }, { k:'status', status:'piety', amount:1, to:'self' }] },
  cl_consecration:{ id:'cl_consecration', name:'Consecration', type:'skill', cost:1, rarity:'starter', target:'self',
    text:'Gain 2 Regen and 1 Piety.', effects:[{ k:'status', status:'regen', amount:2, to:'self' }, { k:'status', status:'piety', amount:1, to:'self' }] },
  cl_wrath:{ id:'cl_wrath', name:'Wrath of the Faithful', type:'attack', cost:2, rarity:'rare', target:'all',
    text:'Deal 4 damage to ALL, +2 per Piety.', effects:[{ k:'damage', amount:{ base:4, scale:{ stat:'piety', per:2 } } }] },

  /* ---------------- Druid — two natures (Beast/Caster stance) ---------------- */
  d_maul:{ id:'d_maul', name:'Maul', type:'attack', cost:1, rarity:'starter', target:'enemy',
    text:'Deal 5 damage, +2 per Beast Form.', effects:[{ k:'damage', amount:{ base:5, scale:{ stat:'beast', per:2 } } }] },
  d_bark:{ id:'d_bark', name:'Barkskin', type:'skill', cost:1, rarity:'starter', target:'self',
    text:'Gain 6 Block and 1 Regen.', effects:[{ k:'block', amount:6 }, { k:'status', status:'regen', amount:1, to:'self' }] },
  d_beast:{ id:'d_beast', name:'Beast Form', type:'skill', cost:0, rarity:'starter', target:'self',
    text:'Gain 2 Beast Form. Lose all Caster Form.',
    effects:[{ k:'status', status:'beast', amount:2, to:'self' }, { k:'loseStatus', status:'caster', all:true }] },
  d_caster:{ id:'d_caster', name:'Caster Form', type:'skill', cost:0, rarity:'starter', target:'self',
    text:'Gain 2 Caster Form. Draw 1. Lose all Beast Form.',
    effects:[{ k:'status', status:'caster', amount:2, to:'self' }, { k:'draw', amount:1 }, { k:'loseStatus', status:'beast', all:true }] },
  d_starfire:{ id:'d_starfire', name:'Starfire', type:'attack', cost:1, rarity:'starter', target:'enemy', spell:true,
    text:'Deal 4 damage, +2 per Caster Form.', effects:[{ k:'damage', amount:{ base:4, scale:{ stat:'caster', per:2 } } }] },
  d_spores:{ id:'d_spores', name:'Spore Cloud', type:'skill', cost:1, rarity:'starter', target:'enemy',
    text:'Apply 4 Poison, +1 per Caster Form.', effects:[{ k:'status', status:'poison', amount:{ base:4, scale:{ stat:'caster', per:1 } }, to:'target' }] },
  d_rend:{ id:'d_rend', name:'Rending Claws', type:'attack', cost:1, rarity:'uncommon', target:'enemy',
    text:'Deal 3 damage 2 times, +1 each per Beast Form.', effects:[{ k:'damage', amount:{ base:3, scale:{ stat:'beast', per:1 } }, times:2 }] },

  /* ---------------- Paladin — every vow makes the next blow holier (Conviction) ---------------- */
  p_reckoning:{ id:'p_reckoning', name:'Reckoning', type:'attack', cost:1, rarity:'starter', target:'enemy',
    text:'Deal 5 damage +1 per Conviction. Gain 1 Conviction.',
    effects:[{ k:'damage', amount:{ base:5, scale:{ stat:'conviction', per:1 } } }, { k:'status', status:'conviction', amount:1, to:'self' }] },
  p_bulwark:{ id:'p_bulwark', name:'Bulwark of Vows', type:'skill', cost:1, rarity:'starter', target:'self',
    text:'Gain 4 Block, +2 per Conviction.', effects:[{ k:'block', amount:{ base:4, scale:{ stat:'conviction', per:2 } } }] },
  p_oath:{ id:'p_oath', name:'Oath', type:'skill', cost:0, rarity:'starter', target:'self',
    text:'Gain 1 Conviction. Draw 1.', effects:[{ k:'status', status:'conviction', amount:1, to:'self' }, { k:'draw', amount:1 }] },
  p_smite:{ id:'p_smite', name:'Divine Smite', type:'attack', cost:1, rarity:'starter', target:'enemy',
    text:'Deal 6 damage, +2 per Conviction.', effects:[{ k:'damage', amount:{ base:6, scale:{ stat:'conviction', per:2 } } }] },
  p_bless:{ id:'p_bless', name:'Bless', type:'skill', cost:1, rarity:'starter', target:'self',
    text:'Heal 3 +1 per Conviction. Gain 1 Conviction.',
    effects:[{ k:'heal', amount:{ base:3, scale:{ stat:'conviction', per:1 } } }, { k:'status', status:'conviction', amount:1, to:'self' }] },
  p_aura:{ id:'p_aura', name:'Aura of Courage', type:'power', cost:1, rarity:'starter', target:'self',
    text:'Gain 2 Conviction.', effects:[{ k:'status', status:'conviction', amount:2, to:'self' }] },
  p_judgment:{ id:'p_judgment', name:'Final Judgment', type:'attack', cost:2, rarity:'rare', target:'enemy',
    text:'Deal 8 damage +3 per Conviction, then spend all Conviction.',
    effects:[{ k:'damage', amount:{ base:8, scale:{ stat:'conviction', per:3 } } }, { k:'loseStatus', status:'conviction', all:true }] },

  /* ---------------- neutral reward pool ---------------- */
  n_iron_wave:{ id:'n_iron_wave', name:'Iron Wave', type:'attack', cost:1, rarity:'common', target:'enemy',
    text:'Deal 5 damage. Gain 5 Block.', effects:[{ k:'damage', amount:5 }, { k:'block', amount:5 }] },
  n_heavy_blow:{ id:'n_heavy_blow', name:'Heavy Blow', type:'attack', cost:2, rarity:'common', target:'enemy',
    text:'Deal 8 damage. Apply 2 Vulnerable.', effects:[{ k:'damage', amount:8 }, { k:'status', status:'vulnerable', amount:2, to:'target' }] },
  n_flurry:{ id:'n_flurry', name:'Flurry', type:'attack', cost:1, rarity:'common', target:'enemy',
    text:'Deal 3 damage 2 times.', effects:[{ k:'damage', amount:3, times:2 }] },
  n_bulwark:{ id:'n_bulwark', name:'Bulwark', type:'skill', cost:1, rarity:'common', target:'self',
    text:'Gain 8 Block.', effects:[{ k:'block', amount:8 }] },
  n_quick_step:{ id:'n_quick_step', name:'Quick Step', type:'skill', cost:0, rarity:'common', target:'self',
    text:'Gain 3 Block. Draw 1.', effects:[{ k:'block', amount:3 }, { k:'draw', amount:1 }] },
  n_rally:{ id:'n_rally', name:'Rally', type:'skill', cost:1, rarity:'common', target:'self',
    text:'Gain 5 Block. Draw 1.', effects:[{ k:'block', amount:5 }, { k:'draw', amount:1 }] },
  n_toxic_dart:{ id:'n_toxic_dart', name:'Toxic Dart', type:'attack', cost:1, rarity:'common', target:'enemy',
    text:'Deal 3 damage. Apply 3 Poison.', effects:[{ k:'damage', amount:3 }, { k:'status', status:'poison', amount:3, to:'target' }] },
  n_empower:{ id:'n_empower', name:'Empower', type:'power', cost:1, rarity:'common', target:'self',
    text:'Gain 1 Strength.', effects:[{ k:'status', status:'strength', amount:1, to:'self' }] },
  n_second_wind:{ id:'n_second_wind', name:'Second Wind', type:'skill', cost:1, rarity:'common', target:'self',
    text:'Heal 6. Gain 4 Block.', effects:[{ k:'heal', amount:6 }, { k:'block', amount:4 }] },
  n_adrenaline:{ id:'n_adrenaline', name:'Adrenaline', type:'skill', cost:0, rarity:'uncommon', target:'self', exhaust:true,
    text:'Gain 1 Energy. Draw 2. Exhaust.', effects:[{ k:'energy', amount:1 }, { k:'draw', amount:2 }] },
  n_intimidate:{ id:'n_intimidate', name:'Intimidate', type:'skill', cost:1, rarity:'uncommon', target:'all',
    text:'Apply 2 Weak to ALL enemies.', effects:[{ k:'status', status:'weak', amount:2, to:'target' }] },
  n_whirlwind:{ id:'n_whirlwind', name:'Whirlwind', type:'attack', cost:2, rarity:'uncommon', target:'all',
    text:'Deal 5 damage to ALL enemies.', effects:[{ k:'damage', amount:5 }] },

  /* ---------------- race signature cards ---------------- */
  sig_second_wind:{ id:'sig_second_wind', name:'Second Wind', type:'skill', cost:0, rarity:'signature', target:'self', exhaust:true,
    text:'Gain 1 Energy. Draw 1. Exhaust.', effects:[{ k:'energy', amount:1 }, { k:'draw', amount:1 }] },
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
    text:'Deal 6 damage to ALL enemies. Exhaust.', effects:[{ k:'damage', amount:6 }] },
  sig_infernal_pact:{ id:'sig_infernal_pact', name:'Infernal Pact', type:'attack', cost:1, rarity:'signature', target:'enemy',
    text:'Deal 5 damage. Apply 5 Poison.', effects:[{ k:'damage', amount:5 }, { k:'status', status:'poison', amount:5, to:'target' }] },
  sig_stone_endurance:{ id:'sig_stone_endurance', name:'Stone Endurance', type:'skill', cost:1, rarity:'signature', target:'self',
    text:'Gain 10 Block and 1 Dexterity.', effects:[{ k:'block', amount:10 }, { k:'status', status:'dexterity', amount:1, to:'self' }] },
};

export const STARTER_DECKS = {
  fighter:  ['f_guard','f_guard','f_riposte','f_riposte','f_shield_bash','f_shield_bash','f_brace','f_counter','f_barricade','f_hone'],
  barbarian:['b_hew','b_hew','b_reckless','b_reckless','b_rage','b_rage','b_bloodied_hide','b_cleave','b_bash','b_bloodlust'],
  rogue:    ['r_quick','r_quick','r_quick','r_smoke','r_smoke','r_shiv','r_shiv','r_envenom','r_backstab','r_prepare'],
  ranger:   ['ra_mark','ra_mark','ra_mark','ra_roll','ra_roll','ra_take_aim','ra_companion','ra_aimed','ra_volley','ra_twin'],
  wizard:   ['w_bolt','w_bolt','w_bolt','w_mana_shield','w_mana_shield','w_frost','w_arcane_surge','w_kindle','w_magic_missile','w_fireball'],
  sorcerer: ['so_surgebolt','so_surgebolt','so_surgebolt','so_wild_ward','so_wild_ward','so_chaos','so_chaos','so_overload','so_mana_surge','so_meteor'],
  cleric:   ['cl_censure','cl_censure','cl_censure','cl_aegis','cl_aegis','cl_pray','cl_pray','cl_smite','cl_blessing','cl_consecration'],
  druid:    ['d_maul','d_maul','d_bark','d_bark','d_beast','d_beast','d_caster','d_caster','d_starfire','d_spores'],
  paladin:  ['p_reckoning','p_reckoning','p_reckoning','p_bulwark','p_bulwark','p_oath','p_oath','p_smite','p_bless','p_aura'],
};

export const REWARD_POOL = ['n_iron_wave','n_heavy_blow','n_flurry','n_bulwark','n_quick_step',
  'n_rally','n_toxic_dart','n_empower','n_second_wind','n_adrenaline','n_intimidate','n_whirlwind'];

// Per-class reward cards so rewards reinforce identity (offered alongside neutrals).
export const CLASS_REWARDS = {
  fighter:  ['f_perfect_block','f_counter','f_hone'],
  barbarian:['b_frenzy','b_bloodlust','b_bash'],
  rogue:    ['r_eviscerate','r_envenom','r_shiv'],
  ranger:   ['ra_rapid','ra_aimed','ra_twin'],
  wizard:   ['w_arcane_blast','w_magic_missile','w_kindle'],
  sorcerer: ['so_pandemonium','so_overload','so_chaos'],
  cleric:   ['cl_wrath','cl_blessing','cl_smite'],
  druid:    ['d_rend','d_spores','d_starfire'],
  paladin:  ['p_judgment','p_smite','p_bless'],
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

export const RACE_SIGNATURE = {
  human:'sig_second_wind', elf:'sig_elven_grace', dwarf:'sig_dwarven_fortitude',
  halfling:'sig_lucky_strike', gnome:'sig_arcane_insight', halforc:'sig_savage_blow',
  dragonborn:'sig_breath', tiefling:'sig_infernal_pact', goliath:'sig_stone_endurance',
};

let _uid = 0;
export function instantiate(id) {
  const def = CARDS[id];
  if (!def) throw new Error('Unknown card: ' + id);
  return { uid: 'c' + (++_uid), ...def };
}
