// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://cerrajerialeonardo.com.ar',
  // Subcarpeta donde se publica dentro del WordPress.
  // Es el ÚNICO lugar donde se define el nombre: cambiarlo acá cambia todas las rutas.
  base: '/landing',
  trailingSlash: 'always',
  build: { inlineStylesheets: 'auto' },
});
