// Prueba en el video, 30-oct: en el Pueblo, con la patineta se atravesaba el escenario del festival como si fuera
// transparente. Ahora es sólido (se choca por los costados y por atrás), se sube por el escalón de adelante y arriba
// aparece «🎤 Dar un show».
// Uso: NODE_PATH=$(npm root -g) node scripts/qa/escenario.cjs [url]   (captura en maquetas/escenario-show.png)
const { abrir, nuevoPerfil } = require("./lib.cjs");
const path = require("path");

let fallos = 0;
const ok = (c, t) => { console.log(`${c ? "OK " : "MAL"} ${t}`); if (!c) fallos++; };

(async () => {
  const { b, p } = await abrir({ viewport: { width: 915, height: 412 }, touch: true });
  await nuevoPerfil(p);
  await p.evaluate(() => [...document.querySelectorAll(".game-card, #game-feature")].find((c) => c.textContent.includes("Pueblo")).click());
  await p.waitForFunction(() => window.__g3d && window.__g3d.town && window.__g3d.town.running, null, { timeout: 40000 });
  await p.waitForTimeout(800);
  await p.evaluate(() => { const s = document.getElementById("town-btn-start"); if (s && s.offsetParent) s.click(); });
  await p.waitForTimeout(1200);
  ok(await p.evaluate(() => !window.__g3d.town.festival.stage), "antes de armarlo (aventura) no hay escenario");
  await p.evaluate(async () => {
    const g = window.__g3d.town;
    const src = [...document.scripts].map((x) => x.src).find((u) => /\/js\/main\.js/.test(u));
    const A = await import(new URL("adventure.js", src).href);
    A.adventureOf(g.progress).done["festival.escenario"] = true;
    g.festival.refresh();
    // la patineta (la forma más rápida de moverse)
    g.progress.xp = 1e6;
    const list = g._unlockedMoves();
    g.moveIdx = Math.max(0, list.findIndex((m) => m.id === "board"));
    // empuja el joystick hacia un punto del mundo (la cámara gira, así que se recalcula a cada rato)
    window.__ir = (tx, tz, ms) => new Promise((res) => {
      const t0 = performance.now();
      const id = setInterval(() => {
        const dx = tx - g.pos.x, dz = tz - g.pos.z, d = Math.hypot(dx, dz) || 1;
        const s = Math.sin(g.camYaw), c = Math.cos(g.camYaw);
        g.joy = { x: c * (dx / d) - s * (dz / d), y: -(s * (dx / d) + c * (dz / d)) };
        if (performance.now() - t0 > ms) { clearInterval(id); g.joy = { x: 0, y: 0 }; res(); }
      }, 40);
    });
  });
  const mv = await p.evaluate(() => window.__g3d.town._move_().id);
  ok(mv === "board", `va en patineta (${mv})`);
  // desde cada costado y desde atrás, ir derecho al centro: no se mete adentro
  const lados = await p.evaluate(async () => {
    const g = window.__g3d.town;
    const S = g.festival.stage[0];
    const res = [];
    for (const [lx, lz] of [[6, 0], [-6, 0], [0, -5]]) {
      const sin = Math.sin(S.yaw), cos = Math.cos(S.yaw);
      g.pos.set(S.x + lx * cos + lz * sin, 0, S.z - lx * sin + lz * cos);
      g.vel.set(0, 0, 0);
      await window.__ir(S.x, S.z, 2500);
      res.push({ dentro: !!g.fun._inBlock(S, g.pos.x, g.pos.z, 0), y: +g.pos.y.toFixed(2) });
    }
    return res;
  });
  ok(lados.every((r) => !r.dentro && r.y < 0.1), `por los costados y por atrás choca y no lo atraviesa (${JSON.stringify(lados)})`);
  // por delante, por el escalón: queda arriba (corriendo: el navegador de prueba va a pocos cuadros por segundo y la
  // patineta avanzaría varios metros de un cuadro a otro; en el celular, a 30 cuadros, avanza 0,7 m y pisa el escalón)
  const sube = await p.evaluate(async () => {
    const g = window.__g3d.town;
    g.moveIdx = 1;
    const S = g.festival.stage[0];
    const sin = Math.sin(S.yaw), cos = Math.cos(S.yaw);
    g.pos.set(S.x + 4.5 * sin, 0, S.z + 4.5 * cos);
    g.vel.set(0, 0, 0);
    await window.__ir(S.x, S.z, 2500);
    await new Promise((r) => setTimeout(r, 400));
    g._pickTarget();
    return { y: +g.pos.y.toFixed(2), arriba: !!g.fun._inBlock(S, g.pos.x, g.pos.z, 0), label: g.target && g.target.label };
  });
  ok(sube.arriba && sube.y > 0.85, `por el escalón de adelante se sube (altura ${sube.y})`);
  ok(/Dar un show/.test(sube.label || ""), `arriba aparece «${sube.label}»`);
  const show = await p.evaluate(async () => {
    const g = window.__g3d.town;
    const antes = g.progress.coins ?? 0;
    g.act();
    await new Promise((r) => setTimeout(r, 600));
    const baila = g.fun.heroMode === "dance";
    // el tiempo del juego va más lento que el reloj en el navegador de prueba: se espera a que termine
    for (let k = 0; k < 150 && g.fun.showT > 0; k++) await new Promise((r) => setTimeout(r, 200));
    return { baila, fin: g.fun.showT <= 0, y: +g.pos.y.toFixed(2) };
  });
  ok(show.baila, "al tocarlo, baila arriba del escenario");
  ok(show.fin && show.y > 0.85, `termina el show y sigue arriba (altura ${show.y})`);
  await p.screenshot({ path: path.join(__dirname, "..", "..", "maquetas", "escenario-show.png") });
  // bajar caminando por el borde: cae al piso sin quedar pegada
  const baja = await p.evaluate(async () => {
    const g = window.__g3d.town;
    const S = g.festival.stage[0];
    const sin = Math.sin(S.yaw), cos = Math.cos(S.yaw);
    await window.__ir(S.x + 7 * cos, S.z - 7 * sin, 2000);
    await new Promise((r) => setTimeout(r, 800));
    return +g.pos.y.toFixed(2);
  });
  ok(baja < 0.05, `se baja por el costado (altura ${baja})`);
  await b.close();
  console.log(fallos ? `${fallos} fallos` : "Todo bien");
  process.exit(fallos ? 1 : 0);
})();
