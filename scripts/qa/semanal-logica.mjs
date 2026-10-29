// Prueba la lógica de las metas de la semana (js/weekly.js), sin navegador: semana que parte el lunes, 3 metas por semana,
// avance desde el lunes, premio por meta, cofre con las 3 cobradas y metas nuevas la semana siguiente.
// Uso: node scripts/qa/semanal-logica.mjs   (sale con código 1 si algo falla)
globalThis.localStorage = globalThis.localStorage || { getItem: () => null, setItem: () => {}, removeItem: () => {} };
const { weekKey, weeklyState, claimWeekly, openWeeklyChest, WEEKLY_POOL, GOAL_REWARD, CHEST_REWARD } = await import("../../js/weekly.js");
const { normalizeAdventure } = await import("../../js/adventure.js");
const { normalizeSports } = await import("../../js/sports-progress.js");

let fallos = 0;
const ok = (cond, texto) => { console.log(`${cond ? "OK " : "MAL"} ${texto}`); if (!cond) fallos++; };
const nuevo = () => ({ _profileId: "qa", coins: 0, packs: 0, stats: { totalCoinsEarned: 0 }, wardrobe: { owned: [] }, adventure: normalizeAdventure(undefined), sports: normalizeSports(undefined) });
const subir = (p, id, n) => {
  const m = { runs: "totalRuns", coins: "totalCoinsEarned", visits: "visits", treats: "petTreats", petplay: "petPlays", packs: "packsOpened", hello: "townTalks", alfajores: "townItems", missions: "missionsClaimed", gold: "ciudadGold", parkour: "parkourFinishes" }[id];
  if (m) p.stats[m] = (p.stats[m] || 0) + n;
  else if (id === "stars") p.adventure.starsEarned += n;
  else if (id === "wins") p.sports.pichanga.wins += n;
};

const mie = new Date(2026, 9, 28, 15); // miércoles 28-oct-2026
ok(weekKey(mie) === "2026-10-26" && weekKey(new Date(2026, 9, 26, 0, 5)) === "2026-10-26" && weekKey(new Date(2026, 10, 1, 23)) === "2026-10-26", "la semana parte el lunes (26-oct) y termina el domingo (1-nov)");
ok(weekKey(new Date(2026, 10, 2, 9)) === "2026-11-02", "el lunes siguiente empieza otra semana");
ok(WEEKLY_POOL.length >= 12 && new Set(WEEKLY_POOL.map((g) => g.id)).size === WEEKLY_POOL.length, `hay ${WEEKLY_POOL.length} metas distintas para sortear`);

const p = nuevo();
p.stats.totalRuns = 40; // lo de antes de esta semana no cuenta
const st = weeklyState(p, mie);
ok(st.goals.length === 3 && new Set(st.goals.map((g) => g.id)).size === 3, `3 metas distintas esta semana: ${st.goals.map((g) => g.id).join(", ")}`);
ok(st.goals.every((g) => g.have === 0), "parten en 0 (lo hecho antes del lunes no cuenta)");
ok(!st.goals.some((g) => g.id === "treats" || g.id === "petplay"), "sin mascota no salen metas de mascota");
ok(weeklyState(nuevo(), mie).goals.map((g) => g.id).join() === st.goals.map((g) => g.id).join(), "las metas de la semana son las mismas si se calculan de nuevo");
const [a, b, c] = st.goals;
subir(p, a.id, Math.ceil(a.need / 2));
ok(weeklyState(p, mie).goals[0].have === Math.ceil(a.need / 2) && !weeklyState(p, mie).goals[0].done, "el avance cuenta desde el lunes y todavía no está cumplida");
ok(claimWeekly(p, a.id, mie) === null, "no se cobra una meta sin cumplir");
subir(p, a.id, a.need);
const coins0 = p.coins;
const stars0 = p.adventure.stars;
ok(claimWeekly(p, a.id, mie) && p.coins - coins0 === GOAL_REWARD.coins && p.adventure.stars - stars0 === GOAL_REWARD.stars, `cumplida se cobra: +${GOAL_REWARD.coins} Matipuntos y +${GOAL_REWARD.stars} ⭐`);
ok(claimWeekly(p, a.id, mie) === null, "no se cobra dos veces");
ok(openWeeklyChest(p, mie) === null, "el cofre no se abre con 1 de 3");
for (const g of [b, c]) { subir(p, g.id, g.need); claimWeekly(p, g.id, mie); }
const packs0 = p.packs;
const r = openWeeklyChest(p, mie);
ok(r && p.packs - packs0 === CHEST_REWARD.packs && weeklyState(p, mie).chestTaken, `con las 3 cobradas se abre el cofre: +${CHEST_REWARD.coins} Matipuntos y ${CHEST_REWARD.packs} sobre`);
ok(openWeeklyChest(p, mie) === null, "el cofre se abre una sola vez");
const lun = new Date(2026, 10, 2, 10);
const st2 = weeklyState(p, lun);
ok(st2.key === "2026-11-02" && st2.goals.every((g) => !g.claimed && g.have === 0) && !st2.chestTaken, "el lunes siguiente salen 3 metas nuevas, sin cobrar y en 0");
ok(st2.goals.filter((g) => [a.id, b.id, c.id].includes(g.id)).length === 0, `no repite las de la semana pasada (${st2.goals.map((g) => g.id).join(", ")})`);
const conMascota = nuevo();
conMascota.wardrobe.owned = ["pet_bombi"];
let algunaMascota = false;
for (let i = 0; i < 20 && !algunaMascota; i++) { conMascota.weekly = null; algunaMascota = weeklyState(conMascota, new Date(2026, 10, 2 + i * 7)).goals.some((g) => g.id === "treats" || g.id === "petplay"); }
ok(algunaMascota, "con mascota también pueden salir metas de cuidarla");

console.log(fallos ? `\n${fallos} fallos` : "\nTodo bien");
process.exit(fallos ? 1 : 0);
