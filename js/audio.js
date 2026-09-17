// Efectos de sonido generados con Web Audio API (sin archivos externos).

let ctx = null;
let muted = false;

function getCtx() {
  if (!ctx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    ctx = new AudioCtx();
  }
  return ctx;
}

function tone(freq, duration, type = "sine", startGain = 0.18, delay = 0) {
  if (muted) return;
  const audio = getCtx();
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = startGain;
  osc.connect(gain);
  gain.connect(audio.destination);
  const t0 = audio.currentTime + delay;
  osc.start(t0);
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);
  osc.stop(t0 + duration + 0.02);
}

export function setMuted(value) {
  muted = value;
}

export function isMuted() {
  return muted;
}

export function playCollect() {
  tone(880, 0.09, "triangle");
  tone(1320, 0.09, "triangle", 0.12, 0.05);
}

export function playMissionComplete() {
  [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.22, "square", 0.14, i * 0.1));
}

export function playLose() {
  tone(220, 0.35, "sawtooth", 0.16);
  tone(160, 0.4, "sawtooth", 0.14, 0.15);
}

export function playVictory() {
  [523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, 0.3, "square", 0.14, i * 0.12));
}

export function playBump() {
  tone(120, 0.08, "square", 0.1);
}

export function playBounce() {
  tone(300, 0.06, "sine", 0.16);
  tone(520, 0.09, "sine", 0.13, 0.05);
}
