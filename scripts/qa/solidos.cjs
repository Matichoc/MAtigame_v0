// Pedido de la dueña, 30-oct: «no debo atravesar nada» (bancas, rejas, faroles…). Camina derecho contra cada cosa
// sólida del Pueblo y de la Ciudad y revisa que choca: bancas de la fuente, faroles de la plaza, pilares de las puertas
// del Arcade, parlantes de la pista de baile, troncos de los árboles; en la Ciudad, la reja de Don Pepe, la del huerto
// (que tiene una entrada al medio) y los árboles del borde.
// Uso: NODE_PATH=$(npm root -g) node scripts/qa/solidos.cjs [url]
const { abrir, nuevoPerfil } = require("./lib.cjs");

let fallos = 0;
const ok = (c, t) => { console.log(`${c ? "OK " : "MAL"} ${t}`); if (!c) fallos++; };

/** En la página: camina de `desde` hacia `hacia` (cuadro a cuadro, con el paso del juego) y dice si llegó a pisar el punto. */
const PRUEBA = `window.__cruza = (g, desde, hacia, paso = 0.12) => {
  const p = { x: desde.x, z: desde.z };
  const d = Math.hypot(hacia.x - desde.x, hacia.z - desde.z);
  const ux = (hacia.x - desde.x) / d, uz = (hacia.z - desde.z) / d;
  let minD = Infinity;
  for (let k = 0; k < (d * 2) / paso; k++) {
    p.x += ux * paso; p.z += uz * paso;
    g._collide(p, 0.45);
    minD = Math.min(minD, Math.hypot(p.x - hacia.x, p.z - hacia.z));
  }
  return minD;
};`;

(async () => {
  const { b, p } = await abrir({ viewport: { width: 915, height: 412 }, touch: true });
  await nuevoPerfil(p);
  // ---- Pueblo ----
  await p.evaluate(() => [...document.querySelectorAll(".game-card, #game-feature")].find((c) => c.textContent.includes("Pueblo")).click());
  await p.waitForFunction(() => window.__g3d && window.__g3d.town && window.__g3d.town.running, null, { timeout: 40000 });
  await p.waitForTimeout(800);
  await p.evaluate(() => { const s = document.getElementById("town-btn-start"); if (s && s.offsetParent) s.click(); });
  await p.waitForTimeout(800);
  await p.addScriptTag({ content: PRUEBA });
  const pueblo = await p.evaluate(() => {
    const g = window.__g3d.town;
    const pol = (deg, r) => ({ x: Math.sin((deg * Math.PI) / 180) * r, z: -Math.cos((deg * Math.PI) / 180) * r });
    // a cada cosa se llega desde 3 m hacia afuera de la plaza (o desde un costado) y se mide qué tan cerca quedó del centro
    const desdeAfuera = (o, m = 3) => { const r = Math.hypot(o.x, o.z) || 1; return { x: o.x + (o.x / r) * m, z: o.z + (o.z / r) * m }; };
    const res = {};
    res.bancas = g.benches.slice(0, 3).map((bn) => window.__cruza(g, desdeAfuera(bn), bn));
    res.faroles = [0, 3, 6, 9].map((i) => { const o = pol(i * 30 + 15, 21.5); return window.__cruza(g, { x: o.x + 3, z: o.z }, o); });
    // pilares del Arcade: la puerta mira a la fuente; el pilar queda a 2,2 m del centro de la puerta
    res.pilares = g.interact.filter((it) => it.kind === "game").slice(0, 3).map((it) => {
      const r = Math.hypot(it.x, it.z), ux = it.x / r, uz = it.z / r;
      const c = { x: it.x + ux * 2.2, z: it.z + uz * 2.2 }; // centro de la puerta
      const pil = { x: c.x - uz * 2.2, z: c.z + ux * 2.2 }; // un pilar (perpendicular)
      return window.__cruza(g, { x: pil.x - ux * 3, z: pil.z - uz * 3 }, pil);
    });
    // y por el medio de la puerta sí se pasa
    const it0 = g.interact.find((it) => it.kind === "game");
    const r0 = Math.hypot(it0.x, it0.z), c0 = { x: it0.x + (it0.x / r0) * 2.2, z: it0.z + (it0.z / r0) * 2.2 };
    res.portalLibre = window.__cruza(g, { x: c0.x - (it0.x / r0) * 3, z: c0.z - (it0.z / r0) * 3 }, c0);
    // parlantes de la pista de baile y algunos troncos
    res.parlantes = g.colliders.filter((c) => c.type === "b" && Math.abs(c.hw - 0.6) < 1e-6 && Math.abs(c.hd - 0.5) < 1e-6).map((c) => window.__cruza(g, { x: c.x + 3, z: c.z }, c));
    return res;
  });
  ok(pueblo.bancas.length === 3 && pueblo.bancas.every((d) => d > 0.5), `las 3 bancas de la fuente chocan (queda a ${pueblo.bancas.map((d) => d.toFixed(2)).join(", ")} m)`);
  ok(pueblo.faroles.every((d) => d > 0.4), `los faroles de la plaza chocan (${pueblo.faroles.map((d) => d.toFixed(2)).join(", ")})`);
  ok(pueblo.pilares.every((d) => d > 0.6), `los pilares de las puertas del Arcade chocan (${pueblo.pilares.map((d) => d.toFixed(2)).join(", ")})`);
  ok(pueblo.portalLibre < 0.2, `por el medio de la puerta del Arcade sí se pasa (${pueblo.portalLibre.toFixed(2)})`);
  ok(pueblo.parlantes.length === 2 && pueblo.parlantes.every((d) => d > 0.6), `los parlantes de la pista de baile chocan (${pueblo.parlantes.map((d) => d.toFixed(2)).join(", ")})`);
  // ---- Ciudad ----
  await p.evaluate(() => { window.__g3d.town.stop?.(); const pr = window.__progress(); pr.unlockedGames = [...new Set([...(pr.unlockedGames || []), "ciudad"])]; pr.energy = 200; });
  await p.goto(p.url().split("#")[0], { waitUntil: "networkidle" });
  await p.evaluate(() => { const c = document.querySelector("#profile-grid .profile-card:not(.add-profile)"); if (c) c.click(); });
  await p.waitForTimeout(800);
  await p.evaluate(() => [...document.querySelectorAll(".game-card, #game-feature")].find((c) => c.textContent.includes("Ciudad")).click());
  await p.waitForFunction(() => window.__g3d && window.__g3d.ciudad && window.__g3d.ciudad.running, null, { timeout: 40000 });
  await p.waitForTimeout(800);
  await p.evaluate(() => { const s = document.getElementById("ciudad-btn-start"); if (s && s.offsetParent) s.click(); });
  await p.waitForTimeout(800);
  await p.addScriptTag({ content: PRUEBA });
  const ciudad = await p.evaluate(() => {
    const g = window.__g3d.ciudad;
    const res = {};
    // la reja de Don Pepe: el tablón del medio, de frente desde la calle
    res.pepe = g.panels.filter((q) => Math.abs(q.z + 37.4) < 0.01).map((q) => window.__cruza(g, { x: q.x, z: q.z + 3 }, { x: q.x, z: q.z - 1.5 }));
    // la reja del huerto: chocan los tablones y se entra por el medio
    res.huerto = [-49, -39.4, -15.8].map((x) => window.__cruza(g, { x, z: 12.6 }, { x, z: 17.6 }));
    res.entrada = window.__cruza(g, { x: -29.8, z: 12.6 }, { x: -29.8, z: 17.6 });
    // árboles del borde (afuera de las calles, dentro de los 90 m)
    const borde = g.treeSpots.filter(([x, z]) => Math.max(Math.abs(x), Math.abs(z)) > 75 && Math.max(Math.abs(x), Math.abs(z)) < 88).slice(0, 4);
    res.arboles = borde.map(([x, z]) => window.__cruza(g, { x: x + 3, z }, { x, z }));
    return res;
  });
  ok(ciudad.pepe.length === 5 && ciudad.pepe.every((d) => d > 1.2), `la reja de Don Pepe no se atraviesa (${ciudad.pepe.map((d) => d.toFixed(2)).join(", ")})`);
  ok(ciudad.huerto.every((d) => d > 1.2), `la reja del huerto no se atraviesa (${ciudad.huerto.map((d) => d.toFixed(2)).join(", ")})`);
  ok(ciudad.entrada < 0.2, `al huerto se entra por la entrada del medio (${ciudad.entrada.toFixed(2)})`);
  ok(ciudad.arboles.length > 0 && ciudad.arboles.every((d) => d > 0.4), `los árboles del borde chocan (${ciudad.arboles.map((d) => d.toFixed(2)).join(", ")})`);
  await b.close();
  console.log(fallos ? `${fallos} fallos` : "Todo bien");
  process.exit(fallos ? 1 : 0);
})();
