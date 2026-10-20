# Matijuego: qué revisar antes de subirlo a Google Play y a la App Store

> **Importante:** esto es una guía técnica y de preparación, **no asesoría legal**. Las políticas de Google, Apple y la ley chilena cambian seguido: antes de publicar, verifica cada punto en la fuente oficial (los enlaces están al final) y, para lo legal (marcas, datos de menores, ventas), consulta con un abogado o con INAPI. Revisión hecha en octubre de 2026. **Esta guía fue contrastada con el código en `docs/AUDITORIA-PREPUBLICACION.md`: donde ambas difieran, vale la auditoría** (que además dice qué quedó sin poder comprobar).

Leyenda: ✅ ya está resuelto en el repositorio · ⚠️ hay que decidir o hacer algo · ❌ puede bloquear la publicación si no se resuelve.

---

## 1. Lo que ya está resuelto

- ✅ **Sin anuncios, sin análisis de uso, sin rastreadores de terceros.** Eso simplifica muchísimo las políticas de niños.
- ✅ **Sin cuentas ni datos personales**: los perfiles son apodos guardados en el dispositivo.
- ✅ **Permisos mínimos**: el manifest del repositorio solo declara `INTERNET` (ni cámara, ni micrófono, ni ubicación, ni archivos); lo incluye Capacitor de fábrica y el juego no lo usa. El manifest **final** del APK se comprueba en el workflow (no se pudo armar el APK en el entorno de revisión).
- ✅ **Política de privacidad** (`app/privacy.html`, versión 1.0, corregida: ya no describe un ranking que transmite datos) dentro de la app (botón del menú) y como página pública `matijuego/privacy.html` en matiweb (**preparada, no publicada**).
- ✅ **Sin enlaces que saquen de la app** (la versión app no lleva enlaces a matichoc.cl).
- ✅ **Sin juegos de disparos** en la app (Choco Blaster solo está en la web).
- ✅ **Target API 36** (Android 16) y `minSdk 24` (`android/variables.gradle`).
- ✅ **Ranking en línea apagado**: el build de la app fuerza `js/online-config.js` vacío salvo `MATIJUEGO_ONLINE=1`, y `scripts/verificar-app.mjs` falla si queda un servidor configurado. Las pruebas de navegador registraron 0 peticiones fuera del origen.
- ✅ En este PR se **quitaron marcas ajenas de los textos visibles**: "Tetris de Productos" pasó a **"Bloques de Productos"** ("¡TETRIS!" a "¡4 LÍNEAS!", "Maestro del Tetris" a "Maestro de los Bloques") y se sacó "estilo Roblox" de la descripción del Parkour.

---

## 2. ❌ / ⚠️ Cosas que pueden bloquear o complicar la publicación

### 2.1 Marcas y propiedad intelectual (las más importantes)
- ⚠️ **"Matichoc" y "Matijuego"**: busca en INAPI (<https://www.inapi.cl>) si están registradas a nombre de la empresa, en clase 9 (software/juegos) y 41 (entretenimiento), además de la 30 (chocolatería) que ya debería estar. Si otro tiene "Matijuego" registrado, Google/Apple pueden bajar la app. Registrarla es barato comparado con perder la ficha.
- ⚠️ **Nombres parecidos a juegos famosos**: ya quité "Tetris" y "Roblox". Revisa también las descripciones de la ficha (`store/listing-es.md`) y las capturas (`store/screenshots/03-tetris.jpg` es solo un nombre de archivo, pero revisa que no se lea "Tetris" en la imagen). Las **mecánicas** (juntar piezas, plataformas, tres en línea) no están protegidas, pero los **nombres, personajes y gráficos** sí. Evita en la ficha: "tipo Mario", "como Candy Crush", "estilo Fortnite/Roblox".
- ❌ **Tipografías de marca** ("Baby Chipmunk" y "Adorable Mother Script", en `assets/fonts/`): los metadatos del propio archivo de Baby Chipmunk dicen **"PERSONAL USE | CONTACT ME FOR COMMERCIAL USE"** (© Stefani Letter 2020) y Adorable Mother Script (© 7NTypes 2021) no trae licencia. Sin un comprobante de licencia comercial **no deben ir en una app publicada**. Por eso el build de la **app** usa por defecto sustitutas de licencia libre (Fredoka y Dancing Script, SIL OFL, `assets/fonts-libres/`) y el verificador rechaza las de marca salvo confirmación explícita (ver la auditoría). La web conserva las de marca por defecto.
- ⚠️ **Fotos y logos de productos** (`assets/products/`, `assets/brand/`): deben ser tuyas (o con autorización). Las fotos de personas, si las hubiera, necesitan consentimiento.
- ✅ **Licencias de código abierto**: Three.js (MIT), Capacitor (MIT) y las bibliotecas Apache 2.0 de Android quedan acreditadas en la pantalla "Créditos y licencias" del menú (`app/licenses.html`), con el texto de cada licencia. Falta revisar la lista final de dependencias del APK (ver la auditoría).
- ✅ La música y los sonidos se **generan por código** (no hay archivos de terceros).
- ⚠️ **Contenido hecho con IA**: la política de privacidad ya lo dice. Google y Apple permiten código/arte hecho con ayuda de IA, pero tú eres responsable de que no copie obras de otros. Si usaste generadores de imágenes para arte, guarda las condiciones de uso de esa herramienta.

### 2.2 Niños (el tema con más reglas)
- ⚠️ La app declara público infantil, así que cae en la política **"Diseñada para familias" (Google)** y en la categoría **"Niños" (Apple)** si la eliges. Ambas son estrictas:
  - Sin publicidad personalizada ni SDK de análisis/rastreo de terceros ✅ (hoy no hay).
  - Sin enlaces externos ni compras sin **control parental** (puerta para adultos).
  - Datos personales de menores: lo mínimo; **el apodo en el ranking en línea** puede contar como dato personal. Si lo enciendes: moderación de apodos (lista de palabras prohibidas), no permitir nombres reales, y poder **borrar** a un jugador.
  - Google exige que la política de privacidad y la sección "Seguridad de los datos" coincidan exactamente con lo que hace la app.
- ⚠️ **Ley chilena de datos personales**: la política cita la Ley 19.628. La nueva **Ley 21.719** (Protección de Datos Personales; creará la Agencia de Protección de Datos y empieza a regir a fines de 2026) exige más: base de legitimidad, derechos ARCO ampliados, y **protección reforzada de datos de menores (consentimiento de los padres)**. Hay que **actualizar la política** a esa ley antes de lanzar y, si se enciende el ranking en línea, definir cómo se obtiene el consentimiento de madres/padres.
- ⚠️ **COPPA (EE. UU.) y RGPD-K (Europa)**: aplican si la app se distribuye en esos países. Con cero recopilación y sin rastreadores se cumplen casi solos; pero no actives analytics ni ranking en línea sin revisar esto.
- ⚠️ **Ranking con apodos (contenido de usuarios)**: si lo encienden, Google y Apple piden **filtro, forma de reportar y moderación** de contenido generado por usuarios. Hoy está apagado: déjalo apagado en la primera versión.

### 2.3 Cobrar con dinero real ("Próximamente")
- ❌ La política de privacidad dice **"No hay compras dentro del juego"**. Cuando empieces a vender los objetos "Próximamente" hay que **actualizar la política, la ficha y los formularios** (Google: "Compras en la aplicación"; Apple: precios y etiquetas de privacidad).
- ❌ **Android: solo Google Play Billing.** Apple: solo **StoreKit/Compras dentro de la app** para bienes digitales. No se puede cobrar con enlaces a Webpay/transferencia dentro de la app (hay excepciones regionales que cambian: revísalas).
- ⚠️ En apps para niños, las compras deben tener **puerta parental** (una pregunta o clave para adultos) y **no** pueden presionar a comprar.
- ⚠️ **"Cajas sorpresa" (loot boxes)**: los **sobres de figuritas** son aleatorios. Hoy se ganan **jugando**, no se pagan, y eso es lo seguro. **No vendas sobres ni nada aleatorio por dinero** en una app para niños; si algún día lo haces, ambas tiendas exigen **mostrar las probabilidades** y Apple/Google pueden rechazarlo en apps infantiles. Vende objetos **concretos** (ver el objeto antes de pagar), como ya está pensado.
- ⚠️ **Matipuntos con valor real**: nunca permitas comprar Matipuntos con dinero y luego gastarlos en cualquier cosa sin límites (monedas virtuales en apps para niños son zona de riesgo). Mejor: precios por objeto, sin moneda intermedia.
- ⚠️ **Sorteos o premios reales** (chocolates por puntaje): requieren bases legales y no pueden exigir compra; evítalo en la app de niños o consulta antes.

### 2.4 Comunicación y publicidad de Matichoc dentro de la app
- ⚠️ La app muestra "Un juego promovido por Matichoc". Está bien, pero **no pongas botones para comprar chocolates ni WhatsApp** dentro de la versión de niños (ya están ocultos). Google/Apple pueden considerarlo publicidad dirigida a menores.
- ⚠️ Si quieres publicidad de tus propios productos, solo como **texto informativo para los padres** detrás de la puerta parental.

---

## 3. Google Play (Android)

### Cuenta y requisitos
- ⚠️ **Cuenta de desarrollador** (pago único de unos US$25) con verificación de identidad. Si es **cuenta de organización** (la EIRL), piden **número D-U-N-S**. Si es **personal** y creada hace poco, suele exigir una **prueba cerrada con 12 testers durante 14 días** antes de producción: organízala con tiempo (familia y amigos que instalen desde la tienda).
- ✅ Se sube un **.aab firmado** (los pasos están en `docs/PLAY-STORE.md`): primero hay que cargar los 4 secretos de GitHub.
- ⚠️ **Nivel de API objetivo**: hoy es 36. Google sube el mínimo cada año (agosto): revisa que siga siendo válido cuando publiques.
- ⚠️ **Páginas de memoria de 16 KB**: desde fines de 2025 las apps nuevas con código nativo deben soportarlo. Capacitor 8 y el WebView de Android no traen librerías nativas propias, pero **verifícalo en Play Console** (te lo avisa al subir el .aab).
- ⚠️ **`allowBackup="true"`**: Android puede respaldar los datos del juego en la copia de seguridad del teléfono (Google). La política ya lo explica. Confirma en Play Console cómo se declara eso en "Seguridad de los datos" (no se pudo consultar la definición oficial desde el entorno de revisión). Si prefieres que el progreso de un menor nunca salga del aparato, se cambia a `false` (a costa de perder el progreso al cambiar de celular).

### Formularios de Play Console
- ⚠️ **Público objetivo y contenido**: elige rangos de edad (incluyendo menores de 13) → activa la revisión de **Diseñada para familias**. Responde que **no hay anuncios**.
- ⚠️ **Clasificación de contenido (IARC)**: cuestionario que se responde pregunta por pregunta. Ojo: Aventura Choco tiene **combate de fantasía** (bolas de fuego que eliminan enemigos de caricatura, pisotones y jefes), así que no corresponde responder "sin violencia" por defecto; el detalle está en `store/listing-es.md`. No se puede asegurar de antemano qué clasificación resultará.
- ⚠️ **Seguridad de los datos**: "no recopila ni comparte datos" **mientras el ranking esté apagado**. Si lo enciendes: declarar apodo + identificador + puntajes.
- ⚠️ **Declaración de anuncios**: "No contiene anuncios".
- ⚠️ **Política de privacidad**: URL pública `https://matichoc.cl/matijuego/privacy.html` (preparada en matiweb, **aún no publicada**: ábrela en un navegador sin sesión antes de pegarla en Play Console).
- ⚠️ **Capturas y ficha**: sin marcas ajenas, sin precios ni "#1", sin promesas de premios reales.

---

## 4. App Store (iPhone / iPad)

> **Hoy no existe el proyecto de iOS.** Capacitor lo soporta (`npx cap add ios`), pero requiere un Mac con Xcode (o un servicio de compilación en la nube/macOS en GitHub Actions) y hay que probar el juego 3D en Safari/WebKit, que se comporta distinto a Chrome.

- ⚠️ **Programa de desarrolladores de Apple**: unos US$99 al año; para organización también piden D-U-N-S.
- ⚠️ **Mac / macOS**: indispensable para firmar y subir (App Store Connect). Se puede arrendar un Mac en la nube mientras tanto.
- ⚠️ **Revisión "Kids Category" (directriz 1.3)**: sin enlaces externos ni compras sin puerta parental, sin analytics de terceros ni publicidad. Hoy cumple.
- ⚠️ **Mínima funcionalidad (4.2)**: Apple rechaza "páginas web envueltas". Matijuego es un juego con contenido propio y funciona sin conexión, que es lo que revisan. Aun así, agrega algo nativo si lo piden (por ejemplo, vibración al ganar).
- ⚠️ **Etiquetas de privacidad ("Nutrition labels")** y **URL de política**: obligatorias.
- ⚠️ **Clasificación por edad**: Apple tiene un cuestionario nuevo con rangos (4+, 9+, 13+, 16+, 18+).
- ⚠️ **Compras**: solo StoreKit. Los objetos "Próximamente" se venderían como **consumibles o no consumibles** con **puerta parental**.
- ⚠️ **Rendimiento WebGL en iPhone**: sombras, "bloom" y escenas pesadas pueden dar problemas de memoria en iPhones antiguos; probar en un iPhone real de 2-3 años de antigüedad.
- ⚠️ **Sin ninguna mención a Android/Google Play dentro de la versión iOS** (hoy el cartel de la demo dice "Google Play": en iOS debe decir App Store o no aparecer).

---

## 5. Qué probar tú (con tu hija y en varios celulares)

### Funcionamiento
- [ ] **Instalar el APK sobre el anterior** y comprobar que **no se pierde el progreso** (perfiles, Matipuntos, ropa, casa).
- [ ] **Matar la app** (deslizar y cerrar) y volver a abrir: ¿sigue todo? ¿sale el sello "Desarrollado por Matichoc"?
- [ ] **Dejar la app en segundo plano** 20 minutos, 3 horas, y al día siguiente: sello / reinicio automático.
- [ ] **Sin internet** (modo avión): todo debe funcionar.
- [ ] **Girar el celular** en cada juego (los que piden horizontal avisan).
- [ ] **Botón/gesto "atrás" de Android** en cada pantalla (no debe cerrar la app sin aviso ni dejar pantallas trabadas).
- [ ] **Llamada o notificación en medio de una partida**: el juego debe pausarse sin romperse.
- [ ] **Celulares modestos / antiguos**: ¿corre fluido? ¿se calienta? ¿cierra solo por falta de memoria? (el modo 3D es lo más pesado).
- [ ] **Pantallas con muesca, plegables y tablets**: botones tapados o fuera de pantalla.
- [ ] **Borrar datos de la app** o **cambiar de celular**: hoy **el progreso no se puede recuperar** (vive en el aparato). Considera un **código de respaldo** o un botón "exportar progreso" antes de lanzar.
- [ ] **Cambiar la hora del celular** (hacer trampa en energía y premios diarios): ¿se protege?

### Contenido
- [ ] **Leer todos los textos** buscando faltas de ortografía o frases confusas.
- [ ] **Nombres de marca ajenas** en cualquier pantalla (juegos, logros, ayudas).
- [ ] **Energía y precios**: ¿la niña se frustra? ¿entiende por qué no puede jugar?
- [ ] **Comprar lo que dice "Próximamente"**: no debe ser posible.
- [ ] **Demo web**: los juegos limitados deben mostrar el cartel "Próximamente en Google Play" al pasar el nivel 2 o 3.

### Seguridad de los niños
- [ ] **Ningún enlace** saca de la app sin que un adulto lo sepa.
- [ ] **Apodos**: si el nombre del perfil es libre, ¿se pueden escribir palabras groseras? Si se enciende el ranking, necesita filtro.
- [ ] **Tiempo de juego**: la energía limita las partidas, pero considera avisos de descanso para los padres.

### Accesibilidad
- [ ] Tamaño mínimo de botones (≈48 dp) y contraste de texto sobre fondos de color.
- [ ] Jugar **sin sonido**: ¿se entiende todo igual?
- [ ] **Daltonismo**: colores iguales para cosas distintas (por ejemplo, en Choco Match).

---

## 6. Lista corta de decisiones tuyas
1. ¿La EIRL publica como **organización** (D-U-N-S) o como **persona**?
2. ¿Se registra **"Matijuego"** en INAPI antes de publicar?
3. ¿Los **objetos "Próximamente"** se venden con dinero real? Eso obliga a actualizar política y formularios, y a usar la facturación de cada tienda.
4. ¿Se enciende el **ranking en línea**? (Si no, la primera versión sale más simple en datos.)
5. ¿Se lanza primero en **Android** y después iPhone? (Recomendado: Android primero; iPhone necesita Mac + proyecto nuevo + pruebas.)
6. ¿Quién responde las **consultas de privacidad** y desde qué correo (hoy: i.saavedra.nu@gmail.com)?

## 7. Fuentes oficiales (para verificar cada punto)
- Google Play, política "Diseñada para familias": <https://support.google.com/googleplay/android-developer/answer/9893335>
- Google Play, Seguridad de los datos y política de datos de usuario: <https://support.google.com/googleplay/android-developer/answer/10787469>
- Google Play, requisitos de nivel de API y prueba cerrada para cuentas nuevas: <https://support.google.com/googleplay/android-developer/answer/11926878>
- Apple, Directrices de revisión (1.3 Niños, 4.2, 5.1.4): <https://developer.apple.com/app-store/review/guidelines/>
- Ley 19.628 y Ley 21.719 (Protección de datos personales, Chile): <https://www.bcn.cl/leychile>
- INAPI (marcas): <https://www.inapi.cl>
- COPPA (FTC): <https://www.ftc.gov/business-guidance/privacy-security/childrens-privacy>
