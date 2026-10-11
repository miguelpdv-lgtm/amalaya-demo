# EncrespArte · Identidad de marca

> Documento de la Fase 2 (investigación y personalidad). Es la base del sistema de diseño (`design-system.html`) y de la landing (`index.html`).

## 1. Lo que dice el perfil (datos reales)

| Dato | Valor | Fuente |
|---|---|---|
| Nombre | EncrespArte | Instagram, `og:title` |
| Usuario | @peluqueria_encresparte | Instagram y TikTok |
| Bio de Instagram | "Peluquería cabellos RIZADOS, ONDULADOS y AFROS ✨" | Instagram, `og:title` |
| Lema del logo | "Cada rizo es una obra de arte." | Foto de perfil (logo) |
| Ciudad | Cali, Colombia · barrio Capri ("B/Capri") | Bio de TikTok |
| Servicios | Cortes · Balayage · Color · Terapia capilar | Bio de TikTok |
| Lo que no hacen | "❌ No permanentes" | Bio de TikTok |
| Contacto | 📲 +57 310 898 1207 (se usa como WhatsApp) | Bio de TikTok |
| Horario | Lunes a sábado, 9 a. m. – 6 p. m., con cita previa | Bio de TikTok |
| Cifras (11/10/2026) | Instagram: 1.860 seguidores, 209 publicaciones, sigue a 14 · TikTok: 9.704 seguidores, 258 vídeos | `og:description` de cada red |

**Patrones que atienden:** ondulado (2A–2C), rizado (3A–3C) y afro (4A–4C), según la bio.

**Cuentas relacionadas:** TikTok @peluqueria_encresparte ("PeluqueriaEncresparte Cali 🇨🇴"). No he encontrado subcuentas (academia, tienda, etc.); Instagram sin sesión no deja ver a quién sigue. Si existen, la sección "Familia de marca" está preparada para mostrarlas.

**Lo que no se ha podido leer:** Instagram pide sesión para ver publicaciones, destacadas y pies de foto. No hay dirección exacta, precios, duraciones ni testimonios: no se usan en la web. En los resultados de búsqueda aparecen resúmenes de sus vídeos (diagnóstico antes de cada servicio, corte en seco, hidratación); los uso para el método, pero conviene confirmarlo con el salón.

**Logo real:** fondo crema `#F9F0E7`, letras en marrón sepia `#3B2A1D`, filetes del lema en `#785C44`. Una "E" caligráfica con bucle y lazo, seguida de una romana de alto contraste con terminales curvas. El lema, en versalitas espaciadas, va entre dos filetes.

## 2. Concepto central: «Cada rizo es un trazo»

El nombre junta **encrespar** (en Colombia, *crespo* es el pelo rizado) y **arte**. El propio logo lo dice: *cada rizo es una obra de arte*. El concepto lleva esa frase al oficio: **el encrespado es un trazo hecho a mano**.

Un calígrafo no dibuja una línea igual de gruesa de principio a fin: la pluma de punta ancha engorda al bajar y adelgaza al girar. Un rizo funciona igual. Tiene dirección, giro, grosor y ritmo, y no hay dos iguales. La "E" del logo es justo eso: un trazo de pluma que da vueltas sobre sí mismo.

**El motivo: el trazo de pluma.** Una curva que cambia de dirección, dibujada con punta ancha a 35°. Así aparece el contraste grueso/fino del logo sin dibujar ninguna forma aparte.

**La curva matemática: la curva generada por seno** (Langbein y Leopold, 1966). La dirección del trazo oscila a lo largo de su longitud:

```
θ(s) = ω · sin(2πs/λ) + ζ · sin(6πs/λ)
```

- **ω (giro):** cuánto se dobla el trazo. Ondas suaves con ω bajo; bucles casi cerrados cerca de 2,4.
- **λ (paso):** cada cuánto se repite el rizo.
- **ζ (quiebre):** un armónico que añade el zigzag de los patrones 4B y 4C.
- **Encogimiento:** el avance real de un trazo de dirección media cero es `J₀(ω)`, la función de Bessel. Por eso `1 − J₀(ω)` sirve como **índice visual de encogimiento**: cuanto más gira el trazo, menos avanza. Es la misma idea que el encogimiento del pelo, explicado con una sola fórmula. Es ilustrativo, no una medida clínica.

**Qué gobierna el concepto:**
- **Formas:** filetes, trazos y cartelas rectas, como las cartelas de una galería. Nada de óvalos ni arcos decorativos.
- **Animación:** todo se *dibuja* (stroke-dashoffset, la pluma que avanza), nada rebota.
- **Iconos:** de línea, con trazo modulado y sin rellenos de color.
- **Lenguaje de sección:** sala, obra, ficha técnica, firma.

## 3. Manifiesto

> Tu pelo no viene con instrucciones de fábrica. Viene con trazo propio.
>
> Hay rizos que se abren en ondas largas y otros que se cierran en espirales pequeñas. Hay melenas que se encogen a la mitad y otras que caen. Ninguna está mal hecha.
>
> En EncrespArte no corregimos tu textura: la leemos. Primero miramos cómo gira, cómo bebe agua, cómo se comporta seco. Después cortamos, tratamos y coloreamos siguiendo ese trazo, no en su contra.
>
> No hacemos permanentes. No vendemos un rizo de catálogo. Te devolvemos el tuyo, con su forma, su volumen y su carácter, y te explicamos cómo cuidarlo en casa.
>
> Cada rizo es una obra de arte. La firma es tuya.

## 4. Cuatro pilares

1. **Leer antes de cortar.** Cada servicio empieza con un diagnóstico: patrón, porosidad y cómo cae el pelo en seco. Sin diagnóstico no hay tijera.
2. **Respetar el trazo.** Cortamos y tratamos a favor de la forma natural. No hay permanentes ni moldes: el objetivo es que tu rizo se vea como él mismo, en su mejor versión.
3. **Oficio a mano.** Corte, color y terapia capilar son técnica, no magia. Nombramos lo que hacemos y por qué, con palabras claras.
4. **Cuidar fuera del salón.** El resultado tiene que durar en tu baño, no solo en la foto. Te vas con una rutina que entiendes y puedes repetir.

## 5. Espectro de personalidad

Cinco ejes, posición de 1 a 10:

| Eje | 1 ← → 10 | Posición | Por qué |
|---|---|---|---|
| Clásica ↔ Contemporánea | | **4** | El logo es romano y caligráfico, de galería, pero con frescura. |
| Técnica ↔ Emocional | | **5** | Sabe de porosidad y de patrones, y lo cuenta con cariño. |
| Serena ↔ Exuberante | | **3** | Calma de estudio: el volumen lo pone el pelo, no la marca. |
| Exclusiva ↔ Cercana | | **7** | Barrio, cita previa, WhatsApp. Te habla de tú. |
| Seria ↔ Juguetona | | **4** | Seria en el oficio y con un guiño ("la firma es tuya"). |

## 6. Voz y tono

**La voz** es la de una artesana que te enseña su taller: precisa, cálida y sin prisa. Habla de tú. Usa verbos de oficio (leer, trazar, cortar, definir, hidratar) y no promete resultados imposibles.

**El tono cambia según el momento:**
- *Redes y portada:* corto, con imagen. "Tu rizo ya tiene forma. Vamos a encontrarla."
- *Servicios y ficha técnica:* claro y concreto. Qué se hace, para qué y para quién.
- *Reservas y avisos:* directo y amable. "Escríbenos por WhatsApp y te damos cita."
- *Cuidado en casa:* paso a paso, sin culpa.

### Así sí / así no

| Así sí | Así no |
|---|---|
| "Leemos tu rizo antes de cortarlo." | "Vamos a domar ese pelo rebelde." |
| "Tu textura no está mal: necesita agua y un corte que la entienda." | "Adiós al pelo malo." |
| "Con hidratación y un buen corte, la definición dura más." | "Resultados milagrosos en una sesión." |
| "El encogimiento es normal: tu rizo es más largo de lo que parece." | "Disimula el encogimiento y alarga tu pelo." |
| "No hacemos permanentes: trabajamos con el rizo que ya tienes." | "Te dejamos el rizo perfecto que siempre soñaste." |
| "Escríbenos por WhatsApp y miramos tu caso." | "¡¡Reserva YA, plazas limitadas!!" |

### Vocabulario

**Permitido (y preferido):** rizo, crespo, onda, afro, textura, patrón, trazo, forma, volumen, definición, encogimiento, porosidad, hidratación, diagnóstico, corte en seco, terapia capilar, rutina, cuidado nocturno, obra, firma.

**Prohibido:**
- **domar**, **pelo malo**, **milagro / milagroso**
- rebelde, indomable, controlar, alisar el problema, arreglar tu pelo
- "pelo difícil", "pelo feo", "sin frizz para siempre"
- cualquier promesa de resultado garantizado o de duración que no esté confirmada

### Reglas de escritura
- Títulos en frases cortas, en un solo color y una sola tipografía.
- Nada de precios, duraciones, direcciones ni horarios que no estén en los perfiles. Si falta un dato, se omite o se marca como ejemplo.
- Nada de testimonios inventados. Las reseñas se publican solo cuando son reales y con permiso.
- Patrones con su código (2A…4C) en monoespaciada, como una ficha técnica.
