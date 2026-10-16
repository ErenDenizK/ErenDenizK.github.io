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
   focus returns to it. Reduced motion: no physics, no morph; the turn is a crossfade.

   Round three (spec v3 §4.2, rows T15, G4, G6, P2):
   - the ways out: focus goes to the labelled close on open; the close folds to its cross after the first
     close of the session (remembered with the project layer's key), after 4 s or on a pull; a turn
     capsule turns the card; over the dark space a fine pointer becomes a glass close disc; on touch a
     downward pull moves the card on a rubber band, fills a ring round the cross and closes past 96 px;
   - input always answers: a press while the card is still growing (the view transition) is kept and
     turns the card as soon as it lands;
   - the three table photographs load eagerly, at low priority, once the chapter is within 1.5 screens,
     so a jump from the rail never lands on grey cards. */
import { initCards } from './card3d';
import { motion } from './bus';

type Sp = { x: number; v: number; to: number };
const UI: [number, number] = [300, 30];
const LAND: [number, number] = [120, 2 * 0.75 * Math.sqrt(120)];
const H = 1 / 240;
const sp = (): Sp => ({ x: 0, v: 0, to: 0 });
/* the close's fold, shared with the project layer (src/one/work/scripts/exits.ts uses the same key) */
const FOLD_KEY = 'one-close-folded';
const FOLD_MS = 4000;
const PULL = 96;   // px of finger travel that closes
const BAND = 120;  // the rubber band's reach
const wasFolded = () => { try { return sessionStorage.getItem(FOLD_KEY) === '1'; } catch { return false; } };
const rememberFold = () => { try { sessionStorage.setItem(FOLD_KEY, '1'); } catch { /* storage blocked: the fold is only a convenience */ } };
const step = (s: Sp, [k, c]: [number, number], h: number) => { s.v += (-k * (s.x - s.to) - c * s.v) * h; s.x += s.v * h; };
const still = (s: Sp, e: number) => Math.abs(s.x - s.to) < e && Math.abs(s.v) < e * 4;

/* the backs' drawings (Postcards.astro: data-plate holds the file's URL): fetched once on the first pick
   up or open, then set into each clone of the large card before its back can be seen */
const plates = new Map<string, Promise<string>>();
const plate = (url: string) => {
  let p = plates.get(url);
  if (!p) {
    p = fetch(url).then((r) => (r.ok ? r.text() : ''))
      .then((t) => t.replace(/<title>[^<]*<\/title>|<desc>[^<]*<\/desc>/g, '').replace('<svg ', '<svg aria-hidden="true" focusable="false" '))
      .catch(() => '');
    plates.set(url, p);
  }
  return p;
};
const platesOf = (root: ParentNode) => [...root.querySelectorAll<HTMLElement>('[data-plate]')];
const warm = (tpl: HTMLTemplateElement) => platesOf(tpl.content).forEach((el) => plate(el.dataset.plate!));
const fill = (root: ParentNode) => platesOf(root).forEach((el) => {
  plate(el.dataset.plate!).then((t) => { if (t && !el.firstChild) el.innerHTML = t; });
});

type VT = { finished: Promise<void>; skipTransition(): void };
/* html.pc-vt holds every group of the morph to the card's own 640 ms (the page's groups default to the
   900 ms open tempo, which kept the card unresponsive for over a second, row G4) */
const vt = (f: () => void): VT | null => {
  const d = document as Document & { startViewTransition?: (f: () => void) => VT };
  if (motion() === 'reduced' || !d.startViewTransition) { f(); return null; }
  const html = document.documentElement;
  html.classList.add('pc-vt');
  const t = d.startViewTransition(f);
  t.finished.finally(() => html.classList.remove('pc-vt'));
  return t;
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

  /* ---------- eager photographs (G6, P2) ---------- */
  const imgs = [...table.querySelectorAll<HTMLImageElement>('.pc-pic img')];
  const near = new IntersectionObserver((es) => {
    if (!es.some((e) => e.isIntersecting)) return;
    near.disconnect();
    for (const im of imgs) { im.fetchPriority = 'low'; im.loading = 'eager'; }
  }, { rootMargin: '150% 0px' });
  near.observe(table);

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
    c.addEventListener('pointerenter', (e) => { warm(c.querySelector('template[data-big]')!); if (e.pointerType === 'mouse') pick(i); });
    c.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse' && up === i) drop(i); });
  });

  /* ---------- the large view ---------- */
  const stage = dlg.querySelector<HTMLElement>('[data-big-stage]')!;
  const caps = dlg.querySelector<HTMLElement>('[data-pv-caps]');
  const closeBtn = dlg.querySelector<HTMLButtonElement>('[data-pv-close]');
  const turnBtn = dlg.querySelector<HTMLButtonElement>('[data-pv-turn]');
  const cursor = dlg.querySelector<HTMLElement>('[data-pv-cursor]');
  let open: HTMLElement | null = null, busy: VT | null = null, pushed = false, queued = false, foldT = 0, opening = false;
  const fold = () => caps?.classList.add('folded');
  /* the face toward the viewer turns the card (its button is the live one; the other face is inert) */
  const turnCard = () => stage.querySelector<HTMLButtonElement>('[data-face]:not([inert]) [data-turn]')?.click();
  const settle = () => {
    opening = false;
    dlg.classList.add('settled');
    if (queued) { queued = false; turnCard(); }
  };
  const show = (pc: HTMLElement) => {
    if (busy) { busy.skipTransition(); busy = null; }
    const i = cards.indexOf(pc);
    if (up === i) drop(i);
    const tpl = pc.querySelector<HTMLTemplateElement>('template[data-big]')!;
    warm(tpl);
    pc.classList.add('is-hero');
    queued = false;
    opening = true;
    dlg.classList.remove('settled', 'cur-x');
    caps?.classList.toggle('folded', wasFolded());
    clearTimeout(foldT);
    foldT = window.setTimeout(fold, FOLD_MS);
    busy = vt(() => {
      pc.classList.remove('is-hero');
      pc.classList.add('is-out');
      stage.replaceChildren(tpl.content.cloneNode(true));
      if (!dlg.open) dlg.showModal();
      open = pc;
      fill(stage);
      const big = stage.querySelector<HTMLElement>('[data-big-card]')!;
      big.classList.add('is-hero');
      initCards(stage);
      /* a keyboard user hears "Close, button" first (spec v3 §4.2) */
      closeBtn?.focus({ preventScroll: true });
    });
    const named = () => { stage.querySelector('[data-big-card]')?.classList.remove('is-hero'); settle(); };
    if (busy) busy.finished.finally(() => { busy = null; named(); }); else named();
    if (!pushed) { history.pushState({ ...(history.state || {}), postcard: i }, ''); pushed = true; }
  };
  const hide = (fromHistory = false) => {
    const pc = open;
    if (!pc) return;
    if (busy) { busy.skipTransition(); busy = null; }
    clearTimeout(foldT);
    rememberFold();
    queued = false;
    dlg.classList.remove('cur-x');
    const big = stage.querySelector<HTMLElement>('[data-big-card]');
    /* the large card returns face up, so the morph lands on the photograph */
    big?.classList.add('is-hero');
    const body = big?.querySelector<HTMLElement>('[data-card-body]');
    if (body) body.style.transform = '';
    big?.classList.remove('is-flipped');
    big?.querySelectorAll<HTMLElement>('[data-face]').forEach((f, k) => { f.style.opacity = k ? '0' : '1'; });
    busy = vt(() => {
      dlg.close();
      dlg.classList.remove('settled');
      stage.style.transform = '';
      caps?.style.removeProperty('--pull');
      dlg.style.removeProperty('--pull');
      caps?.classList.remove('armed');
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
  /* a second press on the table card while it is already growing is the queued turn, not a new open */
  for (const pc of cards) pc.querySelector('.pc-open')?.addEventListener('click', () => { if (opening || open) { queued = true; return; } show(pc); });
  dlg.addEventListener('cancel', (e) => { e.preventDefault(); hide(); });
  closeBtn?.addEventListener('click', () => hide());
  turnBtn?.addEventListener('click', () => { if (busy) queued = true; else turnCard(); });
  const onCaps = (t: EventTarget | null) => !!(t as Element | null)?.closest?.('[data-pv-caps]');
  const onCard = (t: EventTarget | null) => !!(t as Element | null)?.closest?.('[data-big-card], [data-pv-caps]');
  dlg.addEventListener('click', (e) => { if (!onCard(e.target)) hide(); });
  /* G4: while the card grows, the transition's snapshot covers the page and takes the press; keep it.
     Before the snapshot is taken the press reaches the old page instead (the click handler above). */
  document.addEventListener('pointerdown', (e) => {
    if (!opening || !busy || e.button !== 0 || onCaps(e.target)) return;
    queued = true;
  }, true);
  addEventListener('popstate', () => { if (open) hide(true); });

  /* the close cursor: fine pointers, over the dark space only (over the card the hand stays the grab hand) */
  dlg.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse' || !cursor) return;
    const on = !onCard(e.target) && !!open;
    dlg.classList.toggle('cur-x', on);
    if (on) cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
  });
  dlg.addEventListener('pointerleave', () => dlg.classList.remove('cur-x'));

  /* touch: a downward pull moves the card on a rubber band and fills the ring round the cross */
  let y0 = 0, x0 = 0, dir = 0, d = 0;
  const setPull = (px: number) => {
    d = px;
    const b = (BAND * px) / (px + BAND);
    stage.style.transform = px ? `translateY(${b.toFixed(1)}px) scale(${(1 - b / 1800).toFixed(4)})` : '';
    const k = Math.min(100, (px / PULL) * 100);
    caps?.style.setProperty('--pull', k.toFixed(1));
    dlg.style.setProperty('--pull', k.toFixed(1));
    caps?.classList.toggle('armed', px >= PULL);
  };
  dlg.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1 || !open || motion() === 'reduced' || onCaps(e.target)) { dir = 2; return; }
    y0 = e.touches[0].clientY; x0 = e.touches[0].clientX; dir = 0;
  }, { passive: true });
  dlg.addEventListener('touchmove', (e) => {
    if (dir === 2 || e.touches.length !== 1) return;
    const dy = e.touches[0].clientY - y0, dx = e.touches[0].clientX - x0;
    if (!dir) {
      if (dy > 8 && dy > Math.abs(dx) * 1.2) { dir = 1; fold(); }
      else if (Math.hypot(dx, dy) > 8) { dir = 2; return; }
      else return;
    }
    setPull(Math.max(0, dy - 8));
  }, { passive: true });
  const endPull = () => {
    if (dir !== 1) { dir = 0; return; }
    dir = 0;
    /* past the close point the card leaves from where the finger let it go */
    if (d >= PULL) { hide(); return; }
    const from = stage.style.transform;
    setPull(0);
    if (from) stage.animate([{ transform: from }, { transform: 'none' }], { duration: 420, easing: 'cubic-bezier(.22, 1, .36, 1)' });
  };
  dlg.addEventListener('touchend', endPull, { passive: true });
  dlg.addEventListener('touchcancel', endPull, { passive: true });
}
