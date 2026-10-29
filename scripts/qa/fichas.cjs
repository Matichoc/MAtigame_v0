// Fichas de temporada: más cosas para comprar con ellas (ropa y decoración de Mi Casa) y, al terminar el evento, lo que
// sobra vuelve como Matipuntos (2 por ficha) una sola vez, con aviso. Uso: NODE_PATH=$(npm root -g) node scripts/qa/fichas.cjs [url]
const { abrir, BASE } = require("./lib.cjs");

let fallos = 0;
const ok = (c, t) => { console.log(`${c ? "OK " : "MAL"} ${t}`); if (!c) fallos++; };

(async () => {
  const { b, p, reg } = await abrir({ viewport: { width: 412, height: 860 }, touch: true });
  await p.clock.install({ time: new Date("2026-10-25T12:00:00-03:00") }); // en plena Noche de Cacao (Halloween)
  await p.goto(BASE + "?debug3d", { waitUntil: "networkidle" });
  await p.evaluate(() => localStorage.clear());
  await p.reload({ waitUntil: "networkidle" });
  await p.click("#profile-grid .add-profile");
  await p.fill("#new-profile-name", "Tina");
  await p.click("#btn-create-profile");
  await p.waitForTimeout(300);
  await p.click("#character-grid .character-card:nth-child(2)");
  await p.waitForTimeout(800);
  const r = await p.evaluate(async () => {
    const src = [...document.scripts].map((x) => x.src).find((u) => /\/js\/main\.js/.test(u));
    const W = await import(new URL("wardrobe-data.js", src).href);
    const H = await import(new URL("house-data.js", src).href);
    const E = await import(new URL("events.js", src).href);
    const porEvento = {};
    for (const it of [...W.ITEMS, ...H.HOUSE_ITEMS]) if (it.event) porEvento[it.event] = (porEvento[it.event] || 0) + 1;
    const pr = window.__progress();
    pr.eventTokens = { halloween: 200 };
    const ropa = E.buyEventItem(pr, "ev_capa_vampiro");
    const casa = H.buyHouseItem(pr, "ev_wl_calabazas");
    const otra = H.buyHouseItem(pr, "ev_wl_baston"); // de Navidad: todavía no se puede
    const c0 = pr.coins;
    window.__saveNow && window.__saveNow();
    return { porEvento, ropa, casa, otra, quedan: pr.eventTokens.halloween, c0 };
  });
  const minimo = Math.min(...Object.values(r.porEvento));
  ok(Object.keys(r.porEvento).length === 6 && minimo >= 10, `cada temporada tiene al menos 10 cosas para comprar con fichas (${JSON.stringify(r.porEvento)})`);
  ok(r.ropa && r.casa && r.quedan === 120, `en Halloween se compran ropa (capa de vampiro, 45) y decoración (pared de calabazas, 35) con fichas: quedan ${r.quedan}`);
  ok(!r.otra, "la decoración de Navidad no se puede comprar en Halloween");
  ok(await p.evaluate(() => document.getElementById("event-banner").textContent.includes("vuelven como Matipuntos")), "el cartel del evento avisa que las fichas que sobran vuelven como Matipuntos");
  // se guarda y termina el evento
  await p.evaluate(async () => { const src = [...document.scripts].map((x) => x.src).find((u) => /\/js\/main\.js/.test(u)); const S = await import(new URL("storage.js", src).href); S.saveProgress(window.__progress()); });
  await p.clock.setSystemTime(new Date("2026-11-10T12:00:00-03:00"));
  await p.reload({ waitUntil: "networkidle" });
  await p.waitForTimeout(1500);
  const d = await p.evaluate(() => { const pr = window.__progress(); const t = document.getElementById("toast"); return { coins: pr.coins, tokens: (pr.eventTokens || {}).halloween, toast: t ? t.textContent : "", owned: pr.wardrobe.owned.includes("ev_capa_vampiro") && pr.house.owned.includes("ev_wl_calabazas") }; });
  ok(d.coins - r.c0 === 240 && d.tokens === 0, `al terminar Halloween las 120 🎃 que sobraron se cambian por ${d.coins - r.c0} Matipuntos`);
  ok(/se cambiaron por 240 Matipuntos/.test(d.toast), `aparece el aviso («${d.toast.slice(0, 80)}»)`);
  ok(d.owned, "lo que se compró con fichas se conserva");
  await p.reload({ waitUntil: "networkidle" });
  await p.waitForTimeout(1200);
  const e = await p.evaluate(() => window.__progress().coins);
  ok(e === d.coins, "al volver a abrir no se cambian de nuevo");
  // el reloj simulado de Playwright intenta entrar al marco vacío (sandbox) de la página: ese aviso no es del juego
  const errores = reg.errores.filter((x) => !/Blocked script execution in 'about:blank'/.test(x));
  ok(errores.length === 0, `sin errores (${errores.join(" | ")})`);
  await b.close();
  console.log(fallos ? `\n${fallos} fallos` : "\nTodo bien");
  process.exit(fallos ? 1 : 0);
})();
