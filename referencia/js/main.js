/* ══════════════════════════════════════════════════════════════
   Landing — Cerrajería Leonardo
   Menú móvil, header al hacer scroll (con barra de progreso),
   animaciones de entrada, íconos que se dibujan, recorrido del
   proceso, URL que se tipea, brillo que sigue al mouse y
   medición de clics.
   ══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  window.landingLista = true;

  var reducirMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var punteroFino = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var hayObserver = 'IntersectionObserver' in window;

  /* ── Medición ───────────────────────────────────────────────
     Empuja eventos a dataLayer (Google Tag Manager / GA4) si está
     instalado. Sin analítica configurada no hace nada.          */
  function medir(evento, datos) {
    if (!Array.isArray(window.dataLayer)) return;
    var payload = { event: evento };
    for (var clave in datos) payload[clave] = datos[clave];
    window.dataLayer.push(payload);
  }

  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-track]');
    if (!el) return;
    var datos = { ubicacion: el.dataset.ubicacion || '' };
    if (el.dataset.servicio) datos.servicio = el.dataset.servicio;
    medir(el.dataset.track, datos);
  });

  /* ── Año del copyright ──────────────────────────────────── */
  var anio = document.getElementById('anio');
  if (anio) anio.textContent = new Date().getFullYear();

  /* ── Header al hacer scroll + barra de progreso ─────────────
     Un solo manejador, limitado a un cálculo por cuadro.       */
  var header = document.getElementById('header');
  var raiz = document.documentElement;
  var scrollPendiente = false;

  function actualizarScroll() {
    scrollPendiente = false;
    var y = window.scrollY;
    header.classList.toggle('header--scroll', y > 24);

    var recorrible = raiz.scrollHeight - window.innerHeight;
    var progreso = recorrible > 0 ? Math.min(y / recorrible, 1) : 0;
    header.style.setProperty('--progreso', progreso.toFixed(4));
  }

  function pedirScroll() {
    if (scrollPendiente) return;
    scrollPendiente = true;
    requestAnimationFrame(actualizarScroll);
  }

  actualizarScroll();
  window.addEventListener('scroll', pedirScroll, { passive: true });
  window.addEventListener('resize', pedirScroll);

  /* ── Menú móvil ─────────────────────────────────────────── */
  var menuBtn = document.getElementById('menu-btn');
  var nav = document.getElementById('nav');
  var escritorio = window.matchMedia('(min-width: 1024px)');

  function abrirMenu() {
    nav.classList.add('nav--abierto');
    menuBtn.setAttribute('aria-expanded', 'true');
    menuBtn.setAttribute('aria-label', 'Cerrar menú');
    var primerLink = nav.querySelector('a');
    if (primerLink) primerLink.focus();
  }

  function cerrarMenu(devolverFoco) {
    nav.classList.remove('nav--abierto');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-label', 'Abrir menú');
    if (devolverFoco) menuBtn.focus();
  }

  menuBtn.addEventListener('click', function () {
    if (nav.classList.contains('nav--abierto')) cerrarMenu(false);
    else abrirMenu();
  });

  nav.addEventListener('click', function (e) {
    if (e.target.closest('a') && !escritorio.matches) cerrarMenu(false);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('nav--abierto')) cerrarMenu(true);
  });

  document.addEventListener('click', function (e) {
    if (!nav.classList.contains('nav--abierto')) return;
    if (!nav.contains(e.target) && !menuBtn.contains(e.target)) cerrarMenu(false);
  });

  escritorio.addEventListener('change', function (e) {
    if (e.matches) cerrarMenu(false);
  });

  /* ── Animación del lector ───────────────────────────────────
     Ciclo de 6 s: el llavero se apoya, el lector se pone en verde
     y el llavero vuelve. Se mueve con requestAnimationFrame
     cambiando atributos del SVG, así el navegador repinta siempre
     (con animaciones CSS dentro del SVG, Chrome a veces no
     redibuja hasta que se mueve el mouse).                      */
  var llavero = document.querySelector('.llavero');

  if (llavero && !reducirMovimiento) {
    var CICLO = 6000;
    var INICIO = 1200;
    var lectorOk = document.querySelectorAll('.lector__ok');
    var lectorEspera = document.querySelector('.lector__espera');
    var pulso = document.querySelector('.lector__pulso');
    var lectorVisible = true;

    // Posiciones del llavero: [porcentaje del ciclo, x, y, rotación, escala]
    var tramosLlavero = [
      [0, 296, 300, -12, 1],
      [10, 296, 300, -12, 1],
      [28, 160, 324, 0, 1],
      [32, 160, 330, 0, 0.96],
      [56, 160, 330, 0, 0.96],
      [60, 160, 324, 0, 1],
      [80, 296, 300, -12, 1],
      [100, 296, 300, -12, 1]
    ];

    function suavizar(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function rampa(p, desde, hasta) {
      return Math.min(Math.max((p - desde) / (hasta - desde), 0), 1);
    }

    function posicionLlavero(p) {
      for (var i = 1; i < tramosLlavero.length; i++) {
        var b = tramosLlavero[i];
        if (p <= b[0]) {
          var a = tramosLlavero[i - 1];
          var t = suavizar(rampa(p, a[0], b[0]));
          return [1, 2, 3, 4].map(function (k) { return a[k] + (b[k] - a[k]) * t; });
        }
      }
      return tramosLlavero[0].slice(1);
    }

    function dibujarLector(ahora) {
      if (lectorVisible) {
        var p = (Math.max(ahora - INICIO, 0) % CICLO) / CICLO * 100;

        var pos = posicionLlavero(p);
        llavero.setAttribute('transform',
          'translate(' + pos[0] + ' ' + pos[1] + ') rotate(' + pos[2] + ') scale(' + pos[3] + ')');

        // Verde de 35 % a 62 %, con fundidos cortos de entrada y salida
        var ok = rampa(p, 32, 35) * (1 - rampa(p, 62, 68));
        lectorOk.forEach(function (el) { el.style.opacity = ok; });
        lectorEspera.style.opacity = 1 - ok;

        // Pulso: aparece al apoyar y se expande desvaneciéndose
        var crece = rampa(p, 34, 52);
        var escala = 1 + 0.9 * (1 - Math.pow(1 - crece, 2));
        pulso.style.opacity = p < 32 ? 0 : p < 34 ? 0.9 * rampa(p, 32, 34) : 0.9 * (1 - crece);
        pulso.setAttribute('transform',
          'translate(160 330) scale(' + escala + ') translate(-160 -330)');
      }
      requestAnimationFrame(dibujarLector);
    }

    // Si el hero no se ve, no se calcula nada
    if (hayObserver) {
      new IntersectionObserver(function (entradas) {
        lectorVisible = entradas[0].isIntersecting;
      }).observe(llavero.ownerSVGElement);
    }

    requestAnimationFrame(dibujarLector);
  }

  /* ── Cifras del hero ────────────────────────────────────────
     El HTML ya trae el número final (si no hay JS se ve igual).
     Acá se anima de 0 al valor en 1,6 s, una sola vez.          */
  var cifras = document.querySelectorAll('[data-contar]');

  function contar(el) {
    var final = parseInt(el.dataset.contar, 10);
    var prefijo = el.dataset.prefijo || '';
    var sufijo = el.dataset.sufijo || '';
    var DURACION = 1600;
    var inicio = null;

    function paso(ahora) {
      if (inicio === null) inicio = ahora;
      var t = Math.min((ahora - inicio) / DURACION, 1);
      var valor = Math.round(final * (1 - Math.pow(1 - t, 3)));
      el.textContent = prefijo + valor + sufijo;
      if (t < 1) requestAnimationFrame(paso);
    }

    requestAnimationFrame(paso);
  }

  if (!reducirMovimiento) {
    cifras.forEach(function (el) {
      el.textContent = (el.dataset.prefijo || '') + '0' + (el.dataset.sufijo || '');
    });
    // Arranca cuando termina la entrada del hero
    setTimeout(function () { cifras.forEach(contar); }, 500);
  }

  /* ── Íconos que se dibujan ──────────────────────────────────
     Mide cada trazo del SVG y guarda el largo en --largo; el CSS
     usa ese valor para el efecto de "dibujado" con
     stroke-dasharray. Si algo falla, el ícono queda normal.     */
  function prepararTrazos() {
    var svgs = document.querySelectorAll(
      '.sector__icono svg, .etapa__icono svg'
    );

    svgs.forEach(function (svg) {
      var partes = svg.querySelectorAll('path, rect, circle, line, polyline, polygon');
      try {
        partes.forEach(function (parte, i) {
          var largo = Math.ceil(parte.getTotalLength()) + 1;
          parte.style.setProperty('--largo', largo);
          parte.style.setProperty('--trazo-i', i);
        });
        svg.classList.add('trazo');
      } catch (err) {
        /* Navegador sin getTotalLength en formas básicas: sin efecto */
      }
    });
  }

  if (!reducirMovimiento && hayObserver) prepararTrazos();

  /* ── Revelar al hacer scroll ────────────────────────────── */
  var revelables = document.querySelectorAll('.revelar');

  function mostrar(el) {
    el.classList.add('visible');
    // Una vez visible se quita el retraso para que el hover responda al instante
    setTimeout(function () { el.style.removeProperty('--retraso'); }, 700);
  }

  if (reducirMovimiento || !hayObserver) {
    revelables.forEach(mostrar);
  } else {
    // Escalonado leve dentro de cada grupo de hermanos
    revelables.forEach(function (el) {
      var hermanos = Array.prototype.filter.call(el.parentElement.children, function (h) {
        return h.classList.contains('revelar');
      });
      var indice = hermanos.indexOf(el);
      if (indice > 0) el.style.setProperty('--retraso', Math.min(indice, 5) * 70 + 'ms');
    });

    var observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (!entrada.isIntersecting) return;
        mostrar(entrada.target);
        observador.unobserve(entrada.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });

    revelables.forEach(function (el) { observador.observe(el); });
  }

  /* ── Brillo que sigue al mouse ──────────────────────────────
     Solo con mouse (en táctil no hay hover). Actualiza la
     posición del degradé dorado de la tarjeta bajo el cursor.   */
  if (punteroFino) {
    document.addEventListener('pointermove', function (e) {
      var el = e.target.closest && e.target.closest('.sector, .etapa');
      if (!el) return;
      var caja = el.getBoundingClientRect();
      el.style.setProperty('--mx', (e.clientX - caja.left) + 'px');
      el.style.setProperty('--my', (e.clientY - caja.top) + 'px');
    }, { passive: true });
  }
})();