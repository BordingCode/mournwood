// Cohesive hand-authored SVG icon set — replaces ALL emoji. currentColor-driven so
// CSS controls colour. iconEl(name) → a <span class="ico"> node; iconSvg(name) → string.
import { el } from './ui.js';

const EYE = '#0A0E27';
export const ICONS = {
  dot: '<circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/>',

  /* ---- UI / core ---- */
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  lock: '<rect x="5" y="10.5" width="14" height="9.5" rx="2"/><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  coin: '<circle cx="12" cy="12" r="8"/><path d="M12 8.2l1.3 2.6 2.9.4-2.1 2 .5 2.9L12 16.7l-2.6 1.4.5-2.9-2.1-2 2.9-.4z" fill="currentColor" stroke="none"/>',
  heart: '<path d="M12 20S4 15 4 9.5A3.5 3.5 0 0 1 12 7a3.5 3.5 0 0 1 8 2.5C20 15 12 20 12 20z" fill="currentColor" stroke="none"/>',
  bolt: '<path d="M13 2L4 14h6l-1 8 9-12h-6z" fill="currentColor" stroke="none"/>',

  /* ---- intents ---- */
  sword: '<path d="M12 2.5v11M9 13.5h6M12 13.5v6M10.4 19.5h3.2"/>',
  shield: '<path d="M12 3l7 3v5c0 4.6-3 7.6-7 9-4-1.4-7-4.4-7-9V6z"/>',
  chevup: '<path d="M6 14l6-6 6 6"/>',
  chevdown: '<path d="M6 10l6 6 6-6"/>',

  /* ---- statuses ---- */
  strength: '<path d="M4 9v6M7 9v6M17 9v6M20 9v6"/><path d="M4 12h16" stroke-width="2.6"/>',
  spellpower: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" fill="currentColor" stroke="none"/><path d="M18.5 3.5l.6 1.7 1.7.6-1.7.6-.6 1.7-.6-1.7-1.7-.6 1.7-.6z" fill="currentColor" stroke="none"/>',
  dexterity: '<path d="M20 4c-6 0-12 5-13 12 4 .4 9-1.6 11-6"/><path d="M7 16l-3 4"/><path d="M9.5 13c2-1 3.6-2.8 4.8-5"/>',
  regen: '<path d="M5 19C5 10.7 10.7 5 19 5c0 8.3-5.7 14-14 14z" fill="currentColor" stroke="none"/><path d="M9 15c2.4-2.6 4.6-5 7-7" stroke="#0A0E27"/>',
  vulnerable: '<path d="M12 3l7 3v5c0 4.6-3 7.6-7 9-4-1.4-7-4.4-7-9V6z"/><path d="M12 6l-2 5 3.2 1-2.2 5" stroke-width="1.3"/>',
  weak: '<path d="M12 3v10M8 11l4 4 4-4"/><path d="M7 19h10" stroke-dasharray="2.5 2.5"/>',
  frail: '<path d="M8 3l2.5 6-3.5 1.8L11 21"/><path d="M15 3l-2 6 3.6 1.4L13 21"/>',
  poison: '<path d="M12 3.5c3 4 5 6 5 9a5 5 0 0 1-10 0c0-3 2-5 5-9z"/><circle cx="10.3" cy="13" r="1" fill="currentColor"/><circle cx="13.7" cy="13" r="1" fill="currentColor"/>',
  rage: '<path d="M12 3c3 4 5 6 5 9a5 5 0 0 1-10 0c0-2 .9-3.4 2.1-4.6C9.5 9.9 10.4 10.3 11 10c.2-2.1-.7-4 1-7z" fill="currentColor" stroke="none"/>',
  momentum: '<path d="M12 5a7 7 0 1 1-6.5 4"/><path d="M5 5v4h4"/>',
  focus: '<circle cx="12" cy="12" r="7.5"/><circle cx="12" cy="12" r="2.6"/><path d="M12 1.5v3.5M12 19v3.5M1.5 12h3.5M19 12h3.5"/>',
  conviction: '<circle cx="12" cy="12" r="3.6"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5 5l2.1 2.1M16.9 16.9L19 19M19 5l-2.1 2.1M5 19l2.1-2.1"/>',
  piety: '<path d="M8 4h8M12 4v6M7 10h10c0 4-2.2 6-5 6s-5-2-5-6zM12 16v3M9 21h6"/>',
  companion: '<circle cx="8" cy="9" r="1.6" fill="currentColor" stroke="none"/><circle cx="16" cy="9" r="1.6" fill="currentColor" stroke="none"/><circle cx="5.5" cy="13" r="1.3" fill="currentColor" stroke="none"/><circle cx="18.5" cy="13" r="1.3" fill="currentColor" stroke="none"/><path d="M12 12.5c2.6 0 4.5 2.2 4.5 4.5 0 1.8-2 1.8-4.5 1.8s-4.5 0-4.5-1.8c0-2.3 1.9-4.5 4.5-4.5z" fill="currentColor" stroke="none"/>',
  retain: '<path d="M3 7h18M3 12h18M3 17h18M8 7v5M16 7v5M5.5 12v5M12 12v5M18.5 12v5"/>',
  beast: '<path d="M5 5l3.2 4M19 5l-3.2 4M5 5c0 6 3.2 9.2 7 11 3.8-1.8 7-5 7-11l-3 3.2-4-1.8-4 1.8z" fill="currentColor" stroke="none"/><circle cx="10" cy="11" r=".9" fill="' + EYE + '"/><circle cx="14" cy="11" r=".9" fill="' + EYE + '"/>',
  caster: '<path d="M16.5 4a8 8 0 1 0 0 16 7 7 0 0 1 0-16z" fill="currentColor" stroke="none"/><path d="M6 5l.7 1.9 1.9.7-1.9.7L6 11l-.7-1.7-1.9-.7 1.9-.7z" fill="currentColor" stroke="none"/>',
  breath: '<path d="M4 12h6M10 12l3-3M10 12l3 3"/><path d="M14 7c4 0 6 2.2 6 5s-2 5-6 5z" fill="currentColor" stroke="none"/>',

  /* ---- classes ---- */
  fighter: '<path d="M5 11a7 7 0 0 1 14 0v3H5z"/><path d="M5 14h14v3a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3z"/><path d="M12 4.5v9.5"/>',
  barbarian: '<path d="M13.5 3l4.5 4.5-7 7-2.5-2.5z" fill="currentColor" stroke="none"/><path d="M11 11.5L4 20"/><path d="M13.5 3c3.2 0 5.2 2 4.5 5"/>',
  rogue: '<path d="M12 2l2.2 4.2-2.2 1.2-2.2-1.2z" fill="currentColor" stroke="none"/><path d="M12 7.4v8.6M9 16h6M12 16v4"/>',
  ranger: '<path d="M6 3c6 3 6 15 0 18"/><path d="M6 3v18"/><path d="M5 12h14"/><path d="M19 12l-3.5-2.2M19 12l-3.5 2.2"/>',
  wizard: '<path d="M12 3l5.5 12.5h-11z" fill="currentColor" stroke="none"/><path d="M4.5 15.5h15v2.2h-15z"/><circle cx="10" cy="10" r=".7" fill="' + EYE + '"/><circle cx="13.5" cy="12" r=".7" fill="' + EYE + '"/>',
  sorcerer: '<circle cx="12" cy="10.5" r="6"/><path d="M9 8.5a3.2 3.2 0 0 1 3-2"/><path d="M7 18.5h10l-2 2.5H9z"/>',
  cleric: '<circle cx="12" cy="9" r="3"/><path d="M12 2.5v19M5.5 9h13"/>',
  druid: '<path d="M5 19C5 10.7 10.7 5 19 5c0 8.3-5.7 14-14 14z" fill="currentColor" stroke="none"/><path d="M9.5 14.5c2.4-2.4 4.4-4.6 6.5-7.5" stroke="' + EYE + '"/>',
  paladin: '<path d="M12 3l7 3v5c0 4.6-3 7.6-7 9-4-1.4-7-4.4-7-9V6z"/><path d="M12 7v7M9 10h6"/>',

  /* ---- races ---- */
  human: '<circle cx="12" cy="8" r="3.2"/><path d="M5 20c0-4 3-7 7-7s7 3 7 7"/>',
  elf: '<circle cx="12" cy="8.5" r="3.2"/><path d="M5 20c0-4 3-7 7-7s7 3 7 7"/><path d="M9.2 6.4L7 4M14.8 6.4L17 4"/>',
  dwarf: '<circle cx="12" cy="7" r="3"/><path d="M8 10c0 5.5 2 9 4 9s4-3.5 4-9" fill="currentColor" stroke="none"/><path d="M9 8.5h6"/>',
  halfling: '<path d="M12 12c-2.2-3-6.2-2-6.2 1 0 2 2 3.2 6.2 1zM12 12c2.2-3 6.2-2 6.2 1 0 2-2 3.2-6.2 1zM12 12c-3 2.2-2 6.2 1 6.2 2 0 3.2-2 1-6.2z" fill="currentColor" stroke="none"/><path d="M12 13v7"/>',
  gnome: '<circle cx="12" cy="12" r="3.8"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M5.6 18.4l2.1-2.1"/>',
  halforc: '<circle cx="12" cy="9" r="4"/><path d="M8.6 12c0 3 1.4 5 3.4 5s3.4-2 3.4-5"/><path d="M9.5 13l-1.2 4M14.5 13l1.2 4"/>',
  dragonborn: '<path d="M4 14c0-5 4-8.5 9-8.5 3 0 7 2 7 5l-3-1 1 3-3-1v3l-3-2-2 3-2-3z" fill="currentColor" stroke="none"/><circle cx="8.5" cy="11.5" r=".8" fill="' + EYE + '"/>',
  tiefling: '<circle cx="12" cy="11.5" r="3.6"/><path d="M8.4 8.5C6.4 6.5 6.4 4.5 7.4 3.5c.8 2 1.8 2 1.8 4M15.6 8.5c2-2 2-4 1-5-.8 2-1.8 2-1.8 4"/>',
  goliath: '<path d="M3 19l5.5-9 3 4 3-6 6.5 11z" fill="currentColor" stroke="none"/>',

  /* ---- enemies ---- */
  goblin: '<path d="M5 7l3.2 3M19 7l-3.2 3M6 9.5c0 5 3 8 6 8s6-3 6-8l-3 2-3-2-3 2z" fill="currentColor" stroke="none"/><circle cx="10" cy="11.5" r=".9" fill="' + EYE + '"/><circle cx="14" cy="11.5" r=".9" fill="' + EYE + '"/><path d="M10 15l2 1 2-1" stroke="' + EYE + '"/>',
  skeleton: '<path d="M12 3a7 7 0 0 0-5 11.5V17h2v-2l1.5 1.5L12 15l1.5 1.5L15 15v2h2v-2.5A7 7 0 0 0 12 3z" fill="currentColor" stroke="none"/><circle cx="9.6" cy="11" r="1.5" fill="' + EYE + '"/><circle cx="14.4" cy="11" r="1.5" fill="' + EYE + '"/>',
  bandit: '<circle cx="12" cy="11.5" r="6"/><path d="M6 10.5h12" stroke-width="3.2"/><circle cx="9.5" cy="10.4" r=".7" fill="' + EYE + '"/><circle cx="14.5" cy="10.4" r=".7" fill="' + EYE + '"/>',
  orc: '<path d="M6 8.5c0 6 3 9 6 9s6-3 6-9" fill="currentColor" stroke="none"/><path d="M6 8.5h12" stroke-width="1.6"/><path d="M9 14.5l-1.2 3.2M15 14.5l1.2 3.2"/><circle cx="9.6" cy="11.5" r=".8" fill="' + EYE + '"/><circle cx="14.4" cy="11.5" r=".8" fill="' + EYE + '"/>',
  cultist: '<path d="M12 3c-4 0-6 4-6 9l-2 7h16l-2-7c0-5-2-9-6-9z" fill="currentColor" stroke="none"/><path d="M9.5 12.5l2.5 1.6 2.5-1.6" stroke="' + EYE + '"/>',
  boss: '<path d="M7 5l2 2 3-3 3 3 2-2v3.2H7z" fill="currentColor" stroke="none"/><path d="M12 8.5a6 6 0 0 0-4.2 10.3V21h8.4v-2.2A6 6 0 0 0 12 8.5z" fill="currentColor" stroke="none"/><circle cx="9.8" cy="15" r="1.3" fill="' + EYE + '"/><circle cx="14.2" cy="15" r="1.3" fill="' + EYE + '"/>',

  /* ---- map nodes ---- */
  hub: '<path d="M4 11l8-6 8 6"/><path d="M6 10v9h12v-9"/><path d="M10 19v-5h4v5"/>',
  combat: '<path d="M4 4l9 9M20 4l-9 9"/><path d="M4 4v3h3M20 4v3h-3"/><path d="M9.5 13.5l-4.5 4.5 1 1 4.5-4.5M14.5 13.5l4.5 4.5-1 1-4.5-4.5"/>',
  shop: '<path d="M5 7h14l-1 12H6z"/><path d="M9 7a3 3 0 0 1 6 0"/>',
  rest: '<path d="M12 7.5c2 2 3 3.2 3 5.2a3 3 0 0 1-6 0c0-1.2.6-2.2 1.6-3.2.3 1 .8 1.3 1 1 .3-1.4-.6-2 .4-3z" fill="currentColor" stroke="none"/><path d="M5 20h14M7.5 20l4.5-2.8L16.5 20"/>',
  event: '<circle cx="12" cy="12" r="8.2"/><path d="M9.6 9.6a2.6 2.6 0 0 1 4.6 1.6c0 1.6-2 2-2 3.4"/><circle cx="12" cy="16.6" r="1" fill="currentColor" stroke="none"/>',
  ward: '<path d="M12 3l8 5v8l-8 5-8-5V8z"/><path d="M8.8 12a3.2 3.2 0 0 1 6.4 0 3.2 3.2 0 0 1-6.4 0z"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/>',

  /* ---- generic relic / potion ---- */
  gem: '<path d="M7 4h10l4 5-9 11L3 9z"/><path d="M3 9h18M9 4l-2.2 5L12 20l5.2-11L15 4"/>',
  flask: '<path d="M10 3h4M11 3v5l-4 8.2A3 3 0 0 0 9.7 21h4.6a3 3 0 0 0 2.7-4.8L13 8V3"/><path d="M8.6 15.2h6.8"/>',
  cards: '<rect x="3.5" y="6" width="10" height="14" rx="1.6" transform="rotate(-9 8.5 13)"/><rect x="10" y="4" width="10" height="14" rx="1.6" transform="rotate(7 15 11)"/>',
  scroll: '<path d="M7 4h9a2 2 0 0 1 2 2v10a3 3 0 0 1-3 3H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><path d="M5 6a2 2 0 0 0 2 2h1"/><path d="M9 9h6M9 12h6M9 15h4"/>',
  chest: '<rect x="4" y="9" width="16" height="10.5" rx="1.5"/><path d="M4 13h16M4 9.5C4 7 6.5 6 12 6s8 1 8 3.5"/><rect x="10.4" y="11.6" width="3.2" height="3.2" rx=".6" fill="currentColor" stroke="none"/>',
  npc: '<circle cx="11" cy="7.5" r="3"/><path d="M5 20c0-3.4 2.7-6 6-6s6 2.6 6 6"/><path d="M18 4l.6 1.6L20 6.2l-1.4.6L18 8.4l-.6-1.6L16 6.2l1.4-.6z" fill="currentColor" stroke="none"/>',

  /* ---- map scenery (decorative, non-colliding) ---- */
  tree: '<path d="M12 3c-3.4 0-6 2.6-6 5.6 0 2.1 1.3 3.5 3 4.3-2 .4-3.5 1.4-3.5 2.8 0 1.6 2.9 2.1 6.5 2.1s6.5-.5 6.5-2.1c0-1.4-1.5-2.4-3.5-2.8 1.7-.8 3-2.2 3-4.3C18 5.6 15.4 3 12 3z" fill="currentColor" stroke="none"/><path d="M12 16v6"/>',
  pine: '<path d="M12 3l4 6h-2.6l3 4.6h-2.8L17 19H7l3.4-5.4H7.6L10.6 9H8z" fill="currentColor" stroke="none"/><path d="M12 19v3"/>',
  rock: '<path d="M4.5 18.5c0-3 2-6 5-6 2 0 3 1 4 2.6 1-.6 2.5-.2 3.5 1 .8 1 .5 2.4-1 2.4H6c-1 0-1.5-.4-1.5-1z" fill="currentColor" stroke="none"/>',
  pillar: '<path d="M8 5h8M7 19h10v2.4H7zM9 5.5v13M15 5.5v13"/><path d="M8.5 10h7M8.5 14h7"/>',
  grave: '<path d="M7.5 21V10a4.5 4.5 0 0 1 9 0v11z"/><path d="M9.5 9.5h5M12 7v5"/>',
};

export function iconSvg(name) {
  return `<svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ICONS.dot}</svg>`;
}
export function iconEl(name, cls = '') {
  const span = el('span.ico' + (cls ? '.' + cls : ''));
  span.innerHTML = iconSvg(name);
  return span;
}
export const hasIcon = (name) => !!ICONS[name];
