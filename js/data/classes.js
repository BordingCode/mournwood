// The 9 classes. Each = a starter deck + a scaling identity.
// Starter decks are filled out in Phase 3 (data/cards.js); here we define identity,
// base HP, and the signature mechanic so the select screen + combat can reference them.
// All names are SRD-safe / generic.

export const CLASSES = [
  { id:'fighter',   name:'Fighter',   emoji:'🛡️', hp:80, accent:'#c9a66b',
    tagline:'Block carry-over · armour',
    blurb:'Disciplined defence that turns guarded blows into openings.',
    mechanic:'Stance: keep some Block between turns; punish with counters.' },
  { id:'barbarian', name:'Barbarian', emoji:'🪓', hp:82, accent:'#e0653b',
    tagline:'Rage · risk & reward',
    blurb:'Trade your own blood for overwhelming, escalating fury.',
    mechanic:'Rage: damage scales as you take and deal hits.' },
  { id:'rogue',     name:'Rogue',     emoji:'🗡️', hp:72, accent:'#8ad17f',
    tagline:'Combo · shivs · poison',
    blurb:'A flurry of cheap blades and creeping venom.',
    mechanic:'Combo: extra cards played this turn power up finishers.' },
  { id:'ranger',    name:'Ranger',    emoji:'🏹', hp:74, accent:'#7fc6a0',
    tagline:'Focus · companion · volley',
    blurb:'Mark your prey and let beast and arrow do the rest.',
    mechanic:'Focus + a summoned companion that attacks each turn.' },
  { id:'wizard',    name:'Wizard',    emoji:'📖', hp:68, accent:'#6aa6ff',
    tagline:'Spellpower · big payoffs',
    blurb:'Patient arcane setup that detonates in a single turn.',
    mechanic:'Spellpower scales your spells the longer you build.' },
  { id:'sorcerer',  name:'Sorcerer',  emoji:'🔮', hp:68, accent:'#c06aff',
    tagline:'Chaos · chain reactions',
    blurb:'Wild magic that triggers itself — high risk, high spectacle.',
    mechanic:'Chaos: cards randomly chain into one another.' },
  { id:'cleric',    name:'Cleric',    emoji:'✨', hp:80, accent:'#ffd97a',
    tagline:'Piety · heal /block /smite',
    blurb:'Faith woven into shield, mend, and righteous strike.',
    mechanic:'Piety converts healing into block and bonus smite damage.' },
  { id:'druid',     name:'Druid',     emoji:'🌿', hp:75, accent:'#86d05a',
    tagline:'Shapeshift · nature DoT',
    blurb:'Flow between Beast and Caster forms; let spores do the work.',
    mechanic:'Shift stances (Beast/Caster); stack Poison & regrowth.' },
  { id:'paladin',   name:'Paladin',   emoji:'⚜️', hp:80, accent:'#ffe08a',
    tagline:'Conviction · oaths · smite',
    blurb:'Each vow kept makes the next blow holier.',
    mechanic:'Conviction stacks scale smites, auras, and blessings.' }
];

export const CLASS_BY_ID = Object.fromEntries(CLASSES.map((c) => [c.id, c]));
