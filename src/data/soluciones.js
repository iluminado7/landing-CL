import { ruta } from '../scripts/ruta.js';

// `servicio` es el valor de data-servicio que ya usa GA4: no cambiarlo.
// `icono` es el contenido del <svg viewBox="0 0 24 24">.
export const soluciones = [
  {
    id: 'control-acceso',
    titulo: 'Control de acceso',
    texto: 'Gestión de ingresos y egresos en tiempo real. Altas y bajas de usuarios sin cambiar cerraduras ni repartir llaves.',
    href: 'https://cerrajerialeonardo.com.ar/soluciones/control-acceso/',
    servicio: 'Control de acceso',
    icono: '<rect x="4" y="3" width="16" height="18" rx="2"/><circle cx="12" cy="10" r="3"/><path d="M8 17h8"/>',
    video: ruta('/video/soluciones/control-acceso.mp4'),
  },
  {
    id: 'biometricos',
    titulo: 'Sistemas biométricos',
    texto: 'Acceso mediante reconocimiento facial. La credencial es la persona: no se pierde, no se presta, no se copia.',
    href: 'https://cerrajerialeonardo.com.ar/soluciones/control-acceso-biometrico/',
    servicio: 'Sistema biométrico',
    icono: '<path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3"/><circle cx="12" cy="10" r="2.5"/><path d="M8 16.5c.8-1.8 2.3-2.8 4-2.8s3.2 1 4 2.8"/>',
    demo: 'facial', // usa <LectorFacial /> en lugar de video
  },
  {
    id: 'cerraduras',
    titulo: 'Cerraduras electrónicas',
    texto: 'Más seguridad para cada puerta con tecnología moderna y confiable, en edificios, oficinas y viviendas.',
    href: 'https://cerrajerialeonardo.com.ar/soluciones/cerradura-electronica/',
    servicio: 'Cerradura electrónica',
    icono: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/><circle cx="12" cy="15.5" r="1.5"/>',
    video: ruta('/video/soluciones/cerraduras.mp4'),
  },
  {
    id: 'camaras',
    titulo: 'Cámaras de seguridad',
    texto: 'Vigilancia en alta resolución para monitorear los accesos y espacios comunes de tu edificio.',
    href: 'https://cerrajerialeonardo.com.ar/soluciones/instalacion-camaras-seguridad/',
    servicio: 'Cámaras de seguridad',
    icono: '<path d="M3 7l12-3 2 7-12 3z"/><path d="M17 8l4 1-1 4-3-1"/><path d="M7 14l1 6M5 20h6"/>',
    video: ruta('/video/soluciones/camaras.mp4'),
  },
  {
    id: 'integracion',
    titulo: 'Integración con sistemas existentes',
    texto: 'Adaptamos software y hardware a la infraestructura que ya tenés, para no empezar de cero.',
    href: 'https://cerrajerialeonardo.com.ar/soluciones/integracion-sistemas-existentes/',
    servicio: 'Integración',
    icono: '<rect x="3" y="4" width="7" height="7" rx="1.5"/><rect x="14" y="13" width="7" height="7" rx="1.5"/><path d="M10 7.5h4a3 3 0 0 1 3 3V13M14 16.5h-4a3 3 0 0 1-3-3V11"/>',
    video: ruta('/video/soluciones/integracion.mp4'),
  },
  {
    id: 'llaveros',
    titulo: 'Llaveros y tarjetas de proximidad',
    texto: 'Duplicación rápida y segura de credenciales RFID y tags de acceso.',
    href: 'https://cerrajerialeonardo.com.ar/soluciones/copia-llavero-tarjetas/',
    servicio: 'Llaveros y tarjetas',
    icono: '<circle cx="8" cy="8" r="4"/><path d="M11 11l9 9M16 16l2-2M18 18l2-2"/>',
    video: ruta('/video/soluciones/llaveros.mp4'),
  },
];
