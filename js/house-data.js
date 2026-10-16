// Mi Casa: un cuarto que se decora con Matipuntos. Cada "lugar" del cuarto (piso, paredes,
// alfombra, cama, rincones, cuadros y techo) tiene sus objetos; se compran una vez y se
// pueden cambiar cuando se quiera. Los modelos 3D están en js/house3d.js.
//
// Objeto: { id, spot, name, icon, rarity, price, params }   (price 0 = viene con la casa)

import { spendCoins, saveProgress } from "./storage.js";

export const HOUSE_SPOTS = [
  { id: "floor", name: "Piso", icon: "🟫" },
  { id: "wall", name: "Paredes", icon: "🎨" },
  { id: "rug", name: "Alfombra", icon: "🟣" },
  { id: "bed", name: "Cama", icon: "🛏️" },
  { id: "left", name: "Rincón izq.", icon: "🪴" },
  { id: "right", name: "Rincón der.", icon: "💡" },
  { id: "wallL", name: "Pared izq.", icon: "🖼️" },
  { id: "wallC", name: "Pared centro", icon: "📺" },
  { id: "wallR", name: "Pared der.", icon: "🪟" },
  { id: "ceiling", name: "Techo", icon: "🎈" },
  { id: "free", name: "Muebles", icon: "🛋️" }, // muebles nuevos que se ponen donde quieras
];

const P = { comun: 30, raro: 110, epico: 260, legendario: 520 };
const it = (spot, id, name, icon, rarity, params = {}, price) => ({ id, spot, name, icon, rarity, price: price ?? P[rarity], params });

export const HOUSE_ITEMS = [
  // ---- Piso ----
  it("floor", "fl_madera", "Madera clara", "🟫", "comun", { style: "madera", a: "#d9a066", b: "#c98a4b" }, 0),
  it("floor", "fl_damero", "Damero rosa", "🏁", "comun", { style: "damero", a: "#ff8ab8", b: "#fff6e6" }),
  it("floor", "fl_cesped", "Césped", "🌿", "comun", { style: "cesped", a: "#7cc65a", b: "#5fb046" }),
  it("floor", "fl_choco", "Barras de chocolate", "🍫", "raro", { style: "choco", a: "#6b3a22", b: "#4a2412" }),
  it("floor", "fl_nubes", "Piso de nubes", "☁️", "raro", { style: "nubes", a: "#a8d8ff", b: "#ffffff" }),
  it("floor", "fl_galaxia", "Piso galaxia", "🌌", "epico", { style: "galaxia", a: "#1a1040", b: "#9a5cff" }),
  // ---- Paredes ----
  it("wall", "wl_crema", "Crema", "🤍", "comun", { style: "liso", a: "#fff1d6", b: "#f5dfb8" }, 0),
  it("wall", "wl_rosa", "Rosa chicle", "🩷", "comun", { style: "liso", a: "#ffc2dc", b: "#ff9ec6" }),
  it("wall", "wl_menta", "Menta", "💚", "comun", { style: "liso", a: "#c6f1de", b: "#9fe3c4" }),
  it("wall", "wl_cielo", "Cielo", "💙", "comun", { style: "liso", a: "#c8e6ff", b: "#9fd0ff" }),
  it("wall", "wl_rayas", "Rayas dulces", "🍬", "raro", { style: "rayas", a: "#ffb3d1", b: "#fff6e6" }),
  it("wall", "wl_lunares", "Lunares", "🔴", "raro", { style: "lunares", a: "#fff6e6", b: "#d4216c" }),
  it("wall", "wl_flores", "Jardín de flores", "🌸", "comun", { style: "flores", a: "#e9f7d8", b: "#7cc65a" }),
  it("wall", "wl_corazones", "Corazones", "💕", "raro", { style: "corazones", a: "#ffd9e8", b: "#ff6f9f" }),
  it("wall", "wl_nubes", "Cielo con nubes", "⛅", "raro", { style: "nubes", a: "#9fd6ff", b: "#ffffff" }),
  it("wall", "wl_ladrillos", "Ladrillos de chocolate", "🧱", "raro", { style: "ladrillos", a: "#8a4b2c", b: "#5a2d16" }),
  it("wall", "wl_estrellas", "Noche estrellada", "🌙", "epico", { style: "estrellas", a: "#1c1a4a", b: "#ffd34d" }),
  // ---- Alfombra ----
  it("rug", "rg_redonda", "Alfombra rosa", "🟣", "comun", { kind: "redonda", a: "#ff7aa8", b: "#ffd1e3" }),
  it("rug", "rg_arcoiris", "Arcoíris", "🌈", "raro", { kind: "arcoiris" }),
  it("rug", "rg_estrella", "Estrella dorada", "⭐", "raro", { kind: "estrella", a: "#ffc800", b: "#fff1a8" }),
  it("rug", "rg_corazon", "Corazón", "❤️", "raro", { kind: "corazon", a: "#e83a6a", b: "#ff9ab8" }),
  it("rug", "rg_alfajor", "Alfajor gigante", "🍪", "epico", { kind: "alfajor" }),
  // ---- Cama ----
  it("bed", "bd_simple", "Cama azul", "🛏️", "comun", { kind: "simple", a: "#6ab0ff", b: "#fff6e6" }, 0),
  it("bed", "bd_rosa", "Cama de corazones", "🛏️", "comun", { kind: "simple", a: "#ff7aa8", b: "#fff6e6" }),
  it("bed", "bd_nube", "Cama nube", "☁️", "raro", { kind: "nube" }),
  it("bed", "bd_cohete", "Cama cohete", "🚀", "epico", { kind: "cohete" }),
  it("bed", "bd_alfajor", "Cama alfajor", "🍪", "epico", { kind: "alfajor" }),
  // ---- Rincón izquierdo ----
  it("left", "lf_planta", "Planta grande", "🪴", "comun", { kind: "planta" }),
  it("left", "lf_escritorio", "Escritorio", "💻", "raro", { kind: "escritorio" }),
  it("left", "lf_estanteria", "Estantería de golosinas", "📚", "raro", { kind: "estanteria" }),
  it("left", "lf_oso", "Oso de peluche gigante", "🧸", "epico", { kind: "oso" }),
  it("left", "lf_arcade", "Máquina arcade", "🕹️", "legendario", { kind: "arcade" }),
  // ---- Rincón derecho ----
  it("right", "rt_lampara", "Lámpara de pie", "💡", "comun", { kind: "lampara" }),
  it("right", "rt_flores", "Maceta con flores", "🌼", "comun", { kind: "flores" }),
  it("right", "rt_cacao", "Árbol de cacao", "🌳", "raro", { kind: "cacao" }),
  it("right", "rt_cofre", "Cofre del tesoro", "🧰", "epico", { kind: "cofre" }),
  it("right", "rt_fuente", "Mini fuente de chocolate", "⛲", "legendario", { kind: "fuente" }),
  // ---- Pared izquierda ----
  it("wallL", "wl1_ventana", "Ventana soleada", "🪟", "comun", { kind: "ventana", a: "#9fd8ff" }),
  it("wallL", "wl1_reloj", "Reloj", "🕒", "comun", { kind: "reloj" }),
  it("wallL", "wl1_poster", "Póster Matichoc", "🖼️", "raro", { kind: "poster", a: "#d4216c", icon: "M" }),
  it("wallL", "wl1_estrellas", "Estrellas brillantes", "✨", "raro", { kind: "estrellas" }),
  it("wallL", "wl1_ventana_noche", "Ventana de noche", "🌃", "epico", { kind: "ventana", a: "#1c1a4a", night: true }),
  // ---- Pared centro ----
  it("wallC", "wc_cuadro", "Cuadro del Matichico", "🎨", "comun", { kind: "cuadro" }),
  it("wallC", "wc_arcoiris", "Arcoíris pintado", "🌈", "comun", { kind: "arcoiris" }),
  it("wallC", "wc_trofeos", "Repisa de trofeos", "🏆", "raro", { kind: "trofeos" }),
  it("wallC", "wc_tv", "Pantalla gigante", "📺", "epico", { kind: "tv" }),
  it("wallC", "wc_neon", "Letrero neón", "💗", "legendario", { kind: "neon" }),
  // ---- Pared derecha ----
  it("wallR", "wr_ventana", "Ventana con cortinas", "🪟", "comun", { kind: "ventana", a: "#bfe6ff", curtains: true }),
  it("wallR", "wr_alfajores", "Póster de alfajores", "🍪", "comun", { kind: "poster", a: "#ffd34d", icon: "🍪" }),
  it("wallR", "wr_corazones", "Corazones", "💕", "raro", { kind: "corazones" }),
  it("wallR", "wr_repisa", "Repisa de plantas", "🌱", "raro", { kind: "repisa" }),
  it("wallR", "wr_luces", "Guirnalda de luces", "💫", "epico", { kind: "luces" }),
  // ---- Muebles nuevos (se colocan donde quieras) ----
  it("free", "fr_sofa", "Sillón rosado", "🛋️", "comun", { kind: "sofa", a: "#ff7aa8", b: "#ffd1e3" }),
  it("free", "fr_sofa_azul", "Sillón azul", "🛋️", "comun", { kind: "sofa", a: "#6ab0ff", b: "#d7ebff" }),
  it("free", "fr_mesa", "Mesa de golosinas", "🍬", "comun", { kind: "mesa", a: "#e0b070", b: "#ff7aa8" }),
  it("free", "fr_silla", "Silla de chocolate", "🪑", "comun", { kind: "silla", a: "#8a4b2c", b: "#ffd34d" }),
  it("free", "fr_comoda", "Cómoda de cajones", "🗄️", "raro", { kind: "comoda", a: "#fff1d6", b: "#d4216c" }),
  it("free", "fr_pelotero", "Pelotero", "🔴", "raro", { kind: "pelotero" }),
  it("free", "fr_tipi", "Carpa tipi", "⛺", "raro", { kind: "tipi", a: "#ff9ec6", b: "#fff6e6" }),
  it("free", "fr_piano", "Piano de cola", "🎹", "epico", { kind: "piano" }),
  it("free", "fr_pastel", "Mesa con pastel gigante", "🎂", "epico", { kind: "pastel" }),
  it("free", "fr_trampolin", "Cama elástica", "🤸", "epico", { kind: "trampolin" }),
  // ---- Para cocina, baño, living y dormitorio ----
  it("free", "fr_heladera", "Heladera", "🧊", "raro", { kind: "heladera", a: "#fff6f0", b: "#ff7aa8" }),
  it("free", "fr_cocina", "Cocina con hornito", "🍳", "raro", { kind: "cocina", a: "#dcdce4", b: "#d4216c" }),
  it("free", "fr_meson", "Mesón de cocina", "🍴", "comun", { kind: "meson", a: "#fff1d6", b: "#8a4b2c" }),
  it("free", "fr_comedor", "Mesa de comedor", "🍽️", "comun", { kind: "comedor", a: "#c98a4b", b: "#ff7aa8" }),
  it("free", "fr_tina", "Tina de burbujas", "🛁", "raro", { kind: "tina" }),
  it("free", "fr_lavabo", "Lavamanos", "🚰", "comun", { kind: "lavabo" }),
  it("free", "fr_ropero", "Ropero", "🚪", "comun", { kind: "ropero", a: "#fff1d6", b: "#d4216c" }),
  it("free", "fr_tvmueble", "Mueble con tele", "📺", "raro", { kind: "tvmueble", a: "#8a4b2c" }),
  it("free", "fr_mesacentro", "Mesita de centro", "☕", "comun", { kind: "mesacentro", a: "#e0b070", b: "#ff7aa8" }),
  // ---- Techo ----
  it("ceiling", "ce_lampara", "Lámpara colgante", "💡", "comun", { kind: "lampara" }),
  it("ceiling", "ce_globos", "Globos", "🎈", "comun", { kind: "globos" }),
  it("ceiling", "ce_banderines", "Banderines de fiesta", "🎉", "raro", { kind: "banderines" }),
  it("ceiling", "ce_luna", "Luna y estrellas", "🌙", "epico", { kind: "luna" }),
  it("ceiling", "ce_disco", "Bola disco", "🪩", "legendario", { kind: "disco" }),
];

const BY_ID = new Map(HOUSE_ITEMS.map((i) => [i.id, i]));
export const getHouseItem = (id) => BY_ID.get(id) || null;
export const houseItemsOfSpot = (spot) => HOUSE_ITEMS.filter((i) => i.spot === spot);

/** Lo que hay puesto por defecto: piso, paredes y nada más. */
export const DEFAULT_PLACED = { floor: "fl_madera", wall: "wl_crema" };

export function placedWithDefaults(progress) {
  return { ...DEFAULT_PLACED, ...(progress.house ? progress.house.placed : {}) };
}

export function ownsHouseItem(progress, id) {
  const item = getHouseItem(id);
  if (!item) return false;
  return item.price === 0 || progress.house.owned.includes(id);
}

/** Compra un objeto de la casa con Matipuntos (y lo deja puesto). */
export function buyHouseItem(progress, id) {
  const item = getHouseItem(id);
  if (!item || ownsHouseItem(progress, id)) return false;
  if (!spendCoins(progress, item.price)) return false;
  progress.house.owned.push(id);
  progress.house.placed[item.spot] = id;
  saveProgress(progress);
  return true;
}

/** Pone (o quita, con id "") un objeto en su lugar. */
export function placeHouseItem(progress, spot, id) {
  if (id && (!ownsHouseItem(progress, id) || getHouseItem(id).spot !== spot)) return false;
  if (id) progress.house.placed[spot] = id;
  else if (spot === "floor" || spot === "wall") progress.house.placed[spot] = DEFAULT_PLACED[spot];
  else delete progress.house.placed[spot];
  saveProgress(progress);
  return true;
}


// ---------- decorar libre (estilo "Avatar World") ----------
// Cada mueble que compras se puede poner varias veces, en cualquier lugar del cuarto, girado y
// de otro tamaño. `progress.house.layout` guarda cada pieza: { uid, id, x, z, rot, s } en el piso,
// o { uid, id, wall: "back" | "left", u, y, s } si es de pared.

/** Muebles que se pueden poner donde quieras (todo menos piso, paredes y techo). */
export const FURNITURE_SPOTS = ["rug", "bed", "left", "right", "free", "wallL", "wallC", "wallR"];
const ALL_FREE_UTIL = ["sofa", "mesa", "silla", "comoda", "ropero", "tvmueble", "mesacentro", "heladera", "cocina", "meson", "comedor", "tina", "lavabo"];
export const FURN_CATEGORIES = [
  { id: "sit", name: "Sillones y mesas", icon: "🛋️", test: (i) => i.spot === "free" && ["sofa", "mesa", "silla", "comoda", "ropero", "tvmueble", "mesacentro"].includes(i.params.kind) },
  { id: "kitchen", name: "Cocina y comedor", icon: "🍳", test: (i) => i.spot === "free" && ["heladera", "cocina", "meson", "comedor"].includes(i.params.kind) },
  { id: "bath", name: "Baño", icon: "🛁", test: (i) => i.spot === "free" && ["tina", "lavabo"].includes(i.params.kind) },
  { id: "fun", name: "Juegos", icon: "🎪", test: (i) => i.spot === "free" && !ALL_FREE_UTIL.includes(i.params.kind) || ["lf_arcade", "lf_oso"].includes(i.id) },
  { id: "bed", name: "Camas", icon: "🛏️", test: (i) => i.spot === "bed" },
  { id: "plants", name: "Plantas y luces", icon: "🪴", test: (i) => (i.spot === "left" || i.spot === "right") && !["lf_arcade", "lf_oso"].includes(i.id) },
  { id: "rug", name: "Alfombras", icon: "🟣", test: (i) => i.spot === "rug" },
  { id: "wall", name: "Para la pared", icon: "🖼️", test: (i) => i.spot.startsWith("wall") && i.spot.length === 5 },
];
export const isWallItem = (item) => !!item && item.spot.startsWith("wall") && item.spot.length === 5;
export const furnitureOf = (catId) => {
  const c = FURN_CATEGORIES.find((x) => x.id === catId);
  return HOUSE_ITEMS.filter((i) => FURNITURE_SPOTS.includes(i.spot) && c.test(i));
};

/** Posiciones de siempre de cada lugar (para pasar lo que ya tenías puesto al modo libre). */
const OLD_ANCHORS = {
  rug: { x: 0.2, z: 1.0 }, bed: { x: -3.4, z: -2.2 }, left: { x: -4.0, z: 2.8 }, right: { x: 3.7, z: -3.8 },
  wallL: { wall: "back", u: -3.4, y: 2.7 }, wallC: { wall: "back", u: 0.3, y: 2.8 }, wallR: { wall: "back", u: 3.4, y: 2.7 },
};
let uidCounter = 0;
const newUid = () => `f${Date.now().toString(36)}${(uidCounter++).toString(36)}`;

/** El cuarto libre de este perfil; la primera vez convierte lo que ya había puesto. */
export function houseLayout(progress) {
  const h = progress.house;
  if (!h.layout) {
    h.layout = [];
    for (const [spot, a] of Object.entries(OLD_ANCHORS)) {
      const id = h.placed[spot];
      const item = id && getHouseItem(id);
      if (item && item.spot === spot) {
        h.layout.push({ uid: newUid(), id, rot: 0, s: 1, ...a });
        delete h.placed[spot];
      }
    }
    saveProgress(progress);
  }
  // todas las casas empiezan con una cama (para que el Matichico pueda dormir y recuperar energía)
  if (!h.starterBed) {
    h.starterBed = true;
    if (!h.layout.some((f) => (getHouseItem(f.id) || {}).spot === "bed")) h.layout.push({ uid: newUid(), id: "bd_simple", rot: 0, s: 1, ...OLD_ANCHORS.bed });
    saveProgress(progress);
  }
  return h.layout;
}

/** Cuántas unidades de un mueble tienes (cada compra es una unidad: se puede poner una sola vez cada una). */
export function copiesOf(progress, id) {
  if (!ownsHouseItem(progress, id)) return 0;
  const n = Math.floor(Number((progress.house.copies || {})[id]));
  return n >= 1 ? n : 1;
}

/** Cuántas están puestas hoy, sumando todos los cuartos de la casa. */
export function placedCount(progress, id) {
  const h = progress.house;
  let n = houseLayout(progress).filter((f) => f.id === id).length;
  for (const [rid, d] of Object.entries(h.roomData || {})) if (rid !== h.curRoom && d && Array.isArray(d.layout)) n += d.layout.filter((f) => f.id === id).length;
  return n;
}

/** Unidades que tienes guardadas (en "Lo que tengo") listas para poner. */
export const freeCopies = (progress, id) => copiesOf(progress, id) - placedCount(progress, id);

export function layoutAdd(progress, id, x = 0, z = 1.5) {
  const item = getHouseItem(id);
  if (!item || !ownsHouseItem(progress, id)) return null;
  if (freeCopies(progress, id) <= 0) return null; // ya están todas puestas: para otro igual hay que comprar otro
  const piece = isWallItem(item) ? { uid: newUid(), id, wall: "back", u: 0, y: 2.8, s: 1 } : { uid: newUid(), id, x, z, rot: 0, s: 1 };
  houseLayout(progress).push(piece);
  saveProgress(progress);
  return piece;
}

export function layoutRemove(progress, uid) {
  const l = houseLayout(progress);
  const i = l.findIndex((f) => f.uid === uid);
  if (i >= 0) l.splice(i, 1);
  saveProgress(progress);
}

/** Compra un mueble (o "otro igual" si ya lo tienes: cada compra es una unidad más). Se agrega con un toque. */
export function buyFurniture(progress, id) {
  const item = getHouseItem(id);
  if (!item || item.price <= 0) return false;
  const h = progress.house;
  const had = ownsHouseItem(progress, id);
  if (!spendCoins(progress, item.price)) return false;
  if (!had) h.owned.push(id);
  h.copies = h.copies || {};
  h.copies[id] = had ? copiesOf(progress, id) + 1 : 1;
  saveProgress(progress);
  return true;
}

// ---------- agrandar la casa ----------

// Cada cuarto tiene su propio tamaño: todos parten pequeños y tú eliges cuál agrandar (se compra aparte para cada uno).
export const HOUSE_SIZES = [
  { level: 0, size: 10, name: "Pequeño", icon: "🏠", price: 0, blurb: "Un cuartito acogedor." },
  { level: 1, size: 14, name: "Mediano", icon: "🏡", price: 300, blurb: "¡Mucho más espacio para muebles!" },
  { level: 2, size: 18, name: "Grande", icon: "🏰", price: 900, blurb: "Un salón enorme para decorar." },
];
const sizeLevel = (n) => Math.min(HOUSE_SIZES.length - 1, Math.max(0, Math.floor(Number(n)) || 0));
/** El tamaño (nivel 0 a 2) de un cuarto de la casa. */
export function roomSizeLevel(progress, rid) {
  const r = roomsOf(progress).find((x) => x.rid === rid);
  return sizeLevel(r && r.size);
}
/** El tamaño del cuarto que está abierto. */
export const houseSize = (progress) => HOUSE_SIZES[roomSizeLevel(progress, progress.house.curRoom)];

/** Precio de llevar el cuarto abierto al tamaño `level` (se descuenta lo que ya valía su tamaño actual). */
export const houseSizeCost = (progress, level) => Math.max(0, HOUSE_SIZES[level].price - houseSize(progress).price);

/** Agranda el cuarto que está abierto al tamaño que elijas (puede saltarse uno). */
export function buyHouseSize(progress, level) {
  const next = HOUSE_SIZES[level];
  const r = currentRoom(progress);
  if (!next || !r || level <= sizeLevel(r.size)) return false;
  if (!spendCoins(progress, houseSizeCost(progress, level))) return false;
  r.size = level;
  if (r.rid === "r0") progress.house.size = level; // compatibilidad con guardados anteriores
  saveProgress(progress);
  return true;
}

// ---------- habitaciones ----------
// La casa se arma con varios cuartos: dormitorio, cocina, living, baño... Cada uno tiene su piso, sus paredes y sus muebles.
// El cuarto que está abierto vive en `house.placed` y `house.layout` (así todo lo demás sigue funcionando igual);
// los otros se guardan en `house.roomData[rid]` y se intercambian al cambiar de cuarto.

export const MAX_ROOMS = 8;
// starter: [idMueble, x, z, giro] — vienen de regalo con el cuarto (el giro 0 mira hacia el frente)
export const ROOM_TYPES = [
  { id: "cuarto", name: "Mi cuarto", icon: "🏠", price: 0, blurb: "Tu cuartito de siempre." },
  { id: "dormitorio", name: "Dormitorio", icon: "🛏️", price: 400, blurb: "Para dormir y descansar: cama, cómoda y ropero. ¡Durmiendo recargas energía más rápido!", floor: "fl_madera", wall: "wl_rosa",
    starter: [["bd_rosa", -3.3, -1.6, 0], ["fr_comoda", 2.6, -3.9, 0], ["fr_ropero", -0.2, -3.9, 0]] },
  { id: "cocina", name: "Cocina", icon: "🍳", price: 500, blurb: "Heladera, cocina con hornito, mesón y una mesa para comer. Tu Matichico puede cocinar y comer.", floor: "fl_damero", wall: "wl_menta",
    starter: [["fr_heladera", -3.7, -3.9, 0], ["fr_cocina", -1.1, -3.9, 0], ["fr_meson", 1.5, -3.9, 0], ["fr_comedor", 1.0, 1.0, 0]] },
  { id: "living", name: "Living", icon: "🛋️", price: 600, blurb: "Sillón, tele y mesita de centro para descansar y ver tele.", floor: "fl_madera", wall: "wl_cielo",
    starter: [["fr_tvmueble", 0.2, -3.9, 0], ["fr_sofa", 0.2, 1.3, Math.PI], ["fr_mesacentro", 0.2, -0.6, 0]] },
  { id: "bano", name: "Baño", icon: "🛁", price: 400, blurb: "Una tina de burbujas y un lavamanos.", floor: "fl_nubes", wall: "wl_cielo",
    starter: [["fr_tina", -2.6, -3.5, 0], ["fr_lavabo", 2.6, -3.9, 0]] },
  { id: "juegos", name: "Sala de juegos", icon: "🕹️", price: 900, blurb: "Pelotero, juegos y una planta grande para pasarlo bien.", floor: "fl_damero", wall: "wl_lunares",
    starter: [["fr_pelotero", -2.4, -2.4, 0], ["fr_tipi", 2.6, -2.4, 0], ["lf_planta", 3.9, 3.0, 0]] },
  { id: "jardin", name: "Jardín", icon: "🌳", price: 700, blurb: "Césped, flores y un árbol de cacao.", floor: "fl_cesped", wall: "wl_nubes",
    starter: [["rt_cacao", -3.6, -3.3, 0], ["rt_flores", 3.6, -3.6, 0], ["fr_mesa", 1.0, 1.0, 0]] },
];
export const roomType = (id) => ROOM_TYPES.find((t) => t.id === id) || ROOM_TYPES[0];

export function roomsOf(progress) {
  const h = progress.house;
  if (!Array.isArray(h.rooms) || !h.rooms.length) h.rooms = [{ rid: "r0", type: "cuarto", name: "Mi cuarto" }];
  if (!h.roomData || typeof h.roomData !== "object") h.roomData = {};
  if (!h.rooms.some((r) => r.rid === h.curRoom)) h.curRoom = h.rooms[0].rid;
  // el cuarto de siempre conserva el tamaño que ya tenía la casa; los demás parten pequeños
  for (const r of h.rooms) if (r.size === undefined) r.size = r.rid === "r0" ? sizeLevel(h.size) : 0;
  return h.rooms;
}

/** Cambia de lugar un cuarto en el orden de la casa (dir = -1 a la izquierda, +1 a la derecha). */
export function moveRoom(progress, rid, dir) {
  const rooms = roomsOf(progress);
  const i = rooms.findIndex((r) => r.rid === rid);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= rooms.length) return false;
  [rooms[i], rooms[j]] = [rooms[j], rooms[i]];
  saveProgress(progress);
  return true;
}
export function currentRoom(progress) { return roomsOf(progress).find((r) => r.rid === progress.house.curRoom); }
export const nextRoomOf = (progress) => {
  const rs = roomsOf(progress);
  if (rs.length < 2) return null;
  return rs[(rs.findIndex((r) => r.rid === progress.house.curRoom) + 1) % rs.length];
};

/** ¿Tiene cama ese cuarto? (el abierto se mira en `layout`, los otros en lo guardado) */
export function roomHasBed(progress, rid) {
  const h = progress.house;
  const layout = rid === h.curRoom ? houseLayout(progress) : ((h.roomData[rid] || {}).layout || []);
  return layout.some((f) => (getHouseItem(f.id) || {}).spot === "bed");
}

/** Abre otro cuarto: guarda el que estaba abierto y trae el nuevo. */
export function switchRoom(progress, rid) {
  const h = progress.house;
  roomsOf(progress);
  if (rid === h.curRoom || !h.rooms.some((r) => r.rid === rid)) return false;
  houseLayout(progress); // deja armado el cuarto abierto antes de guardarlo
  h.roomData[h.curRoom] = { placed: h.placed, layout: h.layout };
  const d = h.roomData[rid] || { placed: { ...DEFAULT_PLACED }, layout: [] };
  h.placed = d.placed || { ...DEFAULT_PLACED };
  h.layout = Array.isArray(d.layout) ? d.layout : [];
  delete h.roomData[rid];
  h.curRoom = rid;
  saveProgress(progress);
  return true;
}

/** Compra un cuarto nuevo (con sus muebles de regalo) y lo deja listo para abrir. Devuelve el rid o null. */
export function buyRoom(progress, typeId) {
  const t = ROOM_TYPES.find((x) => x.id === typeId);
  const h = progress.house;
  const rooms = roomsOf(progress);
  if (!t || t.id === "cuarto" || rooms.length >= MAX_ROOMS) return null;
  if (!spendCoins(progress, t.price)) return null;
  const same = rooms.filter((r) => r.type === t.id).length;
  const rid = `r${Date.now().toString(36)}${(uidCounter++).toString(36)}`;
  const layout = [];
  h.copies = h.copies || {};
  for (const [id, x, z, rot] of t.starter || []) {
    if (!getHouseItem(id)) continue;
    // los muebles de regalo del cuarto son unidades nuevas (aunque ya tengas uno igual en otro cuarto)
    if (getHouseItem(id).price > 0) {
      if (h.owned.includes(id)) h.copies[id] = copiesOf(progress, id) + 1;
      else { h.owned.push(id); h.copies[id] = 1; }
    } else h.copies[id] = copiesOf(progress, id) + 1;
    layout.push({ uid: newUid(), id, x, z, rot: rot || 0, s: 1 });
  }
  for (const id of [t.floor, t.wall]) if (id && getHouseItem(id).price > 0 && !h.owned.includes(id)) h.owned.push(id);
  h.roomData[rid] = { placed: { floor: t.floor || DEFAULT_PLACED.floor, wall: t.wall || DEFAULT_PLACED.wall }, layout };
  rooms.push({ rid, type: t.id, name: same ? `${t.name} ${same + 1}` : t.name, size: 0 });
  saveProgress(progress);
  return rid;
}
