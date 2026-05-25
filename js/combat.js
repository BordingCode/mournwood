// Combat engine — pure, DOM-free, deterministic (RNG injected). Supports all 9 class
// identities via op-level scaling + a few extra ops, relic/potion hooks, and race
// passives. The UI (screens/combat.js) drives it and listens to `hooks` for juice.

import { instantiate } from './cards.js';
import { makeEnemy, rollIntent, advanceBoss } from './enemies.js';
import { amt, has, addStatus, decayTurnEnd } from './statuses.js';
import { RELICS } from './relics.js';
import { POTIONS } from './potions.js';

const NOOP = () => {};

export class Combat {
  constructor({ rng, player, enemyIds, handSize = 5, energy = 3, hooks = {} }) {
    this.rng = rng;
    this.handSize = handSize;
    this.maxEnergy = energy;
    this.h = new Proxy(hooks, { get: (t, k) => t[k] || NOOP });

    this.turn = 0;
    this.over = false;
    this.result = null;
    this.cardsThisTurn = 0;
    this.race = player.raceId || null;
    this.relics = (player.relics || []).slice();
    this.potions = (player.potions || []).slice();
    this.stoneskinUsed = false; this._bigHitUsed = false; this._fangPending = 0;

    this.player = {
      isPlayer: true, name: player.name || 'Hero',
      maxHp: player.maxHp, hp: player.hp ?? player.maxHp,
      block: 0, energy: 0, statuses: { ...(player.statuses || {}) },
    };
    this.enemies = enemyIds.map((id) => makeEnemy(rng, id));
    this.drawPile = rng.shuffle((player.deck || []).map(instantiate));
    this.hand = []; this.discardPile = []; this.exhaustPile = [];
  }

  /* ---------------- lifecycle ---------------- */
  start() { this.beginPlayerTurn(); return this; }

  beginPlayerTurn() {
    if (this.over) return;
    this.turn++;
    this.cardsThisTurn = 0;
    const first = this.turn === 1;
    if (!first && !has(this.player, 'retain')) this.player.block = 0; // keep combat-start block on turn 1
    this.tickStartOfTurn(this.player);
    if (this.checkOver()) return;
    this.player.energy = this.maxEnergy;
    if (first) { this.raceCombatStart(); this.relicHook('combatStart'); } // start-of-combat after energy/no-clear
    this.raceTurnStart();
    this.relicHook('turnStart');
    this.draw(this.handSize);
    this.h.onTurnStart({ who: 'player', turn: this.turn });
  }

  endTurn() {
    if (this.over) return;
    // companion strikes at end of your turn
    const comp = amt(this.player, 'companion');
    if (comp > 0) { const liv = this.livingEnemies(); if (liv.length) this.attack(this.player, this.rng.pick(liv), comp + amt(this.player, 'focus')); }
    if (this.checkOver()) return;
    this.relicHook('turnEnd');
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
      advanceBoss(this.rng, e);   // boss phase check (no-op for normal enemies)
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
      this.hand.push(c); this.h.onDraw(c);
    }
  }

  canPlay(card, targetUid) {
    if (this.over || !card || card.unplayable) return false;
    if (card.cost > this.player.energy) return false;
    if (card.target === 'enemy') return !!this.enemies.find((e) => e.uid === targetUid && e.hp > 0);
    return true;
  }

  play(uid, targetUid) {
    const idx = this.hand.findIndex((c) => c.uid === uid);
    if (idx < 0) return false;
    const card = this.hand[idx];
    if (!this.canPlay(card, targetUid)) return false;
    this.player.energy -= card.cost;
    this.hand.splice(idx, 1);
    this.cardsThisTurn++;
    this.relicHook('playCard', card);
    this.h.onPlayCard({ card, targetUid });
    const target = this.enemies.find((e) => e.uid === targetUid) || null;
    for (const op of card.effects || []) this.runOp(op, card, target);
    (card.exhaust ? this.exhaustPile : this.discardPile).push(card);
    this.checkOver();
    return true;
  }

  runOp(op, card, target) {
    switch (op.k) {
      case 'damage': {
        const base = this.resolveVal(op.amount);
        const times = op.times || 1;
        let tgts;
        if (op.target === 'random') { const liv = this.livingEnemies(); tgts = liv.length ? [this.rng.pick(liv)] : []; }
        else if (card.target === 'all') tgts = this.livingEnemies();
        else tgts = [target].filter(Boolean);
        for (const t of tgts) for (let i = 0; i < times && t.hp > 0; i++) this.attack(this.player, t, base, { spell: card.spell });
        break;
      }
      case 'block': this.gainBlock(this.player, this.resolveVal(op.amount)); break;
      case 'heal': this.heal(this.player, this.resolveVal(op.amount)); break;
      case 'selfDamage': this.player.hp = Math.max(0, this.player.hp - op.amount);
        this.h.onDamage({ target: this.player, amount: op.amount, raw: op.amount, attacker: null, self: true }); this.checkOver(); break;
      case 'draw': this.draw(op.amount); break;
      case 'energy': this.player.energy += op.amount; break;
      case 'status': {
        const n = this.resolveVal(op.amount);
        if (op.to === 'self') this.applyStatus(this.player, op.status, n);
        else if (card.target === 'all') this.livingEnemies().forEach((e) => this.applyStatus(e, op.status, n));
        else if (target) this.applyStatus(target, op.status, n);
        break;
      }
      case 'addCard': { const cnt = op.count || 1; const pile = op.to === 'draw' ? this.drawPile : op.to === 'discard' ? this.discardPile : this.hand;
        for (let i = 0; i < cnt; i++) { if (pile === this.hand && this.hand.length >= 10) break; pile.push(instantiate(op.id)); } break; }
      case 'random': { const choice = this.rng.pick(op.options); [].concat(choice).forEach((o) => this.runOp(o, card, target)); break; }
    }
  }

  resolveVal(spec) {
    if (typeof spec === 'number') return spec;
    if (spec && typeof spec === 'object') {
      let v = spec.base || 0;
      if (spec.scale) v += (spec.scale.per || 1) * amt(this.player, spec.scale.stat);
      if (spec.perCombo) v += spec.perCombo * this.cardsThisTurn;
      return Math.max(0, Math.floor(v));
    }
    return 0;
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
    this.applyDamage(target, dmg, attacker);
    if (attacker === this.player && target !== this.player) {
      if (this._fangPending) { addStatus(target, 'poison', this._fangPending); this._fangPending = 0; }
      if (this.race === 'tiefling' && this.relics.length) addStatus(target, 'poison', 1);
      if (this.race === 'halfling' && this.rng.chance(0.15)) this.draw(1);
    }
    this.h.onDamage({ target, amount: dmg, raw: dmg, attacker });
    if (target.hp <= 0) this.h.onDeath({ target });
    return dmg;
  }

  applyDamage(target, dmg, attacker) {
    if (target === this.player) {
      if (this.race === 'goliath' && !this.stoneskinUsed && dmg >= 12) { dmg = Math.floor(dmg / 2); this.stoneskinUsed = true; }
      if (this.relics.includes('shieldbearer') && !this._bigHitUsed && dmg >= 12) { dmg = Math.floor(dmg / 2); this._bigHitUsed = true; }
    }
    let rem = dmg;
    if (target.block > 0) { const a = Math.min(target.block, rem); target.block -= a; rem -= a; }
    target.hp = Math.max(0, target.hp - rem);
    if (target === this.player && attacker && attacker !== this.player && rem > 0 && this.relics.includes('thorned_mail')) {
      attacker.hp = Math.max(0, attacker.hp - 2);
    }
    return dmg;
  }

  gainBlock(e, base) {
    let b = base + (e.isPlayer ? amt(e, 'dexterity') : 0);
    if (e.isPlayer && this.race === 'dwarf' && base > 0) b += 2;
    if (has(e, 'frail')) b = Math.floor(b * 0.75);
    b = Math.max(0, b); e.block += b;
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
    const times = it.times || 1;
    if (it.type === 'attack') for (let i = 0; i < times; i++) this.attack(e, this.player, it.amount);
    else if (it.type === 'block') this.gainBlock(e, it.amount);
    else if (it.type === 'buff') this.applyStatus(e, it.status, it.amount);
    else if (it.type === 'debuff') this.applyStatus(this.player, it.status, it.amount);
  }

  /* ---------------- relics / potions / race ---------------- */
  relicHook(name, ...args) { for (const id of this.relics) { const fn = RELICS[id]?.hooks?.[name]; if (fn) fn(this, ...args); } }
  usePotion(idx) {
    const id = this.potions[idx]; if (!id || this.over) return false;
    this.potions.splice(idx, 1); POTIONS[id]?.use(this); this.checkOver(); return true;
  }
  raceCombatStart() { if (this.race === 'dragonborn') this.applyStatus(this.player, 'breath', 1); }
  raceTurnStart() {
    if (this.race === 'elf' && amt(this.player, 'focus') < 5) this.applyStatus(this.player, 'focus', 1);
    if (this.race === 'halforc' && this.turn % 3 === 0) this.applyStatus(this.player, 'strength', 1);
  }

  /* ---------------- queries ---------------- */
  livingEnemies() { return this.enemies.filter((e) => e.hp > 0); }

  checkOver() {
    if (this.over) return true;
    if (this.player.hp <= 0) { this.over = true; this.result = 'lose'; this.relicHook('combatEnd'); this.h.onEnd({ result: 'lose' }); return true; }
    if (this.livingEnemies().length === 0) { this.over = true; this.result = 'win'; this.relicHook('combatEnd'); this.h.onEnd({ result: 'win' }); return true; }
    return false;
  }

  validPlays() {
    const out = [];
    for (const c of this.hand) {
      if (c.unplayable || c.cost > this.player.energy) continue;
      if (c.target === 'enemy') for (const e of this.livingEnemies()) out.push({ uid: c.uid, targetUid: e.uid });
      else out.push({ uid: c.uid, targetUid: null });
    }
    return out;
  }

  snapshot() {
    return {
      turn: this.turn, over: this.over, result: this.result, cardsThisTurn: this.cardsThisTurn,
      relics: this.relics.slice(), potions: this.potions.slice(),
      player: { hp: this.player.hp, maxHp: this.player.maxHp, block: this.player.block, energy: this.player.energy, statuses: { ...this.player.statuses } },
      enemies: this.enemies.map((e) => ({ uid: e.uid, name: e.name, emoji: e.emoji, hp: e.hp, maxHp: e.maxHp, block: e.block, statuses: { ...e.statuses }, intent: e.intent, boss: !!e.boss, phase: e.phase })),
      hand: this.hand.map((c) => ({ uid: c.uid, id: c.id, name: c.name, cost: c.cost, type: c.type, target: c.target, text: c.text, spell: c.spell, unplayable: c.unplayable })),
      piles: { draw: this.drawPile.length, discard: this.discardPile.length, exhaust: this.exhaustPile.length },
    };
  }
}
