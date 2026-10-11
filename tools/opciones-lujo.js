/* EncrespArte · laboratorio de heros y entradas inspirados en marcas de lujo.
   Dibuja en canvas con la foto real del salón. Requiere trazo.js y logo-paths.js. */
(function (g) {
  'use strict';
  var SEPIA = '#3B2A1D', LIENZO = '#F9F0E7', OCRE3 = '#DFBA87', OCRE4 = '#CB9B54', CARBON = '#1E150E', SIENA = '#785C44', SIENA2 = '#E7D8CB';
  var P = null;
  function rutas() {
    if (P) return P;
    P = { E: new Path2D(LOGO.E), letras: LOGO.letras.map(function (d) { return new Path2D(d); }), cajas: LOGO.cajas, lema: LOGO.lema.map(function (d) { return new Path2D(d); }) };
    return P;
  }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function tramo(t, a, b) { return clamp((t - a) / (b - a), 0, 1); }
  function eio(k) { return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; }   // pluma
  function eout(k) { return 1 - Math.pow(1 - k, 3); }                                      // tinta

  function cover(ctx, img, x, y, w, h, fx, fy, zoom) {
    zoom = zoom || 1;
    var r = Math.max(w / img.width, h / img.height) * zoom, sw = w / r, sh = h / r;
    ctx.drawImage(img, (img.width - sw) * (fx == null ? 0.5 : fx), (img.height - sh) * (fy == null ? 0.5 : fy), sw, sh, x, y, w, h);
  }
  // Logotipo (E + letras) en una caja de ancho w, origen arriba-izquierda
  function logo(ctx, x, y, w, color, opts) {
    var p = rutas(); opts = opts || {};
    var s = w / 970;
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.translate(-50, -362);
    ctx.fillStyle = color;
    if (opts.separacion) {
      // cada letra se desplaza desde el centro (tracking)
      p.letras.concat([p.E]).forEach(function (path, i) {
        var caja = i < p.letras.length ? p.cajas[i + 1] : p.cajas[0];
        var cx = (caja[0] + caja[2]) / 2;
        ctx.save(); ctx.translate((cx - 535) * opts.separacion, 0);
        ctx.globalAlpha = opts.alfa == null ? 1 : opts.alfa;
        ctx.fill(path); ctx.restore();
      });
    } else {
      ctx.globalAlpha = opts.alfa == null ? 1 : opts.alfa;
      ctx.fill(p.E); p.letras.forEach(function (l) { ctx.fill(l); });
      if (opts.lema) { p.lema.forEach(function (l) { ctx.fill(l); }); ctx.fillRect(133, 661, 63, 2.2); ctx.fillRect(929, 661, 63, 2.2); }
    }
    ctx.restore();
  }
  function marcaE(ctx, cx, cy, h, color, modo, lw) {
    var p = rutas(), s = h / 240;
    ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s); ctx.translate(-165, -492);
    if (modo === 'linea') { ctx.strokeStyle = color; ctx.lineWidth = (lw || 1.2) / s; ctx.stroke(p.E); }
    else { ctx.fillStyle = color; ctx.fill(p.E); }
    ctx.restore();
  }
  function fuente(ctx, peso, tam, fam) { ctx.font = peso + ' ' + tam + 'px ' + (fam || 'Fraunces'); }
  function versal(ctx, txt, x, y, tam, color, esp, alinear) {
    fuente(ctx, 500, tam, '"DM Mono"'); ctx.fillStyle = color;
    ctx.letterSpacing = (esp == null ? tam * 0.18 : esp) + 'px'; ctx.textAlign = alinear || 'left';
    ctx.fillText(txt, x, y); ctx.letterSpacing = '0px'; ctx.textAlign = 'left';
  }
  function lineas(ctx, txt, x, y, ancho, tam, interl, color, peso, fam, alinear) {
    fuente(ctx, peso || 400, tam, fam); ctx.fillStyle = color; ctx.textAlign = alinear || 'left';
    var pal = txt.split(' '), l = '', out = [];
    pal.forEach(function (w) { var t = l ? l + ' ' + w : w; if (ctx.measureText(t).width > ancho && l) { out.push(l); l = w; } else l = t; });
    out.push(l);
    out.forEach(function (s, i) { ctx.fillText(s, x, y + i * tam * interl); });
    ctx.textAlign = 'left';
    return y + out.length * tam * interl;
  }
  function boton(ctx, x, y, txt, fondo, texto, sombra, tam, alinear) {
    tam = tam || 13; fuente(ctx, 650, tam, '"Instrument Sans"'); ctx.letterSpacing = (tam * 0.14) + 'px';
    var tw = ctx.measureText(txt).width, w = tw + 36 + 44, h = tam * 3.7;
    if (alinear === 'center') x -= w / 2;
    ctx.fillStyle = sombra; ctx.fillRect(x + 4, y + 4, w, h);
    ctx.fillStyle = fondo; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = fondo === LIENZO ? LIENZO : texto === LIENZO ? fondo : SEPIA; ctx.lineWidth = 2; ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
    ctx.fillStyle = texto; ctx.fillText(txt, x + 18, y + h / 2 + tam * 0.36); ctx.letterSpacing = '0px';
    var ax = x + 18 + tw + 12, ay = y + h / 2;
    ctx.strokeStyle = texto; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(ax, ay);
    for (var k = 0; k < 3; k++) ctx.quadraticCurveTo(ax + k * 6.5 + 3.2, ay + (k % 2 ? 4.5 : -4.5), ax + k * 6.5 + 6.5, ay);
    ctx.lineTo(ax + 31, ay); ctx.moveTo(ax + 26.5, ay - 4.5); ctx.lineTo(ax + 31, ay); ctx.lineTo(ax + 26.5, ay + 4.5); ctx.stroke();
    return { w: w, h: h };
  }
  // Navbar nueva: enlaces a la izquierda, logo centrado, cita a la derecha
  function nav(ctx, W, modo) {
    var movil = W < 600, alto = movil ? 60 : 72;
    var claro = modo !== 'transparente';
    if (claro) { ctx.fillStyle = LIENZO; ctx.fillRect(0, 0, W, alto); ctx.fillStyle = '#D2BCAB'; ctx.fillRect(0, alto - 1, W, 1); }
    var col = claro ? SEPIA : LIENZO;
    var lw = movil ? 124 : 158;
    logo(ctx, W / 2 - lw / 2, (alto - lw * 262 / 970) / 2, lw, col);
    if (movil) {
      ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(18, 25); ctx.lineTo(40, 25); ctx.moveTo(18, 35); ctx.lineTo(40, 35); ctx.stroke();
      versal(ctx, 'CITA', W - 18, 35, 12, col, 2.2, 'right');
    } else {
      var x = 56; fuente(ctx, 500, 14, '"Instrument Sans"'); ctx.fillStyle = col;
      ['La casa', 'Servicios', 'Atlas', 'Diario'].forEach(function (t) { ctx.fillText(t, x, alto / 2 + 5); x += ctx.measureText(t).width + 30; });
      fuente(ctx, 650, 12, '"Instrument Sans"'); ctx.letterSpacing = '2px';
      var tw = ctx.measureText('PEDIR CITA').width; ctx.letterSpacing = '0px';
      versal(ctx, 'PEDIR CITA', W - 56, alto / 2 + 5, 12, col, 2.4, 'right');
      ctx.fillStyle = col; ctx.fillRect(W - 56 - tw - 4, alto / 2 + 12, tw + 4, 1.5);
    }
    return alto;
  }
  function duotono(img, w, h, fx, fy, zoom) {
    var c = document.createElement('canvas'); c.width = w; c.height = h;
    var x = c.getContext('2d'); cover(x, img, 0, 0, w, h, fx, fy, zoom);
    var d = x.getImageData(0, 0, w, h), a = d.data;
    var o = [30, 21, 14], l = [249, 240, 231];
    for (var i = 0; i < a.length; i += 4) {
      var y = (0.299 * a[i] + 0.587 * a[i + 1] + 0.114 * a[i + 2]) / 255;
      y = Math.pow(y, 1.15);
      a[i] = o[0] + (l[0] - o[0]) * y; a[i + 1] = o[1] + (l[1] - o[1]) * y; a[i + 2] = o[2] + (l[2] - o[2]) * y;
    }
    x.putImageData(d, 0, 0);
    return c;
  }
  function veloLineal(ctx, x0, y0, x1, y1, paradas) {
    var gr = ctx.createLinearGradient(x0, y0, x1, y1);
    paradas.forEach(function (p) { gr.addColorStop(p[0], p[1]); });
    return gr;
  }

  /* ================= HEROS ================= */
  var HEROS = [
    { id: 'maison', nombre: 'Maison', inspira: 'Dior · Chanel', resumen: 'Foto a sangre con velo sepia uniforme. Todo centrado y en calma: versalitas, titular corto y un único letrero. Navbar transparente sobre la foto.',
      dibujar: function (ctx, W, H, img, k) {
        var movil = W < 600; k = k == null ? 1 : k;
        cover(ctx, img, 0, 0, W, H, movil ? 0.72 : 0.6, 0.45, 1 + 0.04 * (1 - k));
        ctx.fillStyle = 'rgba(30,21,14,0.52)'; ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = veloLineal(ctx, 0, H * 0.4, 0, H, [[0, 'rgba(30,21,14,0)'], [1, 'rgba(30,21,14,0.55)']]); ctx.fillRect(0, 0, W, H);
        nav(ctx, W, 'transparente');
        ctx.fillStyle = 'rgba(249,240,231,0.25)'; ctx.fillRect(movil ? 18 : 56, movil ? 60 : 72, W - (movil ? 36 : 112), 1);
        var cy = movil ? H * 0.52 : H * 0.47;
        versal(ctx, 'SALÓN DE RIZOS · CALI', W / 2, cy - (movil ? 86 : 118), movil ? 11 : 12, OCRE3, null, 'center');
        var tam = movil ? 44 : 92;
        lineas(ctx, movil ? 'Rizos con firma propia.' : 'Rizos con firma propia.', W / 2, cy - (movil ? 30 : 30), movil ? W - 60 : W * 0.8, tam, 1.02, LIENZO, 500, 'Fraunces', 'center');
        lineas(ctx, 'Cortes, balayage, color y terapia capilar para melenas rizadas, onduladas y afro.', W / 2, cy + (movil ? 60 : 62), movil ? W - 70 : 520, movil ? 16 : 19, 1.5, SIENA2, 400, '"Instrument Sans"', 'center');
        boton(ctx, W / 2, cy + (movil ? 128 : 136), 'PEDIR CITA', LIENZO, SEPIA, OCRE4, 13, 'center');
        // indicador de desplazamiento: trazo vertical
        var p = { w: 1, z: 0 }, pts = Trazo.curva(p, { ciclos: 2, resolucion: 50 });
        Trazo.pluma(ctx, Trazo.colocar(pts, { rot: Math.PI / 2, escala: 22, x: W / 2, y: H - 70 }), { ancho: 3, color: LIENZO });
      } },
    { id: 'atelier', nombre: 'Atelier', inspira: 'Aesop · Loewe', resumen: 'Foto a sangre con el sillón a la derecha y un velo cálido solo a la izquierda. Columna editorial de texto, una ficha en monoespaciada como la cartela de una obra y navbar clara.',
      dibujar: function (ctx, W, H, img, k) {
        var movil = W < 600; k = k == null ? 1 : k;
        if (movil) {
          cover(ctx, img, 0, 0, W, H, 0.74, 0.5, 1 + 0.04 * (1 - k));
          ctx.fillStyle = veloLineal(ctx, 0, 0, 0, H, [[0, 'rgba(59,42,29,0.05)'], [0.38, 'rgba(59,42,29,0.25)'], [0.62, 'rgba(59,42,29,0.9)'], [1, SEPIA]]); ctx.fillRect(0, 0, W, H);
        } else {
          cover(ctx, img, 0, 0, W, H, 0.5, 0.5, 1 + 0.04 * (1 - k));
          ctx.fillStyle = veloLineal(ctx, 0, 0, W, 0, [[0, 'rgba(59,42,29,0.94)'], [0.36, 'rgba(59,42,29,0.82)'], [0.56, 'rgba(59,42,29,0.15)'], [1, 'rgba(59,42,29,0)']]); ctx.fillRect(0, 0, W, H);
        }
        var alto = nav(ctx, W);
        var x = movil ? 22 : 96, y = movil ? H * 0.56 : H * 0.36, ancho = movil ? W - 44 : 470;
        versal(ctx, 'EL TALLER · BARRIO CAPRI', x, y, movil ? 11 : 12, OCRE3);
        var y2 = lineas(ctx, 'Un taller para el pelo que gira.', x, y + (movil ? 50 : 76), ancho, movil ? 36 : 60, 1.04, LIENZO, 500);
        y2 = lineas(ctx, 'Rizados, ondulados y afros, del 2A al 4C. Corte, color y cuidado a la medida de cada textura.', x, y2 + (movil ? 6 : 14), movil ? ancho : 420, movil ? 15 : 18, 1.5, SIENA2, 400, '"Instrument Sans"');
        var b = boton(ctx, x, y2 + (movil ? 6 : 18), 'PEDIR CITA', LIENZO, SEPIA, OCRE4);
        if (!movil) {
          ctx.fillStyle = veloLineal(ctx, 0, H - 200, 0, H, [[0, 'rgba(59,42,29,0)'], [1, 'rgba(59,42,29,0.88)']]); ctx.fillRect(0, H - 200, W, 200);
          // cartela de la obra
          var cy = H - 64;
          ctx.fillStyle = 'rgba(249,240,231,0.28)'; ctx.fillRect(x, cy - 30, W - x * 2, 1);
          [['SERVICIOS', 'Cortes · Balayage · Color · Terapia capilar'], ['HORARIO', 'Lun–Sáb · 9:00–18:00 · cita previa'], ['LUGAR', 'Cali · B/ Capri']].forEach(function (c, i) {
            var cx = x + i * 380;
            versal(ctx, c[0], cx, cy, 10.5, OCRE3, 2);
            fuente(ctx, 400, 13, '"DM Mono"'); ctx.fillStyle = LIENZO; ctx.fillText(c[1], cx, cy + 22);
          });
        }
      } },
    { id: 'firma', nombre: 'Firma', inspira: 'Cartier · Van Cleef', resumen: 'La foto pasa a duotono sepia–lienzo y una «E» monumental en línea ocre firma la escena sobre el espejo. Titular pequeño y preciso abajo a la izquierda, como una nota al pie.',
      dibujar: function (ctx, W, H, img, k) {
        var movil = W < 600; k = k == null ? 1 : k;
        var d = duotono(img, Math.round(W), Math.round(H), movil ? 0.75 : 0.55, 0.5, 1 + 0.04 * (1 - k));
        ctx.drawImage(d, 0, 0, W, H);
        ctx.fillStyle = 'rgba(30,21,14,0.38)'; ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = veloLineal(ctx, 0, H * 0.5, 0, H, [[0, 'rgba(30,21,14,0)'], [1, 'rgba(30,21,14,0.78)']]); ctx.fillRect(0, 0, W, H);
        nav(ctx, W, 'transparente');
        ctx.fillStyle = 'rgba(249,240,231,0.25)'; ctx.fillRect(movil ? 18 : 56, movil ? 60 : 72, W - (movil ? 36 : 112), 1);
        marcaE(ctx, movil ? W * 0.52 : W * 0.33, movil ? H * 0.36 : H * 0.48, movil ? H * 0.42 : H * 0.78, OCRE3, 'linea', 1.4 * k + 0.0001);
        var x = movil ? 22 : 96, y = movil ? H - 210 : H - 196;
        versal(ctx, 'N.º 01 · CALI', x, y, movil ? 11 : 12, OCRE3);
        var tt = movil ? 34 : 52;
        lineas(ctx, 'Hecho a mano,', x, y + (movil ? 48 : 60), W, tt, 1.05, LIENZO, 500);
        lineas(ctx, 'rizo a rizo.', x, y + (movil ? 48 : 60) + tt * 1.02, W, tt, 1.05, LIENZO, 500);
        boton(ctx, movil ? x : W - 96 - 170, movil ? H - 76 : H - 120, 'PEDIR CITA', LIENZO, SEPIA, OCRE4);
      } },
    { id: 'riel', nombre: 'Riel', inspira: 'Hermès · Rolex', resumen: 'La foto ocupa el lienzo bajo una navbar clara; abajo, un riel de lienzo con el titular y la información práctica en columnas, como la placa de un escaparate.',
      dibujar: function (ctx, W, H, img, k) {
        var movil = W < 600; k = k == null ? 1 : k;
        var riel = movil ? 300 : 190;
        cover(ctx, img, 0, 0, W, H - riel, movil ? 0.75 : 0.55, 0.45, 1 + 0.04 * (1 - k));
        ctx.fillStyle = 'rgba(30,21,14,0.12)'; ctx.fillRect(0, 0, W, H - riel);
        nav(ctx, W);
        ctx.fillStyle = LIENZO; ctx.fillRect(0, H - riel, W, riel);
        ctx.fillStyle = SEPIA; ctx.fillRect(0, H - riel, W, 3);
        var x = movil ? 22 : 56, y = H - riel;
        versal(ctx, 'SALÓN DE RIZOS EN CALI', x, y + (movil ? 42 : 50), 11.5, SIENA);
        lineas(ctx, 'El oficio del rizo.', x, y + (movil ? 92 : 112), movil ? W - 44 : 520, movil ? 40 : 58, 1.04, SEPIA, 500);
        if (movil) {
          fuente(ctx, 400, 13, '"DM Mono"'); ctx.fillStyle = SIENA; ctx.fillText('Lun–Sáb · 9:00–18:00 · B/ Capri', x, y + 142);
          boton(ctx, x, y + 196, 'PEDIR CITA', SEPIA, LIENZO, OCRE4);
        } else {
          [['SERVICIOS', 'Cortes · Balayage', 'Color · Terapia capilar'], ['HORARIO', 'Lunes a sábado', '9:00–18:00 · cita previa'], ['LUGAR', 'Cali, Colombia', 'Barrio Capri']].forEach(function (c, i) {
            var cx = 600 * W / 1360 + i * 190 * W / 1360;
            ctx.fillStyle = '#D2BCAB'; ctx.fillRect(cx - 18, y + 36, 1, riel - 72);
            versal(ctx, c[0], cx, y + 62, 10.5, SIENA, 2);
            fuente(ctx, 400, 14, '"Instrument Sans"'); ctx.fillStyle = SEPIA; ctx.fillText(c[1], cx, y + 90); ctx.fillText(c[2], cx, y + 110);
          });
          boton(ctx, W - 56 - 170, y + 70, 'PEDIR CITA', SEPIA, LIENZO, OCRE4);
        }
      } }
  ];

  /* ================= ENTRADAS ================= */
  var base = function (ctx, W, H, img, k) { HEROS[1].dibujar(ctx, W, H, img, k); };   // hero recomendado
  function costuraVertical(ctx, cx, y0, y1, prog, color, ancho) {
    var p = { w: 1.05, z: 0 }, paso = 64;
    var pts = Trazo.curva(p, { ciclos: Trazo.ciclosPara(p, (y1 - y0) / paso + 1), fase: 0.25, resolucion: 60 });
    var b = Trazo.limites(pts), esc = paso, a = (b.y1 - b.y0) * esc; if (a > 18) esc *= 18 / a;
    Trazo.pluma(ctx, Trazo.colocar(pts, { rot: Math.PI / 2, escala: esc, x: cx + (b.y0 + b.y1) / 2 * esc, y: y0 }), { ancho: ancho || 4, color: color, hasta: prog });
  }
  var ENTRADAS = [
    { id: 'telon', nombre: 'Telón', duracion: 1.9, inspira: 'la apertura de una maison', resumen: 'Pantalla sepia con el logotipo. Una costura de trazo se cose de arriba abajo por el centro y las dos hojas se abren como las puertas del salón; la foto se asienta con un leve zoom.',
      dibujar: function (ctx, W, H, img, t) {
        var abrir = eio(tramo(t, 0.9, 1.75));
        base(ctx, W, H, img, eout(tramo(t, 0.9, 1.9)));
        var mitad = W / 2, dx = abrir * (mitad + 30);
        ctx.save(); ctx.fillStyle = SEPIA;
        ctx.fillRect(-dx, 0, mitad, H); ctx.fillRect(mitad + dx, 0, mitad, H);
        costuraVertical(ctx, mitad + dx + 1, 0, H, eout(tramo(t, 0.05, 0.85)), OCRE3, 3.5);
        ctx.restore();
        var la = tramo(t, 0.15, 0.45) * (1 - tramo(t, 0.8, 1.0));
        var lw = Math.min(W * 0.62, 380);
        ctx.save(); ctx.beginPath(); ctx.rect(-dx, 0, mitad, H); ctx.rect(mitad + dx, 0, mitad, H); ctx.clip();
        logo(ctx, W / 2 - lw / 2 - (0), H / 2 - lw * 0.18, lw, LIENZO, { alfa: la });
        ctx.restore();
      } },
    { id: 'tracking', nombre: 'Tracking', duracion: 1.9, inspira: 'los logotipos de alta costura', resumen: 'Las letras del logotipo llegan muy separadas y se cierran hasta su sitio, como el espaciado de una firma de moda. Después la cortina sepia sube y descubre la foto.',
      dibujar: function (ctx, W, H, img, t) {
        var subir = eio(tramo(t, 1.0, 1.85));
        base(ctx, W, H, img, eout(tramo(t, 1.0, 1.9)));
        var hc = H * (1 - subir);
        ctx.fillStyle = SEPIA; ctx.fillRect(0, 0, W, hc);
        ctx.fillStyle = OCRE4; if (subir > 0 && subir < 1) ctx.fillRect(0, hc - 2, W, 2);
        var sep = 1.6 * (1 - eout(tramo(t, 0.0, 0.9)));
        var lw = Math.min(W * 0.62, 400);
        ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, hc); ctx.clip();
        logo(ctx, W / 2 - lw / 2, H / 2 - lw * 0.15 - subir * H * 0.25, lw, LIENZO, { separacion: sep, alfa: tramo(t, 0, 0.3) });
        ctx.restore();
      } },
    { id: 'persianas', nombre: 'Persianas', duracion: 1.9, inspira: 'los escaparates al abrir', resumen: 'La E de la marca aparece en el centro sobre lamas sepia. Las lamas se pliegan una a una de arriba abajo, como las persianas de un local que abre por la mañana.',
      dibujar: function (ctx, W, H, img, t) {
        base(ctx, W, H, img, eout(tramo(t, 0.7, 1.9)));
        var n = 8, alto = H / n;
        for (var i = 0; i < n; i++) {
          var k = eio(tramo(t, 0.62 + i * 0.07, 1.12 + i * 0.07));
          var h = alto * (1 - k);
          ctx.fillStyle = i % 2 ? SEPIA : '#362619';
          ctx.fillRect(0, i * alto + (alto - h) / 2, W, h + 0.5);
        }
        var a = tramo(t, 0.05, 0.35) * (1 - tramo(t, 0.55, 0.75));
        ctx.save(); ctx.globalAlpha = a;
        marcaE(ctx, W / 2, H / 2, Math.min(H * 0.28, 200) * (0.96 + 0.04 * tramo(t, 0, 0.5)), LIENZO);
        ctx.restore();
      } },
    { id: 'enfoque', nombre: 'Enfoque', duracion: 2.1, inspira: 'las campañas de alta perfumería', resumen: 'La foto llega desenfocada y oscura. Una rúbrica de trazo cruza la pantalla y, cuando termina, el salón se enfoca y el texto aparece.',
      dibujar: function (ctx, W, H, img, t) {
        var foco = eio(tramo(t, 0.9, 1.9));
        var blur = 18 * (1 - foco);
        ctx.save(); ctx.filter = 'blur(' + blur.toFixed(1) + 'px) brightness(' + (0.45 + 0.55 * foco).toFixed(2) + ')';
        base(ctx, W, H, img, foco);
        ctx.restore();
        ctx.fillStyle = 'rgba(30,21,14,' + (0.55 * (1 - foco)).toFixed(3) + ')'; ctx.fillRect(0, 0, W, H);
        var p = { w: 0.95, z: 0.1 }, paso = Math.max(80, W / 9);
        var pts = Trazo.curva(p, { ciclos: Trazo.ciclosPara(p, W / paso + 1), fase: 0.1, resolucion: 70 });
        ctx.save(); ctx.globalAlpha = 1 - tramo(t, 1.3, 1.9);
        Trazo.pluma(ctx, Trazo.colocar(pts, { escala: paso, x: -paso * 0.5, y: H * 0.5 }), { ancho: 5, color: LIENZO, hasta: eout(tramo(t, 0.05, 0.95)) });
        ctx.restore();
      } }
  ];

  g.Opciones = { HEROS: HEROS, ENTRADAS: ENTRADAS, cover: cover, logo: logo };
})(window);
