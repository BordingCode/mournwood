// Status effects (buffs/debuffs). Pure data + tiny helpers — no DOM.
// Stored on an entity as a map { statusId: amount }.

export const STATUSES = {
  strength:   { name:'Strength',   icon:'💪', color:'#EF4444', kind:'buff',
                desc:'Attacks deal +X damage.' },
  spellpower: { name:'Spellpower', icon:'✨', color:'#A855F7', kind:'buff',
                desc:'Spells deal +X damage.' },
  dexterity:  { name:'Dexterity',  icon:'🪶', color:'#60A5FA', kind:'buff',
                desc:'Gain +X Block from cards.' },
  regen:      { name:'Regen',      icon:'🌿', color:'#10B981', kind:'buff', decays:true,
                desc:'Heal X at the start of your turn, then X drops by 1.' },
  vulnerable: { name:'Vulnerable', icon:'🎯', color:'#FBBF24', kind:'debuff', decays:true,
                desc:'Takes 50% more attack damage. -1 per turn.' },
  weak:       { name:'Weak',       icon:'💧', color:'#3B82F6', kind:'debuff', decays:true,
                desc:'Deals 25% less attack damage. -1 per turn.' },
  frail:      { name:'Frail',      icon:'🥀', color:'#c084fc', kind:'debuff', decays:true,
                desc:'Gains 25% less Block. -1 per turn.' },
  poison:     { name:'Poison',     icon:'☠️', color:'#84cc5a', kind:'debuff', poison:true,
                desc:'Lose X HP at the start of your turn, then X drops by 1.' },
};

export const amt = (e, id) => (e.statuses && e.statuses[id]) || 0;
export const has = (e, id) => amt(e, id) > 0;

export function addStatus(e, id, n) {
  if (!e.statuses) e.statuses = {};
  e.statuses[id] = (e.statuses[id] || 0) + n;
  if (e.statuses[id] <= 0) delete e.statuses[id];
}

// "decays" debuffs lose 1 stack at the end of the owner's turn.
export function decayTurnEnd(e) {
  if (!e.statuses) return;
  for (const id of Object.keys(e.statuses)) {
    if (STATUSES[id]?.decays) addStatus(e, id, -1);
  }
}
