// Save-slot picker. mode 'new' (choose/overwrite a slot for a fresh run) or
// 'load' (resume an existing run). Delete available in load mode.

import { el, mount, screen } from '../ui.js';
import { slotSummaries, clearSlot } from '../save.js';

export function openSaves(mode, { onPick, onBack, allowDelete }) {
  function render() {
    const s = screen('saves');
    const rows = slotSummaries().map((sm) => {
      const selectable = mode === 'new' ? true : !sm.empty;
      const info = sm.empty ? 'Empty' : `${sm.name} · ${sm.mode} · ❤ ${sm.hp}/${sm.maxHp} · ${sm.progress}`;
      const action = el('button.btn' + (sm.empty ? '' : '.btn-primary'),
        { disabled: !selectable, dataset: { testid: `slot-${sm.i}` }, onclick: () => onPick(sm.i) },
        sm.empty ? (mode === 'new' ? '＋ Start here' : 'Empty') : (mode === 'new' ? 'Overwrite' : 'Continue'));
      const row = el('div.slot-row', {}, [
        el('div.slot-info', {}, [el('b', {}, `Slot ${sm.i + 1}`), el('span.blurb', {}, info)]),
        action,
      ]);
      if (allowDelete && !sm.empty) row.append(
        el('button.btn.btn-ghost.slot-del', { title: 'Delete', dataset: { testid: `del-${sm.i}` },
          onclick: () => { clearSlot(sm.i); render(); } }, '✕'));
      return row;
    });
    s.append(
      el('header.screen-head', {}, [
        el('h1', {}, mode === 'new' ? 'Choose a Save Slot' : 'Continue'),
        el('button.btn.btn-ghost.back', { dataset: { testid: 'btn-saves-back' }, onclick: onBack }, '‹ Back'),
      ]),
      el('div.scroll', {}, rows),
    );
    mount(s);
    window.__gameState = { screen: 'saves' };
  }
  render();
}
