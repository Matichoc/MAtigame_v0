// Video promocional "con energía" en vertical (1080×1920) para Reels, TikTok, Shorts y estados: cortes al ritmo de la música
// (124 tiempos por minuto), acercamiento de golpe en cada corte, carteles que entran saltando y la invitación siempre abajo.
// Usa los cuadros de grabar.cjs (<salida>/cuadros), la música de musica.cjs y las voces que haya en <salida>/voces:
// original-N.wav (recortadas del video anterior) y nueva-N.wav (frases nuevas grabadas por la dueña; ver GUION abajo).
// Si falta una voz, esa escena va solo con música y cartel.
// Uso: NODE_PATH=$(npm root -g) node scripts/video/dinamico.cjs <salida> [largo|corto]
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const OUT = path.resolve(process.argv[2] || "video");
const VERSION = process.argv[3] || "largo";
const RAIZ = path.join(__dirname, "..", "..");
const TMP = path.join(OUT, "dinamico");
const FPS = 30;
const BEAT = 60 / 124;
const W = 1080, H = 1920;
const WIN = { x: 30, y: 270, w: 1020, h: 1120 }; // ventana del juego
const CAP_Y = WIN.y + WIN.h; // los carteles van montados sobre el borde de abajo de la ventana

// Frases nuevas para grabar (duración aproximada en segundos). El archivo va en <salida>/voces/nueva-N.wav.
const GUION = {
  1: ["¡Hey! ¿Te atreves a jugar con nosotros?", 2],
  2: ["¡Arma la pirámide con tu equipo de porristas, al ritmo!", 2.5],
  3: ["¡Sube a la casita del árbol y ayuda a la ardilla Nuez!", 2],
  4: ["¡Cocina tu propio chocolate: junta, derrite, revuelve y decora!", 2.5],
  5: ["¡Corre y salta por cinco mundos de chocolate!", 2],
  6: ["¡Entra a la Fábrica Matichoc!", 2],
  7: ["¡Ven a jugar con nosotros y sé parte de la historia de Matichoc! Gratis, sin anuncios. ¡Te esperamos!", 4],
  8: ["¿Tienes Android? ¡Únete como tester en matichoc.cl!", 2.5],
  // para reemplazar las voces del video anterior (no seguían el orden de sus imágenes: no se sabe bien qué dice cada una)
  9: ["¡Esto es Matijuego!", 1.8],
  10: ["¡Explora tu propio pueblo y conoce a todos los vecinos!", 3.5],
  11: ["¡Junta estrellas y renueva el Pueblo!", 2.2],
  12: ["¡Pichanga de tres contra tres!", 1.8],
  13: ["¡Y básquet de dos contra dos!", 1.8],
  14: ["¡Maneja por la Ciudad Choco!", 2.5],
  15: ["¡Corre, salta y escala!", 1.8],
  16: ["¡Junta dulces y entrega pedidos!", 2.2],
  17: ["¡Y más de catorce juegos en 3D!", 2.2],
};

// Qué parte de cada grabación (1920×1080) se ve en la ventana: centro y alto del recorte; "caja" muestra un rectángulo
// completo sobre un fondo desenfocado de sí mismo (para la cocina, que ocupa solo una parte de la pantalla).
const RECORTE = {
  merge: { cx: 690 },
  aventura: { cx: 820 },
  fabrica: { cy: 620, h: 860 },
  cocina: { caja: { x: 130, y: 150, w: 880, h: 680 } },
};

const CARTEL = {
  pueblo: "🏡 ¡Explora tu propio pueblo!",
  casita: "🌳 ¡Sube a la casita del árbol!",
  renovar: "⭐ ¡Renuévalo con estrellas!",
  porristas: "📣 ¡Arma la pirámide al ritmo!",
  pichanga: "⚽ ¡Pichanga 3 contra 3!",
  basquet: "🏀 ¡Básquet 2 contra 2!",
  ciudad: "🚗 ¡Maneja por la Ciudad!",
  fabrica: "🏭 ¡Entra a la Fábrica Matichoc!",
  cocina: "🍫 ¡Cocina tu propio chocolate!",
  parkour: "🧗 ¡Corre, salta y escala!",
  aventura: "🍄 ¡Aventura en 5 mundos!",
  merge: "🧁 ¡Junta y entrega pedidos!",
  extras: "🎮 ¡14 juegos en 3D!",
};
const GANCHO = ["¿LISTOS", "PARA", "JUGAR?", "¡VAMOS!"];

// Escenas: [id, tomas [[carpeta, primer cuadro, tiempos]], voz]. Los cortes caen siempre en un tiempo de la música.
// Una voz puede ser una lista: se usa la primera que exista (la frase nueva y, si falta, la del video anterior).
// Del video anterior solo se usan las que se sabe qué dicen (la 4 habla del básquet y la 6 de la Ciudad, según la dueña;
// la 1 y la 2 acompañaban la portada y el Pueblo sin reclamos). Las demás (3, 5, 7, 8 y 9) no se usan hasta saberlo.
const PLANES = {
  largo: [
    ["gancho", [["pichanga", 60, 1], ["porristas", 300, 1], ["parkour", 60, 1], ["aventura", 60, 1]], "nueva-1"],
    ["logo", 4, "nueva-9"],
    ["pueblo", [["pueblo", 5, 9]], ["nueva-10", "original-2"]],
    ["casita", [["casita", 20, 3], ["casita", 99, 3]], "nueva-3"],
    ["renovar", [["renovar", 60, 5]], "nueva-11"],
    ["porristas", [["porristas", 0, 2], ["porristas", 150, 3], ["porristas", 285, 3]], "nueva-2"],
    ["pichanga", [["pichanga", 40, 4]], "nueva-12"],
    ["basquet", [["basquet", 40, 4]], ["nueva-13", "original-4"]],
    ["ciudad", [["ciudad", 30, 6]], ["nueva-14", "original-6"]],
    ["fabrica", [["fabrica", 20, 4]], "nueva-6"],
    ["cocina", [["cocina", 10, 2], ["cocina", 70, 1], ["cocina", 125, 1], ["cocina", 160, 1], ["cocina", 205, 2]], "nueva-4"],
    ["parkour", [["parkour", 40, 4]], "nueva-15"],
    ["aventura", [["aventura", 30, 5]], "nueva-5"],
    ["merge", [["merge", 40, 5]], "nueva-16"],
    ["extras", [["extras", 5, 1], ["extras", 44, 1], ["extras", 83, 1], ["extras", 122, 2]], "nueva-17"],
    ["final", 14, "nueva-7", "nueva-8"],
  ],
  corto: [
    ["gancho", [["pichanga", 60, 1], ["porristas", 300, 1], ["parkour", 60, 1], ["aventura", 60, 1]], "nueva-1"],
    ["logo", 4, "nueva-9"],
    ["pueblo", [["pueblo", 5, 9]], ["nueva-10", "original-2"]],
    ["casita", [["casita", 20, 2], ["casita", 99, 2]], "nueva-3"],
    ["porristas", [["porristas", 150, 3], ["porristas", 285, 3]], "nueva-2"],
    ["ciudad", [["ciudad", 30, 6]], ["nueva-14", "original-6"]],
    ["cocina", [["cocina", 10, 2], ["cocina", 125, 1], ["cocina", 205, 2]], "nueva-4"],
    ["aventura", [["aventura", 30, 4]], "nueva-5"],
    ["final", 10, "nueva-7"],
  ],
};

// ---------------------------------------------------------------- carteles (PNG del tamaño de la pantalla, fondo transparente)
const b64 = (f) => fs.readFileSync(path.join(RAIZ, f)).toString("base64");
const CSS = `
@font-face{font-family:F;src:url(data:font/woff2;base64,${b64("assets/fonts-libres/fredoka-latin-600-normal.woff2")}) format("woff2");font-weight:600}
*{box-sizing:border-box}html,body{margin:0;background:transparent;font-family:F,"Noto Color Emoji",sans-serif;font-weight:600}
:root{--cafe:#4b2e2e;--cafe2:#2f1c18;--rosa:#d4216c;--amarillo:#ffc800;--crema:#fff6e6;--lima:#cfd767}
.abs{position:absolute;left:0;right:0;display:flex;justify-content:center;align-items:center;text-align:center}
.fondo{position:absolute;inset:0;background:radial-gradient(circle at 50% 38%,#6b3f36 0%,var(--cafe) 55%,var(--cafe2) 100%)}
.patron{position:absolute;inset:0;background:url(data:image/png;base64,${b64("assets/brand/pattern-cacao-subtle.png")});opacity:.35}
.logo{background:#fff;border-radius:28px;display:flex;align-items:center;justify-content:center;box-shadow:0 10px 30px rgba(0,0,0,.45)}
.titulo{color:var(--rosa);text-shadow:0 6px 0 var(--cafe2),0 0 30px rgba(255,200,0,.35);letter-spacing:1px;line-height:1}
.pill{display:inline-flex;align-items:center;gap:.4em;background:var(--cafe);color:var(--crema);border:7px solid var(--amarillo);border-radius:999px;padding:.3em .85em .34em .6em;box-shadow:0 10px 0 var(--cafe2),0 18px 40px rgba(0,0,0,.5);line-height:1.05;white-space:nowrap}
.cta{background:var(--rosa);color:#fff;border-radius:30px;padding:.4em .85em;box-shadow:0 10px 0 #8d1247,0 18px 30px rgba(0,0,0,.35);line-height:1.1;white-space:nowrap}
.grande{color:var(--amarillo);-webkit-text-stroke:16px var(--cafe2);paint-order:stroke fill;text-shadow:0 14px 0 var(--cafe2),0 0 60px rgba(0,0,0,.5);line-height:1;transform:rotate(-5deg)}
`;
const logo = (w) => `<div class="logo" style="width:${w}px;height:${Math.round(w * 0.6)}px"><img src="data:image/png;base64,${b64("assets/brand/logo-horizontal.png")}" style="width:${Math.round(w * 0.88)}px"></div>`;
const fondo = `<div class="fondo"></div><div class="patron"></div>`;

function carteles() {
  const c = {};
  // marco fijo: arriba el logo y el nombre; la sombra de la ventana (el juego se pone encima)
  c.fondo = `${fondo}<div class="abs" style="top:52px;gap:34px">${logo(250)}<div class="titulo" style="font-size:132px">Matijuego</div></div>
    <div style="position:absolute;left:${WIN.x}px;top:${WIN.y + 14}px;width:${WIN.w}px;height:${WIN.h}px;border-radius:44px;background:rgba(0,0,0,.45);filter:blur(14px)"></div>`;
  c.aro = `<div style="position:absolute;left:${WIN.x - 10}px;top:${WIN.y - 10}px;width:${WIN.w + 20}px;height:${WIN.h + 20}px;border:12px solid var(--amarillo);border-radius:50px"></div>`;
  c.invitacion = `<div class="abs" style="top:1500px;flex-direction:column;gap:30px">
    <div class="cta" style="font-size:60px">🎮 ¡Ven a jugar con nosotros!</div>
    <div style="color:var(--amarillo);font-size:50px">matichoc.cl/matijuego</div>
    <div style="color:var(--crema);font-size:36px;opacity:.9">Gratis · sin anuncios · para niñas y niños</div></div>`;
  for (const [id, txt] of Object.entries(CARTEL)) {
    const [e, ...r] = txt.split(" ");
    c[`cartel-${id}`] = `<div class="abs" style="top:${CAP_Y - 80}px;height:160px"><span class="pill" style="font-size:58px"><span style="font-size:1.15em">${e}</span>${r.join(" ")}</span></div>`;
  }
  GANCHO.forEach((p, k) => {
    c[`gancho-${k}`] = `<div class="abs grande" style="top:${WIN.y + WIN.h / 2 - 150}px;height:300px;font-size:${p.length > 6 ? 196 : 230}px${k === 3 ? ";color:var(--rosa);-webkit-text-stroke-color:#fff" : ""}">${p}</div>`;
  });
  c.logo = `${fondo}<div class="abs" style="top:0;bottom:0;flex-direction:column;gap:46px">${logo(640)}
    <div class="titulo" style="font-size:200px">Matijuego</div><div style="color:var(--lima);font-size:70px">¡los juegos de Matichoc!</div></div>`;
  // cierre: velo café sobre el juego desenfocado y las frases que van apareciendo
  c.velo = `<div style="position:absolute;inset:0;background:radial-gradient(circle at 50% 40%,rgba(107,63,54,.78),rgba(47,28,24,.92))"></div>
    <div class="abs" style="top:200px;flex-direction:column;gap:36px">${logo(470)}<div class="titulo" style="font-size:150px">Matijuego</div></div>`;
  const lineas = [
    [760, `<div style="color:var(--crema);font-size:94px;line-height:1.05;text-shadow:0 6px 0 var(--cafe2)">¡Ven a jugar<br>con nosotros!</div>`],
    [1010, `<div style="color:var(--lima);font-size:58px;line-height:1.15">y sé parte de la historia<br>de Matichoc 🍫</div>`],
    [1200, `<div style="color:var(--crema);font-size:42px;opacity:.95">Gratis · sin anuncios · para niñas y niños</div>`],
    [1330, `<div class="cta" style="font-size:62px">🙋 ¿Tienes Android? ¡Sé tester!</div>`],
    [1520, `<div style="color:var(--amarillo);font-size:66px">matichoc.cl/matijuego</div>`],
  ];
  lineas.forEach(([top, html], k) => (c[`final-${k}`] = `<div class="abs" style="top:${top}px">${html}</div>`));
  c.mascara = null; // se dibuja aparte (es del tamaño de la ventana)
  return c;
}

async function dibujarCarteles() {
  const { chromium } = require("playwright");
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium" });
  const foto = async (nombre, w, h, cuerpo, transparente = true) => {
    const p = await (await b.newContext({ viewport: { width: w, height: h } })).newPage();
    await p.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body style="width:${w}px;height:${h}px;position:relative;overflow:hidden">${cuerpo}</body></html>`);
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(120);
    await p.screenshot({ path: path.join(TMP, `${nombre}.png`), omitBackground: transparente });
    await p.close();
  };
  for (const [nombre, cuerpo] of Object.entries(carteles())) if (cuerpo) await foto(nombre, W, H, cuerpo, !["fondo", "logo"].includes(nombre));
  await foto("mascara", WIN.w, WIN.h, `<div style="position:absolute;inset:0;background:#000"></div><div style="position:absolute;inset:0;border-radius:40px;background:#fff"></div>`, false);
  await b.close();
}

// ---------------------------------------------------------------- video
const ff = (args) => execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...args], { stdio: "inherit" });
const png = (n) => path.join(TMP, `${n}.png`);
const CODEC = ["-c:v", "libx264", "-preset", "medium", "-crf", "19", "-pix_fmt", "yuv420p", "-r", String(FPS)];
const cuadros = (dir) => fs.readdirSync(path.join(OUT, "cuadros", dir)).filter((f) => f.endsWith(".jpg")).length;

/** Parte de la ventana: recorte, acercamiento de golpe que se va soltando y un destello blanco al entrar. */
function filtroVentana(dir, n, flash) {
  const R = RECORTE[dir] || {};
  const s2 = `${WIN.w * 2}:${WIN.h * 2}`;
  const zoom = `zoompan=z='1+0.035*on/${n}+0.16*exp(-on/3.2)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=${WIN.w}x${WIN.h}:fps=${FPS}`;
  let f;
  if (R.caja) {
    const { x, y, w, h } = R.caja;
    const ch = 1080, cw = Math.round((ch * WIN.w) / WIN.h);
    f = `[0]split[a][b];[a]crop=${cw}:${ch}:${x + w / 2 - cw / 2}:0,scale=${s2},boxblur=30:2,eq=brightness=-0.08[fb];` +
      `[b]crop=${w}:${h}:${x}:${y},scale=${WIN.w * 2}:-2[fc];[fb][fc]overlay=(W-w)/2:(H-h)/2`;
  } else {
    // por omisión deja fuera la barra de arriba del juego (los primeros 80 px)
    const h = R.h || 1000, w = Math.round((h * WIN.w) / WIN.h);
    const cx = Math.min(1920 - w / 2, Math.max(w / 2, R.cx ?? 960)), cy = Math.min(1080 - h / 2, Math.max(h / 2, R.cy ?? 580));
    f = `[0]crop=${w}:${h}:${Math.round(cx - w / 2)}:${Math.round(cy - h / 2)},scale=${s2}`;
  }
  return `${f},${zoom}${flash ? ",fade=t=in:st=0:d=0.18:color=white" : ""},format=yuv420p[v];[2]format=gray[m];[v][m]alphamerge[vm]`;
}

/** Una toma con el marco: entradas 0 cuadros, 1 fondo, 2 máscara, 3 aro, 4 invitación, 5 cartel o palabra. */
function toma(salida, dir, desde, n, t0, extra) {
  const total = cuadros(dir);
  if (desde + n > total) desde = Math.max(0, total - n);
  const ent = ["-framerate", String(FPS), "-start_number", String(desde), "-i", path.join(OUT, "cuadros", dir, "c%05d.jpg")];
  for (const p of ["fondo", "mascara", "aro", "invitacion"]) ent.push("-loop", "1", "-framerate", String(FPS), "-i", png(p));
  let f = `${filtroVentana(dir, n, t0 > 0)};[1][vm]overlay=${WIN.x}:${WIN.y}[a];[a][3]overlay[b];` +
    // la invitación da un saltito en cada tiempo de la música
    `[b][4]overlay=x=0:y='-14*exp(-9*mod(t+${t0.toFixed(3)},${BEAT.toFixed(5)}))'`;
  if (extra) {
    ent.push("-loop", "1", "-framerate", String(FPS), "-i", png(extra.png));
    f += `[c];[c][5]overlay=x='${extra.x}':y='${extra.y}'`;
  }
  ff([...ent, "-filter_complex", `${f},tpad=stop_mode=clone:stop_duration=2,format=yuv420p`, "-frames:v", String(n), ...CODEC, "-an", salida]);
}

/** Imagen fija (logo) con golpe de acercamiento y un pulso en cada tiempo. */
function tarjetaLogo(salida, n) {
  const bf = (BEAT * FPS).toFixed(3);
  ff(["-loop", "1", "-framerate", String(FPS), "-i", png("logo"), "-filter_complex",
    `[0]scale=${W * 2}:${H * 2},zoompan=z='1+0.22*exp(-on/4)+0.025*exp(-mod(on,${bf})/3)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=${W}x${H}:fps=${FPS},fade=t=in:st=0:d=0.15:color=white,format=yuv420p`,
    "-frames:v", String(n), ...CODEC, "-an", salida]);
}

/** Cierre: juegos pasando desenfocados detrás del velo y las frases entrando una por una en los tiempos. */
function tarjetaFinal(salida, n) {
  const dir = "extras";
  const ent = ["-stream_loop", "-1", "-framerate", String(FPS), "-i", path.join(OUT, "cuadros", dir, "c%05d.jpg"), "-loop", "1", "-framerate", String(FPS), "-i", png("velo")];
  const entra = [0, 1.5, 3, 4.5, 6]; // en tiempos de la música
  let f = `[0]crop=608:1080:656:0,scale=${W}:${H},boxblur=22:2[b];[b][1]overlay[s0]`;
  entra.forEach((b, k) => {
    ent.push("-loop", "1", "-framerate", String(FPS), "-i", png(`final-${k}`));
    const st = (b * BEAT).toFixed(3);
    f += `;[${k + 2}]format=rgba,fade=t=in:st=${st}:d=0.18:alpha=1[l${k}];[s${k}][l${k}]overlay=x=0:y='if(gte(t,${st}),110*exp(-11*(t-${st}))*cos(13*(t-${st})),0)'[s${k + 1}]`;
  });
  f += `;[s${entra.length}]fade=t=in:st=0:d=0.15:color=white,fade=t=out:st=${(n / FPS - 0.35).toFixed(3)}:d=0.35,format=yuv420p`;
  ff([...ent, "-filter_complex", f, "-frames:v", String(n), ...CODEC, "-an", salida]);
}

function montar() {
  const plan = PLANES[VERSION];
  if (!plan) throw new Error(`versión desconocida: ${VERSION}`);
  const partes = [];
  const voces = [];
  let beat = 0;
  let libre = 0; // cuándo termina la última voz: dos voces nunca se pisan
  const cuadro = (b) => Math.round(b * BEAT * FPS);
  const existe = (v) => fs.existsSync(path.join(OUT, "voces", `${v}.wav`));
  const largoVoz = (v) => Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path.join(OUT, "voces", `${v}.wav`)]).toString());
  for (const [id, tomas, ...vs] of plan) {
    const t0 = beat * BEAT;
    // voces de la escena (la primera alternativa que exista), una detrás de otra; la escena se alarga, en tiempos
    // enteros de la música, hasta que termine de hablar (menos el gancho, que son cuatro golpes justos)
    let fin = t0;
    for (const [k, alt] of vs.entries()) {
      if (!alt) continue;
      const v = [].concat(alt).find(existe);
      if (!v) { voces.push([alt, 0]); continue; } // queda anotada como faltante
      const ini = Math.max(t0 + (id === "logo" || id === "final" ? 0.12 : 0.15), libre + (k ? 0.3 : 0.15));
      voces.push([v, ini]);
      libre = ini + largoVoz(v);
      fin = Math.max(fin, libre + 0.2);
    }
    const base = typeof tomas === "number" ? tomas : tomas.reduce((a, t) => a + t[2], 0);
    const mas = id === "gancho" ? 0 : Math.max(0, Math.ceil((fin - t0) / BEAT - 1e-6) - base);
    if (id === "logo" || id === "final") {
      const total = tomas + mas;
      const n = cuadro(beat + total) - cuadro(beat);
      const sal = path.join(TMP, `p${String(partes.length).padStart(2, "0")}-${id}.mp4`);
      (id === "logo" ? tarjetaLogo : tarjetaFinal)(sal, n);
      partes.push(sal);
      beat += total;
      continue;
    }
    let off = 0;
    tomas.forEach(([dir, desde, b], k) => {
      if (k === tomas.length - 1) b += mas; // la última toma dura lo que falte para que termine la voz
      const n = cuadro(beat + b) - cuadro(beat);
      const sal = path.join(TMP, `p${String(partes.length).padStart(2, "0")}-${id}-${k}.mp4`);
      let extra = null;
      if (id === "gancho") {
        // palabra gigante que cae desde arriba con rebote
        extra = { png: `gancho-${k}`, x: "0", y: "-260*exp(-13*t)*cos(15*t)" };
      } else if (CARTEL[id]) {
        // el cartel entra deslizándose (izquierda o derecha, alternando) y rebota; en las tomas siguientes ya está quieto
        const lado = partes.length % 2 ? 1 : -1;
        const T = `(t+${off.toFixed(3)})`;
        extra = { png: `cartel-${id}`, x: `${lado * 1100}*exp(-9*${T})*cos(10*${T})`, y: "0" };
      }
      toma(sal, dir, desde, n, beat * BEAT, extra);
      partes.push(sal);
      off += n / FPS;
      beat += b;
    });
  }
  const dur = beat * BEAT;
  console.log(`${VERSION}: ${beat} tiempos = ${dur.toFixed(1)} s, ${partes.length} partes`);

  // pista de video sin pérdida al juntar (todas las partes tienen el mismo formato)
  const lista = path.join(TMP, "lista.txt");
  fs.writeFileSync(lista, partes.map((p) => `file '${p}'`).join("\n"));
  const video = path.join(TMP, `video-${VERSION}.mp4`);
  ff(["-f", "concat", "-safe", "0", "-i", lista, "-c", "copy", video]);

  // música a la medida y voces encima: la música baja sola cuando alguien habla
  const musica = path.join(TMP, `musica-${VERSION}.wav`);
  execFileSync("node", [path.join(__dirname, "musica.cjs"), musica, (dur + 0.05).toFixed(3)], { stdio: "inherit" });
  const presentes = voces.filter(([v]) => typeof v === "string" && existe(v));
  const faltan = voces.filter(([v]) => !(typeof v === "string" && existe(v))).map(([v]) => [].concat(v)[0]);
  if (faltan.length) console.log("voces que faltan (van solo con cartel):", faltan.join(", "));
  const ent = ["-i", video, "-i", musica];
  let f = "";
  presentes.forEach(([v, t], k) => {
    ent.push("-i", path.join(OUT, "voces", `${v}.wav`));
    const ms = Math.round(t * 1000);
    f += `[${k + 2}]aformat=sample_rates=44100:channel_layouts=stereo,adelay=${ms}|${ms},volume=1.5[v${k}];`;
  });
  const salida = path.join(OUT, `matijuego-dinamico-${VERSION}.mp4`);
  if (presentes.length) {
    f += `${presentes.map((_, k) => `[v${k}]`).join("")}amix=inputs=${presentes.length}:normalize=0:duration=longest,apad[voz];[voz]asplit[vz1][vz2];` +
      `[1]volume=0.8[m];[m][vz1]sidechaincompress=threshold=0.02:ratio=6:attack=15:release=350[mb];` +
      `[mb][vz2]amix=inputs=2:normalize=0:duration=first,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=44100[aud]`;
  } else {
    f += `[1]loudnorm=I=-14:TP=-1.5:LRA=11,aresample=44100[aud]`;
  }
  ff([...ent, "-filter_complex", f, "-map", "0:v", "-map", "[aud]", "-c:v", "copy", "-c:a", "aac", "-b:a", "160k", "-t", dur.toFixed(3), "-movflags", "+faststart", salida]);
  console.log(`${salida}: ${(fs.statSync(salida).size / 1e6).toFixed(1)} MB`);
}

(async () => {
  fs.mkdirSync(TMP, { recursive: true });
  if (process.argv.includes("--guion")) {
    for (const [k, [txt, s]] of Object.entries(GUION)) console.log(`nueva-${k}.wav (~${s} s): ${txt}`);
    return;
  }
  if (!process.argv.includes("--sin-carteles") || !fs.existsSync(png("fondo"))) await dibujarCarteles();
  if (!process.argv.includes("--solo-carteles")) montar();
})();
