// Ciudad Choco: las misiones ya hechas vuelven cada día (el "!" reaparece sobre los vecinos) y pagan la mitad.
// Uso: node scripts/qa/ciudad-diaria.cjs [url]   (sale con código 1 si algo no cumple)
const { abrir, nuevoPerfil } = require("./lib.cjs");

(async () => {
  const { b, p, reg } = await abrir({});
  const fallos = [];
  const ok = (cond, texto) => { console.log(`${cond ? "OK " : "MAL"} ${texto}`); if (!cond) fallos.push(texto); };
  await nuevoPerfil(p);
  // perfil con todas las misiones de la ciudad hechas AYER (y la ciudad desbloqueada)
  await p.evaluate(() => {
    for (const k of Object.keys(localStorage)) if (k.includes("profile_")) {
      try {
        const o = JSON.parse(localStorage.getItem(k));
        if (!o || typeof o.coins !== "number") continue;
        o.coins = 1000; o.unlockedGames = ["futbol", "dulces", "aventura", "ciudad"];
        const ids = ["reja", "manzanas", "plaza", "flores", "perrito", "abuelita", "entrega", "carrera"];
        o.ciudad = { done: Object.fromEntries(ids.map((i) => [i, 1])), last: Object.fromEntries(ids.map((i) => [i, "2000-01-01"])), gDay: "", gCount: 0, rDay: "", rCount: 0, medal: 1 };
        localStorage.setItem(k, JSON.stringify(o));
      } catch (e) { /* no es un perfil */ }
    }
  });
  await p.reload({ waitUntil: "networkidle" });
  await p.waitForTimeout(800);
  const prof = await p.$("#profile-grid .profile-card");
  if (prof) { await prof.click(); await p.waitForTimeout(500); }
  if (await p.$("#character-grid .character-card")) { await p.click("#character-grid .character-card:nth-child(2)"); await p.waitForTimeout(800); }
  await p.locator(".game-card, #game-feature", { hasText: "Ciudad" }).first().click();
  await p.waitForTimeout(2500);
  await p.click("#ciudad-btn-start").catch(() => {});
  await p.waitForTimeout(2000);
  const bangs = () => p.evaluate(() => { const g = window.__g3d.ciudad; return Object.values(g.npcs).filter((n) => n.bang && n.bang.visible).length; });
  // (además de las 8 hechas ayer, están las 3 nuevas de los barrios —parque, playa y colegio—, nunca hechas)
  ok((await bangs()) === 11, `misiones hechas ayer: los 8 vecinos vuelven a tener "!", y también los 3 de los barrios nuevos (${await bangs()})`);
  // se completa una (reja) "hoy": su "!" se apaga hasta mañana y paga la mitad
  const r = await p.evaluate(() => {
    const g = window.__g3d.ciudad;
    const c0 = g.progress.coins;
    g.active = { id: "reja", step: "report", data: {} };
    g._completeMission();
    return { pagado: g.progress.coins - c0, pepe: g.npcs.pepe.bang.visible, hoy: g.save.last.reja };
  });
  ok(r.pagado === 20, `repetir "Pintar la reja" paga la mitad (+${r.pagado})`);
  ok(r.pepe === false && (await bangs()) === 10, "su vecino ya no tiene \"!\" hoy; los otros 10 sí");
  // la lista lo muestra
  await p.evaluate(() => window.__g3d.ciudad.openList());
  await p.waitForTimeout(300);
  const estados = await p.$$eval("#ciudad-list .cl-st", (els) => els.map((e) => e.textContent));
  ok(estados[0].startsWith("✅") && estados.slice(1, 8).every((x) => x === "🔔") && estados.slice(8).every((x) => x === ""), `lista: ✅ la de hoy, 🔔 las que se repiten y sin marca las nuevas (${estados.join(" ")})`);
  // tope diario: tras 4 pedidos pagados hoy, ya no aparecen más "!"
  await p.evaluate(() => { const g = window.__g3d.ciudad; g.save.rCount = 4; g._updateBangs(); });
  ok((await bangs()) === 3, "con el tope de 4 pedidos pagados hoy, se apagan los \"!\" de los repetidos (quedan los 3 nuevos, nunca hechos)");
  ok(reg.errores.length === 0 && reg.externas.length === 0, `0 errores (${reg.errores[0] || ""}) y 0 peticiones externas`);
  await b.close();
  console.log(fallos.length ? `\nFALLAN ${fallos.length}` : "\nTodo OK");
  process.exit(fallos.length ? 1 : 0);
})();
