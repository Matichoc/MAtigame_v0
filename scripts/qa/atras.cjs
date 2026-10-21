// Botón "atrás" del celular en la app: se simula el plugin de Capacitor (en el navegador no existe) y se comprueba qué hace cada pulsación.
// Uso: node scripts/qa/atras.cjs [url-de-la-app]   (sale con código 1 si algo no cumple)
const { abrir, BASE, nuevoPerfil } = require("./lib.cjs");

(async () => {
  const { b, p, reg } = await abrir({});
  // plugin falso: guarda el callback y cuenta las salidas de la app
  await p.addInitScript(() => {
    window.__salidas = 0;
    window.Capacitor = {
      isNativePlatform: () => true,
      registerPlugin: () => ({
        addListener: (nombre, cb) => { if (nombre === "backButton") window.__atras = cb; return Promise.resolve({ remove() {} }); },
        exitApp: () => { window.__salidas++; },
      }),
    };
  });
  const fallos = [];
  const ok = (cond, texto) => { console.log(`${cond ? "OK " : "MAL"} ${texto}`); if (!cond) fallos.push(texto); };
  await nuevoPerfil(p);
  await p.waitForSelector("#screen-hub:not(.hidden)", { timeout: 15000 });
  const atras = () => p.evaluate(() => window.__atras());
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
  ok((await salidas()) === 1, "ninguna pulsación en juego o pantallas internas cerró la app");
  ok(reg.errores.length === 0 && reg.externas.length === 0, `0 errores de consola (${reg.errores.length}) y 0 peticiones externas (${reg.externas.length})`);
  await b.close();
  console.log(fallos.length ? `\nFALLAN ${fallos.length}` : "\nTodo OK");
  process.exit(fallos.length ? 1 : 0);
})();
