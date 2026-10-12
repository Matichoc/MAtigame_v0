// Arma el juego en dos variantes a partir de UNA sola página (app/index.template.html):
//   node scripts/build.mjs app  → app-www/  (app de Android: sin enlaces a matichoc.cl ni Choco Blaster)
//   node scripts/build.mjs web  → web-www/  (versión web completa; es la que se copia a matichoc.cl/matijuego)
import { cpSync, rmSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { basename } from "node:path";

const variant = process.argv[2];
if (!["app", "web"].includes(variant)) {
  console.error("Uso: node scripts/build.mjs app|web");
  process.exit(1);
}
const OUT = `${variant}-www`;
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const other = variant === "app" ? "WEB" : "APP";
let html = readFileSync("app/index.template.html", "utf8");
html = html.replace(new RegExp(`<!--${other}-->[\\s\\S]*?<!--/${other}-->`, "g"), "");
html = html.replace(/<!--\/?(WEB|APP)-->/g, "");
html = html.replace("{{APP_ATTR}}", variant === "app" ? 'data-app="1"' : "").replace("{{TITLE}}", variant === "app" ? "Matijuego" : "Matichoc Arcade");
writeFileSync(`${OUT}/index.html`, html);

// Choco Blaster (juego de "disparos") no va en la app infantil: se deja fuera de esa compilación.
const SIN_BLASTER = (src) => !/^(fps-.*\.js|fps3d\.jpg)$/.test(basename(src));
for (const dir of ["js", "css", "assets", "vendor"]) {
  cpSync(dir, `${OUT}/${dir}`, { recursive: true, filter: variant === "app" ? SIN_BLASTER : undefined });
}
// En matichoc.cl el fondo usa el patrón "continuo" de la marca (el de la app es el sutil).
if (variant === "web") {
  const css = readFileSync(`${OUT}/css/style.css`, "utf8");
  writeFileSync(`${OUT}/css/style.css`, css.replace("pattern-cacao-subtle.png", "pattern-cacao-continuo.png"));
}
// En la web (GitHub Pages guarda los archivos ~10 min en el navegador) cada archivo lleva "?v=<huella>":
// así nunca se mezclan módulos viejos con nuevos justo después de actualizar (eso rompía el modo 3D).
if (variant === "web") {
  const files = readdirSync(`${OUT}/js`).filter((f) => f.endsWith(".js")).sort();
  const hash = createHash("sha1");
  for (const f of files) hash.update(f).update(readFileSync(`${OUT}/js/${f}`));
  const v = hash.digest("hex").slice(0, 10);
  for (const f of files) {
    const path = `${OUT}/js/${f}`;
    const src = readFileSync(path, "utf8");
    writeFileSync(path, src.replace(/(["'])(\.\/[\w-]+\.js)\1/g, `$1$2?v=${v}$1`));
  }
  const page = readFileSync(`${OUT}/index.html`, "utf8");
  writeFileSync(`${OUT}/index.html`, page.replace('src="js/main.js"', `src="js/main.js?v=${v}"`).replace('href="css/style.css"', `href="css/style.css?v=${v}"`));
  console.log(`versión de archivos: ${v}`);
}
writeFileSync(`${OUT}/.nojekyll`, "");
console.log(`${OUT} lista`);
