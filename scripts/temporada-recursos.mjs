// Genera los recursos de una temporada (ícono Android, ícono de Google Play y arte de la pantalla de carga)
// a partir de las imágenes originales aprobadas y de los recortes de resources/temporadas/<id>/recortes.json.
//
// Uso:  node scripts/temporada-recursos.mjs halloween
//
// Entradas (no se modifican):
//   resources/temporadas/<id>/recortes.json   qué parte de cada imagen va a cada destino (fracciones 0..1: [x, y, ancho, alto])
//   resources/temporadas/<id>/<imagen>        las imágenes aprobadas, tal cual se entregaron
// Salidas:
//   assets/temporadas/<id>/carga.webp y carga-fondo.webp            → pantalla de carga del juego (va dentro de la app)
//   resources/temporadas/<id>/android/res/mipmap-*/ic_launcher*.png  → ícono Android (se copia al compilar con icono=evento)
//   resources/temporadas/<id>/android/res/mipmap-anydpi-v26/*.xml    → ícono adaptativo (Android 8+)
//   store/temporadas/<id>/icon-512.png                               → ícono para la ficha de Google Play (se sube a mano)
//   docs/temporadas/<id>/revision-icono.png                          → hoja para revisar recortes y tamaños chicos
//
// Usa sharp, que ya viene con @capacitor/assets (dependencia de desarrollo del proyecto): no agrega dependencias.

import { mkdirSync, readFileSync, writeFileSync, existsSync, statSync } from "node:fs";
import { dirname } from "node:path";
import sharp from "sharp";

const id = process.argv[2];
if (!id || !/^[a-z0-9-]+$/.test(id)) {
  console.error("Uso: node scripts/temporada-recursos.mjs <id-del-evento>   (por ejemplo: halloween)");
  process.exit(2);
}
const SRC = `resources/temporadas/${id}`;
const cfgPath = `${SRC}/recortes.json`;
if (!existsSync(cfgPath)) { console.error(`Falta ${cfgPath}`); process.exit(2); }
const cfg = JSON.parse(readFileSync(cfgPath, "utf8"));

const out = (p) => { mkdirSync(dirname(p), { recursive: true }); return p; };
const hex = (h) => { const n = parseInt(h.replace("#", ""), 16); return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255, alpha: 1 }; };

async function cropOf(def) {
  const file = `${SRC}/${def.fuente}`;
  if (!existsSync(file)) throw new Error(`Falta la imagen ${file} (ver docs/TEMPORADAS.md)`);
  const img = sharp(file);
  const { width: W, height: H } = await img.metadata();
  const [fx, fy, fw, fh] = def.recorte;
  const r = { left: Math.round(fx * W), top: Math.round(fy * H), width: Math.round(fw * W), height: Math.round(fh * H) };
  if (r.left < 0 || r.top < 0 || r.left + r.width > W || r.top + r.height > H) throw new Error(`El recorte de ${def.fuente} se sale de la imagen (${W}x${H}): ${JSON.stringify(r)}`);
  return { buf: await sharp(file).extract(r).toBuffer(), r, W, H };
}

const svgMask = (size, kind) => {
  const s = size;
  const shapes = {
    circulo: `<circle cx="${s / 2}" cy="${s / 2}" r="${s / 2}"/>`,
    redondeado: `<rect width="${s}" height="${s}" rx="${s * 0.2}" ry="${s * 0.2}"/>`,
    squircle: `<path d="M${s / 2},0 C${s * 0.92},0 ${s},${s * 0.08} ${s},${s / 2} C${s},${s * 0.92} ${s * 0.92},${s} ${s / 2},${s} C${s * 0.08},${s} 0,${s * 0.92} 0,${s / 2} C0,${s * 0.08} ${s * 0.08},0 ${s / 2},0 Z"/>`,
    gota: `<path d="M${s / 2},0 H${s * 0.8} A${s * 0.2},${s * 0.2} 0 0 1 ${s},${s * 0.2} V${s / 2} A${s / 2},${s / 2} 0 0 1 ${s / 2},${s} A${s / 2},${s / 2} 0 0 1 0,${s / 2} A${s / 2},${s / 2} 0 0 1 ${s / 2},0 Z"/>`,
  };
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}">${shapes[kind]}</svg>`);
};
const masked = (buf, size, kind) => sharp(buf).resize(size, size).composite([{ input: svgMask(size, kind), blend: "dest-in" }]).png().toBuffer();

const DENS = { ldpi: 0.75, mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };
const report = [];

// ---------- pantalla de carga ----------
if (cfg.carga) {
  const c = await cropOf(cfg.carga);
  const maxW = cfg.carga.anchoMax || 1080;
  const main = out(`assets/temporadas/${id}/carga.webp`);
  await sharp(c.buf).resize({ width: Math.min(maxW, c.r.width), withoutEnlargement: true }).webp({ quality: 80 }).toFile(main);
  const blur = out(`assets/temporadas/${id}/carga-fondo.webp`);
  await sharp(c.buf).resize({ width: 64 }).blur(2.5).webp({ quality: 60 }).toFile(blur);
  for (const f of [main, blur]) { const m = await sharp(f).metadata(); report.push(`${f}: ${m.width}x${m.height} ${m.format}, ${(statSync(f).size / 1024).toFixed(0)} KB`); }
}

// ---------- ícono Android (capa de 108 dp: lo visible son los 72 dp del centro; la zona segura, un círculo de 66 dp) ----------
let layer = null;
if (cfg.icono) {
  const c = await cropOf(cfg.icono);
  if (Math.abs(c.r.width - c.r.height) > 2) throw new Error(`El recorte del ícono debe ser cuadrado (quedó ${c.r.width}x${c.r.height})`);
  layer = await sharp(c.buf).resize(1024, 1024).png().toBuffer();
  const bg = hex(cfg.icono.fondo || "#24123d");
  const visible = await sharp(layer).extract({ left: 171, top: 171, width: 683, height: 683 }).png().toBuffer(); // los 72/108 del centro
  const base = `${SRC}/android/res`;
  for (const [d, k] of Object.entries(DENS)) {
    const fg = Math.round(108 * k);
    const legacy = Math.round(48 * k);
    await sharp(layer).resize(fg, fg).png().toFile(out(`${base}/mipmap-${d}/ic_launcher_foreground.png`));
    await sharp({ create: { width: fg, height: fg, channels: 3, background: bg } }).png().toFile(out(`${base}/mipmap-${d}/ic_launcher_background.png`));
    // íconos para Android 7 (API 24-25), que no usan el adaptativo
    writeFileSync(out(`${base}/mipmap-${d}/ic_launcher.png`), await masked(visible, legacy, "redondeado"));
    writeFileSync(out(`${base}/mipmap-${d}/ic_launcher_round.png`), await masked(visible, legacy, "circulo"));
  }
  const xml = `<?xml version="1.0" encoding="utf-8"?>
<!-- Ícono adaptativo de temporada (${id}): capas de 108 dp sin márgenes; el launcher recorta la forma. Generado por scripts/temporada-recursos.mjs -->
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@mipmap/ic_launcher_background" />
    <foreground android:drawable="@mipmap/ic_launcher_foreground" />
</adaptive-icon>
`;
  writeFileSync(out(`${base}/mipmap-anydpi-v26/ic_launcher.xml`), xml);
  writeFileSync(out(`${base}/mipmap-anydpi-v26/ic_launcher_round.xml`), xml);
  report.push(`${base}: ${Object.keys(DENS).length} densidades (capas 81–432 px, íconos 36–192 px) + XML adaptativo`);

  // ---------- Google Play: PNG de 512x512 (32 bits con alfa), máximo 1024 KB; Play redondea las esquinas ----------
  const play = out(`store/temporadas/${id}/icon-512.png`);
  await sharp(visible).resize(512, 512).ensureAlpha().png({ compressionLevel: 9 }).toFile(play);
  const pm = await sharp(play).metadata();
  const kb = statSync(play).size / 1024;
  report.push(`${play}: ${pm.width}x${pm.height} ${pm.format} ${pm.channels} canales, ${kb.toFixed(0)} KB${kb > 1024 ? "  ⚠️ PASA DE 1024 KB" : ""}`);

  // ---------- hoja de revisión: formas del launcher y tamaños chicos ----------
  const cell = 150;
  const shapes = ["circulo", "squircle", "redondeado", "gota"];
  const sizes = [192, 96, 48, 36];
  const W = 40 + cell * Math.max(shapes.length, 3) + 40;
  const H = 70 + cell + 40 + sizes.length * 0 + 260 + 60;
  const comps = [];
  const label = (text, x, y, size = 18) => ({ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${size + 10}"><text x="0" y="${size}" font-family="sans-serif" font-size="${size}" font-weight="bold" fill="#fff6e6">${text}</text></svg>`), left: x, top: y });
  comps.push(label(`Ícono ${id}: formas de los launchers (lo visible: 72 dp)`, 20, 14, 18));
  for (let i = 0; i < shapes.length; i++) {
    comps.push({ input: await masked(visible, 128, shapes[i]), left: 40 + i * cell, top: 60 });
    comps.push(label(shapes[i], 40 + i * cell, 194, 15));
  }
  // capa completa con la zona segura marcada
  const safe = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="216" height="216"><rect x="36" y="36" width="144" height="144" fill="none" stroke="#35f0ff" stroke-width="2" stroke-dasharray="6 4"/><circle cx="108" cy="108" r="66" fill="none" stroke="#ffc800" stroke-width="3"/></svg>`);
  comps.push({ input: await sharp(layer).resize(216, 216).composite([{ input: safe }]).png().toBuffer(), left: 40, top: 235 });
  comps.push(label("capa 108 dp · celeste: visible (72 dp) · amarillo: zona segura (66 dp)", 270, 240, 14));
  // tamaños chicos reales
  let x = 270;
  for (const s of sizes) {
    comps.push({ input: await masked(visible, s, "circulo"), left: x, top: 290 + (192 - s) });
    comps.push(label(`${s} px`, x, 490, 14));
    x += s + 24;
  }
  const sheet = out(`docs/temporadas/${id}/revision-icono.png`);
  await sharp({ create: { width: W + 120, height: H + 40, channels: 3, background: { r: 40, g: 20, b: 26 } } }).composite(comps).png().toFile(sheet);
  report.push(`${sheet}: hoja de revisión`);
}

console.log(report.join("\n"));
