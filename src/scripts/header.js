/* ── Header al hacer scroll + barra de progreso ─────────────
   Un solo manejador, limitado a un cálculo por cuadro. Lenis
   mueve el scroll nativo, así que el evento 'scroll' sigue
   disparándose igual con o sin scroll suave.                  */
export function iniciarHeader() {
  const header = document.getElementById('header');
  if (!header) return;
  const raiz = document.documentElement;
  let pendiente = false;

  function actualizar() {
    pendiente = false;
    const y = window.scrollY;
    header.classList.toggle('header--scroll', y > 24);

    const recorrible = raiz.scrollHeight - window.innerHeight;
    const progreso = recorrible > 0 ? Math.min(y / recorrible, 1) : 0;
    header.style.setProperty('--progreso', progreso.toFixed(4));
  }

  function pedir() {
    if (pendiente) return;
    pendiente = true;
    requestAnimationFrame(actualizar);
  }

  actualizar();
  window.addEventListener('scroll', pedir, { passive: true });
  window.addEventListener('resize', pedir);
}
