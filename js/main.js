// Mournwood — boot + screen router. Phase 1: title + race/class select.

import { el, mount, screen, hideSplash } from './ui.js';
import { Game, syncDebug } from './state.js';
import { CLASSES, CLASS_BY_ID } from './data/classes.js';
import { RACES, RACE_BY_ID } from './data/races.js';

/* ---------------- boot ---------------- */
function boot() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
  // small splash beat, then title
  setTimeout(() => { hideSplash(); routeTitle(); }, 450);
}

/* ---------------- router ---------------- */
export function go(name) {
  Game.screen = name;
  if (name === 'title') routeTitle();
  else if (name === 'select') routeSelect();
  else if (name === 'hub') routeHubStub();
  syncDebug();
}

/* ---------------- title ---------------- */
function routeTitle() {
  const s = screen('title');
  s.append(el('div.title-wrap', {}, [
    el('h1.game-title', {}, 'Mournwood'),
    el('p.game-tag', {}, 'A roguelite card adventure'),
    el('nav.menu', {}, [
      el('button.btn.btn-primary', { dataset:{ testid:'btn-new' }, onclick:() => go('select') }, 'New Adventure'),
      el('button.btn', { disabled:true, dataset:{ testid:'btn-continue' } }, 'Continue'),
      el('button.btn.btn-ghost', { disabled:true }, 'Settings'),
    ]),
  ]));
  mount(s);
  Game.screen = 'title';
  syncDebug();
}

/* ---------------- race/class select ---------------- */
function routeSelect() {
  const s = screen('select');

  const summary = el('div.summary', { dataset:{ testid:'select-summary' } }, 'Choose a race and a class.');
  const begin = el('button.btn.btn-primary', {
    disabled:true, dataset:{ testid:'btn-begin' },
    onclick: startAdventure,
  }, 'Begin');

  function refresh() {
    const { raceId, classId } = Game.selection;
    const r = RACE_BY_ID[raceId], c = CLASS_BY_ID[classId];
    begin.disabled = !(r && c);
    summary.replaceChildren(
      r || c
        ? el('span', {}, [ r ? el('b', {}, r.name) : 'race?', ' ', c ? el('b', {}, c.name) : 'class?' ])
        : document.createTextNode('Choose a race and a class.')
    );
    syncDebug();
  }

  const raceGrid = el('div.grid.cols-3', { dataset:{ testid:'race-grid' } },
    RACES.map((r) => pickCard('race', r, r.passive, () => { Game.selection.raceId = r.id; markSel(raceGrid, r.id); refresh(); }))
  );
  const classGrid = el('div.grid.cols-3', { dataset:{ testid:'class-grid' } },
    CLASSES.map((c) => pickCard('class', c, c.tagline, () => { Game.selection.classId = c.id; markSel(classGrid, c.id); refresh(); }))
  );

  s.append(
    el('header.screen-head', {}, [
      el('h1', {}, 'Forge Your Hero'),
      el('button.btn.btn-ghost.back', { dataset:{ testid:'btn-back' }, onclick:() => go('title') }, '‹ Back'),
    ]),
    el('div.scroll', {}, [
      el('div.section-label', {}, 'Race'), raceGrid,
      el('div.section-label', {}, 'Class'), classGrid,
    ]),
    el('div.confirm-bar', {}, [ summary, begin ]),
  );
  mount(s);
  Game.screen = 'select';
  refresh();
}

function pickCard(kind, item, tagline, onclick) {
  const sel = (kind === 'race' ? Game.selection.raceId : Game.selection.classId) === item.id;
  return el('button.pick' + (sel ? '.sel' : ''), {
    dataset:{ testid:`pick-${kind}-${item.id}`, id:item.id },
    onclick,
  }, [
    el('span.emoji', {}, item.emoji),
    el('span.name', {}, item.name),
    el('span.tagline', {}, tagline),
    el('span.blurb', {}, item.blurb),
  ]);
}

function markSel(grid, id) {
  [...grid.children].forEach((c) => c.classList.toggle('sel', c.dataset.id === id));
}

function startAdventure() {
  const { raceId, classId } = Game.selection;
  if (!raceId || !classId) return;
  go('hub'); // Phase 4 builds the real hub/map; stub for now.
}

/* ---------------- temporary hub stub (until Phase 4) ---------------- */
function routeHubStub() {
  const r = RACE_BY_ID[Game.selection.raceId], c = CLASS_BY_ID[Game.selection.classId];
  const s = screen('title');
  s.append(el('div.title-wrap', {}, [
    el('div.game-title', { style:{ fontSize:'2rem' } }, 'Hearthvale'),
    el('p.game-tag', {}, 'the vale of Aldermoor'),
    el('p', { style:{ color:'var(--text-dim)', maxWidth:'30ch' } },
      `${r.emoji} ${r.name} ${c.name} — your adventure begins here. (Hub, map & combat arrive in the next build phases.)`),
    el('nav.menu', {}, [
      el('button.btn.btn-ghost', { dataset:{ testid:'btn-tohub-back' }, onclick:() => go('title') }, '‹ Main Menu'),
    ]),
  ]));
  mount(s);
  Game.screen = 'hub';
  syncDebug();
}

boot();
