// Fotos de las tarjetas del menú (assets/games/<juego>.jpg, 740×418) para los juegos de verano: el juego de verdad,
// en un buen momento, sin carteles, sin botones y con el Matichico a la vista (como las fotos de los demás juegos).
// Uso: NODE_PATH=... CHROMIUM_PATH=<msedge.exe> node scripts/video/tarjetas.cjs <url-base> [juego,juego...]
const path = require("path");
const fs = require("fs");
const { execFileSync } = require("child_process");
const { chromium } = (() => { try { return require("playwright"); } catch { return require("playwright-core"); } })();

const BASE = process.argv[2] || "http://127.0.0.1:8092/";
const SOLO = (process.argv[3] || "torre,avioneta,lanchas,minigolf,billar").split(",");
const OUT = path.join(__dirname, "..", "..", "assets", "games");
const NOMBRES = { torre: "Torre de Alfajores", avioneta: "Avioneta Choco", lanchas: "Lanchas en el Lago", minigolf: "Minigolf en la Playa", billar: "Billar de Bombones" };

// Cómo dejar cada juego antes de la foto (corre dentro de la página, con window.__g3d[id])
const PREPARAR = {
  async torre(g) {
    for (let i = 0; i < 6; i++) {
      for (let t = 0; t < 200 && !(g.cur && !g.cur.dropping); t++) await new Promise((r) => setTimeout(r, 20));
      g.cur.x = g.topX + (i === 3 ? 0.25 : 0);
      g._drop();
      for (let t = 0; t < 200 && g.cur && g.cur.dropping; t++) await new Promise((r) => setTimeout(r, 20));
    }
    for (let t = 0; t < 200 && !(g.cur && !g.cur.dropping); t++) await new Promise((r) => setTimeout(r, 20));
    g.cur.x = 1.4; g.cheer = 3; // el que viene, entrando por el lado, y el Matichico celebrando
  },
  async avioneta(g) {
    const t0 = performance.now();
    while (performance.now() - t0 < 12000) {
      g.hold = g.y < 5.2;
      const ring = g.things.find((t) => t.kind === "ring" && !t.done && t.x - g.x > 4 && t.x - g.x < 9);
      if (ring && Math.abs(ring.y - g.y) < 1.5 && Math.abs(g.vy) < 1.2 && g.invuln <= 0) break;
      await new Promise((r) => setTimeout(r, 16));
    }
  },
  async lanchas(g) {
    const t0 = performance.now();
    while (performance.now() - t0 < 12000) {
      const near = g.things.filter((t) => !t.done && t.z < g.bz && g.bz - t.z < 22);
      let best = g.bx, bv = -1e9;
      for (let x = -5; x <= 5; x += 0.5) {
        let v = -Math.abs(x - g.bx) * 0.15;
        for (const t of near) { const d = Math.abs(t.x - x); if (t.kind === "buoy" || t.kind === "rock") v -= d < 1.6 ? 10 : 0; else if (t.kind === "coin") v += d < 0.9 ? 1 : 0; }
        if (v > bv) { bv = v; best = x; }
      }
      g.pointerX = best;
      if (g.dist > 120 && near.some((t) => t.kind === "buoy") && near.some((t) => t.kind === "coin")) break;
      await new Promise((r) => setTimeout(r, 16));
    }
  },
  async minigolf(g) {
    g.holeN = 2; g._startHole(); // el hoyo del castillo de arena
    await new Promise((r) => setTimeout(r, 1200));
    const V = g.ball.position.constructor;
    const h = g.hole, d = new V(h.cup[0] - g.bx + 1.2, 0, h.cup[1] - g.bz).normalize();
    const m = await import("/js/verano-kit.js");
    m.setAimArrow(g.arrow, g.ball.position, d, 0.65);
  },
  async billar(g) {
    await new Promise((r) => setTimeout(r, 600));
    const V = g.cue.mesh.position.constructor;
    const m = await import("/js/verano-kit.js");
    m.setAimArrow(g.arrow, g.cue.mesh.position, new V(0, 0, -1), 0.7, 1.6);
  },
};

(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium",
    args: ["--use-gl=angle", "--use-angle=d3d11", "--ignore-gpu-blocklist", "--enable-gpu"] });
  const p = await (await b.newContext({ viewport: { width: 1100, height: 620 }, deviceScaleFactor: 1.5, hasTouch: true, isMobile: true })).newPage();
  await p.context().addInitScript(() => { try { localStorage.setItem("matichoc_sin_regalo_fundador", "1"); } catch (e) { /* nada */ } });
  await p.goto(BASE + "?debug3d", { waitUntil: "networkidle" });
  await p.evaluate(() => localStorage.clear());
  await p.reload({ waitUntil: "networkidle" });
  await p.click("#profile-grid .add-profile");
  await p.fill("#new-profile-name", "Mati");
  await p.click("#btn-create-profile");
  await p.waitForTimeout(300);
  await p.evaluate(() => { window.__progress().founderGift = { date: "fotos" }; });
  await p.click("#character-grid .character-card:nth-child(2)");
  await p.waitForTimeout(800);
  await p.evaluate((ids) => { const pr = window.__progress(); pr.unlockedGames = ids; pr.energy = 999; }, SOLO);
  for (const id of SOLO) {
    await p.evaluate(() => document.querySelectorAll(".modal:not(.hidden)").forEach((m) => m.classList.add("hidden")));
    await p.evaluate((n) => { const c = [...document.querySelectorAll(".game-card, #game-feature")].find((x) => x.textContent.includes(n)); (c.querySelector("button") || c).click(); }, NOMBRES[id]);
    await p.waitForFunction((g) => window.__g3d?.[g]?.running, id, { timeout: 40000 });
    await p.click(`#${id}-btn-start`).catch(() => {});
    await p.waitForTimeout(600);
    await p.evaluate(`(${PREPARAR[id].toString().replace(/^async \w+\(/, "async function(")})(window.__g3d["${id}"])`);
    await p.addStyleTag({ content: `#${id}-banner,#${id}-popups,#${id}-touch,#${id}-hud,.hud,.fps-banner,.toast,#toast,.energy-pop,[class*="spend"],[class*="toast"]{display:none!important}` });
    await p.waitForTimeout(2600); // que se vayan los avisos que estaban en pantalla
    await p.waitForTimeout(250);
    const tmp = path.join(OUT, `_${id}.png`);
    await p.locator(`#${id}-canvas`).screenshot({ path: tmp });
    execFileSync("ffmpeg", ["-v", "error", "-y", "-i", tmp, "-vf", "scale=740:418:force_original_aspect_ratio=increase:flags=lanczos,crop=740:418", "-q:v", "3", path.join(OUT, `${id}.jpg`)]);
    fs.rmSync(tmp);
    console.log(`✓ ${id}.jpg`);
    await p.evaluate((g) => window.__g3d[g].pauseForMenu(), id);
    await p.evaluate(() => [...document.querySelectorAll("section.screen")].forEach((s) => s.classList.toggle("hidden", s.id !== "screen-hub")));
    await p.waitForTimeout(300);
  }
  await b.close();
})();
