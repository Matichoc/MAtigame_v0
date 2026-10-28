// Álbum de figuritas: página de temporada (solo durante su evento), kiosco (comprar una figurita que falta con
// Matipuntos), taller (cambiarla por repetidas) desde el cuadro de cada figurita, premio de la página de temporada y
// aviso antes de vender repetidas. Uso: NODE_PATH=$(npm root -g) node scripts/qa/album.cjs [url]
const { abrir, nuevoPerfil, BASE } = require("./lib.cjs");

let fallos = 0;
const ok = (c, t) => { console.log(`${c ? "OK " : "MAL"} ${t}`); if (!c) fallos++; };

(async () => {
  const { b, p, reg } = await abrir({ viewport: { width: 412, height: 915 }, touch: true });
  const avisos = [];
  p.removeAllListeners("dialog");
  p.on("dialog", (d) => { avisos.push(d.message()); d.accept(); });
  await nuevoPerfil(p);
  const mod = (ev) => p.evaluate(async (ev) => {
    const src = [...document.scripts].map((x) => x.src).find((u) => /\/js\/main\.js/.test(u));
    const A = await import(new URL("album.js", src).href);
    return ev(A);
  }, ev);
  // 1) sin evento (el reloj de la página en junio, fuera de toda temporada): los sobres no traen figuritas de temporada
  const junio = await abrir({ viewport: { width: 412, height: 915 } });
  await junio.p.clock.install({ time: new Date("2026-06-15T12:00:00-04:00") });
  await nuevoPerfil(junio.p);
  const sinEv = await junio.p.evaluate(async () => {
    const src = [...document.scripts].map((x) => x.src).find((u) => /\/js\/main\.js/.test(u));
    const A = await import(new URL("album.js", src).href);
    const pr = window.__progress();
    pr.packs = 60; let t = 0;
    for (let i = 0; i < 60; i++) t += A.openPack(pr).stickers.filter((s) => s.event).length;
    return { t, page: !!A.activeSeasonPage() };
  });
  await junio.b.close();
  ok(!sinEv.page && sinEv.t === 0, `sin evento no hay página de temporada ni figuritas de temporada en los sobres (${sinEv.t})`);
  // 2) con Halloween: ~40 % de las figuritas de los sobres son de su página
  await p.goto(BASE + "?debug3d&event=halloween", { waitUntil: "networkidle" });
  await p.evaluate(() => { const pr = window.__progress(); pr.album = {}; pr.albumClaimed = []; pr.coins = 0; });
  const conEv = await p.evaluate(async () => {
    const src = [...document.scripts].map((x) => x.src).find((u) => /\/js\/main\.js/.test(u));
    const A = await import(new URL("album.js", src).href);
    const pr = window.__progress();
    pr.packs = 100; let t = 0, n = 0, otra = 0;
    for (let i = 0; i < 100; i++) for (const s of A.openPack(pr).stickers) { n++; if (s.event === "halloween") t++; else if (s.event) otra++; }
    return { share: t / n, otra, page: A.activeSeasonPage() && A.activeSeasonPage().id, total: A.SEASON_STICKERS.filter((s) => s.event === "halloween").length };
  });
  ok(conEv.page === "t-halloween" && conEv.total === 14, `con Halloween aparece su página (12 + 2 brillantes: ${conEv.total})`);
  ok(conEv.share > 0.3 && conEv.share < 0.5 && conEv.otra === 0, `en los sobres ~40 % son de Halloween (${Math.round(conEv.share * 100)} %) y ninguna de otra temporada`);
  // 3) pantalla: la página de temporada va primero; tocar una que falta abre su cuadro
  await p.evaluate(() => { const pr = window.__progress(); pr.album = {}; pr.albumClaimed = []; pr.coins = 0; pr.packs = 0; });
  await p.evaluate(() => document.getElementById("btn-open-progress").click());
  await p.waitForTimeout(600);
  await p.evaluate(() => { const f = document.getElementById("pg-album-fold"); if (f) f.open = true; });
  await p.waitForTimeout(300);
  const titulo = await p.evaluate(() => document.querySelector("#pg-album .pg-page-title").textContent);
  ok(/Noche de Cacao/.test(titulo) && /hasta el/.test(titulo), `la primera página del álbum es la de temporada («${titulo}»)`);
  await p.evaluate(() => document.querySelector("#pg-album .pg-sticker.missing").click());
  await p.waitForTimeout(300);
  ok(await p.isVisible("#sticker-dialog"), "tocar una figurita que falta abre su cuadro");
  ok(await p.evaluate(() => document.getElementById("sk-buy").disabled && document.getElementById("sk-trade").disabled), `sin Matipuntos ni repetidas, comprar y cambiar están deshabilitados («${await p.textContent("#sk-buy")}»)`);
  await p.click("#sk-close");
  // 4) kiosco: con Matipuntos se compra (400 la normal)
  await p.evaluate(() => { window.__progress().coins = 1000; });
  await p.evaluate(() => document.getElementById("btn-progress-back").click());
  await p.evaluate(() => document.getElementById("btn-open-progress").click());
  await p.waitForTimeout(500);
  const objetivo = await p.evaluate(() => { const c = [...document.querySelectorAll("#pg-album .pg-sticker.missing:not(.foil)")][0]; c.click(); return document.getElementById("sk-title").textContent; });
  await p.waitForTimeout(200);
  await p.click("#sk-buy");
  await p.waitForTimeout(300);
  const tras = await p.evaluate((n) => { const pr = window.__progress(); return { coins: pr.coins, tiene: Object.keys(pr.album).length }; }, objetivo);
  ok(tras.coins === 600 && tras.tiene === 1 && !(await p.isVisible("#sticker-dialog")), `comprar «${objetivo}» cuesta 400 Matipuntos y queda en el álbum (${tras.coins} restantes)`);
  // 5) taller: con 12 repetidas se cambia una normal
  await p.evaluate(() => { const pr = window.__progress(); pr.album["alf-menta"] = 13; });
  await p.evaluate(() => document.getElementById("btn-progress-back").click());
  await p.evaluate(() => document.getElementById("btn-open-progress").click());
  await p.waitForTimeout(500);
  await p.evaluate(() => { const c = [...document.querySelectorAll("#pg-album .pg-sticker.missing.tradable:not(.foil)")][0]; c.click(); });
  await p.waitForTimeout(200);
  ok(!(await p.evaluate(() => document.getElementById("sk-trade").disabled)), "con 12 repetidas el botón «Cambiar» se activa");
  await p.click("#sk-trade");
  await p.waitForTimeout(300);
  ok(await p.evaluate(() => window.__progress().album["alf-menta"] === 1 && Object.keys(window.__progress().album).length === 3), "cambiar gasta 12 repetidas y suma la figurita");
  // 6) completar la página de temporada da Matipuntos y fichas de Halloween
  const premio = await p.evaluate(async () => {
    const src = [...document.scripts].map((x) => x.src).find((u) => /\/js\/main\.js/.test(u));
    const A = await import(new URL("album.js", src).href);
    const pr = window.__progress();
    const list = A.SEASON_STICKERS.filter((s) => s.event === "halloween");
    list.slice(0, -1).forEach((s) => { pr.album[s.id] = 1; });
    pr.coins = 5000;
    const fichas = (pr.eventTokens || {}).halloween || 0;
    const r = A.buySticker(pr, list[list.length - 1].id);
    return { ok: !!r, rewards: r.rewards.map((m) => m.text), coins: pr.coins, fichas: ((pr.eventTokens || {}).halloween || 0) - fichas };
  });
  ok(premio.ok && premio.coins === 5000 - 1200 + 300 && premio.fichas === 30, `completar la página de Halloween: +300 Matipuntos y +30 fichas (${premio.rewards.join(" · ")})`);
  // 7) fuera de temporada: las de Halloween no se compran ni se cambian, y su página dice que vuelve
  await p.goto(BASE + "?debug3d&event=navidad", { waitUntil: "networkidle" });
  const fuera = await p.evaluate(async () => {
    const src = [...document.scripts].map((x) => x.src).find((u) => /\/js\/main\.js/.test(u));
    const A = await import(new URL("album.js", src).href);
    const pr = window.__progress();
    const s = A.SEASON_STICKERS.find((x) => x.event === "halloween");
    delete pr.album[s.id]; pr.coins = 5000;
    return { buy: !!A.buySticker(pr, s.id) };
  });
  ok(!fuera.buy, "fuera de su temporada, una figurita de Halloween no se puede comprar");
  await p.evaluate(() => document.getElementById("btn-open-progress").click());
  await p.waitForTimeout(500);
  await p.evaluate(() => { const f = document.getElementById("pg-album-fold"); if (f) f.open = true; });
  const pags = await p.evaluate(() => [...document.querySelectorAll("#pg-album .pg-page-title")].map((h) => h.textContent));
  ok(/Navidad/.test(pags[0]) && pags.some((t) => /Noche de Cacao.*vuelve en su temporada/.test(t)), "en Navidad su página va primero y la de Halloween queda al final («vuelve en su temporada»)");
  ok(await p.evaluate(() => [...document.querySelectorAll("#pg-album .pg-sticker")].some((c) => /Vuelve en su temporada/.test(c.textContent) && !c.classList.contains("missing"))), "las de Halloween que faltan no se pueden tocar fuera de su temporada");
  // 8) vender repetidas avisa si todavía hay figuritas que faltan y se pueden cambiar
  await p.evaluate(() => { const pr = window.__progress(); pr.album["alf-trufa"] = 30; });
  await p.evaluate(() => document.getElementById("btn-progress-back").click());
  await p.evaluate(() => document.getElementById("btn-open-progress").click());
  await p.waitForTimeout(500);
  avisos.length = 0;
  await p.evaluate(() => [...document.querySelectorAll("#pg-album-tools button")].find((x) => /Vender/.test(x.textContent)).click());
  await p.waitForTimeout(300);
  ok(avisos.some((t) => /Ojo: te faltan/.test(t)), "antes de vender repetidas avisa que sirven para cambiar las que faltan");
  ok(reg.errores.length === 0, `sin errores (${reg.errores.join(" | ")})`);
  await b.close();
  console.log(fallos ? `\n${fallos} fallos` : "\nTodo bien");
  process.exit(fallos ? 1 : 0);
})();
