// Campaña de niveles: cada juego por niveles tiene 20, se van desbloqueando de a uno y cada nivel
// guarda sus estrellas (1 a 3). Los juegos "infinitos" no usan niveles: tienen su modo misiones
// (ver js/missions.js). Todo vive en `progress.campaign[idJuego] = { unlocked, stars: { nivel: n } }`.

import { saveProgress } from "./storage.js";

export const LEVELS_PER_GAME = 20;

export function campaign(progress, id) {
  progress.campaign = progress.campaign || {};
  if (!progress.campaign[id]) progress.campaign[id] = { unlocked: 1, stars: {} };
  return progress.campaign[id];
}

/** Anota un nivel ganado: desbloquea el siguiente y guarda las mejores estrellas. */
export function campaignWin(progress, id, level, stars) {
  const c = campaign(progress, id);
  c.stars[level] = Math.max(c.stars[level] || 0, stars);
  c.unlocked = Math.min(LEVELS_PER_GAME, Math.max(c.unlocked, level + 1));
  saveProgress(progress);
}

export const campaignStars = (progress, id) => Object.values(campaign(progress, id).stars).reduce((a, b) => a + b, 0);

/**
 * Dibuja la grilla de niveles (1 a 20) en `el`. Los que aún no se desbloquean salen con candado.
 * `onSelect(n)` se llama al tocar uno disponible.
 */
export function renderLevelPicker(el, { id, progress, selected, onSelect, total = LEVELS_PER_GAME }) {
  if (!el) return;
  const c = campaign(progress, id);
  el.innerHTML = "";
  const head = document.createElement("div");
  head.className = "lvl-head";
  head.innerHTML = `<b>Elige tu nivel</b><span>⭐ ${campaignStars(progress, id)} / ${total * 3}</span>`;
  el.appendChild(head);
  const grid = document.createElement("div");
  grid.className = "lvl-grid";
  for (let n = 1; n <= total; n++) {
    const open = n <= c.unlocked;
    const b = document.createElement("button");
    b.type = "button";
    b.className = `lvl-btn${n === selected ? " sel" : ""}${open ? "" : " locked"}`;
    const st = c.stars[n] || 0;
    b.innerHTML = open ? `<b>${n}</b><i>${"★".repeat(st)}${"☆".repeat(3 - st)}</i>` : `<b>🔒</b><i>${n}</i>`;
    b.disabled = !open;
    b.addEventListener("click", () => { onSelect(n); renderLevelPicker(el, { id, progress, selected: n, onSelect, total }); });
    grid.appendChild(b);
  }
  el.appendChild(grid);
}
