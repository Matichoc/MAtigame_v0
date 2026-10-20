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
  await b.close();
  process.exit(reg.externas.length || reg.errores.length || reg.fallidas.length ? 1 : 0);
})();
