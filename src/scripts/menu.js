/* ── Menú móvil ─────────────────────────────────────────── */
export function iniciarMenu() {
  const menuBtn = document.getElementById('menu-btn');
  const nav = document.getElementById('nav');
  if (!menuBtn || !nav) return;
  const escritorio = window.matchMedia('(min-width: 1024px)');

  function abrirMenu() {
    nav.classList.add('nav--abierto');
    menuBtn.setAttribute('aria-expanded', 'true');
    menuBtn.setAttribute('aria-label', 'Cerrar menú');
    const primerLink = nav.querySelector('a');
    if (primerLink) primerLink.focus();
  }

  function cerrarMenu(devolverFoco) {
    nav.classList.remove('nav--abierto');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-label', 'Abrir menú');
    if (devolverFoco) menuBtn.focus();
  }

  menuBtn.addEventListener('click', () => {
    if (nav.classList.contains('nav--abierto')) cerrarMenu(false);
    else abrirMenu();
  });

  nav.addEventListener('click', (e) => {
    if (e.target.closest('a') && !escritorio.matches) cerrarMenu(false);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('nav--abierto')) cerrarMenu(true);
  });

  document.addEventListener('click', (e) => {
    if (!nav.classList.contains('nav--abierto')) return;
    if (!nav.contains(e.target) && !menuBtn.contains(e.target)) cerrarMenu(false);
  });

  escritorio.addEventListener('change', (e) => {
    if (e.matches) cerrarMenu(false);
  });
}
