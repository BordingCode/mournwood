// Card definitions. Pure data — effects are op-lists interpreted by combat.js.
// Phase 2 ships the Wizard starter deck + universal basics; Phase 3 fills the rest.
//
// Card: { id, name, type, cost, rarity, target, spell?, exhaust?, text, flavor, effects[] }
// Ops:  {k:'damage',amount} {k:'block',amount} {k:'heal',amount} {k:'draw',amount}
//       {k:'energy',amount}  {k:'status',status,amount,to:'self'|'target'}

export const CARDS = {
  // ---- universal basics ----
  strike: { id:'strike', name:'Strike', type:'attack', cost:1, rarity:'starter', target:'enemy',
    text:'Deal 6 damage.', flavor:'Simple. Honest. Final.',
    effects:[{ k:'damage', amount:6 }] },
  defend: { id:'defend', name:'Defend', type:'skill', cost:1, rarity:'starter', target:'self',
    text:'Gain 5 Block.', flavor:'Brace.',
    effects:[{ k:'block', amount:5 }] },

  // ---- Wizard starter ----
  bolt: { id:'bolt', name:'Arcane Bolt', type:'attack', cost:1, rarity:'starter', target:'enemy', spell:true,
    text:'Deal 5 damage. (Scales with Spellpower.)', flavor:'A whispered word, a spark.',
    effects:[{ k:'damage', amount:5 }] },
  ward: { id:'ward', name:'Ward', type:'skill', cost:1, rarity:'starter', target:'self',
    text:'Gain 5 Block.', flavor:'A shimmer between you and harm.',
    effects:[{ k:'block', amount:5 }] },
  frost: { id:'frost', name:'Frost Lance', type:'attack', cost:1, rarity:'starter', target:'enemy', spell:true,
    text:'Deal 4 damage. Apply 1 Weak.', flavor:'Cold enough to slow a heart.',
    effects:[{ k:'damage', amount:4 }, { k:'status', status:'weak', amount:1, to:'target' }] },
  arcane_surge: { id:'arcane_surge', name:'Arcane Surge', type:'power', cost:1, rarity:'starter', target:'self',
    text:'Gain 1 Spellpower. Draw 1.', flavor:'The well deepens.',
    effects:[{ k:'status', status:'spellpower', amount:1, to:'self' }, { k:'draw', amount:1 }] },
  fireball: { id:'fireball', name:'Fireball', type:'attack', cost:2, rarity:'starter', target:'all', spell:true,
    text:'Deal 9 damage to ALL enemies.', flavor:'Say the word and step back.',
    effects:[{ k:'damage', amount:9 }] },

  // ---- a curse (unplayable filler), used by events/allies later ----
  ashen_doubt: { id:'ashen_doubt', name:'Ashen Doubt', type:'curse', cost:1, rarity:'curse', target:'none',
    unplayable:true, text:'Unplayable. A whisper you cannot silence.', flavor:'…are you sure?',
    effects:[] },
};

// Starter deck = list of card ids (duplicates allowed). Only Wizard for Phase 2.
export const STARTER_DECKS = {
  wizard: ['bolt','bolt','bolt','bolt','ward','ward','ward','frost','arcane_surge','fireball'],
};

// Fallback starter for classes not yet authored (Phase 3 replaces these).
export function starterFor(classId) {
  return STARTER_DECKS[classId] || ['strike','strike','strike','strike','defend','defend','defend','defend','strike','defend'];
}

let _uid = 0;
/** Make a fresh, mutable card instance from a definition id. */
export function instantiate(id) {
  const def = CARDS[id];
  if (!def) throw new Error('Unknown card: ' + id);
  return { uid: 'c' + (++_uid), ...def };
}
