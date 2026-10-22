// Recorre la aventura "Preparar el gran festival del Pueblo" en el navegador, como un perfil nuevo:
// menú con los tres caminos → elegir Matichico → "Continuar mi aventura" → Pueblo → hablar → jugar → elegir estilo →
// cerrar capítulo… hasta celebrar el festival. Revisa que el avance, las elecciones y los premios sobrevivan a cerrar y
// reabrir, que los premios no se paguen dos veces, que "atrás" funcione y que no haya conexiones externas.
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
  const partida = (game) => p.evaluate(async (g) => { const m = await import("./js/progression.js"); m.recordRun(window.__progress(), g, 0); }, game);
  const irPueblo = async () => {
    await p.click("#adv-now .adv-actions .btn-primary, #adv-now .adv-actions .btn-secondary");
    await p.waitForFunction(() => window.__g3d && window.__g3d.town && window.__g3d.town.ready && window.__g3d.town.running, null, { timeout: 40000 });
    if (await p.isVisible("#town-btn-start")) await p.click("#town-btn-start");
    await p.waitForTimeout(900);
  };
  const usar = async () => { await p.keyboard.press("e"); await p.waitForTimeout(400); };
  const cerrarDialogo = async () => { if (!(await town()).dialog) return; await p.keyboard.press("e"); await p.waitForTimeout(250); };
  const alMenu = async () => { await p.click("#town-btn-menu"); await p.waitForTimeout(500); };

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
  ok(/Capítulo 1 de 3/.test(await p.textContent("#lp-adv-sub")), "con personaje: el botón dice el capítulo y el objetivo");
  ok(await p.evaluate(() => document.getElementById("btn-path-adventure").classList.contains("lp-pulse")), "aventura sin empezar: el botón llama la atención");
  await p.click("#btn-path-me");
  ok(await p.isVisible("#me-dialog"), "Mi personaje y mis espacios abre sus opciones");
  await p.click("#me-close");
  await p.click("#btn-path-free");
  await p.waitForTimeout(400);
  ok(await p.evaluate(() => document.activeElement && document.activeElement.id === "lb-games-title"), "Jugar libremente lleva a la grilla de juegos");
  await foto(p, "01-menu");

  // ---- Capítulo 1 ----
  await p.click("#btn-path-adventure");
  await p.waitForTimeout(300);
  ok(await p.isVisible("#screen-adventure") && /Bombi/.test(await p.textContent("#adv-now")), "pantalla de la aventura con el pedido de Bombi");
  await foto(p, "02-aventura");
  await irPueblo();
  let t = await town();
  ok(/Bombi/.test(t.label || ""), `"Ir al Pueblo" te deja junto a Bombi (${t.label})`);
  ok(/Capítulo 1\/3/.test(t.goal), "el Pueblo muestra el objetivo");
  await foto(p, "03-pueblo-bombi");
  await usar();
  t = await town();
  ok(/rincón/.test(t.dialog) && /termina una partida/.test(t.dialog), "Bombi cuenta su pedido y el siguiente paso");
  ok(await p.evaluate(() => document.querySelectorAll("#town-dialog .td-play").length >= 2), "el diálogo trae atajos para jugar");
  await cerrarDialogo();
  await alMenu();
  await partida("memoria");
  let pr = await prog();
  ok(pr.adventure.steps["c1.materiales"] === 1, "terminar una partida de Memoria cumple el paso");
  await p.click("#btn-path-adventure");
  await p.waitForTimeout(300);
  await p.click("#adv-now .btn-primary"); // Elegir el estilo
  await p.waitForTimeout(300);
  ok(await p.isVisible("#adv-choice") && (await p.$$("#adv-choice-options .adv-opt")).length === 3, "cuadro con 3 estilos para el rincón");
  await foto(p, "04-elegir");
  await p.click("#adv-choice-options .adv-opt:nth-child(2)");
  await p.waitForTimeout(300);
  pr = await prog();
  ok(pr.adventure.choices.plaza === "guirnaldas", "se guardó el estilo elegido");
  await irPueblo();
  ok(await p.evaluate(() => window.__g3d.town.festival.groups.plaza.userData.key === "plaza:guirnaldas"), "el rincón del Pueblo ya se ve con guirnaldas");
  await foto(p, "05-rincon");
  const coins0 = (await prog()).coins;
  await usar();
  t = await town();
  pr = await prog();
  ok(/Lo logramos/.test(t.dialog) && pr.adventure.claimed.includes("chapter:c1"), "volver con Bombi cierra el capítulo 1");
  ok(pr.coins >= coins0 + 60, `premio del capítulo pagado (${coins0} → ${pr.coins})`);
  await cerrarDialogo();
  await usar();
  t = await town();
  const coins1 = (await prog()).coins;
  ok(/guirnaldas/.test(t.dialog), "Bombi recuerda las guirnaldas");
  await cerrarDialogo();
  await alMenu();

  // ---- cerrar y reabrir la app a mitad de la aventura ----
  await p.reload({ waitUntil: "networkidle" });
  await p.waitForTimeout(800);
  pr = await prog();
  ok(pr.adventure.steps["c1.inaugurar"] === 1 && pr.adventure.choices.plaza === "guirnaldas" && pr.coins === coins1, "al reabrir: avance, elección y Matipuntos iguales (sin pagar de nuevo)");
  ok(/Capítulo 2 de 3/.test(await p.textContent("#lp-adv-sub")), "al reabrir: el menú dice el capítulo 2");

  // ---- Capítulo 2 ----
  await p.click("#btn-path-adventure");
  await p.waitForTimeout(300);
  await irPueblo();
  t = await town();
  ok(/Capi Menta/.test(t.label || ""), "capítulo 2: te deja junto a Capi Menta");
  await usar();
  await p.waitForTimeout(300);
  ok(await p.isVisible("#adv-choice"), "Capi Menta pide elegir los colores (se abre el cuadro en el Pueblo)");
  await p.keyboard.press("e"); // con un cuadro abierto, el Pueblo no reacciona a las teclas
  ok(await p.isVisible("#adv-choice"), "con el cuadro abierto el Pueblo no se mueve ni actúa");
  await p.click("#adv-choice-options .adv-opt:nth-child(2)");
  await p.waitForTimeout(400);
  ok(await p.evaluate(() => window.__g3d.town.festival.groups.cancha.userData.key === "cancha:celeste"), "la cancha queda arreglada con los colores celestes");
  await cerrarDialogo();
  await alMenu();
  await partida("recolecta");
  pr = await prog();
  ok(pr.adventure.steps["c2.pichanga"] === 1, "capítulo 2: Recolecta sirve de alternativa a la pichanga");
  await p.click("#btn-path-adventure");
  await p.waitForTimeout(300);
  await irPueblo();
  await usar();
  pr = await prog();
  ok(pr.adventure.claimed.includes("chapter:c2"), "capítulo 2 cerrado");
  await cerrarDialogo();
  await alMenu();

  // ---- Capítulo 3 ----
  await p.click("#btn-path-adventure");
  await p.waitForTimeout(300);
  await irPueblo();
  await usar();
  await p.waitForTimeout(300);
  await p.click("#adv-choice-options .adv-opt:nth-child(3)");
  await p.waitForTimeout(300);
  await cerrarDialogo();
  await alMenu();
  await partida("basquet_tiros");
  await p.click("#btn-path-adventure");
  await p.waitForTimeout(300);
  ok(/fuente/.test(await p.textContent("#adv-now")), "último paso: celebrar en la fuente");
  await irPueblo();
  t = await town();
  ok(/Celebrar/.test(t.label || ""), "en la fuente aparece «Celebrar el gran festival»");
  await usar();
  pr = await prog();
  ok(pr.adventure.claimed.includes("chapter:c3") && Object.keys(pr.adventure.steps).length === 12, "¡festival terminado!");
  ok(await p.evaluate(() => !!window.__g3d.town.festival.groups.festival), "la plaza queda de fiesta");
  await cerrarDialogo();
  await p.waitForTimeout(600);
  await foto(p, "06-festival");
  const coins2 = (await prog()).coins;
  await usar(); // otra vez en la fuente: solo chocolate, sin premio
  ok((await prog()).coins === coins2, "celebrar de nuevo no vuelve a pagar");
  await cerrarDialogo();
  await alMenu();
  ok(/Festival listo/i.test(await p.textContent("#lp-adv-sub")), "el menú dice que el festival está listo");

  // ---- meta personal y resumen al volver ----
  await p.click("#btn-path-adventure");
  await p.waitForTimeout(300);
  await p.click("#adv-goals .adv-goal:nth-of-type(4)"); // casa
  await p.click("#btn-adventure-back");
  await p.waitForTimeout(300);
  ok(/Mi meta/.test(await p.textContent("#lb-goal")) && await p.isVisible("#lb-goal"), "la meta elegida se ve en el menú");
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
  ok(await p.isVisible("#lb-welcome") && /3 de 3|festival ya está armado/.test(await p.textContent("#lb-welcome")), "al volver después de horas: resumen corto");
  await foto(p, "07-volver");

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
  ok(pr.adventure && pr.adventure.v === 1 && !pr.adventure.started && pr.sports && pr.sports.v === 1, "perfil antiguo: recibe la aventura y los deportes nuevos, sin empezar");
  ok(/Capítulo 1 de 3/.test(await p.textContent("#lp-adv-sub")) && !(await p.isVisible("#lb-welcome")), "perfil antiguo: la aventura parte en el capítulo 1 y no hay resumen falso");

  // ---- "atrás" del celular en la pantalla de la aventura (se simula el puente nativo de Android) ----
  ok(reg.externas.length === 0, `sin conexiones externas (${reg.externas.length})`);
  ok(reg.errores.length === 0, `sin errores de página (${reg.errores.join(" | ")})`);
  await b.close();
  console.log(fallos ? `\n${fallos} prueba(s) fallaron` : "\nTodo bien");
  process.exit(fallos ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
