"""A glass object's poster with alpha (round 6, row S4), for places where plus-lighter cannot be trusted
(inside an isolated group, over a transparent box, or on iOS: the round-6 bug study of the recorder).
The posters are drawn on black with the ground subtracted, so the light of a pixel is its brightest
channel: alpha = max(r, g, b) and colour = rgb / alpha. Over black this is the poster exactly; over the
page's dark grounds it differs from plus-lighter by a few levels.

  python3 tools/objects/alpha.py media/objects/<name>/poster-1200.webp src/one/work/objects/<name>-glass.png [800]"""
import sys
from PIL import Image
src, out = sys.argv[1], sys.argv[2]
size = int(sys.argv[3]) if len(sys.argv) > 3 else 800
im = Image.open(src).convert('RGB').resize((size, size), Image.LANCZOS)
px = im.load()
o = Image.new('RGBA', im.size)
po = o.load()
for y in range(im.height):
    for x in range(im.width):
        r, g, b = px[x, y]
        a = max(r, g, b)
        if a < 3:
            po[x, y] = (0, 0, 0, 0)
            continue
        po[x, y] = (min(255, r * 255 // a), min(255, g * 255 // a), min(255, b * 255 // a), a)
o.save(out, optimize=True)
print(out, o.size)
