"""Subset the two site faces to what the site uses (craft audit §3.5).

Inputs: the Fontsource variable files in node_modules (build inputs only, OFL-1.1).
Outputs: src/fonts/*.woff2, committed; the site never loads fonts from a third party.

  pip install fonttools brotli
  python3 tools/fonts/subset.py

Axes are narrowed to the range the type system uses, and Latin is cut to Basic Latin,
Latin-1 and the punctuation the copy uses; the Turkish letters outside Latin-1 go in a
second, tiny file (unicode-range picks it up only when the page contains them).
"""
import io
import os
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools import subset

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
NM = os.path.join(ROOT, 'node_modules', '@fontsource-variable')
OUT = os.path.join(ROOT, 'src', 'fonts')

LATIN = 'U+0020-007E,U+00A0-00FF,U+0131,U+2010-2014,U+2018-201A,U+201C-201E,U+2022,U+2026,U+2032,U+2039-203A,U+20AC,U+2122'
TR = 'U+011E-011F,U+0130,U+015E-015F'

FACES = {
    'inter': {'axes': {'wght': (400, 600), 'opsz': (14, 32)}},
    'newsreader': {'axes': {'wght': (400, 500), 'opsz': (16, 72)}},
}

def build(face, sub, unicodes, out_name):
    src = os.path.join(NM, face, 'files', f'{face}-{sub}-opsz-normal.woff2')
    f = TTFont(src)
    opts = subset.Options()
    opts.flavor = 'woff2'
    opts.layout_features = ['kern', 'liga', 'calt', 'locl', 'tnum', 'lnum', 'pnum', 'case', 'ccmp', 'mark', 'mkmk']
    opts.name_IDs = ['*']
    opts.notdef_outline = True
    sub_ = subset.Subsetter(opts)
    sub_.populate(unicodes=subset.parse_unicodes(unicodes))
    sub_.subset(f)
    buf = io.BytesIO()
    f.flavor = None
    f.save(buf)
    buf.seek(0)
    f = instancer.instantiateVariableFont(TTFont(buf), FACES[face]['axes'])
    path = os.path.join(OUT, out_name)
    f.flavor = 'woff2'
    f.save(path)
    print(f'{out_name:32} {os.path.getsize(path) / 1024:.1f} KB')

os.makedirs(OUT, exist_ok=True)
for face in FACES:
    build(face, 'latin', LATIN, f'{face}-latin.woff2')
    build(face, 'latin-ext', TR, f'{face}-tr.woff2')
