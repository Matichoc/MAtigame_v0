# Auditoría previa a la primera publicación en Google Play (Matijuego)

> Informe técnico y de preparación, **no asesoría legal ni una aprobación de Google**. Revisión hecha el **20 de octubre de 2026** sobre la rama `claude/prepublicacion-play` (base: `origin/main` en `1d639e1`, "Merge pull request #34"). Todo lo que aquí figura como "comprobado" se puede repetir con los comandos de la sección 2; lo que no se pudo comprobar está dicho expresamente (sección 8).

Objetivo de la primera versión (lo pedido): gratuita; sin compras con dinero real; sin SDK de publicidad ni de analítica; ranking remoto **desactivado**; progreso **local**; sin Choco Blaster ni enlaces comerciales accesibles en la variante Android.

Leyenda: ✅ comprobado · ⚠️ pendiente o con condiciones · ❌ bloquea (publicar o probar) · 🔎 no se pudo comprobar aquí.

---

## 0. Resumen ejecutivo

| Tema | Estado | En una línea |
|---|---|---|
| Conexiones de red de la variante app | ✅ | Ninguna: 0 de 1.240 peticiones salieron del origen en 15 juegos; el código solo contiene un cliente de ranking que el build deja apagado y verificado. |
| Política de privacidad | ✅ corregida · ⚠️ sin publicar | La anterior se contradecía (describía un ranking que envía datos y a la vez decía que nada sale del dispositivo). La nueva (v1.0) coincide con el comportamiento comprobado. La ruta pública en matiweb está **preparada, no publicada ni verificada**. |
| Política y licencias dentro de la app | ✅ (navegador) · 🔎 (Android) | Botones al pie del menú; se leen en un cuadro sin salir del juego. |
| Tipografías de marca | ❌ **bloquea producción** | Baby Chipmunk dice en sus propios metadatos "PERSONAL USE | CONTACT ME FOR COMMERCIAL USE"; Adorable Mother Script no trae licencia. Hay sustitutas libres listas (`MATIJUEGO_FONTS=libres`). |
| Ficha y gráficos | ✅ regenerados | Nombres ("Bloques de Productos"), recuento de juegos y capturas salen de la variante actual. |
| APK/AAB | 🔎 **no se pudo compilar aquí** | El entorno bloquea `dl.google.com` (SDK de Android y Maven de Google). El workflow de GitHub sí compila (ejecuciones previas en verde) y ahora además comprueba manifest, permisos y firma. |
| Pruebas nativas (dispositivo/emulador) | 🔎 | No hay ni se pueden instalar. Todo lo "nativo" está en la lista manual (sección 9). |
| Público infantil, alimentos y marca | ⚠️ **requiere revisión humana** | Ver sección 7: la ausencia de enlaces no demuestra que no haya publicidad. |

**Listo para pruebas internas** si: (a) el workflow compila en tu repositorio con tus secretos de firma, (b) decides las tipografías (sección 3.3) y (c) haces las pruebas manuales críticas (sección 9, bloque "antes de pruebas internas"). **No listo para producción** por los puntos de las secciones 10 y 11.

---

## 1. Alcance y método

- **Qué se revisó**: instrucciones del repositorio y de matiweb (`CLAUDE.md`, skills), `docs/PLAY-STORE.md`, `docs/LEGAL-Y-TIENDAS.md`, `store/listing-es.md`, `scripts/build.mjs`, workflows (`android.yml`, `deploy-pages.yml`), `android/` (Gradle, manifest, `MainActivity`), `capacitor.config.json`, `package.json`/lockfile, todo `js/`, `css/`, `assets/`, `vendor/`, y la variante `app-www/` generada.
- **Cómo se contrastó**: cada afirmación de cumplimiento de la documentación se buscó en el código (búsqueda estática) y, cuando fue posible, se comprobó ejecutando el juego en Chromium con un registro de **todas** las peticiones de red (comprobación dinámica).
- **Qué NO se hizo**: durante la revisión no hubo push, merge, despliegues ni publicaciones; después se autorizó **solo** subir las ramas de trabajo (sección 13). Sigue sin hacerse merge, despliegue ni publicación. No se generó ni se tocó ninguna llave de firma real ni secretos. Las llaves que aparecen en las pruebas del workflow son descartables y se crearon en `/tmp` solo para probar la lógica del script.

### Entorno de la revisión y sus límites
| Recurso | Resultado |
|---|---|
| Node 22.22 / npm 10.9 / Java 21 / Chromium 141 + Playwright 1.56 | disponibles |
| Android SDK, emulador, dispositivo, `adb` | **no disponibles**; `dl.google.com` devuelve 403 (política de red del entorno), por lo que tampoco se descargan el SDK, AGP ni AndroidX desde `maven.google.com` (redirige a `dl.google.com`). Para habilitarlo: añadir `dl.google.com` a los dominios permitidos del entorno. |
| `support.google.com` (políticas de Play) | **no accesible**; solo se pudo consultar `developer.android.com` (ver sección 11) |
| Artefactos de GitHub Actions | no descargables (el almacenamiento de blobs está bloqueado), así que no se pudo inspeccionar un APK real |

---

## 2. Cómo reproducir

```bash
git checkout claude/prepublicacion-play
npm ci                                  # instalación reproducible (package-lock.json)
node scripts/build.mjs app              # app-www/ (variante Android)
node scripts/verificar-app.mjs          # comprobaciones estáticas de app-www/
npx cap sync android                    # copia app-www/ al proyecto Android (no necesita SDK)

# Pruebas de navegador (Playwright global + Chromium; ver scripts/qa/lib.cjs)
export NODE_PATH=$(npm root -g)
node scripts/qa/servidor.cjs app-www 8091 &          # sirve la variante app como lo haría Capacitor
node scripts/qa/legal.cjs      http://127.0.0.1:8091/ # privacidad y licencias dentro del juego
node scripts/qa/enlaces.cjs    http://127.0.0.1:8091/ # sin enlaces comerciales, sin WhatsApp, sin Blaster
node scripts/qa/perfiles.cjs   http://127.0.0.1:8091/ # perfiles y persistencia
node scripts/qa/juegos.cjs     http://127.0.0.1:8091/            # los 15 juegos, con registro de red
node scripts/qa/juegos.cjs     http://127.0.0.1:8091/ --sin-red  # igual, cortando todo lo externo
QA_OUT=store node scripts/qa/capturas.cjs http://127.0.0.1:8091/ # capturas de la ficha + gráfico de funciones

# Variante con tipografías libres
MATIJUEGO_FONTS=libres node scripts/build.mjs app && node scripts/verificar-app.mjs
```

El APK de prueba y el `.aab` se arman en GitHub: **Actions → "Compilar app Android" → Run workflow** (ver `docs/PLAY-STORE.md`).

## 3. Hallazgos y cambios por área

### 3.1 Privacidad

#### 3.1.1 Qué conexiones y datos usa de verdad la variante Android

**Búsqueda estática** (en `app-www/`, el resultado del build, no en el código fuente suelto):

| Mecanismo | Dónde aparece | ¿Se ejecuta en la app? |
|---|---|---|
| `fetch(...)` | solo `js/online.js` (cliente del ranking en Supabase) | **No**: `onlineEnabled()` exige URL y llave en `js/online-config.js`, que el build de la app deja **vacío** (ver más abajo). Sin ella no se hace ninguna petición. |
| `XMLHttpRequest`, `WebSocket`, `EventSource`, `sendBeacon`, `importScripts`, Service Worker, cookies, IndexedDB | en ninguna parte | — |
| `window.open("https://wa.me/…")` | `js/creador-game.js` + `js/creador-data.js` (WhatsApp del creador de chocolates) | **No**: en la app el botón ni se crea (antes se creaba y solo se omitía al dibujarlo). El texto `https://wa.me/` sigue en el paquete como código inerte; `verificar-app.mjs` solo tolera esa URL en ese archivo. |
| Enlaces `<a href="http…">` y `target="_blank"` en `index.html` | plantilla `app/index.template.html` | **No** en la app. Quedaba, oculto y sin `href`, el cartel de la demo web (`demo-wall`); ahora el bloque va solo en la variante web. |
| URLs en `vendor/` | comentarios de three.js (documentación) | No son código ejecutable. |
| Tipografías, imágenes, 3D, música y sonidos | locales; la música y los efectos se **sintetizan** con Web Audio (no hay archivos de audio en el paquete) | — |
| Almacenamiento | `localStorage`: `matichoc_profiles_v1`, `matichoc_last_active_profile`, `matichoc_save_v3_profile_<id>` (+ `…_corrupt` si un guardado se daña), `matichoc_joystick` | Todo local. |
| API del dispositivo | `navigator.vibrate` (sin el permiso `VIBRATE` no hace nada en Android), `AudioContext`, `screen.orientation.lock` (sin efecto en WebView), fullscreen | Ninguna pide permisos de privacidad. |

**Ranking remoto — de "apagado por un archivo vacío" a "apagado por el build".** Antes la app dependía de que `js/online-config.js` estuviera vacío en el repositorio. Ahora `scripts/build.mjs app` **sobrescribe** ese archivo con valores vacíos en `app-www/` salvo que se pida `MATIJUEGO_ONLINE=1`, y `scripts/verificar-app.mjs` falla si queda un servidor configurado. Así un cambio accidental en `online-config.js` no enciende el envío de datos en una app publicada. (Si algún día se enciende hay que actualizar política, ficha y "Seguridad de los datos" **antes**; ver `docs/RANKING.md`.)

**Comprobación dinámica** (Chromium, variante app servida como `app-www/`): se registró cada petición mientras se abrían y jugaban los 15 juegos del catálogo → resultados en la sección 4. El recuento de peticiones y su origen sale de `scripts/qa/lib.cjs`.

**Permiso `INTERNET`.** El manifest del repositorio lo declara (lo trae Capacitor de fábrica) y el juego no lo usa. No se quitó: no se pudo probar en un dispositivo si el contenido carga sin él (en WebView, cargar una página `https` sin ese permiso suele fallar aunque el contenido sea local). Queda como prueba manual: quitarlo en una rama y comprobar. Mientras tanto, la política y la ficha dicen exactamente esto.

**Content-Security-Policy en la app.** La web (`matichoc.cl/matijuego`) lleva una CSP estricta; la app no. No se agregó una porque Capacitor puede inyectar un script en línea (`native-bridge.js`) que una CSP `script-src 'self'` bloquearía, y eso no se pudo probar en Android. Con la verificación de arriba, el riesgo de conexiones accidentales es bajo; añadir CSP queda como mejora a probar en dispositivo.

#### 3.1.2 `android:allowBackup="true"` y el almacenamiento

- El manifest tiene `allowBackup="true"` y **no** define `dataExtractionRules` ni `fullBackupContent`: si la persona tiene la copia de seguridad de Android activada, el sistema puede incluir los datos de la app (incluido el `localStorage` de su WebView: nombres de perfil, puntajes, creaciones) en su copia en la nube de Google y restaurarlos en otro teléfono.
- Efectos: (a) a favor — conserva el progreso al cambiar de celular, algo que la propia guía legal anota como carencia; (b) en contra — datos de perfiles infantiles viajan a la cuenta Google del adulto sin que Matichoc los reciba.
- Qué se hizo: **se mantiene `true`** (decisión del dueño, ver sección 10) y se **describe** en la política y en la sugerencia de "Seguridad de los datos". No se verificó en un dispositivo qué datos exactos entran en la copia ni que la restauración funcione (queda en la lista manual).
- Alternativa si se prefiere cero salida del aparato: `android:allowBackup="false"` (una línea en `android/app/src/main/AndroidManifest.xml`); se pierde el progreso al cambiar de teléfono.

#### 3.1.3 Política de privacidad: qué estaba mal y qué se cambió (`app/privacy.html`)

| Afirmación de la versión anterior | Contraste con el código | Resultado |
|---|---|---|
| "Esta información nunca sale del dispositivo" **y** sección "Ranking de jugadores" que dice que se envían apodo, id y puntajes a Supabase | Contradicción interna. El ranking existe en el código pero está apagado; la app no envía nada | ❌ → reescrita: "Matichoc no recibe ningún dato tuyo; esta versión no envía información a ningún servidor" |
| La sección de ranking describía datos que **no** se envían en esta versión (tiempo jugado, días, sesiones…) | Esos datos solo viajarían si se encendiera el ranking | ❌ → quitada; se promete actualizar y avisar antes de activar cualquier función en línea |
| "No hay compras dentro del juego" | Cierto para dinero real; los Matipuntos se gastan en la tienda del juego | ✅ aclarado: "no hay compras con dinero real" |
| "La app no solicita acceso a la cámara…" | Cierto en el manifest del repositorio (manifest final pendiente) | ✅ conservado; ahora explica también `INTERNET` |
| "La app no contiene enlaces que te saquen del juego" | Falso hasta ahora en el código (botón de WhatsApp creado pero no mostrado; cartel de demo con `target=_blank`) | ✅ verdadero tras los cambios de 3.1.1 |
| Cómo borrar los datos | Faltaba borrar un perfil desde el juego y la copia de seguridad de Android | ✅ agregado |
| Apodos | La nota decía "se piden como apodo" pero el campo decía "Nombre o apodo" | ✅ el campo ahora dice "Apodo (inventado)" |
| `noindex` en la página | Una política que Play debe poder leer no debería ocultarse | ✅ quitado (la CSP de la página impide cargar nada externo) |
| Ley 19.628 | Vigente; la Ley 21.719 la reemplazará | ⚠️ se cita sin afirmar fecha; **revisión legal pendiente** (sección 7) |

Datos legales (razón social, RUT, domicilio, correo) **no se cambiaron**: son los entregados por el dueño y coinciden con los de matiweb (`CLAUDE.md` de matiweb pide no tocarlos sin confirmar).

#### 3.1.4 La política dentro de la app

- Botones "🔒 Privacidad" y "📜 Créditos y licencias" al pie del menú (pantalla de perfiles y menú principal, variante app y web). Abren un cuadro (`#legal-dialog`) con un `iframe` **aislado** (`sandbox=""`, sin scripts) que carga `privacy.html` / `licenses.html` del propio paquete; se cierra con "Cerrar"; también está programado cerrarlo tocando fuera o con Escape (esto último no se probó).
- El build copia `app/privacy.html` y genera `licenses.html` en `app-www/` y `web-www/`; el workflow lo exige (`npm run verify:app` y una comprobación sobre el APK; esta última sin ejecutar todavía en GitHub).
- Comprobado en navegador (`scripts/qa/legal.cjs`): abre las dos, cambia de una a otra, cierra, 0 errores, 0 peticiones externas. **No probado en Android**: el gesto "atrás" no cierra el cuadro (cierra la app o navega según Capacitor); ver lista manual.
- El `mailto:` de la política debería quedar bloqueado dentro del `iframe` aislado (a propósito: no se sale del juego); el correo se lee como texto. No se probó el toque sobre ese enlace.

#### 3.1.5 Ruta pública en matiweb (preparada, NO publicada)

- Repositorio local `/home/user/matiweb`, rama `claude/matijuego-politica-privacidad` (commit `f8a890545958f70cca54e663ccf46376463fe9b9`, subido a esa rama; **sin merge ni despliegue**): agrega `matijuego/privacy.html` (copia exacta de `app/privacy.html`) y una nota en `CLAUDE.md`. **No** toca `pages/privacidad.html` (política general de matichoc.cl).
- URL destino: `https://matichoc.cl/matijuego/privacy.html`. Es estable porque `matijuego/` se regenera con `scripts/deploy-matiweb.mjs`, que copia `web-www/` (que ahora incluye `privacy.html`): el despliegue la repone en vez de borrarla.
- Estado de verificación: ✅ se abre bien servida desde la copia local (ver sección 4); 🔎 **no está publicada**, así que no se verificó la URL real. Antes de usarla en Play Console: hacer merge/despliegue en matiweb, abrirla **sin sesión** desde otra red y comprobar que carga (no PDF, no redirige a login) y que el texto es el de `app/privacy.html`.
- Observación: la política general de matiweb (`pages/privacidad.html`, línea ~103) ya dice que el progreso del Matijuego no sale del dispositivo ni se envía a ningún servidor; coincide con esta versión. No se editó (los textos legales de matiweb requieren confirmación del dueño). Conviene que ahí se enlace la política del juego: decisión del dueño.
- Las URL que mencionaban `docs/PLAY-STORE.md` y `store/listing-es.md` (`matichoc.cl/MAtigame_v0/app/privacy.html` y la de `github.io`) eran suposiciones sin verificar; se reemplazaron. Ojo: `deploy-pages.yml` publica **toda la raíz** del repositorio (público) en GitHub Pages, incluidos `docs/`, `admin/` y `android/`: no es un problema de secretos (no hay ninguno; la llave de pruebas es pública a propósito) pero no es la web de producción.

#### 3.1.6 Ficha y "Seguridad de los datos"

`store/listing-es.md` quedó alineado: descripción sin "compras dentro del juego" ambiguas, aviso de que el progreso es local, y respuestas sugeridas con las **condiciones** (ver 3.1.2): "No recopila ni comparte datos" **solo** si la definición oficial de Play Console lo confirma para datos solo locales y copias de seguridad del sistema (no se pudo consultar esa página).

### 3.2 Ficha y material gráfico

| Hallazgo | Acción |
|---|---|
| `store/listing-es.md` decía "TETRIS DE PRODUCTOS" (el juego ya se llama **Bloques de Productos** en la app, logros y álbum) | ✅ corregido. Quedaban además: `README.md` (paso 4 de "Cómo jugar"), comentarios internos y `docs/LEGAL-Y-TIENDAS.md` (que ya lo contaba como resuelto) |
| La ficha decía "12 aventuras" y `PLAY-STORE.md` "9 juegos" | ✅ el menú de la app lista **15 entradas** (`GAMES_CATALOG` sin los `appHidden`): 14 juegos y mundos 3D (Pueblo, Recolecta, Parkour, Salto, Autos, Bloques, Memoria, Básquet, Porristas, Fútbol, Choco Match, Ciudad, Mati Merge, Aventura) + el taller "Crea tu Chocolate". Se comprobó abriendo las 15 (sección 4). Ficha, README y gráfico dicen ahora "14 juegos y mundos 3D" más el taller. Cuatro de ellos (Fútbol, Choco Match, Aventura, Ciudad) se desbloquean con Matipuntos ganados jugando |
| La ficha omitía Mati Merge | ✅ agregado |
| Gráfico de funciones (`feature-graphic.png`) decía "9 juegos 3D" | ✅ regenerado con `scripts/qa/capturas.cjs` (logo + texto + tres capturas reales de la app) |
| Las 8 capturas eran de una versión anterior: mostraban "Tetris de Productos", la frase "Estilo Roblox", personajes que ya no existen ("Choco Capitán"…) y juegos que hoy piden el celular **acostado** mostrados en vertical | ✅ regeneradas desde la variante app actual: los juegos que piden horizontal (Parkour, Básquet, Recolecta, Porristas) en **1920×1080**; el resto (menú, Bloques, Crea tu Chocolate, Salto) en **1080×1920**. Sin retoques: son capturas directas del navegador a 2× (`store/screenshots/`). Archivos renombrados `03-tetris` → `03-bloques`, `04-basquet_tiros` → `04-basquet` |
| `PLAY-STORE.md`: `scripts/build-app.mjs`, `app/index.html` (no existen; es `scripts/build.mjs` y `app/index.template.html`), "9 juegos", política sin enlace real | ✅ actualizado (pasos de compilación, workflow con `release`/`fonts`, rutas de la política) |
| `README.md`: "Ejecutar en local" (servir la raíz) y "Despliegue" eran obsoletos (la raíz solo redirige y la página sale de una plantilla) | ✅ reescritos |
| `LEGAL-Y-TIENDAS.md` | ✅ corregidas las afirmaciones que el código no respalda (permisos finales, ranking, política, tipografías, licencias, `allowBackup`, URL de la política) |

Salvedades:
- Hay que verificar en Play Console los **requisitos vigentes de capturas** (tamaño, cantidad, mezcla de orientaciones): esa página no se pudo consultar (sección 8). Lo habitual es aceptar JPEG/PNG con lado mayor ≤ 2× el menor.
- La captura del menú incluye el cartel del evento de temporada "Noche de Cacao… Hasta el 02/11"; si se publica después, conviene volver a generarla (`node scripts/qa/capturas.cjs`). El evento también depende de la fecha del teléfono.
- Las capturas muestran el logo y los personajes de Matichoc muy presentes (carteles en el básquet, el escenario de porristas…): relevante para el punto 7.
- Los nombres de archivo de `assets/games/*.jpg` (tarjetas del menú) no contienen texto de marcas ajenas, pero son de versiones anteriores del juego; regenerarlas es opcional.

### 3.3 Licencias

#### 3.3.1 Inventario de lo que se distribuye

| Recurso | Versión / origen | Licencia | Evidencia | Obligación | Estado |
|---|---|---|---|---|---|
| three.js (`vendor/three.module.min.js`) | r160 | MIT, © 2010-2023 three.js authors | cabecera `@license` + `vendor/THREE-LICENSE.txt` | conservar aviso y texto | ✅ acreditado en "Créditos y licencias" con el texto completo |
| Módulos de efectos (`vendor/three-examples/`: EffectComposer, UnrealBloomPass, RenderPass, ShaderPass, OutputPass, MaskPass, Pass, shaders) | del repo three.js r160 (`examples/jsm`) | MIT (misma licencia del repo) | ubicación y nombres; las cabeceras de estos archivos no repiten la licencia | ídem | ✅ cubiertos por el mismo aviso. 🔎 no se pudo cotejar con el repo oficial (sin red a GitHub desde el entorno) |
| Capacitor (`@capacitor/core`, `@capacitor/android`) | 8.5.3 | MIT, © 2017-present Drifty Co. | `node_modules/@capacitor/*/LICENSE`, `package.json` | conservar aviso y texto | ✅ acreditado con texto (`app/licenses/Capacitor-MIT.txt`) |
| Apache Cordova Android (`org.apache.cordova:framework`) | 14.0.1 | Apache-2.0 | POM en Maven Central (sección `<licenses>`) | copia de la licencia + NOTICE | ✅ licencia incluida (`app/licenses/Apache-2.0.txt`, texto oficial de `/usr/share/common-licenses`); ⚠️ no se pudo inspeccionar el `NOTICE` del artefacto (Maven devolvió 429) |
| AndroidX: appcompat 1.7.1, coordinatorlayout 1.3.0, core 1.17.0, activity 1.11.0, fragment 1.8.9, webkit 1.14.0, core-splashscreen 1.2.0 | `android/variables.gradle` | Apache-2.0 (AOSP/Jetpack) | políticas publicadas de Jetpack; 🔎 no resueltas por Gradle aquí | idem | ✅ acreditado como grupo; ⚠️ falta la lista **transitiva** real (kotlin-stdlib, lifecycle, savedstate…): hay que generarla en CI (ver 3.4.4) |
| tslib (dependencia de `@capacitor/core`, solo herramientas) | 2.6.2 | 0BSD | `npm ls` | ninguna | ✅ no se distribuye |
| Dependencias de desarrollo (`@capacitor/assets`, `@capacitor/cli`) | — | varias | `npm ls` | ninguna (no van en el paquete) | ✅ `npm audit --omit=dev`: **0 vulnerabilidades** en lo que se distribuye. `npm audit` completo: 7 en herramientas de desarrollo (xcode/@trapezedev), no se empaquetan |
| Tipografía **Baby Chipmunk** (`assets/fonts/baby-chipmunk.ttf`) | © Stefani Letter 2020, v1.00 | **metadatos del archivo: "PERSONAL USE \| CONTACT ME FOR COMMERCIAL USE"**; `fsType=2` (incrustación restringida) | `name` IDs 0, 13, 14 del propio TTF (leídos con fontTools) | requiere licencia comercial y permiso de incrustación | ❌ **sin comprobante** |
| Tipografía **Adorable Mother Script** (`assets/fonts/adorable-mother-script.otf`) | © 7NTypes 2021, v1.00 | **no declara licencia** en el archivo (derechos reservados) | `name` IDs 0, 8, 9, 11, 12 | licencia del proveedor | ❌ **sin comprobante** |
| Fotos de productos (`assets/products/*.jpg`, 12) | "recortes de fotos reales" (README) | propiedad de Matichoc **si las tomó/encargó la empresa** | sin metadatos de autoría; 🔎 | autoría o contrato del fotógrafo | ⚠️ **comprobante a aportar** |
| Logos, patrón, íconos (`assets/brand/`, `resources/`, `store/icon-512.png`) | idénticos byte a byte a los de matichoc.cl (logo horizontal, favicon, ícono 512, apple-touch, ambos patrones); solo `logo-badge.png` difiere | marca de Matichoc | comparación de hashes con `matiweb/assets/brand` | titularidad de la marca (ver 7) | ⚠️ procedencia coherente; titularidad y registro por confirmar |
| Personajes Matichico / Chocolatina y todo el arte 3D | generados por código (canvas / three.js), sin archivos | autoría de Matichoc con herramientas de IA | el código; ninguna imagen de terceros | responsabilidad del titular (ver 7) | ⚠️ ver 7 |
| Música y efectos | sintetizados en el dispositivo (Web Audio); no hay archivos de audio | — | inventario de `app-www/`: 0 archivos de audio | ninguna | ✅ |
| `assets/games/*.jpg` (tarjetas del menú) | capturas del propio juego | — | ✅ ninguna muestra "Tetris" ni otras marcas (revisada `tetris.jpg`) | — | ⚠️ son de versiones anteriores: conviene regenerarlas (ver 3.2) |

**Qué se hizo**: página "Créditos y licencias" (`app/licenses.html`, accesible desde el menú) con los avisos y textos de las licencias de código abierto y las tipografías; el build la genera y se verifica que no queden marcas `{{…}}` sin reemplazar. `vendor/THREE-LICENSE.txt` ya viajaba dentro del paquete (sigue ahí).

#### 3.3.2 Tipografías de marca: bloqueo y sustitución propuesta

- **Hecho verificable**: los dos archivos son byte a byte los mismos que sirve matichoc.cl (`matiweb/assets/fonts/`). El problema, por lo tanto, también existe en el sitio web, no solo en la app.
- **No se inventó ninguna autorización.** Hay que aportar uno de estos comprobantes por cada fuente: factura/licencia comercial del proveedor (para Baby Chipmunk: Stefani Letter, contacto en el propio archivo; para Adorable Mother Script: 7NTypes) que cubra **uso comercial y distribución incrustada en una app**.
- **Sustitución lista y reversible** (no cambia nada por defecto): `MATIJUEGO_FONTS=libres` (o la opción `fonts: libres` del workflow) arma la app con **Fredoka 600** (en lugar de Baby Chipmunk) y **Dancing Script 700** (en lugar de Adorable Mother Script), ambas **SIL Open Font License 1.1** (paquetes `@fontsource/fredoka` y `@fontsource/dancing-script` 5.3.0, campo `license: OFL-1.1`), con sus textos en `assets/fonts-libres/`. En ese modo **no se copia ningún archivo de las fuentes de marca** al paquete y la página de licencias lo refleja. El cambio visual es de estilo (más redondeado y regular) y debe aprobarlo quien lleva la marca; los nombres de familia en el CSS no cambian, solo el archivo.
- Por defecto el build sigue usando las de marca, **con un aviso** de `verificar-app.mjs`. Recomendación: para pruebas internas cualquiera de las dos; para producción, o comprobante o `libres`.

### 3.4 Android y compilación

#### 3.4.1 Revisión de la configuración (lo que está en el repositorio)

| Elemento | Valor encontrado | Evaluación |
|---|---|---|
| Identificador | `cl.chocojuego.matichoc` (`applicationId`, `namespace`, `appId` de Capacitor, `strings.xml`) | ✅ coherente; **no se puede cambiar una vez publicada** |
| SDK | `minSdk 24`, `compileSdk 36`, `targetSdk 36` | ✅ cumple el requisito de Play vigente (ver fuentes: desde el 31-ago-2026 las apps nuevas deben apuntar a API 36) |
| AGP / Gradle / Java | AGP 8.13.0, Gradle 8.14.3 (`-all`, sin `distributionSha256Sum`), Java 21 | ✅ compila en CI (ejecuciones en verde). ⚠️ conviene fijar el hash de Gradle y revisar que sigan vigentes |
| Capacitor | 8.5.3 (`^8.0.0` en `package.json`, versión exacta en el lockfile), sin plugins nativos (`capacitor.plugins.json` = `[]`) | ✅ superficie nativa mínima |
| Manifest (repositorio) | permiso `INTERNET`; `allowBackup=true`; actividad principal `exported=true` (necesario) con `singleTask`; `FileProvider` no exportado | ✅/⚠️ ver abajo |
| `capacitor.config.json` | `allowMixedContent: false`, `webContentsDebuggingEnabled: false` | ✅ |
| Versionado | `versionCode` = `VERSION_CODE` (número de ejecución del workflow) y `versionName` = `VERSION_NAME` (por defecto `1.0.0`) | ✅ sube solo; debe ser mayor en cada subida a Play |
| Firma | `debug` usa la llave pública `android/app/matijuego-test.keystore` (contraseña en claro en `build.gradle`: es a propósito, solo pruebas); `release` solo se firma si llegan `KEYSTORE_PATH`, `KEYSTORE_PASSWORD`, `KEY_ALIAS`, `KEY_PASSWORD` por variables de entorno; sin ellas el `.aab` sale **sin firmar** | ✅ mecanismo correcto: la llave pública no puede firmar un release por accidente |
| Minificación | `minifyEnabled false` | ✅ aceptable (WebView + Capacitor); no se pidió reducir |
| Librerías nativas / 16 KB | el proyecto no declara NDK ni librerías `.so` propias | ✅ sobre el papel (solo Java/Kotlin cumple 16 KB según la guía oficial, ver fuentes); 🔎 **no comprobado en un APK/AAB real** |

Hallazgos menores del manifest (no se cambiaron; no se pueden probar sin dispositivo):
- `res/xml/file_paths.xml` expone `external-path "."` (todo el almacenamiento externo) a un `FileProvider` que la app no usa (Capacitor solo lo emplea para cámara/selector de archivos y el juego no usa `<input type=file>`). Es `exported=false`, así que no es explotable hoy, pero **se puede eliminar** el `provider` y `file_paths.xml` para reducir superficie.
- `com.google.gms:google-services` está en el `classpath` de `android/build.gradle` aunque no hay `google-services.json` (el plugin no se aplica): se puede quitar para no depender de otra herramienta.
- Sin `android:dataExtractionRules` (ver 3.1.2). `lint` avisará de ello.
- Sin permiso `VIBRATE`: `navigator.vibrate` no hace nada en Android (el juego lo llama de forma segura); es solo una pérdida menor de realimentación háptica.
- Sin plugin `@capacitor/app`: el gesto/botón "atrás" no está controlado por el juego. En Capacitor, sin ese plugin "atrás" retrocede el historial del WebView y, si no hay, cierra la app. Como las pantallas del juego no usan historial, **"atrás" probablemente cierra la app desde cualquier pantalla**. No se agregó un plugin nativo sin poder probarlo; es la prueba manual n.º 1 de la sección 9 y una decisión de producto.

#### 3.4.2 Qué se pudo ejecutar

| Comando | Resultado |
|---|---|
| `npm ci` | ✅ instalación reproducible desde `package-lock.json` (0 vulnerabilidades en dependencias de ejecución) |
| `node scripts/build.mjs app` / `web` (incluida `MATIJUEGO_FONTS=libres`) | ✅ |
| `node scripts/verificar-app.mjs` | ✅ (con el aviso de tipografías de marca) |
| `npx cap sync android` | ✅ copia `app-www/` (3,9 MB, incluye `privacy.html` y `licenses.html`); no modifica archivos versionados |
| `./gradlew assembleDebug`, `bundleRelease`, `aapt2`, `apksigner` | 🔎 **no ejecutables aquí**: sin Android SDK y sin acceso a `dl.google.com`/`maven.google.com` |
| Manifest final y APK de prueba | 🔎 **no generados ni inspeccionados**. El último APK de CI (`matijuego-prueba-apk`) tampoco se pudo descargar para inspeccionarlo (almacenamiento de blobs bloqueado) |
| Ejecuciones del workflow "Compilar app Android" en GitHub | ✅ las más recientes (`6b5b443`, run 39039680411, y `58ddaba`, run 38994099500) terminaron en verde; **eso no valida los cambios de esta rama**: la rama ya está subida, pero no hay pull request ni ejecución manual sobre ella, así que el workflow aún no ha corrido con estos cambios |

#### 3.4.3 Workflow de GitHub (`.github/workflows/android.yml`)

Cambios hechos (sin poder ejecutarlos en GitHub desde aquí):
- `npm run verify:app` después de armar `app-www/` (falla si hay Blaster, enlaces, ranking encendido o faltan las páginas legales).
- Paso **"Comprobar el APK de prueba"** con `aapt2`: lista los permisos y **falla si hay otro distinto de `INTERNET`** (ignora el permiso interno `…DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION` que agrega AndroidX), imprime el manifest, lista librerías `.so` (se espera ninguna), falla si hay Choco Blaster y si faltan `privacy.html`/`licenses.html`.
- Entradas nuevas: `release` (falla si faltan los secretos de firma en vez de omitir el `.aab` en silencio) y `fonts` (`marca` | `libres`).
- Secretos: el keystore se decodifica desde una **variable de entorno** (antes se interpolaba el secreto dentro del script), con `umask 077`, y se **borra** al terminar (`if: always()`).
- Paso **"Comprobar la firma del .aab"**: imprime el firmante y **falla si el `.aab` está firmado con la llave pública de pruebas**. La lógica del script (extracción de huellas, comparación, detección de la llave de pruebas, filtro de permisos) se probó localmente con una llave descartable y con la de pruebas del repositorio; ver sección 4. El workflow completo **no** se ha ejecutado.
- Sin cambios: acciones por etiqueta mayor (`@v4`); recomendado fijarlas por SHA.
- **Cuándo corre**: solo a mano (`workflow_dispatch`) y en pull requests que tocan la app (`android/`, `app/`, `js/`, `css/`, `assets/`, `scripts/`, etc.). **No corre al hacer push/merge a `main`** (ahí solo corre `deploy-pages.yml`): un merge no produce un APK nuevo; hay que lanzarlo a mano.

#### 3.4.4 Qué falta para dar por buena la compilación (en GitHub, con tus secretos)
1. Correr el workflow con `release` marcado y los 4 secretos cargados **en GitHub** (nunca en un chat); revisar el log de los pasos de comprobación.
2. Bajar el APK y el `.aab`; con Android Studio ("Analyze APK") o `bundletool` comprobar manifest final, permisos, ausencia de `.so` y firma.
3. Generar el informe de licencias transitivas del APK (por ejemplo, un paso que liste `./gradlew :app:dependencies` y las licencias de cada POM) y completarlo en `app/licenses.html`.
4. Subir el `.aab` a **pruebas internas** y mirar los avisos de Play Console (16 KB, API objetivo, permisos).

### 3.5 Pruebas (navegador vs. nativo)

**Navegador (Chromium 141, Playwright 1.56, WebGL por software "SwiftShader")** — scripts reproducibles en `scripts/qa/`:

| Prueba | Qué comprueba | Resultado (sección 4) |
|---|---|---|
| `juegos.cjs` | Abre y arranca los 15 juegos del catálogo de la **variante app**, juega unos segundos con el teclado, registra errores de consola, recursos que no cargan (HTTP ≥ 400) y toda petición fuera del origen | ✅ 15/15, 0 errores, 0 recursos caídos, 0 externas |
| `juegos.cjs --sin-red` | Igual, pero abortando todo lo que no sea el servidor local | ✅ 15/15, 0 intentos de conexión externa |
| `enlaces.cjs` | En la app: 0 enlaces `http(s)`, 0 `target=_blank`, 0 formularios, sin botón de WhatsApp en el resultado de "Crea tu Chocolate", `window.open` jamás llamado, sin Choco Blaster en el catálogo ni en el DOM. Sobre la web hace lo mismo como control: ahí **sí** aparecen los enlaces a matichoc.cl, el botón de WhatsApp y Choco Blaster (la prueba discrimina) | ✅ |
| `perfiles.cjs` | Crear perfil, guardar progreso, "cerrar y reabrir" (página nueva en el mismo contexto), segundo perfil sin mezcla de datos, guardado antiguo/incompleto (faltan 9 campos), borrar perfil, solo claves `matichoc_*` | ✅ 13/13 |
| `legal.cjs` | Privacidad y créditos/licencias se leen dentro del juego y se cierran | ✅ |
| `servidor.cjs` | Sirve `app-www/` (o `web-www/`) tal cual, como lo haría Capacitor | — |
| `capturas.cjs` | Genera las capturas de la ficha y el gráfico de funciones | ✅ |

Lo que estas pruebas **no** demuestran: rendimiento (SwiftShader no representa una GPU de teléfono), el comportamiento del WebView real de Android, el audio, el multitoque, la rotación, el modo avión real, el ciclo de vida de la app (segundo plano, matar el proceso) ni el gesto "atrás". Los fallos que sí encontró están en la sección 5.

**Nativo (Android)**: **ninguna prueba ejecutada** (sin SDK, emulador ni dispositivo). Todo lo nativo está en la sección 9. No hay resultados "nativos" que reportar y no se debe inferir que el APK funciona por lo que pasa en el navegador.

## 4. Comandos ejecutados y resultados reales

Entorno: Node 22.22.0, npm 10.9.4, Java 21.0.12, Chromium 141.0.7390.37, Playwright 1.56.1 (global), Linux x64. Árbol probado: rama `claude/prepublicacion-play` sobre `1d639e1` con los cambios de este informe (el JS del juego no cambió entre las pruebas y el commit; después solo se tocaron páginas legales, documentación y scripts de comprobación).

| Comando | Resultado |
|---|---|
| `npm ci` | ✅ terminó sin errores (`package-lock.json` coherente) |
| `npm ls --omit=dev` | `@capacitor/android@8.5.3`, `@capacitor/core@8.5.3` (+ `tslib@2.6.2`) |
| `npm audit --omit=dev` | ✅ 0 vulnerabilidades |
| `npm audit` (con desarrollo) | 7 (3 moderadas, 3 altas, 1 crítica) en `xcode`/`@trapezedev/*`, herramientas de `@capacitor/assets`; **no van en el paquete** |
| `node scripts/build.mjs app` | ✅ `app-www/` (110 archivos, 3,5 MB; sin `fps-*.js` ni `fps3d.jpg`) |
| `node scripts/verificar-app.mjs` | ✅ OK, con el aviso de tipografías de marca |
| `MATIJUEGO_FONTS=libres node scripts/build.mjs app` + verificador | ✅ OK; 0 archivos de las fuentes de marca en el paquete; se vio el menú con Fredoka/Dancing Script sin errores ni recursos caídos |
| `node scripts/build.mjs web` | ✅ por defecto igual que antes (tipografías de marca, `privacy.html` y `licenses.html` incluidas) |
| `npx cap sync android` | ✅ copió `app-www` (3,9 MB) y creó `capacitor.config.json`; `capacitor.plugins.json` = `[]` |
| `node scripts/qa/legal.cjs` | ✅ Privacidad y Créditos/licencias abren, se cambian y se cierran; 0 errores, 0 externas |
| `node scripts/qa/enlaces.cjs` (app) | ✅ 0 enlaces `http`, 0 `target=_blank`, 0 formularios, 0 botones de WhatsApp, `window.open` nunca llamado, `fps3d` fuera del catálogo y de la página. Control en la **web**: sí hay enlaces a matichoc.cl, botón de WhatsApp y Choco Blaster (la prueba distingue) |
| `node scripts/qa/perfiles.cjs` | ✅ 13/13 (crear, guardar, reabrir, segundo perfil, guardado incompleto, borrar, solo `matichoc_*`, 0 externas, 0 errores) |
| `node scripts/qa/juegos.cjs` (variante app) | ✅ **15/15 juegos** abren, inician y juegan; 1.240 peticiones, **0 externas**, 0 errores de consola, 0 recursos con HTTP ≥ 400 |
| `node scripts/qa/juegos.cjs --sin-red` | ✅ **15/15**, 0 peticiones externas intentadas ni abortadas |
| `node scripts/qa/capturas.cjs` (+ `--solo-grafico`) | ✅ 8 capturas (4 horizontales 1920×1080, 4 verticales 1080×1920) y `feature-graphic.png` 1024×500; 0 externas, 0 errores |
| `bash scripts/qa/probar-logica-workflow.sh` | ✅ 5/5: filtro de permisos y comparación de firmas del workflow (con una llave **descartable** creada en un directorio temporal) |
| `python3 -c "yaml.safe_load(...android.yml)"` | ✅ YAML válido (no es una validación de GitHub) |
| Copia local de matiweb servida en `/matijuego/privacy.html` | ✅ 200, mismo contenido que `app/privacy.html` y `web-www/privacy.html`, 0 externas, 0 errores (la página aún **no** está publicada) |
| `./gradlew assembleDebug`, `bundleRelease`, `aapt2`… | 🔎 **no ejecutados** (sección 8) |

**Antes de cambiar nada**, la versión previa dejaba: política contradictoria, botón de WhatsApp creado en la app, ranking activable por configuración, ficha con "Tetris de Productos", y ninguna comprobación automática de la variante app (sección 5).

## 5. Fallos encontrados y corregidos

| # | Hallazgo | Evidencia | Corrección |
|---|---|---|---|
| 1 | La política describía un ranking que envía datos **y** afirmaba que nada sale del dispositivo | `app/privacy.html` (versión anterior) frente a `js/online.js` + `js/online-config.js` | Política reescrita (3.1.3) |
| 2 | El ranking remoto dependía de que un archivo del repositorio estuviera vacío | `js/online-config.js` se copiaba tal cual al paquete | El build de la app lo fuerza vacío; el verificador falla si no lo está (3.1.1) |
| 3 | En la app se **creaba** el botón de WhatsApp (solo se omitía al agregarlo) y quedaba un cartel con `target=_blank` en el HTML | `js/creador-game.js`, `app/index.template.html` | El botón no se crea en la app; el cartel de la demo va solo en la web; `main.js` tolera su ausencia |
| 4 | Textos obsoletos: "Tetris de Productos" en la ficha y el README, "9 juegos"/"12 aventuras", gráfico con "9 juegos", capturas de versiones anteriores (incluían "Estilo Roblox") | `store/`, README, `docs/PLAY-STORE.md` | Corregidos y capturas regeneradas (3.2) |
| 5 | Instrucciones de compilación obsoletas (`scripts/build-app.mjs`, `app/index.html`), README ("servir la raíz"), URL de la política sin verificar | `docs/PLAY-STORE.md`, `README.md`, `store/listing-es.md` | Corregidas (3.2) |
| 6 | El campo de perfil decía "Nombre o apodo" mientras la documentación decía que se pide un apodo | `app/index.template.html` | "Apodo (inventado)" |
| 7 | Workflow: el secreto del keystore se interpolaba dentro del script, el `.aab` podía omitirse sin avisar, sin comprobar permisos/firma | `.github/workflows/android.yml` | Entorno + `umask` + borrado; entrada `release`; comprobaciones de APK y firma (3.4.3). Sin ejecutar en GitHub |
| 8 | Tipografías de marca sin licencia comercial comprobable (Baby Chipmunk: "personal use") | metadatos del TTF | **No resuelto**: bloqueo documentado; alternativa libre disponible (3.3.2) |
| 9 | Errores **de las propias pruebas y comprobaciones** que se corrigieron durante la revisión (para que otro revisor no los repita): el verificador marcaba como "enlace externo" las direcciones citadas como texto en las licencias OFL/Apache (ahora solo mira atributos reales); `perfiles.cjs` contaba la tarjeta "Nuevo jugador" como perfil y no aceptaba el cuadro de confirmación en la página nueva; `capturas.cjs` pedía las tipografías desde `about:blank` (CORS); la comparación de huellas de firma cortaba la huella en el primer `:`  | `scripts/qa/*`, `scripts/verificar-app.mjs`, workflow | corregidos y probados (sección 4) |
| 10 | Corrección a una afirmación anterior de este mismo trabajo: se dijo que `main` generaba un APK; **no es así**: el workflow Android solo corre a mano y en pull requests; en `main` corre únicamente el despliegue de Pages | `.github/workflows/*.yml`, lista de ejecuciones | Documentado en 3.4.3 |

Observado y **no** corregido (requiere decisión o dispositivo): ver 3.4.1 (FileProvider, google-services, `dataExtractionRules`, `VIBRATE`, "atrás"), 3.3 (tipografías y fotos) y la sección 7.

## 6. Cambios realizados (archivos afectados)

Rama `claude/prepublicacion-play` de `Matichoc/MAtigame_v0` y rama `claude/matijuego-politica-privacidad` de `Matichoc/matiweb` (ambas subidas; SHAs en la sección 13).

| Área | Archivos |
|---|---|
| Privacidad | `app/privacy.html` (reescrita), `app/index.template.html` (botones, cuadro, "Apodo (inventado)", demo solo web, CSP web con `frame-src 'self'`), `js/main.js` (visor), `css/style.css`, `js/creador-game.js` |
| Licencias | `app/licenses.html` (nueva), `app/licenses/Apache-2.0.txt`, `app/licenses/Capacitor-MIT.txt`, `assets/fonts-libres/*` (Fredoka 600, Dancing Script 700 + OFL) |
| Build y verificación | `scripts/build.mjs` (privacidad/licencias, ranking forzado apagado en la app, `MATIJUEGO_FONTS`, `MATIJUEGO_ONLINE`), `scripts/verificar-app.mjs`, `package.json` (`verify:app`) |
| Android / CI | `.github/workflows/android.yml` |
| Ficha y gráficos | `store/listing-es.md`, `store/feature-graphic.png`, `store/screenshots/*` (8 capturas; renombradas `03-bloques`, `04-basquet`) |
| Pruebas reproducibles | `scripts/qa/` (`lib`, `servidor`, `juegos`, `enlaces`, `perfiles`, `legal`, `capturas`, `probar-logica-workflow.sh`) |
| Documentación | `docs/AUDITORIA-PREPUBLICACION.md` (este informe), `docs/PLAY-STORE.md`, `docs/LEGAL-Y-TIENDAS.md`, `README.md` |
| matiweb (local) | `matijuego/privacy.html` (nueva), `CLAUDE.md` (nota) |

No se tocó: `android/` (manifest, Gradle), la lógica de los juegos, `docs/ECONOMIA.md`, ni los textos legales de matiweb.

## 7. Revisión humana: público infantil, publicidad y marca

> Esta sección enumera **puntos que necesitan decisión o criterio de una persona (abogado/a, titular de la marca, quien responde ante Google)**. Nada de lo que sigue se da por cumplido ni por aprobado. Las políticas de Google (Familias, Anuncios, Datos de usuario) y la ley chilena no se pudieron leer en su fuente oficial desde este entorno (sección 8); hay que verificarlas el día de publicar.

### 7.1 Familias y público infantil
1. **Audiencia declarada**: la decisión vigente del dueño es público infantil (5 o menos, 6-8, 9-12). No se cambió. Eso incorpora la app a la política "Diseñada para familias" de Google: revisar *completa* y vigente (contenido, anuncios, datos, permisos, promoción).
2. **Lo comprobado en el código**: sin SDK de anuncios ni de analítica (dependencias: Capacitor/AndroidX/Cordova), sin chat, sin enlaces ni compras, sin datos fuera del dispositivo (secciones 3.1 y 4).
3. **Mecánicas de retención** que conviene revisar con criterio de consumo infantil (no las prohíbe esta auditoría, pero son material típico de revisión): energía que se agota y se recarga con el tiempo (200, +15/h), cofres cada 40 min, racha y calendario de recompensas diarias, eventos de temporada con fecha, "Matipuntos" que desbloquean juegos (2.000 c/u) y se pueden canjear por energía, sobres de figuritas aleatorios que se ganan jugando. Hoy **nada se paga con dinero**; si se vendiera algo, `docs/LEGAL-Y-TIENDAS.md` §2.3 aplica.
4. **Perfiles y texto libre**: los apodos (≤16) y las etiquetas de "Crea tu Chocolate" son texto libre **local**; no hay moderación porque nada se comparte. Si se activa el ranking: filtro, reporte, borrado y consentimiento de madres/padres (ver §2.2 de la guía legal).
5. **Datos de menores**: la política dice que Matichoc no recibe nada. Las copias de seguridad de Android (3.1.2) llevan los perfiles a la cuenta Google del adulto: confirmar que eso es aceptable y cómo se declara.
6. **Países de distribución**: COPPA (EE. UU.) y el RGPD (UE) aplican si se distribuye allí. Opción a decidir: publicar solo en Chile en la primera versión.
7. **Clasificación de contenido**: la calcula el cuestionario IARC que responde el titular. Puntos para responder con cuidado: obstáculos de Parkour, choques de Autos, y la "flor de fuego" de Aventura Choco (se lanzan "bolas de fuego" contra enemigos de caricatura).

### 7.2 Promoción de alimentos a menores y publicidad
- **Quitar enlaces comerciales no prueba que no haya publicidad.** El juego, por diseño, integra la marca de una chocolatería dentro de un producto para niñas y niños: logotipos en escenarios (carteles "MATICHOC" en la cancha y el escenario de porristas, tableros, monedas), fotos reales de productos como piezas de juego (Memoria, Mati Merge, Choco Match, Bloques), los personajes de marca (Matichico y Chocolatina) como protagonistas, el taller "Crea tu Chocolate" con el catálogo real, la tienda de ropa y el texto "🍫 Un juego promovido por Matichoc · pasión por el cacao" en el menú.
- Preguntas que debe contestar una persona con criterio legal **antes** de producción: (a) ¿esto es "publicidad dirigida a menores" para la política de Anuncios/Familias de Google?; (b) en Chile, la **Ley 20.606** y su reglamento restringen la publicidad de alimentos "ALTO EN" dirigida a menores de 14 años, incluido el uso de personajes, juegos y otros "ganchos" (así lo anota el propio `CLAUDE.md` de matiweb para el guía Matichico); ¿los productos de Matichoc llevan o llevarán sellos? (matiweb indica que las etiquetas nutricionales están "en preparación"); (c) ¿hace falta la redacción "promovido por Matichoc"? Se conservó tal cual. *Esta revisión no consultó el texto de la ley ni del reglamento*.
- Se mantiene la decisión previa de dejar **fuera** de la app los botones de compra/WhatsApp y los enlaces a matichoc.cl; eso reduce el riesgo pero no lo elimina.

### 7.3 Marca y propiedad intelectual
1. **"Matichoc" / "Matijuego"**: sin consulta a INAPI en esta revisión (clases 9, 41 y 30). Si "Matijuego" no está a nombre del titular, hay riesgo de retiro de la ficha.
2. **"Bloques de Productos"** conserva la **mecánica clásica de Tetris** (7 tetrominós, bolsa de 7, pieza guardada, "caída", líneas) con otra apariencia. El nombre y los textos ya no mencionan la marca, pero el parecido de reglas y presentación puede ser relevante legalmente: pedir criterio legal.
3. **Aventura Choco**: mecánicas de plataformas con **"Hongo Matichoc" que te agranda y "Flor de fuego" que lanza bolas de fuego**, vidas extra al juntar 50 alfajores y (según los comentarios del código) tuberías: evocan de cerca a Super Mario Bros. No hay nombres ni gráficos de terceros, pero conviene revisión legal; opciones: diferenciar el poder (otro objeto y otro efecto) antes de publicar.
4. Mati Merge (estilo "2048"/juegos de fusionar) y Choco Match (tres en línea) usan mecánicas genéricas con productos propios.
5. Textos que se leen como marcas deportivas ("LA LIGA"): probablemente aluden a La Ligua, pero pueden confundirse con La Liga de fútbol; bajo riesgo, confirmar.
6. **Tipografías** (3.3.2) y **fotos de productos** (3.3.1): comprobantes de licencia/autoría.
7. **Personajes y arte hechos con IA**: la política ya lo declara. Google y Apple lo permiten, pero el titular responde de que no copie obras de terceros y debe guardar las condiciones de uso de las herramientas.
8. Sellos y logos de terceros (Google Play, "Diseñada para familias", clasificación): usar solo los oficiales y según sus guías de marca.

## 8. Lo que no se pudo comprobar (y por qué)

| Qué | Motivo | Cómo cerrarlo |
|---|---|---|
| Compilación Gradle, APK, AAB, manifest final, permisos finales, librerías `.so`, tamaño, firma | El entorno bloquea `dl.google.com` (403): no hay Android SDK ni se resuelven AGP/AndroidX | Ejecutar el workflow en GitHub (sección 3.4.4) o permitir `dl.google.com` en el entorno |
| Inspección del APK que ya generó CI | Los artefactos viven en un almacenamiento de blobs bloqueado | Descargarlo y abrirlo con Android Studio ("Analyze APK") |
| Cualquier prueba en dispositivo/emulador | No existen aquí | Sección 9 |
| Compatibilidad 16 KB | Requiere el AAB/APK real (solo hay evidencia "sobre el papel": sin NDK ni `.so` propios; la guía oficial dice que apps solo Java/Kotlin la cumplen) | Comprobar con `bundletool`/Play Console y probar en emulador de 16 KB |
| Dependencias transitivas y sus licencias | Gradle no resuelve | Informe de licencias en CI (3.4.4) |
| `NOTICE` de Cordova | Maven Central devolvió 429 | Revisar el artefacto o el APK final |
| Políticas de Google Play (Familias, Anuncios, Datos de usuario, capturas, definición de "recopilar", copias de seguridad) | `support.google.com` bloqueado | Leerlas en Play Console el día de publicar |
| Leyes 19.628, 21.719 y 20.606; INAPI | No consultados en fuentes oficiales | Revisión legal (sección 7) |
| URL pública de la política | No está publicada | Desplegar matiweb y abrirla (3.1.5) |
| Que `three-examples` coincida con el repo oficial de three.js r160 | Sin acceso a GitHub desde el entorno | Comparar hashes con el paquete npm `three@0.160.0` |
| Rendimiento real, calentamiento, memoria, audio, háptica, rotación, atrás, segundo plano, copia de seguridad | Dependen de dispositivo | Sección 9 |
| Que el `iframe` de la política abra bien dentro de **WebView** (se probó en Chromium) | Sin dispositivo | Prueba manual 15 |

## 9. Pruebas manuales pendientes (en teléfono real, con el APK de CI)

Marca cada una con fecha y modelo de teléfono. **Bloque A: antes de pruebas internas (críticas).**

**A. Antes de las pruebas internas**
1. **Primera carga**: instala el APK de prueba y ábrelo. Debe verse el sello de inicio y el menú, sin pantalla en blanco. (No quites el permiso `INTERNET` del manifest sin repetir antes esta prueba y la 2 con la versión sin él.)
2. **Modo avión**: con avión activado desde antes de abrir, abre la app y juega al menos 5 minutos en cada uno de los 15 juegos, crea un perfil, guarda progreso, abre Privacidad y Créditos y licencias. Nada debe pedir conexión ni fallar.
3. **Gesto/botón "atrás"** en cada pantalla (perfiles, menú, juego, cuadros, política): ¿cierra la app sin avisar? ¿deja pantallas trabadas? (3.4.1 anticipa que cierra la app). Decidir si se agrega el plugin `@capacitor/app`.
4. **Rotación**: girar el teléfono en cada juego (los que piden horizontal avisan "gira tu celular") y durante una partida; no debe perder el estado ni dejar el lienzo estirado.
5. **Segundo plano y ciclo de vida**: dejar la app 1 minuto, 20 minutos y 3 horas en segundo plano y volver; matarla desde "recientes" y reabrir (¿vuelve al perfil, sale el sello de inicio, se conserva todo?); recibir una llamada o notificación en plena partida (debe pausar, el audio debe volver bien, el WebGL no debe quedar negro).
6. **Audio**: música y efectos suenan desde el primer toque; con volumen en 0 no pasa nada; auriculares/Bluetooth; interrupción por llamada o por otra app de audio.
7. **Rendimiento en un teléfono modesto** (≤ 3 GB de RAM, gama baja, p. ej. Mali-G52/Adreno 610): fluidez en Parkour, Pueblo, Ciudad, Autos y Fútbol (los más pesados), temperatura tras 15 minutos, cierres por falta de memoria, y que el modo de baja calidad automático actúe. Anotar FPS aproximados.
8. **Actualización sin perder el progreso**: instalar un APK (firmado con la misma llave), crear perfil y progreso, instalar encima un APK con `versionCode` mayor: perfiles, Matipuntos, ropa, casa, logros y energía deben seguir. Repetir con el `.aab` desde pruebas internas de Play (esa vía usa la llave de Play App Signing). Nota: el APK de prueba y el `.aab` de tienda se firman con llaves distintas: **no se instalan uno encima del otro**; desinstalar al cambiar de uno a otro.
9. **Manifest y permisos del APK real**: con Android Studio, comprobar que solo se pide `INTERNET` (más el permiso interno de AndroidX), `allowBackup=true`, sin `.so`, y que no está Choco Blaster. El workflow ya lo comprueba; esto lo confirma a mano.
10. **Enlaces**: tocar logos, créditos y todos los botones del menú y de "Crea tu Chocolate": nada debe abrir el navegador, WhatsApp ni la tienda.

**B. Antes de producción**
11. **Copia de seguridad/restauración (`allowBackup`)**: con la copia de Google activada, desinstalar y reinstalar, o cambiar de teléfono; ver qué vuelve (¿perfiles?, ¿versión corrupta?). Probar también con la copia desactivada.
12. **Pantallas variadas**: muesca/recorte, 20:9 y 16:9, plegables, tablet de 10", barra de gestos: botones tapados o fuera de pantalla; modo multiventana.
13. **Teclado**: al escribir el apodo y las etiquetas, el campo no debe quedar oculto; la longitud máxima (16) se respeta.
14. **Almacenamiento lleno y "Borrar datos"** (Ajustes → Aplicaciones → Matijuego): la app debe arrancar limpia sin errores; verificar lo que dice la política.
15. **Política y licencias dentro de la app (WebView real)**: se leen completas, se desplaza el texto, cierran con "Cerrar" y con el gesto atrás; el correo se ve; no abren el navegador.
16. **Hora del sistema**: adelantar/atrasar el reloj y comprobar que no se "regala" energía ni recompensas diarias (la guía legal lo anota como punto de trampa).
17. **Accesibilidad**: tamaño mínimo de toque (≈ 48 dp), contraste, jugar sin sonido, daltonismo (Choco Match), TalkBack básico.
18. **Instalación desde Play** (pruebas internas): primera apertura, actualización por Play, y que Play Console no muestre avisos de 16 KB, API objetivo ni permisos.
19. **Dispositivo con páginas de 16 KB** (emulador Android 15+ con imagen de 16 KB): abrir y jugar.
20. **Textos**: leer todos los textos buscando faltas y marcas ajenas; revisar "Próximamente" (no debe poder comprarse nada).
21. **Estrés de sesión larga**: 60 minutos seguidos jugando (memoria, temperatura, fugas) en el teléfono modesto.

## 10. Decisiones y comprobantes que debes aportar

**Decisiones**
1. **Tipografías**: ¿se consigue licencia comercial (comprobante) o se publica con `MATIJUEGO_FONTS=libres` (Fredoka + Dancing Script)? El diseño debe aprobar el cambio visual. *(Bloquea producción.)*
2. **Copias de seguridad de Android (`allowBackup`)**: ¿se mantiene `true` (progreso sobrevive a un cambio de teléfono; datos de perfiles infantiles pasan por la nube de Google del adulto) o `false`?
3. **Gesto "atrás"**: ¿se agrega `@capacitor/app` para controlarlo (requiere compilar y probar en dispositivo)?
4. **Permiso `INTERNET`**: ¿se prueba quitarlo? (Ganancia: manifest sin permisos; riesgo: que el WebView no cargue).
5. **Países de distribución** de la primera versión (opción: solo Chile).
6. **Tipo de cuenta** de desarrollador (organización con D-U-N-S o personal con prueba cerrada de 12 testers por 14 días — requisito a verificar en la consola) y **correo y datos legales públicos** (los de la política).
7. **Marca integrada en un juego para niños** (sección 7.2): ¿se mantiene la redacción "Un juego promovido por Matichoc", los logos en escenarios y las fotos de productos como piezas de juego?
8. **Aventura Choco**: ¿se diferencia el poder "Hongo / Flor de fuego" de Super Mario Bros antes de publicar? ¿y la mecánica clásica de "Bloques de Productos"?
9. **Dónde se enlaza la política del juego** desde matichoc.cl (la política general de matiweb no se editó).
10. **Quién responde las consultas de privacidad** y desde qué correo.

**Comprobantes que faltan**
| Comprobante | Para qué |
|---|---|
| Licencia comercial de **Baby Chipmunk** (Stefani Letter) con permiso de incrustación en apps | usarla en la app (y en matichoc.cl) |
| Licencia de **Adorable Mother Script** (7NTypes) | ídem |
| Autoría/contrato de las **fotografías de productos** (`assets/products/*.jpg`) y de las fotos usadas en los logos | derechos de imagen |
| Titularidad y registro (INAPI) de **Matichoc** y **Matijuego** (clases 9, 41, 30) y del diseño de los personajes Matichico y Chocolatina | marca |
| Condiciones de uso de las herramientas de IA que generaron código/arte | responsabilidad del titular |
| Opinión legal sobre Ley 20.606, ley de datos de menores (19.628/21.719) y política de Familias | sección 7 |
| Confirmación de que el correo y la dirección de la política se pueden publicar | privacidad |

## 11. Pendientes priorizados

**Antes de pruebas internas (en este orden)**
1. Correr "Compilar app Android" sobre esta rama (abrir un pull request o lanzarlo a mano) en GitHub **con `release` y tus secretos de firma** (cargados solo en GitHub); revisar los pasos de comprobación de APK y firma del `.aab`. *(Lo que más reduce incertidumbre: nada del Gradle se ejecutó aquí.)*
2. Corregir lo que arroje el workflow si algo falla (los scripts de comprobación nunca se ejecutaron en GitHub).
3. Instalar el APK en un teléfono real y hacer el **bloque A** de la sección 9 (primera carga, modo avión, atrás, rotación, segundo plano, audio, rendimiento, actualización).
4. Decidir tipografías (para pruebas internas sirve cualquiera; el aviso queda a la vista).
5. Desplegar la página de la política en matiweb (rama ya subida, sin merge) **solo cuando decidas**, y abrir `https://matichoc.cl/matijuego/privacy.html` sin sesión para confirmarla.

**Antes de producción**
6. Comprobante de licencia de tipografías **o** build `libres` (sección 10, ❌).
7. Revisión legal/humana de la sección 7 (familias, publicidad de alimentos a menores, Ley 20.606, datos de menores, marca y juegos parecidos) y respuesta a las decisiones 2, 5, 7 y 8.
8. Formularios de Play Console contestados con las respuestas sugeridas **después** de leer las definiciones vigentes (seguridad de los datos, público objetivo, anuncios, clasificación). No cambiar los rangos de edad para evitar requisitos.
9. Bloque B de pruebas manuales (sección 9), incluyendo copia de seguridad, 16 KB, pantallas variadas y accesibilidad.
10. Informe de licencias transitivas del APK y revisión del `NOTICE`; completar `app/licenses.html` si faltan avisos.
11. Si cumple la cuenta personal nueva: la prueba cerrada de 12 testers/14 días antes de producción (verificar la regla vigente en la consola).
12. Mejoras recomendadas (no bloquean): fijar el hash de Gradle y las acciones del workflow por SHA; quitar `FileProvider`/`file_paths.xml` y el classpath de `google-services`; `dataExtractionRules`; volver a generar las tarjetas `assets/games/*.jpg` y las capturas si cambia la interfaz o termina el evento de temporada; CSP en la app si se prueba en dispositivo.

## 12. Fuentes consultadas (consulta del 20-oct-2026)

| Fuente | Qué se usó | Resultado |
|---|---|---|
| Android Developers — *Meet Google Play's target API level requirement*, `https://developer.android.com/google/play/requirements/target-sdk` | Desde el **31-ago-2026** las apps nuevas y sus actualizaciones deben apuntar a **Android 16 (API 36)** o superior; se puede pedir prórroga hasta el 1-nov-2026 | el proyecto apunta a 36 ✅ |
| Android Developers — *Support 16 KB page sizes*, `https://developer.android.com/guide/practices/page-sizes` | Si la app solo usa Java/Kotlin (incluidas sus bibliotecas) ya es compatible; con NDK hay que recompilar | sin evidencia de código nativo en el repositorio; **no verificado en el AAB** |
| Android Developers — *Android developer verification*, `https://developer.android.com/developer-verification` | Programa de verificación de desarrolladores: protecciones desde el 30-sep-2026 en países seleccionados (Brasil, Indonesia, Singapur, Tailandia) y expansión global en 2027; afecta sobre todo a apps instaladas fuera de Play | **no se evaluó** su efecto sobre el APK de pruebas distribuido manualmente; revisar antes de repartir APK a testers |
| Documentación del propio entorno (límites de red) | `dl.google.com` bloqueado | motivo de la sección 8 |
| `support.google.com` (Familias, Anuncios, Datos de usuario, definición de "recopilar", capturas) | — | **no accesible; sin verificar** |
| bcn.cl (leyes), inapi.cl, ftc.gov | — | **no consultados** |
| Metadatos de los archivos de fuentes (fontTools 4.67), `package.json`/licencias de `node_modules`, POM de `org.apache.cordova:framework:14.0.1` en Maven Central | tipografías, MIT, Apache-2.0 | citados en 3.3 |

## 13. Ramas y commits (estado al subirlas)

Verificación previa a la subida: el diff contra `origin/main` solo contiene archivos de código, documentación, textos de licencia, imágenes de la ficha y scripts; **ningún** keystore, llave, `.apk`/`.aab`, `node_modules`, `app-www/`, `web-www/`, `local.properties`, `.env` ni artefacto de compilación (la única llave versionada, `android/app/matijuego-test.keystore`, es la pública de pruebas que ya estaba en el repositorio y no forma parte de estos cambios); búsqueda de patrones de secretos (claves privadas, tokens de GitHub/AWS/Google/Slack, JWT, `service_role`, cadenas base64 largas) sin coincidencias en el contenido añadido, salvo la contraseña de una llave **descartable** que `scripts/qa/probar-logica-workflow.sh` crea y borra en un directorio temporal.

| Repositorio | Rama | Commit | Mensaje |
|---|---|---|---|
| `Matichoc/MAtigame_v0` | `claude/prepublicacion-play` | `e19e5be27d69b7cadd53e5da3086eb4f6e9fa78a` | Privacidad y licencias dentro de la app; la app sale siempre con el ranking apagado y se verifica el paquete |
| `Matichoc/MAtigame_v0` | `claude/prepublicacion-play` | `864371e842abebdc69433c11937b2b0f738502e9` | Workflow Android: comprobar permisos, contenido y firma; secretos por entorno; entradas release y fonts |
| `Matichoc/MAtigame_v0` | `claude/prepublicacion-play` | `c57b719f066da5029c047f7910dc6ba4f9d1c6db` | Ficha, capturas y documentación de prepublicación; pruebas de navegador reproducibles; informe de auditoría |
| `Matichoc/MAtigame_v0` | `claude/prepublicacion-play` | (commit siguiente: ver `git log`) | Informe: estado de ramas tras la subida |
| `Matichoc/matiweb` | `claude/matijuego-politica-privacidad` | `f8a890545958f70cca54e663ccf46376463fe9b9` | Matijuego: página pública de la política de privacidad (matijuego/privacy.html), preparada sin publicar |

Sin pull requests, sin merge, sin despliegue y sin publicación. La página `https://matichoc.cl/matijuego/privacy.html` **no existe todavía** en producción: solo se publicará cuando alguien haga merge del cambio de matiweb y se despliegue.
