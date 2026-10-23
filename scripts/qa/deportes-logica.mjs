// Prueba la lógica de los partidos (Pichanga 3 contra 3 y Básquet 2 contra 2) sin navegador: miles de segundos de
// partido con IA, más jugadas armadas a mano (pase, tiro, robo, saques, reglas). Revisa que no haya números rotos, que
// la pelota y los jugadores no se queden trabados, que los saques siempre se hagan y que los partidos terminen.
// Uso: node scripts/qa/deportes-logica.mjs   (sale con código 1 si algo falla)
import * as PI from "../../js/pichanga-sim.js";
import * as BQ from "../../js/basquet2v2-sim.js";

let fallos = 0;
const ok = (c, t) => { console.log(`${c ? "OK " : "MAL"} ${t}`); if (!c) fallos++; };
const fin = (x) => Number.isFinite(x);

// ======================= PICHANGA =======================
{
  const { PITCH } = PI;
  let goles = 0, partidos = 0, roto = 0, trabada = 0, sinSaque = 0, afuera = 0, terminados = 0, maxQuieta = 0, maxSaque = 0;
  let pases = 0, robos = 0, atajadas = 0, saques = { kickoff: 0, kickin: 0, goalkick: 0, corner: 0 };
  let ganaCasa = 0, ganaVisita = 0;
  for (let seed = 1; seed <= 120; seed++) {
    const m = PI.createMatch({ seed, aiOnly: true, difficulty: ["accesible", "normal", "desafio"][seed % 3] });
    partidos++;
    let quieta = 0, saque = 0, pasos = 0;
    while (!m.over && pasos < 60 * 400) {
      PI.stepMatch(m, 1 / 60);
      pasos++;
      const b = m.ball;
      for (const p of m.players) if (!fin(p.x) || !fin(p.z) || !fin(p.vx)) roto++;
      if (!fin(b.x) || !fin(b.z) || !fin(b.h)) roto++;
      if (!b.owner && !m.restart && m.pause <= 0 && Math.hypot(b.vx, b.vz) < 0.3) quieta += 1 / 60; else quieta = 0;
      maxQuieta = Math.max(maxQuieta, quieta);
      if (m.restart) saque += 1 / 60; else saque = 0;
      maxSaque = Math.max(maxSaque, saque);
      if (!m.restart && m.pause <= 0 && (Math.abs(b.x) > PITCH.L / 2 + 1.5 || Math.abs(b.z) > PITCH.W / 2 + 1.5)) afuera++;
      for (const e of m.events.splice(0)) {
        if (e.type === "goal") goles++;
        if (e.type === "pass") pases++;
        if (e.type === "tackle") robos++;
        if (e.type === "save") atajadas++;
        if (e.type === "restart") saques[e.kind]++;
      }
    }
    if (m.over) terminados++;
    if (quieta > 4) trabada++;
    if (saque > 6) sinSaque++;
    if (m.score[0] > m.score[1]) ganaCasa++; else if (m.score[1] > m.score[0]) ganaVisita++;
  }
  ok(roto === 0, `pichanga: sin números rotos (${roto})`);
  ok(terminados === partidos, `pichanga: los ${partidos} partidos terminan a los 2 minutos`);
  ok(goles / partidos >= 1.5 && goles / partidos <= 14, `pichanga: hay goles (${(goles / partidos).toFixed(1)} por partido)`);
  ok(maxQuieta < 4, `pichanga: ninguna pelota quieta y sola más de 4 s (máximo ${maxQuieta.toFixed(1)} s)`);
  ok(maxSaque < 6, `pichanga: todos los saques se hacen (el más largo, ${maxSaque.toFixed(1)} s)`);
  ok(afuera === 0, `pichanga: la pelota nunca queda afuera sin saque (${afuera})`);
  ok(pases > partidos * 10 && robos > partidos && atajadas > partidos * 0.5, `pichanga: la IA pasa (${pases}), quita (${robos}) y ataja (${atajadas})`);
  ok(Object.values(saques).every((n) => n > 0), `pichanga: hay saques de todo tipo ${JSON.stringify(saques)}`);
  ok(ganaCasa > 10 && ganaVisita > 10, `pichanga IA contra IA: ganan ambos lados (${ganaCasa} / ${ganaVisita})`);

  // los jugadores no persiguen todos la pelota: en defensa, uno presiona y el otro cubre
  {
    const m = PI.createMatch({ seed: 9, aiOnly: true });
    let ambosEncima = 0, muestras = 0;
    for (let i = 0; i < 60 * 60; i++) {
      PI.stepMatch(m, 1 / 60);
      const b = m.ball;
      if (!b.owner || m.restart) continue;
      const def = m.players.filter((p) => p.team !== b.owner.team && p.role === "f");
      muestras++;
      if (def.every((p) => Math.hypot(p.x - b.x, p.z - b.z) < 2.2)) ambosEncima++;
    }
    ok(ambosEncima / muestras < 0.15, `pichanga: los dos defensores casi nunca están encima de la pelota a la vez (${((100 * ambosEncima) / muestras).toFixed(0)} %)`);
  }

  // ---- jugadas armadas ----
  const nuevo = (opts = {}) => {
    const m = PI.createMatch({ seed: 5, ...opts });
    m.events.length = 0;
    return m;
  };
  const correr = (m, seg, input = {}) => { for (let i = 0; i < seg * 60; i++) PI.stepMatch(m, 1 / 60, typeof input === "function" ? input(i) : input); };
  // saque inicial tuyo: con un pase, la pelota sale y la recibe tu compañero
  {
    const m = nuevo();
    ok(m.restart && m.restart.type === "kickoff" && m.ball.owner === m.human, "pichanga: empieza con tu saque inicial (manejas al que saca)");
    correr(m, 0.5);
    PI.stepMatch(m, 1 / 60, { pass: true });
    ok(!m.restart && !m.ball.owner, "pichanga: el pase hace el saque");
    let recibe = null;
    for (let i = 0; i < 180 && !recibe; i++) { PI.stepMatch(m, 1 / 60); if (m.ball.owner) recibe = m.ball.owner; }
    ok(recibe && recibe.team === 0, `pichanga: el pase llega a un compañero (${recibe ? recibe.role : "nadie"})`);
    ok(recibe && (recibe.role === "gk" || m.human === recibe), "pichanga: al recibir tu pase manejas a quien la recibió");
  }
  // tiro desde cerca, con el arquero lejos: gol y saque inicial del rival
  {
    const m = nuevo();
    correr(m, 0.4);
    const h = m.human;
    m.restart = null;
    Object.assign(h, { x: 11, z: 0.3, vx: 0, vz: 0, fx: 1, fz: 0 });
    m.ball.owner = h;
    const k = m.players.find((p) => p.team === 1 && p.role === "gk");
    Object.assign(k, { z: -4.5, stun: 2 });
    PI.stepMatch(m, 1 / 60, { shoot: true, aimSide: 1, power: 1 });
    let gol = false;
    for (let i = 0; i < 120 && !gol; i++) { PI.stepMatch(m, 1 / 60); if (m.events.some((e) => e.type === "goal")) gol = true; }
    ok(gol && m.score[0] === 1, "pichanga: tiro al arco vacío es gol");
    correr(m, 3);
    ok(m.restart && m.restart.type === "kickoff" && m.restart.team === 1, "pichanga: después del gol saca el otro equipo desde el centro");
  }
  // pelota afuera por un costado: saque de banda del otro equipo
  {
    const m = nuevo();
    correr(m, 0.4);
    m.restart = null;
    Object.assign(m.ball, { owner: null, x: 2, z: 9, vx: 0, vz: 6, h: 0, last: m.human, lastTeam: 0 });
    correr(m, 0.3);
    ok(m.restart && m.restart.type === "kickin" && m.restart.team === 1, "pichanga: afuera por el costado → saque de banda del rival");
    correr(m, 3);
    ok(!m.restart, "pichanga: la IA hace el saque de banda");
  }
  // afuera por el fondo: la tiró quien ataca → saque de arco; la tiró quien defiende → córner
  {
    const m = nuevo();
    correr(m, 0.4);
    m.restart = null;
    Object.assign(m.ball, { owner: null, x: 14.5, z: 6, vx: 6, vz: 0, h: 0, last: m.human, lastTeam: 0 });
    correr(m, 0.3);
    ok(m.restart && m.restart.type === "goalkick" && m.restart.team === 1 && m.restart.taker.role === "gk", "pichanga: tu tiro afuera por el fondo → saque de arco del rival");
    const m2 = nuevo();
    correr(m2, 0.4);
    m2.restart = null;
    const def = m2.players.find((p) => p.team === 1 && p.role === "f");
    Object.assign(m2.ball, { owner: null, x: 14.5, z: -6, vx: 6, vz: 0, h: 0, last: def, lastTeam: 1 });
    correr(m2, 0.3);
    ok(m2.restart && m2.restart.type === "corner" && m2.restart.team === 0, "pichanga: el rival la tira por su fondo → córner para ti");
    ok(m2.ball.owner === m2.human, "pichanga: en tu córner manejas a quien saca");
    correr(m2, 6);
    ok(!m2.restart, "pichanga: si no haces nada, el saque se hace solo a los 5 s (nadie queda esperando)");
  }
  // robo: junto al rival que lleva la pelota, "quitar" funciona a veces y falla otras (con pausa si falla)
  {
    let bien = 0, mal = 0;
    for (let s = 1; s <= 200; s++) {
      const m = PI.createMatch({ seed: s, difficulty: "normal" });
      m.restart = null;
      const c = m.players.find((p) => p.team === 1 && p.slot === 1);
      Object.assign(c, { x: 0, z: 0, vx: 0, vz: 0 });
      m.ball.owner = c;
      Object.assign(m.human, { x: -0.9, z: 0 });
      if (PI.tryTackle(m, m.human)) bien++; else mal++;
    }
    ok(bien > 90 && mal > 30, `pichanga: quitar funciona seguido pero no siempre (${bien} sí / ${mal} no)`);
  }
  // cambiar de jugador: alterna entre tus dos jugadores de campo cuando no tienes la pelota
  {
    const m = nuevo();
    correr(m, 0.4);
    m.restart = null;
    const rival = m.players.find((p) => p.team === 1 && p.slot === 1);
    m.ball.owner = rival;
    const antes = m.human;
    PI.stepMatch(m, 1 / 60, { switch: true });
    const despues = m.human;
    PI.stepMatch(m, 1 / 60, { switch: true });
    ok(antes !== despues && despues.team === 0 && despues.role === "f" && m.human === antes, "pichanga: «Cambiar» alterna entre tus dos jugadores");
  }
  // "¡pásala!": con tu compañero en la pelota, el botón de pase le pide la pelota
  {
    const m = nuevo();
    correr(m, 0.4);
    m.restart = null;
    const comp = m.players.find((p) => p.team === 0 && p.role === "f" && p !== m.human);
    Object.assign(comp, { x: -3, z: 3 });
    Object.assign(m.human, { x: 2, z: -2 });
    m.ball.owner = comp;
    PI.stepMatch(m, 1 / 60, { pass: true });
    ok(m.ball.target === m.human, "pichanga: pedir la pelota hace que tu compañero te la pase");
  }
  // dificultades: contra la IA, un jugador que solo se queda quieto pierde; y la IA rival es más rápida en desafío
  ok(PI.DIFFICULTY.accesible.speed < PI.DIFFICULTY.normal.speed && PI.DIFFICULTY.normal.speed < PI.DIFFICULTY.desafio.speed, "pichanga: tres dificultades crecientes");
  {
    const m = PI.createMatch({ seed: 3, difficulty: "accesible", golden: true });
    let t = 0;
    while (!m.over && t < 60 * 600) { PI.stepMatch(m, 1 / 60, {}); t++; }
    ok(m.over && m.score[0] !== m.score[1], `pichanga: con gol de oro (copa) nunca termina empatado (${m.score.join("-")})`);
  }
  // un "jugador" simple que corre hacia la pelota y tira al llegar: le gana a la dificultad accesible casi siempre
  {
    let gana = 0, pierde = 0;
    for (let s = 1; s <= 30; s++) {
      const m = PI.createMatch({ seed: 100 + s, difficulty: "accesible" });
      let i = 0;
      while (!m.over && i < 60 * 200) {
        const h = m.human;
        const b = m.ball;
        const inp = {};
        if (b.owner === h) {
          const dx = PI.PITCH.L / 2 - h.x;
          inp.mx = dx > 0 ? 1 : 0; inp.mz = -h.z * 0.2;
          if (dx < 9) { inp.shoot = true; inp.power = 0.9; }
          if (m.restart) inp.pass = true;
        } else {
          inp.mx = b.x - h.x; inp.mz = b.z - h.z;
          const l = Math.hypot(inp.mx, inp.mz) || 1; inp.mx /= l; inp.mz /= l;
          if (b.owner && b.owner.team === 1 && Math.hypot(b.owner.x - h.x, b.owner.z - h.z) < 1.2 && i % 20 === 0) inp.pass = true;
        }
        PI.stepMatch(m, 1 / 60, inp);
        i++;
      }
      if (m.score[0] > m.score[1]) gana++; else if (m.score[0] < m.score[1]) pierde++;
    }
    ok(gana >= 18, `pichanga: jugando con decisiones simples se le gana a «accesible» (${gana} de 30, pierde ${pierde})`);
  }
}

// ======================= BÁSQUET 2 CONTRA 2 =======================
{
  const { COURT } = BQ;
  let partidos = 0, terminados = 0, roto = 0, maxQuieta = 0, puntos = 0, tiros = 0, dobles = 0, triples = 0, rebotes = 0, robos = 0, checks = 0, saca = 0, tiroSinSacar = 0;
  let porMeta = 0, porTiempo = 0, gana = [0, 0], maxPos = 0;
  for (let seed = 1; seed <= 120; seed++) {
    const m = BQ.createMatch({ seed, aiOnly: true, difficulty: ["accesible", "normal", "desafio"][seed % 3] });
    partidos++;
    let quieta = 0, pasos = 0, pos = 0, lastOff = m.offense, debeSacar = -1;
    while (!m.over && pasos < 60 * 400) {
      const antes = m.mustClear;
      BQ.stepMatch(m, 1 / 60);
      pasos++;
      const b = m.ball;
      for (const p of m.players) if (!fin(p.x) || !fin(p.z)) roto++;
      if (!fin(b.x) || !fin(b.z) || !fin(b.h)) roto++;
      if (!b.owner && m.pause <= 0 && b.still > 0) quieta = b.still; else quieta = 0;
      maxQuieta = Math.max(maxQuieta, quieta);
      pos = m.offense === lastOff ? pos + 1 / 60 : 0;
      lastOff = m.offense;
      maxPos = Math.max(maxPos, pos);
      for (const e of m.events.splice(0)) {
        if (e.type === "score") { puntos += e.pts; if (e.pts === 3) triples++; else dobles++; }
        if (e.type === "shot") { tiros++; if (antes === e.team) tiroSinSacar++; }
        if (e.type === "rebound") rebotes++;
        if (e.type === "steal") robos++;
        if (e.type === "check") checks++;
        if (e.type === "cleared") saca++;
      }
    }
    if (m.over) terminados++;
    if (Math.max(...m.score) >= m.target) porMeta++; else porTiempo++;
    if (m.score[0] > m.score[1]) gana[0]++; else if (m.score[1] > m.score[0]) gana[1]++;
  }
  ok(roto === 0, `básquet: sin números rotos (${roto})`);
  ok(terminados === partidos, `básquet: los ${partidos} partidos terminan (por meta ${porMeta}, por tiempo ${porTiempo})`);
  ok(puntos / partidos > 8, `básquet: hay canastas (${(puntos / partidos).toFixed(1)} puntos por partido; ${dobles} dobles y ${triples} triples)`);
  ok(tiros > 0 && (dobles + triples) / tiros > 0.25 && (dobles + triples) / tiros < 0.7, `básquet: se emboca un ${(100 * (dobles + triples) / tiros).toFixed(0)} % de los tiros`);
  ok(maxQuieta <= 3.1, `básquet: ninguna pelota suelta y quieta más de 3 s (máximo ${maxQuieta.toFixed(1)} s)`);
  ok(rebotes > partidos * 3 && robos > partidos * 0.5, `básquet: hay rebotes (${rebotes}) y robos (${robos})`);
  ok(saca > partidos, `básquet: tras recuperar, la sacan detrás de la línea de 3 (${saca} veces)`);
  ok(tiroSinSacar === 0, `básquet: nadie tira sin sacarla detrás de la línea de 3 (${tiroSinSacar})`);
  ok(gana[0] > 10 && gana[1] > 10, `básquet IA contra IA: ganan ambos lados (${gana[0]} / ${gana[1]})`);

  const correr = (m, seg, input = {}) => { for (let i = 0; i < seg * 60; i++) BQ.stepMatch(m, 1 / 60, typeof input === "function" ? input(i) : input); };
  // empieza tu equipo con el saque desde arriba; manejas al que saca
  {
    const m = BQ.createMatch({ seed: 4 });
    ok(m.check && m.ball.owner === m.human && m.offense === 0, "básquet: empieza tu saque desde arriba");
    correr(m, 1);
    ok(!m.check, "básquet: después del saque la pelota está en juego");
    // pase a tu compañero: lo recibe y pasas a manejarlo
    const antes = m.human;
    BQ.stepMatch(m, 1 / 60, { pass: true });
    let recibe = null;
    for (let i = 0; i < 120 && !recibe; i++) { BQ.stepMatch(m, 1 / 60); if (m.ball.owner) recibe = m.ball.owner; }
    ok(recibe && ((recibe.team === 0 && m.human === recibe && recibe !== antes) || (recibe.team === 1 && m.offense === 1)), `básquet: el pase llega y manejas a quien la recibe, o lo corta un rival y cambia la posesión (${recibe ? (recibe.team ? "cortado" : "recibido") : "nadie"})`);
  }
  // canasta: suma puntos y la pelota pasa al rival, que saca desde arriba
  {
    const m = BQ.createMatch({ seed: 8 });
    correr(m, 1);
    const h = m.human;
    m.ball.owner = h;
    Object.assign(h, { x: 0.3, z: 2.3 });
    for (const q of m.players) if (q.team === 1) Object.assign(q, { x: 6, z: 12 });
    m.rng = () => 0.01; // que entre
    BQ.stepMatch(m, 1 / 60, { shootHold: true });
    for (let i = 0; i < 30; i++) BQ.stepMatch(m, 1 / 60, { shootHold: true }); // ~0,5 s: zona buena
    BQ.stepMatch(m, 1 / 60, {});
    const ev = m.events.find((e) => e.type === "shot");
    ok(ev && !ev.three, "básquet: tiro desde cerca (2 puntos)");
    correr(m, 2);
    ok(m.score[0] === 2, `básquet: canasta de 2 (marcador ${m.score.join("-")})`);
    correr(m, 1);
    ok(m.offense === 1 && (m.check || m.ball.owner && m.ball.owner.team === 1), "básquet: después de la canasta ataca el rival desde arriba");
  }
  // triple
  {
    const m = BQ.createMatch({ seed: 2 });
    correr(m, 1);
    const h = m.human;
    m.ball.owner = h;
    Object.assign(h, { x: 0, z: COURT.hoopZ + 6.8 });
    for (const q of m.players) if (q.team === 1) Object.assign(q, { x: 6, z: 13 });
    m.rng = () => 0.01;
    for (let i = 0; i < 30; i++) BQ.stepMatch(m, 1 / 60, { shootHold: true });
    BQ.stepMatch(m, 1 / 60, {});
    correr(m, 2.5);
    ok(m.score[0] === 3, `básquet: desde detrás de la línea vale 3 (marcador ${m.score.join("-")})`);
  }
  // recuperar: hay que sacarla detrás de la línea de 3 antes de tirar
  {
    const m = BQ.createMatch({ seed: 6 });
    correr(m, 1);
    const rival = m.players.find((p) => p.team === 1);
    m.ball.owner = rival;
    m.offense = 1;
    Object.assign(rival, { x: 1, z: 3.2 });
    const h = m.human;
    Object.assign(h, { x: 1.6, z: 3.2 });
    m.rng = () => 0.01; // el robo sale
    BQ.stepMatch(m, 1 / 60, { pass: true });
    ok(m.ball.owner === h && m.offense === 0 && m.mustClear === 0, "básquet: robar la pelota cambia la posesión y pide sacarla");
    Object.assign(h, { x: 0, z: 3 });
    for (let i = 0; i < 20; i++) BQ.stepMatch(m, 1 / 60, { shootHold: true });
    BQ.stepMatch(m, 1 / 60, {});
    ok(m.ball.owner === h && m.events.some((e) => e.type === "mustclear"), "básquet: sin sacarla detrás de la línea, el tiro no sale (y se avisa)");
    Object.assign(h, { x: 0, z: COURT.hoopZ + 6.6 });
    BQ.stepMatch(m, 1 / 60, {});
    ok(m.mustClear === -1, "básquet: al pasar la línea de 3 ya se puede tirar");
  }
  // pelota afuera: cambia de equipo y se saca desde arriba
  {
    const m = BQ.createMatch({ seed: 3 });
    correr(m, 1);
    Object.assign(m.ball, { owner: null, kind: "loose", x: 7.2, z: 6, h: 0.2, vx: 4, vz: 0, vh: 0, lastTeam: 0, still: 0 });
    correr(m, 0.3);
    ok(m.offense === 1 && m.check, "básquet: pelota afuera → saque del otro equipo desde arriba");
  }
  // cambiar de jugador en defensa
  {
    const m = BQ.createMatch({ seed: 11 });
    correr(m, 1);
    const rival = m.players.find((p) => p.team === 1);
    m.ball.owner = rival;
    m.offense = 1;
    const antes = m.human;
    BQ.stepMatch(m, 1 / 60, { switch: true });
    ok(m.human !== antes && m.human.team === 0, "básquet: «Cambiar» pasa a tu compañero en defensa");
  }
  // la barra de tiro: soltar en la zona buena ayuda
  ok(BQ.timingQuality(0.55) > BQ.timingQuality(0.2) && BQ.timingQuality(0.55) > BQ.timingQuality(1.0), "básquet: soltar el tiro a tiempo ayuda");
  // gol de oro (copa): nunca termina empatado
  {
    const m = BQ.createMatch({ seed: 21, golden: true, aiOnly: true, secs: 20 });
    let t = 0;
    while (!m.over && t < 60 * 600) { BQ.stepMatch(m, 1 / 60); t++; }
    ok(m.over && m.score[0] !== m.score[1], `básquet: en la copa no hay empate (${m.score.join("-")})`);
  }
  // un jugador simple (va al aro y tira; en defensa se pega al que tiene la pelota y la quita) le gana a «accesible»
  {
    let gana = 0, pierde = 0;
    for (let s = 1; s <= 30; s++) {
      const m = BQ.createMatch({ seed: 300 + s, difficulty: "accesible" });
      let i = 0, holdT = 0;
      while (!m.over && i < 60 * 400) {
        const h = m.human;
        const b = m.ball;
        const inp = {};
        if (b.owner === h) {
          let tx = 0, tz = COURT.hoopZ + 1.5;
          if (m.mustClear === 0) { tx = 0; tz = COURT.hoopZ + 7; }
          inp.mx = tx - h.x; inp.mz = tz - h.z;
          const l = Math.hypot(inp.mx, inp.mz) || 1; inp.mx /= l; inp.mz /= l;
          if (m.mustClear !== 0 && Math.hypot(h.x, h.z - COURT.hoopZ) < 2.4) { holdT += 1 / 60; inp.shootHold = holdT < 0.5; } else holdT = 0;
        } else {
          holdT = 0;
          const t = b.owner || b;
          inp.mx = t.x - h.x; inp.mz = t.z - h.z;
          const l = Math.hypot(inp.mx, inp.mz) || 1; inp.mx /= l; inp.mz /= l;
          if (b.owner && b.owner.team === 1 && Math.hypot(b.owner.x - h.x, b.owner.z - h.z) < 1.2 && i % 25 === 0) inp.pass = true;
        }
        BQ.stepMatch(m, 1 / 60, inp);
        i++;
      }
      if (m.score[0] > m.score[1]) gana++; else if (m.score[0] < m.score[1]) pierde++;
    }
    ok(gana >= 18, `básquet: con decisiones simples se le gana a «accesible» (${gana} de 30, pierde ${pierde})`);
  }
}

// ======================= DIFICULTAD CON UN JUGADOR HUMANO SIMULADO =======================
// (reacciona en ~0,45 s, apunta con error; "aprendiz" aún más lento). Los partidos deben poder aprenderse:
// en accesible se gana casi siempre, en normal algo más de la mitad, y desafío cuesta pero se puede.
{
  const { medir, humanoPichanga, humanoBasquet } = await import("./jugador-humano.mjs");
  for (const [nombre, Sim, h] of [["pichanga", PI, humanoPichanga], ["básquet", BQ, humanoBasquet]]) {
    const acc = medir(Sim, (s) => h(s, 0.7), "accesible", 20);
    const nor = medir(Sim, (s) => h(s, 1), "normal", 20);
    const des = medir(Sim, (s) => h(s, 1), "desafio", 20);
    ok(acc.gana >= 17, `${nombre}: un aprendiz gana en accesible (${acc.gana}/20, promedio ${(acc.favor / 20).toFixed(1)} a ${(acc.contra / 20).toFixed(1)})`);
    ok(nor.gana >= 9 && nor.gana <= 18, `${nombre}: en normal se gana algo más de la mitad (${nor.gana}/20)`);
    ok(des.gana >= 1 && des.gana <= 12, `${nombre}: desafío cuesta pero se puede (${des.gana}/20)`);
  }
}

console.log(fallos ? `\n${fallos} prueba(s) fallaron` : "\nTodo bien");
process.exit(fallos ? 1 : 0);
