// "Jugador humano" simulado para medir la dificultad de los partidos como la siente una persona con el dedo en la pantalla:
// decide cada ~0,4 s (no al instante), mueve el joystick con error de dirección, tarda en tirar y en quitar.
// (El robot "perfecto" de antes ganaba siempre y por eso los partidos quedaron difíciles para personas reales.)
// Uso: node scripts/qa/jugador-humano.mjs   → tabla de resultados por dificultad
import * as PI from "../../js/pichanga-sim.js";
import * as BQ from "../../js/basquet2v2-sim.js";

function rng(seed) { let a = seed; return () => { a = (a * 16807) % 2147483647; return a / 2147483647; }; }
const norm = (x, z) => { const l = Math.hypot(x, z) || 1; return [x / l, z / l]; };
const ruido = (r, x, z, grados) => { const a = Math.atan2(z, x) + (r() - 0.5) * 2 * (grados * Math.PI / 180); return [Math.cos(a), Math.sin(a)]; };

/** Persona jugando Pichanga. */
export function humanoPichanga(seed, nivel = 1) {
  const r = rng(seed);
  let t = 0, prox = 0, dir = [0, 0], tiroEn = -1, quitarEn = 0;
  const reac = 0.45 / nivel; // un niño o alguien aprendiendo: ~0,45 s
  return (m, dt) => {
    t += dt;
    const h = m.human, b = m.ball, inp = {};
    if (!h) return inp;
    if (t >= prox) {
      prox = t + reac * (0.7 + r() * 0.6);
      let tx, tz;
      if (b.owner === h) {
        tx = PI.PITCH.L / 2 - h.x; tz = -h.z * 0.4;
        const presion = m.players.some((q) => q.team === 1 && q.role === "f" && Math.hypot(q.x - h.x, q.z - h.z) < 2);
        if (PI.PITCH.L / 2 - h.x < 10 && tiroEn < 0) tiroEn = t + 0.3 + r() * 0.4;
        else if (presion && r() < 0.35) inp.pass = true;
      } else { const o = b.owner || b; tx = o.x - h.x; tz = o.z - h.z; tiroEn = -1; }
      dir = ruido(r, ...norm(tx, tz), 25);
      if (m.restart && m.restart.taker === h) inp.pass = true;
    }
    if (tiroEn > 0 && t >= tiroEn && b.owner === h) { inp.shoot = true; inp.power = 0.6 + r() * 0.4; tiroEn = -1; }
    if (b.owner && b.owner.team === 1 && Math.hypot(b.owner.x - h.x, b.owner.z - h.z) < 1.8 && t >= quitarEn) { inp.pass = true; quitarEn = t + 0.7 + r() * 0.5; }
    inp.mx = dir[0] * 0.85; inp.mz = dir[1] * 0.85;
    return inp;
  };
}

/** Persona jugando Básquet 2 contra 2. */
export function humanoBasquet(seed, nivel = 1) {
  const r = rng(seed);
  let t = 0, prox = 0, dir = [0, 0], cargando = -1, soltar = 0, robarEn = 0;
  const reac = 0.45 / nivel;
  const C = BQ.COURT;
  return (m, dt) => {
    t += dt;
    const h = m.human, b = m.ball, inp = {};
    if (!h) return inp;
    if (t >= prox) {
      prox = t + reac * (0.7 + r() * 0.6);
      let tx, tz;
      if (b.owner === h) {
        if (m.mustClear === 0) { tx = 0 - h.x; tz = C.hoopZ + 7 - h.z; }
        else { tx = 0 - h.x; tz = C.hoopZ + 1.6 - h.z; }
        if (m.mustClear !== 0 && Math.hypot(h.x, h.z - C.hoopZ) < 3.2 && cargando < 0) { cargando = t; soltar = t + 0.35 + r() * 0.35; }
        else if (r() < 0.12) inp.pass = true;
      } else { const o = b.owner || b; tx = o.x - h.x; tz = o.z - h.z; cargando = -1; }
      dir = ruido(r, ...norm(tx, tz), 25);
    }
    if (cargando >= 0 && b.owner === h) { inp.shootHold = t < soltar; if (t >= soltar) cargando = -1; }
    if (b.owner && b.owner.team === 1 && Math.hypot(b.owner.x - h.x, b.owner.z - h.z) < 1.8 && t >= robarEn) { inp.pass = true; robarEn = t + 0.7 + r() * 0.5; }
    if (!b.owner && b.kind === "loose" && Math.hypot(b.x - h.x, b.z - h.z) < 1.5 && r() < 0.05) inp.shootPress = true;
    inp.mx = dir[0] * 0.85; inp.mz = dir[1] * 0.85;
    return inp;
  };
}

/** Juega n partidos y devuelve { gana, empata, pierde, favor, contra }. */
export function medir(Sim, crearHumano, diff, n = 40, extra = {}) {
  const res = { gana: 0, empata: 0, pierde: 0, favor: 0, contra: 0 };
  for (let s = 1; s <= n; s++) {
    const m = Sim.createMatch({ seed: 1000 + s, difficulty: diff, ...extra });
    const humano = crearHumano(s);
    let i = 0;
    while (!m.over && i < 60 * 400) { Sim.stepMatch(m, 1 / 60, humano(m, 1 / 60)); i++; }
    res.favor += m.score[0]; res.contra += m.score[1];
    if (m.score[0] > m.score[1]) res.gana++; else if (m.score[0] < m.score[1]) res.pierde++; else res.empata++;
  }
  return res;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  for (const [nombre, Sim, h] of [["Pichanga", PI, humanoPichanga], ["Básquet 2v2", BQ, humanoBasquet]]) {
    for (const d of ["accesible", "normal", "desafio"]) {
      const r = medir(Sim, h, d);
      console.log(`${nombre.padEnd(12)} ${d.padEnd(10)} gana ${r.gana}/40 · empata ${r.empata} · pierde ${r.pierde} · promedio ${(r.favor / 40).toFixed(1)} a ${(r.contra / 40).toFixed(1)}`);
    }
  }
}
