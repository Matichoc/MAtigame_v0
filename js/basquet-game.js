// Motor de "Lanzamientos de Básquet": tiro libre contra el reloj con una
// barra de puntería (horizontal) y una de potencia (vertical), cada una con
// un marcador que oscila y hay que fijar en el momento justo con ESPACIO/tap.
// Ver ROADMAP.md → Etapa 6 para el diseño completo.

import { drawCharacter, getOutfit } from "./characters.js";
import { saveProgress, addToLeaderboard, equippedOutfitId, reportScore, earnCoins } from "./storage.js";
import * as audio from "./audio.js";
import { BRAND } from "./theme.js";

const GAME_ID = "basquet_tiros";
export const CANVAS_W = 800;
export const CANVAS_H = 480;

const TIME_LIMIT = 60;
const HOOP = { x: 660, y: 150, r: 10 };
const SHOOTER = { x: 140, y: 360 };
const AIM_TARGET = 0.5;
const POWER_TARGET = 0.7;
const GOLDEN_EVERY = 5;

function oscillate(t, speed) {
  return (Math.sin(t * speed) + 1) / 2;
}

export class BasquetGame {
  constructor(canvas, character, progress, els) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.character = character;
    this.progress = progress;
    this.els = els;

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
    window.addEventListener("keydown", (e) => {
      if (e.code === "Space" || e.key === " ") {
        e.preventDefault();
        this._tryAction();
      }
    });
    const shootBtn = document.getElementById("basquet-btn-shoot");
    if (shootBtn) {
      shootBtn.addEventListener("pointerdown", (e) => { e.preventDefault(); this._tryAction(); });
    }
  }

  start() {
    this._resetGame();
    requestAnimationFrame(this._loop);
  }

  _resetGame() {
    this.timeLeft = TIME_LIMIT;
    this.score = 0;
    this.made = 0;
    this.attempts = 0;
    this.coinsEarned = 0;
    this.particles = [];
    this.ball = null;
    this.state = "intro";
    this._updateHud();
    this._showOverlay("intro");
    this._startShot();
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

  _difficultyIndex() {
    return this.attempts;
  }

  _accTolerance() {
    return Math.max(0.05, 0.16 - this._difficultyIndex() * 0.006);
  }

  _powTolerance() {
    return Math.max(0.045, 0.14 - this._difficultyIndex() * 0.006);
  }

  _isGolden() {
    return this.attempts % GOLDEN_EVERY === GOLDEN_EVERY - 1;
  }

  _startShot() {
    this.stage = "aim";
    this.aimTime = 0;
    this.powerTime = 0;
    this.aimValue = 0;
    this.powerValue = 0;
    this.aimLocked = null;
    this.powerLocked = null;
    this.aimSpeed = 2.2 + this._difficultyIndex() * 0.08;
    this.powerSpeed = 2.6 + this._difficultyIndex() * 0.08;
    this.resultTimer = 0;
    this.lastResult = null;
  }

  _tryAction() {
    if (this.state !== "playing") return;
    if (this.stage === "aim") {
      this.aimLocked = this.aimValue;
      this.stage = "power";
      this.powerTime = 0;
      audio.playJump();
    } else if (this.stage === "power") {
      this.powerLocked = this.powerValue;
      this._launchBall();
      audio.playJump();
    }
  }

  _launchBall() {
    this.stage = "flying";
    this.flightTime = 0;
    this.flightDuration = 0.6;
    const accError = Math.abs(this.aimLocked - AIM_TARGET);
    const powError = Math.abs(this.powerLocked - POWER_TARGET);
    const made = accError <= this._accTolerance() && powError <= this._powTolerance();
    const clean = made && accError <= this._accTolerance() / 2 && powError <= this._powTolerance() / 2;
    this.ball = {
      x: SHOOTER.x, y: SHOOTER.y,
      startX: SHOOTER.x, startY: SHOOTER.y,
      endX: made ? HOOP.x : HOOP.x + (this.aimLocked - AIM_TARGET) * 220,
      endY: made ? HOOP.y : HOOP.y - 30 + Math.random() * 60,
      made, clean,
    };
  }

  _resolveShot() {
    const golden = this._isGolden();
    this.attempts++;
    if (this.ball.made) {
      this.made++;
      let gained = 20 + (this.ball.clean ? 10 : 0);
      if (golden) {
        gained += 10;
        earnCoins(this.progress, 15);
        this.coinsEarned += 15;
        saveProgress(this.progress);
      }
      this.score += gained;
      audio.playBonusCollect();
      this._spawnConfetti(HOOP.x, HOOP.y);
      this._spawnPopup(HOOP.x, HOOP.y - 20, `+${gained}`);
    } else {
      audio.playBump();
    }
    this._updateHud();
    this.stage = "result";
    this.resultTimer = 0.9;
  }

  _updateHud() {
    this.els.hudScore.textContent = String(this.score);
    this.els.hudMade.textContent = String(this.made);
    this.els.hudAttempts.textContent = String(this.attempts);
    this.els.hudCoins.textContent = String(this.progress.coins);
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

    this.timeLeft -= dt;
    const timerEl = this.els.hudTimerChip;
    if (this.timeLeft <= 10) timerEl.classList.add("low"); else timerEl.classList.remove("low");
    this.els.hudTimer.textContent = String(Math.max(0, Math.ceil(this.timeLeft))).padStart(2, "0");
    if (this.timeLeft <= 0) {
      this._onGameOver();
      return;
    }

    if (this.stage === "aim") {
      this.aimTime += dt;
      this.aimValue = oscillate(this.aimTime, this.aimSpeed);
    } else if (this.stage === "power") {
      this.powerTime += dt;
      this.powerValue = oscillate(this.powerTime, this.powerSpeed);
    } else if (this.stage === "flying") {
      this.flightTime += dt;
      const t = Math.min(1, this.flightTime / this.flightDuration);
      this.ball.x = this.ball.startX + (this.ball.endX - this.ball.startX) * t;
      this.ball.y = this.ball.startY + (this.ball.endY - this.ball.startY) * t - Math.sin(t * Math.PI) * 140;
      if (t >= 1) this._resolveShot();
    } else if (this.stage === "result") {
      this.resultTimer -= dt;
      if (this.resultTimer <= 0) this._startShot();
    }
  }

  _spawnPopup(x, y, text) {
    this.particles.push({ type: "popup", x, y, text, life: 0.8, maxLife: 0.8 });
  }

  _spawnConfetti(x, y) {
    for (let i = 0; i < 24; i++) {
      this.particles.push({
        type: "confetti", x, y,
        vx: (Math.random() - 0.5) * 160,
        vy: -60 - Math.random() * 100,
        color: [BRAND.gold, BRAND.pink, BRAND.green, "#ffffff"][Math.floor(Math.random() * 4)],
        life: 0.8 + Math.random(), maxLife: 1.8,
        size: 3 + Math.random() * 3,
      });
    }
  }

  _updateParticles(dt) {
    for (const p of this.particles) {
      p.life -= dt;
      if (p.type === "popup") p.y -= 30 * dt;
      if (p.type === "confetti") { p.y += p.vy * dt; p.x += p.vx * dt; p.vy += 220 * dt; }
    }
    this.particles = this.particles.filter((p) => p.life > 0);
  }

  _onGameOver() {
    this.state = "gameover";
    audio.playLose();
    reportScore(this.progress, GAME_ID, this.score);
    addToLeaderboard(this.progress, GAME_ID, this.progress.playerName, this.score);
    this.els.gameoverText.textContent =
      `Encestaste ${this.made} de ${this.attempts} tiros y sumaste ${this.score} puntos` +
      (this.coinsEarned > 0 ? `, ganando ${this.coinsEarned} monedas Dubai.` : ".");
    this._showOverlay("gameover");
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    this._renderCourt();
    this._renderHoop();
    this._renderShooter();
    if (this.stage === "flying" || this.stage === "result") this._renderBall();
    this._renderMeters();
    this._renderParticles();
  }

  _renderCourt() {
    const ctx = this.ctx;
    ctx.fillStyle = "#c98a4b";
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.strokeStyle = "#3a2411";
    ctx.lineWidth = 2;
    for (let x = 0; x < CANVAS_W; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 24);
      ctx.lineTo(x, CANVAS_H - 24);
      ctx.strokeStyle = "rgba(0,0,0,0.05)";
      ctx.stroke();
    }
    ctx.fillStyle = BRAND.brownDark;
    ctx.fillRect(0, CANVAS_H - 40, CANVAS_W, 40);
  }

  _renderHoop() {
    const ctx = this.ctx;
    const golden = this._isGolden();
    const { x, y } = HOOP;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x + 30, y - 60, 8, 130);
    ctx.strokeStyle = golden ? BRAND.gold : "#e8622c";
    ctx.lineWidth = golden ? 5 : 3;
    if (golden) {
      ctx.save();
      ctx.shadowColor = BRAND.gold;
      ctx.shadowBlur = 16;
    }
    ctx.beginPath();
    ctx.ellipse(x, y, 32, 8, 0, 0, Math.PI * 2);
    ctx.stroke();
    if (golden) ctx.restore();
    ctx.strokeStyle = "rgba(255,255,255,0.7)";
    ctx.lineWidth = 1.5;
    for (let i = -3; i <= 3; i++) {
      ctx.beginPath();
      ctx.moveTo(x + i * 9, y + 2);
      ctx.lineTo(x + i * 5, y + 34);
      ctx.stroke();
    }
  }

  _renderShooter() {
    const bob = Math.sin(this.time * 2.4) * 3;
    drawCharacter(this.ctx, this.character, this.outfit, SHOOTER.x, SHOOTER.y + bob, 96, this.time, false, "right");
  }

  _renderBall() {
    const ctx = this.ctx;
    const { x, y } = this.ball;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(this.flightTime * 8);
    ctx.fillStyle = "#e8622c";
    ctx.beginPath();
    ctx.arc(0, 0, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#5a2e10";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-13, 0); ctx.lineTo(13, 0);
    ctx.moveTo(0, -13); ctx.lineTo(0, 13);
    ctx.stroke();
    ctx.restore();
  }

  _renderMeters() {
    const ctx = this.ctx;
    if (this.state !== "playing") return;

    // Barra de puntería (horizontal)
    const barX = CANVAS_W / 2 - 150, barY = 70, barW = 300, barH = 18;
    const accTol = this._accTolerance();
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fillRect(barX, barY, barW, barH);
    ctx.fillStyle = "rgba(207,215,103,0.55)";
    ctx.fillRect(barX + (AIM_TARGET - accTol) * barW, barY, accTol * 2 * barW, barH);
    if (this.stage === "aim") {
      ctx.fillStyle = BRAND.pink;
      ctx.fillRect(barX + this.aimValue * barW - 2, barY - 4, 4, barH + 8);
    } else if (this.aimLocked != null) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(barX + this.aimLocked * barW - 2, barY - 4, 4, barH + 8);
    }
    ctx.fillStyle = "#fff6e6";
    ctx.font = "bold 12px 'Fredoka', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Puntería", barX + barW / 2, barY - 10);

    // Barra de potencia (vertical)
    const pBarX = barX + barW + 40, pBarY = 40, pBarW = 18, pBarH = 200;
    const powTol = this._powTolerance();
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fillRect(pBarX, pBarY, pBarW, pBarH);
    const targetY = pBarY + pBarH - POWER_TARGET * pBarH;
    ctx.fillStyle = "rgba(207,215,103,0.55)";
    ctx.fillRect(pBarX, targetY - powTol * pBarH, pBarW, powTol * 2 * pBarH);
    if (this.stage === "power") {
      const markerY = pBarY + pBarH - this.powerValue * pBarH;
      ctx.fillStyle = BRAND.pink;
      ctx.fillRect(pBarX - 4, markerY - 2, pBarW + 8, 4);
    } else if (this.powerLocked != null) {
      const markerY = pBarY + pBarH - this.powerLocked * pBarH;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(pBarX - 4, markerY - 2, pBarW + 8, 4);
    }
    ctx.fillText("Potencia", pBarX + pBarW / 2, pBarY - 10);
  }

  _renderParticles() {
    const ctx = this.ctx;
    for (const p of this.particles) {
      const alpha = Math.max(0, p.life / p.maxLife);
      if (p.type === "popup") {
        ctx.globalAlpha = alpha;
        ctx.fillStyle = BRAND.gold;
        ctx.font = "bold 16px 'Fredoka', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(p.text, p.x, p.y);
        ctx.globalAlpha = 1;
      } else if (p.type === "confetti") {
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
        ctx.globalAlpha = 1;
      }
    }
  }
}
