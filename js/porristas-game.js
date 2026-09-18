// Motor de "Saltos de Porristas": juego de equilibrio en el que se mueve una
// rebotadora (trampolín) para mantener a la Matichica rebotando sin que
// toque el suelo. Sobrevive el mayor tiempo/combo posible; un rebote fallado
// termina la partida. Ver ROADMAP.md → Etapa 7 para el diseño completo.

import { drawCharacter, getOutfit } from "./characters.js";
import { saveProgress, addToLeaderboard, equippedOutfitId, reportScore, earnCoins } from "./storage.js";
import * as audio from "./audio.js";
import { BRAND } from "./theme.js";

const GAME_ID = "porristas";
export const CANVAS_W = 800;
export const CANVAS_H = 480;

const GRAVITY = 900;
const BASE_BOUNCE = 560;
const PADDLE_Y = 420;
const PADDLE_SPEED = 300;
const PADDLE_BASE_W = 110;
const PADDLE_MIN_W = 70;

function randRange(a, b) {
  return a + Math.random() * (b - a);
}

export class PorristasGame {
  constructor(canvas, character, progress, els) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.character = character;
    this.progress = progress;
    this.els = els;

    this.keys = {};
    this.state = "intro"; // intro | playing | paused | gameover
    this.time = 0;
    this.lastTs = null;
    this.particles = [];

    this._bindInput();
    this._loop = this._loop.bind(this);
  }

  get outfit() {
    return getOutfit(equippedOutfitId(this.progress, this.character.id));
  }

  _bindInput() {
    const setKey = (key, value) => {
      if (key === "ArrowLeft" || key === "a" || key === "A") this.keys.left = value;
      if (key === "ArrowRight" || key === "d" || key === "D") this.keys.right = value;
    };
    window.addEventListener("keydown", (e) => {
      if (["ArrowLeft", "ArrowRight", "a", "A", "d", "D"].includes(e.key)) e.preventDefault();
      setKey(e.key, true);
    });
    window.addEventListener("keyup", (e) => setKey(e.key, false));

    const bindHold = (id, dir) => {
      const btn = document.getElementById(id);
      if (!btn) return;
      const press = (e) => { e.preventDefault(); this.keys[dir] = true; };
      const release = (e) => { e.preventDefault(); this.keys[dir] = false; };
      btn.addEventListener("pointerdown", press);
      btn.addEventListener("pointerup", release);
      btn.addEventListener("pointerleave", release);
      btn.addEventListener("pointercancel", release);
    };
    bindHold("porristas-btn-left", "left");
    bindHold("porristas-btn-right", "right");
  }

  start() {
    this._resetGame();
    requestAnimationFrame(this._loop);
  }

  _resetGame() {
    this.score = 0;
    this.combo = 0;
    this.coinsEarned = 0;
    this.particles = [];
    this.paddle = { x: CANVAS_W / 2, w: PADDLE_BASE_W };
    this.pompom = null;
    this.pompomTimer = randRange(3, 5);
    this.char = { x: CANVAS_W / 2, y: 120, vx: randRange(-60, 60), vy: 0 };
    this.state = "intro";
    this._updateHud();
    this._showOverlay("intro");
  }

  _driftRange() {
    return Math.min(200, 60 + this.score * 4);
  }

  _bounceStrength() {
    return Math.min(720, BASE_BOUNCE + this.score * 4);
  }

  _showOverlay(name) {
    Object.entries(this.els.overlays).forEach(([key, el]) => {
      el.classList.toggle("hidden", key !== name);
    });
    if (!name) Object.values(this.els.overlays).forEach((el) => el.classList.add("hidden"));
  }

  beginPlaying() {
    this.state = "playing";
    this._showOverlay(null);
  }

  pauseForMenu() {
    this.state = "paused";
    reportScore(this.progress, GAME_ID, this.score);
  }

  startRun(character, progress) {
    this.character = character;
    if (progress) this.progress = progress;
    this._resetGame();
  }

  retry() {
    this._resetGame();
  }

  _loop(ts) {
    if (this.lastTs == null) this.lastTs = ts;
    const dt = Math.min(0.05, (ts - this.lastTs) / 1000);
    this.lastTs = ts;
    this.time += dt;

    this.update(dt);
    this.render();

    requestAnimationFrame(this._loop);
  }

  update(dt) {
    this._updateParticles(dt);
    if (this.state !== "playing") return;

    this.paddle.w = Math.max(PADDLE_MIN_W, PADDLE_BASE_W - this.score * 1.2);
    if (this.keys.left) this.paddle.x -= PADDLE_SPEED * dt;
    if (this.keys.right) this.paddle.x += PADDLE_SPEED * dt;
    const halfW = this.paddle.w / 2;
    this.paddle.x = clamp(this.paddle.x, 40 + halfW, CANVAS_W - 40 - halfW);

    this.char.vy += GRAVITY * dt;
    this.char.x += this.char.vx * dt;
    this.char.y += this.char.vy * dt;
    if (this.char.x < 30 || this.char.x > CANVAS_W - 30) this.char.vx *= -1;
    this.char.x = clamp(this.char.x, 30, CANVAS_W - 30);

    this._updatePompom(dt);

    if (this.char.vy > 0 && this.char.y >= PADDLE_Y) {
      const withinPaddle = Math.abs(this.char.x - this.paddle.x) <= this.paddle.w / 2 + 14;
      if (withinPaddle) {
        this._onBounce();
      } else {
        this._onMiss();
      }
    }
  }

  _updatePompom(dt) {
    if (this.pompom) {
      const d = Math.hypot(this.pompom.x - this.char.x, this.pompom.y - this.char.y);
      if (d < 26) {
        const golden = this.pompom.golden;
        this.score += golden ? 15 : 5;
        if (golden) {
          earnCoins(this.progress, 10);
          this.coinsEarned += 10;
          saveProgress(this.progress);
        }
        audio.playBonusCollect();
        this._spawnPopup(this.pompom.x, this.pompom.y, golden ? "+10 🍫✨" : "+5");
        this._updateHud();
        this.pompom = null;
        this.pompomTimer = randRange(4, 7);
        return;
      }
      this.pompom.timer -= dt;
      if (this.pompom.timer <= 0) {
        this.pompom = null;
        this.pompomTimer = randRange(3, 6);
      }
    } else {
      this.pompomTimer -= dt;
      if (this.pompomTimer <= 0) {
        const golden = Math.random() < 0.25;
        this.pompom = {
          x: randRange(80, CANVAS_W - 80),
          y: randRange(140, 260),
          timer: 5,
          golden,
        };
      }
    }
  }

  _onBounce() {
    this.char.y = PADDLE_Y;
    this.char.vy = -this._bounceStrength();
    const centered = Math.abs(this.char.x - this.paddle.x) <= this.paddle.w * 0.3;
    this.combo = centered ? this.combo + 1 : 0;
    const gained = 10 + (centered ? Math.min(this.combo * 2, 20) : 0);
    this.score += gained;
    this.char.vx = randRange(-this._driftRange(), this._driftRange());
    audio.playBounce();
    this._spawnPopup(this.char.x, PADDLE_Y - 20, `+${gained}`);
    this._updateHud();
  }

  _onMiss() {
    this.state = "gameover";
    audio.playLose();
    reportScore(this.progress, GAME_ID, this.score);
    addToLeaderboard(this.progress, GAME_ID, this.progress.playerName, this.score);
    this.els.gameoverText.textContent =
      `Llegaste a ${this.score} puntos rebotando` +
      (this.coinsEarned > 0 ? `, ganando ${this.coinsEarned} monedas Dubai.` : ".");
    this._showOverlay("gameover");
  }

  _updateHud() {
    this.els.hudScore.textContent = String(this.score);
    this.els.hudCombo.textContent = String(this.combo);
    this.els.hudCoins.textContent = String(this.progress.coins);
  }

  _spawnPopup(x, y, text) {
    this.particles.push({ type: "popup", x, y, text, life: 0.8, maxLife: 0.8 });
  }

  _updateParticles(dt) {
    for (const p of this.particles) {
      p.life -= dt;
      if (p.type === "popup") p.y -= 30 * dt;
    }
    this.particles = this.particles.filter((p) => p.life > 0);
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    this._renderBackground();
    this._renderPompom();
    this._renderPaddle();
    this._renderCharacter();
    this._renderParticles();
  }

  _renderBackground() {
    const ctx = this.ctx;
    ctx.fillStyle = "#f7ecd9";
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    for (let x = 0; x < CANVAS_W; x += 48) {
      for (let y = 0; y < CANVAS_H; y += 48) {
        ctx.strokeStyle = "rgba(0,0,0,0.04)";
        ctx.strokeRect(x, y, 48, 48);
      }
    }
    ctx.fillStyle = "rgba(212,33,108,0.12)";
    ctx.fillRect(0, 30, CANVAS_W, 16);
  }

  _renderPompom() {
    if (!this.pompom) return;
    const ctx = this.ctx;
    const { x, y, golden } = this.pompom;
    const bob = Math.sin(this.time * 5) * 4;
    ctx.fillStyle = golden ? BRAND.gold : BRAND.pink;
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(x + Math.cos(a) * 10, y + bob + Math.sin(a) * 10, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(x, y + bob, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  _renderPaddle() {
    const ctx = this.ctx;
    const { x, w } = this.paddle;
    ctx.save();
    ctx.translate(x, PADDLE_Y + 10);
    const grad = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
    grad.addColorStop(0, BRAND.pinkDark);
    grad.addColorStop(0.5, BRAND.pink);
    grad.addColorStop(1, BRAND.pinkDark);
    ctx.fillStyle = grad;
    roundRect(ctx, -w / 2, -8, w, 16, 8);
    ctx.fill();
    ctx.strokeStyle = BRAND.gold;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = BRAND.brownDark;
    ctx.fillRect(-w / 2 + 8, 8, 6, 18);
    ctx.fillRect(w / 2 - 14, 8, 6, 18);
    ctx.restore();
  }

  _renderCharacter() {
    const moving = Math.abs(this.char.vx) > 5;
    const facing = this.char.vx >= 0 ? "right" : "left";
    drawCharacter(this.ctx, this.character, this.outfit, this.char.x, this.char.y, 64, this.time, moving, facing);
  }

  _renderParticles() {
    const ctx = this.ctx;
    for (const p of this.particles) {
      const alpha = Math.max(0, p.life / p.maxLife);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = BRAND.gold;
      ctx.font = "bold 16px 'Fredoka', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(p.text, p.x, p.y);
      ctx.globalAlpha = 1;
    }
  }
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
