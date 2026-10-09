"""Record, round 2 hybrid: concept B2's glass recorder carrying concept C's motif, a waveform
turning into looped handwriting, in blue light along its front edge
(docs/research/2026-10-record-object.md, "Round 2"). Everything else is record_b2.py; this only
switches its RECORD_HYBRID flag, so the two never drift apart. Root "record_h2", extra part
"window".
Run: <venv>/bin/python tools/objects/record_h2.py [--out DIR] [--samples N]"""
import os
import runpy

os.environ["RECORD_HYBRID"] = "1"
runpy.run_path(os.path.join(os.path.dirname(os.path.abspath(__file__)), "record_b2.py"),
               run_name="__main__")
