// Settings + accessibility prefs, persisted to localStorage and applied globally.

import { el, mount, screen } from './ui.js';
import { Audio } from './audio.js';

const KEY = 'mournwood_settings_v1';
const DEFAULTS = { sfx: 80, music: 70, muted: false, reduce: false, animSpeed: 1, textLarge: false, colorblind: false };
let S = read();

function read() { try { return { ...DEFAULTS, ...(JSON.parse(localStorage.getItem(KEY)) || {}) }; } catch (_) { return { ...DEFAULTS }; } }
function persist() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (_) {} }

export function settings() { return S; }

export function applySettings() {
  Audio.setMuted(S.muted);
  if (window.gsap) window.gsap.globalTimeline.timeScale(S.reduce ? 100 : S.animSpeed);
  document.body.classList.toggle('reduce-motion', S.reduce);
  document.body.classList.toggle('text-lg', S.textLarge);
  document.body.classList.toggle('cb', S.colorblind);
}
function set(k, v) { S[k] = v; persist(); applySettings(); }

export function openSettings(onBack) {
  function render() {
    const s = screen('settings');
    const slider = (label, key) => el('label.set-row', {}, [
      el('span', {}, label),
      el('input', { type: 'range', min: 0, max: 100, value: S[key], oninput: (e) => { set(key, +e.target.value); valEl.textContent = S[key]; } }),
      (valEl = el('span.set-val', {}, String(S[key]))),
    ]);
    let valEl;
    const toggle = (label, key) => {
      const cb = el('input', { type: 'checkbox' }); cb.checked = !!S[key];
      cb.addEventListener('change', () => set(key, cb.checked));
      return el('label.set-row.toggle', {}, [el('span', {}, label), cb]);
    };
    const speed = el('div.set-row', {}, [
      el('span', {}, 'Animation speed'),
      el('div.seg', {}, [0.5, 1, 2].map((v) => el('button.seg-btn' + (S.animSpeed === v ? '.on' : ''),
        { onclick: () => { set('animSpeed', v); render(); } }, v + '×'))),
    ]);
    s.append(
      el('header.screen-head', {}, [el('h1', {}, 'Settings'), el('button.btn.btn-ghost.back', { dataset: { testid: 'btn-settings-back' }, onclick: onBack }, '‹ Back')]),
      el('div.scroll', {}, [
        el('div.section-label', {}, 'Audio'),
        slider('Sound effects', 'sfx'), slider('Music', 'music'), toggle('Mute all', 'muted'),
        el('div.section-label', {}, 'Motion & Display'),
        speed, toggle('Reduced motion', 'reduce'), toggle('Larger text', 'textLarge'), toggle('Colour-blind safe', 'colorblind'),
        el('div.section-label', {}, 'About'),
        el('p.blurb', { style: { padding: '0 .4rem' } }, 'Mournwood — a dark-arcane roguelite. Uses SRD 5.1 (CC-BY-4.0) flavour, game-icons.net (CC-BY-3.0), Cinzel & Inter fonts, and CC0/attributed audio. See README.'),
      ]),
    );
    mount(s);
    window.__gameState = { screen: 'settings' };
  }
  render();
}
