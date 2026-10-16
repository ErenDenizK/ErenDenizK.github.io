/* The postcards' behaviour (design spec §3.4 item 4). A click or a tap on a postcard grows it into the
   large view: a modal <dialog> (the top layer gives the dimmed ground, focus containment and Escape)
   that receives a clone of the card's template; a same-document view transition morphs the small face
   into the large card (view-transition-name pc-hero). Opening pushes one history step, so Back closes;
   Escape and a click outside close and go back that step. In the large view a click or a tap turns the
   card over; a mouse drag swings it (clamped ±18°) and it springs back on the family kit's solver.
   Focus returns to the postcard that was opened. Reduced motion: no morph, no swing; the turn is a
   crossfade (Postcards.astro). Without the View Transitions API the dialog simply appears. */
import { spring, solve } from '../../../docs/family-kit/springs.js';
import { motion } from './bus';

const MAX = 18;
const BACK = spring({ duration: 0.7, bounce: 0.3 });

type VT = { finished: Promise<void>; skipTransition(): void };
const vt = (f: () => void): VT | null => {
  const d = document as Document & { startViewTransition?: (f: () => void) => VT };
  if (motion() === 'reduced' || !d.startViewTransition) { f(); return null; }
  return d.startViewTransition(f);
};

export function initPostcards() {
  const dlg = document.querySelector<HTMLDialogElement>('[data-pc-dialog]');
  if (!dlg) return;
  const stage = dlg.querySelector<HTMLElement>('[data-big-stage]')!;
  const cap = dlg.querySelector<HTMLElement>('[data-big-cap]')!;
  const cards = [...document.querySelectorAll<HTMLElement>('[data-postcard]')];
  let open: HTMLElement | null = null, busy: VT | null = null, pushed = false;

  const show = (pc: HTMLElement) => {
    if (busy) { busy.skipTransition(); busy = null; }
    const tpl = pc.querySelector<HTMLTemplateElement>('template[data-big]')!;
    pc.classList.add('is-hero');
    busy = vt(() => {
      pc.classList.remove('is-hero');
      pc.classList.add('is-out');
      stage.replaceChildren(tpl.content.cloneNode(true));
      const c = pc.querySelector('.pc-cap');
      cap.replaceChildren(...(c ? [...c.childNodes].map((n) => n.cloneNode(true)) : []));
      cap.hidden = !(document.documentElement.dataset.cap === 'large' && c);
      cap.style.visibility = '';
      if (!dlg.open) dlg.showModal();
      open = pc;
      const big = stage.querySelector<HTMLElement>('[data-big-card]')!;
      big.classList.add('is-hero');
      wire(big);
    });
    const named = () => stage.querySelector('[data-big-card]')?.classList.remove('is-hero');
    if (busy) busy.finished.finally(() => { busy = null; named(); }); else named();
    if (!pushed) { history.pushState({ ...(history.state || {}), postcard: cards.indexOf(pc) }, ''); pushed = true; }
  };

  const hide = (fromHistory = false) => {
    const pc = open;
    if (!pc) return;
    if (busy) { busy.skipTransition(); busy = null; }
    const big = stage.querySelector<HTMLElement>('[data-big-card]');
    /* the large card returns face up, so the morph lands on the photograph */
    big?.classList.remove('is-turned');
    big?.style.setProperty('--pc-turn', '0deg');
    big?.classList.add('is-hero');
    busy = vt(() => {
      dlg.close();
      stage.replaceChildren();
      pc.classList.remove('is-out');
      pc.classList.add('is-hero');
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

  /* ---------- the large card: turn, and swing with a mouse ---------- */
  function wire(card: HTMLElement) {
    let turned = false, down: { x: number; id: number } | null = null, pulled = false;
    let sw = 0, v = 0, lastX = 0, lastT = 0, raf = 0;
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-pressed', 'false');
    card.setAttribute('aria-label', 'Turn the postcard over');
    const front = card.querySelector('.big-front')!, back = card.querySelector('.big-back')!;
    const turn = () => {
      turned = !turned;
      card.classList.toggle('is-turned', turned);
      card.style.setProperty('--pc-turn', turned ? '180deg' : '0deg');
      card.setAttribute('aria-pressed', String(turned));
      front.setAttribute('aria-hidden', String(turned));
      back.setAttribute('aria-hidden', String(!turned));
      /* the back carries the note itself: the caption under the card steps aside, so it is never read twice */
      cap.style.visibility = turned ? 'hidden' : '';
    };
    const draw = () => card.style.setProperty('--pc-sw', `${sw.toFixed(2)}deg`);
    const springBack = () => {
      const x0 = sw, v0 = v, t0 = performance.now();
      const step = (now: number) => {
        const [x, xv] = solve(BACK, x0, v0, (now - t0) / 1000);
        sw = x; draw();
        if (Math.abs(x) > 0.05 || Math.abs(xv) > 0.1) raf = requestAnimationFrame(step); else { sw = 0; draw(); }
      };
      raf = requestAnimationFrame(step);
    };
    card.addEventListener('pointerdown', (e) => {
      if (motion() === 'reduced' || e.pointerType !== 'mouse' || e.button !== 0) return;
      down = { x: e.clientX, id: e.pointerId }; pulled = false; lastX = e.clientX; lastT = e.timeStamp;
    });
    card.addEventListener('pointermove', (e) => {
      if (!down || e.pointerId !== down.id) return;
      const dx = e.clientX - down.x;
      if (!pulled && Math.abs(dx) < 4) return;
      if (!pulled) { pulled = true; card.setPointerCapture(e.pointerId); card.classList.add('is-held'); cancelAnimationFrame(raf); }
      sw = MAX * Math.tanh(dx / 260);
      const dt = Math.max(1, e.timeStamp - lastT) / 1000;
      v = ((e.clientX - lastX) / 260) * MAX / dt; lastX = e.clientX; lastT = e.timeStamp;
      draw();
    });
    const up = (e: PointerEvent) => {
      if (!down || e.pointerId !== down.id) return;
      down = null; card.classList.remove('is-held');
      if (pulled) { v = Math.max(-300, Math.min(300, v)); springBack(); }
    };
    card.addEventListener('pointerup', up);
    card.addEventListener('pointercancel', up);
    card.addEventListener('click', (e) => { e.stopPropagation(); if (pulled) { pulled = false; return; } turn(); });
    card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); turn(); } });
    requestAnimationFrame(() => card.focus({ preventScroll: true }));
  }
}
