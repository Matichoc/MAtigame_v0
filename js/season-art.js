// Imágenes de temporada: qué arte usa cada evento de js/events.js.
// Aquí NO hay fechas: el evento activo lo decide solo activeEvent() (events.js), con sus fechas, su zona
// horaria (la hora local del aparato) y su forma de probar otros eventos (?event=halloween).
// Si el evento activo no tiene arte (o la imagen no carga), se usa lo habitual.
//
// Para sumar una temporada: poner sus imágenes en assets/temporadas/<id-del-evento>/ (ver
// docs/TEMPORADAS.md y scripts/temporada-recursos.mjs) y agregar una línea abajo con el mismo id del evento.

import { activeEvent } from "./events.js";

export const SEASON_ART = {
  halloween: {
    loading: "assets/temporadas/halloween/carga.webp", // arte de la pantalla de carga (sin textos ni logo: esos van aparte)
    loadingBlur: "assets/temporadas/halloween/carga-fondo.webp", // la misma imagen chiquita y borrosa, para rellenar los costados
    bg: "#24123d", // color de respaldo mientras carga la imagen
  },
};

/** El arte de la temporada activa (o del evento que se pase), o null si no hay. */
export function seasonArt(event = activeEvent()) {
  if (!event) return null;
  const art = SEASON_ART[event.id];
  return art ? { id: event.id, name: event.name, ...art } : null;
}
