// Prueba en el navegador los dos modos nuevos (Pichanga 3 contra 3 y Básquet 2 contra 2): se abren desde Fútbol y desde
// Lanzamientos, se juegan con teclado y con botones táctiles, la pausa detiene el reloj, el partido termina y guarda el
// resultado, la copa avanza y se conserva al cerrar y reabrir, y aguantan girar la pantalla. Sin conexiones externas.
// Uso: NODE_PATH=$(npm root -g) node scripts/qa/deportes.cjs [url-base] [carpeta-capturas]
const { abrir, nuevoPerfil, BASE } = require("./lib.cjs");
const fs = require("fs");
const CAPTURAS = process.argv[3] || "";

let fallos = 0;
const ok = (c, t) => { console.log(`${c ? "OK " : "MAL"} ${t}`); if (!c) fallos++; };
const foto = async (p, n) => { if (CAPTURAS) { fs.mkdirSync(CAPTURAS, { recursive: true }); await p.screenshot({ path: `${CAPTURAS}/${n}.png` }); } };

const MODOS = [
  { id: "pichanga", pre: "pichanga", abrir: "futbol-btn-pichanga", nombre: "Pichanga" },
  { id: "basquet2v2", pre: "bq2", abrir: "basquet-btn-2v2", nombre: "Básquet 2v2" },
];

async function probarModo(p, reg, M, vertical) {
  const g = (fn, arg) => p.evaluate(fn, arg);
  const est = () => g((id) => { const x = window.__g3d[id]; return { state: x.state, time: x.m.time, score: [...x.m.score], paused: x.paused, owner: x.m.ball.owner ? x.m.ball.owner.team : -1, human: x.m.human ? x.m.human.id : -1 }; }, M.id);
  await g((id) => document.getElementById(id).click(), M.abrir);
  await p.waitForFunction((id) => window.__g3d && window.__g3d[id] && window.__g3d[id].ready && window.__g3d[id].running, M.id, { timeout: 40000 });
  await p.waitForTimeout(500);
  ok(await p.isVisible(`#${M.pre}-overlay-intro`), `${M.nombre}: se abre con su tarjeta (modo y dificultad)`);
  // dificultad accesible y partido amistoso
  await p.click(`#${M.pre}-intro-opts .mt-row:nth-of-type(2) .mode-btn:nth-of-type(1)`);
  ok(await g((id) => window.__progress().sports[id].diff, M.id) === "accesible", `${M.nombre}: la dificultad elegida se guarda`);
  await foto(p, `${M.id}-intro${vertical ? "-vertical" : ""}`);
  await p.click(`#${M.pre}-btn-start`);
  await p.waitForTimeout(500);
  let e = await est();
  ok(e.state === "playing", `${M.nombre}: empieza el partido`);
  if (vertical) {
    ok(await p.isVisible(`#${M.pre}-btn-pass`) && await p.isVisible(`#${M.pre}-btn-shoot`) && await p.isVisible(`#${M.pre}-joy`), `${M.nombre}: en pantalla táctil se ven joystick y botones`);
    const box = await p.locator(`#${M.pre}-btn-pass`).boundingBox();
    ok(box && box.width >= 60 && box.x + box.width <= 412 && box.y + box.height <= 860, `${M.nombre}: los botones son grandes y caben en la pantalla (${box && Math.round(box.width)} px)`);
    // tocar "pase" con el dedo (el juego escucha pointerdown): al empezar, la pelota la tienes tú (saque)
    await p.waitForTimeout(1600);
    const quien = await g((id) => { const m = window.__g3d[id].m; return m.ball.owner ? m.ball.owner.id : -1; }, M.id);
    await p.dispatchEvent(`#${M.pre}-btn-pass`, "pointerdown", { pointerId: 7, isPrimary: true });
    await p.waitForTimeout(500);
    const despues = await g((id) => { const m = window.__g3d[id].m; return { owner: m.ball.owner ? m.ball.owner.id : -1, kind: m.ball.kind }; }, M.id);
    ok(despues.owner !== quien || despues.kind === "pass", `${M.nombre}: tocar «Pase» con el dedo pasa la pelota (${quien} → ${despues.owner}, ${despues.kind})`);
  } else {
    // teclado: mover, pasar, tirar
    await p.keyboard.down("ArrowUp");
    await p.waitForTimeout(700);
    await p.keyboard.up("ArrowUp");
    await p.keyboard.press("Space");
    await p.waitForTimeout(900);
    await p.keyboard.down("k");
    await p.waitForTimeout(450);
    await p.keyboard.up("k");
    await p.waitForTimeout(900);
  }
  // el pase apretado durante el saque queda guardado y sale al terminar el saque: en el navegador de prueba sin tarjeta
  // gráfica el juego avanza lento, así que se espera a que la jugada se registre (con un tope) en vez de un tiempo fijo
  await p.waitForFunction((id) => { const x = window.__g3d[id]; const s = x.m.stats; return (id === "pichanga" ? s.passes[0] + s.shots[0] : s.passes[0] + s.att[0] + s.steals[0]) > 0; }, M.id, { timeout: 30000 }).catch(() => {});
  const st = await g((id) => { const x = window.__g3d[id]; return x.m.stats; }, M.id);
  const acciones = M.id === "pichanga" ? st.passes[0] + st.shots[0] : st.passes[0] + st.att[0] + st.steals[0];
  ok(acciones > 0, `${M.nombre}: tus botones hacen jugadas (pases o tiros) en los primeros segundos (${acciones})`);
  await foto(p, `${M.id}-juego${vertical ? "-vertical" : ""}`);
  // pausa: el reloj no avanza
  await p.click(`#${M.pre}-btn-pause`);
  const t1 = (await est()).time;
  await p.waitForTimeout(900);
  const t2 = (await est()).time;
  ok(await p.isVisible(`#${M.pre}-overlay-pause`) && t1 === t2, `${M.nombre}: la pausa detiene el reloj`);
  await p.click(`#${M.pre}-btn-resume`);
  await p.waitForTimeout(400);
  ok(!(await est()).paused, `${M.nombre}: se sigue jugando después de la pausa`);
  // ir a segundo plano y volver: el partido sigue
  await g(() => { Object.defineProperty(document, "visibilityState", { value: "hidden", configurable: true }); document.dispatchEvent(new Event("visibilitychange")); });
  await g(() => { Object.defineProperty(document, "visibilityState", { value: "visible", configurable: true }); document.dispatchEvent(new Event("visibilitychange")); });
  await p.waitForTimeout(400);
  ok((await est()).state === "playing", `${M.nombre}: al volver de segundo plano el partido sigue`);
  // fin del partido: 2 a 1 para ti
  const jugados0 = await g((id) => window.__progress().sports[id].played, M.id);
  const xp0 = await g(() => window.__progress().xp);
  await g((id) => { const x = window.__g3d[id]; x.m.score = [2, 1]; x.m.time = 0.02; }, M.id);
  // (al volver de segundo plano hay una pausa corta de 1,6 s de juego; en el navegador de prueba sin tarjeta gráfica, en
  // pantalla grande, eso puede tardar bastante más en tiempo real)
  await p.waitForSelector(`#${M.pre}-overlay-gameover:not(.hidden)`, { timeout: 60000 }).catch(() => {});
  ok(await p.isVisible(`#${M.pre}-overlay-gameover`) && /Ganaste/.test(await p.textContent(`#${M.pre}-gameover-title`)), `${M.nombre}: termina y muestra el resultado`);
  ok(await g((id) => window.__progress().sports[id].played, M.id) === jugados0 + 1 && await g(() => window.__progress().xp) > xp0, `${M.nombre}: guarda el partido y da XP`);
  await foto(p, `${M.id}-final${vertical ? "-vertical" : ""}`);
  // copa: ganar el primer partido pasa a la semifinal
  await p.click(`#${M.pre}-btn-gameover-menu`);
  await p.waitForTimeout(500);
}

(async () => {
  // ---------- horizontal, con teclado ----------
  {
    const { b, p, reg } = await abrir({ viewport: { width: 1000, height: 600 } });
    await nuevoPerfil(p);
    for (const M of MODOS) await probarModo(p, reg, M, false);
    // copa de la pichanga: ganar avanza de ronda y se guarda al reabrir
    await p.evaluate(() => document.getElementById("futbol-btn-pichanga").click());
    await p.waitForFunction(() => window.__g3d.pichanga.running, null, { timeout: 30000 });
    await p.waitForTimeout(400);
    await p.click("#pichanga-intro-opts .mt-row:nth-of-type(1) .mode-btn:nth-of-type(2)");
    ok(/Cuartos/.test(await p.textContent("#pichanga-intro-opts")), "copa: muestra la ronda (cuartos de final)");
    await p.click("#pichanga-btn-start");
    await p.waitForTimeout(400);
    await p.evaluate(() => { const x = window.__g3d.pichanga; x.m.score = [3, 0]; x.m.time = 0.02; });
    await p.waitForTimeout(900);
    ok(/semifinal/i.test(await p.textContent("#pichanga-gameover-text")) && /Siguiente partido/.test(await p.textContent("#pichanga-btn-retry")), "copa: ganar pasa a la semifinal");
    // empate al final del tiempo en la copa: gol de oro (no termina)
    await p.click("#pichanga-btn-retry");
    await p.waitForTimeout(500);
    await p.evaluate(() => { const x = window.__g3d.pichanga; x.m.score = [1, 1]; x.m.time = 0.02; });
    await p.waitForTimeout(800);
    ok(await p.evaluate(() => window.__g3d.pichanga.m.goldenOn && window.__g3d.pichanga.state === "playing"), "copa: empate → gol de oro, el partido sigue");
    await p.click("#pichanga-btn-menu");
    await p.waitForTimeout(500);
    await p.reload({ waitUntil: "networkidle" });
    await p.waitForTimeout(600);
    ok(await p.evaluate(() => window.__progress().sports.pichanga.cup.round) === 1, "copa: al reabrir la app sigue en la semifinal");
    ok(reg.externas.length === 0, `horizontal: sin conexiones externas (${reg.externas.length})`);
    ok(reg.errores.length === 0, `horizontal: sin errores (${reg.errores.join(" | ")})`);
    await b.close();
  }
  // ---------- celular vertical, táctil, y giro a horizontal ----------
  {
    const { b, p, reg } = await abrir({ viewport: { width: 412, height: 860 }, touch: true, sinRed: true });
    await nuevoPerfil(p);
    for (const M of MODOS) {
      await probarModo(p, reg, M, true);
    }
    // girar el celular a mitad de partido
    await p.evaluate(() => document.getElementById("basquet-btn-2v2").click());
    await p.waitForFunction(() => window.__g3d.basquet2v2.running, null, { timeout: 30000 });
    await p.click("#bq2-btn-start");
    await p.waitForTimeout(600);
    await p.setViewportSize({ width: 860, height: 412 });
    await p.waitForTimeout(900);
    const asp = await p.evaluate(() => window.__g3d.basquet2v2.camera.aspect);
    ok(asp > 1.2 && await p.evaluate(() => window.__g3d.basquet2v2.state === "playing"), `girar el celular: la cámara se adapta y el partido sigue (aspecto ${asp.toFixed(2)})`);
    await foto(p, "basquet2v2-girado");
    await p.setViewportSize({ width: 412, height: 860 });
    await p.waitForTimeout(600);
    ok(await p.evaluate(() => window.__g3d.basquet2v2.camera.aspect < 0.95), "volver a vertical: la cámara se adapta");
    ok(reg.externas.length === 0, `vertical: sin conexiones externas (${reg.externas.length})`);
    ok(reg.errores.length === 0, `vertical: sin errores (${reg.errores.join(" | ")})`);
    await b.close();
  }
  console.log(fallos ? `\n${fallos} prueba(s) fallaron` : "\nTodo bien");
  process.exit(fallos ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
