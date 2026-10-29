// Variante app: no debe haber enlaces comerciales ni salidas del juego. Revisa el DOM completo (incluidas las pantallas ocultas),
// el resultado de "Crea tu Chocolate" (donde la web ofrece WhatsApp) y que ningún clic llame a window.open.
// Uso: NODE_PATH=$(npm root -g) node scripts/qa/enlaces.cjs [url-base]   (en la web se espera lo contrario: sí hay enlaces)
const { abrir, nuevoPerfil, BASE } = require("./lib.cjs");
(async () => {
  const { b, p, reg } = await abrir({});
  await p.addInitScript(() => { window.__abiertas = []; const o = window.open; window.open = (...a) => { window.__abiertas.push(String(a[0])); return null; }; });
  await nuevoPerfil(p, "QA");
  const r = await p.evaluate(() => ({
    variante: document.documentElement.dataset.app === "1" ? "app" : "web",
    enlaces: [...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href")),
    blank: document.querySelectorAll('[target="_blank"]').length,
    formularios: [...document.querySelectorAll("form[action]")].map((f) => f.getAttribute("action")),
    iframes: [...document.querySelectorAll("iframe")].map((f) => f.getAttribute("src")),
    scripts: [...document.querySelectorAll("script[src]")].map((s) => s.getAttribute("src")),
    textoVisible: document.body.innerText.length,
    blaster: /blaster/i.test(document.body.innerHTML),
  }));
  // Crea tu Chocolate: resultado
  await p.locator(".game-card, #game-feature", { hasText: "Crea tu Chocolate" }).first().click();
  await p.waitForTimeout(1500);
  await p.click("#creador-btn-start").catch(() => {});
  await p.waitForTimeout(2500);
  // se salta la cocina (se termina al tiro) para llegar al resultado, que es donde la web ofrece WhatsApp
  await p.evaluate(() => { const g = window.__g3d.creador; g._create(); g.kitchen._finish(); });
  r.resultado = await p.evaluate(() => window.__g3d.creador.view);
  await p.waitForTimeout(800);
  r.botonWhatsapp = await p.evaluate(() => document.querySelectorAll(".btn-whatsapp").length);
  r.windowOpen = await p.evaluate(() => window.__abiertas);
  // el catálogo no debe listar Choco Blaster
  r.catalogo = await p.evaluate(async () => (await import("./js/games-catalog.js")).GAMES_CATALOG.map((g) => g.id));
  console.log(JSON.stringify(r, null, 1));
  const esApp = r.variante === "app";
  const bien = esApp
    ? r.enlaces.every((h) => h.startsWith("#") || h.startsWith("mailto:")) && r.blank === 0 && r.formularios.length === 0 && r.botonWhatsapp === 0 && r.windowOpen.length === 0 && !r.catalogo.includes("fps3d") && !r.blaster
    : true;
  console.log(esApp ? (bien ? "\nOK: la variante app no tiene enlaces ni botones comerciales" : "\nMAL: hay enlaces o botones que no deberían estar en la app") : "\n(variante web: solo informativo)");
  console.log("externas:", reg.externas.length, "errores:", reg.errores.length);
  await b.close();
  process.exit(bien && !reg.externas.length ? 0 : 1);
})();
