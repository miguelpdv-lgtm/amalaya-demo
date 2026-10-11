/* EncrespArte · landing */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var root = document.documentElement;
  var WA = '573108981207';
  var LIENZO = '#F9F0E7', OCRE3 = '#DFBA87', SIENA3 = '#D2BCAB';
  var repintar = [];
  var navSvg = $('.barra-nav__logo svg');

  /* ---------- Intro: el logo se dibuja y vuela a la navbar ---------- */
  var finIntro = null;
  var introLista = new Promise(function (r) { finIntro = r; });
  function intro() {
    if (!root.classList.contains('intro-pendiente')) { finIntro(); return; }
    try { sessionStorage.setItem('encresparte-intro', '1'); } catch (e) {}
    // Si el JS llega tarde (el failsafe CSS ya actuó) o no hay WAAPI, no hay intro.
    if (!navSvg || !Element.prototype.animate || performance.now() > 2900) {
      root.classList.remove('intro-pendiente');
      finIntro();
      return;
    }
    var capa = document.createElement('div');
    capa.className = 'intro';
    capa.setAttribute('aria-hidden', 'true');
    var svg = navSvg.cloneNode(true);
    svg.setAttribute('viewBox', '50 362 970 322');
    svg.removeAttribute('role');
    svg.removeAttribute('aria-label');
    capa.appendChild(svg);
    var aviso = document.createElement('span');
    aviso.className = 'intro__saltar';
    aviso.textContent = 'Toca o pulsa una tecla para saltar';
    capa.appendChild(aviso);
    document.body.appendChild(capa);
    root.classList.add('intro-activa');
    root.classList.remove('intro-pendiente');

    var anims = [], hecho = false, temporizador = 0;
    var tinta = Trazo.EASE.tinta;
    function trazar(p, retraso, dur) {
      var len = p.getTotalLength();
      p.style.strokeDasharray = len + ' ' + len;
      anims.push(p.animate([
        { strokeDashoffset: len, fillOpacity: 0 },
        { strokeDashoffset: 0, fillOpacity: 0, offset: 0.62 },
        { strokeDashoffset: 0, fillOpacity: 1 }
      ], { duration: dur, delay: retraso, easing: tinta, fill: 'both' }));
    }
    // 1) la E, 2) el nombre letra a letra, 3) el lema aparece y se retira
    trazar($('.logo-e', svg), 0, 600);
    $$('.logo-letras path', svg).forEach(function (p, i) { trazar(p, 240 + i * 36, 420); });
    var lema = $('.logo-lema', svg);
    anims.push(lema.animate([
      { opacity: 0, transform: 'translateY(10px)' },
      { opacity: 1, transform: 'none', offset: 0.4 },
      { opacity: 1, offset: 0.7 },
      { opacity: 0 }
    ], { duration: 560, delay: 480, easing: 'linear', fill: 'both' }));
    anims.push(aviso.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, delay: 400, fill: 'both' }));

    // 4) vuelo FLIP hasta la navbar (1,08 s → 1,6 s), encadenado al final real del dibujo
    var dibujo = anims.slice(0, -1).map(function (a) { return a.finished.catch(function () {}); });
    Promise.all(dibujo).then(function () { setTimeout(volar, 40); });
    function volar() {
      if (hecho) return;
      var desde = $('.logo-palabra', svg).getBoundingClientRect();
      var hasta = $('.logo-palabra', navSvg).getBoundingClientRect();
      var colorFinal = getComputedStyle(navSvg).color;
      var dur = 520;
      var vuelo = Trazo.flip(svg, desde, hasta, { duracion: dur, easing: Trazo.EASE.pluma });
      anims.push(vuelo);
      anims.push(svg.animate([{ color: LIENZO }, { color: colorFinal }], { duration: dur, easing: Trazo.EASE.pluma, fill: 'both' }));
      anims.push(capa.animate([{ backgroundColor: 'rgb(59, 42, 29)' }, { backgroundColor: 'rgba(59, 42, 29, 0)' }], { duration: dur, easing: tinta, fill: 'both' }));
      anims.push(aviso.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, fill: 'both' }));
      vuelo.finished.then(terminar, terminar);
    }

    function terminar() {
      if (hecho) return;
      hecho = true;
      clearTimeout(temporizador);
      root.classList.remove('intro-activa');
      capa.remove();
      quitarEscuchas();
      finIntro();
    }
    function saltar() {
      if (hecho) return;
      hecho = true;
      clearTimeout(temporizador);
      anims.forEach(function (a) { try { a.cancel(); } catch (e) {} });
      root.classList.remove('intro-activa');
      var f = capa.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, fill: 'forwards' });
      f.finished.then(function () { capa.remove(); }, function () { capa.remove(); });
      quitarEscuchas();
      finIntro();
    }
    var eventos = ['click', 'keydown', 'wheel', 'touchstart', 'scroll'];
    function quitarEscuchas() { eventos.forEach(function (e) { window.removeEventListener(e, saltar, true); }); }
    eventos.forEach(function (e) { window.addEventListener(e, saltar, { capture: true, passive: true }); });
  }
  intro();

  /* ---------- Menú móvil ---------- */
  var botonMenu = $('[data-menu]'), menu = $('#menu');
  if (botonMenu && menu) {
    botonMenu.addEventListener('click', function () {
      var abierto = botonMenu.getAttribute('aria-expanded') === 'true';
      botonMenu.setAttribute('aria-expanded', String(!abierto));
      menu.classList.toggle('abierto', !abierto);
      $('.visualmente-oculto', botonMenu).textContent = abierto ? 'Abrir menú' : 'Cerrar menú';
    });
    $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { botonMenu.setAttribute('aria-expanded', 'false'); menu.classList.remove('abierto'); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('abierto')) { botonMenu.click(); botonMenu.focus(); } });
  }

  /* ---------- Lienzos de marca ---------- */
  var costura = $('[data-costura]');
  if (costura) Trazo.costura(costura, { paso: 70, ancho: 5, velocidad: 0.06, color: LIENZO });
  var cintaHero = $('[data-hero-cinta]');
  if (cintaHero) Trazo.cinta(cintaHero, { hebras: 3, paso: 110, ancho: 5, velocidad: 0.05, colores: [LIENZO, OCRE3, SIENA3], alfa: [1, 0.9, 0.7] });
  var cintaCta = $('[data-cta-cinta]');
  if (cintaCta) Trazo.cinta(cintaCta, { hebras: 3, paso: 120, ancho: 5, velocidad: 0.04, desfase: 1, colores: [OCRE3, LIENZO, SIENA3], alfa: [0.9, 1, 0.7] });

  /* ---------- Lo que está bajo el pliegue se prepara cuando acaba la intro ---------- */
  var tareas = [];
  function resto() {
    (function siguiente() {
      var t = tareas.shift();
      if (!t) return;
      t();
      setTimeout(siguiente, 16);
    })();
  }
  tareas.push(function () {
  /* ---------- 1 · Franja ---------- */
  var franja = $('[data-franja]');
  if (franja) {
    [false, true].forEach(function (copia) {
      var grupo = document.createElement('div');
      grupo.style.display = 'flex';
      if (copia) grupo.setAttribute('aria-hidden', 'true');
      Trazo.PATRONES.forEach(function (p) {
        var it = document.createElement('div');
        it.className = 'franja__item';
        it.innerHTML = '<canvas aria-hidden="true"></canvas><div><b>' + p.code + '</b><span>' + p.familia + '</span></div>';
        grupo.appendChild(it);
        Trazo.muestra($('canvas', it), p.code, { color: LIENZO, ancho: 3.6, margen: 4 });
      });
      franja.appendChild(grupo);
    });
  }

  });
  tareas.push(function () {
  /* ---------- 2 · Buscador de patrón ---------- */
  var selector = $('[data-selector]');
  var lienzoPatron = $('[data-patron-canvas]');
  var actual = Trazo.porCodigo('3B');
  var dibujoPatron = 0;
  function pintarPatron(progreso) {
    if (!lienzoPatron) return;
    var c = Trazo.preparar(lienzoPatron), ctx = c.ctx, p = actual;
    ctx.clearRect(0, 0, c.w, c.h);
    var color = Trazo.token('--color-trazo') || '#3B2A1D';
    var suave = Trazo.token('--color-filete') || '#D2BCAB';
    var pad = 18, alto = c.h - pad * 2;
    // regla del largo real
    ctx.strokeStyle = suave; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(c.w - 22, pad); ctx.lineTo(c.w - 22, pad + alto);
    for (var k = 0; k <= 10; k++) { var y = pad + alto * k / 10; ctx.moveTo(c.w - (k % 5 ? 27 : 32), y); ctx.lineTo(c.w - 22, y); }
    ctx.stroke();
    // tres hebras del mismo patrón, misma longitud real
    var desplaz = [-0.26, 0, 0.26];
    desplaz.forEach(function (dx, i) {
      var pts = Trazo.curva(p, { fase: i * 0.21, resolucion: 120 });
      var b = Trazo.limites(pts);
      var esc = alto / p.ciclos;
      var placed = Trazo.colocar(pts, { rot: Math.PI / 2, escala: esc, x: (c.w - 30) / 2 + dx * Math.min(c.w, 360) + (b.y0 + b.y1) / 2 * esc, y: pad });
      Trazo.pluma(ctx, placed, { ancho: Math.max(5, Math.min(10, c.w / 34)), color: i === 1 ? color : (Trazo.token('--color-acento') || '#785C44'), hasta: progreso });
    });
    // marca de dónde acaba el rizo
    var fin = pad + alto * (1 - p.encogimiento) * progreso;
    ctx.fillStyle = color;
    ctx.fillRect(c.w - 36, fin - 1, 18, 2);
  }
  function animarPatron() {
    cancelAnimationFrame(dibujoPatron);
    if (Trazo.reducido()) { pintarPatron(1); return; }
    var t0 = performance.now(), dur = Trazo.DUR.secado;
    (function paso(t) {
      var k = Math.min(1, (t - t0) / dur);
      var e = 1 - Math.pow(1 - k, 3);
      pintarPatron(e);
      if (k < 1) dibujoPatron = requestAnimationFrame(paso);
    })(t0);
  }
  function elegir(p, foco) {
    actual = p;
    $$('.selector__opcion', selector).forEach(function (b) {
      var si = b.getAttribute('data-code') === p.code;
      b.setAttribute('aria-selected', String(si));
      b.tabIndex = si ? 0 : -1;
      if (si && foco) b.focus();
    });
    $('[data-patron-codigo]').textContent = p.code;
    $('[data-patron-familia]').textContent = p.familia;
    $('[data-patron-nombre]').textContent = p.nombre;
    $('[data-patron-forma]').textContent = p.forma;
    $('[data-patron-cuidado]').textContent = p.cuidado;
    $('[data-patron-encoge]').textContent = 'encoge ≈ ' + Math.round(p.encogimiento * 100) + ' % (ilustrativo)';
    ['hidratacion', 'definicion', 'noche'].forEach(function (k) {
      var barra = $('[data-medidor="' + k + '"]');
      $$('i', barra).forEach(function (i, n) { i.classList.toggle('on', n < p[k]); });
      barra.setAttribute('role', 'img');
      barra.setAttribute('aria-label', p[k] + ' de 5');
      barra.nextElementSibling.textContent = p[k] + '/5';
    });
    var wa = $('[data-reservar-patron]');
    if (wa) wa.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent('Hola EncrespArte, creo que mi patrón es ' + p.code + ' y quiero reservar una cita.');
    animarPatron();
  }
  if (selector) {
    Trazo.PATRONES.forEach(function (p) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'selector__opcion';
      b.setAttribute('role', 'tab'); b.setAttribute('aria-controls', 'patron-panel');
      b.setAttribute('data-code', p.code);
      b.innerHTML = p.code + '<small>' + p.familia + '</small>';
      b.addEventListener('click', function () { elegir(p); });
      selector.appendChild(b);
    });
    selector.addEventListener('keydown', function (e) {
      var i = Trazo.PATRONES.indexOf(actual), n = Trazo.PATRONES.length;
      var j = e.key === 'ArrowRight' ? (i + 1) % n : e.key === 'ArrowLeft' ? (i - 1 + n) % n : e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : -1;
      if (j < 0) return;
      e.preventDefault();
      elegir(Trazo.PATRONES[j], true);
    });
    elegir(actual);
    repintar.push(function () { pintarPatron(1); });
    if ('ResizeObserver' in window) new ResizeObserver(function () { pintarPatron(1); }).observe(lienzoPatron);
  }

  });
  tareas.push(function () {
  /* ---------- 4 · Método ---------- */
  function pintarPasos() {
    $$('[data-paso]').forEach(function (c) {
      var i = +c.getAttribute('data-paso');
      var cx = Trazo.preparar(c), ctx = cx.ctx;
      ctx.clearRect(0, 0, cx.w, cx.h);
      var color = Trazo.token('--color-trazo'), acento = Trazo.token('--color-acento'), destello = Trazo.token('--color-destello');
      var rnd = Trazo.azar(5 + i);
      var p = Trazo.porCodigo('3B');
      var hebras = 5;
      for (var h = 0; h < hebras; h++) {
        var largo = i === 0 ? 1 : 0.78;                 // tras el corte, más corto
        var ruido = [0.07, 0.03, 0.02, 0][i];
        var pts = Trazo.curva(p, { ciclos: 2.6, fase: i === 3 ? 0.1 : rnd(), resolucion: 80 });
        if (ruido) { var d = 0; pts = pts.map(function (pt) { d = d * 0.9 + (rnd() - 0.5) * ruido; return { x: pt.x, y: pt.y + d }; }); }
        var b = Trazo.limites(pts);
        var esc = (cx.h * largo - 8) / (b.x1 - b.x0);
        var hueco = cx.w / (hebras + 0.5);
        var anchoC = (b.y1 - b.y0) * esc; if (anchoC > hueco * 1.3) esc *= hueco * 1.3 / anchoC;
        var placed = Trazo.colocar(pts, { rot: Math.PI / 2, escala: esc, x: hueco * (h + 0.75) + (b.y0 + b.y1) / 2 * esc, y: 4 - b.x0 * esc });
        var col = i === 2 && h % 2 ? destello : i === 3 && h === 2 ? acento : color;
        Trazo.pluma(ctx, placed, { ancho: i === 3 ? 4.5 : i === 0 ? 2 : 3.5, fino: i === 0 ? 0.6 : 0.2, color: col });
      }
    });
  }
  repintar.push(pintarPasos);
  var m = $('.metodo__pasos');
  if ('ResizeObserver' in window && m) new ResizeObserver(pintarPasos).observe(m); else pintarPasos();

  });
  tareas.push(function () {
  /* ---------- 5 · Comparador ---------- */
  var marco = $('[data-comparador]');
  var patronIlustra = '3B';
  function pintarMelenas() {
    $$('[data-melena]', marco).forEach(function (c) {
      Trazo.melena(c, { estado: c.getAttribute('data-melena'), patron: patronIlustra, semilla: 17 });
    });
  }
  if (marco) {
    var rango = $('[data-rango]', marco);
    var mover = function () { marco.style.setProperty('--pos', rango.value + '%'); };
    rango.addEventListener('input', mover);
    mover();
    if ('ResizeObserver' in window) new ResizeObserver(pintarMelenas).observe(marco); else pintarMelenas();
    $$('[data-ilustra]').forEach(function (b) {
      b.addEventListener('click', function () {
        patronIlustra = b.getAttribute('data-ilustra');
        $$('[data-ilustra]').forEach(function (o) { o.setAttribute('aria-pressed', String(o === b)); });
        pintarMelenas();
      });
    });
  }

  });
  tareas.push(function () {
  /* ---------- 6 · Firma del manifiesto ---------- */
  var firma = $('[data-firma] path');
  if (firma && 'IntersectionObserver' in window && !Trazo.reducido() && firma.animate) {
    var r = firma.getBoundingClientRect();
    if (r.top > window.innerHeight) {
      var len = firma.getTotalLength();
      firma.style.strokeDasharray = len;
      firma.style.strokeDashoffset = len;
      var io = new IntersectionObserver(function (es) {
        if (!es[0].isIntersecting) return;
        io.disconnect();
        firma.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], { duration: Trazo.DUR.secado * 1.4, easing: Trazo.EASE.tinta, fill: 'forwards' });
        setTimeout(function () { firma.style.strokeDashoffset = 0; }, Trazo.DUR.secado * 1.4 + 50);
      }, { threshold: 0.4 });
      io.observe(firma.ownerSVGElement);
    }
  }

  });
  introLista.then(function () { setTimeout(resto, 200); });

  /* ---------- Pie: logo completo ---------- */
  var pie = $('[data-logo-pie]');
  if (pie && navSvg) {
    var s = navSvg.cloneNode(true);
    s.setAttribute('viewBox', '50 362 970 322');
    s.setAttribute('aria-label', 'EncrespArte, cada rizo es una obra de arte');
    pie.appendChild(s);
  }

  /* ---------- Cambio de tema del sistema ---------- */
  if (window.matchMedia) {
    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    var alCambiar = function () { repintar.forEach(function (f) { f(); }); };
    if (mq.addEventListener) mq.addEventListener('change', alCambiar);
  }
})();
