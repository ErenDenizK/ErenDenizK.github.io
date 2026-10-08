# Appends to make_recto: render N frames rotating the root about world Z. Usage: same env as make_recto + FRAMES
import os, sys, math, runpy, time, bpy
os.environ.setdefault("NAME", "_poster.png")
runpy.run_path(os.path.join(os.path.dirname(__file__), "make_recto.py"), run_name="__main__")
out = sys.argv[-1]; n = int(os.environ.get("FRAMES", 24))
scn = bpy.context.scene; root = bpy.data.objects["Recto"]
base = root.rotation_euler.copy(); t0 = time.time()
os.makedirs(os.path.join(out, "tt"), exist_ok=True)
for i in range(n):
    root.rotation_euler = base; root.rotation_euler.z = base.z + 2 * math.pi * i / n
    scn.render.filepath = os.path.join(out, "tt", f"f{i:03d}.png")
    bpy.ops.render.render(write_still=True)
print(f"TURNTABLE {n} frames {time.time()-t0:.0f}s")
