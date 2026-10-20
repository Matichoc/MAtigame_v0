// Arma el juego en dos variantes a partir de UNA sola página (app/index.template.html):
//   node scripts/build.mjs app  → app-www/  (app de Android: sin enlaces a matichoc.cl ni Choco Blaster)
//   node scripts/build.mjs web  → web-www/  (versión web completa; es la que se copia a matichoc.cl/matijuego)
// Las dos llevan la política de privacidad (privacy.html) y los créditos/licencias (licenses.html), que se consultan desde el menú.
//
// Variables de entorno (todas opcionales):
//   MATIJUEGO_DEMO=1      web en modo demo (ver js/demo.js)
//   MATIJUEGO_FONTS=libres|marca  libres = tipografías de licencia libre (SIL OFL, assets/fonts-libres/) en vez de las de marca
//                           (Baby Chipmunk / Adorable Mother Script) y NO se copian las de marca. Por defecto: libres en la app, marca en la web.
//   MATIJUEGO_ONLINE=1    la app (Android) conserva la configuración del ranking en línea de js/online-config.js.
//                         Sin esto, la app SIEMPRE sale con el ranking apagado y sin conexión a ningún servidor.
import { cpSync, rmSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { basename } from "node:path";

// Tipografías de licencia libre que reemplazan a las de marca (mismos nombres de familia en el CSS: solo cambia el archivo).
const FUENTES = {
  "assets/fonts/baby-chipmunk.ttf": ["assets/fonts-libres/fredoka-latin-600-normal.woff2", "font/woff2", "woff2"],
  "assets/fonts/adorable-mother-script.otf": ["assets/fonts-libres/dancing-script-latin-700-normal.woff2", "font/woff2", "woff2"],
};

const variant = process.argv[2];
// Tipografías: la APP usa por defecto las de licencia libre (SIL OFL) porque las de marca no tienen comprobante de licencia comercial
// (ver docs/AUDITORIA-PREPUBLICACION.md). Para usar las de marca en la app hay que pedirlo con MATIJUEGO_FONTS=marca (y confirmar la licencia al verificar).
// La WEB (matichoc.cl/matijuego) conserva las de marca por defecto, como el resto del sitio; MATIJUEGO_FONTS=libres también sirve ahí.
const FUENTES_LIBRES = process.env.MATIJUEGO_FONTS ? process.env.MATIJUEGO_FONTS === "libres" : variant === "app";
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
// MATIJUEGO_DEMO=1 enciende el modo demo de la web (ver js/demo.js); apagado por defecto.
const attr = variant === "app" ? 'data-app="1"' : process.env.MATIJUEGO_DEMO === "1" ? 'data-demo="1"' : "";
html = html.replace("{{APP_ATTR}}", attr).replace("{{TITLE}}", variant === "app" ? "Matijuego" : "Matichoc Arcade");
// Si el ranking en línea está encendido (js/online-config.js con URL), la página debe poder conectarse a ese servidor.
const onlineUrl = (readFileSync("js/online-config.js", "utf8").match(/url:\s*"(https:\/\/[^"]+)"/) || [])[1];
if (onlineUrl) html = html.replace("connect-src 'self';", `connect-src 'self' ${new URL(onlineUrl).origin};`);
if (FUENTES_LIBRES) {
  for (const [orig, [libre, tipo]] of Object.entries(FUENTES)) {
    html = html.replace(new RegExp(`href="${orig.replace(/[.]/g, "\\.")}" as="font" type="font/[a-z0-9]+"`), `href="${libre}" as="font" type="${tipo}"`);
  }
}
writeFileSync(`${OUT}/index.html`, html);

// Choco Blaster (juego de "disparos") no va en la app infantil: se deja fuera de esa compilación.
// Las tipografías que no se usan en esta compilación tampoco se copian (con MATIJUEGO_FONTS=libres no viaja ningún archivo de las de marca).
const COPIAR = (src) => {
  const ruta = src.replace(/\\/g, "/");
  if (variant === "app" && /^(fps-.*\.js|fps3d\.jpg)$/.test(basename(src))) return false;
  if (/(^|\/)assets\/fonts-libres(\/|$)/.test(ruta)) return FUENTES_LIBRES;
  if (/(^|\/)assets\/fonts(\/|$)/.test(ruta)) return !FUENTES_LIBRES;
  return true;
};
for (const dir of ["js", "css", "assets", "vendor"]) {
  cpSync(dir, `${OUT}/${dir}`, { recursive: true, filter: COPIAR });
}
if (FUENTES_LIBRES) {
  let css = readFileSync(`${OUT}/css/style.css`, "utf8");
  for (const [orig, [libre, , formato]] of Object.entries(FUENTES)) {
    css = css.replace(new RegExp(`url\\("\\.\\./${orig.replace(/[.]/g, "\\.")}"\\) format\\("[a-z0-9]+"\\)`), `url("../${libre}") format("${formato}")`);
  }
  writeFileSync(`${OUT}/css/style.css`, css);
}
// Ranking en línea: la app de Android sale SIEMPRE con él apagado (no se conecta a ningún servidor) salvo que se pida con MATIJUEGO_ONLINE=1.
if (variant === "app" && process.env.MATIJUEGO_ONLINE !== "1") {
  writeFileSync(`${OUT}/js/online-config.js`, "// Generado por scripts/build.mjs: la app de Android no se conecta a ningún servidor (ranking en línea apagado).\nexport const ONLINE = { url: \"\", anonKey: \"\" };\n");
}
// Política de privacidad y créditos/licencias: páginas sueltas que el menú abre dentro de la app.
writeFileSync(`${OUT}/privacy.html`, readFileSync("app/privacy.html", "utf8"));
{
  const marca = "(<!--FUENTES_MARCA-->|<!--/FUENTES_MARCA-->)";
  const libres = "(<!--FUENTES_LIBRES-->|<!--/FUENTES_LIBRES-->)";
  let lic = readFileSync("app/licenses.html", "utf8");
  const quitar = FUENTES_LIBRES ? "FUENTES_MARCA" : "FUENTES_LIBRES";
  lic = lic.replace(new RegExp(`<!--${quitar}-->[\\s\\S]*?<!--/${quitar}-->`, "g"), "").replace(new RegExp(marca + "|" + libres, "g"), "");
  const esc = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const texto = (ruta) => esc(readFileSync(ruta, "utf8").trim());
  lic = lic.replace("{{LIC_THREE}}", () => texto("vendor/THREE-LICENSE.txt")).replace("{{LIC_CAPACITOR}}", () => texto("app/licenses/Capacitor-MIT.txt")).replace("{{LIC_APACHE}}", () => texto("app/licenses/Apache-2.0.txt"));
  if (FUENTES_LIBRES) lic = lic.replace("{{LIC_OFL}}", () => ["Fredoka", "DancingScript"].map((n) => texto(`assets/fonts-libres/OFL-${n}.txt`)).join("\n\n----------------------------------------\n\n"));
  lic = lic.replace("{{VERSION_THREE}}", (readFileSync("vendor/three.module.min.js", "utf8").match(/const t="(\d+)"/) || [, "?"])[1]);
  writeFileSync(`${OUT}/licenses.html`, lic);
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
