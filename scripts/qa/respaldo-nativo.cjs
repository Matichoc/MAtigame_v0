// Copia del progreso en el almacenamiento propio de la app (js/native.js): se simula el puente de Capacitor de un iPhone
// (en el navegador no existe) con los plugins Preferences y Haptics, y se comprueba que:
//  - el juego guarda una copia de los perfiles y el progreso en el almacenamiento nativo;
//  - si el navegador interno pierde los datos (como cuando iOS limpia WebKit por falta de espacio), al volver a abrir
//    la app el progreso vuelve solo (mismo perfil, mismos Matipuntos) antes de que se vea la pantalla de perfiles;
//  - una app recién instalada (sin copia) arranca normal, y la copia buena no se pisa con una vacía;
//  - la vibración usa el plugin nativo (en iPhone no existe navigator.vibrate).
// Uso: NODE_PATH=$(npm root -g) node scripts/qa/respaldo-nativo.cjs [url-de-la-app]   (sale con código 1 si algo no cumple)
const { abrir, BASE, nuevoPerfil } = require("./lib.cjs");

(async () => {
  const { b, p, reg } = await abrir({});
  // puente falso con la forma del de Capacitor 8 (native-bridge.js): nativePromise(plugin, método, opciones).
  // El "almacenamiento nativo" se simula en sessionStorage: sobrevive a recargar la página y a borrar localStorage.
  await p.addInitScript(() => {
    const prefs = () => JSON.parse(sessionStorage.getItem("__prefs") || "{}");
    window.__vibraciones = [];
    window.Capacitor = {
      isNativePlatform: () => true,
      getPlatform: () => "ios",
      PluginHeaders: [{ name: "Preferences" }, { name: "Haptics" }],
      addListener: () => ({ remove() {} }),
      nativeCallback: () => {},
      nativePromise: async (plugin, metodo, o) => {
        if (plugin === "Preferences" && metodo === "set") { const d = prefs(); d[o.key] = o.value; sessionStorage.setItem("__prefs", JSON.stringify(d)); return {}; }
        if (plugin === "Preferences" && metodo === "get") return { value: prefs()[o.key] ?? null };
        if (plugin === "Haptics") { window.__vibraciones.push(metodo + ":" + (o && o.style)); return {}; }
        throw new Error("plugin no simulado: " + plugin);
      },
    };
  });
  const fallos = [];
  const ok = (cond, texto) => { console.log(`${cond ? "OK " : "MAL"} ${texto}`); if (!cond) fallos.push(texto); };
  const respaldo = () => p.evaluate(() => { const v = JSON.parse(sessionStorage.getItem("__prefs") || "{}").matichoc_backup_v1; return v ? JSON.parse(v) : null; });
  const forzarCopia = () => p.evaluate(async () => (await import("./js/native.js")).backupNow());

  // app recién instalada: arranca normal y sin copia
  await p.goto(BASE + "?debug3d", { waitUntil: "networkidle" });
  await p.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await p.reload({ waitUntil: "networkidle" });
  ok(await p.isVisible("#profile-grid .add-profile"), "sin datos ni copia: la app arranca en la pantalla de perfiles");
  ok(!(await respaldo()), "sin perfiles no se guarda ninguna copia");

  // perfil con progreso → copia
  await p.click("#profile-grid .add-profile");
  await p.fill("#new-profile-name", "Tina");
  await p.click("#btn-create-profile");
  await p.waitForTimeout(300);
  await p.click("#character-grid .character-card:nth-child(2)");
  await p.waitForTimeout(800);
  await p.evaluate(() => { window.__progress().coins = 777; });
  await p.evaluate(async () => { const s = await import("./js/storage.js"); s.saveProgress(window.__progress()); });
  ok(await forzarCopia(), "con un perfil creado, se guarda la copia en el almacenamiento de la app");
  const c1 = await respaldo();
  const prof = c1 && JSON.parse(c1.data.matichoc_profiles_v1 || "[]");
  ok(Array.isArray(prof) && prof.some((x) => x.name === "Tina"), "la copia trae la lista de perfiles");
  ok(c1 && Object.entries(c1.data).some(([k, v]) => k !== "matichoc_profiles_v1" && /"coins":777/.test(v)), "la copia trae el progreso (777 Matipuntos)");
  ok(!(await forzarCopia()), "si nada cambió, no se vuelve a escribir la copia");

  // vibración nativa
  await p.evaluate(async () => (await import("./js/native.js")).vibrate(60));
  ok((await p.evaluate(() => window.__vibraciones)).includes("impact:MEDIUM"), "la vibración usa el plugin nativo (Haptics)");

  // el navegador interno pierde los datos → al abrir, vuelve todo
  await p.evaluate(() => localStorage.clear());
  await p.reload({ waitUntil: "networkidle" });
  await p.waitForTimeout(600);
  const tras = await p.evaluate(async () => {
    const nombres = [...document.querySelectorAll("#profile-grid .profile-card:not(.add-profile)")].map((e) => e.textContent);
    const pant = [...document.querySelectorAll(".screen:not(.hidden)")].map((e) => e.id);
    return { restauradas: (await import("./js/native.js")).restored, nombres, pant, perfiles: localStorage.getItem("matichoc_profiles_v1") };
  });
  ok(tras.restauradas > 0, `al volver a abrir sin datos, se restauran desde la copia (${tras.restauradas} claves)`);
  // como cualquier día: abre directo en el menú con el último perfil usado (o en la pantalla de perfiles, si no hay último)
  ok(tras.pant.includes("screen-hub") || tras.nombres.some((t) => t.includes("Tina")), `vuelve solo al menú con el perfil de siempre, sin hacer nada (${tras.pant.join(",")})`);
  ok((await p.evaluate(() => window.__progress() && window.__progress().coins)) === 777, "y conserva sus Matipuntos (777)");

  // la copia buena no se pisa con una vacía: borrar todo y forzar copia antes de recargar
  await p.evaluate(() => localStorage.clear());
  await forzarCopia();
  const c2 = await respaldo();
  ok(c2 && c2.data.matichoc_profiles_v1 && JSON.parse(c2.data.matichoc_profiles_v1).some((x) => x.name === "Tina"), "si los datos se pierden con la app abierta, la copia buena no se reemplaza por una vacía");

  ok(reg.errores.length === 0, `sin errores de página (${reg.errores.join(" | ")})`);
  ok(reg.externas.length === 0, `sin conexiones externas (${reg.externas.length})`);
  await b.close();
  console.log(fallos.length ? `\n${fallos.length} con problemas` : "\nTodo bien");
  process.exit(fallos.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
