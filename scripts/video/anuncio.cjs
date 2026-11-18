// Aviso vertical (1080×1920) para publicidad pagada en Instagram, Facebook y TikTok: el juego andando al ritmo de la
// canción «Sube el nivel» (hecha con Suno), sin narración, con mensajes en pantalla y una tarjeta final para descargar.
// Las escenas cambian justo cuando la canción nombra cada cosa (tiempos de cada palabra sacados con faster-whisper de la
// voz separada de la canción) y los mensajes quedan en la zona que no tapan los botones de las redes (arriba ~200 px y
// abajo ~360 px libres). Está pensado para verse sin sonido: el texto cuenta todo y la canción suma.
// Necesita los cuadros del juego (<salida>/cuadros/<escena>, ver grabar.cjs) y la canción (WAV).
// Uso: NODE_PATH=... CHROMIUM_PATH=<msedge.exe> node scripts/video/anuncio.cjs <salida> <cancion.wav> <pauta.json>
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { chromium } = (() => { try { return require("playwright"); } catch { return require("playwright-core"); } })();

const OUT = path.resolve(process.argv[2] || "video/anuncio");
const CANCION = process.argv[3];
const PAUTA = JSON.parse(fs.readFileSync(path.resolve(process.argv[4] || ""), "utf8"));
const DEST = path.join(OUT, "listos");
const TMP = path.join(OUT, `tmp-${PAUTA.salida}`);
const RAIZ = path.join(__dirname, "..", "..");
const FPS = 30;
const W = 1080, H = 1920;
const WIN = { x: 40, y: 360, w: 1000, h: 1000 }; // ventana del juego (entre el encabezado y los mensajes)
const MSG_Y = 1400; // línea de los mensajes (debajo de la ventana; lo de abajo queda libre para los botones de la red)
const RECORTE = { merge: { cx: 690 }, pichanga: { cx: 1280 }, aventura: { cx: 820 }, fabrica: { cy: 620, h: 860 }, renovar: { h: 1080, cy: 540 }, cocina: { caja: { x: 130, y: 150, w: 880, h: 680 } } };
const TOTAL = PAUTA.cancion.hasta - PAUTA.cancion.desde;

const ff = (args) => execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...args], { stdio: "inherit" });
const png = (n) => path.join(TMP, `${n}.png`);
const b64 = (f) => fs.readFileSync(path.join(RAIZ, f)).toString("base64");

// ---------------------------------------------------------------- imágenes (encabezado, mensajes, tarjeta final)
const CSS = `
@font-face{font-family:F;src:url(data:font/woff2;base64,${b64("assets/fonts-libres/fredoka-latin-600-normal.woff2")}) format("woff2");font-weight:600}
*{box-sizing:border-box}html,body{margin:0;background:transparent;font-family:F,"Segoe UI Emoji","Noto Color Emoji",sans-serif;font-weight:600}
:root{--cafe:#4b2e2e;--cafe2:#2f1c18;--rosa:#d4216c;--amarillo:#ffc800;--crema:#fff6e6}
.logo{background:#fff;border-radius:20px;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 24px rgba(0,0,0,.5)}
.titulo{color:var(--rosa);text-shadow:0 5px 0 var(--cafe2),0 0 24px rgba(0,0,0,.6);line-height:1}
.msg{display:inline-flex;align-items:center;gap:.35em;background:var(--cafe);color:var(--crema);border:8px solid var(--amarillo);border-radius:44px;padding:.28em .75em .32em .55em;box-shadow:0 10px 0 var(--cafe2),0 18px 40px rgba(0,0,0,.55);line-height:1.1;text-align:center}
.msg .e{font-size:1.2em;flex:none}
.grande{color:var(--amarillo);-webkit-text-stroke:16px var(--cafe2);paint-order:stroke fill;text-shadow:0 14px 0 var(--cafe2),0 0 60px rgba(0,0,0,.6);line-height:1.02;text-align:center;transform:rotate(-4deg)}
.chip{display:inline-block;background:#fff;color:var(--cafe);border-radius:999px;padding:.2em .7em;margin:.15em;box-shadow:0 6px 0 rgba(0,0,0,.25)}
.boton{display:inline-block;background:linear-gradient(180deg,#ff4d94,var(--rosa));color:#fff;border:8px solid #fff;border-radius:999px;padding:.35em 1.1em .4em;box-shadow:0 12px 0 #8a0f45,0 24px 50px rgba(0,0,0,.5)}
`;
const logo = (w) => `<div class="logo" style="width:${w}px;height:${Math.round(w * 0.6)}px"><img src="data:image/png;base64,${b64("assets/brand/logo-horizontal.png")}" style="width:${Math.round(w * 0.88)}px"></div>`;

async function dibujar() {
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium" });
  const foto = async (nombre, cuerpo, transparente = true, w = W, h = H) => {
    const p = await (await b.newContext({ viewport: { width: w, height: h } })).newPage();
    await p.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body style="width:${w}px;height:${h}px;position:relative;overflow:hidden">${cuerpo}</body></html>`);
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(120);
    await p.screenshot({ path: png(nombre), omitBackground: transparente });
    await p.close();
  };
  // encabezado (logo + nombre) y el borde amarillo de la ventana del juego
  await foto("arriba", `<div style="position:absolute;left:0;right:0;top:200px;display:flex;justify-content:center;align-items:center;gap:22px">${logo(150)}<div class="titulo" style="font-size:92px">Matijuego</div></div>
    <div style="position:absolute;left:${WIN.x - 10}px;top:${WIN.y - 10}px;width:${WIN.w + 20}px;height:${WIN.h + 20}px;border:12px solid var(--amarillo);border-radius:50px"></div>`);
  await foto("mascara", `<div style="position:absolute;inset:0;background:#000"></div><div style="position:absolute;inset:0;border-radius:40px;background:#fff"></div>`, false, WIN.w, WIN.h);
  for (const [k, [, , e, txt, tipo]] of PAUTA.textos.entries()) {
    if (tipo === "grande") {
      // texto gigante al medio de la ventana del juego (gancho y momentos fuertes de la canción); "|" = salto de línea
      await foto(`t${k}`, `<div style="position:absolute;left:30px;right:30px;top:${WIN.y}px;height:${WIN.h}px;display:flex;align-items:center;justify-content:center">
        <div class="grande" style="font-size:${txt.replace(/\|/g, "").length > 14 ? 136 : 170}px">${e ? `${e}<br>` : ""}${txt.split("|").join("<br>")}</div></div>`);
      continue;
    }
    // mensaje centrado debajo de la ventana: 1 línea si cabe, si no 2 líneas anchas
    const tam = txt.length > 30 ? 52 : txt.length > 20 ? 60 : 72;
    await foto(`t${k}`, `<div style="position:absolute;left:30px;right:30px;top:${MSG_Y}px;display:flex;justify-content:center">
      <span class="msg" style="font-size:${tam}px;max-width:1020px"><span class="e">${e}</span><span class="t">${txt}</span></span></div>`);
  }
  // tarjeta final: fondo café con el patrón de cacao, logo, nombre, sellos y el botón para descargar
  const c = PAUTA.cierre;
  await foto("cierre", `<div style="position:absolute;inset:0;background:radial-gradient(circle at 50% 40%,#6b3f36 0%,var(--cafe) 55%,var(--cafe2) 100%)"></div>
    <div style="position:absolute;inset:0;background:url(data:image/png;base64,${b64("assets/brand/pattern-cacao-subtle.png")});opacity:.3"></div>
    <div style="position:absolute;left:0;right:0;top:330px;display:flex;flex-direction:column;align-items:center;gap:34px;text-align:center">
      ${logo(330)}
      <div class="titulo" style="font-size:170px">Matijuego</div>
      <div style="color:var(--crema);font-size:62px;line-height:1.15;padding:0 60px">${c.lema}</div>
      <div style="font-size:50px;margin-top:6px">${c.sellos.map((s) => `<span class="chip">${s}</span>`).join(" ")}</div>
    </div>`, false);
  await foto("boton", `<div style="position:absolute;left:0;right:0;top:1340px;display:flex;justify-content:center"><span class="boton" style="font-size:60px;white-space:nowrap">${c.boton}</span></div>`);
  await b.close();
}

// ---------------------------------------------------------------- fondo: el juego andando (ventana nítida, resto desenfocado)
function ventana(id) {
  const R = RECORTE[id] || {};
  if (R.caja) {
    const { x, y, w, h } = R.caja;
    const ch = 1080, cw = Math.round((ch * WIN.w) / WIN.h);
    return `split[a][b];[a]crop=${cw}:${ch}:${x + w / 2 - cw / 2}:0,scale=${WIN.w}:${WIN.h},boxblur=24:2,eq=brightness=-0.08[fb];` +
      `[b]crop=${w}:${h}:${x}:${y},scale=${WIN.w}:-2[fc];[fb][fc]overlay=(W-w)/2:(H-h)/2`;
  }
  const h = R.h || 1000, w = Math.round((h * WIN.w) / WIN.h);
  const cx = Math.min(1920 - w / 2, Math.max(w / 2, R.cx ?? 960)), cy = Math.min(1080 - h / 2, Math.max(h / 2, R.cy ?? 560));
  return `crop=${w}:${h}:${Math.round(cx - w / 2)}:${Math.round(cy - h / 2)},scale=${WIN.w}:${WIN.h}`;
}

function cuadros(id) {
  // primero las escenas grabadas para este aviso; si falta alguna, las del video promocional
  for (const d of [path.join(OUT, "cuadros", id), path.join(OUT, "..", "cuadros", id)]) if (fs.existsSync(path.join(d, "c00000.jpg"))) return d;
  throw new Error(`Faltan los cuadros de la escena ${id}`);
}

function fondo() {
  const partes = [];
  const fin0 = PAUTA.cierre.desde; // desde la tarjeta final ya no se ve el juego
  PAUTA.escenas.forEach(([ini, id, desde], k) => {
    const fin = Math.min(k + 1 < PAUTA.escenas.length ? PAUTA.escenas[k + 1][0] : fin0, fin0) + (k + 1 === PAUTA.escenas.length ? 0.6 : 0);
    const n = Math.round(fin * FPS) - Math.round(ini * FPS);
    if (n <= 0) return;
    const dir = cuadros(id);
    const hay = fs.readdirSync(dir).filter((f) => f.endsWith(".jpg")).length;
    const d0 = Math.max(0, Math.min(Math.round(desde * FPS), hay - n));
    const sal = path.join(TMP, `p${String(k).padStart(2, "0")}.mp4`);
    const f = `[0]split[g][v];[g]crop=608:1080:656:0,scale=${W}:${H},boxblur=22:3,eq=brightness=-0.14:saturation=1.15[bg];` +
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

// ---------------------------------------------------------------- todo junto, con la canción
function final(base) {
  const T = TOTAL.toFixed(3);
  const ent = ["-i", base, "-loop", "1", "-framerate", String(FPS), "-t", T, "-i", png("arriba")];
  let f = `[0]tpad=stop_mode=clone:stop_duration=5,trim=duration=${T}[b0];[b0][1]overlay[c0]`;
  const n0 = 2;
  PAUTA.textos.forEach(([ini, fin, , , tipo], k) => {
    ent.push("-loop", "1", "-framerate", String(FPS), "-t", T, "-i", png(`t${k}`));
    const st = ini.toFixed(3);
    // los mensajes suben con un saltito; los gigantes caen desde arriba con rebote
    const mov = tipo === "grande" ? `x=0:y='if(gte(t,${st}),-360*exp(-12*(t-${st}))*cos(14*(t-${st})),0)'`
      : `x=0:y='if(gte(t,${st}),120*exp(-11*(t-${st}))*cos(12*(t-${st})),0)'`;
    f += `;[${k + n0}]format=rgba,fade=t=in:st=${st}:d=0.12:alpha=1[t${k}];[c${k}][t${k}]overlay=${mov}:enable='between(t,${st},${Math.min(fin, TOTAL).toFixed(3)})'[c${k + 1}]`;
  });
  // tarjeta final (aparece con un fundido corto) y el botón, que entra rebotando un poquito después
  const ic = PAUTA.textos.length + n0;
  const cd = PAUTA.cierre.desde.toFixed(3), bd = (PAUTA.cierre.desde + 0.35).toFixed(3);
  ent.push("-loop", "1", "-framerate", String(FPS), "-t", T, "-i", png("cierre"), "-loop", "1", "-framerate", String(FPS), "-t", T, "-i", png("boton"));
  f += `;[${ic}]format=rgba,fade=t=in:st=${cd}:d=0.25:alpha=1[cz];[c${PAUTA.textos.length}][cz]overlay=enable='gte(t,${cd})'[cc]` +
    `;[${ic + 1}]format=rgba,fade=t=in:st=${bd}:d=0.1:alpha=1[bt];[cc][bt]overlay=x=0:y='if(gte(t,${bd}),260*exp(-9*(t-${bd}))*cos(11*(t-${bd})),0)':enable='gte(t,${bd})',format=yuv420p[vid]`;
  // la canción, desde el segundo elegido, con entrada y salida suaves, a −14 LUFS (lo que piden las redes)
  const ia = ic + 2;
  ent.push("-ss", PAUTA.cancion.desde.toFixed(3), "-t", T, "-i", CANCION);
  f += `;[${ia}:a]aformat=sample_rates=44100:channel_layouts=stereo,afade=t=in:d=0.06,afade=t=out:st=${(TOTAL - 1.2).toFixed(3)}:d=1.2,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=44100[aud]`;
  fs.mkdirSync(DEST, { recursive: true });
  const salida = path.join(DEST, `${PAUTA.salida}.mp4`);
  ff([...ent, "-filter_complex", f, "-map", "[vid]", "-map", "[aud]", "-t", T,
    "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", "-r", String(FPS), "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", salida]);
  console.log(`${salida}: ${TOTAL.toFixed(1)} s, ${(fs.statSync(salida).size / 1e6).toFixed(1)} MB`);
}

(async () => {
  if (!CANCION || !fs.existsSync(CANCION)) { console.error("Uso: node anuncio.cjs <salida> <cancion.wav> <pauta.json>"); process.exit(1); }
  fs.mkdirSync(TMP, { recursive: true });
  await dibujar();
  const base = fondo();
  final(base);
  fs.rmSync(TMP, { recursive: true, force: true });
})();
