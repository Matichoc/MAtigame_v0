// Pueblo Matichoc: parkour (torre y nubes), puertas de juegos (Gato, Sudoku, Cachipún), salto y premios del día.
// Un "robot" camina y salta de verdad por el recorrido con la física del juego. Uso: node scripts/qa/pueblo.cjs [url]
const { abrir, nuevoPerfil, BASE } = require("./lib.cjs");
const OUT = process.env.QA_OUT || "/tmp/qa-pueblo";
require("fs").mkdirSync(OUT, { recursive: true });

(async () => {
  const { b, p, reg } = await abrir({ viewport: { width: 1000, height: 640 } });
  const fallos = [];
  const ok = (cond, texto) => { console.log(`${cond ? "OK " : "MAL"} ${texto}`); if (!cond) fallos.push(texto); };
  await nuevoPerfil(p);
  await p.locator(".game-card, #game-feature", { hasText: "Pueblo" }).first().click();
  await p.waitForTimeout(2500);
  await p.click("#town-btn-start").catch(() => {});
  await p.waitForTimeout(1500);
  const info = await p.evaluate(() => {
    const g = window.__g3d.town;
    const f = g.fun;
    return {
      cursos: f.courses.map((c) => ({ id: c.id, name: c.name, start: c.start, top: c.top })),
      plataformas: f.platforms.length,
      puertas: f.doorSpots,
      tareas: f._tasks().map((t) => t.id),
    };
  });
  console.log(JSON.stringify(info));
  ok(info.cursos.length === 2 && info.plataformas >= 20, `hay 2 recorridos de parkour y ${info.plataformas} plataformas`);
  ok(info.puertas.length === 3, "hay 3 casitas con puerta de juego");
  ok(info.tareas.includes("parkour") && info.tareas.includes("doors"), "las actividades del día incluyen parkour y puertas");

  // 1) física: el robot sube de verdad por cada recorrido
  const subir = (id) => p.evaluate(async (id) => {
    const g = window.__g3d.town;
    const f = g.fun;
    const orden = f.platforms.slice(); // las del recorrido: las que están dentro de su radio de búsqueda
    const c = f.courses.find((x) => x.id === id);
    const mias = orden.filter((pl) => Math.hypot(pl.x - c.top.x, pl.z - c.top.z) < (id === "tower" ? 9 : 40) && (id === "tower" ? true : pl.top > 0 && pl.top <= c.top.top))
      .filter((pl) => (id === "tower" ? true : !f.courses.some((o) => o.id !== id && Math.hypot(pl.x - o.top.x, pl.z - o.top.z) < 9)))
      .sort((a, b) => a.top - b.top);
    const original = g._input;
    const log = [];
    const wait = () => new Promise((r) => setTimeout(r, 30));
    // como lo haría una persona: camina hasta el borde de donde está, salta y se dirige al centro de la siguiente
    const steer = (tx, tz, slow) => {
      const dx = tx - g.pos.x, dz = tz - g.pos.z, d = Math.hypot(dx, dz);
      const k = d < 0.15 ? 0 : Math.min(1, d / slow);
      g._input = () => ({ x: d ? (dx / d) * k : 0, z: d ? (dz / d) * k : 0, mag: k });
      return d;
    };
    let cur = null;
    for (const pl of mias) {
      let t = 0;
      let ok = false;
      // 1) acercarse al punto de salto
      const from = cur || { x: g.pos.x, z: g.pos.z, r: 0 };
      const dx = pl.x - from.x, dz = pl.z - from.z, dd = Math.hypot(dx, dz);
      const edge = cur ? { x: cur.x + (dx / dd) * (cur.r - 0.6), z: cur.z + (dz / dd) * (cur.r - 0.6) } : { x: pl.x - (dx / dd) * 2.6, z: pl.z - (dz / dd) * 2.6 };
      while (t < 8000 && steer(edge.x, edge.z, 1.2) > 0.25) { await wait(); t += 30; }
      g._input = () => ({ x: 0, z: 0, mag: 0 });
      for (let k = 0; k < 20 && Math.hypot(g.vel.x, g.vel.z) > 0.3; k++) { await wait(); t += 30; }
      // 2) saltar y dirigirse al centro
      f.jump();
      while (t < 12000) {
        steer(pl.x, pl.z, 2);
        await wait();
        t += 30;
        if (f.vy <= 0 && f.groundY >= pl.top - 0.05 && Math.hypot(pl.x - g.pos.x, pl.z - g.pos.z) < pl.r) { ok = true; break; }
        if (f.vy === 0 && f.groundY < pl.top - 0.05 && t > 400) break; // aterrizó en otra parte
      }
      // quedarse quieto al centro
      while (ok && t < 14000 && steer(pl.x, pl.z, 1.2) > 0.3) { await wait(); t += 30; }
      log.push([+pl.top.toFixed(2), +f.groundY.toFixed(2), t]);
      if (!ok) break;
      cur = pl;
    }
    g._input = original;
    return { fin: log[log.length - 1], n: mias.length, pos: [g.pos.x, g.pos.y, g.pos.z], hecho: f.st().courses[id] === true, log: log.slice(-3) };
  }, id);
  for (const id of ["tower", "clouds"]) {
    const c = info.cursos.find((x) => x.id === id);
    // se deja al Matichico en el suelo junto a la primera plataforma
    await p.evaluate((c) => { const g = window.__g3d.town; g.pos.set(c.start.x + 2.5, 0, c.start.z + 2.5); g.fun.vy = 0; }, c);
    const coins0 = await p.evaluate(() => window.__g3d.town.progress.coins);
    const r = await subir(id);
    console.log(id, JSON.stringify(r));
    await p.screenshot({ path: `${OUT}/${id}-cima.png` });
    ok(r.hecho, `parkour ${id}: el robot llegó a la cima saltando y se registró el logro`);
    const coins1 = await p.evaluate(() => window.__g3d.town.progress.coins);
    ok(coins1 - coins0 >= 10, `parkour ${id}: dio el premio (+${coins1 - coins0})`);
    // caer al piso: se baja de la plataforma sin trabarse
    await p.evaluate((c) => { const g = window.__g3d.town; g.pos.x = c.top.x + 8; g.pos.z = c.top.z + 8; }, c);
    let cayo = false;
    for (let k = 0; k < 40 && !cayo; k++) { await p.waitForTimeout(250); cayo = await p.evaluate(() => window.__g3d.town.pos.y < 0.05); }
    ok(cayo, `parkour ${id}: al salir de la plataforma el Matichico cae al piso`);
  }

  // 2) puertas: se llega, aparece el botón de acción y se abre el juego
  for (const d of info.puertas) {
    await p.evaluate((d) => { const g = window.__g3d.town; g.pos.set(d.x, 0, d.z); g.fun.vy = 0; }, d);
    await p.waitForTimeout(500);
    const t = await p.evaluate(() => { const g = window.__g3d.town; return g.target && { kind: g.target.kind, puzzle: g.target.puzzle, label: g.target.label }; });
    ok(t && t.kind === "puzzle" && t.puzzle === d.id, `puerta ${d.id}: al llegar aparece "${t && t.label}"`);
  }
  const abrir2 = async (id) => {
    const d = info.puertas.find((x) => x.id === id);
    await p.evaluate((d) => { const g = window.__g3d.town; g.pos.set(d.x, 0, d.z); g.fun.vy = 0; }, d);
    await p.waitForTimeout(400);
    await p.evaluate(() => { const g = window.__g3d.town; g._pickTarget(); g.act(); });
    await p.waitForTimeout(300);
  };
  const visible = () => p.evaluate(() => !document.getElementById("puzzle-dialog").classList.contains("hidden"));
  const estado = () => p.evaluate(() => document.getElementById("puzzle-status").textContent);
  const premio = (id) => p.evaluate((id) => !!window.__g3d.town.fun.st().doors[id], id);

  // Gato: se juega hasta que termine (con jugadas al azar); se puede ganar o perder, pero debe terminar bien
  await abrir2("gato");
  ok(await visible() && (await p.$$eval("#puzzle-board .pz-cell", (c) => c.length)) === 9, "gato: se abre con 9 casilleros");
  let fin = false;
  for (let k = 0; k < 40 && !fin; k++) {
    const libres = await p.$$("#puzzle-board .pz-cell:not([disabled])");
    if (!libres.length) { fin = true; break; }
    await libres[Math.floor(Math.random() * libres.length)].click();
    await p.waitForTimeout(700);
    fin = /Ganaste|Ganó la máquina|Empate/.test(await estado());
  }
  ok(fin, `gato: la partida termina (${await estado()})`);
  await p.click("#puzzle-again");
  ok((await p.$$eval("#puzzle-board .pz-cell:not([disabled])", (c) => c.length)) === 9, "gato: 'Otra vez' deja el tablero limpio");
  await p.screenshot({ path: `${OUT}/gato.png` });
  await p.click("#puzzle-close");
  ok(!(await visible()), "gato: 'Salir' cierra el cuadro");

  // Sudoku: con la pista se resuelve entero
  await abrir2("sudoku");
  ok(await visible() && (await p.$$eval("#puzzle-board .pz-s", (c) => c.length)) === 16, "sudoku: se abre con 16 casilleros");
  const pistas0 = await p.$$eval("#puzzle-board .pz-s.given", (c) => c.length);
  ok(pistas0 >= 6 && pistas0 <= 9, `sudoku: empieza con ${pistas0} dibujos de pista`);
  await p.screenshot({ path: `${OUT}/sudoku.png` });
  for (let k = 0; k < 16 && !/Resuelto/.test(await estado()); k++) await p.click("#puzzle-dialog .pz-extra");
  ok(/Resuelto/.test(await estado()), `sudoku: se resuelve con las pistas (${await estado()})`);
  ok(await premio("sudoku"), "sudoku: dio el premio del día");
  await p.click("#puzzle-close");

  // Cachipún
  await abrir2("cachipun");
  ok(await visible(), "cachipún: se abre");
  for (let k = 0; k < 30 && !/Ganaste el Cachipún|Ganó la máquina/.test(await estado()); k++) {
    const btns = await p.$$("#puzzle-board .pz-key:not([disabled])");
    if (!btns.length) break;
    await btns[k % 3].click();
    await p.waitForTimeout(120);
  }
  ok(/Ganaste el Cachipún|Ganó la máquina/.test(await estado()), `cachipún: la serie termina (${await estado()})`);
  await p.screenshot({ path: `${OUT}/cachipun.png` });
  await p.click("#puzzle-close");

  // tareas del día reflejan lo hecho
  const tareas = await p.evaluate(() => window.__g3d.town.fun._tasks().filter((t) => t.id === "parkour" || t.id === "doors").map((t) => `${t.id} ${t.cur}/${t.goal}`));
  console.log(tareas.join(" · "));
  ok(tareas.some((x) => x.startsWith("parkour 2/2")), "actividad parkour: 2/2");

  // vistas para revisar a ojo
  await p.evaluate(() => { const g = window.__g3d.town; g.pos.set(0, 0, 16); g.fun.vy = 0; });
  ok(reg.errores.length === 0 && reg.externas.length === 0, `0 errores de consola (${reg.errores.length}${reg.errores[0] ? ": " + reg.errores[0].slice(0, 160) : ""}) y 0 peticiones externas (${reg.externas.length})`);
  await b.close();
  console.log(fallos.length ? `\nFALLAN ${fallos.length}` : "\nTodo OK");
  process.exit(fallos.length ? 1 : 0);
})();
