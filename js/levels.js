// Definición de niveles/mapas: tema visual, obstáculos, coleccionables y misión.
// Cada nivel es independiente y fácil de ampliar (agrega un objeto más al arreglo).

export const CANVAS_W = 800;
export const CANVAS_H = 480;

/** Tipos de golosinas coleccionables (variedad visual, mismo valor en puntos). */
export const COLLECTIBLE_KINDS = ["choco", "alfajor", "cuchuflin", "barquillo"];

export const LEVELS = [
  {
    id: "liga",
    name: "Nivel 1 · Cancha La Liga",
    theme: "field",
    missionText: "Recolecta 8 golosinas antes de que se acabe el tiempo.",
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
    missionText: "Recolecta 10 golosinas y esquiva los conos que se mueven de un lado a otro.",
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
    missionText: "Recolecta las 12 golosinas y llega a la meta.",
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
  {
    id: "liga_dificil",
    name: "Nivel 4 · Revancha en La Liga",
    theme: "field",
    missionText: "Recolecta 10 golosinas. Usa ESPACIO para saltar las vallas.",
    target: 10,
    timeLimit: 40,
    chocoCount: 13,
    requiresFlag: false,
    obstacles: [
      { x: 0, y: 0, w: 800, h: 24 },
      { x: 0, y: 456, w: 800, h: 24 },
      { x: 0, y: 0, w: 24, h: 480 },
      { x: 776, y: 0, w: 24, h: 480 },
      { x: 40, y: 190, w: 20, h: 100 },
      { x: 740, y: 190, w: 20, h: 100 },
      { x: 200, y: 80, w: 30, h: 30 },
      { x: 600, y: 370, w: 30, h: 30 },
      { x: 400, y: 200, w: 36, h: 36 },
      // vallas saltables: cruzan pasillos obligados del mapa
      { x: 260, y: 150, w: 90, h: 16, jumpable: true },
      { x: 460, y: 300, w: 90, h: 16, jumpable: true },
      { x: 150, y: 350, w: 16, h: 80, jumpable: true },
    ],
    movingObstacles: [
      { x: 480, y: 150, w: 24, h: 24, axis: "y", range: 100, speed: 70 },
    ],
  },
  {
    id: "basket_pro",
    name: "Nivel 5 · Básquet Pro",
    theme: "court",
    missionText: "Recolecta 12 golosinas. ¡Los conos van más rápido! Salta con ESPACIO.",
    target: 12,
    timeLimit: 40,
    chocoCount: 15,
    requiresFlag: false,
    spawn: { x: 200, y: 410 },
    obstacles: [
      { x: 0, y: 0, w: 800, h: 24 },
      { x: 0, y: 456, w: 800, h: 24 },
      { x: 0, y: 0, w: 24, h: 480 },
      { x: 776, y: 0, w: 24, h: 480 },
      { x: 388, y: 0, w: 24, h: 480, gap: true },
      // vallas saltables cerca de cada aro
      { x: 90, y: 220, w: 80, h: 16, jumpable: true },
      { x: 630, y: 220, w: 80, h: 16, jumpable: true },
    ],
    movingObstacles: [
      { x: 150, y: 100, w: 26, h: 26, axis: "y", range: 130, speed: 95 },
      { x: 620, y: 150, w: 26, h: 26, axis: "y", range: 150, speed: 110 },
      { x: 300, y: 380, w: 26, h: 26, axis: "x", range: 100, speed: 85 },
      { x: 500, y: 80, w: 26, h: 26, axis: "x", range: 90, speed: 100 },
      { x: 200, y: 250, w: 26, h: 26, axis: "y", range: 80, speed: 90 },
      { x: 560, y: 320, w: 26, h: 26, axis: "x", range: 80, speed: 80 },
    ],
    gapY: [200, 280],
  },
];

/** Genera posiciones de coleccionables (variedad de golosinas) que no se superpongan con obstáculos. */
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
      const kind = COLLECTIBLE_KINDS[Math.floor(Math.random() * COLLECTIBLE_KINDS.length)];
      chocolates.push({ x, y, taken: false, bobSeed: Math.random() * 10, kind });
    }
  }
  return chocolates;
}

/** Busca una posición libre (sin pisar obstáculos ni al jugador) para el bonus especial. */
export function findFreeSpot(level, avoid) {
  const obstacles = level.obstacles || [];
  for (let attempts = 0; attempts < 60; attempts++) {
    const x = 60 + Math.random() * (CANVAS_W - 120);
    const y = 60 + Math.random() * (CANVAS_H - 120);
    const collides = obstacles.some((o) => rectContains(o, x, y, 24));
    const tooCloseToAvoid = avoid && dist(avoid.x, avoid.y, x, y) < 80;
    if (!collides && !tooCloseToAvoid) return { x, y };
  }
  return null;
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
