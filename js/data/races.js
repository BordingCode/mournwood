// The 9 races. Each = a small passive + a signature card + flavour.
// Passives are kept to small swings (≤ ~5%) so they flavour a run without breaking balance.
// Signature card definitions are wired up in Phase 3; here we describe them.

export const RACES = [
  { id:'human',     name:'Human',      emoji:'🧑', trad:true,
    passive:'+5 max HP', sig:'Second Wind',
    blurb:'Versatile and stubborn. A little tougher, a little luckier.' },
  { id:'elf',       name:'Elf',        emoji:'🧝', trad:true,
    passive:'+1 Focus each turn (max 5)', sig:'Elven Grace',
    blurb:'Poised and precise; small advantages compound.' },
  { id:'dwarf',     name:'Dwarf',      emoji:'🧔', trad:true,
    passive:'+2 Block from all sources', sig:'Dwarven Fortitude',
    blurb:'Stone-stubborn. Every guard holds a little firmer.' },
  { id:'halfling',  name:'Halfling',   emoji:'🍀', trad:true,
    passive:'Lucky: small chance to draw on a hit', sig:'Lucky Strike',
    blurb:'Fortune favours the small and the bold.' },
  { id:'gnome',     name:'Gnome',      emoji:'🔧', trad:true,
    passive:'+1 relic slot', sig:'Arcane Insight',
    blurb:'Tinker and theorist; carries one more trinket than most.' },
  { id:'halforc',   name:'Half-Orc',   emoji:'💢', trad:false,
    passive:'+1 Strength every 3 turns', sig:'Savage Blow',
    blurb:'Slow to start, terrifying once the blood is up.' },
  { id:'dragonborn',name:'Dragonborn', emoji:'🐲', trad:false,
    passive:'Start combat with a Breath charge', sig:'Elemental Breath',
    blurb:'Draconic blood; exhale ruin once per fight.' },
  { id:'tiefling',  name:'Tiefling',   emoji:'😈', trad:false,
    passive:'Attacks apply +1 Poison while you have a relic', sig:'Infernal Pact',
    blurb:'Cursed lineage turned to venomous advantage.' },
  { id:'goliath',   name:'Goliath',    emoji:'🗿', trad:false,
    passive:'Once per combat, cap a big hit (Stoneskin)', sig:'Stone Endurance',
    blurb:'Mountain-born; shrugs off the heaviest blow each fight.' }
];

export const RACE_BY_ID = Object.fromEntries(RACES.map((r) => [r.id, r]));
