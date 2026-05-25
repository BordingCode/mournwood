// GSAP juice helpers (DOM). Sparse, GPU-friendly (transform/opacity). Degrades
// gracefully if GSAP is missing or the user prefers reduced motion.

const g = () => window.gsap;
const reduced = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const fxLayer = () => document.getElementById('fx-layer');

/** Floating combat number anchored to an element's center. */
export function floatText(targetEl, text, { color = '#fff', up = 60 } = {}) {
  if (!targetEl) return;
  const r = targetEl.getBoundingClientRect();
  const n = document.createElement('div');
  n.className = 'float-num';
  n.textContent = text;
  n.style.left = r.left + r.width / 2 + 'px';
  n.style.top = r.top + r.height * 0.35 + 'px';
  n.style.color = color;
  fxLayer().appendChild(n);
  if (g() && !reduced()) {
    g().fromTo(n, { y: 0, opacity: 0, scale: 0.6 },
      { y: -up, opacity: 1, scale: 1.15, duration: 0.22, ease: 'back.out(2)' });
    g().to(n, { opacity: 0, y: -up - 24, duration: 0.5, delay: 0.32, ease: 'power1.in',
      onComplete: () => n.remove() });
  } else { setTimeout(() => n.remove(), 600); }
}

export function shake(el, mag = 7) {
  if (!el || !g() || reduced()) return;
  g().fromTo(el, { x: 0 }, { x: 0, duration: 0.28, ease: 'power2.out',
    keyframes: { x: [-mag, mag, -mag * 0.6, mag * 0.5, 0] } });
}

export function hitFlash(el) {
  if (!el || !g() || reduced()) return;
  g().fromTo(el, { filter: 'brightness(2.2) saturate(1.4)' },
    { filter: 'brightness(1) saturate(1)', duration: 0.32, ease: 'power2.out' });
  g().fromTo(el, { x: -6 }, { x: 0, duration: 0.3, ease: 'elastic.out(1,0.4)' });
}

export function bump(el, s = 1.08) {
  if (!el || !g() || reduced()) { return; }
  g().fromTo(el, { scale: 0.92 }, { scale: 1, duration: 0.28, ease: 'back.out(2.5)' });
}

/** Stagger-in newly dealt hand cards. */
export function dealIn(cards) {
  if (!g() || reduced()) return;
  g().fromTo(cards, { y: 28, opacity: 0, rotateZ: -4 },
    { y: 0, opacity: 1, rotateZ: 0, duration: 0.32, stagger: 0.05, ease: 'back.out(1.7)' });
}

export function screenShake(mag = 5) { shake(document.getElementById('app'), mag); }

/** A burst of sparks from an element's centre (hit / block / heal / death). */
export function burst(targetEl, { color = '#ff7a5a', n = 10, spread = 48, size = 6 } = {}) {
  if (!targetEl || reduced()) return;
  const r = targetEl.getBoundingClientRect();
  const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  const layer = fxLayer();
  for (let i = 0; i < n; i++) {
    const p = document.createElement('div');
    p.className = 'spark';
    p.style.cssText = `left:${cx}px;top:${cy}px;width:${size}px;height:${size}px;background:${color};box-shadow:0 0 8px ${color}`;
    layer.appendChild(p);
    const a = Math.random() * Math.PI * 2, d = spread * (0.35 + Math.random() * 0.85);
    if (g()) g().to(p, { x: Math.cos(a) * d, y: Math.sin(a) * d - spread * 0.2, opacity: 0, scale: 0.3,
      duration: 0.42 + Math.random() * 0.3, ease: 'power2.out', onComplete: () => p.remove() });
    else setTimeout(() => p.remove(), 650);
  }
}
