import sys, json, numpy as np, potrace
from PIL import Image
from collections import deque
src, out = sys.argv[1], sys.argv[2]
S = 3
im = Image.open(src).convert('L')
im = im.resize((im.width*S, im.height*S), Image.LANCZOS)
a = np.array(im)
mask = a < 150
H, W = mask.shape
lab = np.zeros(mask.shape, np.int32); n = 0; comps = []
ys, xs = np.nonzero(mask)
for y0, x0 in zip(ys, xs):
    if lab[y0, x0]: continue
    n += 1; q = deque([(y0, x0)]); lab[y0, x0] = n; pts = []
    while q:
        y, x = q.popleft(); pts.append((y, x))
        for dy in (-1, 0, 1):
            for dx in (-1, 0, 1):
                yy, xx = y+dy, x+dx
                if 0 <= yy < H and 0 <= xx < W and mask[yy, xx] and not lab[yy, xx]:
                    lab[yy, xx] = n; q.append((yy, xx))
    p = np.array(pts)
    comps.append(dict(id=n, n=len(pts), y0=int(p[:,0].min()), y1=int(p[:,0].max()), x0=int(p[:,1].min()), x1=int(p[:,1].max())))
comps = [c for c in comps if c['n'] > 30*S]
def f(v): return ('%.1f' % (v / S)).rstrip('0').rstrip('.')
res = []
for c in comps:
    pad = 2
    y0, y1, x0, x1 = c['y0']-pad, c['y1']+pad, c['x0']-pad, c['x1']+pad
    sub = (lab[y0:y1+1, x0:x1+1] == c['id'])
    bm = potrace.Bitmap(~sub)  # potracer: True = fondo
    pl = bm.trace(turdsize=4, alphamax=1.0, opticurve=True, opttolerance=0.2)
    d = []
    for curve in pl:
        sp = curve.start_point
        d.append('M%s %s' % (f(sp.x + x0), f(sp.y + y0)))
        for seg in curve.segments:
            if seg.is_corner:
                d.append('L%s %sL%s %s' % (f(seg.c.x+x0), f(seg.c.y+y0), f(seg.end_point.x+x0), f(seg.end_point.y+y0)))
            else:
                d.append('C%s %s %s %s %s %s' % (f(seg.c1.x+x0), f(seg.c1.y+y0), f(seg.c2.x+x0), f(seg.c2.y+y0), f(seg.end_point.x+x0), f(seg.end_point.y+y0)))
        d.append('Z')
    res.append(dict(bbox=[c['x0']/S, c['y0']/S, c['x1']/S, c['y1']/S], n=c['n'], d=''.join(d)))
json.dump(res, open(out, 'w'))
for r in sorted(res, key=lambda r: (r['bbox'][1] > 620, r['bbox'][0])):
    print([round(v) for v in r['bbox']], r['n'], len(r['d']))
