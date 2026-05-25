// Mournwood — boot + screen router. Phase 1: title + race/class select.

import { el, mount, screen, hideSplash } from './ui.js';
import { Game, syncDebug } from './state.js';
import { CLASSES, CLASS_BY_ID } from './data/classes.js';
import { RACES, RACE_BY_ID } from './data/races.js';
import { startCombat } from './screens/combat.js';
import { createRun, combatant, encounterFor, goldReward } from './run.js';
import { openMap } from './screens/map.js';
import { openHub } from './screens/hub.js';
import { openReward, openShop, openRest, openEvent, openWard, openEnding, openDefeat } from './screens/nodes.js';

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

/* ---------------- run loop ---------------- */
function startAdventure() {
  const { raceId, classId } = Game.selection;
  if (!raceId || !classId) return;
  openHub({ race: raceId, cls: classId }, { onVenture: startRun });
}

function startRun(mode) {
  Game.run = createRun({ race: Game.selection.raceId, cls: Game.selection.classId, mode, rng: Game.rng });
  openWorld();
}

function openWorld() {
  Game.screen = 'map';
  openMap(Game.run, { onNode: resolveNode, onMenu: openPause });
}

function resolveNode(poi) {
  const run = Game.run;
  const back = () => { run.cleared[poi.id] = true; openWorld(); };
  if (poi.type === 'combat' || poi.type === 'elite') startNodeCombat(poi);
  else if (poi.type === 'boss') startBossCombat(poi);
  else if (poi.type === 'shop') openShop(run, { back });
  else if (poi.type === 'rest') openRest(run, { back });
  else if (poi.type === 'event') openEvent(run, { back });
  else if (poi.type === 'ward') openWard(run, { back });
}

function startNodeCombat(poi) {
  const run = Game.run;
  Game.screen = 'combat'; syncDebug();
  startCombat({
    rng: Game.rng, player: combatant(run), enemyIds: encounterFor(poi, Game.rng),
    onWin: (hp) => { run.hp = hp; run.gold += goldReward(poi, Game.rng); run.cleared[poi.id] = true;
      openReward(run, { back: openWorld, elite: poi.type === 'elite' }); },
    onLose: startDefeat,
  });
}

function startBossCombat(poi) {
  const run = Game.run;
  Game.screen = 'combat'; syncDebug();
  startCombat({
    rng: Game.rng, player: combatant(run), enemyIds: ['high_priest'],
    onWin: (hp) => { run.hp = hp; run.cleared.boss = true; openEnding(run, { toTitle: () => go('title') }); },
    onLose: startDefeat,
  });
}

function startDefeat() {
  openDefeat(Game.run, { restart: () => {
    const { race, cls, mode } = Game.run;
    Game.run = createRun({ race, cls, mode, rng: Game.rng });
    openWorld();
  } });
}

// lightweight pause overlay from the map's ☰
function openPause() {
  const ov = el('div.result', { dataset: { testid: 'pause' } }, [
    el('h2', { style: { fontSize: '1.7rem', color: 'var(--parchment)' } }, 'Paused'),
    el('nav.menu', {}, [
      el('button.btn.btn-primary', { onclick: () => { ov.remove(); openWorld(); } }, 'Resume'),
      el('button.btn.btn-ghost', { onclick: () => { ov.remove(); go('title'); } }, 'Abandon run'),
    ]),
  ]);
  document.getElementById('fx-layer').appendChild(ov);
}

boot();
