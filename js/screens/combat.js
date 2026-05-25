// Combat screen: drives the pure engine (combat.js), renders the board, handles
// tap-to-target input, fires GSAP juice via engine hooks, shows win/lose overlay.

import { el, mount, screen, $ } from '../ui.js';
import { Combat } from '../combat.js';
import { STATUSES } from '../statuses.js';
import { RELICS } from '../relics.js';
import { POTIONS } from '../potions.js';
import * as FX from '../fx.js';
import { Audio } from '../audio.js';
import { openDeckViewer, openCodex } from './qol.js';
import { iconEl } from '../icons.js';
import { artOrFallback, bgImage } from '../art.js';

let C, ui, selUid = null, targeting = false, pending = [], cbWin, cbLose;

const idOf = (e) => (e.isPlayer ? 'player' : e.uid);
const ENEMY_ICON = { goblin:'goblin', skeleton:'skeleton', direwolf:'beast', bandit:'bandit', orc:'orc', cultist:'cultist', orc_berserker:'orc', cult_zealot:'cultist', high_priest:'boss' };
const INTENT_ICON = { attack:'sword', block:'shield', buff:'chevup', debuff:'chevdown', charge:'charge', summon:'grave', ramp:'strength' };

export function startCombat({ rng, player, enemyIds, onWin, onLose }) {
  cbWin = onWin; cbLose = onLose; selUid = null; targeting = false; pending = [];
  const hooks = {
    onDamage: (e) => pending.push({ t: 'dmg', uid: idOf(e.target), amount: e.amount, poison: e.poison }),
    onBlock:  (e) => e.amount > 0 && pending.push({ t: 'blk', uid: idOf(e.entity), amount: e.amount }),
    onHeal:   (e) => e.amount > 0 && pending.push({ t: 'heal', uid: idOf(e.entity), amount: e.amount }),
    onTurnStart: (e) => e.who === 'player' && pending.push({ t: 'turn' }),
    onDeath:  (e) => e.target && !e.target.isPlayer && pending.push({ t: 'death', uid: e.target.uid }),
    onEnd:    (e) => pending.push({ t: 'end', result: e.result }),
  };
  C = new Combat({ rng, player, enemyIds, hooks });
  window.__combat = C; // test/debug hook
  buildShell();
  C.start();
  renderBoard();
  flush();
}

function buildShell() {
  const s = screen('combat');
  ui = {
    scene:   el('div.combat-scene', { 'aria-hidden': 'true' }),
    topbar:  el('div.combat-top', { dataset: { testid: 'topbar' } }),
    enemies: el('div.enemies', { dataset: { testid: 'enemies' } }),
    player:  el('div.player-panel', { dataset: { testid: 'player' } }),
    hand:    el('div.hand', { dataset: { testid: 'hand' } }),
    foot:    el('div.combat-foot'),
  };
  s.append(ui.scene, ui.topbar, ui.enemies, ui.player, el('div.hand-wrap', {}, [ui.hand]), ui.foot);
  mount(s);
  bgImage(ui.scene, 'assets/backgrounds/combat.webp');
  ui.root = s;
}

/* ---------------- render ---------------- */
function renderBoard() {
  const snap = C.snapshot();
  renderTopBar(snap);
  renderEnemies(snap);
  renderPlayer(snap);
  renderHand(snap);
  renderFoot(snap);
  window.__gameState = { screen: 'combat', ...snap, selUid, targeting };
}

function renderTopBar(snap) {
  const relics = snap.relics.map((id) => {
    const r = RELICS[id] || { name: id, desc: '' };
    return el('span.relic', { title: `${r.name} — ${r.desc}` }, iconEl('gem'));
  });
  const potions = snap.potions.map((id, i) => {
    const p = POTIONS[id] || { name: id, desc: '' };
    return el('button.potion', { title: `${p.name} — ${p.desc}`, dataset: { testid: 'potion' },
      disabled: C.over, onclick: () => usePotion(i) }, iconEl('flask'));
  });
  ui.topbar.replaceChildren(
    el('div.relic-row', { dataset: { testid: 'relics' } }, relics.length ? relics : [el('span.muted', {}, '')]),
    el('div.potion-row', {}, [
      ...potions,
      el('button.potion', { title: 'View deck', dataset: { testid: 'btn-deck' }, onclick: () => openDeckViewer('Deck', deckIds()) }, iconEl('cards')),
      el('button.potion', { title: 'Keywords', dataset: { testid: 'btn-codex' }, onclick: openCodex }, iconEl('scroll')),
    ]),
  );
}
function deckIds() { return [...C.hand, ...C.drawPile, ...C.discardPile, ...C.exhaustPile].map((c) => c.id); }

function usePotion(idx) {
  if (C.over) return;
  if (C.usePotion(idx)) { Audio.play('potion'); renderBoard(); flush(); }
}

function statusChips(statuses) {
  return Object.entries(statuses || {}).filter(([, v]) => v).map(([id, v]) => {
    const d = STATUSES[id] || { name: id };
    return el('span.chip', { title: `${d.name} ${v}` }, [iconEl(id), String(v)]);
  });
}

function hpBar(hp, maxHp, isPlayer, block) {
  const bar = el('div.hpbar' + (isPlayer ? '.player' : ''), {}, [
    el('i', { style: { transform: `scaleX(${Math.max(0, hp / maxHp)})` } }),
    el('span', {}, `${hp}/${maxHp}`),
  ]);
  if (block > 0) bar.append(el('div.blockbadge', { title: 'Block' }, [iconEl('shield'), String(block)]));
  return bar;
}

function renderEnemies(snap) {
  const living = snap.enemies.filter((e) => e.hp > 0).length;
  ui.enemies.replaceChildren(...snap.enemies.map((e) => {
    const dead = e.hp <= 0;
    const canTarget = targeting && !dead;
    const node = el('div.enemy' + (dead ? '.dead' : '') + (canTarget ? '.targetable' : ''),
      { dataset: { uid: e.uid, testid: 'enemy' } }, [
        e.intent && !dead
          ? el('div.intent.' + e.intent.type, {}, [iconEl(INTENT_ICON[e.intent.type] || 'sword'), intentLabel(e.intent)])
          : el('div.intent', { style: { visibility: 'hidden' } }, '·'),
        el('div.portrait', {}, dead ? iconEl('skeleton') : enemyArt(e)),
        el('div.ename', {}, e.name),
        hpBar(e.hp, e.maxHp, false, e.block),
        el('div.statuses', {}, statusChips(e.statuses)),
      ]);
    if (canTarget) node.addEventListener('click', () => resolve(selUid, e.uid));
    return node;
  }));
  // remember count for auto-target
  ui._living = living;
}
function enemyArt(e) { return artOrFallback(`assets/enemies/${e.id}.webp`, iconEl(ENEMY_ICON[e.id] || 'goblin')); }
function intentLabel(it) { if (!it.amount) return ''; return it.times > 1 ? `${it.amount}×${it.times}` : String(it.amount); }

function renderPlayer(snap) {
  const p = snap.player;
  ui.player.replaceChildren(
    el('div.who', {}, 'You'),
    el('div.bars', {}, [ hpBar(p.hp, p.maxHp, true, p.block), el('div.statuses', {}, statusChips(p.statuses)) ]),
  );
}

function renderHand(snap) {
  ui.hand.replaceChildren(...snap.hand.map((c) => {
    const disabled = c.cost > snap.player.energy || c.unplayable;
    const node = el('button.card' + (c.uid === selUid ? '.sel' : '') + (disabled ? '.disabled' : ''), {
      dataset: { type: c.type, uid: c.uid, cid: c.id, testid: 'card' },
    }, [
      el('div.cost', {}, String(c.cost)),
      el('div.cname', {}, c.name),
      el('div.ctype', {}, c.type),
      el('div.ctext', {}, cardText(c)),
    ]);
    if (!disabled) node.addEventListener('click', () => onCardClick(c));
    return node;
  }));
}
function cardText(c) { return c.text || ''; }

function renderFoot(snap) {
  const p = snap.player;
  const pips = [];
  for (let i = 0; i < C.maxEnergy; i++) pips.push(el('span.pip' + (i >= p.energy ? '.spent' : '')));
  ui.foot.replaceChildren(
    el('div.energy', { dataset: { testid: 'energy' } }, [ el('span.energy-big', {}, [iconEl('bolt'), ` ${p.energy}/${C.maxEnergy}`]) ]),
    el('div.hint', {}, targeting ? 'Tap an enemy to target…' : ''),
    el('button.btn.btn-primary.btn-end', { dataset: { testid: 'btn-end-turn' }, disabled: C.over,
      onclick: endTurn }, 'End Turn'),
  );
}

/* ---------------- input ---------------- */
function onCardClick(card) {
  if (C.over) return;
  if (card.target === 'enemy') {
    const living = C.livingEnemies();
    if (living.length === 1) return resolve(card.uid, living[0].uid); // auto-target
    selUid = (selUid === card.uid) ? null : card.uid;
    targeting = !!selUid;
    renderBoard();
  } else {
    resolve(card.uid, null);
  }
}

function resolve(uid, targetUid) {
  const ok = C.play(uid, targetUid);
  if (!ok) return;
  Audio.play('card');
  selUid = null; targeting = false;
  renderBoard();
  flush();
}

function endTurn() {
  if (C.over) return;
  selUid = null; targeting = false;
  C.endTurn();
  renderBoard();
  flush();
}

/* ---------------- juice ---------------- */
function elFor(uid) {
  if (uid === 'player') return ui.player.querySelector('.bars') || ui.player;
  const node = ui.enemies.querySelector(`[data-uid="${uid}"] .portrait`);
  return node || ui.enemies;
}

function flush() {
  let ended = null, turn = false;
  for (const ev of pending) {
    if (ev.t === 'dmg' && ev.amount > 0) {
      const tgt = elFor(ev.uid);
      FX.floatText(tgt, '-' + ev.amount, { color: ev.poison ? '#84cc5a' : '#ff6b6b' });
      FX.hitFlash(tgt);
      FX.burst(tgt, { color: ev.poison ? '#84cc5a' : '#ff7a5a', n: 9 });
      if (ev.uid === 'player') FX.screenShake(6);
    } else if (ev.t === 'blk') {
      FX.floatText(elFor(ev.uid), '+' + ev.amount, { color: '#9ec5ff', up: 44 });
      FX.burst(elFor(ev.uid), { color: '#8fb6ff', n: 5, spread: 30 });
    } else if (ev.t === 'heal') {
      FX.floatText(elFor(ev.uid), '+' + ev.amount, { color: '#34d399', up: 44 });
      FX.burst(elFor(ev.uid), { color: '#46d39a', n: 5, spread: 30 });
    } else if (ev.t === 'death') {
      FX.burst(elFor(ev.uid), { color: '#d9c7ff', n: 18, spread: 72, size: 7 });
      FX.screenShake(4);
    } else if (ev.t === 'turn') { turn = true; }
    else if (ev.t === 'end') { ended = ev.result; }
  }
  pending = [];
  if (turn) FX.dealIn([...ui.hand.children]);
  if (ended) setTimeout(() => showResult(ended), 420);
}

function showResult(result) {
  const overlay = el('div.result.' + result, { dataset: { testid: 'result' } }, [
    el('h2', {}, result === 'win' ? 'Victory' : 'Defeat'),
    el('button.btn.btn-primary', { dataset: { testid: 'btn-result' },
      onclick: () => { overlay.remove(); (result === 'win' ? cbWin : cbLose)?.(C.player.hp); } },
      result === 'win' ? 'Continue' : 'Return'),
  ]);
  document.getElementById('fx-layer').appendChild(overlay);
}
