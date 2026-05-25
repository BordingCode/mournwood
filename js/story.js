// Story system: a dialogue overlay, progress-keyed story beats, walk-up NPC allies,
// and a quest log. Beats fire as you clear the region; NPCs grant once-per-run perks.

import { el } from './ui.js';
import { iconEl } from './icons.js';

const fxLayer = () => document.getElementById('fx-layer');
const cleared = (run) => Object.keys(run.cleared || {}).length;

/* ---------------- dialogue overlay ---------------- */
export function showDialogue({ speaker = '', icon = 'npc', lines = [], choices = null }, onClose) {
  let i = 0;
  const textEl = el('div.dlg-text');
  const actions = el('div.dlg-actions');
  const ov = el('div.dialogue', { dataset: { testid: 'dialogue' } }, [
    el('div.dlg-box', {}, [
      el('div.dlg-head', {}, [el('div.dlg-portrait', {}, iconEl(icon)), el('div.dlg-name', {}, speaker)]),
      textEl, actions,
    ]),
  ]);
  function close() { ov.remove(); onClose && onClose(); }
  function render() {
    textEl.textContent = lines[i] || '';
    actions.replaceChildren();
    if (i < lines.length - 1) {
      actions.append(el('button.btn.btn-primary', { dataset: { testid: 'dlg-next' }, onclick: () => { i++; render(); } }, 'Next ›'));
    } else if (choices && choices.length) {
      for (const c of choices) actions.append(el('button.btn' + (c.primary ? '.btn-primary' : ''),
        { dataset: { testid: 'dlg-choice' }, onclick: () => { ov.remove(); c.go && c.go(); } }, c.label));
    } else {
      actions.append(el('button.btn.btn-primary', { dataset: { testid: 'dlg-continue' }, onclick: close }, 'Continue'));
    }
  }
  render();
  fxLayer().appendChild(ov);
}

/* ---------------- story beats (fire once, in order) ---------------- */
const BEATS = [
  { id: 'arrival', when: () => true, speaker: 'Elder Maren', icon: 'human', lines: [
    'Ash on the wind again — the Mournwood breathes it out like a sickness.',
    'The Ashen Hand gathers at the old chapel. Recover the Ward-Stone; it is the only key to their Sanctum.',
    'Go carefully. The wood remembers its dead.'] },
  { id: 'firstFight', when: (r) => cleared(r) >= 1, speaker: 'A Hearthvale Scout', icon: 'npc', lines: [
    'You cut them down like it was nothing — good.',
    'But there are more in the dark, and something worse leading them.'] },
  { id: 'midpoint', when: (r) => cleared(r) >= 4, speaker: '???', icon: 'cultist', lines: [
    '(A whisper coils up through the violet trees.)',
    '“Turn back, little spark. The Hollow has already tasted your name.”'] },
  { id: 'preBoss', when: (r) => r.flags && r.flags.wardStone, speaker: 'Elder Maren', icon: 'human', lines: [
    'The Ward-Stone hums in your pack — the Sanctum’s seal is broken.',
    'Whatever the High Priest has woken down there… end it. For all of us.'] },
];

/** Show the next un-seen beat whose condition holds (over the current screen). */
export function maybeBeat(run) {
  run.flags = run.flags || {}; run.flags.beats = run.flags.beats || {};
  const beat = BEATS.find((b) => !run.flags.beats[b.id] && b.when(run));
  if (beat) { run.flags.beats[beat.id] = true; showDialogue(beat); }
}

/* ---------------- NPC allies (once-per-run perks) ---------------- */
export const NPC_NAME = { bryn: 'Bryn', sable: 'Mother Sable', corvin: 'Corvin' };
const NPCS = {
  bryn: { name: 'Bryn, the Last Scout', icon: 'ranger',
    lines: ['You’re the one Maren sent? Hah — still breathing, so you’ll do.',
            'Here. A marked quarry never sees the second arrow coming.'],
    perkLabel: 'Accept Bryn’s gift', perk: (r) => { r.deck.push('ra_mark'); } },
  sable: { name: 'Mother Sable', icon: 'cleric',
    lines: ['Come, sit — the wood is cruel to the wounded.',
            'Let me close those cuts, and leave a little warmth in your blood for the road.'],
    perkLabel: 'Accept Sable’s blessing', perk: (r) => { r.hp = Math.min(r.maxHp, r.hp + 12); if (!r.relics.includes('bloodstone')) r.relics.push('bloodstone'); } },
  corvin: { name: 'Corvin, the Penitent', icon: 'cultist',
    lines: ['I wore their ash once. I know how the Priest thinks.',
            'Take this — strength enough to break him. But the doubt comes with it. It always does.'],
    perkLabel: 'Accept (gain Heavy Blow — and a curse)', perk: (r) => { r.deck.push('n_heavy_blow'); r.deck.push('ashen_doubt'); },
    altLabel: 'Refuse the gift' },
};

export function openNPC(run, id, { back }) {
  const npc = NPCS[id]; if (!npc) return back();
  run.flags = run.flags || {};
  const done = () => { run.flags['npc_' + id] = true; back(); }; // meeting an ally counts toward the rally quest
  const choices = [{ label: npc.perkLabel, primary: true, go: () => { npc.perk(run); done(); } }];
  if (npc.altLabel) choices.push({ label: npc.altLabel, go: done });
  showDialogue({ speaker: npc.name, icon: npc.icon, lines: npc.lines, choices });
}

/* ---------------- quest log ---------------- */
export function openQuestLog(run) {
  const quests = [
    { t: 'Recover the Ward-Stone from the Sunken Chapel', done: !!(run.flags && run.flags.wardStone) },
    { t: 'Breach the Sanctum and defeat the High Priest of Ash', done: !!run.cleared.boss },
    { t: 'Rally the folk of Aldermoor — find allies in the wood', done: ['bryn', 'sable', 'corvin'].some((n) => run.flags && run.flags['npc_' + n]) },
  ];
  const ov = el('div.qol-overlay', { dataset: { testid: 'questlog' } }, [
    el('header.screen-head', {}, [el('h1', {}, 'Quests'),
      el('button.btn.btn-ghost.back', { onclick: () => ov.remove() }, '✕ Close')]),
    el('div.scroll', {}, quests.map((q) => el('div.codex-row' + (q.done ? '.done' : ''), {}, [
      iconEl(q.done ? 'shield' : 'sword', 'big'), el('div', {}, [el('b', {}, (q.done ? '✓ ' : '') + q.t)]),
    ]))),
  ]);
  fxLayer().appendChild(ov);
}
