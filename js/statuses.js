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
  // class scaling stats (used by op-level `scale`) + engine-handled markers
  rage:       { name:'Rage',       icon:'🔥', color:'#e0653b', kind:'buff',
                desc:'Rage cards deal +X damage.' },
  focus:      { name:'Focus',      icon:'🎯', color:'#7fc6a0', kind:'buff',
                desc:'Empowers Focus cards and your companion.' },
  conviction: { name:'Conviction', icon:'⚜️', color:'#ffe08a', kind:'buff',
                desc:'Smites & oaths scale with Conviction.' },
  piety:      { name:'Piety',      icon:'🙏', color:'#ffd97a', kind:'buff',
                desc:'Holy cards scale with Piety.' },
  companion:  { name:'Companion',  icon:'🐾', color:'#7fc6a0', kind:'buff',
                desc:'A beast strikes a foe at the end of your turn.' },
  retain:     { name:'Barricade',  icon:'🧱', color:'#9ec5ff', kind:'buff',
                desc:'Block is no longer lost at the start of your turn.' },
  beast:      { name:'Beast Form', icon:'🐺', color:'#86d05a', kind:'buff',
                desc:'In Beast form: melee cards hit harder.' },
  caster:     { name:'Caster Form',icon:'🌙', color:'#c084fc', kind:'buff',
                desc:'In Caster form: spells & nature magic empower.' },
  breath:     { name:'Breath',     icon:'🐲', color:'#ff8a5c', kind:'buff',
                desc:'A draconic breath attack is ready.' },
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
