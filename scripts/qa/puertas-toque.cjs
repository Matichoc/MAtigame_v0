// Pueblo en pantalla táctil: un toque corto (como un dedo) en "Entrar" abre el minijuego de cada puerta (Gato, Sudoku,
// Cachipún) y el cuadro se queda abierto. Antes, el botón abría el cuadro al apoyar el dedo y el "clic" que el celular
// envía al levantarlo caía sobre el fondo del cuadro recién abierto y lo cerraba: había que mantener apretado.
// También revisa que tocar el fondo del cuadro lo siga cerrando, y que al entrar a la Boutique ese clic no toque la tienda. Uso: NODE_PATH=$(npm root -g) node scripts/qa/puertas-toque.cjs [url]
const { abrir, nuevoPerfil } = require("./lib.cjs");

let fallos = 0;
const ok = (c, t) => { console.log(`${c ? "OK " : "MAL"} ${t}`); if (!c) fallos++; };

(async () => {
  const { b, p, reg } = await abrir({ viewport: { width: 915, height: 412 }, touch: true });
  await nuevoPerfil(p);
  await p.evaluate(() => [...document.querySelectorAll(".game-card, #game-feature")].find((c) => c.textContent.includes("Pueblo")).click());
  await p.waitForFunction(() => window.__g3d && window.__g3d.town && window.__g3d.town.running, null, { timeout: 40000 });
  await p.waitForTimeout(800);
  await p.evaluate(() => { const s = document.getElementById("town-btn-start"); if (s && s.offsetParent) s.click(); });
  await p.waitForTimeout(1500);
  const puertas = await p.evaluate(() => window.__g3d.town.fun.doorSpots);
  const abierto = () => p.evaluate(() => !document.getElementById("puzzle-dialog").classList.contains("hidden"));
  for (const d of puertas) {
    await p.evaluate((d) => { const g = window.__g3d.town; g.pos.set(d.x, 0, d.z); g.fun.vy = 0; }, d);
    // con el equipo cargado el juego va lento: se espera a que aparezca el botón (con tope) en vez de un tiempo fijo
    await p.waitForFunction((id) => { const t = window.__g3d.town.target; const b = document.getElementById("town-btn-action"); return t && t.puzzle === id && b && !b.classList.contains("hidden"); }, d.id, { timeout: 15000 }).catch(() => {});
    const box = await p.locator("#town-btn-action").boundingBox();
    ok(!!box, `${d.id}: aparece el botón para entrar`);
    if (!box) continue;
    await p.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
    await p.waitForTimeout(500);
    ok(await abierto(), `${d.id}: un toque corto abre el minijuego y se queda abierto`);
    // tocar el fondo (fuera de la tarjeta) lo cierra
    await p.touchscreen.tap(6, 6);
    await p.waitForTimeout(300);
    ok(!(await abierto()), `${d.id}: tocar el fondo del cuadro lo cierra`);
  }
  // entrar a la Boutique con un toque: se abre la tienda y el clic de levantar el dedo no toca nada dentro de ella
  const tienda = await p.evaluate(() => window.__g3d.town.interact.find((i) => i.kind === "shop"));
  await p.evaluate((k) => { const g = window.__g3d.town; g.pos.set(k.x, 0, k.z); g.fun.vy = 0; }, tienda);
  await p.waitForTimeout(600);
  await p.evaluate(() => { window.__toques = 0; window.addEventListener("click", (e) => { if (e.isTrusted) window.__toques++; }); });
  const bt = await p.locator("#town-btn-action").boundingBox();
  await p.touchscreen.tap(bt.x + bt.width / 2, bt.y + bt.height / 2);
  await p.waitForTimeout(1500);
  ok(await p.isVisible("#screen-shop"), "Boutique: un toque abre la tienda");
  ok(await p.evaluate(() => window.__toques) === 0, "Boutique: el clic de levantar el dedo no toca nada dentro de la tienda");
  ok(reg.errores.length === 0, `sin errores (${reg.errores.join(" | ")})`);
  await b.close();
  console.log(fallos ? `\n${fallos} fallos` : "\nTodo bien");
  process.exit(fallos ? 1 : 0);
})();
