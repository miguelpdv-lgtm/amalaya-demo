/* EncrespArte · guía del sistema de diseño */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var root = document.documentElement;

  /* ---------- Copiar ---------- */
  function copiar(texto, boton) {
    function ok() {
      if (!boton) return;
      var antes = boton.getAttribute('data-texto') || boton.textContent;
      boton.setAttribute('data-texto', antes);
      boton.setAttribute('data-ok', '');
      if (boton.classList.contains('copiar')) boton.textContent = 'Copiado';
      setTimeout(function () { boton.removeAttribute('data-ok'); if (boton.classList.contains('copiar')) boton.textContent = antes; }, 1400);
    }
    function respaldo() {
      var ta = document.createElement('textarea');
      ta.value = texto; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); ok(); } catch (e) {}
      document.body.removeChild(ta);
    }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(texto).then(ok, respaldo);
      else respaldo();
    } catch (e) { respaldo(); }
  }

  /* ---------- Tema ---------- */
  var botonesTema = $$('[data-tema]');
  function aplicarTema(t) {
    if (t === 'sistema') root.removeAttribute('data-theme'); else root.setAttribute('data-theme', t);
    botonesTema.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-tema') === t)); });
    try { localStorage.setItem('encresparte-tema-guia', t); } catch (e) {}
    setTimeout(actualizarContraste, 30);
    repintables.forEach(function (f) { f(); });
  }
  var repintables = [];
  botonesTema.forEach(function (b) { b.addEventListener('click', function () { aplicarTema(b.getAttribute('data-tema')); }); });
  try { var guardado = localStorage.getItem('encresparte-tema-guia'); if (guardado) aplicarTema(guardado); } catch (e) {}

  /* ---------- Logo: clones ---------- */
  var logoBase = $('.guia-cabecera__logo svg');
  var VB = { completo: '50 362 970 322', palabra: '50 362 970 262', e: '52 364 226 256' };
  $$('[data-logo]').forEach(function (hueco) {
    if (!logoBase) return;
    var tipo = hueco.getAttribute('data-logo');
    var svg = logoBase.cloneNode(true);
    svg.setAttribute('viewBox', VB[tipo] || VB.palabra);
    svg.setAttribute('aria-label', 'EncrespArte' + (tipo === 'completo' ? ', cada rizo es una obra de arte' : ''));
    svg.style.width = '100%'; svg.style.height = 'auto'; svg.style.display = 'block'; svg.style.fill = 'currentColor';
    if (tipo !== 'completo') { var l = svg.querySelector('.logo-lema'); if (l) l.remove(); }
    hueco.appendChild(svg);
  });

  /* ---------- Redibujar el logo ---------- */
  var botonDibujo = $('[data-redibujar]');
  if (botonDibujo) botonDibujo.addEventListener('click', function () {
    $$('.logo-lamina [data-logo="completo"] svg').forEach(function (svg) {
      $$('path', svg).forEach(function (p) {
        if (!p.classList.contains('logo-filete')) { p.style.stroke = 'currentColor'; p.style.strokeWidth = '1.6'; }
      });
      if (window.Trazo.reducido()) return;
      var piezas = [svg.querySelector('.logo-e')].concat($$('.logo-letras path', svg), $$('.logo-lema path', svg));
      var grupo = document.createElement('div');
      piezas.forEach(function (p, i) {
        var len = p.getTotalLength();
        p.style.strokeDasharray = len; p.style.fillOpacity = 0;
        var retraso = i === 0 ? 0 : (i <= 10 ? 380 + i * 45 : 900 + (i - 10) * 12);
        var dur = i === 0 ? 700 : 420;
        p.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], { duration: dur, delay: retraso, easing: Trazo.EASE.tinta, fill: 'both' });
        p.animate([{ fillOpacity: 0 }, { fillOpacity: 1 }], { duration: 300, delay: retraso + dur * 0.6, fill: 'both' });
      });
      grupo = null;
    });
  });

  /* ---------- Espectro ---------- */
  $$('[data-espectro] .eje').forEach(function (eje) {
    var pos = +eje.getAttribute('data-pos');
    var riel = $('.eje__riel', eje);
    for (var i = 1; i <= 10; i++) { var t = document.createElement('i'); t.style.left = ((i - 1) / 9 * 100) + '%'; riel.appendChild(t); }
    var b = document.createElement('b'); b.style.left = ((pos - 1) / 9 * 100) + '%'; b.title = pos + ' de 10'; riel.appendChild(b);
    riel.setAttribute('role', 'img'); riel.setAttribute('aria-label', 'Posición ' + pos + ' de 10');
  });

  /* ---------- Color ---------- */
  var PIGMENTOS = [
    ['Sepia', '--pigmento-sepia', 'Letras del logo. Muestreado de la foto de perfil.'],
    ['Lienzo', '--pigmento-lienzo', 'Fondo del logo. Muestreado.'],
    ['Siena', '--pigmento-siena', 'Filetes del lema. Muestreado.'],
    ['Carboncillo', '--pigmento-carboncillo', 'El tono más hondo del logo. Fondo oscuro.'],
    ['Gesso', '--pigmento-gesso', 'Imprimación: superficies y tarjetas.'],
    ['Ocre', '--pigmento-ocre', 'El ✨ de la bio. Decorativo sobre claro.'],
    ['Almagre', '--pigmento-almagre', 'Tierra roja: enlaces y foco.']
  ];
  var css = getComputedStyle(root);
  PIGMENTOS.forEach(function (p, i) {
    var muestras = $(i < 3 ? '[data-muestras="logo"]' : '[data-muestras="derivados"]');
    if (!muestras) return;
    var hex = css.getPropertyValue(p[1]).trim();
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'muestra';
    b.innerHTML = '<span class="muestra__color" style="background:var(' + p[1] + ')"></span><span class="muestra__datos"><strong>' + p[0] + '</strong><code>' + hex + '</code><small>' + p[2] + '</small></span>';
    b.setAttribute('aria-label', 'Copiar ' + p[0] + ' ' + hex);
    b.addEventListener('click', function () { copiar(hex, b); });
    muestras.appendChild(b);
  });
  var escalas = $('[data-escalas]');
  if (escalas) ['sepia', 'siena', 'ocre', 'almagre'].forEach(function (f) {
    var fila = document.createElement('div'); fila.className = 'escala';
    fila.innerHTML = '<span>' + f + '</span>';
    [50, 100, 200, 300, 400, 500, 600, 700, 800, 900].forEach(function (n) {
      var hex = css.getPropertyValue('--' + f + '-' + n).trim();
      var b = document.createElement('button'); b.type = 'button';
      b.style.background = hex; b.style.color = n >= 500 ? '#F9F0E7' : '#3B2A1D';
      b.textContent = n; b.title = '--' + f + '-' + n + ' ' + hex;
      b.setAttribute('aria-label', 'Copiar ' + f + ' ' + n + ' ' + hex);
      b.addEventListener('click', function () { copiar(hex, b); });
      fila.appendChild(b);
    });
    escalas.appendChild(fila);
  });

  // Contraste en vivo
  function rgb(str) { var m = str.match(/[\d.]+/g); return m ? m.slice(0, 3).map(Number) : [0, 0, 0]; }
  function lum(c) { return c.map(function (v) { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }).reduce(function (a, v, i) { return a + v * [0.2126, 0.7152, 0.0722][i]; }, 0); }
  function ratio(a, b) { var x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
  var PARES = [
    ['--color-texto', '--color-fondo', 'Texto'],
    ['--color-texto-suave', '--color-fondo', 'Texto suave'],
    ['--color-acento', '--color-fondo', 'Acento (etiquetas)'],
    ['--color-enlace', '--color-fondo', 'Enlace'],
    ['--color-texto', '--color-superficie', 'Texto en tarjeta'],
    ['--color-texto-suave', '--color-superficie', 'Texto suave en tarjeta'],
    ['--boton-texto', '--boton-fondo', 'Botón letrero'],
    ['--boton-texto-relleno', '--boton-relleno', 'Botón al pasar el cursor'],
    ['--color-panel-texto', '--color-panel', 'Panel: texto'],
    ['--color-panel-suave', '--color-panel', 'Panel: texto suave'],
    ['--color-panel-acento', '--color-panel', 'Panel: acento']
  ];
  var sonda = document.createElement('span'); sonda.style.display = 'none'; document.body.appendChild(sonda);
  function resolver(v) { sonda.style.color = 'var(' + v + ')'; return getComputedStyle(sonda).color; }
  function actualizarContraste() {
    var tb = $('[data-contraste] tbody'); if (!tb) return;
    tb.innerHTML = '';
    PARES.forEach(function (p) {
      var a = resolver(p[0]), b = resolver(p[1]);
      var r = ratio(rgb(a), rgb(b));
      var tr = document.createElement('tr');
      var pasa = r >= 4.5;
      tr.innerHTML = '<td><span class="par" style="color:' + a + ';background:' + b + '">Aa</span></td><td><code>' + p[0] + '</code><br><small>' + p[2] + '</small></td><td><code>' + p[1] + '</code></td><td class="datos">' + r.toFixed(2) + ':1</td><td><span class="ok ' + (pasa ? 'ok--si' : 'ok--no') + '">' + (pasa ? 'AA ✓' : (r >= 3 ? 'Solo grande' : 'No')) + '</span></td>';
      tb.appendChild(tr);
    });
  }
  actualizarContraste();
  if (window.matchMedia) window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () { setTimeout(actualizarContraste, 30); repintables.forEach(function (f) { f(); }); });

  /* ---------- Tipografía ---------- */
  var esp = $('[data-especimen]');
  $$('[data-eje]').forEach(function (input) {
    input.addEventListener('input', function () {
      esp.classList.remove('animando');
      esp.style.setProperty('--' + input.getAttribute('data-eje'), input.value);
      var v = $('[data-val="' + input.getAttribute('data-eje') + '"]'); if (v) v.textContent = input.value;
    });
  });

  /* ---------- Patrones ---------- */
  var escalaP = $('[data-escala-patrones]');
  var tablaP = $('[data-tabla-patrones] tbody');
  Trazo.PATRONES.forEach(function (p) {
    if (escalaP) {
      var fig = document.createElement('figure');
      var c = document.createElement('canvas');
      c.setAttribute('role', 'img'); c.setAttribute('aria-label', 'Hebra ' + p.code + ', encogimiento ' + Math.round(p.encogimiento * 100) + ' %');
      fig.appendChild(c);
      var cap = document.createElement('figcaption');
      cap.innerHTML = '<b>' + p.code + '</b><span>' + p.familia + '</span><span>' + Math.round(p.encogimiento * 100) + ' %</span>';
      fig.appendChild(cap); escalaP.appendChild(fig);
      var m = Trazo.muestra(c, p.code, { ajuste: 'largo', margen: 0 });
      repintables.push(m.repintar);
    }
    if (tablaP) {
      var tr = document.createElement('tr');
      tr.innerHTML = '<td class="datos"><b>' + p.code + '</b></td><td>' + p.familia + '</td><td class="datos">' + p.w.toFixed(3) + '</td><td class="datos">' + p.z.toFixed(2) + '</td><td class="datos">' + p.ciclos + '</td><td class="datos">' + (p.j0 * 100).toFixed(1) + ' %</td><td class="datos">' + (p.encogimiento * 100).toFixed(1) + ' %</td>';
      tablaP.appendChild(tr);
    }
  });

  /* ---------- Movimiento ---------- */
  var DURS = [['pincelada', 120], ['trazo', 240], ['firma', 480], ['secado', 900], ['obra', 1600]];
  var dursEl = $('[data-duraciones]');
  var ondas = [];
  if (dursEl) DURS.forEach(function (d) {
    var fila = document.createElement('div'); fila.className = 'duracion';
    var dpath = 'M2 14';
    for (var x = 0; x < 30; x++) dpath += ' q 8 ' + (x % 2 ? 12 : -12) + ' 16 0';
    fila.innerHTML = '<code class="datos">--dur-' + d[0] + '</code><span class="datos">' + d[1] + ' ms</span><svg viewBox="0 0 484 28" preserveAspectRatio="none" aria-hidden="true"><path d="' + dpath + '"/></svg>';
    dursEl.appendChild(fila);
    ondas.push([fila.querySelector('path'), d[1]]);
  });
  function reproducir() {
    ondas.forEach(function (o) {
      var p = o[0], len = p.getTotalLength();
      p.style.strokeDasharray = len;
      if (Trazo.reducido() || !p.animate) { p.style.strokeDashoffset = 0; return; }
      p.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], { duration: o[1], easing: Trazo.EASE.tinta, fill: 'both' });
    });
  }
  var bRep = $('[data-reproducir-dur]'); if (bRep) bRep.addEventListener('click', reproducir);

  var curvas = $('[data-curvas]');
  var EAS = [['tinta', [0.2, 0.7, 0.2, 1], 'Apariciones y dibujo'], ['pluma', [0.65, 0, 0.35, 1], 'Vuelo FLIP, cambios de lugar'], ['arrastre', [0.5, 0, 0.75, 0], 'Salidas'], ['remate', [0.16, 1, 0.3, 1], 'Rellenos y finales']];
  if (curvas) EAS.forEach(function (e) {
    var b = e[1], f = function (v) { return (100 - v * 100).toFixed(1); };
    var fig = document.createElement('figure'); fig.className = 'lamina'; fig.style.margin = '0';
    fig.innerHTML = '<svg viewBox="-6 -6 112 112" aria-hidden="true"><path class="eje-c" d="M0 0V100H100"/><path class="ctrl" d="M0 100L' + b[0] * 100 + ' ' + f(b[1]) + 'M100 0L' + b[2] * 100 + ' ' + f(b[3]) + '"/><path class="curva" d="M0 100C' + b[0] * 100 + ' ' + f(b[1]) + ' ' + b[2] * 100 + ' ' + f(b[3]) + ' 100 0"/></svg>' +
      '<figcaption style="display:grid;gap:2px;margin-top:8px"><code class="datos">--ease-' + e[0] + '</code><span class="pie">cubic-bezier(' + b.join(', ') + ')</span><span style="font-size:var(--tipo-pie)">' + e[2] + '</span></figcaption>';
    curvas.appendChild(fig);
  });

  $$('[data-cinta]').forEach(function (c) { Trazo.cinta(c, { hebras: 4, paso: 90, ancho: 4.5, colores: ['#F9F0E7', '#DFBA87', '#D2BCAB', '#F9F0E7'] }); });
  $$('[data-costura]').forEach(function (c) { Trazo.costura(c, { paso: 56, ancho: 4 }); });

  /* ---------- Componentes ---------- */
  var sel = $('[data-selector-demo]');
  if (sel) Trazo.PATRONES.forEach(function (p, i) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'selector__opcion'; b.setAttribute('role', 'tab');
    b.setAttribute('aria-selected', String(i === 4));
    b.innerHTML = p.code + '<small>' + p.familia + '</small>';
    b.addEventListener('click', function () { $$('.selector__opcion', sel).forEach(function (o) { o.setAttribute('aria-selected', String(o === b)); }); });
    sel.appendChild(b);
  });

  var esp2 = $('[data-espacios]');
  if (esp2) ['punto', 'trazo', 'letra', 'palabra', 'renglon', 'interlinea', 'parrafo', 'margen', 'pliego', 'folio'].forEach(function (n) {
    var v = css.getPropertyValue('--espacio-' + n).trim();
    var d = document.createElement('div');
    d.innerHTML = '<code>--espacio-' + n + '</code><span class="datos">' + (parseFloat(v) * 16) + ' px</span><i style="width:' + v + '"></i>';
    esp2.appendChild(d);
  });

  /* ---------- Instagram ---------- */
  $$('[data-ig-muestra]').forEach(function (c) {
    Trazo.muestra(c, c.getAttribute('data-ig-muestra'), { color: '#3B2A1D', ancho: 7, margen: 6 });
  });
  function pintarMelenas() {
    $$('[data-ig-melena]').forEach(function (c) { Trazo.melena(c, { estado: c.getAttribute('data-ig-melena'), patron: '3B', semilla: 11 }); });
  }
  pintarMelenas();
  if ('ResizeObserver' in window) { var ab = $('.ig-ab'); if (ab) new ResizeObserver(pintarMelenas).observe(ab); }
  $$('[data-ig-cinta]').forEach(function (c) { Trazo.cinta(c, { hebras: 4, paso: 70, ancho: 4, colores: ['#F9F0E7', '#DFBA87', '#D2BCAB', '#F9F0E7'] }); });
  function pintarFamilias() {
    $$('[data-ig-familia]').forEach(function (c) {
      var fam = c.getAttribute('data-ig-familia');
      var lista = Trazo.PATRONES.filter(function (p) { return p.code.charAt(0) === fam; });
      var cx = Trazo.preparar(c), ctx = cx.ctx;
      ctx.clearRect(0, 0, cx.w, cx.h);
      lista.forEach(function (p, i) {
        var pts = Trazo.curva(p, { ciclos: p.ciclos * 0.8 });
        var b = Trazo.limites(pts);
        var esc = (cx.h - 8) / (b.x1 - b.x0);
        var anchoC = (b.y1 - b.y0) * esc, hueco = cx.w / 3 - 8;
        if (anchoC > hueco) esc *= hueco / anchoC;
        var x = cx.w * (i + 0.5) / 3 + (b.y0 + b.y1) / 2 * esc;
        Trazo.pluma(ctx, Trazo.colocar(pts, { rot: Math.PI / 2, escala: esc, x: x, y: 4 - b.x0 * esc }), { ancho: 5.5, color: '#3B2A1D' });
      });
    });
  }
  pintarFamilias();
  if ('ResizeObserver' in window) $$('[data-ig-familia]').forEach(function (c) { new ResizeObserver(pintarFamilias).observe(c); });

  /* ---------- Tokens ---------- */
  var hojas = [];
  Array.prototype.forEach.call(document.styleSheets, function (s) {
    var reglas; try { reglas = s.cssRules; } catch (e) { return; }
    var texto = Array.prototype.map.call(reglas, function (r) { return r.cssText; }).join('\n');
    if (texto.indexOf('--pigmento-sepia') > -1 || texto.indexOf('--dur-pincelada') > -1) hojas.push({ s: s, reglas: reglas, texto: texto });
  });
  var tokens = [];
  hojas.forEach(function (h) {
    Array.prototype.forEach.call(h.reglas, function (r) {
      if (r.selectorText !== ':root' || !r.style) return;
      for (var i = 0; i < r.style.length; i++) {
        var n = r.style[i];
        if (n.indexOf('--') === 0) tokens.push([n, r.style.getPropertyValue(n).trim()]);
      }
    });
  });
  var tbody = $('[data-tokens] tbody');
  function pintarTokens(filtro) {
    if (!tbody) return;
    tbody.innerHTML = '';
    tokens.forEach(function (t) {
      if (filtro && (t[0] + ' ' + t[1]).toLowerCase().indexOf(filtro) === -1) return;
      var tr = document.createElement('tr');
      var esColor = /^#|^rgb|^var\(--(pigmento|sepia|siena|ocre|almagre)/.test(t[1]);
      var resuelto = esColor ? getComputedStyle(root).getPropertyValue(t[0]).trim() : '';
      tr.innerHTML = '<td><code>' + t[0] + '</code></td><td><code>' + (esColor ? '<span class="punto-color" style="background:' + resuelto + '"></span>' : '') + t[1].replace(/</g, '&lt;') + '</code></td><td></td>';
      var b = document.createElement('button'); b.type = 'button'; b.className = 'copiar'; b.textContent = 'Copiar';
      b.setAttribute('aria-label', 'Copiar ' + t[0]);
      b.addEventListener('click', function () { copiar(t[0] + ': ' + t[1] + ';', b); });
      tr.lastChild.appendChild(b);
      tbody.appendChild(tr);
    });
  }
  pintarTokens('');
  var filtro = $('[data-filtro-tokens]');
  if (filtro) filtro.addEventListener('input', function () { pintarTokens(filtro.value.trim().toLowerCase()); });
  var todo = $('[data-copiar-todo]');
  if (todo) todo.addEventListener('click', function () { copiar(hojas.map(function (h) { return h.texto; }).join('\n\n'), todo); });

  /* ---------- Índice activo ---------- */
  var enlaces = $$('.guia-indice a');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        enlaces.forEach(function (a) { a.setAttribute('aria-current', String(a.getAttribute('href') === '#' + e.target.id)); });
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    $$('.seccion').forEach(function (s) { io.observe(s); });
  }
})();
