// Parkour renovado: muros para escalar (en la Aventura y en el Mundo infinito), figuras (casa, bajada, muro) más seguido en el
// infinito y adornos lejos del camino (no tapan la vista ni parece que se pueda pasar por ellos).
// Uso: NODE_PATH=$(npm root -g) node scripts/qa/parkour-escalar.cjs [url]   (deja capturas en maquetas/parkour-*.png)
const { abrir, nuevoPerfil } = require("./lib.cjs");
const path = require("path");

let fallos = 0;
const ok = (c, t) => { console.log(`${c ? "OK " : "MAL"} ${t}`); if (!c) fallos++; };
const esperar = (p, fn, arg, ms = 30000) => p.waitForFunction(fn, arg, { timeout: ms }).then(() => true).catch(() => false);
const foto = (p, n) => p.screenshot({ path: path.join(__dirname, "..", "..", "maquetas", `parkour-${n}.png`) });

(async () => {
  const { b, p, reg } = await abrir({ viewport: { width: 915, height: 412 }, touch: true });
  await nuevoPerfil(p);
  await p.evaluate(() => [...document.querySelectorAll(".game-card, #game-feature")].find((c) => c.textContent.includes("Parkour")).click());
  await p.waitForFunction(() => window.__g3d && window.__g3d.parkour, null, { timeout: 40000 });
  await p.waitForSelector("#parkour-btn-campaign", { state: "visible", timeout: 60000 });
  await p.evaluate(() => document.getElementById("parkour-btn-campaign").click());
  await esperar(p, () => window.__g3d.parkour.state === "playing");
  const muros = await p.evaluate(() => window.__g3d.parkour.platforms.filter((q) => q.type === "climb").map((q) => ({ stage: q.stage, alto: +(q.h.y * 2).toFixed(1) })));
  ok(muros.length === 3 && muros.map((m) => m.stage).join() === "0,3,6", `la Aventura tiene 3 muros para escalar (etapas 1, 4 y 7): ${JSON.stringify(muros)}`);
  // frente al primer muro, empujando hacia él
  const ini = await p.evaluate(() => {
    const g = window.__g3d.parkour;
    const w = g.platforms.find((q) => q.type === "climb");
    g.pos.set(w.base.x, w.box.minY + 3 + 0.01, w.box.maxZ + 1.2); // sobre la plataforma de antes (su cima = base del muro + 3)
    g.vel.set(0, 0, 0);
    g.joy = { x: 0, y: 1 };
    return { top: w.box.maxY, face: w.box.maxZ, y0: g.pos.y };
  });
  ok(await esperar(p, () => window.__g3d.parkour.climbing, null, 15000), "al empujar hacia el muro, la Matichica trepa");
  await p.waitForTimeout(250);
  ok(await p.evaluate(() => window.__g3d.parkour.hero && window.__g3d.parkour.climbing), "mientras trepa usa la animación de escalar");
  await foto(p, "escalando");
  ok(await esperar(p, (top) => { const g = window.__g3d.parkour; return g.grounded && g.pos.y >= top - 0.05; }, ini.top, 20000), `llega arriba del muro y queda parada en la cima (y ${ini.top.toFixed(1)})`);
  await p.evaluate(() => { window.__g3d.parkour.joy = { x: 0, y: 0 }; });
  await p.waitForTimeout(400);
  await foto(p, "cima");
  // sin empujar hacia el muro no se trepa (se queda abajo)
  const quieto = await p.evaluate(() => {
    const g = window.__g3d.parkour;
    const w = g.platforms.filter((q) => q.type === "climb")[1];
    g.pos.set(w.base.x, w.box.minY + 3 + 0.01, w.box.maxZ + 0.36);
    g.vel.set(0, 0, 0);
    g.joy = { x: 1, y: 0 }; // hacia el lado, no hacia el muro
    return w.box.minY + 3;
  });
  await p.waitForTimeout(1200);
  ok(await p.evaluate((y) => !window.__g3d.parkour.climbing && window.__g3d.parkour.pos.y < y + 0.5, quieto), "moviéndose hacia el lado no trepa");
  await p.evaluate(() => { window.__g3d.parkour.joy = { x: 0, y: 0 }; });
  // Mundo infinito: más figuras (casa, bajada, muros) y adornos lejos del camino
  const inf = await p.evaluate(() => {
    const g = window.__g3d.parkour;
    const figuras = {};
    const orig = g._figure.bind(g);
    g._figure = (k, c, o) => { figuras[k] = (figuras[k] || 0) + 1; return orig(k, c, o); };
    // semilla fija: el mundo infinito sale distinto en cada partida y con algunas semillas trae un solo muro en 400 tramos
    const azar = Math.random;
    let s = 20261030;
    Math.random = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    g.startMode("inf");
    Math.random = azar;
    for (let i = 0; i < 800; i++) g._genNext();
    g._figure = orig;
    const plats = g.platforms.filter((q) => q.active);
    const tipos = {};
    for (const q of plats) tipos[q.type] = (tipos[q.type] || 0) + 1;
    // distancia de cada adorno a la plataforma más cercana (en el plano)
    let minD = Infinity;
    for (const pr of g.props) {
      const m = pr.mesh.position;
      for (const q of plats) {
        const dx = Math.max(0, Math.abs(m.x - q.base.x) - q.h.x), dz = Math.max(0, Math.abs(m.z - q.base.z) - q.h.z);
        const d = Math.hypot(dx, dz);
        const below = m.y < q.base.y + q.h.y - 4;
        if (!below) minD = Math.min(minD, d);
      }
    }
    return { tipos, figuras, props: g.props.length, minD };
  });
  const f = inf.figuras;
  ok((f.climb || 0) >= 2, `el Mundo infinito pone muros para escalar (${f.climb || 0} en 800 tramos)`);
  ok((f.house || 0) >= 1 && (f.descent || 0) >= 2, `y también casas por los balcones (${f.house || 0}) y bajadas (${f.descent || 0}): ${JSON.stringify(f)}`);
  ok(inf.minD > 8, `los adornos quedan lejos del camino o bien abajo (el más cerca a ${inf.minD === Infinity ? "—" : inf.minD.toFixed(1)} m de una plataforma a su altura; ${inf.props} adornos)`);
  ok(reg.errores.length === 0, `sin errores (${reg.errores.join(" | ")})`);
  await b.close();
  console.log(fallos ? `\n${fallos} fallos` : "\nTodo bien");
  process.exit(fallos ? 1 : 0);
})();
