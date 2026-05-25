// Quality-of-life overlays: deck viewer + keyword codex. Rendered into the FX layer
// so they pop over any screen (map or combat) without unmounting it.

import { el } from '../ui.js';
import { CARDS } from '../cards.js';
import { STATUSES } from '../statuses.js';
import { iconEl } from '../icons.js';

function overlay(title, body, testid) {
  const ov = el('div.qol-overlay', { dataset: { testid } }, [
    el('header.screen-head', {}, [
      el('h1', {}, title),
      el('button.btn.btn-ghost.back', { onclick: () => ov.remove() }, '✕ Close'),
    ]),
    el('div.scroll', {}, body),
  ]);
  document.getElementById('fx-layer').appendChild(ov);
  return ov;
}

export function openDeckViewer(title, cardIds) {
  const counts = {};
  for (const id of cardIds) counts[id] = (counts[id] || 0) + 1;
  const cards = Object.entries(counts).sort().map(([id, n]) => {
    const c = CARDS[id] || { name: id, type: 'skill', text: '' };
    return el('div.mini-card', { dataset: { type: c.type } }, [
      el('div.cn', {}, `${c.name}${n > 1 ? ' ×' + n : ''}`),
      el('div.ct', {}, c.text),
    ]);
  });
  overlay(`${title} (${cardIds.length})`, el('div.grid', {}, cards), 'deck-viewer');
}

export function openCodex() {
  const rows = Object.entries(STATUSES).map(([id, s]) =>
    el('div.codex-row', {}, [iconEl(id, 'big'), el('div', {}, [el('b', {}, s.name), el('span.blurb', {}, s.desc)])]));
  overlay('Keywords', rows, 'codex');
}
