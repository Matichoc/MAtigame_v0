// Graba escenas del juego para el video promocional: cada escena abre un juego de verdad, lo juega sola (bots en los
// partidos, piloto automático en el auto, un recorrido por el Pueblo) y guarda un cuadro cada 1/30 s en
// <salida>/cuadros/<escena>/c00000.jpg. El tiempo del juego avanza a mano (ver reloj.cjs), así que el video sale fluido
// aunque el navegador de prueba (sin tarjeta gráfica) tarde ~1,5 s en dibujar cada cuadro.
// Uso: NODE_PATH=$(npm root -g) node scripts/video/grabar.cjs <url-base> <salida> [escena,escena...] [--muestra]
//   --muestra: solo 3 cuadros por escena (principio, medio y final), para revisar rápido el encuadre.
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");
const { RELOJ } = require("./reloj.cjs");

const BASE = process.argv[2] || "http://127.0.0.1:8092/";
const OUT = path.resolve(process.argv[3] || "video");
const SOLO = (process.argv[4] && !process.argv[4].startsWith("--") ? process.argv[4] : "").split(",").filter(Boolean);
const MUESTRA = process.argv.includes("--muestra");
const FPS = 30;
const DT = 1000 / FPS;
const BOT = path.join(__dirname, "..", "qa", "jugador-humano.mjs");

async function abrir() {
  const b = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium",
    args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--autoplay-policy=no-user-gesture-required"],
  });
  // 960×540 con densidad 2 = cuadros de 1920×1080 (el juego se ve como en un celular acostado, con sus botones táctiles)
  const ctx = await b.newContext({ viewport: { width: 960, height: 540 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  await ctx.addInitScript(RELOJ);
  // el "jugador humano" de las pruebas maneja los partidos (se sirve desde el repo, sin copiarlo a la app)
  await ctx.route("**/__video/jugador-humano.js", (r) => r.fulfill({ contentType: "text/javascript", body: fs.readFileSync(BOT, "utf8").replace(/\.\.\/\.\.\/js\//g, "/js/") }));
  const p = await ctx.newPage();
  const errores = [];
  p.on("pageerror", (e) => errores.push(e.message));
  p.on("dialog", (d) => d.accept());
  return { b, p, errores };
}

/** Perfil "con juego avanzado": todo canjeado, nivel alto (patines y monopatín), energía y el Pueblo casi renovado. */
async function perfil(p, { lagoPendiente = true } = {}) {
  await p.goto(BASE + "?debug3d", { waitUntil: "networkidle" });
  await p.evaluate(() => localStorage.clear());
  await p.reload({ waitUntil: "networkidle" });
  await p.click("#profile-grid .add-profile");
  await p.fill("#new-profile-name", "Mati");
  await p.click("#btn-create-profile");
  await p.waitForTimeout(300);
  await p.click("#character-grid .character-card:nth-child(2)");
  await p.waitForTimeout(800);
  await p.evaluate(async (lago) => {
    const { GAMES_CATALOG } = await import("/js/games-catalog.js");
    const A = await import("/js/adventure.js");
    const pr = window.__progress();
    pr.unlockedGames = GAMES_CATALOG.map((g) => g.id);
    pr.energy = 999;
    pr.coins = 2480;
    pr.xp = Math.max(pr.xp || 0, 60000);
    const adv = A.adventureOf(pr);
    adv.started = true;
    adv.introSeen = true;
    for (const t of A.ALL_TASKS) if (!(lago && t.zone.id === "lago")) adv.done[t.id] = 1;
    adv.stars = 9;
  }, lagoPendiente);
}

async function abrirJuego(p, nombre, inicio, id) {
  await p.locator(".game-card, #game-feature", { hasText: nombre }).first().click({ timeout: 10000 });
  await p.waitForTimeout(1500);
  if (id) await p.waitForFunction((g) => window.__g3d?.[g]?.running, id, { timeout: 40000 });
  for (let k = 0; k < 6; k++) {
    if (inicio) await p.click(inicio, { timeout: 4000 }).catch(() => {});
    await p.waitForTimeout(800);
    if (!id || (await p.evaluate((g) => window.__g3d[g].state, id)) === "playing") break;
  }
}

/** Esconde los consejos de texto del juego (en el video los textos los pone el montaje). */
const sinConsejos = (p) => p.addStyleTag({ content: '[id$="-hint"],.tq-hint,.game-hint{display:none!important}' });

/** Avanza el juego sin guardar cuadros (para que arranque la jugada). */
async function calentar(p, seg, cadaCuadro) {
  for (let i = 0; i < Math.round(seg * FPS); i++) {
    if (cadaCuadro) await cadaCuadro(i);
    await p.evaluate((dt) => window.__reloj.avanzar(dt), DT);
  }
}

/** Graba `seg` segundos: antes de cada cuadro llama a cadaCuadro(i) (para mover al personaje, tocar, etc.). */
async function grabar(p, escena, seg, cadaCuadro, desde = 0) {
  const dir = path.join(OUT, "cuadros", escena);
  if (!desde) { fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true }); }
  const n = Math.round(seg * FPS);
  const elegidos = MUESTRA ? new Set([0, Math.floor(n / 2), n - 1]) : null;
  for (let i = 0; i < n; i++) {
    if (cadaCuadro) await cadaCuadro(i);
    await p.evaluate((dt) => window.__reloj.avanzar(dt), DT);
    if (!elegidos || elegidos.has(i)) await p.screenshot({ path: path.join(dir, `c${String(desde + i).padStart(5, "0")}.jpg`), type: "jpeg", quality: 92 });
  }
  return desde + n;
}

// ---------------------------------------------------------------- escenas
const ESCENAS = {
  /** Paseo por el Pueblo renovado, en monopatín, con la cámara girando despacio. */
  async pueblo(p) {
    await perfil(p, { lagoPendiente: false });
    await abrirJuego(p, "Pueblo", "#town-btn-start", "town");
    await sinConsejos(p);
    await p.evaluate(() => {
      const g = window.__g3d.town;
      g.moveIdx = 99; // la forma de moverse más rápida que tenga desbloqueada
      g._updateMoveBtn?.();
      // una vuelta en monopatín alrededor de la fuente de chocolate (centro 0,0), con la cámara detrás
      g.pos.set(0, 0, 13);
      g.camPitch = 0.62;
      g._input = () => {
        const a = Math.atan2(g.pos.x, g.pos.z) + 0.45;
        const tx = Math.sin(a) * 13, tz = Math.cos(a) * 13;
        const dx = tx - g.pos.x, dz = tz - g.pos.z, d = Math.hypot(dx, dz) || 1;
        let dy = Math.atan2(-dx, -dz) + 0.5 - g.camYaw; // cámara detrás y un poco hacia afuera de la vuelta
        dy = Math.atan2(Math.sin(dy), Math.cos(dy));
        g.camYaw += dy * 0.06;
        return { x: dx / d, z: dz / d, mag: 1 };
      };
      g.camYaw = Math.PI / 2;
      g._placeCamera(true);
      window.__reloj.encender();
    });
    await calentar(p, 0.8);
    await grabar(p, "pueblo", 5.5);
  },

  /** "Renovar el Pueblo": la lista de tareas y una tarea hecha en el lago (aparece el muelle con su escena). */
  async renovar(p) {
    await perfil(p);
    await abrirJuego(p, "Pueblo", "#town-btn-start", "town");
    await sinConsejos(p);
    await p.evaluate(() => {
      const g = window.__g3d.town;
      g.pos.set(12, 0, -14);
      g.camYaw = -2.3;
      window.__reloj.encender();
    });
    await calentar(p, 0.6);
    await p.evaluate(() => window.dispatchEvent(new Event("adventure-tasks")));
    let n = await grabar(p, "renovar", 2.2);
    // tocar "Hacer" en la primera tarea del lago
    await p.evaluate(() => { const b = document.querySelector("#at-list .at-go:not(.short)"); if (b) b.click(); });
    await grabar(p, "renovar", 3.6, null, n);
  },

  /** Pichanga 3 contra 3: el "jugador humano" maneja a tu jugador. */
  async pichanga(p) {
    await perfil(p);
    await abrirJuego(p, "Fútbol", null);
    await p.evaluate(() => document.getElementById("futbol-btn-pichanga").click());
    await p.waitForFunction(() => window.__g3d?.pichanga?.ready && window.__g3d.pichanga.running, null, { timeout: 40000 });
    await p.waitForTimeout(500);
    await p.click("#pichanga-btn-start");
    await sinConsejos(p);
    await p.evaluate(async () => {
      const H = await import("/__video/jugador-humano.js");
      const g = window.__g3d.pichanga;
      const bot = H.humanoPichanga(11, 1.8);
      g._readInput = () => bot(g.m, 1 / 30);
      window.__reloj.encender();
    });
    await calentar(p, 2.5);
    await grabar(p, "pichanga", 5);
  },

  /** Básquet 2 contra 2, también con el "jugador humano". */
  async basquet(p) {
    await perfil(p);
    await abrirJuego(p, "Lanzamientos", null);
    await p.evaluate(() => document.getElementById("basquet-btn-2v2").click());
    await p.waitForFunction(() => window.__g3d?.basquet2v2?.ready && window.__g3d.basquet2v2.running, null, { timeout: 40000 });
    await p.waitForTimeout(500);
    await p.click("#bq2-btn-start");
    await sinConsejos(p);
    await p.evaluate(async () => {
      const H = await import("/__video/jugador-humano.js");
      const g = window.__g3d.basquet2v2;
      const bot = H.humanoBasquet(5, 1.8);
      g._readInput = () => bot(g.m, 1 / 30);
      window.__reloj.encender();
    });
    await calentar(p, 2);
    await grabar(p, "basquet", 5);
  },

  /** Ciudad Choco: en auto por la avenida, con piloto automático que sigue la calle y dobla en la esquina. */
  async ciudad(p) {
    await perfil(p);
    await abrirJuego(p, "Ciudad", "#ciudad-btn-start", "ciudad");
    await sinConsejos(p);
    await p.evaluate(() => {
      const g = window.__g3d.ciudad;
      g._enterCar();
      const c = g.car;
      Object.assign(c, { x: 42, z: 57.25, heading: -Math.PI / 2, speed: 14 });
      g.pos.set(c.x, g.pos.y, c.z);
      g.heroYaw = c.heading;
      g.els.banner?.classList.remove("show");
      g._placeCamera?.(true);
      const ruta = [[-46, 57.25], [-56, 52], [-57.25, 40], [-57.25, -50]]; // por el carril de la avenida y doblando en la esquina
      let k = 0;
      g._input = () => {
        const [tx, tz] = ruta[Math.min(k, ruta.length - 1)];
        const dx = tx - c.x, dz = tz - c.z;
        if (Math.hypot(dx, dz) < 5 && k < ruta.length - 1) k++;
        let a = Math.atan2(dx, dz) - c.heading;
        while (a > Math.PI) a -= 2 * Math.PI;
        while (a < -Math.PI) a += 2 * Math.PI;
        return { ix: Math.max(-1, Math.min(1, -a * 2.2)), iy: Math.abs(a) > 0.5 ? 0.35 : 0.75, mag: 1 };
      };
      window.__reloj.encender();
    });
    await calentar(p, 1.2);
    await grabar(p, "ciudad", 5);
  },

  /** Parkour (mundo infinito): corre hacia adelante y salta seguido. */
  async parkour(p) {
    await perfil(p);
    await abrirJuego(p, "Parkour", "#parkour-btn-infinite");
    await sinConsejos(p);
    await p.evaluate(() => {
      const g = window.__g3d.parkour;
      // piloto: va hacia la siguiente plataforma (el recorrido avanza hacia -z) y salta al llegar al borde de la actual
      let meta = null;
      const centro = (q) => ({ x: (q.box.minX + q.box.maxX) / 2, z: (q.box.minZ + q.box.maxZ) / 2, y: q.box.maxY });
      g._input = () => {
        const P = g.pos;
        const sobre = g.grounded && g.ground;
        if (!meta || !meta.active || (sobre && g.ground === meta) || centro(meta).z > P.z + 0.3) {
          let mejor = null, md = 1e9;
          for (const q of g.platforms) {
            if (!q.active || q === g.ground || q.state === "falling") continue;
            const c = centro(q);
            if (c.z > P.z - 0.6 || c.y > P.y + 2.2) continue;
            const d = Math.hypot(c.x - P.x, (c.z - P.z) * 0.8);
            if (d < md) { md = d; mejor = q; }
          }
          meta = mejor;
        }
        if (!meta) return { x: 0, z: -1, mag: 1 };
        const c = centro(meta);
        const dx = c.x - P.x, dz = c.z - P.z, d = Math.hypot(dx, dz) || 1;
        if (sobre && meta !== g.ground) {
          const b = g.ground.box;
          const borde = Math.min(P.x - b.minX, b.maxX - P.x, P.z - b.minZ, b.maxZ - P.z);
          if (borde < 0.55 || c.y > P.y + 0.6) g.buffer = 0.12;
        } else if (!g.grounded && g.vel.y < -1 && g.doubleAvail && d > 1.6) g.buffer = 0.12;
        return { x: dx / d, z: dz / d, mag: 1 };
      };
      window.__reloj.encender();
    });
    await calentar(p, 2.5);
    await grabar(p, "parkour", 5);
  },

  /** Mati Merge: junta productos iguales arrastrando con el dedo. */
  async merge(p) {
    await perfil(p);
    await abrirJuego(p, "Merge", "#merge-btn-start");
    await p.evaluate(() => window.__reloj.encender());
    await calentar(p, 1);
    const enPantalla = (cell) => p.evaluate((i) => {
      const g = window.__g3d.merge;
      const V = g.camera.position.constructor;
      const v = new V(((i % 6) - 2.5) * 1.1, 0.3, (Math.floor(i / 6) - 3.5) * 1.1).project(g.camera);
      const r = g.els.canvas.getBoundingClientRect();
      return { x: r.left + ((v.x + 1) / 2) * r.width, y: r.top + ((1 - v.y) / 2) * r.height };
    }, cell);
    const par = () => p.evaluate(() => {
      const m = window.__g3d.merge.progress.merge; const seen = {};
      for (let i = 0; i < m.grid.length; i++) { const c = m.grid[i]; if (!c || c % 10 >= 6) continue; if (seen[c] != null) return [seen[c], i]; seen[c] = i; }
      return null;
    });
    let n = 0;
    for (let k = 0; k < 4; k++) {
      const pr = await par();
      if (!pr) { await p.evaluate(() => document.querySelector('#merge-gens [data-gen="1"]')?.click()); n = await grabar(p, "merge", 0.4, null, n); continue; }
      const a = await enPantalla(pr[0]);
      const z = await enPantalla(pr[1]);
      await p.mouse.move(a.x, a.y);
      await p.mouse.down();
      const pasos = 14;
      n = await grabar(p, "merge", pasos / FPS, (i) => p.mouse.move(a.x + ((z.x - a.x) * (i + 1)) / pasos, a.y + ((z.y - a.y) * (i + 1)) / pasos), n);
      await p.mouse.up();
      n = await grabar(p, "merge", 0.75, null, n);
    }
  },

  /** Cortes rápidos de otros juegos (1,3 s cada uno). */
  async extras(p) {
    await perfil(p);
    const lista = [
      ["Salto Choco", "#salto-btn-start", ["ArrowRight", "Space"]],
      ["Saltos de Porristas", "#porristas-btn-start", ["ArrowRight"]],
      ["Crea tu Chocolate", "#creador-btn-start", []],
      ["Autos de Chocolate", "#autos-btn-start", ["ArrowUp"]],
    ];
    let n = 0;
    for (const [nombre, inicio, teclas] of lista) {
      await p.evaluate(() => window.__reloj.apagar());
      await p.goto(BASE + "?debug3d", { waitUntil: "networkidle" });
      await p.waitForTimeout(800);
      const prof = await p.$("#profile-grid .profile-card:not(.add-profile)");
      if (prof) { await prof.click(); await p.waitForTimeout(500); }
      if (await p.$("#character-grid .character-card")) { await p.click("#character-grid .character-card:nth-child(2)"); await p.waitForTimeout(800); }
      await abrirJuego(p, nombre, inicio);
      await sinConsejos(p);
      await p.evaluate(() => window.__reloj.encender());
      for (const t of teclas) await p.keyboard.down(t);
      await calentar(p, 1.2);
      n = await grabar(p, "extras", 1.3, null, n);
      for (const t of teclas) await p.keyboard.up(t);
    }
  },
};

(async () => {
  const lista = SOLO.length ? SOLO : Object.keys(ESCENAS);
  let mal = 0;
  for (const id of lista) {
    const t0 = Date.now();
    const { b, p, errores } = await abrir();
    try {
      await ESCENAS[id](p);
      console.log(`${id}: lista en ${Math.round((Date.now() - t0) / 1000)} s${errores.length ? ` (errores de página: ${errores.join(" | ")})` : ""}`);
    } catch (e) {
      mal++;
      console.error(`${id}: falló`, e.message);
    }
    await b.close();
  }
  process.exit(mal ? 1 : 0);
})();
