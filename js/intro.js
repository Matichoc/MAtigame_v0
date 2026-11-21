// Entrada de cine: al abrir el juego, después del sello de carga, se ve un vuelo de cámara sobre el Pueblo al atardecer
// que termina en el Matichico frente a la fuente de chocolate, y aparece el nombre del juego.
// Son dos videos cortos (6,8 s) grabados del propio juego en alta calidad con scripts/video/grabar.cjs: uno para el
// celular acostado (assets/intro/entrada.mp4, 1280×720, escena "entrada") y otro para el celular parado
// (assets/intro/entrada-v.mp4, 720×1280, escena "entrada-v"). Así cada pantalla ve un video hecho a su medida (sin
// estirarlo ni recortarlo) y se ve igual de bien en un celular barato que en uno caro, porque el teléfono solo
// reproduce un video en vez de dibujar el Pueblo entero al partir.
// Se muestra una vez al día, se salta con un toque y, si el video no puede verse, simplemente no aparece.

const KEY = "matichoc_entrada_dia";
const MAX_MS = 9000; // por si el video se queda pegado: nunca tapa el juego más que esto

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};

function due() {
  if (/[?&](debug3d|nosplash)\b/.test(location.search)) return false; // pruebas automáticas
  try {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
    return localStorage.getItem(KEY) !== today();
  } catch (e) { return false; }
}

function play() {
  if (!due()) return;
  try { localStorage.setItem(KEY, today()); } catch (e) { /* sin almacenamiento */ }
  const vertical = window.innerHeight > window.innerWidth; // celular parado
  const box = document.createElement("div");
  box.id = "intro-cine";
  box.setAttribute("aria-hidden", "true");
  box.innerHTML = `
    <video muted playsinline preload="auto" src="assets/intro/${vertical ? "entrada-v" : "entrada"}.mp4"></video>
    <div class="ic-shade"></div>
    <div class="ic-title"><img src="assets/brand/logo-horizontal.png" alt=""><b>Matijuego</b><span>el arcade de Matichoc</span></div>
    <div class="ic-skip">Toca para saltar</div>`;
  const video = box.querySelector("video");
  let gone = false;
  const close = () => {
    if (gone) return;
    gone = true;
    box.classList.add("out");
    setTimeout(() => box.remove(), 600);
  };
  video.addEventListener("ended", () => setTimeout(close, 500));
  video.addEventListener("error", close);
  video.addEventListener("timeupdate", () => { if (video.currentTime > 3.4) box.classList.add("title"); });
  box.addEventListener("pointerdown", close);
  setTimeout(close, MAX_MS);
  document.body.appendChild(box);
  const p = video.play();
  if (p && p.catch) p.catch(close); // el navegador no dejó reproducirlo: se sigue sin la entrada
}

/** Deja lista la entrada: parte cuando el sello de carga empieza a irse (ver hide() en js/splash.js). */
export function initIntro() {
  window.addEventListener("splash-out", play, { once: true });
}
