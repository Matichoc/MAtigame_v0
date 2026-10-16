// Mati Merge: la lógica del juego de juntar productos (sin gráficos, para poder probarla sola).
// Juntas dos productos iguales y se transforman en el siguiente de la cadena: de un Bombón hasta la ¡Mati Dubai!
// El tablero se guarda en el perfil (progress.merge), así que tu colección sigue donde la dejaste.
//
// progress.merge = { grid:[números], best, delivered, merges, spawned, orders:[{t,coins,xp}], dubai }

import { saveProgress, earnCoins } from "./storage.js";
import { addXp } from "./progression.js";

export const COLS = 5;
export const ROWS = 6;
export const CELLS = COLS * ROWS;

/** La cadena de productos (nivel 1 → 13). `img` es la foto real en assets/products (la última lleva el logo dorado). */
export const TIERS = [
  { name: "Bombón", img: "bomba-choco", color: 0x7a4a2c, icon: "🍫" },
  { name: "Cuchuflí", img: "cuchufli", color: 0xd9a463, icon: "🥖" },
  { name: "Alfajor de Menta", img: "alf-menta", color: 0x2fd08a, icon: "💚" },
  { name: "Alfajor de Naranja", img: "alf-naranja", color: 0xff8a2a, icon: "🧡" },
  { name: "Alfajor de Maracuyá", img: "alf-maracuya", color: 0xffc800, icon: "💛" },
  { name: "Alfajor de Frambuesa", img: "alf-frambuesa", color: 0xe0407a, icon: "🩷" },
  { name: "Alfajor Pie de Limón", img: "alf-pie-limon", color: 0xc8d83a, icon: "🍋" },
  { name: "Alfajor de Almendra", img: "alf-almendra", color: 0xc8955a, icon: "🌰" },
  { name: "Alfajor Capuchino", img: "alf-capuchino", color: 0x9a6a4a, icon: "☕" },
  { name: "Alfajor Tradicional", img: "alf-tradicional", color: 0xb8742f, icon: "🍪" },
  { name: "Alfajor de Trufa", img: "alf-trufa", color: 0x5a2d1a, icon: "🍫" },
  { name: "Bomba Dorada", img: "bomba-dorada", color: 0xf2c030, icon: "✨" },
  { name: "¡Mati Dubai!", img: null, color: 0xffd36a, icon: "👑" },
];
export const MAX_TIER = TIERS.length; // 13

const tierOf = (t) => TIERS[Math.max(1, Math.min(MAX_TIER, t)) - 1];
export const tierInfo = tierOf;

export function mergeOf(progress) {
  let m = progress.merge;
  if (!m || typeof m !== "object") m = progress.merge = {};
  if (!Array.isArray(m.grid) || m.grid.length !== CELLS) m.grid = new Array(CELLS).fill(0);
  m.grid = m.grid.map((v) => { const n = Math.floor(Number(v)); return n >= 1 && n <= MAX_TIER ? n : 0; });
  for (const k of ["best", "delivered", "merges", "spawned"]) { const n = Math.floor(Number(m[k])); m[k] = n > 0 ? n : 0; }
  if (!Array.isArray(m.orders)) m.orders = [];
  m.dubai = !!m.dubai;
  if (m.best < 1) m.best = Math.max(1, ...m.grid);
  // al empezar hay unas piezas para jugar
  if (m.grid.every((v) => v === 0) && m.spawned === 0) {
    const start = [1, 1, 1, 1, 2, 1, 1];
    start.forEach((t, i) => { m.grid[[7, 8, 12, 13, 17, 11, 16][i]] = t; });
  }
  while (m.orders.length < 3) m.orders.push(newOrder(m));
  m.orders = m.orders.slice(0, 3).map((o) => (o && o.t >= 1 && o.t <= MAX_TIER ? o : newOrder(m)));
  return m;
}

/** Las monedas que vale entregar un producto (crece rápido con el nivel). */
export const coinsFor = (t) => Math.round(4 * Math.pow(1.62, t - 1));
export const xpFor = (t) => 4 + t * 3;

function newOrder(m, rnd = Math.random) {
  const hi = Math.max(2, Math.min(MAX_TIER - 1, m.best - 1));
  const lo = Math.max(2, hi - 3);
  const t = lo + Math.floor(rnd() * (hi - lo + 1));
  return { t, coins: coinsFor(t), xp: xpFor(t) };
}

/** Qué producto sale al tocar "pieza nueva": al inicio Bombones, y mientras mejores, salen mejores. */
export function spawnTier(m, rnd = Math.random) {
  const lo = Math.max(1, Math.min(7, m.best - 5));
  const r = rnd();
  return Math.min(MAX_TIER - 2, lo + (r < 0.62 ? 0 : r < 0.92 ? 1 : 2));
}

export const emptyCells = (m) => m.grid.map((v, i) => (v === 0 ? i : -1)).filter((i) => i >= 0);

/** Pone una pieza nueva en un casillero libre al azar. Devuelve { cell, tier } o null si el tablero está lleno. */
export function spawnPiece(progress, rnd = Math.random) {
  const m = mergeOf(progress);
  const free = emptyCells(m);
  if (!free.length) return null;
  const cell = free[Math.floor(rnd() * free.length)];
  const tier = spawnTier(m, rnd);
  m.grid[cell] = tier;
  m.spawned++;
  saveProgress(progress);
  return { cell, tier };
}

/**
 * Suelta una pieza (de `from`) sobre otro casillero (`to`):
 *   vacío → se mueve · igual → se juntan y suben de nivel · distinta → se intercambian.
 * Devuelve { kind: "move"|"merge"|"swap"|"none", ... } (en "merge": tier nuevo, si es récord y una pieza de regalo).
 */
export function dropPiece(progress, from, to, rnd = Math.random) {
  const m = mergeOf(progress);
  if (from === to || !m.grid[from]) return { kind: "none" };
  const a = m.grid[from];
  const b = m.grid[to];
  if (b === 0) {
    m.grid[to] = a; m.grid[from] = 0;
    saveProgress(progress);
    return { kind: "move", from, to };
  }
  if (a === b && a < MAX_TIER) {
    const nt = a + 1;
    m.grid[to] = nt; m.grid[from] = 0;
    m.merges++;
    const out = { kind: "merge", from, to, tier: nt, record: false, gift: null, coins: 0 };
    if (nt > m.best) {
      m.best = nt;
      out.record = true;
      out.coins = nt * 12;
      earnCoins(progress, out.coins);
      if (nt >= 8) progress.packs = (progress.packs || 0) + 1; // desde el nivel 8, un sobre de figuritas
      if (nt === MAX_TIER) { m.dubai = true; out.coins += 1000; earnCoins(progress, 1000); progress.packs = (progress.packs || 0) + 3; }
    }
    addXp(progress, 2 + nt);
    // a veces aparece una pieza de regalo (como en los juegos de juntar)
    if (rnd() < 0.18) {
      const free = emptyCells(m);
      if (free.length) { const c = free[Math.floor(rnd() * free.length)]; m.grid[c] = Math.max(1, Math.min(3, nt - 4)); out.gift = c; }
    }
    saveProgress(progress);
    return out;
  }
  m.grid[to] = a; m.grid[from] = b;
  saveProgress(progress);
  return { kind: "swap", from, to };
}

/** Entrega el pedido número `idx` con una pieza del tablero. Devuelve null si no tienes el producto. */
export function deliverOrder(progress, idx, rnd = Math.random) {
  const m = mergeOf(progress);
  const o = m.orders[idx];
  if (!o) return null;
  const cell = m.grid.findIndex((v) => v === o.t);
  if (cell < 0) return null;
  m.grid[cell] = 0;
  m.delivered++;
  earnCoins(progress, o.coins);
  const lv = addXp(progress, o.xp);
  const done = { ...o, cell, lv };
  m.orders[idx] = newOrder(m, rnd);
  saveProgress(progress);
  return done;
}

export const canDeliver = (m, idx) => !!m.orders[idx] && m.grid.includes(m.orders[idx].t);
