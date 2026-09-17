import { CHARACTERS, OUTFITS, getOutfit, renderCharacterThumb } from "./characters.js";
import { Game } from "./game.js";
import * as audio from "./audio.js";
import { loadProgress, saveProgress, ownsOutfit, equippedOutfitId, buyOutfit, equipOutfit } from "./storage.js";

const progress = loadProgress();

const screenMenu = document.getElementById("screen-menu");
const screenShop = document.getElementById("screen-shop");
const screenLeaderboard = document.getElementById("screen-leaderboard");
const screenGame = document.getElementById("screen-game");

const grid = document.getElementById("character-grid");
const btnStart = document.getElementById("btn-start");
const inputName = document.getElementById("input-name");

let selectedCharacter = CHARACTERS.find((c) => c.id === progress.selectedCharacterId) || null;

inputName.value = progress.playerName || "";
inputName.addEventListener("input", () => {
  progress.playerName = inputName.value.trim();
  saveProgress(progress);
});

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
  card.addEventListener("click", () => selectCharacter(char, card));
  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") selectCharacter(char, card);
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
  renderCharacterGrid();
  btnStart.disabled = false;
  btnStart.textContent = `Jugar como ${char.name}`;
}

renderCharacterGrid();
if (selectedCharacter) {
  btnStart.disabled = false;
  btnStart.textContent = `Jugar como ${selectedCharacter.name}`;
}

btnStart.addEventListener("click", () => {
  if (!selectedCharacter) return;
  if (!progress.playerName) {
    progress.playerName = "Jugador";
    saveProgress(progress);
  }
  screenMenu.classList.add("hidden");
  screenGame.classList.remove("hidden");
  launchGame(selectedCharacter);
});

// ---------- TIENDA ----------

const btnOpenShop = document.getElementById("btn-open-shop");
const btnShopBack = document.getElementById("btn-shop-back");
const shopCoinsEl = document.getElementById("shop-coins");
const shopCharacterSwitcher = document.getElementById("shop-character-switcher");
const shopCharacterNameEl = document.getElementById("shop-character-name");
const outfitGrid = document.getElementById("outfit-grid");

// Personaje que se está personalizando en la tienda: no tiene por qué ser el
// mismo que el elegido para jugar, así se pueden ver los atuendos de todos.
let shopCharacterId = (selectedCharacter && selectedCharacter.id) || CHARACTERS[0].id;

btnOpenShop.addEventListener("click", () => {
  screenMenu.classList.add("hidden");
  screenShop.classList.remove("hidden");
  renderShopSwitcher();
  renderShop();
});

btnShopBack.addEventListener("click", () => {
  screenShop.classList.add("hidden");
  screenMenu.classList.remove("hidden");
});

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

    const card = document.createElement("div");
    card.className = "outfit-card" + (equipped ? " equipped" : "");

    const canvas = document.createElement("canvas");
    canvas.width = 96;
    canvas.height = 96;
    renderCharacterThumb(canvas, shopCharacter, outfit);

    const name = document.createElement("span");
    name.className = "oname";
    name.textContent = outfit.name;

    const price = document.createElement("span");
    price.className = "oprice";
    price.textContent = owned ? (equipped ? "Equipado" : "Adquirido") : `${outfit.price} 🍫✨`;

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
      button.textContent = "Comprar";
      button.disabled = progress.coins < outfit.price;
      button.addEventListener("click", () => {
        if (buyOutfit(progress, shopCharacter.id, outfit)) {
          audio.playPurchase();
          renderShopSwitcher();
          renderShop();
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
const leaderboardList = document.getElementById("leaderboard-list");
const leaderboardEmpty = document.getElementById("leaderboard-empty");

btnOpenLeaderboard.addEventListener("click", () => {
  screenMenu.classList.add("hidden");
  screenLeaderboard.classList.remove("hidden");
  renderLeaderboard();
});

btnLeaderboardBack.addEventListener("click", () => {
  screenLeaderboard.classList.add("hidden");
  screenMenu.classList.remove("hidden");
});

function renderLeaderboard() {
  leaderboardList.innerHTML = "";
  const isEmpty = progress.leaderboard.length === 0;
  leaderboardEmpty.classList.toggle("hidden", !isEmpty);
  leaderboardList.classList.toggle("hidden", isEmpty);
  if (isEmpty) return;
  progress.leaderboard.forEach((entry) => {
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

// ---------- JUEGO ----------

function launchGame(character) {
  const canvas = document.getElementById("game-canvas");
  const hudAvatar = document.getElementById("hud-avatar");
  const avatarCanvas = document.createElement("canvas");
  avatarCanvas.width = 40;
  avatarCanvas.height = 40;
  renderCharacterThumb(avatarCanvas, character, getOutfit(equippedOutfitId(progress, character.id)));
  hudAvatar.src = avatarCanvas.toDataURL();

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

  const game = new Game(canvas, character, progress, els);
  game.start();

  document.getElementById("btn-intro-continue").addEventListener("click", () => game.beginPlaying());
  document.getElementById("btn-next-level").addEventListener("click", () => game.nextLevel());
  document.getElementById("btn-retry").addEventListener("click", () => game.retry());
  document.getElementById("btn-play-again").addEventListener("click", () => game.restartGame());

  const btnMute = document.getElementById("btn-mute");
  btnMute.addEventListener("click", () => {
    const next = !audio.isMuted();
    audio.setMuted(next);
    btnMute.textContent = next ? "🔇" : "🔊";
  });
}
