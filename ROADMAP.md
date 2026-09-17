# Matichoc Arcade — Plan de evolución a plataforma multi-juego

Este documento registra la visión y el plan por etapas para transformar
Matichoc de un solo minijuego a una **plataforma de arcade** con varios
modos de juego que comparten personaje, atuendos y moneda. Se actualiza a
medida que se completa cada etapa.

## Visión

Un mismo Matichico (elegido y personalizado una vez) se usa en **todos**
los juegos de la plataforma. Todo lo que se recolecta —puntos y monedas
Chocolate Dubai— se acumula en un progreso compartido (`js/storage.js`),
que sirve para:

- Comprar atuendos en la Tienda (ya implementado).
- Más adelante, desbloquear/"comprar" nuevos juegos del catálogo con esas
  mismas monedas, igual que se compran atuendos hoy.

El **hub** (pantalla de inicio) es el punto central: ahí se elige el
personaje, se ve el progreso (monedas, mejor puntaje por juego) y se
elige a qué juego jugar. Cada juego es independiente por dentro, pero
comparte la misma "cáscara" (hub, tienda, tabla de puntajes, personaje).

## Etapas

### Etapa 0 — v0: un solo juego ✅

"Recolecta y Corre": recorrer canchas temáticas (fútbol, básquet, cheer)
juntando golosinas contrarreloj, con misiones, obstáculos, salto y un
bonus especial (Chocolate Dubai). Selección de personaje y tienda de
atuendos.

### Etapa 1 — Hub central y navegación ✅

Antes de sumar más juegos, se ordenó la base para que la plataforma sea
usable:

- El menú pasó de ser una simple pantalla de "elige personaje" a un
  **hub** con estadísticas visibles y una sección "Elige un juego" que ya
  muestra los 6 modos planeados, para que la dirección del proyecto sea
  visible desde ya.
- Botón **🏠 Volver al menú** disponible durante la partida (HUD) y en las
  pantallas de fin de nivel, para poder ir a la Tienda o iniciar otra
  partida sin recargar la página.
- Internamente, el motor de un juego se instancia una sola vez y se
  reutiliza entre partidas (`startRun(personaje)` / `pauseForMenu()`),
  evitando duplicar listeners de teclado/controles táctiles.

### Etapa 1.5 — Segundo salto de calidad visual + niveles en camino ✅

Feedback del usuario: los niveles de "Recolecta y Corre" se sentían
demasiado abiertos/libres ("no es como que vas avanzando un camino"), y
el arte pedía un salto de calidad adicional. Cambios:

- **Niveles como camino guiado**: cada nivel ahora define un `path`
  (polilínea) en `js/levels.js`, y `buildCorridorWalls()` genera
  automáticamente los muros que rodean ese camino (una grilla gruesa
  donde toda celda a más de `corridorWidth/2` del camino se vuelve pared).
  El resultado: se avanza por un corredor con recodos claros en vez de
  deambular por un campo abierto, con los obstáculos simples (conos,
  vallas saltables, conos en movimiento) puestos sobre el camino mismo.
  Las golosinas también se reparten a lo largo del camino
  (`randomPointInCorridor`), no en cualquier parte del mapa.
- **Bug encontrado y corregido durante el rediseño**: al angostar los
  corredores, el rebote contra un cono en movimiento a veces empujaba al
  jugador *dentro* de un muro (quedaba incrustado y atascado, igual que
  el bug de spawn corregido en una entrega anterior). Se agregó
  `_collidesWalls()` para que el rebote nunca aplique un desplazamiento
  que termine dentro de un muro.
- **Calidad visual**: los personajes ahora se dibujan con degradados
  (cabeza y jersey) en vez de color plano, sombra de contacto con
  degradado radial, y las golosinas suman sombra propia y un brillo
  especular. Se ajustó también el contraste muro/piso del tema "gimnasio"
  (Nivel 3), que con el camino nuevo era casi invisible.
- **Paleta e identidad de marca real**: el juego usaba una paleta
  genérica de "equipo deportivo" (rojo/dorado/azul marino) sin relación
  con la marca Matichoc. Se reemplazó por la paleta oficial —
  `#64321B` (marrón), `#CFD767` (verde), `#D4216C` (rosa/fucsia) y
  `#FFC800` (dorado)— en toda la interfaz (hub, tienda, HUD, botones) y
  en los 4 atuendos comprables (antes recolores de camiseta de fútbol
  genéricos, ahora "Local Matichoc", "Visita Cacao", "Edición Oro" y
  "Edición Choco Oscuro"). Nuevo módulo `js/theme.js` centraliza esos
  colores para usarlos en canvas (los mismos tonos están además como
  variables CSS en `css/style.css`). Tipografías reemplazadas por
  Fredoka (títulos/UI, en lugar de Baloo 2) y Caveat (acentos tipo
  script, como la tagline del logo) vía Google Fonts, buscando el
  espíritu de las tipografías de marca ("Baby Chipmunk" y "Adorable
  Mother Script", que al ser fuentes de pago no están disponibles para
  cargar desde una CDN). Se agregó también `favicon.svg`, un ícono
  propio inspirado en el logo real (vaina de cacao + chocolate +
  brillo) en vez del emoji genérico usado antes.

### Etapa 2 — Segundo juego: Tetris de Productos ✅

Ver la sección dedicada más abajo con el diseño completo. En resumen:
tetris clásico (7 piezas, bolsa 7-bag, rotación con wall-kick simple)
vestido con los colores/golosinas de Matichoc, con una pieza especial
"Chocolate Dubai" que da monedas al limpiar una línea que la contenga.
El personaje elegido aparece animado en el panel lateral.

Esta etapa también dejó resuelto el pendiente de puntajes: ver "Tabla de
puntajes por juego" más abajo.

### Etapa 3 — Salto Choco 🔜

Plataformero vertical simple (estilo "Icy Tower" / POW): el Matichico va
subiendo saltando entre plataformas que aparecen cada vez más espaciadas
y estrechas; si te caes de la pantalla, pierdes. Ideal para reutilizar la
mecánica de salto ya construida en la Etapa 0.

- Mecánica: scroll vertical infinito, plataformas generadas
  proceduralmente, dificultad creciente por altura.
- Coleccionables: golosinas que dan puntos extra; el Chocolate Dubai
  aparece como plataforma dorada especial.

### Etapa 4 — Autos de Chocolate 🔜

Carrera top-down: el Matichico maneja un autito de chocolate esquivando
obstáculos (conos, otros autos) y recolectando boosts de velocidad, en
pistas basadas en las mismas canchas/temas ya existentes.

- Mecánica: control de aceleración/dirección simple (arriba/abajo para
  acelerar-frenar, izquierda/derecha para carriles), distancia o tiempo
  como objetivo.
- Coleccionables: golosinas = puntos; Chocolate Dubai = nitro temporal.

### Etapa 5 — Memoria Matichoc 🔜

Juego de memoria/parejas con cartas ilustradas de las golosinas y de los
4 Matichicos. Pensado como modo corto y relajado, contrastando con los
demás modos de acción/tiempo.

- Mecánica: grilla de cartas boca abajo, encontrar parejas con el menor
  número de intentos o en el menor tiempo posible.

### Etapa 6 — Penales Choc 🔜

Minijuego corto de penales de fútbol: elegir dirección y potencia del
disparo (o del atajada, alternando), unas rondas cortas y tabla de
"racha" de penales convertidos.

- Mecánica: apuntar con el mouse/touch o flechas + barra de potencia con
  temporización (tap para fijar), 5 rondas por partida.

## Diseño de "Tetris de Productos" (Etapa 2)

- **Tablero**: 8 columnas × 14 filas, celdas de 32px (`js/tetris-game.js`).
- **Piezas**: las 7 formas clásicas (`js/tetris-pieces.js`), repartidas
  con una bolsa "7-bag" (cada forma sale una vez antes de repetirse).
  Cada forma tiene un color/golosina asociado (I→Cuchuflín,
  O→Alfajor, T→Barquillo, S/Z→Chocolate claro/oscuro, J→Dorado,
  L→Rojo Choc) en vez de los colores genéricos de Tetris.
- **Controles**: ← → mover, ↑ rotar (con wall-kick simple de hasta 2
  celdas), ↓ caída suave, ESPACIO caída instantánea. Igual en botones
  táctiles.
- **Pieza especial "Chocolate Dubai"**: ~1 de cada 12 piezas nace
  marcada como especial (brillo verde pistacho). Si la línea que se
  limpia contiene al menos una celda de una pieza especial, se otorgan
  monedas Chocolate Dubai además del puntaje normal — mismo tipo de
  recompensa que el bonus de "Recolecta y Corre", así ambos juegos
  alimentan la misma economía compartida.
- **Dificultad**: la velocidad de caída aumenta con el nivel
  (`nivel = líneas/10 + 1`), igual que el puntaje por línea
  (single/double/triple/tetris × nivel).
- **Panel lateral**: siguiente pieza, puntaje, líneas, nivel, monedas
  ganadas en la partida, y el Matichico elegido animado (idle bob) —
  visible aunque el juego en sí no lo controle, para mantener la
  sensación de "es tu mismo personaje en todos los juegos".

## Tabla de puntajes por juego

Con dos juegos ya activos, `js/storage.js` pasó de un `bestScore`/
`leaderboard` únicos a `bestScores`/`leaderboards` **por juego**
(`{ [gameId]: ... }`, con migración automática del guardado anterior
hacia `recolecta`). El hub muestra el mejor puntaje de cada juego en su
propia tarjeta, y la pantalla de Tabla de Puntajes tiene una pestaña por
juego disponible. Cada juego nuevo solo necesita llamar a
`reportScore(progress, gameId, score)` y `addToLeaderboard(progress,
gameId, nombre, score)` con su propio id.

## Sistema compartido entre juegos

- **Paleta e identidad de marca** (`js/theme.js`, variables CSS en
  `css/style.css`): todo juego/pantalla nuevo debe usar estos colores
  (marrón, verde, rosa, dorado de Matichoc) en vez de inventar una
  paleta propia — es lo que hace que la plataforma se sienta como una
  sola marca y no como juegos sueltos pegados con un mismo menú.
- **Personaje + atuendos** (`js/characters.js`, `js/storage.js`): un
  Matichico y su atuendo equipado se dibujan igual en cualquier juego que
  use `drawCharacter`/`renderCharacterThumb`.
- **Moneda Chocolate Dubai** (`progress.coins`): se gana en cualquier
  juego, se gasta en la Tienda. Cuando existan más juegos, el mismo saldo
  servirá para desbloquearlos desde el hub.
- **Puntajes y ranking por juego** (`progress.bestScores`,
  `progress.leaderboards`): ver sección anterior.
- **Catálogo de juegos** (`js/games-catalog.js`): lista central con
  id/nombre/ícono/estado (`available` | `soon`) que alimenta la grilla del
  hub. Agregar un juego nuevo empieza por sumar su entrada acá.
- **Nunca dos juegos "vivos" a la vez**: `main.js` pausa cualquier
  instancia activa (`pauseForMenu()`) antes de mostrar otra pantalla, así
  ninguna lógica de fondo (temporizadores, física) sigue corriendo fuera
  de vista.

## Consideraciones técnicas para los próximos juegos

- Por ahora los módulos de cada juego viven sueltos en `js/` (por
  ejemplo `game.js`/`levels.js` para "Recolecta y Corre",
  `tetris-game.js`/`tetris-pieces.js` para Tetris) en vez de carpetas
  `js/games/<id>/`. Con 2 juegos todavía es manejable; conviene mover a
  carpetas recién al sumar el tercero, para no reorganizar dos veces.
- Se recomienda seguir el mismo patrón de instancia única + métodos
  (`start()`, `pauseForMenu()`, `startRun(character)`) usado en `Game` y
  `TetrisGame` para que el hub pueda lanzar/pausar cualquier juego de
  forma uniforme, sin necesidad de una clase base abstracta mientras el
  número de juegos sea chico (se evaluará extraer una interfaz común
  cuando el patrón se repita en 3-4 módulos y las diferencias reales
  entre ellos sean claras).
- Mientras un juego esté "soon" en el catálogo, su tarjeta en el hub no
  debe ser interactiva (ver `js/main.js` → `renderGameGrid`).
- Si un juego futuro usa un mapa/camino (como "Recolecta y Corre" o
  "Autos de Chocolate"), reutilizar el mismo patrón de `path` +
  `buildCorridorWalls()` de `js/levels.js` en vez de inventar uno nuevo.
