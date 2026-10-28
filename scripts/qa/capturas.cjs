// Genera las capturas de la ficha de Play Store (1080×1920) y el gráfico de funciones (1024×500) a partir de la variante que se sirve
// (para la ficha: la variante app). NO retoca nada: son capturas reales de la pantalla; el gráfico solo las compone con el texto.
// Uso: NODE_PATH=$(npm root -g) QA_OUT=store [QA_FECHA=…] node scripts/qa/capturas.cjs [url-base]
const fs = require("fs");
const path = require("path");
const { abrir, nuevoPerfil, BASE } = require("./lib.cjs");
const OUT = path.resolve(process.env.QA_OUT || "store");
const SH = path.join(OUT, "screenshots");
fs.mkdirSync(SH, { recursive: true });

// [archivo, nombre del juego en el menú, botón de inicio, orientación]. Los juegos que piden el celular acostado (orient: "landscape" en
// js/games-catalog.js) se capturan en horizontal (1920×1080); el resto en vertical (1080×1920): así cada captura muestra el juego tal como se ve.
const JUEGOS = [
  ["02-parkour", "Parkour Choco", "#parkour-btn-campaign", "h"],
  ["03-bloques", "Bloques de Productos", "#tetris-btn-start", "v"],
  ["04-basquet", "Lanzamientos de Básquet", "#basquet-btn-start", "h"],
  ["05-creador", "Crea tu Chocolate", "#creador-btn-start", "v"],
  ["06-recolecta", "Recolecta y Corre", "#screen-recolecta [data-action=begin]", "h"],
  ["07-porristas", "Saltos de Porristas", "#porristas-btn-start", "h"],
  ["08-salto", "Salto Choco", "#salto-btn-start", "v"],
];

async function alMenu(p) {
  await p.goto(BASE + "?debug3d", { waitUntil: "networkidle" });
  await p.waitForTimeout(700);
  // con el menú nuevo, al volver a entrar se llega directo al inicio: perfil y personaje solo si se ven
  const prof = p.locator("#profile-grid .profile-card:not(.add-profile)").first();
  if (await prof.isVisible().catch(() => false)) { await prof.click(); await p.waitForTimeout(500); }
  const ch = p.locator("#character-grid .character-card").nth(1);
  if (await ch.isVisible().catch(() => false)) { await ch.click(); await p.waitForTimeout(800); }
}
// el aviso de bienvenida tapa la barra de abajo: se espera a que se vaya solo (no se esconde a mano)
const sinAviso = (p) => p.waitForFunction(() => { const t = document.querySelector("#toast, .toast"); return !t || t.classList.contains("hidden") || getComputedStyle(t).opacity === "0"; }, null, { timeout: 20000 }).catch(() => {});
const foto = (p, nombre) => p.screenshot({ path: path.join(SH, `${nombre}.jpg`), type: "jpeg", quality: 84, timeout: 120000 }); // los juegos 3D tardan en este equipo sin GPU

const SOLO_GRAFICO = process.argv.includes("--solo-grafico"); // reutiliza las capturas ya tomadas
(async () => {
  const V = await abrir({ viewport: { width: 540, height: 960 }, touch: true, dsf: 2 });
  const H = await abrir({ viewport: { width: 960, height: 540 }, touch: true, dsf: 2 });
  // QA_FECHA (ej. 2026-06-15T12:00:00-04:00): la fecha del aparato, para que la ficha no salga con la decoración de una
  // temporada (Halloween, Navidad...) que dura solo unos días. No cambia el juego: es la misma fecha que tendría el celular.
  if (process.env.QA_FECHA) for (const { p } of [V, H]) await p.clock.install({ time: new Date(process.env.QA_FECHA) });
  if (!SOLO_GRAFICO) {
    await nuevoPerfil(V.p, "Tina");
    await nuevoPerfil(H.p, "Tina");
    await V.p.waitForTimeout(2500);
    await sinAviso(V.p);
    await V.p.waitForTimeout(600);
    await foto(V.p, "01-hub");
  }
  for (const [archivo, nombre, inicio, o] of SOLO_GRAFICO ? [] : JUEGOS) {
    const { p } = o === "h" ? H : V;
    await alMenu(p);
    await p.locator(".game-card, #game-feature", { hasText: nombre }).first().click({ timeout: 8000 });
    // la tarjeta de inicio aparece cuando el mundo 3D terminó de cargar: se espera el botón y se comprueba que el juego empezó
    const btn = p.locator(inicio).first();
    await btn.waitFor({ state: "visible", timeout: 60000 });
    await p.waitForTimeout(500);
    // se toca con click() dentro de la página: aquí, sin tarjeta de video, cada cuadro 3D tarda tanto que el clic simulado de
    // Playwright no alcanza a completarse (el botón hace lo mismo con un toque de verdad)
    await btn.evaluate((el) => el.click());
    const empezo = await p.waitForFunction((sel) => { const b = document.querySelector(sel); return !b || !b.offsetParent; }, inicio, { timeout: 20000 }).then(() => true).catch(() => false);
    if (!empezo) throw new Error(`${archivo}: el juego no empezó (sigue la tarjeta de inicio)`);
    await p.waitForTimeout(4500);
    await sinAviso(p);
    await foto(p, archivo);
    console.log("captura", archivo, o === "h" ? "(horizontal)" : "(vertical)");
  }
  const b = V.b;
  const reg = { externas: [...V.reg.externas, ...H.reg.externas], errores: [...V.reg.errores, ...H.reg.errores] };
// gráfico de funciones: logo + texto + tres capturas reales
  const b64 = (f) => "data:image/jpeg;base64," + fs.readFileSync(path.join(SH, f + ".jpg")).toString("base64");
  const g = await (await b.newContext({ viewport: { width: 1024, height: 500 }, deviceScaleFactor: 1 })).newPage();
  const html = `<!doctype html><html><head><base href="${BASE}"><link rel="stylesheet" href="css/style.css"><style>
    html,body{margin:0;width:1024px;height:500px;overflow:hidden;background:#4b2e2e;background-image:url(assets/brand/pattern-cacao-subtle.png)}
    .logo{position:absolute;left:52px;top:44px;width:193px;height:119px;background:#fff;border-radius:16px;display:flex;align-items:center;justify-content:center}
    .logo img{width:172px}
    h1{position:absolute;left:52px;top:190px;margin:0;font:400 92px/1 var(--font-display);color:#d4216c;text-shadow:0 3px 0 #2f1c18}
    .sub{position:absolute;left:52px;top:300px;font:400 34px/1 var(--font-script);color:#cfd767}
    .txt{position:absolute;left:52px;top:372px;width:470px;font:700 23px/1.4 "Segoe UI",system-ui,sans-serif;color:#fff6e6}
    .ph{position:absolute;border:7px solid #ffc800;border-radius:20px;overflow:hidden;background:#222;box-shadow:0 8px 24px rgba(0,0,0,.5)}
    .ph img{width:100%;height:100%;object-fit:cover;object-position:center 35%}
  </style></head><body>
    <div class="logo"><img src="assets/brand/logo-horizontal.png"></div>
    <h1>Matijuego</h1><div class="sub">el arcade de Matichoc</div>
    <div class="txt">14 juegos y mundos 3D · parkour · básquet · memoria · crea tu propio chocolate</div>
    <div class="ph" style="left:575px;top:30px;width:320px;height:215px;transform:rotate(5deg)"><img src="${b64("02-parkour")}"></div>
    <div class="ph" style="left:690px;top:215px;width:320px;height:215px;transform:rotate(-4deg)"><img src="${b64("04-basquet")}"></div>
    <div class="ph" style="left:515px;top:255px;width:240px;height:215px;transform:rotate(-5deg)"><img src="${b64("05-creador")}"></div>
  </body></html>`;
  // se escribe el documento dentro de una página del mismo origen (las tipografías se piden al servidor de la prueba, que no envía CORS)
  await g.goto(BASE + "no-existe", { waitUntil: "load" });
  await g.evaluate((h) => { document.open(); document.write(h); document.close(); }, html);
  await g.waitForLoadState("networkidle");
  await g.evaluate(async () => { await document.fonts.load('92px "Baby Chipmunk"'); await document.fonts.load('34px "Adorable Mother Script"'); await document.fonts.ready; });
  await g.waitForTimeout(500);
  await g.screenshot({ path: path.join(OUT, "feature-graphic.png"), type: "png" });
  console.log("externas:", reg.externas.length, "errores:", reg.errores.length);
  for (const e of [...new Set(reg.errores)]) console.log("  error:", String(e).slice(0, 200));
  await b.close();
  await H.b.close();
})();
