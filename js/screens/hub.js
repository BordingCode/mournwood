// Hearthvale hub — story beat + venture into the region (Normal or Quick).

import { el, mount, screen } from '../ui.js';
import { RACE_BY_ID } from '../data/races.js';
import { CLASS_BY_ID } from '../data/classes.js';

export function openHub(ctx, { onVenture }) {
  const r = RACE_BY_ID[ctx.race], c = CLASS_BY_ID[ctx.cls];
  const s = screen('hub');
  s.append(el('div.hub-wrap', {}, [
    el('h1.hub-title', {}, 'Hearthvale'),
    el('p.game-tag', {}, 'the vale of Aldermoor'),
    el('p.hub-story', {}, '“You came on the ash-wind, traveler. Most flee it — maybe that’s why I’ll trust you. The Ashen Hand stirs in the Mournwood. Stop their ritual before the Hollow wakes.” — Elder Maren'),
    el('p.hub-hero', {}, `${c.emoji} You are a ${r.name} ${c.name}.`),
    el('nav.menu', {}, [
      el('button.btn.btn-primary', { dataset: { testid: 'btn-venture' }, onclick: () => onVenture('normal') }, 'Venture into the Mournwood'),
      el('button.btn', { dataset: { testid: 'btn-quick' }, onclick: () => onVenture('quick') }, 'Quick Delve · ~20 min'),
    ]),
  ]));
  mount(s);
  window.__gameState = { screen: 'hub' };
}
