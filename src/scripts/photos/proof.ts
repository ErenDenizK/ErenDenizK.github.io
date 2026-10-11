/* Concept 2, "Proof" (components/photo/Proof.astro; docs/research/2026-10-photo-presentation.md §3.2).
   A strip of film on a light table, a grease-pencil mark round the pick, and a loupe:

   - with a mouse the loupe follows the pointer over the strip (a short lag, as a hand moves a glass)
     and goes back to where it lay when the pointer leaves; a click enlarges the frame;
   - by touch (or a pen, or a mouse that grabs it) the loupe is dragged and stays where it is left; only
     the loupe takes the touch (touch-action: none on it alone), so the page scrolls everywhere else;
     a tap on the frame, or on the loupe without moving it, enlarges the frame;
   - the lens shows the frame under its centre, magnified, from the whole photograph, and never more
     than that file's pixels allow at this screen's density (the "never stretched" rule);
   - the enlarged view is a modal <dialog> (Escape, focus and the backdrop are the platform's): the frame
     flies from the strip to the middle of the window and back (FLIP), lit by the photo's own colour;
     a tap anywhere, Escape, the close button or a wheel closes it.

   Still twins: reduced motion or ?still moves the loupe without lag and opens the view with a crossfade;
   the mark is drawn from the start. */
import { motionOK, mq } from '../env';

export function init(scope: ParentNode = document) {
  scope.querySelectorAll<HTMLElement>('[data-proof]').forEach(setup);
}

const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));

function setup(el: HTMLElement) {
  if (el.dataset.live) return;
  el.dataset.live = '1';
  const table = el.querySelector<HTMLElement>('.pf-table')!;
  const frame = el.querySelector<HTMLElement>('.pf-frame--pick')!;
  const img = frame.querySelector<HTMLImageElement>('img')!;
  const loupe = el.querySelector<HTMLElement>('.pf-loupe')!;
  const mag = el.querySelector<HTMLElement>('.pf-mag')!;
  const magImg = mag.querySelector<HTMLImageElement>('img')!;
  const open = el.querySelector<HTMLButtonElement>('.pf-open')!;
  const dlg = el.querySelector<HTMLDialogElement>('.pf-dlg')!;
  const pic = dlg.querySelector<HTMLElement>('.pf-dlg-pic')!;
  const still = () => !motionOK();
  el.classList.add('is-live');

  /* the mark is drawn when the strip comes into view */
  if (still()) el.classList.add('is-seen');
  else {
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { el.classList.add('is-seen'); io.disconnect(); } }, { threshold: 0.45 });
    io.observe(el);
  }

  /* ---- geometry, in the table's own coordinates ---- */
  let T = table.getBoundingClientRect(), F = frame.getBoundingClientRect(), R = loupe.offsetWidth / 2 || 56;
  const measure = () => { T = table.getBoundingClientRect(); F = frame.getBoundingClientRect(); R = loupe.offsetWidth / 2 || R; sizeMag(); };
  const fx = () => F.left - T.left, fy = () => F.top - T.top;
  const restAt = () => ({ x: fx() + F.width * 0.8, y: fy() + F.height * 0.8 });
  let M = 2;
  function sizeMag() {
    const natural = +(magImg.getAttribute('width') || 1080);
    M = clamp(natural / (F.width * (devicePixelRatio || 1)), 1, 2.4);
    mag.style.width = `${F.width * M}px`;
    mag.style.height = `${F.height * M}px`;
  }

  let x = 0, y = 0, tx = 0, ty = 0, raf = 0, last = 0, placed = false, follow = false;
  function render() {
    loupe.style.transform = `translate3d(${(x - R).toFixed(2)}px, ${(y - R).toFixed(2)}px, 0)`;
    /* the point of the frame under the lens's centre, magnified, sits at the lens's centre */
    const u = x - fx(), v = y - fy();
    mag.style.transform = `translate3d(${(R - u * M).toFixed(2)}px, ${(R - v * M).toFixed(2)}px, 0)`;
  }
  function frameLoop(now: number) {
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    const k = 1 - Math.exp(-dt * (follow ? 16 : 9));
    x += (tx - x) * k; y += (ty - y) * k;
    render();
    if (Math.abs(tx - x) > 0.1 || Math.abs(ty - y) > 0.1) raf = requestAnimationFrame(frameLoop);
    else { x = tx; y = ty; render(); raf = 0; }
  }
  function go(nx: number, ny: number, now = false) {
    tx = nx; ty = ny;
    if (now || still()) { x = tx; y = ty; cancelAnimationFrame(raf); raf = 0; render(); return; }
    if (!raf) { last = performance.now(); raf = requestAnimationFrame(frameLoop); }
  }
  const keepIn = (nx: number, ny: number) => [clamp(nx, fx() - R * 0.4, fx() + F.width + R * 0.4), clamp(ny, fy() - R * 0.4, fy() + F.height + R * 0.4)] as const;
  function place() {
    measure();
    if (!placed) { const r = restAt(); x = tx = r.x; y = ty = r.y; placed = true; }
    else { [tx, ty] = keepIn(tx, ty); x = tx; y = ty; }
    render();
  }
  if (img.complete) place(); else img.addEventListener('load', place, { once: true });
  place();
  new ResizeObserver(() => { const r0 = restAt(); const wasRest = Math.abs(tx - r0.x) < 1 && Math.abs(ty - r0.y) < 1; measure(); if (wasRest) { const r = restAt(); go(r.x, r.y, true); } else place(); }).observe(table);
  addEventListener('scroll', () => { if (follow) measure(); }, { passive: true });

  /* ---- a mouse: the loupe follows the pointer over the strip ---- */
  table.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse' || drag || !mq.fine.matches) return;
    if (!follow) { follow = true; el.classList.add('is-follow'); measure(); }
    const [nx, ny] = keepIn(e.clientX - T.left, e.clientY - T.top);
    go(nx, ny);
  });
  table.addEventListener('pointerleave', (e) => {
    if (e.pointerType !== 'mouse' || !follow) return;
    follow = false; el.classList.remove('is-follow');
    const r = restAt(); go(r.x, r.y);
  });

  /* ---- a finger (or a pen, or a mouse that grabs it): drag the loupe ---- */
  type Drag = { id: number; dx: number; dy: number; x0: number; y0: number; t: number; moved: boolean };
  let drag: Drag | null = null;
  loupe.addEventListener('pointerdown', (e) => {
    if (follow || (e.pointerType === 'mouse' && e.button !== 0)) return;
    measure();
    drag = { id: e.pointerId, dx: e.clientX - T.left - x, dy: e.clientY - T.top - y, x0: e.clientX, y0: e.clientY, t: e.timeStamp, moved: false };
    try { loupe.setPointerCapture(e.pointerId); } catch { /* gone */ }
    el.classList.add('is-held');
    e.preventDefault();
  });
  loupe.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    if (!drag.moved && Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) > 6) drag.moved = true;
    const [nx, ny] = keepIn(e.clientX - T.left - drag.dx, e.clientY - T.top - drag.dy);
    go(nx, ny, true);
  });
  const up = (e: PointerEvent) => {
    if (!drag || e.pointerId !== drag.id) return;
    const d = drag; drag = null;
    el.classList.remove('is-held');
    if (!d.moved && e.type === 'pointerup' && e.timeStamp - d.t < 400) show();
  };
  loupe.addEventListener('pointerup', up);
  loupe.addEventListener('pointercancel', up);
  /* iOS: a finger on the loupe never scrolls the page and never opens the image menu */
  loupe.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });

  /* ---- the enlarged view ---- */
  open.addEventListener('click', () => show());
  let closing = false;
  function fit() {
    const big = dlg.querySelector('img')!;
    const nw = +(big.getAttribute('width') || 1080), nh = +(big.getAttribute('height') || 1440);
    const d = devicePixelRatio || 1;
    const gut = Math.min(56, Math.max(16, innerWidth * 0.039));
    const capH = innerWidth < 600 ? 120 : 92;
    const w = Math.min(innerWidth - 2 * gut, nw / d, ((innerHeight - 56 - 28 - 22 - capH) * nw) / nh);
    dlg.style.setProperty('--w', `${Math.floor(Math.max(160, w))}px`);
  }
  function flight(reverse: boolean) {
    const a = frame.getBoundingClientRect(), b = pic.getBoundingClientRect();
    const from = `translate(${a.left - b.left}px, ${a.top - b.top}px) scale(${a.width / b.width}, ${a.height / b.height})`;
    const kf = [{ transform: from }, { transform: 'none' }];
    return pic.animate(reverse ? kf.reverse() : kf, { duration: reverse ? 460 : 640, easing: reverse ? 'cubic-bezier(0.4, 0, 0.2, 1)' : 'cubic-bezier(0.16, 0.84, 0.24, 1)', fill: 'both' });
  }
  function show() {
    if (dlg.open) return;
    fit();
    /* while the whole photograph loads, the frame's own pixels stand in */
    pic.style.background = `#000 url("${img.currentSrc || img.src}") center / cover no-repeat`;
    dlg.showModal();
    requestAnimationFrame(() => dlg.classList.add('is-open'));
    if (still()) pic.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 180, fill: 'both' });
    else flight(false);
  }
  async function hide() {
    if (!dlg.open || closing) return;
    closing = true;
    dlg.classList.remove('is-open');
    const a = still() ? pic.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, fill: 'both' }) : flight(true);
    try { await a.finished; } catch { /* cancelled */ }
    dlg.close();
    pic.getAnimations().forEach((x) => x.cancel());
    closing = false;
  }
  dlg.addEventListener('cancel', (e) => { e.preventDefault(); hide(); });
  dlg.addEventListener('click', () => hide());
  dlg.addEventListener('wheel', () => hide(), { passive: true });
  addEventListener('resize', () => { if (dlg.open && !closing) fit(); });
}
