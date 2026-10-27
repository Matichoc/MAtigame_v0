# Bitácora de Matijuego

Registro de todo lo que se cambia, se decide y se prueba: lo más reciente arriba. Cada entrada dice **qué** se hizo, **dónde** (PR, rama, compilación), **qué se comprobó** y **qué quedó pendiente**. Las decisiones de la persona dueña se anotan como tales.

---

## 2026-10-27

### Rayas que parpadean en la Ciudad y el Pueblo; textos que no se leían
- **Prueba en el celular de la persona dueña:**
  - En la entrada de la Playa Choco, el suelo se veía "tildado": rayas que parpadean entre la calle y la arena.
  - En «Renovar el Pueblo», los botones de Pichanga y Básquet y los «Cambiar estilo» no se leían.
  - La bandera de Aventura ya se ve bien (con la M y el logo).
- **Causa de las rayas:** pisos superpuestos exactamente a la misma altura. El celular no sabe cuál va encima y alterna, cuadro a cuadro, entre uno y otro. Medido con un detector de pisos superpuestos (en el navegador, recorriendo la escena):
  - **Ciudad:** la arena de la playa, el pasto del parque y el patio del colegio estaban a 0,03, igual que el tope de las calles. El pasto de las manzanas quedaba a 0,005 de la vereda.
  - **Pueblo:** los suelos de la Granja y el Lago se tocaban a 0,02, y dos parches de la cancha estaban a 0,04.
- **Arreglo:**
  - Los suelos de los barrios de la Ciudad pasan a 0,015, bajo la calle; el pasto de las manzanas, a 0,075.
  - Cada barrio del Pueblo tiene su altura: bosque 0,02, granja 0,035 y lago 0,05, con la arena y el agua del lago por encima.
  - El plano cercano de la cámara sube de 0,1 a 0,3 en la Ciudad y el Pueblo. Así la cámara distingue tres veces mejor qué piso va encima.
  - Ahora ningún par de pisos superpuestos queda a menos de 0,015. El costo de dibujo no cambia: no se agregó nada que dibujar.
- **Textos:** prueba nueva `scripts/qa/contraste.cjs`. Recorre el menú (sus pestañas), los cuadros, las pantallas internas, las tarjetas de inicio, los juegos y la pausa, y mide el contraste de cada texto contra su fondo real. Se arregló todo lo que quedaba bajo 3:1:
  - **«Renovar el Pueblo»:** los botones claros sobre tarjetas claras tenían letra crema (1,0:1); ahora tienen letra oscura.
  - **Títulos:** el rosado de las cabeceras pasó de 2,8:1 a un rosado más claro.
  - **Barra de energía:** su fondo pasa a claro; con poca energía, el número oscuro caía sobre la parte vacía.
  - **Accesos del menú en el computador:** degradados más profundos bajo la letra blanca (antes 2,1:1).
  - **Pueblo:** «Actividades» y el botón del pedido del vecino con un rosado más profundo.
- **Pruebas:**
  - Bien: contraste (todo se lee), ciudad-barrios 20, ciudad-diaria 6, pueblo 24, juegos 15/15, merge 30, atras 26, deportes 52, aventura 57.
  - Pueblo, corriendo junto a otras 3 pruebas, dio 6 fallos del robot del parkour por lentitud del equipo. Sola pasó 24/24.

### PR #48 y matiweb #51 mergeados
- La persona dueña hizo merge de #48 (tirones, flor de chocolate y rediseño en el celular) y de su copia web Matichoc/matiweb#51: el rediseño queda publicado en matichoc.cl. Último APK de prueba: compilación 84.
- La rama `claude/zealous-johnson-2ryf87` se reinició desde `main`.
- Sigue pendiente: probar el APK en el celular, dejar privado el repositorio y apagar Pages.

### Juego bloqueado: el aviso de bienvenida ya no tapa los botones
- En la captura acostada, el aviso "¡Hola…! Ahora toca «Continuar mi aventura»" quedaba encima de «Ahora no». Además se tragaba los toques: los avisos van sobre los cuadros y no dejaban pasar el dedo.
- Ahora los avisos dejan pasar los toques (`pointer-events: none` en `.toast`) y se esconden al abrir un juego bloqueado (`openUnlockDialog`).
- Medido: el cuadro cabe entero en 915×412, 740×360, 412×915 y 360×640.
- `temporada.cjs` tenía la línea `clock.pauseAt` repetida: con el equipo cargado fallaba al "volver atrás" el reloj. Se quitó la repetida (29/29).
- Pruebas: atras 26, perfiles 13, juegos 15/15, temporada 29.
- APK de prueba: compilación 84 en verde sobre `d4b7140` (https://github.com/Matichoc/MAtigame_v0/actions/runs/40425424084). Copia web en Matichoc/matiweb#51 (`63080a9`): juegos 15/16 (Choco Blaster, conocido), perfiles 13, enlaces OK.

### Tarjeta de inicio: la ayuda "?" empieza cerrada
- En el computador la web abría sola todas las secciones "Cómo se juega". En la tarjeta nueva esa ayuda es un panel que tapa las opciones, así que no se podía elegir dificultad (Pichanga, Básquet 2v2) ni nivel (Parkour). Lo detectaron `deportes.cjs` y `juegos.cjs`.
- Ahora en la tarjeta la ayuda empieza cerrada y se abre con el "?" (`decorateIntro` y `foldSecondary` en `js/main.js`).
- APK de prueba: compilación 83 en verde sobre `adb6e01` (https://github.com/Matichoc/MAtigame_v0/actions/runs/40423543477).
- Copia web en Matichoc/matiweb#51 (`6d69611`). Probada contra la demo: juegos 15/16 (Choco Blaster, fallo conocido de la web), aventura 57, pueblo 24, deportes 52, legal y enlaces OK. `atras.cjs` es solo para la app: en la demo Fútbol viene desbloqueado y no aparece el cuadro de canje.
- Descripciones de #48 y matiweb#51 al día con el rediseño.
- Pruebas: deportes 52/52, juegos 15/15. El resto ya había pasado con el rediseño: aventura 57, pueblo 24, ciudad-barrios 20, ciudad-diaria 6, merge 30, atras 26, temporada 29, perfiles 13, respaldo-nativo 13, legal y enlaces OK.

## 2026-10-26

### Rediseño aprobado, construido: pantalla completa, pausa, tarjetas de inicio, menú con pestañas y juego bloqueado
- Construido en este mismo PR (#48), sobre las 5 maquetas aprobadas. Todo lo nuevo de pantalla y menú es **solo para pantallas táctiles**; en el computador la web queda como antes.
- **1 y 2 · Juegos a pantalla completa** (estilos comunes para los 15 juegos; `css/style.css` "CELULAR: JUEGOS A PANTALLA COMPLETA"):
  - El escenario 3D ocupa toda la pantalla, también bajo la muesca, sin marco ni barra de título.
  - Arriba flotan píldoras semitransparentes y botones redondos de 44 px, sin desenfoques: en celulares modestos obligan a recomponer la pantalla en cada cuadro.
  - En los minijuegos se esconde la píldora del total de Matipuntos, que no se usa al jugar; así no se apilan píldoras.
  - **Pueblo:** arriba solo ⭐, Matipuntos y el evento; el objetivo del vecino arriba al centro; Actividades bajo la pausa.
  - **Ciudad:** la misión arriba al centro; el minimapa y la brújula bajo los botones.
- **Pausa ⏸** (decisión de la persona dueña: pausa en vez de 🏠):
  - Cuadro "Pausa" con Seguir jugando, Sonido y Salir al menú.
  - El juego queda quieto: `Game3D.setPaused` congela el bucle. No se llama `hold` porque Bloques ya usa `hold` para la pieza guardada; se detectó con la prueba de "atrás".
  - El "atrás" del celular dentro de un juego ahora abre la pausa (antes avisaba "toca otra vez"); con la pausa abierta, la cierra.
  - El botón de sonido de cada juego pasó dentro de la pausa.
- **3 · Tarjeta de inicio** (`decorateIntro` en `js/main.js`, para todas las tarjetas):
  - Imagen del juego con su nombre a la izquierda (arriba en el celular de pie); a la derecha solo lo que se toca: modos, nivel y un botón grande.
  - "Cómo se juega" pasa a un botón **?** que abre las reglas encima. Las descripciones largas quedan dentro del "?".
- **4 · Menú en el celular:**
  - Barra de abajo: 🏠 Inicio · 🎮 Juegos · 🏘️ Pueblo (entra directo) · 👕 Mi Matichico.
  - Cabecera corta: tú, Matipuntos, energía, nivel y 🎁.
  - "Continuar mi aventura" es la tarjeta principal, con la imagen del Pueblo.
  - Juegos en cuadrícula de 2, con su imagen entera y el candado con el precio.
  - En "Mi Matichico" van el escenario del personaje, Vestuario, Mi Casa, Mis lugares, Nivel y álbum, Logros, Puntajes y Joystick.
  - Con un perfil nuevo sin Matichico, el menú abre en "Mi Matichico" para elegirlo; al elegirlo, vuelve a Inicio.
- **5 · Juego bloqueado:**
  - Imagen del juego, barra "1.240 / 2.000 🍫 · te faltan 760".
  - Si no alcanza, **"🎮 Ganar Matipuntos"** lleva al último juego jugado o al Pueblo; antes era un botón gris deshabilitado.
- **Error de antes, corregido:** el botón "Nuevo: Básquet 2 contra 2" estaba en la tarjeta de **Recolecta y Corre**; ahora está en la de **Lanzamientos de Básquet**.
- **Costo de dibujo:** el lienzo ocupa toda la pantalla, así que dibuja ~15–20 % más de píxeles; no hay efectos nuevos ni desenfoques. Lo compensa el ajuste de calidad continuo, pero hay que mirarlo en el celular modesto.
- **Pruebas actualizadas:** `atras.cjs` (pausa con atrás y con ⏸, Salir al menú), `aventura.cjs` y `deportes.cjs` (salen por la pausa).
- **Pendiente:** probarlo en el celular, en especial muescas, el "?" y la barra de abajo.

### Tirones en la Ciudad (playa) y en la bandera de Aventura; fuego → chocolate
- **Prueba de la persona dueña, en su celular de gama alta:**
  - En la Ciudad, al pasar hacia la playa, "se empieza a tildar la pantalla muchísimo… el mapa como que se pone en negro".
  - Lo mismo pasa al llegar a la bandera de Aventura.
  - Además, la flor sale poco. Pidió "camuflar" todo lo que sea fuego con chocolate, para que el chocolate cubra a los malvaviscos.
- **Causas encontradas (medidas en el navegador de prueba):**
  1. **Cosas que se preparaban recién al aparecer en pantalla.** El celular arma los efectos y las imágenes de cada objeto la primera vez que lo ve: el castillo y la bandera de la meta, los barrios de la Ciudad y los premios de los bloques ?.
     - Medido: al llegar a la bandera aparecían +2 efectos y +2 imágenes en un solo cuadro, de **516 ms** (lo normal son ~115).
     - Al cruzar hacia la playa aparecían efectos e imágenes nuevos entre los 50 y 60 m.
  2. **La calidad se ajustaba solo en los primeros ~3 s.** Si el comienzo era liviano, el juego decidía que el celular aguantaba todo y no volvía a mirar, aunque después llegara una zona pesada como la playa (mar y arena enormes).
  3. **El juego activo podía ser el "más viejo" para el sistema que suelta contextos 3D:** anotaba su uso solo al empezar. Es un riesgo de pantalla negra si se abre otro motor 3D a mitad de partida.
  4. **Cada disparo de la flor creaba una esfera y un brillo nuevos:** tirón en el primer disparo y memoria que se acumulaba.
- **Arreglos:**
  - **`Game3D.warmUp()`** (`js/three-kit.js`): con la tarjeta de inicio en pantalla, prepara todos los efectos e imágenes de la escena, también lo escondido, y dibuja un cuadro con todo. En Aventura se repite al pasar de nivel o elegir otro.
    - Después del arreglo: en la bandera, 0 efectos y 0 imágenes nuevos y el peor cuadro baja de 516 a **217 ms**. Camino a la playa no aparece nada nuevo.
  - **Calidad continua:** después de la calibración inicial sigue mirando durante el juego. Con ~6 s seguidos bajo 24 cuadros por segundo, baja otro escalón (brillo → resolución → sombras).
  - **El juego en uso anota que está activo en cada cuadro**, para que nunca sea el que se suelta.
- **Aventura, de fuego a chocolate:**
  - **Flor de cacao:** pétalos crema y caramelo con el corazón de chocolate.
  - **Disparos:** bolitas de chocolate brillante con una gotita. Hay 2 listas en el nivel, así que no se crea nada al disparar.
  - **Malvaviscos:** quedan **bañados en chocolate** y se derriten despacio ("¡Bañado! +150 🍫").
  - **Salpicadura y brillo:** la salpicadura es de chocolate y el brillo del personaje, crema.
  - **Botón y textos:** el botón es 🍫 color cacao y los textos y la ayuda hablan de chocolate.
  - **La flor sale más:** hay más bloques de poder (38 % en vez de 30 %). Si eres chico, la mitad de las veces sale directo la flor (antes solo el hongo); el primer bloque sigue dando el hongo, para aprender.
  - **Documentos al día:** ficha, auditoría y guía legal ya no hablan de fuego.
- **Pruebas (navegador, app):**

  | Prueba | Resultado |
  |---|---|
  | juegos | 15/15 |
  | aventura | 57 |
  | pueblo | 24 |
  | ciudad-barrios | 20 |
  | ciudad-diaria | 6 |
  | merge | 30 |
  | deportes | 52 |
  | atrás | 24 |
  | temporada | 29 |
  | perfiles | 13 |
  | respaldo-nativo | 13 |
  | lógica | OK |

  - Prueba directa del chocolate: el malvavisco queda café (`5a2d16`) y cada disparo crea 0 efectos y 0 piezas nuevas.

### Propuesta visual: 5 maquetas aprobadas
- La persona dueña pidió ser "altamente minucioso" con cómo se ve el juego, y mockups para idearlo juntos.
- **Maquetas** (en la carpeta local `maquetas/`, fuera de git): cada una tiene la captura real y la propuesta, hecha con la letra, los colores y las imágenes del juego.
  1. Juego a pantalla completa (Ciudad).
  2. Pueblo con un solo objetivo.
  3. Tarjeta de inicio con modos en dibujos.
  4. Menú con barra abajo.
  5. Juego bloqueado con barra de avance.
- **Decisión de la persona dueña:** aprobó **las 5** y el botón de **pausa ⏸** (seguir · sonido · salir) en vez de 🏠. Se construyen en orden, cada una con su APK.

## 2026-10-24

### PR #47 y matiweb #50 mergeados
- La persona dueña revisó las capturas de iOS y mergeó el **PR #47** (Android + iOS: copia del progreso, vibración, proyecto iOS, plan de publicación y repositorio listo para privado).
- **matiweb #50** también se mergeó: la política v1.1 queda publicada en matichoc.cl/matijuego/privacy.html, la dirección que piden Google Play y el App Store.
- **Pendientes de la persona dueña:**
  - Probar la APK nº 81 encima de la actual: que el progreso siga, que vibre y que "atrás" funcione.
  - Despublicar Pages y pasar este repositorio a privado.
  - Las 6 decisiones de `docs/PLAN-ANDROID-IOS.md` §9.

### Primera compilación de iOS: en verde
- **Workflow "Compilar app iOS"** (ejecuciones 1 y 2, Mac de GitHub con Xcode 26.3): compila para el simulador y la app abre en un **iPhone SE (3.ª gen.)** y un **iPad mini (A17 Pro)** simulados, sin cerrarse.
  - **Info.plist final:** `cl.chocojuego.matichoc`, versión 1.0.0, arm64, sin barra de estado, sin cifrado propio.
  - Dentro de la app están el juego, la política y `PrivacyInfo.xcprivacy`; Choco Blaster no está.
- **Capturas:** muestran la pantalla de perfiles con logo, letras y botones correctos, como la primera vez en Android. Las de los 20 s y los 45 s son iguales porque nadie toca la pantalla.
- **Cómo se ven sin descargar artefactos:** el entorno de Claude no llega al almacenamiento de artefactos de GitHub, así que el workflow ahora también deja una copia chica de cada captura en su registro.
- **Ajuste:** para la próxima corrida, el simulador elige el iPhone más nuevo (con Dynamic Island) en vez del SE, para revisar los bordes de la pantalla.
- **Pendiente:** que el workflow entre al juego (crear perfil, abrir un juego) para revisar más pantallas; hoy solo muestra la primera.

### Repositorio privado y autoría de los commits
- **Pedido de la persona dueña:**
  - Dejar privado el repositorio del juego, sin confundirlo con matiweb, que sigue público como la web con la demo.
  - Que los commits se vean más humanos.
- **Revisión:**
  - MAtigame_v0 es público y no tiene forks.
  - `deploy-pages.yml` publicaba **todo** el repositorio en GitHub Pages en cada merge a `main` (bitácora, auditoría, `admin/`, llave de pruebas), aunque la portada solo redirigía a matichoc.cl.
  - matiweb publica matichoc.cl con Pages y debe seguir público: en el plan gratis un repositorio privado no puede usar Pages.
- **Decisiones de la persona dueña:**
  - Commits **a su nombre, sin marcas**.
  - Borrar el Pages **solo de Matijuego**.
  - Compilación de iOS **solo a mano**.
- **Hecho:**
  - Se borró `deploy-pages.yml`.
  - `ios.yml` ahora corre solo a mano.
  - `CLAUDE.md` tiene la regla de autoría y la del repositorio privado.
  - `git config` en los dos repositorios: `Cristóbal <45877061+cristobalrocosaavedra@users.noreply.github.com>`.
  - Plan §8 y README actualizados.
  - Los commits antiguos no se reescriben: habría que forzar `main` y romper los PR ya mergeados.
- **Pendiente (persona dueña, en GitHub):** MAtigame_v0 → Settings → Pages → *Unpublish site* y Settings → General → *Change visibility* → Private.
- **Pruebas web de este PR (matiweb, demo):**

  | Prueba | Resultado |
  |---|---|
  | perfiles | 13/13 |
  | temporada | 29/29 |
  | pueblo | 24/24 |
  | legal | OK |
  | enlaces | 0 conexiones externas |
  | juegos | 14/16 |

  En juegos, Choco Blaster es el fallo conocido de la web. Porristas falló por lentitud del navegador de prueba y sola da OK.

### Plan Android + iOS y primeros pasos de iOS
- **Pedido de la persona dueña:** revisar el repositorio a fondo y armar y ejecutar un plan para que el juego esté en Android y iOS. Android debería ir a prueba y publicarse en 1–2 semanas; iOS, si le va bien.
- **Plan:** `docs/PLAN-ANDROID-IOS.md`. Tiene el estado, el calendario (Android en prueba cerrada desde la semana del 3-nov y producción hacia fines de noviembre), las fases, los riesgos y 6 decisiones pendientes de la persona dueña.
- **Revisión:**
  - Android está bien encaminado: la firma ya está en GitHub y la ejecución nº 80 generó el `.aab` firmado.
  - Riesgo nuevo encontrado: todo el progreso vivía solo en localStorage, y en iPhone iOS puede borrarlo si falta espacio.
  - La vibración no funcionaba en ningún celular: Android exige el permiso VIBRATE e iOS no tiene `navigator.vibrate`.
- **Hecho:**
  - **`js/native.js`** (se carga primero en `main.js`):
    - Copia de todas las claves `matichoc_*` en el almacenamiento propio de la app (`@capacitor/preferences`): cada 20 s si cambió algo, al pasar a segundo plano y al cerrar.
    - Si al abrir no hay perfiles pero sí copia, se restaura antes de leer los perfiles. Una copia buena nunca se pisa con una vacía.
    - Vibración con `@capacitor/haptics`.
    - En la web no hace nada.
  - **Prueba nueva `scripts/qa/respaldo-nativo.cjs`** (simula el puente de un iPhone): 13/13.
  - **Android:**
    - Permiso nuevo VIBRATE (normal, sin aviso).
    - El workflow ahora exige exactamente INTERNET + VIBRATE.
    - Política v1.1: menciona la vibración y la copia dentro del teléfono.
    - Créditos con los plugins nuevos, todos MIT.
    - Ficha (`store/listing-es.md`) al día.
  - **Proyecto iOS (`ios/`):**
    - Capacitor 8.5.3 con Swift Package Manager; bundle ID `cl.chocojuego.matichoc`, el mismo de Android; mínimo iOS 15.
    - `Info.plist`: español, arm64, sin barra de estado, pantalla completa en iPad, sin cifrado propio.
    - `PrivacyInfo.xcprivacy`: sin rastreo ni datos, UserDefaults con motivo CA92.1.
    - Íconos y pantalla de inicio desde `resources/`.
    - `capacitor.config.json`: sin rebote.
  - **Workflow nuevo "Compilar app iOS"** (Mac de GitHub, sin cuenta de Apple): compila para el simulador, revisa el contenido, abre la app en iPhone y iPad simulados y saca capturas.
- **Pruebas de la app (navegador):**

  | Prueba | Resultado |
  |---|---|
  | respaldo-nativo | 13/13 |
  | atrás | 24/24 |
  | perfiles | 13/13 |
  | legal | OK |
  | enlaces | OK |
  | lógica (aventura, merge, deportes, puzzles) | OK |
  | `verify:app` | OK |

- **Pendiente:** ver los workflows de Android e iOS en el PR, revisar las capturas del simulador, la prueba en el celular y las decisiones del plan (§8).

### Video promocional (para redes y para buscar testers)
- **Pedido de la persona dueña:** buscar una skill o una capacidad para generar un video atractivo con capturas del juego, publicitarlo en todos lados y empezar a buscar testers.
- **Plugins:** busqué en el catálogo y encontré `video-shotcraft` (videos con Remotion) y `ffmpeg-llm`. Le mostré la tarjeta para instalarlos, pero no hacen falta: aquí ya están ffmpeg y el navegador de pruebas.
- **Hecho (`scripts/video/`, guía en `docs/VIDEO-PROMOCIONAL.md`):**
  - **Grabador cuadro a cuadro** (`reloj.cjs` + `grabar.cjs`): el tiempo del juego avanza 1/30 s por cuadro, así el video sale fluido aunque el navegador sin tarjeta gráfica tarde ~1,5 s por cuadro.
  - **Escenas que se juegan solas, con partidas reales:**
    - Pueblo en monopatín y Renovar el Pueblo (lista de tareas y escena del lago).
    - Pichanga y Básquet 2v2, manejados por el "jugador humano" de las pruebas.
    - Ciudad con piloto automático por la avenida.
    - Parkour infinito con un piloto que salta en el borde de cada plataforma.
    - Mati Merge arrastrando productos con el dedo.
    - Cortes rápidos de Salto, Bloques, Crea tu Chocolate y Autos.
  - **Carteles** (`carteles.cjs`): portada, título por escena y cierre "¿Tienes Android? ¡Sé tester!" con matichoc.cl/matijuego. Usan la letra libre Fredoka y el logo.
  - **Montaje** (`montar.cjs`, ffmpeg): versión horizontal 1920×1080 (YouTube, ficha de Play) y vertical 1080×1920 (Reels, TikTok, Shorts, estados).
  - El audio va en silencio a propósito: la música se agrega en la app de cada red, con canciones que tienen permiso.
- **`scripts/qa/jugador-humano.mjs`:** ahora también se puede cargar en el navegador (no usa `process` fuera de Node).
- **Pendiente:**
  - La persona dueña revisa el video.
  - Definir por dónde se inscriben los testers (sugerencia: un Grupo de Google) y poner ese enlace en la publicación.

### PR #46 y matiweb #49 mergeados
- La persona dueña hizo merge de **PR #46** (aventura "Renovar el Pueblo", barrios nuevos en Pueblo y Ciudad, pedidos diarios de Mati Merge) y de **matiweb #49** (la misma versión en la web, matichoc.cl/matijuego).
- APK de prueba de esta versión: **nº 80** (run 40043895224), lista para probar en el celular.
- **Pendiente:** prueba en el celular de la APK nº 80 (lista de tareas, barrios, pedidos de 2 productos, fluidez).
- **Pendiente opcional (no pedido aún):** aliviar el costo de dibujo del Pueblo y la Ciudad (ya rondaban 1.300–1.800 dibujos por cuadro).

---

## 2026-10-23

### Aventura por etapas "Renovar el Pueblo", Pueblo y Ciudad más grandes y pedidos diarios en Mati Merge
- **Prueba de la persona dueña (APK nº 79):**
  - "Se ve un poco mejor", pero la aventura por etapas "no la estamos logrando" (como en Gossip Harbor).
  - Pidió agrandar la Ciudad y el Pueblo "para tener más mundo, para caminar, para conocer, para hacer más misiones", y que algunas misiones se reseteen.
  - "Hay algunas que las tengo tomadas desde ayer."
- **Decisiones de la persona dueña** (a mis preguntas):
  - Aventura con **"⭐ de todos los juegos"**.
  - Misiones atascadas: **"distintos personajes pidiendo para su día a día, pueden pedir 1 o 2 productos para combinar"** (los pedidos de Mati Merge).
  - Mundo: **"barrios nuevos en ambos"**.
  - Encargos: **"encargos diarios, historia fija"**.
- **Aventura "Renovar el Pueblo":**
  - 7 zonas: plaza, cancha, aro, festival, bosque de cacao, granja y lago.
  - Cada zona trae 4 tareas que cuestan ⭐; las ⭐ se ganan en cualquier juego, en pedidos de Merge y juntando lo de los barrios.
  - Lista de tareas con mapa de zonas y escena con el vecino al hacer cada una; premio por zona, una sola vez.
  - **Migración:** quien terminó el festival queda con 4 zonas hechas, sin cobrar de nuevo.
  - El nivel ahora se ve con 🏅, para no confundirlo con las ⭐.
- **Pueblo más grande:**
  - Bosque de cacao, Granja y Lago, con vecinos nuevos (Guardabosque Maní, Tía Avellana y Capitán Almendra).
  - Se ven descuidados hasta que la aventura los renueva.
  - Cada día hay mazorcas, huevos y conchitas para juntar (3 actividades nuevas: el premio del día pide 7 de 10).
- **Ciudad más grande:**
  - Parque Grande, Playa con muelle y Colegio.
  - 3 misiones nuevas que se renuevan cada día: patos, quitasoles y libros perdidos (ahora son 11).
- **Mati Merge:**
  - Los pedidos son de distintos vecinos para su día a día y traen 1 o 2 productos.
  - Se renuevan cada día; los antiguos atascados se cambian al abrir.
- **Problemas encontrados y arreglados en el camino:**
  - El cuadro para elegir estilo se abría detrás de la lista de tareas.
  - La entrada de la granja le quitaba su lugar a la "Escalera de Nubes" del parkour.
  - Los carteles de los barrios se leían al revés desde adentro.
  - Lo que se recolecta en los barrios se dibujaba aunque estuvieras lejos.
- **Rendimiento (teléfono):**
  - **Pueblo en la plaza:** 1.352 → 1.435 dibujos (+6%); dentro de un barrio, 1.515–1.562.
  - **Ciudad:** los barrios suman entre 9 y 73 dibujos (antes, ~1.107 en el centro).
  - **Pendiente aparte:** el Pueblo y la Ciudad ya eran pesados (1.300–1.800 dibujos).
- Detalle en `docs/EVOLUCION-JUGABILIDAD.md` §15.
- **Pruebas:**
  - Lógica: aventura, deportes, puzzles y merge-logica (nueva), en verde. `verify:app` OK.
  - Navegador, app: aventura 57/57, deportes 52/52, merge 30/30, ciudad-barrios 20/20 (nueva), atrás 24/24, juegos 15/15, temporada 29/29, pueblo 24/24, perfiles 13/13 y ciudad-diaria 6/6. Legal y enlaces OK.
  - Navegador, web (matiweb servida en local): aventura 57/57, deportes 52/52, merge 30/30, pueblo 24/24, temporada 29/29, legal OK y enlaces con 0 peticiones externas.
  - `juegos.cjs` en la web: 15/16. Choco Blaster sigue con la falla de la prueba ya anotada el 22-oct.
  - `ciudad-barrios.cjs` no corre en la web: la demo deja jugar solo las 2 primeras misiones de la Ciudad. Los barrios se pueden recorrer igual.
  - Pruebas puestas al día: `ciudad-diaria.cjs` ahora cuenta 11 misiones; antes contaba 8.
- App: PR [#46](https://github.com/Matichoc/MAtigame_v0/pull/46), el mismo, todavía sin merge. **APK de prueba: compilación nº 80**, en verde: https://github.com/Matichoc/MAtigame_v0/actions/runs/40043895224 (artefacto `matijuego-prueba-apk`).
- **Falta probar en el celular:**
  - La lista de tareas y las escenas.
  - Caminar a los barrios del Pueblo y de la Ciudad.
  - Los pedidos de 2 productos.
  - Que todo se vea fluido.
- Web: PR [Matichoc/matiweb#49](https://github.com/Matichoc/matiweb/pull/49), actualizado. Se publica cuando la persona dueña hace merge.

### Aventura que se entiende, Mati Merge en 3D y pantallas más alegres
- **Prueba de la persona dueña:**
  - La aventura "no se entiende": no queda claro qué es ni qué hay que completar, y las misiones son abstractas.
  - Los cuadros nuevos se ven "muy cuadrados, muy en ventana", toscos al lado del resto del juego.
  - Desde Mati Merge las piezas perdieron la alegría.
- **Decisiones de la persona dueña** (a mis preguntas):
  - Aventura **"Directo al Pueblo"**.
  - Mati Merge **"3D como Choco Match"**.
  - Revisar el **inicio de los partidos, la Ciudad y el Pueblo, elegir estilo y los botones del menú**.
- **Aventura:**
  - **Primera vez:** una viñeta con las caras de los 3 vecinos explica el festival, una sola vez. Después «Continuar mi aventura» lleva directo al Pueblo, junto al vecino que te necesita.
  - **Globito en el Pueblo:** la cara del vecino, un pedido concreto ("Bombi necesita chocolates para decorar: gánalos jugando una partida de cualquier juego 🎮") y un botón que lo hace (▶ Memoria / ▶ Pichanga / ▶ Básquet / 📍 Llévame).
  - **Lo que dicen los vecinos:** se reescribió con palabras simples.
  - **Pantalla de capítulos:** queda solo como «Mis lugares y copas».
  - Se agregó el campo `introSeen` al estado de la aventura, sin migración: los perfiles antiguos la reciben al abrir.
- **Mati Merge en 3D:**
  - Los 26 productos ahora tienen volumen y brillo (`js/merge-models.js`).
  - **Bandeja:** de madera, en perspectiva como Choco Match.
  - **Al juntar:** el producto nuevo salta.
  - **Pedidos:** un vecino con un globito; se pone verde y dice «¡Entregar!» cuando lo tienes.
  - **Juego y tablero guardado:** los mismos de antes.
  - **Costo por cuadro:** baja de 133 a **51 dibujos**, con 53.000 triángulos. Choco Match, que anda bien en su celular, usa 835 dibujos y 106.000 triángulos.
- **Pantallas más alegres:**
  - Fichas de color con dibujito en el inicio de los partidos (🌱 Accesible, ⭐ Normal, 🔥 Desafío, 🤝 Amistoso, 🏆 Copa).
  - Fichas grandes para elegir estilo. **Se arregló un error:** los nombres de los estilos salían en blanco sobre fondo claro y no se leían.
  - Fichas de color en «Mi personaje y mis espacios».
  - Botones del menú redondos y con brillo.
  - Panel de Actividades del Pueblo y lista de misiones de la Ciudad claros y redondos.
  - «Mis lugares y copas» con tarjetas claras.
- **Menú en celulares.** La persona dueña pidió revisarlo con ojo crítico: "esa foto grande quizás molesta, quisiera que sea muy buena la experiencia de usuario".
  - **De pie:** el escenario grande del personaje ocupaba una pantalla entera antes de los juegos. Ahora es una franja chica con el Matichico y los 4 para elegir, y «Elige un juego» se ve en la primera pantalla.
  - **Acostado:** la cabecera ocupaba media pantalla y los juegos quedaban en una ventanita de ~70 px de alto. Ahora la cabecera va en una fila y todo el menú se desplaza junto.
  - **Botones repetidos:** se quitaron «Vestuario y Tienda», «Mi Casa» y el cartel de Mi Casa; siguen en «Mi personaje y mis espacios».
  - **Tarjetas de juegos:** sin carteles encima de la foto; abajo, una línea corta "⚡ 8 · 📱 acostado".
  - **Aviso de temporada:** en una fila.
  - En computador el menú queda igual.
- Detalle en `docs/EVOLUCION-JUGABILIDAD.md` §14.
- **Pruebas:**
  - Lógica: aventura, deportes y puzzles, en verde. `verify:app` OK.
  - Navegador, app: aventura 43/43, deportes 52/52, merge 30/30 (prueba nueva), atrás 24/24, juegos 15/15, temporada 29/29, pueblo 24/24, perfiles 13/13, Ciudad 6/6. Legal y enlaces OK.
  - Navegador, web (matiweb servida en local): aventura 43/43, deportes 52/52, merge 30/30, temporada 29/29, legal OK, enlaces 0 peticiones externas.
  - `juegos.cjs` en la web: 15/16. Choco Blaster sigue con la misma falla de la prueba que ya estaba anotada el 22-oct.
- **Pruebas que se arreglaron** (fallaban por la prueba, no por el juego):
  - `atras.cjs`: ahora «Continuar mi aventura» abre la viñeta.
  - `aventura.cjs`: en la web los módulos llevan `?v=…`, y la prueba cargaba otra copia de `progression.js`, así que el menú no se enteraba de la partida.
- **Prueba de partidos (`deportes.cjs`):**
  - En pantalla grande, la prueba esperaba solo 15 s el fin del partido después de volver de segundo plano.
  - En el navegador de prueba sin tarjeta gráfica, la pausa corta de 1,6 s de juego tardó más que eso en tiempo real. Con `main` pasa lo mismo, así que no viene de este cambio.
  - Ahora espera hasta 60 s.
  - También espera a que se registre la primera jugada con teclado (con un tope de 30 s): el pase apretado durante el saque sale cuando termina el saque.
- App: PR [#46](https://github.com/Matichoc/MAtigame_v0/pull/46). **APK de prueba: compilación nº 79**, en verde: https://github.com/Matichoc/MAtigame_v0/actions/runs/40023255916 (artefacto `matijuego-prueba-apk`).
- Web: PR [Matichoc/matiweb#49](https://github.com/Matichoc/matiweb/pull/49). Se publica cuando la persona dueña hace merge.
- **Falta probar en el celular:** la viñeta y el globito de la aventura, Mati Merge en 3D (que se vea fluido) y el menú de pie y acostado.

### PR #45 y matiweb #48 mergeados (23-oct)
- El ajuste de dificultad quedó en `main` y en la web.

### Partidos más fáciles de aprender (Pichanga y Básquet 2 contra 2)
- **Prueba en el celular de la persona dueña** (APK nº 77): Pichanga y Básquet 2 contra 2 "súper difíciles de jugar al tiro". Cuesta coordinar pases y hacer goles, los rivales hacen goles mucho más fácil y quitar la pelota es muy difícil.
- **Causa:**
  - La dificultad se había calibrado con un robot que mueve el joystick perfecto y reacciona al instante.
  - Además, la dificultad marcada de entrada era "normal".
  - Con un jugador simulado que juega como persona (`scripts/qa/jugador-humano.mjs`: decide cada ~0,45 s y apunta con error), en "normal" ganaba 8 de 40 partidos de Pichanga y 11 de 40 de básquet.
- **Cambios:**
  - Rivales más lentos y con menos puntería.
  - Más alcance para quitar o robar, y menos castigo si fallas.
  - En **Accesible**, basta con chocar o pegarse al rival que lleva la pelota para intentar quitársela.
  - El compañero va a buscar tus pases, y en básquet tus pases se cortan menos.
  - Arquero de tu equipo un poco mejor.
  - Todos parten en **Accesible ("para aprender")**: quien venía en "normal" sin copas pasa a accesible (migración de `progress.sports` a la versión 2).
- **Resultado con el jugador simulado:**

| Dificultad | Pichanga | Básquet |
|---|---|---|
| Accesible (aprendiz) | gana 30/30, unos 7 a 1 | gana 30/30, unos 10 a 3 |
| Normal | gana 20–25/30 | gana 18–21/30 |
| Desafío | gana 7–12/30 | gana 7–12/30 |

  Quedó como prueba permanente en `scripts/qa/deportes-logica.mjs`.
- Pruebas:
  - Lógica: `deportes-logica.mjs` 58/58 y `aventura-logica.mjs` 64/64.
  - Navegador, app: `deportes.cjs` 52/52 y `aventura.cjs` 41/41.
  - Navegador, web: las mismas, también 52/52 y 41/41.
  - `verify:app` OK.
- App: PR #45. **APK de prueba: compilación nº 78**, en verde: https://github.com/Matichoc/MAtigame_v0/actions/runs/39893272151 (artefacto `matijuego-prueba-apk`).
- Web: PR [Matichoc/matiweb#48](https://github.com/Matichoc/matiweb/pull/48). Se publica cuando la persona dueña hace merge.
- Falta confirmarlo en el celular: el jugador simulado no reemplaza a una persona.

### PR #44 y matiweb #47 mergeados (22-oct)
- La evolución integral quedó en `main` y la web se publicó en matichoc.cl/matijuego: despliegue nº 46 de matiweb, en verde.

## 2026-10-22

### Las mejoras van siempre a la app y a la web
- **Decisión de la persona dueña:** toda mejora va a los dos lados, la app (APK) y la web (matichoc.cl/matijuego). Quedó como regla en `CLAUDE.md`.
- La web no se actualizaba desde el PR #46 de matiweb (antes del #37). El PR de matiweb con esta evolución lleva también todo lo acumulado:
  - Pueblo con parkour y puertas de juegos, Ciudad con misiones diarias, Mati Merge más claro y sonido más sobrio.
  - Arte de temporadas, "atrás" que cierra los cuadros y licencias.
- Se genera con `MATIJUEGO_DEMO=1 node scripts/deploy-matiweb.mjs`, en modo demo como siempre. **PR de la web: [Matichoc/matiweb#47](https://github.com/Matichoc/matiweb/pull/47)** (rama `claude/zealous-johnson-2ryf87`, commit `3ed08dc`). Se publica cuando la persona dueña hace merge.
- Pruebas contra la versión web servida en local:
  - `aventura.cjs` 41/41, `deportes.cjs` 52/52 y `temporada.cjs` 29/29.
  - `enlaces.cjs` y `legal.cjs`: OK. 0 peticiones externas.
  - `juegos.cjs`: 15/16. Choco Blaster "no salió de la tarjeta de inicio", pero la misma prueba falla igual con la web publicada hoy (matiweb `6374727`) y, abierto a mano, el juego carga bien. Pendiente: arreglar la prueba de Choco Blaster.
  - `atras.cjs` no aplica a la web: el botón es del celular, y en la demo web Fútbol no está bloqueado.

### Rendimiento para teléfonos de gama media-baja (mismo PR #44)
- **Decisión de la persona dueña:** todo lo que se desarrolle debe funcionar en teléfonos de gama media-baja hacia arriba. Quedó como regla en `CLAUDE.md`.
- Se midió lo nuevo. Dibujos por cuadro: Pichanga 858 (Fútbol de siempre: 302) y Básquet 2 contra 2: 548 (Lanzamientos: 209). La causa eran las sombras reales de 6 y 4 personajes.
- Ajuste en celulares: sombras redondas simples en un solo dibujo, sin brillo de posprocesado y tablas de la cancha agrupadas. Quedó en Pichanga **413** y Básquet 2 contra 2 **286**. Detalle en `docs/EVOLUCION-JUGABILIDAD.md` §12.
- **Compilación nº 77** (`da7ad2c`, con este ajuste y toda la evolución): APK de prueba sin `release`, en verde. Reemplaza a la nº 76 para probar en el celular: https://github.com/Matichoc/MAtigame_v0/actions/runs/39870514932 (artefacto `matijuego-prueba-apk`).
- Pendiente: medir en un celular real de gama media-baja.

### Evolución integral: aventura del festival, Pichanga 3 contra 3 y Básquet 2 contra 2 (rama `claude/zealous-johnson-2ryf87`)
- Encargo de la persona dueña: "Evolución integral de Matijuego". Situación: la app se prueba con APK en su celular y **no está subida a Play Console**. No se preparó ninguna publicación ni se tocaron credenciales, firmas ni el identificador de la app.
- Plan, decisiones, criterios y estado por fase: `docs/EVOLUCION-JUGABILIDAD.md`.
- **Fase 1, menú:** tres accesos grandes: "Continuar mi aventura", "Jugar libremente" y "Mi personaje y mis espacios". Sin Matichico elegido, un aviso amable reemplaza la alerta del navegador. "Atrás" funciona en la pantalla nueva y en los cuadros nuevos.
- **Fase 2, aventura "Preparar el gran festival del Pueblo":** 3 capítulos con Bombi (rincón de la plaza), Capi Menta (cancha) y Don Cuchufli (aro y festival).
  - En el Pueblo: "❗" sobre quien te espera, flecha guía y objetivo escrito. Cada capítulo tiene un estilo para elegir, que transforma el Pueblo y queda para siempre.
  - Avance en `progress.adventure` (versionado, no se reinicia cada día). Premios una sola vez. Los pasos de jugar aceptan alternativas libres; nunca se pide un juego bloqueado.
- **Fase 3, Pichanga Choco:** fútbol 3 contra 3 con IA local, saques de todo tipo, cambio de jugador predecible, controles táctiles y de teclado, amistoso y copa de 3 partidos, y tres dificultades. Se abre en la cancha del Pueblo y desde la tarjeta de Fútbol.
- **Fase 4, Básquet 2 contra 2:** media cancha, pases, tiros de 2 y 3 con barra de tiempo, robos, tapones y rebotes, con reglas simples (sacar desde arriba; sacarla detrás de la línea de 3 al recuperar). Amistoso, copa y dificultades. Se abre desde Lanzamientos y desde el aro del Pueblo.
- **Fase 5, integración:**
  - Los vecinos recuerdan y comentan lo construido. Copas y medallas visibles. 3 logros nuevos (`docs/LOGROS.md` regenerado).
  - Al volver después de más de 3 horas, un resumen corto. Meta personal visible en el menú.
  - En temporada: colores del evento en el festival, frase de temporada y un reto opcional que da fichas del evento, una vez por evento y año.
- Al pasar a segundo plano, la app anota la hora de salida dentro del guardado, para el resumen al volver. Solo cambia ese dato: no reescribe el resto ni revive un perfil borrado.
- Pruebas nuevas:
  - `scripts/qa/aventura-logica.mjs` y `scripts/qa/deportes-logica.mjs`, en Node.
  - `scripts/qa/aventura.cjs` y `scripts/qa/deportes.cjs`, en el navegador.
  - `scripts/qa/atras.cjs` ampliado con la pantalla de la aventura, el cuadro nuevo y un partido.
- Resultados de esta corrida: ver "Evidencia final" en `docs/EVOLUCION-JUGABILIDAD.md`.
- Ajuste tras revisar capturas de celular: los tres caminos del menú quedaban abajo en vertical; se movieron arriba de todo.
- Compilaciones desde la rama, con APK de prueba, sin `release`, `fonts=libres` e `icono=habitual`:
  - Nº 75 (`da3c4b6`): en verde.
  - **Nº 76 (`edd2d0a`, con todo, incluido el ajuste del menú): en verde.** Artefacto `matijuego-prueba-apk` en https://github.com/Matichoc/MAtigame_v0/actions/runs/39869164512.
  - No se subió nada a Play.
- Pendiente:
  - Compilar el APK con estos cambios y probar en el celular de la persona dueña: controles táctiles, rendimiento de los partidos y lectura de textos en pantalla chica.
  - No se puede afirmar más diversión ni más retención sin probar con personas.

### PR #43 mergeado
- La regla de la bitácora y la nota de la compilación 74 quedaron en `main`. Anotación pendiente desde el 21-oct, incluida en este PR siguiendo la regla de no abrir PRs solo para la bitácora.

## 2026-10-21

### Regla nueva: la bitácora no lleva PR propio
- Decisión de la persona dueña: no abrir PRs solo para la bitácora. Su commit va en el PR que esté abierto o, si no hay ninguno, en el siguiente. Anotado en `CLAUDE.md`.

### Compilación nº 74: versión para la prueba cerrada en Google Play
- Desde `main` `d31fde0` (merge del #42: "atrás" cierra todos los cuadros), con `release`, `fonts=libres` e **`icono=habitual`** (el Matichico). Decisión de la persona dueña: el ícono habitual, para que sea simple.
- Versión 1.0.0, `versionCode` 74. Todos los pasos en verde: APK de prueba revisado y `.aab` firmado con la llave de subida (no con la de pruebas). La llave se borró del servidor.
- Artefactos: https://github.com/Matichoc/MAtigame_v0/actions/runs/39633296344 (`matijuego-prueba-apk` y `matijuego-play-store-aab`).
- Pendiente: probar en el celular que "atrás" cierra Energía y Calendario. Después, crear la app en Play Console y subir este `.aab` a la prueba cerrada.

### PR #42 mergeado
- "Atrás" cierra Energía, Calendario, Canje y Ranking.

### Cuenta de Google Play validada
- La persona dueña informa que Google **validó su cuenta de desarrollador** (cuenta personal). Ya se puede crear la app en Play Console.
- Siguiente: merge del #42 → compilar el `.aab` definitivo → crear la app en Play Console → prueba cerrada (cuenta personal nueva: al menos 12 testers durante 14 días, según la consola) → solicitar acceso a producción.
- Recomendación sobre el ícono: compilar el `.aab` de la prueba cerrada con `icono=habitual` (el Matichico). La prueba de 14 días termina después del 2-nov, y así no hace falta otra versión al acabar Halloween.

### Arreglo: "atrás" no cerraba algunos cuadros (rama `claude/atras-cuadros`)
- Hallazgo de la revisión independiente: Energía y Calendario no se cerraban con "atrás". Al revisar aparecieron dos más con el mismo problema: Canje de juegos (`um-cancel`) y Ranking mundial (`wr-close`). El manejador hacía `modal.click()` y esos cuadros no se cierran tocando el fondo.
- Arreglo: cada cuadro marca su botón de cierre con `data-back` y "atrás" pulsa ese botón, así corre su propio cierre con su estado interno (por ejemplo `enOpen`). Si un cuadro no tuviera botón, se oculta igual.
- Prueba: `scripts/qa/atras.cjs` exige un `data-back` por cuadro y prueba que Energía, Calendario y Canje se cierran, se pueden reabrir y no sacan de la app. Con el código de `main` (`5a69ef7`) falla en esos 4 puntos; con el arreglo da 17/17.
- `scripts/qa/juegos.cjs`: antes de pulsar el inicio espera de verdad a que el botón esté visible, hasta 20 s, porque el Pueblo tarda en armarse en un equipo lento. Si el clic falla, guarda el error completo. No se relajó ninguna comprobación.
- Corrida de juegos sin red con este cambio: 15/15, 0 errores, 0 peticiones externas. La autoprueba de inicio roto sigue detectando el fallo. `legal`, `enlaces`, `perfiles` 13/13 y `pueblo` OK.

### Revisión independiente después del PR #41 (`5a69ef7`, matiweb `6374727`)
- Compilaron: build de la app, verificador, `cap sync`, `assembleDebug` y `bundleRelease`. Su AAB es local y sin firma: no es el que se sube.
- Pasaron: temporadas, perfiles 13/13, privacidad y licencias, enlaces sin Choco Blaster, misiones de la Ciudad, lógica de las puertas y la prueba negativa de inicio. El ícono habitual, el de Play y la política coinciden con la página de matichoc.cl.
- ❌ "Atrás" no cerraba Energía ni Calendario: corregido arriba.
- ⚠️ Corrida de juegos sin red: **14/15** la primera vez, porque el clic de inicio del Pueblo superó los 5 s. Al repetir solo el Pueblo, 1/1. No se confirma un defecto del juego. Se conservan ambos resultados: la primera corrida **no** cuenta como 15/15.
- La persona dueña confirmó: cuenta de Google Play **personal**, en verificación. El AAB está generado en GitHub y **todavía no se subió** a Play.
- Pendientes para la primera publicación, según la revisión:
  1. Generar el AAB firmado definitivo desde un `main` que incluya el #41 y este arreglo, con `versionCode` mayor que cualquiera ya subido.
  2. Terminar la verificación de la cuenta y las tareas de dispositivo que pida Play Console.
  3. Crear la app en Play Console, subir el AAB y revisar los avisos de paquete, firma, API y compatibilidad.
  4. Probar instalación y actualización desde una pista interna. Ojo: el APK de prueba tiene otro certificado; no desinstalar con progreso sin asumir que se pierde.
  5. Completar ficha, ícono, capturas, política, acceso, anuncios, datos, edades e IARC. Revisar la promoción de marca dirigida a menores.
  6. Cuenta personal nueva: **prueba cerrada con al menos 12 testers durante 14 días seguidos** y después solicitar acceso a producción. Confirmar en la consola; las pruebas internas no cuentan para ese plazo.
  7. Siguen pendientes: licencias transitivas, comprobantes de derechos y la revisión de marca y público infantil (informe de auditoría).
  8. Con acceso a producción, enviar a revisión de Google. Que verifiquen la identidad no significa que aprueben la app.

### PR #41 mergeado
- Ícono habitual con el Matichico y esta bitácora ya están en `main`.


### Ícono habitual: el Matichico (PR #41, mergeado)
- **Decisión de la persona dueña:** el ícono de todo el año pasa del logo del cacao al Matichico.
- Se copiaron los `ic_launcher*` de `resources/temporadas/habitual/android/res` a `android/app/src/main/res` y `store/temporadas/habitual/icon-512.png` a `store/icon-512.png`.
- Las compilaciones con `icono=habitual` (por defecto) llevan el Matichico; con `icono=evento`, el de la temporada.
- Pendiente: subir el nuevo `store/icon-512.png` a la ficha de Google Play cuando corresponda (a mano). No regenerar íconos con `@capacitor/assets`: volvería el logo (ver `docs/PLAY-STORE.md`).

### Prueba en el celular de la persona dueña (compilación nº 73, `main` con #39 y #40)
- ✅ El botón "atrás" funciona: avisa antes de salir en el menú, vuelve al menú desde los juegos y desde la tienda.

### Arte de todas las temporadas (PR #40, mergeado)
- Imágenes de Drive (carpeta "matijiego temporadas") para habitual, San Valentín, Pascua, Niñez (`dianino`), Fiestas Patrias y Navidad.
- Pantalla de carga por evento; sin evento, el arte habitual. Ícono Android e ícono de Play por temporada.
- Todas las imágenes generadas traían "Matjuego" (sin la i) y una insignia aproximada: quedan fuera de los recortes.
- Comprobado en el navegador: cada evento en su fecha real, el habitual, el respaldo, sin internet y el progreso. Ver `docs/TEMPORADAS.md` §9.

### Arreglo del botón "atrás" (PR #39, mergeado)
- En el celular (compilación nº 72) el botón no hacía nada. Causa: se usaba `Capacitor.registerPlugin`, que no existe sin empaquetador. Arreglo: se usa el puente nativo (`Capacitor.addListener` y `nativeCallback`).
- La prueba `scripts/qa/atras.cjs` simulaba mal el puente y por eso no lo detectó. Se corrigió, y ahora falla con el código viejo y pasa con el nuevo.

### Prueba en el celular (compilación nº 72, `icono=evento`)
- ✅ Ícono de Halloween (una sola vez en el escritorio y en el cajón de apps), progreso conservado, pantalla de carga de Halloween y sonido más sobrio.
- ❌ Botón "atrás" sin efecto, arreglado en el #39.

### Halloween: identidad de temporada (PR #38, mergeado)
- Pantalla de carga con arte del evento activo (`js/season-art.js`, `js/splash.js`) e indicador de carga real.
- Ícono Android por temporada al compilar (entrada `icono` del workflow) e ícono para Play.
- `activity-alias` se evaluó y se descartó (ver `docs/TEMPORADAS.md`).
- **Decisiones:** el logo de la polera se deja como está; el ícono de temporada muestra al personaje; las imágenes las generó la persona dueña con IA.

### Pueblo, Ciudad, Mati Merge y sonido (PR #37, mergeado)
- Pueblo: salto, Torre de Cacao, Escalera de Nubes y puertas de juegos (El Gato, Mini Sudoku, Cachipún).
- Ciudad: las misiones vuelven cada día.
- Mati Merge más claro, con botón de pista.
- Sonido con filtro de agudos y limitador.

### Botón "atrás" (PR #36, mergeado)
- Plugin `@capacitor/app`. Quedó sin efecto en el celular hasta el arreglo del #39.

### Google Play: cuenta, llave y primera compilación firmada
- La persona dueña pagó la cuenta de desarrollador; la verificación de identidad está en curso.
- Creó su llave de subida (`upload.keystore`, respaldada fuera del repositorio) y cargó los 4 secretos en GitHub.
- Compilación nº 71: APK de prueba y `.aab` firmado con su llave. La página `https://matichoc.cl/matijuego/privacy.html` está publicada; la persona dueña la vio en su navegador.

## 2026-10-20

### Preparación para Google Play (PR #35 de MAtigame_v0 y PR #46 de matiweb, mergeados)
- Privacidad y licencias dentro de la app, ranking apagado, tipografías libres por defecto, workflow que comprueba permisos y firma, ficha y capturas, y el informe `docs/AUDITORIA-PREPUBLICACION.md`.
- Revisión independiente: se corrigieron la ficha IARC (combate de fantasía), las pruebas de juegos (más estrictas) y las tipografías por defecto.
