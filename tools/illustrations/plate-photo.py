"""Plate photo: crops and grades one of the owner's photographs for a background plate.

The crop puts the photo's vanishing point (VX, VY, in source pixels) at a fixed point of the plate,
so the page's construction lines meet the platform lines. The grade lowers colour and brightness so
the photograph sits under the Graphite ground as light, not as a picture.

Run with an isolated interpreter from the repo root:
  python3 -I tools/illustrations/plate-photo.py
"""
from PIL import Image, ImageEnhance

SRC = 'content/photos/bostanci-rain-dusk.jpg'
VX, VY = 900, 1700  # a point on the far platform, in source pixels (1932 x 2576); it keeps the
                    # waiting person off the page axis
PLATES = [  # scale, vanishing point on the plate, plate width, output
    (0.95, 720, 550, 1440, 'src/assets/plates/bostanci-photo-1440.webp'),
    (0.60, 450, 344, 900, 'src/assets/plates/bostanci-photo-900.webp'),
]

src = Image.open(SRC).convert('RGB')
for s, vpx, vpy, w, out in PLATES:
    x0, y0 = VX - vpx / s, VY - vpy / s
    crop = src.crop((round(x0), round(y0), round(x0 + w / s), src.height))
    crop = crop.resize((w, round((src.height - y0) * s)), Image.LANCZOS)
    crop = ImageEnhance.Color(crop).enhance(0.85)
    crop = ImageEnhance.Brightness(crop).enhance(0.62).convert('RGBA')
    fade = round(crop.height * 0.18)  # the bottom fades out, so the plate never ends on an edge
    alpha = Image.linear_gradient('L').resize((w, fade)).transpose(Image.FLIP_TOP_BOTTOM)
    a = Image.new('L', crop.size, 255); a.paste(alpha, (0, crop.height - fade)); crop.putalpha(a)
    crop.save(out, 'WEBP', quality=68, method=6)
    print(out, crop.size)
