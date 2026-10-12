// Arma el juego en dos variantes a partir de UNA sola página (app/index.template.html):
//   node scripts/build.mjs app  → app-www/  (app de Android: sin enlaces a matichoc.cl ni Choco Blaster)
//   node scripts/build.mjs web  → web-www/  (versión web completa; es la que se copia a matichoc.cl/matijuego)
import { cpSync, rmSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
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
writeFileSync(`${OUT}/.nojekyll`, "");
console.log(`${OUT} lista`);
