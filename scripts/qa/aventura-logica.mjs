// Prueba la lógica de la aventura "Renovar el Pueblo" (zonas con tareas que cuestan ⭐ ganadas en cualquier juego) y del
// avance de los deportes, sin navegador.
// Uso: node scripts/qa/aventura-logica.mjs   (sale con código 1 si algo falla)
import {
  ZONES, ALL_TASKS, normalizeAdventure, adventureOf, currentTask, onGamePlayed, doTask, choose, talkTo, addStars,
  zonesDone, adventureComplete, npcWaiting, objective, returnSummary, setGoal, goalStatus, seasonalChallenge, seasonalOnPlay,
  placeOpen, placeBuilt, addMedal, gossip, starsOf, zoneProgress, markIntroSeen, stepPlace, zoneOpen,
} from "../../js/adventure.js";
import { normalizeSports, sportsOf, recordMatch, cupRival, CUP_REWARD, setDifficulty } from "../../js/sports-progress.js";

let fallos = 0;
const ok = (cond, texto) => { console.log(`${cond ? "OK " : "MAL"} ${texto}`); if (!cond) fallos++; };
const clone = (x) => JSON.parse(JSON.stringify(x));
const nuevo = () => ({ adventure: normalizeAdventure(undefined), sports: normalizeSports(undefined) });
/** Hace la tarea que toca dándole justo las ⭐ que cuesta. */
const POR_DEFECTO = { plaza: "jardin", cancha: "rosa", aro: "clasico" };
const hacer = (p, opcion = null) => { const t = currentTask(p); addStars(p, t.cost); return doTask(p, t.id, t.choice ? opcion || POR_DEFECTO[t.choice] : null); };

// ---------- datos de la aventura ----------
ok(ZONES.length === 7 && ZONES.map((z) => z.id).join() === "plaza,cancha,aro,festival,bosque,granja,lago", "7 zonas en orden: plaza, cancha, aro, festival, bosque, granja y lago");
ok(ZONES.every((z) => z.tasks.length >= 3 && z.tasks.every((t) => t.cost > 0 && t.text && t.say)), "cada zona tiene tareas con costo en ⭐, texto y lo que cuenta el vecino");
ok(new Set(ALL_TASKS.map((t) => t.id)).size === ALL_TASKS.length, "no hay tareas repetidas");
ok(ALL_TASKS[0].cost === 1, "la primera tarea cuesta ⭐1 (se hace con el regalo de bienvenida)");

// ---------- migración ----------
const vacio = normalizeAdventure(undefined);
ok(vacio.v === 2 && !vacio.started && vacio.stars === 0 && Object.keys(vacio.done).length === 0, "perfil sin aventura: parte sin empezar, versión 2, sin ⭐");
ok(JSON.stringify(normalizeAdventure(vacio)) === JSON.stringify(vacio), "migrar dos veces da lo mismo (vacío)");
ok(JSON.stringify(normalizeAdventure("basura")) === JSON.stringify(vacio) && JSON.stringify(normalizeAdventure([1, 2])) === JSON.stringify(vacio), "basura o arreglo: estado vacío válido");
const roto = { v: 2, stars: -5, done: { "plaza.limpiar": 1, "plaza.estilo": 1, "cancha.pasto": 1, inventada: 1 }, choices: { plaza: "nada" }, claimed: "no" };
const rep = normalizeAdventure(roto);
ok(rep.stars === 0 && rep.done["plaza.limpiar"] && !rep.done["plaza.estilo"] && !rep.done["cancha.pasto"] && !rep.done.inventada, "datos rotos: ⭐ negativas, tareas sin su elección, fuera de orden o inventadas se reparan");
ok(JSON.stringify(normalizeAdventure(rep)) === JSON.stringify(rep), "migrar dos veces da lo mismo (reparado)");
// desde la aventura anterior (3 capítulos con pasos)
const v1fin = { v: 1, started: true, steps: Object.fromEntries(["c1.hablar", "c1.materiales", "c1.estilo", "c1.inaugurar", "c2.hablar", "c2.colores", "c2.pichanga", "c2.contar", "c3.hablar", "c3.estilo", "c3.basquet", "c3.festival"].map((k) => [k, 1])), choices: { plaza: "lectura", cancha: "verde", aro: "dorado" }, claimed: ["chapter:c1", "chapter:c2", "chapter:c3", "season:halloween:2026"], goal: "festival" };
const m1 = { adventure: normalizeAdventure(v1fin) };
ok(zonesDone(m1) === 4 && currentTask(m1).id === "bosque.sendero" && m1.adventure.choices.aro === "dorado", "festival terminado antes: quedan hechas plaza, cancha, aro y festival, y sigue el bosque");
ok(["zone:plaza", "zone:cancha", "zone:aro", "zone:festival", "season:halloween:2026"].every((k) => m1.adventure.claimed.includes(k)), "los premios ya cobrados quedan marcados (no se vuelven a pagar) y se conserva el reto de temporada");
ok(placeOpen(m1, "cancha") && placeOpen(m1, "aro"), "quien ya terminó el festival sigue con la cancha y el aro abiertos");
ok(JSON.stringify(normalizeAdventure(clone(m1.adventure))) === JSON.stringify(m1.adventure), "migrar dos veces da lo mismo (desde la versión anterior)");
const v1mitad = { v: 1, started: true, steps: { "c1.hablar": 1, "c1.materiales": 1, "c1.estilo": 1, "c1.inaugurar": 1, "c2.hablar": 1, "c2.colores": 1 }, choices: { plaza: "jardin", cancha: "celeste" }, claimed: ["chapter:c1"] };
const m2 = { adventure: normalizeAdventure(v1mitad) };
ok(zonesDone(m2) === 1 && m2.adventure.done["cancha.colores"] && currentTask(m2).id === "cancha.arcos" && starsOf(m2) === 2, "a mitad de la cancha: conserva lo hecho, sigue con los arcos y recibe ⭐2 para seguir");
ok(!m2.adventure.claimed.includes("zone:cancha") && m2.adventure.claimed.includes("zone:plaza"), "la zona sin terminar no queda cobrada; la terminada sí");

// ---------- recorrido ----------
const p = nuevo();
ok(currentTask(p).id === "plaza.limpiar" && npcWaiting(p) === null, "perfil nuevo: la primera tarea es la de la plaza, y sin ⭐ nadie tiene ❗");
const sin = doTask(p, "plaza.limpiar");
ok(!sin.ok && sin.need === 1, "sin ⭐ no se puede hacer la tarea (dice cuántas faltan)");
markIntroSeen(p);
ok(starsOf(p) === 1 && npcWaiting(p) === "Bombi", "la viñeta de bienvenida regala ⭐1 y Bombi queda con ❗");
markIntroSeen(p);
ok(starsOf(p) === 1, "el regalo de bienvenida sale una sola vez");
ok(!doTask(p, "plaza.banca").ok, "no se puede saltar a otra tarea");
const t1 = doTask(p, "plaza.limpiar");
ok(t1.ok && starsOf(p) === 0 && /piso/.test(t1.say), "hacer la tarea gasta las ⭐ y el vecino cuenta la historia");
ok(onGamePlayed(p, "memoria") === 1 && onGamePlayed(p, "pichanga") === 2 && starsOf(p) === 3, "cualquier juego da ⭐ (los partidos largos dan 2)");
const t2 = doTask(p, "plaza.estilo");
ok(!t2.ok && t2.needChoice === "plaza", "la tarea de elegir pide la opción");
ok(doTask(p, "plaza.estilo", "inventada").ok === false, "una opción inexistente se rechaza");
ok(doTask(p, "plaza.estilo", "guirnaldas").ok && placeBuilt(p, "plaza") && starsOf(p) === 1, "elegir guirnaldas hace la tarea y el rincón queda construido");
ok(talkTo(p, "Capi Menta").waiting, "Capi Menta espera a que termines la plaza");
ok(talkTo(p, "Trufita") === null, "un vecino que no es de la aventura dice lo de siempre");
const habla = talkTo(p, "Bombi");
ok(habla.action === "tasks" && /banca/.test(habla.text) && /faltan ⭐1/.test(habla.text), "Bombi dice lo que sigue, cuánto cuesta y cuántas ⭐ faltan");
hacer(p);
const fin1 = hacer(p);
ok(fin1.zoneDone && fin1.reward && fin1.reward.coins === ZONES[0].reward.coins && zonesDone(p) === 1, "completar la plaza da el premio de la zona");
ok(adventureOf(p).claimed.filter((c) => c === "zone:plaza").length === 1, "el premio de la plaza se marca una sola vez");
ok(talkTo(p, "Bombi").memory && /guirnaldas/.test(talkTo(p, "Bombi").text), "Bombi recuerda el estilo elegido");
ok(gossip(p).length === 1 && /guirnaldas/.test(gossip(p)[0]), "los demás vecinos comentan el rincón nuevo");
ok(/Noche de Cacao/.test(talkTo(p, "Bombi", { name: "Noche de Cacao", icon: "🎃" }).text), "en temporada, los vecinos agregan una frase del evento");
ok(choose(p, "plaza", "jardin").ok && p.adventure.choices.plaza === "jardin", "se puede cambiar el estilo después, gratis");
ok(!choose(p, "cancha", "rosa").ok, "no se puede elegir el estilo de una tarea a la que no has llegado");
ok(!placeOpen(p, "cancha") && stepPlace(p) === "cancha", "la cancha sigue cerrada y la flecha apunta a la cancha");
hacer(p); hacer(p, "celeste");
ok(!placeOpen(p, "cancha"), "sin arcos todavía no se juega en la cancha");
hacer(p);
ok(placeOpen(p, "cancha"), "con los arcos puestos se abre la pichanga del Pueblo");
hacer(p);
ok(zoneProgress(p, "cancha").done === 4 && zonesDone(p) === 2, "cancha completa");
ok(!zoneOpen(p, "bosque") && zoneOpen(p, "aro"), "el bosque sigue cerrado; el aro ya está abierto");
while (currentTask(p) && currentTask(p).zone.id !== "bosque") hacer(p, "dorado");
ok(zonesDone(p) === 4 && placeOpen(p, "aro") && /bosque/.test(gossip(p).join(" ")), "festival terminado: el aro abierto y los vecinos hablan del bosque");
while (currentTask(p)) hacer(p);
ok(adventureComplete(p) && objective(p).done && zonesDone(p) === 7, "renovar las 7 zonas termina la aventura");
const premios = adventureOf(p).claimed.filter((c) => c.startsWith("zone:"));
ok(premios.length === 7 && new Set(premios).size === 7, "siete premios de zona, sin duplicados");
ok(doTask(p, "lago.fuegos").ok === false, "repetir una tarea hecha no hace nada");

// ---------- persistencia ----------
const guardado = JSON.parse(JSON.stringify(p));
const reabierto = { adventure: normalizeAdventure(guardado.adventure) };
ok(adventureComplete(reabierto) && reabierto.adventure.choices.cancha === "celeste", "al reabrir se conservan avance y elecciones");
const mitad = nuevo();
markIntroSeen(mitad); doTask(mitad, "plaza.limpiar"); onGamePlayed(mitad, "salto");
const mitadReabierta = { adventure: normalizeAdventure(clone(mitad.adventure)) };
ok(currentTask(mitadReabierta).id === "plaza.estilo" && starsOf(mitadReabierta) === 1, "una aventura a medias sigue donde quedó, con sus ⭐");
ok(currentTask({ adventure: normalizeAdventure({ ...clone(mitad.adventure), lastSeen: 1 }) }).id === "plaza.estilo", "pasar meses sin jugar no borra nada");

// ---------- volver después de un rato ----------
const r = nuevo();
markIntroSeen(r);
const t0 = 1_800_000_000_000;
ok(returnSummary(r, t0) === null, "primera visita: sin resumen");
ok(returnSummary(r, t0 + 3600e3) === null, "al rato: sin resumen");
const res = returnSummary(r, t0 + 3600e3 + 4 * 3600e3);
ok(res && /0 de 7/.test(res.text) && /⭐1/.test(res.text), "después de horas: resumen con zonas, ⭐ y lo que sigue");
ok(returnSummary(nuevo(), t0) === null && returnSummary(nuevo(), t0 + 9e9) === null, "aventura sin empezar: sin resumen");

// ---------- meta personal ----------
const g = nuevo();
ok(goalStatus(g) === null, "sin meta elegida");
setGoal(g, "casa");
ok(goalStatus(g, { furniture: 3 }).have === 3 && !goalStatus(g, { furniture: 3 }).done && goalStatus(g, { furniture: 9 }).done, "meta de la casa: cuenta muebles");
setGoal(g, "pueblo");
ok(goalStatus(g).need === 7 && goalStatus(g).have === 0, "meta del Pueblo entero: 7 zonas");
setGoal(g, "copa_pichanga");
ok(!goalStatus(g, { cups: { pichanga: 0 } }).done && goalStatus(g, { cups: { pichanga: 1 } }).done, "meta de la copa de pichanga");
ok(setGoal(g, "inventada") === null, "una meta inexistente se borra");

// ---------- temporadas ----------
const ev = { id: "halloween", name: "Noche de Cacao", icon: "🎃" };
const s = nuevo();
const d2026 = new Date(2026, 9, 25);
ok(seasonalChallenge(s, null) === null, "sin evento no hay reto");
ok(seasonalOnPlay(s, ev, "memoria", d2026) === 0, "el reto no se cumple con un juego que no corresponde");
ok(seasonalOnPlay(s, ev, "pichanga", d2026) === 15 && seasonalOnPlay(s, ev, "pichanga", d2026) === 0, "el reto da fichas una sola vez");
ok(seasonalChallenge(s, ev, new Date(2027, 9, 25)).done === false, "al año siguiente el reto vuelve a estar disponible");
ok(addMedal(s, "x") && !addMedal(s, "x"), "medalla una sola vez");

// ---------- deportes ----------
const sp = { sports: normalizeSports(undefined) };
ok(sportsOf(sp).pichanga.cup.round === 0 && sportsOf(sp).basquet2v2.played === 0, "deportes: estado inicial");
ok(sportsOf(sp).pichanga.diff === "accesible", "deportes: se empieza en accesible");
const v1 = normalizeSports({ v: 1, pichanga: { diff: "normal", played: 4 }, basquet2v2: { diff: "normal", cups: { normal: 1 } } });
ok(v1.v === 2 && v1.pichanga.diff === "accesible" && v1.pichanga.played === 4 && v1.basquet2v2.diff === "normal", "deportes v1 → v2: quien partió en normal sin copas pasa a accesible; quien ganó copas en normal se queda");
ok(JSON.stringify(normalizeSports(v1)) === JSON.stringify(v1) && normalizeSports({ v: 2, pichanga: { diff: "normal" } }).pichanga.diff === "normal", "deportes v2: la migración no se repite y respeta lo elegido después");
ok(JSON.stringify(normalizeSports(sp.sports)) === JSON.stringify(sp.sports), "deportes: migrar dos veces da lo mismo");
ok(normalizeSports({ pichanga: { wins: -3, cup: { round: 99 }, diff: "loco", claimed: ["normal", "x"] } }).pichanga.cup.round === 2, "deportes: datos rotos se reparan");
ok(recordMatch(sp, "pichanga", { mode: "amistoso", my: 3, their: 1 }).result === "win" && sp.sports.pichanga.cup.round === 0, "un amistoso no mueve la copa");
ok(recordMatch(sp, "pichanga", { mode: "copa", my: 0, their: 2 }).result === "loss" && sp.sports.pichanga.cup.round === 0, "perder en la copa no hace retroceder");
recordMatch(sp, "pichanga", { mode: "copa", diff: "normal", my: 2, their: 1 });
ok(cupRival(sp, "pichanga").round === 1, "ganar avanza a la semifinal");
recordMatch(sp, "pichanga", { mode: "copa", diff: "normal", my: 2, their: 1 });
const final = recordMatch(sp, "pichanga", { mode: "copa", diff: "normal", my: 1, their: 0 });
ok(final.cupWon && final.reward === CUP_REWARD.normal && sp.sports.pichanga.cups.normal === 1 && sp.sports.pichanga.cup.round === 0, "ganar la final: copa y premio");
for (let i = 0; i < 3; i++) var otraFinal = recordMatch(sp, "pichanga", { mode: "copa", diff: "normal", my: 1, their: 0 });
ok(otraFinal.cupWon && otraFinal.reward === 0 && sp.sports.pichanga.cups.normal === 2, "ganar otra copa en la misma dificultad no paga de nuevo");
ok(sp.sports.basquet2v2.played === 0, "el básquet tiene su propio avance");
ok(setDifficulty(sp, "basquet2v2", "desafio") === "desafio" && setDifficulty(sp, "basquet2v2", "x") === "desafio", "dificultad guardada y validada");

console.log(fallos ? `\n${fallos} prueba(s) fallaron` : "\nTodo bien");
process.exit(fallos ? 1 : 0);
