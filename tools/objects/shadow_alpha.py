"""Rewrite an object's contact shadow from the old multiply map to black with alpha (S10).

  python3 tools/objects/shadow_alpha.py recorder [edk recto ...] [--out media/objects]

Why: the old shadow.{avif,webp} is an opaque grey map on a white ground, drawn with
mix-blend-mode: multiply. On iPhone the multiply can land in a composited layer that does not
hold the dark ground; multiply over transparent pixels returns the source, so the visitor saw a
white square with the object clipped into it (round-6 bug study, S10).

A grey multiply factor g gives g * B on a ground B. Black drawn with normal blending at alpha
1 - g gives B * (1 - (1 - g)) = g * B: the same pixels, with no blend mode. Black with alpha
also cannot turn into a box when a blend fails: over nothing it is a soft dark shape.

encode.py writes this form directly from the masters. This script converts the shipped files when
the masters are not at hand: it decodes the old AVIF and WebP, takes their mean (the two codec
errors partly cancel), and writes shadow-a.avif (quality 85) and shadow-a.webp (lossless alpha).
A new file name keeps a browser cache from pairing an old grey file with the new normal blend.
The old files are removed and the manifest's `shadow` entry is rewritten (blend "normal").
"""
import argparse
import json
import os

import numpy as np
from PIL import Image

ap = argparse.ArgumentParser()
ap.add_argument("objs", nargs="+")
ap.add_argument("--out", default="media/objects")
A = ap.parse_args()


def write_alpha(alpha8, out_dir):
    """alpha8: uint8 coverage of black. Returns the manifest's sources list."""
    rgba = np.zeros(alpha8.shape + (4,), np.uint8)
    rgba[..., 3] = alpha8
    im = Image.fromarray(rgba, "RGBA")
    sources = []
    for fmt in ("avif", "webp"):
        p = os.path.join(out_dir, f"shadow-a.{fmt}")
        if fmt == "avif":
            im.save(p, "AVIF", quality=85, speed=4)
        else:
            im.save(p, "WEBP", lossless=True, method=6)
        sources.append({"src": f"shadow-a.{fmt}", "type": f"image/{fmt}", "bytes": os.path.getsize(p)})
    return sources


for obj in A.objs:
    d = os.path.join(A.out, obj)
    man_p = os.path.join(d, "manifest.json")
    man = json.load(open(man_p))
    sh = man.get("shadow")
    if not sh:
        print(f"{obj}: no shadow, skipped")
        continue
    if sh.get("blend") == "normal":
        print(f"{obj}: already black with alpha, skipped")
        continue
    greys = [np.asarray(Image.open(os.path.join(d, s["src"])).convert("L")).astype(float) for s in sh["sources"]]
    g = np.mean(greys, axis=0)
    g[g >= 253] = 255                                   # far floor: exactly "no change", as encode.py
    alpha8 = np.round(255 - g).astype(np.uint8)
    sources = write_alpha(alpha8, d)
    for s in sh["sources"]:
        os.remove(os.path.join(d, s["src"]))
    man["shadow"] = {**sh, "blend": "normal", "min": round(float(g.min() / 255), 3), "sources": sources}
    if "bytes" in man and "shadow" in man["bytes"]:
        new_b = min(s["bytes"] for s in sources)        # the page loads one: AVIF where it decodes
        delta = new_b - man["bytes"]["shadow"]
        man["bytes"]["shadow"] = new_b

        def shift(t):                                   # every tier includes the shadow (encode.py §5)
            return {k: shift(v) for k, v in t.items()} if isinstance(t, dict) else t + delta
        if "tiers" in man["bytes"]:
            man["bytes"]["tiers"] = shift(man["bytes"]["tiers"])
    with open(man_p, "w") as f:
        json.dump(man, f, indent=1)                     # as encode.py writes it
    print(obj, "alpha max", int(alpha8.max()), "sources", [(s["src"], s["bytes"]) for s in sources])
