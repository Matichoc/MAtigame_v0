import { CHARACTERS, renderCharacterThumb } from "./characters.js";
import { Game } from "./game.js";
import * as audio from "./audio.js";

const screenMenu = document.getElementById("screen-menu");
const screenGame = document.getElementById("screen-game");
const grid = document.getElementById("character-grid");
const btnStart = document.getElementById("btn-start");

let selectedCharacter = null;

CHARACTERS.forEach((char) => {
  const card = document.createElement("div");
  card.className = "character-card";
  card.tabIndex = 0;

  const canvas = document.createElement("canvas");
  canvas.width = 96;
  canvas.height = 96;
  renderCharacterThumb(canvas, char);

  const label = document.createElement("span");
  label.className = "cname";
  label.textContent = char.name;

  card.appendChild(canvas);
  card.appendChild(label);
  card.addEventListener("click", () => selectCharacter(char, card));
  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") selectCharacter(char, card);
  });

  grid.appendChild(card);
});

function selectCharacter(char, card) {
  selectedCharacter = char;
  document.querySelectorAll(".character-card").forEach((c) => c.classList.remove("selected"));
  card.classList.add("selected");
  btnStart.disabled = false;
  btnStart.textContent = `Jugar como ${char.name}`;
}

btnStart.addEventListener("click", () => {
  if (!selectedCharacter) return;
  screenMenu.classList.add("hidden");
  screenGame.classList.remove("hidden");
  launchGame(selectedCharacter);
});

function launchGame(character) {
  const canvas = document.getElementById("game-canvas");
  const hudAvatar = document.getElementById("hud-avatar");
  const avatarCanvas = document.createElement("canvas");
  avatarCanvas.width = 40;
  avatarCanvas.height = 40;
  renderCharacterThumb(avatarCanvas, character);
  hudAvatar.src = avatarCanvas.toDataURL();

  const els = {
    hudLevel: document.getElementById("hud-level"),
    hudMission: document.getElementById("hud-mission"),
    hudChoco: document.getElementById("hud-choco"),
    hudTarget: document.getElementById("hud-target"),
    hudScore: document.getElementById("hud-score"),
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

  const game = new Game(canvas, character, els);
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
