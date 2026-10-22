# Evolución de la jugabilidad de Matijuego

Encargo de la persona dueña ("Evolución integral de Matijuego", 22-oct-2026), adaptado al código real del repositorio.
Este documento guarda los objetivos, las fases, las decisiones, los criterios de aceptación, el estado de avance y lo que
falta comprobar. Se actualiza en el mismo PR de cada cambio, igual que `docs/BITACORA.md`.

**Situación de partida:** la app se prueba con un APK en el celular de la persona dueña. **No está subida a Play Console**,
no hay prueba interna ni cerrada y no hay testers organizados. Este trabajo es de desarrollo del juego: no se prepara ninguna
publicación, no se despliega nada y no se tocan credenciales, firmas ni el identificador de la app.

**Lo que no se promete:** que el juego retenga más o que sea más divertido. Eso solo se sabe probándolo con personas.

---

## 1. Objetivo

Que Matijuego deje de ser solo una lista de minijuegos y tenga una **aventura persistente** que los conecte, con:

- transformaciones que se ven en el Pueblo y decisiones de quien juega;
- vecinos que recuerdan lo que hiciste;
- deportes más dinámicos (fútbol 3 contra 3 y básquet 2 contra 2);
- libertad: los minijuegos siguen a un toque desde el menú y la aventura nunca obliga a jugar uno en particular.

Otros juegos sirven solo como referencia de estructura (capítulos cortos, vecinos con pedidos, espacios que se transforman). No se copia nada.

## 2. Cómo es el código hoy (punto de partida)

| Pieza | Dónde | Lo que importa para este trabajo |
|---|---|---|
| Perfiles y guardado | `js/profiles.js`, `js/storage.js` | Un guardado por perfil en `localStorage` (`matichoc_save_v3_profile_<id>`). `loadProgress` mezcla con `defaultProgress()` y normaliza. |
| Menú (hub) | `app/index.template.html` (`#screen-hub`), `js/main.js` | Escenario 3D con el Matichico, elección de personaje, Vestuario y Tienda, Mi Casa y la grilla de juegos. |
| Base de los juegos 3D | `js/three-kit.js` (`Game3D`) | Ciclo intro → playing → win/gameover, energía, pausa al ir a segundo plano, `finish()` paga Matipuntos y XP una vez por partida. |
| Registro de juegos 3D | `js/main.js` (`GAMES_3D`, `launchOrResume3d`) | Convención de ids `<prefijo>-canvas`, `-overlay-intro`, `-btn-start`, `data-action`… |
| Pueblo | `js/town-game.js`, `js/town-fun.js` | Mundo abierto con vecinos (`NEIGHBORS`), puntos de uso (`interact`) y evento `town-action` hacia el menú. **`progress.town` se borra cada día** (`_daily()`). |
| Fútbol | `js/futbol-game.js` | Penales, tiros libres y atajapenales con 20 niveles cada uno. Está **bloqueado** en perfiles nuevos (se canjea con 2000 Matipuntos, `js/unlocks.js`). |
| Básquet | `js/basquet3d-game.js` | Concurso de lanzamientos con barras de puntería y potencia. Libre. |
| Temporadas | `js/events.js` (`activeEvent`) | Un solo calendario de eventos; el Pueblo cambia su decoración y hay fichas del evento. |
| Botón "atrás" | `js/main.js` | Cierra cuadros (`.modal` con `data-back`), vuelve desde pantallas internas y pide confirmar en juegos y en el menú. |

## 3. Decisiones (tomadas con criterio, sin bloqueos)

1. **Estado nuevo y versionado para la aventura:** `progress.adventure = { v: 1, … }` (módulo `js/adventure.js`). No se usa `progress.town`, porque ese se reinicia cada día. La migración (`normalizeAdventure`) es idempotente: aplicarla dos veces da lo mismo, y repara datos rotos sin borrar avance.
2. **Estado nuevo y versionado para los deportes:** `progress.sports = { v: 1, pichanga: {…}, basquet2v2: {…} }` (módulo `js/sports-progress.js`), independiente del avance de los modos que ya existían.
3. **Sin moneda nueva:** los premios son Matipuntos y XP, igual que el resto del juego. Cada premio de la aventura y de las copas se marca como cobrado en el estado, así que reabrir la app o repetir una acción no lo vuelve a pagar.
4. **Ningún paso exige un juego bloqueado, un récord difícil ni todos los modos:** cada paso de "jugar" acepta varias alternativas y cuenta cualquier partida terminada, gane o pierda. Ganar en dificultad "desafío" da un reconocimiento extra (una medalla), nunca es obligatorio.
5. **La Pichanga Choco vive dentro de Fútbol y también en la cancha del Pueblo:** Fútbol está bloqueado en perfiles nuevos y la aventura no puede exigir un juego bloqueado. Por eso la Pichanga se abre desde la tarjeta de Fútbol (si ya lo canjeaste) y, siempre, desde la cancha que arreglas en el capítulo 2 del Pueblo. El precio de Fútbol y sus modos de siempre no cambian.
6. **Los modos nuevos son juegos 3D aparte** (`pichanga`, `basquet2v2`) con su propia pantalla, registrados en `GAMES_3D` pero no en la grilla del menú: así no se toca la física de penales ni la del concurso de lanzamientos.
7. **La simulación de cada deporte es lógica pura** (`js/pichanga-sim.js`, `js/basquet2v2-sim.js`, sin three.js ni DOM). El dibujo 3D solo la lee. Así se puede probar en Node con miles de partidas y verificar que no queden pelotas ni jugadores trabados.
8. **Vecinos con memoria:** los tres vecinos de la aventura (Bombi, Capi Menta y Don Cuchufli) ya existen en el Pueblo. Su diálogo cambia según el avance y, después de cada capítulo, recuerdan lo que construiste. Mientras tienen un pedido, se quedan cerca de su lugar con un "❗" encima.
9. **Temporadas:** se reutiliza `activeEvent()`. Durante un evento, el festival usa los colores del evento, los vecinos agregan una frase de temporada y aparece un **reto opcional** que da fichas del evento (las que ya existen). El reto se cobra una vez por evento y por año. Fuera de temporada todo sigue disponible.
10. **Sin presión de horario:** nada de la aventura depende del día. No hay notificaciones nuevas ni premios al azar como gancho.
11. **Choco Blaster sigue fuera de la variante Android:** no se agrega ningún acceso a ese juego.

## 4. Fases, criterios de aceptación y estado

Leyenda de estado: ⬜ pendiente · 🟨 en curso · ✅ hecho. En las pruebas: **N** navegador (Playwright + Chromium), **L** prueba de lógica en Node, **A** compilado para Android, **C** probado en un celular real, **M** queda revisión manual.

### Fase 1 — Comienzo y menú ✅ (N, L · falta C)

Recorrido de un perfil nuevo: crear perfil → elegir personaje → entender qué hacer → jugar → ver una consecuencia → decidir cómo seguir.

- [x] El menú muestra tres accesos grandes: **"Continuar mi aventura"**, **"Jugar libremente"** y **"Mi personaje y mis espacios"** (`app/index.template.html`, `js/adventure-ui.js`). Están arriba de todo, bajo la barra superior: en el celular vertical se ven sin desplazar la pantalla (uno bajo otro) y en horizontal, en una fila. Reutilizan lo que ya existía: el Pueblo, la grilla de juegos, Vestuario y Tienda, y Mi Casa.
- [x] Perfil nuevo: si todavía no eliges tu Matichico, el botón de la aventura lo dice y, al tocar un juego, sale un aviso amable con la grilla de personajes destacada (antes era una alerta del navegador). Al elegirlo: "¡Hola, …! Ahora toca «Continuar mi aventura»", y el botón brilla hasta que empiezas.
- [x] "Jugar libremente" lleva directo a la grilla de juegos (todos siguen a un toque). "Mi personaje y mis espacios" abre un cuadro con Vestuario y Tienda, Mi Casa, Cambiar de Matichico y Mis lugares del Pueblo.
- [x] Primer objetivo en pocos minutos: "Ir al Pueblo con Bombi" te deja junto a ella. Su diálogo trae botones para jugar una partida y, al volver, eliges el estilo del rincón y lo ves cambiar en el momento.
- [x] "Atrás" del celular: vuelve de la pantalla de la aventura al menú y cierra los cuadros nuevos (`scripts/qa/atras.cjs`).

### Fase 2 — Aventura "Preparar el gran festival del Pueblo" ✅ (N, L · falta C)

| Capítulo | Vecino y pedido | Objetivos cortos | Elección visible | Transformación persistente |
|---|---|---|---|---|
| 1. Un rincón de la plaza | **Bombi**: el rincón junto a la fuente está descuidado y quiere que vuelva a ser lindo para el festival. | Hablar con Bombi → conseguir materiales terminando **una partida de cualquier juego libre** → elegir el estilo → inaugurar con Bombi. | Jardín de cacao, guirnaldas de colores o rincón de lectura. | El rincón (maleza y una banca rota) queda decorado con el estilo elegido. |
| 2. La cancha de la pichanga | **Capi Menta**: la cancha está llena de pasto y sin arcos; quiere organizar una pichanga. | Hablar con Capi Menta → elegir los colores del equipo → jugar la pichanga (**o** Recolecta y Corre, Parkour o Fútbol) → contarle cómo te fue. | Rosado Matichoc, celeste cielo o verde menta. | Cancha marcada, con arcos y banderines del color elegido. Desde ahí se juega la Pichanga. Tu equipo usa esos colores en el partido. |
| 3. El aro y el gran festival | **Don Cuchufli**: falta un lugar para jugar básquet. | Hablar con Don Cuchufli → elegir la cancha → jugar básquet (2 contra 2, lanzamientos **o** Saltos de Porristas) → celebrar en la fuente. | Clásica naranja, dorada Matichoc o arcoíris. | Media cancha con aro, y la plaza de fiesta: banderines entre todos los faroles y un cartel del festival. |

- [x] Cada capítulo tiene vecino reconocible (con "❗" y quedándose cerca de su lugar), pedido concreto, objetivos cortos, diálogos que cambian con el avance, una elección de estilo visible, una transformación que queda en el Pueblo y un cierre con el siguiente paso escrito.
- [x] Guía: arriba en el Pueblo se ve el objetivo actual, y una flecha dorada en el suelo apunta adonde ir. La pantalla "El gran festival" muestra los capítulos, los pasos con ✓ y el botón de lo que toca.
- [x] Los minijuegos aportan con alternativas y cuenta cualquier resultado. Nunca se pide un juego bloqueado (Fútbol no está entre las alternativas del capítulo 1, y la Pichanga del capítulo 2 se juega en la cancha del Pueblo aunque Fútbol siga bloqueado), ni un récord ni todos los modos.
- [x] Avance en `progress.adventure` (versión 1), aparte de `progress.town`, que se reinicia cada día. No depende de la fecha ni de esperar al día siguiente.
- [x] Premios: 60, 80 y 120 Matipuntos y la misma cantidad de XP, **una sola vez** por capítulo (`claimed`). Se probó repetir, reabrir y celebrar dos veces.
- [x] Los estilos se pueden cambiar después, sin costo y sin volver a cobrar.

### Fase 3 — Pichanga Choco (fútbol 3 contra 3) ✅ (N, L · falta C)

Archivos: `js/pichanga-sim.js` (reglas, IA y pelota, lógica pura), `js/pichanga-game.js` (escena y cámara), `js/match-game.js` (base común de los partidos).

- [x] Penales, tiros libres y atajapenales no se tocaron.
- [x] Modo aparte: 2 jugadores de campo y 1 arquero por equipo. Manejas a uno; tu compañero, los arqueros y los rivales son IA local.
- [x] Cancha chica (30 × 19 m) con cámara elevada. En horizontal se ve de costado; con el celular vertical, a lo largo de la cancha. Los controles siguen a la cámara.
- [x] Moverse, conducir, pasar (hacia donde apuntas), tirar (eliges palo con la dirección), quitar, goles, atajadas y bloqueos. Reanudaciones: saque inicial después de cada gol, saque de banda, saque de arco y córner, con los rivales a 3 m. Si tocas el botón antes de tiempo, el saque sale apenas se puede; si no haces nada, sale solo a los 5 s.
- [x] Cambio de jugador predecible: cuando tu equipo tiene la pelota manejas a quien la lleva; sin la pelota, "Cambiar" alterna entre tus dos jugadores. Anillo dorado y flecha sobre el activo; anillos del color de cada equipo en los demás.
- [x] Controles táctiles (joystick + Pase/Quitar + Tiro + Cambiar, botones de 84–96 px) y teclado (WASD/flechas, Espacio/J, K, Q, P). El botón de pase dice lo que hará: "Pase", "Quitar" o "¡Pásala!".
- [x] Partidos de 2 minutos; amistoso y copa de 3 partidos (cuartos, semifinal y final) con la ronda guardada. Perder no te hace retroceder. En la copa, el empate se define con gol de oro.
- [x] Dificultades accesible, normal y desafío: cambian la velocidad, los reflejos, la puntería y la habilidad para quitar y atajar de los rivales.
- [x] IA: el que lleva la pelota decide entre tirar, pasar o conducir. El compañero busca espacios libres con línea de pase. En defensa uno presiona y el otro marca o cubre la zona, así no persiguen todos la pelota. Todos siguen las mismas reglas. En la prueba, un jugador con decisiones simples le gana a «accesible» 30 de 30 veces.
- [x] Pausa (botón ⏸ o P) que detiene el reloj, y pausa corta al volver de segundo plano.

### Fase 4 — Básquet 2 contra 2 (media cancha) ✅ (N, L · falta C)

Archivos: `js/basquet2v2-sim.js` (reglas, IA y pelota), `js/basquet2v2-game.js` (escena y cámara).

- [x] El concurso de lanzamientos no se tocó. El modo nuevo se abre desde su tarjeta, desde el aro del Pueblo y desde la aventura.
- [x] Tú + un compañero con IA contra dos rivales.
- [x] Movimiento libre, botar, pases (que un rival cerca de la línea puede cortar), tiros de 2 y de 3 con barra de tiempo (mantener y soltar en el verde), defensa al hombre, robos, tapones y rebotes.
- [x] Reglas simples explicadas en la tarjeta y con avisos en el juego: después de una canasta o una pelota afuera, saca el otro equipo desde arriba. Si recuperas la pelota, hay que sacarla detrás de la línea de 3 (se ilumina en amarillo) antes de tirar.
- [x] Cámara detrás del medio campo que siempre deja a la vista el aro, la pelota y tu jugador. Anillo dorado y flecha sobre el activo y anillos de equipo.
- [x] Partidos hasta 11 puntos (9 en accesible) o 3 minutos. Amistoso, copa de 3 partidos (empate en la copa: la próxima canasta gana) y tres dificultades.
- [x] Avance propio en `progress.sports.basquet2v2`, sin tocar el de lanzamientos. Si armaste el aro en la aventura, la cancha usa el estilo que elegiste.

### Fase 5 — Integración ✅ (N, L · falta C)

- [x] Los vecinos de la aventura recuerdan lo que construiste y los demás vecinos también lo comentan (`gossip`). La cancha y el aro del Pueblo abren los partidos.
- [x] Copas por dificultad y medallas (copa en Desafío) visibles en la pantalla del festival. Logros nuevos en la pantalla de Logros: "Organizador del festival", "Campeón de la Pichanga" y "Campeón del 2 contra 2" (`docs/LOGROS.md` regenerado).
- [x] Al volver después de más de 3 horas, una franja corta en el menú dice cuántos capítulos llevas y qué sigue. No tapa la pantalla y se cierra con un toque.
- [x] Meta personal elegible (terminar el festival, ganar una copa o decorar Mi Casa con 5 muebles), visible en el menú con su avance.
- [x] Temporadas con `activeEvent()` de siempre: el festival usa los colores del evento, los vecinos agregan una frase de temporada y hay un **reto opcional**: jugar un partido durante el evento da 15 fichas del evento, una vez por evento y por año. Nada se pierde cuando termina la temporada.
- [x] Sin presión de horario, sin notificaciones y sin premios al azar como gancho. Ningún avance se borra por días sin jugar.
- [x] Choco Blaster sigue fuera de la variante Android (`npm run verify:app` en verde).

## 5. Requisitos técnicos y cómo se cumplen

| Requisito | Cómo |
|---|---|
| Sin conexión, IA local, sin cuentas ni analítica | Todo corre en el aparato. Las pruebas de navegador registran **0 peticiones externas**, también con la red cortada. |
| Sin datos nuevos fuera del aparato | `progress.adventure` y `progress.sports` viven en el mismo guardado local del perfil. |
| Guardados antiguos | `loadProgress` agrega los dos estados nuevos a un perfil antiguo sin tocar el resto. Probado con un guardado "de antes": conserva Matipuntos y XP. |
| Migraciones seguras e idempotentes | `normalizeAdventure` y `normalizeSports` reparan datos rotos sin perder lo válido. Aplicarlas dos veces da lo mismo. |
| Sin premios duplicados | Premios de capítulos y copas marcados como cobrados; reto de temporada, uno por evento y año. |
| Pantallas chicas | Probado en 412 × 860 táctil y girando a 860 × 412: los botones caben y la cámara se adapta. |
| Android modesto | Pocas mallas nuevas, sombras de 1024 px en táctiles y la misma degradación automática de calidad de los otros juegos 3D. |
| Silencio y movimiento reducido | Los sonidos nuevos usan el mismo módulo de audio (respeta 🔇). Con movimiento reducido, sin pulsos ni flechas que rebotan. |
| "Atrás", pausa y segundo plano | Pantalla nueva en "atrás"; cuadros nuevos con `data-back`; pausa propia en los partidos; pausa corta al volver de segundo plano. |

## 6. Cómo se accede a lo nuevo

- **Menú → 🎪 Continuar mi aventura**: pantalla "El gran festival" (capítulos, lo que toca, lugares construidos, deportes, meta y reto de temporada).
- **Pueblo Matichoc**: rincón de la plaza (cerca de la fuente), **cancha** (hacia la puerta de Fútbol del Arcade) y **aro** (hacia la puerta de Lanzamientos).
- **Pichanga 3 contra 3**: en la cancha del Pueblo (desde el capítulo 2), en la tarjeta de inicio de Fútbol ("⚽ Nuevo: Pichanga…", si ya lo canjeaste) y en "Deportes del Pueblo" de la pantalla del festival.
- **Básquet 2 contra 2**: en la tarjeta de inicio de Lanzamientos de Básquet ("🏀 Nuevo: Básquet 2 contra 2"), en el aro del Pueblo y en la pantalla del festival.

## 7. Evidencia de pruebas

Ver §9.

## 8. Limitaciones y pendientes

- **Falta probar en un celular real** (C) todo lo nuevo: sensación de los controles táctiles, rendimiento de los partidos con 4–6 personajes en un Android modesto, lectura de los textos y del objetivo arriba en pantallas chicas.
- **Diversión y retención no medidas:** no se puede afirmar que el juego sea más divertido ni que retenga más sin probarlo con personas.
- En el navegador de pruebas (sin GPU), el juego corre lento. Por eso las pruebas de navegador fuerzan el final de los partidos. Los partidos completos se prueban en la simulación (Node), con miles de segundos de juego.
- La IA de Pichanga hace bastantes goles (unos 7–8 por partido de 2 minutos entre IA). Es intencional para que haya acción, pero conviene ajustarlo según cómo se sienta en el celular.
- Salir de un partido a la mitad no lo guarda: al volver empieza uno nuevo. Las rondas de copa y la aventura sí quedan guardadas.
- La Pichanga se ve con tu Matichico en tu equipo, pero el arquero y el compañero son otros Matichicos con camiseta de equipo.

## 9. Evidencia final (22-oct-2026, rama `claude/zealous-johnson-2ryf87`)

**Lógica en Node (L):**

| Prueba | Resultado | Qué cubre |
|---|---|---|
| `node scripts/qa/aventura-logica.mjs` | 61/61 | Migración idempotente, datos rotos, recorrido completo, premios una vez, reabrir, días sin jugar, resumen al volver, metas, temporadas, deportes y copas. |
| `node scripts/qa/deportes-logica.mjs` | 52/52 | 120 partidos de Pichanga y 120 de Básquet entre IA, sin números rotos, pelotas quietas sin dueño ni saques sin hacer. Jugadas armadas: pase, gol, saque inicial, banda, arco, córner, robo, cambio, "¡pásala!", canastas de 2 y 3, sacar detrás de la línea, pelota afuera y gol de oro. Un jugador simple le gana a «accesible» 30 de 30 en los dos deportes. |
| `node scripts/qa/puzzles-logica.mjs` | 12/12 | Regresión de las puertas del Pueblo. |

**Navegador, Chromium sin GPU (N),** app compilada (`npm run build:app`), servida en local:

| Prueba | Resultado |
|---|---|
| `scripts/qa/aventura.cjs` (perfil nuevo → festival completo, cerrar y reabrir, resumen al volver, perfil antiguo) | 41/41, 0 errores, 0 peticiones externas (repetida tras mover los caminos arriba: 41/41; `atras.cjs` 22/22 y `perfiles.cjs` 13/13) |
| `scripts/qa/deportes.cjs` (los dos deportes, horizontal con teclado y vertical táctil sin red, pausa, segundo plano, final, copa guardada al reabrir, gol de oro, giro de pantalla) | 52/52, 0 errores, 0 peticiones externas |
| `scripts/qa/atras.cjs` (con pantalla de aventura, cuadro nuevo y Pichanga) | 22/22 |
| `scripts/qa/temporada.cjs` | 29/29 |
| `scripts/qa/pueblo.cjs` | 24/24 |
| `scripts/qa/ciudad-diaria.cjs` | 6/6 |
| `scripts/qa/perfiles.cjs` | 13/13 |
| `scripts/qa/legal.cjs` y `scripts/qa/enlaces.cjs` | OK, 0 externas |
| `scripts/qa/juegos.cjs --sin-red` | **14/15** en la corrida completa: Saltos de Porristas "sin respuesta a las entradas". Al repetir solo Porristas: 1/1 dos veces, y en la corrida completa anterior también pasó. Este trabajo no tocó ese juego. No cuenta como 15/15. |
| `npm run verify:app` | OK (incluye que Choco Blaster no esté en la app) |

Capturas revisadas: menú con los tres caminos, pantalla del festival, Bombi en el Pueblo, rincón con guirnaldas, festival terminado, Pichanga y Básquet en horizontal y vertical.

**Compilado para Android (A):**
- Compilación nº 75 desde esta rama (`da3c4b6`), con `release` sin marcar, `fonts=libres` e `icono=habitual`: todos los pasos en verde (https://github.com/Matichoc/MAtigame_v0/actions/runs/39868641480).
- Después se subió el ajuste del menú y se lanzó otra compilación con lo último (ver la bitácora). Ninguna compilación sube nada a Play.
**Probado en un celular real (C):** pendiente, lo hace la persona dueña (guía en §11).

## 10. Cómo generar un APK con todos los cambios

1. En GitHub, pestaña **Actions** → **Compilar app Android** → **Run workflow**.
2. En "Use workflow from" elige la rama `claude/zealous-johnson-2ryf87` (o `main`, si el PR ya se mergeó).
3. Deja `release` **sin marcar** (es solo para probar en el celular), `fonts` = libres e `icono` = habitual.
4. Al terminar (unos minutos), abre la ejecución y descarga el artefacto **`matijuego-prueba-apk`**. Dentro está el `.apk`.
5. Pásalo al celular e instálalo encima del que ya tienes. Si Android avisa que la firma no coincide, **no desinstales** sin pensarlo: desinstalar borra el progreso guardado.

Nada de esto sube archivos a Google Play.

## 11. Guía corta para probar en el celular

1. Abre la app con tu perfil de siempre: debe conservar tus Matipuntos, ropa y casa. Arriba de "Elige un juego" verás los tres botones nuevos.
2. Toca **🎪 Continuar mi aventura** → **Ir al Pueblo con Bombi**. Gira el celular. Habla con Bombi (botón rosado), juega una partida corta desde el diálogo y vuelve con ella. Elige un estilo y mira cómo cambia el rincón.
3. Sigue con Capi Menta. En la cancha del Pueblo, toca "⚽ Jugar una pichanga". Prueba el joystick y los botones **Pase**, **Tiro** y **Cambiar**, en horizontal y en vertical. Usa ⏸ para pausar.
4. Con Don Cuchufli, juega **Básquet 2 contra 2**: mantén **Tiro** y suelta en el verde. Prueba robar y saltar sin la pelota.
5. Cierra la app del todo a la mitad de un capítulo y vuelve a abrirla: debe seguir donde quedó.
6. Prueba el botón **atrás** en la pantalla del festival y dentro de un partido.
7. Anota lo que se sienta raro: botones difíciles de tocar, juego lento, textos cortados, IA demasiado fácil o difícil.
