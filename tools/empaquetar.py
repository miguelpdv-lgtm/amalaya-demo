import re, sys, base64, os
R = '/home/user/amalaya-demo'
PAGES = 'https://miguelpdv-lgtm.github.io/amalaya-demo/'
def datauri(path, mime):
    return 'data:%s;base64,%s' % (mime, base64.b64encode(open(os.path.join(R, path), 'rb').read()).decode())
def bundle(src, out):
    h = open(os.path.join(R, src), encoding='utf8').read()
    h = re.sub(r'<link rel="stylesheet" href="((?:design-system|css)/[^"?]+)\?v=\d+">',
               lambda m: '<style>\n' + open(os.path.join(R, m.group(1)), encoding='utf8').read() + '\n</style>', h)
    h = re.sub(r'<script src="((?:design-system|js)/[^"?]+)\?v=\d+"></script>',
               lambda m: '<script>\n' + open(os.path.join(R, m.group(1)), encoding='utf8').read().replace('</script', '<\\/script') + '\n</script>', h)
    h = re.sub(r'<link rel="preload"[^>]*>\n?', '', h)
    h = re.sub(r'\s(?:srcset|sizes|imagesrcset|imagesizes)="[^"]*"', '', h)
    MIME = {'.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml'}
    h = re.sub(r'(src|href)="(assets/[^"?]+\.(?:jpg|png|svg))\?v=\d+"',
               lambda m: m.group(1) + '="' + datauri(m.group(2), MIME[os.path.splitext(m.group(2))[1]]) + '"', h)
    h = re.sub(r'href="(design-system\.html|index\.html|design-system/tokens\.json)(\?v=\d+)?', lambda m: 'target="_blank" href="' + PAGES + ('' if m.group(1) == 'index.html' else m.group(1)), h)
    # El artefacto lleva su propio esqueleto
    h = re.sub(r'<!doctype html>\s*<html lang="es">\s*<head>\s*', '', h)
    h = re.sub(r'<meta charset="utf-8">\s*<meta name="viewport"[^>]*>\s*', '', h)
    h = h.replace('</head>\n<body>', '').replace('</body>\n</html>', '')
    assert 'assets/' not in re.sub(r'https://miguelpdv[^"]+', '', h), [m for m in re.findall(r'.{40}assets/.{40}', h)][:5]
    open(out, 'w', encoding='utf8').write(h)
    print(out, len(h) // 1024, 'KB')
# Uso: python3 tools/empaquetar.py <carpeta_salida>
bundle('index.html', sys.argv[1] + '/encresparte-landing.html')
bundle('design-system.html', sys.argv[1] + '/encresparte-sistema.html')
