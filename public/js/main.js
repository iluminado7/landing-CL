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

  /* ── Íconos que se dibujan ──────────────────────────────────
     Mide cada trazo del SVG y guarda el largo en --largo; el CSS
     usa ese valor para el efecto de "dibujado" con
     stroke-dasharray. Si algo falla, el ícono queda normal.     */
  function prepararTrazos() {
    var svgs = document.querySelectorAll(
      '.confianza__icono svg, .tarjeta__icono svg, .sector__icono svg, .vista-previa__icono svg'
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

  /* ── URL de la vista previa que se tipea ─────────────────── */
  function escribirUrl(contenedor) {
    var url = contenedor.querySelector('.vista-previa__url');
    if (!url || url.dataset.escrita) return;
    url.dataset.escrita = '1';

    var texto = url.textContent;
    var i = 0;
    url.textContent = '';
    url.classList.add('vista-previa__url--escribiendo');

    function siguienteLetra() {
      i++;
      url.textContent = texto.slice(0, i);
      if (i < texto.length) {
        setTimeout(siguienteLetra, 32);
      } else {
        setTimeout(function () {
          url.classList.remove('vista-previa__url--escribiendo');
        }, 1400);
      }
    }

    setTimeout(siguienteLetra, 450);
  }

  /* ── Revelar al hacer scroll ────────────────────────────── */
  var revelables = document.querySelectorAll('.revelar');

  function mostrar(el) {
    el.classList.add('visible');
    if (!reducirMovimiento && el.classList.contains('vista-previa')) escribirUrl(el);
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

  /* ── Recorrido del proceso ──────────────────────────────────
     Cuando los pasos ya se ven, la barra dorada pasa por 01 → 04
     una sola vez. Espera a que terminen de aparecer.            */
  var pasos = document.querySelector('.pasos');

  if (pasos && !reducirMovimiento && hayObserver) {
    var observadorPasos = new IntersectionObserver(function (entradas) {
      if (!entradas[0].isIntersecting) return;
      observadorPasos.disconnect();
      setTimeout(function () { pasos.classList.add('pasos--recorrido'); }, 700);
    }, { threshold: 0.35 });

    observadorPasos.observe(pasos);
  }

  /* ── Lector facial (tarjeta de Sistemas biométricos) ────────
     Ciclo de 5,2 s, siempre desde cero cuando se abre la tarjeta:
       0,2–1,6 s  se dibuja la silueta (cabeza y hombros)
       1,1–1,7 s  aparecen los rasgos y la malla facial
       1,7–2,9 s  el haz dorado barre la cara de arriba abajo
       2,95 s     acceso concedido: todo pasa a verde y salta el tilde
       4,5–4,9 s  la cara se desvanece y vuelve a empezar
     Con mouse se reproduce mientras el cursor (o el foco) está en
     la tarjeta. En táctil, mientras el demo se ve en pantalla.
     Igual que el lector del hero, se mueve con rAF y no con
     animaciones CSS dentro del SVG.                             */
  function iniciarFacial(demo) {
    var CICLO_FACIAL = 5200;
    var tarjeta = demo.closest('.tarjeta');
    var trazos = demo.querySelectorAll('.facial__trazo');
    var rasgos = demo.querySelectorAll('.facial__rasgo');
    var oks = demo.querySelectorAll('.facial__ok');
    var scan = demo.querySelector('.facial__scan');
    var check = demo.querySelector('.facial__check');
    var cara = demo.querySelector('.facial__cara');
    var texto = demo.querySelector('.facial__estado-texto');
    var barra = demo.querySelector('.facial__progreso-barra');

    var largos = [];
    var activo = false;
    var inicio = 0;
    var cuadroId = null;
    var resetId = null;
    var estadoActual = '';

    function rampa(t, desde, hasta) {
      return Math.min(Math.max((t - desde) / (hasta - desde), 0), 1);
    }

    function suave(x) {
      return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    }

    function salida(x) {
      return 1 - Math.pow(1 - x, 3);
    }

    // Prepara los trazos para el efecto de dibujado
    try {
      trazos.forEach(function (tr, i) {
        largos[i] = Math.ceil(tr.getTotalLength()) + 1;
        tr.style.strokeDasharray = largos[i];
      });
    } catch (err) {
      largos = [];
    }

    function ponerEstado(nuevo, ok) {
      if (nuevo === estadoActual) return;
      estadoActual = nuevo;
      texto.textContent = nuevo;
      demo.classList.toggle('facial--ok', ok);
    }

    function render(t) {
      // 1. Silueta: la cabeza primero, los hombros un poco después
      trazos.forEach(function (tr, i) {
        if (!largos[i]) return;
        var d = suave(rampa(t, 200 + i * 300, 1300 + i * 300));
        tr.style.strokeDashoffset = largos[i] * (1 - d);
      });

      // 2. Rasgos y malla, escalonados
      rasgos.forEach(function (r, i) {
        r.style.opacity = rampa(t, 1100 + i * 45, 1300 + i * 45);
      });

      // 3. Haz de escaneo de y=38 a y=112
      var barrido = suave(rampa(t, 1700, 2800));
      scan.setAttribute('transform', 'translate(0 ' + (38 + barrido * 74).toFixed(2) + ')');
      scan.style.opacity = rampa(t, 1650, 1750) * (1 - rampa(t, 2800, 2950));

      // 4. Acceso concedido
      var ok = rampa(t, 2950, 3150) * (1 - rampa(t, 4500, 4800));
      oks.forEach(function (el) { el.style.opacity = ok; });

      var s = salida(rampa(t, 3000, 3250));
      check.style.opacity = ok;
      check.setAttribute('transform', 'translate(78 76) scale(' + s.toFixed(3) + ') translate(-78 -76)');

      // 5. Fundido de salida
      cara.style.opacity = 1 - rampa(t, 4500, 4900);

      // Barra de progreso: avanza con el haz y queda llena en verde
      var progreso = t < 4500 ? barrido : 1 - rampa(t, 4500, 4900);
      barra.style.transform = 'scaleX(' + progreso.toFixed(3) + ')';

      // Texto de estado
      if (t < 1700) ponerEstado('Detectando rostro…', false);
      else if (t < 2950) ponerEstado('Escaneando…', false);
      else if (t < 4500) ponerEstado('Acceso concedido', true);
      else ponerEstado('Listo para el siguiente', false);
    }

    function cuadro(ahora) {
      if (!activo) return;
      render((ahora - inicio) % CICLO_FACIAL);
      cuadroId = requestAnimationFrame(cuadro);
    }

    function reproducir() {
      clearTimeout(resetId);
      if (activo) return;
      activo = true;
      inicio = performance.now();
      cuadroId = requestAnimationFrame(cuadro);
    }

    function detener() {
      if (!activo) return;
      activo = false;
      cancelAnimationFrame(cuadroId);
      // Se vuelve al estado inicial cuando el panel ya terminó de cerrarse
      resetId = setTimeout(function () { render(0); }, 420);
    }

    // Movimiento reducido: se muestra el resultado final, quieto
    if (reducirMovimiento) {
      render(3600);
      return;
    }

    render(0);

    if (window.matchMedia('(hover: hover)').matches) {
      tarjeta.addEventListener('mouseenter', reproducir);
      tarjeta.addEventListener('mouseleave', function () {
        if (!tarjeta.contains(document.activeElement)) detener();
      });
      tarjeta.addEventListener('focusin', reproducir);
      tarjeta.addEventListener('focusout', function () {
        if (!tarjeta.matches(':hover')) detener();
      });
    } else if (hayObserver) {
      new IntersectionObserver(function (entradas) {
        if (entradas[0].isIntersecting) reproducir();
        else detener();
      }, { threshold: 0.4 }).observe(demo);
    } else {
      render(3600);
    }
  }

  document.querySelectorAll('.facial').forEach(iniciarFacial);

  /* ── Brillo que sigue al mouse ──────────────────────────────
     Solo con mouse (en táctil no hay hover). Actualiza la
     posición del degradé dorado de la tarjeta bajo el cursor.   */
  if (punteroFino) {
    document.addEventListener('pointermove', function (e) {
      var el = e.target.closest && e.target.closest('.tarjeta, .sector, .vista-previa');
      if (!el) return;
      var caja = el.getBoundingClientRect();
      el.style.setProperty('--mx', (e.clientX - caja.left) + 'px');
      el.style.setProperty('--my', (e.clientY - caja.top) + 'px');
    }, { passive: true });
  }
})();