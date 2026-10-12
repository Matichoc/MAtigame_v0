// Publica la versión web en matichoc.cl/matijuego: arma web-www y la copia a la carpeta
// matijuego/ del repo matiweb. Uso:
//   node scripts/deploy-matiweb.mjs [ruta-al-repo-matiweb]
// (por defecto ../matichoc/matiweb, junto a este repo). No hace commit: eso lo hace quien lo llama.
import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const target = resolve(process.argv[2] || "../matichoc/matiweb");
if (!existsSync(join(target, "CNAME"))) {
  console.error(`No parece el repo matiweb: ${target}`);
  process.exit(1);
}
execFileSync("node", ["scripts/build.mjs", "web"], { stdio: "inherit" });
const dest = join(target, "matijuego");
rmSync(dest, { recursive: true, force: true });
mkdirSync(dest, { recursive: true });
cpSync("web-www", dest, { recursive: true });
const count = (d) => readdirSync(d).reduce((n, f) => n + (statSync(join(d, f)).isDirectory() ? count(join(d, f)) : 1), 0);
console.log(`matijuego actualizado en ${dest} (${count(dest)} archivos)`);
