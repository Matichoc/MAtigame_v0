// Prueba en el celular, 30-oct:
//  - Pueblo: la casa del árbol del bosque se puede subir por la escalera (animación de trepar), arriba hay una terraza con
//    baranda (no se cae), se entra a la casita (la ardilla Nuez y su misión del día) y se baja.
//  - Ciudad: en el muelle de la playa la Matichica camina por encima (no hundida) y no se cae por los costados.
// Uso: NODE_PATH=$(npm root -g) node scripts/qa/casita-muelle.cjs [url]   (capturas en maquetas/casita-*.png y muelle-*.png)
const { abrir, nuevoPerfil } = require("./lib.cjs");
const path = require("path");

let fallos = 0;
const ok = (c, t) => { console.log(`${c ? "OK " : "MAL"} ${t}`); if (!c) fallos++; };
const esperar = (p, fn, arg, ms = 60000) => p.waitForFunction(fn, arg, { timeout: ms }).then(() => true).catch(() => false);
const foto = (p, n) => p.screenshot({ path: path.join(__dirname, "..", "..", "maquetas", `${n}.png`) });

(async () => {
  const { b, p, reg } = await abrir({ viewport: { width: 915, height: 412 }, touch: true });
  await nuevoPerfil(p);
  // ---- Pueblo ----
  await p.evaluate(() => [...document.querySelectorAll(".game-card, #game-feature")].find((c) => c.textContent.includes("Pueblo")).click());
  await p.waitForFunction(() => window.__g3d && window.__g3d.town && window.__g3d.town.running, null, { timeout: 40000 });
  await p.waitForTimeout(800);
  await p.evaluate(() => { const s = document.getElementById("town-btn-start"); if (s && s.offsetParent) s.click(); });
  await p.waitForTimeout(1200);
  const sin = await p.evaluate(() => !!window.__g3d.town.zones.treehouse);
  ok(!sin, "antes de construirla (aventura), la casita no se puede subir");
  const T = await p.evaluate(async () => {
    const g = window.__g3d.town;
    const src = [...document.scripts].map((x) => x.src).find((u) => /\/js\/main\.js/.test(u));
    const A = await import(new URL("adventure.js", src).href);
    A.adventureOf(g.progress).done["bosque.casita"] = true;
    g.zones.refresh();
    const T = g.zones.treehouse;
    g.pos.set(T.foot.x, 0, T.foot.z);
    g._pickTarget();
    return { T, label: g.target && g.target.label };
  });
  ok(T.T && /Subir a la casita/.test(T.label), `al pie de la escalera aparece «${T.label}»`);
  await p.evaluate(() => window.__g3d.town.act());
  ok(await esperar(p, () => { const g = window.__g3d.town; return g.climbing && g.climbing.i === 1; }, null, 20000), "trepa la escalera");
  await p.waitForTimeout(500);
  const trepando = await p.evaluate(() => { const g = window.__g3d.town; return { y: g.pos.y, mode: g.climbing && g.climbing.i }; });
  ok(trepando.y > 0.3, `va subiendo (altura ${trepando.y.toFixed(1)})`);
  await foto(p, "casita-trepando");
  ok(await esperar(p, () => !window.__g3d.town.climbing, null, 30000), "termina de subir");
  await p.waitForTimeout(600);
  const arriba = await p.evaluate(() => { const g = window.__g3d.town; return { y: g.pos.y, ground: g.fun.groundY }; });
  ok(arriba.y > 4.5 && arriba.ground > 4.5, `queda parada en la terraza (altura ${arriba.y.toFixed(2)})`);
  await foto(p, "casita-terraza");
  // caminar hacia afuera de la terraza (hacia cada lado): la baranda no deja caer
  const baranda = await p.evaluate(async () => {
    const g = window.__g3d.town;
    const T = g.zones.treehouse;
    const res = [];
    for (const [jx, jy] of [[1, 0], [-1, 0], [0, -1]]) {
      g.pos.set(T.top.x, T.porchTop, T.top.z);
      g.joy = { x: jx, y: jy };
      await new Promise((r) => setTimeout(r, 2500));
      res.push(+g.pos.y.toFixed(2));
    }
    g.joy = { x: 0, y: 0 };
    return res;
  });
  ok(baranda.every((y) => y > 4.5), `caminando contra la baranda no se cae (alturas ${baranda.join(", ")})`);
  // entrar
  const puerta = await p.evaluate(() => { const g = window.__g3d.town; const T = g.zones.treehouse; g.pos.set(T.door.x, T.porchTop, T.door.z); g._pickTarget(); return g.target && g.target.label; });
  ok(/Entrar a la casita/.test(puerta), `frente a la puerta aparece «${puerta}»`);
  await p.evaluate(() => window.__g3d.town.act());
  ok(await p.evaluate(() => !!window.__g3d.town.visits.active && window.__g3d.town.visits.active.key === "casita"), "se entra a la casita");
  ok(await esperar(p, () => window.__g3d.town.camera.position.z < -880, null, 20000), "adentro se ve la pieza");
  await p.waitForTimeout(800);
  // hablar con la ardilla: aparece la misión
  const habla = await p.evaluate(() => { const g = window.__g3d.town; const h = g.visits.active.host.position; g.pos.x = h.x; g.pos.z = h.z + 1.4; g._pickTarget(); return g.target && g.target.label; });
  ok(/Ardilla Nuez/.test(habla), `adentro está la ardilla: «${habla}»`);
  await foto(p, "casita-adentro");
  // salir: vuelve a la terraza
  await p.evaluate(() => window.__g3d.town.visits.leave());
  await p.waitForTimeout(600);
  const fuera = await p.evaluate(() => { const g = window.__g3d.town; return { y: g.pos.y, active: !!g.visits.active }; });
  ok(!fuera.active && fuera.y > 4.5, `al salir vuelve a la terraza (altura ${fuera.y.toFixed(2)})`);
  // bajar
  const bajar = await p.evaluate(() => { const g = window.__g3d.town; const T = g.zones.treehouse; g.pos.set(T.top.x, T.porchTop, T.top.z); g._pickTarget(); return g.target && g.target.label; });
  ok(/Bajar/.test(bajar), `junto a la escalera, arriba, aparece «${bajar}»`);
  await p.evaluate(() => window.__g3d.town.act());
  ok(await esperar(p, () => !window.__g3d.town.climbing && window.__g3d.town.pos.y < 0.1, null, 30000), "baja por la escalera hasta el suelo");
  await p.evaluate(() => document.getElementById("town-btn-menu").click());
  await p.waitForTimeout(300);
  await p.evaluate(() => document.getElementById("pause-exit").click());
  await p.waitForTimeout(800);
  // ---- Ciudad: el muelle ----
  await p.evaluate(() => { const pr = window.__progress(); pr.unlockedGames = [...new Set([...(pr.unlockedGames || []), "ciudad"])]; pr.energy = 200; });
  await p.evaluate(() => [...document.querySelectorAll(".game-card, #game-feature")].find((c) => c.textContent.includes("Ciudad")).click());
  await p.waitForFunction(() => window.__g3d && window.__g3d.ciudad && window.__g3d.ciudad.running, null, { timeout: 40000 });
  await p.waitForTimeout(600);
  await p.evaluate(() => document.getElementById("ciudad-btn-start").click());
  await p.waitForTimeout(1200);
  // desde la arena, caminar hacia el mar por el muelle (camYaw 0: ix mueve en +x, iy -1 mueve en +z)
  const mover = (ix, iy, ms) => p.evaluate(async ({ ix, iy, ms }) => {
    const g = window.__g3d.ciudad;
    const t0 = performance.now();
    let minZ = Infinity, maxZ = -Infinity;
    while (performance.now() - t0 < ms) {
      g.camYaw = 0;
      g.joy = { x: ix, y: iy };
      await new Promise((r) => requestAnimationFrame(r));
      minZ = Math.min(minZ, g.pos.z); maxZ = Math.max(maxZ, g.pos.z);
    }
    g.joy = { x: 0, y: 0 };
    return { x: +g.pos.x.toFixed(2), y: +g.pos.y.toFixed(2), z: +g.pos.z.toFixed(2), hero: +g.hero.group.position.y.toFixed(2), minZ, maxZ };
  }, { ix, iy, ms });
  await p.evaluate(() => { const g = window.__g3d.ciudad; g.pos.set(118, 0.04, 10.5); g.vel.set(0, 0, 0); });
  const ida = await mover(1, 0, 6000);
  ok(ida.x > 126 && ida.y > 0.6 && ida.hero > 0.6, `sobre el muelle camina por encima (x ${ida.x}, pies a ${ida.y})`);
  await foto(p, "muelle-encima");
  const lado1 = await mover(0, -1, 2500); // hacia +z (un costado)
  ok(lado1.z <= 12.6 && lado1.y > 0.6 && lado1.x > 126, `hacia un costado choca con el borde (z ${lado1.z}, sigue arriba a ${lado1.y})`);
  const lado2 = await mover(0, 1, 3000); // hacia -z (el otro costado)
  ok(lado2.z >= 8.4 && lado2.y > 0.6 && lado2.x > 126, `hacia el otro costado también (z ${lado2.z})`);
  const punta = await mover(1, 0, 6000);
  ok(punta.x <= 145.6 && punta.y > 0.6, `en la punta no se cae al mar (x ${punta.x})`);
  await foto(p, "muelle-punta");
  const vuelta = await mover(-1, 0, 9000);
  ok(vuelta.x < 120 && vuelta.y < 0.1, `se baja por la orilla, a la arena (x ${vuelta.x}, pies a ${vuelta.y})`);
  // desde la arena, por el costado del muelle no se sube (es un escalón)
  await p.evaluate(() => { const g = window.__g3d.ciudad; g.pos.set(125, 0.04, 6); g.vel.set(0, 0, 0); });
  const costado = await mover(0, -1, 2500);
  ok(costado.z < 8 && costado.y < 0.1, `desde la arena, por el costado se choca con el muelle (z ${costado.z})`);
  const errores = reg.errores.filter((x) => !/Blocked script execution in 'about:blank'/.test(x));
  ok(errores.length === 0, `sin errores (${errores.join(" | ")})`);
  await b.close();
  console.log(fallos ? `\n${fallos} fallos` : "\nTodo bien");
  process.exit(fallos ? 1 : 0);
})();
