// Node-resolution screens for the run loop: card reward, shop, rest, event,
// Ward-Stone, ending, defeat. Each takes the run + a small set of callbacks.

import { el, mount, screen } from '../ui.js';
import { Game } from '../state.js';
import { CARDS, REWARD_POOL, CLASS_REWARDS } from '../cards.js';
import { RELICS, RELIC_LIST } from '../relics.js';
import { POTION_LIST } from '../potions.js';

const rng = () => Game.rng;
const max = (run) => run.maxHp;

function pickN(pool, n) { const a = pool.slice(), out = []; while (out.length < n && a.length) out.push(a.splice(Math.floor(rng().next() * a.length), 1)[0]); return out; }
function cardBtn(id, onPick) { const c = CARDS[id]; return el('button.pick.card-pick', { dataset: { testid: 'reward-card' }, onclick: onPick }, [
  el('span.name', {}, c.name), el('span.tagline', {}, c.type), el('span.blurb', {}, c.text) ]); }
function head(title, sub) { return el('header.screen-head', {}, [el('h1', {}, title), sub ? el('span.section-label', {}, sub) : null]); }

/* ---------------- card reward ---------------- */
export function openReward(run, { back, elite }) {
  if (elite) { const unowned = RELIC_LIST.filter((r) => !run.relics.includes(r.id)); if (unowned.length) run.relics.push(rng().pick(unowned).id); }
  const offered = [...pickN(REWARD_POOL, 2), rng().pick(CLASS_REWARDS[run.cls] || REWARD_POOL)];
  const s = screen('node');
  s.append(head('Spoils', elite ? 'You also claim a relic!' : 'Add a card to your deck'),
    el('div.scroll', {}, [
      el('div.grid', {}, offered.map((id) => cardBtn(id, () => { run.deck.push(id); back(); }))),
      el('button.btn.btn-ghost', { dataset: { testid: 'btn-skip' }, style: { marginTop: '.8rem' }, onclick: back }, 'Skip'),
    ]));
  mount(s);
}

/* ---------------- shop ---------------- */
export function openShop(run, { back }) {
  const stock = { cards: pickN(REWARD_POOL, 3), relic: RELIC_LIST.filter((r) => !run.relics.includes(r.id)), potion: POTION_LIST };
  const relicId = stock.relic.length ? rng().pick(stock.relic).id : null;
  const potionId = rng().pick(stock.potion).id;
  const sold = {};
  function render() {
    const s = screen('node');
    const row = (label, sub, price, can, buy, key) => el('div.shop-row' + (sold[key] ? '.sold' : ''), {}, [
      el('div.shop-info', {}, [el('b', {}, label), el('span.blurb', {}, sub)]),
      el('button.btn', { disabled: sold[key] || run.gold < price || !can, onclick: () => { if (run.gold >= price) { run.gold -= price; buy(); sold[key] = true; render(); } } }, sold[key] ? 'Sold' : `${price}🪙`),
    ]);
    s.append(
      head('Wandering Merchant', `Gold: ${run.gold} 🪙`),
      el('div.scroll', {}, [
        ...stock.cards.map((id, i) => row(CARDS[id].name, CARDS[id].text, 50, true, () => run.deck.push(id), 'c' + i)),
        relicId ? row('★ ' + RELICS[relicId].name, RELICS[relicId].desc, 120, true, () => run.relics.push(relicId), 'r') : null,
        row('Potion: ' + POTION_LIST.find((p) => p.id === potionId).name, POTION_LIST.find((p) => p.id === potionId).desc, 40, true, () => run.potions.push(potionId), 'p'),
        row('Remove a card', 'Thin your deck', 50, run.deck.length > 5, () => openRemove(run, { back: () => openShop(run, { back }) }), 'rm'),
      ]),
      el('button.btn.btn-primary', { dataset: { testid: 'btn-leave' }, onclick: back }, 'Leave'),
    );
    mount(s);
  }
  render();
}

/* ---------------- remove a card ---------------- */
export function openRemove(run, { back }) {
  const s = screen('node');
  s.append(head('Remove a Card'),
    el('div.scroll', {}, el('div.grid', {}, run.deck.map((id, i) =>
      cardBtn(id, () => { run.deck.splice(i, 1); back(); })))),
    el('button.btn.btn-ghost', { onclick: back }, 'Cancel'));
  mount(s);
}

/* ---------------- rest ---------------- */
export function openRest(run, { back }) {
  const s = screen('node');
  s.append(head('Campfire', 'A moment of quiet before the dark'),
    el('nav.menu', {}, [
      el('button.btn.btn-primary', { dataset: { testid: 'btn-rest-heal' }, onclick: () => { run.hp = Math.min(max(run), run.hp + Math.ceil(max(run) * 0.3)); back(); } }, `Rest — heal ${Math.ceil(max(run) * 0.3)} HP`),
      el('button.btn', { onclick: () => openRemove(run, { back }) }, 'Tend your kit — remove a card'),
    ]));
  mount(s);
}

/* ---------------- events ---------------- */
const EVENTS = [
  { title: 'Forgotten Shrine', text: 'A cracked idol watches the road. Ash drifts from its mouth.',
    choices: [
      { label: 'Pray (heal 8 — but doubt may take root)', go: (run) => { run.hp = Math.min(run.maxHp, run.hp + 8); if (rng().chance(0.5)) run.deck.push('ashen_doubt'); } },
      { label: 'Desecrate it (+20 gold, lose 5 HP)', go: (run) => { run.gold += 20; run.hp = Math.max(1, run.hp - 5); } },
      { label: 'Leave it be', go: () => {} },
    ] },
  { title: 'A Trapped Chest', text: 'Iron-bound and humming faintly. Greed and caution war in you.',
    choices: [
      { label: 'Force it open (lose 8 HP, gain a relic)', go: (run) => { run.hp = Math.max(1, run.hp - 8); const u = RELIC_LIST.filter((r) => !run.relics.includes(r.id)); if (u.length) run.relics.push(rng().pick(u).id); } },
      { label: 'Leave it', go: () => {} },
    ] },
  { title: 'A Wounded Stranger', text: 'A scout, ash-burned and gasping, reaches for your hand.',
    choices: [
      { label: 'Help her (lose 6 HP, gain a card)', go: (run) => { run.hp = Math.max(1, run.hp - 6); run.deck.push(rng().pick(REWARD_POOL)); } },
      { label: 'Take her purse (+25 gold)', go: (run) => { run.gold += 25; } },
      { label: 'Walk on', go: () => {} },
    ] },
  { title: 'The Ashen Altar', text: 'A whisper offers power for a sliver of your certainty.',
    choices: [
      { label: 'Accept (gain Heavy Strike — and a curse)', go: (run) => { run.deck.push('heavy_strike'); run.deck.push('ashen_doubt'); } },
      { label: 'Resist (lose 6 HP, gain Empower)', go: (run) => { run.hp = Math.max(1, run.hp - 6); run.deck.push('empower'); } },
      { label: 'Cleanse and leave', go: () => {} },
    ] },
];

export function openEvent(run, { back }) {
  const ev = rng().pick(EVENTS);
  const s = screen('node');
  s.append(head(ev.title),
    el('p.event-text', {}, ev.text),
    el('nav.menu', {}, ev.choices.map((ch) =>
      el('button.btn', { dataset: { testid: 'event-choice' }, onclick: () => { ch.go(run); back(); } }, ch.label))));
  mount(s);
}

/* ---------------- Ward-Stone (unlocks the Sanctum) ---------------- */
export function openWard(run, { back }) {
  run.flags.wardStone = true;
  if (!run.relics.includes('warding_charm')) run.relics.push('warding_charm');
  run.hp = Math.min(run.maxHp, run.hp + 6);
  const s = screen('node');
  s.append(head('The Sunken Chapel'),
    el('p.event-text', {}, 'Beneath the flooded nave you pry the Ward-Stone free. Its cold light pushes back the violet dark — and the Sanctum’s seal answers. The way to the High Priest is open.'),
    el('p.hub-story', {}, 'Gained the Warding Charm. The Sanctum is unsealed.'),
    el('nav.menu', {}, [el('button.btn.btn-primary', { dataset: { testid: 'btn-ward-continue' }, onclick: back }, 'Continue')]));
  mount(s);
}

/* ---------------- ending / defeat ---------------- */
export function openEnding(run, { toTitle }) {
  const s = screen('result-screen win');
  s.append(el('div.title-wrap', {}, [
    el('h1.game-title', { style: { fontSize: '2.4rem', color: 'var(--gold)' } }, 'The Wood is Won'),
    el('p.event-text', { style: { maxWidth: '34ch' } }, 'The High Priest crumbles to ash and the ritual breaks. For a heartbeat there is silence — then, far below, something vast turns over. “We won the wood. But the Hollow Beneath has learned our names now.”'),
    el('nav.menu', {}, [el('button.btn.btn-primary', { dataset: { testid: 'btn-ending' }, onclick: toTitle }, 'Return to Hearthvale')]),
  ]));
  mount(s);
  window.__gameState = { screen: 'ending' };
}

export function openDefeat(run, { restart }) {
  const s = screen('result-screen lose');
  s.append(el('div.title-wrap', {}, [
    el('h1.game-title', { style: { fontSize: '2.2rem', color: '#ff7a7a' } }, 'Fallen'),
    el('p.event-text', { style: { maxWidth: '34ch' } }, 'The ash takes you — but the vale endures, and so does your resolve. You will return to Hearthvale and try again.'),
    el('nav.menu', {}, [el('button.btn.btn-primary', { dataset: { testid: 'btn-defeat' }, onclick: restart }, 'Try Again')]),
  ]));
  mount(s);
  window.__gameState = { screen: 'defeat' };
}
