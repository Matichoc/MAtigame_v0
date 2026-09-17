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
personaje, se ve el progreso (mejor puntaje, monedas) y se elige a qué
juego jugar. Cada juego es independiente por dentro, pero comparte la
misma "cáscara" (hub, tienda, tabla de puntajes, personaje).

## Etapas

### Etapa 0 — v0: un solo juego ✅ (completada)

"Recolecta y Corre": recorrer canchas temáticas (fútbol, básquet, cheer)
juntando golosinas contrarreloj, con misiones, obstáculos, salto y un
bonus especial (Chocolate Dubai). Selección de personaje y tienda de
atuendos.

### Etapa 1 — Hub central y navegación ✅ (esta entrega)

Antes de sumar más juegos, se ordenó la base para que la plataforma sea
usable:

- El menú pasó de ser una simple pantalla de "elige personaje" a un
  **hub** con estadísticas visibles (mejor puntaje acumulado, monedas) y
  una sección "Elige un juego" que ya muestra los 6 modos planeados (1
  jugable, 5 marcados "Próximamente") para que la dirección del proyecto
  sea visible desde ya.
- Botón **🏠 Volver al menú** disponible durante la partida (HUD) y en las
  pantallas de fin de nivel (perdiste / campeón), para poder ir a la
  Tienda o iniciar otra partida sin recargar la página.
- El mejor puntaje ahora se actualiza también si pierdes o si vuelves al
  menú a mitad de partida (antes solo se guardaba al ganar), para que el
  hub siempre refleje tu mejor intento real.
- Internamente, el motor de "Recolecta y Corre" (`Game`) se instancia una
  sola vez y se reutiliza entre partidas (`game.startRun(personaje)`),
  evitando duplicar listeners de teclado/controles táctiles cada vez que
  se vuelve a jugar.

### Etapa 2 — Segundo juego: Salto Choco 🔜

Plataformero vertical simple (estilo "Icy Tower" / POW): el Matichico va
subiendo saltando entre plataformas que aparecen cada vez más espaciadas
y estrechas; si te caes de la pantalla, pierdes. Ideal para reutilizar la
mecánica de salto ya construida en la Etapa 0.

- Mecánica: scroll vertical infinito, plataformas generadas
  proceduralmente, dificultad creciente por altura.
- Coleccionables: golosinas que dan puntos extra; el Chocolate Dubai
  aparece como plataforma dorada especial.
- Meta de la etapa: validar que el patrón "un juego = un módulo en
  `js/games/<id>/`" funciona reutilizando `characters.js`, `storage.js` y
  `audio.js` sin duplicar código.

### Etapa 3 — Autos de Chocolate 🔜

Carrera top-down: el Matichico maneja un autito de chocolate esquivando
obstáculos (conos, otros autos) y recolectando boosts de velocidad, en
pistas basadas en las mismas canchas/temas ya existentes.

- Mecánica: control de aceleración/dirección simple (arriba/abajo para
  acelerar-frenar, izquierda/derecha para carriles), distancia o tiempo
  como objetivo.
- Coleccionables: golosinas = puntos; Chocolate Dubai = nitro temporal.

### Etapa 4 — Tetris de Productos 🔜

Puzzle de bloques cayendo, con las golosinas del juego (chocolate,
alfajor, cuchuflín, barquillo) como piezas en vez de tetrominós clásicos,
u ordenados en piezas tipo tetromino con su textura.

- Mecánica: caída de piezas, rotación, líneas completas que se limpian,
  velocidad creciente.
- Vincula con el resto vía puntaje y una aparición ocasional de una pieza
  "Chocolate Dubai" que limpia una fila entera al colocarla.

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

## Sistema compartido entre juegos

Ya construido (Etapa 0-1), y pensado para servir a todos los modos
futuros sin cambios:

- **Personaje + atuendos** (`js/characters.js`, `js/storage.js`): un
  Matichico y su atuendo equipado se dibujan igual en cualquier juego que
  use `drawCharacter`/`renderCharacterThumb`.
- **Moneda Chocolate Dubai** (`progress.coins`): se gana en cualquier
  juego, se gasta en la Tienda. Cuando existan más juegos, el mismo saldo
  servirá para desbloquearlos desde el hub.
- **Tabla de puntajes** (`progress.leaderboard`): hoy es un ranking único
  por puntaje total. Al sumar más juegos hay que decidir si conviene un
  ranking por juego además del global (pendiente de definir en la
  Etapa 2).
- **Catálogo de juegos** (`js/games-catalog.js`): lista central con
  id/nombre/ícono/estado (`available` | `soon`) que alimenta la grilla del
  hub. Agregar un juego nuevo empieza por sumar su entrada acá.

## Consideraciones técnicas para los próximos juegos

- Cada nuevo juego debería vivir en su propia carpeta (`js/games/<id>/`)
  con su propio `levels`/`game`/etc., análogos a los módulos actuales de
  "Recolecta y Corre", para no mezclar lógica entre modos.
- Se recomienda seguir el mismo patrón de instancia única + métodos
  (`start()`, `pauseForMenu()`, `startRun(character)`) usado en `Game`
  para que el hub pueda lanzar/pausar cualquier juego de forma uniforme,
  sin necesidad de una clase base abstracta mientras solo haya 1-2 juegos
  (se evaluará extraer una interfaz común recién cuando el patrón se
  repita en 2-3 módulos y las diferencias reales entre ellos sean claras).
- Mientras un juego esté "soon" en el catálogo, su tarjeta en el hub no
  debe ser interactiva (ver `js/main.js` → `renderGameGrid`).
