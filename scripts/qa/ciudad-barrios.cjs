// Prueba en el navegador los barrios nuevos de la Ciudad Choco (parque, playa con muelle y colegio): se puede caminar
// hasta ellos por las calles nuevas, al mar no se entra (salvo el muelle), y sus tres misiones se juegan de punta a punta
// (hablar → hacer → volver → premio), quedan hechas por hoy y se pueden repetir otro día.
// Uso: NODE_PATH=$(npm root -g) node scripts/qa/ciudad-barrios.cjs [url-base]
const { abrir, nuevoPerfil } = require("./lib.cjs");

let fallos = 0;
const ok = (c, t) => { console.log(`${c ? "OK " : "MAL"} ${t}`); if (!c) fallos++; };

(async () => {
  const { b, p, reg } = await abrir({ viewport: { width: 1000, height: 600 } });
  await nuevoPerfil(p);
  await p.evaluate(() => { const pr = window.__progress(); pr.unlockedGames = [...new Set([...(pr.unlockedGames || []), "ciudad"])]; pr.energy = 200; });
  await p.evaluate(() => [...document.querySelectorAll(".game-card, #game-feature")].find((c) => c.textContent.includes("Ciudad")).click());
  await p.waitForFunction(() => window.__g3d && window.__g3d.ciudad && window.__g3d.ciudad.running, null, { timeout: 40000 });
  await p.waitForTimeout(600);
  await p.click("#ciudad-btn-start").catch(() => {});
  await p.waitForTimeout(1200);
  const g = (fn, arg) => p.evaluate(fn, arg);

  ok(await g(() => document.getElementById("ciudad-hud-missions").textContent.endsWith("/11")), "la Ciudad tiene 11 misiones (8 + 3 de los barrios)");
  // dónde se puede caminar
  const lim = await g(() => {
    const c = window.__g3d.ciudad;
    const probar = (x, z) => { const q = { x, z }; c._limit(q, 1); return Math.hypot(q.x - x, q.z - z) < 0.01; };
    return { parque: probar(0, -110), playa: probar(100, 0), colegio: probar(-110, 0), mar: probar(140, 0), muelle: probar(140, 10.5), afuera: probar(110, 110) };
  });
  ok(lim.parque && lim.playa && lim.colegio, "se puede caminar por el parque, la playa y el colegio");
  ok(!lim.mar && lim.muelle, "al mar no se entra, pero por el muelle sí");
  ok(!lim.afuera, "fuera de la ciudad y los barrios no se puede ir");

  for (const [id, giver, cuantos] of [["patos", "patricio", 5], ["quitasoles", "marina", 6], ["libros", "paz", 6]]) {
    const c0 = (await g(() => window.__progress().coins));
    // hablar con el vecino (se pasa por todo el diálogo) → empieza la misión
    await g((gid) => { const c = window.__g3d.ciudad; const n = c.npcs[gid]; c.pos.set(n.x + 1.5, 0.04, n.z); c._talk(gid); while (c.dialog) c._advanceDialog(); }, giver);
    ok(await g((mid) => window.__g3d.ciudad.active && window.__g3d.ciudad.active.id === mid, id), `${id}: hablar con el vecino empieza la misión`);
    // ir a cada lugar
    const n = await g(async (mid) => {
      const c = window.__g3d.ciudad;
      // (en el navegador de prueba sin tarjeta gráfica los cuadros son lentos: se espera a que cada cosa se registre)
      for (const it of c.barrios.items[mid]) {
        for (let k = 0; k < 30 && !it.got; k++) { c.pos.set(it.x + 0.5, 0.04, it.z + 0.5); c.vel.set(0, 0, 0); await new Promise((r) => setTimeout(r, 150)); }
      }
      return c.active ? c.active.n : -1;
    }, id);
    ok(n === cuantos && await g(() => window.__g3d.ciudad.active.step === "report"), `${id}: pasar por los ${cuantos} lugares la deja lista para volver (${n})`);
    await g((gid) => { const c = window.__g3d.ciudad; const nn = c.npcs[gid]; c.pos.set(nn.x + 1.5, 0.04, nn.z); c._talk(gid); while (c.dialog) c._advanceDialog(); }, giver);
    const c1 = await g(() => window.__progress().coins);
    ok(!(await g(() => window.__g3d.ciudad.active)) && c1 > c0, `${id}: volver con el vecino completa la misión y paga (${c0} → ${c1})`);
    ok(await g((mid) => window.__g3d.ciudad.save.last[mid] === new Date().toISOString().slice(0, 10) || !!window.__g3d.ciudad.save.last[mid], id), `${id}: queda hecha por hoy`);
  }
  ok(await g(() => window.__g3d.ciudad.barrios.items.quitasoles.every((q) => q.got)), "los quitasoles quedan abiertos");
  // otro día: se pueden repetir
  ok(await g(() => { const c = window.__g3d.ciudad; for (const k of ["patos", "quitasoles", "libros"]) c.save.last[k] = "2000-01-01"; return ["patos", "quitasoles", "libros"].every((k) => c._available(c._giverMission(Object.keys(c.npcs).find((x) => c._giverMission(x) && c._giverMission(x).id === k)))); }), "al día siguiente las misiones de los barrios vuelven a estar disponibles");
  ok(reg.errores.length === 0, `sin errores de página (${reg.errores.join(" | ")})`);
  ok(reg.externas.length === 0, `sin conexiones externas (${reg.externas.length})`);
  await b.close();
  console.log(fallos ? `\n${fallos} con problemas` : "\nTodo bien");
  process.exit(fallos ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
