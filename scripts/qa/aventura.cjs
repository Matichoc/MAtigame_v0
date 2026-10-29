// Recorre la aventura "Renovar el Pueblo" en el navegador, como un perfil nuevo: menú con los tres caminos → elegir
// Matichico → "Continuar mi aventura" (viñeta) → Pueblo → la lista de tareas de la zona (cada una cuesta ⭐) → hacer tareas
// con las ⭐ que se ganan jugando cualquier juego → elegir estilos → completar zonas con premio… hasta el Pueblo entero, con
// los barrios nuevos (bosque, granja y lago): caminar hasta ellos, verlos cambiar y recolectar lo del día.
// Revisa que el avance, las ⭐, las elecciones y los premios sobrevivan a cerrar y reabrir, que los premios no se paguen dos
// veces y que no haya conexiones externas.
// Uso: NODE_PATH=$(npm root -g) node scripts/qa/aventura.cjs [url-base] [carpeta-capturas]
const { abrir, BASE } = require("./lib.cjs");
const fs = require("fs");
const CAPTURAS = process.argv[3] || "";

let fallos = 0;
const ok = (c, t) => { console.log(`${c ? "OK " : "MAL"} ${t}`); if (!c) fallos++; };
const foto = async (p, n) => { if (CAPTURAS) { fs.mkdirSync(CAPTURAS, { recursive: true }); await p.screenshot({ path: `${CAPTURAS}/${n}.png` }); } };

(async () => {
  const { b, p, reg } = await abrir({ viewport: { width: 1000, height: 640 } });
  const prog = () => p.evaluate(() => JSON.parse(JSON.stringify(window.__progress())));
  const town = () => p.evaluate(() => { const t = window.__g3d.town; return { label: t.target && t.target.label, goal: document.getElementById("town-goal").textContent, dialog: document.getElementById("town-dialog").classList.contains("hidden") ? "" : document.getElementById("town-dialog").textContent }; });
  // termina una partida "de verdad" para la lógica (la misma función que llaman todos los juegos al terminar)
  // (en la web los módulos llevan "?v=…": hay que importar el mismo que usa la página, si no se carga otra copia del módulo
  // y el menú no se entera de la partida)
  const partida = (game) => p.evaluate(async (g) => {
    const main = [...document.querySelectorAll("script[type=module]")].map((s) => s.src).find((u) => /main\.js/.test(u)) || "";
    const v = main.includes("?") ? main.slice(main.indexOf("?")) : "";
    const m = await import(`./js/progression.js${v}`);
    m.recordRun(window.__progress(), g, 0);
  }, game);
  const enPueblo = async () => {
    await p.waitForFunction(() => window.__g3d && window.__g3d.town && window.__g3d.town.ready && window.__g3d.town.running, null, { timeout: 40000 });
    await p.evaluate(() => { const b = document.getElementById("town-btn-start"); if (b && b.offsetParent) b.click(); });
    await p.waitForTimeout(900);
  };
  // "Continuar mi aventura": la primera vez sale la viñeta; después lleva directo al Pueblo, junto a quien te espera
  const aventura = async () => {
    await p.evaluate(() => document.getElementById("btn-path-adventure").click());
    await p.waitForTimeout(400);
    if (await p.isVisible("#adv-intro")) await p.evaluate(() => document.getElementById("adv-intro-go").click());
    await enPueblo();
  };
  const usar = async () => { await p.keyboard.press("e"); await p.waitForTimeout(400); };
  const cerrarDialogo = async () => { if (!(await town()).dialog) return; await p.keyboard.press("e"); await p.waitForTimeout(250); };
  const alMenu = async () => { await p.click("#town-btn-menu"); await p.click("#pause-exit"); await p.waitForTimeout(500); }; // ⏸ → "Salir al menú"
  const estrellas = async () => (await prog()).adventure.stars;
  // abre la lista de tareas con el botón 📋 del globo y aprieta "¡Hacer!" (si la tarea es de elegir, elige la opción `k`)
  const hacerTarea = async (k = 1) => {
    await p.evaluate(() => document.querySelector("#town-goal .tq-list").click());
    await p.waitForTimeout(300);
    await p.evaluate(() => document.querySelector("#at-list .at-go").click());
    await p.waitForTimeout(400);
    if (await p.isVisible("#adv-choice")) { await p.click(`#adv-choice-options .adv-opt:nth-child(${k})`); await p.waitForTimeout(500); }
  };

  await p.goto(BASE + "?debug3d", { waitUntil: "networkidle" });
  await p.evaluate(() => localStorage.clear());
  await p.reload({ waitUntil: "networkidle" });
  await p.click("#profile-grid .add-profile");
  await p.fill("#new-profile-name", "Festival");
  await p.click("#btn-create-profile");
  await p.waitForTimeout(500);

  // ---- Fase 1: menú ----
  ok(await p.isVisible("#btn-path-adventure") && await p.isVisible("#btn-path-free") && await p.isVisible("#btn-path-me"), "menú: los tres caminos se ven");
  ok(/elige tu Matichico/i.test(await p.textContent("#lp-adv-sub")), "perfil nuevo: la aventura pide elegir personaje primero");
  await p.click("#btn-path-adventure");
  await p.waitForTimeout(300);
  ok(await p.isVisible("#screen-hub") && /elige tu Matichico/i.test(await p.textContent("#toast")), "sin personaje: aviso amable (sin alerta del navegador) y se queda en el menú");
  await p.click("#game-grid .game-card");
  await p.waitForTimeout(300);
  ok(await p.isVisible("#screen-hub"), "sin personaje no se abre un juego");
  await p.click("#character-grid .character-card:nth-child(2)");
  await p.waitForTimeout(500);
  ok(/vecinos/.test(await p.textContent("#lp-adv-sub")), "con personaje: el botón dice que los vecinos necesitan ayuda");
  ok(await p.evaluate(() => document.getElementById("btn-path-adventure").classList.contains("lp-pulse")), "aventura sin empezar: el botón llama la atención");
  await p.click("#btn-path-me");
  ok(await p.isVisible("#me-dialog"), "Mi personaje y mis espacios abre sus opciones");
  await p.click("#me-close");
  await p.click("#btn-path-free");
  await p.waitForTimeout(400);
  ok(await p.evaluate(() => document.activeElement && document.activeElement.id === "lb-games-title"), "Jugar libremente lleva a la grilla de juegos");
  await foto(p, "01-menu");

  // ---- Zona 1: la plaza ----
  await p.evaluate(() => document.getElementById("btn-path-adventure").click());
  await p.waitForTimeout(400);
  ok(await p.isVisible("#adv-intro") && (await p.$$("#adv-intro canvas[data-npc]")).length === 3 && /⭐/.test(await p.textContent("#adv-intro")), "primera vez: viñeta que cuenta de qué se trata (zonas y ⭐), con las caras de 3 vecinos");
  await foto(p, "02-vineta");
  await p.evaluate(() => document.getElementById("adv-intro-go").click());
  await enPueblo();
  let t = await town();
  ok(/Bombi/.test(t.label || ""), `"¡Vamos al Pueblo!" te deja junto a Bombi (${t.label})`);
  ok(await estrellas() === 1, "la viñeta regala ⭐1 para la primera tarea");
  ok(/Bombi/.test(t.goal) && /maleza/.test(t.goal) && await p.evaluate(() => !!document.querySelector("#town-goal canvas.tq-face") && /Hacer/.test(document.querySelector("#town-goal .tq-btn").textContent)), "arriba: la cara de Bombi, la tarea con su costo y «¡Hacer!»");
  ok(await p.evaluate(() => document.getElementById("town-hud-stars").textContent === "1"), "el Pueblo muestra las ⭐ arriba");
  await foto(p, "03-pueblo-bombi");
  await usar();
  t = await town();
  ok(/rincón/.test(t.dialog) && /⭐1/.test(t.dialog) && await p.evaluate(() => /maleza/.test(document.querySelector("#town-dialog .td-play").textContent)), "Bombi cuenta qué quiere, cuánto cuesta y trae el botón para hacerlo");
  await p.evaluate(() => document.querySelector("#town-dialog .td-play").click());
  await p.waitForTimeout(400);
  ok(await p.isVisible("#adv-tasks") && (await p.$$("#at-list .at-task")).length === 4 && (await p.$$("#at-map .at-zone")).length === 7, "la lista de tareas: 4 tareas de la plaza y el mapa de las 7 zonas");
  await foto(p, "04-tareas");
  await p.evaluate(() => document.querySelector("#at-list .at-go").click());
  await p.waitForTimeout(600);
  t = await town();
  let pr = await prog();
  ok(pr.adventure.done["plaza.limpiar"] === 1 && pr.adventure.stars === 0 && !(await p.isVisible("#adv-tasks")), "«¡Hacer!» gasta la ⭐ y hace la tarea");
  ok(/piso/.test(t.dialog), "Bombi cuenta lo que sigue (la historia avanza)");
  ok(await p.evaluate(() => /"clean":1/.test(window.__g3d.town.festival.groups.plaza.userData.key)), "el rincón ya se ve limpio");
  await cerrarDialogo();
  ok(/faltan ⭐2/.test((await town()).goal) && await p.evaluate(() => /Memoria/.test(document.querySelector("#town-goal .tq-btn").textContent)), "sin ⭐ suficientes, el globo dice cuántas faltan y ofrece jugar");
  await alMenu();
  await partida("memoria");
  await partida("salto");
  ok(await estrellas() === 2, "cada partida da ⭐ (gane o pierda)");
  ok(/Ya puedes/.test(await p.textContent("#lp-adv-sub")) && /⭐2/.test(await p.textContent("#lp-adv-sub")), "el menú avisa que ya alcanza para la tarea");
  await aventura(); // ya no hay viñeta: directo junto a Bombi
  ok(!(await p.isVisible("#adv-intro")), "la viñeta sale una sola vez");
  await p.evaluate(() => document.querySelector("#town-goal .tq-list").click());
  await p.waitForTimeout(300);
  await p.evaluate(() => document.querySelector("#at-list .at-go").click());
  await p.waitForTimeout(400);
  ok(await p.isVisible("#adv-choice") && (await p.$$("#adv-choice-options .adv-opt")).length === 3, "tarea de elegir: cuadro con 3 estilos para el rincón");
  await p.waitForTimeout(700); // (que termine de aparecer, para la captura)
  await foto(p, "05-elegir");
  await p.click("#adv-choice-options .adv-opt:nth-child(2)");
  await p.waitForTimeout(500);
  pr = await prog();
  ok(pr.adventure.choices.plaza === "guirnaldas" && pr.adventure.done["plaza.estilo"] === 1 && pr.adventure.stars === 0, "elegir guirnaldas hace la tarea y gasta las ⭐");
  ok(await p.evaluate(() => /guirnaldas/.test(window.__g3d.town.festival.groups.plaza.userData.key)), "el rincón del Pueblo ya se ve con guirnaldas");
  await cerrarDialogo();
  await alMenu();
  await partida("pichanga");
  await partida("basquet2v2");
  await partida("memoria");
  ok(await estrellas() === 5, "los partidos largos (pichanga y básquet 2 contra 2) dan ⭐2");
  const coins0 = (await prog()).coins;
  await aventura();
  await hacerTarea();
  await cerrarDialogo();
  await hacerTarea();
  t = await town();
  pr = await prog();
  ok(pr.adventure.claimed.includes("zone:plaza") && /Capi Menta/.test(t.dialog), "la plaza renovada: premio y Bombi cuenta que Capi Menta te busca");
  ok(pr.coins >= coins0 + 60, `premio de la zona pagado (${coins0} → ${pr.coins})`);
  await foto(p, "06-plaza-lista");
  await cerrarDialogo();
  await usar();
  const coins1 = (await prog()).coins;
  ok(/guirnaldas/.test((await town()).dialog), "Bombi recuerda las guirnaldas");
  await cerrarDialogo();
  await alMenu();

  // ---- cerrar y reabrir la app a mitad de la aventura ----
  await p.reload({ waitUntil: "networkidle" });
  await p.waitForTimeout(800);
  pr = await prog();
  ok(pr.adventure.done["plaza.faroles"] === 1 && pr.adventure.choices.plaza === "guirnaldas" && pr.coins === coins1 && pr.adventure.claimed.filter((c) => c === "zone:plaza").length === 1, "al reabrir: avance, elección y Matipuntos iguales (sin pagar de nuevo)");
  ok(/Cancha/.test(await p.textContent("#lp-adv-sub")), "al reabrir: el menú dice que sigue la cancha");

  // ---- Zona 2: la cancha ----
  for (let i = 0; i < 5; i++) await partida("pichanga");
  await aventura();
  t = await town();
  ok(/Capi Menta/.test(t.label || ""), "zona 2: te deja junto a Capi Menta");
  await hacerTarea();
  await cerrarDialogo();
  await hacerTarea(2); // colores celestes
  await cerrarDialogo();
  ok(await p.evaluate(() => /celeste/.test(window.__g3d.town.festival.groups.cancha.userData.key)), "la cancha queda con los colores celestes");
  ok(await p.evaluate(() => !/Jugar/.test(window.__g3d.town.festival.itPitch.label)), "sin arcos, la cancha todavía no se juega");
  await hacerTarea();
  await cerrarDialogo();
  ok(await p.evaluate(() => /Jugar una pichanga/.test(window.__g3d.town.festival.itPitch.label)), "con los arcos, la cancha del Pueblo abre la pichanga");
  await hacerTarea();
  pr = await prog();
  ok(pr.adventure.claimed.includes("zone:cancha"), "cancha renovada");
  await cerrarDialogo();
  await alMenu();

  // ---- el resto del Pueblo (rápido: se suman las ⭐ y se hacen las tareas) ----
  const resto = await p.evaluate(async () => {
    const main = [...document.querySelectorAll("script[type=module]")].map((s) => s.src).find((u) => /main\.js/.test(u)) || "";
    const v = main.includes("?") ? main.slice(main.indexOf("?")) : "";
    const A = await import(`./js/adventure.js${v}`);
    const pr = window.__progress();
    const opt = { aro: "dorado" };
    let n = 0;
    while (A.currentTask(pr) && A.currentTask(pr).zone.id !== "lago") {
      const t = A.currentTask(pr);
      A.addStars(pr, t.cost);
      const r = A.doTask(pr, t.id, t.choice ? opt[t.choice] : null);
      if (r.reward) window.dispatchEvent(new CustomEvent("adventure-changed", { detail: { reward: r.reward } }));
      n++;
    }
    window.dispatchEvent(new CustomEvent("adventure-changed", { detail: {} }));
    return n;
  });
  ok(resto === 16, `aro, festival, bosque y granja: 16 tareas más (${resto})`);
  ok(/Lago/.test(await p.textContent("#lp-adv-sub")), "el menú dice que sigue el lago");
  for (let i = 0; i < 12; i++) await partida("pichanga");
  await aventura();
  t = await town();
  ok(/Capitán Almendra/.test(t.label || "") && await p.evaluate(() => window.__g3d.town.zones.bases.lago.visible), "zona 7: te deja en el lago, junto al Capitán Almendra (el barrio se dibuja)");
  ok(await p.evaluate(() => !window.__g3d.town.zones.bases.bosque.visible), "el bosque, lejos, no se dibuja (ahorra trabajo al celular)");
  ok(await p.evaluate(() => { const z = window.__g3d.town.zones; const c = z.groups.lago.position; return !z.inside(c.x + 0, c.z + 0, 52); }), "al agua del lago no se entra");
  await hacerTarea();
  await cerrarDialogo();
  ok(await p.evaluate(() => { const z = window.__g3d.town.zones; const g = z.groups.lago; const v = g.localToWorld(new (g.position.constructor)(0, 0, 2)); return z.inside(v.x, v.z, 52); }), "con el muelle arreglado se puede caminar sobre él");
  await foto(p, "07-lago");
  await hacerTarea(); await cerrarDialogo();
  await hacerTarea(); await cerrarDialogo();
  await hacerTarea();
  pr = await prog();
  ok(Object.keys(pr.adventure.done).length === 28 && pr.adventure.claimed.filter((c) => c.startsWith("zone:")).length === 7, "¡el Pueblo entero renovado! (28 tareas, 7 premios de zona)");
  ok(await p.evaluate(() => window.__g3d.town.zones.fireworks === true), "fuegos artificiales sobre el lago");
  await cerrarDialogo();
  await p.waitForTimeout(800);
  await foto(p, "08-final");
  // los barrios ya renovados
  ok(await p.evaluate(() => { const z = window.__g3d.town.zones; return JSON.stringify(z.groups.bosque.userData.flags) === JSON.stringify({ sendero: 1, puente: 1, casita: 1, luces: 1 }) && z.groups.granja.userData.flags.corral === 1; }), "el bosque y la granja se ven renovados");
  // recolectar lo del día en el bosque
  await p.evaluate(() => window.__g3d.town.festival.goTo("bosque"));
  await p.waitForTimeout(500);
  const s0 = await estrellas();
  const c0 = (await prog()).coins;
  const juntado = await p.evaluate(async () => {
    const g = window.__g3d.town;
    const items = g.zones.items.filter((it) => it.zone === "bosque");
    for (const it of items) { for (let k = 0; k < 30 && !it.got; k++) { g.pos.set(it.x, 0, it.z); g.vel.set(0, 0, 0); await new Promise((r) => setTimeout(r, 150)); } }
    return g.zones.st().bosque.length;
  });
  ok(juntado === 6 && (await prog()).coins >= c0 + 12, `caminar por el bosque junta las 6 mazorcas del día (+2 🍫✨ cada una) (${juntado})`);
  ok(await estrellas() === s0 + 1, "juntar todo lo de un barrio da ⭐1");
  ok(await p.evaluate(() => /Cosecha/.test(document.querySelector(".tf-list").textContent)), "las actividades del día incluyen lo de los barrios");
  await alMenu();
  ok(/Renovaste el Pueblo entero/.test(await p.textContent("#lp-adv-sub")), "el menú dice que el Pueblo está completo");

  // ---- meta personal y resumen al volver (en "Mi personaje y mis espacios" → "Mis lugares y copas") ----
  await p.evaluate(() => document.getElementById("btn-path-me").click());
  await p.evaluate(() => document.getElementById("me-town").click());
  await p.waitForTimeout(400);
  ok(await p.isVisible("#screen-adventure"), "«Mis lugares y copas» abre lo construido, las copas y las metas de la semana");
  ok((await p.$$("#adv-goals .wk-goal")).length === 3, "hay 3 metas de la semana");
  // se cumple una (se suben a mano los contadores que miden) y se cobra
  const wk = await p.evaluate(() => {
    const pr = window.__progress();
    const st = pr.weekly;
    const g = st.goals[0];
    const c0 = pr.coins;
    const bump = { runs: ["totalRuns", 15], coins: ["totalCoinsEarned", 600], visits: ["visits", 4], treats: ["petTreats", 4], petplay: ["petPlays", 5], packs: ["packsOpened", 3], hello: ["townTalks", 10], alfajores: ["townItems", 20], missions: ["missionsClaimed", 6], gold: ["ciudadGold", 15], parkour: ["parkourFinishes", 3] }[g.id];
    if (bump) pr.stats[bump[0]] = (pr.stats[bump[0]] || 0) + bump[1];
    else if (g.id === "stars") pr.adventure.starsEarned += 8;
    else if (g.id === "wins") pr.sports.pichanga.wins += 2;
    return { id: g.id, c0 };
  });
  await p.click("#btn-adventure-back");
  await p.waitForTimeout(300);
  ok(/premios de las metas de la semana/.test(await p.textContent("#lb-goal")) && await p.isVisible("#lb-goal"), `el menú avisa que hay un premio para cobrar (meta «${wk.id}»)`);
  await p.evaluate(() => document.getElementById("btn-path-me").click());
  await p.evaluate(() => document.getElementById("me-town").click());
  await p.waitForTimeout(400);
  await p.click("#adv-goals .wk-claim");
  const cobro = await p.evaluate((c0) => window.__progress().coins - c0, wk.c0);
  ok(cobro >= 80 && (await p.$$("#adv-goals .wk-goal.claimed")).length === 1, `se cobra la meta: +${cobro} Matipuntos y queda marcada`);
  // la aventura de esta prueba también sube otros contadores (⭐, Matipuntos): se cobra todo lo que esté listo
  for (let i = 0; i < 3 && (await p.$("#adv-goals .wk-claim")); i++) await p.click("#adv-goals .wk-claim");
  if (await p.$("#adv-goals .wk-chest")) await p.click("#adv-goals .wk-chest");
  await p.click("#btn-adventure-back");
  await p.waitForTimeout(300);
  ok(/Metas de la semana: \d\/3|Metas de la semana listas/.test(await p.textContent("#lb-goal")), `con todo cobrado, el menú muestra el avance («${await p.textContent("#lb-goal")}»)`);
  // simula haber cerrado la app hace 5 horas (al salir, la app anota la hora; aquí se corrige justo antes de abrir)
  await p.addInitScript(() => {
    try { if (sessionStorage.getItem("qaAway") !== "1") return; } catch (e) { return; } // (el iframe de privacidad no tiene almacenamiento)
    sessionStorage.removeItem("qaAway");
    const id = localStorage.getItem("matichoc_last_active_profile");
    const k = "matichoc_save_v3_profile_" + id;
    const s = JSON.parse(localStorage.getItem(k));
    s.adventure.lastSeen = Date.now() - 5 * 3600e3;
    localStorage.setItem(k, JSON.stringify(s));
  });
  await p.evaluate(() => sessionStorage.setItem("qaAway", "1"));
  await p.reload({ waitUntil: "networkidle" });
  await p.waitForTimeout(700);
  ok(await p.isVisible("#lb-welcome") && /7 de 7|Pueblo está completo/.test(await p.textContent("#lb-welcome")), "al volver después de horas: resumen corto");
  await foto(p, "09-volver");

  // ---- perfil antiguo (sin aventura ni deportes en el guardado) ----
  await p.evaluate(() => {
    const id = "viejo1";
    const list = JSON.parse(localStorage.getItem("matichoc_profiles_v1") || "[]");
    list.push({ id, name: "Antiguo", characterId: "capitan", createdAt: 1 });
    localStorage.setItem("matichoc_profiles_v1", JSON.stringify(list));
    // guardado como los de antes de esta versión: sin "adventure" ni "sports"
    localStorage.setItem("matichoc_save_v3_profile_" + id, JSON.stringify({ playerName: "Antiguo", selectedCharacterId: "capitan", coins: 321, xp: 900, town: { date: "2020-01-01", collected: 3, talked: [] } }));
    localStorage.setItem("matichoc_last_active_profile", id);
  });
  await p.reload({ waitUntil: "networkidle" });
  await p.waitForTimeout(700);
  pr = await prog();
  ok(pr.playerName === "Antiguo" && pr.coins === 321 && pr.xp === 900, "perfil antiguo: abre con sus Matipuntos y su XP");
  ok(pr.adventure && pr.adventure.v === 2 && !pr.adventure.started && pr.sports && pr.sports.v === 2 && pr.sports.pichanga.diff === "accesible", "perfil antiguo: recibe la aventura y los deportes nuevos, sin empezar");
  ok(/vecinos/.test(await p.textContent("#lp-adv-sub")) && !(await p.isVisible("#lb-welcome")), "perfil antiguo: la aventura parte desde el comienzo (con la viñeta) y no hay resumen falso");

  // ---- "atrás" del celular en la pantalla de la aventura (se simula el puente nativo de Android) ----
  ok(reg.externas.length === 0, `sin conexiones externas (${reg.externas.length})`);
  ok(reg.errores.length === 0, `sin errores de página (${reg.errores.join(" | ")})`);
  await b.close();
  console.log(fallos ? `\n${fallos} prueba(s) fallaron` : "\nTodo bien");
  process.exit(fallos ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
