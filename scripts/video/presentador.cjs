// Video vertical (1080×1920) con la dueña presentando el juego: su video grabado (con su voz) recortado sin fondo en la
// esquina de abajo, y detrás el juego andando, con cada escena y cada texto puestos justo cuando ella nombra ese juego.
// Los tiempos salen de la transcripción de su voz (faster-whisper, con el segundo de cada palabra).
// Necesita: los cuadros del juego (<salida>/cuadros, ver clips.cjs) y los cuadros de ella sin fondo (recortar-persona.py).
// Uso: NODE_PATH=... CHROMIUM_PATH=<msedge.exe> node scripts/video/presentador.cjs <salida> <video-original.mp4> <carpeta-persona>
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { chromium } = (() => { try { return require("playwright"); } catch { return require("playwright-core"); } })();

const OUT = path.resolve(process.argv[2] || "video");
const ORIGINAL = process.argv[3];
const PERSONA = process.argv[4];
const DEST = path.join(OUT, "presentador");
const TMP = path.join(DEST, "tmp");
const RAIZ = path.join(__dirname, "..", "..");
const FPS = 30;
const W = 1080, H = 1920;
const WIN = { x: 30, y: 160, w: 1020, h: 1040 }; // ventana del juego
const YO = { h: 900 }; // alto de la persona recortada (abajo a la derecha)

// Pauta del video del 4-nov-2026 (60 s). Escenas: [desde el segundo, escena, desde qué segundo de esa grabación].
// Cada escena dura hasta que empieza la siguiente; los cortes caen ~0,1 s antes de la palabra.
const ESCENAS = [
  [0.0, "pueblo", 0.5], [1.2, "porristas", 14], [2.4, "ciudad", 1], [3.6, "aventura", 3], // «Hola, hola, amigos…»
  [4.85, "merge", 0.5], [6.4, "cocina", 6], [8.0, "parkour", 1], // «…nuestros Matijuegos, vamos a estar lanzándolos…»
  [9.25, "casita", 0.5], // «…juntando algunos testers…»
  [13.05, "pueblo", 2.5], // «aquí les voy a mostrar…»
  [18.8, "pichanga", 3], // «fútbol»
  [20.0, "basquet", 2], // «básquetbol»
  [21.95, "pichanga", 9], // «una pichanguita»
  [24.75, "basquet", 11.5], // «básquetboteo dos contra dos para poder encestar»
  [29.45, "autos-largo", 0], // «carritas de auto… alfajores… esquivando barriles»
  [39.4, "ciudad", 4], // «una ciudad»
  [40.6, "pueblo", 0], // «un pueblo Matichoc»
  [44.4, "pueblo", 4.3], // «interactuar con personas»
  [46.4, "renovar", 2.2], // «te mandan a hacer misiones, te piden favores»
  [49.5, "porristas", 4], [50.3, "parkour", 3], [51.1, "aventura", 7], // «hay muchas cosas»
  [51.9, "fabrica", 0.5], // «los invito a que puedan ofrecerse para testers»
  [56.4, "porristas", 17.5], // «en la Play Store» (termina con «¡Nivel completado!» y tres estrellas)
];
// Textos: [desde, hasta, emoji, texto]
const TEXTOS = [
  [0.35, 3.05, "👋", "¡Hola, hola, amigos!"],
  [3.05, 5.85, "🎮", "Les presento los Matijuegos"],
  [5.85, 8.0, "🚀", "¡Muy pronto!"],
  [8.0, 13.05, "🙋", "Estamos buscando testers"],
  [13.05, 18.8, "👇", "Mira los juegos que tenemos"],
  [18.8, 20.0, "⚽", "Fútbol"],
  [20.0, 21.95, "🏀", "Básquetbol"],
  [21.95, 24.75, "⚽", "¡Una pichanguita!"],
  [24.75, 29.45, "🏀", "Dos contra dos, ¡a encestar!"],
  [29.45, 33.9, "🚗", "Carritas de auto"],
  [33.9, 37.25, "🍪", "¡Junta alfajores!"],
  [37.25, 39.4, "🛢️", "¡Esquiva los barriles!"],
  [39.4, 40.6, "🏙️", "Una ciudad"],
  [40.6, 44.4, "🏡", "¡Y el pueblo Matichoc!"],
  [44.4, 46.4, "💬", "Conversa con los vecinos"],
  [46.4, 49.5, "⭐", "Misiones y favores"],
  [49.5, 51.9, "✨", "¡Y muchas cosas más!"],
  [51.9, 56.4, "🙋", "¡Únete como tester en matichoc.cl!"],
  [56.4, 99, "📲", "Pronto en Google Play"],
];
const RECORTE = { merge: { cx: 690 }, aventura: { cx: 820 }, fabrica: { cy: 620, h: 860 }, renovar: { h: 1080, cy: 540 }, cocina: { caja: { x: 130, y: 150, w: 880, h: 680 } } };

const ff = (args) => execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...args], { stdio: "inherit" });
const png = (n) => path.join(TMP, `${n}.png`);
const durOriginal = () => Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", ORIGINAL]).toString());

// ---------------------------------------------------------------- imágenes (marco y textos)
const b64 = (f) => fs.readFileSync(path.join(RAIZ, f)).toString("base64");
const CSS = `
@font-face{font-family:F;src:url(data:font/woff2;base64,${b64("assets/fonts-libres/fredoka-latin-600-normal.woff2")}) format("woff2");font-weight:600}
*{box-sizing:border-box}html,body{margin:0;background:transparent;font-family:F,"Segoe UI Emoji","Noto Color Emoji",sans-serif;font-weight:600}
:root{--cafe:#4b2e2e;--cafe2:#2f1c18;--rosa:#d4216c;--amarillo:#ffc800;--crema:#fff6e6}
.logo{background:#fff;border-radius:22px;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 24px rgba(0,0,0,.5)}
.titulo{color:var(--rosa);text-shadow:0 5px 0 var(--cafe2),0 0 24px rgba(0,0,0,.6);line-height:1}
.texto{display:inline-flex;align-items:center;gap:.35em;background:var(--cafe);color:var(--crema);border:7px solid var(--amarillo);border-radius:40px;padding:.3em .7em .34em .5em;box-shadow:0 10px 0 var(--cafe2),0 18px 40px rgba(0,0,0,.55);line-height:1.1}
.texto .e{font-size:1.25em;flex:none}
`;
const logo = (w) => `<div class="logo" style="width:${w}px;height:${Math.round(w * 0.6)}px"><img src="data:image/png;base64,${b64("assets/brand/logo-horizontal.png")}" style="width:${Math.round(w * 0.88)}px"></div>`;

async function dibujar() {
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium" });
  const foto = async (nombre, w, h, cuerpo, transparente = true) => {
    const p = await (await b.newContext({ viewport: { width: w, height: h } })).newPage();
    await p.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body style="width:${w}px;height:${h}px;position:relative;overflow:hidden">${cuerpo}</body></html>`);
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(120);
    await p.screenshot({ path: png(nombre), omitBackground: transparente });
    await p.close();
  };
  await foto("arriba", W, H, `<div style="position:absolute;left:0;right:0;top:22px;display:flex;justify-content:center;align-items:center;gap:26px">${logo(180)}<div class="titulo" style="font-size:100px">Matijuego</div></div>
    <div style="position:absolute;left:${WIN.x - 10}px;top:${WIN.y - 10}px;width:${WIN.w + 20}px;height:${WIN.h + 20}px;border:12px solid var(--amarillo);border-radius:50px"></div>`);
  await foto("mascara", WIN.w, WIN.h, `<div style="position:absolute;inset:0;background:#000"></div><div style="position:absolute;inset:0;border-radius:40px;background:#fff"></div>`, false);
  for (const [k, [, , e, txt]] of TEXTOS.entries()) {
    // ancho fijo (lo que queda a la izquierda de la persona), así el texto ocupa 1 o 2 líneas anchas y no una columna angosta
    await foto(`t${k}`, W, H, `<div style="position:absolute;left:30px;top:${WIN.y + WIN.h + 40}px;width:590px">
      <span class="texto" style="display:flex;font-size:${txt.length > 22 ? 50 : txt.length > 14 ? 56 : 64}px;${txt.length > 14 ? "" : "display:inline-flex"}"><span class="e">${e}</span><span class="t">${txt}</span></span></div>`);
  }
  await b.close();
}

// ---------------------------------------------------------------- fondo: juego andando (ventana nítida y el resto desenfocado)
function ventana(id) {
  const R = RECORTE[id] || {};
  if (R.caja) {
    const { x, y, w, h } = R.caja;
    const ch = 1080, cw = Math.round((ch * WIN.w) / WIN.h);
    return `split[a][b];[a]crop=${cw}:${ch}:${x + w / 2 - cw / 2}:0,scale=${WIN.w}:${WIN.h},boxblur=24:2,eq=brightness=-0.08[fb];` +
      `[b]crop=${w}:${h}:${x}:${y},scale=${WIN.w}:-2[fc];[fb][fc]overlay=(W-w)/2:(H-h)/2`;
  }
  const h = R.h || 1000, w = Math.round((h * WIN.w) / WIN.h);
  const cx = Math.min(1920 - w / 2, Math.max(w / 2, R.cx ?? 960)), cy = Math.min(1080 - h / 2, Math.max(h / 2, R.cy ?? 580));
  return `crop=${w}:${h}:${Math.round(cx - w / 2)}:${Math.round(cy - h / 2)},scale=${WIN.w}:${WIN.h}`;
}

function fondo(total) {
  const partes = [];
  ESCENAS.forEach(([ini, id, desde], k) => {
    const fin = k + 1 < ESCENAS.length ? ESCENAS[k + 1][0] : total;
    const n = Math.round(fin * FPS) - Math.round(ini * FPS);
    const dir = path.join(OUT, "cuadros", id);
    const hay = fs.readdirSync(dir).filter((f) => f.endsWith(".jpg")).length;
    const d0 = Math.max(0, Math.min(Math.round(desde * FPS), hay - n));
    const sal = path.join(TMP, `p${String(k).padStart(2, "0")}.mp4`);
    const f = `[0]split[g][v];[g]crop=608:1080:656:0,scale=${W}:${H},boxblur=22:3,eq=brightness=-0.12:saturation=1.15[bg];` +
      `[v]${ventana(id)},format=rgba[w0];[1]format=gray[m];[w0][m]alphamerge[w];[bg][w]overlay=${WIN.x}:${WIN.y},` +
      `tpad=stop_mode=clone:stop_duration=3,format=yuv420p`;
    ff(["-framerate", String(FPS), "-start_number", String(d0), "-i", path.join(dir, "c%05d.jpg"), "-loop", "1", "-i", png("mascara"),
      "-filter_complex", f, "-frames:v", String(n), "-c:v", "libx264", "-preset", "fast", "-crf", "16", "-pix_fmt", "yuv420p", "-r", String(FPS), "-an", sal]);
    partes.push(sal);
  });
  const lista = path.join(TMP, "lista.txt");
  fs.writeFileSync(lista, partes.map((p) => `file '${p.replace(/\\/g, "/")}'`).join("\n"));
  const base = path.join(TMP, "fondo.mp4");
  ff(["-f", "concat", "-safe", "0", "-i", lista, "-c", "copy", base]);
  return base;
}

// ---------------------------------------------------------------- todo junto
function final(base, total) {
  const ent = ["-i", base, "-loop", "1", "-framerate", String(FPS), "-t", total.toFixed(3), "-i", png("arriba"),
    "-framerate", "30", "-i", path.join(PERSONA, "c%05d.png")];
  const yw = Math.round((YO.h * 478) / 850);
  let f = `[0][1]overlay[c0]`;
  TEXTOS.forEach(([ini, fin], k) => {
    ent.push("-loop", "1", "-framerate", String(FPS), "-t", total.toFixed(3), "-i", png(`t${k}`));
    const st = ini.toFixed(3);
    f += `;[${k + 3}]format=rgba,fade=t=in:st=${st}:d=0.15:alpha=1[t${k}];[c${k}][t${k}]overlay=x='if(gte(t,${st}),-90*exp(-11*(t-${st}))*cos(12*(t-${st})),0)':y=0:enable='between(t,${st},${Math.min(fin, total).toFixed(3)})'[c${k + 1}]`;
  });
  // la persona, abajo a la derecha, entrando desde abajo al principio
  f += `;[2]scale=-2:${YO.h}:flags=lanczos,format=rgba[yo];[c${TEXTOS.length}][yo]overlay=x=${W - yw + 10}:y='${H - YO.h}+${YO.h}*exp(-7*t)':shortest=1,fade=t=out:st=${(total - 0.5).toFixed(3)}:d=0.5,format=yuv420p[vid]`;
  // su voz, con la música propia bajita debajo
  const musica = path.join(TMP, "musica.wav");
  execFileSync("node", [path.join(__dirname, "musica.cjs"), musica, (total + 0.05).toFixed(3)], { stdio: "inherit" });
  const iv = TEXTOS.length + 3;
  ent.push("-i", ORIGINAL, "-i", musica);
  f += `;[${iv}:a]aformat=sample_rates=44100:channel_layouts=stereo,highpass=f=80,acompressor=threshold=0.1:ratio=3:attack=10:release=200,volume=1.4[voz];` +
    `[${iv + 1}]volume=0.14,afade=t=out:st=${(total - 1).toFixed(3)}:d=1[mus];[voz][mus]amix=inputs=2:normalize=0:duration=first,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=44100[aud]`;
  const salida = path.join(DEST, "matijuego-presentacion.mp4");
  ff([...ent, "-filter_complex", f, "-map", "[vid]", "-map", "[aud]", "-t", total.toFixed(3),
    "-c:v", "libx264", "-preset", "medium", "-crf", "19", "-pix_fmt", "yuv420p", "-r", String(FPS), "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", salida]);
  console.log(`${salida}: ${total.toFixed(1)} s, ${(fs.statSync(salida).size / 1e6).toFixed(1)} MB`);
}

(async () => {
  if (!ORIGINAL || !PERSONA) { console.error("Uso: node presentador.cjs <salida> <video-original.mp4> <carpeta-persona>"); process.exit(1); }
  fs.mkdirSync(TMP, { recursive: true });
  const total = durOriginal();
  await dibujar();
  const base = fondo(total);
  final(base, total);
  fs.rmSync(TMP, { recursive: true, force: true });
})();
