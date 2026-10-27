# Landing Cerrajería Leonardo — Plan de desarrollo v2

Rediseño completo de la landing: **nuevo contenido** (sectores, expansión,
reconocimiento) y **nueva animación** de scroll tipo película, al estilo de la
página de GTA VI, con imágenes y videos generados con IA en Flow.

Este archivo es la hoja de ruta para trabajar en el editor: stack, estructura,
qué se toca de la página actual, cómo se arma cada escena, cómo se procesan los
assets y cómo se publica.

> La guía visual (colores, tipografía, componentes) sigue siendo la del
> `README.md` del proyecto de diseño. Acá no se cambia la identidad, se cambia
> la estructura y el movimiento.

---

## Índice

1. [Stack](#1-stack)
2. [Qué se toca de la página actual](#2-qué-se-toca-de-la-página-actual)
3. [Estructura del proyecto](#3-estructura-del-proyecto)
4. [Guion de scroll (escenas)](#4-guion-de-scroll-escenas)
5. [Fase 1 — Crear el proyecto](#5-fase-1--crear-el-proyecto)
6. [Fase 2 — Migrar estilos y componentes base](#6-fase-2--migrar-estilos-y-componentes-base)
7. [Fase 3 — Contenido como datos](#7-fase-3--contenido-como-datos)
8. [Fase 4 — Motor de animación (GSAP + Lenis)](#8-fase-4--motor-de-animación-gsap--lenis)
9. [Fase 5 — Escenas, una por una](#9-fase-5--escenas-una-por-una)
10. [Fase 6 — Assets: inventario y procesamiento](#10-fase-6--assets-inventario-y-procesamiento)
11. [Fase 7 — Mobile, movimiento reducido y accesibilidad](#11-fase-7--mobile-movimiento-reducido-y-accesibilidad)
12. [Fase 8 — Medición, SEO y rendimiento](#12-fase-8--medición-seo-y-rendimiento)
13. [Fase 9 — Deploy en el hosting de WordPress](#13-fase-9--deploy-en-el-hosting-de-wordpress-subcarpeta)
14. [Checklist final](#14-checklist-final)
15. [Pendientes y decisiones abiertas](#15-pendientes-y-decisiones-abiertas)

---

## 1. Stack

| Capa | Herramienta | Por qué |
|---|---|---|
| Estructura | **Astro** (última estable) | Una escena = un componente. Genera HTML estático, no manda JS que no pidamos. Optimiza imágenes con `astro:assets`. |
| Lenguajes | **HTML + CSS + JavaScript** (sin TypeScript obligatorio) | Mismo lenguaje que la landing actual, la migración es directa. |
| Estilos | **CSS propio** con los tokens actuales | La guía ya está en variables. Sin Tailwind. |
| Animación | **GSAP 3** + **ScrollTrigger** + **SplitText** | Pin, scrub, timelines, `matchMedia`. Todo gratis, incluso para uso comercial. |
| Scroll suave | **Lenis** | Sin esto el scrub con rueda de mouse va a saltos. |
| Video / imagen | **ffmpeg** + **cwebp** (o `astro:assets`) | Loops sin costura, videos para scrub, WebP/AVIF. |
| Runtime | **Node 22 LTS** | Requisito de Astro. |
| Hosting | **Hosting actual de WordPress**, en una subcarpeta | El build de Astro es estático: se sube `dist/` a una carpeta dentro de la instalación de WordPress y convive con el sitio. |

**Decisiones tomadas**

- **No hay framework de backup.** El plan B es por capas, sobre la misma
  librería (ver [Fase 7](#11-fase-7--mobile-movimiento-reducido-y-accesibilidad)).
- **No React / Vue.** GSAP funciona con JS vanilla dentro de Astro.
- **Las meta descriptions no se cambian:** apuntan a propósito a búsquedas de
  llaveros HID y control de acceso.
- **La landing no reemplaza la home.** Se publica en una **subcarpeta** del
  WordPress (ej. `cerrajerialeonardo.com.ar/landing/`). El nombre final de la
  carpeta se define en un solo lugar: `base` en `astro.config.mjs`.
- **El canonical apunta a la URL de la landing**, no a la home (si apuntara a
  la home, Google no la indexaría).
- **El material visual es generado con IA en Flow**, salvo las fotos del premio,
  que son reales y no se tocan con IA.

---

## 2. Qué se toca de la página actual

La fuente de contenido es el **HTML nuevo** (sectores, expansión,
reconocimiento, cierre). La fuente de estilo es el `styles.css` actual. El
`main.js` actual se desarma: algunas partes se portan, otras se descartan.

### 2.1 Secciones

| Sección actual | Qué pasa | Detalle |
|---|---|---|
| `<head>` (metas, OG, favicon) | **Se mantiene, con un cambio** | Se pasa a `Base.astro`. Title y descriptions tal cual. **El canonical deja de apuntar a la home** y pasa a la URL de la subcarpeta; `og:image` e íconos pasan a rutas con la subcarpeta. |
| Script inline `.js` + `landingLista` | **Se mantiene** | Va con `is:inline` en el `<head>`. |
| Header | **Se modifica** | CTA "Solicitar servicio" → `#wpforms-1588`. Se agrega el link **Soluciones** al menú (ver pendientes). |
| Hero | **Se rehace** | Sale el **SVG del lector con llavero**. Entra el **video loop de la puerta** de fondo con degradé. Se mantienen badge, título, bajada y contadores. El CTA secundario pasa a **"Ver servicios →"** con destino `#soluciones`. |
| Contadores (`data-contar`) | **Se mantiene el HTML**, se reescribe la animación | El número final queda en el HTML (SEO / sin JS); GSAP lo anima desde 0. |
| Franja de confianza | **Sale** | No está en el contenido nuevo. |
| Soluciones (6 tarjetas) | **Vuelve como escena nueva** | Contenido de la landing anterior. Escena pineada, una solución por vez. |
| Demo lector facial (tarjeta biométricos) | **Se porta** | El SVG `.facial` y la función `iniciarFacial()` pasan a la solución "Sistemas biométricos". |
| Sectores (7) | **Se rehace** | Scroll horizontal pineado. Consorcios primero y destacada. |
| Proceso (4 pasos) | **Sale** | No está en el contenido nuevo. |
| Presupuesto online + vista previa | **Sale** | El destino queda en el CTA del hero y el botón principal. |
| FAQ | **Sale** | Ver pendientes (suma para SEO). |
| Expansión (3 etapas) | **Nueva** | Escena estrella: zoom out CABA → Argentina → globo. |
| Reconocimiento | **Nueva y separada** | Hoy está metida dentro de `#expansion`. Pasa a su propia sección y componente. |
| Cierre (CTA final) | **Nueva** | Puerta: lector rojo → verde → se abre → destello → CTA. |
| Footer | **Se mantiene** | Sucursales como bloque-link a `/sucursales/`. |
| WhatsApp flotante | **Se mantiene** | Con su entrada y pulso actuales. |

### 2.2 CSS (`styles.css`)

| Bloque | Qué pasa |
|---|---|
| `:root` (tokens) | **Se mantiene igual** → `src/styles/tokens.css` |
| Base, `.contenedor`, `.sr-only`, `.skip-link` | **Se mantiene** → `base.css` |
| `.badge`, `.btn*`, `.seccion__cabecera`, `.seccion__titulo .oro` | **Se mantiene** → `componentes.css` |
| Header, nav, menú mobile | **Se mantiene** → dentro de `Header.astro` |
| `.hero*` | **Se reescribe** (fondo de video, degradé, stats) |
| `.lector*`, `.llavero` | **Sale** |
| `.confianza*`, `.paso*`, `.pasos*`, `.vista-previa*`, `.canal*`, `.faq*` | **Sale** |
| `.tarjeta*` | **Se adapta** a la escena Soluciones |
| `.sector*` | **Se adapta** al carrusel horizontal |
| `.facial*` | **Se porta** a la solución Biométricos |
| Footer, `.redes`, `.whatsapp-flotante` | **Se mantiene** |
| Bloque "Animaciones" (`.revelar`, `.entrada`, `.trazo`, `.pasos--recorrido`…) | **Sale**. Lo reemplaza GSAP. |
| `@media (prefers-reduced-motion)` | **Se mantiene la idea**, se reescribe para GSAP |

### 2.3 JavaScript (`main.js`)

| Función actual | Qué pasa | Destino |
|---|---|---|
| `medir()` + listener `[data-track]` | **Se porta tal cual** | `scripts/medicion.js` |
| Año del copyright | **Se porta** | Se resuelve en build (`new Date().getFullYear()` en Astro) |
| Header al scroll + barra de progreso | **Se porta**, adaptado a Lenis | `scripts/header.js` |
| Menú mobile | **Se porta tal cual** | `scripts/menu.js` |
| Animación del lector (rAF) | **Sale** | — |
| `prepararTrazos()` (íconos que se dibujan) | **Opcional** | `scripts/trazos.js` si se usa en Sectores |
| `escribirUrl()` (URL tipeada) | **Sale** | — |
| Revelar con IntersectionObserver | **Sale** | Lo reemplaza ScrollTrigger |
| Recorrido del proceso | **Sale** | — |
| `iniciarFacial()` | **Se porta** | `scripts/escenas/facial.js` |
| Brillo que sigue al mouse | **Opcional** | En tarjetas de Sectores |

### 2.4 Eventos de medición (`data-track`)

Se mantienen los nombres para no romper GA4:

| Evento | Dónde |
|---|---|
| `clic_solicitar_servicio` | Header, menú, cierre |
| `clic_presupuesto_online` | Hero (botón principal) |
| `clic_ver_servicios` | **Nuevo** — hero, botón "Ver servicios" |
| `clic_solucion` | Cada solución (con `data-servicio`) |
| `clic_sector` | Cada sector |
| `clic_whatsapp` | Flotante, cierre |
| `clic_telefono` | Cierre, footer |
| `clic_email` | Footer |
| `clic_sucursales` | Footer |

---

## 3. Estructura del proyecto

```
landing-leonardo/
├─ astro.config.mjs
├─ package.json
├─ public/
│  ├─ favicon.png
│  ├─ img/                      ← logos (no se procesan)
│  │  ├─ Logo-cerrajeria-2048x363.png
│  │  ├─ Isotipo-CerrajeriaLeonardo.png
│  │  └─ isotipo-mascara.svg    ← para la intro
│  └─ video/
│     ├─ hero-loop.mp4          ← escritorio 16:9
│     ├─ hero-loop.webm
│     ├─ hero-loop-mobile.mp4   ← 9:16
│     ├─ cierre-puerta.mp4      ← para scrub (todo intra)
│     ├─ soluciones/*.mp4       ← 6 clips
│     └─ expansion-zoom.mp4     ← para scrub (opcional)
├─ src/
│  ├─ assets/img/               ← imágenes que optimiza Astro
│  │  ├─ hero-base-rojo.webp
│  │  ├─ hero-base-verde.webp
│  │  ├─ cierre-final.webp
│  │  ├─ premio-best-ceo-trofeo.webp
│  │  └─ premio-best-ceo-certificado.webp
│  ├─ data/
│  │  ├─ soluciones.js
│  │  ├─ sectores.js
│  │  ├─ etapas.js
│  │  ├─ sucursales.js
│  │  └─ contacto.js
│  ├─ layouts/
│  │  └─ Base.astro
│  ├─ components/
│  │  ├─ Header.astro
│  │  ├─ Footer.astro
│  │  ├─ WhatsappFlotante.astro
│  │  └─ ui/
│  │     ├─ Badge.astro
│  │     ├─ Boton.astro
│  │     ├─ CabeceraSeccion.astro
│  │     └─ LectorFacial.astro
│  ├─ escenas/
│  │  ├─ Intro.astro            ← opcional
│  │  ├─ Hero.astro
│  │  ├─ Soluciones.astro
│  │  ├─ Sectores.astro
│  │  ├─ Expansion.astro
│  │  ├─ Reconocimiento.astro
│  │  └─ Cierre.astro
│  ├─ scripts/
│  │  ├─ animaciones.js         ← arranca Lenis + GSAP y llama a cada escena EN ORDEN
│  │  ├─ medicion.js
│  │  ├─ menu.js
│  │  ├─ header.js
│  │  ├─ contadores.js
│  │  ├─ ruta.js                ← antepone la subcarpeta a las rutas de public/
│  │  └─ escenas/
│  │     ├─ intro.js
│  │     ├─ hero.js
│  │     ├─ soluciones.js
│  │     ├─ facial.js
│  │     ├─ sectores.js
│  │     ├─ expansion.js
│  │     ├─ reconocimiento.js
│  │     └─ cierre.js
│  ├─ styles/
│  │  ├─ tokens.css
│  │  ├─ base.css
│  │  └─ componentes.css
│  └─ pages/
│     └─ index.astro
└─ herramientas/
   └─ videos.sh                 ← comandos de ffmpeg (sección 10)
```

**Regla:** cada escena tiene su `.astro` (marcado + estilos) y su `.js`
(animación). Las animaciones **no** se inicializan cada una por su cuenta: las
llama `animaciones.js` en el orden de la página, porque ScrollTrigger calcula
los pines de arriba hacia abajo.

---

## 4. Guion de scroll (escenas)

| # | Escena | Qué pasa al scrollear | Asset | Mobile |
|---|---|---|---|---|
| 0 | **Intro** *(opcional)* | Isotipo como máscara que se agranda y revela el hero | `isotipo-mascara.svg` + hero | Fundido simple |
| 1 | **Hero** | Video loop de fondo. Texto, contadores, CTAs. Al salir, el texto sube con parallax y el fondo se oscurece | `hero-loop` + poster `hero-base-rojo` | Video 9:16 o solo poster |
| 2 | **Soluciones** | Pin. Las 6 soluciones se reemplazan una por una; a la derecha, el visual de cada una. Biométricos usa el lector facial animado | 6 clips + `LectorFacial` | Lista vertical, clips en loop al entrar |
| 3 | **Sectores** | Pin + scroll horizontal de las 7 tarjetas | Íconos SVG | Lista vertical o swipe |
| 4 | **Expansión** ⭐ | Pin ~3 pantallas: mapa CABA (7 sucursales) → Argentina (5 ciudades) → globo. El texto de cada etapa cambia con el avance | SVG de mapas (+ video de zoom opcional) | 3 mapas con fundido |
| 5 | **Reconocimiento** | Fondo negro, texto palabra por palabra con lo clave en dorado; fotos entran con `clip-path` | Fotos reales | Texto completo + fade |
| 6 | **Cierre** | Pin: lector rojo → verde → la puerta se abre (video con scrub) → destello cálido → CTA | `hero-base-rojo`, `hero-base-verde`, `cierre-puerta.mp4` | Fundido rojo→verde→abierta, sin scrub |
| — | **Footer** | Estático | — | — |

La landing arranca y termina en la misma puerta: cerrada con el lector en rojo
arriba, abierta con el lector en verde al final.

---

## 5. Fase 1 — Crear el proyecto

```bash
npm create astro@latest landing-leonardo -- --template minimal
cd landing-leonardo
npm install gsap lenis
npm run dev
```

`astro.config.mjs`:

```js
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://cerrajerialeonardo.com.ar',
  // Subcarpeta donde se publica dentro del WordPress.
  // Es el ÚNICO lugar donde se define el nombre: cambiarlo acá cambia todas las rutas.
  base: '/landing',
  trailingSlash: 'always',
  build: { inlineStylesheets: 'auto' },
});
```

Con `base`, todo lo que genera Astro (CSS, JS, imágenes de `astro:assets`)
ya sale con `/landing/` adelante. Lo que está en `public/` (videos, logos) y
se escribe a mano necesita el prefijo: para eso está este helper en
`src/scripts/ruta.js`:

```js
// ruta('/video/hero-loop.mp4') → '/landing/video/hero-loop.mp4'
export const ruta = (p) => import.meta.env.BASE_URL.replace(/\/$/, '') + p;
```

**Nunca** escribir rutas absolutas a mano (`/video/...`, `/img/...`) en el
marcado: siempre con `ruta()`.

Herramientas para assets (Windows):

```bash
winget install Gyan.FFmpeg
winget install Google.Libwebp   # cwebp (opcional, Astro también convierte)
```

Rama de trabajo por fase:

```bash
git init
git checkout -b fase-1-proyecto
```

---

## 6. Fase 2 — Migrar estilos y componentes base

1. Copiar el `:root` de `styles.css` a `src/styles/tokens.css` **sin cambios**.
2. Pasar base, botones, badge, cabecera de sección a `base.css` y
   `componentes.css` (ver tabla 2.2).
3. Crear `Base.astro`:

```astro
---
import '../styles/tokens.css';
import '../styles/base.css';
import '../styles/componentes.css';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import WhatsappFlotante from '../components/WhatsappFlotante.astro';
import { ruta } from '../scripts/ruta.js';

// URL propia de la landing (incluye la subcarpeta): https://cerrajerialeonardo.com.ar/landing/
const canonical = new URL(Astro.url.pathname, Astro.site).href;
const isotipo = new URL(ruta('/img/Isotipo-CerrajeriaLeonardo.png'), Astro.site).href;

const {
  titulo = 'Control de acceso para consorcios y empresas en CABA | Cerrajería Leonardo',
  descripcion = 'Control de acceso para consorcios, edificios y empresas en CABA. Mirá el presupuesto online con precios publicados: comodato o compra, llaveros y tarjetas HID.',
} = Astro.props;
---
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{titulo}</title>
  <meta name="description" content={descripcion}>
  <!-- Canonical a la landing, NO a la home: si apunta a la home, Google no la indexa -->
  <link rel="canonical" href={canonical}>
  <meta name="theme-color" content="#151413">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="es_AR">
  <meta property="og:url" content={canonical}>
  <meta property="og:title" content="Accesos inteligentes. Seguridad sin complicaciones. | Cerrajería Leonardo">
  <meta property="og:description" content="Control de acceso para consorcios, empresas y edificios en CABA. Tecnología, instalación profesional y soporte.">
  <meta property="og:image" content={isotipo}>
  <link rel="icon" type="image/png" href={ruta('/img/Isotipo-CerrajeriaLeonardo.png')}>

  <!-- Marca de JS antes de pintar; si las animaciones no arrancan en 3 s, todo queda visible -->
  <script is:inline>
    document.documentElement.classList.add('js');
    setTimeout(function () {
      if (!window.landingLista) document.documentElement.classList.remove('js');
    }, 3000);
  </script>
</head>
<body>
  <a class="skip-link" href="#contenido">Saltar al contenido</a>
  <Header />
  <main id="contenido"><slot /></main>
  <Footer />
  <WhatsappFlotante />

  <script>
    import { iniciar } from '../scripts/animaciones.js';
    iniciar();
  </script>
</body>
</html>
```

4. `src/pages/index.astro`:

```astro
---
import Base from '../layouts/Base.astro';
import Hero from '../escenas/Hero.astro';
import Soluciones from '../escenas/Soluciones.astro';
import Sectores from '../escenas/Sectores.astro';
import Expansion from '../escenas/Expansion.astro';
import Reconocimiento from '../escenas/Reconocimiento.astro';
import Cierre from '../escenas/Cierre.astro';
---
<Base>
  <Hero />
  <Soluciones />
  <Sectores />
  <Expansion />
  <Reconocimiento />
  <Cierre />
</Base>
```

5. Componentes UI reutilizables (`Badge`, `Boton`, `CabeceraSeccion`) con el
   mismo marcado que hoy (`.badge`, `.badge__dot`, `.btn--primario`…).

**Criterio de cierre de la fase:** la página se ve completa y bien **sin
ninguna animación**. Esa es la versión base que ve quien no tiene JS.

---

## 7. Fase 3 — Contenido como datos

El contenido repetido va en `src/data/` y los componentes lo recorren. Así un
cambio de texto no obliga a tocar marcado.

`src/data/soluciones.js` (de la landing anterior; los videos van con `ruta()`
por la subcarpeta):

```js
import { ruta } from '../scripts/ruta.js';

export const soluciones = [
  {
    id: 'control-acceso',
    titulo: 'Control de acceso',
    texto: 'Gestión de ingresos y egresos en tiempo real. Altas y bajas de usuarios sin cambiar cerraduras ni repartir llaves.',
    href: 'https://cerrajerialeonardo.com.ar/soluciones/control-acceso/',
    video: ruta('/video/soluciones/control-acceso.mp4'),
  },
  {
    id: 'biometricos',
    titulo: 'Sistemas biométricos',
    texto: 'Acceso mediante reconocimiento facial. La credencial es la persona: no se pierde, no se presta, no se copia.',
    href: 'https://cerrajerialeonardo.com.ar/soluciones/control-acceso-biometrico/',
    demo: 'facial', // usa <LectorFacial /> en lugar de video
  },
  {
    id: 'cerraduras',
    titulo: 'Cerraduras electrónicas',
    texto: 'Más seguridad para cada puerta con tecnología moderna y confiable, en edificios, oficinas y viviendas.',
    href: 'https://cerrajerialeonardo.com.ar/soluciones/cerradura-electronica/',
    video: ruta('/video/soluciones/cerraduras.mp4'),
  },
  {
    id: 'camaras',
    titulo: 'Cámaras de seguridad',
    texto: 'Vigilancia en alta resolución para monitorear los accesos y espacios comunes de tu edificio.',
    href: 'https://cerrajerialeonardo.com.ar/soluciones/instalacion-camaras-seguridad/',
    video: ruta('/video/soluciones/camaras.mp4'),
  },
  {
    id: 'integracion',
    titulo: 'Integración con sistemas existentes',
    texto: 'Adaptamos software y hardware a la infraestructura que ya tenés, para no empezar de cero.',
    href: 'https://cerrajerialeonardo.com.ar/soluciones/integracion-sistemas-existentes/',
    video: ruta('/video/soluciones/integracion.mp4'),
  },
  {
    id: 'llaveros',
    titulo: 'Llaveros y tarjetas de proximidad',
    texto: 'Duplicación rápida y segura de credenciales RFID y tags de acceso.',
    href: 'https://cerrajerialeonardo.com.ar/soluciones/copia-llavero-tarjetas/',
    video: ruta('/video/soluciones/llaveros.mp4'),
  },
];
```

`src/data/sectores.js` (del HTML nuevo; los íconos SVG van como string o
componente):

```js
export const sectores = [
  { id: 'consorcios', titulo: 'Consorcios y edificios', principal: true,
    texto: 'Para administradores que necesitan modernizar o mantener los accesos de sus edificios. Más de 1.300 consorcios ya trabajan con nosotros.',
    href: 'https://cerrajerialeonardo.com.ar/sectores/consorcios-edificios/' },
  { id: 'empresas', titulo: 'Empresas',
    texto: 'Control de ingreso de personal y visitantes.',
    href: 'https://cerrajerialeonardo.com.ar/sectores/empresas/' },
  { id: 'comercios', titulo: 'Comercios',
    texto: 'Accesos seguros para locales, depósitos y áreas restringidas.',
    href: 'https://cerrajerialeonardo.com.ar/sectores/comercios/' },
  { id: 'alquiler-temporario', titulo: 'Alquiler temporario',
    texto: 'Altas y bajas de huéspedes sin entregar ni recuperar llaves.',
    href: 'https://cerrajerialeonardo.com.ar/sectores/alquiler-temporario/' },
  { id: 'barrio-privado', titulo: 'Barrio privado',
    texto: 'Control de ingresos de residentes, visitas y proveedores.',
    href: 'https://cerrajerialeonardo.com.ar/sectores/barrio-privado/' },
  { id: 'desarrollos', titulo: 'Desarrollos inmobiliarios',
    texto: 'Soluciones integradas desde la etapa de proyecto.',
    href: 'https://cerrajerialeonardo.com.ar/sectores/desarrollos-inmobiliarios/' },
  { id: 'casas', titulo: 'Casas particulares',
    texto: 'Cerraduras electrónicas y acceso desde el celular para tu hogar.',
    href: 'https://cerrajerialeonardo.com.ar/sectores/casas-particulares/' },
];
```

`src/data/etapas.js`:

```js
export const etapas = [
  { id: 'caba', titulo: '2026 — Consolidación CABA',
    texto: '7 sucursales activas y nuevas aperturas en barrios estratégicos de la ciudad.' },
  { id: 'nacional', titulo: '2030 — Expansión nacional',
    texto: 'Llegada a las principales ciudades de Argentina: Córdoba, Mendoza, Santa Fe, Mar del Plata y Bariloche.' },
  { id: 'global', titulo: 'Global — Expansión internacional',
    texto: 'Internacionalización del modelo de negocio y del ecosistema tecnológico ACCESO 1®.' },
];
```

`sucursales.js` y `contacto.js`: las 7 sucursales y los 4 contactos del footer
actual, tal cual.

---

## 8. Fase 4 — Motor de animación (GSAP + Lenis)

`src/scripts/animaciones.js` — único punto de arranque:

```js
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

import { iniciarMedicion } from './medicion.js';
import { iniciarMenu } from './menu.js';
import { iniciarHeader } from './header.js';
import { iniciarContadores } from './contadores.js';
import { escenaHero } from './escenas/hero.js';
import { escenaSoluciones } from './escenas/soluciones.js';
import { escenaSectores } from './escenas/sectores.js';
import { escenaExpansion } from './escenas/expansion.js';
import { escenaReconocimiento } from './escenas/reconocimiento.js';
import { escenaCierre } from './escenas/cierre.js';

gsap.registerPlugin(ScrollTrigger, SplitText);

export function iniciar() {
  window.landingLista = true;

  iniciarMedicion();
  iniciarMenu();

  const reducir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Scroll suave solo si el usuario no pidió movimiento reducido
  let lenis = null;
  if (!reducir) {
    lenis = new Lenis({ lerp: 0.1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  iniciarHeader(lenis);
  iniciarContadores(reducir);

  // Versiones por dispositivo. Cada escena recibe las condiciones y arma
  // la versión que corresponde. GSAP revierte todo solo al cambiar de corte.
  const mm = gsap.matchMedia();
  mm.add(
    {
      escritorio: '(min-width: 1024px) and (prefers-reduced-motion: no-preference)',
      mobile: '(max-width: 1023px) and (prefers-reduced-motion: no-preference)',
      reducido: '(prefers-reduced-motion: reduce)',
    },
    (ctx) => {
      const c = ctx.conditions;
      // EL ORDEN IMPORTA: igual que en la página
      escenaHero(c);
      escenaSoluciones(c);
      escenaSectores(c);
      escenaExpansion(c);
      escenaReconocimiento(c);
      escenaCierre(c);
    }
  );

  // Recalcular cuando cargan imágenes y fuentes (cambian alturas)
  window.addEventListener('load', () => ScrollTrigger.refresh());

  // Los anclas del menú usan Lenis para no pelear con el scroll suave
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const destino = document.querySelector(a.getAttribute('href'));
      if (!destino || !lenis) return;
      e.preventDefault();
      lenis.scrollTo(destino, { offset: -80 });
    });
  });
}
```

`src/scripts/contadores.js`:

```js
import { gsap } from 'gsap';

export function iniciarContadores(reducir) {
  if (reducir) return; // queda el número final del HTML
  document.querySelectorAll('[data-contar]').forEach((el) => {
    const fin = Number(el.dataset.contar);
    const pre = el.dataset.prefijo || '';
    const suf = el.dataset.sufijo || '';
    const obj = { v: 0 };
    gsap.to(obj, {
      v: fin,
      duration: 1.6,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      onUpdate: () => (el.textContent = pre + Math.round(obj.v).toLocaleString('es-AR') + suf),
    });
  });
}
```

`medicion.js` y `menu.js`: copiar las funciones del `main.js` actual
(sección "Medición" y "Menú móvil") y exportarlas.

**Reglas de animación (de la guía de diseño, adaptadas):**

- Animar solo `transform`, `opacity`, `clip-path` y `currentTime` de video.
  Nada de `width`, `top`, `filter: blur()` ni `box-shadow` en scrub.
- Nada de rebotes (`elastic`, `bounce`). Easings: `power2`, `power3`, `none` en scrub.
- El dorado sigue siendo el único acento; el verde aparece solo en "acceso concedido".

---

## 9. Fase 5 — Escenas, una por una

Se hace **una escena, se mide, recién después la siguiente**. Cada escena
empieza con marcado y estilos estáticos, después se le suma la animación.

### 9.0 Intro (opcional)

- Capa fija negra sobre el hero, con el isotipo como `mask-image`.
- Scrub corto (`end: '+=600'`): `mask-size` de `20%` a `2500%`, después
  `autoAlpha: 0` de la capa.
- Botón "Saltar intro" accesible.
- En mobile y movimiento reducido: no se muestra.

### 9.1 Hero

Marcado base:

```astro
---
import { Image } from 'astro:assets';
import base from '../assets/img/hero-base-rojo.webp';
import { ruta } from '../scripts/ruta.js';
---
<section class="hero" id="inicio" aria-labelledby="hero-titulo">
  <div class="hero__fondo" aria-hidden="true">
    <Image src={base} alt="" class="hero__poster" widths={[768, 1280, 1920, 2576]}
           sizes="100vw" loading="eager" fetchpriority="high" />
    <video class="hero__video" autoplay muted loop playsinline preload="metadata"
           poster={base.src}>
      <source src={ruta("/video/hero-loop-mobile.mp4")} type="video/mp4" media="(max-width: 767px)">
      <source src={ruta("/video/hero-loop.webm")} type="video/webm">
      <source src={ruta("/video/hero-loop.mp4")} type="video/mp4">
    </video>
    <div class="hero__degrade"></div>
  </div>
  <!-- badge, h1, bajada, botones, <dl class="hero__stats"> del HTML nuevo -->
</section>
```

- `.hero__degrade`: el degradé de la guía (izquierda negra → derecha
  transparente) + un leve filtro de color para bajar el amarillo del lobby.
- Botones: primario "Ver presupuesto online" (`clic_presupuesto_online`),
  secundario **"Ver servicios →"** a `#soluciones` (`clic_ver_servicios`).
- Animación de entrada: timeline de 1 s (badge → título → bajada → botones →
  stats), igual a la actual pero con GSAP.
- Al salir (scrub): el texto sube `yPercent: -20` y se desvanece; el fondo
  se oscurece.
- **Opcional:** transición "entrar al edificio" con el primer video de Flow
  (tramo 0–4 s, cámara avanzando) en scrub entre Hero y Soluciones.

### 9.2 Soluciones

- Layout escritorio: columna izquierda con la lista de las 6 (título +
  texto + "Ver solución"), columna derecha con el visual activo.
- Pin con `end: '+=' + (6 * 70) + '%'`. El progreso decide cuál está activa:

```js
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { iniciarFacial } from './facial.js';

export function escenaSoluciones({ escritorio }) {
  const seccion = document.querySelector('.soluciones');
  if (!seccion) return;
  const items = [...seccion.querySelectorAll('.solucion')];
  const visuales = [...seccion.querySelectorAll('.solucion__visual')];
  const facial = iniciarFacial(seccion.querySelector('.facial'));

  if (!escritorio) return; // mobile: lista normal, cada video se reproduce al entrar

  let actual = -1;
  function activar(i) {
    if (i === actual) return;
    actual = i;
    items.forEach((el, n) => el.classList.toggle('es-activa', n === i));
    visuales.forEach((v, n) => {
      gsap.to(v, { autoAlpha: n === i ? 1 : 0, duration: 0.4 });
      const video = v.querySelector('video');
      if (video) n === i ? video.play() : video.pause();
    });
    items[i].dataset.id === 'biometricos' ? facial.reproducir() : facial.detener();
  }

  ScrollTrigger.create({
    trigger: seccion,
    start: 'top top',
    end: () => '+=' + window.innerHeight * items.length * 0.7,
    pin: true,
    onUpdate: (st) => activar(Math.min(items.length - 1, Math.floor(st.progress * items.length))),
  });
  activar(0);
}
```

- `facial.js`: portar `iniciarFacial()` del `main.js` actual y que devuelva
  `{ reproducir, detener }` en lugar de escuchar mouseenter/mouseleave.
- Los videos de cada solución: `muted loop playsinline preload="none"`; se
  cargan cuando la sección se acerca (`ScrollTrigger` con `onEnter`).

### 9.3 Sectores

- Pista horizontal con las 7 tarjetas; Consorcios más ancha (`.sector--principal`).

```js
export function escenaSectores({ escritorio }) {
  const pista = document.querySelector('.sectores__pista');
  if (!pista || !escritorio) return;
  const distancia = () => pista.scrollWidth - window.innerWidth + 96;

  gsap.to(pista, {
    x: () => -distancia(),
    ease: 'none',
    scrollTrigger: {
      trigger: '.sectores',
      start: 'top top',
      end: () => '+=' + distancia(),
      pin: true,
      scrub: 1,
      invalidateOnRefresh: true,
    },
  });
}
```

- **Accesibilidad:** si una tarjeta recibe foco con Tab estando fuera de
  pantalla, hacer scroll hasta su posición (`focusin` → calcular el progreso
  equivalente y `lenis.scrollTo`).
- Mobile: lista vertical (o carrusel con `scroll-snap`), sin pin.

### 9.4 Expansión ⭐

- Tres capas SVG apiladas dentro de un escenario de `100vh`:
  1. **Mapa de CABA** con los 7 puntos de sucursales.
  2. **Mapa de Argentina** con CABA + Córdoba, Mendoza, Santa Fe,
     Mar del Plata, Bariloche.
  3. **Globo de puntos** con arcos dorados que salen de Argentina.
- Fuentes de mapas: límites de barrios de CABA en BA Data
  (data.buenosaires.gob.ar) y países de Natural Earth (dominio público).
  Verificar licencia antes de publicar. Simplificar con mapshaper.org y
  exportar a SVG.
- A la izquierda, el texto de las 3 etapas (de `etapas.js`); cambia según el
  tramo.

```js
export function escenaExpansion({ escritorio, mobile }) {
  if (mobile) return expansionMobile(); // 3 mapas con fundido al entrar cada etapa
  if (!escritorio) return;              // movimiento reducido: queda estático
  const tl = gsap.timeline({
    scrollTrigger: { trigger: '.expansion', start: 'top top', end: '+=300%', pin: true, scrub: 1 },
  });

  tl.from('.mapa-caba', { scale: 1.15, autoAlpha: 0, duration: 0.6 })
    .from('.mapa-caba .punto', { scale: 0, transformOrigin: 'center', stagger: 0.08 }, '<0.2')
    .to('.etapa[data-id="caba"]', { autoAlpha: 0 }, '+=0.6')
    .to('.mapa-caba', { scale: 0.15, autoAlpha: 0, duration: 0.8 }, '<')
    .from('.mapa-arg', { scale: 3, autoAlpha: 0, duration: 0.8 }, '<')
    .from('.etapa[data-id="nacional"]', { autoAlpha: 0, y: 30 }, '<0.4')
    .from('.mapa-arg .ciudad', { scale: 0, stagger: 0.1 })
    .to('.etapa[data-id="nacional"]', { autoAlpha: 0 }, '+=0.6')
    .to('.mapa-arg', { scale: 0.2, autoAlpha: 0, duration: 0.8 }, '<')
    .from('.globo', { scale: 3, autoAlpha: 0, duration: 0.8 }, '<')
    .from('.etapa[data-id="global"]', { autoAlpha: 0, y: 30 }, '<0.4')
    .from('.globo .arco', {
      strokeDashoffset: (i, el) => el.getTotalLength(), // se dibujan de punta a punta
      stagger: 0.1,
    });
}
```

  (Los arcos necesitan `stroke-dasharray` igual a su largo; se setea al
  iniciar, con el mismo truco de `prepararTrazos()` del `main.js` actual.
  También sirve el plugin DrawSVG de GSAP, registrándolo.)
- Si sale bien el **video de zoom out** de Flow, va de fondo con scrub y los
  SVG quedan encima como capa de puntos.

### 9.5 Reconocimiento

- Sección propia (`id="reconocimiento"`), fondo `--negro-profundo`.
- Párrafo del premio con `SplitText` por palabras; scrub de opacidad
  `0.15 → 1` palabra por palabra. Las palabras dentro de `.oro` (ganador,
  Best CEO Awards, primera cerrajería de Argentina) se encienden en dorado.
- Fotos: `clip-path: inset(100% 0 0 0)` → `inset(0)` al entrar, más un
  parallax leve (`yPercent: -8`).
- **Solo fotos reales.** Nada de IA en esta sección.

### 9.6 Cierre

Capas, de abajo hacia arriba:

1. `hero-base-rojo.webp` (puerta cerrada, lector rojo)
2. `hero-base-verde.webp` (misma imagen, solo cambia el lector) — empieza en `opacity: 0`
3. `<video class="cierre__video" muted playsinline preload="auto">` con
   `cierre-puerta.mp4` (2,5 s, apertura) — empieza en `opacity: 0`
4. `.cierre__destello`: degradé radial cálido, `opacity: 0`
5. Contenido: título "¿Qué más estás esperando…", texto, botón, alternativas

```js
export function escenaCierre({ escritorio, mobile }) {
  const video = document.querySelector('.cierre__video');
  if (!video) return;

  // iOS: hace falta "desbloquear" el video para poder moverlo con currentTime
  const desbloquear = () => video.play().then(() => video.pause()).catch(() => {});
  window.addEventListener('touchstart', desbloquear, { once: true });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '.cierre',
      start: 'top top',
      end: escritorio ? '+=250%' : '+=150%',
      pin: true,
      scrub: escritorio ? 0.5 : true,
    },
  });

  tl.to('.cierre__verde', { opacity: 1, duration: 0.15 })        // lector rojo → verde
    .set(video, { opacity: 1 })                                   // el video arranca en el mismo cuadro
    .to(video, { currentTime: 2.4, duration: 0.5, ease: 'none' }) // la puerta se abre
    .to('.cierre__destello', { opacity: 1, duration: 0.2 })       // luz cálida
    .from('.cierre__contenido > *', { autoAlpha: 0, y: 30, stagger: 0.05, duration: 0.2 });
}
```

- Si el scrub del video va a los tirones en algún equipo (especialmente iOS),
  pasar a **secuencia de imágenes en `<canvas>`** (ver 10.4). La timeline es la
  misma, solo cambia qué se dibuja.
- Movimiento reducido: se muestra directamente la imagen final con el CTA.

---

## 10. Fase 6 — Assets: inventario y procesamiento

### 10.1 Inventario

| Asset | Estado | Notas |
|---|---|---|
| `hero-base-rojo.webp` | ✅ | 2576 × 1438. Base de todo. |
| `hero-base-verde.webp` | ✅ | Alineada con la roja: solo cambia la zona del lector. |
| `cierre-final.webp` (puerta abierta, verde) | ✅ | 1376 × 768 (resolución menor). |
| `cierre-puerta.mp4` | ✅ | 0–2,5 s, sin audio, todo intra. 720p. Rehacer desde la base nueva si se puede. |
| `hero-loop.mp4` | 🟡 | Provisorio de 3,6 s (720p). Regenerar sin la palabra "tripod", en 1080p, desde la base nueva. |
| `hero-loop-mobile.mp4` (9:16) | ⬜ | Misma escena, puerta y lector al centro. |
| Video "entrar al edificio" | 🟡 opcional | Primer video de Flow, tramo 0–4 s. |
| 6 clips de Soluciones | ⬜ | 5 s, cámara casi fija. Biométricos usa el SVG animado. |
| Zoom out de Expansión | ⬜ opcional | Si no sale en una sola toma, se resuelve solo con SVG. |
| Mapas SVG (CABA, Argentina, globo) | ⬜ | Datos abiertos, simplificados. |
| `isotipo-mascara.svg` | ⬜ | Solo si va la intro. |
| Fotos del premio | ✅ | Reales, ya están en `public/img/`. |

### 10.2 Reglas para generar en Flow

1. **Una sola toma**, sin cortes.
2. **Cámara fija** cuando el video va en loop o en scrub. Usar
   *"Completely static shot, the camera never moves"*.
   **No escribir "tripod"**: la IA lo dibuja.
3. **Sin texto, logos ni carteles** (la IA los deforma).
4. **Paleta:** negro cálido, ámbar/dorado. Verde solo para "acceso concedido".
5. **Lector:** mullion angosto, negro mate texturado, barra LED arriba,
   tamaño de un celular (~15 cm, una décima parte del alto de la puerta),
   a la altura de la mano. Usar la foto de referencia del HID si Flow lo permite.
6. Siempre que se pueda: **de imagen a video** usando `hero-base-rojo` como
   primer cuadro, para mantener la continuidad.
7. Exportar en **1080p**.
8. Agregar al final de cada prompt: *"No people, no objects entering the frame."*

Bloque de estilo para todos los prompts:

> cinematic, dark warm black tones, golden amber accent lighting, shallow depth
> of field, premium and minimal, single continuous shot, no text, no logos, no
> signage, no people's faces in focus

### 10.3 Procesamiento con ffmpeg (`herramientas/videos.sh`)

```bash
# Sacar el audio
ffmpeg -i entrada.mp4 -an -c:v copy sin-audio.mp4

# Loop sin costura: el último tramo (1,2 s) se funde sobre el principio.
# L = duración del clip limpio. Ej.: L=4.8 → a = 0..3.6, b = 3.6..4.8
ffmpeg -i limpio.mp4 -filter_complex \
 "[0]split[x][y];[x]trim=0:3.6,setpts=PTS-STARTPTS[a];[y]trim=3.6:4.8,setpts=PTS-STARTPTS[b];[b][a]xfade=transition=fade:duration=1.2:offset=0,format=yuv420p" \
 -an -c:v libx264 -preset slow -crf 23 -movflags +faststart hero-loop.mp4

# Versión WebM del loop (más liviana en Chrome/Firefox)
ffmpeg -i hero-loop.mp4 -an -c:v libvpx-vp9 -crf 34 -b:v 0 -row-mt 1 hero-loop.webm

# Video para scrub: cada cuadro es clave (-g 1) → se puede saltar a cualquier punto al instante
ffmpeg -i apertura.mp4 -t 2.5 -an -c:v libx264 -preset slow -crf 23 -g 1 \
 -pix_fmt yuv420p -movflags +faststart cierre-puerta.mp4

# Versión mobile del scrub, más chica
ffmpeg -i cierre-puerta.mp4 -vf "scale=960:-2" -an -c:v libx264 -crf 26 -g 1 \
 -pix_fmt yuv420p -movflags +faststart cierre-puerta-mobile.mp4

# Recorte de un tramo (ej. 3,2 a 8 s)
ffmpeg -ss 3.2 -t 4.8 -i entrada.mp4 -an -c:v libx264 -crf 16 tramo.mp4

# Poster (primer cuadro) en WebP
ffmpeg -i hero-loop.mp4 -frames:v 1 -c:v libwebp -quality 80 hero-poster.webp
```

### 10.4 Plan B del scrub: secuencia de imágenes

```bash
ffmpeg -i cierre-puerta.mp4 -vf "fps=24,scale=1600:-2" -c:v libwebp -quality 70 frames/cierre_%03d.webp
```

En JS: precargar los cuadros y dibujar el que corresponda en un `<canvas>`
según el progreso (`Math.round(progreso * (total - 1))`).

### 10.5 Presupuesto de peso

| Recurso | Escritorio | Mobile |
|---|---|---|
| Poster del hero (LCP) | ≤ 250 KB | ≤ 120 KB |
| Loop del hero | ≤ 2,5 MB | ≤ 1,2 MB |
| Video del cierre (scrub) | ≤ 3 MB | ≤ 1,5 MB |
| Cada clip de Soluciones | ≤ 1 MB | ≤ 600 KB |
| JS total (gzip) | ≤ 70 KB | ≤ 70 KB |
| Peso inicial (antes de scrollear) | ≤ 1,5 MB | ≤ 800 KB |

Todo lo que está debajo del hero se carga con `preload="none"` / `loading="lazy"`
y se pide cuando la escena se acerca.

---

## 11. Fase 7 — Mobile, movimiento reducido y accesibilidad

El "backup" no es otra librería: son capas.

| Capa | Qué ve | Cómo |
|---|---|---|
| **Sin JS** | Toda la info, estática | Fase 2 terminada; la clase `.js` solo se agrega si el script corre |
| **Movimiento reducido** | Todo estático, sin scroll suave | Condición `reducido` del `matchMedia`; Lenis no se inicia |
| **Mobile** | Escenas simplificadas, sin pines largos ni scrub de video pesado | Condición `mobile`: versiones livianas de cada escena |
| **Escritorio** | Versión completa | Condición `escritorio` |

Accesibilidad:

- Videos decorativos con `aria-hidden="true"`, sin audio, sin controles.
- Todo texto importante en HTML, nunca dentro de un video.
- Contraste del texto sobre video: degradé oscuro siempre presente.
- Foco visible en todos los links (ya está en la guía).
- Sectores horizontales: seguir el foco del teclado (ver 9.3).
- Probar con teclado de punta a punta y con lector de pantalla (NVDA).

---

## 12. Fase 8 — Medición, SEO y rendimiento

**Medición**

- Portar `medir()` y el listener de `[data-track]` (incluye `data-servicio`).
- Agregar `clic_ver_servicios` en el botón nuevo del hero.
- Opcional: evento `escena_vista` cuando cada escena llega al 50 %, para ver
  hasta dónde scrollea la gente.

**SEO**

- Metas y canonical **sin cambios** (decisión tomada).
- Un solo `<h1>` (hero). Cada escena con su `<h2>`.
- Todo el texto en el HTML, no en canvas ni video.
- `alt` reales en las fotos del premio; `alt=""` en fondos decorativos.

**Rendimiento — objetivos**

| Métrica | Objetivo (mobile) |
|---|---|
| Lighthouse Performance | ≥ 85 |
| LCP | < 2,5 s |
| CLS | < 0,1 |
| INP | < 200 ms |

Medir **después de cada escena**, en un Android de gama media real, no solo
en la PC.

---

## 13. Fase 9 — Deploy en el hosting de WordPress (subcarpeta)

La landing **no reemplaza la home**: se publica en una subcarpeta del mismo
hosting donde está el WordPress. No hace falta servidor aparte.

### 13.1 Por qué convive con WordPress

WordPress solo atiende las URLs que **no** son un archivo o carpeta real. Su
`.htaccess` tiene:

```apache
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.php [L]
```

Si existe la carpeta `landing/` con su `index.html`, el servidor la sirve
directo, sin pasar por WordPress. En hostings con nginx pasa lo mismo con la
regla típica `try_files $uri $uri/ /index.php`.

### 13.2 Elegir el nombre de la carpeta

- Se define **solo** en `base` de `astro.config.mjs` (en este README figura
  `/landing` como provisorio).
- **No puede coincidir con un slug de WordPress** (página, entrada, categoría).
  Si coincide, la carpeta tapa esa página. Nada de `presupuesto-online`,
  `soluciones`, `sectores` ni `sucursales`.
- Para SEO conviene un nombre descriptivo, ej. `/control-de-acceso/`.
  Antes de elegirlo, abrir `cerrajerialeonardo.com.ar/<nombre>/` y confirmar
  que da 404.

### 13.3 Build y subida

```bash
npm run build      # genera dist/ con todas las rutas ya prefijadas con la subcarpeta
npm run preview    # revisar el build en http://localhost:4321/landing/
```

Subir el **contenido** de `dist/` (no la carpeta `dist` en sí) a la
subcarpeta, dentro de la raíz del WordPress (donde están `wp-config.php` y
`wp-content/`):

```
public_html/              ← raíz del WordPress (el nombre depende del hosting)
├─ wp-admin/
├─ wp-content/
├─ wp-includes/
├─ .htaccess              ← el de WordPress, NO se toca
└─ landing/               ← contenido de dist/
   ├─ index.html
   ├─ _astro/
   ├─ video/
   ├─ img/
   └─ .htaccess           ← propio de la landing (13.4)
```

Formas de subir: SFTP (FileZilla), el administrador de archivos del panel del
hosting, o por SSH si el hosting lo permite:

```bash
rsync -avz --delete dist/ usuario@servidor:/ruta/a/public_html/landing/
```

> `--delete` borra en el servidor lo que ya no está en `dist/`. Usarlo **solo**
> apuntando a la subcarpeta `landing/`, nunca a la raíz del WordPress.

### 13.4 `.htaccess` propio de la landing (Apache)

Va dentro de `landing/` (se puede dejar en `public/.htaccess` para que Astro
lo copie solo en cada build). No afecta al WordPress:

```apache
# Compresión
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css application/javascript image/svg+xml
</IfModule>

# Tipos de video
AddType video/mp4 .mp4
AddType video/webm .webm

<IfModule mod_headers.c>
  # Archivos con hash de Astro: no cambian nunca → cache de 1 año
  <If "%{REQUEST_URI} =~ m#/_astro/#">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </If>
  # Videos e imágenes: 30 días
  <FilesMatch "\.(mp4|webm|webp|avif|png|svg)$">
    Header set Cache-Control "public, max-age=2592000"
  </FilesMatch>
  # HTML: siempre revalidar, así los cambios se ven al toque
  <FilesMatch "\.html$">
    Header set Cache-Control "no-cache"
  </FilesMatch>
</IfModule>
```

Apache sirve los videos con soporte de rangos (`Accept-Ranges`) por defecto,
que es lo que necesita el scrub. Si el hosting es nginx sin `.htaccess`, estas
reglas las tiene que cargar el proveedor en la configuración del sitio.

### 13.5 Cuidados con el WordPress

- **Plugins de caché o CDN** (WP Rocket, LiteSpeed Cache, Cloudflare): si
  después de subir una versión nueva se sigue viendo la vieja, purgar la caché.
  Si el CDN cachea HTML, excluir `/landing/`.
- **Plugins de seguridad** (Wordfence, etc.): si bloquean la carpeta, agregarla
  a la lista de permitidos.
- **Backups:** los plugins de backup suelen incluir la carpeta; con los videos
  el backup pesa más.
- **Actualizaciones de WordPress:** no tocan la carpeta.
- **Links internos:** los botones de la landing ya apuntan a URLs absolutas del
  WordPress (`/presupuesto-online/`, `/sectores/...`), no cambian.
- **Sitemap:** agregar la URL de la landing en Search Console, porque el
  sitemap de WordPress (Yoast / Rank Math) no la conoce.

---

## 14. Checklist final

**Contenido**
- [ ] Todos los textos del HTML nuevo están en la página
- [ ] Links de sectores, soluciones, presupuesto y formulario funcionan
- [ ] Teléfonos, WhatsApp y mail correctos
- [ ] Fotos del premio con `alt`

**Animación**
- [ ] Cada escena funciona hacia adelante y hacia atrás
- [ ] No hay saltos al cambiar de escena (pines bien calculados)
- [ ] El menú lleva a cada sección correctamente (con Lenis)
- [ ] Redimensionar la ventana no rompe nada (`ScrollTrigger.refresh`)
- [ ] Movimiento reducido: todo estático y legible
- [ ] Sin JS: todo visible

**Dispositivos**
- [ ] Chrome y Edge (Windows)
- [ ] Firefox
- [ ] Safari macOS
- [ ] Safari iOS (videos con `muted playsinline`, scrub del cierre)
- [ ] Chrome Android de gama media

**Rendimiento y medición**
- [ ] Lighthouse mobile ≥ 85
- [ ] Peso inicial dentro del presupuesto
- [ ] Eventos de GA4 llegando (Tag Assistant)

**Deploy**
- [ ] Nombre de la subcarpeta definido y verificado (da 404 en WordPress antes de subir)
- [ ] `base` en `astro.config.mjs` = nombre de la subcarpeta
- [ ] Build sin errores y `npm run preview` OK
- [ ] Canonical y `og:url` apuntan a la landing, no a la home (ver código fuente)
- [ ] Videos, imágenes y CSS cargan (sin 404 en la consola)
- [ ] `.htaccess` propio dentro de la subcarpeta; el de WordPress intacto
- [ ] La home y el resto del WordPress siguen funcionando
- [ ] Caché de plugins/CDN purgada
- [ ] URL enviada en Search Console
- [ ] HTTPS activo

---

## 15. Pendientes y decisiones abiertas

| # | Tema | Estado |
|---|---|---|
| 1 | ¿Va la **intro** con el isotipo-máscara? | A decidir |
| 2 | Agregar **"Soluciones"** al menú del header | Propuesto |
| 3 | Regenerar el **loop del hero** (sin "tripod", 1080p, desde la base nueva) | Pendiente |
| 4 | Versión **9:16** del hero | Pendiente |
| 5 | **6 clips de Soluciones** | Pendiente |
| 6 | **Zoom out** de Expansión (o solo SVG) | Pendiente |
| 7 | Lector en forma de "Γ" en el video de la puerta: ¿tapar con capa propia? | Ver montado |
| 8 | Transición opcional "entrar al edificio" entre Hero y Soluciones | A decidir |
| 9 | ¿Se mantiene una **FAQ** corta antes del footer? (suma para SEO) | A decidir |
| 10 | Dónde se publica | ✅ Subcarpeta del WordPress (no reemplaza la home) |
| 11 | **Nombre de la subcarpeta** (provisorio `/landing`; sugerido `/control-de-acceso`) | A decidir |

**Orden de trabajo recomendado:** Fase 1 → 2 → 3 → 4 → Hero → Cierre (ya
tiene los assets) → Sectores → Reconocimiento → Soluciones → Expansión →
Fase 7 → 8 → 9.