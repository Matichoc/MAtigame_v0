// Comprobaciones automáticas de la carpeta que se empaqueta en el APK/AAB (app-www/). Sale con error si algo no cumple.
//   node scripts/build.mjs app && node scripts/verificar-app.mjs
// Cubre lo que se puede comprobar SIN Android: sin Choco Blaster, sin enlaces comerciales ni a internet, ranking en línea apagado,
// páginas de privacidad y licencias presentes. (El manifest y el contenido final del APK se revisan en el workflow de GitHub.)
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const DIR = process.argv[2] || "app-www";
const fallos = [];
const avisos = [];
const falla = (m) => fallos.push(m);

const archivos = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? archivos(join(d, f)) : [join(d, f)]));
if (!existsSync(DIR)) { console.error(`No existe ${DIR}: ejecuta antes "node scripts/build.mjs app".`); process.exit(2); }
const todos = archivos(DIR);
const rel = (f) => relative(DIR, f).replace(/\\/g, "/");
const texto = (f) => readFileSync(f, "utf8");

// 1) Choco Blaster fuera
for (const f of todos) if (/(^|\/)(fps-[^/]*\.js|fps3d\.jpg)$/.test(rel(f))) falla(`Choco Blaster dentro de la app: ${rel(f)}`);
const index = texto(join(DIR, "index.html"));
if (/screen-fps|Choco Blaster/i.test(index)) falla("index.html todavía contiene la pantalla o el nombre de Choco Blaster");
if (!/data-app="1"/.test(index)) falla('index.html no tiene data-app="1" (no es la variante app)');
if (/data-demo="1"/.test(index)) falla('index.html tiene data-demo="1"');

// 2) Nada que lleve a internet: ni enlaces ni recursos remotos en las páginas, ni URLs en el código propio
if (/(href|src|action)\s*=\s*["']https?:/i.test(index)) falla("index.html tiene enlaces o recursos http(s)");
if (/target\s*=\s*["']_blank/i.test(index)) falla('index.html tiene enlaces target="_blank"');
// En las páginas solo importan los enlaces y recursos reales (atributos); los textos de licencias citan direcciones web como texto.
for (const f of todos.filter((x) => /\.(html|css)$/.test(x))) {
  const t = texto(f);
  if (/\b(href|src|action|srcset|poster|data)\s*=\s*["']\s*(https?:)?\/\//i.test(t)) falla(`Enlace o recurso externo en ${rel(f)}`);
  if (/@import|url\(\s*["']?(https?:)?\/\//i.test(t)) falla(`CSS con recursos remotos en ${rel(f)}`);
  if (/\btarget\s*=\s*["']_blank/i.test(t)) falla(`target="_blank" en ${rel(f)}`);
}
// En el JS propio (no en vendor/) solo se tolera el enlace de WhatsApp del creador de chocolates: el botón no se crea en la app (ver js/creador-game.js).
const PERMITIDAS = new Map([["js/creador-data.js", ["https://wa.me/"]], ["js/online-config.js", []]]);
for (const f of todos.filter((x) => rel(x).startsWith("js/") && x.endsWith(".js"))) {
  const t = texto(f);
  const sin = t.replace(/^\s*\/\/.*$/gm, "");
  const urls = [...sin.matchAll(/https?:\/\/[^\s"'`)]+/g)].map((m) => m[0]);
  const ok = PERMITIDAS.get(rel(f)) || [];
  for (const u of urls) if (!ok.some((p) => u.startsWith(p))) falla(`URL en el JS de la app: ${u} (${rel(f)})`);
  if (/\b(fetch|XMLHttpRequest|WebSocket|EventSource|sendBeacon)\b/.test(sin) && rel(f) !== "js/online.js") falla(`Uso de red en ${rel(f)}`);
}
const wa = texto(join(DIR, "js/creador-game.js"));
if (!/if \(!inApp\)/.test(wa)) falla("creador-game.js: el botón de WhatsApp no está protegido para la app");

// 3) Ranking en línea apagado
const online = texto(join(DIR, "js/online-config.js"));
if (/url:\s*"[^"]+"/.test(online) || /anonKey:\s*"[^"]+"/.test(online)) falla("js/online-config.js tiene un servidor configurado: el ranking en línea debe ir apagado en la primera versión");

// 4) Páginas legales presentes y sin marcas sin reemplazar
for (const p of ["privacy.html", "licenses.html"]) {
  if (!existsSync(join(DIR, p))) { falla(`Falta ${p}`); continue; }
  const t = texto(join(DIR, p));
  if (/\{\{[A-Z_]+\}\}/.test(t)) falla(`${p} tiene marcas {{...}} sin reemplazar`);
}
if (!/legal-open/.test(index)) falla("El menú no tiene los botones de Privacidad / Créditos y licencias");
if (/ranking que transmite|no sale del dispositivo/i.test(texto(join(DIR, "privacy.html")))) avisos.push("privacy.html: revisa frases absolutas sobre datos");

// 5) Licencias de lo que se distribuye
if (!existsSync(join(DIR, "vendor/THREE-LICENSE.txt"))) falla("Falta vendor/THREE-LICENSE.txt");
const marca = existsSync(join(DIR, "assets/fonts"));
const libres = existsSync(join(DIR, "assets/fonts-libres"));
if (marca && libres) falla("Hay tipografías de marca Y libres a la vez");
if (marca && DIR.startsWith("app")) {
  // Las tipografías de marca no tienen comprobante de licencia comercial: en la app solo se aceptan si alguien lo confirma de forma explícita.
  if (process.env.MATIJUEGO_FONTS_LICENCIA_CONFIRMADA === "1") avisos.push("Se distribuyen las tipografías de marca con la licencia CONFIRMADA por el titular (MATIJUEGO_FONTS_LICENCIA_CONFIRMADA=1): conserva el comprobante.");
  else falla("La app incluye las tipografías de marca (Baby Chipmunk, Adorable Mother Script) sin licencia comercial confirmada. Usa las libres (por defecto) o define MATIJUEGO_FONTS_LICENCIA_CONFIRMADA=1 solo si tienes el comprobante.");
} else if (marca) avisos.push("Se distribuyen las tipografías de marca (Baby Chipmunk, Adorable Mother Script): sin comprobante de licencia comercial. Alternativa: MATIJUEGO_FONTS=libres.");
if (!marca && !libres) falla("No hay ninguna tipografía");

// arte de temporada (js/season-art.js): cada imagen nombrada debe venir dentro de la app (si falta, se vería el sello habitual y quedaría una petición fallida)
const season = readFileSync(join(DIR, "js/season-art.js"), "utf8");
for (const m of season.matchAll(/["'](assets\/temporadas\/[^"']+)["']/g)) {
  if (!existsSync(join(DIR, m[1]))) falla(`Falta el arte de temporada ${m[1]} (lo nombra js/season-art.js): genera los recursos con scripts/temporada-recursos.mjs (ver docs/TEMPORADAS.md)`);
}

// resumen
const bytes = todos.reduce((n, f) => n + statSync(f).size, 0);
console.log(`${DIR}: ${todos.length} archivos, ${(bytes / 1048576).toFixed(1)} MB`);
for (const a of avisos) console.log(`AVISO  ${a}`);
if (fallos.length) {
  for (const m of fallos) console.log(`FALLA  ${m}`);
  process.exit(1);
}
console.log("OK: la carpeta de la app cumple las comprobaciones automáticas.");
