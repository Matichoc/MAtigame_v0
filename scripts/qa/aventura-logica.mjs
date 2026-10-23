// Prueba la lógica de la aventura del festival y del avance de los deportes, sin navegador.
// Uso: node scripts/qa/aventura-logica.mjs   (sale con código 1 si algo falla)
import {
  CHAPTERS, ALL_STEPS, normalizeAdventure, adventureOf, currentStep, onGamePlayed, choose, talkTo, celebrateAtFountain,
  chaptersDone, adventureComplete, npcWaiting, objective, returnSummary, setGoal, goalStatus, seasonalChallenge, seasonalOnPlay,
  placeOpen, placeBuilt, addMedal, gossip,
} from "../../js/adventure.js";
import { normalizeSports, sportsOf, recordMatch, cupRival, CUP_REWARD, setDifficulty } from "../../js/sports-progress.js";

let fallos = 0;
const ok = (cond, texto) => { console.log(`${cond ? "OK " : "MAL"} ${texto}`); if (!cond) fallos++; };
const clone = (x) => JSON.parse(JSON.stringify(x));
const nuevo = () => ({ adventure: normalizeAdventure(undefined), sports: normalizeSports(undefined) });

// ---------- migración ----------
const vacio = normalizeAdventure(undefined);
ok(vacio.v === 1 && !vacio.started && Object.keys(vacio.steps).length === 0, "perfil antiguo sin aventura: parte sin empezar, versión 1");
ok(JSON.stringify(normalizeAdventure(vacio)) === JSON.stringify(vacio), "migrar dos veces da lo mismo (vacío)");
const roto = { v: 1, steps: { "c1.hablar": 1, "c1.materiales": true, "c2.hablar": 1, "inventado": 1 }, choices: { plaza: "nada", cancha: "rosa" }, claimed: "no", goal: "x", lastSeen: "ayer" };
const rep = normalizeAdventure(roto);
ok(rep.steps["c1.hablar"] && rep.steps["c1.materiales"] && !rep.steps["c2.hablar"] && !rep.steps.inventado, "datos rotos: pasos fuera de orden o inventados no cuentan, lo válido se conserva");
ok(!rep.choices.plaza && rep.choices.cancha === "rosa" && Array.isArray(rep.claimed) && rep.goal === null && rep.lastSeen === 0, "datos rotos: elecciones, premios, meta y fecha se reparan");
ok(JSON.stringify(normalizeAdventure(rep)) === JSON.stringify(rep), "migrar dos veces da lo mismo (reparado)");
ok(JSON.stringify(normalizeAdventure("basura")) === JSON.stringify(vacio) && JSON.stringify(normalizeAdventure([1, 2])) === JSON.stringify(vacio), "basura o arreglo: estado vacío válido");

// ---------- recorrido completo ----------
const p = nuevo();
ok(currentStep(p).id === "c1.hablar" && npcWaiting(p) === "Bombi", "perfil nuevo: el primer paso es hablar con Bombi (con ❗)");
ok(onGamePlayed(p, "memoria") === null, "jugar antes de hablar con Bombi no se salta el paso");
const espera = talkTo(p, "Capi Menta");
ok(espera && espera.waiting && currentStep(p).id === "c1.hablar", "Capi Menta pide esperar a terminar el capítulo de Bombi");
ok(talkTo(p, "Trufita") === null, "un vecino que no es de la aventura dice lo de siempre");
const t1 = talkTo(p, "Bombi");
ok(t1 && /rincón/.test(t1.text) && currentStep(p).id === "c1.materiales", "hablar con Bombi cuenta su pedido y avanza");
ok(objective(p).where === "play", "el objetivo dice que hay que jugar");
ok(onGamePlayed(p, "futbol") === null, "fútbol (bloqueado en perfiles nuevos) no está entre las alternativas del capítulo 1");
ok(onGamePlayed(p, "town") === null, "pasear por el pueblo no cuenta como partida");
ok(onGamePlayed(p, "merge") && currentStep(p).id === "c1.estilo", "una partida de Mati Merge sirve (gane o pierda)");
ok(onGamePlayed(p, "memoria") === null, "repetir una partida no vuelve a avanzar");
ok(!choose(p, "cancha", "rosa").ok, "no se puede elegir el estilo de un capítulo al que no has llegado");
ok(!choose(p, "plaza", "inventado").ok, "una opción inexistente se rechaza");
ok(choose(p, "plaza", "guirnaldas").advanced && placeBuilt(p, "plaza"), "elegir guirnaldas completa el paso y el rincón queda construido");
ok(talkTo(p, "Bombi").action === "celebrate", "volver con Bombi cierra el capítulo 1");
ok(chaptersDone(p) === 1 && adventureOf(p).claimed.includes("chapter:c1"), "capítulo 1 terminado y premio marcado");
const otra = talkTo(p, "Bombi");
ok(otra.memory && /guirnaldas/.test(otra.text) && !otra.reward, "Bombi recuerda el estilo elegido y no vuelve a pagar");
ok(gossip(p).length === 1 && /guirnaldas/.test(gossip(p)[0]), "los demás vecinos también comentan el rincón nuevo");
ok(/Noche de Cacao/.test(talkTo(p, "Bombi", { name: "Noche de Cacao", icon: "🎃" }).text), "en temporada, los vecinos agregan una frase del evento");
ok(choose(p, "plaza", "jardin").ok && !choose(p, "plaza", "jardin").advanced && p.adventure.choices.plaza === "jardin", "se puede cambiar el estilo después sin avanzar ni pagar");
ok(!placeOpen(p, "cancha"), "la cancha se abre recién al hablar con Capi Menta");
const t2 = talkTo(p, "Capi Menta");
ok(t2.action === "choose" && t2.choice === "cancha" && placeOpen(p, "cancha"), "Capi Menta pide elegir los colores y la cancha se abre");
choose(p, "cancha", "celeste");
ok(onGamePlayed(p, "parkour") && currentStep(p).id === "c2.contar", "capítulo 2: Parkour sirve como alternativa a la pichanga");
const fin2 = talkTo(p, "Capi Menta");
ok(fin2.reward && fin2.reward.coins === CHAPTERS[1].reward.coins, "capítulo 2 cerrado con su premio");
talkTo(p, "Don Cuchufli");
choose(p, "aro", "dorado");
ok(celebrateAtFountain(p) === null, "no se puede celebrar el festival antes de jugar básquet");
ok(onGamePlayed(p, "basquet_tiros") && npcWaiting(p) === null, "capítulo 3: el concurso de lanzamientos sirve; el último cierre es en la fuente");
const fiesta = celebrateAtFountain(p);
ok(fiesta && fiesta.reward && adventureComplete(p) && objective(p).done, "celebrar en la fuente termina el festival");
ok(celebrateAtFountain(p) === null, "celebrar otra vez no vuelve a pagar");
const premios = adventureOf(p).claimed.filter((c) => c.startsWith("chapter:"));
ok(premios.length === 3 && new Set(premios).size === 3, "tres premios de capítulo, sin duplicados");

// ---------- persistencia: guardar y volver a abrir ----------
const guardado = JSON.parse(JSON.stringify(p));
const reabierto = { adventure: normalizeAdventure(guardado.adventure) };
ok(adventureComplete(reabierto) && reabierto.adventure.choices.aro === "dorado" && reabierto.adventure.choices.cancha === "celeste", "al reabrir se conservan avance y elecciones");
ok(talkTo(reabierto, "Don Cuchufli").memory && celebrateAtFountain(reabierto) === null, "al reabrir no se repiten premios");
const mitad = nuevo();
talkTo(mitad, "Bombi");
const mitadReabierta = { adventure: normalizeAdventure(clone(mitad.adventure)) };
ok(currentStep(mitadReabierta).id === "c1.materiales", "una aventura a medias sigue donde quedó");
// sin castigo por días sin jugar: el avance no depende de la fecha
ok(currentStep({ adventure: normalizeAdventure({ ...clone(mitad.adventure), lastSeen: 1 }) }).id === "c1.materiales", "pasar meses sin jugar no borra nada");

// ---------- volver después de un rato ----------
const r = nuevo();
talkTo(r, "Bombi");
const t0 = 1_800_000_000_000;
ok(returnSummary(r, t0) === null, "primera visita: sin resumen");
ok(returnSummary(r, t0 + 3600e3) === null, "al rato: sin resumen");
const res = returnSummary(r, t0 + 3600e3 + 4 * 3600e3);
ok(res && /0 de 3/.test(res.text) && /jugando una partida/.test(res.text), "después de horas: resumen con avance y siguiente objetivo");
ok(returnSummary(nuevo(), t0) === null && returnSummary(nuevo(), t0 + 9e9) === null, "aventura sin empezar: sin resumen");

// ---------- meta personal ----------
const g = nuevo();
ok(goalStatus(g) === null, "sin meta elegida");
setGoal(g, "casa");
ok(goalStatus(g, { furniture: 3 }).have === 3 && !goalStatus(g, { furniture: 3 }).done && goalStatus(g, { furniture: 9 }).done, "meta de la casa: cuenta muebles");
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
