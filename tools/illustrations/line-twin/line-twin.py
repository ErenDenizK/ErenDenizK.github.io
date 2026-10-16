"""Line twin: a traced line drawing of one of the owner's photographs (design spec 7.4).

Steps: crop, median 5, upscale, Gaussian blur, gradient magnitude, non-maximum suppression, a
threshold per horizontal band (a busy band, such as the station buildings, takes a higher
percentile so that only its strong edges stay), dilate 3, then potrace. potrace drops every blob
smaller than --turd pixels: this removes the speckles. The SVG is the master; render.mjs turns it
into ink-coloured alpha bitmaps for the page.

Run with an isolated interpreter:
  python3 -I line-twin.py SRC OUT_STEM --crop x0,y0,x1,y1 --scale 1.6 \
      --bands "0:0.30:93,0.30:0.52:97,0.52:1:91" --turd 120
Band spec: start:end:percentile, start and end as fractions of the crop height.
"""
import argparse
import subprocess

import numpy as np
from PIL import Image, ImageFilter

ap = argparse.ArgumentParser()
ap.add_argument('src')
ap.add_argument('out')
ap.add_argument('--crop', required=True)
ap.add_argument('--scale', type=float, default=1.6)
ap.add_argument('--bands', default='0:1:90')
ap.add_argument('--turd', type=int, default=120)
ap.add_argument('--blur', type=float, default=2.2)
ap.add_argument('--dilate', type=int, default=3)
a = ap.parse_args()

x0, y0, x1, y1 = map(int, a.crop.split(','))
sc = a.scale
im = Image.open(a.src).crop((x0, y0, x1, y1)).convert('L')
im = im.filter(ImageFilter.MedianFilter(5))
im = im.resize((int(im.width * sc), int(im.height * sc)), Image.LANCZOS).filter(ImageFilter.GaussianBlur(a.blur * sc))
g = np.asarray(im, dtype=np.float32)
gx = np.zeros_like(g)
gy = np.zeros_like(g)
gx[:, 1:-1] = g[:, 2:] - g[:, :-2]
gy[1:-1, :] = g[2:, :] - g[:-2, :]
m = np.hypot(gx, gy)

# keep the local maxima across the gradient direction (non-maximum suppression)
ang = (np.rad2deg(np.arctan2(gy, gx)) + 180) % 180
n = np.zeros_like(m)


def sh(x, dy, dx):
    return np.roll(np.roll(x, dy, 0), dx, 1)


for lo, hi, d in [(0, 22.5, (0, 1)), (157.5, 180, (0, 1)), (22.5, 67.5, (1, 1)), (67.5, 112.5, (1, 0)), (112.5, 157.5, (1, -1))]:
    sel = (ang >= lo) & (ang < hi)
    # strict on one side, so a plateau keeps one pixel and every line is one pixel wide before the dilation
    keep = (m > sh(m, d[0], d[1])) & (m >= sh(m, -d[0], -d[1]))
    n[sel & keep] = m[sel & keep]

h = m.shape[0]
b = np.zeros(m.shape, dtype=np.uint8)
for band in a.bands.split(','):
    s, e, p = band.split(':')
    r0, r1 = int(float(s) * h), int(float(e) * h)
    t = np.percentile(m[r0:r1], float(p))
    b[r0:r1] = (n[r0:r1] > t).astype(np.uint8) * 255

bi = Image.fromarray(b)
if a.dilate > 1:
    bi = bi.filter(ImageFilter.MaxFilter(a.dilate))
# potrace traces black: the lines are written black on white
Image.fromarray(255 - np.asarray(bi)).convert('1').save(a.out + '.pbm')
subprocess.run(['potrace', '-s', '-t', str(a.turd), '-a', '1.1', '-O', '0.6', '--flat',
                '-o', a.out + '.svg', a.out + '.pbm'], check=True)
print(a.out + '.svg', bi.size)
