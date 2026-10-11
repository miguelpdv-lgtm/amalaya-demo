# EncrespArte · identidad digital

Peluquería de cabellos rizados, ondulados y afros en Cali (B/ Capri). Concepto: **«Cada rizo es un trazo»**.

Sitio estático para GitHub Pages: https://miguelpdv-lgtm.github.io/amalaya-demo/

| Archivo | Qué es |
|---|---|
| `index.html` · `css/web.css` · `js/web.js` | Web (versión «casa de lujo») |
| `design-system.html` | Guía navegable del sistema de diseño |
| `docs/marca.md` | Investigación, concepto, manifiesto, pilares, personalidad y voz |
| `design-system/tokens.css` · `components.css` · `motion.css` | Tokens, componentes y movimiento |
| `design-system/trazo.js` | Motor de animación sin dependencias (curva generada por seno + pluma de punta ancha) |
| `design-system/tokens.json` | Tokens en formato W3C (DTCG) |
| `assets/encresparte-mark.svg`, `encresparte-logo*.svg` | Marca y logo **provisionales** |
| `assets/fotos/salon-real.jpg` | Foto real del salón (fondo del hero) y recortes `detalle-*.jpg` |
| `tools/opciones-lujo.html` | Laboratorio en canvas con 4 heros y 4 entradas |

## Pendiente de material real

- **Logo original**: sustituir `tools/logo-trazado.json` vectorizando el archivo bueno con `python3 tools/vectorizar.py logo.png tools/logo-trazado.json` y después `python3 tools/logo.py` (regenera los SVG y el logo en línea de las dos páginas).
- **Foto del salón en más resolución**: la actual mide 1182×656; con 2400 px de ancho o más el hero se verá nítido en pantallas grandes.

## Variantes de hero y de entrada

Por defecto: hero **Atelier** y entrada **Telón** (`<html data-hero="atelier">`). Para revisar las demás sin tocar código:

- `?hero=maison` · `?hero=atelier` · `?hero=firma` · `?hero=riel`
- `?entrada=telon` · `?entrada=tracking` · `?entrada=persianas` · `?entrada=enfoque` · `?entrada=ninguna`

Para fijar otra, cambia `data-hero` en `<html>` y el valor por defecto de la entrada en `js/web.js` (`|| 'telon'`).

## Caché de GitHub Pages

CSS, JS e imágenes se enlazan con `?v=N`. Sube N en cada cambio.
