/* The rail's two gestures on the two-page Home (review row V6, owner 2026-10-16 night; spec v3 §7 as
   revised in docs/design/rail-bloom.md). The beads at the right edge stay as they are. On top of them:

   1. Hold to scrub. A press held still (240 ms with a mouse, 320 ms with a finger) or a mouse drag takes
      the page. The column breathes open to one even slot per section, a lit thumb stays under the pointer,
      the page follows it on a short ease, and the section's name surfaces beside the thumb as it passes
      each bead. Each bead is a soft detent (a sine flattening of the mapping, never a snap) with a
      visual tick and, where the platform has one, a 5 ms vibration. Escape puts the page back.
   2. Tap to bloom. A short press or Enter opens the section names out of the exact point pressed: they
      sit on one arc that bulges out of the rail there, each name arriving with its own delay, the current
      one lit in its section's light. No box: the page behind blurs on a gradient from the right edge
      (strongest at the rail, nothing at the far side) and darkens with it, so the names come forward.
      Three entrances (`?bloom=drop|palm|fan`, default drop): in drop the beads themselves leave the rail
      along the arc and each name grows out of its own bead, while a pool of light spreads lower and wider
      (round six, S1); palm sweeps the names open along the arc around one pivot, like fingers opening; fan
      unfolds them one by one from the point outward. Every name stands one pitch apart (S13).
   3. Choose a name. It gives under the press, the bloom closes carrying it home to its bead, and the page
      travels there frame by frame (S14, travel.ts).

   Keyboard: the column is a button; Enter or Space opens the names with focus on the current one, the
   arrows, Home and End move, Escape closes. Reduced motion (or ?still): the same names appear at once,
   still; the scrub follows the pointer without the ease. Without JavaScript none of this exists and the
   platform's scrollbar stays (ADR-0013). */
import type { RailApi } from '../../scripts/rail';
import { root, reduce, params } from '../../scripts/env';
import { pauseField } from './bus';
import { travel, bezier, now, after } from './travel';

type Variant = 'drop' | 'palm' | 'fan';
const VARIANTS: Variant[] = ['drop', 'palm', 'fan'];
const pick = params.get('bloom') as Variant;
const VARIANT: Variant = VARIANTS.includes(pick) ? pick : 'drop';

/* measured numbers (docs/design/rail-bloom.md §3) */
const HOLD = { mouse: 240, touch: 320 };   // a press held this long, without moving, becomes a scrub
const SLOP = { mouse: 4, touch: 10 };      // travel before a press stops being a tap
const DETENT = 0.7;          // 0: linear mapping; 1: flat at each bead. 0.7 leaves 30 % speed at a bead
const FOLLOW = 70;           // ms: the page's time constant behind the scrub thumb
const ENTRY = 260;           // ms: the same at the start of a scrub, relaxing to FOLLOW in about 300 ms
const SLOT = [26, 36];       // the scrub column's pitch per section: least, most
/** the bloom's geometry, fine pointer and touch */
/* One pitch for every name (round six, S13: "equal spacing between the names; now some are very close and
   some not; it looks cheap"). The page's parts no longer open a gap between the names: the arc line breaks
   for `brk` px between two parts instead, so the rhythm stays even and the parts still read. */
const G = {
  fine: { pitch: 40, brk: 12, depth: 76, radius: 640, top: 92, bottom: 32, dotGap: 16, inset: 24 },
  touch: { pitch: 46, brk: 12, depth: 60, radius: 560, top: 84, bottom: 28, dotGap: 14, inset: 20 },
};
/* The beads' journey (S1: "no dots may stay behind at the side: the dots must move and become part of the
   new part, so it feels born from the rail"): out along the curve, back along it, and the chosen one
   carried home with its name (S14). ms. */
const TRIP = { out: 680, back: 440, carry: 640, press: 150 };
const glideE = bezier(0.22, 1, 0.36, 1);      // out: leaves fast, settles long (the glide spring's curve)
const backE = bezier(0.45, 0, 0.2, 1);        // back: gathers, then lands softly on its bead
const carryE = bezier(0.5, 0, 0.15, 1);

const vibrate = (ms: number) => { try { navigator.vibrate?.(ms); } catch { /* not allowed before a gesture */ } };
const still = () => reduce() || root.classList.contains('still');
const ease = (name: string, fb: string) => {
  const v = getComputedStyle(root).getPropertyValue(name).trim();
  return v && CSS.supports('transition-timing-function', v) ? v : fb;
};

/* Home's rail and an opened project's rail both use this; the root class stays while either lives */
let live = 0, uid = 0;

/** Home's rail, for the brief's project links (travel.ts): the section a target is in, and a dot's flight
    into that section's bead */
export interface HomeRail { api: RailApi; index(el: HTMLElement): number; fly(from: HTMLElement, i: number, color: string): void }
let home: HomeRail | null = null;
export const homeRail = () => home;

export function bloom(group: (el: HTMLElement) => string | undefined) {
  return (api: RailApi) => {
    const { nav, btn, links, marks, secs } = api;
    const n = secs.length;
    const ac = new AbortController();
    const sig = { signal: ac.signal };
    live++;
    root.classList.add('rail-bloom');
    nav.dataset.bloom = VARIANT;
    const id = 'bl' + uid++;
    const groups = secs.map((s) => group(s.el));
    const gstart = groups.map((g, i) => i > 0 && g !== groups[i - 1]);

    /* ---------- the parts: the veil (graded blur and shade), the effects layer, the dots in each row ---------- */
    const veil = document.createElement('div');
    veil.className = 'bl-veil';
    veil.setAttribute('aria-hidden', 'true');
    for (let k = 0; k < 4; k++) veil.append(document.createElement('i'));
    const fx = document.createElement('div');
    fx.className = 'bl-fx';
    fx.setAttribute('aria-hidden', 'true');
    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'bl-arc');
    const defs = document.createElementNS(NS, 'defs');
    const grad = document.createElementNS(NS, 'linearGradient');
    grad.id = id + '-g';
    grad.setAttribute('gradientUnits', 'userSpaceOnUse');
    grad.setAttribute('x1', '0'); grad.setAttribute('x2', '0');
    for (const [o, a] of [[0, 0], [0.18, 1], [0.82, 1], [1, 0]]) {
      const st = document.createElementNS(NS, 'stop');
      st.setAttribute('offset', String(o));
      st.setAttribute('stop-color', 'currentColor');
      st.setAttribute('stop-opacity', String(a));
      grad.append(st);
    }
    /* the breaks between the page's parts (S13): black bands in a mask over the arc */
    const mask = document.createElementNS(NS, 'mask');
    mask.id = id + '-m';
    mask.setAttribute('maskUnits', 'userSpaceOnUse');
    defs.append(grad, mask);
    const arcUp = document.createElementNS(NS, 'path'), arcDn = document.createElementNS(NS, 'path');
    for (const p of [arcUp, arcDn]) { p.setAttribute('stroke', `url(#${id}-g)`); p.setAttribute('mask', `url(#${id}-m)`); }
    svg.append(defs, arcUp, arcDn);
    const pool = document.createElement('i');
    pool.className = 'bl-pool';
    const thumb = document.createElement('i');
    thumb.className = 'bl-thumb';
    const tag = document.createElement('div');
    tag.className = 'bl-tag';
    const tagG = document.createElement('span');
    tagG.className = 'bl-tag-g';
    const tagN = document.createElement('span');
    tagN.className = 'bl-tag-n';
    const tagO = document.createElement('span');
    tagO.className = 'bl-tag-o';
    tag.append(tagG, tagN, tagO);
    fx.append(svg, pool, thumb, tag);
    nav.parentElement!.insertBefore(veil, nav);
    nav.parentElement!.insertBefore(fx, nav);
    const rows = links.map((a, i) => {
      const dot = document.createElement('i');
      dot.className = 'bl-dot';
      dot.setAttribute('aria-hidden', 'true');
      a.append(dot);
      if (gstart[i]) a.parentElement!.classList.add('bl-gs');
      return a.parentElement as HTMLElement;
    });

    const touch = () => root.classList.contains('rail-touch');
    const g = () => (touch() ? G.touch : G.fine);
    const axis = () => { const r = api.track.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };

    /* ---------- hold to scrub ---------- */
    type Press = { id: number; type: 'mouse' | 'touch'; x0: number; y0: number; s0: number; t: number; scrub: boolean };
    let press: Press | null = null;
    let target = 0, raf = 0, last = 0, shown = -1, slot = 32, top0 = 0, thumbY = 0;
    /* the follow's time constant: a scrub's first move (the page going to the held bead) starts at ENTRY and
       relaxes to FOLLOW, so taking the page reads as a glide, not a cut (round-four frames) */
    let tau = FOLLOW;

    /** pointer y to page y: bead j's centre is section j's start; between beads the page moves linearly,
        slowed near each bead by a sine detent (continuous and monotonic: never a snap) */
    const map = (y: number) => {
      const v = (y - top0) / slot - 0.5;
      const k = Math.round(v), d = v - k;
      const w = Math.max(-0.5, Math.min(n - 0.5, k + d - (DETENT / (2 * Math.PI)) * Math.sin(2 * Math.PI * d)));
      const max = api.max();
      if (w <= 0) return { y: 0, i: 0 };
      const j = Math.min(n - 1, Math.floor(w)), f = w - j;
      const a = api.start(j), b = j + 1 < n ? api.start(j + 1) : max;
      const span = j + 1 < n ? b - a : 2 * (max - a);   // half a slot below the last bead reaches the end
      /* rounded up: a section start can be fractional and the scroll position whole; landing below it would
         leave the rail naming the section before the one under the thumb */
      return { y: Math.min(max, Math.ceil(a + f * span)), i: j };
    };
    const layoutScrub = () => {
      const railH = nav.getBoundingClientRect().height;
      slot = Math.max(SLOT[0], Math.min(SLOT[1], Math.floor((railH + 8) / n)));
      nav.style.setProperty('--slot', slot + 'px');
      top0 = axis().y - (n * slot) / 2;
    };
    const follow = (t: number) => {
      raf = 0;
      const dt = last ? Math.min(64, t - last) : 16;
      last = t;
      const y = api.y();
      const k = still() ? 1 : 1 - Math.exp(-dt / tau);
      tau = Math.max(FOLLOW, tau - dt * 0.6);
      const next = Math.abs(target - y) < 0.5 ? target : y + (target - y) * k;
      api.setY(next, 'instant');
      echo();
      if (Math.abs(target - next) >= 0.5) raf = requestAnimationFrame(follow); else last = 0;
    };
    const showTag = (i: number, y: number, quiet: boolean) => {
      const a = axis();
      const lift = touch() && !quiet ? 52 : 0;   // above the finger, which covers the rail below its tip
      /* on touch the column is a 44 px button: the name keeps 12 px clear of its left edge, so the finger's
         target and the name never share pixels */
      const right = touch() ? innerWidth - btn.getBoundingClientRect().left + 12 : innerWidth - a.x + g().inset + (quiet ? 0 : 8);
      tag.style.setProperty('--x', right + 'px');
      tag.style.setProperty('--y', (y - lift) + 'px');
      tag.style.setProperty('--a', secs[i].a);
      tag.classList.toggle('quiet', quiet);
      tag.classList.add('on');
      if (i === shown) { echo(); return; }
      const dir = shown < 0 ? 0 : i > shown ? 1 : -1;
      shown = i;
      /* the part's name, unless it only repeats the section's ("The record" over "Record") */
      const gl = groups[i];
      tagG.textContent = gl && !gl.toLowerCase().includes(secs[i].label.toLowerCase()) ? gl : '';
      tagN.textContent = secs[i].label;
      tagO.textContent = `${tagG.textContent ? tagG.textContent + ' · ' : ''}${String(i + 1).padStart(2, '0')} / ${String(n).padStart(2, '0')}`;
      /* the roll fades through filter: opacity(), which multiplies with the CSS opacity, so a name that gives
         way to its title (echo) never flashes back in for the roll's 220 ms */
      echo();
      if (!still() && dir) tagN.animate([{ translate: `0 ${dir * 9}px`, filter: 'opacity(0.2) blur(2px)' }, { translate: '0 0', filter: 'opacity(1) blur(0)' }],
        { duration: 220, easing: 'cubic-bezier(.22, 1, .36, 1)' });
    };
    const hideTag = () => { tag.classList.remove('on', 'echo'); shown = -1; };
    /* No word shown twice (round five; round-four critique §3: on the phone "Eat Map" stood beside the
       project's own "Eat Map"). Each section's own title on the page is found once: the leaf elements of
       18 px type or more whose text is the section's name, or contains it, or is contained in it ("The
       record" for "Record", "Eren Deniz Kuyucaklıoğlu" for "Eren"). While one of them is in view, the big
       name beside the thumb steps back and the tag keeps only its part and the section's number
       ("Work · 03 / 10"), so the reader still feels where the thumb is and reads the name once, on the page. */
    const norm = (t: string) => t.replace(/\s+/g, ' ').trim().toLowerCase();
    const titles: (HTMLElement[] | undefined)[] = [];
    const titlesOf = (i: number) => (titles[i] ??= (() => {
      const l = norm(secs[i].label);
      return [secs[i].el, ...secs[i].el.querySelectorAll<HTMLElement>('*')].filter((e) => {
        if (e.closest('.rail, .bl-fx') || !e.textContent || e.childElementCount > 2) return false;
        const t = norm(e.textContent);
        if (t.length < 3 || t.length > 40 || !(t === l || t.includes(l) || l.includes(t))) return false;
        return parseFloat(getComputedStyle(e).fontSize) >= 18;
      });
    })());
    const echo = () => {
      if (shown < 0 || tag.classList.contains('quiet')) { tag.classList.remove('echo'); return; }
      const top = parseFloat(getComputedStyle(root).getPropertyValue('--bar-h')) || 64;
      const on = titlesOf(shown).some((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.bottom > top && r.top < innerHeight; });
      tag.classList.toggle('echo', on);
    };
    const moveThumb = (y: number) => {
      thumbY = Math.max(top0, Math.min(top0 + n * slot, y));
      const a = axis();
      thumb.style.setProperty('--x', a.x + 'px');
      thumb.style.setProperty('--y', thumbY + 'px');
      const m = map(thumbY);
      thumb.style.setProperty('--a', secs[m.i].a);
      if (m.i !== shown && shown >= 0 && press?.scrub) {
        vibrate(5);
        const mk = marks[m.i];
        mk.classList.remove('tick'); void mk.offsetWidth; mk.classList.add('tick');
      }
      showTag(m.i, thumbY, false);
      target = m.y;
      if (!raf) raf = requestAnimationFrame(follow);
    };
    const startScrub = () => {
      if (!press || press.scrub) return;
      if (open) close(false);
      press.scrub = true;
      clearTimeout(holdT);
      give(null);
      if (!btn.hasPointerCapture(press.id)) try { btn.setPointerCapture(press.id); } catch { /* gone */ }
      layoutScrub();
      nav.classList.add('is-scrub');
      veil.classList.add('scrub');
      fx.classList.add('scrub');
      root.classList.add('rail-grab');
      getSelection()?.removeAllRanges();
      vibrate(8);
      shown = -1;
      tau = ENTRY;
      moveThumb(press.y0);
    };
    const endScrub = (restore: boolean) => {
      if (!press) return;
      const p = press;
      press = null;
      clearTimeout(holdT);
      if (!p.scrub) return;
      nav.classList.remove('is-scrub');
      veil.classList.remove('scrub');
      fx.classList.remove('scrub');
      root.classList.remove('rail-grab');
      hideTag();
      if (restore) { cancelAnimationFrame(raf); raf = 0; last = 0; target = p.s0; api.setY(p.s0, 'instant'); }
      swallow = true;
      setTimeout(() => { swallow = false; }, 0);
    };

    let holdT = 0, swallow = false;
    btn.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      const type = e.pointerType === 'touch' ? 'touch' : 'mouse';
      press = { id: e.pointerId, type, x0: e.clientX, y0: e.clientY, s0: api.y(), t: performance.now(), scrub: false };
      /* a mouse owns its press at once; a finger only once held, so a swipe on the rail still scrolls */
      if (type === 'mouse') { e.preventDefault(); btn.setPointerCapture(e.pointerId); }
      clearTimeout(holdT);
      holdT = window.setTimeout(startScrub, HOLD[type]);
      if (!open && !still()) give(e.clientY);
    }, sig);
    btn.addEventListener('pointermove', (e) => {
      if (!press) {
        /* a mouse over the column: the name of the bead under it, quietly */
        if (e.pointerType === 'mouse' && !open) {
          const near = nearest(e.clientY);
          showTag(near, marks[near].getBoundingClientRect().top + marks[near].offsetHeight / 2, true);
        }
        return;
      }
      if (e.pointerId !== press.id) return;
      if (press.scrub) { e.preventDefault(); moveThumb(e.clientY); return; }
      const d = Math.hypot(e.clientX - press.x0, e.clientY - press.y0);
      if (d < SLOP[press.type]) return;
      if (press.type === 'mouse') startScrub();
      else { clearTimeout(holdT); press = null; give(null); }   // a swipe: the platform scrolls
    }, sig);
    btn.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse' && !press) hideTag(); }, sig);
    /* while a finger scrubs, its moves are the rail's, not the page's (the button keeps touch-action: pan-y
       so a plain swipe still scrolls) */
    btn.addEventListener('touchmove', (e) => { if (press?.scrub) e.preventDefault(); }, { passive: false, signal: ac.signal });
    btn.addEventListener('contextmenu', (e) => e.preventDefault(), sig);
    const up = (e: PointerEvent) => {
      if (!press || e.pointerId !== press.id) return;
      if (press.scrub) { endScrub(false); return; }
      const p = press;
      press = null;
      clearTimeout(holdT);
      give(null);
      if (e.type !== 'pointerup') return;
      swallow = true;
      setTimeout(() => { swallow = false; }, 0);
      if (open) close(false); else openAt(p.y0, nearest(p.y0), false);
    };
    btn.addEventListener('pointerup', up, sig);
    btn.addEventListener('pointercancel', (e) => { if (press && e.pointerId === press.id) { if (press.scrub) endScrub(false); else { clearTimeout(holdT); press = null; give(null); } } }, sig);
    btn.addEventListener('lostpointercapture', (e) => { if (press?.scrub && e.pointerId === press.id) endScrub(false); }, sig);
    /* the keyboard (and a pointer's click, which the press already handled) */
    btn.addEventListener('click', (e) => {
      if (swallow || e.detail !== 0) return;
      if (open) { close(true); return; }
      const c = Math.max(0, api.cur());
      const r = marks[c].getBoundingClientRect();
      openAt(r.top + r.height / 2, c, true);
    }, sig);

    /* the give (round five, review row V14: "the press point gives, then spreads wider, things open
       outward"): while a press is down, the beads around it sink toward the screen's edge and shrink, most
       at the press point and fading over about 18 px, as a surface gives under a fingertip. A tap then
       blooms out of that dimple; a hold turns it into the scrub; a swipe lets it go. The beads come back
       on their own 160 ms ease. */
    const give = (y: number | null) => {
      nav.classList.toggle('is-press', y !== null);
      marks.forEach((m) => {
        if (y === null) { m.style.removeProperty('--g'); return; }
        const r = m.getBoundingClientRect();
        const g = Math.exp(-(((r.top + r.height / 2 - y) / 18) ** 2));
        if (g > 0.02) m.style.setProperty('--g', g.toFixed(3)); else m.style.removeProperty('--g');
      });
    };
    const nearest = (y: number) => {
      let best = 0, bd = Infinity;
      marks.forEach((m, i) => { const r = m.getBoundingClientRect(); const d = Math.abs(r.top + r.height / 2 - y); if (d < bd) { bd = d; best = i; } });
      return best;
    };

    /* ---------- tap to bloom ---------- */
    let open = false, origin = { x: 0, y: 0 }, piv = { x: 0, y: 0 }, sy = 0, k0 = 0;
    let arcC = { cx: 0, R: 1, yc: 0 };
    const slots: { x: number; y: number; dx: number }[] = [];
    const dots = rows.map((li) => li.querySelector('.bl-dot') as HTMLElement);
    const texts = rows.map((li) => li.querySelector('.rail-t') as HTMLElement);
    /* the beads leave the rail only in `drop` (the owner's choice, S1); palm and fan keep the round-four motion */
    const travels = () => VARIANT === 'drop';
    const stopAll = () => rows.forEach((r, j) => { [r, dots[j], texts[j]].forEach((e) => e.getAnimations().forEach((x) => x.cancel())); });
    const showBeads = () => marks.forEach((m) => m.style.removeProperty('opacity'));

    /* ---------- the beads' journey (S1, S14) ----------
       A bead and its name's dot are one thing: the dot starts exactly on its bead, in the bead's shape, and
       the bead is hidden that same frame. The path follows the bloom: the dot leaves the rail sideways first,
       then glides along the arc to its row (back: along the arc first, then onto the rail). */
    /** the bead's centre and shape now (it may have changed while the names were out) */
    const bead = (j: number) => {
      const r = marks[j].getBoundingClientRect();
      const m = marks[j];
      /* the dot's own shape in the same state (rail.css .bl-dot): a line 3 x 22, a dot 4 x 4, a dash 8 x 2 */
      const [w, h] = m.classList.contains('on') ? [3, 22] : m.classList.contains('done') ? [4, 4] : [8, 2];
      return { x: r.left + r.width / 2, y: r.top + r.height / 2, sx: Math.max(0.3, r.width / w), sy: Math.max(0.1, r.height / h) };
    };
    const xAt = (y: number) => arcC.cx - Math.sqrt(Math.max(0, arcC.R * arcC.R - (y - arcC.yc) ** 2));
    /** the point at s (0: the bead, 1: the row) on bead j's path, relative to its row's dot */
    const at = (j: number, b: ReturnType<typeof bead>, s: number) => {
      const t = slots[j];
      const y = b.y + (t.y - b.y) * s;
      const p = 1 - (1 - Math.min(1, s * 1.8)) ** 2;
      return { dx: b.x + (xAt(y) - b.x) * p - t.x, dy: y - t.y };
    };
    /** keyframes for a trip: `fwd` from the bead out, else from the row home; `E` paces it; `shape` adds the
        bead's scale at the bead's end; `move` false keeps only the scale (the carried row moves the dot) */
    const trip = (j: number, fwd: boolean, E: (u: number) => number, shape = true, move = true) => {
      const b = bead(j), out: Keyframe[] = [];
      for (let q = 0; q <= 16; q++) {
        const u = q / 16, s = fwd ? E(u) : 1 - E(u);
        const pt = at(j, b, s);
        const g = Math.min(1, s * 2.2);   // the shape turns from the bead's to the dot's in the first part
        const sx = shape ? b.sx + (1 - b.sx) * g : 1, sy = shape ? b.sy + (1 - b.sy) * g : 1;
        out.push({ transform: `${move ? `translate(${pt.dx.toFixed(2)}px, ${pt.dy.toFixed(2)}px) ` : ''}scale(${sx.toFixed(3)}, ${sy.toFixed(3)})` });
      }
      return out;
    };
    /** the arc's breaks between the page's parts (S13) */
    const breaks = (ys: number[]) => {
      while (mask.firstChild) mask.firstChild.remove();
      const rect = (y: number, h: number, fill: string) => {
        const r = document.createElementNS(NS, 'rect');
        r.setAttribute('x', '0'); r.setAttribute('width', String(innerWidth));
        r.setAttribute('y', String(y)); r.setAttribute('height', String(h)); r.setAttribute('fill', fill);
        mask.append(r);
      };
      rect(0, innerHeight, '#fff');
      const brk = g().brk;
      ys.forEach((y, j) => { if (gstart[j]) rect((ys[j - 1] + y) / 2 - brk / 2, brk, '#000'); });
    };

    function openAt(y0: number, k: number, keyboard: boolean) {
      stopAll();
      clearPress();
      open = true;
      k0 = k;
      sy = api.y();
      hideTag();
      const geo = g();
      const a = axis();
      origin = { x: a.x, y: y0 };
      const vh = innerHeight;
      /* rows: the pressed section at the press point, the others above and below it, every one exactly one
         pitch apart (S13); the block is moved, whole, to fit between the bar and the bottom */
      let pitch = geo.pitch;
      const room = vh - geo.top - geo.bottom;
      if ((n - 1) * pitch > room) pitch = Math.max(30, room / (n - 1));
      const off = (j: number) => j * pitch;
      let ys = secs.map((_, j) => y0 + off(j) - off(k));
      const lo = geo.top + pitch / 2, hi = vh - geo.bottom - pitch / 2;
      const shift = ys[0] < lo ? lo - ys[0] : ys[n - 1] > hi ? hi - ys[n - 1] : 0;
      ys = ys.map((y) => y + shift);
      /* the arc: deepest at the press point, curving back toward the rail above and below it */
      const yc = Math.max(ys[0], Math.min(ys[n - 1], y0));
      /* the radius: at least the measured one, and large enough that the farthest name's bead stays `inset`
         clear of the rail (the sag of a circle at height f is R - sqrt(R² - f²)) */
      const far = Math.max(yc - ys[0], ys[n - 1] - yc) + pitch * 0.9;
      const sag = geo.depth - geo.inset;
      const R = Math.max(geo.radius, (far * far + sag * sag) / (2 * sag));
      const cx = a.x - geo.depth + R;
      piv = { x: cx, y: yc };
      arcC = { cx, R, yc };
      const nr = nav.getBoundingClientRect();
      slots.length = 0;
      rows.forEach((li, j) => {
        const x = xAt(ys[j]);
        slots.push({ x, y: ys[j], dx: a.x - x });
        li.style.setProperty('--r', (nr.right - x - 6) + 'px');   // the row ends 6 px past its dot's centre
        li.style.setProperty('--t', (ys[j] - nr.top - pitch / 2) + 'px');
        li.style.setProperty('--h', pitch + 'px');
      });
      nav.style.setProperty('--pitch', pitch + 'px');
      /* the arc's two halves, drawn from the press point outward */
      const pts = (from: number, to: number) => {
        const st = 24, out: string[] = [];
        for (let s = 0; s <= st; s++) { const y = from + (to - from) * s / st; out.push(`${s ? 'L' : 'M'}${(cx - Math.sqrt(Math.max(0, R * R - (y - yc) ** 2))).toFixed(1)} ${y.toFixed(1)}`); }
        return out.join(' ');
      };
      const y1 = ys[0] - pitch * 0.9, y2 = ys[n - 1] + pitch * 0.9;
      arcUp.setAttribute('d', pts(yc, y1));
      arcDn.setAttribute('d', pts(yc, y2));
      grad.setAttribute('y1', String(y1)); grad.setAttribute('y2', String(y2));
      breaks(ys);
      svg.setAttribute('viewBox', `0 0 ${innerWidth} ${vh}`);
      fx.style.setProperty('--ox', a.x + 'px');
      fx.style.setProperty('--oy', y0 + 'px');
      fx.style.setProperty('--a', secs[Math.max(0, api.cur())].a);
      veil.style.setProperty('--oy', y0 + 'px');

      nav.classList.add('is-bloom');
      /* the drifting field is under the blur: held still, the blur is drawn once instead of every frame */
      pauseField(true);
      veil.classList.add('on');
      fx.classList.add('on');
      btn.setAttribute('aria-expanded', 'true');
      if (!still()) enter(k);
      /* the beads are out on the arc now (still: they are there at once): none stays on the rail */
      if (travels()) marks.forEach((m) => { m.style.opacity = '0'; });
      if (keyboard) links[Math.max(0, api.cur())].focus({ preventScroll: true });
    }

    function enter(k: number) {
      const glide = ease('--kl-glide-ease', 'cubic-bezier(.22, 1, .36, 1)');
      const pop = ease('--kl-pop-ease', 'cubic-bezier(.34, 1.4, .64, 1)');
      const settle = ease('--kl-settle-ease', 'cubic-bezier(.22, 1, .36, 1)');
      const ink4 = getComputedStyle(root).getPropertyValue('--ink-4').trim() || '#827e78';
      const dim = { color: ink4 };
      for (const p of [arcUp, arcDn]) {
        const L = p.getTotalLength();
        p.style.strokeDasharray = `${L} ${L}`;
        p.animate([{ strokeDashoffset: L }, { strokeDashoffset: 0 }], { duration: VARIANT === 'fan' ? 520 + n * 30 : 640, easing: glide, fill: 'backwards' });
      }
      if (VARIANT === 'drop') pool.animate([
        { opacity: 0, transform: 'translate(-50%, -50%) scale(.12)' },
        { opacity: 1, transform: 'translate(-50%, -50%) scale(1.5, 1.35)', offset: 0.3 },
        { opacity: 1, transform: 'translate(-50%, -46%) scale(2.6, 4.4)' },
      ], { duration: 900, easing: 'cubic-bezier(.16, 1, .3, 1)', fill: 'backwards' });
      rows.forEach((li, j) => {
        const dk = Math.abs(j - k);
        const s = slots[j];
        const t = li.querySelector('.rail-t') as HTMLElement;
        if (VARIANT === 'drop') {
          /* the bead itself travels (S1): it leaves the rail from where it stood, nearest the press point first,
             and glides along the arc to its row; the name then grows out of its own dot, leftward, unblurring,
             so every name is born from its bead. Delays grow with the distance from the pressed row. */
          const delay = 30 + 34 * dk ** 0.85;
          dots[j].animate(trip(j, true, glideE), { duration: TRIP.out, delay, easing: 'linear', fill: 'backwards' });
          const td = delay + TRIP.out * 0.4;
          t.style.transformOrigin = '100% 50%';
          t.animate([{ opacity: 0, transform: 'translateX(22px) scale(.86)', filter: 'blur(6px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }],
            { duration: 520, delay: td, easing: glide, fill: 'backwards' });
          t.animate([dim, {}], { duration: 820, delay: td + 80, easing: 'ease-out', fill: 'backwards' });
        } else if (VARIANT === 'palm') {
          /* fingers opening: every name starts folded onto the pressed one and swings open around one pivot
             (the arc's centre), the outer ones last */
          const pr = li.getBoundingClientRect();
          const ang = (Math.atan2(s.y - piv.y, piv.x - s.x) - Math.atan2(slots[k].y - piv.y, piv.x - slots[k].x)) * 180 / Math.PI;
          li.style.transformOrigin = `${piv.x - pr.left}px ${piv.y - pr.top}px`;
          const delay = 30 + 22 * dk;
          li.animate([{ transform: `rotate(${ang}deg)` }, { transform: 'none' }], { duration: 820, delay, easing: pop, fill: 'backwards' });
          li.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 260, delay, easing: 'linear', fill: 'backwards' });
          t.animate([dim, {}], { duration: 700, delay: delay + 200, easing: 'ease-out', fill: 'backwards' });
        } else {
          /* fan: each name unfolds from the point outward, a fold of paper turning to face you */
          const delay = 30 + 48 * dk;
          const below = j >= k;
          li.style.transformOrigin = below ? '50% 0' : '50% 100%';
          li.animate([{ transform: `perspective(500px) translateY(${(slots[k].y - s.y) * 0.35}px) rotateX(${below ? -84 : 84}deg)` }, { transform: 'none' }],
            { duration: 560, delay, easing: settle, fill: 'backwards' });
          li.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 320, delay, easing: 'ease-out', fill: 'backwards' });
          t.animate([dim, {}], { duration: 600, delay: delay + 100, easing: 'ease-out', fill: 'backwards' });
        }
      });
    }
    function close(focusBtn: boolean, chosen = -1) {
      if (!open) return;
      open = false;
      btn.setAttribute('aria-expanded', 'false');
      if (!root.classList.contains('layer-open')) pauseField(false);
      veil.classList.remove('on');
      fx.classList.remove('on');
      const done = () => {
        nav.classList.remove('is-bloom');
        clearPress();
        stopAll();
        rows.forEach((r) => { r.style.transformOrigin = ''; });
        showBeads();
      };
      if (focusBtn) btn.focus({ preventScroll: true });
      if (still()) { done(); return; }
      stopAll();
      const outs: Animation[] = [];
      if (travels()) {
        /* the names go back into their dots, and the dots travel home along the arc, the farthest from the press
           point a beat later; each bead shows again the frame its dot lands on it */
        const dk = (j: number) => Math.abs(j - k0);
        rows.forEach((li, j) => {
          if (j === chosen) return;
          texts[j].style.transformOrigin = '100% 50%';
          /* from where the name is now (a press has already dimmed it): no from-keyframe */
          outs.push(texts[j].animate([{ opacity: 0, transform: 'translateX(16px) scale(.9)', filter: 'blur(3px)' }],
            { duration: 200, easing: 'cubic-bezier(.4, 0, 1, 1)', fill: 'forwards' }));
          const back = dots[j].animate(trip(j, false, backE), { duration: TRIP.back, delay: 60 + 16 * dk(j) ** 0.85, easing: 'linear', fill: 'forwards' });
          back.finished.then(() => { if (!open) marks[j].style.removeProperty('opacity'); }, () => {});
          outs.push(back);
        });
        if (chosen >= 0) outs.push(...carry(chosen));
      } else {
        rows.forEach((li, j) => {
          const s = slots[j];
          const keep = j === chosen;
          outs.push(li.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: `translate(${(origin.x - s.x) * 0.3}px, ${(origin.y - s.y) * (keep ? 0 : 0.18)}px) scale(${keep ? 1 : 0.94})` }],
            { duration: keep ? 340 : 200, delay: keep ? 60 : 0, easing: 'cubic-bezier(.4, 0, 1, 1)', fill: 'forwards' }));
        });
      }
      /* the names leave on the document timeline; the bloom ends when they have (a reopen cancels them) */
      Promise.all(outs.map((x) => x.finished)).then(() => { if (!open) done(); }, () => {});
    }

    /* S14: the chosen name is carried home. It waits a beat, lit, while the others leave; then the whole row
       rides back along the arc with its dot, the name drawing into the dot as it goes, and the dot lands on
       its bead in the bead's shape. The bead swells once in the section's light: the rail has taken the
       choice, and the page travels there. */
    function carry(j: number): Animation[] {
      const li = rows[j];
      const opts = { duration: TRIP.carry, delay: 110, easing: 'linear', fill: 'forwards' as const };
      const ride = li.animate(trip(j, false, carryE, false, true), opts);
      const shape = dots[j].animate(trip(j, false, carryE, true, false), opts);
      texts[j].style.transformOrigin = '100% 50%';
      const name = texts[j].animate([
        { opacity: 1, transform: 'none', filter: 'blur(0)' },
        { opacity: 1, transform: 'translateX(-2px)', filter: 'blur(0)', offset: 0.3 },
        { opacity: 0, transform: 'translateX(14px) scale(.62)', filter: 'blur(2px)' },
      ], { duration: TRIP.carry * 0.72, delay: 110 + TRIP.carry * 0.06, easing: 'cubic-bezier(.45, 0, .65, .3)', fill: 'forwards' });
      ride.finished.then(() => {
        if (open) return;
        const m = marks[j];
        m.style.removeProperty('opacity');
        const a = secs[j].a;
        m.animate([{ scale: '2.2 1.5', backgroundColor: a, boxShadow: `0 0 12px 2px ${a}` }, { scale: '1 1', boxShadow: '0 0 0 0 transparent' }],
          { duration: 760, easing: 'cubic-bezier(.22, 1, .36, 1)' });
      }, () => {});
      return [ride, shape, name];
    }

    /* the press on a name (S14: "the rail must acknowledge the click inside itself"): the name gives and takes
       its section's light, its dot grows into the lit line with a ring of light leaving it, and the other
       names step back; the close starts once the press has been seen for TRIP.press */
    let pressed = -1, pressT = 0;
    const clearPress = () => {
      nav.classList.remove('has-press');
      links.forEach((l) => l.classList.remove('is-press'));
      pressed = -1;
    };
    const pressOn = (i: number) => {
      if (pressed === i) return;
      clearPress();
      pressed = i;
      pressT = now();
      nav.classList.add('has-press');
      links[i].classList.add('is-press');
    };
    nav.addEventListener('pointerdown', (e) => {
      const a = (e.target as Element).closest<HTMLAnchorElement>('a.rail-i');
      if (!a || !open || e.button !== 0) return;
      pressOn(+a.dataset.i!);
    }, sig);
    nav.addEventListener('pointercancel', () => { if (open) clearPress(); }, sig);

    /* choosing a name: the press is seen, the bloom closes carrying the choice, the page travels */
    nav.addEventListener('click', (e) => {
      const a = (e.target as Element).closest<HTMLAnchorElement>('a.rail-i');
      if (!a || !open || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      const i = +a.dataset.i!;
      const keyboard = e.detail === 0;
      if (still()) { close(false, i); api.go(i, keyboard); return; }
      if (pressed !== i) pressOn(i);
      const wait = Math.max(0, TRIP.press - (now() - pressT));
      after(wait, () => {
        if (!open) return;
        close(false, i);
        travel(() => api.top(i), {
          scroller: { y: api.y, set: (y) => api.setY(y, 'instant'), vh: () => innerHeight },
          delay: 180,
          onLand: () => {
            if (!keyboard) return;
            const el = secs[i].el;
            if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
            el.focus({ preventScroll: true });
          },
        });
      });
    }, sig);
    nav.addEventListener('keydown', (e) => {
      if (!open) return;
      const i = links.indexOf(document.activeElement as HTMLAnchorElement);
      const to = e.key === 'ArrowDown' ? i + 1 : e.key === 'ArrowUp' ? i - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : -2;
      if (to === -2) return;
      e.preventDefault();
      links[Math.max(0, Math.min(n - 1, i < 0 ? Math.max(0, api.cur()) : to))].focus({ preventScroll: true });
    }, sig);
    nav.addEventListener('focusout', (e) => { if (open && !nav.contains(e.relatedTarget as Node | null) && e.relatedTarget) close(false); }, sig);
    /* Escape: a scrub puts the page back; an open bloom closes, before anything under it (an opened project) */
    addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      if (press?.scrub) { e.preventDefault(); e.stopImmediatePropagation(); endScrub(true); return; }
      if (open) { e.preventDefault(); e.stopImmediatePropagation(); close(nav.contains(document.activeElement)); }
    }, { capture: true, signal: ac.signal });
    /* the veil closes it; so does a swipe to the right, the wheel, or the page moving under it */
    veil.addEventListener('click', () => close(false), sig);
    let tx = 0, ty = 0;
    for (const t of [veil, nav]) {
      t.addEventListener('touchstart', (e) => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true, signal: ac.signal });
      t.addEventListener('touchend', (e) => { const c = e.changedTouches[0]; if (open && c.clientX - tx > 56 && Math.abs(c.clientY - ty) < 48) close(false); }, { passive: true, signal: ac.signal });
    }
    addEventListener('wheel', () => { if (open) close(false); }, { passive: true, signal: ac.signal });
    /* any scroller (the page, or an opened project's layer) */
    document.addEventListener('scroll', () => { if (open && Math.abs(api.y() - sy) > 48) close(false); }, { passive: true, capture: true, signal: ac.signal });
    addEventListener('resize', () => { if (open) close(false); }, { passive: true, signal: ac.signal });
    if (!nav.classList.contains('in-layer')) document.addEventListener('one:layer-open', () => { close(false); endScrub(false); }, sig);

    /* Home's rail answers the brief's project links (travel.ts, S33) */
    let me: HomeRail | null = null;
    if (!nav.classList.contains('in-layer')) {
      me = {
        api,
        index: (el) => secs.findIndex((s) => s.el === el || s.el.contains(el) || el.contains(s.el)),
        fly: (from, i, color) => flyInto(from, i, color),
      };
      home = me;
    }
    /** a copy of the link's dot flies on an arc into bead i, which takes the colour and swells as it lands */
    function flyInto(from: HTMLElement, i: number, color: string) {
      const a = from.getBoundingClientRect(), m = marks[i], b = m.getBoundingClientRect();
      const x0 = a.left + a.width / 2, y0 = a.top + a.height / 2;
      const dx = b.left + b.width / 2 - x0, dy = b.top + b.height / 2 - y0;
      const dot = document.createElement('i');
      dot.className = 'bl-fly';
      dot.setAttribute('aria-hidden', 'true');
      dot.style.cssText = `left:${x0}px;top:${y0}px;--c:${color}`;
      document.body.append(dot);
      const lift = Math.min(120, Math.abs(dx) * 0.18 + 40);
      const kf: Keyframe[] = [];
      for (let q = 0; q <= 16; q++) {
        const u = q / 16, e = glideE(u), arc = Math.sin(Math.PI * Math.min(1, e * 1.05));
        kf.push({ transform: `translate(${(dx * e).toFixed(1)}px, ${(dy * e - arc * lift).toFixed(1)}px) scale(${(1 + arc * 0.7 - (u > 0.85 ? (u - 0.85) * 3 : 0)).toFixed(3)})`, opacity: u > 0.9 ? 1 - (u - 0.9) * 10 : 1 });
      }
      const fl = dot.animate(kf, { duration: 680, easing: 'linear', fill: 'forwards' });
      fl.finished.then(() => {
        dot.remove();
        m.animate([{ scale: '2.4 1.6', backgroundColor: color, boxShadow: `0 0 14px 2px ${color}` }, { scale: '1 1', boxShadow: '0 0 0 0 transparent' }],
          { duration: 900, easing: 'cubic-bezier(.22, 1, .36, 1)' });
      }, () => dot.remove());
    }

    return {
      mode(m: string) { if (m !== 'rungs') { close(false); endScrub(false); } },
      destroy() {
        if (home === me) home = null;
        ac.abort();
        cancelAnimationFrame(raf);
        clearTimeout(holdT);
        if (--live <= 0) root.classList.remove('rail-bloom');
        root.classList.remove('rail-grab');
        veil.remove(); fx.remove();
      },
    };
  };
}
