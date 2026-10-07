// Catálogo de modos de juego de la plataforma "Matichoc Arcade".
// Cada Matichico y sus atuendos son compartidos entre todos los juegos;
// lo único que cambia es la mecánica y las canchas de cada modo.
// Ver ROADMAP.md para el plan de etapas de cada juego "próximamente".

export const GAMES_CATALOG = [
  {
    id: "recolecta",
    name: "Recolecta y Corre",
    icon: "🏃",
    tagline: "Recorre la cancha y junta golosinas contrarreloj.",
    status: "available",
  },
  {
    id: "salto",
    name: "Salto Choco",
    icon: "🦘",
    tagline: "Sube sin parar con tu Matichico en 3D, junta alfajores y vuela con el jetpack.",
    status: "available",
    tag: "Nuevo 3D",
  },
  {
    id: "autos",
    name: "Autos de Chocolate",
    icon: "🏎️",
    tagline: "Esquiva y acelera por la ruta de Matichoc, de día y de noche.",
    status: "available",
    tag: "Nuevo 3D",
  },
  {
    id: "tetris",
    name: "Tetris de Productos",
    icon: "🧱",
    tagline: "Encaja golosinas cayendo antes de que se acumulen.",
    status: "available",
  },
  {
    id: "memoria",
    name: "Memoria Matichoc",
    icon: "🧠",
    tagline: "Encuentra las parejas de productos Matichoc con fotos reales.",
    status: "available",
    tag: "Nuevo 3D",
  },
  {
    id: "basquet_tiros",
    name: "Lanzamientos de Básquet",
    icon: "🏀",
    tagline: "Calcula la potencia y encesta antes de que se acabe el tiempo.",
    status: "available",
  },
  {
    id: "porristas",
    name: "Saltos de Porristas",
    icon: "🤸",
    tagline: "Mueve la rebotadora para mantener a tu Matichica rebotando.",
    status: "available",
  },
  {
    id: "fps3d",
    name: "Choco Blaster 3D",
    icon: "🎯",
    tagline: "Primera persona: baña de chocolate a los malvaviscos traviesos.",
    status: "available",
    tag: "Propuesta 3D",
  },
];
