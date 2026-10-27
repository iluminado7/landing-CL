// Único punto de arranque del JS de la página.
// Fase 2: solo lo funcional (medición, menú, header). En la Fase 4 se suman
// Lenis, GSAP y las escenas, en el orden de la página.
import { iniciarMedicion } from './medicion.js';
import { iniciarMenu } from './menu.js';
import { iniciarHeader } from './header.js';

export function iniciar() {
  window.landingLista = true;

  iniciarMedicion();
  iniciarMenu();
  iniciarHeader();
}
