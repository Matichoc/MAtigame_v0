// Mati Merge 3D: juntar productos Matichoc. Arrastra un producto sobre otro IGUAL y se transforman en el siguiente de la
// cadena (Bombón → Cuchuflí → alfajores… → Bomba Dorada → ¡Mati Dubai!). Cada "pieza nueva" gasta 1 ⚡ de energía.
// Los clientes piden productos: entrégalos para ganar Matipuntos y liberar espacio. El tablero se guarda en tu perfil.

import { THREE, Game3D, lerp, rand, roundedBox, makeBunting, makeLogo, disposeGeometries } from "./three-kit.js";
import * as audio from "./audio.js";
import { recordRun } from "./progression.js";
import { COLS, ROWS, CELLS, TIERS, MAX_TIER, tierInfo, mergeOf, spawnPiece, dropPiece, deliverOrder, canDeliver, emptyCells } from "./merge-data.js";

const GAME_ID = "merge";
const CELL = 1.15;
const cellX = (i) => ((i % COLS) - (COLS - 1) / 2) * CELL;
const cellZ = (i) => (Math.floor(i / COLS) - (ROWS - 1) / 2) * CELL;

export class MergeGame extends Game3D {
  constructor(character, progress, els) {
    super(GAME_ID, character, progress, els, { fov: 40 });
    this.kawaii = true;
    this.ambientOpts = { petals: 18, hearts: 7, stars: 10, radius: 9, height: 9 };
    this.musicTheme = "chill";
    this.q = els.q;
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.25);
    this.pieces = new Array(CELLS).fill(null);
    this.texCache = new Map();
    this.drag = null;
    this.sessionMerges = 0;
    this.onNoEnergy = () => this.banner("😴 Sin energía: ¡puedes seguir juntando y entregando, pero no sacar piezas nuevas!");
  }

  // ---------- escena ----------

  async build() {
    const s = this.scene;
    s.background = new THREE.Color(0xf3d7e8);
    s.fog = new THREE.Fog(0xf3d7e8, 20, 44);
    s.add(new THREE.HemisphereLight(0xfff0f8, 0xc9a6c8, 1.5));
    const sun = new THREE.DirectionalLight(0xfff3e0, 1.5);
    sun.position.set(-4, 12, 7);
    s.add(sun);
    const std = (color, roughness = 0.7, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, ...extra });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 40), std(0xe9c3dc, 0.95));
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.6;
    s.add(floor);
    const base = new THREE.Mesh(roundedBox(COLS * CELL + 1.2, 0.6, ROWS * CELL + 1.2, 0.34, 0.08), std(0xb985c9, 0.55));
    base.position.y = -0.22;
    s.add(base);
    const tray = new THREE.Mesh(roundedBox(COLS * CELL + 0.46, 0.16, ROWS * CELL + 0.46, 0.2, 0.05), std(0xfff0f6, 0.8));
    tray.position.y = 0.06;
    s.add(tray);
    const tileGeo = new THREE.PlaneGeometry(CELL * 0.94, CELL * 0.94);
    for (let i = 0; i < CELLS; i++) {
      const dark = (Math.floor(i / COLS) + (i % COLS)) % 2;
      const t = new THREE.Mesh(tileGeo, new THREE.MeshStandardMaterial({ color: dark ? 0xf6d4e6 : 0xfde9f2, roughness: 0.9 }));
      t.rotation.x = -Math.PI / 2;
      t.position.set(cellX(i), 0.15, cellZ(i));
      s.add(t);
    }
    // pared del fondo con el logo y banderines
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(60, 24), std(0xf8e3ef, 0.95));
    wall.position.set(0, 9, -12);
    s.add(wall);
    const logo = makeLogo(4.4);
    logo.position.set(0, 6.4, -11.8);
    s.add(logo);
    s.add(makeBunting(new THREE.Vector3(-13, 9.4, -11), new THREE.Vector3(13, 9.4, -11), { count: 26, sag: 1.4, size: 0.5 }));
    // marcador de la pieza elegida
    this.sel = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.05, 8, 28), new THREE.MeshBasicMaterial({ color: 0xff7ab8 }));
    this.sel.rotation.x = Math.PI / 2;
    this.sel.visible = false;
    s.add(this.sel);
  }

  /** Cada nivel de la cadena tiene su dibujo: borde de color + foto real del producto + número. */
  _tierTexture(t) {
    if (this.texCache.has(t)) return this.texCache.get(t);
    const info = tierInfo(t);
    const cv = document.createElement("canvas");
    cv.width = cv.height = 256;
    const x = cv.getContext("2d");
    const col = `#${info.color.toString(16).padStart(6, "0")}`;
    const draw = (img) => {
      x.clearRect(0, 0, 256, 256);
      const grd = x.createRadialGradient(100, 90, 20, 128, 128, 128);
      grd.addColorStop(0, "#ffffff");
      grd.addColorStop(1, col);
      x.fillStyle = grd;
      x.beginPath(); x.arc(128, 128, 126, 0, Math.PI * 2); x.fill();
      x.fillStyle = "#fff8fc";
      x.beginPath(); x.arc(128, 128, 104, 0, Math.PI * 2); x.fill();
      x.save();
      x.beginPath(); x.arc(128, 128, 98, 0, Math.PI * 2); x.clip();
      if (img && img.width) x.drawImage(img, 28, 28, 200, 200);
      else if (t === MAX_TIER) {
        const g2 = x.createRadialGradient(128, 110, 10, 128, 128, 100);
        g2.addColorStop(0, "#fff7c8"); g2.addColorStop(1, "#ffc83a");
        x.fillStyle = g2; x.fillRect(0, 0, 256, 256);
        x.font = "92px serif"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText("👑", 128, 92);
        if (this.logoImg && this.logoImg.width) x.drawImage(this.logoImg, 80, 112, 96, 96);
      } else { x.fillStyle = col; x.fillRect(0, 0, 256, 256); }
      x.restore();
      // número del nivel
      x.fillStyle = "#4a2440";
      x.beginPath(); x.arc(206, 206, 34, 0, Math.PI * 2); x.fill();
      x.fillStyle = "#fff";
      x.font = "bold 40px sans-serif"; x.textAlign = "center"; x.textBaseline = "middle";
      x.fillText(String(t), 206, 208);
    };
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    draw(null);
    const load = (src, cb) => { const im = new Image(); im.onload = () => cb(im); im.src = src; };
    if (info.img) load(`assets/products/${info.img}.jpg`, (im) => { draw(im); tex.needsUpdate = true; });
    else load("assets/brand/logo-badge.png", (im) => { this.logoImg = im; draw(null); tex.needsUpdate = true; });
    this.texCache.set(t, tex);
    return tex;
  }

  _makePiece(t) {
    const info = tierInfo(t);
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.47, 0.5, 0.16, 36), new THREE.MeshStandardMaterial({ color: info.color, roughness: 0.45, metalness: t >= 12 ? 0.5 : 0.05, emissive: t >= 12 ? info.color : 0x000000, emissiveIntensity: t >= 12 ? 0.25 : 0 }));
    body.position.y = 0.08;
    g.add(body);
    const top = new THREE.Mesh(new THREE.CircleGeometry(0.46, 36), new THREE.MeshBasicMaterial({ map: this._tierTexture(t), transparent: true }));
    top.rotation.x = -Math.PI / 2;
    top.position.y = 0.165;
    g.add(top);
    if (t >= 10) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.035, 8, 32), new THREE.MeshStandardMaterial({ color: 0xffd36a, metalness: 0.7, roughness: 0.25, emissive: 0x6a4a00, emissiveIntensity: 0.4 }));
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.1;
      g.add(ring);
    }
    g.userData.noToon = true; // las piezas conservan sus colores reales
    return g;
  }

  _addPiece(i, t, { from = null, grow = true } = {}) {
    const mesh = this._makePiece(t);
    const p = { tier: t, mesh, x: from ? from.x : cellX(i), z: from ? from.z : cellZ(i), y: from ? 0.6 : 0, scale: grow ? 0.05 : 1, pop: 0 };
    mesh.position.set(p.x, p.y, p.z);
    mesh.scale.setScalar(p.scale);
    this.scene.add(mesh);
    this.pieces[i] = p;
    return p;
  }

  _removePiece(i) {
    const p = this.pieces[i];
    if (!p) return;
    this.scene.remove(p.mesh);
    disposeGeometries(p.mesh);
    this.pieces[i] = null;
  }

  /** Deja las piezas 3D iguales al tablero guardado (y crea o quita lo que falte). */
  _resync() {
    const m = mergeOf(this.progress);
    for (let i = 0; i < CELLS; i++) {
      const t = m.grid[i];
      const p = this.pieces[i];
      if (!t) { if (p) this._removePiece(i); continue; }
      if (!p) this._addPiece(i, t);
      else if (p.tier !== t) { this._removePiece(i); this._addPiece(i, t, { grow: false }); this.pieces[i].pop = 0.35; }
    }
  }

  // ---------- partida ----------

  reset() {
    for (let i = 0; i < CELLS; i++) this._removePiece(i);
    this.drag = null;
    this.sessionMerges = 0;
    const m = mergeOf(this.progress);
    this.score = m.best * 100 + m.delivered;
    this._resync();
    for (const p of this.pieces) if (p) { p.scale = 1; p.mesh.scale.setScalar(1); }
    this._bindBar();
    this._updateHud();
    this._renderChain();
    this._renderOrders();
  }

  onBegin() {
    this._updateHud();
    this._renderOrders();
    const m = mergeOf(this.progress);
    if (m.spawned === 0 && m.merges === 0) this.banner("👆 Arrastra un producto sobre otro igual para juntarlos");
  }

  _bindBar() {
    if (this._barBound) return;
    this._barBound = true;
    const spawn = this.q("btn-spawn");
    if (spawn) spawn.addEventListener("click", () => this.spawn());
    const orders = this.q("orders");
    if (orders) orders.addEventListener("click", (e) => {
      const b = e.target.closest("[data-order]");
      if (b) this.deliver(Number(b.dataset.order));
    });
  }

  spawn() {
    if (this.state !== "playing") return;
    const m = mergeOf(this.progress);
    if (!emptyCells(m).length) { this.banner("📦 ¡Tablero lleno! Junta productos o entrega pedidos"); audio.playBump(); return; }
    if (!this.spendAction(1)) return; // cada pieza nueva gasta 1 ⚡
    const r = spawnPiece(this.progress);
    if (!r) return;
    const btn = this.q("btn-spawn");
    const from = btn ? { x: 0, z: ROWS * CELL * 0.5 + 1.5 } : null;
    this._addPiece(r.cell, r.tier, { from });
    audio.playPop();
    this._updateHud();
  }

  deliver(idx) {
    if (this.state !== "playing") return;
    const m = mergeOf(this.progress);
    const o = m.orders[idx];
    if (!o) return;
    const info = tierInfo(o.t);
    const done = deliverOrder(this.progress, idx);
    if (!done) { this.banner(`Aún no tienes ${info.name} (nivel ${o.t}) en el tablero`); audio.playBump(); return; }
    const p = this.pieces[done.cell];
    if (p) { this.particles.burst(new THREE.Vector3(p.x, 0.5, p.z), [0xffd36a, 0xff7ab8, 0xffffff], 18, 4, 0.8, 6); }
    this._removePiece(done.cell);
    this.popups.add(new THREE.Vector3(0, 1.2, -ROWS * CELL * 0.5 + 0.4), `+${done.coins} 🍫✨`, "combo");
    audio.playPurchase();
    this.haptic(25);
    this._updateHud();
    this._renderOrders();
  }

  _afterMerge(res) {
    const m = mergeOf(this.progress);
    const to = res.to;
    const info = tierInfo(res.tier);
    this._removePiece(res.from);
    this._removePiece(to);
    const p = this._addPiece(to, res.tier, { grow: false });
    p.pop = 0.4;
    this.particles.burst(new THREE.Vector3(cellX(to), 0.5, cellZ(to)), [info.color, 0xffffff, 0xffd36a], 16 + res.tier, 3.5, 0.7, 5);
    audio.playCombo?.(Math.min(6, res.tier));
    this.haptic(20);
    this.sessionMerges++;
    if (res.gift != null && !this.pieces[res.gift]) {
      this._addPiece(res.gift, m.grid[res.gift]);
      this.popups.add(new THREE.Vector3(cellX(res.gift), 1, cellZ(res.gift)), "🎁 ¡Regalo!", "combo");
    }
    if (res.record) {
      this.banner(res.tier === MAX_TIER ? "👑 ¡¡LLEGASTE A LA MATI DUBAI!! +1000 🍫✨ y 3 sobres" : `🎉 ¡Nuevo producto: ${info.name}! +${res.coins} 🍫✨${res.tier >= 8 ? " y un sobre 🎴" : ""}`);
      audio.playMissionComplete();
      this.particles.burst(new THREE.Vector3(cellX(to), 1, cellZ(to)), [0xffd36a, 0xff7ab8, 0x7ad8ff, 0xffffff], 40, 6, 1.2, 4, 1.3);
      this._renderChain();
    }
    this.score = m.best * 100 + m.delivered;
    this._updateHud();
    this._renderOrders();
  }

  // ---------- entrada ----------

  async init() {
    const first = !this.ready;
    await super.init();
    if (first) this._bindInput();
  }

  _hit(e) {
    const r = this.els.canvas.getBoundingClientRect();
    this.pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1));
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hit = new THREE.Vector3();
    if (!this.raycaster.ray.intersectPlane(this.plane, hit)) return null;
    const c = Math.round(hit.x / CELL + (COLS - 1) / 2);
    const rr = Math.round(hit.z / CELL + (ROWS - 1) / 2);
    const inside = c >= 0 && c < COLS && rr >= 0 && rr < ROWS;
    return { x: hit.x, z: hit.z, cell: inside ? rr * COLS + c : -1 };
  }

  _bindInput() {
    const wrap = this.els.wrap;
    wrap.addEventListener("pointerdown", (e) => {
      if (e.target.closest("button, .overlay, .mg-bar") || this.state !== "playing" || this.drag) return;
      const h = this._hit(e);
      if (!h || h.cell < 0 || !this.pieces[h.cell]) return;
      this.drag = { id: e.pointerId, from: h.cell, x0: h.x, z0: h.z, moved: false };
      wrap.setPointerCapture?.(e.pointerId);
      audio.playPop();
    });
    wrap.addEventListener("pointermove", (e) => {
      const d = this.drag;
      if (!d || e.pointerId !== d.id) return;
      const h = this._hit(e);
      if (!h) return;
      if (Math.hypot(h.x - d.x0, h.z - d.z0) > CELL * 0.25) d.moved = true;
      d.x = h.x; d.z = h.z; d.over = h.cell;
    });
    const end = (e) => {
      const d = this.drag;
      if (!d || e.pointerId !== d.id) return;
      this.drag = null;
      const h = this._hit(e);
      const to = h ? h.cell : -1;
      const p = this.pieces[d.from];
      if (!d.moved || to === d.from || to < 0) {
        if (!d.moved && p) this._tip(p.tier);
        return;
      }
      const res = dropPiece(this.progress, d.from, to);
      if (res.kind === "move") {
        this.pieces[to] = this.pieces[d.from]; this.pieces[d.from] = null;
        audio.playBump();
      } else if (res.kind === "swap") {
        const a = this.pieces[d.from]; this.pieces[d.from] = this.pieces[to]; this.pieces[to] = a;
        audio.playBump();
      } else if (res.kind === "merge") this._afterMerge(res);
    };
    wrap.addEventListener("pointerup", end);
    wrap.addEventListener("pointercancel", end);
  }

  _tip(t) {
    const info = tierInfo(t);
    this.banner(t === MAX_TIER ? `${info.icon} ¡${info.name}! El producto más preciado` : `${info.icon} ${info.name} · nivel ${t} de ${MAX_TIER}`);
  }

  // ---------- interfaz ----------

  _updateHud() {
    const m = mergeOf(this.progress);
    const set = (id, v) => { const el = this.q(id); if (el) el.textContent = v; };
    set("hud-best", `${m.best}/${MAX_TIER}`);
    set("hud-coins", this.progress.coins);
    set("hud-free", emptyCells(m).length);
    set("hud-name", tierInfo(m.best).name);
  }

  _renderOrders() {
    const box = this.q("orders");
    if (!box) return;
    const m = mergeOf(this.progress);
    box.innerHTML = m.orders.map((o, i) => {
      const info = tierInfo(o.t);
      const img = info.img ? `<img src="assets/products/${info.img}.jpg" alt="">` : `<span class="mg-crown">👑</span>`;
      return `<button type="button" class="mg-order${canDeliver(m, i) ? " ready" : ""}" data-order="${i}" title="${info.name}">${img}<em>${info.name}</em><b>${o.t}</b><span>🍫✨${o.coins}</span></button>`;
    }).join("");
  }

  _renderChain() {
    const box = this.q("chain");
    if (!box) return;
    const m = mergeOf(this.progress);
    box.innerHTML = TIERS.map((t, i) => {
      const got = i + 1 <= m.best;
      const img = t.img ? `<img src="assets/products/${t.img}.jpg" alt="">` : `<span class="mg-crown">👑</span>`;
      return `<span class="mg-step${got ? " got" : ""}" title="${got ? t.name : "???"}">${got ? img : "?"}<small>${i + 1}</small></span>`;
    }).join("");
    const next = this.q("next-goal");
    if (next) next.textContent = m.best >= MAX_TIER ? "¡Lo lograste! Llegaste a la Mati Dubai 👑" : `Próximo producto: ${tierInfo(m.best + 1).name}`;
  }

  onResize() { this._fit(); }

  _fit() {
    if (!this.camera) return;
    const aspect = this.camera.aspect;
    const vf = (this.camera.fov * Math.PI) / 180;
    const wide = aspect > 1.25; // en celular acostado, el tablero va a la izquierda y la barra a la derecha
    const needH = (ROWS * CELL * 0.9 + 1.8) / 2;
    const needW = (COLS * CELL + 1.0) / 2 / (wide ? aspect * 0.66 : aspect);
    const half = Math.max(needH, needW);
    const dist = half / Math.tan(vf / 2);
    const tilt = 0.5;
    const shift = wide ? dist * Math.tan(vf / 2) * aspect * 0.34 : 0;
    this.camBase = new THREE.Vector3(shift, Math.cos(tilt) * dist, Math.sin(tilt) * dist + 0.4);
    this.camera.position.copy(this.camBase);
    this.camLook = new THREE.Vector3(shift, 0, -0.1);
    this.camera.lookAt(this.camLook);
  }

  // ---------- cada cuadro ----------

  update(dt) {
    for (let i = 0; i < CELLS; i++) {
      const p = this.pieces[i];
      if (!p) continue;
      const dragging = this.drag && this.drag.from === i && this.drag.moved;
      let tx = cellX(i);
      let tz = cellZ(i);
      let ty = 0;
      if (dragging && this.drag.x != null) { tx = this.drag.x; tz = this.drag.z; ty = 0.7; }
      const k = 1 - Math.pow(0.0005, dt);
      p.x = lerp(p.x, tx, dragging ? 0.55 : k);
      p.z = lerp(p.z, tz, dragging ? 0.55 : k);
      p.y = lerp(p.y, ty, k);
      p.scale = lerp(p.scale, 1, 1 - Math.pow(0.002, dt));
      if (p.pop > 0) p.pop -= dt;
      const bounce = p.pop > 0 ? 1 + Math.sin((p.pop / 0.4) * Math.PI) * 0.22 : 1;
      p.mesh.position.set(p.x, p.y, p.z);
      p.mesh.scale.setScalar(p.scale * bounce);
      if (p.tier >= 12) p.mesh.rotation.y += dt * 0.8;
      if (p.tier === MAX_TIER && Math.random() < dt * 4) this.particles.burst(new THREE.Vector3(p.x + rand(-0.3, 0.3), 0.5, p.z + rand(-0.3, 0.3)), [0xffd36a, 0xffffff], 1, 0.8, 0.6, -1);
    }
    // marca sobre la casilla donde se va a soltar
    const d = this.drag;
    if (d && d.moved && d.over != null && d.over >= 0) {
      this.sel.visible = true;
      this.sel.position.set(cellX(d.over), 0.22, cellZ(d.over));
      const same = this.pieces[d.over] && this.pieces[d.from] && this.pieces[d.over].tier === this.pieces[d.from].tier && d.over !== d.from;
      this.sel.material.color.setHex(same ? 0x7be08a : 0xff7ab8);
      this.sel.scale.setScalar(1 + Math.sin(this.time * 9) * 0.06);
    } else this.sel.visible = false;
    if (this.camBase) this.camera.lookAt(this.camLook);
  }

  pauseForMenu() {
    this.drag = null;
    // jugar un rato cuenta como una partida para las misiones y la experiencia
    if (this.sessionMerges >= 3 && this.progress) {
      try { recordRun(this.progress, GAME_ID, this.score || 0, {}); } catch (e) { /* no debe romper la salida */ }
    }
    this.sessionMerges = 0;
    super.pauseForMenu();
  }
}
