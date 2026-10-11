// Arma la carpeta "app-www" que Capacitor empaqueta dentro de la app Android:
// la página de la app (sin enlaces a matichoc.cl) + el mismo código del juego.
import { cpSync, rmSync, mkdirSync, copyFileSync, writeFileSync } from "node:fs";
import { basename } from "node:path";

const OUT = "app-www";
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
copyFileSync("app/index.html", `${OUT}/index.html`);
// Choco Blaster (juego de "disparos") no va en la app infantil: se deja fuera de la compilación.
const SIN_BLASTER = (src) => !/^(fps-.*\.js|fps3d\.jpg)$/.test(basename(src));
for (const dir of ["js", "css", "assets", "vendor"]) cpSync(dir, `${OUT}/${dir}`, { recursive: true, filter: SIN_BLASTER });
// el material de la tienda y las capturas del menú de la web no se necesitan dentro de la app
writeFileSync(`${OUT}/.nojekyll`, "");
console.log("app-www lista");
