import { drawCharacter } from "./characters.js";
import { LEVELS, CANVAS_W, CANVAS_H, generateChocolates } from "./levels.js";
import * as audio from "./audio.js";

const STORAGE_KEY = "matichoc_save_v1";

const THEME_COLORS = {
  field: { bg: "#2f8f3e", line: "#e8f5e8", accent: "#256c30" },
  court: { bg: "#c98a4b", line: "#3a2411", accent: "#a86e37" },
  gym: { bg: "#dfe6f0", line: "#b9c4d6", accent: "#c7d0e0" },
};

export class Game {
  constructor(canvas, character, els) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.character = character;
    this.els = els; // referencias DOM del HUD/overlays

    this.levelIndex = 0;
    this.score = 0;
    this.keys = {};
    this.player = { x: CANVAS_W / 2, y: CANVAS_H / 2, radius: 16, speed: 190, facing: "down" };
    this.particles = [];
    this.state = "intro"; // intro | playing | win | lose | victory
    this.time = 0;
    this.lastTs = null;

    this._loadProgress();
    this._bindInput();
    this._loop = this._loop.bind(this);
  }

  _loadProgress() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      this.progress = raw ? JSON.parse(raw) : { bestScore: 0, unlockedLevel: 0 };
    } catch (e) {
      this.progress = { bestScore: 0, unlockedLevel: 0 };
    }
  }

  _saveProgress() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.progress));
    } catch (e) {
      /* almacenamiento no disponible: se ignora silenciosamente */
    }
  }

  _bindInput() {
    const dirKeys = {
      ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
      w: "up", s: "down", a: "left", d: "right",
      W: "up", S: "down", A: "left", D: "right",
    };
    window.addEventListener("keydown", (e) => {
      const dir = dirKeys[e.key];
      if (dir) { this.keys[dir] = true; e.preventDefault(); }
    });
    window.addEventListener("keyup", (e) => {
      const dir = dirKeys[e.key];
      if (dir) { this.keys[dir] = false; }
    });

    document.querySelectorAll(".dpad-btn").forEach((btn) => {
      const dir = btn.dataset.dir;
      const press = (e) => { e.preventDefault(); this.keys[dir] = true; };
      const release = (e) => { e.preventDefault(); this.keys[dir] = false; };
      btn.addEventListener("pointerdown", press);
      btn.addEventListener("pointerup", release);
      btn.addEventListener("pointerleave", release);
      btn.addEventListener("pointercancel", release);
    });
  }

  start() {
    this.loadLevel(this.levelIndex);
    requestAnimationFrame(this._loop);
  }

  loadLevel(index) {
    this.levelIndex = index;
    const level = LEVELS[index];
    this.level = level;
    this.chocolates = generateChocolates(level);
    this.collected = 0;
    this.timeLeft = level.timeLimit;
    this.player.x = CANVAS_W / 2;
    this.player.y = CANVAS_H - 70;
    this.flagActive = false;
    this.moving = (level.movingObstacles || []).map((m) => ({ ...m, t: Math.random() * 10, baseX: m.x, baseY: m.y }));
    this.state = "intro";
    this.particles = [];

    this.els.hudLevel.textContent = level.name;
    this.els.hudMission.textContent = level.missionText;
    this.els.hudTarget.textContent = String(level.target);
    this.els.hudChoco.textContent = "0";
    this.els.hudTimer.textContent = String(level.timeLimit).padStart(2, "0");
    this.els.hudTimerChip.classList.remove("low");
    this.els.introTitle.textContent = level.name;
    this.els.introText.textContent = level.missionText;
    this._showOverlay("intro");
  }

  _showOverlay(name) {
    ["intro", "win", "lose", "victory"].forEach((n) => {
      this.els.overlays[n].classList.toggle("hidden", n !== name);
    });
    if (!name) {
      Object.values(this.els.overlays).forEach((el) => el.classList.add("hidden"));
    }
  }

  beginPlaying() {
    this.state = "playing";
    this._showOverlay(null);
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

    this._updateMoving(dt);
    this._updatePlayer(dt);
    this._checkChocolateCollisions();
    this._checkFlag();

    this.timeLeft -= dt;
    const timerEl = this.els.hudTimerChip;
    if (this.timeLeft <= 10) timerEl.classList.add("low"); else timerEl.classList.remove("low");
    this.els.hudTimer.textContent = String(Math.max(0, Math.ceil(this.timeLeft))).padStart(2, "0");

    if (this.timeLeft <= 0) {
      this._onLose();
    }
  }

  _updateMoving(dt) {
    for (const m of this.moving) {
      m.t += dt;
      const offset = Math.sin(m.t * (m.speed / 40)) * m.range;
      if (m.axis === "y") m.y = m.baseY + offset; else m.x = m.baseX + offset;
    }
  }

  _updatePlayer(dt) {
    let vx = 0, vy = 0;
    if (this.keys.up) vy -= 1;
    if (this.keys.down) vy += 1;
    if (this.keys.left) { vx -= 1; this.player.facing = "left"; }
    if (this.keys.right) { vx += 1; this.player.facing = "right"; }
    const moving = vx !== 0 || vy !== 0;
    this.player.isMoving = moving;

    if (moving) {
      const len = Math.hypot(vx, vy) || 1;
      vx = (vx / len) * this.player.speed * dt;
      vy = (vy / len) * this.player.speed * dt;

      const nx = this.player.x + vx;
      if (!this._collides(nx, this.player.y)) this.player.x = nx;
      else audio.playBump();

      const ny = this.player.y + vy;
      if (!this._collides(this.player.x, ny)) this.player.y = ny;
      else audio.playBump();
    }

    this.player.x = clamp(this.player.x, 26, CANVAS_W - 26);
    this.player.y = clamp(this.player.y, 26, CANVAS_H - 26);
  }

  _collides(x, y) {
    const r = this.player.radius * 0.8;
    const all = [...(this.level.obstacles || []), ...this.moving];
    for (const o of all) {
      if (o.gap) {
        const [gy0, gy1] = this.level.gapY;
        if (y > gy0 - r && y < gy1 + r) continue;
      }
      if (x + r > o.x && x - r < o.x + o.w && y + r > o.y && y - r < o.y + o.h) {
        return true;
      }
    }
    return false;
  }

  _checkChocolateCollisions() {
    for (const c of this.chocolates) {
      if (c.taken) continue;
      const d = Math.hypot(c.x - this.player.x, c.y - this.player.y);
      if (d < this.player.radius + 14) {
        c.taken = true;
        this.collected++;
        this.score += 10;
        audio.playCollect();
        this._spawnPopup(c.x, c.y, "+10");
        this.els.hudChoco.textContent = String(this.collected);
        this.els.hudScore.textContent = String(this.score);

        if (this.collected >= this.level.target) {
          if (this.level.requiresFlag) {
            this.flagActive = true;
          } else {
            this._onWin();
          }
        }
      }
    }
  }

  _checkFlag() {
    if (!this.flagActive || !this.level.flag) return;
    const f = this.level.flag;
    const fx = f.x + f.w / 2, fy = f.y + f.h / 2;
    const d = Math.hypot(fx - this.player.x, fy - this.player.y);
    if (d < this.player.radius + 20) this._onWin();
  }

  _spawnPopup(x, y, text) {
    this.particles.push({ type: "popup", x, y, text, life: 0.8, maxLife: 0.8 });
  }

  _spawnConfetti() {
    for (let i = 0; i < 40; i++) {
      this.particles.push({
        type: "confetti",
        x: Math.random() * CANVAS_W,
        y: -20 - Math.random() * 100,
        vy: 80 + Math.random() * 120,
        vx: (Math.random() - 0.5) * 60,
        color: ["#f4c53d", "#c8102e", "#ffffff", "#14213d"][Math.floor(Math.random() * 4)],
        life: 3 + Math.random() * 2,
        maxLife: 5,
        size: 4 + Math.random() * 4,
      });
    }
  }

  _updateParticles(dt) {
    for (const p of this.particles) {
      p.life -= dt;
      if (p.type === "popup") p.y -= 30 * dt;
      if (p.type === "confetti") { p.y += p.vy * dt; p.x += p.vx * dt; }
    }
    this.particles = this.particles.filter((p) => p.life > 0);
  }

  _onWin() {
    this.state = "win";
    audio.playMissionComplete();
    const isLast = this.levelIndex === LEVELS.length - 1;
    this.progress.unlockedLevel = Math.max(this.progress.unlockedLevel, this.levelIndex + 1);
    this.progress.bestScore = Math.max(this.progress.bestScore, this.score);
    this._saveProgress();

    if (isLast) {
      this.els.victoryText.textContent = `Completaste las 3 canchas con ${this.score} puntos. ¡Toda La Liga te aplaude!`;
      audio.playVictory();
      this._spawnConfetti();
      this._showOverlay("victory");
    } else {
      this.els.winText.textContent = `¡Cumpliste la misión con ${this.score} puntos! Prepárate para el siguiente reto.`;
      this._showOverlay("win");
    }
  }

  _onLose() {
    this.state = "lose";
    audio.playLose();
    this.els.loseText.textContent = `Recolectaste ${this.collected} de ${this.level.target} chocolates. ¡Tú puedes lograrlo!`;
    this._showOverlay("lose");
  }

  nextLevel() {
    this.loadLevel(this.levelIndex + 1);
  }

  retry() {
    this.loadLevel(this.levelIndex);
  }

  restartGame() {
    this.score = 0;
    this.els.hudScore.textContent = "0";
    this.loadLevel(0);
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    this._renderBackground();
    this._renderObstacles();
    this._renderFlag();
    this._renderChocolates();
    drawCharacter(ctx, this.character, this.player.x, this.player.y, 48, this.time, this.player.isMoving, this.player.facing);
    this._renderParticles();
  }

  _renderBackground() {
    const ctx = this.ctx;
    const theme = THEME_COLORS[this.level.theme];
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    ctx.strokeStyle = theme.line;
    ctx.lineWidth = 2;
    if (this.level.theme === "field") {
      ctx.strokeRect(60, 60, CANVAS_W - 120, CANVAS_H - 120);
      ctx.beginPath();
      ctx.moveTo(CANVAS_W / 2, 60);
      ctx.lineTo(CANVAS_W / 2, CANVAS_H - 60);
      ctx.moveTo(CANVAS_W / 2, CANVAS_H / 2);
      ctx.arc(CANVAS_W / 2, CANVAS_H / 2, 50, 0, Math.PI * 2);
      ctx.stroke();
    } else if (this.level.theme === "court") {
      for (let i = 0; i < CANVAS_W; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 24);
        ctx.lineTo(i, CANVAS_H - 24);
        ctx.strokeStyle = "rgba(0,0,0,0.05)";
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(CANVAS_W / 2, CANVAS_H / 2, 60, 0, Math.PI * 2);
      ctx.strokeStyle = theme.line;
      ctx.stroke();
    } else if (this.level.theme === "gym") {
      for (let x = 0; x < CANVAS_W; x += 48) {
        for (let y = 0; y < CANVAS_H; y += 48) {
          ctx.strokeStyle = "rgba(0,0,0,0.04)";
          ctx.strokeRect(x, y, 48, 48);
        }
      }
    }
  }

  _renderObstacles() {
    const ctx = this.ctx;
    const theme = THEME_COLORS[this.level.theme];
    for (const o of this.level.obstacles) {
      if (o.w >= CANVAS_W || o.h >= CANVAS_H) {
        ctx.fillStyle = theme.accent;
        ctx.fillRect(o.x, o.y, o.w, o.h);
        continue;
      }
      if (this.level.id === "liga" && o.h === 100) {
        // poste de arco
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(o.x, o.y, o.w, o.h);
        ctx.strokeStyle = "#1c1c1c";
        ctx.strokeRect(o.x, o.y, o.w, o.h);
      } else if (this.level.id === "liga") {
        this._drawCone(o.x + o.w / 2, o.y + o.h / 2, o.w);
      } else {
        ctx.fillStyle = "#4a3624";
        ctx.fillRect(o.x, o.y, o.w, o.h);
      }
    }
    for (const m of this.moving) {
      this._drawCone(m.x + m.w / 2, m.y + m.h / 2, m.w);
    }
  }

  _drawCone(cx, cy, size) {
    const ctx = this.ctx;
    ctx.fillStyle = "#e8622c";
    ctx.beginPath();
    ctx.moveTo(cx, cy - size / 2);
    ctx.lineTo(cx + size / 2, cy + size / 2);
    ctx.lineTo(cx - size / 2, cy + size / 2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.fillRect(cx - size / 2, cy + size * 0.15, size, size * 0.12);
  }

  _renderFlag() {
    if (!this.level.flag) return;
    const ctx = this.ctx;
    const f = this.level.flag;
    const glow = this.flagActive;
    ctx.save();
    if (glow) {
      ctx.shadowColor = "#f4c53d";
      ctx.shadowBlur = 18;
    } else {
      ctx.globalAlpha = 0.4;
    }
    ctx.fillStyle = "#14213d";
    ctx.fillRect(f.x + f.w / 2 - 2, f.y - 20, 4, f.h + 20);
    ctx.fillStyle = glow ? "#f4c53d" : "#8a8f9b";
    ctx.beginPath();
    ctx.moveTo(f.x + f.w / 2 + 2, f.y - 18);
    ctx.lineTo(f.x + f.w + 6, f.y - 6);
    ctx.lineTo(f.x + f.w / 2 + 2, f.y + 6);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  _renderChocolates() {
    const ctx = this.ctx;
    for (const c of this.chocolates) {
      if (c.taken) continue;
      const bob = Math.sin(this.time * 4 + c.bobSeed) * 3;
      ctx.save();
      ctx.translate(c.x, c.y + bob);
      ctx.fillStyle = "#5a3320";
      roundRectPath(ctx, -11, -8, 22, 16, 4);
      ctx.fill();
      ctx.strokeStyle = "#3a2010";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-4, -8); ctx.lineTo(-4, 8);
      ctx.moveTo(4, -8); ctx.lineTo(4, 8);
      ctx.stroke();
      ctx.fillStyle = "#f4c53d";
      ctx.beginPath();
      ctx.arc(-11, -8, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  _renderParticles() {
    const ctx = this.ctx;
    for (const p of this.particles) {
      const alpha = Math.max(0, p.life / p.maxLife);
      if (p.type === "popup") {
        ctx.globalAlpha = alpha;
        ctx.fillStyle = "#f4c53d";
        ctx.font = "bold 16px 'Baloo 2', sans-serif";
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

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function roundRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
