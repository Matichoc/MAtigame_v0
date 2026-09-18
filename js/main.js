import { CHARACTERS, OUTFITS, getOutfit, renderCharacterThumb } from "./characters.js";
import { Game } from "./game.js";
import { TetrisGame } from "./tetris-game.js";
import * as audio from "./audio.js";
import { GAMES_CATALOG } from "./games-catalog.js";
import {
  loadProgress, saveProgress, ownsOutfit, equippedOutfitId, buyOutfit, equipOutfit,
  getBestScore, getLeaderboard, canClaimDailyReward, claimDailyReward, claimAchievement,
} from "./storage.js";
import {
  listProfiles, createProfile, deleteProfile, updateProfileMeta,
  getLastActiveProfileId, setLastActiveProfileId, MAX_PROFILES,
} from "./profiles.js";
import { ACHIEVEMENTS } from "./achievements.js";

let progress = null;
let selectedCharacter = null;
let shopCharacterId = CHARACTERS[0].id;

const screenProfiles = document.getElementById("screen-profiles");
const screenHub = document.getElementById("screen-hub");
const screenShop = document.getElementById("screen-shop");
const screenLeaderboard = document.getElementById("screen-leaderboard");
const screenAchievements = document.getElementById("screen-achievements");
const screenGame = document.getElementById("screen-game");
const screenTetris = document.getElementById("screen-tetris");
const ALL_SCREENS = [screenProfiles, screenHub, screenShop, screenLeaderboard, screenAchievements, screenGame, screenTetris];

const grid = document.getElementById("character-grid");
const gameGrid = document.getElementById("game-grid");
const inputName = document.getElementById("input-name");
const hubTotalCoinsEl = document.getElementById("hub-total-coins");
const toastEl = document.getElementById("toast");

// Instancias únicas de cada motor, creadas recién la primera vez que se juegan
// y reutilizadas entre partidas y entre perfiles (ver rebind en playGame()).
const instances = { recolecta: null, tetris: null };

let toastTimer = null;
function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.remove("hidden");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.add("hidden"), 2600);
}

function showScreen(target) {
  ALL_SCREENS.forEach((s) => s.classList.toggle("hidden", s !== target));
}

inputName.addEventListener("input", () => {
  progress.playerName = inputName.value.trim();
  saveProgress(progress);
  if (progress.playerName) updateProfileMeta(progress._profileId, { name: progress.playerName });
  updateProfileChip();
});

function refreshHubStats() {
  hubTotalCoinsEl.textContent = String(progress.coins);
}

// ---------- PERFILES ("¿Quién juega?") ----------

const profileGridEl = document.getElementById("profile-grid");
const newProfileForm = document.getElementById("new-profile-form");
const newProfileNameInput = document.getElementById("new-profile-name");

function renderProfileScreen() {
  profileGridEl.innerHTML = "";
  newProfileForm.classList.add("hidden");
  const profiles = listProfiles();

  profiles.forEach((p) => {
    const card = document.createElement("div");
    card.className = "profile-card";

    const char = CHARACTERS.find((c) => c.id === p.characterId);
    if (char) {
      const canvas = document.createElement("canvas");
      canvas.width = 64;
      canvas.height = 64;
      renderCharacterThumb(canvas, char, getOutfit("liga"));
      card.appendChild(canvas);
    } else {
      const placeholder = document.createElement("div");
      placeholder.className = "profile-placeholder";
      placeholder.textContent = "🍫";
      card.appendChild(placeholder);
    }

    const name = document.createElement("span");
    name.className = "pname";
    name.textContent = p.name;
    card.appendChild(name);

    const delBtn = document.createElement("button");
    delBtn.className = "btn-delete-profile";
    delBtn.textContent = "✕";
    delBtn.title = "Eliminar perfil";
    delBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (window.confirm(`¿Eliminar el perfil de ${p.name}? Se borrará todo su progreso.`)) {
        deleteProfile(p.id);
        renderProfileScreen();
      }
    });
    card.appendChild(delBtn);

    card.addEventListener("click", () => chooseProfile(p.id));
    profileGridEl.appendChild(card);
  });

  if (profiles.length < MAX_PROFILES) {
    const addCard = document.createElement("div");
    addCard.className = "profile-card add-profile";
    const plus = document.createElement("span");
    plus.className = "plus-icon";
    plus.textContent = "+";
    const label = document.createElement("span");
    label.textContent = "Nuevo jugador";
    addCard.appendChild(plus);
    addCard.appendChild(label);
    addCard.addEventListener("click", () => {
      newProfileForm.classList.remove("hidden");
      newProfileNameInput.value = "";
      newProfileNameInput.focus();
    });
    profileGridEl.appendChild(addCard);
  }
}

document.getElementById("btn-create-profile").addEventListener("click", () => {
  const name = newProfileNameInput.value.trim() || "Jugador";
  const p = createProfile(name);
  chooseProfile(p.id);
});
document.getElementById("btn-cancel-profile").addEventListener("click", () => {
  newProfileForm.classList.add("hidden");
});

function chooseProfile(id) {
  setLastActiveProfileId(id);
  progress = loadProgress(id);
  selectedCharacter = CHARACTERS.find((c) => c.id === progress.selectedCharacterId) || null;
  shopCharacterId = (selectedCharacter && selectedCharacter.id) || CHARACTERS[0].id;
  bootHub();
  showScreen(screenHub);
}

function goToProfiles() {
  Object.values(instances).forEach((instance) => instance && instance.pauseForMenu());
  renderProfileScreen();
  showScreen(screenProfiles);
}

document.getElementById("btn-switch-profile").addEventListener("click", goToProfiles);

function updateProfileChip() {
  const profiles = listProfiles();
  const current = profiles.find((p) => p.id === progress._profileId);
  document.getElementById("hub-profile-name").textContent = (current && current.name) || progress.playerName || "Jugador";
  const avatarImg = document.getElementById("hub-profile-avatar");
  if (selectedCharacter) {
    const c = document.createElement("canvas");
    c.width = 40;
    c.height = 40;
    renderCharacterThumb(c, selectedCharacter, getOutfit(equippedOutfitId(progress, selectedCharacter.id)));
    avatarImg.src = c.toDataURL();
  }
}

function bootHub() {
  inputName.value = progress.playerName || "";
  renderCharacterGrid();
  renderGameGrid();
  refreshHubStats();
  updateDailyRewardButton();
  updateProfileChip();
}

// ---------- RECOMPENSA DIARIA ----------

const btnDailyReward = document.getElementById("btn-daily-reward");

function updateDailyRewardButton() {
  const can = canClaimDailyReward(progress);
  btnDailyReward.disabled = !can;
  btnDailyReward.textContent = can
    ? "🎁 Recompensa diaria"
    : `🎁 Reclamado (racha ${progress.dailyStreak} día${progress.dailyStreak === 1 ? "" : "s"})`;
}

btnDailyReward.addEventListener("click", () => {
  const result = claimDailyReward(progress);
  if (!result) return;
  audio.playPurchase();
  refreshHubStats();
  updateDailyRewardButton();
  showToast(`¡+${result.reward} monedas! Racha de ${result.streak} día${result.streak === 1 ? "" : "s"} 🔥`);
});

// ---------- LOGROS ----------

const achievementListEl = document.getElementById("achievement-list");

document.getElementById("btn-open-achievements").addEventListener("click", () => {
  showScreen(screenAchievements);
  renderAchievements();
});
document.getElementById("btn-achievements-back").addEventListener("click", () => showScreen(screenHub));

function renderAchievements() {
  achievementListEl.innerHTML = "";
  ACHIEVEMENTS.forEach((a) => {
    const done = a.isDone(progress);
    const claimed = progress.claimedAchievements.includes(a.id);

    const card = document.createElement("div");
    card.className = "achievement-card" + (done ? " done" : "");

    const icon = document.createElement("span");
    icon.className = "aicon";
    icon.textContent = a.icon;

    const body = document.createElement("div");
    body.className = "abody";
    const name = document.createElement("span");
    name.className = "aname";
    name.textContent = a.name;
    const desc = document.createElement("div");
    desc.className = "adesc";
    desc.textContent = `${a.desc} (+${a.reward} 🍫✨)`;
    body.appendChild(name);
    body.appendChild(desc);

    const button = document.createElement("button");
    if (claimed) {
      button.textContent = "Reclamado ✓";
      button.disabled = true;
    } else if (done) {
      button.textContent = "Reclamar";
      button.addEventListener("click", () => {
        if (claimAchievement(progress, a)) {
          audio.playPurchase();
          refreshHubStats();
          renderAchievements();
          showToast(`¡Logro cumplido! +${a.reward} monedas 🎉`);
        }
      });
    } else {
      button.textContent = "Bloqueado";
      button.disabled = true;
    }

    card.appendChild(icon);
    card.appendChild(body);
    card.appendChild(button);
    achievementListEl.appendChild(card);
  });
}

// ---------- SELECCIÓN DE PERSONAJE ----------

function characterCard(char) {
  const card = document.createElement("div");
  card.className = "character-card";
  card.tabIndex = 0;

  const canvas = document.createElement("canvas");
  canvas.width = 96;
  canvas.height = 96;
  renderCharacterThumb(canvas, char, getOutfit(equippedOutfitId(progress, char.id)));

  const label = document.createElement("span");
  label.className = "cname";
  label.textContent = char.name;

  card.appendChild(canvas);
  card.appendChild(label);
  card.addEventListener("click", () => selectCharacter(char));
  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") selectCharacter(char);
  });

  return card;
}

function renderCharacterGrid() {
  grid.innerHTML = "";
  CHARACTERS.forEach((char) => {
    const card = characterCard(char);
    if (selectedCharacter && selectedCharacter.id === char.id) card.classList.add("selected");
    grid.appendChild(card);
  });
}

function selectCharacter(char) {
  selectedCharacter = char;
  progress.selectedCharacterId = char.id;
  saveProgress(progress);
  updateProfileMeta(progress._profileId, { characterId: char.id });
  renderCharacterGrid();
  renderGameGrid();
  updateProfileChip();
}

// ---------- SELECCIÓN DE JUEGO ----------

function renderGameGrid() {
  gameGrid.innerHTML = "";
  GAMES_CATALOG.forEach((entry) => {
    const card = document.createElement("div");
    card.className = `game-card ${entry.status}`;

    const icon = document.createElement("span");
    icon.className = "gicon";
    icon.textContent = entry.icon;

    const name = document.createElement("span");
    name.className = "gname";
    name.textContent = entry.name;

    const tagline = document.createElement("span");
    tagline.className = "gtagline";
    tagline.textContent = entry.tagline;

    card.appendChild(icon);
    card.appendChild(name);
    card.appendChild(tagline);

    if (entry.status === "available") {
      const best = getBestScore(progress, entry.id);
      if (best > 0) {
        const bestEl = document.createElement("span");
        bestEl.className = "gbest";
        bestEl.textContent = `Tu mejor: ${best} pts`;
        card.appendChild(bestEl);
      }
      const badge = document.createElement("span");
      badge.className = "gbadge";
      badge.textContent = "Jugar";
      card.appendChild(badge);
      card.addEventListener("click", () => playGame(entry.id));
    } else {
      const badge = document.createElement("span");
      badge.className = "gbadge";
      badge.textContent = "Próximamente";
      card.appendChild(badge);
    }

    gameGrid.appendChild(card);
  });
}

function playGame(gameId) {
  if (!selectedCharacter) {
    window.alert("Elige primero a tu Matichico.");
    return;
  }
  if (!progress.playerName) {
    progress.playerName = "Jugador";
    inputName.value = progress.playerName;
    saveProgress(progress);
  }

  // Nunca deben quedar dos juegos "activos" a la vez (evita que uno siga
  // corriendo lógica de fondo mientras se muestra el otro).
  Object.values(instances).forEach((instance) => instance && instance.pauseForMenu());

  if (gameId === "recolecta") {
    showScreen(screenGame);
    launchOrResumeRecolecta();
  } else if (gameId === "tetris") {
    showScreen(screenTetris);
    launchOrResumeTetris();
  }
}

function goToHub() {
  Object.values(instances).forEach((instance) => instance && instance.pauseForMenu());
  refreshHubStats();
  renderCharacterGrid();
  renderGameGrid();
  updateDailyRewardButton();
  showScreen(screenHub);
}

// ---------- TIENDA ----------

const btnOpenShop = document.getElementById("btn-open-shop");
const btnShopBack = document.getElementById("btn-shop-back");
const shopCoinsEl = document.getElementById("shop-coins");
const shopCharacterSwitcher = document.getElementById("shop-character-switcher");
const shopCharacterNameEl = document.getElementById("shop-character-name");
const outfitGrid = document.getElementById("outfit-grid");

btnOpenShop.addEventListener("click", () => {
  showScreen(screenShop);
  renderShopSwitcher();
  renderShop();
});

btnShopBack.addEventListener("click", () => showScreen(screenHub));

function renderShopSwitcher() {
  shopCharacterSwitcher.innerHTML = "";
  CHARACTERS.forEach((char) => {
    const btn = document.createElement("button");
    btn.className = "shop-switch-btn" + (char.id === shopCharacterId ? " active" : "");
    const canvas = document.createElement("canvas");
    canvas.width = 48;
    canvas.height = 48;
    renderCharacterThumb(canvas, char, getOutfit(equippedOutfitId(progress, char.id)));
    btn.appendChild(canvas);
    btn.addEventListener("click", () => {
      shopCharacterId = char.id;
      renderShopSwitcher();
      renderShop();
    });
    shopCharacterSwitcher.appendChild(btn);
  });
}

function renderShop() {
  const shopCharacter = CHARACTERS.find((c) => c.id === shopCharacterId);
  shopCoinsEl.textContent = String(progress.coins);
  shopCharacterNameEl.textContent = `Atuendos de ${shopCharacter.name}`;
  outfitGrid.innerHTML = "";

  OUTFITS.forEach((outfit) => {
    const owned = ownsOutfit(progress, shopCharacter.id, outfit.id);
    const equipped = equippedOutfitId(progress, shopCharacter.id) === outfit.id;
    const affordable = progress.coins >= outfit.price;

    const card = document.createElement("div");
    card.className = "outfit-card" + (equipped ? " equipped" : "") + (!owned && !affordable ? " locked" : "");

    if (equipped) {
      const ribbon = document.createElement("span");
      ribbon.className = "oribbon";
      ribbon.textContent = "EQUIPADO";
      card.appendChild(ribbon);
    }

    const canvas = document.createElement("canvas");
    canvas.width = 96;
    canvas.height = 96;
    renderCharacterThumb(canvas, shopCharacter, outfit);

    const name = document.createElement("span");
    name.className = "oname";
    name.textContent = outfit.name;

    const price = document.createElement("span");
    price.className = "oprice" + (owned ? " owned" : "");
    price.textContent = owned ? (equipped ? "Equipado" : "Adquirido") : `🍫✨ ${outfit.price}`;

    const button = document.createElement("button");
    if (equipped) {
      button.textContent = "Equipado";
      button.disabled = true;
    } else if (owned) {
      button.textContent = "Equipar";
      button.classList.add("equip-btn");
      button.addEventListener("click", () => {
        equipOutfit(progress, shopCharacter.id, outfit.id);
        renderShopSwitcher();
        renderShop();
      });
    } else {
      button.textContent = affordable ? "Comprar" : "🔒 Bloqueado";
      button.disabled = !affordable;
      button.addEventListener("click", () => {
        if (buyOutfit(progress, shopCharacter.id, outfit)) {
          audio.playPurchase();
          renderShopSwitcher();
          renderShop();
          refreshHubStats();
          showToast(`¡Compraste ${outfit.name}!`);
        }
      });
    }

    card.appendChild(canvas);
    card.appendChild(name);
    card.appendChild(price);
    card.appendChild(button);
    outfitGrid.appendChild(card);
  });
}

// ---------- TABLA DE PUNTAJES ----------

const btnOpenLeaderboard = document.getElementById("btn-open-leaderboard");
const btnLeaderboardBack = document.getElementById("btn-leaderboard-back");
const leaderboardTabs = document.getElementById("leaderboard-tabs");
const leaderboardList = document.getElementById("leaderboard-list");
const leaderboardEmpty = document.getElementById("leaderboard-empty");

const availableGames = GAMES_CATALOG.filter((g) => g.status === "available");
let leaderboardGameId = availableGames[0]?.id;

btnOpenLeaderboard.addEventListener("click", () => {
  showScreen(screenLeaderboard);
  renderLeaderboardTabs();
  renderLeaderboard();
});

btnLeaderboardBack.addEventListener("click", () => showScreen(screenHub));

function renderLeaderboardTabs() {
  leaderboardTabs.innerHTML = "";
  availableGames.forEach((g) => {
    const tab = document.createElement("button");
    tab.className = "leaderboard-tab" + (g.id === leaderboardGameId ? " active" : "");
    tab.textContent = `${g.icon} ${g.name}`;
    tab.addEventListener("click", () => {
      leaderboardGameId = g.id;
      renderLeaderboardTabs();
      renderLeaderboard();
    });
    leaderboardTabs.appendChild(tab);
  });
}

function renderLeaderboard() {
  leaderboardList.innerHTML = "";
  const board = getLeaderboard(progress, leaderboardGameId);
  const isEmpty = board.length === 0;
  leaderboardEmpty.classList.toggle("hidden", !isEmpty);
  leaderboardList.classList.toggle("hidden", isEmpty);
  if (isEmpty) return;
  board.forEach((entry) => {
    const li = document.createElement("li");
    const name = document.createElement("span");
    name.className = "lb-name";
    name.textContent = entry.name;
    const score = document.createElement("span");
    score.className = "lb-score";
    score.textContent = `${entry.score} pts`;
    li.appendChild(name);
    li.appendChild(score);
    leaderboardList.appendChild(li);
  });
}

// ---------- JUEGO: "RECOLECTA Y CORRE" ----------

function updateHudAvatar(imgId, character) {
  const hudAvatar = document.getElementById(imgId);
  const avatarCanvas = document.createElement("canvas");
  avatarCanvas.width = 40;
  avatarCanvas.height = 40;
  renderCharacterThumb(avatarCanvas, character, getOutfit(equippedOutfitId(progress, character.id)));
  hudAvatar.src = avatarCanvas.toDataURL();
}

function launchOrResumeRecolecta() {
  updateHudAvatar("hud-avatar", selectedCharacter);

  if (!instances.recolecta) {
    const canvas = document.getElementById("game-canvas");
    const els = {
      hudLevel: document.getElementById("hud-level"),
      hudMission: document.getElementById("hud-mission"),
      hudChoco: document.getElementById("hud-choco"),
      hudTarget: document.getElementById("hud-target"),
      hudScore: document.getElementById("hud-score"),
      hudCoins: document.getElementById("hud-coins"),
      hudTimer: document.getElementById("hud-timer"),
      hudTimerChip: document.getElementById("hud-timer-chip"),
      introTitle: document.getElementById("intro-title"),
      introText: document.getElementById("intro-text"),
      winText: document.getElementById("win-text"),
      loseText: document.getElementById("lose-text"),
      victoryText: document.getElementById("victory-text"),
      overlays: {
        intro: document.getElementById("overlay-intro"),
        win: document.getElementById("overlay-win"),
        lose: document.getElementById("overlay-lose"),
        victory: document.getElementById("overlay-victory"),
      },
    };

    const game = new Game(canvas, selectedCharacter, progress, els);
    instances.recolecta = game;
    game.start();

    document.getElementById("btn-intro-continue").addEventListener("click", () => game.beginPlaying());
    document.getElementById("btn-next-level").addEventListener("click", () => game.nextLevel());
    document.getElementById("btn-retry").addEventListener("click", () => game.retry());
    document.getElementById("btn-play-again").addEventListener("click", () => game.startRun(selectedCharacter, progress));
    document.getElementById("btn-menu").addEventListener("click", goToHub);
    document.getElementById("btn-lose-menu").addEventListener("click", goToHub);
    document.getElementById("btn-victory-menu").addEventListener("click", goToHub);

    const btnMute = document.getElementById("btn-mute");
    btnMute.addEventListener("click", () => {
      const next = !audio.isMuted();
      audio.setMuted(next);
      btnMute.textContent = next ? "🔇" : "🔊";
    });
  } else {
    // Rebind: si se cambió de perfil desde la última vez, hay que apuntar
    // el motor al nuevo personaje/progreso (nunca se recrea la instancia).
    instances.recolecta.startRun(selectedCharacter, progress);
  }
}

// ---------- JUEGO: "TETRIS DE PRODUCTOS" ----------

function launchOrResumeTetris() {
  updateHudAvatar("tetris-hud-avatar", selectedCharacter);

  if (!instances.tetris) {
    const canvas = document.getElementById("tetris-canvas");
    const els = {
      hudScore: document.getElementById("tetris-hud-score"),
      hudLines: document.getElementById("tetris-hud-lines"),
      hudLevel: document.getElementById("tetris-hud-level"),
      hudCoins: document.getElementById("tetris-hud-coins"),
      gameoverText: document.getElementById("tetris-gameover-text"),
      overlays: {
        intro: document.getElementById("tetris-overlay-intro"),
        gameover: document.getElementById("tetris-overlay-gameover"),
      },
    };

    const tetris = new TetrisGame(canvas, selectedCharacter, progress, els);
    instances.tetris = tetris;
    tetris.start();

    document.getElementById("tetris-btn-start").addEventListener("click", () => tetris.beginPlaying());
    document.getElementById("tetris-btn-retry").addEventListener("click", () => tetris.retry());
    document.getElementById("tetris-btn-menu").addEventListener("click", goToHub);
    document.getElementById("tetris-btn-gameover-menu").addEventListener("click", goToHub);

    const btnMute = document.getElementById("tetris-btn-mute");
    btnMute.addEventListener("click", () => {
      const next = !audio.isMuted();
      audio.setMuted(next);
      btnMute.textContent = next ? "🔇" : "🔊";
    });
  } else {
    instances.tetris.startRun(selectedCharacter, progress);
  }
}

// ---------- ARRANQUE ----------

const existingProfiles = listProfiles();
const lastActiveId = getLastActiveProfileId();
if (lastActiveId && existingProfiles.some((p) => p.id === lastActiveId)) {
  chooseProfile(lastActiveId);
} else {
  goToProfiles();
}
