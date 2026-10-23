// Botón "atrás" del celular en la app: se simula el plugin de Capacitor (en el navegador no existe) y se comprueba qué hace cada pulsación.
// Uso: node scripts/qa/atras.cjs [url-de-la-app]   (sale con código 1 si algo no cumple)
const { abrir, BASE, nuevoPerfil } = require("./lib.cjs");

(async () => {
  const { b, p, reg } = await abrir({});
  // puente nativo falso, con la misma forma que el que Android inyecta (native-bridge.js de Capacitor 8):
  // window.Capacitor.addListener(plugin, evento, cb), nativeCallback(plugin, método, opciones) y PluginHeaders.
  // OJO: NO trae registerPlugin (eso es de @capacitor/core, que esta app no empaqueta); la versión anterior de esta
  // prueba lo simulaba y por eso pasó aunque en el celular el botón no funcionaba.
  await p.addInitScript(() => {
    window.__salidas = 0;
    window.Capacitor = {
      isNativePlatform: () => true,
      PluginHeaders: [{ name: "App", methods: [{ name: "exitApp" }, { name: "addListener" }] }],
      addListener: (plugin, nombre, cb) => { if (plugin === "App" && nombre === "backButton") window.__atras = cb; return { remove() {} }; },
      nativeCallback: (plugin, metodo) => { if (plugin === "App" && metodo === "exitApp") window.__salidas++; },
    };
  });
  const fallos = [];
  const ok = (cond, texto) => { console.log(`${cond ? "OK " : "MAL"} ${texto}`); if (!cond) fallos.push(texto); };
  await nuevoPerfil(p);
  await p.waitForSelector("#screen-hub:not(.hidden)", { timeout: 15000 });
  const atras = () => p.evaluate(() => window.__atras && window.__atras());
  const visible = (sel) => p.evaluate((s) => { const e = document.querySelector(s); return !!e && !e.classList.contains("hidden"); }, sel);
  const toast = () => p.evaluate(() => { const t = document.getElementById("toast"); return t && !t.classList.contains("hidden") ? t.textContent : ""; });
  const salidas = () => p.evaluate(() => window.__salidas);

  ok(await p.evaluate(() => typeof window.__atras === "function"), "la app registra el botón atrás");
  // menú: 1.ª pulsación avisa, no sale; 2.ª sale
  await atras();
  ok(/otra vez para salir/i.test(await toast()) && (await salidas()) === 0, "menú: la primera pulsación avisa y no sale");
  await atras();
  ok((await salidas()) === 1, "menú: la segunda pulsación seguida sale de la app");
  // el aviso caduca: una pulsación tardía vuelve a avisar
  await p.waitForTimeout(2300);
  await atras();
  ok((await salidas()) === 1, "menú: tras 2 s sin tocar, vuelve a avisar en vez de salir");
  await p.waitForTimeout(2300);
  // pantalla interna: vuelve al menú
  await p.click("#btn-open-shop").catch(async () => { await p.evaluate(() => document.getElementById("btn-open-shop")?.click()); });
  await p.waitForTimeout(300);
  ok(await visible("#screen-shop"), "se abrió la tienda");
  await atras();
  ok(await visible("#screen-hub") && !(await visible("#screen-shop")), "tienda: atrás vuelve al menú");
  // cuadro de privacidad: lo cierra
  await p.evaluate(() => document.querySelector(".legal-open").click());
  await p.waitForTimeout(300);
  ok(await visible("#legal-dialog"), "se abrió Privacidad");
  await atras();
  ok(!(await visible("#legal-dialog")) && await visible("#screen-hub"), "Privacidad: atrás la cierra y se queda en el menú");
  // toques directos (las tarjetas del menú se animan y Playwright espera a que se queden quietas)
  const tocar = (sel) => p.evaluate((s) => document.querySelector(s).click(), sel);
  const tocarJuego = (nombre) => p.evaluate((n) => [...document.querySelectorAll(".game-card")].find((c) => c.textContent.includes(n)).click(), nombre);
  // todos los cuadros (.modal) tienen su botón de cierre marcado con data-back (así ninguno nuevo se queda sin "atrás")
  const sinCierre = await p.evaluate(() => [...document.querySelectorAll(".modal")].filter((m) => m.querySelectorAll("[data-back]").length !== 1).map((m) => m.id));
  ok(sinCierre.length === 0, `cada cuadro tiene un solo botón de cierre data-back (${sinCierre.join(", ") || "todos"})`);
  // Energía, Calendario y Canje: atrás corre su propio cierre y se pueden volver a abrir (el estado interno quedó bien)
  for (const [nombre, abrir, cuadro] of [["Energía", () => tocar("#btn-energy"), "#energy-dialog"], ["Calendario", () => tocar("#btn-daily-reward"), "#calendar-dialog"], ["Canje de un juego bloqueado", () => tocarJuego("Fútbol"), "#unlock-dialog"]]) {
    await abrir();
    await p.waitForTimeout(300);
    const abierto = await visible(cuadro);
    await atras();
    await p.waitForTimeout(200);
    const cerrado = !(await visible(cuadro));
    await abrir();
    await p.waitForTimeout(300);
    const reabre = await visible(cuadro);
    await atras();
    await p.waitForTimeout(200);
    ok(abierto && cerrado && reabre && !(await visible(cuadro)) && await visible("#screen-hub") && (await salidas()) === 1, `${nombre}: atrás cierra el cuadro, se puede volver a abrir y no sale de la app`);
  }
  // juego: avisa, y con otra pulsación vuelve al menú
  await p.locator(".game-card", { hasText: "Bloques" }).first().click();
  await p.waitForTimeout(1500);
  ok(await visible("#screen-tetris"), "se abrió Bloques");
  await p.waitForTimeout(2300);
  await atras();
  ok(/volver al menú/i.test(await toast()) && await visible("#screen-tetris"), "juego: la primera pulsación avisa y sigue en el juego");
  await atras();
  await p.waitForTimeout(400);
  ok(await visible("#screen-hub") && !(await visible("#screen-tetris")), "juego: la segunda pulsación vuelve al menú");
  // pantalla de la aventura, cuadro "Mi personaje y mis espacios" y un partido nuevo (Pichanga)
  // la primera vez, «Continuar mi aventura» abre la viñeta del festival: atrás la cierra
  await tocar("#btn-path-adventure");
  await p.waitForTimeout(300);
  ok(await visible("#adv-intro"), "se abrió la viñeta de la aventura");
  await atras();
  ok(!(await visible("#adv-intro")) && await visible("#screen-hub"), "viñeta: atrás la cierra y queda en el menú");
  // «Mis lugares y copas» (pantalla de la aventura): atrás vuelve al menú
  await tocar("#btn-path-me");
  await p.waitForTimeout(200);
  await tocar("#me-town");
  await p.waitForTimeout(300);
  ok(await visible("#screen-adventure"), "se abrió la aventura");
  await atras();
  ok(await visible("#screen-hub") && !(await visible("#screen-adventure")), "aventura: atrás vuelve al menú");
  await tocar("#btn-path-me");
  await p.waitForTimeout(200);
  await atras();
  ok(!(await visible("#me-dialog")) && await visible("#screen-hub"), "Mi personaje y mis espacios: atrás cierra el cuadro");
  await tocar("#futbol-btn-pichanga");
  await p.waitForFunction(() => document.getElementById("screen-pichanga") && !document.getElementById("screen-pichanga").classList.contains("hidden"), null, { timeout: 30000 });
  await p.waitForTimeout(2300);
  await atras();
  ok(/volver al menú/i.test(await toast()) && await visible("#screen-pichanga"), "pichanga: la primera pulsación avisa y sigue en el partido");
  await atras();
  await p.waitForTimeout(400);
  ok(await visible("#screen-hub") && !(await visible("#screen-pichanga")), "pichanga: la segunda pulsación vuelve al menú");
  ok((await salidas()) === 1, "ninguna pulsación en juego o pantallas internas cerró la app");
  ok(reg.errores.length === 0 && reg.externas.length === 0, `0 errores de consola (${reg.errores.length}) y 0 peticiones externas (${reg.externas.length})`);
  await b.close();
  console.log(fallos.length ? `\nFALLAN ${fallos.length}` : "\nTodo OK");
  process.exit(fallos.length ? 1 : 0);
})();
