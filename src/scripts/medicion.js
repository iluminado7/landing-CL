/* ── Medición ───────────────────────────────────────────────
   Empuja eventos a dataLayer (Google Tag Manager / GA4) si está
   instalado. Sin analítica configurada no hace nada.          */
export function medir(evento, datos) {
  if (!Array.isArray(window.dataLayer)) return;
  window.dataLayer.push({ event: evento, ...datos });
}

export function iniciarMedicion() {
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-track]');
    if (!el) return;
    const datos = { ubicacion: el.dataset.ubicacion || '' };
    if (el.dataset.servicio) datos.servicio = el.dataset.servicio;
    medir(el.dataset.track, datos);
  });
}
