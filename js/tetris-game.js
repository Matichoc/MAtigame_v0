import { drawCharacter, getOutfit } from "./characters.js";
import { saveProgress, addToLeaderboard, equippedOutfitId, reportScore } from "./storage.js";
import { SHAPES, PIECE_STYLE, createBag, spawnPiece, pieceCells } from "./tetris-pieces.js";
import * as audio from "./audio.js";
import { BRAND } from "./theme.js";

const GAME_ID = "tetris";

export const COLS = 8;
export const ROWS = 14;
export const CELL = 32;
export const BOARD_X = 40;
export const BOARD_Y = 16;
export const CANVAS_W = 800;
export const CANVAS_H = 480;

const LINE_SCORE = [0, 100, 300, 500, 800];
const SPECIAL_COIN_REWARD = 5;

export class TetrisGame {
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

    this._bindInput();
    this._loop = this._loop.bind(this);
  }

  get outfit() {
    return getOutfit(equippedOutfitId(this.progress, this.character.id));
  }

  _bindInput() {
    window.addEventListener("keydown", (e) => {
      if (this.state !== "playing") return;
      if (["ArrowLeft", "ArrowRight", "ArrowDown", "ArrowUp", " "].includes(e.key)) e.preventDefault();
      if (e.key === "ArrowLeft") this._move(-1);
      else if (e.key === "ArrowRight") this._move(1);
      else if (e.key === "ArrowDown") this._softDrop();
      else if (e.key === "ArrowUp") this._rotate();
      else if (e.key === " ") this._hardDrop();
    });

    document.querySelectorAll(".tetris-btn").forEach((btn) => {
      const action = btn.dataset.action;
      btn.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        if (this.state !== "playing") return;
        if (action === "left") this._move(-1);
        else if (action === "right") this._move(1);
        else if (action === "down") this._softDrop();
        else if (action === "rotate") this._rotate();
        else if (action === "drop") this._hardDrop();
      });
    });
  }

  start() {
    this._resetBoard();
    requestAnimationFrame(this._loop);
  }

  _resetBoard() {
    this.grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    this.bag = createBag();
    this.score = 0;
    this.lines = 0;
    this.level = 1;
    this.coinsEarned = 0;
    this.dropTimer = 0;
    this.current = spawnPiece(this._nextFromBag());
    this.next = spawnPiece(this._nextFromBag());
    this.particles = [];
    this.state = "intro";

    this._updateHud();
    this._showOverlay("intro");
  }

  _nextFromBag() {
    if (this.bag.length === 0) this.bag = createBag();
    return this.bag.shift();
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

  startRun(character) {
    this.character = character;
    this._resetBoard();
  }

  retry() {
    this._resetBoard();
  }

  _dropIntervalMs() {
    return Math.max(120, 800 - (this.level - 1) * 60);
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

    this.dropTimer += dt * 1000;
    if (this.dropTimer >= this._dropIntervalMs()) {
      this.dropTimer = 0;
      this._step();
    }
  }

  _fits(piece, dx, dy, rotation) {
    const cells = SHAPES[piece.type][rotation];
    for (const [cx, cy] of cells) {
      const x = piece.x + cx + dx;
      const y = piece.y + cy + dy;
      if (x < 0 || x >= COLS || y >= ROWS) return false;
      if (y >= 0 && this.grid[y][x]) return false;
    }
    return true;
  }

  _move(dir) {
    if (this._fits(this.current, dir, 0, this.current.rotation)) {
      this.current.x += dir;
    }
  }

  _rotate() {
    const nextRotation = (this.current.rotation + 1) % 4;
    const kicks = [0, -1, 1, -2, 2];
    for (const k of kicks) {
      if (this._fits(this.current, k, 0, nextRotation)) {
        this.current.x += k;
        this.current.rotation = nextRotation;
        audio.playJump();
        return;
      }
    }
  }

  _softDrop() {
    if (this._fits(this.current, 0, 1, this.current.rotation)) {
      this.current.y += 1;
      this.score += 1;
      this._updateHud();
    } else {
      this._step();
    }
  }

  _hardDrop() {
    let dropped = 0;
    while (this._fits(this.current, 0, 1, this.current.rotation)) {
      this.current.y += 1;
      dropped++;
    }
    this.score += dropped * 2;
    this._step();
  }

  /** Avanza una "gravedad": intenta bajar la pieza; si no puede, la fija al tablero. */
  _step() {
    if (this._fits(this.current, 0, 1, this.current.rotation)) {
      this.current.y += 1;
      return;
    }
    this._lockPiece();
  }

  _lockPiece() {
    const cells = pieceCells(this.current);
    const style = PIECE_STYLE[this.current.type];
    let toppedOut = false;
    for (const [cx, cy] of cells) {
      const x = this.current.x + cx;
      const y = this.current.y + cy;
      if (y < 0) { toppedOut = true; continue; }
      this.grid[y][x] = { style, special: this.current.special };
    }
    audio.playBounce();

    if (toppedOut) {
      this._onGameOver();
      return;
    }

    this._clearLines();
    this.current = this.next;
    this.next = spawnPiece(this._nextFromBag());

    if (!this._fits(this.current, 0, 0, this.current.rotation)) {
      this._onGameOver();
    }
  }

  _clearLines() {
    const fullRows = [];
    let specialCleared = 0;
    for (let y = 0; y < ROWS; y++) {
      if (this.grid[y].every((cell) => cell)) {
        fullRows.push(y);
        specialCleared += this.grid[y].filter((cell) => cell.special).length > 0 ? 1 : 0;
      }
    }
    if (fullRows.length === 0) return;

    for (const y of fullRows) {
      this.grid.splice(y, 1);
      this.grid.unshift(Array(COLS).fill(null));
      this._spawnLineParticles(y);
    }

    this.lines += fullRows.length;
    this.level = Math.floor(this.lines / 10) + 1;
    this.score += LINE_SCORE[fullRows.length] * this.level;

    if (specialCleared > 0) {
      const reward = specialCleared * SPECIAL_COIN_REWARD;
      this.progress.coins += reward;
      this.coinsEarned += reward;
      saveProgress(this.progress);
      audio.playBonusCollect();
    } else {
      audio.playMissionComplete();
    }

    this._updateHud();
  }

  _spawnLineParticles(row) {
    for (let i = 0; i < 10; i++) {
      this.particles.push({
        x: BOARD_X + Math.random() * COLS * CELL,
        y: BOARD_Y + row * CELL + CELL / 2,
        vx: (Math.random() - 0.5) * 120,
        vy: -60 - Math.random() * 80,
        color: [BRAND.gold, BRAND.pink, "#ffffff"][Math.floor(Math.random() * 3)],
        life: 0.6,
        maxLife: 0.6,
        size: 4 + Math.random() * 3,
      });
    }
  }

  _updateParticles(dt) {
    for (const p of this.particles) {
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 200 * dt;
    }
    this.particles = this.particles.filter((p) => p.life > 0);
  }

  _onGameOver() {
    this.state = "gameover";
    audio.playLose();
    reportScore(this.progress, GAME_ID, this.score);
    addToLeaderboard(this.progress, GAME_ID, this.progress.playerName, this.score);
    this.els.gameoverText.textContent =
      `Hiciste ${this.score} puntos y ${this.lines} líneas` +
      (this.coinsEarned > 0 ? `, ganando ${this.coinsEarned} monedas Dubai.` : ".");
    this._showOverlay("gameover");
  }

  _updateHud() {
    this.els.hudScore.textContent = String(this.score);
    this.els.hudLines.textContent = String(this.lines);
    this.els.hudLevel.textContent = String(this.level);
    this.els.hudCoins.textContent = String(this.progress.coins);
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    this._renderBoardFrame();
    this._renderGrid();
    this._renderGhost();
    this._renderPiece(this.current);
    this._renderSidePanel();
    this._renderParticles();
  }

  _renderBoardFrame() {
    const ctx = this.ctx;
    ctx.fillStyle = BRAND.brownDark;
    ctx.fillRect(BOARD_X - 6, BOARD_Y - 6, COLS * CELL + 12, ROWS * CELL + 12);
    ctx.fillStyle = "#1c0f07";
    ctx.fillRect(BOARD_X, BOARD_Y, COLS * CELL, ROWS * CELL);
    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    for (let x = 1; x < COLS; x++) {
      ctx.beginPath();
      ctx.moveTo(BOARD_X + x * CELL, BOARD_Y);
      ctx.lineTo(BOARD_X + x * CELL, BOARD_Y + ROWS * CELL);
      ctx.stroke();
    }
    for (let y = 1; y < ROWS; y++) {
      ctx.beginPath();
      ctx.moveTo(BOARD_X, BOARD_Y + y * CELL);
      ctx.lineTo(BOARD_X + COLS * CELL, BOARD_Y + y * CELL);
      ctx.stroke();
    }
  }

  _renderGrid() {
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const cell = this.grid[y][x];
        if (cell) this._drawBlock(BOARD_X + x * CELL, BOARD_Y + y * CELL, cell.style, cell.special);
      }
    }
  }

  _drawBlock(px, py, style, special) {
    const ctx = this.ctx;
    const pad = 2;
    ctx.save();
    if (special) {
      const t = this.time * 6;
      ctx.shadowColor = BRAND.green;
      ctx.shadowBlur = 10 + Math.sin(t) * 4;
    }
    const grad = ctx.createLinearGradient(px, py, px, py + CELL);
    grad.addColorStop(0, special ? BRAND.green : style.fill);
    grad.addColorStop(1, special ? BRAND.greenDark : style.dark);
    ctx.fillStyle = grad;
    roundRect(ctx, px + pad, py + pad, CELL - pad * 2, CELL - pad * 2, 6);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  }

  _renderPiece(piece) {
    const cells = pieceCells(piece);
    const style = PIECE_STYLE[piece.type];
    for (const [cx, cy] of cells) {
      const y = piece.y + cy;
      if (y < 0) continue;
      this._drawBlock(BOARD_X + (piece.x + cx) * CELL, BOARD_Y + y * CELL, style, piece.special);
    }
  }

  _renderGhost() {
    let ghostY = this.current.y;
    while (this._fits(this.current, 0, ghostY - this.current.y + 1, this.current.rotation)) {
      ghostY++;
    }
    const ctx = this.ctx;
    ctx.save();
    ctx.globalAlpha = 0.25;
    const cells = pieceCells(this.current);
    for (const [cx, cy] of cells) {
      const y = ghostY + cy;
      if (y < 0) continue;
      this._drawBlock(BOARD_X + (this.current.x + cx) * CELL, BOARD_Y + y * CELL, PIECE_STYLE[this.current.type], false);
    }
    ctx.restore();
  }

  _renderSidePanel() {
    const ctx = this.ctx;
    const panelX = BOARD_X + COLS * CELL + 40;

    ctx.fillStyle = BRAND.gold;
    ctx.font = "bold 15px 'Fredoka', sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Siguiente", panelX, BOARD_Y + 20);

    ctx.fillStyle = "#1c0f07";
    roundRect(ctx, panelX, BOARD_Y + 30, 110, 90, 8);
    ctx.fill();

    const nextCells = SHAPES[this.next.type][0];
    const previewCell = 20;
    const offsetX = panelX + 15;
    const offsetY = BOARD_Y + 45;
    for (const [cx, cy] of nextCells) {
      this._drawBlock(offsetX + cx * previewCell, offsetY + cy * previewCell, PIECE_STYLE[this.next.type], this.next.special);
    }

    const statY = BOARD_Y + 150;
    ctx.fillStyle = "#fff6e6";
    ctx.font = "bold 14px 'Fredoka', sans-serif";
    ctx.fillText(`Puntaje: ${this.score}`, panelX, statY);
    ctx.fillText(`Líneas: ${this.lines}`, panelX, statY + 22);
    ctx.fillText(`Nivel: ${this.level}`, panelX, statY + 44);
    ctx.fillStyle = BRAND.green;
    ctx.fillText(`🍫✨ ${this.progress.coins}`, panelX, statY + 66);

    const bob = Math.sin(this.time * 2.4) * 4;
    drawCharacter(ctx, this.character, this.outfit, panelX + 90, statY + 170 + bob, 90, this.time, false, "down");
  }

  _renderParticles() {
    const ctx = this.ctx;
    for (const p of this.particles) {
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }
    ctx.globalAlpha = 1;
  }
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
