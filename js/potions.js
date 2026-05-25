// Potions — single-use, popped mid-fight. Self/all targeting only (no target step).

export const POTIONS = {
  swift_potion:    { id:'swift_potion', name:'Swift Potion', icon:'⚡', rarity:'common',
    desc:'Gain 2 Energy.', use:(c)=>{ c.player.energy += 2; } },
  heal_draught:    { id:'heal_draught', name:'Healing Draught', icon:'❤️', rarity:'common',
    desc:'Heal 12 HP.', use:(c)=>c.heal(c.player,12) },
  iron_potion:     { id:'iron_potion', name:'Iron Potion', icon:'🛡️', rarity:'common',
    desc:'Gain 12 Block.', use:(c)=>c.gainBlock(c.player,12) },
  fire_flask:      { id:'fire_flask', name:'Fire Flask', icon:'🔥', rarity:'uncommon',
    desc:'Deal 10 damage to ALL enemies.', use:(c)=>c.livingEnemies().forEach(e=>c.attack(c.player,e,10,{spell:true})) },
  weakening_brew:  { id:'weakening_brew', name:'Weakening Brew', icon:'💧', rarity:'uncommon',
    desc:'Apply 2 Weak to ALL enemies.', use:(c)=>c.livingEnemies().forEach(e=>c.applyStatus(e,'weak',2)) },
  draught_of_might:{ id:'draught_of_might', name:'Draught of Might', icon:'💪', rarity:'uncommon',
    desc:'Gain 2 Strength.', use:(c)=>c.applyStatus(c.player,'strength',2) },
  arcane_tonic:    { id:'arcane_tonic', name:'Arcane Tonic', icon:'✨', rarity:'uncommon',
    desc:'Gain 2 Spellpower and draw 2.', use:(c)=>{ c.applyStatus(c.player,'spellpower',2); c.draw(2); } },
  insight_vial:    { id:'insight_vial', name:'Vial of Insight', icon:'📜', rarity:'common',
    desc:'Draw 3 cards.', use:(c)=>c.draw(3) },
};

export const POTION_LIST = Object.values(POTIONS);
export function potion(id){ return POTIONS[id]; }
