"""The plate kit (engraving guide §1.10): a small, deterministic engraver for the ambient plates.

A plate is authored as an ordered list of shapes, back to front. Each shape is drawn into a label
raster, so a nearer shape hides a farther one without any polygon clipping. Each shape carries a
tone (0 = lit ground, 1 = the deepest shadow) and one or more hatch families. The engraver lays
each family's lines over the shape, samples the label and the tone along them, and turns every run
into a tapered filled outline whose width follows the tone: the line swells in shadow and thins to
nothing in light, as a burin line does. Contours are drawn from the authored vector geometry and
are kept only where the shape is visible; they are heavier on the side turned away from the light.

The output is one filled path per layer (merged, integer coordinates at QUANT units a pixel, relative
commands), so the file stays inside the guide's size budget. Nothing here reads a photograph.

Light: one source, upper left, about 40 degrees (guide §1.3). LIGHT is the direction toward it.
"""
from __future__ import annotations

import math
import random
from dataclasses import dataclass, field

import numpy as np
from PIL import Image, ImageDraw

LIGHT = np.array([-0.766, -0.643])  # toward the light: upper left, 40 degrees above the horizontal
QUANT = 4                            # output units per CSS px (0.25 px precision)


# ----------------------------------------------------------------------------- noise

def _hash2(ix, iy, seed):
    h = (ix * 374761393 + iy * 668265263 + seed * 2147483647) & 0xFFFFFFFF
    h = ((h ^ (h >> 13)) * 1274126177) & 0xFFFFFFFF
    return ((h ^ (h >> 16)) & 0xFFFF) / 65535.0


def noise(x, y, seed=0):
    """Smooth value noise in [0, 1], vectorised."""
    x = np.asarray(x, float); y = np.asarray(y, float)
    ix = np.floor(x).astype(np.int64); iy = np.floor(y).astype(np.int64)
    fx = x - ix; fy = y - iy
    sx = fx * fx * (3 - 2 * fx); sy = fy * fy * (3 - 2 * fy)
    a = _hash2(ix, iy, seed); b = _hash2(ix + 1, iy, seed)
    c = _hash2(ix, iy + 1, seed); d = _hash2(ix + 1, iy + 1, seed)
    return (a + (b - a) * sx) + ((c + (d - c) * sx) - (a + (b - a) * sx)) * sy


def fbm(x, y, seed=0, octaves=3):
    v = 0.0; amp = 0.5; f = 1.0
    for o in range(octaves):
        v = v + amp * noise(x * f, y * f, seed + o * 17)
        f *= 2.03; amp *= 0.5
    return v / (1 - 0.5 ** octaves)


# ----------------------------------------------------------------------------- geometry helpers

def resample(pts, step):
    """A polyline resampled at a fixed arc-length step."""
    pts = np.asarray(pts, float)
    if len(pts) < 2:
        return pts
    seg = np.hypot(*np.diff(pts, axis=0).T)
    s = np.concatenate([[0], np.cumsum(seg)])
    L = s[-1]
    if L < 1e-6:
        return pts[:1]
    n = min(40000, max(2, int(math.ceil(L / step)) + 1))
    t = np.linspace(0, L, n)
    return np.stack([np.interp(t, s, pts[:, 0]), np.interp(t, s, pts[:, 1])], axis=1)


def normals(pts):
    d = np.gradient(pts, axis=0)
    n = np.stack([-d[:, 1], d[:, 0]], axis=1)
    ln = np.hypot(n[:, 0], n[:, 1])[:, None]
    ln[ln == 0] = 1
    return n / ln


def rdp(pts, eps):
    """Ramer-Douglas-Peucker on an open polyline."""
    n = len(pts)
    if n < 3:
        return pts
    keep = np.zeros(n, bool); keep[0] = keep[-1] = True
    stack = [(0, n - 1)]
    while stack:
        i, j = stack.pop()
        if j <= i + 1:
            continue
        a, b = pts[i], pts[j]
        ab = b - a
        L = math.hypot(*ab)
        seg = pts[i + 1:j] - a
        if L < 1e-9:
            d = np.hypot(seg[:, 0], seg[:, 1])
        else:
            d = np.abs(seg[:, 0] * ab[1] - seg[:, 1] * ab[0]) / L
        k = int(np.argmax(d))
        if d[k] > eps:
            m = i + 1 + k
            keep[m] = True
            stack.append((i, m)); stack.append((m, j))
    return pts[keep]


def _rdp_idx(pts, eps):
    """Indices kept by Ramer-Douglas-Peucker on an open polyline of any dimension."""
    n = len(pts)
    if n < 3:
        return np.arange(n)
    keep = np.zeros(n, bool); keep[0] = keep[-1] = True
    stack = [(0, n - 1)]
    while stack:
        i, j = stack.pop()
        if j <= i + 1:
            continue
        a, b = pts[i], pts[j]
        ab = b - a
        L2 = float(ab @ ab)
        seg = pts[i + 1:j] - a
        if L2 < 1e-12:
            d = np.sqrt((seg * seg).sum(1))
        else:
            t = np.clip(seg @ ab / L2, 0, 1)
            d = np.sqrt(((seg - t[:, None] * ab) ** 2).sum(1))
        k = int(np.argmax(d))
        if d[k] > eps:
            m = i + 1 + k
            keep[m] = True
            stack.append((i, m)); stack.append((m, j))
    return np.flatnonzero(keep)


def bez(p0, p1, p2, p3, n=24):
    t = np.linspace(0, 1, n)[:, None]
    p0, p1, p2, p3 = map(np.asarray, (p0, p1, p2, p3))
    return (1 - t) ** 3 * p0 + 3 * (1 - t) ** 2 * t * p1 + 3 * (1 - t) * t * t * p2 + t ** 3 * p3


def arc(c, r, a0, a1, n=None, ry=None, rot=0.0):
    """An elliptical arc, angles in radians, y down."""
    ry = r if ry is None else ry
    if n is None:
        n = max(8, int(abs(a1 - a0) * max(r, ry) / 3))
    t = np.linspace(a0, a1, n)
    x = r * np.cos(t); y = ry * np.sin(t)
    cr, sr = math.cos(rot), math.sin(rot)
    return np.stack([c[0] + x * cr - y * sr, c[1] + x * sr + y * cr], axis=1)


def lerp_lines(A, B, s):
    return (1 - s) * A + s * B


def poly_area(p):
    x, y = p[:, 0], p[:, 1]
    return 0.5 * np.sum(x * np.roll(y, -1) - np.roll(x, -1) * y)


# ----------------------------------------------------------------------------- camera (3D)

class Camera:
    """A pinhole camera, y down on screen. World: x right, y up, z away from the eye."""

    def __init__(self, eye, target, f, cx, cy, up=(0, 1, 0)):
        self.eye = np.asarray(eye, float)
        fwd = np.asarray(target, float) - self.eye
        fwd /= np.linalg.norm(fwd)
        right = np.cross(np.asarray(up, float), fwd)
        right /= np.linalg.norm(right)
        upv = np.cross(fwd, right)
        self.R = np.stack([right, upv, fwd])
        self.f, self.cx, self.cy = f, cx, cy

    def cam(self, P):
        P = np.atleast_2d(np.asarray(P, float))
        return (P - self.eye) @ self.R.T

    def p(self, P):
        c = self.cam(P)
        z = np.maximum(c[:, 2], 1e-3)
        return np.stack([self.cx + self.f * c[:, 0] / z, self.cy - self.f * c[:, 1] / z], axis=1)

    def depth(self, P):
        return self.cam(P)[:, 2]


# ----------------------------------------------------------------------------- the plate

@dataclass
class Hatch:
    lines: list            # list of (N, 2) arrays
    t0: float = 0.1        # tone where the line appears
    t1: float = 0.6        # tone where it reaches full width
    w0: float = 0.45       # thinnest kept width (px)
    w1: float = 1.0        # full width (px)
    gamma: float = 1.0
    mask: object = None    # a width multiplier of its own (else the plate's)


@dataclass
class Shape:
    sid: int
    layer: str
    tone: object
    hatches: list = field(default_factory=list)
    group: int = 0         # shapes of one object share a group: contours see through each other


class Plate:
    def __init__(self, W, H, res=2, seed=1):
        self.W, self.H, self.res = W, H, res
        self.img = Image.new('I', (W * res, H * res), 0)
        self.draw = ImageDraw.Draw(self.img)
        self.shapes: dict[int, Shape] = {}
        self.layers: dict[str, list] = {}
        self.dots: dict[str, list] = {}
        self.strokes: dict[str, list] = {}
        self.order: list[str] = []
        self.rng = random.Random(seed)
        self.nid = 1
        self.density = None          # optional (H*res, W*res) multiplier on tone (focus falloff)
        self.label = None
        self.tonemap = None
        self.eps = 0.22              # outline simplification (px)
        self.hair = True             # straight even hairlines as strokes
        self.pending = []            # contours and lines, drawn after the label raster is complete
        self.mask = None

    # --- authoring --------------------------------------------------------
    def layer(self, name):
        if name not in self.layers:
            self.layers[name] = []; self.dots[name] = []; self.strokes[name] = []; self.order.append(name)
        return name

    def shape(self, polys, layer, tone=0.0, group=None):
        """Draw a shape (one polygon or a list of polygons, even-odd not supported: use separate shapes)."""
        self.layer(layer)
        sid = self.nid; self.nid += 1
        if isinstance(polys, np.ndarray) and polys.ndim == 2:
            polys = [polys]
        for p in polys:
            q = [(float(x) * self.res, float(y) * self.res) for x, y in np.asarray(p)]
            if len(q) >= 3:
                self.draw.polygon(q, fill=sid)
        self.shapes[sid] = Shape(sid, layer, tone, [], sid if group is None else group)
        return sid

    def erase(self, polys):
        """Clear a region of the label raster (a text clear zone, a window cut)."""
        if isinstance(polys, np.ndarray) and polys.ndim == 2:
            polys = [polys]
        for p in polys:
            self.draw.polygon([(float(x) * self.res, float(y) * self.res) for x, y in np.asarray(p)], fill=0)

    def hatch(self, sid, lines, **kw):
        self.shapes[sid].hatches.append(Hatch(lines=lines, **kw))

    # --- tone ---------------------------------------------------------------
    def bake(self):
        self.label = np.asarray(self.img, dtype=np.int32)
        H, W = self.label.shape
        ys, xs = np.mgrid[0:H, 0:W]
        X = (xs + 0.5) / self.res; Y = (ys + 0.5) / self.res
        tone = np.zeros((H, W), np.float32)
        # one sort of the label raster, then each shape's pixels as a slice (fast for thousands of shapes)
        flat = self.label.ravel()
        order = np.argsort(flat, kind='stable')
        sids, starts, counts = np.unique(flat[order], return_index=True, return_counts=True)
        Xf, Yf, tf = X.ravel(), Y.ravel(), tone.ravel()
        for sid, a, n in zip(sids, starts, counts):
            s = self.shapes.get(int(sid))
            if s is None:
                continue
            idx = order[a:a + n]
            if callable(s.tone):
                tf[idx] = np.clip(s.tone(Xf[idx], Yf[idx]), 0, 1.2)
            else:
                tf[idx] = s.tone
        tone = tf.reshape(H, W)
        if self.density is not None:
            tone *= self.density
        self.tonemap = tone

    def _sample(self, pts):
        ix = np.clip((pts[:, 0] * self.res).astype(int), 0, self.label.shape[1] - 1)
        iy = np.clip((pts[:, 1] * self.res).astype(int), 0, self.label.shape[0] - 1)
        inside = (pts[:, 0] >= 0) & (pts[:, 0] < self.W) & (pts[:, 1] >= 0) & (pts[:, 1] < self.H)
        return self.label[iy, ix] * inside, self.tonemap[iy, ix] * inside

    # --- engraving ----------------------------------------------------------
    def engrave(self, step=1.25, mask=None):
        """Turn every hatch family into tapered fills. mask(x, y) -> 0..1 multiplies width (fades)."""
        if self.label is None:
            self.bake()
        self.mask = mask
        for sid, s in self.shapes.items():
            for h in s.hatches:
                for line in h.lines:
                    pts = resample(line, step)
                    if len(pts) < 2:
                        continue
                    lab, tone = self._sample(pts)
                    k = np.clip((tone - h.t0) / max(1e-6, h.t1 - h.t0), 0, 1) ** h.gamma
                    w = np.where(lab == sid, h.w0 + (h.w1 - h.w0) * k, 0.0)
                    w[k <= 0] = 0
                    mk = h.mask if h.mask is not None else self._mask_for(s.layer)
                    if mk is not None:
                        w = w * mk(pts[:, 0], pts[:, 1])
                    w[w < h.w0 * 0.75] = 0
                    self._runs(pts, w, s.layer)
        for fn, args, kw in self.pending:
            fn(*args, **kw)
        self.pending = []
        if mask is not None:
            for L in self.order:
                mk = self._mask_for(L)
                if mk is not None:
                    self.dots[L] = [d for d in self.dots[L] if mk(np.array([d[0]]), np.array([d[1]]))[0] > 0.4]

    def _mask_for(self, layer):
        """The plate's mask may be one function or a dict by layer ('*' for the rest)."""
        m = self.mask
        if isinstance(m, dict):
            return m.get(layer, m.get('*'))
        return m

    def _runs(self, pts, w, layer, min_len=2.5, taper=3.5):
        on = w > 0
        if not on.any():
            return
        idx = np.flatnonzero(np.diff(np.concatenate([[0], on.astype(int), [0]])))
        for a, b in zip(idx[::2], idx[1::2]):
            if b - a < 2:
                continue
            seg = pts[a:b]; ws = w[a:b].copy()
            L = np.concatenate([[0], np.cumsum(np.hypot(*np.diff(seg, axis=0).T))])
            if L[-1] < min_len:
                continue
            # a straight hairline of even width: a taper below 0.75 px cannot be seen, so it is written as a
            # round-capped stroke (a quarter of the bytes); every heavier line is a tapered fill
            if self.hair and ws.max() < 0.75 and (ws.max() - ws.min()) < 0.12 and len(_rdp_idx(seg, 0.2)) == 2:
                self.strokes[layer].append((seg[[0, -1]], round(float(ws.mean()) * 0.9 * 8) / 8))
                continue
            # ends taper to 30 % (guide §1.2): lines that end, end thin
            e = np.minimum(L, L[-1] - L)
            ws *= 0.3 + 0.7 * np.clip(e / taper, 0, 1)
            self.layers[layer].append(self._outline(seg, ws))

    def _outline(self, pts, ws):
        n = normals(pts)
        # simplify the centre line and the width together (a width change counts 6x a position change),
        # so a hairline's taper is never simplified away
        keep = _rdp_idx(np.column_stack([pts, ws * 6]), self.eps)
        p, w, nn = pts[keep], ws[keep], n[keep]
        left = p + nn * (w[:, None] / 2)
        right = p - nn * (w[:, None] / 2)
        poly = np.concatenate([left, right[::-1]])
        if poly_area(poly) < 0:
            poly = poly[::-1]
        return poly

    def line(self, pts, layer, w=1.0, profile=None, step=1.0, sid=None, taper=4.0):
        """A free tapered line (a contour or a single drawn stroke). w: px; profile(t) scales it; sid: keep
        only where that shape (or its group) is visible on either side."""
        self.layer(layer)
        if self.label is None:
            self.pending.append((self._line, (pts, layer), dict(w=w, profile=profile, step=step, sid=sid, taper=taper)))
            return
        self._line(pts, layer, w=w, profile=profile, step=step, sid=sid, taper=taper)

    def _line(self, pts, layer, w=1.0, profile=None, step=1.0, sid=None, taper=4.0):
        pts = resample(pts, step)
        if len(pts) < 2:
            return
        t = np.linspace(0, 1, len(pts))
        ws = np.full(len(pts), float(w)) * (profile(t) if profile else 1.0)
        if sid is not None:
            if self.label is None:
                self.bake()
            nn = normals(pts)
            grp = self.shapes[sid].group
            ok = np.zeros(len(pts), bool)
            for sgn in (1, -1):
                lab, _ = self._sample(pts + nn * 1.6 * sgn)
                g = np.array([self.shapes[l].group if l in self.shapes else -1 for l in lab])
                ok |= g == grp
            ws = ws * ok
        mk = self._mask_for(layer)
        if mk is not None:
            ws = ws * mk(pts[:, 0], pts[:, 1])
            ws[ws < 0.35] = 0
        self._runs(pts, ws, layer, min_len=1.5, taper=taper)

    def contour(self, pts, sid, layer=None, w=1.2, closed=False, light=True, step=1.0, wmin=0.45):
        """The edge of a shape: visible parts only, heavier on the side turned from the light."""
        if self.label is None:
            self.pending.append((self.contour, (pts, sid), dict(layer=layer, w=w, closed=closed, light=light, step=step, wmin=wmin)))
            return
        s = self.shapes[sid]
        layer = layer or s.layer
        pts = np.asarray(pts, float)
        if closed:
            pts = np.concatenate([pts, pts[:1]])
        pts = resample(pts, step)
        if len(pts) < 2:
            return
        nn = normals(pts)
        lab_l, _ = self._sample(pts + nn * 1.6)
        lab_r, _ = self._sample(pts - nn * 1.6)
        grp = s.group
        gl = np.array([self.shapes[l].group if l in self.shapes else -1 for l in lab_l])
        gr = np.array([self.shapes[l].group if l in self.shapes else -1 for l in lab_r])
        vis = (gl == grp) | (gr == grp)
        ws = np.full(len(pts), float(w))
        if light:
            # outward normal: away from the inside of the shape
            out = np.where((gl == grp)[:, None], -nn, nn)
            facing = -(out @ LIGHT)      # 1 = turned fully from the light
            ws = w * (0.62 + 0.55 * np.clip(facing, 0, 1))
        ws = np.where(vis, np.maximum(ws, wmin), 0)
        mk = self._mask_for(layer)
        if mk is not None:
            ws = ws * mk(pts[:, 0], pts[:, 1])
            ws[ws < 0.35] = 0
        self._runs(pts, ws, layer, min_len=1.5, taper=3.0)

    def dot(self, x, y, layer, r=0.6):
        self.layer(layer)
        self.dots[layer].append((x, y, r))

    def stroke(self, pts, layer, w=0.6):
        """A plain hairline (only for lines under 12 px or deliberate rules); kept rare."""
        self.layer(layer)
        self.strokes[layer].append((np.asarray(pts, float), w))

    def stipple(self, sid, t0, t1, spacing=3.2, r=0.55, layer=None, jitter=0.9, mask=None):
        """Dots on a tone band only: transitions (guide §1.3)."""
        if self.label is None:
            self.bake()
        s = self.shapes[sid]
        layer = layer or s.layer
        ys, xs = np.nonzero(self.label[::int(self.res * spacing), ::int(self.res * spacing)] == sid)
        for yy, xx in zip(ys, xs):
            x = (xx * spacing) + self.rng.uniform(-jitter, jitter) * spacing * 0.5
            y = (yy * spacing) + self.rng.uniform(-jitter, jitter) * spacing * 0.5
            lab, tone = self._sample(np.array([[x, y]]))
            if lab[0] != sid:
                continue
            t = tone[0]
            if t < t0 or t > t1:
                continue
            k = 1 - abs((t - t0) / (t1 - t0) * 2 - 1)
            if mask is not None:
                k *= float(mask(np.array([x]), np.array([y]))[0])
            if self.rng.random() < k:
                self.dot(x, y, layer, r)

    # --- output -------------------------------------------------------------
    def layer_bbox(self, name, pad=4):
        pts = [p for p in self.layers.get(name, [])]
        pts += [s[0] for s in self.strokes.get(name, [])]
        if self.dots.get(name):
            pts.append(np.array([[d[0], d[1]] for d in self.dots[name]]))
        if not pts:
            return (0, 0, self.W, self.H)
        a = np.concatenate(pts)
        x0, y0 = np.floor(a.min(0) - pad); x1, y1 = np.ceil(a.max(0) + pad)
        return (int(max(0, x0)), int(max(0, y0)), int(min(self.W, x1)), int(min(self.H, y1)))

    def svg_layer(self, name, q=QUANT):
        parts = []
        for poly in self.layers.get(name, []):
            P = np.round(poly * q).astype(np.int64)
            if len(P) < 3:
                continue
            d = np.diff(P, axis=0)
            keep = np.any(d != 0, axis=1)
            d = d[keep]
            if len(d) < 2:
                continue
            s = f"M{P[0,0]} {P[0,1]}l" + _nums(d.ravel()) + "z"
            parts.append(s)
        fill = "".join(parts)
        dots = self.dots.get(name, [])
        dpath = ""
        if dots:
            byr: dict[float, list] = {}
            for x, y, r in dots:
                byr.setdefault(round(r, 2), []).append((x, y))
            dpath = []
            for r, pts in byr.items():
                ss = "".join(f"M{round(x*q)} {round(y*q)}h0" for x, y in pts)
                dpath.append((r, ss))
        byw: dict[float, list] = {}
        for pts, w in self.strokes.get(name, []):
            P = np.round(pts * q).astype(np.int64)
            d = np.diff(P, axis=0)
            byw.setdefault(w, []).append(f"M{P[0,0]} {P[0,1]}l" + _nums(d.ravel()))
        spath = [(w, "".join(v)) for w, v in byw.items()]
        return fill, dpath, spath

    def svg(self, layers_alpha: dict, ink='currentColor', cls='', extra_defs='', q=QUANT, title=None, ids=True, crop=None):
        W, H = self.W, self.H
        x0, y0 = 0, 0
        if crop:
            x0, y0, x1, y1 = crop
            W, H = x1 - x0, y1 - y0
        out = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x0*q} {y0*q} {W*q} {H*q}" width="{W}" height="{H}"'
               + (f' class="{cls}"' if cls else '') + ' aria-hidden="true" focusable="false">']
        if title:
            out.append(f'<title>{title}</title>')
        if extra_defs:
            out.append(f'<defs>{extra_defs}</defs>')
        for name in self.order:
            a = layers_alpha.get(name)
            if a is None:
                continue
            fill, dots, strokes = self.svg_layer(name, q)
            gid = f' id="{name}"' if ids else ''
            out.append(f'<g{gid} fill="{ink}" fill-opacity="{a}">')
            if fill:
                out.append(f'<path d="{fill}"/>')
            for r, d in (dots or []):
                out.append(f'<path d="{d}" fill="none" stroke="{ink}" stroke-opacity="{a}" stroke-width="{round(2*r*q,1)}" stroke-linecap="round"/>')
            for w, d in strokes:
                out.append(f'<path d="{d}" fill="none" stroke="{ink}" stroke-opacity="{a}" stroke-width="{round(w*q,1)}" stroke-linecap="round"/>')
            out.append('</g>')
        out.append('</svg>')
        return "".join(out)


def _nums(a):
    s = []
    for v in a:
        v = int(v)
        s.append(f"{v}" if v < 0 else f" {v}")
    r = "".join(s)
    return r[1:] if r.startswith(" ") else r


# ----------------------------------------------------------------------------- hatch families

def parallel(angle_deg, spacing, bbox, jitter=0.0, rng=None, wobble=0.0, seed=0):
    """Straight parallel lines at an angle over a bbox (x0, y0, x1, y1)."""
    x0, y0, x1, y1 = bbox
    a = math.radians(angle_deg)
    d = np.array([math.cos(a), math.sin(a)]); n = np.array([-d[1], d[0]])
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    R = math.hypot(x1 - x0, y1 - y0) / 2 + 2
    lines = []
    k = -R
    i = 0
    rng = rng or random.Random(seed)
    while k <= R:
        o = np.array([cx, cy]) + n * (k + (rng.uniform(-jitter, jitter) if jitter else 0))
        p = np.stack([o - d * R, o + d * R])
        if wobble:
            p = resample(p, 6)
            t = np.arange(len(p))
            p = p + n * (wobble * (fbm(t * 0.08, i * 1.7, seed) - 0.5))[:, None]
        lines.append(p)
        k += spacing; i += 1
    return lines


def rays(vp, through, spacing_px_at, bbox):
    """A pencil of lines through a vanishing point, spaced spacing px apart along the reference line
    `through` (a horizontal y or a vertical x given as ('y', value) / ('x', value))."""
    x0, y0, x1, y1 = bbox
    axis, v = through
    lines = []
    if axis == 'y':
        xs = np.arange(x0 - (x1 - x0), x1 + (x1 - x0), spacing_px_at)
        for x in xs:
            p1 = np.array(vp, float); p2 = np.array([x, v], float)
            d = p2 - p1; d /= np.linalg.norm(d)
            lines.append(np.stack([p1, p1 + d * 6000]))
    else:
        ys = np.arange(y0 - (y1 - y0), y1 + (y1 - y0), spacing_px_at)
        for y in ys:
            p1 = np.array(vp, float); p2 = np.array([v, y], float)
            d = p2 - p1; d /= np.linalg.norm(d)
            lines.append(np.stack([p1, p1 + d * 6000]))
    return lines


def ruled(A, B, n, dist='even', ext=0.0):
    """Lines interpolated between two boundary polylines (contour hatching on a curved form).
    dist 'cos' packs lines toward both edges, as the turn of a cylinder does."""
    A = np.asarray(A, float); B = np.asarray(B, float)
    m = max(len(A), len(B))
    A = resample(A, max(1.0, _len(A) / (m * 1.0))) if len(A) != m else A
    B = resample(B, max(1.0, _len(B) / (m * 1.0))) if len(B) != m else B
    m = min(len(A), len(B)); A = A[:m]; B = B[:m]
    out = []
    for k in range(n + 1):
        s = k / n
        if dist == 'cos':
            s = (1 - math.cos(math.pi * s)) / 2
        L = lerp_lines(A, B, s)
        if ext:
            d0 = L[0] - L[1]; d1 = L[-1] - L[-2]
            L = np.concatenate([[L[0] + d0 / max(1e-6, np.linalg.norm(d0)) * ext], L, [L[-1] + d1 / max(1e-6, np.linalg.norm(d1)) * ext]])
        out.append(L)
    return out


def across(A, B, n, dist='even'):
    """Lines that run from curve A to curve B (n of them), e.g. the generators of a cylinder."""
    A = np.asarray(A, float); B = np.asarray(B, float)
    A = resample(A, _len(A) / 200); B = resample(B, _len(B) / 200)
    m = min(len(A), len(B))
    out = []
    for k in range(n + 1):
        s = k / n
        if dist == 'cos':
            s = (1 - math.cos(math.pi * s)) / 2
        i = s * (m - 1)
        i0 = int(math.floor(i)); i1 = min(m - 1, i0 + 1); f = i - i0
        a = A[i0] * (1 - f) + A[i1] * f
        b = B[i0] * (1 - f) + B[i1] * f
        out.append(np.stack([a, b]))
    return out


def concentric(c, r0, r1, spacing, ry_ratio=1.0, rot=0.0, a0=0, a1=2 * math.pi):
    out = []
    r = r0
    while r <= r1:
        out.append(arc(c, r, a0, a1, ry=r * ry_ratio, rot=rot))
        r += spacing
    return out


def _len(p):
    p = np.asarray(p, float)
    return float(np.sum(np.hypot(*np.diff(p, axis=0).T))) if len(p) > 1 else 0.0


# ----------------------------------------------------------------------------- tone helpers

def lin(x0, y0, x1, y1, t0, t1):
    """A linear tone ramp from (x0, y0) at t0 to (x1, y1) at t1."""
    dx, dy = x1 - x0, y1 - y0
    L2 = dx * dx + dy * dy

    def f(X, Y):
        s = np.clip(((X - x0) * dx + (Y - y0) * dy) / L2, 0, 1)
        return t0 + (t1 - t0) * s
    return f


def radial(cx, cy, r, t_in, t_out, power=1.0):
    def f(X, Y):
        s = np.clip(np.hypot(X - cx, Y - cy) / r, 0, 1) ** power
        return t_in + (t_out - t_in) * s
    return f


def add(*fs):
    def f(X, Y):
        v = 0
        for g in fs:
            v = v + (g(X, Y) if callable(g) else g)
        return v
    return f


def mul(*fs):
    def f(X, Y):
        v = 1
        for g in fs:
            v = v * (g(X, Y) if callable(g) else g)
        return v
    return f


def nz(scale, amp, seed=0, base=0.0):
    def f(X, Y):
        return base + amp * (fbm(X / scale, Y / scale, seed) - 0.5)
    return f


def edge_fade(H, top=0.18, bottom=0.18, W=None, left=0.0, right=0.0):
    """Width multiplier that falls to zero over the outer bands of the box (guide §1.8)."""
    def f(X, Y):
        v = np.ones_like(X, dtype=float)
        if top:
            v = v * np.clip(Y / (H * top), 0, 1) ** 1.3
        if bottom:
            v = v * np.clip((H - Y) / (H * bottom), 0, 1) ** 1.3
        if W and left:
            v = v * np.clip(X / (W * left), 0, 1) ** 1.3
        if W and right:
            v = v * np.clip((W - X) / (W * right), 0, 1) ** 1.3
        return v
    return f


def rect(x0, y0, x1, y1):
    return np.array([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], float)


def clear_zone(boxes, pad=24, soft=40):
    """Width multiplier that is zero inside text boxes (plus pad) and eases back over `soft` px."""
    def f(X, Y):
        v = np.ones_like(X, dtype=float)
        for (x0, y0, x1, y1) in boxes:
            dx = np.maximum(np.maximum(x0 - pad - X, X - x1 - pad), 0)
            dy = np.maximum(np.maximum(y0 - pad - Y, Y - y1 - pad), 0)
            d = np.hypot(dx, dy)
            v = v * np.clip(d / soft, 0, 1)
        return v
    return f
