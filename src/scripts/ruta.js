// ruta('/video/hero-loop.mp4') → '/landing/video/hero-loop.mp4'
export const ruta = (p) => import.meta.env.BASE_URL.replace(/\/$/, '') + p;
