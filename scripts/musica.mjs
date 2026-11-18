// Prepara las canciones de Suno para el juego (ver docs/MUSICA-SUNO.md).
// Toma los WAV/MP3 de una carpeta (menu, pueblo, deportes, aventura, cocina) y deja en assets/music/<nombre>.m4a:
//   - sin silencio al principio ni al final;
//   - con el final fundido sobre el principio, para que al repetirse no se note el salto;
//   - con el volumen parejo (−18 LUFS) y en AAC de 96 kbps (~0,7 MB por minuto).
// Después actualiza la lista SONG_FILES de js/audio.js con las canciones que quedaron.
// Uso: node scripts/musica.mjs <carpeta-con-las-canciones>   (necesita ffmpeg y ffprobe)
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const NOMBRES = ["menu", "pueblo", "deportes", "aventura", "cocina"];
const CRUCE = 2.5; // segundos del final que se funden sobre el principio
const ent = resolve(process.argv[2] || "");
if (!process.argv[2] || !existsSync(ent)) {
  console.error("Uso: node scripts/musica.mjs <carpeta-con-las-canciones>");
  process.exit(1);
}
const OUT = "assets/music";
mkdirSync(OUT, { recursive: true });

const archivos = readdirSync(ent);
const hechas = [];
for (const nombre of NOMBRES) {
  const f = archivos.find((a) => a.toLowerCase().replace(/\.(wav|mp3|m4a|flac)$/, "") === nombre);
  if (!f) { console.log(`- ${nombre}: no está (sigue la música generada)`); continue; }
  const src = join(ent, f);
  // 1) sin silencios en los bordes y con el volumen parejo, a un WAV temporal
  const tmp = join(OUT, `_${nombre}.wav`);
  execFileSync("ffmpeg", ["-v", "error", "-y", "-i", src, "-af",
    "silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse,loudnorm=I=-18:TP=-1.5:LRA=11",
    "-ar", "44100", "-ac", "2", tmp]);
  const dur = parseFloat(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", tmp]).toString());
  if (!(dur > CRUCE * 4)) { console.log(`- ${nombre}: muy corta (${dur.toFixed(1)} s), se omite`); continue; }
  // 2) bucle sin salto: [principio con fundido de entrada + final con fundido de salida] mezclados al final del cuerpo
  const fin = (dur - CRUCE).toFixed(3);
  const dst = join(OUT, `${nombre}.m4a`);
  execFileSync("ffmpeg", ["-v", "error", "-y", "-i", tmp, "-filter_complex",
    `[0]atrim=0:${CRUCE},asetpts=PTS-STARTPTS,afade=t=in:d=${CRUCE}[h];` +
    `[0]atrim=${CRUCE}:${fin},asetpts=PTS-STARTPTS[b];` +
    `[0]atrim=${fin},asetpts=PTS-STARTPTS,afade=t=out:d=${CRUCE}[t];` +
    `[h][t]amix=inputs=2:normalize=0[x];[b][x]concat=n=2:v=0:a=1[o]`,
    "-map", "[o]", "-c:a", "aac", "-b:a", "96k", "-movflags", "+faststart", dst]);
  rmSync(tmp, { force: true });
  const mb = statSync(dst).size / 1e6;
  console.log(`✓ ${nombre}: ${(dur - CRUCE).toFixed(1)} s en bucle, ${mb.toFixed(2)} MB → ${dst}`);
  hechas.push(nombre);
}

// 3) la lista de canciones que el juego usa
const p = "js/audio.js";
const js = readFileSync(p, "utf8");
const todas = NOMBRES.filter((n) => existsSync(join(OUT, `${n}.m4a`)));
const nuevo = js.replace(/const SONG_FILES = new Set\(\[[^\]]*\]\);/, `const SONG_FILES = new Set([${todas.map((n) => `"${n}"`).join(", ")}]);`);
if (nuevo === js && !js.includes(`new Set([${todas.map((n) => `"${n}"`).join(", ")}])`)) {
  console.error("No encontré SONG_FILES en js/audio.js");
  process.exit(1);
}
writeFileSync(p, nuevo);
console.log(`SONG_FILES = [${todas.join(", ")}] (${hechas.length} procesadas ahora)`);
