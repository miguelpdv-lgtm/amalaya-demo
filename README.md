# EncrespArte · identidad digital

Peluquería de cabellos rizados, ondulados y afros en Cali (B/ Capri). Concepto: **«Cada rizo es un trazo»**.

Sitio estático para GitHub Pages: https://miguelpdv-lgtm.github.io/amalaya-demo/

| Archivo | Qué es |
|---|---|
| `index.html` | Landing |
| `design-system.html` | Guía navegable del sistema de diseño |
| `docs/marca.md` | Investigación, concepto, manifiesto, pilares, personalidad y voz |
| `design-system/tokens.css` · `components.css` · `motion.css` | Tokens, componentes y movimiento |
| `design-system/trazo.js` | Motor de animación sin dependencias (curva generada por seno + pluma de punta ancha) |
| `design-system/tokens.json` | Tokens en formato W3C (DTCG) |
| `assets/encresparte-mark.svg`, `encresparte-logo*.svg` | Marca y logo **provisionales** |
| `assets/fotos/salon.jpg` | Imagen **provisional** del salón (composición generada) |

## Pendiente de material real

- **Logo original**: sustituir `tools/logo-trazado.json` vectorizando el archivo bueno con `python3 tools/vectorizar.py logo.png tools/logo-trazado.json` y después `python3 tools/logo.py` (regenera los SVG y el logo en línea de las dos páginas).
- **Foto de fachada o salón**: sustituir `assets/fotos/salon.jpg` (1600×2000) y `salon-800.jpg`; quitar `data-provisional` y el chip «Imagen provisional» del hero.
- **Fotos de clientas**: sustituir la ilustración del comparador antes/después (solo con su permiso).

## Caché de GitHub Pages

CSS, JS e imágenes se enlazan con `?v=N`. Sube N en cada cambio.
