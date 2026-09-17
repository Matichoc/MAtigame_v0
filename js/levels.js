// Definición de niveles/mapas: tema visual, obstáculos, chocolates y misión.
// Cada nivel es independiente y fácil de ampliar (agrega un objeto más al arreglo).

export const CANVAS_W = 800;
export const CANVAS_H = 480;

export const LEVELS = [
  {
    id: "liga",
    name: "Nivel 1 · Cancha La Liga",
    theme: "field",
    missionText: "Recolecta 8 chocolates de gol antes de que se acabe el tiempo.",
    target: 8,
    timeLimit: 45,
    chocoCount: 12,
    requiresFlag: false,
    obstacles: [
      { x: 0, y: 0, w: 800, h: 24 },
      { x: 0, y: 456, w: 800, h: 24 },
      { x: 0, y: 0, w: 24, h: 480 },
      { x: 776, y: 0, w: 24, h: 480 },
      { x: 40, y: 190, w: 20, h: 100 }, // poste arco izq
      { x: 740, y: 190, w: 20, h: 100 }, // poste arco der
      { x: 250, y: 100, w: 30, h: 30 },
      { x: 520, y: 340, w: 30, h: 30 },
      { x: 380, y: 220, w: 40, h: 40 },
    ],
  },
  {
    id: "basket",
    name: "Nivel 2 · Cancha de Básquet",
    theme: "court",
    missionText: "Recolecta 10 chocolates y esquiva los conos que se mueven de un lado a otro.",
    target: 10,
    timeLimit: 42,
    chocoCount: 14,
    requiresFlag: false,
    // Lejos del muro central (x 388-412) para no aparecer atrapado dentro de él.
    spawn: { x: 200, y: 410 },
    obstacles: [
      { x: 0, y: 0, w: 800, h: 24 },
      { x: 0, y: 456, w: 800, h: 24 },
      { x: 0, y: 0, w: 24, h: 480 },
      { x: 776, y: 0, w: 24, h: 480 },
      { x: 388, y: 0, w: 24, h: 480, gap: true }, // línea central como muro fino, con hueco transitable
    ],
    movingObstacles: [
      { x: 150, y: 100, w: 26, h: 26, axis: "y", range: 120, speed: 60 },
      { x: 620, y: 150, w: 26, h: 26, axis: "y", range: 140, speed: 75 },
      { x: 300, y: 380, w: 26, h: 26, axis: "x", range: 100, speed: 50 },
      { x: 500, y: 80, w: 26, h: 26, axis: "x", range: 90, speed: 65 },
    ],
    // hueco en el muro central para poder cruzar
    gapY: [200, 280],
  },
  {
    id: "cheer",
    name: "Nivel 3 · Gimnasio Cheer",
    theme: "gym",
    missionText: "Recolecta los 12 pompones de chocolate y llega a la meta.",
    target: 12,
    timeLimit: 50,
    chocoCount: 12,
    requiresFlag: true,
    flag: { x: 730, y: 40, w: 36, h: 36 },
    obstacles: [
      { x: 0, y: 0, w: 800, h: 24 },
      { x: 0, y: 456, w: 800, h: 24 },
      { x: 0, y: 0, w: 24, h: 480 },
      { x: 776, y: 0, w: 24, h: 480 },
      { x: 160, y: 120, w: 24, h: 200 },
      { x: 320, y: 260, w: 200, h: 24 },
      { x: 560, y: 100, w: 24, h: 180 },
    ],
  },
];

/** Genera posiciones de chocolates que no se superpongan con obstáculos. */
export function generateChocolates(level) {
  const chocolates = [];
  const obstacles = level.obstacles || [];
  let attempts = 0;
  while (chocolates.length < level.chocoCount && attempts < 500) {
    attempts++;
    const x = 50 + Math.random() * (CANVAS_W - 100);
    const y = 50 + Math.random() * (CANVAS_H - 100);
    const collides = obstacles.some((o) => rectContains(o, x, y, 22));
    const tooClose = chocolates.some((c) => dist(c.x, c.y, x, y) < 45);
    if (!collides && !tooClose) {
      chocolates.push({ x, y, taken: false, bobSeed: Math.random() * 10 });
    }
  }
  return chocolates;
}

function rectContains(rect, x, y, pad) {
  return (
    x + pad > rect.x &&
    x - pad < rect.x + rect.w &&
    y + pad > rect.y &&
    y - pad < rect.y + rect.h
  );
}

function dist(x1, y1, x2, y2) {
  return Math.hypot(x1 - x2, y1 - y2);
}
