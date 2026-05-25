// Overworld map: free top-down movement via a virtual joystick, camera follow,
// world-bounds collision, and proximity "walk up to interact". DOM-rendered world
// transformed by the camera. Exposes window.__map for headless testing.

import { el, mount, screen } from '../ui.js';
import { bossUnlocked } from '../run.js';
import { iconEl } from '../icons.js';
import { artOrFallback } from '../art.js';

const POI_ICON = { hub:'hub', combat:'combat', elite:'skeleton', shop:'shop', rest:'rest', event:'event', ward:'ward', boss:'boss', treasure:'chest' };
const SVGNS = 'http://www.w3.org/2000/svg';

const SPEED = 270;          // px / second
const INTERACT_R = 82;
const DEAD = 0.16;

let run, onNode, onMenu;
let world, hero, viewport, knob, interactBtn, hudHp, hudGold;
let raf = 0, last = 0, active = false;
let vec = { x: 0, y: 0 };       // from joystick / keys
let keys = {};
let near = null;
let cam = { x: 0, y: 0 };
let vw = 0, vh = 0;

export function openMap(theRun, handlers) {
  run = theRun; onNode = handlers.onNode; onMenu = handlers.onMenu;
  build();
  active = true; last = 0;
  raf = requestAnimationFrame(loop);
  exposeDebug();
}

function build() {
  const s = screen('map-screen');
  const R = run.region;

  world = el('div.world', { style: { width: R.W + 'px', height: R.H + 'px' } });

  // biome bands (bottom→top: town → woods → ruins)
  world.appendChild(el('div.band.town',  { style: { top: (R.H * 0.66) + 'px', height: (R.H * 0.34) + 'px' } }));
  world.appendChild(el('div.band.woods', { style: { top: (R.H * 0.30) + 'px', height: (R.H * 0.36) + 'px' } }));
  world.appendChild(el('div.band.ruins', { style: { top: '0px', height: (R.H * 0.30) + 'px' } }));

  // the trail: a dashed line through the main POIs (bottom→top)
  const trailPts = R.pois.filter((p) => p.type !== 'treasure').slice().sort((a, b) => b.y - a.y)
    .map((p) => `${p.x},${p.y}`).join(' ');
  const svg = document.createElementNS(SVGNS, 'svg');
  svg.setAttribute('class', 'trail'); svg.setAttribute('width', R.W); svg.setAttribute('height', R.H);
  svg.setAttribute('viewBox', `0 0 ${R.W} ${R.H}`);
  const poly = document.createElementNS(SVGNS, 'polyline');
  poly.setAttribute('points', trailPts); poly.setAttribute('class', 'trail-line');
  svg.appendChild(poly); world.appendChild(svg);

  // decorative scenery (non-colliding), behind POIs
  for (const sc of R.scenery || []) {
    const veg = sc.type === 'tree' || sc.type === 'pine';
    world.appendChild(el('div.prop.' + (veg ? 'veg' : 'stone'), {
      style: { left: sc.x + 'px', top: sc.y + 'px', opacity: String(sc.dim),
        transform: `translate(-50%,-88%) scale(${sc.scale})` } }, iconEl(sc.type)));
  }

  // POIs
  for (const p of R.pois) {
    const cleared = !!run.cleared[p.id];
    const locked = p.type === 'boss' && !bossUnlocked(run);
    const node = el('div.poi' + (cleared ? '.cleared' : '') + (locked ? '.locked' : ''),
      { dataset: { id: p.id, type: p.type }, style: { left: p.x + 'px', top: p.y + 'px' } }, [
        el('div.poi-icon', {}, iconEl(locked ? 'lock' : (POI_ICON[p.type] || 'dot'))),
        el('div.poi-name', {}, p.name),
      ]);
    world.appendChild(node);
  }
  hero = el('div.hero', { style: { left: run.pos.x + 'px', top: run.pos.y + 'px' } },
    [artOrFallback(`assets/portraits/hero-${run.cls}.webp`, iconEl(run.cls))]);
  world.appendChild(hero);

  viewport = el('div.viewport', {}, [world]);

  // HUD
  hudHp = el('span.hud-hp', { dataset: { testid: 'hud-hp' } }, [iconEl('heart'), el('span.val', {}, `${run.hp}/${run.maxHp}`)]);
  hudGold = el('span.hud-gold', {}, [iconEl('coin'), el('span.val', {}, `${run.gold}`)]);
  const hud = el('div.map-hud', {}, [
    el('div.hud-left', {}, [hudHp, hudGold]),
    el('button.btn.btn-ghost.hud-menu', { dataset: { testid: 'btn-menu' }, onclick: leaveTo(onMenu) }, iconEl('menu')),
  ]);

  // joystick
  knob = el('div.joy-knob');
  const joy = el('div.joystick', { dataset: { testid: 'joystick' } }, [knob]);
  bindJoystick(joy);

  // interact button (hidden until near a node)
  interactBtn = el('button.btn.btn-primary.interact', { dataset: { testid: 'btn-interact' },
    onclick: doInteract }, 'Enter');
  interactBtn.style.display = 'none';

  s.append(viewport, hud, el('div.map-controls', {}, [joy, interactBtn]));
  mount(s);

  vw = viewport.clientWidth; vh = viewport.clientHeight;
  bindKeys();
  syncHud();
}

/* ---------------- loop ---------------- */
function loop(ts) {
  if (!active) return;
  const dt = last ? Math.min(0.05, (ts - last) / 1000) : 0.016; last = ts;
  // input vector: joystick or keys
  let ix = vec.x, iy = vec.y;
  if (keys.ArrowLeft || keys.a) ix = -1; if (keys.ArrowRight || keys.d) ix = 1;
  if (keys.ArrowUp || keys.w) iy = -1; if (keys.ArrowDown || keys.s) iy = 1;
  const mag = Math.hypot(ix, iy);
  if (mag > 0.001) {
    const nx = ix / Math.max(1, mag), ny = iy / Math.max(1, mag);
    let x = parseFloat(hero.style.left) + nx * SPEED * dt;
    let y = parseFloat(hero.style.top) + ny * SPEED * dt;
    const r = run.region.heroR;
    x = Math.max(r, Math.min(run.region.W - r, x));
    y = Math.max(r, Math.min(run.region.H - r, y));
    hero.style.left = x + 'px'; hero.style.top = y + 'px';
    run.pos.x = x; run.pos.y = y;
  }
  // camera follow + clamp
  cam.x = clamp(run.pos.x - vw / 2, 0, Math.max(0, run.region.W - vw));
  cam.y = clamp(run.pos.y - vh / 2, 0, Math.max(0, run.region.H - vh));
  world.style.transform = `translate(${-cam.x}px, ${-cam.y}px)`;
  updateNear();
  raf = requestAnimationFrame(loop);
}
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

function updateNear() {
  let best = null, bd = INTERACT_R;
  for (const p of run.region.pois) {
    if (p.type === 'hub') continue;
    if (run.cleared[p.id]) continue;
    const d = Math.hypot(p.x - run.pos.x, p.y - run.pos.y);
    if (d < bd) { bd = d; best = p; }
  }
  if (best !== near) {
    near = best;
    if (near) {
      const locked = near.type === 'boss' && !bossUnlocked(run);
      interactBtn.textContent = locked ? 'Sealed' : interactLabel(near.type);
      interactBtn.style.display = '';
      interactBtn.classList.toggle('disabled', locked);
    } else interactBtn.style.display = 'none';
    syncDebug();
  }
}
function interactLabel(t) { return ({ combat: 'Fight', elite: 'Fight Elite', shop: 'Trade', rest: 'Rest', event: 'Investigate', ward: 'Enter', boss: 'Confront', treasure: 'Open' })[t] || 'Enter'; }

function doInteract() {
  if (!near) return;
  if (near.type === 'boss' && !bossUnlocked(run)) { toast('The Sanctum is sealed. Recover the Ward-Stone.'); return; }
  leave();
  onNode(near);
}

/* ---------------- joystick ---------------- */
function bindJoystick(joy) {
  let id = null, cx = 0, cy = 0, R = 46;
  const start = (e) => {
    const t = (e.touches ? e.touches[0] : e); id = e.pointerId ?? 0;
    const rect = joy.getBoundingClientRect(); cx = rect.left + rect.width / 2; cy = rect.top + rect.height / 2;
    move(e); e.preventDefault();
  };
  const move = (e) => {
    if (id === null) return;
    const t = (e.touches ? e.touches[0] : e);
    let dx = t.clientX - cx, dy = t.clientY - cy;
    const d = Math.hypot(dx, dy);
    if (d > R) { dx = dx / d * R; dy = dy / d * R; }
    knob.style.transform = `translate(${dx}px, ${dy}px)`;
    let nx = dx / R, ny = dy / R;
    if (Math.hypot(nx, ny) < DEAD) { nx = 0; ny = 0; }
    vec.x = nx; vec.y = ny;
  };
  const end = () => { id = null; vec.x = 0; vec.y = 0; knob.style.transform = 'translate(0,0)'; };
  joy.addEventListener('pointerdown', start);
  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', end);
  joy._cleanup = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', end); };
  map_joyCleanup = joy._cleanup;
}
let map_joyCleanup = null;

function bindKeys() {
  keyHandler = (down) => (e) => { keys[e.key] = down; };
  kd = keyHandler(true); ku = keyHandler(false);
  window.addEventListener('keydown', kd); window.addEventListener('keyup', ku);
}
let keyHandler, kd, ku;

/* ---------------- lifecycle ---------------- */
function leave() {
  active = false; cancelAnimationFrame(raf);
  window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku);
  if (map_joyCleanup) map_joyCleanup();
  keys = {}; vec = { x: 0, y: 0 };
}
function leaveTo(fn) { return () => { leave(); fn && fn(); }; }

/* ---------------- HUD / debug / toast ---------------- */
function syncHud() {
  const h = hudHp && hudHp.querySelector('.val'); if (h) h.textContent = `${run.hp}/${run.maxHp}`;
  const g = hudGold && hudGold.querySelector('.val'); if (g) g.textContent = `${run.gold}`;
}

function toast(msg) {
  const t = el('div.toast', {}, msg);
  document.getElementById('fx-layer').appendChild(t);
  if (window.gsap) { window.gsap.fromTo(t, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.25 }); window.gsap.to(t, { opacity: 0, duration: 0.4, delay: 1.8, onComplete: () => t.remove() }); }
  else setTimeout(() => t.remove(), 2000);
}

function syncDebug() {
  window.__gameState = { screen: 'map', pos: { ...run.pos }, near: near ? near.id : null,
    cleared: Object.keys(run.cleared), gold: run.gold, hp: run.hp, bossUnlocked: bossUnlocked(run) };
}

function exposeDebug() {
  window.__map = {
    setVec: (x, y) => { vec.x = x; vec.y = y; },
    pos: () => ({ ...run.pos }),
    near: () => (near ? near.id : null),
    teleport: (x, y) => { hero.style.left = x + 'px'; hero.style.top = y + 'px'; run.pos.x = x; run.pos.y = y; },
    interact: () => doInteract(),
    poi: (id) => run.region.pois.find((p) => p.id === id),
  };
  syncDebug();
}
