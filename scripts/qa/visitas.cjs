// Visitas por dentro a las casas de los vecinos (js/interiors.js): en el Pueblo (Bombi, Capi Menta y Don Cuchufli) y en
// la Ciudad (Doña Rosa y Don Pepe). Entrar por la puerta, hablar con el vecino, encontrar las 3 cosas escondidas, cobrar
// el premio del día (+40 Matipuntos y una ⭐) una sola vez, sentarse en el sillón y salir frente a la puerta.
// Uso: NODE_PATH=$(npm root -g) node scripts/qa/visitas.cjs [url]   (deja capturas en maquetas/visita-*.png)
const { abrir, nuevoPerfil } = require("./lib.cjs");
const path = require("path");

let fallos = 0;
const ok = (c, t) => { console.log(`${c ? "OK " : "MAL"} ${t}`); if (!c) fallos++; };
const esperar = (p, fn, arg) => p.waitForFunction(fn, arg, { timeout: 20000 }).then(() => true).catch(() => false);
const foto = (p, n) => p.screenshot({ path: path.join(__dirname, "..", "..", "maquetas", `visita-${n}.png`) });

/** Hace toda la visita en el juego `id` (town o ciudad) con su función para leer la etiqueta del botón de acción. */
async function visita(p, id, nombre, casa) {
  const G = `window.__g3d.${id}`;
  const label = `(${G}.target || ${G}.actionTarget || {}).label`;
  const pick = (fn) => p.evaluate(`(() => { const g = ${G}; (${fn})(g); g._pickTarget(); return ${label}; })()`);
  const act = () => p.evaluate(`${G}.act()`);
  const V = `${G}.visits`;
  // hablar: pasa todas las frases del diálogo (cada toque es la siguiente)
  const hablar = async () => {
    await pick((g) => { const h = g.visits.active.host.position; g.pos.x = h.x; g.pos.z = h.z + 1.4; });
    const l = await p.evaluate(`(${G}._pickTarget(), ${label})`);
    await act();
    const textos = [];
    for (let i = 0; i < 8; i++) {
      const t = await p.evaluate(`(() => { const d = document.getElementById("${id}-dialog"); return d && !d.classList.contains("hidden") ? d.querySelector(".td-text").textContent : null; })()`);
      if (t == null) break;
      textos.push(t);
      await act();
    }
    return { l, textos };
  };

  ok(/Visitar a/.test(casa.l), `${nombre}: frente a la puerta aparece «${casa.l}»`);
  await act();
  ok(await p.evaluate(`!!${V}.active`), `${nombre}: se entra a la casa`);
  await esperar(p, (g) => { const c = window.__g3d[g].camera.position; return c.z < -880; }, id);
  await p.waitForTimeout(800);
  await foto(p, `${id}-pieza`);
  const c0 = await p.evaluate("window.__progress().coins");
  const s0 = await p.evaluate(`(window.__progress().adventure || {}).stars || 0`);
  const h1 = await hablar();
  ok(/Hablar con/.test(h1.l) && h1.textos.length >= 3, `${nombre}: junto al vecino «${h1.l}» y cuenta ${h1.textos.length} frases (${h1.textos[h1.textos.length - 1]})`);
  ok(await p.evaluate(`${V}.active.items.length === 3`), `${nombre}: al terminar de hablar quedan 3 cosas escondidas en la pieza`);
  await foto(p, `${id}-buscar`);
  const h2 = await hablar();
  ok(/faltan 3/.test(h2.textos[0] || ""), `${nombre}: si le hablas antes de encontrarlas, te recuerda cuántas faltan`);
  for (let i = 0; i < 3; i++) {
    await p.evaluate(`(() => { const a = ${V}.active; const it = a.items[${i}]; const r = a.room.position; ${G}.pos.x = r.x + it.x; ${G}.pos.z = r.z + it.z; })()`);
    ok(await esperar(p, ([g, i]) => window.__g3d[g].visits.active.items[i].got, [id, i]), `${nombre}: encuentra la cosa ${i + 1}`);
  }
  // atravesar muebles no se puede: la cama queda fuera
  const dentro = await p.evaluate(`(() => { const a = ${V}.active; const r = a.room.position; const q = { x: r.x + 4.8, z: r.z + 2.6 }; ${V}.clamp(q); return Math.abs(q.x - r.x - 4.8) > 1 || Math.abs(q.z - r.z - 2.6) > 1.4; })()`);
  ok(dentro, `${nombre}: los muebles no se atraviesan`);
  const h3 = await hablar();
  const c1 = await p.evaluate("window.__progress().coins");
  const s1 = await p.evaluate(`(window.__progress().adventure || {}).stars || 0`);
  ok(c1 - c0 === 40 && s1 - s0 === 1, `${nombre}: al entregarlas da +40 Matipuntos y una ⭐ (${c1 - c0}, ${s1 - s0})`);
  ok(await p.evaluate(`${V}.doneToday(${V}.active.key)`), `${nombre}: queda anotada como hecha hoy`);
  const h4 = await hablar();
  const c2 = await p.evaluate("window.__progress().coins");
  ok(c2 === c1 && /mañana/i.test(h4.textos.join(" ")), `${nombre}: la segunda vez el mismo día no da otro premio («${h4.textos[0]}»)`);
  void h3;
  // el sillón
  const sofa = await pick((g) => { const b = g.visits.active.benches[0]; g.pos.x = b.x; g.pos.z = b.z + 1; });
  await act();
  ok(/Sentarse/.test(sofa) && (await p.evaluate(`!!${G}.sitting`)), `${nombre}: en el sillón «${sofa}» y se sienta`);
  await p.evaluate(`(${G}._pickTarget(), ${G}.act())`); // levantarse
  ok(!(await p.evaluate(`!!${G}.sitting`)), `${nombre}: se levanta del sillón`);
  // salir
  await p.evaluate(`window.__pieza = ${V}.active.room; window.__vecino = ${V}.active.host;`);
  const salir = await pick((g) => { const r = g.visits.active.room.position; g.pos.x = r.x; g.pos.z = r.z + 3.9; });
  await act();
  const fuera = await p.evaluate(`(() => { const g = ${G}; return { a: !!g.visits.active, x: g.pos.x, z: g.pos.z, rooms: [window.__pieza, window.__vecino].filter((o) => o.parent).length }; })()`);
  ok(/Salir/.test(salir) && !fuera.a && Math.hypot(fuera.x - casa.x, fuera.z - casa.z) < 0.5, `${nombre}: «${salir}» vuelve frente a la puerta`);
  ok(fuera.rooms === 0, `${nombre}: la pieza se desarma al salir (${fuera.rooms} restos)`);
  await esperar(p, (g) => { const x = window.__g3d[g]; return x.camera.position.z > -800 && x.hero.group.position.distanceTo(x.pos) < 0.2; }, id);
  await p.waitForTimeout(400);
  await foto(p, `${id}-afuera`);
}

(async () => {
  const { b, p, reg } = await abrir({ viewport: { width: 915, height: 412 }, touch: true });
  await nuevoPerfil(p);
  // ---- Pueblo ----
  await p.evaluate(() => [...document.querySelectorAll(".game-card, #game-feature")].find((c) => c.textContent.includes("Pueblo")).click());
  await p.waitForFunction(() => window.__g3d && window.__g3d.town && window.__g3d.town.running, null, { timeout: 40000 });
  await p.waitForTimeout(800);
  await p.evaluate(() => { const s = document.getElementById("town-btn-start"); if (s && s.offsetParent) s.click(); });
  await p.waitForTimeout(1200);
  const casas = await p.evaluate(() => window.__g3d.town.interact.filter((i) => i.kind === "visit").map((i) => ({ id: i.visit, x: i.x, z: i.z, l: i.label })));
  ok(casas.length === 3, `Pueblo: hay 3 casitas para visitar (${casas.map((c) => c.l).join(", ")})`);
  // que ningún árbol, juego ni casa quede encima de las casitas nuevas
  const choque = await p.evaluate(() => { const g = window.__g3d.town; const v = g.interact.filter((i) => i.kind === "visit"); return g.interact.filter((i) => i.kind !== "visit").some((o) => v.some((c) => Math.hypot(o.x - c.x, o.z - c.z) < 5)); });
  ok(!choque, "Pueblo: las casitas no quedan encima de otros lugares");
  const c = casas[0];
  const l = await p.evaluate((c) => { const g = window.__g3d.town; g.pos.set(c.x, 0, c.z); g._pickTarget(); return g.target && g.target.label; }, c);
  await esperar(p, () => { const g = window.__g3d.town; return g.hero.group.position.distanceTo(g.pos) < 0.2 && g.camFocus.distanceTo(g.pos) < 1.6; });
  await foto(p, "town-puerta");
  await visita(p, "town", "Pueblo", { ...c, l });
  await p.evaluate(() => document.getElementById("town-btn-menu").click());
  await p.waitForTimeout(300);
  await p.evaluate(() => document.getElementById("pause-exit").click());
  await p.waitForTimeout(800);
  // ---- Ciudad ----
  await p.evaluate(() => { const pr = window.__progress(); pr.unlockedGames = [...new Set([...(pr.unlockedGames || []), "ciudad"])]; pr.energy = 200; });
  await p.evaluate(() => [...document.querySelectorAll(".game-card, #game-feature")].find((c) => c.textContent.includes("Ciudad")).click());
  await p.waitForFunction(() => window.__g3d && window.__g3d.ciudad && window.__g3d.ciudad.running, null, { timeout: 40000 });
  await p.waitForTimeout(600);
  await p.evaluate(() => document.getElementById("ciudad-btn-start").click());
  await p.waitForTimeout(1200);
  // frente a Doña Rosa se sigue pudiendo hablar con ella (la puerta solo gana si estás más cerca de la puerta)
  const rosa = await p.evaluate(() => { const g = window.__g3d.ciudad; g.pos.set(-30, 0.04, 44); g._pickTarget(); return g.actionTarget && g.actionTarget.label; });
  ok(/Hablar con Doña Rosa/.test(rosa), `Ciudad: delante de Doña Rosa sigue apareciendo «${rosa}»`);
  for (const d of [{ id: "pepe", x: -31, z: -42.9 }, { id: "rosa", x: -30, z: 46.9 }]) {
    const l2 = await p.evaluate((d) => { const g = window.__g3d.ciudad; g.pos.set(d.x, 0.04, d.z); g._pickTarget(); return g.actionTarget && g.actionTarget.label; }, d);
    if (d.id === "pepe") {
      await esperar(p, () => { const g = window.__g3d.ciudad; return g.hero.group.position.distanceTo(g.pos) < 0.2 && g.camFocus && Math.hypot(g.camFocus.x - g.pos.x, g.camFocus.z - g.pos.z) < 0.3; });
      await foto(p, "ciudad-puerta");
      await visita(p, "ciudad", "Ciudad", { ...d, l: l2 });
    } else ok(/Visitar a Doña Rosa/.test(l2), `Ciudad: en la puerta de Doña Rosa aparece «${l2}»`);
  }
  ok(reg.errores.length === 0, `sin errores (${reg.errores.join(" | ")})`);
  await b.close();
  console.log(fallos ? `\n${fallos} fallos` : "\nTodo bien");
  process.exit(fallos ? 1 : 0);
})();
