// Recorre TODOS los juegos del catálogo de la variante que se sirve: los abre, los inicia, juega unos segundos con el teclado y registra
// errores de consola, recursos que no cargan y cualquier petición fuera del origen (debe ser 0: el juego no usa internet).
// Uso: NODE_PATH=$(npm root -g) node scripts/qa/juegos.cjs [url-base] [--sin-red] [--solo=id1,id2]
const fs = require("fs");
const { abrir, BASE } = require("./lib.cjs");
const OFFLINE = process.argv.includes("--sin-red"); // corta todo lo externo: el juego debe funcionar igual
const SOLO = (process.argv.find((a) => a.startsWith("--solo=")) || "").slice(7).split(",").filter(Boolean);
const OUT = process.env.QA_OUT || "/tmp/qa-juegos";
fs.mkdirSync(OUT, { recursive: true });
// selector del botón de inicio de cada juego (ids del template)
const INICIO = {
  town: "#town-btn-start", recolecta: "#screen-recolecta [data-action=begin]", parkour: "#parkour-btn-campaign", salto: "#salto-btn-start", autos: "#autos-btn-start",
  tetris: "#tetris-btn-start", memoria: "#memoria-btn-start", basquet_tiros: "#basquet-btn-start", porristas: "#porristas-btn-start", futbol: "#futbol-btn-start",
  dulces: "#dulces-btn-start", ciudad: "#ciudad-btn-start", merge: "#merge-btn-start", aventura: "#aventura-btn-start", creador: "#creador-btn-start",
};
const PANTALLA = { basquet_tiros: "basquet" };

async function perfil(p) {
  // perfil con monedas y juegos canjeados (para poder abrir los que están con candado)
  await p.goto(BASE + "?debug3d", { waitUntil: "networkidle" });
  await p.evaluate(() => localStorage.clear());
  await p.reload({ waitUntil: "networkidle" });
  await p.click("#profile-grid .add-profile");
  await p.fill("#new-profile-name", "QA");
  await p.click("#btn-create-profile");
  await p.waitForTimeout(300);
  await p.click("#character-grid .character-card:nth-child(2)");
  await p.waitForTimeout(800);
  await p.evaluate(() => {
    for (const k of Object.keys(localStorage)) if (k.includes("profile_")) {
      try { const o = JSON.parse(localStorage.getItem(k)); if (o && typeof o.coins === "number") { o.coins = 5000; o.unlockedGames = ["futbol", "dulces", "aventura", "ciudad"]; localStorage.setItem(k, JSON.stringify(o)); } } catch (e) { /* no es un perfil */ }
    }
  });
}
async function alMenu(p) {
  await p.goto(BASE + "?debug3d", { waitUntil: "networkidle" });
  await p.waitForTimeout(700);
  const prof = await p.$("#profile-grid .profile-card");
  if (prof) { await prof.click(); await p.waitForTimeout(500); }
  if (await p.$("#character-grid .character-card")) { await p.click("#character-grid .character-card:nth-child(2)"); await p.waitForTimeout(800); }
}

(async () => {
  const { b, p, reg } = await abrir({ sinRed: OFFLINE });
  await perfil(p);
  await alMenu(p);
  const catalogo = await p.evaluate(async () => (await import("./js/games-catalog.js")).GAMES_CATALOG.map((g) => ({ id: g.id, name: g.name, status: g.status })));
  const salida = { variante: await p.evaluate(() => (document.documentElement.dataset.app === "1" ? "app" : "web")), offline: OFFLINE, total: catalogo.length, juegos: {} };
  for (const g of catalogo) {
    if (SOLO.length && !SOLO.includes(g.id)) continue;
    const r = { nombre: g.name, estado: g.status };
    const e0 = reg.errores.length, f0 = reg.fallidas.length, x0 = reg.externas.length;
    try {
      await alMenu(p);
      await p.locator(".game-card, #game-feature", { hasText: g.name }).first().click({ timeout: 8000 });
      await p.waitForTimeout(1800);
      const pant = `#screen-${PANTALLA[g.id] || g.id}`;
      r.pantalla = await p.evaluate((s) => { const el = document.querySelector(s); return !!el && !el.classList.contains("hidden"); }, pant);
      r.canvas = await p.evaluate((s) => { const c = document.querySelector(`${s} canvas`); return c ? [c.width, c.height] : null; }, pant);
      const ini = INICIO[g.id];
      if (ini && (await p.$(ini))) { await p.click(ini, { timeout: 5000 }).catch(() => { r.sinInicio = true; }); }
      await p.waitForTimeout(1500);
      for (let i = 0; i < 12; i++) { await p.keyboard.press(["ArrowRight", "ArrowUp", "Space", "ArrowLeft", "ArrowDown"][i % 5]); await p.waitForTimeout(120); }
      await p.waitForTimeout(1500);
      await p.screenshot({ path: `${OUT}/${g.id}.png` });
    } catch (err) { r.fallo = String(err.message).split("\n")[0]; }
    r.errores = reg.errores.slice(e0); r.fallidas = reg.fallidas.slice(f0); r.externas = reg.externas.slice(x0);
    r.ok = !r.fallo && r.pantalla && !r.errores.length && !r.fallidas.length && !r.externas.length;
    salida.juegos[g.id] = r;
    console.log(`${r.ok ? "OK " : "MAL"} ${g.id}${r.fallo ? " · " + r.fallo : ""}${r.errores.length ? " · errores: " + r.errores[0].slice(0, 120) : ""}`);
  }
  salida.peticionesExternas = reg.externas;
  salida.totalPeticiones = reg.peticiones.length;
  salida.ok = Object.values(salida.juegos).every((x) => x.ok) && !reg.externas.length;
  fs.writeFileSync(`${OUT}/resultado.json`, JSON.stringify(salida, null, 1));
  console.log(`\n${salida.variante}${OFFLINE ? " SIN RED" : ""}: ${Object.values(salida.juegos).filter((x) => x.ok).length}/${Object.keys(salida.juegos).length} juegos OK · peticiones externas: ${reg.externas.length} · detalle: ${OUT}/resultado.json`);
  await b.close();
  process.exit(salida.ok ? 0 : 1);
})();
