// Saltos de Porristas como rutina de equipo: las bases cargan y lanzan a la Matichica, hace una figura en el aire y la
// reciben; al final, la pirámide. Se juega tocando al ritmo. Prueba: una jugadora "perfecta" gana el nivel con 3 estrellas,
// sin tocar se pierden los 3 ❤️ y tocar sin parar no sirve (cuenta como "muy pronto").
// Uso: NODE_PATH=$(npm root -g) node scripts/qa/porristas-rutina.cjs [url]   (deja capturas en maquetas/porristas-*.png)
const { abrir, nuevoPerfil } = require("./lib.cjs");
const path = require("path");

let fallos = 0;
const ok = (c, t) => { console.log(`${c ? "OK " : "MAL"} ${t}`); if (!c) fallos++; };
const esperar = (p, fn, arg, ms = 30000) => p.waitForFunction(fn, arg, { timeout: ms }).then(() => true).catch(() => false);
const foto = (p, n) => p.screenshot({ path: path.join(__dirname, "..", "..", "maquetas", `porristas-${n}.png`) });

(async () => {
  const { b, p, reg } = await abrir({ viewport: { width: 915, height: 412 }, touch: true });
  await nuevoPerfil(p);
  await p.evaluate(() => [...document.querySelectorAll(".game-card, #game-feature")].find((c) => c.textContent.includes("Porristas")).click());
  await p.waitForFunction(() => window.__g3d && window.__g3d.porristas, null, { timeout: 40000 });
  await p.waitForSelector("#porristas-btn-start", { state: "visible", timeout: 60000 });
  ok(await p.evaluate(() => !!document.getElementById("porristas-btn-tap") && !document.getElementById("porristas-btn-left")), "hay un botón 👏 para tocar al ritmo (ya no las flechas de la rebotadora)");
  // jugadora perfecta: toca cuando el tiempo justo está a menos de 30 ms
  await p.evaluate(() => {
    const g = window.__g3d.porristas;
    const orig = g.update.bind(g);
    window.__auto = true;
    g.update = (dt) => {
      orig(dt);
      if (!window.__auto || g.state !== "playing") return;
      const h = g.parts.flatMap((q) => q.hits).find((x) => !x.res);
      if (h && Math.abs(h.t - g.rt) < 0.03) g.tap();
    };
  });
  await p.evaluate(() => document.getElementById("porristas-btn-start").click());
  ok(await esperar(p, () => window.__g3d.porristas.state === "playing"), "empieza la rutina");
  const ini = await p.evaluate(() => { const g = window.__g3d.porristas; return { level: g.level, goal: g.goal, hearts: g.hearts, strip: !document.getElementById("porristas-rhythm").classList.contains("hidden") }; });
  ok(ini.level === 1 && ini.goal === 4 && ini.hearts === 3, `nivel 1: 4 figuras y la pirámide, con 3 ❤️ (${JSON.stringify(ini)})`);
  ok(ini.strip, "se ve la barrita del ritmo");
  // foto con la Matichica en lo alto de una figura
  ok(await esperar(p, () => { const g = window.__g3d.porristas; const q = g._part(); return q.kind === "stunt" && (g.rt - q.t0) / q.spb > 3.9; }, null, 90000), "la lanzan: llega a lo más alto");
  const alto = await p.evaluate(() => { const g = window.__g3d.porristas; return { y: g.fly.y, fig: g._part().fig.name, bases: g.squad.slice(0, 2).map((m) => +m.x.toFixed(2)) }; });
  ok(alto.y > 4.5, `en el aire sube alto (pies a ${alto.y.toFixed(1)} m) y hace «${alto.fig}»`);
  await foto(p, "figura");
  ok(await esperar(p, () => { const g = window.__g3d.porristas; const q = g._part(); return q.kind === "stunt" && (g.rt - q.t0) / q.spb > 6.4; }, null, 90000), "la reciben");
  ok(await p.evaluate(() => { const g = window.__g3d.porristas; return g.fly.y < 2.3 && g.hearts === 3; }), "queda en las manos de las bases, sin perder ❤️");
  const dibujos = await p.evaluate(() => { const r = window.__g3d.porristas.renderer.info.render; return { calls: r.calls, tris: r.triangles }; });
  ok(dibujos.calls < 200, `cuesta poco dibujarlo: ${dibujos.calls} dibujos por cuadro y ${dibujos.tris} triángulos (el equipo va agrupado)`);
  // la pirámide
  ok(await esperar(p, () => { const g = window.__g3d.porristas; const q = g._part(); return q.kind === "pyramid" && (g.rt - q.t0) / q.spb > 7.2; }, null, 150000), "al final arman la pirámide");
  const pir = await p.evaluate(() => { const g = window.__g3d.porristas; return { top: +g.fly.y.toFixed(2), mid: g.squad.slice(3).map((m) => +m.y.toFixed(2)) }; });
  ok(pir.top > 3.3 && pir.mid.every((y) => y > 1.3), `la Matichica en la cima (${pir.top} m) sobre la fila del medio (${pir.mid.join(", ")} m)`);
  await foto(p, "piramide");
  ok(await esperar(p, () => !document.getElementById("porristas-overlay-win").classList.contains("hidden"), null, 60000), "rutina terminada: nivel completado");
  const fin = await p.evaluate(() => { const g = window.__g3d.porristas; return { hits: g.hits, stars: document.getElementById("porristas-stars").textContent, stunts: g.stunts, score: g.score, coins: g.coinsEarned, energy: g._ec }; });
  ok(fin.hits.miss === 0 && fin.hits.perfect === 4 * 3 + 4 && fin.stunts === 4, `todo perfecto: ${JSON.stringify(fin.hits)} en ${fin.stunts} figuras`);
  ok(/★★★/.test(fin.stars), `3 estrellas (${fin.stars})`);
  ok(fin.coins === 10, `pirámide sin errores: +${fin.coins} Matipuntos`);
  ok(fin.energy && fin.energy.fig === 4, `gasta energía por figura (${JSON.stringify(fin.energy)})`);
  await foto(p, "nivel");
  // sin tocar: se pierden los 3 ❤️ (uno por cada vez que no la reciben) y se acaba
  await p.evaluate(() => { window.__auto = false; document.getElementById("porristas-btn-next").click(); });
  ok(await esperar(p, () => window.__g3d.porristas.state === "playing" && window.__g3d.porristas.level === 2), "nivel 2");
  ok(await esperar(p, () => window.__g3d.porristas.hearts === 2, null, 90000), "si no la atrapan a tiempo se pierde un ❤️");
  await p.waitForTimeout(300);
  await foto(p, "casi");
  ok(await esperar(p, () => !document.getElementById("porristas-overlay-gameover").classList.contains("hidden"), null, 150000), "con los 3 ❤️ perdidos se acaba");
  const go = await p.evaluate(() => ({ t: document.getElementById("porristas-gameover-title").textContent, s: window.__g3d.porristas.stunts, strip: document.getElementById("porristas-rhythm").classList.contains("hidden") }));
  ok(go.t.includes("cayó") && go.s === 2, `«${go.t}» al no recibirla por tercera vez (${go.s} figuras completas)`);
  ok(go.strip, "la barrita del ritmo se esconde al terminar");
  // tocar sin parar no sirve
  await p.evaluate(() => { window.__spam = setInterval(() => window.__g3d.porristas.tap(), 60); document.getElementById("porristas-btn-retry").click(); });
  await p.waitForFunction(() => window.__g3d.porristas.rt > 9, null, { timeout: 150000 });
  const spam = await p.evaluate(() => { clearInterval(window.__spam); const g = window.__g3d.porristas; return { hits: g.hits, acc: g._accuracy() }; });
  ok(spam.hits.miss > spam.hits.perfect + spam.hits.good, `tocando sin parar casi todo sale «muy pronto» (${JSON.stringify(spam.hits)})`);
  // toque por la pantalla y por teclado
  const antes = await p.evaluate(() => window.__g3d.porristas.taps);
  await p.keyboard.press("Space");
  await p.tap("#porristas-btn-tap").catch(() => p.evaluate(() => document.getElementById("porristas-btn-tap").dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }))));
  const despues = await p.evaluate(() => window.__g3d.porristas.taps);
  ok(despues - antes >= 2, `se toca con la barra espaciadora y con el botón 👏 (${despues - antes} toques)`);
  const errores = reg.errores.filter((x) => !/Blocked script execution in 'about:blank'/.test(x));
  ok(errores.length === 0, `sin errores (${errores.join(" | ")})`);
  await b.close();
  console.log(fallos ? `\n${fallos} fallos` : "\nTodo bien");
  process.exit(fallos ? 1 : 0);
})();
