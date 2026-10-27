// Pueblo: no se camina sobre el agua del lago. Recorre el lago punto por punto (con el muelle sin arreglar y arreglado)
// y además camina de verdad por el muelle hacia el agua: debe detenerse en la punta. El arroyo del bosque solo se cruza
// por el puente (o por los tablones del mismo lugar antes de arreglarlo), y sobre el puente y el muelle se camina encima.
// Uso: NODE_PATH=$(npm root -g) node scripts/qa/lago.cjs [url]
const { abrir, nuevoPerfil } = require("./lib.cjs");

let fallos = 0;
const ok = (c, t) => { console.log(`${c ? "OK " : "MAL"} ${t}`); if (!c) fallos++; };

(async () => {
  const { b, p, reg } = await abrir({ viewport: { width: 1000, height: 600 } });
  await nuevoPerfil(p);
  await p.evaluate(() => [...document.querySelectorAll(".game-card, #game-feature")].find((c) => c.textContent.includes("Pueblo")).click());
  await p.waitForFunction(() => window.__g3d && window.__g3d.town && window.__g3d.town.running, null, { timeout: 40000 });
  await p.waitForTimeout(800);
  await p.evaluate(() => { const s = document.getElementById("town-btn-start"); if (s && s.offsetParent) s.click(); });
  await p.waitForTimeout(1200);
  // puntos del agua en coordenadas del barrio del lago → mundo (mismo giro que town-zones.js)
  const recorrer = (muelle) => p.evaluate(async (muelle) => {
    const g = window.__g3d.town;
    const src = [...document.scripts].map((x) => x.src).find((u) => /\/js\/main\.js/.test(u));
    const Z = await import(new URL("town-zones.js", src).href);
    const A = await import(new URL("adventure.js", src).href);
    A.adventureOf(g.progress).done["lago.muelle"] = muelle;
    const deg = Z.ZONE_DEFS.lago.deg, a = (deg * Math.PI) / 180, c = Z.zoneCenter("lago");
    const toWorld = (lx, lz) => ({ x: c.x + lx * Math.cos(a) - lz * Math.sin(a), z: c.z + lx * Math.sin(a) + lz * Math.cos(a) });
    let agua = 0, pisable = 0, muellePisable = 0, muelleTotal = 0;
    for (let lx = -12; lx <= 12; lx += 0.5) for (let lz = -20; lz <= 4; lz += 0.5) {
      if (Math.hypot(lx, lz + 8) >= 12.6 - 0.3) continue; // dentro del agua (con margen de la orilla)
      // el muelle mide 2.6 de ancho y su punta está en z -3.4: adentro debe pisarse; en su borde (0.5) da igual; fuera es agua
      const enMuelle = Math.abs(lx) < 1.2 && lz > -3.4 + 0.5;
      const bordeMuelle = !enMuelle && Math.abs(lx) < 1.3 + 0.5 && lz > -3.4 - 0.5;
      const w = toWorld(lx, lz);
      const si = g.zones.inside(w.x, w.z, 52);
      if (enMuelle) { muelleTotal++; if (si) muellePisable++; } else if (!bordeMuelle) { agua++; if (si) pisable++; }
    }
    return { agua, pisable, muellePisable, muelleTotal };
  }, muelle);
  const sin = await recorrer(false);
  ok(sin.pisable === 0 && sin.muellePisable === 0, `sin muelle: no se puede pisar el agua (${sin.pisable + sin.muellePisable} de ${sin.agua + sin.muelleTotal} puntos)`);
  const con = await recorrer(true);
  ok(con.pisable === 0, `con muelle: el agua fuera del muelle no se pisa (${con.pisable} de ${con.agua} puntos)`);
  ok(con.muellePisable === con.muelleTotal, `con muelle: el muelle se pisa entero (${con.muellePisable} de ${con.muelleTotal})`);
  // caminar de verdad desde la orilla por el muelle hacia el agua: se detiene en la punta
  const fin = await p.evaluate(async () => {
    const g = window.__g3d.town;
    const src = [...document.scripts].map((x) => x.src).find((u) => /\/js\/main\.js/.test(u));
    const Z = await import(new URL("town-zones.js", src).href);
    const a = (Z.ZONE_DEFS.lago.deg * Math.PI) / 180, c = Z.zoneCenter("lago");
    const toWorld = (lx, lz) => ({ x: c.x + lx * Math.cos(a) - lz * Math.sin(a), z: c.z + lx * Math.sin(a) + lz * Math.cos(a) });
    const toLocal = (x, z) => { const dx = x - c.x, dz = z - c.z; return { x: dx * Math.cos(a) + dz * Math.sin(a), z: -dx * Math.sin(a) + dz * Math.cos(a) }; };
    const s = toWorld(0, 6), e = toWorld(0, -18);
    g.pos.set(s.x, 0, s.z); g.fun.vy = 0;
    const dir = { x: e.x - s.x, z: e.z - s.z }; const n = Math.hypot(dir.x, dir.z);
    for (let i = 0; i < 300; i++) { const px = g.pos.x, pz = g.pos.z; g.pos.x += (dir.x / n) * 0.1; g.pos.z += (dir.z / n) * 0.1; if (!g.zones.inside(g.pos.x, g.pos.z, 52)) { g.pos.x = px; g.pos.z = pz; break; } }
    return toLocal(g.pos.x, g.pos.z).z;
  });
  ok(fin > -3.6 && fin < -2.5, `caminando por el muelle se detiene en la punta (z local ${fin.toFixed(1)}; la punta está en -3.4)`);
  // el arroyo del bosque: solo por el puente; sobre el puente y el muelle se camina por encima
  const arroyo = await p.evaluate(async () => {
    const g = window.__g3d.town;
    const src = [...document.scripts].map((x) => x.src).find((u) => /\/js\/main\.js/.test(u));
    const Z = await import(new URL("town-zones.js", src).href);
    const A = await import(new URL("adventure.js", src).href);
    const out = {};
    for (const zona of ["bosque", "lago"]) {
      const a = (Z.ZONE_DEFS[zona].deg * Math.PI) / 180, c = Z.zoneCenter(zona);
      const W = (lx, lz) => ({ x: c.x + lx * Math.cos(a) - lz * Math.sin(a), z: c.z + lx * Math.sin(a) + lz * Math.cos(a) });
      for (const done of [false, true]) {
        A.adventureOf(g.progress).done[zona === "bosque" ? "bosque.puente" : "lago.muelle"] = done;
        g.zones.refresh();
        const cruza = (lx) => { const s = W(lx, 8), e = W(lx, -4); for (let i = 1; i <= 120; i++) { const q = { x: s.x + (e.x - s.x) * i / 120, z: s.z + (e.z - s.z) * i / 120 }; if (!g.zones.inside(q.x, q.z, 52)) return false; } return true; };
        const sobre = zona === "bosque" ? W(0, 2) : W(0, 1);
        out[`${zona}-${done ? "con" : "sin"}`] = { fuera: zona === "bosque" ? cruza(6) : null, puente: zona === "bosque" ? cruza(0) : null, alto: g.fun._groundAt(sobre.x, sobre.z, 0) };
      }
    }
    return out;
  });
  ok(!arroyo["bosque-sin"].fuera && !arroyo["bosque-con"].fuera, "el arroyo del bosque no se cruza por fuera del puente");
  ok(arroyo["bosque-sin"].puente && arroyo["bosque-con"].puente, "el arroyo se cruza por el puente (y antes de arreglarlo, por sus tablones)");
  ok(arroyo["bosque-con"].alto > 0.4 && arroyo["bosque-sin"].alto === 0, `sobre el puente arreglado se camina encima (altura ${arroyo["bosque-con"].alto})`);
  ok(arroyo["lago-con"].alto > 0.4 && arroyo["lago-sin"].alto === 0, `sobre el muelle arreglado se camina encima (altura ${arroyo["lago-con"].alto})`);
  ok(reg.errores.length === 0, `sin errores (${reg.errores.join(" | ")})`);
  await b.close();
  console.log(fallos ? `\n${fallos} fallos` : "\nTodo bien");
  process.exit(fallos ? 1 : 0);
})();
