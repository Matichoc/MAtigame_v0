import { drawCharacter, getOutfit } from "./characters.js";
import { LEVELS, CANVAS_W, CANVAS_H, generateChocolates, findFreeSpot, getObstacles, getSpawn } from "./levels.js";
import * as audio from "./audio.js";
import { saveProgress, addToLeaderboard, equippedOutfitId, reportScore, earnCoins } from "./storage.js";
import { BRAND } from "./theme.js";

const GAME_ID = "recolecta";

// Los fondos son colores "realistas" de cada cancha (césped, madera, piso de
// gimnasio); los muros del camino usan la paleta de marca de Matichoc.
const THEME_COLORS = {
  field: { bg: "#2f8f3e", line: "#e8f5e8", accent: BRAND.brown },
  court: { bg: "#c98a4b", line: "#3a2411", accent: BRAND.brown },
  gym: { bg: "#f7ecd9", line: "#d8c39f", accent: BRAND.pink },
};

function randRange(a, b) {
  return a + Math.random() * (b - a);
}

export class Game {
  /** progress: objeto de storage.js, compartido con el menú y persistido entre partidas. */
  constructor(canvas, character, progress, els) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.character = character;
    this.progress = progress;
    this.els = els; // referencias DOM del HUD/overlays

    this.levelIndex = 0;
    this.score = 0;
    this.keys = {};
    this.player = {
      x: CANVAS_W / 2,
      y: CANVAS_H / 2,
      radius: 16,
      speed: 190,
      facing: "down",
      isMoving: false,
      isJumping: false,
      jumpTimer: 0,
      jumpDuration: 0.45,
      jumpCooldown: 0,
    };
    this.particles = [];
    this.bonus = null;
    this.bonusSpawnTimer = randRange(6, 10);
    this.state = "intro"; // intro | playing | win | lose | victory
    this.time = 0;
    this.lastTs = null;

    this._bindInput();
    this._loop = this._loop.bind(this);
  }

  get outfit() {
    return getOutfit(equippedOutfitId(this.progress, this.character.id));
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
      if (e.code === "Space" || e.key === " ") { this._tryJump(); e.preventDefault(); }
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

    const jumpBtn = document.getElementById("btn-jump");
    if (jumpBtn) {
      jumpBtn.addEventListener("pointerdown", (e) => { e.preventDefault(); this._tryJump(); });
    }
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
    const spawn = getSpawn(level);
    this.player.x = spawn.x;
    this.player.y = spawn.y;
    this.player.isJumping = false;
    this.player.jumpTimer = 0;
    this.player.jumpCooldown = 0;
    this.flagActive = false;
    this.moving = (level.movingObstacles || []).map((m) => ({ ...m, t: Math.random() * 10, baseX: m.x, baseY: m.y }));
    this.bonus = null;
    this.bonusSpawnTimer = randRange(6, 10);
    this.state = "intro";
    this.particles = [];

    this.els.hudLevel.textContent = level.name;
    this.els.hudMission.textContent = level.missionText;
    this.els.hudTarget.textContent = String(level.target);
    this.els.hudChoco.textContent = "0";
    this.els.hudTimer.textContent = String(level.timeLimit).padStart(2, "0");
    this.els.hudTimerChip.classList.remove("low");
    this._updateCoinsHud();
    this.els.introTitle.textContent = level.name;
    this.els.introText.textContent = level.missionText;
    this._showOverlay("intro");
  }

  _updateCoinsHud() {
    if (this.els.hudCoins) this.els.hudCoins.textContent = String(this.progress.coins);
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

  /** Vuelve al hub sin perder progreso: congela la partida (el loop sigue vivo pero inerte). */
  pauseForMenu() {
    this.state = "paused";
    this._saveBestScore();
  }

  _saveBestScore() {
    reportScore(this.progress, GAME_ID, this.score);
  }

  _tryJump() {
    if (this.state !== "playing") return;
    if (this.player.isJumping || this.player.jumpCooldown > 0) return;
    this.player.isJumping = true;
    this.player.jumpTimer = this.player.jumpDuration;
    this.player.jumpCooldown = this.player.jumpDuration + 0.15;
    audio.playJump();
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

    if (this.player.jumpCooldown > 0) this.player.jumpCooldown -= dt;
    if (this.player.isJumping) {
      this.player.jumpTimer -= dt;
      if (this.player.jumpTimer <= 0) this.player.isJumping = false;
    }

    this._updateMoving(dt);
    this._updatePlayer(dt);
    this._checkChocolateCollisions();
    this._updateBonus(dt);
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
      const hitX = this._collides(nx, this.player.y);
      if (!hitX) this.player.x = nx;
      else this._onObstacleHit(hitX);

      const ny = this.player.y + vy;
      const hitY = this._collides(this.player.x, ny);
      if (!hitY) this.player.y = ny;
      else this._onObstacleHit(hitY);
    }

    this.player.x = clamp(this.player.x, 26, CANVAS_W - 26);
    this.player.y = clamp(this.player.y, 26, CANVAS_H - 26);
  }

  _collides(x, y) {
    const r = this.player.radius * 0.8;
    const all = [...getObstacles(this.level), ...this.moving];
    for (const o of all) {
      if (o.jumpable && this.player.isJumping) continue;
      if (x + r > o.x && x - r < o.x + o.w && y + r > o.y && y - r < o.y + o.h) {
        return o;
      }
    }
    return null;
  }

  /** Como _collides, pero solo contra muros del camino (no contra conos en movimiento). */
  _collidesWalls(x, y) {
    const r = this.player.radius * 0.8;
    for (const o of getObstacles(this.level)) {
      if (o.jumpable && this.player.isJumping) continue;
      if (x + r > o.x && x - r < o.x + o.w && y + r > o.y && y - r < o.y + o.h) return true;
    }
    return false;
  }

  /** Reacciona a un choque: los conos en movimiento rebotan al jugador; los muros solo lo detienen. */
  _onObstacleHit(obstacle) {
    if (this.moving.includes(obstacle)) {
      const cx = obstacle.x + obstacle.w / 2;
      const cy = obstacle.y + obstacle.h / 2;
      const dx = this.player.x - cx;
      const dy = this.player.y - cy;
      const len = Math.hypot(dx, dy) || 1;
      const bounce = 14;
      const nx = clamp(this.player.x + (dx / len) * bounce, 26, CANVAS_W - 26);
      const ny = clamp(this.player.y + (dy / len) * bounce, 26, CANVAS_H - 26);
      // Nunca empujar al jugador dentro de un muro: en corredores angostos
      // eso lo dejaría incrustado y atascado contra la pared.
      if (!this._collidesWalls(nx, this.player.y)) this.player.x = nx;
      if (!this._collidesWalls(this.player.x, ny)) this.player.y = ny;
      audio.playBounce();
    } else {
      audio.playBump();
    }
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

  /** El Chocolate Dubai: bonus especial que aparece unos segundos y da monedas persistentes. */
  _updateBonus(dt) {
    if (this.bonus) {
      this.bonus.timer -= dt;
      const d = Math.hypot(this.bonus.x - this.player.x, this.bonus.y - this.player.y);
      if (d < this.player.radius + 16) {
        earnCoins(this.progress, this.bonus.value);
        this.score += 30;
        this.els.hudScore.textContent = String(this.score);
        this._updateCoinsHud();
        audio.playBonusCollect();
        this._spawnPopup(this.bonus.x, this.bonus.y, `+${this.bonus.value} 🍫✨`);
        saveProgress(this.progress);
        this.bonus = null;
        this.bonusSpawnTimer = randRange(10, 16);
        return;
      }
      if (this.bonus.timer <= 0) {
        this.bonus = null;
        this.bonusSpawnTimer = randRange(8, 14);
      }
    } else {
      this.bonusSpawnTimer -= dt;
      if (this.bonusSpawnTimer <= 0) {
        const spot = findFreeSpot(this.level, this.player);
        if (spot) {
          this.bonus = { x: spot.x, y: spot.y, timer: 3, value: 8 };
        }
        this.bonusSpawnTimer = randRange(10, 16);
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
        color: [BRAND.gold, BRAND.pink, BRAND.green, "#ffffff"][Math.floor(Math.random() * 4)],
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
    this._saveBestScore();
    saveProgress(this.progress);

    if (isLast) {
      this.els.victoryText.textContent = `Completaste las ${LEVELS.length} canchas con ${this.score} puntos y ${this.progress.coins} monedas Dubai. ¡Toda La Liga te aplaude!`;
      audio.playVictory();
      this._spawnConfetti();
      addToLeaderboard(this.progress, GAME_ID, this.progress.playerName, this.score);
      this._showOverlay("victory");
    } else {
      this.els.winText.textContent = `¡Cumpliste la misión con ${this.score} puntos! Prepárate para el siguiente reto.`;
      this._showOverlay("win");
    }
  }

  _onLose() {
    this.state = "lose";
    audio.playLose();
    this._saveBestScore();
    this.els.loseText.textContent = `Recolectaste ${this.collected} de ${this.level.target} golosinas. ¡Tú puedes lograrlo!`;
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

  /**
   * Usado por el hub para (re)lanzar una partida, incluso si se cambió de
   * Matichico o de perfil (progress) desde la última vez que se jugó.
   */
  startRun(character, progress) {
    this.character = character;
    if (progress) this.progress = progress;
    this.restartGame();
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    this._renderBackground();
    this._renderObstacles();
    this._renderFlag();
    this._renderChocolates();
    this._renderBonus();

    const jumpProgress = this.player.isJumping ? 1 - this.player.jumpTimer / this.player.jumpDuration : 0;
    const jumpOffset = this.player.isJumping ? Math.sin(jumpProgress * Math.PI) * 20 : 0;
    drawCharacter(
      ctx, this.character, this.outfit,
      this.player.x, this.player.y - jumpOffset, 48,
      this.time, this.player.isMoving, this.player.facing
    );

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
      ctx.beginPath();
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
      // Los aros se ubican en los extremos del camino, no en el borde fijo
      // del lienzo, para que no queden tapados por los muros del corredor.
      const xs = this.level.path.map((p) => p.x);
      this._drawHoop(Math.min(...xs), 1);
      this._drawHoop(Math.max(...xs), -1);
    } else if (this.level.theme === "gym") {
      for (let x = 0; x < CANVAS_W; x += 48) {
        for (let y = 0; y < CANVAS_H; y += 48) {
          ctx.strokeStyle = "rgba(0,0,0,0.04)";
          ctx.strokeRect(x, y, 48, 48);
        }
      }
      ctx.fillStyle = "rgba(200,16,46,0.12)";
      ctx.fillRect(0, 30, CANVAS_W, 16);
      ctx.fillStyle = theme.accent;
      for (let x = 50; x < CANVAS_W - 40; x += 70) {
        ctx.fillRect(x, CANVAS_H - 46, 6, 22);
      }
    }
  }

  _drawHoop(x, dir) {
    const ctx = this.ctx;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x, 170, dir * 5, 90);
    ctx.strokeStyle = "#e8622c";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x + dir * 16, 218, 10, 0, Math.PI * 2);
    ctx.stroke();
  }

  _renderObstacles() {
    const ctx = this.ctx;
    const theme = THEME_COLORS[this.level.theme];
    for (const o of getObstacles(this.level)) {
      if (o.jumpable) {
        this._drawHurdle(o);
        continue;
      }
      if (o.corridor || o.w >= CANVAS_W || o.h >= CANVAS_H) {
        // Muros del camino y bordes: relleno sólido sin costuras entre celdas.
        ctx.fillStyle = theme.accent;
        ctx.fillRect(o.x, o.y, o.w, o.h);
        continue;
      }
      if (this.level.theme === "field") {
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

  _drawHurdle(o) {
    const ctx = this.ctx;
    ctx.fillStyle = "#3a2411";
    ctx.fillRect(o.x - 3, o.y - 6, 4, o.h + 12);
    ctx.fillRect(o.x + o.w - 1, o.y - 6, 4, o.h + 12);
    ctx.fillStyle = "#b8261b";
    ctx.fillRect(o.x, o.y, o.w, o.h);
    ctx.fillStyle = "#ffffff";
    const stripeW = 10;
    for (let sx = o.x; sx < o.x + o.w; sx += stripeW * 2) {
      ctx.fillRect(sx, o.y, Math.min(stripeW, o.x + o.w - sx), o.h);
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
      ctx.shadowColor = BRAND.gold;
      ctx.shadowBlur = 18;
    } else {
      ctx.globalAlpha = 0.4;
    }
    ctx.fillStyle = BRAND.brownDark;
    ctx.fillRect(f.x + f.w / 2 - 2, f.y - 20, 4, f.h + 20);
    ctx.fillStyle = glow ? BRAND.gold : "#8a8f9b";
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

      // sombra de contacto (siempre a la altura del suelo, no sigue el rebote)
      ctx.save();
      ctx.translate(c.x, c.y + 12);
      ctx.scale(1, 0.35);
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0,0,0,0.22)";
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.translate(c.x, c.y + bob);
      this._drawCollectible(c.kind || "choco");
      // brillo: un toque de luz para que se vean menos planas
      ctx.fillStyle = "rgba(255,255,255,0.55)";
      ctx.beginPath();
      ctx.ellipse(-4, -5, 2.6, 1.6, -0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  _drawCollectible(kind) {
    const ctx = this.ctx;
    if (kind === "alfajor") {
      // alfajor: disco con relleno claro y azúcar flor
      ctx.fillStyle = "#a9702f";
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#e8c98a";
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#a9702f";
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(Math.cos(a) * 5, Math.sin(a) * 5, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (kind === "cuchuflin") {
      // cuchuflín: barquillo tubular con dulce de leche en las puntas
      ctx.fillStyle = "#e0ab52";
      roundRectPath(ctx, -12, -5, 24, 10, 5);
      ctx.fill();
      ctx.strokeStyle = "#a9702f";
      ctx.lineWidth = 1;
      for (let x = -8; x <= 8; x += 4) {
        ctx.beginPath();
        ctx.moveTo(x, -5);
        ctx.lineTo(x + 3, 5);
        ctx.stroke();
      }
      ctx.fillStyle = "#7a4a1e";
      ctx.beginPath();
      ctx.arc(-12, 0, 4, 0, Math.PI * 2);
      ctx.arc(12, 0, 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (kind === "barquillo") {
      // barquillo/cono con bocado de chocolate
      ctx.fillStyle = "#d9a463";
      ctx.beginPath();
      ctx.moveTo(-8, -2);
      ctx.lineTo(8, -2);
      ctx.lineTo(0, 13);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#a9702f";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-6, 2); ctx.lineTo(6, -4);
      ctx.moveTo(-4, 7); ctx.lineTo(6, 0);
      ctx.stroke();
      ctx.fillStyle = "#5a3320";
      ctx.beginPath();
      ctx.arc(0, -6, 7, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // chocolate clásico
      ctx.fillStyle = "#5a3320";
      roundRectPath(ctx, -11, -8, 22, 16, 4);
      ctx.fill();
      ctx.strokeStyle = "#3a2010";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-4, -8); ctx.lineTo(-4, 8);
      ctx.moveTo(4, -8); ctx.lineTo(4, 8);
      ctx.stroke();
      ctx.fillStyle = BRAND.gold;
      ctx.beginPath();
      ctx.arc(-11, -8, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  _renderBonus() {
    if (!this.bonus) return;
    const ctx = this.ctx;
    const { x, y, timer } = this.bonus;
    const pulse = 1 + Math.sin(this.time * 10) * 0.08;

    const grad = ctx.createRadialGradient(x, y, 2, x, y, 28);
    grad.addColorStop(0, "rgba(255,200,0,0.5)");
    grad.addColorStop(1, "rgba(255,200,0,0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, 28, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(255,255,255,0.85)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, 22, -Math.PI / 2, -Math.PI / 2 + (timer / 3) * Math.PI * 2);
    ctx.stroke();

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(pulse, pulse);
    roundRectPath(ctx, -14, -9, 28, 18, 5);
    ctx.fillStyle = BRAND.green;
    ctx.fill();
    ctx.strokeStyle = BRAND.greenDark;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.strokeStyle = BRAND.gold;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-12, -4); ctx.lineTo(-4, 4); ctx.lineTo(4, -4); ctx.lineTo(12, 4);
    ctx.stroke();
    ctx.restore();
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
