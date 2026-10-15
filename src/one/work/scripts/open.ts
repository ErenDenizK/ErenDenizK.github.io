/* Open and close (phase3 design-spec.md 3.3.4 "URLs", 4.8): the print's paper grows into the page.
   A same-document view transition with shared names: the front print's mount becomes the layer's ground
   ("paper"), its screen the hero ("shot", never hidden), the deck's meta, title and promise the head, the
   other prints the flanking ones ("side-1", "side-2") and the glass object stays the object ("obj").
   Every project has a real URL: open pushes it, Close, Escape and Back all take the one history step
   back. Without view transitions (or with reduced motion) the layer changes at once, with a 150 ms fade. */
import type { Deck, Proj } from './deck';
import { motion, emit, pauseField } from './bus';
import { initStepper, type Stepper } from './stepper';
import { spin } from './loops';
import { onFirstFrame } from './frame';

type VT = { finished: Promise<void>; updateCallbackDone: Promise<void>; skipTransition(): void };
const root = document.documentElement;
const phone = () => matchMedia('(max-width: 699.98px)').matches;
const canVT = () => typeof (document as unknown as { startViewTransition?: unknown }).startViewTransition === 'function' && motion() === 'full';
const vtk = () => (/[?&]open=1400\b/.test(location.search) ? 1.55 : 1);
const start = (fn: () => void | Promise<void>): VT => (document as unknown as { startViewTransition(f: () => void | Promise<void>): VT }).startViewTransition(fn);

function name(el: Element | null | undefined, n: string) { if (el) (el as HTMLElement).style.viewTransitionName = n; }
function clear(scope: ParentNode | null | undefined) { scope?.querySelectorAll<HTMLElement>('[style*="view-transition-name"]').forEach((e) => (e.style.viewTransitionName = '')); }
const decode = (img: HTMLImageElement | null, ms = 350) => !img ? Promise.resolve() : Promise.race([img.decode().catch(() => {}), new Promise((r) => setTimeout(r, ms))]);

export function initOpen(sec: HTMLElement, deck: Deck) {
  let layer: HTMLElement | null = null, open: Proj | null = null, vt: VT | null = null, steps: Stepper | null = null, clipT = 0;
  const tpl = (slug: string) => sec.querySelector<HTMLTemplateElement>(`template[data-pres-tpl="${slug}"]`);

  /* the deck's side of the shared names: the print in front, the others, the texts, the object */
  function deckNames(p: Proj, on: boolean) {
    const [front, ...rest] = deck.order(p);
    const set = (el: Element | null | undefined, n: string) => name(el, on ? n : '');
    set(front?.querySelector('.pr-mount'), 'paper');
    set(front?.querySelector('.pr-screen'), 'shot');
    if (!p.prints.length) set(p.box.querySelector('.pr-screen'), 'shot');
    set(p.txt.querySelector('[data-part="meta"]'), 'meta');
    set(p.txt.querySelector('[data-part="title"]'), 'title');
    set(p.txt.querySelector('[data-part="promise"]'), 'promise');
    if (!phone()) { rest.forEach((el, i) => set(el, `side-${i + 1}`)); set(p.obj, 'obj'); }
    p.props.forEach((el, i) => set(el, `prop-${i + 1}`));
  }
  function layerNames(l: HTMLElement, on: boolean) {
    const set = (sel: string, n: string) => name(l.querySelector(sel), on ? n : '');
    set('[data-vt="paper"]', 'paper'); set('[data-vt="shot"]', 'shot'); set('[data-vt="body"]', 'body');
    set('[data-vt="meta"]', 'meta'); set('[data-vt="title"]', 'title'); set('[data-vt="promise"]', 'promise');
    if (!phone()) { set('[data-vt="side-1"]', 'side-1'); set('[data-vt="side-2"]', 'side-2'); set('.ph-obj', 'obj'); }
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
      copy.querySelectorAll('source').forEach((s) => s.setAttribute('sizes', s.getAttribute('media') ? 'calc(100vw - 32px)' : '(max-width: 699.98px) calc(100vw - 32px), 800px'));
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
      c.querySelectorAll('img').forEach((im) => (im.loading = 'eager'));
      slot.replaceChildren(c);
    });
    return l;
  }

  function show(p: Proj) {
    open = p;
    p.el.classList.add('opened');
    document.body.append(layer!);
    emit('one:layer-open', p.slug);
    pauseField(true);
    deck.pause(true);
  }
  function settled(l: HTMLElement) {
    clear(l);
    l.querySelector<HTMLElement>('h1')?.focus({ preventScroll: true });
    steps = initStepper(l.querySelector('[data-steps]'), l);
    l.addEventListener('scroll', () => steps?.update(), { passive: true });
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
    layer = build(p);
    root.style.setProperty('--vt-k', String(vtk()));
    if (!canVT()) {
      show(p);
      if (motion() === 'full') layer.classList.add('fade');
      settled(layer);
      return;
    }
    /* the press before the open (spec 4.8: the front print lifts, 120 ms) */
    const front = deck.order(p)[0];
    front?.querySelector<HTMLElement>('.pr-in')?.animate([{ transform: 'none' }, { transform: 'scale(1.02)' }], { duration: 120, easing: 'cubic-bezier(.4, 0, .2, 1)', fill: 'forwards' });
    deckNames(p, true);
    const l = layer;
    root.classList.add('vt-open');
    vt = start(async () => {
      deckNames(p, false);
      front?.querySelector<HTMLElement>('.pr-in')?.getAnimations().forEach((a) => a.cancel());
      layerNames(l, true);
      show(p);
      await decode(l.querySelector<HTMLImageElement>('.hero img'));
    });
    vt.finished.finally(() => { vt = null; root.classList.remove('vt-open'); if (layer === l) settled(l); });
  }

  /* close: the reverse, onto the print that is in front of the deck now */
  function drop() {
    clearTimeout(clipT);
    steps?.destroy(); steps = null;
    layer?.remove(); layer = null;
    if (open) { open.el.classList.remove('opened'); emit('one:layer-close', open.slug); }
    pauseField(false);
    deck.pause(false);
  }
  function closeProject(o: { ua?: boolean } = {}) {
    if (!layer || !open) return;
    if (vt) vt.skipTransition();
    const p = open, l = layer;
    const done = () => p.btn.focus({ preventScroll: true });
    if (!canVT() || o.ua) {
      if (motion() === 'full' && !o.ua) {
        l.classList.add('fade-out');
        setTimeout(() => { if (layer === l) { drop(); done(); } }, 150);
      } else { drop(); done(); }
      return;
    }
    l.querySelectorAll('video').forEach((v) => v.pause());
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
    const nl = build(p);
    const peek = old.querySelector('.p-next-print');
    if (!canVT()) { drop(); deck.jump(slug); layer = nl; show(p); deck.pause(true); settled(nl); return; }
    name(old.querySelector('[data-vt="paper"]'), 'paper-old');
    name(old.querySelector('[data-vt="body"]'), 'body');
    name(peek?.querySelector('.pr-mount'), 'paper');
    name(peek?.querySelector('.pr-screen'), 'shot');
    vt = start(async () => {
      clear(old);
      clearTimeout(clipT); steps?.destroy(); steps = null;
      old.remove();
      from.el.classList.remove('opened');
      deck.pause(false); deck.jump(slug); deck.pause(true);
      layer = nl; open = p; p.el.classList.add('opened');
      name(nl.querySelector('[data-vt="paper"]'), 'paper');
      name(nl.querySelector('[data-vt="shot"]'), 'shot');
      name(nl.querySelector('[data-vt="body"]'), 'body');
      document.body.append(nl);
      await decode(nl.querySelector<HTMLImageElement>('.hero img'));
    });
    vt.finished.finally(() => { vt = null; if (layer === nl) settled(nl); });
  }

  /* ---- input ---- */
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
