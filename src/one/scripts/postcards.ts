/* The postcards (spec v2 §3.6.4; review rows P2, P3, P5; Postcards.astro).

   The table (fine pointers, motion welcome). All cards lie on parallel planes (rotateZ only) and are
   stacked by z-index, so no plane can cut another. Hover picks a card up without passing through the
   card above it:
   1. if a card higher in the stack overlaps it, it first slides out of the overlap (the overlap's width
      plus 8 px, away from that card) and rises 8 px, still under its neighbour;
   2. once nothing overlaps it, its stacking changes (invisible at that moment);
   3. it rises (translateZ 60 px, scale 1.05), turns to about 0 deg and settles back over the overlap,
      now on top; its proof marks show and its neighbours lean away (-7 / +4.5 deg, 20 px apart).
   Every value moves on the ID card's ui spring (k 300, c 30). On leaving, the card settles onto the pile
   on the landing spring (zeta 0.75: one small overshoot) and stays on top: the last card touched is the
   top card, like real cards on a table.

   The large view. A click, a tap, Enter or Space grows the card into a modal <dialog> (the top layer
   gives the dimmed ground, focus containment and Escape) by a same-document view transition. There the
   ID card's engine (card3d.ts, tilt) swings it by a mouse drag and springs it back on release, and turns
   it on a click (the turn spring, no wobble past the face). Opening pushes one history step, so Back
   closes; Escape and a click outside close and go back that step; the card lands on top of the pile and
   focus returns to it. Reduced motion: no physics, no morph; the turn is a crossfade. */
import { initCards } from './card3d';
import { motion } from './bus';

type Sp = { x: number; v: number; to: number };
const UI: [number, number] = [300, 30];
const LAND: [number, number] = [120, 2 * 0.75 * Math.sqrt(120)];
const H = 1 / 240;
const sp = (): Sp => ({ x: 0, v: 0, to: 0 });
const step = (s: Sp, [k, c]: [number, number], h: number) => { s.v += (-k * (s.x - s.to) - c * s.v) * h; s.x += s.v * h; };
const still = (s: Sp, e: number) => Math.abs(s.x - s.to) < e && Math.abs(s.v) < e * 4;

type VT = { finished: Promise<void>; skipTransition(): void };
const vt = (f: () => void): VT | null => {
  const d = document as Document & { startViewTransition?: (f: () => void) => VT };
  if (motion() === 'reduced' || !d.startViewTransition) { f(); return null; }
  return d.startViewTransition(f);
};

export function initPostcards() {
  const table = document.querySelector<HTMLElement>('[data-pc-table]');
  const dlg = document.querySelector<HTMLDialogElement>('[data-pc-dialog]');
  if (!table || !dlg) return;
  const cards = [...table.querySelectorAll<HTMLElement>('[data-postcard]')];
  const rest = cards.map((c) => parseFloat(c.style.getPropertyValue('--rest')) || 0);
  const st = cards.map(() => ({ x: sp(), y: sp(), z: sp(), s: { ...sp(), x: 1, to: 1 }, r: sp(), land: false }));
  /* the stack, bottom to top: the landscape card starts on top, as laid out */
  const stack = cards.map((_, i) => i).sort((a, b) => +cards[a].classList.contains('land') - +cards[b].classList.contains('land'));
  const order = () => stack.forEach((i, k) => cards[i].style.setProperty('--z', String(k + 1)));
  order();

  /* ---------- the table ---------- */
  let raf = 0, last = 0, acc = 0, up = -1, phase = 0;
  const live = () => motion() !== 'reduced' && matchMedia('(hover: hover) and (pointer: fine)').matches;
  const raise = (i: number) => { stack.splice(stack.indexOf(i), 1); stack.push(i); order(); };
  const draw = () => cards.forEach((c, i) => {
    const s = st[i];
    c.style.setProperty('--x', `${s.x.x.toFixed(2)}px`);
    c.style.setProperty('--y', `${s.y.x.toFixed(2)}px`);
    c.style.setProperty('--tz', `${s.z.x.toFixed(2)}px`);
    c.style.setProperty('--s', s.s.x.toFixed(4));
    c.style.setProperty('--r', `${s.r.x.toFixed(3)}deg`);
  });
  const lift = (i: number) => {
    const s = st[i];
    s.land = false;
    s.x.to = 0; s.y.to = -10; s.z.to = 60; s.s.to = 1.05; s.r.to = -rest[i] * 0.9;
    /* the neighbours lean away */
    if (i > 0) { const n = st[i - 1]; n.land = false; n.r.to = -7 - rest[i - 1]; n.x.to = -20; }
    if (i < cards.length - 1) { const n = st[i + 1]; n.land = false; n.r.to = 4.5 - rest[i + 1]; n.x.to = 20; }
    cards[i].classList.add('is-up');
  };
  const frame = (t: number) => {
    acc += Math.min(0.05, (t - last) / 1000); last = t;
    while (acc >= H) {
      acc -= H;
      st.forEach((s) => { const k = s.land ? LAND : UI; step(s.x, k, H); step(s.y, k, H); step(s.z, k, H); step(s.s, k, H); step(s.r, k, H); });
    }
    /* phase 1 ends as the card clears the overlap (the last 8 px are margin): its stacking changes, then it
       rises (phase 2) */
    if (phase === 1 && up >= 0 && Math.abs(st[up].x.x) >= Math.abs(st[up].x.to) - 8) { phase = 2; raise(up); lift(up); }
    draw();
    const moving = phase === 1 || st.some((s) => !(still(s.x, 0.05) && still(s.y, 0.05) && still(s.z, 0.05) && still(s.s, 0.0005) && still(s.r, 0.01)));
    if (moving) raf = requestAnimationFrame(frame);
    else { raf = 0; st.forEach((s) => { for (const k of [s.x, s.y, s.z, s.s, s.r]) { k.x = k.to; k.v = 0; } }); draw(); }
  };
  const kick = () => { if (!raf) { last = performance.now(); acc = 0; raf = requestAnimationFrame(frame); } };

  const pick = (i: number) => {
    if (!live() || up === i) return;
    if (up >= 0) drop(up);
    up = i;
    const me = cards[i].getBoundingClientRect(), pos = stack.indexOf(i);
    /* the nearest card above this one in the stack that overlaps it */
    let best: { w: number; dir: number } | null = null;
    for (const j of stack.slice(pos + 1)) {
      const o = cards[j].getBoundingClientRect();
      const w = Math.min(me.right, o.right) - Math.max(me.left, o.left);
      if (w > 0 && (!best || w > best.w)) best = { w, dir: me.left + me.width / 2 < o.left + o.width / 2 ? -1 : 1 };
    }
    if (best) {
      phase = 1;
      const s = st[i];
      s.land = false; s.x.to = best.dir * (best.w + 8); s.y.to = -8;
    } else { phase = 2; raise(i); lift(i); }
    kick();
  };
  const drop = (i: number) => {
    if (phase === 1 && up === i) raise(i);   // it was on its way out: it still ends on top
    phase = 0;
    if (up === i) up = -1;
    cards[i].classList.remove('is-up');
    for (const j of [i - 1, i, i + 1]) {
      const s = st[j];
      if (!s) continue;
      s.land = j === i;
      s.x.to = 0; s.y.to = 0; s.z.to = 0; s.s.to = 1; s.r.to = 0;
    }
    kick();
  };
  cards.forEach((c, i) => {
    c.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') pick(i); });
    c.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse' && up === i) drop(i); });
  });

  /* ---------- the large view ---------- */
  const stage = dlg.querySelector<HTMLElement>('[data-big-stage]')!;
  let open: HTMLElement | null = null, busy: VT | null = null, pushed = false;
  const show = (pc: HTMLElement) => {
    if (busy) { busy.skipTransition(); busy = null; }
    const i = cards.indexOf(pc);
    if (up === i) drop(i);
    const tpl = pc.querySelector<HTMLTemplateElement>('template[data-big]')!;
    pc.classList.add('is-hero');
    busy = vt(() => {
      pc.classList.remove('is-hero');
      pc.classList.add('is-out');
      stage.replaceChildren(tpl.content.cloneNode(true));
      if (!dlg.open) dlg.showModal();
      open = pc;
      const big = stage.querySelector<HTMLElement>('[data-big-card]')!;
      big.classList.add('is-hero');
      initCards(stage);
      big.querySelector<HTMLElement>('[data-turn]')?.focus({ preventScroll: true });
    });
    const named = () => stage.querySelector('[data-big-card]')?.classList.remove('is-hero');
    if (busy) busy.finished.finally(() => { busy = null; named(); }); else named();
    if (!pushed) { history.pushState({ ...(history.state || {}), postcard: i }, ''); pushed = true; }
  };
  const hide = (fromHistory = false) => {
    const pc = open;
    if (!pc) return;
    if (busy) { busy.skipTransition(); busy = null; }
    const big = stage.querySelector<HTMLElement>('[data-big-card]');
    /* the large card returns face up, so the morph lands on the photograph */
    big?.classList.add('is-hero');
    const body = big?.querySelector<HTMLElement>('[data-card-body]');
    if (body) body.style.transform = '';
    big?.classList.remove('is-flipped');
    big?.querySelectorAll<HTMLElement>('[data-face]').forEach((f, k) => { f.style.opacity = k ? '0' : '1'; });
    busy = vt(() => {
      dlg.close();
      stage.replaceChildren();
      pc.classList.remove('is-out');
      pc.classList.add('is-hero');
      raise(cards.indexOf(pc));
      open = null;
    });
    const done = () => { pc.classList.remove('is-hero'); busy = null; pc.querySelector<HTMLElement>('.pc-open')?.focus({ preventScroll: true }); };
    if (busy) busy.finished.finally(done); else done();
    if (pushed && !fromHistory) { pushed = false; history.back(); } else pushed = false;
  };
  for (const pc of cards) pc.querySelector('.pc-open')?.addEventListener('click', () => show(pc));
  dlg.addEventListener('cancel', (e) => { e.preventDefault(); hide(); });
  dlg.addEventListener('click', (e) => { if (!(e.target as Element).closest('[data-big-card]')) hide(); });
  addEventListener('popstate', () => { if (open) hide(true); });
}
