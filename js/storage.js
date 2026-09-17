// Estado persistente compartido entre el hub y todos los juegos (localStorage).
// El personaje, sus atuendos y las monedas Chocolate Dubai son globales a toda
// la plataforma; el puntaje y el ranking se llevan por juego (ver GAMES_CATALOG).

const STORAGE_KEY = "matichoc_save_v3";
const DEFAULT_OUTFIT = "liga";
const MAX_LEADERBOARD = 10;

function defaultProgress() {
  return {
    playerName: "",
    selectedCharacterId: null,
    equippedOutfit: {}, // { [characterId]: outfitId }
    ownedOutfits: {}, // { [characterId]: [outfitId, ...] }
    coins: 0,
    unlockedLevel: 0, // progreso dentro de "Recolecta y Corre"
    bestScores: {}, // { [gameId]: number }
    leaderboards: {}, // { [gameId]: [{ name, score, date }] }
  };
}

export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return migrateFromV2();
    const parsed = JSON.parse(raw);
    return {
      ...defaultProgress(),
      ...parsed,
      bestScores: { ...parsed.bestScores },
      leaderboards: { ...parsed.leaderboards },
    };
  } catch (e) {
    return defaultProgress();
  }
}

function migrateFromV2() {
  // Compatibilidad con el guardado v2 (bestScore/leaderboard únicos, sin
  // distinguir juego): todo ese progreso pasa a pertenecer a "recolecta",
  // que era el único juego que existía en ese momento.
  try {
    const raw = localStorage.getItem("matichoc_save_v2");
    if (!raw) return defaultProgress();
    const old = JSON.parse(raw);
    const progress = {
      ...defaultProgress(),
      playerName: old.playerName || "",
      selectedCharacterId: old.selectedCharacterId || null,
      equippedOutfit: old.equippedOutfit || {},
      ownedOutfits: old.ownedOutfits || {},
      coins: old.coins || 0,
      unlockedLevel: old.unlockedLevel || 0,
    };
    if (old.bestScore) progress.bestScores.recolecta = old.bestScore;
    if (Array.isArray(old.leaderboard) && old.leaderboard.length) {
      progress.leaderboards.recolecta = old.leaderboard;
    }
    return progress;
  } catch (e) {
    return defaultProgress();
  }
}

export function saveProgress(progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    /* almacenamiento no disponible: se ignora silenciosamente */
  }
}

export function ownsOutfit(progress, characterId, outfitId) {
  if (outfitId === DEFAULT_OUTFIT) return true;
  return (progress.ownedOutfits[characterId] || []).includes(outfitId);
}

export function equippedOutfitId(progress, characterId) {
  return progress.equippedOutfit[characterId] || DEFAULT_OUTFIT;
}

export function buyOutfit(progress, characterId, outfit) {
  if (progress.coins < outfit.price) return false;
  if (ownsOutfit(progress, characterId, outfit.id)) return false;
  progress.coins -= outfit.price;
  if (!progress.ownedOutfits[characterId]) progress.ownedOutfits[characterId] = [];
  progress.ownedOutfits[characterId].push(outfit.id);
  progress.equippedOutfit[characterId] = outfit.id;
  saveProgress(progress);
  return true;
}

export function equipOutfit(progress, characterId, outfitId) {
  progress.equippedOutfit[characterId] = outfitId;
  saveProgress(progress);
}

export function getBestScore(progress, gameId) {
  return progress.bestScores[gameId] || 0;
}

/** Actualiza el mejor puntaje de un juego si corresponde; devuelve true si mejoró. */
export function reportScore(progress, gameId, score) {
  if (score > getBestScore(progress, gameId)) {
    progress.bestScores[gameId] = score;
    saveProgress(progress);
    return true;
  }
  return false;
}

export function getLeaderboard(progress, gameId) {
  return progress.leaderboards[gameId] || [];
}

export function addToLeaderboard(progress, gameId, name, score) {
  if (!progress.leaderboards[gameId]) progress.leaderboards[gameId] = [];
  const board = progress.leaderboards[gameId];
  board.push({ name: name || "Jugador", score, date: new Date().toISOString() });
  board.sort((a, b) => b.score - a.score);
  progress.leaderboards[gameId] = board.slice(0, MAX_LEADERBOARD);
  saveProgress(progress);
}

export { DEFAULT_OUTFIT };
