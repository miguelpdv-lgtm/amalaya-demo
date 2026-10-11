/* EncrespArte · web */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var root = document.documentElement;
  var WA = '573108981207';
  var LIENZO = '#F9F0E7', OCRE3 = '#DFBA87';
  var navSvg = $('.nav__logo svg');
  var reducido = Trazo.reducido();
  var VB = { completo: '50 362 970 322', palabra: '50 362 970 262' };

  /* ---------- Clones del logo ---------- */
  function clonLogo(vb, sinLema) {
    var s = navSvg.cloneNode(true);
    s.setAttribute('viewBox', vb);
    s.removeAttribute('role'); s.removeAttribute('aria-label');
    s.setAttribute('aria-hidden', 'true');
    if (sinLema) { var l = $('.logo-lema', s); if (l) l.remove(); }
    return s;
  }
  var pie = $('[data-logo-pie]');
  if (pie && navSvg) pie.appendChild(clonLogo(VB.completo));
  var firma = $('[data-hero-firma]');
  if (firma && navSvg) firma.appendChild($('.logo-e', navSvg).cloneNode(true));

  /* ---------- Navbar: sólida al salir del hero (Maison y Firma) ---------- */
  var nav = $('[data-nav]'), hero = $('.hero');
  function navSolida() {
    var limite = hero ? hero.offsetHeight - nav.offsetHeight - 10 : 0;
    nav.classList.toggle('nav--solida', window.scrollY > limite);
  }
  window.addEventListener('scroll', navSolida, { passive: true });
  navSolida();

  /* ---------- Menú móvil ---------- */
  var botonMenu = $('[data-menu]'), menu = $('#nav-menu');
  if (botonMenu && menu) {
    var cerrar = function () { botonMenu.setAttribute('aria-expanded', 'false'); menu.classList.remove('abierto'); $('.visualmente-oculto', botonMenu).textContent = 'Abrir menú'; };
    botonMenu.addEventListener('click', function () {
      var abierto = botonMenu.getAttribute('aria-expanded') === 'true';
      if (abierto) { cerrar(); return; }
      botonMenu.setAttribute('aria-expanded', 'true'); menu.classList.add('abierto'); nav.classList.add('nav--solida');
      $('.visualmente-oculto', botonMenu).textContent = 'Cerrar menú';
    });
    $$('a', menu).forEach(function (a) { a.addEventListener('click', cerrar); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('abierto')) { cerrar(); botonMenu.focus(); } });
  }

  /* ---------- Entradas ---------- */
  function tramo(t, a, b) { return Math.max(0, Math.min(1, (t - a) / (b - a))); }
  var ENTRADAS = {
    // Telón: costura que se cose por el centro y dos hojas que se abren
    telon: function (capa, fin) {
      var izq = document.createElement('div'), der = document.createElement('div');
      izq.className = 'entrada__hoja entrada__hoja--izq'; der.className = 'entrada__hoja entrada__hoja--der';
      var cos = document.createElement('canvas'); cos.className = 'entrada__costura';
      der.appendChild(cos);
      var logo = clonLogo(VB.palabra, true); logo.setAttribute('class', 'entrada__logo');
      capa.appendChild(izq); capa.appendChild(der); capa.appendChild(logo);
      var anims = [], t0 = performance.now(), raf = 0;
      (function coser(now) {
        var k = tramo((now - t0) / 1000, 0.05, 0.85);
        var c = Trazo.preparar(cos), ctx = c.ctx; ctx.clearRect(0, 0, c.w, c.h);
        var p = { w: 1.05, z: 0 }, paso = 64, pts = Trazo.curva(p, { ciclos: Trazo.ciclosPara(p, c.h / paso + 1), fase: 0.25, resolucion: 60 });
        var b = Trazo.limites(pts), esc = paso, a = (b.y1 - b.y0) * esc; if (a > 18) esc *= 18 / a;
        Trazo.pluma(ctx, Trazo.colocar(pts, { rot: Math.PI / 2, escala: esc, x: c.w / 2 + (b.y0 + b.y1) / 2 * esc, y: 0 }), { ancho: 3.5, color: OCRE3, hasta: 1 - Math.pow(1 - k, 3) });
        if (k < 1) raf = requestAnimationFrame(coser);
      })(t0);
      anims.push(logo.animate([{ opacity: 0 }, { opacity: 1, offset: 0.35 }, { opacity: 1, offset: 0.75 }, { opacity: 0 }], { duration: 1000, delay: 120, fill: 'both' }));
      var abrir = { duration: 850, delay: 900, easing: Trazo.EASE.pluma, fill: 'both' };
      anims.push(izq.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-101%)' }], abrir));
      anims.push(der.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(101%)' }], abrir));
      return { anims: anims, revelar: 900, parar: function () { cancelAnimationFrame(raf); } };
    },
    // Tracking: las letras se cierran hasta su sitio y el telón sube
    tracking: function (capa) {
      var telon = document.createElement('div'); telon.className = 'entrada__telon';
      var logo = clonLogo(VB.palabra, true); logo.setAttribute('class', 'entrada__logo');
      telon.appendChild(logo); capa.appendChild(telon);
      var anims = [];
      var piezas = [$('.logo-e', logo)].concat($$('.logo-letras path', logo));
      piezas.forEach(function (p) {
        var bb = p.getBBox(), cx = bb.x + bb.width / 2, dx = (cx - 535) * 1.6;
        p.style.transformBox = 'fill-box';
        anims.push(p.animate([{ transform: 'translateX(' + dx + 'px)', opacity: 0 }, { opacity: 1, offset: 0.3 }, { transform: 'translateX(0)', opacity: 1 }], { duration: 900, easing: Trazo.EASE.remate, fill: 'both' }));
      });
      anims.push(telon.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-101%)' }], { duration: 850, delay: 1000, easing: Trazo.EASE.pluma, fill: 'both' }));
      anims.push(logo.animate([{ transform: 'translate(-50%, -50%)' }, { transform: 'translate(-50%, 120%)' }], { duration: 850, delay: 1000, easing: Trazo.EASE.pluma, fill: 'both' }));
      return { anims: anims, revelar: 1000 };
    },
    // Persianas: la E y lamas que se pliegan de arriba abajo
    persianas: function (capa) {
      var n = 8, anims = [];
      for (var i = 0; i < n; i++) {
        var l = document.createElement('div'); l.className = 'entrada__lama';
        l.style.top = (i * 100 / n) + '%'; l.style.height = (100 / n + 0.3) + '%';
        capa.appendChild(l);
        anims.push(l.animate([{ transform: 'scaleY(1)' }, { transform: 'scaleY(0)' }], { duration: 500, delay: 620 + i * 70, easing: Trazo.EASE.pluma, fill: 'both' }));
      }
      var s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      s.setAttribute('viewBox', '52 364 226 256'); s.setAttribute('class', 'entrada__marca'); s.setAttribute('aria-hidden', 'true');
      s.appendChild($('.logo-e', navSvg).cloneNode(true));
      capa.appendChild(s);
      anims.push(s.animate([{ opacity: 0, transform: 'translate(-50%, -50%) scale(0.96)' }, { opacity: 1, transform: 'translate(-50%, -50%) scale(1)', offset: 0.45 }, { opacity: 1, offset: 0.7 }, { opacity: 0, transform: 'translate(-50%, -50%) scale(1)' }], { duration: 760, delay: 40, fill: 'both' }));
      return { anims: anims, revelar: 650 };
    },
    // Enfoque: la foto llega desenfocada, una rúbrica cruza y el salón se enfoca
    enfoque: function (capa) {
      capa.style.cursor = 'pointer';
      var oscuro = document.createElement('div'); oscuro.className = 'entrada__oscuro';
      var c = document.createElement('canvas'); c.className = 'entrada__rubrica';
      capa.appendChild(oscuro); capa.appendChild(c);
      var img = $('.hero__foto img'), cont = $('.hero__contenido'), anims = [];
      anims.push(img.animate([{ filter: 'blur(18px) brightness(0.45)', transform: 'scale(1.1)' }, { filter: 'blur(18px) brightness(0.45)', transform: 'scale(1.1)', offset: 0.45 }, { filter: 'blur(0) brightness(1)', transform: 'scale(1)' }], { duration: 1900, easing: Trazo.EASE.pluma }));
      anims.push(oscuro.animate([{ opacity: 1 }, { opacity: 1, offset: 0.45 }, { opacity: 0 }], { duration: 1900, fill: 'both' }));
      anims.push(cont.animate([{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 0, offset: 0.6 }, { opacity: 1, transform: 'none' }], { duration: 2000, easing: Trazo.EASE.tinta }));
      var t0 = performance.now(), raf = 0;
      (function rubrica(now) {
        var t = (now - t0) / 1000;
        var x = Trazo.preparar(c), ctx = x.ctx; ctx.clearRect(0, 0, x.w, x.h);
        var p = { w: 0.95, z: 0.1 }, paso = Math.max(80, x.w / 9);
        var pts = Trazo.curva(p, { ciclos: Trazo.ciclosPara(p, x.w / paso + 1), fase: 0.1, resolucion: 70 });
        ctx.globalAlpha = 1 - tramo(t, 1.3, 1.9);
        var k = tramo(t, 0.05, 0.95);
        Trazo.pluma(ctx, Trazo.colocar(pts, { escala: paso, x: -paso * 0.5, y: x.h * 0.5 }), { ancho: 5, color: LIENZO, hasta: 1 - Math.pow(1 - k, 3) });
        if (t < 1.95) raf = requestAnimationFrame(rubrica);
      })(t0);
      return { anims: anims, revelar: 900, parar: function () { cancelAnimationFrame(raf); } };
    }
  };

  var finEntrada;
  var entradaLista = new Promise(function (r) { finEntrada = r; });
  function entrada() {
    if (!root.classList.contains('entrada-pendiente')) { finEntrada(); return; }
    try { sessionStorage.setItem('encresparte-entrada', '1'); } catch (e) {}
    var tipo = root.getAttribute('data-entrada') || 'telon';
    if (!navSvg || !Element.prototype.animate || performance.now() > 2900 || !ENTRADAS[tipo]) {
      root.classList.remove('entrada-pendiente'); finEntrada(); return;
    }
    var capa = document.createElement('div');
    capa.className = 'entrada entrada--' + tipo;
    capa.setAttribute('aria-hidden', 'true');
    document.body.appendChild(capa);
    var aviso = document.createElement('span'); aviso.className = 'entrada__aviso'; aviso.textContent = 'Toca o pulsa una tecla para saltar';
    root.classList.add('entrada-activa');
    var r = ENTRADAS[tipo](capa);
    if (tipo !== 'enfoque') capa.appendChild(aviso);
    root.classList.remove('entrada-pendiente');
    // La foto se asienta cuando se descubre
    var img = $('.hero__foto img');
    if (tipo !== 'enfoque' && img) r.anims.push(img.animate([{ transform: 'scale(1.06)' }, { transform: 'scale(1)' }], { duration: 1300, delay: r.revelar, easing: Trazo.EASE.tinta, fill: 'backwards' }));
    aviso.animate && aviso.animate([{ opacity: 0 }, { opacity: 1, offset: 0.3 }, { opacity: 1, offset: 0.8 }, { opacity: 0 }], { duration: 1500, fill: 'both' });
    var hecho = false;
    function terminar() {
      if (hecho) return; hecho = true;
      if (r.parar) r.parar();
      root.classList.remove('entrada-activa');
      capa.remove(); quitar(); finEntrada();
    }
    function saltar() {
      if (hecho) return;
      r.anims.forEach(function (a) { try { a.finish(); } catch (e) {} });
      terminar();
    }
    var principales = r.anims.filter(function (a) { return a.effect && a.effect.target !== img; });
    Promise.all(principales.map(function (a) { return a.finished.catch(function () {}); })).then(terminar);
    var eventos = ['click', 'keydown', 'wheel', 'touchstart'];
    function quitar() { eventos.forEach(function (e) { window.removeEventListener(e, saltar, true); }); }
    eventos.forEach(function (e) { window.addEventListener(e, saltar, { capture: true, passive: true }); });
    setTimeout(terminar, 3200);   // red de seguridad
  }
  entrada();

  /* ---------- Atlas de texturas ---------- */
  var APUNTES = {
    '2A': ['Onda suave', 'Una S que apenas se dibuja y cae casi recta desde la raíz.'],
    '2B': ['Onda marcada', 'La S aparece a media melena y gana forma hacia las puntas.'],
    '2C': ['Onda honda', 'Ondas profundas que nacen cerca de la raíz.'],
    '3A': ['Bucle amplio', 'Bucles grandes y brillantes, con mucho movimiento.'],
    '3B': ['Espiral firme', 'Espirales de buen cuerpo que se agrupan en mechones.'],
    '3C': ['Espiral estrecha', 'Espirales pequeñas y densas, con mucho volumen.'],
    '4A': ['Muelle definido', 'Muelles pequeños que conservan la forma de espiral.'],
    '4B': ['Zigzag', 'Ángulos marcados en lugar de espirales.'],
    '4C': ['Zigzag compacto', 'El patrón más cerrado y el que más se recoge al secar.']
  };
  function montarAtlas() {
    var pista = $('[data-atlas-pista]');
    if (!pista) return;
    Trazo.PATRONES.forEach(function (p) {
      var a = APUNTES[p.code];
      var art = document.createElement('article');
      art.className = 'lamina-atlas';
      art.innerHTML = '<div class="lamina-atlas__cabeza"><span>Lámina ' + p.code + '</span><span>' + p.familia + '</span></div>' +
        '<canvas role="img" aria-label="Hebra de patrón ' + p.code + '"></canvas>' +
        '<h3>' + a[0] + '</h3><p>' + a[1] + '</p>' +
        '<span class="lamina-atlas__dato">Encogimiento ilustrativo ≈ ' + Math.round(p.encogimiento * 100) + ' %</span>';
      pista.appendChild(art);
      var c = $('canvas', art);
      var pintar = function (k) {
        var x = Trazo.preparar(c), ctx = x.ctx; ctx.clearRect(0, 0, x.w, x.h);
        var pts = Trazo.curva(p, { resolucion: 110 }), b = Trazo.limites(pts);
        var esc = (x.h - 12) / p.ciclos;
        var anchoC = (b.y1 - b.y0) * esc; if (anchoC > x.w - 24) esc *= (x.w - 24) / anchoC;
        Trazo.pluma(ctx, Trazo.colocar(pts, { rot: Math.PI / 2, escala: esc, x: x.w / 2 + (b.y0 + b.y1) / 2 * esc, y: 6 }),
          { ancho: Math.max(5, Math.min(9, x.w / 26)), color: Trazo.token('--color-trazo'), hasta: k });
      };
      if ('ResizeObserver' in window) new ResizeObserver(function () { pintar(1); }).observe(c); else pintar(1);
      art.addEventListener('mouseenter', function () {
        if (reducido) return;
        var t0 = performance.now();
        (function f(now) { var k = Math.min(1, (now - t0) / 700); pintar(1 - Math.pow(1 - k, 3)); if (k < 1) requestAnimationFrame(f); })(t0);
      });
      repintar.push(function () { pintar(1); });
    });
    $$('[data-atlas]').forEach(function (b) {
      b.addEventListener('click', function () {
        var l = $('.lamina-atlas', pista); var paso = l ? l.getBoundingClientRect().width + 16 : 300;
        pista.scrollBy({ left: paso * +b.getAttribute('data-atlas') * 2, behavior: reducido ? 'auto' : 'smooth' });
      });
    });
  }
  var repintar = [];

  /* ---------- Cita privada ---------- */
  function montarCita() {
    var form = $('[data-cita]'); if (!form) return;
    var vista = $('[data-cita-mensaje]'), enviar = $('[data-cita-enviar]');
    function valor(n) { var el = form.querySelector('input[name="' + n + '"]:checked'); return el ? el.value : ''; }
    function componer() {
      var nombre = $('#c-nombre').value.trim();
      var partes = ['Hola EncrespArte' + (nombre ? ', soy ' + nombre : '') + '.'];
      partes.push('Me gustaría pedir cita para ' + (valor('servicio') === 'terapia capilar' ? 'terapia capilar' : (valor('servicio') === 'balayage' ? 'un balayage' : 'un ' + valor('servicio'))) + '.');
      var tex = valor('textura');
      partes.push(tex ? 'Mi pelo es ' + tex + '.' : 'No sé bien cuál es mi patrón.');
      var dia = valor('dia');
      if (dia) partes.push('Si es posible, el ' + dia + '.');
      partes.push('¿Qué disponibilidad tienen?');
      var msg = partes.join(' ');
      vista.textContent = msg;
      enviar.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(msg);
    }
    form.addEventListener('input', componer);
    form.addEventListener('change', componer);
    form.addEventListener('submit', function (e) { e.preventDefault(); });
    componer();
  }
  montarCita();

  entradaLista.then(function () { setTimeout(montarAtlas, 120); });

  if (window.matchMedia) {
    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    if (mq.addEventListener) mq.addEventListener('change', function () { repintar.forEach(function (f) { f(); }); });
  }
})();
