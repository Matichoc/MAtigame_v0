// Música del video promocional, hecha con código (sin derechos de autor de nadie): 124 tiempos por minuto, alegre y con
// empuje, en do mayor (do, sol, la menor, fa). Bombo en cada tiempo, aplausos en el 2 y el 4, platillos, bajo, acordes y
// una melodía pegajosa. Tiene una entrada que va subiendo, un cuerpo con todo y un final con un golpe.
// Uso: node scripts/video/musica.cjs <salida.wav> <segundos>
const fs = require("fs");

const OUT = process.argv[2] || "musica.wav";
const SEG = Number(process.argv[3] || 45);
const SR = 44100;
const BPM = 124;
const BEAT = 60 / BPM;
const N = Math.ceil(SEG * SR);
const L = new Float32Array(N);
const R = new Float32Array(N);

const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);
let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;

/** Suma una nota: forma de onda, volumen, paneo (-1 izquierda, 1 derecha) y envolvente simple (ataque y caída). */
function nota(t0, dur, f, { onda = "tri", vol = 0.2, pan = 0, ataque = 0.005, caida = null, vib = 0 } = {}) {
  const i0 = Math.floor(t0 * SR);
  const n = Math.floor(dur * SR);
  const cd = caida ?? dur;
  let fase = 0;
  for (let i = 0; i < n && i0 + i < N; i++) {
    const t = i / SR;
    const ff = f * (1 + vib * Math.sin(2 * Math.PI * 5.5 * t));
    fase += ff / SR;
    const p = fase % 1;
    let v = onda === "sq" ? (p < 0.5 ? 1 : -1) * 0.6 : onda === "saw" ? (2 * p - 1) * 0.7 : onda === "sin" ? Math.sin(2 * Math.PI * p) : 1 - 4 * Math.abs(p - 0.5);
    const env = Math.min(1, t / ataque) * Math.exp((-3 * t) / cd) * (i > n - 200 ? (n - i) / 200 : 1);
    v *= vol * env;
    L[i0 + i] += v * (1 - Math.max(0, pan));
    R[i0 + i] += v * (1 + Math.min(0, pan));
  }
}

function bombo(t0, vol = 0.9) {
  const i0 = Math.floor(t0 * SR);
  let fase = 0;
  for (let i = 0; i < 0.32 * SR && i0 + i < N; i++) {
    const t = i / SR;
    fase += (50 + 110 * Math.exp(-t * 30)) / SR;
    const v = Math.sin(2 * Math.PI * fase) * Math.exp(-t * 9) * vol;
    L[i0 + i] += v; R[i0 + i] += v;
  }
}

/** Ruido filtrado: aplausos (medio) y platillos (agudo). */
function ruido(t0, dur, vol, agudo, pan = 0) {
  const i0 = Math.floor(t0 * SR);
  let prev = 0, lp = 0;
  for (let i = 0; i < dur * SR && i0 + i < N; i++) {
    const t = i / SR;
    const x = rnd();
    const hp = x - prev; prev = x; // agudos
    lp += (x - lp) * 0.35; // medios
    const v = (agudo ? hp : lp - hp * 0.2) * vol * Math.exp((-t * (agudo ? 38 : 16)));
    L[i0 + i] += v * (1 - Math.max(0, pan));
    R[i0 + i] += v * (1 + Math.min(0, pan));
  }
}

const PROG = [[0, 4, 7], [7, 11, 14], [9, 12, 16], [5, 9, 12]]; // do, sol, la menor, fa (desde do4 = 60)
const MELODIA = [12, 16, 19, 16, 21, 19, 16, 14, 12, 14, 16, 19, 16, 14, 12, -1, 19, 21, 24, 21, 19, 16, 19, 21, 24, 21, 19, 16, 14, 16, 12, -1];

const totalBeats = Math.floor(SEG / BEAT);
const ENTRADA = 8; // 2 compases que van subiendo
const FINAL = totalBeats - 2;
for (let b = 0; b < totalBeats; b++) {
  const t = b * BEAT;
  const bar = Math.floor(b / 4);
  const acorde = PROG[bar % 4];
  const lleno = b >= ENTRADA && b < FINAL;
  if (b >= FINAL) {
    if (b === FINAL) { bombo(t, 1); ruido(t, 1.2, 0.35, true); for (const n of acorde) nota(t, 1.8, midi(60 + n), { onda: "saw", vol: 0.09, caida: 0.8 }); }
    continue;
  }
  // entrada: aplausos y platillos que se aceleran, el bombo entra en el último compás
  if (!lleno) {
    ruido(t, 0.12, 0.25, false);
    if (b >= 4) { bombo(t, 0.7); ruido(t + BEAT / 2, 0.08, 0.2, false); }
    if (b === ENTRADA - 1) for (let k = 0; k < 4; k++) ruido(t + (k * BEAT) / 4, 0.06, 0.18, false);
    nota(t, BEAT * 0.9, midi(48 + acorde[0]), { onda: "tri", vol: 0.22, caida: 0.3 });
    continue;
  }
  bombo(t);
  if (b % 2 === 1) ruido(t, 0.18, 0.32, false, 0.1);
  for (let k = 0; k < 2; k++) ruido(t + (k * BEAT) / 2 + BEAT / 4, 0.05, 0.12, true, k ? 0.4 : -0.4);
  // bajo saltarín (corcheas)
  for (let k = 0; k < 2; k++) nota(t + (k * BEAT) / 2, BEAT / 2 * 0.9, midi(36 + acorde[0] + (k ? 12 : 0)), { onda: "saw", vol: 0.18, caida: 0.12 });
  // acordes en el contratiempo
  for (const n of acorde) nota(t + BEAT / 2, BEAT * 0.4, midi(60 + n), { onda: "tri", vol: 0.055, caida: 0.15, pan: n % 2 ? 0.3 : -0.3 });
  // melodía (2 notas por tiempo)
  for (let k = 0; k < 2; k++) {
    const m = MELODIA[((b - ENTRADA) * 2 + k) % MELODIA.length];
    if (m >= 0) nota(t + (k * BEAT) / 2, BEAT / 2 * 0.95, midi(60 + m), { onda: "sq", vol: 0.07, caida: 0.2, vib: 0.004 });
  }
}

// limitador suave y escritura WAV (16 bits, estéreo)
const buf = Buffer.alloc(44 + N * 4);
buf.write("RIFF", 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write("WAVE", 8); buf.write("fmt ", 12);
buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24);
buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write("data", 36); buf.writeUInt32LE(N * 4, 40);
const sat = (x) => Math.tanh(x * 1.1) * 0.9;
for (let i = 0; i < N; i++) {
  buf.writeInt16LE(Math.round(sat(L[i]) * 32767), 44 + i * 4);
  buf.writeInt16LE(Math.round(sat(R[i]) * 32767), 46 + i * 4);
}
fs.writeFileSync(OUT, buf);
console.log(`música: ${OUT} (${SEG} s, ${BPM} tiempos por minuto)`);
