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
      Three entrances (`?bloom=drop|palm|fan`, default drop): drop rises from the point while a pool of
      light spreads lower and wider; palm sweeps the names open along the arc around one pivot, like
      fingers opening; fan unfolds them one by one from the point outward.

   Keyboard: the column is a button; Enter or Space opens the names with focus on the current one, the
   arrows, Home and End move, Escape closes. Reduced motion (or ?still): the same names appear at once,
   still; the scrub follows the pointer without the ease. Without JavaScript none of this exists and the
   platform's scrollbar stays (ADR-0013). */
import type { RailApi } from '../../scripts/rail';
import { root, reduce, params } from '../../scripts/env';
import { pauseField } from './bus';

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
const G = {
  fine: { pitch: 40, gap: 14, depth: 76, radius: 640, top: 92, bottom: 32, dotGap: 16, inset: 24 },
  touch: { pitch: 46, gap: 10, depth: 60, radius: 560, top: 84, bottom: 28, dotGap: 14, inset: 20 },
};

const vibrate = (ms: number) => { try { navigator.vibrate?.(ms); } catch { /* not allowed before a gesture */ } };
const still = () => reduce() || root.classList.contains('still');
const ease = (name: string, fb: string) => {
  const v = getComputedStyle(root).getPropertyValue(name).trim();
  return v && CSS.supports('transition-timing-function', v) ? v : fb;
};

/* Home's rail and an opened project's rail both use this; the root class stays while either lives */
let live = 0;

export function bloom(group: (el: HTMLElement) => string | undefined) {
  return (api: RailApi) => {
    const { nav, btn, links, marks, secs } = api;
    const n = secs.length;
    const ac = new AbortController();
    const sig = { signal: ac.signal };
    live++;
    root.classList.add('rail-bloom');
    nav.dataset.bloom = VARIANT;
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
    grad.id = 'bl-arc-g';
    grad.setAttribute('gradientUnits', 'userSpaceOnUse');
    grad.setAttribute('x1', '0'); grad.setAttribute('x2', '0');
    for (const [o, a] of [[0, 0], [0.18, 1], [0.82, 1], [1, 0]]) {
      const st = document.createElementNS(NS, 'stop');
      st.setAttribute('offset', String(o));
      st.setAttribute('stop-color', 'currentColor');
      st.setAttribute('stop-opacity', String(a));
      grad.append(st);
    }
    defs.append(grad);
    const arcUp = document.createElementNS(NS, 'path'), arcDn = document.createElementNS(NS, 'path');
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
    tag.append(tagG, tagN);
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
      if (i === shown) return;
      const dir = shown < 0 ? 0 : i > shown ? 1 : -1;
      shown = i;
      /* the part's name, unless it only repeats the section's ("The record" over "Record") */
      const gl = groups[i];
      tagG.textContent = gl && !gl.toLowerCase().includes(secs[i].label.toLowerCase()) ? gl : '';
      tagN.textContent = secs[i].label;
      if (!still() && dir) tagN.animate([{ opacity: 0.2, translate: `0 ${dir * 9}px`, filter: 'blur(2px)' }, { opacity: 1, translate: '0 0', filter: 'blur(0)' }],
        { duration: 220, easing: 'cubic-bezier(.22, 1, .36, 1)' });
    };
    const hideTag = () => { tag.classList.remove('on'); shown = -1; };
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
      else { clearTimeout(holdT); press = null; }   // a swipe: the platform scrolls
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
      if (e.type !== 'pointerup') return;
      swallow = true;
      setTimeout(() => { swallow = false; }, 0);
      if (open) close(false); else openAt(p.y0, nearest(p.y0), false);
    };
    btn.addEventListener('pointerup', up, sig);
    btn.addEventListener('pointercancel', (e) => { if (press && e.pointerId === press.id) { if (press.scrub) endScrub(false); else { clearTimeout(holdT); press = null; } } }, sig);
    btn.addEventListener('lostpointercapture', (e) => { if (press?.scrub && e.pointerId === press.id) endScrub(false); }, sig);
    /* the keyboard (and a pointer's click, which the press already handled) */
    btn.addEventListener('click', (e) => {
      if (swallow || e.detail !== 0) return;
      if (open) { close(true); return; }
      const c = Math.max(0, api.cur());
      const r = marks[c].getBoundingClientRect();
      openAt(r.top + r.height / 2, c, true);
    }, sig);

    const nearest = (y: number) => {
      let best = 0, bd = Infinity;
      marks.forEach((m, i) => { const r = m.getBoundingClientRect(); const d = Math.abs(r.top + r.height / 2 - y); if (d < bd) { bd = d; best = i; } });
      return best;
    };

    /* ---------- tap to bloom ---------- */
    let open = false, origin = { x: 0, y: 0 }, piv = { x: 0, y: 0 }, sy = 0;
    const slots: { x: number; y: number; dx: number }[] = [];

    function openAt(y0: number, k: number, keyboard: boolean) {
      rows.forEach((r) => r.getAnimations().forEach((x) => x.cancel()));
      open = true;
      sy = api.y();
      hideTag();
      const geo = g();
      const a = axis();
      origin = { x: a.x, y: y0 };
      const vh = innerHeight;
      /* rows: the pressed section at the press point, the others above and below it, one pitch apart and a
         gap between the page's parts; the block is moved, whole, to fit between the bar and the bottom */
      let pitch = geo.pitch;
      const gapsAll = gstart.filter(Boolean).length;
      const room = vh - geo.top - geo.bottom;
      if ((n - 1) * pitch + gapsAll * geo.gap > room) pitch = Math.max(30, (room - gapsAll * geo.gap) / (n - 1));
      const off = (j: number) => j * pitch + gstart.slice(0, j + 1).filter(Boolean).length * geo.gap;
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
      const xAt = (y: number) => cx - Math.sqrt(Math.max(0, R * R - (y - yc) ** 2));
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
          /* from the press point: each name rises out of it, its own delay by its distance from the point */
          const delay = 40 + 30 * dk ** 0.85;
          /* all the way from the rail, and 70 % of the way from the press height: the names leave the point in
             order instead of from one pixel, so none is ever drawn over another */
          const ox = origin.x - s.x, oy = (origin.y - s.y) * 0.7;
          li.animate([{ transform: `translate(${ox}px, ${oy}px) scale(.5)` }, { transform: 'none' }], { duration: 760, delay, easing: glide, fill: 'backwards' });
          /* the name is still unseen while the drop leaves the point, so nothing piles up there */
          li.animate([{ opacity: 0, filter: 'blur(10px)' }, { opacity: 0, filter: 'blur(8px)', offset: 0.16 }, { opacity: 1, filter: 'blur(0)' }],
            { duration: 560, delay, easing: 'cubic-bezier(.33, 1, .68, 1)', fill: 'backwards' });
          t.animate([dim, {}], { duration: 900, delay: delay + 120, easing: 'ease-out', fill: 'backwards' });
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
      const done = () => { nav.classList.remove('is-bloom'); rows.forEach((r) => { r.getAnimations().forEach((x) => x.cancel()); r.style.transformOrigin = ''; }); };
      if (focusBtn) btn.focus({ preventScroll: true });
      if (still()) { done(); return; }
      const outs = rows.map((li, j) => {
        li.getAnimations().forEach((x) => x.cancel());
        const s = slots[j];
        const keep = j === chosen;
        return li.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: `translate(${(origin.x - s.x) * 0.3}px, ${(origin.y - s.y) * (keep ? 0 : 0.18)}px) scale(${keep ? 1 : 0.94})` }],
          { duration: keep ? 340 : 200, delay: keep ? 60 : 0, easing: 'cubic-bezier(.4, 0, 1, 1)', fill: 'forwards' });
      });
      /* the names leave on the document timeline; the bloom ends when they have (a reopen cancels them) */
      Promise.all(outs.map((x) => x.finished)).then(() => { if (!open) done(); }, () => {});
    }

    /* choosing a name goes there; the chosen one leaves last */
    nav.addEventListener('click', (e) => {
      const a = (e.target as Element).closest<HTMLAnchorElement>('a.rail-i');
      if (!a || !open || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      const i = +a.dataset.i!;
      api.go(i, e.detail === 0);
      close(false, i);
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

    return {
      mode(m: string) { if (m !== 'rungs') { close(false); endScrub(false); } },
      destroy() {
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
