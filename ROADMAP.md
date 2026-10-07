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
  muestra los 7 modos planeados, para que la dirección del proyecto sea
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

### Etapa 1.6 — Perfiles, retención y tienda ✅

Feedback del usuario tras probar la Etapa 1.5: "no es un juego que la
gente quiera volver a jugar", la tienda no se veía bien, y la "sesión de
cada usuario" no estaba resuelta (todos compartían un solo guardado en
el navegador). Cambios:

- **Perfiles por jugador** (ver "Perfiles / sesión por usuario" más
  abajo): pantalla "¿Quién juega?" al abrir la app, hasta 4 perfiles por
  navegador, cada uno con su propio progreso, monedas y personaje. Se
  recuerda el último perfil usado para que volver a entrar sea
  inmediato (sin fricción).
- **Recompensa diaria y logros** (ver sección dedicada más abajo): una
  razón concreta para volver mañana. Recompensa diaria con racha
  creciente, y 5 logros que pagan monedas la primera vez que se cumplen.
- **Tienda rediseñada**: tarjetas más grandes con degradado y sombra,
  cinta "EQUIPADO" en la esquina, precio como cápsula dorada, y un
  estado "bloqueado" claro (atenuado + candado) cuando no alcanzan las
  monedas, en vez de solo deshabilitar el botón.
- **Personajes más tiernos**: cabeza más grande en proporción al cuerpo
  (más "chibi"), ojos más grandes, y parpadeo periódico para que se
  sientan vivos aunque no se estén moviendo. Sigue siendo dibujo por
  canvas, no arte 3D ilustrado — ver nota honesta sobre el techo de
  fidelidad visual al final de esta sección.
- **Nivel 6 en "Recolecta y Corre"**: "Gran Final Cheer", el gimnasio
  cheer ahora tiene un nivel final propio con 7 vallas saltables
  seguidas (antes el salto obligatorio solo estaba en los niveles 4 y
  5) — el cierre de la campaña es, literalmente, el nivel de más salto.

**Nota honesta sobre el techo visual**: se pidió acercar el estilo al de
apps como *Avatar World* (personajes 3D ilustrados con acabado
profesional). Este proyecto dibuja todo por código con `canvas` 2D — es
liviano y fácil de mantener, pero no puede llegar a esa fidelidad sin
arte ilustrado real (sprites/spritesheets hechos por un diseñador). El
proyecto ya está preparado para ese salto (`drawCharacter`/
`renderCharacterThumb` son la única puerta de entrada al dibujo del
personaje), pero requiere encargar arte, no solo escribir más código.

### Etapa 1.7 — Refresh de marca alineado a matichoc.cl ✅

Se revisó el repo de la web (`Matichoc/matiweb`), de donde sale el botón
"🎮 Matijuego", para que el juego se sienta parte del mismo sitio:

- **Tipografías oficiales**: ahora se usan las fuentes reales de la marca
  (Baby Chipmunk para títulos y números, Adorable Mother Script para
  acentos), copiadas desde la web a `assets/fonts/` y cargadas con
  `@font-face` locales. Reemplazan a Fredoka/Caveat de Google Fonts, así
  que el juego ya no depende de ninguna CDN externa. (Antes se anotó que
  las fuentes de marca "no se podían cargar" por ser de pago; al estar en el
  repo de la web, ya hay archivos propios para usar.)
- **Identidad visual de la web**: fondo crema con el patrón de cacao, tarjetas
  café (`#4B2E2E`) con borde dorado, logo horizontal en insignia blanca (igual
  al header de la web), título rosa con brillo, favicon e íconos oficiales
  (`assets/brand/`, copias sin modificar de los originales).
- **Enlaces de ida y vuelta**: el hub enlaza a `matichoc.cl`, la Tienda y La
  Maestra. La web ya enlaza a Matijuego desde su header, banner y footer.
- **Sprites reales de productos** (`assets/products/`): recortes de las fotos
  reales (alfajores por sabor, bombas, cuchuflí) para usar como texturas y
  cartas; hoy se ven en los mostradores del juego 3D.
- Pantallas de juego con una clase compartida `.game-screen`, para que ningún
  juego nuevo repita el bug de layout en mobile que tuvieron Básquet y
  Porristas.
- Pendiente a propósito: el progreso (monedas, racha) **no se comparte** con
  la web porque viven en orígenes distintos (`matichoc.cl` vs
  `matichoc.github.io`) y `localStorage` no cruza orígenes; unirlos requeriría
  un backend o mover el juego al mismo dominio. Tampoco se prometen premios
  reales: la web ya tiene su propia "racha" con reglas del dueño.

### Etapa 2 — Segundo juego: Tetris de Productos ✅

Ver la sección dedicada más abajo con el diseño completo. En resumen:
tetris clásico (7 piezas, bolsa 7-bag, rotación con wall-kick simple)
vestido con los colores/golosinas de Matichoc, con una pieza especial
"Chocolate Dubai" que da monedas al limpiar una línea que la contenga.
El personaje elegido aparece animado en el panel lateral.

Esta etapa también dejó resuelto el pendiente de puntajes: ver "Tabla de
puntajes por juego" más abajo.

### Etapa 3 — Salto Choco 3D ✅

Saltador vertical infinito en 3D (`js/salto-game.js`). Tu Matichico (modelo 3D
con el atuendo de la tienda) rebota solo y se mueve con ← → / A D o arrastrando
el dedo o el mouse.

- Plataformas de chocolate con glaseado y chispitas: normales, móviles
  (pistacho), que se rompen (chocolate blanco) y con resorte (pompón).
- **Alfajores reales** (fotos de la web) como monedas; barras Matidubai que dan
  monedas Dubai; **jetpack Matidubai** que impulsa unos segundos.
- El cielo cambia con la altura: bosque de cacao, día, atardecer, crepúsculo y
  noche con estrellas (nubes que se oscurecen). Hitos cada 100 m.
- Validado con un piloto automático que sube cientos de metros: la generación
  de plataformas es siempre alcanzable.

### Etapa 4 — Autos de Chocolate 3D ✅

Carrera infinita en 3 carriles (`js/autos-game.js`) con ruta curva, banderines
y arcos con el letrero de Matichoc, curbas rosadas de la marca y árboles de
cacao. Tu Matichico maneja un auto hecho de barra de chocolate (con el logo en
la patente) y mira a la cámara cuando juntas algo.

- Cambio de carril con ← → / A D, deslizar o tocar los lados en el celular.
- Obstáculos (conos, barriles, cajones de la marca); alfajores reales; **nitro
  Matidubai** (más velocidad, invulnerable, FOV más abierto, +monedas Dubai).
- 3 vidas, choque con invulnerabilidad breve; la velocidad sube con la distancia.
- Ciclo de día a noche (mañana, tarde, atardecer, noche con luz de faros).
- Las curvas son una ilusión barata: todo se desplaza lateralmente en función
  de la distancia al cuadrado, sin geometría curva real.

### Etapa 5 — Memoria Matichoc 3D ✅

Juego de parejas en una mesa de feria 3D (`js/memoria-game.js`) con cartas
que giran en 3D y muestran **fotos reales** de alfajores (por sabor), bombas y
cuchuflí. Se juega tocando o haciendo click (raycast).

- 4 niveles: 6, 8, 10 y 12 parejas; el tablero se reordena en vertical para el
  celular.
- Estrellas (menos intentos = más estrellas), tiempo, combo de parejas
  seguidas; 3 estrellas dan monedas Dubai.
- Un Matichico 3D en la mesa festeja las parejas y se apena con los fallos.

### Etapa 6 — Lanzamientos de Básquet ✅

Reemplaza a la idea original de "Penales Choc" (pedido del usuario).
Minijuego corto de tiros libres (`js/basquet-game.js`): el Matichico
lanza al aro una y otra vez contra un reloj de 60 segundos, con
dificultad creciente.

- **Mecánica implementada**: dos barras de temporización secuenciales,
  una de puntería (horizontal) y una de potencia (vertical), cada una
  con un marcador que oscila; ESPACIO/tap fija primero la puntería y
  luego la potencia, y con ambas fijadas la pelota vuela en un arco
  hacia el aro. Encestar requiere que el error de puntería y de potencia
  queden dentro de una "zona verde" que se va achicando con cada tiro
  (más difícil con el correr de la partida); un acierto muy centrado en
  ambas ("limpio") da un bonus de puntaje extra.
- Cada 5° tiro es un aro dorado "Chocolate Dubai": encestarlo da monedas
  además de puntos, con un brillo dorado distintivo en el aro.
- Puntaje y ranking van al mismo sistema compartido (`bestScores`/
  `leaderboards` con id `basquet_tiros`), visibles en el hub y en la
  Tabla de Puntajes.

### Etapa 7 — Saltos de Porristas ✅

Segundo juego nuevo pedido por el usuario (`js/porristas-game.js`).
**Corrección de diseño hecha antes de construirlo**: no es un
endless-runner de obstáculos (esa mecánica ya la cubre el Nivel 6 de
"Recolecta y Corre", ver Etapa 1.6 más arriba); es un juego de
equilibrio tipo cheerleading con una rebotadora (trampolín) que hay que
mover para mantener a la Matichica rebotando.

- **Mecánica implementada**: la Matichica cae con física simple
  (gravedad + arrastre horizontal aleatorio); el jugador mueve la
  rebotadora con ← → o los botones táctiles para que quede debajo de
  ella antes de que toque el "piso". Un rebote logrado la impulsa hacia
  arriba de nuevo y suma puntos (más si el rebote quedó centrado,
  acumulando combo); uno fallado termina la partida al instante — es un
  juego de supervivencia sin límite de tiempo, no contrarreloj.
- Dificultad creciente: el rango de deriva horizontal y la fuerza del
  rebote aumentan con el puntaje, y la rebotadora se va angostando
  (con un piso mínimo de ancho) para que siga siendo posible.
- Pompones flotantes dan puntos extra al tocarlos en pleno vuelo; un
  pompón dorado ocasional también da monedas Chocolate Dubai.
- Comparte el estilo visual del Nivel 6 de "Recolecta y Corre" (gimnasio
  cheer, fondo crema con acento rosa de marca) y usa el mismo
  Matichico/atuendo elegido en el hub. Puntaje y ranking usan el id
  `porristas` en el sistema compartido.

Ambos juegos se probaron con Playwright: flujo completo de tiros/rebotes
con resultados deterministas (fijando los valores de las barras/la
posición de la rebotadora), bonus dorado, combo, colección de pompones,
fin de partida y reporte a mejor puntaje/ranking, botones de silencio y
controles táctiles, además del aislamiento y rebind correcto entre
perfiles (igual que "Recolecta y Corre" y "Tetris de Productos") y
regresión completa del resto de la plataforma. Se agregaron además dos
logros nuevos ("Encestador Estrella" y "Equilibrista Matichoc") para
que también alimenten el sistema de recompensa diaria/logros de la
Etapa 1.6.

### Etapa 8 — Choco Blaster 3D: propuesta en primera persona 🧪

Prototipo jugable pedido para **evaluar el rumbo visual** ("realista" =
como los juegos actuales en 3D y primera persona, no productos
fotorrealistas). Detalle, techo honesto de calidad, alternativas
(Three.js / Godot / Unity / arte 3D encargado) y decisiones pendientes en
[`docs/PROPUESTA-3D.md`](./docs/PROPUESTA-3D.md).

- Three.js r160 vendorizado en `vendor/` (MIT), cargado solo al entrar al
  juego; mundo 3D de la feria (`js/fps-world.js`), malvaviscos enemigos
  (`js/fps-enemies.js`) y lógica (`js/fps-game.js`).
- Sin violencia: se "baña de chocolate" a malvaviscos; oleadas, combos,
  cabezazos, malvavisco dorado que da monedas; mouse+teclado y controles
  táctiles; calidad adaptativa.
- Probado con Playwright (WebGL por software): carga, pointer lock, mouse,
  teclado, disparo a cabeza/cuerpo, daño, recarga, oleadas, fin de partida,
  reintento, ranking, logros y layout móvil.
- Tras evaluar la propuesta ("ahora sí, me gusta"), las Etapas 3-5 (Salto
  Choco, Autos de Chocolate, Memoria Matichoc) se construyeron también en 3D
  sobre una base compartida (`js/three-kit.js`, clase `Game3D`) y un Matichico
  3D reutilizable (`js/matichico3d.js`).

### Etapa 10 — Todos los juegos en 3D ✅

Pedido del dueño: "todos los juegos deben ser en 3D, realistas, con una imagen
adictiva, tipo Roblox / Fortnite". Se rehicieron en 3D los cuatro juegos que
seguían en 2D, **manteniendo sus reglas, ids, rankings y logros**:

- **Recolecta y Corre** (`js/recolecta-game.js`): los 6 niveles de
  `js/levels.js` en 3D (pasto con setos, cancha de básquet con aros, gimnasio),
  cámara de seguimiento, vallas, conos móviles, bandera con haz dorado, alfajores
  reales como golosinas y bonus Matidubai.
- **Tetris de Productos** (`js/tetris3d-game.js`): vitrina de cristal con marco
  dorado, cubos de chocolate brillantes, sombra fantasma, estallido de líneas,
  siguiente pieza en pedestal y Matichico que celebra. Gestos táctiles.
- **Lanzamientos de Básquet** (`js/basquet3d-game.js`): cámara tras tu Matichico,
  gimnasio con hinchada, marcador colgante, barras de puntería y potencia,
  balón con física (aro, tablero y piso), red animada y aro dorado cada 5 tiros.
- **Saltos de Porristas** (`js/porristas3d-game.js`): escenario con foco y
  cortina, rebotadora con resortes, volteretas por combo y pompones.

Mejoras compartidas: bloom + corrección de color (`LOOK` en `js/three-kit.js`,
con degradación automática en equipos lentos), convención `data-action` para
los botones de cada pantalla en `js/main.js` y lanzador único `launchOrResume3d`.
Se eliminaron los motores 2D (`game.js`, `tetris-game.js`, `basquet-game.js`,
`porristas-game.js`). Para depurar, abrir el sitio con `?debug3d` expone
`window.__g3d`.

> Límite honesto: es 3D estilizado (tipo Fall Guys / Roblox) que corre en
> cualquier navegador sin instalar nada; no iguala el fotorrealismo de
> Fortnite o Call of Duty, que requiere motores nativos y equipos de arte.

### Etapa 11 — Parkour Choco 3D (estilo Roblox) ✅

Pedido del dueño: un juego tipo Roblox para ir capturando cosas con el personaje
haciendo parkour, con ropa y brillos (`js/parkour-game.js`):

- 6 etapas (Pradera, Camino de Caramelo, Nubes Saltarinas, Molinos de Cacao,
  Noche Neón, Cumbre Matichoc) con plataformas de tachas y bordes de neón,
  móviles, que se rompen, que parpadean, trampolines y molinos giratorios.
- Física propia (cápsula contra cajas), doble salto, plataformas móviles que
  arrastran, checkpoints con bandera, río de chocolate abajo (caer = volver al
  checkpoint con 10 puntos menos).
- Se juntan alfajores (+10) y barras Matidubai (+3 monedas Dubai, +50). Al avanzar
  se desbloquean accesorios sobre el atuendo de la tienda: capa, gafas
  brillantes y corona dorada, con estela de chispas por etapa.
- Controles: WASD/flechas + Espacio (doble salto) + cámara con mouse o Q/E; en
  celular, joystick y botón de salto.
- Puntaje por alfajores, barras, etapas, rapidez y caídas; logro "Parkourista".
- Verificado con un bot que recorre las 6 etapas hasta la meta sin caídas.

### Etapa 9 — Crea tu Chocolate 3D ✅

Pedido del dueño: un juego donde el usuario **crea su propio chocolate**
(`js/creador-game.js`, datos en `js/creador-data.js`, modelos en
`js/creador-3d.js`). Asistente de 6 pasos con vista 3D en vivo (se puede girar
arrastrando) y tu Matichico animando desde la mesa:

1. **Producto**: barra, alfajor, cuchuflí, bomba o cono (inspirados en el
   catálogo real de la web).
2. **Chocolate** (leche, oscuro, blanco, rosa) y 3. **sabor/relleno** (10
   sabores, entre ellos los alfajores reales de la web).
4. **Toppings** (hasta 3): pistacho, kataifi, almendras, coco, chispas,
   frambuesa liofilizada, hojuelas doradas.
5. **Envoltorio**: sin envoltorio, papel de colores, bolsita con cinta o cajita,
   con 6 colores (como los papeles de los alfajores reales).
6. **Etiqueta**: nombre, "para quién" y un dibujo; el sticker circular lleva el
   logo de Matichoc en el centro y el nombre en el anillo, como las etiquetas
   reales.

- **Puntaje de creatividad** por maridajes que combinan (p. ej. oscuro +
  frambuesa), toppings que acompañan, nombre, envoltorio y dedicatoria; 1 a 5
  estrellas.
- **Mis creaciones**: galería por perfil (hasta 12) guardada en
  `progress.creations`; se pueden reabrir, editar y borrar.
- **Reto del día** (igual para todos los perfiles, calculado por fecha): +5
  monedas Dubai al cumplirlo; +2 monedas por cada receta nueva guardada.
- **Pedir algo parecido por WhatsApp**: abre `wa.me` con un mensaje que solo
  describe la creación, sin precios ni promesas. El número es el público que ya
  usa matichoc.cl; conviene que el dueño confirme que quiere recibir estos
  mensajes y qué respuesta tipo darles.
- Los nombres de producto/sabor son de juego: no prometen disponibilidad. Las
  etiquetas del juego no incluyen datos legales (resolución sanitaria, etc.).

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

## Perfiles / sesión por usuario

`js/profiles.js` guarda una lista liviana de perfiles (`{ id, name,
characterId }`) bajo una clave de `localStorage` separada del progreso
en sí. Cada perfil tiene su propio progreso completo, guardado con
`storageKeyForProfile(id)` (`js/storage.js`) — así dos personas en el
mismo navegador no se pisan el nombre, las monedas ni los puntajes.

- Al abrir la app se recuerda el último perfil activo
  (`getLastActiveProfileId`) y se entra directo a su hub; si no hay
  ninguno (primera vez, o se acaba de eliminar el último) se muestra la
  pantalla "¿Quién juega?".
- Máximo 4 perfiles por navegador (`MAX_PROFILES`); se puede eliminar
  uno desde su tarjeta (con confirmación, porque borra su progreso).
- El progreso guardado antes de que existieran los perfiles se migra
  automáticamente al primer perfil ("Jugador 1") la primera vez que se
  abre la app tras esta actualización — nadie pierde su avance.
- `Game`/`TetrisGame` exponen `startRun(character, progress)`: al elegir
  un juego desde el hub siempre se le vuelve a "atar" (rebind) el
  personaje y el progreso activos, así una instancia ya creada para el
  perfil A no sigue escribiendo por error en su guardado cuando el
  perfil B se pone a jugar.

## Recompensa diaria y logros

Pensados como el gancho de "por qué volver mañana":

- **Recompensa diaria** (`canClaimDailyReward`/`claimDailyReward` en
  `js/storage.js`): una vez por día calendario, botón en el hub que da
  monedas Chocolate Dubai; la racha sube si se reclama en días
  consecutivos y baja a 1 si se corta, con la recompensa creciendo con
  la racha hasta un tope (10 → 50 monedas).
- **Logros** (`js/achievements.js`): 5 objetivos simples que se
  verifican contra el progreso ya guardado (primera partida, puntaje en
  cada juego, completar "Recolecta y Corre", monedas totales ganadas
  históricamente vía `stats.totalCoinsEarned`), cada uno reclamable una
  sola vez por su propia recompensa en monedas. Agregar un logro nuevo
  es sumar una entrada a `ACHIEVEMENTS` con su función `isDone(progress)`
  — no requiere tocar la lógica de ningún juego.
- Ambos usan `earnCoins(progress, monto)` en vez de sumar directo a
  `progress.coins`, para que `stats.totalCoinsEarned` quede correcto sin
  importar de qué juego o mecánica vino la moneda (necesario para el
  logro "Ahorrista de Cacao").

## Tabla de puntajes por juego

Con varios juegos ya activos, `js/storage.js` pasó de un `bestScore`/
`leaderboard` únicos a `bestScores`/`leaderboards` **por juego**
(`{ [gameId]: ... }`, con migración automática del guardado anterior
hacia `recolecta`). El hub muestra el mejor puntaje de cada juego en su
propia tarjeta, y la pantalla de Tabla de Puntajes tiene una pestaña por
juego disponible. Cada juego nuevo solo necesita llamar a
`reportScore(progress, gameId, score)` y `addToLeaderboard(progress,
gameId, nombre, score)` con su propio id.

## Sistema compartido entre juegos

- **Perfiles** (`js/profiles.js`): todo progreso vive dentro de un
  perfil (ver sección dedicada arriba); ningún juego nuevo debe leer o
  guardar directo en una clave fija de `localStorage`, siempre a través
  de `loadProgress(profileId)`/`saveProgress(progress)`.
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

- Los 9 juegos comparten el patrón de instancia única + métodos
  (`startRun(character, progress)`, `beginPlaying()`, `retry()`,
  `pauseForMenu()`). Los 3D heredan de `Game3D` (`js/three-kit.js`) y se
  registran en `GAMES_3D` de `js/main.js`; los ids del DOM siguen la
  convención `<prefijo>-canvas`, `-hud-<nombre>`, `-overlay-<nombre>` y botones
  con `data-action` (`begin`, `next`, `retry`, `restart`, `menu`).
- Mientras un juego esté "soon" en el catálogo, su tarjeta en el hub no
  debe ser interactiva (ver `js/main.js` → `renderGameGrid`).
- Si un juego futuro usa un mapa/camino (como "Recolecta y Corre" o
  "Autos de Chocolate"), reutilizar el mismo patrón de `path` +
  `buildCorridorWalls()` de `js/levels.js` en vez de inventar uno nuevo.
