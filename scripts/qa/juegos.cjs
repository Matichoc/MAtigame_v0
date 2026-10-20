// Recorre TODOS los juegos del catálogo de la variante que se sirve: los abre, los inicia, juega unos segundos con el teclado y registra
// errores de consola, recursos que no cargan y cualquier petición fuera del origen (debe ser 0: el juego no usa internet).
// Un juego solo cuenta como OK si: la pantalla se abre, el botón de inicio funciona (el juego sale de la tarjeta de inicio), y las entradas del jugador
// cambian su estado (experimento controlado: primero se miden los campos que cambian solos con el tiempo y luego solo cuentan los que cambian por las entradas).
// Uso: NODE_PATH=$(npm root -g) node scripts/qa/juegos.cjs [url-base] [--sin-red] [--solo=id1,id2] [--autoprueba]
//   --autoprueba: rompe a propósito el inicio de un juego y comprueba que ESTE script lo detecta (debe salir con "autoprueba OK").
const fs = require("fs");
const { abrir, BASE } = require("./lib.cjs");
const OFFLINE = process.argv.includes("--sin-red"); // corta todo lo externo: el juego debe funcionar igual
const AUTOPRUEBA = process.argv.includes("--autoprueba");
const SOLO = AUTOPRUEBA ? ["tetris"] : (process.argv.find((a) => a.startsWith("--solo=")) || "").slice(7).split(",").filter(Boolean);
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
// Qué se hace con cada juego para provocar un cambio de estado: teclas y/o clics sobre el lienzo.
const ENTRADAS = {
  memoria: { clics: [[0.3, 0.4], [0.6, 0.4], [0.45, 0.6]] },
  dulces: { clics: [[0.4, 0.5], [0.5, 0.5], [0.6, 0.5]] },
  merge: { clics: [[0.4, 0.5], [0.5, 0.55]], arrastres: [[[0.3, 0.5], [0.5, 0.5]]] },
  creador: { arrastres: [[[0.3, 0.5], [0.6, 0.5]]], teclas: [] },
  porristas: { teclas: ["ArrowRight", "ArrowRight", "ArrowRight", "ArrowRight"] },
  tetris: { teclas: ["ArrowLeft", "ArrowUp", "ArrowRight", "Space"] },
  basquet_tiros: { teclas: ["Space", "Space"] },
  futbol: { teclas: ["ArrowLeft", "Space", "ArrowRight"] },
};
const TECLAS_POR_DEFECTO = ["ArrowRight", "ArrowUp", "Space", "ArrowLeft", "ArrowUp", "ArrowRight", "ArrowDown", "Space"];

/** Firma numérica del estado del juego (campos simples de la instancia, 2 niveles), sin objetos de three.js ni del DOM. */
const FIRMA = (id) => {
  const g = window.__g3d && window.__g3d[id];
  if (!g) return null;
  const out = {};
  const seen = new Set();
  let n = 0;
  const IGNORAR = /^(els|progress|scene|camera|renderer|q|keys|joy|stick|character|look|pointer|mouse|input|particles|popups|hero|course|composer|canvas|ctx)$/;
  const walk = (o, pfx, d) => {
    if (!o || typeof o !== "object" || seen.has(o) || n > 900) return;
    seen.add(o);
    if (o.isObject3D || o.isMaterial || o.isBufferGeometry || o.isTexture || o instanceof Element || o.isWebGLRenderer) return;
    for (const k of Object.keys(o)) {
      if (d === 0 && IGNORAR.test(k)) continue;
      let v;
      try { v = o[k]; } catch (e) { continue; }
      if (typeof v === "number" && Number.isFinite(v)) { out[pfx + k] = Math.round(v * 1000) / 1000; n++; }
      else if (typeof v === "boolean" || (typeof v === "string" && v.length < 24)) { out[pfx + k] = v; n++; }
      else if (v && typeof v === "object") {
        if (v.isVector3) { out[pfx + k] = `${Math.round(v.x * 100) / 100},${Math.round(v.y * 100) / 100},${Math.round(v.z * 100) / 100}`; n++; }
        else if (Array.isArray(v)) { out[pfx + k + "[]"] = v.length; n++; }
        else if (d < 2) walk(v, pfx + k + ".", d + 1);
      }
    }
  };
  walk(g, "", 0);
  out.__estado = g.state;
  return out;
};
const cambios = (a, b) => Object.keys(b || {}).filter((k) => !a || a[k] !== b[k]);

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
      if (!ini || !(await p.$(ini))) r.sinInicio = true;
      else {
        if (AUTOPRUEBA && g.id === "tetris") await p.evaluate((sel) => { const b = document.querySelector(sel); b.replaceWith(b.cloneNode(true)); }, ini); // el clon no conserva los eventos: el inicio "no hace nada"
        await p.click(ini, { timeout: 5000 }).catch(() => { r.sinInicio = true; });
      }
      await p.waitForTimeout(1500);
      // ¿salió de la tarjeta de inicio? (el botón desaparece o el juego queda en "playing")
      r.estadoTrasInicio = await p.evaluate((id) => (window.__g3d && window.__g3d[id] ? window.__g3d[id].state : null), g.id);
      r.botonOculto = ini ? !(await p.isVisible(ini).catch(() => false)) : false;
      r.iniciado = !r.sinInicio && (r.estadoTrasInicio === "playing" || r.botonOculto);
      // experimento controlado: campos que cambian solos (control) frente a los que cambian por las entradas
      const f0 = await p.evaluate(FIRMA, g.id);
      await p.waitForTimeout(900);
      const f1 = await p.evaluate(FIRMA, g.id);
      const solos = new Set(cambios(f0, f1));
      const ent = ENTRADAS[g.id] || {};
      const box = await p.evaluate((s) => { const c = document.querySelector(`${s} canvas`); if (!c) return null; const r = c.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; }, pant);
      for (const t of ent.teclas || TECLAS_POR_DEFECTO) { await p.keyboard.down(t); await p.waitForTimeout(160); await p.keyboard.up(t); await p.waitForTimeout(80); }
      if (box) {
        for (const [fx, fy] of ent.clics || []) { await p.mouse.click(box.x + box.w * fx, box.y + box.h * fy); await p.waitForTimeout(250); }
        for (const [[ax, ay], [bx, by]] of ent.arrastres || []) { await p.mouse.move(box.x + box.w * ax, box.y + box.h * ay); await p.mouse.down(); await p.mouse.move(box.x + box.w * bx, box.y + box.h * by, { steps: 8 }); await p.mouse.up(); await p.waitForTimeout(250); }
      }
      await p.waitForTimeout(900);
      const f2 = await p.evaluate(FIRMA, g.id);
      r.camposPorEntrada = cambios(f1, f2).filter((k) => !solos.has(k)).slice(0, 8);
      r.respondeAEntrada = r.camposPorEntrada.length > 0;
      await p.screenshot({ path: `${OUT}/${g.id}.png` });
    } catch (err) { r.fallo = String(err.message).split("\n")[0]; }
    r.errores = reg.errores.slice(e0); r.fallidas = reg.fallidas.slice(f0); r.externas = reg.externas.slice(x0);
    r.ok = !r.fallo && r.pantalla && r.iniciado && r.respondeAEntrada && !r.errores.length && !r.fallidas.length && !r.externas.length;
    salida.juegos[g.id] = r;
    console.log(`${r.ok ? "OK " : "MAL"} ${g.id}${r.fallo ? " · " + r.fallo : ""}${r.sinInicio ? " · el inicio falló" : ""}${!r.iniciado ? " · no salió de la tarjeta de inicio" : ""}${r.iniciado && !r.respondeAEntrada ? " · sin respuesta a las entradas" : ""}${r.errores.length ? " · errores: " + r.errores[0].slice(0, 120) : ""} · campos por entrada: ${(r.camposPorEntrada || []).slice(0, 3).join(", ") || "ninguno"}`);
  }
  salida.peticionesExternas = reg.externas;
  salida.totalPeticiones = reg.peticiones.length;
  const probados = Object.keys(salida.juegos);
  const esperados = SOLO.length ? SOLO : catalogo.map((g) => g.id);
  // una corrida vacía o incompleta NO es un éxito (p. ej. --solo con un id que no existe)
  salida.completa = esperados.length > 0 && esperados.every((id) => probados.includes(id)) && probados.length === esperados.length;
  salida.ok = salida.completa && Object.values(salida.juegos).every((x) => x.ok) && !reg.externas.length;
  fs.writeFileSync(`${OUT}/resultado.json`, JSON.stringify(salida, null, 1));
  console.log(`\n${salida.variante}${OFFLINE ? " SIN RED" : ""}: ${Object.values(salida.juegos).filter((x) => x.ok).length}/${probados.length} juegos OK (esperados: ${esperados.length}${salida.completa ? "" : " · CORRIDA INCOMPLETA"}) · peticiones externas: ${reg.externas.length} · detalle: ${OUT}/resultado.json`);
  await b.close();
  if (AUTOPRUEBA) {
    const t = salida.juegos.tetris;
    const detectado = !!t && !t.ok && !t.iniciado;
    console.log(detectado ? "autoprueba OK: con el inicio roto a propósito, el script marcó el juego como fallido." : "autoprueba MAL: el script NO detectó un inicio roto.");
    process.exit(detectado ? 0 : 1);
  }
  process.exit(salida.ok ? 0 : 1);
})();
