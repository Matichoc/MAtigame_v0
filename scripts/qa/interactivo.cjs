// Mundos interactivos (Pueblo y Ciudad): sentarse en las bancas (y levantarse al mover el joystick o saltar), mirar el
// horizonte por los binoculares (muelle de la playa, punta del muelle y mirador del lago) y carteles/logos que se leen
// derecho por los dos lados (dos caras de un solo lado, sin DoubleSide). Uso: NODE_PATH=$(npm root -g) node scripts/qa/interactivo.cjs [url]
const { abrir, nuevoPerfil } = require("./lib.cjs");

let fallos = 0;
const ok = (c, t) => { console.log(`${c ? "OK " : "MAL"} ${t}`); if (!c) fallos++; };
const esperar = (p, fn, arg) => p.waitForFunction(fn, arg, { timeout: 20000 }).then(() => true).catch(() => false);

(async () => {
  const { b, p, reg } = await abrir({ viewport: { width: 915, height: 412 }, touch: true });
  await nuevoPerfil(p);
  // ---- Ciudad ----
  await p.evaluate(() => { const pr = window.__progress(); pr.unlockedGames = [...new Set([...(pr.unlockedGames || []), "ciudad"])]; pr.energy = 200; });
  await p.evaluate(() => [...document.querySelectorAll(".game-card, #game-feature")].find((c) => c.textContent.includes("Ciudad")).click());
  await p.waitForFunction(() => window.__g3d && window.__g3d.ciudad && window.__g3d.ciudad.running, null, { timeout: 40000 });
  await p.waitForTimeout(600);
  await p.evaluate(() => document.getElementById("ciudad-btn-start").click());
  await p.waitForTimeout(1200);
  // carteles con textura de doble cara (las rejas, un dibujo calado y simétrico con alphaTest, sí pueden serlo)
  const espejos = await p.evaluate(() => { let n = 0; window.__g3d.ciudad.scene.traverse((o) => { if (o.isMesh && o.material && o.material.map && o.material.side === 2 && o.geometry.type === "PlaneGeometry" && !o.material.transparent && !(o.material.alphaTest > 0)) n++; }); return n; });
  ok(espejos === 0, `Ciudad: ningún cartel con textura de doble cara (se vería espejado por detrás): ${espejos}`);
  const sentar = await p.evaluate(() => { const c = window.__g3d.ciudad; const bn = c.benches[0]; c.pos.set(bn.x + Math.sin(bn.yaw), 0.04, bn.z + Math.cos(bn.yaw)); c._pickTarget(); const l = c.actionTarget && c.actionTarget.label; c.act(); return { n: c.benches.length, l, s: !!c.sitting }; });
  ok(sentar.n >= 6 && /Sentarse/.test(sentar.l) && sentar.s, `Ciudad: junto a una banca aparece «${sentar.l}» y te sientas (${sentar.n} bancas)`);
  ok(await esperar(p, () => { const c = window.__g3d.ciudad; return c.sitting && Math.abs(c.hero.group.position.x - c.sitting.x) < 0.2; }), "Ciudad: el personaje queda sobre la banca");
  await p.evaluate(() => { window.__g3d.ciudad.joy = { x: 0, y: -1 }; });
  ok(await esperar(p, () => !window.__g3d.ciudad.sitting), "Ciudad: mover el joystick te levanta");
  await p.evaluate(() => { window.__g3d.ciudad.joy = { x: 0, y: 0 }; });
  const mirar = await p.evaluate(() => { const c = window.__g3d.ciudad; const s = c.binocSpots[0]; c.pos.set(s.x, 0.04, s.z); c._pickTarget(); const l = c.actionTarget && c.actionTarget.label; c.act(); return { l, on: c.binoc && c.binoc.on }; });
  ok(/horizonte/.test(mirar.l) && mirar.on, `Ciudad: en la punta del muelle aparece «${mirar.l}» y se mira por los binoculares`);
  ok(await esperar(p, () => Math.abs(window.__g3d.ciudad.camera.position.y - 2.3) < 0.05 && window.__g3d.ciudad.camera.fov < 40), "Ciudad: la cámara sube a los binoculares y hace zoom");
  ok(await p.isVisible(".binoc .bn-exit"), "Ciudad: se ve el botón «Dejar de mirar»");
  await p.click(".binoc .bn-exit");
  ok(await esperar(p, () => !window.__g3d.ciudad.binoc.on && window.__g3d.ciudad.camera.fov === window.__g3d.ciudad.fov), "Ciudad: «Dejar de mirar» vuelve a la cámara de siempre");
  await p.evaluate(() => document.getElementById("ciudad-btn-menu").click());
  await p.waitForTimeout(300);
  await p.evaluate(() => document.getElementById("pause-exit").click());
  await p.waitForTimeout(800);
  // ---- Pueblo (con el muelle y el mirador del lago arreglados) ----
  await p.evaluate(async () => {
    const src = [...document.scripts].map((x) => x.src).find((u) => /\/js\/main\.js/.test(u));
    const A = await import(new URL("adventure.js", src).href);
    const pr = window.__progress(); A.startAdventure(pr); const a = A.adventureOf(pr); a.done["lago.muelle"] = true; a.done["lago.mirador"] = true;
  });
  await p.evaluate(() => [...document.querySelectorAll(".game-card, #game-feature")].find((c) => c.textContent.includes("Pueblo")).click());
  await p.waitForFunction(() => window.__g3d && window.__g3d.town && window.__g3d.town.running, null, { timeout: 40000 });
  await p.waitForTimeout(800);
  await p.evaluate(() => { const s = document.getElementById("town-btn-start"); if (s && s.offsetParent) s.click(); });
  await p.waitForTimeout(1200);
  const ts = await p.evaluate(() => { const g = window.__g3d.town; const bn = g.benches[0]; g.pos.set(bn.x + Math.sin(bn.yaw), 0, bn.z + Math.cos(bn.yaw)); g._pickTarget(); const l = g.target && g.target.label; g.act(); return { n: g.benches.length, l, s: !!g.sitting }; });
  ok(ts.n >= 3 && /Sentarse/.test(ts.l) && ts.s, `Pueblo: junto a una banca de la fuente aparece «${ts.l}» y te sientas (${ts.n} bancas)`);
  ok(await esperar(p, () => { const g = window.__g3d.town; return g.sitting && Math.abs(g.hero.group.position.x - g.sitting.x) < 0.2; }), "Pueblo: el personaje queda sobre la banca");
  await p.evaluate(() => window.__g3d.town.fun.jump());
  ok(!(await p.evaluate(() => !!window.__g3d.town.sitting)), "Pueblo: saltar te levanta");
  for (const [i, nombre] of [[0, "la punta del muelle"], [1, "el mirador"]]) {
    const t = await p.evaluate((i) => { const g = window.__g3d.town; g.zones.refresh(); const s = g.zones.binocSpots[i]; g.pos.set(s.x, 0, s.z); g._pickTarget(); const l = g.target && g.target.label; g.act(); return { l, on: g.binoc && g.binoc.on, y: s.eye.y }; }, i);
    ok(/horizonte/.test(t.l) && t.on, `Pueblo: en ${nombre} se mira por los binoculares`);
    ok(await esperar(p, (y) => Math.abs(window.__g3d.town.camera.position.y - y) < 0.05, t.y), `Pueblo: la vista sube a la altura de ${nombre} (${t.y})`);
    ok(await p.evaluate(() => getComputedStyle(document.getElementById("town-goal")).visibility === "hidden"), "Pueblo: mientras miras se esconden los paneles del juego");
    await p.evaluate(() => { const g = window.__g3d.town; g._pickTarget(); g.act(); });
    ok(await esperar(p, () => !window.__g3d.town.binoc.on), "Pueblo: el botón de acción «Dejar de mirar» sale de los binoculares");
  }
  ok(reg.errores.length === 0, `sin errores (${reg.errores.join(" | ")})`);
  await b.close();
  console.log(fallos ? `\n${fallos} fallos` : "\nTodo bien");
  process.exit(fallos ? 1 : 0);
})();
