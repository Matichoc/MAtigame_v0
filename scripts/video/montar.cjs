// Arma el video promocional con ffmpeg a partir de los cuadros grabados (grabar.cjs) y los carteles (carteles.cjs):
// portada → escenas con su título → cierre con la invitación a ser tester, con fundidos entre una y otra.
// Saca dos versiones: horizontal 1920×1080 (YouTube, Play Store, web) y vertical 1080×1920 (Reels, TikTok, Shorts, estados).
// Uso: node scripts/video/montar.cjs <salida> [escena,escena...]
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const OUT = path.resolve(process.argv[2] || "video");
const ORDEN = (process.argv[3] || "pueblo,renovar,pichanga,ciudad,basquet,parkour,merge,extras").split(",");
const FPS = 30;
const FUNDIDO = 0.35;
const PORTADA = 2.4;
const CIERRE = 4.2;
// ventana del video en la versión vertical (entre el título de arriba y la invitación de abajo)
const VW = 1080, VH = 748, VY = 770;

const escenas = ORDEN.filter((id) => fs.existsSync(path.join(OUT, "cuadros", id, "c00000.jpg")) && fs.readdirSync(path.join(OUT, "cuadros", id)).length > 10);
const dur = (id) => fs.readdirSync(path.join(OUT, "cuadros", id)).length / FPS;

function montar(vertical) {
  const C = (n) => path.join(OUT, "carteles", `${vertical ? "v" : "h"}-${n}.png`);
  const [W, H] = vertical ? [1080, 1920] : [1920, 1080];
  const ent = [];
  const filtros = [];
  const durs = [];
  // portada y cierre: imagen fija con un acercamiento suave
  const fija = (png, seg, et) => {
    ent.push("-loop", "1", "-framerate", String(FPS), "-t", String(seg), "-i", png);
    const i = ent.filter((x) => x === "-i").length - 1;
    filtros.push(`[${i}]scale=${W * 2}:${H * 2},zoompan=z='1+0.04*on/${Math.round(seg * FPS)}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=${W}x${H}:fps=${FPS},format=yuv420p,setsar=1[${et}]`);
    durs.push(seg);
  };
  fija(C("portada"), PORTADA, "s0");
  escenas.forEach((id, k) => {
    ent.push("-framerate", String(FPS), "-i", path.join(OUT, "cuadros", id, "c%05d.jpg"));
    const iv = ent.filter((x) => x === "-i").length - 1;
    ent.push("-loop", "1", "-framerate", String(FPS), "-t", String(dur(id)), "-i", C(id));
    const ic = iv + 1;
    const et = `s${k + 1}`;
    if (vertical) {
      filtros.push(`[${iv}]crop=1560:1080:(iw-1560)/2:0,scale=${VW}:${VH},setsar=1[v${k}]`);
      filtros.push(`[${ic}][v${k}]overlay=0:${VY}:shortest=1,drawbox=x=0:y=${VY - 8}:w=${VW}:h=8:color=0xffc800:t=fill,drawbox=x=0:y=${VY + VH}:w=${VW}:h=8:color=0xffc800:t=fill,format=yuv420p,setsar=1[${et}]`);
    } else {
      filtros.push(`[${ic}]format=rgba,fade=t=in:st=0.25:d=0.35:alpha=1[t${k}]`);
      filtros.push(`[${iv}]setsar=1[v${k}];[v${k}][t${k}]overlay=0:0:shortest=1,format=yuv420p,setsar=1[${et}]`);
    }
    durs.push(dur(id));
  });
  fija(C("cierre"), CIERRE, `s${escenas.length + 1}`);
  // fundidos encadenados
  let prev = "s0";
  let t = durs[0];
  for (let k = 1; k < durs.length; k++) {
    const sal = k === durs.length - 1 ? "vid" : `x${k}`;
    filtros.push(`[${prev}][s${k}]xfade=transition=${k === durs.length - 1 ? "fadeblack" : "fade"}:duration=${FUNDIDO}:offset=${(t - FUNDIDO).toFixed(3)}[${sal}]`);
    t += durs[k] - FUNDIDO;
    prev = sal;
  }
  const archivo = path.join(OUT, `matijuego-${vertical ? "vertical" : "horizontal"}.mp4`);
  // pista de audio en silencio (algunas redes no aceptan videos sin audio); la música se agrega en la app de cada red
  ent.push("-f", "lavfi", "-t", t.toFixed(3), "-i", "anullsrc=r=44100:cl=stereo");
  const ia = ent.filter((x) => x === "-i").length - 1;
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...ent, "-filter_complex", filtros.join(";"), "-map", "[vid]", "-map", `${ia}:a`,
    "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p", "-r", String(FPS), "-c:a", "aac", "-b:a", "96k", "-shortest", "-movflags", "+faststart", archivo], { stdio: "inherit" });
  console.log(`${archivo}: ${t.toFixed(1)} s, ${(fs.statSync(archivo).size / 1e6).toFixed(1)} MB`);
}

if (!escenas.length) { console.error("No hay cuadros grabados en", path.join(OUT, "cuadros")); process.exit(1); }
console.log("escenas:", escenas.join(", "));
montar(false);
montar(true);
