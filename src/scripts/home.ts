/* Home, direction B: the living index (pages/index.astro; docs/research/2026-10-home-b.md). Everything
   here enhances a page that is complete without it:
   - the sky: Istanbul's sun, computed here (no service), names the phase of the day, places a small sun
     on an arc and tints the light over the name;
   - "how long ago" for dated rows;
   - the light: a wide field in the page's colour and a lens over the name follow the pointer (a finger
     dragging across the name on touch) on the ui spring, and drift slowly on their own when left alone;
   - the dot after the name: one button that changes the light of the whole site (--accent: the mark's
     dot and the tab light follow), through edk, each product, the record and about;
   - plates: a fine pointer tilts the screens toward it and moves the plate's light; hovering a plate
     lends the page its colour, as Work does.
   Reduced motion: the light stands still (where the sun is), no tilt; the dot still changes colour. */
import { root, mq, reduce } from './env';
import { setAccent } from './accent';


function init(hero: HTMLElement) {
  const sky = document.querySelector<HTMLElement>('.hb-sky');
  const field = document.querySelector<HTMLElement>('.hb-field');
  const name = hero.querySelector<HTMLElement>('.hb-name')!;
  const lens = hero.querySelector<HTMLElement>('.hb-lens')!;
  const words = JSON.parse(hero.dataset.skyWords || '{}');
  let sunX = 0.7;   // where the sun is across the page, 0..1 (east to west)

  /* ---------- the sky ---------- */
  const paint = () => {
    const now = new Date();
    const s = sunAt(now);
    const day = sunDay(now);
    sunX = Math.min(0.92, Math.max(0.08, (s.az - 60) / 240));
    const c = skyColours(s.alt);
    if (sky) {
      sky.style.setProperty('--sky-a', c.a);
      sky.style.setProperty('--sky-b', c.b);
      sky.style.setProperty('--sky-i', String(c.i));
      sky.style.setProperty('--sx', `${Math.round((s.alt < -6 ? 1 - sunX : sunX) * 100)}%`);
      sky.classList.add('on');
    }
    const line = hero.querySelector<HTMLElement>('[data-skyline]');
    if (!line) return;
    const morning = s.H < 0;
    const ph = s.alt < -12 ? 'night' : s.alt < -4 ? 'twilight' : s.alt < 0.5 ? (morning ? 'dawn' : 'dusk') : s.alt < 7 && !morning ? 'golden' : s.alt < 7 ? 'dawn' : morning ? 'morning' : 'afternoon';
    const phase = line.querySelector('[data-phase]')!, sun = line.querySelector('[data-sun]')!;
    phase.textContent = `${words.phases?.[ph] ?? ph} ${words.in ?? 'in'} ${words.place ?? 'Istanbul'}`;
    /* the next sunrise or sunset, in Istanbul's time */
    const up = day.rise && now < day.rise ? ['sunrise', day.rise] : day.set && now < day.set ? ['sunset', day.set] : null;
    sun.textContent = up ? `${words[up[0] as string] ?? up[0]} ${hhmm(up[1] as Date)}` : '';
    /* the small sun on its arc: the share of daylight gone by (at night, the moon on the night's share) */
    const night = !day.rise || !day.set || now < day.rise || now > day.set;
    let f: number;
    if (!night) f = (now.getTime() - day.rise!.getTime()) / (day.set!.getTime() - day.rise!.getTime());
    else {
      const set = now > (day.set ?? now) ? day.set! : new Date(day.set!.getTime() - 864e5);
      const rise = now > (day.set ?? now) ? new Date(day.rise!.getTime() + 864e5) : day.rise!;
      f = (now.getTime() - set.getTime()) / (rise.getTime() - set.getTime());
    }
    f = Math.min(1, Math.max(0, f));
    line.style.setProperty('--ax', `${(f * 100).toFixed(1)}%`);
    line.style.setProperty('--ay', `${(Math.sin(f * Math.PI) * 100).toFixed(1)}%`);
    line.style.setProperty('--sky-a', night ? '#c9d4ff' : c.a);
    line.classList.toggle('night', night);
    line.classList.add('on');
  };
  paint();
  setInterval(paint, 60_000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { paint(); ago(); } });

  /* ---------- how long ago ---------- */
  const rtf = (() => { try { return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }); } catch { return null; } })();
  const ago = () => {
    if (!rtf) return;
    document.querySelectorAll<HTMLTimeElement>('time[data-ago]').forEach((t) => {
      const then = Date.parse(t.dateTime + 'T12:00:00+03:00');
      const days = Math.round((Date.now() - then) / 864e5);
      if (!Number.isFinite(days) || days < 0) return;
      t.textContent = days < 14 ? rtf.format(-days, 'day') : days < 60 ? rtf.format(-Math.round(days / 7), 'week') : rtf.format(-Math.round(days / 30), 'month');
      t.title = t.dateTime;
    });
  };
  ago();

  /* ---------- the light ---------- */
  const still = () => reduce() || /[?&]still/.test(location.search);
  type P = { x: number; y: number; vx: number; vy: number };
  const cur: P = { x: innerWidth * sunX, y: innerHeight * 0.3, vx: 0, vy: 0 };
  const tgt = { x: cur.x, y: cur.y };
  let lastInput = -1e9, raf = 0, last = 0, inView = true, lensOn = false;
  const t0 = performance.now();
  const K = 60, C = 2 * Math.sqrt(K) * 0.95;   // a soft spring: the light trails the hand
  const place = () => {
    if (field) field.style.translate = `${cur.x.toFixed(1)}px ${cur.y.toFixed(1)}px`;
    const r = name.getBoundingClientRect();
    lens.style.translate = `${(cur.x - r.left).toFixed(1)}px ${(cur.y - r.top).toFixed(1)}px`;
  };
  const frame = (t: number) => {
    raf = 0;
    const dt = Math.min(0.05, (t - (last || t)) / 1000); last = t;
    if (t - lastInput > 2600) {
      /* left alone: drift across the name, slowly, around the sun's side (periods 23 s and 17 s) */
      const r = name.getBoundingClientRect(), s = (t - t0) / 1000;
      tgt.x = r.left + r.width * (0.5 + (sunX - 0.5) * 0.5 + 0.34 * Math.sin(s * 2 * Math.PI / 23));
      tgt.y = r.top + r.height * (0.5 + 0.38 * Math.sin(s * 2 * Math.PI / 17 + 1.1));
    }
    cur.vx += (K * (tgt.x - cur.x) - C * cur.vx) * dt; cur.vy += (K * (tgt.y - cur.y) - C * cur.vy) * dt;
    cur.x += cur.vx * dt; cur.y += cur.vy * dt;
    place();
    if (inView && !document.hidden) raf = requestAnimationFrame(frame);
  };
  const run = () => { if (!raf && !still() && inView && !document.hidden) { last = 0; raf = requestAnimationFrame(frame); } };
  const aim = (x: number, y: number) => { tgt.x = x; tgt.y = y; lastInput = performance.now(); run(); };
  const startLight = () => {
    if (still()) {
      const r = name.getBoundingClientRect();
      cur.x = r.left + r.width * (0.5 + (sunX - 0.5) * 0.7); cur.y = r.top + r.height * 0.55; place();
    } else run();
    if (!lensOn) { lensOn = true; lens.classList.add('on'); }
  };
  /* the lens arrives once the name has composed (CSS, about 2 s; at once when it arrived composed) */
  setTimeout(startLight, root.classList.contains('hb-seen') || still() ? 0 : 1900);
  addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse' || e.pointerType === 'pen') aim(e.clientX, e.clientY); }, { passive: true });
  /* touch: a finger on the name carries the light (a vertical swipe still scrolls) */
  hero.addEventListener('pointerdown', (e) => { if (e.pointerType === 'touch') aim(e.clientX, e.clientY); }, { passive: true });
  hero.addEventListener('pointermove', (e) => { if (e.pointerType === 'touch') aim(e.clientX, e.clientY); }, { passive: true });
  addEventListener('scroll', () => { if (still() || !raf) place(); }, { passive: true });
  addEventListener('resize', () => { if (still()) startLight(); placeDot(); }, { passive: true });
  new IntersectionObserver(([en]) => { inView = en.isIntersecting; if (inView) run(); }, { rootMargin: '0px 0px 200px 0px' }).observe(hero);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) run(); });

  /* ---------- the first touch: a press on the name sends the family's colours through it again ---------- */
  name.addEventListener('pointerdown', () => {
    if (still() || docking) return;
    root.classList.add('hb-done');
    name.classList.remove('sweep'); void name.offsetWidth; name.classList.add('sweep');
  });

  /* ---------- the dot: changes the light ---------- */
  const lights = (hero.dataset.lights || '').split('|').filter(Boolean);
  const dot = hero.querySelector<HTMLElement>('.hb-dot');
  let li = 0;
  let current: string | null = null;
  let btn: HTMLButtonElement | null = null;
  function placeDot() {
    if (!dot || !btn) return;
    const s = hero.querySelector<HTMLElement>('.hb-stage')!.getBoundingClientRect(), d = dot.getBoundingClientRect();
    btn.style.left = `${d.left - s.left + d.width / 2}px`; btn.style.top = `${d.top - s.top + d.height / 2}px`;
    if (hint) { hint.style.left = btn.style.left; hint.style.top = btn.style.top; }
  }
  let hint: HTMLElement | null = null;
  if (dot && lights.length > 1) {
    btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'hb-dot-btn';
    btn.setAttribute('aria-label', hero.dataset.lightLabel || 'Change the light');
    hint = document.createElement('span');
    hint.className = 'hb-hint meta';
    hint.textContent = hero.dataset.lightHint || '';
    hint.setAttribute('aria-hidden', 'true');
    const stage = hero.querySelector('.hb-stage')!;
    stage.append(btn, hint);
    placeDot();
    document.fonts?.ready.then(placeDot);
    addEventListener('load', placeDot, { once: true });
    btn.addEventListener('click', () => {
      li = (li + 1) % lights.length;
      current = li === 0 ? null : lights[li];
      setAccent(current);
      dot.classList.remove('pop'); void dot.offsetWidth; dot.classList.add('pop');
      hint!.classList.remove('on');
      if (!still()) { lastInput = performance.now() - 2000; run(); }
    });
    let shown = false;
    btn.addEventListener('pointerenter', () => { if (!shown) { shown = true; hint!.classList.add('on'); setTimeout(() => hint!.classList.remove('on'), 2400); } });
    btn.addEventListener('focus', () => hint!.classList.add('on'));
    btn.addEventListener('blur', () => hint!.classList.remove('on'));
  }

  /* ---------- the first scroll: the name docks into the bar's mark ----------
     Over the first 60 % of a window the letters of the name rise away and fade, while the initials E, D
     and K travel to the bar's "edk", shrinking and turning into their lower-case twins, and the dot flies
     to the mark's dot, which answers when it lands. Scroll-linked and reversible; transforms only. */
  const mark = document.querySelector<HTMLElement>('.bar .mark');
  const chars = [...name.querySelectorAll<HTMLElement>('.ch')];
  type B = { el: HTMLElement; x: number; y: number; w: number; h: number; ini: number; r: number; uc?: HTMLElement | null; lc?: HTMLElement | null };
  let base: B[] = [], tgt3: DOMRect[] = [], dotB: B | null = null, dotT: DOMRect | null = null, scaleT = 0.12, landed = false, docking = false;
  const measure = () => {
    if (!mark) return;
    chars.forEach((c) => { c.style.transform = ''; c.style.opacity = ''; });
    if (dot) { dot.style.transform = ''; dot.style.opacity = ''; }
    const y0 = scrollY;
    let k = 0;
    base = chars.map((el, i) => {
      const r = el.getBoundingClientRect();
      const ini = el.classList.contains('ini') ? k++ : -1;
      return { el, x: r.left, y: r.top + y0, w: r.width, h: r.height, ini, r: ((i * 37) % 11) / 10 - 0.5, uc: el.querySelector<HTMLElement>('.uc'), lc: el.querySelector<HTMLElement>('.lc') };
    });
    const text = [...mark.childNodes].find((nd) => nd.nodeType === 3 && (nd.textContent || '').trim()) as Text | undefined;
    tgt3 = [];
    if (text) for (let i = 0; i < Math.min(3, text.length); i++) { const rg = document.createRange(); rg.setStart(text, i); rg.setEnd(text, i + 1); tgt3.push(rg.getBoundingClientRect()); }
    const md = mark.querySelector('.dot');
    dotT = md ? md.getBoundingClientRect() : null;
    if (dot) { const r = dot.getBoundingClientRect(); dotB = { el: dot, x: r.left, y: r.top + y0, w: r.width, h: r.height, ini: -1, r: 0 }; }
    scaleT = parseFloat(getComputedStyle(mark).fontSize) / parseFloat(getComputedStyle(name).fontSize);
    dock(true);
  };
  const sm = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  function dock(force = false) {
    if (!mark || !base.length || tgt3.length < 3) return;
    const q = still() ? 0 : Math.min(1, Math.max(0, scrollY / (innerHeight * 0.6)));
    if (q === 0) {
      if (docking || force) { docking = false; root.classList.remove('hb-docking'); chars.forEach((c) => { c.style.transform = ''; c.style.opacity = ''; }); base.forEach((b) => { if (b.uc) b.uc.style.opacity = ''; if (b.lc) b.lc.style.opacity = ''; });
        if (dot) { dot.style.transform = ''; dot.style.opacity = ''; } mark.style.opacity = ''; lens.style.opacity = ''; }
      landed = false;
      return;
    }
    if (!docking) { docking = true; root.classList.add('hb-docking', 'hb-done'); }
    const e = 1 - Math.pow(1 - q, 2.4);   // quick off the page's text, soft into the mark
    const sy = scrollY;
    for (const b of base) {
      if (b.ini >= 0) {
        const t = tgt3[b.ini];
        /* from where it stood on the first screen to the mark: held in the window while the page moves on */
        const tx = t.left + t.width / 2 - (b.x + b.w / 2), ty = t.top + t.height / 2 - (b.y + b.h / 2);
        b.el.style.transform = `translate(${(tx * e).toFixed(1)}px, ${(sy + ty * e).toFixed(1)}px) scale(${lerp(1, scaleT, e).toFixed(4)})`;
        b.el.style.opacity = String(1 - sm(0.9, 1, q));
        if (b.uc && b.lc) { const m = sm(0.2, 0.55, q); b.uc.style.opacity = String(1 - m); b.lc.style.opacity = String(m); }
      } else {
        const lift = e * (70 + 120 * (b.r + 0.5));
        b.el.style.transform = `translate(0, ${(sy * 0.55 - lift).toFixed(1)}px) rotate(${(b.r * e * 18).toFixed(2)}deg)`;
        b.el.style.opacity = String(1 - sm(0, 0.2, q + b.r * 0.04));
      }
    }
    if (dot && dotB && dotT) {
      const tx = dotT.left + dotT.width / 2 - (dotB.x + dotB.w / 2), ty = dotT.top + dotT.height / 2 - (dotB.y + dotB.h / 2);
      dot.style.transform = `translate(${(tx * e).toFixed(1)}px, ${(sy + ty * e).toFixed(1)}px) scale(${lerp(1, dotT.width / dotB.w, e).toFixed(4)})`;
      dot.style.opacity = String(1 - sm(0.92, 1, q));
    }
    mark.style.opacity = String(1 - sm(0.04, 0.2, q) + sm(0.88, 1, q));
    lens.style.opacity = String(1 - sm(0, 0.3, q));
    if (q >= 1 && !landed) { landed = true; mark.classList.remove('hb-land'); void mark.offsetWidth; mark.classList.add('hb-land'); root.classList.remove('hb-docking'); }
    if (q < 0.96) { landed = false; root.classList.add('hb-docking'); }
  }
  let dockRaf = 0;
  addEventListener('scroll', () => { if (!dockRaf) dockRaf = requestAnimationFrame(() => { dockRaf = 0; dock(); }); }, { passive: true });
  let mT = 0;
  addEventListener('resize', () => { clearTimeout(mT); mT = window.setTimeout(measure, 150); }, { passive: true });
  /* measure once the letters are in place: after the composition, or at once when it is not played */
  if (!still()) root.classList.add('hb-hold');   // site.ts keeps the bar in place while the name docks
  const settled = root.classList.contains('hb-seen') || still() || reduce();
  const ready = () => { measure(); };
  document.fonts?.ready.then(() => setTimeout(ready, settled ? 0 : 2700));
  if (!settled) setTimeout(() => root.classList.add('hb-done'), 3200);

  /* ---------- now building: the act follows the reading position ---------- */
  const show = document.querySelector<HTMLElement>('.hb-show');
  if (show) {
    const acts = [...show.querySelectorAll<HTMLElement>('.hb-act')];
    const items = [...show.querySelectorAll<HTMLElement>('.hb-index li')];
    let on = 0, lit = false;
    const step = () => {
      const r = show.getBoundingClientRect();
      const total = Math.max(1, show.offsetHeight - innerHeight);
      const p = Math.min(1, Math.max(0, -r.top / total));
      const n = acts.length;
      const idx = Math.min(n - 1, Math.floor(p * n));
      items.forEach((li, i) => { li.style.setProperty('--prog', String(Math.min(1, Math.max(0, p * n - i)).toFixed(3))); li.classList.toggle('on', i === idx); });
      if (idx !== on) { acts[on].classList.remove('is-on'); acts[idx].classList.add('is-on'); on = idx; if (lit) setAccent(acts[idx].dataset.light || null); }
      const inside = r.top < innerHeight * 0.5 && r.bottom > innerHeight * 0.5;
      if (inside !== lit) { lit = inside; setAccent(inside ? acts[idx].dataset.light || null : current); }
    };
    let sr = 0;
    addEventListener('scroll', () => { if (!sr) sr = requestAnimationFrame(() => { sr = 0; step(); }); }, { passive: true });
    addEventListener('resize', step, { passive: true });
    addEventListener('pageshow', step);
    step();
    /* a fine pointer tilts the screens toward it */
    acts.forEach((act) => {
      const pic = act.querySelector<HTMLElement>('.hb-screens');
      if (!pic) return;
      act.addEventListener('pointermove', (e) => {
        if (e.pointerType !== 'mouse' || still()) return;
        const r = act.getBoundingClientRect();
        const u = (e.clientX - r.left) / r.width, v = (e.clientY - r.top) / r.height;
        pic.style.setProperty('--ry', `${(-12 + (u - 0.5) * 12).toFixed(2)}deg`); pic.style.setProperty('--rx', `${(2 + (0.5 - v) * 7).toFixed(2)}deg`);
      }, { passive: true });
      act.addEventListener('pointerleave', () => { pic.style.removeProperty('--rx'); pic.style.removeProperty('--ry'); });
    });
  }
  void mq;
}

/* ---------- the sun over Istanbul (a short form of the NOAA solar position; good to a fraction of a degree) ---------- */
const LAT = 41.01, LON = 28.98, RAD = Math.PI / 180;
function sunAt(d: Date) {
  const n = d.getTime() / 864e5 + 2440587.5 - 2451545.0;
  const L = (280.46 + 0.9856474 * n) % 360;
  const g = ((357.528 + 0.9856003 * n) % 360) * RAD;
  const lam = (L + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * RAD;
  const eps = (23.439 - 4e-7 * n) * RAD;
  const dec = Math.asin(Math.sin(eps) * Math.sin(lam));
  const ra = Math.atan2(Math.cos(eps) * Math.sin(lam), Math.cos(lam));
  const gmst = (18.697374558 + 24.06570982441908 * n) % 24;
  let H = ((gmst * 15 + LON) * RAD - ra) % (2 * Math.PI);
  if (H > Math.PI) H -= 2 * Math.PI; if (H < -Math.PI) H += 2 * Math.PI;
  const lat = LAT * RAD;
  const alt = Math.asin(Math.sin(lat) * Math.sin(dec) + Math.cos(lat) * Math.cos(dec) * Math.cos(H));
  const az = Math.atan2(Math.sin(H), Math.cos(H) * Math.sin(lat) - Math.tan(dec) * Math.cos(lat)) / RAD + 180;
  return { alt: alt / RAD, az, H };
}
/** Today's sunrise and sunset in Istanbul (the sun's centre at -0.833°), found by stepping the day. */
function sunDay(now: Date) {
  const local = new Date(now.getTime() + 3 * 36e5);   // Istanbul is UTC+3 all year
  const start = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate()) - 3 * 36e5;
  let rise: Date | null = null, set: Date | null = null, prev = sunAt(new Date(start)).alt;
  for (let m = 2; m <= 1440; m += 2) {
    const t = new Date(start + m * 6e4), a = sunAt(t).alt;
    if (prev < -0.833 && a >= -0.833 && !rise) rise = t;
    if (prev >= -0.833 && a < -0.833 && !set) set = t;
    prev = a;
  }
  return { rise, set };
}
const fmt = (() => { try { return new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: 'Europe/Istanbul' }); } catch { return null; } })();
const hhmm = (d: Date) => (fmt ? fmt.format(d) : '');

/** The sky's two colours and its strength by the sun's altitude: night indigo, twilight iris, the
    coral and violet of dusk, the gold of the low sun, the cool pale of day. */
const STOPS: [number, string, string, number][] = [
  [-18, '#1d2a5e', '#121a3a', 0.6],
  [-8, '#3c3f94', '#5a3f86', 0.68],
  [-2, '#e0806a', '#7d4f9e', 0.78],
  [4, '#f3b886', '#e48a6c', 0.72],
  [14, '#cddcff', '#f3d9b8', 0.5],
  [40, '#d6e3ff', '#e9e5de', 0.42],
];
function skyColours(alt: number) {
  if (alt <= STOPS[0][0]) return { a: STOPS[0][1], b: STOPS[0][2], i: STOPS[0][3] };
  for (let j = 1; j < STOPS.length; j++) {
    if (alt <= STOPS[j][0]) {
      const [a0, ca0, cb0, i0] = STOPS[j - 1], [a1, ca1, cb1, i1] = STOPS[j];
      const f = (alt - a0) / (a1 - a0);
      return { a: mix(ca0, ca1, f), b: mix(cb0, cb1, f), i: +(i0 + (i1 - i0) * f).toFixed(3) };
    }
  }
  const z = STOPS[STOPS.length - 1];
  return { a: z[1], b: z[2], i: z[3] };
}
function mix(x: string, y: string, f: number) {
  const p = (h: string) => [1, 3, 5].map((o) => parseInt(h.slice(o, o + 2), 16));
  const a = p(x), b = p(y);
  return '#' + a.map((v, k) => Math.round(v + (b[k] - v) * f).toString(16).padStart(2, '0')).join('');
}

/* last, so the tables above exist when it runs */
const hero = document.querySelector<HTMLElement>('.hb-hero');
if (hero) init(hero);
