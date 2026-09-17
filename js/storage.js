// Estado persistente compartido entre el menú y el juego (localStorage).

const STORAGE_KEY = "matichoc_save_v2";
const DEFAULT_OUTFIT = "liga";
const MAX_LEADERBOARD = 10;

function defaultProgress() {
  return {
    playerName: "",
    selectedCharacterId: null,
    equippedOutfit: {}, // { [characterId]: outfitId }
    ownedOutfits: {}, // { [characterId]: [outfitId, ...] }
    coins: 0,
    bestScore: 0,
    unlockedLevel: 0,
    leaderboard: [], // [{ name, score, date }]
  };
}

export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return migrateLegacy();
    const parsed = JSON.parse(raw);
    return { ...defaultProgress(), ...parsed };
  } catch (e) {
    return defaultProgress();
  }
}

function migrateLegacy() {
  // Compatibilidad con el guardado simple de la v1 (bestScore/unlockedLevel).
  try {
    const raw = localStorage.getItem("matichoc_save_v1");
    if (!raw) return defaultProgress();
    const old = JSON.parse(raw);
    return { ...defaultProgress(), bestScore: old.bestScore || 0, unlockedLevel: old.unlockedLevel || 0 };
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

export function addToLeaderboard(progress, name, score) {
  const entry = { name: name || "Jugador", score, date: new Date().toISOString() };
  progress.leaderboard.push(entry);
  progress.leaderboard.sort((a, b) => b.score - a.score);
  progress.leaderboard = progress.leaderboard.slice(0, MAX_LEADERBOARD);
  saveProgress(progress);
}

export { DEFAULT_OUTFIT };
