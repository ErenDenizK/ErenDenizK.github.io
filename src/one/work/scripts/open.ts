/* Open and close (phase3 design-spec.md 3.3.4 "URLs", 4.8; kept in spec v2 §3.3.5, the owner likes it:
   W3, O1): the print's paper grows into the page. A same-document view transition with shared names:
   the hero frame's mount becomes the layer's ground ("paper"), its screen the hero ("shot", never
   hidden), the block's meta, title and promise the head, its side frames the flanking ones ("side-1",
   "side-2"). At most eight named groups (rule 17): no object group. The open starts from the hero's
   transform at the click, so a frame clicked mid-flight grows from where it is; the page's clock and
   the field pause before the transition starts.
   Every project has a real URL: open pushes it, Close, Escape and Back all take the one history step
   back. Without view transitions (or with reduced motion) the layer changes at once, with a --t-quick (160 ms) fade. */
import type { Flight, Proj } from './flight';
import { pauseTicker, createSmoother } from '../../scripts/ticker';
import { bloom } from '../../scripts/bloom';
import { createRail, type Rail } from '../../../scripts/rail';
import { motion, emit, pauseField } from './bus';
import { initStepper, type Stepper } from './stepper';
import { spin } from './loops';
import { onFirstFrame } from './frame';
import { initExits, wasFolded, rememberFold, type Exits } from './exits';

type VT = { finished: Promise<void>; updateCallbackDone: Promise<void>; skipTransition(): void };
const root = document.documentElement;
const phone = () => matchMedia('(max-width: 699.98px)').matches;
const canVT = () => typeof (document as unknown as { startViewTransition?: unknown }).startViewTransition === 'function' && motion() === 'full';
const vtk = () => (/[?&]open=1400\b/.test(location.search) ? 1.55 : 1);
const start = (fn: () => void | Promise<void>): VT => (document as unknown as { startViewTransition(f: () => void | Promise<void>): VT }).startViewTransition(fn);

function name(el: Element | null | undefined, n: string) { if (el) (el as HTMLElement).style.viewTransitionName = n; }
function clear(scope: ParentNode | null | undefined) { scope?.querySelectorAll<HTMLElement>('[style*="view-transition-name"]').forEach((e) => (e.style.viewTransitionName = '')); }
const decode = (img: HTMLImageElement | null, ms = 350) => !img ? Promise.resolve() : Promise.race([img.decode().catch(() => {}), new Promise((r) => setTimeout(r, ms))]);

export function initOpen(sec: HTMLElement, deck: Flight) {
  let layer: HTMLElement | null = null, open: Proj | null = null, vt: VT | null = null, steps: Stepper | null = null, clipT = 0;
  let rail: Rail | null = null, smoother: { destroy(): void } | null = null, exits: Exits | null = null;
  const tpl = (slug: string) => sec.querySelector<HTMLTemplateElement>(`template[data-pres-tpl="${slug}"]`);

  /* the block's side of the shared names: the hero frame, its side frames, the texts */
  function deckNames(p: Proj, on: boolean) {
    const [front, ...rest] = deck.order(p);
    const set = (el: Element | null | undefined, n: string) => name(el, on ? n : '');
    set(front?.querySelector('.pr-mount'), 'paper');
    set(front?.querySelector('.pr-screen'), 'shot');
    set(p.txt.querySelector('[data-part="meta"]'), 'meta');
    set(p.txt.querySelector('[data-part="title"]'), 'title');
    set(p.txt.querySelector('[data-part="promise"]'), 'promise');
    if (!phone()) rest.forEach((el, i) => set(el, `side-${i + 1}`));
  }
  function layerNames(l: HTMLElement, on: boolean) {
    const set = (sel: string, n: string) => name(l.querySelector(sel), on ? n : '');
    set('[data-vt="paper"]', 'paper'); set('[data-vt="shot"]', 'shot'); set('[data-vt="body"]', 'body');
    set('[data-vt="meta"]', 'meta'); set('[data-vt="title"]', 'title'); set('[data-vt="promise"]', 'promise');
    if (!phone()) { set('[data-vt="side-1"]', 'side-1'); set('[data-vt="side-2"]', 'side-2'); }
  }

  /* the layer from the project's template; the hero and the flanking prints show exactly the deck's
     prints (the same decoded image), so the shared screen never blinks */
  function build(p: Proj): HTMLElement {
    const l = document.createElement('div');
    l.className = 'layer';
    l.setAttribute('role', 'dialog');
    l.setAttribute('aria-modal', 'true');
    l.tabIndex = -1;
    l.append(tpl(p.slug)!.content.cloneNode(true));
    l.setAttribute('aria-labelledby', l.querySelector('h1')!.id);
    const [front, ...rest] = deck.order(p);
    const hero = l.querySelector<HTMLElement>('.hero');
    const pic = front?.querySelector('picture');
    if (hero && pic && !hero.classList.contains('hero-obj')) {
      const mine = hero.querySelector('picture');
      const copy = pic.cloneNode(true) as HTMLElement;
      /* the copy keeps the deck's sizes until the layer stands, so it picks the very file the deck shows
         (already decoded); a larger file for the layer's size is chosen after the open (settled), and the
         browser keeps the shown picture until it arrives (review V17: a grey hero during the open) */
      copy.querySelectorAll('source').forEach((s) => (s.dataset.sizes = s.getAttribute('media') ? 'calc(100vw - 32px)' : '(max-width: 699.98px) calc(100vw - 32px), 800px'));
      const img = copy.querySelector('img')!;
      img.className = 'hero-img';
      img.loading = 'eager';
      mine?.replaceWith(copy);
      hero.toggleAttribute('data-phone-frame', img.hasAttribute('data-phone-frame'));
    }
    l.querySelectorAll<HTMLElement>('.side').forEach((slot, i) => {
      const src = rest[i];
      if (!src) { slot.remove(); return; }
      const c = src.cloneNode(true) as HTMLElement;
      c.removeAttribute('style'); c.dataset.pos = String(i + 1);
      c.querySelectorAll<HTMLElement>('[style]').forEach((e) => { if (e.classList.contains('pr-shade')) e.removeAttribute('style'); });
      /* phones hide the flanking prints in the layer: their pictures are not fetched during the open */
      if (!phone()) c.querySelectorAll('img').forEach((im) => (im.loading = 'eager'));
      slot.replaceChildren(c);
    });
    /* the hero must be decoded before the new state is shown: a lazy image would only start loading then */
    l.querySelectorAll<HTMLImageElement>('.hero img').forEach((im) => (im.loading = 'eager'));
    return l;
  }

  /* warm (review V17): the pointer's intent (hover on a fine pointer, a press, keyboard focus) builds the
     layer ahead of the click, so its images are already fetched and decoding when the paper starts to
     grow. One warm layer at a time. */
  let warm: { slug: string; l: HTMLElement } | null = null;
  function take(p: Proj): HTMLElement {
    const w = warm; warm = null;
    const l = w && w.slug === p.slug ? w.l : build(p);
    /* the close was folded once this session: later opens start with the cross alone (exits.ts) */
    if (wasFolded()) l.querySelector('[data-caps]')?.classList.add('folded');
    return l;
  }
  function warmUp(slug: string) {
    if (layer || vt || warm?.slug === slug) return;
    const p = deck.find(slug);
    if (!p || !tpl(slug)) return;
    warm = { slug, l: build(p) };
  }

  function show(p: Proj) {
    open = p;
    p.el.classList.add('opened');
    document.body.append(layer!);
    emit('one:layer-open', p.slug);
    pauseField(true);
    deck.pause(true);
    pauseTicker(true);
  }
  /* the layer once it stands: its steps scrubbed by its own scroll, its rail, its smoothing (spec v2 §3.4) */
  function settled(l: HTMLElement) {
    clear(l);
    l.querySelectorAll<HTMLSourceElement>('.hero source[data-sizes]').forEach((s) => { s.sizes = s.dataset.sizes!; s.removeAttribute('data-sizes'); });
    /* the capsules rise in once the paper has landed; focus goes to the close, so a keyboard or screen
       reader user meets the way out first (spec v3 §4.2) */
    l.classList.add('settled');
    (l.querySelector<HTMLElement>('.cap-x') ?? l.querySelector<HTMLElement>('h1'))?.focus({ preventScroll: true });
    exits = initExits(l, back);
    steps = initStepper(l.querySelector('[data-steps]'), l);
    smoother = createSmoother(l);
    const pres = l.querySelector<HTMLElement>('.pres')!;
    rail = createRail({
      scroller: l, host: l, sections: [...pres.querySelectorAll<HTMLElement>('[data-rail-sec]')], content: pres,
      /* one rail (rail-bloom §6): the steps are the layer's one part, so they get the gaps and the part
         line that Work and The record get on Home */
      flat: l, id: 'layer-rail', extraClass: 'in-layer', ext: bloom((el) => (el.classList.contains('st-mark') ? 'Steps' : undefined)),
      offset: () => (parseFloat(getComputedStyle(root).getPropertyValue('--bar-h')) || 76) + 16,
    });
    clipT = window.setTimeout(() => playHero(l), 300);
  }
  function playHero(l: HTMLElement) {
    spin(l.querySelector<HTMLElement>('.hero-object'), phone());
    const v = l.querySelector<HTMLVideoElement>('.hero-video');
    if (!v || motion() !== 'full') return;
    v.querySelectorAll<HTMLSourceElement>('source[data-src]').forEach((s) => { s.src = s.dataset.src!; s.removeAttribute('data-src'); });
    v.load();
    onFirstFrame(v, () => v.classList.add('on'));
    v.addEventListener('ended', () => v.classList.remove('on'), { once: true });
    v.play().catch(() => {});
    steps?.yieldTo(v);
  }

  async function openProject(slug: string, how: 'click' | 'pop' = 'click') {
    const p = deck.find(slug);
    if (!p || !tpl(slug)) return;
    if (vt) { vt.skipTransition(); return; }
    if (layer) { if (open?.slug === slug) return; drop(); }
    if (how === 'click') history.pushState({ p: slug }, '', p.btn.href);
    /* the clock stops first: the hero keeps the transform it has now, and the transition starts from it */
    pauseTicker(true);
    deck.pause(true);
    root.style.setProperty('--vt-k', String(vtk()));
    if (!canVT()) {
      layer = take(p);
      show(p);
      if (motion() === 'full') layer.classList.add('fade');
      settled(layer);
      return;
    }
    /* the press before the open (spec 4.8: the front print lifts, 120 ms). The snapshot of the page waits
       for it, so the click answers at once even where taking the snapshot is slow (review G6: never an
       empty wait); the transition then starts from the lifted print. The press starts before any other
       work of the click (review V17): the layer is built while the paper lifts, unless the pointer's
       intent built it already (warm). */
    const front = deck.order(p)[0];
    /* the paper is picked up: it lifts 10 px and its shadow grows, so the snapshot's wait reads as the
       lift (spec v3 §1.2, W3 / O1). The shadow's first keyframe is implicit (the current shadow), so no
       style is read on the click. */
    const pin = front?.querySelector<HTMLElement>('.pr-in');
    const lift = { duration: 120, easing: 'cubic-bezier(.4, 0, .2, 1)', fill: 'forwards' as const };
    /* from where the paper is now (the hover lift on a fine pointer, rest on touch): no first-frame drop.
       The lift reaches past the hover's (-4 px, 1.02), so the click reads on a print already lifted. */
    const press = pin?.animate([{ transform: 'translateY(-10px) scale(1.035)' }], lift);
    pin?.querySelector<HTMLElement>('.pr-mount')?.animate([{ boxShadow: '0 2px 4px rgb(0 0 0 / .5), 0 40px 90px -24px rgb(0 0 0 / .8), inset 0 0 0 1px rgb(255 255 255 / .05)' }], lift);
    const l0 = (layer = document.createElement('div'));
    await new Promise((r) => requestAnimationFrame(() => setTimeout(r)));
    if (layer !== l0) return;
    layer = take(p);
    const lb = layer;
    await press?.finished.catch(() => {});
    if (layer !== lb) return;
    /* Back or Escape during the press: the open is called off and the page runs on */
    if ((history.state as { p?: string } | null)?.p !== slug) {
      pin?.querySelectorAll('*').forEach((e) => e.getAnimations().forEach((a) => a.cancel()));
      press?.cancel(); layer = null; deck.pause(false); pauseTicker(false); return;
    }
    deckNames(p, true);
    const l = layer;
    root.classList.add('vt-open');
    vt = start(async () => {
      deckNames(p, false);
      pin?.getAnimations({ subtree: true }).forEach((a) => a.cancel());
      layerNames(l, true);
      show(p);
      await decode(l.querySelector<HTMLImageElement>('.hero img'));
    });
    vt.finished.finally(() => { vt = null; root.classList.remove('vt-open'); if (layer === l) settled(l); });
  }

  /* close: the reverse, onto the print that is in front of the deck now */
  function drop() {
    clearTimeout(clipT);
    exits?.destroy(); exits = null;
    steps?.destroy(); steps = null;
    rail?.destroy(); rail = null;
    smoother?.destroy(); smoother = null;
    layer?.remove(); layer = null;
    if (open) { open.el.classList.remove('opened'); emit('one:layer-close', open.slug); }
    pauseField(false);
    deck.pause(false);
    pauseTicker(false);
  }
  function closeProject(o: { ua?: boolean } = {}) {
    if (!layer || !open) return;
    if (vt) vt.skipTransition();
    rememberFold();
    const p = open, l = layer;
    const done = () => p.btn.focus({ preventScroll: true });
    if (!canVT() || o.ua) {
      if (motion() === 'full' && !o.ua) {
        l.classList.add('fade-out');
        setTimeout(() => { if (layer === l) { drop(); done(); } }, 160);
      } else { drop(); done(); }
      return;
    }
    /* a clip that shows fades back to the capture first (250 ms), so the shared screen closes onto the
       same capture that Home shows and nothing cuts */
    const clip = l.querySelector<HTMLVideoElement>('.hero-video.on');
    l.querySelectorAll('video').forEach((v) => v.pause());
    if (clip) {
      clip.style.transition = 'opacity 250ms ease-out'; clip.classList.remove('on');
      setTimeout(() => { if (layer === l) closeVT(p, l, done); }, 250);
      return;
    }
    closeVT(p, l, done);
  }
  function closeVT(p: Proj, l: HTMLElement, done: () => void) {
    layerNames(l, true);
    root.classList.add('vt-close');
    vt = start(() => {
      layerNames(l, false);
      drop();
      deckNames(p, true);
    });
    vt.finished.finally(() => { vt = null; root.classList.remove('vt-close'); deckNames(p, false); done(); });
  }

  /* the next project, from the foot of a presentation: one move from its print into its page */
  function next(slug: string) {
    const p = deck.find(slug);
    if (!p || !layer || !open || vt) return;
    const old = layer, from = open;
    history.replaceState({ p: slug }, '', p.btn.href);
    const nl = take(p);
    const peek = old.querySelector('.p-next-print');
    if (!canVT()) { drop(); deck.jump(slug); layer = nl; show(p); settled(nl); return; }
    name(old.querySelector('[data-vt="paper"]'), 'paper-old');
    name(old.querySelector('[data-vt="body"]'), 'body');
    name(peek?.querySelector('.pr-mount'), 'paper');
    name(peek?.querySelector('.pr-screen'), 'shot');
    root.classList.add('vt-open');
    vt = start(async () => {
      clear(old);
      clearTimeout(clipT); steps?.destroy(); steps = null; exits?.destroy(); exits = null;
      rail?.destroy(); rail = null; smoother?.destroy(); smoother = null;
      old.remove();
      from.el.classList.remove('opened');
      deck.jump(slug);
      layer = nl; open = p; p.el.classList.add('opened');
      name(nl.querySelector('[data-vt="paper"]'), 'paper');
      name(nl.querySelector('[data-vt="shot"]'), 'shot');
      name(nl.querySelector('[data-vt="body"]'), 'body');
      document.body.append(nl);
      await decode(nl.querySelector<HTMLImageElement>('.hero img'));
    });
    vt.finished.finally(() => { vt = null; root.classList.remove('vt-open'); if (layer === nl) settled(nl); });
  }

  /* ---- input ---- */
  const intent = (e: Event) => {
    const a = (e.target as Element).closest<HTMLAnchorElement>('a[data-open]');
    if (a && sec.contains(a)) warmUp(a.dataset.open!);
  };
  sec.addEventListener('pointerover', intent, { passive: true });
  sec.addEventListener('pointerdown', intent, { passive: true });
  sec.addEventListener('focusin', intent);
  sec.addEventListener('click', (e) => {
    const a = (e.target as Element).closest<HTMLAnchorElement>('a[data-open]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    openProject(a.dataset.open!);
  });
  document.addEventListener('click', (e) => {
    if (!layer || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const t = e.target as Element;
    const x = t.closest('[data-close]'), n = t.closest<HTMLAnchorElement>('[data-next]');
    if (x && layer.contains(x)) { e.preventDefault(); back(); }
    else if (n && layer.contains(n)) { e.preventDefault(); next(n.dataset.next!); }
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && layer && !e.defaultPrevented) { e.preventDefault(); back(); } });
  function back() { if ((history.state as { p?: string } | null)?.p) history.back(); else closeProject(); }
  addEventListener('popstate', (e) => {
    const slug = (e.state as { p?: string } | null)?.p;
    const ua = !!(e as PopStateEvent & { hasUAVisualTransition?: boolean }).hasUAVisualTransition;
    if (slug) { if (!layer || open?.slug !== slug) openProject(slug, 'pop'); }
    else if (layer) closeProject({ ua });
  });
  /* a forward visit after a reload of Home (the history entry still names the project) */
  const st = (history.state as { p?: string } | null)?.p;
  if (st && deck.find(st)) openProject(st, 'pop');
}
