// Servidor estático mínimo para las pruebas: node scripts/qa/servidor.cjs <carpeta> [puerto]
// Sirve la carpeta tal cual (como lo haría Capacitor con app-www/). Sin dependencias.
const http = require("http");
const fs = require("fs");
const path = require("path");
const root = path.resolve(process.argv[2] || "app-www");
const port = +(process.argv[3] || 8090);
const tipos = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css", ".png": "image/png", ".jpg": "image/jpeg", ".ico": "image/x-icon", ".ttf": "font/ttf", ".otf": "font/otf", ".woff2": "font/woff2", ".txt": "text/plain; charset=utf-8" };
http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  if (p.endsWith("/")) p += "index.html";
  const f = path.join(root, p);
  if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end("no encontrado"); return; }
  res.writeHead(200, { "Content-Type": tipos[path.extname(f)] || "application/octet-stream" });
  fs.createReadStream(f).pipe(res);
}).listen(port, "127.0.0.1", () => console.log(`sirviendo ${root} en http://127.0.0.1:${port}/`));
