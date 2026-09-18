// Logros: una razón simple para volver a jugar. Cada uno se revisa contra el
// progreso guardado (sin necesidad de rastrear eventos en tiempo real) y se
// puede reclamar una sola vez por perfil.

import { getBestScore } from "./storage.js";

export const ACHIEVEMENTS = [
  {
    id: "primeros_pasos",
    name: "Primeros pasos",
    icon: "👣",
    reward: 10,
    desc: "Juega tu primera partida de cualquier juego.",
    isDone: (p) => Object.keys(p.bestScores).length > 0,
  },
  {
    id: "recolector",
    name: "Recolector Novato",
    icon: "🍬",
    reward: 20,
    desc: "Consigue 100 puntos en Recolecta y Corre.",
    isDone: (p) => getBestScore(p, "recolecta") >= 100,
  },
  {
    id: "tetris_master",
    name: "Maestro del Tetris",
    icon: "🧱",
    reward: 20,
    desc: "Consigue 500 puntos en Tetris de Productos.",
    isDone: (p) => getBestScore(p, "tetris") >= 500,
  },
  {
    id: "campeon",
    name: "Campeón Matichoc",
    icon: "🏆",
    reward: 40,
    desc: "Completa las 6 canchas de Recolecta y Corre.",
    isDone: (p) => (p.unlockedLevel || 0) >= 6,
  },
  {
    id: "ahorrista",
    name: "Ahorrista de Cacao",
    icon: "💰",
    reward: 30,
    desc: "Gana 200 monedas Chocolate Dubai en total.",
    isDone: (p) => (p.stats.totalCoinsEarned || 0) >= 200,
  },
];
