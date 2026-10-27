// Revisa que los textos se lean: recorre el menú (sus pestañas), las pantallas internas y los cuadros, y mide el contraste
// de cada texto contra el fondo que tiene detrás (colores y degradados de sus contenedores, mezclando transparencias).
// Marca lo que queda bajo 3:1 (mínimo para texto grande y botones; WCAG pide 4.5:1 para texto chico).
// Uso: NODE_PATH=$(npm root -g) node scripts/qa/contraste.cjs [url-base]   (sale con código 1 si algo no se lee)
const { abrir, nuevoPerfil } = require("./lib.cjs");

const MEDIR = () => {
  const parse = (s) => { const m = s.match(/rgba?\(([^)]+)\)/); if (!m) return null; const v = m[1].split(/[ ,\/]+/).filter(Boolean).map(Number); return [v[0], v[1], v[2], v.length > 3 ? v[3] : 1]; };
  const gradAvg = (img) => { const cs = [...img.matchAll(/rgba?\([^)]+\)/g)].map((m) => parse(m[0])); if (!cs.length) return null; const n = cs.length; return [0, 1, 2, 3].map((i) => cs.reduce((a, c) => a + c[i], 0) / n); };
  const over = (top, bot) => { const a = top[3]; return [0, 1, 2].map((i) => top[i] * a + bot[i] * (1 - a)).concat(1); };
  const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const fondo = (el) => {
    const capas = [];
    for (let e = el; e; e = e.parentElement) {
      const cs = getComputedStyle(e);
      const img = cs.backgroundImage;
      if (img && img !== "none") {
        if (/url\(/.test(img) && !/gradient/.test(img)) return null; // foto detrás: no se puede medir así
        const g = gradAvg(img); if (g) capas.push(g);
      }
      const c = parse(cs.backgroundColor); if (c && c[3] > 0) capas.push(c);
      if (capas.length && capas[capas.length - 1][3] >= 0.999) break;
    }
    let base = [255, 255, 255, 1];
    for (let i = capas.length - 1; i >= 0; i--) base = over(capas[i], base);
    return base;
  };
  const out = [];
  const visible = (el) => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false; for (let e = el; e; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.display === "none" || cs.visibility === "hidden" || +cs.opacity < 0.35) return false; } return r.bottom > 0 && r.top < innerHeight * 3; };
  for (const el of document.querySelectorAll("body *")) {
    if (["SCRIPT", "STYLE", "CANVAS", "svg", "OPTION"].includes(el.tagName)) continue;
    const txt = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join("").trim();
    if (!txt || !/[A-Za-zÁÉÍÓÚáéíóúñÑ0-9]/.test(txt) || !visible(el)) continue;
    const cs = getComputedStyle(el);
    const col = parse(cs.color); if (!col) continue;
    if (cs.webkitTextStrokeWidth && parseFloat(cs.webkitTextStrokeWidth) > 0) continue;
    const bg = fondo(el); if (!bg) continue;
    const r = ratio(over(col, bg), bg);
    if (r < 3) { const id = el.id ? "#" + el.id : ""; const cl = el.className && typeof el.className === "string" ? "." + el.className.trim().split(/\s+/).join(".") : ""; let ctx = ""; for (let e = el.parentElement; e && !ctx; e = e.parentElement) if (e.id) ctx = "#" + e.id; out.push(`${r.toFixed(2)} · «${txt.slice(0, 40)}» · ${el.tagName.toLowerCase()}${id}${cl} en ${ctx} · letra rgb(${col.slice(0, 3).map(Math.round)}) sobre rgb(${bg.slice(0, 3).map(Math.round)})`); }
  }
  return out;
};

(async () => {
  let fallos = 0;
  const vistos = new Set();
  const revisar = async (p, donde) => {
    const r = await p.evaluate(MEDIR);
    for (const x of r) { const k = x.split(" · ").slice(1, 3).join("|"); if (vistos.has(k)) continue; vistos.add(k); fallos++; console.log(`MAL ${donde}: ${x}`); }
    if (!r.length) console.log(`OK  ${donde}: todo se lee`);
  };
  for (const [nombre, vp, touch] of [["celular", { width: 412, height: 915 }, true], ["computador", { width: 1280, height: 800 }, false]]) {
    const { b, p } = await abrir({ viewport: vp, touch });
    await nuevoPerfil(p);
    // un perfil con avance: lugares construidos, deportes jugados, Matipuntos
    await p.evaluate(async () => {
      const pr = window.__progress(); pr.coins = 1240;
      const src = [...document.scripts].map((x) => x.src).find((u) => /\/js\/main\.js/.test(u)) || "js/main.js";
      const A = await import(new URL("adventure.js", src).href);
      // como un jugador a mitad de camino: casi todo construido, con estilos elegidos y deportes jugados
      A.startAdventure(pr);
      const a = A.adventureOf(pr);
      A.ALL_TASKS.slice(0, -3).forEach((t) => { a.done[t.id] = true; });
      for (const k of Object.keys(A.CHOICES)) a.choices[k] = A.CHOICES[k].options[0].id;
      a.stars = 3;
    });
    await p.waitForTimeout(400);
    const tocar = (sel) => p.evaluate((s) => { const e = document.querySelector(s); if (e) e.click(); return !!e; }, sel);
    const cerrar = () => p.evaluate(() => { document.querySelectorAll(".modal:not(.hidden)").forEach((m) => { const x = m.querySelector("[data-back]"); if (x) x.click(); else m.classList.add("hidden"); }); });
    if (touch) for (const tab of ["home", "games", "me"]) { await tocar(`#lb-tabs [data-tab="${tab}"]`); await p.waitForTimeout(400); await revisar(p, `${nombre} · menú, pestaña ${tab}`); }
    else await revisar(p, `${nombre} · menú`);
    for (const [btn, quien] of [["#btn-energy", "cuadro de energía"], ["#btn-daily-reward", "calendario"], ["#btn-path-me", "Mi personaje"]]) {
      if (touch) await tocar(`#lb-tabs [data-tab="home"]`);
      if (await tocar(btn)) { await p.waitForTimeout(400); await revisar(p, `${nombre} · ${quien}`); await cerrar(); await p.waitForTimeout(200); }
    }
    // juego bloqueado
    await p.evaluate(() => { const c = [...document.querySelectorAll(".game-card")].find((x) => x.textContent.includes("Ciudad")); if (c) c.click(); });
    await p.waitForTimeout(500); await revisar(p, `${nombre} · juego bloqueado`); await cerrar();
    // pantallas internas
    for (const [btn, back, quien] of [["#me-town", "#btn-adventure-back", "Renovar el Pueblo"], ["#btn-open-shop", "#btn-shop-back", "Vestuario y tienda"], ["#btn-open-house", "#btn-house-back", "Mi Casa"], ["#btn-open-progress", "#btn-progress-back", "Nivel y álbum"], ["#btn-open-achievements", "#btn-achievements-back", "Logros"], ["#btn-open-leaderboard", "#btn-leaderboard-back", "Puntajes"]]) {
      if (!(await tocar(btn))) continue;
      await p.waitForTimeout(900);
      await revisar(p, `${nombre} · ${quien}`);
      await tocar(back); await p.waitForTimeout(400);
    }
    // tarjetas de inicio y paneles dentro de los juegos (en el celular): se abre el juego, se mide la tarjeta y lo de adentro
    if (touch) {
      await p.evaluate(() => { const pr = window.__progress(); pr.unlockedGames = [...new Set([...(pr.unlockedGames || []), "ciudad", "futbol"])]; pr.energy = 200; });
      for (const [nombre2, id] of [["Fútbol", "futbol"], ["Pueblo", "town"], ["Ciudad", "ciudad"], ["Aventura", "aventura"]]) {
        await tocar(`#lb-tabs [data-tab="games"]`); await p.waitForTimeout(300);
        const ok = await p.evaluate((n) => { const c = [...document.querySelectorAll(".game-card, #game-feature")].find((x) => x.textContent.includes(n)); if (c) c.click(); return !!c; }, nombre2);
        if (!ok) continue;
        await p.waitForFunction((g) => window.__g3d && window.__g3d[g] && window.__g3d[g].running, id, { timeout: 40000 }).catch(() => {});
        await p.waitForTimeout(800);
        await revisar(p, `${nombre} · ${nombre2}: tarjeta de inicio`);
        await p.evaluate(() => { const b = [...document.querySelectorAll('.overlay:not(.hidden) .btn-primary[id$="-btn-start"], .overlay:not(.hidden) [data-action="begin"]')].find((x) => x.offsetParent); if (b) b.click(); });
        await p.waitForTimeout(2500);
        await revisar(p, `${nombre} · ${nombre2}: jugando`);
        await p.evaluate(() => { const m = [...document.querySelectorAll('[id$="-btn-menu"]')].find((x) => x.offsetParent); if (m) m.click(); });
        await p.waitForTimeout(300);
        await revisar(p, `${nombre} · pausa`);
        await tocar("#pause-exit"); await p.waitForTimeout(800);
      }
    }
    await b.close();
  }
  console.log(fallos ? `\n${fallos} textos no se leen bien` : "\nTodo se lee");
  process.exit(fallos ? 1 : 0);
})();
