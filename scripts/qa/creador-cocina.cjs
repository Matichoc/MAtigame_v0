// Crea tu Chocolate con cocina a mano: después de diseñarlo se juntan los ingredientes en la despensa (tocándolos), se
// llevan a la olla (arrastrando), se derrite (manteniendo apretado, sin quemar), se revuelve (vueltas con el dedo), se vierte
// en el molde y se decora. Los ingredientes especiales se desbloquean cocinando (no con Matipuntos).
// Uso: NODE_PATH=$(npm root -g) node scripts/qa/creador-cocina.cjs [url]   (deja capturas en maquetas/cocina-*.png)
const { abrir, nuevoPerfil } = require("./lib.cjs");
const path = require("path");

let fallos = 0;
const ok = (c, t) => { console.log(`${c ? "OK " : "MAL"} ${t}`); if (!c) fallos++; };
const esperar = (p, fn, arg, ms = 60000) => p.waitForFunction(fn, arg, { timeout: ms }).then(() => true).catch(() => false);
const foto = (p, n) => p.screenshot({ path: path.join(__dirname, "..", "..", "maquetas", `cocina-${n}.png`) });
const K = () => window.__g3d.creador.kitchen;

(async () => {
  const { b, p, reg } = await abrir({ viewport: { width: 1000, height: 700 } });
  await nuevoPerfil(p);
  const coins0 = await p.evaluate(() => window.__progress().coins);
  await p.evaluate(() => [...document.querySelectorAll(".game-card, #game-feature")].find((c) => c.textContent.includes("Crea tu Chocolate")).click());
  await p.waitForFunction(() => window.__g3d && window.__g3d.creador, null, { timeout: 40000 });
  await p.waitForSelector("#creador-btn-start", { state: "visible", timeout: 60000 });
  await p.evaluate(() => document.getElementById("creador-btn-start").click());
  await p.waitForTimeout(500);
  // ayudante: posición en pantalla de un punto 3D
  await p.evaluate(() => {
    window.__scr = (v) => {
      const g = window.__g3d.creador;
      const q = v.clone().project(g.camera);
      const r = g.els.canvas.getBoundingClientRect();
      return { x: r.left + ((q.x + 1) / 2) * r.width, y: r.top + ((1 - q.y) / 2) * r.height };
    };
  });
  const paso = (n) => p.evaluate((n) => [...document.querySelectorAll("#creador-panel .cr-step")][n].click(), n);
  await paso(1);
  const bloq = await p.evaluate(() => [...document.querySelectorAll("#creador-panel .cr-opt.locked")].map((b) => b.textContent));
  ok(bloq.length === 1 && /Rosa/.test(bloq[0]) && /Cocina 1 chocolate/.test(bloq[0]), `el chocolate rosa se desbloquea cocinando (${bloq.join(" | ")})`);
  await paso(3);
  const tops = await p.evaluate(() => [...document.querySelectorAll("#creador-panel .cr-opt")].map((b) => ({ t: b.textContent, l: b.classList.contains("locked") })));
  ok(tops.filter((x) => x.l).length === 3, `3 toppings especiales con candado: ${tops.filter((x) => x.l).map((x) => x.t.split("🔒")[0]).join(", ")}`);
  await p.evaluate(() => [...document.querySelectorAll("#creador-panel .cr-opt")].find((b) => b.textContent.includes("Chispas")).click());
  await p.evaluate(() => [...document.querySelectorAll("#creador-panel .cr-opt")].find((b) => b.textContent.includes("Coco")).click());
  await paso(5);
  await p.evaluate(() => [...document.querySelectorAll("#creador-panel .cr-nav .btn-primary")][0].click());
  ok(await esperar(p, () => window.__g3d.creador.view === "kitchen" && window.__g3d.creador.kitchen.phase === "juntar", null, 5000), "«¡A la cocina!» abre la cocina en «Juntar»");
  const need = await p.evaluate(() => window.__g3d.creador.kitchen.need.map((n) => `${n.icon}x${n.n}`).join(" "));
  ok(/🍫x3/.test(need) && /🍯x2/.test(need), `la receta pide 3 de chocolate, 2 de manjar y los toppings (${need})`);
  await p.waitForTimeout(2500);
  await foto(p, "1-juntar");
  // juntar: tocar lo que pide la receta (y una vez algo que no va)
  let tocoMalo = false;
  for (let i = 0; i < 400; i++) {
    const t = await p.evaluate(() => {
      const k = window.__g3d.creador.kitchen;
      if (k.phase !== "juntar") return { listo: true };
      const missing = k.need.filter((n) => n.got < n.n).map((n) => n.icon);
      const sl = k.slots.find((s) => s.item && !s.fly && s.s.visible && s.t > 0.25 && s.t < s.life - 0.4 && (s.item.need ? missing.includes(s.item.icon) : !window.__malo));
      if (!sl) return null;
      if (!sl.item.need) window.__malo = true;
      return { ...window.__scr(sl.s.position), malo: !sl.item.need };
    });
    if (t && t.listo) break;
    if (t) { await p.mouse.click(t.x, t.y); if (t.malo) tocoMalo = true; }
    else await p.waitForTimeout(120);
  }
  const j = await p.evaluate(() => ({ decoys: window.__g3d.creador.kitchen.decoys, phase: window.__g3d.creador.kitchen.phase }));
  ok(tocoMalo && j.decoys === 1, `tocar algo que no va (cebolla, queso...) avisa y cuenta (${j.decoys})`);
  ok(await esperar(p, () => window.__g3d.creador.kitchen.phase === "llevar"), "con todo junto pasa a «Llevar»");
  await foto(p, "2-llevar");
  // llevar: arrastrar cada cosa del canasto a la olla
  for (let i = 0; i < 5; i++) {
    const pos = await p.evaluate((i) => {
      const k = window.__g3d.creador.kitchen;
      const c = k.carry.filter((x) => !x.done)[0];
      if (!c) return null;
      const pot = k.pot.position.clone();
      pot.y = 1.1;
      return { a: window.__scr(c.s.position), b: window.__scr(pot) };
    }, i);
    if (!pos) break;
    await p.mouse.move(pos.a.x, pos.a.y);
    await p.mouse.down();
    await p.mouse.move((pos.a.x + pos.b.x) / 2, pos.a.y - 40, { steps: 4 });
    await p.mouse.move(pos.b.x, pos.b.y, { steps: 4 });
    await p.mouse.up();
    await p.waitForTimeout(150);
  }
  ok(await esperar(p, () => window.__g3d.creador.kitchen.phase === "derretir"), "arrastrando los 5 ingredientes a la olla pasa a «Derretir»");
  // derretir: mantener apretado, soltar antes de que se queme
  const centro = await p.evaluate(() => { const v = window.__g3d.creador.kitchen.pot.position.clone(); v.y = 0.6; return window.__scr(v); });
  await p.mouse.move(centro.x, centro.y);
  let apretado = false;
  let fotoCalor = false;
  for (let i = 0; i < 600; i++) {
    const s = await p.evaluate(() => { const k = window.__g3d.creador.kitchen; return { t: k.temp, m: k.melt, ph: k.phase }; });
    if (s.ph !== "derretir") break;
    if (!apretado && s.t < 0.55) { await p.mouse.down(); apretado = true; }
    else if (apretado && s.t > 0.68) { await p.mouse.up(); apretado = false; }
    if (!fotoCalor && s.m > 0.4) { await foto(p, "3-derretir"); fotoCalor = true; }
    await p.waitForTimeout(40);
  }
  if (apretado) await p.mouse.up();
  const d = await p.evaluate(() => ({ burnt: window.__g3d.creador.kitchen.burnt, ph: window.__g3d.creador.kitchen.phase }));
  ok(d.burnt === 0, "se derrite sin quemarse (soltando a tiempo)");
  ok(await esperar(p, () => window.__g3d.creador.kitchen.phase === "revolver"), "derretido: pasa a «Revolver»");
  // revolver: vueltas alrededor de la olla
  const c2 = await p.evaluate(() => { const v = window.__g3d.creador.kitchen.pot.position.clone(); v.y = 0.6; return window.__scr(v); });
  await p.mouse.move(c2.x + 70, c2.y);
  await p.mouse.down();
  for (let a = 0; a <= Math.PI * 2 * 4.6; a += 0.35) {
    await p.mouse.move(c2.x + Math.cos(a) * 70, c2.y + Math.sin(a) * 50);
    if (Math.abs(a - Math.PI * 4) < 0.2) await foto(p, "4-revolver");
  }
  await p.mouse.up();
  ok(await esperar(p, () => window.__g3d.creador.kitchen.phase === "moldear"), "4 vueltas: pasa a «Al molde»");
  // al molde: mantener con el botón y soltar en la raya verde
  const btn = await p.$("#creador-panel .ck-hold");
  ok(!!btn, "hay un botón «Mantén para verter»");
  const bb = await btn.boundingBox();
  await p.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2);
  await p.mouse.down();
  let fotoVerter = false;
  for (let i = 0; i < 600; i++) {
    const v = await p.evaluate(() => window.__g3d.creador.kitchen.pour);
    if (!fotoVerter && v > 0.5) { await foto(p, "5-molde"); fotoVerter = true; }
    if (v >= 0.9) break;
    await p.waitForTimeout(30);
  }
  await p.mouse.up();
  const m = await p.evaluate(() => ({ pour: window.__g3d.creador.kitchen.pour, good: window.__g3d.creador.kitchen.pourGood }));
  ok(m.good, `soltando en la raya verde el molde queda justo (${m.pour.toFixed(2)})`);
  ok(await esperar(p, () => window.__g3d.creador.kitchen.phase === "decorar"), "se enfría y pasa a «Decorar»");
  for (let i = 0; i < 6; i++) {
    const t = await p.evaluate(() => { const v = window.__g3d.creador.kitchen.mold.position.clone(); v.y = 0.3; return window.__scr(v); });
    await p.mouse.click(t.x, t.y);
    await p.waitForTimeout(120);
    if (i === 2) await foto(p, "6-decorar");
  }
  ok(await esperar(p, () => window.__g3d.creador.view === "result"), "decorado: aparece el chocolate terminado");
  await p.waitForTimeout(1200);
  await foto(p, "7-resultado");
  const r = await p.evaluate(() => { const g = window.__g3d.creador; return { notes: g.result.notes, score: g.result.score, stars: g.result.stars, cooks: window.__progress().stats.creatorCooks, coins: window.__progress().coins, txt: document.getElementById("creador-panel").textContent }; });
  ok(r.notes.some((n) => /Hecho a mano/.test(n)) && /sin quemarlo/.test(r.txt) && /justo lleno/.test(r.txt), `el resultado cuenta lo hecho a mano (${r.notes.join(" / ").slice(0, 160)}…)`);
  ok(r.notes.some((n) => /Nuevo ingrediente.*Rosa/.test(n)) && r.cooks === 1, `al cocinar el primero se desbloquea el chocolate rosa (cocinados: ${r.cooks})`);
  ok(r.coins === coins0, `no se gastan Matipuntos (${coins0} → ${r.coins})`);
  await p.evaluate(() => [...document.querySelectorAll("#creador-panel .btn-secondary")].find((b) => b.textContent.includes("Seguir editando")).click());
  await paso(1);
  ok(await p.evaluate(() => document.querySelectorAll("#creador-panel .cr-opt.locked").length === 0), "ahora el chocolate rosa se puede elegir");
  const errores = reg.errores.filter((x) => !/Blocked script execution in 'about:blank'/.test(x));
  ok(errores.length === 0, `sin errores (${errores.join(" | ")})`);
  await b.close();
  console.log(fallos ? `\n${fallos} fallos` : "\nTodo bien");
  process.exit(fallos ? 1 : 0);
})();
