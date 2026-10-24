// Dibuja los carteles del video promocional (portada, títulos de cada escena, cierre con la invitación a ser tester)
// como imágenes PNG, en horizontal (1920×1080) y en vertical (1080×1920). Usa la letra libre del juego (Fredoka) y el logo.
// Los textos se cambian en TEXTOS (abajo) sin tocar nada más.
// Uso: NODE_PATH=$(npm root -g) node scripts/video/carteles.cjs <salida>
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const OUT = path.resolve(process.argv[2] || "video", "carteles");
const RAIZ = path.join(__dirname, "..", "..");
const b64 = (f) => fs.readFileSync(path.join(RAIZ, f)).toString("base64");

const TEXTOS = {
  portada: { titulo: "Matijuego", sub: "el arcade de Matichoc" },
  escenas: {
    pueblo: ["🏡", "Explora tu propio pueblo"],
    renovar: ["⭐", "Renuévalo con estrellas de todos los juegos"],
    pichanga: ["⚽", "Pichanga 3 contra 3"],
    basquet: ["🏀", "Básquet 2 contra 2"],
    ciudad: ["🚗", "Maneja por la Ciudad Choco"],
    parkour: ["🏃", "Corre y salta en el parkour infinito"],
    merge: ["🍫", "Junta productos y entrega pedidos"],
    extras: ["🎮", "¡14 juegos y mundos en 3D!"],
  },
  cierre: {
    lineas: ["Gratis · sin anuncios", "para niñas y niños"],
    llamado: "🙋 ¿Tienes Android? ¡Sé tester!",
    web: "Pruébalo ya en matichoc.cl/matijuego",
  },
};

const CSS = `
@font-face{font-family:F;src:url(data:font/woff2;base64,${b64("assets/fonts-libres/fredoka-latin-600-normal.woff2")}) format("woff2");font-weight:600}
*{box-sizing:border-box}html,body{margin:0;background:transparent;font-family:F,"Noto Color Emoji",sans-serif;font-weight:600}
:root{--cafe:#4b2e2e;--cafe2:#2f1c18;--rosa:#d4216c;--amarillo:#ffc800;--crema:#fff6e6;--lima:#cfd767}
.fondo{position:absolute;inset:0;background:radial-gradient(circle at 50% 38%,#6b3f36 0%,var(--cafe) 55%,var(--cafe2) 100%)}
.patron{position:absolute;inset:0;background:url(data:image/png;base64,${b64("assets/brand/pattern-cacao-subtle.png")});opacity:.35}
.logo{background:#fff;border-radius:28px;display:flex;align-items:center;justify-content:center;box-shadow:0 10px 30px rgba(0,0,0,.45)}
.titulo{color:var(--rosa);text-shadow:0 6px 0 var(--cafe2),0 0 30px rgba(255,200,0,.35);letter-spacing:1px;line-height:1}
.sub{color:var(--lima);line-height:1}
.pill{display:inline-flex;align-items:center;gap:.45em;background:var(--cafe);color:var(--crema);border:6px solid var(--amarillo);border-radius:999px;padding:.32em .9em .36em .6em;box-shadow:0 10px 0 var(--cafe2),0 16px 40px rgba(0,0,0,.45);line-height:1.05}
.pill .e{font-size:1.15em}
.cta{background:var(--rosa);color:#fff;border-radius:28px;padding:.45em .9em;box-shadow:0 10px 0 #8d1247;line-height:1.1;text-align:center}
.web{color:var(--amarillo);line-height:1.1;text-align:center}
.lin{color:var(--crema);line-height:1.15;text-align:center}
`;
const logo = (w) => `<div class="logo" style="width:${w}px;height:${Math.round(w * 0.6)}px"><img src="data:image/png;base64,${b64("assets/brand/logo-horizontal.png")}" style="width:${Math.round(w * 0.88)}px"></div>`;

function paginas() {
  const T = TEXTOS;
  const out = [];
  // ---------- horizontal
  out.push(["h-portada", 1920, 1080, `<div class="fondo"></div><div class="patron"></div>
    <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:34px">
      ${logo(420)}<div class="titulo" style="font-size:190px">${T.portada.titulo}</div><div class="sub" style="font-size:64px">${T.portada.sub}</div></div>`]);
  out.push(["h-cierre", 1920, 1080, `<div class="fondo"></div><div class="patron"></div>
    <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:30px">
      <div style="display:flex;align-items:center;gap:44px">${logo(330)}<div class="titulo" style="font-size:150px">${T.portada.titulo}</div></div>
      <div class="lin" style="font-size:54px">${T.cierre.lineas.join("<br>")}</div>
      <div class="cta" style="font-size:72px;margin-top:14px">${T.cierre.llamado}</div>
      <div class="web" style="font-size:50px">${T.cierre.web}</div></div>`]);
  for (const [id, [e, txt]] of Object.entries(T.escenas)) {
    out.push([`h-${id}`, 1920, 1080, `<div style="position:absolute;left:70px;bottom:84px;font-size:66px"><span class="pill"><span class="e">${e}</span>${txt}</span></div>`]);
  }
  // ---------- vertical: fondo con el título arriba y la invitación abajo; el video va en la ventana del medio
  out.push(["v-portada", 1080, 1920, `<div class="fondo"></div><div class="patron"></div>
    <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:40px">
      ${logo(560)}<div class="titulo" style="font-size:180px">${T.portada.titulo}</div><div class="sub" style="font-size:66px">${T.portada.sub}</div></div>`]);
  out.push(["v-cierre", 1080, 1920, `<div class="fondo"></div><div class="patron"></div>
    <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:44px;padding:0 60px">
      ${logo(480)}<div class="titulo" style="font-size:160px">${T.portada.titulo}</div>
      <div class="lin" style="font-size:58px">${T.cierre.lineas.join("<br>")}</div>
      <div class="cta" style="font-size:56px;margin-top:20px;white-space:nowrap">${T.cierre.llamado}</div>
      <div class="web" style="font-size:50px">${T.cierre.web}</div></div>`]);
  for (const [id, [e, txt]] of Object.entries(T.escenas)) {
    out.push([`v-${id}`, 1080, 1920, `<div class="fondo"></div><div class="patron"></div>
      <div style="position:absolute;left:0;right:0;top:120px;display:flex;justify-content:center">${logo(300)}</div>
      <div style="position:absolute;left:50px;right:50px;top:420px;text-align:center;font-size:76px;color:var(--crema);line-height:1.12;text-shadow:0 5px 0 var(--cafe2)"><div style="font-size:120px;margin-bottom:10px">${e}</div>${txt}</div>
      <div style="position:absolute;left:0;right:0;bottom:170px;display:flex;flex-direction:column;align-items:center;gap:26px">
        <div class="cta" style="font-size:54px">${T.cierre.llamado}</div><div class="web" style="font-size:40px">${T.cierre.web}</div></div>`]);
  }
  return out;
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium" });
  for (const [nombre, w, h, cuerpo] of paginas()) {
    const p = await (await b.newContext({ viewport: { width: w, height: h } })).newPage();
    await p.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body style="width:${w}px;height:${h}px;position:relative;overflow:hidden">${cuerpo}</body></html>`);
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(150);
    await p.screenshot({ path: path.join(OUT, `${nombre}.png`), omitBackground: true });
    await p.close();
  }
  await b.close();
  console.log("carteles en", OUT);
})();
