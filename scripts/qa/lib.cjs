// Utilidades comunes de las pruebas de navegador (Playwright + Chromium; WebGL por software con SwiftShader).
// Uso: NODE_PATH=$(npm root -g) node scripts/qa/<prueba>.cjs [url-base]   (por defecto http://127.0.0.1:8091/)
const { chromium } = require("playwright");
const BASE = process.argv[2] || process.env.QA_URL || "http://127.0.0.1:8091/";
const ORIGEN = new URL(BASE).origin;
const CHROMIUM = process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium";

/** Abre el navegador y registra TODA petición de red y todo error de consola/página. */
async function abrir({ viewport = { width: 1000, height: 640 }, offline = false, touch = false, dsf = 1, sinRed = false } = {}) {
  const b = await chromium.launch({ executablePath: CHROMIUM, args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
  const ctx = await b.newContext({ viewport, hasTouch: touch, isMobile: touch, offline, deviceScaleFactor: dsf });
  // sinRed: se corta TODO lo que no sea el propio servidor de la prueba (simula "sin internet" sin tumbar la carga de la página)
  if (sinRed) await ctx.route("**/*", (r) => (r.request().url().startsWith(ORIGEN) || /^(data|blob|about):/.test(r.request().url()) ? r.continue() : r.abort("internetdisconnected")));
  const p = await ctx.newPage();
  const reg = { peticiones: [], externas: [], errores: [], fallidas: [] };
  p.on("request", (r) => {
    const u = r.url();
    reg.peticiones.push(u);
    if (!u.startsWith(ORIGEN) && !u.startsWith("data:") && !u.startsWith("blob:") && !u.startsWith("about:")) reg.externas.push(u);
  });
  p.on("requestfailed", (r) => reg.fallidas.push(`${r.url()} (${r.failure() && r.failure().errorText})`));
  p.on("response", (r) => { if (r.status() >= 400) reg.fallidas.push(`${r.url()} → HTTP ${r.status()}`); });
  p.on("pageerror", (e) => reg.errores.push("pageerror: " + e.message));
  p.on("console", (m) => { if (m.type() === "error") reg.errores.push("console: " + m.text()); });
  p.on("dialog", (d) => d.accept());
  return { b, ctx, p, reg };
}

/** Crea un perfil nuevo ("Apodo") y elige el segundo personaje, dejando el menú principal listo. */
async function nuevoPerfil(p, nombre = "QA") {
  await p.goto(BASE + "?debug3d", { waitUntil: "networkidle" });
  await p.evaluate(() => localStorage.clear());
  await p.reload({ waitUntil: "networkidle" });
  await p.click("#profile-grid .add-profile");
  await p.fill("#new-profile-name", nombre);
  await p.click("#btn-create-profile");
  await p.waitForTimeout(300);
  await p.click("#character-grid .character-card:nth-child(2)");
  await p.waitForTimeout(800);
}

module.exports = { abrir, nuevoPerfil, BASE, ORIGEN };
