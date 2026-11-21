// Graba escenas del juego para el video promocional: cada escena abre un juego de verdad, lo juega sola (bots en los
// partidos, piloto automático en el auto, un recorrido por el Pueblo) y guarda un cuadro cada 1/30 s en
// <salida>/cuadros/<escena>/c00000.jpg. El tiempo del juego avanza a mano (ver reloj.cjs), así que el video sale fluido
// aunque el navegador de prueba (sin tarjeta gráfica) tarde ~1,5 s en dibujar cada cuadro.
// Uso: NODE_PATH=$(npm root -g) node scripts/video/grabar.cjs <url-base> <salida> [escena,escena...] [--muestra]
//   --muestra: solo 3 cuadros por escena (principio, medio y final), para revisar rápido el encuadre.
const fs = require("fs");
const path = require("path");
const { chromium } = (() => { try { return require("playwright"); } catch { return require("playwright-core"); } })();
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
    // VIDEO_GPU=1: usa la tarjeta gráfica del computador (en Windows, con Edge o Chrome); si no, dibuja por software
    args: process.env.VIDEO_GPU
      ? ["--use-gl=angle", "--use-angle=d3d11", "--ignore-gpu-blocklist", "--enable-gpu", "--autoplay-policy=no-user-gesture-required"]
      : ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--autoplay-policy=no-user-gesture-required"],
  });
  // 960×540 con densidad 2 = cuadros de 1920×1080 (el juego se ve como en un celular acostado, con sus botones táctiles)
  const ctx = await b.newContext({ viewport: { width: 960, height: 540 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  await ctx.addInitScript(RELOJ);
  // sin la ventana del regalo de fundador (js/founder.js), que tapa los botones del menú
  await ctx.addInitScript(() => { try { localStorage.setItem("matichoc_sin_regalo_fundador", "1"); } catch (e) { /* nada */ } });
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
    pr.founderGift = { date: "video" }; // sin la ventana del regalo de fundador
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
    if (!id || (await p.evaluate((g) => window.__g3d[g].state !== "intro", id))) break;
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

/** Opciones que cambia clips.cjs: `estirar` alarga cada toma (×N) y `metaPorristas` es cuántas figuras hace la rutina. */
const OPC = { estirar: 1, metaPorristas: 1 };

/** Graba `seg` segundos: antes de cada cuadro llama a cadaCuadro(i) (para mover al personaje, tocar, etc.). */
async function grabar(p, escena, seg, cadaCuadro, desde = 0) {
  const dir = path.join(OUT, "cuadros", escena);
  if (!desde) { fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true }); }
  const n = Math.round(seg * OPC.estirar * FPS);
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
  /** Torre de alfajores (verano): suelta cada alfajor cuando pasa por el centro; cada cinco, uno un poco corrido. */
  async torre(p) {
    await perfil(p);
    await abrirJuego(p, "Torre de Alfajores", "#torre-btn-start", "torre");
    await p.evaluate(() => { window.__drops = 0; window.__reloj.encender(); });
    const jugar = () => p.evaluate(() => {
      const g = window.__g3d.torre;
      const c = g.cur;
      if (!c || c.dropping || g.state !== "playing") return;
      const want = g.topX + (window.__drops % 5 === 4 ? 0.5 : 0);
      if (Math.abs(c.x - want) < 0.12) { g._drop(); window.__drops++; }
    });
    await calentar(p, 0.4, jugar);
    await grabar(p, "torre", 16, jugar);
  },

  /** Avioneta Choco (verano): piloto automático que busca el próximo aro (y los alfajores) y esquiva lo demás. */
  async avioneta(p) {
    await perfil(p);
    await abrirJuego(p, "Avioneta Choco", "#avioneta-btn-start", "avioneta");
    await p.evaluate(() => window.__reloj.encender());
    const piloto = () => p.evaluate(() => {
      const g = window.__g3d.avioneta;
      if (g.state !== "playing") return;
      const next = g.things.filter((t) => !t.done && t.x > g.x - 0.5 && (t.kind === "ring" || t.kind === "coin")).sort((a, b) => a.x - b.x)[0];
      let target = next && next.x - g.x < 14 ? next.y : 5;
      for (const t of g.things) { // si viene un globo o una gaviota a la altura del objetivo, pasa por arriba o por abajo
        if (t.done || (t.kind !== "balloon" && t.kind !== "gull") || t.x < g.x || t.x - g.x > 9) continue;
        if (Math.abs(t.y - target) < 2.2) target = t.y > 5 ? t.y - 2.6 : t.y + 2.6;
      }
      g.hold = g.y + g.vy * 0.3 < Math.max(2.4, target);
    });
    await calentar(p, 0.4, piloto);
    await grabar(p, "avioneta", 16, piloto);
  },

  /** Lanchas en el lago (verano): piloto automático que busca rampas y alfajores y esquiva boyas y rocas. */
  async lanchas(p) {
    await perfil(p);
    await abrirJuego(p, "Lanchas en el Lago", "#lanchas-btn-start", "lanchas");
    await p.evaluate(() => window.__reloj.encender());
    const piloto = () => p.evaluate(() => {
      const g = window.__g3d.lanchas;
      if (g.state !== "playing") return;
      const near = g.things.filter((t) => !t.done && t.z < g.bz && g.bz - t.z < 22);
      // candidato: el x con menos peligro y más premios en los próximos metros
      let best = g.bx, bestV = -1e9;
      for (let x = -5; x <= 5; x += 0.5) {
        let v = -Math.abs(x - g.bx) * 0.15;
        for (const t of near) {
          const d = Math.abs(t.x - x), w = 1 - (g.bz - t.z) / 26;
          if (t.kind === "buoy" || t.kind === "rock") v -= d < 1.6 ? 10 * w : 0;
          else if (t.kind === "ramp") v += d < 1.2 ? 3 * w : 0;
          else if (t.kind === "coin") v += d < 0.9 ? 1 * w : 0;
        }
        if (v > bestV) { bestV = v; best = x; }
      }
      g.pointerX = best;
    });
    await calentar(p, 0.4, piloto);
    await grabar(p, "lanchas", 16, piloto);
  },

  /** Minigolf en la playa (verano): un jugador automático que prueba tiros "en la cabeza" y elige el que deja la
   * pelota más cerca del hoyo; se ve la flecha de apuntar un momento antes de cada golpe. */
  async minigolf(p) {
    await perfil(p);
    await abrirJuego(p, "Minigolf en la Playa", "#minigolf-btn-start", "minigolf");
    await p.evaluate(() => {
      window.__reloj.encender();
      // simulación simple de un tiro (misma física del juego, sin los cangrejos moviéndose)
      window.__golfSim = (g, dx, dz, v) => {
        const h = g.hole, R = 0.14;
        let x = g.bx, z = g.bz, vx = dx * v, vz = dz * v;
        const cl = (a, lo, hi) => Math.max(lo, Math.min(hi, a));
        for (let i = 0; i < 1200; i++) {
          const sdt = 1 / 240, sp = Math.hypot(vx, vz);
          if (sp < 0.06) break;
          let fr = 2.4 + sp * 0.35;
          for (const [sx, sz, w, d] of h.sand || []) if (Math.abs(x - sx) < w / 2 && Math.abs(z - sz) < d / 2) fr = 9 + sp * 1.5;
          const ns = Math.max(0, sp - fr * sdt); vx *= ns / sp; vz *= ns / sp;
          x += vx * sdt; z += vz * sdt;
          const X = h.w / 2 - R, Z = h.d / 2 - R;
          if (x < -X) { x = -X; vx = Math.abs(vx) * 0.78; } if (x > X) { x = X; vx = -Math.abs(vx) * 0.78; }
          if (z < -Z) { z = -Z; vz = Math.abs(vz) * 0.78; } if (z > Z) { z = Z; vz = -Math.abs(vz) * 0.78; }
          for (const [rx, rz, w, d] of h.walls || []) {
            const px = cl(x, rx - w / 2, rx + w / 2), pz = cl(z, rz - d / 2, rz + d / 2), ex = x - px, ez = z - pz, dd = Math.hypot(ex, ez);
            if (dd < R && dd > 0) { const nx = ex / dd, nz = ez / dd; x = px + nx * R; z = pz + nz * R; const vn = vx * nx + vz * nz; if (vn < 0) { vx -= 1.78 * vn * nx; vz -= 1.78 * vn * nz; } }
          }
          for (const [cx, cz, r] of [...(h.round || []), ...g.crabs.map((c) => [c.x, c.z, c.r])]) {
            const ex = x - cx, ez = z - cz, dd = Math.hypot(ex, ez), m = r + R;
            if (dd < m && dd > 0) { const nx = ex / dd, nz = ez / dd; x = cx + nx * m; z = cz + nz * m; const vn = vx * nx + vz * nz; if (vn < 0) { vx -= 1.75 * vn * nx; vz -= 1.75 * vn * nz; } }
          }
          const dc = Math.hypot(x - h.cup[0], z - h.cup[1]);
          if (dc < 0.24 && Math.hypot(vx, vz) < 4.2) return 0;
        }
        return Math.hypot(x - h.cup[0], z - h.cup[1]);
      };
      window.__golfPlan = (g) => {
        let best = null;
        for (let a = 0; a < 72; a++) for (let k = 1; k <= 12; k++) {
          const ang = (a / 72) * Math.PI * 2, dx = Math.sin(ang), dz = Math.cos(ang), pw = k / 12;
          const d = window.__golfSim(g, dx, dz, 1.2 + pw * (9.5 - 1.2));
          if (!best || d < best.d - 1e-6) best = { d, dx, dz, pw };
        }
        return best;
      };
    });
    let espera = 0, plan = null;
    const jugador = async () => {
      if (espera > 0) { espera--; return; }
      const st = await p.evaluate(() => { const g = window.__g3d.minigolf; return { ok: g.state === "playing" && g.ballStill && !g.inCup }; });
      if (!st.ok) { plan = null; return; }
      if (!plan) {
        plan = await p.evaluate(() => { const g = window.__g3d.minigolf; const b = window.__golfPlan(g); g.onAimShow = b; return b; });
        await p.evaluate((b) => { const g = window.__g3d.minigolf; const THREE = g.ball.position.constructor; const dir = new THREE(b.dx, 0, b.dz); window.__setArrow(g, dir, b.pw); }, plan);
        espera = 18; // se ve la flecha ~0,6 s
        return;
      }
      await p.evaluate((b) => { const g = window.__g3d.minigolf; const THREE = g.ball.position.constructor; g._shoot(new THREE(b.dx, 0, b.dz), b.pw); }, plan);
      plan = null;
      espera = 6;
    };
    await p.evaluate(async () => {
      const m = await import("/js/verano-kit.js");
      window.__setArrow = (g, dir, pw) => m.setAimArrow(g.arrow, g.ball.position, dir, pw);
    });
    await calentar(p, 0.6, jugador);
    await grabar(p, "minigolf", 22, jugador);
  },

  /** Billar de bombones (verano): un jugador automático que prueba tiros "en la cabeza" y elige el que mete más
   * bombones sin que caiga el blanco; se ve la flecha un momento antes de cada golpe. */
  async billar(p) {
    await perfil(p);
    await abrirJuego(p, "Billar de Bombones", "#billar-btn-start", "billar");
    await p.evaluate(async () => {
      window.__reloj.encender();
      const m = await import("/js/verano-kit.js");
      window.__setArrow = (g, dir, pw) => m.setAimArrow(g.arrow, g.cue.mesh.position, dir, pw, 1.6);
      const W = 2.4, L = 4.4, BR = 0.12, PR = 0.19, P = [[-W / 2, -L / 2], [W / 2, -L / 2], [-W / 2, 0], [W / 2, 0], [-W / 2, L / 2], [W / 2, L / 2]];
      window.__billSim = (g, dx, dz, v) => {
        const bs = g.balls.filter((b) => !b.in).map((b) => ({ x: b.x, z: b.z, vx: b.cue ? dx * v : 0, vz: b.cue ? dz * v : 0, cue: b.cue, in: false }));
        let got = 0, scratch = false;
        for (let step = 0; step < 900; step++) {
          const sdt = 1 / 360;
          let moving = false;
          for (const b of bs) {
            if (b.in) continue;
            const sp = Math.hypot(b.vx, b.vz);
            if (sp > 0) { const ns = Math.max(0, sp - (0.7 + sp * 0.22) * sdt); b.vx *= ns / sp; b.vz *= ns / sp; }
            if (sp > 0.03) moving = true;
            b.x += b.vx * sdt; b.z += b.vz * sdt;
            for (const [px, pz] of P) if (Math.hypot(b.x - px, b.z - pz) < PR) { b.in = true; if (b.cue) scratch = true; else got++; break; }
            const X = W / 2 - BR, Z = L / 2 - BR;
            if (b.x < -X) { b.x = -X; b.vx = Math.abs(b.vx) * 0.8; } if (b.x > X) { b.x = X; b.vx = -Math.abs(b.vx) * 0.8; }
            if (b.z < -Z) { b.z = -Z; b.vz = Math.abs(b.vz) * 0.8; } if (b.z > Z) { b.z = Z; b.vz = -Math.abs(b.vz) * 0.8; }
          }
          for (let i = 0; i < bs.length; i++) for (let j = i + 1; j < bs.length; j++) {
            const a = bs[i], c = bs[j];
            if (a.in || c.in) continue;
            const ex = c.x - a.x, ez = c.z - a.z, d = Math.hypot(ex, ez);
            if (d >= 2 * BR || d === 0) continue;
            const nx = ex / d, nz = ez / d, o = 2 * BR - d;
            a.x -= nx * o / 2; a.z -= nz * o / 2; c.x += nx * o / 2; c.z += nz * o / 2;
            const rv = (c.vx - a.vx) * nx + (c.vz - a.vz) * nz;
            if (rv < 0) { const imp = -rv * 0.97; a.vx -= imp * nx; a.vz -= imp * nz; c.vx += imp * nx; c.vz += imp * nz; }
          }
          if (!moving) break;
        }
        return got - (scratch ? 2 : 0);
      };
      window.__billPlan = (g) => {
        let best = null;
        for (let a = 0; a < 90; a++) for (const pw of [0.35, 0.55, 0.75, 0.95]) {
          const ang = (a / 90) * Math.PI * 2, dx = Math.sin(ang), dz = Math.cos(ang);
          const v = window.__billSim(g, dx, dz, 0.6 + pw * (6.5 - 0.6));
          if (!best || v > best.v) best = { v, dx, dz, pw };
        }
        return best;
      };
    });
    let espera = 0, plan = null;
    const jugador = async () => {
      if (espera > 0) { espera--; return; }
      const ok = await p.evaluate(() => { const g = window.__g3d.billar; return g.state === "playing" && g.still; });
      if (!ok) { plan = null; return; }
      if (!plan) {
        plan = await p.evaluate(() => window.__billPlan(window.__g3d.billar));
        await p.evaluate((b) => { const g = window.__g3d.billar; const V = g.cue.mesh.position.constructor; window.__setArrow(g, new V(b.dx, 0, b.dz), b.pw); }, plan);
        espera = 18;
        return;
      }
      await p.evaluate((b) => { const g = window.__g3d.billar; const V = g.cue.mesh.position.constructor; g._shoot(new V(b.dx, 0, b.dz), b.pw); }, plan);
      plan = null;
      espera = 8;
    };
    await calentar(p, 0.6, jugador);
    await grabar(p, "billar", 20, jugador);
  },

  /** Paseo por el Pueblo renovado, en monopatín, con la cámara girando despacio. */
  async pueblo(p) {
    await perfil(p, { lagoPendiente: false });
    await abrirJuego(p, "Pueblo", "#town-btn-start", "town");
    await sinConsejos(p);
    await p.evaluate(() => {
      const g = window.__g3d.town;
      g.moveIdx = 99; // la forma de moverse más rápida que tenga desbloqueada
      g._updateMoveBtn?.();
      // una vuelta en monopatín alrededor de la fuente de chocolate (centro 0,0), con la cámara detrás; por dentro del
      // escenario del festival (que ahora es sólido y empieza a 9,3 m de la fuente) y sin meter la cámara en los letreros
      const R = 8;
      g.pos.set(0, 0, R);
      g.camPitch = 0.62;
      g._input = () => {
        const a = Math.atan2(g.pos.x, g.pos.z) + 0.45;
        const tx = Math.sin(a) * R, tz = Math.cos(a) * R;
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
    await abrirJuego(p, "Parkour", "#parkour-btn-infinite", "parkour");
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
    await abrirJuego(p, "Merge", "#merge-btn-start", "merge");
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

  /** Saltos de Porristas: la rutina de equipo (lanzamiento, figura, la reciben) y la pirámide, tocando siempre a tiempo. */
  async porristas(p) {
    await perfil(p);
    await abrirJuego(p, "Saltos de Porristas", "#porristas-btn-start", "porristas");
    await sinConsejos(p);
    await p.evaluate((meta) => {
      const g = window.__g3d.porristas;
      g.goal = meta; // una figura y la pirámide (en el video no hay tiempo para más)
      const orig = g.update.bind(g);
      g.update = (dt) => {
        orig(dt);
        if (g.state !== "playing") return;
        const h = g.parts.flatMap((q) => q.hits).find((x) => !x.res);
        if (h && Math.abs(h.t - g.rt) < 0.03) g.tap();
      };
      window.__reloj.encender();
    }, OPC.metaPorristas);
    await calentar(p, 3.0);
    await grabar(p, "porristas", 11);
  },

  /** Crea tu Chocolate: la cocina a mano (juntar, llevar a la olla, derretir, revolver y verter en el molde). */
  async cocina(p) {
    await perfil(p);
    await abrirJuego(p, "Crea tu Chocolate", "#creador-btn-start", null);
    await p.waitForFunction(() => window.__g3d?.creador?.ready, null, { timeout: 40000 });
    await p.evaluate(() => {
      const g = window.__g3d.creador;
      g._create();
      const k = g.kitchen;
      k.need[0].n = 2; // en el video, una receta cortita
      k.need[1].n = 1;
      let f = 0, ang = 0, drag = null;
      // el "chef" del video: hace cada paso como lo haría una persona (cada cuadro un poquito)
      window.__chef = () => {
        f++;
        const ph = k.phase;
        if (ph === "juntar" && f % 5 === 0) {
          const miss = k.need.filter((n) => n.got < n.n).map((n) => n.icon);
          const sl = k.slots.find((s) => s.item && !s.fly && s.s.visible && s.t > 0.25 && s.item.need && miss.includes(s.item.icon));
          if (sl) k._pick(sl);
        } else if (ph === "llevar") {
          if (!drag) { const c = k.carry.find((x) => !x.done); if (c) drag = { c, t: 0, from: c.s.position.clone() }; }
          if (drag) {
            drag.t += 1 / 9;
            const to = k.pot.position.clone(); to.y = 1.1;
            drag.c.s.position.lerpVectors(drag.from, to, Math.min(1, drag.t));
            drag.c.s.position.y += Math.sin(Math.min(1, drag.t) * Math.PI) * 0.8;
            if (drag.t >= 1) { k._drop(drag.c); drag = null; }
          }
        } else if (ph === "derretir") k.holding = k.temp < 0.62;
        else if (ph === "revolver") { ang += 0.32; k._stirBy(0.32, -ang); }
        else if (ph === "moldear") { if (!k.cooling) { if (k.pour < 0.9) k.holding = true; else k.hold(false); } }
      };
      window.__reloj.encender();
    });
    const chef = () => p.evaluate(() => window.__chef());
    const fase = () => p.evaluate(() => window.__g3d.creador.kitchen.active ? window.__g3d.creador.kitchen.phase : "listo");
    const hasta = async (ph, max = 600) => { for (let i = 0; i < max && (await fase()) !== ph; i++) { await chef(); await p.evaluate((dt) => window.__reloj.avanzar(dt), DT); } };
    let n = await grabar(p, "cocina", 2.2, chef); // juntar en la despensa
    await hasta("llevar");
    n = await grabar(p, "cocina", 1.6, chef, n); // a la olla
    await hasta("derretir");
    await calentar(p, 0.8, chef);
    n = await grabar(p, "cocina", 1.4, chef, n); // derretir
    await hasta("revolver");
    n = await grabar(p, "cocina", 1.4, chef, n); // revolver
    await hasta("moldear");
    n = await grabar(p, "cocina", 2.2, chef, n); // al molde
  },

  /** Aventura Choco en 3D: corre a la derecha y salta. */
  async aventura(p) {
    await perfil(p);
    await abrirJuego(p, "Aventura Choco", "#aventura-btn-start", "aventura");
    await sinConsejos(p);
    await p.evaluate(() => { const g = window.__g3d.aventura; g.keys.right = true; window.__reloj.encender(); });
    // en el video no se pierde: el piloto solo corre y salta, así que se le reponen los corazones (si no, a los ~10 s sale "te quedaste sin corazones")
    const salto = (i) => p.evaluate((i) => { const g = window.__g3d.aventura; g.hearts = Math.max(g.hearts, 2); if (i % 34 === 0) { g.keys.jump = true; g.player.buffer = 0.13; } if (i % 34 === 14) g.keys.jump = false; }, i);
    await calentar(p, 0.8, salto);
    await grabar(p, "aventura", 4.5, salto);
  },

  /** Pueblo: la Matichica trepa a la casa del árbol y entra a ver a la ardilla Nuez. */
  async casita(p) {
    await perfil(p);
    await abrirJuego(p, "Pueblo", "#town-btn-start", "town");
    await sinConsejos(p);
    await p.evaluate(() => {
      const g = window.__g3d.town;
      const T = g.zones.treehouse;
      g.pos.set(T.foot.x + Math.sin(T.yaw + Math.PI) * 1.2, 0, T.foot.z + Math.cos(T.yaw + Math.PI) * 1.2);
      g.heroYaw = T.yaw;
      g.camYaw = T.yaw + Math.PI + 0.55; // desde atrás y en diagonal: se ve la escalera y la casita
      g.camPitch = 0.32;
      g._placeCamera(true);
      window.__reloj.encender();
    });
    await calentar(p, 0.5);
    await p.evaluate(() => window.__g3d.town._climb(true));
    let n = await grabar(p, "casita", 3.3);
    await p.evaluate(() => window.__g3d.town._enterTree());
    await calentar(p, 0.4);
    await p.evaluate(() => { const g = window.__g3d.town; g._input = () => ({ x: 0.5, z: -0.8, mag: 0.6 }); });
    await grabar(p, "casita", 1.8, null, n);
  },

  /** Ciudad: adentro de la Fábrica Matichoc. */
  async fabrica(p) {
    await perfil(p);
    await abrirJuego(p, "Ciudad", "#ciudad-btn-start", "ciudad");
    await sinConsejos(p);
    await p.evaluate(() => {
      const g = window.__g3d.ciudad;
      const d = g.homeDoors.find((x) => x.id === "fabrica");
      g.visits.enter("fabrica", { x: d.x, z: d.z, yaw: d.yaw });
      let t = 0;
      g._input = () => { t += 1 / 30; return { ix: Math.sin(t * 0.9) * 0.6, iy: 0.55, mag: 0.7 }; };
      window.__reloj.encender();
    });
    await calentar(p, 0.6);
    await grabar(p, "fabrica", 3);
  },

  /** Autos de Chocolate: acelerando por la carretera. */
  async autos(p) {
    await perfil(p);
    await abrirJuego(p, "Autos de Chocolate", "#autos-btn-start", "autos");
    await sinConsejos(p);
    await p.evaluate(() => window.__reloj.encender());
    await p.keyboard.down("ArrowUp");
    await calentar(p, 1.2);
    await grabar(p, "autos", 5);
    await p.keyboard.up("ArrowUp");
  },

  /** Cortes rápidos de otros juegos (1,3 s cada uno). */
  async extras(p) {
    await perfil(p);
    const lista = [
      ["Salto Choco", "#salto-btn-start", ["ArrowRight", "Space"], "salto"],
      ["Bloques de Productos", "#tetris-btn-start", [], "tetris"],
      ["Crea tu Chocolate", "#creador-btn-start", [], null],
      ["Autos de Chocolate", "#autos-btn-start", ["ArrowUp"], "autos"],
    ];
    let n = 0;
    for (const [nombre, inicio, teclas, id] of lista) {
      await p.evaluate(() => window.__reloj.apagar());
      await p.goto(BASE + "?debug3d", { waitUntil: "networkidle" });
      await p.waitForTimeout(800);
      const prof = await p.$("#profile-grid .profile-card:not(.add-profile)");
      if (prof) { await prof.click(); await p.waitForTimeout(500); }
      const pj = await p.$("#character-grid .character-card:nth-child(2)");
      if (pj && (await pj.isVisible())) { await pj.click(); await p.waitForTimeout(800); }
      await abrirJuego(p, nombre, inicio, id);
      await sinConsejos(p);
      await p.evaluate(() => window.__reloj.encender());
      for (const t of teclas) await p.keyboard.down(t);
      await calentar(p, 1.2);
      n = await grabar(p, "extras", 1.3, null, n);
      for (const t of teclas) await p.keyboard.up(t);
    }
  },
};

module.exports = { abrir, ESCENAS, OPC, FPS, OUT, SOLO };

if (require.main === module) (async () => {
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
