"""Cut the name's faces: one static instance per setting, only the letters a name uses (type study V8).

The name on Home (src/one/Brief.astro) and the bar mark are set at a display optical size and a light
weight that the shared Newsreader file does not carry (it keeps wght 400-500 for the text roles). A
static instance of the letters is smaller than widening the shared file: about 8 KB, preloaded with the
text faces. Fontsource ships Latin and Latin Extended as two files; the two instances are merged into one
font, so a name needs one request and no file is small enough for Vite to inline as a data URL (4 KB),
which would put the lab candidates into every page's CSS.

Settings (docs/design/charter.md §3, "The name"):
  name-newsreader  Newsreader, opsz 72, wght 380            (the default; the craft audit's setting)
  name-playfair    Playfair 2.0, opsz 60, wght 380          (lab switch ?name=playfair)
  name-fraunces    Fraunces, opsz 72, wght 320, SOFT 40, WONK 0 (lab switch ?name=fraunces)

Inputs: Fontsource variable files, OFL-1.1. Newsreader comes from node_modules. Playfair and Fraunces
are lab candidates and are not dependencies: unpack their packages into one folder and pass it as
FONT_SRC (`npm pack @fontsource-variable/playfair@5.3.0 @fontsource-variable/fraunces@5.3.0`, then
`tar -xzf` each into FONT_SRC/<package-name>/). A face whose source is missing is skipped.

  pip install fonttools brotli
  FONT_SRC=/path/to/unpacked python3 tools/fonts/name.py

The glyph set is the letters of any Latin or Turkish name, so a change of the name in content/site.json
needs no new font. A character outside it falls back, glyph by glyph, to the shared Newsreader file.
"""
import io
import os
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools import subset
from fontTools.merge import Merger
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
NM = os.path.join(ROOT, 'node_modules', '@fontsource-variable')
SRC = os.environ.get('FONT_SRC', '')
OUT = os.path.join(ROOT, 'src', 'fonts')

# letters, space, apostrophe, hyphen, full stop, and the Turkish letters inside Latin-1 and ı
LATIN = 'U+0020,U+0027,U+002D,U+002E,U+0041-005A,U+0061-007A,U+00C7,U+00D6,U+00DC,U+00E7,U+00F6,U+00FC,U+0131'
TR = 'U+011E-011F,U+0130,U+015E-015F'

FACES = {
    'newsreader': {'pkg': None, 'file': 'newsreader-{sub}-opsz-normal.woff2', 'axes': {'opsz': 72, 'wght': 380}},
    'playfair': {'pkg': 'fontsource-variable-playfair-5.3.0', 'file': 'playfair-{sub}-opsz-normal.woff2', 'axes': {'opsz': 60, 'wght': 380}},
    'fraunces': {'pkg': 'fontsource-variable-fraunces-5.3.0', 'file': 'fraunces-{sub}-full-normal.woff2',
                 'axes': {'opsz': 72, 'wght': 320, 'SOFT': 40, 'WONK': 0}},
}


def source(face, sub):
    spec = FACES[face]
    name = spec['file'].format(sub=sub)
    if spec['pkg'] is None:
        return os.path.join(NM, face, 'files', name)
    return os.path.join(SRC, spec['pkg'], 'package', 'files', name) if SRC else ''


def instance(face, sub, unicodes, path):
    f = TTFont(source(face, sub))
    opts = subset.Options()
    opts.layout_features = ['kern', 'liga', 'calt', 'locl', 'ccmp', 'mark', 'mkmk']
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
    f.flavor = None
    f.save(path)


def build(face):
    out_name = f'name-{face}.woff2'
    if not all(os.path.exists(source(face, s) or '-') for s in ('latin', 'latin-ext')):
        print(f'{out_name:24} skipped (no source; set FONT_SRC)')
        return
    with tempfile.TemporaryDirectory() as tmp:
        a, b = os.path.join(tmp, 'a.ttf'), os.path.join(tmp, 'b.ttf')
        instance(face, 'latin', LATIN, a)
        instance(face, 'latin-ext', TR, b)
        f = Merger().merge([a, b])
    path = os.path.join(OUT, out_name)
    f.flavor = 'woff2'
    f.save(path)
    print(f'{out_name:24} {os.path.getsize(path) / 1024:.1f} KB')


os.makedirs(OUT, exist_ok=True)
for face in FACES:
    build(face)
