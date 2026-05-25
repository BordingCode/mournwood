import test from 'node:test';
import assert from 'node:assert/strict';
import { Combat } from '../js/combat.js';
import { RNG } from '../js/rng.js';

const mk = (deck = ['strike','strike','strike','strike','strike']) => {
  const c = new Combat({ rng: new RNG(1), player: { maxHp: 80, deck }, enemyIds: ['goblin'] });
  return c.start();
};

test('attack deals base damage', () => {
  const c = mk(); const e = c.enemies[0]; const hp = e.hp;
  assert.equal(c.attack(c.player, e, 6), 6);
  assert.equal(e.hp, hp - 6);
});

test('vulnerable amplifies attack damage 50%', () => {
  const c = mk(); c.applyStatus(c.enemies[0], 'vulnerable', 1);
  assert.equal(c.computeDamage(c.player, c.enemies[0], 6), 9);
});

test('weak reduces dealt damage 25%', () => {
  const c = mk(); c.applyStatus(c.player, 'weak', 1);
  assert.equal(c.computeDamage(c.player, c.enemies[0], 8), 6);
});

test('strength adds to all attacks', () => {
  const c = mk(); c.applyStatus(c.player, 'strength', 3);
  assert.equal(c.computeDamage(c.player, c.enemies[0], 6), 9);
});

test('spellpower adds to spells only', () => {
  const c = mk(); c.applyStatus(c.player, 'spellpower', 2);
  assert.equal(c.computeDamage(c.player, c.enemies[0], 5, { spell: true }), 7);
  assert.equal(c.computeDamage(c.player, c.enemies[0], 5), 5);
});

test('block absorbs before HP', () => {
  const c = mk(); const e = c.enemies[0]; e.block = 4; const hp = e.hp;
  c.attack(c.player, e, 6);
  assert.equal(e.block, 0);
  assert.equal(e.hp, hp - 2);
});

test('frail reduces block gained 25%', () => {
  const c = mk(); c.applyStatus(c.player, 'frail', 1); c.player.block = 0;
  c.gainBlock(c.player, 8);
  assert.equal(c.player.block, 6);
});

test('poison damages and decays at turn start', () => {
  const c = mk(); const e = c.enemies[0]; c.applyStatus(e, 'poison', 5); const hp = e.hp;
  c.tickStartOfTurn(e);
  assert.equal(e.hp, hp - 5);
  assert.equal(e.statuses.poison, 4);
});

test('draw reshuffles discard when draw pile empty', () => {
  const c = mk(['strike','defend']);
  c.discardPile.push(...c.hand.splice(0));
  c.drawPile = [];
  c.draw(2);
  assert.ok(c.hand.length >= 1);
});

test('hand never exceeds 10', () => {
  const c = mk(Array(20).fill('strike'));
  c.draw(20);
  assert.ok(c.hand.length <= 10);
});

test('combat ends in a win when enemies die', () => {
  const c = mk(); c.attack(c.player, c.enemies[0], 999); c.checkOver();
  assert.equal(c.over, true);
  assert.equal(c.result, 'win');
});

test('playing a card spends energy and applies effect', () => {
  const c = mk(); const e = c.enemies[0]; const hp = e.hp; const en = c.player.energy;
  const card = c.hand.find((x) => x.id === 'strike');
  assert.ok(card);
  assert.equal(c.play(card.uid, e.uid), true);
  assert.equal(c.player.energy, en - 1);
  assert.equal(e.hp, hp - 6);
});

test('cannot play a card without enough energy', () => {
  const c = mk(); c.player.energy = 0;
  const card = c.hand[0];
  assert.equal(c.play(card.uid, c.enemies[0].uid), false);
});
