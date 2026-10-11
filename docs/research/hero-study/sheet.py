"""Sizes (360, 120) for every render, and the contact sheet with the current edk poster."""
import os
from PIL import Image, ImageDraw, ImageFont

H = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(H, "out")
CUR = "/home/user/Portfolio/dist/media/objects/edk/poster-1200.webp"
ITEMS = [("edk (current)", CUR), ("cat · rest", "cat-rest"), ("cat · play", "cat-play"),
         ("dot · rest", "dot-rest"), ("dot · hop", "dot-hop"), ("conductor · rest", "conductor-rest"),
         ("conductor · downbeat", "conductor-up"), ("triplet · front (e)", "triplet-e"),
         ("triplet · side (d)", "triplet-d"), ("triplet · top (k)", "triplet-k"),
         ("triplet · three-quarter", "triplet-q")]
F = "/usr/share/fonts/opentype/inter/Inter-Medium.otf"
font = ImageFont.truetype(F, 17) if os.path.exists(F) else ImageFont.load_default()
small = ImageFont.truetype(F, 13) if os.path.exists(F) else ImageFont.load_default()

tiles = []
for label, key in ITEMS:
    src = key if key.startswith("/") else os.path.join(OUT, f"{key}-poster.webp")
    if not os.path.exists(src):
        continue
    im = Image.open(src).convert("RGB")
    if not key.startswith("/"):
        for s in (360, 120):
            im.resize((s, s), Image.LANCZOS).save(os.path.join(OUT, f"{key}-{s}.webp"), quality=90)
    tiles.append((label, im))

T, G, cols = 360, 16, 4
rows = (len(tiles) + cols - 1) // cols
cell_h = T + 34 + 120 + 10
W = cols * T + (cols + 1) * G
Ht = 56 + rows * (cell_h + G) + G
sheet = Image.new("RGB", (W, Ht), (10, 10, 11))
d = ImageDraw.Draw(sheet)
d.text((G, 18), "Home hero object study, 2026-10-11 — each tile at 360 px, with its 120 px phone size below",
       fill=(200, 205, 215), font=font)
for i, (label, im) in enumerate(tiles):
    x = G + (i % cols) * (T + G)
    y = 56 + (i // cols) * (cell_h + G)
    sheet.paste(im.resize((T, T), Image.LANCZOS), (x, y))
    d.rectangle([x, y, x + T - 1, y + T - 1], outline=(40, 42, 48))
    d.text((x + 2, y + T + 8), label, fill=(225, 228, 235) if i else (150, 200, 255), font=font)
    sheet.paste(im.resize((120, 120), Image.LANCZOS), (x, y + T + 34))
    d.text((x + 130, y + T + 34 + 100), "120 px", fill=(110, 114, 124), font=small)
p = os.path.join(H, "sheet.webp")
q = 88
while True:
    sheet.save(p, quality=q, method=6)
    if os.path.getsize(p) <= 500_000 or q < 40:
        break
    q -= 6
print(p, sheet.size, os.path.getsize(p) // 1024, "KB", "q", q)
