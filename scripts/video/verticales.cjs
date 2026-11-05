// Videos verticales (1080×1920) listos para publicar (Reels, TikTok, Shorts, estados), uno por cada clip de clips.cjs:
// fondo café con el patrón de cacao, logo y "Matijuego" arriba, el juego en una ventana al medio con borde amarillo,
// textos que van cambiando (para que la dueña después los diga con su voz), la invitación abajo y música propia suave.
// Usa los cuadros ya grabados (<salida>/cuadros, ver clips.cjs) y escribe <salida>/verticales/NN-nombre.mp4 y GUION.txt.
// Uso: NODE_PATH=... CHROMIUM_PATH=<msedge.exe o chromium> node scripts/video/verticales.cjs <salida> [clip,clip...] [--sin-musica]
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { chromium } = (() => { try { return require("playwright"); } catch { return require("playwright-core"); } })();
const { CLIPS } = require("./clips.cjs");

const OUT = path.resolve(process.argv[2] || "video");
const SOLO = (process.argv[3] && !process.argv[3].startsWith("--") ? process.argv[3] : "").split(",").filter(Boolean);
const MUSICA = !process.argv.includes("--sin-musica");
const DEST = path.join(OUT, "verticales");
const TMP = path.join(DEST, "tmp");
const RAIZ = path.join(__dirname, "..", "..");
const FPS = 30;
const FUNDIDO = 0.4;
const MAX = 21;
const W = 1080, H = 1920;
const WIN = { x: 30, y: 270, w: 1020, h: 1120 }; // ventana del juego (igual que en dinamico.cjs)
const CAP_Y = WIN.y + WIN.h; // los textos van montados sobre el borde de abajo de la ventana

// Textos de cada video: [segundo en que aparece, emoji, texto]. Los que tienen ★ son frases del guion ya acordado
// (dinamico.cjs, GUION) y van textuales; el resto son nuevas.
const TEXTOS = {
  "01-futbol-pichanga": [[0.3, "⚽", "¡Pichanga de tres contra tres!"], [7, "🎯", "Pasa, dribla y patea al arco"], [13.5, "🏆", "¿Le ganas a Los Cacaítos?"]],
  "02-basquet-2v2": [[0.3, "🏀", "¡Básquet de dos contra dos!"], [7, "🙌", "Roba la pelota y lanza al aro"], [13.5, "🔥", "¡Canasta! ¿Cuántas encestas tú?"]],
  "03-porristas-piramide": [[0.3, "📣", "¡Arma la pirámide con tu equipo de porristas, al ritmo!"], [8, "👆", "Toca justo a tiempo para hacer cada figura"], [17.5, "⭐", "¡Tres estrellas!"]],
  "04-parkour-y-aventura": [[0.3, "🧗", "¡Corre, salta y escala!"], [5.3, "🍄", "¡Corre y salta por cinco mundos de chocolate!"], [12, "🎁", "Junta alfajores y abre las cajas sorpresa"]],
  "05-ciudad-auto-y-fabrica": [[0.3, "🚗", "¡Maneja por la Ciudad Choco!"], [6, "🛣️", "Recorre sus calles en tu auto"], [11.8, "🏭", "¡Entra a la Fábrica Matichoc!"]],
  "06-pueblo-casita-y-estrellas": [[0.3, "🏡", "¡Explora tu propio pueblo y conoce a todos los vecinos!"], [8, "🌳", "¡Sube a la casita del árbol y ayuda a la ardilla Nuez!"], [12.8, "⭐", "¡Junta estrellas y renueva el Pueblo!"]],
  "07-merge-cocina-y-autos": [[0.3, "🧁", "¡Junta dulces y entrega pedidos!"], [4.6, "🍫", "¡Cocina tu propio chocolate: junta, derrite, revuelve y decora!"], [13, "🎮", "¡Y más de catorce juegos en 3D!"]],
};
const ACORDADAS = new Set(["¡Pichanga de tres contra tres!", "¡Arma la pirámide con tu equipo de porristas, al ritmo!", "¡Corre, salta y escala!",
  "¡Corre y salta por cinco mundos de chocolate!", "¡Maneja por la Ciudad Choco!", "¡Entra a la Fábrica Matichoc!",
  "¡Explora tu propio pueblo y conoce a todos los vecinos!", "¡Sube a la casita del árbol y ayuda a la ardilla Nuez!",
  "¡Junta estrellas y renueva el Pueblo!", "¡Junta dulces y entrega pedidos!", "¡Cocina tu propio chocolate: junta, derrite, revuelve y decora!",
  "¡Y más de catorce juegos en 3D!"]);

// Qué parte de cada grabación (1920×1080) se ve en la ventana: centro y alto del recorte; "caja" muestra un rectángulo
// completo sobre un fondo desenfocado de sí mismo (la cocina ocupa solo una parte de la pantalla).
const RECORTE = {
  merge: { cx: 690 },
  aventura: { cx: 820 },
  fabrica: { cy: 620, h: 860 },
  renovar: { h: 1080, cy: 540 },
  autos: { cy: 630 }, // más abajo: arriba hay una franja amarilla de la barra del juego
  cocina: { caja: { x: 130, y: 150, w: 880, h: 680 } },
};

// ---------------------------------------------------------------- imágenes del marco y textos
const b64 = (f) => fs.readFileSync(path.join(RAIZ, f)).toString("base64");
const CSS = `
@font-face{font-family:F;src:url(data:font/woff2;base64,${b64("assets/fonts-libres/fredoka-latin-600-normal.woff2")}) format("woff2");font-weight:600}
*{box-sizing:border-box}html,body{margin:0;background:transparent;font-family:F,"Segoe UI Emoji","Noto Color Emoji",sans-serif;font-weight:600}
:root{--cafe:#4b2e2e;--cafe2:#2f1c18;--rosa:#d4216c;--amarillo:#ffc800;--crema:#fff6e6;--lima:#cfd767}
.abs{position:absolute;left:0;right:0;display:flex;justify-content:center;align-items:center;text-align:center}
.fondo{position:absolute;inset:0;background:radial-gradient(circle at 50% 38%,#6b3f36 0%,var(--cafe) 55%,var(--cafe2) 100%)}
.patron{position:absolute;inset:0;background:url(data:image/png;base64,${b64("assets/brand/pattern-cacao-subtle.png")});opacity:.35}
.logo{background:#fff;border-radius:28px;display:flex;align-items:center;justify-content:center;box-shadow:0 10px 30px rgba(0,0,0,.45)}
.titulo{color:var(--rosa);text-shadow:0 6px 0 var(--cafe2),0 0 30px rgba(255,200,0,.35);letter-spacing:1px;line-height:1}
.texto{display:inline-flex;align-items:center;gap:.4em;max-width:1000px;background:var(--cafe);color:var(--crema);border:7px solid var(--amarillo);border-radius:46px;padding:.32em .8em .36em .6em;box-shadow:0 10px 0 var(--cafe2),0 18px 40px rgba(0,0,0,.5);line-height:1.12;text-align:left}
.texto .e{font-size:1.25em;flex:none}
.texto .t{text-wrap:balance}
.cta{background:var(--rosa);color:#fff;border-radius:30px;padding:.4em .85em;box-shadow:0 10px 0 #8d1247,0 18px 30px rgba(0,0,0,.35);line-height:1.1;white-space:nowrap}
`;
const logo = (w) => `<div class="logo" style="width:${w}px;height:${Math.round(w * 0.6)}px"><img src="data:image/png;base64,${b64("assets/brand/logo-horizontal.png")}" style="width:${Math.round(w * 0.88)}px"></div>`;
const png = (n) => path.join(TMP, `${n}.png`);

async function dibujar(lista) {
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium" });
  const foto = async (nombre, w, h, cuerpo, transparente = true) => {
    const p = await (await b.newContext({ viewport: { width: w, height: h } })).newPage();
    await p.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body style="width:${w}px;height:${h}px;position:relative;overflow:hidden">${cuerpo}</body></html>`);
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(120);
    await p.screenshot({ path: png(nombre), omitBackground: transparente });
    await p.close();
  };
  await foto("fondo", W, H, `<div class="fondo"></div><div class="patron"></div>
    <div class="abs" style="top:52px;gap:34px">${logo(250)}<div class="titulo" style="font-size:132px">Matijuego</div></div>
    <div style="position:absolute;left:${WIN.x}px;top:${WIN.y + 14}px;width:${WIN.w}px;height:${WIN.h}px;border-radius:44px;background:rgba(0,0,0,.45);filter:blur(14px)"></div>`, false);
  await foto("aro", W, H, `<div style="position:absolute;left:${WIN.x - 10}px;top:${WIN.y - 10}px;width:${WIN.w + 20}px;height:${WIN.h + 20}px;border:12px solid var(--amarillo);border-radius:50px"></div>`);
  await foto("invitacion", W, H, `<div class="abs" style="top:1560px;flex-direction:column;gap:26px">
    <div class="cta" style="font-size:58px">🎮 ¡Ven a jugar con nosotros!</div>
    <div style="color:var(--crema);font-size:36px;opacity:.9">Gratis · sin anuncios · para niñas y niños</div></div>`);
  await foto("mascara", WIN.w, WIN.h, `<div style="position:absolute;inset:0;background:#000"></div><div style="position:absolute;inset:0;border-radius:40px;background:#fff"></div>`, false);
  for (const [nombre] of lista) {
    for (const [k, [, e, txt]] of TEXTOS[nombre].entries()) {
      const largo = txt.length > 34;
      await foto(`${nombre}-t${k}`, W, H, `<div class="abs" style="top:${CAP_Y - 40}px;transform:translateY(-50%);padding:0 30px">
        <span class="texto" style="font-size:${largo ? 52 : 62}px"><span class="e">${e}</span><span class="t">${txt}</span></span></div>`);
    }
  }
  await b.close();
}

// ---------------------------------------------------------------- video
const ff = (args) => execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...args], { stdio: "inherit" });
const cuadros = (id) => fs.readdirSync(path.join(OUT, "cuadros", id)).filter((f) => f.endsWith(".jpg")).length;

/** Recorte de una escena para la ventana, con un acercamiento muy suave. Entrada [k] → [w{k}]. */
function ventana(id, k, n) {
  const R = RECORTE[id] || {};
  const s2 = `${WIN.w * 2}:${WIN.h * 2}`;
  const zoom = `zoompan=z='1+0.04*on/${n}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=${WIN.w}x${WIN.h}:fps=${FPS}`;
  if (R.caja) {
    const { x, y, w, h } = R.caja;
    const ch = 1080, cw = Math.round((ch * WIN.w) / WIN.h);
    return `[${k}]split[a${k}][b${k}];[a${k}]crop=${cw}:${ch}:${x + w / 2 - cw / 2}:0,scale=${s2},boxblur=30:2,eq=brightness=-0.08[fb${k}];` +
      `[b${k}]crop=${w}:${h}:${x}:${y},scale=${WIN.w * 2}:-2[fc${k}];[fb${k}][fc${k}]overlay=(W-w)/2:(H-h)/2,${zoom},setsar=1,format=yuv420p[w${k}]`;
  }
  // por omisión deja fuera la barra de arriba del juego (los primeros 80 px)
  const h = R.h || 1000, w = Math.round((h * WIN.w) / WIN.h);
  const cx = Math.min(1920 - w / 2, Math.max(w / 2, R.cx ?? 960)), cy = Math.min(1080 - h / 2, Math.max(h / 2, R.cy ?? 580));
  return `[${k}]crop=${w}:${h}:${Math.round(cx - w / 2)}:${Math.round(cy - h / 2)},scale=${s2},${zoom},setsar=1,format=yuv420p[w${k}]`;
}

function montar(nombre, escenas) {
  const ent = [], f = [], durs = [];
  escenas.forEach(([id, , , corte], k) => {
    const d = Math.min(cuadros(id) / FPS, corte || Infinity);
    ent.push("-framerate", String(FPS), "-t", d.toFixed(3), "-i", path.join(OUT, "cuadros", id, "c%05d.jpg"));
    f.push(ventana(id, k, Math.round(d * FPS)));
    durs.push(d);
  });
  // escenas encadenadas con fundidos cortos
  let prev = "w0", t = durs[0];
  for (let k = 1; k < escenas.length; k++) {
    f.push(`[${prev}][w${k}]xfade=transition=fade:duration=${FUNDIDO}:offset=${(t - FUNDIDO).toFixed(3)}[j${k}]`);
    t += durs[k] - FUNDIDO;
    prev = `j${k}`;
  }
  const dur = Math.min(t, MAX);
  let i = escenas.length;
  const fija = (n) => { ent.push("-loop", "1", "-framerate", String(FPS), "-t", dur.toFixed(3), "-i", png(n)); return i++; };
  const iFondo = fija("fondo"), iMasc = fija("mascara"), iAro = fija("aro"), iInv = fija("invitacion");
  f.push(`[${iMasc}]format=gray[m];[${prev}][m]alphamerge[vm];[${iFondo}][vm]overlay=${WIN.x}:${WIN.y}[a];[a][${iAro}]overlay[b];[b][${iInv}]overlay[c0]`);
  // cada texto entra con un saltito y se queda hasta que llega el siguiente
  const textos = TEXTOS[nombre];
  textos.forEach(([ini], k) => {
    const it = fija(`${nombre}-t${k}`);
    const fin = k + 1 < textos.length ? textos[k + 1][0] : dur + 1;
    const st = ini.toFixed(3);
    f.push(`[${it}]format=rgba,fade=t=in:st=${st}:d=0.2:alpha=1[t${k}];` +
      `[c${k}][t${k}]overlay=x=0:y='if(gte(t,${st}),120*exp(-10*(t-${st}))*cos(12*(t-${st})),0)':enable='between(t,${st},${fin.toFixed(3)})'[c${k + 1}]`);
  });
  f.push(`[c${textos.length}]fade=t=in:st=0:d=0.25,fade=t=out:st=${(dur - 0.4).toFixed(3)}:d=0.4,format=yuv420p[vid]`);
  // música propia, suave para que la voz se escuche encima (o silencio con --sin-musica)
  if (MUSICA) {
    const m = path.join(TMP, `musica-${dur.toFixed(2)}.wav`);
    if (!fs.existsSync(m)) execFileSync("node", [path.join(__dirname, "musica.cjs"), m, (dur + 0.05).toFixed(3)], { stdio: "inherit" });
    ent.push("-i", m);
    f.push(`[${i}]volume=0.35,afade=t=out:st=${(dur - 0.8).toFixed(3)}:d=0.8,aresample=44100[aud]`);
  } else {
    ent.push("-f", "lavfi", "-t", dur.toFixed(3), "-i", "anullsrc=r=44100:cl=stereo");
    f.push(`[${i}]anull[aud]`);
  }
  const archivo = path.join(DEST, `${nombre}${MUSICA ? "" : "-sin-musica"}.mp4`);
  ff([...ent, "-filter_complex", f.join(";"), "-map", "[vid]", "-map", "[aud]", "-t", dur.toFixed(3),
    "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p", "-r", String(FPS),
    "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart", archivo]);
  console.log(`${archivo}: ${dur.toFixed(1)} s, ${(fs.statSync(archivo).size / 1e6).toFixed(1)} MB`);
  return dur;
}

(async () => {
  fs.mkdirSync(TMP, { recursive: true });
  const lista = CLIPS.filter(([n]) => !SOLO.length || SOLO.some((s) => n.includes(s)));
  await dibujar(lista);
  const guion = ["Textos de los videos verticales del Matijuego, para grabarlos con tu voz.",
    "Cada frase aparece en pantalla en el segundo indicado. ★ = frase del guion ya acordado (textual).", ""];
  for (const [nombre, escenas] of lista) {
    const dur = montar(nombre, escenas);
    guion.push(`${nombre}.mp4 (${dur.toFixed(1)} s)`);
    for (const [ini, , txt] of TEXTOS[nombre]) guion.push(`  ${String(ini.toFixed(1)).padStart(4)} s  ${txt}${ACORDADAS.has(txt) ? "  ★" : ""}`);
    guion.push("");
  }
  if (!SOLO.length) fs.writeFileSync(path.join(DEST, "GUION.txt"), guion.join("\r\n"), "utf8");
  fs.rmSync(TMP, { recursive: true, force: true });
})();
