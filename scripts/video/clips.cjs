// Clips "jugando en vivo" de ~20 s, sin textos ni voz, para usar de fondo en videos donde la dueña pone su voz encima.
// Cada clip junta una o más escenas de grabar.cjs (alargadas con OPC.estirar) con fundidos cortos, y sale en 1920×1080
// con una pista de audio en silencio en <salida>/clips/NN-nombre.mp4.
// Uso: NODE_PATH=... node scripts/video/clips.cjs <url-base> <salida> [clip,clip...] [--montar]
//   En Windows, con la tarjeta gráfica: CHROMIUM_PATH=<ruta a msedge.exe o chrome.exe> VIDEO_GPU=1
//   (la url-base debe servir la app armada: node scripts/build.mjs app → app-www/)
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { abrir, ESCENAS, OPC, FPS, OUT, SOLO } = require("./grabar.cjs");

const FUNDIDO = 0.4;
const MAX = 21; // segundos como máximo por clip

// [nombre del archivo, [[escena, estirar, metaPorristas?, corte?], ...]]  (corte: segundos que se usan de esa escena)
const CLIPS = [
  ["01-futbol-pichanga", [["pichanga", 4]]],
  ["02-basquet-2v2", [["basquet", 4]]],
  ["03-porristas-piramide", [["porristas", 2, 2]]],
  // el piloto del parkour se cae o se queda pegado pasados los ~6 s: se usa solo el comienzo y sigue la Aventura
  ["04-parkour-y-aventura", [["parkour", 1.4, null, 5.5], ["aventura", 2.9]]],
  ["05-ciudad-auto-y-fabrica", [["ciudad", 2.4], ["fabrica", 2.7]]],
  ["06-pueblo-casita-y-estrellas", [["pueblo", 1.5], ["casita", 1], ["renovar", 1]]],
  // sin la escena "extras": sus cortes de 1,3 s caían en pantallas de "¡Se cayó!", menús o piezas quietas
  ["07-merge-cocina-y-autos", [["merge", 1], ["cocina", 1], ["autos", 1.2]]],
];

const cuadros = (id) => {
  const dir = path.join(OUT, "cuadros", id);
  return fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith(".jpg")).length : 0;
};

async function grabarEscena(id, estirar, meta) {
  OPC.estirar = estirar;
  OPC.metaPorristas = meta || 1;
  // a veces la página no termina de cargar el menú al arrancar: se reintenta hasta 3 veces
  for (let intento = 1; ; intento++) {
    const t0 = Date.now();
    const { b, p, errores } = await abrir();
    try {
      await ESCENAS[id](p);
      console.log(`  ${id}: ${(cuadros(id) / FPS).toFixed(1)} s grabados en ${Math.round((Date.now() - t0) / 1000)} s${errores.length ? ` (errores de página: ${errores.join(" | ")})` : ""}`);
      return;
    } catch (e) {
      if (intento >= 3) throw e;
      console.log(`  ${id}: intento ${intento} falló (${e.message.split("\n")[0]}), reintentando`);
    } finally {
      await b.close();
    }
  }
}

function montar(nombre, escenas) {
  const ids = escenas.map(([id]) => id);
  const ent = [], filtros = [], durs = [];
  escenas.forEach(([id, , , corte], k) => {
    const d = Math.min(cuadros(id) / FPS, corte || Infinity);
    ent.push("-framerate", String(FPS), "-t", d.toFixed(3), "-i", path.join(OUT, "cuadros", id, "c%05d.jpg"));
    filtros.push(`[${k}]scale=1920:1080,setsar=1,format=yuv420p[s${k}]`);
    durs.push(d);
  });
  let prev = "s0", t = durs[0];
  for (let k = 1; k < ids.length; k++) {
    filtros.push(`[${prev}][s${k}]xfade=transition=fade:duration=${FUNDIDO}:offset=${(t - FUNDIDO).toFixed(3)}[x${k}]`);
    t += durs[k] - FUNDIDO;
    prev = `x${k}`;
  }
  const largo = Math.min(t, MAX);
  ent.push("-f", "lavfi", "-t", largo.toFixed(3), "-i", "anullsrc=r=44100:cl=stereo");
  fs.mkdirSync(path.join(OUT, "clips"), { recursive: true });
  const archivo = path.join(OUT, "clips", `${nombre}.mp4`);
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...ent, "-filter_complex", filtros.join(";"), "-map", `[${prev}]`, "-map", `${ids.length}:a`,
    "-t", largo.toFixed(3), "-c:v", "libx264", "-preset", "medium", "-crf", "19", "-pix_fmt", "yuv420p", "-r", String(FPS),
    "-c:a", "aac", "-b:a", "96k", "-movflags", "+faststart", archivo], { stdio: "inherit" });
  console.log(`${archivo}: ${largo.toFixed(1)} s, ${(fs.statSync(archivo).size / 1e6).toFixed(1)} MB`);
}

module.exports = { CLIPS };

if (require.main === module) (async () => {
  const lista = CLIPS.filter(([n]) => !SOLO.length || SOLO.some((s) => n.includes(s)));
  let mal = 0;
  for (const [nombre, escenas] of lista) {
    console.log(nombre);
    try {
      // --montar: no graba, solo vuelve a armar el clip con los cuadros que ya están
      for (const [id, estirar, meta] of escenas) if (!process.argv.includes("--montar") || !cuadros(id)) await grabarEscena(id, estirar, meta);
      montar(nombre, escenas);
    } catch (e) {
      mal++;
      console.error(`${nombre}: falló`, e.message);
    }
  }
  process.exit(mal ? 1 : 0);
})();
