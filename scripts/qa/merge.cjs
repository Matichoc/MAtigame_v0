// Prueba en el navegador Mati Merge en 3D: los productos se ven con volumen (un modelo por producto), cuesta poco dibujarlo,
// se juntan dos iguales arrastrando con el dedo (sube de nivel y salta), tocar un producto alto elige ese y no el de atrás,
// los pedidos muestran la cara del cliente y el producto, y funciona con el celular de pie y acostado.
// Uso: NODE_PATH=$(npm root -g) node scripts/qa/merge.cjs [url-base] [carpeta-capturas]
const { abrir, nuevoPerfil } = require("./lib.cjs");
const fs = require("fs");
const CAPTURAS = process.argv[3] || "";

let fallos = 0;
const ok = (c, t) => { console.log(`${c ? "OK " : "MAL"} ${t}`); if (!c) fallos++; };
const foto = async (p, n) => { if (CAPTURAS) { fs.mkdirSync(CAPTURAS, { recursive: true }); await p.screenshot({ path: `${CAPTURAS}/${n}.png` }); } };

/** Posición en pantalla (px de la página) de un casillero, a la altura `y` sobre la bandeja. */
const enPantalla = (p, cell, y = 0.2) => p.evaluate(([i, yy]) => {
  const g = window.__g3d.merge;
  const THREE = g.camera.position.constructor;
  const v = new THREE(((i % 6) - 2.5) * 1.1, 0.15 + yy, (Math.floor(i / 6) - 3.5) * 1.1).project(g.camera);
  const r = g.els.canvas.getBoundingClientRect();
  return { x: r.left + ((v.x + 1) / 2) * r.width, y: r.top + ((1 - v.y) / 2) * r.height };
}, [cell, y]);

async function probar(vista, vp) {
  const { b, p, reg } = await abrir({ viewport: vp, touch: true });
  await nuevoPerfil(p);
  await p.evaluate(() => [...document.querySelectorAll(".game-card, #game-feature")].find((c) => c.textContent.includes("Merge")).click());
  await p.waitForFunction(() => window.__g3d && window.__g3d.merge && window.__g3d.merge.running, null, { timeout: 40000 });
  await p.waitForTimeout(600);
  await p.click("#merge-btn-start");
  await p.waitForTimeout(1500);
  const g = (fn, arg) => p.evaluate(fn, arg);
  ok(await g(() => window.__g3d.merge.state) === "playing", `${vista}: empieza el juego`);

  // cada producto es un modelo 3D (1 o 2 mallas), las sombras van todas juntas y el costo de dibujo es bajo
  const piezas = await g(() => {
    const x = window.__g3d.merge;
    const llenos = x.progress.merge.grid.filter(Boolean).length;
    const vivos = x.pieces.filter(Boolean);
    return { llenos, vivos: vivos.length, mallas: Math.max(...vivos.map((pz) => pz.mesh.children.length)), sombras: x.blobs.count };
  });
  ok(piezas.vivos === piezas.llenos && piezas.llenos > 20, `${vista}: hay un producto 3D por cada casillero lleno (${piezas.vivos})`);
  ok(piezas.mallas <= 2, `${vista}: cada producto se dibuja en 1 o 2 pasos (máx. ${piezas.mallas})`);
  ok(piezas.sombras === piezas.vivos, `${vista}: cada producto tiene su sombra (todas en un solo dibujo)`);
  const costo = await g(() => { const x = window.__g3d.merge; x.renderer.info.autoReset = false; x.renderer.info.reset(); x.renderer.render(x.scene, x.camera); const r = { calls: x.renderer.info.render.calls, tris: x.renderer.info.render.triangles }; x.renderer.info.autoReset = true; return r; });
  ok(costo.calls <= 90 && costo.tris <= 120000, `${vista}: dibujarlo cuesta poco (${costo.calls} dibujos, ${costo.tris} triángulos por cuadro)`);

  // los pedidos: cara del cliente + producto + premio
  const ped = await g(() => [...document.querySelectorAll("#merge-orders .mg-order")].map((o) => ({ cara: !!o.querySelector(".mg-face canvas"), img: !!o.querySelector(".mg-bub img"), txt: o.textContent })));
  ok(ped.length === 3 && ped.every((o) => o.cara && o.img), `${vista}: 3 pedidos, cada uno con la cara del cliente y el producto`);
  const nombres = await g(() => [...document.querySelectorAll("#merge-orders .mg-order")].map((o) => o.title.split(" quiere")[0]));
  ok(new Set(nombres).size === 3, `${vista}: tres clientes distintos (${nombres.join(", ")})`);

  // juntar dos iguales arrastrando con el dedo (eventos de puntero, como un toque real)
  const par = await g(() => {
    const m = window.__g3d.merge.progress.merge; const seen = {};
    for (let i = 0; i < m.grid.length; i++) { const c = m.grid[i]; if (!c || c % 10 >= 6) continue; if (seen[c] != null) return [seen[c], i, c]; seen[c] = i; }
    return null;
  });
  ok(!!par, `${vista}: hay dos productos iguales para juntar`);
  if (par) {
    const antes = await g(() => window.__g3d.merge.progress.merge.merges);
    const a = await enPantalla(p, par[0], 0.15);
    const z = await enPantalla(p, par[1], 0.15);
    await p.mouse.move(a.x, a.y);
    await p.mouse.down();
    for (let k = 1; k <= 8; k++) { await p.mouse.move(a.x + ((z.x - a.x) * k) / 8, a.y + ((z.y - a.y) * k) / 8); await p.waitForTimeout(30); }
    await p.waitForTimeout(120);
    await foto(p, `merge-${vista}-arrastre`);
    await p.mouse.up();
    await p.waitForTimeout(80);
    const desp = await g(([to]) => { const x = window.__g3d.merge; const pz = x.pieces[to]; return { merges: x.progress.merge.merges, code: x.progress.merge.grid[to], pop: pz && pz.pop, sy: pz && pz.mesh.scale.y }; }, [par[1]]);
    ok(desp.merges === antes + 1 && desp.code === par[2] + 1, `${vista}: arrastrar uno sobre otro igual los junta en el siguiente producto (${par[2]} → ${desp.code})`);
    ok(desp.pop > 0, `${vista}: el producto nuevo salta al aparecer`);
    await foto(p, `merge-${vista}-salto`);
  }

  // tocar la parte de arriba de un producto alto elige ese producto (no el casillero de atrás)
  const alto = await g(() => { const x = window.__g3d.merge; let best = -1, h = 0; x.pieces.forEach((pz, i) => { if (pz && i >= 6 && pz.mesh.userData.h > h) { h = pz.mesh.userData.h; best = i; } }); return { i: best, h }; });
  if (alto.i >= 0) {
    const pt = await enPantalla(p, alto.i, alto.h * 0.9);
    const elegido = await g(([x, y]) => { const m = window.__g3d.merge; const h = m._hit({ clientX: x, clientY: y }, true); return h && h.cell; }, [pt.x, pt.y]);
    ok(elegido === alto.i, `${vista}: tocar arriba de un producto alto lo elige a él (casillero ${elegido}, esperado ${alto.i})`);
  }

  // los generadores sacan un producto nuevo (con su modelo 3D)
  const antesN = await g(() => window.__g3d.merge.pieces.filter(Boolean).length);
  await g(() => document.querySelector('#merge-gens [data-gen="2"]').click());
  await p.waitForTimeout(200);
  ok(await g(() => window.__g3d.merge.pieces.filter(Boolean).length) === antesN + 1, `${vista}: un generador saca un producto nuevo`);

  // el tablero entra completo y no queda debajo de la barra de pedidos
  const encuadre = await g(() => {
    const x = window.__g3d.merge;
    const r = x.els.canvas.getBoundingClientRect();
    const bar = document.querySelector("#screen-merge .mg-bar").getBoundingClientRect();
    const THREE = x.camera.position.constructor;
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    for (const cx of [-3.3, 3.3]) for (const cz of [-4.4, 4.4]) {
      const v = new THREE(cx, 0.15, cz).project(x.camera);
      const px = r.left + ((v.x + 1) / 2) * r.width; const py = r.top + ((1 - v.y) / 2) * r.height;
      x0 = Math.min(x0, px); x1 = Math.max(x1, px); y0 = Math.min(y0, py); y1 = Math.max(y1, py);
    }
    const wide = r.width / r.height > 1.25;
    return { dentro: x0 >= r.left && x1 <= r.right && y0 >= r.top && y1 <= r.bottom, libre: wide ? x1 <= bar.left + 2 : y1 <= bar.top + 2, alto: Math.round(y1 - y0), ancho: Math.round(x1 - x0) };
  });
  ok(encuadre.dentro && encuadre.libre, `${vista}: el tablero entra entero y no queda tapado por la barra (${encuadre.ancho}x${encuadre.alto} px)`);
  await foto(p, `merge-${vista}`);
  ok(reg.errores.length === 0, `${vista}: sin errores de página (${reg.errores.join(" | ")})`);
  ok(reg.externas.length === 0, `${vista}: sin conexiones externas (${reg.externas.length})`);
  await b.close();
}

(async () => {
  await probar("de pie", { width: 412, height: 860 });
  await probar("acostado", { width: 860, height: 412 });
  console.log(fallos ? `\n${fallos} con problemas` : "\nTodo bien");
  process.exit(fallos ? 1 : 0);
})();
