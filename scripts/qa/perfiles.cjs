// Perfiles y persistencia del progreso (navegador): crear, guardar, "cerrar y volver a abrir", varios perfiles, borrar y guardados antiguos/incompletos.
// Uso: NODE_PATH=$(npm root -g) node scripts/qa/perfiles.cjs [url-base]
const { abrir, BASE } = require("./lib.cjs");
const resultados = [];
const ok = (nombre, cond, detalle = "") => { resultados.push({ nombre, ok: !!cond, detalle }); console.log(`${cond ? "OK " : "MAL"} ${nombre}${detalle ? " · " + detalle : ""}`); };

(async () => {
  const { b, ctx, p, reg } = await abrir({});
  await p.goto(BASE + "?debug3d", { waitUntil: "networkidle" });
  await p.evaluate(() => localStorage.clear());
  await p.reload({ waitUntil: "networkidle" });
  // 1) crear el primer perfil
  ok("hay botón de agregar perfil", !!(await p.$("#profile-grid .add-profile")));
  await p.click("#profile-grid .add-profile");
  await p.fill("#new-profile-name", "Tina");
  await p.click("#btn-create-profile");
  await p.waitForTimeout(400);
  await p.click("#character-grid .character-card:nth-child(2)");
  await p.waitForTimeout(900);
  ok("llega al menú principal con el nombre", (await p.textContent("#hub-profile-name")) === "Tina");
  // 2) guardar algo (por la misma vía que usa el juego: saveProgress) y comprobar que queda en localStorage
  await p.evaluate(async () => { const st = await import("./js/storage.js"); const pr = window.__progress(); pr.coins = 1234; pr.xp = 55; pr.wardrobe.owned.push("polera"); st.saveProgress(pr); });
  const claves = await p.evaluate(() => Object.keys(localStorage).sort());
  ok("el progreso queda en localStorage (solo claves matichoc_*)", claves.length >= 2 && claves.every((k) => k.startsWith("matichoc_")), claves.join(", "));
  // 3) "matar la app" y volver a abrir: página nueva dentro del mismo contexto (el almacenamiento persiste)
  await p.close();
  const p2 = await ctx.newPage();
  p2.on("pageerror", (e) => reg.errores.push("pageerror: " + e.message));
  p2.on("dialog", (d) => d.accept());
  p2.on("request", (r) => { const u = r.url(); if (!u.startsWith(new URL(BASE).origin) && !/^(data|blob|about):/.test(u)) reg.externas.push(u); });
  await p2.goto(BASE + "?debug3d", { waitUntil: "networkidle" });
  await p2.waitForTimeout(800);
  // al reabrir, el juego entra solo al último perfil activo (o muestra la lista si no hay uno)
  const directo = await p2.evaluate(() => !document.getElementById("screen-hub").classList.contains("hidden"));
  ok("al reabrir entra al último perfil activo (o lo ofrece en la lista)", directo || !!(await p2.$("#profile-grid .profile-card")), directo ? "entra directo al menú" : "muestra la lista");
  if (!directo) { await p2.click("#profile-grid .profile-card"); await p2.waitForTimeout(900); }
  if (await p2.$("#character-grid .character-card:not(.hidden)") && !(await p2.evaluate(() => !document.getElementById("screen-hub").classList.contains("hidden")))) { await p2.click("#character-grid .character-card:nth-child(2)"); await p2.waitForTimeout(900); }
  ok("Matipuntos conservados tras reabrir", (await p2.textContent("#hub-total-coins")).replace(/\D/g, "") === "1234", await p2.textContent("#hub-total-coins"));
  ok("nombre conservado tras reabrir", (await p2.textContent("#hub-profile-name")) === "Tina");
  // 4) un segundo perfil no mezcla datos
  await p2.click("#btn-switch-profile");
  await p2.waitForTimeout(500);
  await p2.click("#profile-grid .add-profile");
  await p2.fill("#new-profile-name", "Pipo");
  await p2.click("#btn-create-profile");
  await p2.waitForTimeout(400);
  await p2.click("#character-grid .character-card:nth-child(1)");
  await p2.waitForTimeout(900);
  ok("el segundo perfil empieza en 0 Matipuntos", (await p2.textContent("#hub-total-coins")).replace(/\D/g, "") === "0", await p2.textContent("#hub-total-coins"));
  const n = await p2.evaluate(() => JSON.parse(localStorage.getItem("matichoc_profiles_v1")).length);
  ok("hay 2 perfiles guardados", n === 2, String(n));
  // 5) guardado incompleto (de una versión anterior): faltan campos nuevos y no debe romper ni perder lo que sí está
  await p2.evaluate(() => {
    const lista = JSON.parse(localStorage.getItem("matichoc_profiles_v1"));
    const clave = Object.keys(localStorage).find((k) => k.startsWith("matichoc_save_v3_profile_") && JSON.parse(localStorage.getItem(k)).coins === 1234);
    const o = JSON.parse(localStorage.getItem(clave));
    for (const campo of ["energy", "house", "album", "daily", "stats", "campaign", "missionsDone", "creations", "eventTokens"]) delete o[campo];
    localStorage.setItem(clave, JSON.stringify(o));
  });
  await p2.reload({ waitUntil: "networkidle" });
  await p2.waitForTimeout(800);
  // tras recargar entra solo al último perfil (Pipo): se vuelve a la lista con "Cambiar" y se elige a Tina
  if (await p2.evaluate(() => !document.getElementById("screen-hub").classList.contains("hidden"))) { await p2.click("#btn-switch-profile"); await p2.waitForTimeout(500); }
  let entrado = false;
  for (const el of await p2.$$("#profile-grid .profile-card:not(.add-profile)")) { if ((await el.textContent()).includes("Tina")) { await el.click(); entrado = true; break; } }
  await p2.waitForTimeout(900);
  if (await p2.evaluate(() => document.getElementById("screen-hub").classList.contains("hidden")) && (await p2.$("#character-grid .character-card"))) { await p2.click("#character-grid .character-card:nth-child(2)"); await p2.waitForTimeout(900); }
  ok("un guardado incompleto se abre y conserva los Matipuntos", entrado && (await p2.textContent("#hub-total-coins")).replace(/\D/g, "") === "1234");
  // 6) borrar un perfil (el juego pide confirmación; en la prueba se acepta)
  await p2.click("#btn-switch-profile");
  await p2.waitForTimeout(500);
  const antes = (await p2.$$("#profile-grid .profile-card:not(.add-profile)")).length;
  const del = await p2.$("#profile-grid .btn-delete-profile");
  if (del) { await del.click(); await p2.waitForTimeout(500); }
  const despues = (await p2.$$("#profile-grid .profile-card:not(.add-profile)")).length;
  ok("borrar un perfil lo quita de la lista", !!del && despues === antes - 1, `${antes} → ${despues}`);
  const sobrantes = await p2.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith("matichoc_save_v3_profile_")).length);
  ok("al borrar queda un solo guardado de perfil", sobrantes === 1, String(sobrantes));
  ok("sin peticiones fuera del origen", reg.externas.length === 0, reg.externas.join(", "));
  ok("sin errores de consola", reg.errores.length === 0, reg.errores.slice(0, 2).join(" | "));
  console.log(`\n${resultados.filter((r) => r.ok).length}/${resultados.length} comprobaciones OK`);
  await b.close();
  process.exit(resultados.every((r) => r.ok) ? 0 : 1);
})();
