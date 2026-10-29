// Aventura Choco más 3D: cámara un poco desde arriba, camino con fondo (pastito y flores en los bordes), prado con árboles
// detrás, y la Matichica de tres cuartos (se le ve la cara) que se estira al saltar, se aplasta al caer y levanta polvito.
// Uso: NODE_PATH=$(npm root -g) node scripts/qa/aventura-3d.cjs [url]   (deja capturas en maquetas/aventura3d-*.png)
const { abrir, nuevoPerfil } = require("./lib.cjs");
const path = require("path");

let fallos = 0;
const ok = (c, t) => { console.log(`${c ? "OK " : "MAL"} ${t}`); if (!c) fallos++; };
const foto = (p, n) => p.screenshot({ path: path.join(__dirname, "..", "..", "maquetas", `aventura3d-${n}.png`) });

(async () => {
  const { b, p, reg } = await abrir({ viewport: { width: 915, height: 412 }, touch: true });
  await nuevoPerfil(p);
  await p.evaluate(() => { for (const k of Object.keys(localStorage)) if (k.includes("profile_")) { try { const o = JSON.parse(localStorage.getItem(k)); if (o && typeof o.coins === "number") { o.unlockedGames = ["aventura"]; localStorage.setItem(k, JSON.stringify(o)); } } catch (e) { /* no es un perfil */ } } });
  await p.reload({ waitUntil: "networkidle" });
  await p.waitForTimeout(800);
  await p.evaluate(() => [...document.querySelectorAll(".game-card, #game-feature")].find((c) => c.textContent.includes("Aventura Choco")).click());
  await p.waitForFunction(() => window.__g3d && window.__g3d.aventura, null, { timeout: 40000 });
  await p.waitForSelector("#aventura-btn-start", { state: "visible", timeout: 60000 });
  await p.evaluate(() => document.getElementById("aventura-btn-start").click());
  await p.waitForFunction(() => window.__g3d.aventura.state === "playing", null, { timeout: 20000 });
  const esc = await p.evaluate(() => {
    const g = window.__g3d.aventura;
    const inst = g.levelGroup.children.filter((c) => c.isInstancedMesh);
    return { inst: inst.length, decor: inst.map((c) => c.count), camUp: g.camera.position.y - g.camY, camSide: g.camX - g.camera.position.x };
  });
  ok(esc.camUp > 2.5 && esc.camSide > 1, `la cámara mira un poco desde arriba y de lado (+${esc.camUp.toFixed(1)} arriba, ${esc.camSide.toFixed(1)} al lado)`);
  ok(esc.inst >= 8, `pasto, flores y árboles van agrupados (${esc.inst} grupos)`);
  // corre a la derecha
  await p.evaluate(() => { window.__g3d.aventura.keys.right = true; });
  await p.waitForFunction(() => Math.abs(window.__g3d.aventura.player.vx) > 5, null, { timeout: 20000 });
  await p.waitForTimeout(400);
  const run = await p.evaluate(() => { const g = window.__g3d.aventura; return { yaw: g.hero.group.rotation.y, polvo: g.particles.pool ? g.particles.pool.filter((x) => x.life > 0).length : null }; });
  ok(run.yaw > 0.85 && run.yaw < 1.25, `corriendo se ve de tres cuartos (gira ${run.yaw.toFixed(2)} rad, antes 1,57 = de perfil)`);
  await foto(p, "corre");
  // salta: se estira; al caer, se aplasta
  await p.evaluate(() => { const g = window.__g3d.aventura; g.keys.jump = true; g.player.buffer = 0.13; });
  await p.waitForFunction(() => window.__g3d.aventura.player.stretch > 0.3, null, { timeout: 5000 }).then(() => ok(true, "al saltar se estira")).catch(() => ok(false, "al saltar se estira"));
  const alto = await p.evaluate(() => { const g = window.__g3d.aventura; return g.hero.group.scale.y / g.hero.group.scale.x; });
  ok(alto > 1.03, `estirada: alto/ancho ${alto.toFixed(2)}`);
  await p.evaluate(() => { window.__g3d.aventura.keys.jump = false; });
  await foto(p, "salto");
  ok(await p.waitForFunction(() => window.__g3d.aventura.player.squash > 0.2, null, { timeout: 8000 }).then(() => true).catch(() => false), "al caer se aplasta un poquito (y levanta polvito)");
  // vuelta: gira suave al otro lado
  await p.evaluate(() => { const g = window.__g3d.aventura; g.keys.right = false; g.keys.left = true; });
  await p.waitForTimeout(60);
  const giro = await p.evaluate(() => window.__g3d.aventura.hero.group.rotation.y);
  await p.waitForFunction(() => window.__g3d.aventura.hero.group.rotation.y < -0.8, null, { timeout: 8000 }).catch(() => {});
  const giro2 = await p.evaluate(() => window.__g3d.aventura.hero.group.rotation.y);
  ok(giro > -0.8 && giro2 < -0.8, `al darse vuelta gira suave (${giro.toFixed(2)} → ${giro2.toFixed(2)})`);
  await p.evaluate(() => { window.__g3d.aventura.keys.left = false; });
  await p.waitForFunction(() => Math.abs(window.__g3d.aventura.hero.group.rotation.y) < 0.6, null, { timeout: 10000 }).catch(() => {});
  const quieto = await p.evaluate(() => window.__g3d.aventura.hero.group.rotation.y);
  ok(Math.abs(quieto) < 0.6, `quieta mira más hacia la cámara (${quieto.toFixed(2)})`);
  await foto(p, "quieta");
  const errores = reg.errores.filter((x) => !/Blocked script execution in 'about:blank'/.test(x));
  ok(errores.length === 0, `sin errores (${errores.join(" | ")})`);
  await b.close();
  console.log(fallos ? `\n${fallos} fallos` : "\nTodo bien");
  process.exit(fallos ? 1 : 0);
})();
