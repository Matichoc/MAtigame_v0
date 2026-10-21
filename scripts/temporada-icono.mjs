// Elige el ícono Android con el que se compila la app: el habitual o el de la temporada activa.
// No tiene fechas propias: pregunta a activeEvent() de js/events.js (el mismo calendario del juego).
//
// Uso (lo llama el workflow antes de compilar; en local, cuidado: sobrescribe android/app/src/main/res):
//   node scripts/temporada-icono.mjs habitual            no toca nada (queda el ícono de siempre)
//   node scripts/temporada-icono.mjs evento              ícono del evento activo HOY, si tiene; si no, el habitual
//   node scripts/temporada-icono.mjs evento --fecha 2026-07-01   para probar otra fecha sin cambiar el reloj
//   node scripts/temporada-icono.mjs evento --solo-mirar         dice qué haría, sin copiar nada
// Zona horaria: la del proceso. El workflow usa TZ=America/Santiago (el juego usa la hora local del celular).
// Para volver al habitual en local:  git checkout -- android/app/src/main/res

import { cpSync, existsSync, readdirSync, rmSync } from "node:fs";
import { activeEvent } from "../js/events.js";

const args = process.argv.slice(2);
const modo = args[0] || "habitual";
const soloMirar = args.includes("--solo-mirar");
const fi = args.indexOf("--fecha");
const fecha = fi >= 0 ? args[fi + 1] : null;
const RES = "android/app/src/main/res";

if (!["habitual", "evento"].includes(modo)) {
  console.error("Uso: node scripts/temporada-icono.mjs habitual|evento [--fecha AAAA-MM-DD] [--solo-mirar]");
  process.exit(2);
}
if (modo === "habitual") {
  console.log("Ícono: habitual (sin cambios).");
  process.exit(0);
}
let now = new Date();
if (fecha) {
  const [y, m, d] = fecha.split("-").map(Number);
  now = new Date(y, m - 1, d, 12, 0, 0); // mediodía local de ese día
}
const ev = activeEvent(now);
const src = ev && `resources/temporadas/${ev.id}/android/res`;
if (!ev) {
  console.log(`Ícono: habitual (no hay evento el ${now.toLocaleDateString("es-CL")}).`);
  process.exit(0);
}
if (!existsSync(src)) {
  console.log(`Ícono: habitual (el evento "${ev.id}" no tiene ícono en ${src}).`);
  process.exit(0);
}
console.log(`Ícono: temporada "${ev.id}" (${ev.name}) desde ${src}${soloMirar ? " — solo mirar, no se copió nada" : ""}.`);
if (soloMirar) process.exit(0);
// se reemplazan solo los archivos ic_launcher* (mismos nombres que el habitual: no se crean íconos duplicados)
for (const dir of readdirSync(src)) {
  for (const f of readdirSync(`${src}/${dir}`)) {
    if (!f.startsWith("ic_launcher")) continue;
    rmSync(`${RES}/${dir}/${f}`, { force: true });
    cpSync(`${src}/${dir}/${f}`, `${RES}/${dir}/${f}`);
  }
}
console.log("Listo: compila ahora (assembleDebug / bundleRelease).");
