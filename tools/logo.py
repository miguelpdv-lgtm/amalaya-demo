"""Genera los SVG provisionales del logo de EncrespArte a partir de
tools/logo-trazado.json (vectorizado de la foto de perfil con tools/vectorizar.py)
e inyecta el SVG en línea en las páginas entre <!-- logo:inicio --> y <!-- logo:fin -->.
Uso: python3 tools/logo.py
"""
import json, os, re
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
parts = json.load(open(os.path.join(R, 'tools/logo-trazado.json')))
SEPIA, SIENA, LIENZO = '#3B2A1D', '#785C44', '#F9F0E7'
word = sorted([p for p in parts if p['bbox'][1] < 620], key=lambda p: p['bbox'][0])
lema = sorted([p for p in parts if p['bbox'][1] >= 620 and (p['bbox'][3] - p['bbox'][1]) > 3], key=lambda p: p['bbox'][0])
filetes = [p for p in parts if p['bbox'][1] >= 620 and (p['bbox'][3] - p['bbox'][1]) <= 3]
E, letras = word[0], word[1:]
VB_FULL = '50 362 970 322'
VB_WORD = '50 362 970 262'
NOTA = 'PROVISIONAL: reconstruido (vectorizado) desde la foto de perfil de @peluqueria_encresparte. Sustituir por el logo original.'

def svg_inline(cls='logo', vb=VB_WORD, label='EncrespArte'):
    out = ['<svg class="%s" viewBox="%s" role="img" aria-label="%s" data-provisional="true" focusable="false">' % (cls, vb, label)]
    out.append('<g class="logo-palabra">')
    out.append('<path class="logo-e" d="%s"/>' % E['d'])
    out.append('<g class="logo-letras">' + ''.join('<path d="%s"/>' % p['d'] for p in letras) + '</g>')
    out.append('</g>')
    out.append('<g class="logo-lema">')
    out.append('<path class="logo-filete" d="M133 662H196"/>')
    out.append('<g class="logo-lema-letras">' + ''.join('<path d="%s"/>' % p['d'] for p in lema) + '</g>')
    out.append('<path class="logo-filete" d="M929 662H992"/>')
    out.append('</g></svg>')
    return ''.join(out)

def svg_file(color, filete, fondo=None, lema_on=True):
    vb = VB_FULL if lema_on else VB_WORD
    x, y, w, h = map(float, vb.split())
    s = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="%s" width="%d" height="%d">' % (vb, w, h)]
    s.append('<title>EncrespArte · logo provisional</title><desc>%s</desc>' % NOTA)
    if fondo:
        s.append('<rect x="%g" y="%g" width="%g" height="%g" fill="%s"/>' % (x, y, w, h, fondo))
    s.append('<g fill="%s"><path d="%s"/>' % (color, E['d']) + ''.join('<path d="%s"/>' % p['d'] for p in letras))
    if lema_on:
        s.append(''.join('<path d="%s"/>' % p['d'] for p in lema))
    s.append('</g>')
    if lema_on:
        s.append('<path d="M133 662H196M929 662H992" stroke="%s" stroke-width="2.2" fill="none"/>' % filete)
    s.append('</svg>\n')
    return ''.join(s)

def mark(fondo, color, borde=None):
    x0, y0, x1, y1 = E['bbox']
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    size = 320
    s = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="%g %g %d %d" width="512" height="512">' % (cx - size / 2, cy - size / 2, size, size)]
    s.append('<title>EncrespArte · marca provisional</title><desc>%s</desc>' % NOTA)
    s.append('<rect x="%g" y="%g" width="%d" height="%d" rx="6" fill="%s"/>' % (cx - size / 2, cy - size / 2, size, size, fondo))
    if borde:
        s.append('<rect x="%g" y="%g" width="%d" height="%d" rx="3" fill="none" stroke="%s" stroke-width="3"/>' % (cx - size / 2 + 14, cy - size / 2 + 14, size - 28, size - 28, borde))
    s.append('<path fill="%s" d="%s"/></svg>\n' % (color, E['d']))
    return ''.join(s)

A = os.path.join(R, 'assets')
open(os.path.join(A, 'encresparte-logo.svg'), 'w').write(svg_file(SEPIA, SIENA))
open(os.path.join(A, 'encresparte-logo-lienzo.svg'), 'w').write(svg_file(LIENZO, '#C9AC8E', fondo=SEPIA))
open(os.path.join(A, 'encresparte-logotipo.svg'), 'w').write(svg_file(SEPIA, SIENA, lema_on=False))
open(os.path.join(A, 'encresparte-mark.svg'), 'w').write(mark(SEPIA, LIENZO, borde='#785C44'))
open(os.path.join(A, 'favicon.svg'), 'w').write(mark(SEPIA, LIENZO))

inline = svg_inline()
for page in ('index.html', 'design-system.html'):
    f = os.path.join(R, page)
    if not os.path.exists(f):
        continue
    html = open(f, encoding='utf8').read()
    html2 = re.sub(r'<!-- logo:inicio -->.*?<!-- logo:fin -->', lambda m: '<!-- logo:inicio -->' + inline + '<!-- logo:fin -->', html, flags=re.S)
    open(f, 'w', encoding='utf8').write(html2)
    print(page, html.count('<!-- logo:inicio -->'), 'marcas')
print('E', E['bbox'], 'letras', len(letras), 'lema', len(lema), 'filetes', len(filetes), 'inline', len(inline), 'bytes')
