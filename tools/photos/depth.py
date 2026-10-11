"""Depth maps for About's "depth" photographs (docs/research/2026-10-photo-presentation.md, concept 3).

A depth map says how near each part of a photograph is (white near, black far). The photo-presentation
research found no way to run a depth model here (the model hosts are out of this container's reach), so
each map is painted the way the Codrops "fake 3D image" tutorial paints one by hand: from a few planes
the lead read off the photograph (the sky, the ground running to the horizon, the near things), and then
snapped to the photograph's own edges with a guided filter (He, Sun and Tang 2010), so a near thing
moves as one piece and its outline does not smear. The recipes are per photo, by its file stem in
content/photos/; a photo without a recipe gets the generic one (ground plane plus "dark is near").

Output: src/assets/photos/depth-<stem>.png, 256 px wide, 8-bit grey, committed (a few KB each).

  python3 tools/photos/depth.py
"""
import os
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = os.path.join(ROOT, 'content', 'photos')
OUT = os.path.join(ROOT, 'src', 'assets', 'photos')
W = 256


def box(a, r):
    """Mean over a (2r+1)^2 window, edges clamped (cumulative sums)."""
    p = np.pad(a, r + 1, mode='edge')
    c = p.cumsum(0).cumsum(1)
    n = 2 * r + 1
    s = c[n:, n:] - c[:-n, n:] - c[n:, :-n] + c[:-n, :-n]
    return s[: a.shape[0], : a.shape[1]] / (n * n)


def guided(guide, src, r, eps):
    mi, mp = box(guide, r), box(src, r)
    cov = box(guide * src, r) - mi * mp
    var = box(guide * guide, r) - mi * mi
    a = cov / (var + eps)
    b = mp - a * mi
    return box(a, r) * guide + box(b, r)


def smooth(x, a, b):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


def grid(h, w):
    y, x = np.mgrid[0:h, 0:w].astype(np.float64)
    return x / (w - 1), y / (h - 1)


def cat(rgb, lum, x, y):
    """A kitten on a sea wall at sunset: sky far, the sea from the horizon (0.585) toward the wall,
    the wall and the kitten (the dark shapes below the horizon) near."""
    d = np.where(y < 0.585, 0.02 + 0.06 * smooth(y, 0.3, 0.585), 0.12 + 0.3 * smooth(y, 0.585, 0.95))
    dark = smooth(0.2, 0.08, lum) * (y > 0.53)
    near = 0.78 + 0.18 * smooth(y, 0.6, 1.0)
    return d * (1 - dark) + near * dark


def bostanci(rgb, lum, x, y):
    """A station platform in the rain: the sky far; the platform a ground plane from its vanishing point
    (about 0.665 down) to the bottom edge; the billboard and its post on the right, the mast and the
    lamp-post as standing planes at their distance; the houses on the horizon far."""
    sky = (y < 0.6) & (rgb[..., 2] > rgb[..., 0] + 0.08)
    d = np.where(y < 0.665, 0.12, 0.12 + 0.84 * smooth(y, 0.665, 1.0) ** 0.9)
    d = np.where(sky, 0.0, d)
    # the billboard (x > 0.815, y 0.39-0.81) and its post
    bb = smooth(x, 0.80, 0.83) * smooth(y, 0.36, 0.40) * (1 - smooth(y, 0.80, 0.83))
    d = np.maximum(d, 0.62 * bb)
    post = smooth(x, 0.81, 0.82) * (1 - smooth(x, 0.86, 0.87)) * smooth(y, 0.6, 0.62) * (1 - smooth(y, 0.82, 0.83))
    d = np.maximum(d, 0.66 * post)
    # the mast (x about 0.64-0.68) from the top down to the platform, and the lamp arm
    mast = smooth(x, 0.635, 0.645) * (1 - smooth(x, 0.675, 0.685)) * smooth(y, 0.14, 0.15) * (1 - smooth(y, 0.70, 0.71))
    d = np.maximum(d, 0.36 * mast * (lum < 0.5))
    # the bench, at the platform's depth where it stands
    bench = smooth(x, 0.70, 0.71) * (1 - smooth(x, 0.82, 0.83)) * smooth(y, 0.71, 0.72) * (1 - smooth(y, 0.77, 0.78))
    d = np.maximum(d, 0.5 * bench)
    return d


def lens(rgb, lum, x, y):
    """The courtyard through a tinted lens held to the camera: the fingertip and the lens's rim nearest (one plane);
    through the lens, the lawn a ground plane from the path (about 0.62 down), the trees standing on it,
    the sky far."""
    inside = ((x - 0.555) / 0.49) ** 2 + ((y - 0.56) / 0.455) ** 2
    rim = smooth(inside, 0.86, 1.0)
    d = np.where(y < 0.62, 0.22 * smooth(y, 0.1, 0.62), 0.24 + 0.5 * smooth(y, 0.62, 1.0))
    sky = (rgb[..., 2] > rgb[..., 1] + 0.02) & (lum > 0.55) & (y < 0.55)
    d = np.where(sky, 0.0, d)
    # the near trunk on the left and the near tree crown on the right stand nearer than the lawn behind
    trunk = smooth(x, 0.05, 0.07) * (1 - smooth(x, 0.11, 0.13)) * smooth(y, 0.35, 0.4) * (1 - smooth(y, 0.66, 0.68))
    d = np.maximum(d, 0.42 * trunk)
    # the fingertip lies over the rim, outside the lens: the rim's plane carries it
    return d * (1 - rim) + 0.92 * rim


def generic(rgb, lum, x, y):
    return 0.15 + 0.5 * smooth(y, 0.5, 1.0) + 0.3 * smooth(0.25, 0.05, lum) * (y > 0.4)


RECIPES = {
    'cat-sunset-silhouette': cat,
    'bostanci-rain-dusk': bostanci,
    'park-through-lens': lens,
}


def main():
    for stem, recipe in RECIPES.items():
        f = os.path.join(SRC, f'{stem}.jpg')
        im = Image.open(f).convert('RGB')
        h = round(im.height * W / im.width)
        rgb = np.asarray(im.resize((W, h), Image.LANCZOS), dtype=np.float64) / 255
        lum = rgb @ np.array([0.2126, 0.7152, 0.0722])
        x, y = grid(h, W)
        d = recipe(rgb, lum, x, y)
        # snap to the photograph's edges, then soften what is left so a parallax never tears
        d = guided(lum, d, 6, 2e-3)
        d = guided(lum, d, 3, 1e-3)
        d = box(box(d, 2), 2)
        out = Image.fromarray(np.clip(d * 255 + 0.5, 0, 255).astype(np.uint8), 'L')
        path = os.path.join(OUT, f'depth-{stem}.png')
        out.save(path, optimize=True)
        print(f'{stem:24} {W}x{h} {os.path.getsize(path)} bytes')


if __name__ == '__main__':
    main()
