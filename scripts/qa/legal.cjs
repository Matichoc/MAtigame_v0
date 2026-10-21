// Comprueba que Privacidad y Créditos/licencias se leen DENTRO del juego (sin salir) y sin peticiones externas.
const { abrir, BASE } = require("./lib.cjs");
(async () => {
  const { b, p, reg } = await abrir();
  await p.goto(BASE + "?debug3d", { waitUntil: "networkidle" });
  const r = {};
  for (const [id, cual, texto] of [["profiles", "privacy", "Política de privacidad de Matijuego"], ["profiles", "licenses", "Créditos y licencias"]]) {
    await p.click(`#screen-profiles .legal-open[data-legal=${cual}]`);
    await p.waitForTimeout(500);
    const f = p.frameLocator("#legal-frame");
    r[cual] = { titulo: await p.textContent("#legal-title"), h1: await f.locator("h1").textContent(), urlPagina: p.url() };
    await p.screenshot({ path: `${process.env.QA_OUT || "/tmp"}/legal-${cual}.png` });
    await p.click("#legal-close");
    await p.waitForTimeout(200);
  }
  r.cierra = await p.evaluate(() => document.getElementById("legal-dialog").classList.contains("hidden"));
  console.log(JSON.stringify(r, null, 1));
  console.log("externas:", reg.externas.length, "errores:", reg.errores, "fallidas:", reg.fallidas);
  // expectativas explícitas: cada página correcta, el título del cuadro, y que cierre
  const esperado = { privacy: ["Privacidad", "Política de privacidad de Matijuego"], licenses: ["Créditos y licencias", "Créditos y licencias"] };
  const fallos = [];
  for (const [k, [titulo, h1]] of Object.entries(esperado)) {
    if (!r[k] || r[k].titulo !== titulo) fallos.push(`${k}: título del cuadro "${r[k] && r[k].titulo}" ≠ "${titulo}"`);
    if (!r[k] || r[k].h1 !== h1) fallos.push(`${k}: la página cargada dice "${r[k] && r[k].h1}" ≠ "${h1}"`);
  }
  if (r.cierra !== true) fallos.push("el cuadro no se cerró");
  if (reg.externas.length) fallos.push("hubo peticiones externas");
  if (reg.errores.length) fallos.push("hubo errores de consola");
  if (reg.fallidas.length) fallos.push("hubo recursos que no cargaron");
  for (const m of fallos) console.log("MAL:", m);
  if (!fallos.length) console.log("OK: privacidad y licencias se leen dentro del juego y el cuadro cierra");
  await b.close();
  process.exit(fallos.length ? 1 : 0);
})();
