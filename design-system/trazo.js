/*!
 * trazo.js · motor de animación de EncrespArte (sin dependencias)
 * Concepto: «Cada rizo es un trazo».
 *
 * Curva generada por seno (Langbein y Leopold, 1966): la dirección del trazo
 * oscila a lo largo de su longitud.
 *     θ(s) = ω · sin(2πs) + ζ · sin(6πs)          s en ciclos
 * Se dibuja con pluma de punta ancha (ángulo fijo), así sale el grueso/fino
 * del logo sin dibujar ninguna forma aparte.
 * Encogimiento = 1 − avance / longitud. Sin quiebre (ζ = 0) equivale a 1 − J₀(ω).
 */
(function (global) {
  'use strict';

  var TAU = Math.PI * 2;
  var mqReduce = global.matchMedia ? global.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };

  /* ---------- Escala de patrones 2A → 4C ---------- */
  // ω y ζ resueltos numéricamente para el encogimiento objetivo (ilustrativo).
  // Los niveles de cuidado son orientativos (0–5); el diagnóstico en el salón manda.
  var PATRONES = [
    { code: '2A', familia: 'Ondulado', w: 0.641, z: 0.00, ciclos: 1.25, nombre: 'Onda suelta',
      forma: 'Una S abierta y larga que nace a media altura.',
      cuidado: 'Productos ligeros: espuma o gel suave. Lo pesado la alisa.',
      hidratacion: 2, definicion: 2, noche: 1 },
    { code: '2B', familia: 'Ondulado', w: 0.817, z: 0.00, ciclos: 1.5, nombre: 'Onda marcada',
      forma: 'S definida desde el medio, con algo de volumen en la raíz.',
      cuidado: 'Gel ligero en el pelo mojado y secado sin tocar.',
      hidratacion: 2, definicion: 3, noche: 2 },
    { code: '2C', familia: 'Ondulado', w: 0.989, z: 0.00, ciclos: 2, nombre: 'Onda profunda',
      forma: 'S cerrada que empieza casi en la raíz y tiende al frizz.',
      cuidado: 'Crema más gel para sujetar la forma. Difusor a temperatura baja.',
      hidratacion: 3, definicion: 3, noche: 2 },
    { code: '3A', familia: 'Rizado', w: 1.162, z: 0.00, ciclos: 2.5, nombre: 'Rizo amplio',
      forma: 'Bucle grande, del grosor de una tiza, con brillo.',
      cuidado: 'Hidratación regular y nada de cepillar en seco.',
      hidratacion: 3, definicion: 3, noche: 3 },
    { code: '3B', familia: 'Rizado', w: 1.327, z: 0.10, ciclos: 3, nombre: 'Rizo de muelle',
      forma: 'Espiral del grosor de un marcador, con mucho volumen.',
      cuidado: 'Crema para peinar y gel. Se desenreda mojado y con los dedos.',
      hidratacion: 4, definicion: 4, noche: 3 },
    { code: '3C', familia: 'Rizado', w: 1.477, z: 0.18, ciclos: 3.5, nombre: 'Rizo cerrado',
      forma: 'Espiral del grosor de un lápiz, muy densa.',
      cuidado: 'Hidratación profunda frecuente y capas de producto en el pelo mojado.',
      hidratacion: 4, definicion: 4, noche: 4 },
    { code: '4A', familia: 'Afro', w: 1.615, z: 0.26, ciclos: 4.5, nombre: 'Coil definido',
      forma: 'Espiral pequeña, del grosor de una aguja de tejer.',
      cuidado: 'Método de capas: agua, crema y aceite o manteca para sellar.',
      hidratacion: 5, definicion: 4, noche: 4 },
    { code: '4B', familia: 'Afro', w: 1.715, z: 0.40, ciclos: 5.5, nombre: 'Zigzag',
      forma: 'Ángulos en Z más que espirales. Mucho encogimiento.',
      cuidado: 'Peinados protectores y definición por mechones (twists, trenzas).',
      hidratacion: 5, definicion: 5, noche: 5 },
    { code: '4C', familia: 'Afro', w: 1.804, z: 0.55, ciclos: 7, nombre: 'Zigzag compacto',
      forma: 'Zigzag muy cerrado. Puede encoger hasta tres cuartas partes de su largo.',
      cuidado: 'Mucha agua, sellado y manipulación mínima. La paciencia es parte del cuidado.',
      hidratacion: 5, definicion: 5, noche: 5 }
  ];

  /* ---------- Matemática ---------- */
  function J0(x) { // serie de Bessel J₀
    var sum = 0, term = 1, k = 0, q = -(x * x) / 4;
    for (k = 0; k < 40; k++) {
      if (k > 0) term *= q / (k * k);
      sum += term;
    }
    return sum;
  }

  // Integra la curva. Devuelve puntos {x, y, a} con longitud total = ciclos.
  function curva(p, opts) {
    opts = opts || {};
    var ciclos = opts.ciclos != null ? opts.ciclos : p.ciclos;
    var fase = opts.fase || 0;
    var porCiclo = opts.resolucion || 90;
    var n = Math.max(8, Math.round(ciclos * porCiclo));
    var ds = ciclos / n, x = 0, y = 0, pts = [];
    for (var i = 0; i <= n; i++) {
      var s = i * ds + fase;
      var a = p.w * Math.sin(TAU * s) + (p.z || 0) * Math.sin(3 * TAU * s);
      pts.push({ x: x, y: y, a: a });
      x += Math.cos(a) * ds;
      y += Math.sin(a) * ds;
    }
    return pts;
  }

  function encogimiento(p) {
    var pts = curva(p, { ciclos: 1, resolucion: 600 });
    var last = pts[pts.length - 1];
    return 1 - Math.hypot(last.x, last.y);
  }
  // Ciclos necesarios para que un trazo avance «distancia» (en unidades de paso).
  var memoAvance = {};
  function ciclosPara(p, distancia) {
    var k = p.w.toFixed(3) + '/' + (p.z || 0).toFixed(3);
    if (!(k in memoAvance)) memoAvance[k] = Math.max(0.15, 1 - encogimiento(p));
    return distancia / memoAvance[k];
  }
  PATRONES.forEach(function (p) {
    p.encogimiento = encogimiento(p);
    p.j0 = 1 - J0(p.w);
  });

  /* ---------- Pluma de punta ancha ---------- */
  // Dibuja el trazo como la unión de cuadriláteros (suma de Minkowski de la
  // curva y la punta). pts ya transformados a píxeles.
  function pluma(ctx, pts, o) {
    var ang = o.angulo != null ? o.angulo : -0.61; // 35° como en caligrafía
    var ancho = o.ancho || 6;
    var fino = o.fino != null ? o.fino : 0.16;    // grosor mínimo (fracción)
    var desde = Math.max(0, Math.floor((o.desde || 0) * (pts.length - 1)));
    var hasta = Math.min(pts.length - 1, Math.ceil((o.hasta == null ? 1 : o.hasta) * (pts.length - 1)));
    var nx = Math.cos(ang), ny = Math.sin(ang);
    var total = pts.length - 1;
    ctx.beginPath();
    for (var i = desde; i < hasta; i++) {
      var p0 = pts[i], p1 = pts[i + 1];
      var t = i / total;
      var taper = Math.min(1, t / 0.06, (1 - t) / 0.08);
      taper = 0.35 + 0.65 * Math.max(0, taper);
      var h = ancho * 0.5 * taper;
      var dx = p1.x - p0.x, dy = p1.y - p0.y;
      var cross = dx * ny - dy * nx;
      var len = Math.hypot(dx, dy) || 1;
      var minW = ancho * fino * 0.5 * taper;
      // Grosor mínimo perpendicular para que el trazo nunca desaparezca.
      var px = -dy / len * minW, py = dx / len * minW;
      var ax = nx * h + px * (cross >= 0 ? 1 : -1), ay = ny * h + py * (cross >= 0 ? 1 : -1);
      if (cross >= 0) {
        ctx.moveTo(p0.x + ax, p0.y + ay); ctx.lineTo(p1.x + ax, p1.y + ay);
        ctx.lineTo(p1.x - ax, p1.y - ay); ctx.lineTo(p0.x - ax, p0.y - ay);
      } else {
        ctx.moveTo(p0.x - ax, p0.y - ay); ctx.lineTo(p1.x - ax, p1.y - ay);
        ctx.lineTo(p1.x + ax, p1.y + ay); ctx.lineTo(p0.x + ax, p0.y + ay);
      }
      ctx.closePath();
    }
    ctx.fillStyle = o.color || '#3B2A1D';
    ctx.fill('nonzero');
  }

  // Transforma puntos de curva: rota (rad), escala y traslada.
  function colocar(pts, o) {
    var c = Math.cos(o.rot || 0), s = Math.sin(o.rot || 0), k = o.escala || 1;
    var ox = o.x || 0, oy = o.y || 0;
    return pts.map(function (p) {
      return { x: ox + (p.x * c - p.y * s) * k, y: oy + (p.x * s + p.y * c) * k };
    });
  }

  function limites(pts) {
    var b = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
    pts.forEach(function (p) {
      if (p.x < b.x0) b.x0 = p.x; if (p.x > b.x1) b.x1 = p.x;
      if (p.y < b.y0) b.y0 = p.y; if (p.y > b.y1) b.y1 = p.y;
    });
    return b;
  }

  /* ---------- Utilidades de lienzo ---------- */
  function token(nombre, el) {
    return getComputedStyle(el || document.documentElement).getPropertyValue(nombre).trim();
  }

  function preparar(canvas) {
    var dpr = Math.min(global.devicePixelRatio || 1, 2);
    var r = canvas.getBoundingClientRect();
    var w = Math.max(1, Math.round(r.width)), h = Math.max(1, Math.round(r.height));
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    }
    var ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx: ctx, w: w, h: h };
  }

  // Bucle que se pausa fuera de pantalla, con la pestaña oculta y con
  // «reducir movimiento» (en ese caso pinta un solo fotograma).
  function bucle(canvas, pintar) {
    var visible = true, id = 0, t0 = performance.now(), parado = false;
    function frame(now) {
      id = 0;
      if (parado) return;
      pintar((now - t0) / 1000);
      if (visible && !mqReduce.matches && !document.hidden) id = requestAnimationFrame(frame);
    }
    function arrancar() { if (!id) id = requestAnimationFrame(frame); }
    if ('IntersectionObserver' in global) {
      new IntersectionObserver(function (e) {
        visible = e[0].isIntersecting;
        if (visible) arrancar();
      }).observe(canvas);
    }
    document.addEventListener('visibilitychange', function () { if (!document.hidden) arrancar(); });
    if (mqReduce.addEventListener) mqReduce.addEventListener('change', arrancar);
    var ro = 'ResizeObserver' in global ? new ResizeObserver(function () { pintar((performance.now() - t0) / 1000); arrancar(); }) : null;
    if (ro) ro.observe(canvas);
    arrancar();
    return { parar: function () { parado = true; if (ro) ro.disconnect(); }, repintar: arrancar };
  }

  /* ---------- Piezas animadas ---------- */

  // Muestra estática de un patrón dentro de un lienzo.
  // ajuste: 'caja' (llena el alto) o 'largo' (misma longitud real para todos: se ve el encogimiento)
  function muestra(canvas, code, o) {
    o = o || {};
    var p = typeof code === 'string' ? porCodigo(code) : code;
    function pintar(t) {
      var c = preparar(canvas), ctx = c.ctx;
      ctx.clearRect(0, 0, c.w, c.h);
      var mov = o.animar && !mqReduce.matches ? t * (o.velocidad || 0.12) : 0;
      var pts = curva(p, { fase: mov % 1, ciclos: o.ciclos || p.ciclos });
      var largo = o.ciclos || p.ciclos;
      var b = limites(pts);
      var pad = o.margen != null ? o.margen : 10;
      var alto = c.h - pad * 2;
      var escala = o.ajuste === 'largo' ? alto / largo : alto / Math.max(0.0001, b.x1 - b.x0);
      var ancho = (b.y1 - b.y0) * escala;
      if (ancho > c.w - pad * 2) escala *= (c.w - pad * 2) / ancho;
      var cx = (b.y0 + b.y1) / 2;
      var placed = colocar(pts, { rot: Math.PI / 2, escala: escala, x: c.w / 2 + cx * escala, y: pad - b.x0 * escala });
      pluma(ctx, placed, { ancho: o.ancho || Math.max(3, Math.min(9, c.w / 14)), color: o.color || token('--color-trazo', canvas) || '#3B2A1D', hasta: o.hasta });
    }
    if (o.animar) return bucle(canvas, pintar);
    if ('ResizeObserver' in global) new ResizeObserver(function () { pintar(0); }).observe(canvas);
    else pintar(0);
    return { repintar: function () { pintar(0); } };
  }

  // Cinta: trazos que avanzan en horizontal (base del hero, franjas).
  function cinta(canvas, o) {
    o = o || {};
    var hebras = o.hebras || 5;
    var semillas = [];
    for (var i = 0; i < hebras; i++) semillas.push(PATRONES[(i * 2 + (o.desfase || 0)) % PATRONES.length]);
    return bucle(canvas, function (t) {
      var c = preparar(canvas), ctx = c.ctx;
      ctx.clearRect(0, 0, c.w, c.h);
      var colores = (o.colores || [token('--color-trazo-claro', canvas) || '#F9F0E7']);
      for (var i = 0; i < hebras; i++) {
        var p = semillas[i];
        var fase = (t * (o.velocidad || 0.06) * (1 + i * 0.13) + i * 0.37) % 1;
        var paso = (o.paso || 120) * (1 - i * 0.07);
        var q = { w: p.w * (o.giro || 0.8), z: p.z * 0.6 };
        var pts = curva(q, { ciclos: ciclosPara(q, c.w / paso + 2.2), fase: fase, resolucion: 60 });
        var y = c.h * ((i + 0.5) / hebras);
        // La amplitud se ajusta a la banda de cada hebra para no cortarse en los bordes.
        var b = limites(pts), banda = c.h / hebras * (o.solape || 0.85);
        var ky = Math.min(1, banda / Math.max(1e-6, (b.y1 - b.y0) * paso));
        var cy = (b.y0 + b.y1) / 2;
        var placed = pts.map(function (pt) { return { x: -paso + pt.x * paso, y: y + (pt.y - cy) * paso * ky }; });
        ctx.globalAlpha = o.alfa ? o.alfa[i % o.alfa.length] : 1 - i * 0.12;
        pluma(ctx, placed, { ancho: (o.ancho || 5) * (1 - i * 0.08), color: colores[i % colores.length], hasta: o.revelar ? Math.min(1, t / o.revelar) : 1 });
      }
      ctx.globalAlpha = 1;
    });
  }

  // Costura: trazo vertical continuo que sube (borde entre panel y foto).
  function costura(canvas, o) {
    o = o || {};
    return bucle(canvas, function (t) {
      var c = preparar(canvas), ctx = c.ctx;
      ctx.clearRect(0, 0, c.w, c.h);
      var p = { w: o.giro || 1.05, z: 0 };
      var paso = o.paso || 64;
      var fase = (t * (o.velocidad || 0.08)) % 1;
      var pts = curva(p, { ciclos: ciclosPara(p, c.h / paso + 2), fase: fase, resolucion: 60 });
      var b = limites(pts);
      var k = paso;
      var anchoCurva = (b.y1 - b.y0) * k;
      var escala = anchoCurva > c.w - 4 ? k * (c.w - 4) / anchoCurva : k;
      var placed = colocar(pts, { rot: Math.PI / 2, escala: escala, x: c.w / 2 + (b.y0 + b.y1) / 2 * escala, y: -paso });
      pluma(ctx, placed, { ancho: o.ancho || 5, color: o.color || token('--color-trazo-claro', canvas) || '#F9F0E7' });
    });
  }

  /* ---------- Ilustración: melena antes / después ---------- */
  // Generada con la misma curva. «antes»: hebras sueltas, cada una con su fase y
  // ruido, más halo de frizz. «despues»: hebras agrupadas en mechones definidos.
  // Es una ilustración, no una foto: se sustituirá por fotos reales con permiso.
  function azar(semilla) {
    var s = semilla >>> 0 || 1;
    return function () { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 100000) / 100000; };
  }
  function melena(canvas, o) {
    o = o || {};
    var p = typeof o.patron === 'string' ? porCodigo(o.patron) : (o.patron || porCodigo('3B'));
    var c = preparar(canvas), ctx = c.ctx, W = c.w, H = c.h;
    var rnd = azar(o.semilla || 7);
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = o.fondo || '#E7D8CB';
    ctx.fillRect(0, 0, W, H);
    var tonos = o.tonos || ['#1E150E', '#3B2A1D', '#2A1D13', '#4A3627'];
    var brillo = o.brillo || '#785C44';
    var despues = o.estado === 'despues';
    var mechones = Math.max(6, Math.round(W / (despues ? 26 : 12)));
    var paso = Math.max(26, H / (p.ciclos * 1.15 + 1.5));
    var x0 = -W * 0.08, ancho = W * 1.16;
    var i, j;
    if (!despues) {
      // halo de frizz: trazos cortos en todas direcciones
      for (i = 0; i < W * H / 260; i++) {
        var fx = rnd() * W, fy = rnd() * H * 0.98, fa = rnd() * TAU;
        ctx.strokeStyle = tonos[i % tonos.length];
        ctx.globalAlpha = 0.35 + rnd() * 0.4;
        ctx.lineWidth = 0.9;
        ctx.beginPath(); ctx.moveTo(fx, fy);
        ctx.quadraticCurveTo(fx + Math.cos(fa) * 6, fy + Math.sin(fa) * 6, fx + Math.cos(fa + 1.2) * 9, fy + Math.sin(fa + 1.2) * 9);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
    for (i = 0; i < mechones; i++) {
      var hebras = despues ? 3 : 1;
      var baseX = x0 + ancho * (i + (despues ? 0.5 : rnd())) / mechones;
      var fase = despues ? (i * 0.31) % 1 : rnd();
      for (j = 0; j < hebras; j++) {
        var q = { w: p.w * (despues ? 1 : 0.55 + rnd() * 0.5), z: despues ? p.z : p.z * rnd() };
        var largo = (H + paso * 2) / (paso * 0.62);
        var pts = curva(q, { ciclos: ciclosPara(q, largo), fase: fase + j * 0.04, resolucion: 50 });
        if (!despues) {
          // ruido: la hebra pierde el patrón
          var deriva = 0;
          pts = pts.map(function (pt, k) {
            deriva = deriva * 0.94 + (rnd() - 0.5) * 0.05;
            return { x: pt.x, y: pt.y + deriva + (rnd() - 0.5) * 0.025 };
          });
        }
        var placed = colocar(pts, { rot: Math.PI / 2, escala: paso * (despues ? 0.62 : 0.7), x: baseX + (j - 1) * (despues ? 3.2 : 0), y: -paso * 0.6 });
        pluma(ctx, placed, {
          ancho: despues ? Math.max(2.6, paso * 0.075) : Math.max(1.2, paso * 0.03),
          fino: despues ? 0.25 : 0.6,
          color: j === 1 && despues ? brillo : tonos[(i + j) % tonos.length]
        });
      }
    }
  }

  /* ---------- SVG: dibujar por partes ---------- */
  // Anima cada <path> del SVG con stroke-dashoffset y luego rellena.
  function dibujar(raiz, o) {
    o = o || {};
    var partes = Array.prototype.slice.call(raiz.querySelectorAll(o.selector || 'path'));
    var dur = o.duracion || 700, escalon = o.escalon || 40, easing = o.easing || EASE.tinta;
    var anims = [];
    partes.forEach(function (el, i) {
      var len = 0;
      try { len = el.getTotalLength(); } catch (e) { len = 1000; }
      el.style.strokeDasharray = len + ' ' + len;
      el.style.strokeDashoffset = len;
      el.style.fillOpacity = 0;
      var retraso = (o.retraso || 0) + i * escalon;
      if (!el.animate) { el.style.strokeDashoffset = 0; el.style.fillOpacity = 1; return; }
      anims.push(el.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }],
        { duration: dur, delay: retraso, easing: easing, fill: 'forwards' }));
      anims.push(el.animate([{ fillOpacity: 0 }, { fillOpacity: 1 }],
        { duration: dur * 0.6, delay: retraso + dur * 0.55, easing: 'linear', fill: 'forwards' }));
    });
    return {
      animaciones: anims,
      terminado: Promise.all(anims.map(function (a) { return a.finished.catch(function () {}); })),
      acabar: function () { anims.forEach(function (a) { try { a.finish(); } catch (e) {} }); }
    };
  }

  /* ---------- FLIP ---------- */
  // Lleva «el» (posición actual) a la caja de «destino» con translate + scale.
  function flip(el, desde, hasta, o) {
    o = o || {};
    var s = hasta.width / desde.width;
    var dx = (hasta.left + hasta.width / 2) - (desde.left + desde.width / 2);
    var dy = (hasta.top + hasta.height / 2) - (desde.top + desde.height / 2);
    el.style.transformOrigin = (desde.left + desde.width / 2 - el.getBoundingClientRect().left) + 'px ' +
      (desde.top + desde.height / 2 - el.getBoundingClientRect().top) + 'px';
    return el.animate([
      { transform: 'translate(0,0) scale(1)' },
      { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + s + ')' }
    ], { duration: o.duracion || 480, easing: o.easing || EASE.pluma, fill: 'forwards' });
  }

  /* ---------- Movimiento con nombre ---------- */
  var EASE = {
    tinta: 'cubic-bezier(0.2, 0.7, 0.2, 1)',     // la tinta sale y se frena
    pluma: 'cubic-bezier(0.65, 0, 0.35, 1)',     // subida y bajada de la pluma
    arrastre: 'cubic-bezier(0.5, 0, 0.75, 0)',   // la pluma arranca
    remate: 'cubic-bezier(0.16, 1, 0.3, 1)'      // final firme, sin rebote
  };
  var DUR = { pincelada: 120, trazo: 240, firma: 480, secado: 900, obra: 1600 };

  function porCodigo(code) {
    for (var i = 0; i < PATRONES.length; i++) if (PATRONES[i].code === code) return PATRONES[i];
    return PATRONES[0];
  }

  global.Trazo = {
    PATRONES: PATRONES, EASE: EASE, DUR: DUR,
    J0: J0, curva: curva, colocar: colocar, limites: limites, pluma: pluma,
    preparar: preparar, bucle: bucle, token: token,
    muestra: muestra, cinta: cinta, costura: costura, melena: melena, azar: azar, ciclosPara: ciclosPara,
    dibujar: dibujar, flip: flip, porCodigo: porCodigo,
    reducido: function () { return mqReduce.matches; }
  };
})(window);
