// Pantalla de carga de temporada (js/season-art.js + js/splash.js) con el calendario de js/events.js.
// Las fechas se simulan con el reloj de Playwright SOLO dentro de la página (no se toca el reloj del equipo),
// en hora de Chile (las fechas llevan su desfase: -03:00 en horario de verano, -04:00 en invierno). Uso: node scripts/qa/temporada.cjs [url]   (sale con código 1 si algo no cumple)
const { chromium } = require("playwright");
const fs = require("fs");
const BASE = process.argv[2] || process.env.QA_URL || "http://127.0.0.1:8091/";
const ORIGEN = new URL(BASE).origin;
const OUT = process.env.QA_OUT || "/tmp/qa-temporada";
fs.mkdirSync(OUT, { recursive: true });
const CHROMIUM = process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium";

const fallos = [];
const ok = (cond, texto) => { console.log(`${cond ? "OK " : "MAL"} ${texto}`); if (!cond) fallos.push(texto); };

(async () => {
  const b = await chromium.launch({ executablePath: CHROMIUM, args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });

  /** Abre la app en una fecha dada (hora local de Chile) y devuelve la página y el registro de red. */
  async function abrirEn(fecha, { query = "", viewport = { width: 390, height: 844 }, sinRed = false, abortar = null, touch = true } = {}) {
    const ctx = await b.newContext({ viewport, timezoneId: "America/Santiago", hasTouch: touch, isMobile: touch && viewport.width < 900, deviceScaleFactor: 1 });
    if (sinRed) await ctx.route("**/*", (r) => (r.request().url().startsWith(ORIGEN) || /^(data|blob|about):/.test(r.request().url()) ? r.continue() : r.abort("internetdisconnected")));
    if (abortar) await ctx.route(abortar, (r) => r.abort("failed"));
    const p = await ctx.newPage();
    const reg = { temporada: [], externas: [], errores: [] };
    p.on("request", (r) => { const u = r.url(); if (u.includes("/assets/temporadas/")) reg.temporada.push(u); if (!u.startsWith(ORIGEN) && !/^(data|blob|about):/.test(u)) reg.externas.push(u); });
    p.on("pageerror", (e) => reg.errores.push(e.message));
    p.on("console", (m) => { if (m.type() === "error" && !/net::ERR_FAILED|sandboxed and the 'allow-scripts'/.test(m.text())) reg.errores.push(m.text()); }); // el iframe legal es sandbox="" a propósito: ese aviso de Chromium ya existía
    await p.clock.install({ time: new Date(fecha) });
    await p.clock.pauseAt(new Date(Date.parse(fecha) + 1)); // el reloj simulado solo avanza cuando la prueba lo pide (runFor)
    await p.clock.pauseAt(new Date(Date.parse(fecha) + 1)); // el reloj simulado solo avanza cuando la prueba lo pide (runFor)
    await p.goto(BASE + query, { waitUntil: "load" });
    return { ctx, p, reg };
  }
  const estado = (p) => p.evaluate(() => {
    const s = document.getElementById("splash");
    const art = s.querySelector(".sp-season-art");
    return {
      season: s.classList.contains("season"), id: s.dataset.season || null, gone: s.classList.contains("gone"), out: s.classList.contains("out"),
      artOk: !!art && art.naturalWidth > 0 && !s.querySelector(".sp-season").hidden,
      logo: s.querySelector(".sp-logo img").getAttribute("src"),
      texto: s.querySelector(".sp-loading-text").textContent, ready: s.classList.contains("ready"),
    };
  });
  const esperar = async (p, ms) => { await p.clock.runFor(ms); await p.waitForTimeout(50); };

  // 1) Halloween activo por fecha real del calendario (25-oct, hora de Chile): pantallas en 4 formatos
  const formatos = [["telefono-vertical", { width: 390, height: 844 }], ["telefono-horizontal", { width: 844, height: 390 }], ["tablet-vertical", { width: 820, height: 1180 }], ["tablet-horizontal", { width: 1180, height: 820 }]];
  for (const [nombre, vp] of formatos) {
    const { ctx, p, reg } = await abrirEn("2026-10-25T12:00:00-03:00", { viewport: vp, touch: vp.width < 900 || nombre.startsWith("tablet") });
    await esperar(p, 1700);
    const e = await estado(p);
    await p.waitForTimeout(2600); // las animaciones CSS del sello corren en tiempo real (el reloj simulado solo mueve los temporizadores)
    await p.screenshot({ path: `${OUT}/carga-halloween-${nombre}.png` });
    // el arte y los textos deben quedar dentro de la pantalla (zona segura)
    const dentro = await p.evaluate(() => {
      const W = innerWidth, H = innerHeight;
      return [".sp-season-art", ".sp-logo", ".sp-tag", ".sp-loading"].every((sel) => { const r = document.querySelector(`#splash ${sel}`).getBoundingClientRect(); return r.width > 0 && r.left >= -1 && r.top >= -1 && r.right <= W + 1 && r.bottom <= H + 1; });
    });
    ok(e.season && e.id === "halloween" && e.artOk, `${nombre}: Halloween activo → pantalla de carga con el arte de temporada`);
    ok(dentro, `${nombre}: arte, logo, nombre e indicador de carga caben en la pantalla`);
    ok(e.logo === "assets/brand/logo-badge.png", `${nombre}: el logo es el archivo original (${e.logo})`);
    await ctx.close();
  }

  // 2) indicador de carga real: "Cargando…" hasta que el juego arranca; luego "¡Listo!" y se va al cumplir el tiempo
  {
    const { ctx, p, reg } = await abrirEn("2026-10-25T12:00:00-03:00");
    const antes = await p.evaluate(() => getComputedStyle(document.querySelector("#splash .sp-loading")).display !== "none");
    ok(antes, "el indicador de carga está visible desde el comienzo");
    await esperar(p, 1000);
    const e1 = await estado(p);
    ok(e1.ready && e1.texto === "¡Listo!", `cuando el juego ya arrancó dice "${e1.texto}" (no hay porcentajes inventados)`);
    await esperar(p, 4000);
    const e2 = await estado(p);
    ok(e2.gone, "la pantalla de carga se va sola después del sello");
    ok(reg.errores.length === 0, `sin errores (${reg.errores[0] || ""})`);
    await ctx.close();
  }

  // 3) sin evento (1-jul): arte habitual, y solo se piden sus imágenes (no las de otras temporadas)
  {
    const { ctx, p, reg } = await abrirEn("2026-07-01T12:00:00-04:00");
    await esperar(p, 1700);
    const e = await estado(p);
    await p.waitForTimeout(2600);
    await p.screenshot({ path: `${OUT}/carga-sin-evento.png` });
    ok(e.season && e.id === "habitual" && e.artOk && reg.temporada.every((u) => u.includes("/temporadas/habitual/")), `sin evento: arte habitual y solo se piden sus imágenes (${reg.temporada.length})`);
    await ctx.close();
  }

  // 4) cada evento del calendario muestra su propio arte (fechas reales de js/events.js, hora de Chile)
  for (const [id, fecha] of [["sanvalentin", "2027-02-10T12:00:00-03:00"], ["pascua", "2027-03-25T12:00:00-03:00"], ["dianino", "2026-08-10T12:00:00-04:00"], ["patrias", "2026-09-15T12:00:00-03:00"], ["navidad", "2026-12-10T12:00:00-03:00"]]) {
    const { ctx, p, reg } = await abrirEn(fecha);
    await esperar(p, 1700);
    const e = await estado(p);
    const ev = await p.evaluate(async () => (await import("./js/events.js")).activeEvent()?.id);
    await p.waitForTimeout(2600);
    await p.screenshot({ path: `${OUT}/carga-${id}.png` });
    ok(ev === id && e.season && e.id === id && e.artOk && reg.temporada.every((u) => u.includes(`/temporadas/${id}/`)), `${id} (${fecha.slice(0, 10)}): su propio arte, sin pedir imágenes de otras temporadas`);
    await ctx.close();
  }
  // 4b) un evento sin arte propio usa el habitual (se prueba la regla directo: hoy todos los eventos tienen arte)
  {
    const { ctx, p } = await abrirEn("2026-07-01T12:00:00-04:00");
    const r = await p.evaluate(async () => (await import("./js/season-art.js")).seasonArt({ id: "evento-sin-arte", name: "Prueba" }).id);
    ok(r === "habitual", `evento sin imagen propia → arte habitual (${r})`);
    await ctx.close();
  }

  // 5) forzar un evento para probar (mecanismo existente ?event=): Halloween en julio
  {
    const { ctx, p } = await abrirEn("2026-07-01T12:00:00-04:00", { query: "?event=halloween" });
    await esperar(p, 1700);
    const e = await estado(p);
    ok(e.season && e.id === "halloween", "?event=halloween fuerza el arte de Halloween fuera de fecha");
    await ctx.close();
    const r2 = await abrirEn("2026-10-25T12:00:00-03:00", { query: "?event=noexiste" });
    await esperar(r2.p, 1700);
    ok((await estado(r2.p)).id === "halloween", "?event con un nombre que no existe se ignora (manda la fecha)");
    await r2.ctx.close();
  }

  // 6) cambio de temporada con la app abierta: 2-nov 23:50 (Halloween) → vuelve 25 minutos después, ya 3-nov (sin evento)
  {
    const { ctx, p } = await abrirEn("2026-11-02T23:50:00-03:00");
    await esperar(p, 1700);
    const e1 = await estado(p);
    await esperar(p, 5000);
    await p.evaluate(() => { Object.defineProperty(document, "visibilityState", { configurable: true, get: () => "hidden" }); document.dispatchEvent(new Event("visibilitychange")); });
    await p.clock.runFor(25 * 60 * 1000);
    await p.evaluate(() => { Object.defineProperty(document, "visibilityState", { configurable: true, get: () => "visible" }); document.dispatchEvent(new Event("visibilitychange")); });
    await esperar(p, 1700);
    const e2 = await estado(p);
    ok(e1.id === "halloween" && !e2.gone && e2.id === "habitual", `transición: el 2-nov a las 23:50 había arte de Halloween; al volver el 3-nov 00:15 se ve el habitual`);
    await ctx.close();
  }

  // 7) sin internet: todo es local
  {
    const { ctx, p, reg } = await abrirEn("2026-10-25T12:00:00-03:00", { sinRed: true });
    await esperar(p, 1700);
    const e = await estado(p);
    ok(e.season && e.artOk && reg.externas.length === 0, `sin internet: arte de temporada OK y 0 peticiones externas (${reg.externas.length})`);
    await ctx.close();
  }

  // 8) si la imagen no carga: sello habitual y la pantalla se va igual
  {
    const { ctx, p } = await abrirEn("2026-10-25T12:00:00-03:00", { abortar: "**/assets/temporadas/**" });
    await esperar(p, 1700);
    const e1 = await estado(p);
    await esperar(p, 5000);
    const e2 = await estado(p);
    ok(!e1.season && e2.gone, "si la imagen de temporada falla, se ve el sello habitual y la app sigue");
    await ctx.close();
  }

  // 9) el progreso se conserva: perfil creado en Halloween sigue después de cerrar y abrir (y sin evento)
  {
    const { ctx, p } = await abrirEn("2026-10-25T12:00:00-03:00", { query: "" });
    await esperar(p, 6000);
    await p.evaluate(() => localStorage.clear());
    await p.reload({ waitUntil: "load" });
    await esperar(p, 6000);
    await p.click("#profile-grid .add-profile");
    await p.fill("#new-profile-name", "Tina");
    await p.click("#btn-create-profile");
    await esperar(p, 500);
    await p.click("#character-grid .character-card:nth-child(2)");
    await esperar(p, 800);
    const antes = await p.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith("matichoc_")).length);
    await p.clock.setSystemTime(new Date("2026-11-10T12:00:00-03:00"));
    await p.reload({ waitUntil: "load" });
    await esperar(p, 6000);
    const despues = await p.evaluate(() => ({ claves: Object.keys(localStorage).filter((k) => k.startsWith("matichoc_")).length, nombre: document.body.innerText.includes("Tina") }));
    ok(antes > 0 && despues.claves === antes && despues.nombre, `el perfil "Tina" se conserva al reabrir fuera de la temporada (${antes} → ${despues.claves} claves)`);
    await ctx.close();
  }

  await b.close();
  console.log(fallos.length ? `\nFALLAN ${fallos.length}` : "\nTodo OK");
  process.exit(fallos.length ? 1 : 0);
})();
