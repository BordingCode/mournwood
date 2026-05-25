// Combat engine — pure, DOM-free, deterministic (RNG injected). The UI layer
// (screens/combat.js) drives this and listens to `hooks` for juice. Tests/fuzzer
// import this directly with no browser.

import { instantiate } from './cards.js';
import { makeEnemy, rollIntent } from './enemies.js';
import { amt, has, addStatus, decayTurnEnd } from './statuses.js';

const NOOP = () => {};

export class Combat {
  constructor({ rng, player, enemyIds, handSize = 5, energy = 3, hooks = {} }) {
    this.rng = rng;
    this.handSize = handSize;
    this.maxEnergy = energy;
    this.h = new Proxy(hooks, { get: (t, k) => t[k] || NOOP });

    this.turn = 0;
    this.over = false;
    this.result = null; // 'win' | 'lose'
    this.player = {
      isPlayer: true, name: player.name || 'Hero',
      maxHp: player.maxHp, hp: player.hp ?? player.maxHp,
      block: 0, energy: 0, statuses: { ...(player.statuses || {}) },
    };
    this.enemies = enemyIds.map((id) => makeEnemy(rng, id));
    this.drawPile = rng.shuffle((player.deck || []).map(instantiate));
    this.hand = [];
    this.discardPile = [];
    this.exhaustPile = [];
  }

  /* ---------------- lifecycle ---------------- */
  start() { this.beginPlayerTurn(); return this; }

  beginPlayerTurn() {
    if (this.over) return;
    this.turn++;
    this.player.block = 0;
    this.tickStartOfTurn(this.player);
    if (this.checkOver()) return;
    this.player.energy = this.maxEnergy;
    this.draw(this.handSize);
    this.h.onTurnStart({ who: 'player', turn: this.turn });
  }

  endTurn() {
    if (this.over) return;
    // discard hand
    while (this.hand.length) this.discardPile.push(this.hand.pop());
    decayTurnEnd(this.player);
    this.h.onTurnEnd({ who: 'player' });
    this.enemyPhase();
  }

  enemyPhase() {
    for (const e of this.enemies.filter((x) => x.hp > 0)) {
      if (this.over) break;
      e.block = 0;
      this.tickStartOfTurn(e);
      if (e.hp <= 0) { this.checkOver(); continue; }
      this.executeIntent(e);
      if (this.checkOver()) return;
      decayTurnEnd(e);
      rollIntent(this.rng, e);
    }
    if (!this.over) this.beginPlayerTurn();
  }

  /* ---------------- cards ---------------- */
  draw(n) {
    for (let i = 0; i < n; i++) {
      if (this.hand.length >= 10) break;
      if (this.drawPile.length === 0) {
        if (this.discardPile.length === 0) break;
        this.drawPile = this.rng.shuffle(this.discardPile);
        this.discardPile = [];
      }
      const c = this.drawPile.pop();
      this.hand.push(c);
      this.h.onDraw(c);
    }
  }

  canPlay(card, targetUid) {
    if (this.over || !card || card.unplayable) return false;
    if (card.cost > this.player.energy) return false;
    if (card.target === 'enemy') {
      const t = this.enemies.find((e) => e.uid === targetUid && e.hp > 0);
      return !!t;
    }
    return true;
  }

  play(uid, targetUid) {
    const idx = this.hand.findIndex((c) => c.uid === uid);
    if (idx < 0) return false;
    const card = this.hand[idx];
    if (!this.canPlay(card, targetUid)) return false;
    this.player.energy -= card.cost;
    this.hand.splice(idx, 1);
    this.h.onPlayCard({ card, targetUid });
    const target = this.enemies.find((e) => e.uid === targetUid) || null;
    this.resolveEffects(card, target);
    (card.exhaust ? this.exhaustPile : this.discardPile).push(card);
    this.checkOver();
    return true;
  }

  resolveEffects(card, target) {
    for (const op of card.effects || []) {
      if (op.k === 'damage') {
        const tgts = card.target === 'all' ? this.enemies.filter((e) => e.hp > 0) : [target].filter(Boolean);
        for (const t of tgts) this.attack(this.player, t, op.amount, { spell: card.spell });
      } else if (op.k === 'block') {
        this.gainBlock(this.player, op.amount);
      } else if (op.k === 'heal') {
        this.heal(this.player, op.amount);
      } else if (op.k === 'draw') {
        this.draw(op.amount);
      } else if (op.k === 'energy') {
        this.player.energy += op.amount;
      } else if (op.k === 'status') {
        if (op.to === 'self') this.applyStatus(this.player, op.status, op.amount);
        else if (card.target === 'all') this.enemies.filter((e) => e.hp > 0).forEach((e) => this.applyStatus(e, op.status, op.amount));
        else if (target) this.applyStatus(target, op.status, op.amount);
      }
    }
  }

  /* ---------------- combat math ---------------- */
  computeDamage(attacker, target, base, opts = {}) {
    let d = base + amt(attacker, 'strength');
    if (opts.spell) d += amt(attacker, 'spellpower');
    if (has(attacker, 'weak')) d = Math.floor(d * 0.75);
    if (has(target, 'vulnerable')) d = Math.floor(d * 1.5);
    return Math.max(0, Math.round(d));
  }

  attack(attacker, target, base, opts = {}) {
    if (!target || target.hp <= 0) return 0;
    const dmg = this.computeDamage(attacker, target, base, opts);
    const dealt = this.applyDamage(target, dmg);
    this.h.onDamage({ target, amount: dealt, raw: dmg, attacker });
    if (target.hp <= 0) this.h.onDeath({ target });
    return dealt;
  }

  applyDamage(target, dmg) {
    let rem = dmg;
    if (target.block > 0) { const a = Math.min(target.block, rem); target.block -= a; rem -= a; }
    target.hp = Math.max(0, target.hp - rem);
    return dmg;
  }

  gainBlock(e, base) {
    let b = base + (e.isPlayer ? amt(e, 'dexterity') : 0);
    if (has(e, 'frail')) b = Math.floor(b * 0.75);
    b = Math.max(0, b);
    e.block += b;
    this.h.onBlock({ entity: e, amount: b });
    return b;
  }

  heal(e, n) { e.hp = Math.min(e.maxHp, e.hp + n); this.h.onHeal({ entity: e, amount: n }); }

  applyStatus(e, id, n) { addStatus(e, id, n); this.h.onStatus({ entity: e, id, amount: n }); }

  tickStartOfTurn(e) {
    const p = amt(e, 'poison');
    if (p > 0) { this.applyDamage(e, p); addStatus(e, 'poison', -1); this.h.onDamage({ target: e, amount: p, raw: p, attacker: null, poison: true }); }
    const r = amt(e, 'regen');
    if (r > 0) { this.heal(e, r); addStatus(e, 'regen', -1); }
  }

  executeIntent(e) {
    const it = e.intent || rollIntent(this.rng, e);
    this.h.onEnemyAction({ enemy: e, intent: it });
    if (it.type === 'attack') this.attack(e, this.player, it.amount);
    else if (it.type === 'block') this.gainBlock(e, it.amount);
    else if (it.type === 'buff') this.applyStatus(e, it.status, it.amount);
    else if (it.type === 'debuff') this.applyStatus(this.player, it.status, it.amount);
  }

  /* ---------------- queries ---------------- */
  livingEnemies() { return this.enemies.filter((e) => e.hp > 0); }

  checkOver() {
    if (this.over) return true;
    if (this.player.hp <= 0) { this.over = true; this.result = 'lose'; this.h.onEnd({ result: 'lose' }); return true; }
    if (this.livingEnemies().length === 0) { this.over = true; this.result = 'win'; this.h.onEnd({ result: 'win' }); return true; }
    return false;
  }

  // For the fuzzer / a simple AI: list legal plays this turn.
  validPlays() {
    const out = [];
    for (const c of this.hand) {
      if (c.unplayable || c.cost > this.player.energy) continue;
      if (c.target === 'enemy') {
        for (const e of this.livingEnemies()) out.push({ uid: c.uid, targetUid: e.uid });
      } else out.push({ uid: c.uid, targetUid: null });
    }
    return out;
  }

  snapshot() {
    return {
      turn: this.turn, over: this.over, result: this.result,
      player: { hp: this.player.hp, maxHp: this.player.maxHp, block: this.player.block, energy: this.player.energy, statuses: { ...this.player.statuses } },
      enemies: this.enemies.map((e) => ({ uid: e.uid, name: e.name, hp: e.hp, maxHp: e.maxHp, block: e.block, statuses: { ...e.statuses }, intent: e.intent })),
      hand: this.hand.map((c) => ({ uid: c.uid, id: c.id, name: c.name, cost: c.cost, type: c.type,
        target: c.target, text: c.text, spell: c.spell, unplayable: c.unplayable })),
      piles: { draw: this.drawPile.length, discard: this.discardPile.length, exhaust: this.exhaustPile.length },
    };
  }
}
