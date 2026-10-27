// Mascota con vida (js/pet-care.js y js/pet-buddy.js): hambre y ánimo que bajan con las horas, golosinas que se pagan
// con Matipuntos, caricias, la pelota que va a buscar y trae, el globito con lo que pide y los Matipuntos que encuentra
// cuando está feliz. En el Pueblo (botón 🐾) y en Mi Casa (tarjeta "Mi mascota" en Vivir).
// Uso: NODE_PATH=$(npm root -g) node scripts/qa/mascota.cjs [url]   (deja capturas en maquetas/mascota-*.png)
const { abrir, nuevoPerfil } = require("./lib.cjs");
const path = require("path");

let fallos = 0;
const ok = (c, t) => { console.log(`${c ? "OK " : "MAL"} ${t}`); if (!c) fallos++; };
const esperar = (p, fn, arg, ms = 20000) => p.waitForFunction(fn, arg, { timeout: ms }).then(() => true).catch(() => false);
const foto = (p, n) => p.screenshot({ path: path.join(__dirname, "..", "..", "maquetas", `mascota-${n}.png`) });

(async () => {
  const { b, p, reg } = await abrir({ viewport: { width: 915, height: 412 }, touch: true });
  await nuevoPerfil(p);
  // ---- la lógica: bajan con las horas, golosinas, premio cuando está feliz ----
  const logica = await p.evaluate(async () => {
    const src = [...document.scripts].map((x) => x.src).find((u) => /\/js\/main\.js/.test(u));
    const C = await import(new URL("pet-care.js", src).href);
    const pr = { coins: 100, stats: { totalCoinsEarned: 0 } };
    const now = Date.now();
    const a = C.petState(pr, "x", now);
    const b = C.petState(pr, "x", now + 10 * 3600000); // 10 horas después
    pr.petCare.x.food = 10;
    const hambre = C.petState(pr, "x");
    const f = C.feedPet(pr, "x", "galleta", () => 0.9);
    const caro = { coins: 5, stats: { totalCoinsEarned: 0 } };
    const sin = C.feedPet(caro, "x", "bombon");
    pr.petCare.x.food = 90; pr.petCare.x.joy = 90;
    const feliz = C.petState(pr, "x");
    const c0 = pr.coins;
    const hallazgos = [0, 1, 2, 3].map(() => C.patPet(pr, "x", () => 0).found);
    return { a, b, hambre, f, sin, feliz, gano: pr.coins - c0, hallazgos, coins: pr.coins };
  });
  ok(logica.a.food === 70 && logica.b.food === 30 && logica.b.joy === 20, `Mascota: con las horas baja el hambre y el ánimo (10 h: 🍗 ${logica.a.food}→${logica.b.food}, 💖 ${logica.a.joy}→${logica.b.joy})`);
  ok(logica.hambre.ask === "🍪" && logica.hambre.mood === "hambre", `Mascota: con hambre pide 🍪 en su globito («${logica.hambre.label}»)`);
  ok(logica.f.ok && logica.coins >= 0 && logica.sin.need === 30, `Mascota: la galletita cuesta 15 y sin Matipuntos no alcanza para el bombón (faltan ${logica.sin.need})`);
  ok(logica.feliz.mood === "feliz", "Mascota: bien comida y contenta está feliz");
  ok(logica.hallazgos.filter((x) => x > 0).length === 3 && logica.gano >= 30, `Mascota: feliz encuentra Matipuntos hasta 3 veces al día (${logica.hallazgos.join(", ")})`);

  // ---- Pueblo ----
  await p.evaluate(() => {
    const pr = window.__progress();
    pr.wardrobe.owned.push("pet_bombi");
    pr.wardrobe.looks[pr.selectedCharacterId] = { ...(pr.wardrobe.looks[pr.selectedCharacterId] || {}), pet: "pet_bombi" };
    pr.coins = 500;
    pr.petCare = { pet_bombi: { food: 10, joy: 50, at: Date.now(), day: "", pats: 0, plays: 0, finds: 0 } };
  });
  await p.evaluate(() => [...document.querySelectorAll(".game-card, #game-feature")].find((c) => c.textContent.includes("Pueblo")).click());
  await p.waitForFunction(() => window.__g3d && window.__g3d.town && window.__g3d.town.running, null, { timeout: 40000 });
  await p.waitForTimeout(800);
  await p.evaluate(() => { const s = document.getElementById("town-btn-start"); if (s && s.offsetParent) s.click(); });
  await p.waitForTimeout(1200);
  ok(await p.isVisible("#town-btn-pet"), "Pueblo: con una mascota puesta aparece el botón 🐾");
  ok(await esperar(p, () => window.__g3d.town.pet.ask === "🍪" && window.__g3d.town.pet.bubble && window.__g3d.town.pet.bubble.visible), "Pueblo: con hambre la mascota muestra el globito 🍪");
  await p.click("#town-btn-pet");
  ok(await p.isVisible("#town-petcard"), "Pueblo: el botón 🐾 abre la tarjeta de la mascota");
  const card = await p.textContent("#town-petcard");
  ok(/Bombi gatito/.test(card) && /Tiene hambre/.test(card), `Pueblo: la tarjeta dice cómo está («${card.slice(0, 60)}…»)`);
  await foto(p, "pueblo-tarjeta");
  const c0 = await p.evaluate(() => window.__progress().coins);
  await p.click('#town-petcard [data-a="galleta"]');
  const tras = await p.evaluate(() => ({ coins: window.__progress().coins, food: Math.round(window.__progress().petCare.pet_bombi.food) }));
  ok(c0 - tras.coins === 15 && tras.food >= 39, `Pueblo: la galletita cuesta 15 Matipuntos y le llena la pancita (🍗 ${tras.food})`);
  const j0 = await p.evaluate(() => window.__progress().petCare.pet_bombi.joy);
  await p.click('#town-petcard [data-a="pat"]');
  const j1 = await p.evaluate(() => ({ joy: window.__progress().petCare.pet_bombi.joy, fx: window.__g3d.town.pet.fx.length }));
  ok(j1.joy > j0 && j1.fx >= 3, `Pueblo: acariciarla sube el ánimo y suelta corazones (${j1.fx})`);
  await p.click('#town-petcard [data-a="ball"]');
  ok(await p.evaluate(() => !!window.__g3d.town.pet.chase && window.__g3d.town.pet.chase.holder.parent === window.__g3d.town.scene), "Pueblo: al tirar la pelota la mascota sale a buscarla");
  await esperar(p, () => { const f = window.__g3d.town.pet.chase; return f && f.phase === "back"; }, null, 15000);
  await foto(p, "pueblo-pelota");
  ok(await esperar(p, () => !window.__g3d.town.pet.chase, null, 20000), "Pueblo: la mascota trae la pelota de vuelta");
  const vuelta = await p.evaluate(() => { const g = window.__g3d.town; const h = g.hero.group.children.find((c) => c.userData.pet); return { ok: !!h && Math.abs(h.position.x - 0.95) < 0.01, plays: window.__progress().petCare.pet_bombi.plays, balls: g.scene.children.filter((o) => o.isMesh && o.geometry.type === "SphereGeometry" && o.material.color && o.material.color.getHex() === 0xff3b6b).length }; });
  ok(vuelta.ok && vuelta.plays === 1 && vuelta.balls === 0, `Pueblo: vuelve a su lugar junto al Matichico, cuenta el juego y la pelota se guarda (${JSON.stringify(vuelta)})`);
  // feliz: baila
  await p.evaluate(() => { const c = window.__progress().petCare.pet_bombi; c.food = 95; c.joy = 95; const pet = window.__g3d.town.pet; pet.stateT = 0; pet.danceT = 0.2; });
  ok(await esperar(p, () => window.__g3d.town.pet.spin > 0), "Pueblo: feliz, la mascota baila (da una vuelta)");
  ok(await p.evaluate(() => !window.__g3d.town.pet.bubble), "Pueblo: feliz no pide nada (sin globito)");
  await p.evaluate(() => document.getElementById("town-btn-menu").click());
  await p.waitForTimeout(300);
  ok(!(await p.isVisible("#town-petcard")), "Pueblo: al pausar se cierra la tarjeta");
  await p.evaluate(() => document.getElementById("pause-exit").click());
  await p.waitForTimeout(800);

  // ---- Mi Casa ----
  await p.evaluate(() => { const pr = window.__progress(); pr.petCare.pet_bombi.joy = 20; });
  await p.evaluate(() => { const t = document.querySelector('#lb-tabs [data-tab="me"]'); if (t) t.click(); });
  await p.waitForTimeout(300);
  await p.evaluate(() => document.getElementById("btn-open-house").click());
  ok(await esperar(p, () => !!document.querySelector("#house-grid .pet-card")), "Mi Casa: en Vivir aparece la tarjeta de la mascota");
  const casa = await p.textContent("#house-grid .pet-card");
  ok(/Quiere jugar/.test(casa), `Mi Casa: aburrida, la tarjeta dice que quiere jugar («${casa.slice(0, 50)}…»)`);
  await p.click('#house-grid .pet-card [data-a="ball"]');
  ok(await p.evaluate(() => !!window.__house.pet.chase), "Mi Casa: tirarle la pelota");
  await p.waitForTimeout(700);
  await foto(p, "casa-pelota");
  ok(await esperar(p, () => !window.__house.pet.chase, null, 20000), "Mi Casa: la trae de vuelta");
  const bola = await p.evaluate(() => { const v = window.__house; return Math.abs(v.hero.group.children.find((c) => c.userData.pet).position.x - 0.95) < 0.01; });
  ok(bola, "Mi Casa: la mascota vuelve a su lugar");
  await foto(p, "casa-tarjeta");
  ok(reg.errores.length === 0, `sin errores (${reg.errores.join(" | ")})`);
  await b.close();
  console.log(fallos ? `\n${fallos} fallos` : "\nTodo bien");
  process.exit(fallos ? 1 : 0);
})();
