> **Este juego ahora se publica en https://matichoc.cl/matijuego/** y se edita en el repositorio
> [`Matichoc/matiweb`](https://github.com/Matichoc/matiweb), carpeta `matijuego/`. Esta página solo
> redirige a la nueva dirección (`index.html` y `404.html`); el código de abajo queda como respaldo y
> ya no se publica desde aquí (el `index.html` original está en el historial, commit `3f4d513`). No hagas cambios en este repositorio: no llegarían al sitio.

# MAtigame_v0 — Matichoc: La Aventura del Cacao

Arcade web de Matichoc: cada persona elige su perfil, su Matichico (Matichico, Chocolatina, Matichico Baller o Chocolatina Cheer: los personajes de matichoc.cl) y lo personaliza con
atuendos comprados en la tienda, para jugar cualquiera de los minijuegos
disponibles con ese mismo personaje. **Todos los juegos son 3D** (Three.js; 15 entradas en el menú de la app, ver `js/games-catalog.js`),
con brillo (bloom), música generada en vivo, color vivo y un Matichico 3D que cambia con la tienda:
**Parkour Choco** (estilo Roblox: **Mundo infinito** con 10 ambientes, poderes y récord de metros, o la Aventura de 7 etapas con líneas rojas que hacen perder, paredes, una casa para escalar y una etapa "Parkour Troll"),
**Recolecta y Corre** (20 niveles 3D con guardias, cintas transportadoras, impulso y estrellas),
**Bloques de Productos** (pieza guardada, cubos de poder, combos y 20 niveles),
**Lanzamientos de Básquet** (5 posiciones, rachas, modo «en llamas» y 20 niveles),
**Saltos de Porristas** (viento, red de seguridad, rebotadora gigante y 20 niveles), **Salto Choco** (enemigos, vidas, 4 zonas, infinito y 20 misiones),
**Autos de Chocolate** (rivales, rampas, charcos, poderes, infinito y 20 misiones), **Memoria Matichoc** (pareja dorada, cartas traviesas y 20 niveles),
**Juegos que se canjean con Matipuntos** (se desbloquean desde el menú al juntar suficientes): **Fútbol Choco** (penales, tiros libres con efecto y atajapenales, 20 niveles cada modo, 4 copas con rivales),
**Choco Match** (3 en línea con los productos reales de Matichoc, piezas especiales y jefes, 20 niveles), **Aventura Choco** (plataformas tipo Mario por 5 mundos con jefes, 20 niveles)
y **Ciudad Choco** (mundo abierto para pasear a pie o en auto con 8 misiones tranquilas: pintar una reja, juntar manzanas, ayudar a una abuelita…),
**Choco Blaster** (primera persona, ver
[`docs/PROPUESTA-3D.md`](./docs/PROPUESTA-3D.md)) y **Crea tu Chocolate**
(configurador 3D: elige producto, sabor, toppings, envoltorio y diseña tu
etiqueta; puedes pedir algo parecido por WhatsApp).

Es una v0 intencionalmente simple: HTML + CSS + JavaScript puro (sin frameworks
ni build step), pensada como base fácil de evolucionar. El plan es que esto
crezca hasta ser una pequeña **plataforma de arcade** con varios modos de
juego que comparten personaje, vestuario y Matipuntos — ver
[`ROADMAP.md`](./ROADMAP.md) para el plan por etapas y los 7 juegos
planeados (el hub ya muestra los 7, marcando cuáles están disponibles).

## Cómo jugar

1. Al entrar, elige tu **perfil** (o crea uno nuevo) en "¿Quién juega?" —
   cada perfil guarda su propio progreso, así varias personas pueden usar
   el mismo dispositivo sin mezclar su avance. La próxima vez que abras la
   app entra directo a tu hub.
2. En el **hub**, escribe tu nombre (para la tabla de puntajes) y elige uno
   de los 4 Matichicos. Ese personaje (y sus atuendos) se usa en todos los
   juegos de tu perfil.
3. Reclama tu **🎁 Recompensa diaria** (una vez por día, con racha) y revisa
   tus **🏅 Logros** — ambos dan Matipuntos extra.
4. Elige un juego de la grilla: **Recolecta y Corre**, **Bloques de
   Productos**, **Lanzamientos de Básquet** y **Saltos de Porristas**
   están disponibles; el resto son los próximos modos del
   [`ROADMAP.md`](./ROADMAP.md). Cada tarjeta muestra tu mejor puntaje en
   ese juego.
5. En **Recolecta y Corre**: sigue el camino marcado en cada cancha,
   recolectando golosinas (chocolate, alfajor, cuchuflín, barquillo) antes
   de que se acabe el tiempo, esquivando o saltando (ESPACIO) los
   obstáculos que aparecen sobre el camino. Muévete con las flechas / WASD
   (o el D-pad táctil en móvil). El Nivel 6 (Gran Final Cheer) es puro
   salto: siete vallas seguidas hasta la meta.
6. En **Bloques de Productos**: encaja las piezas con ← → ↑ (rotar) ↓
   (bajar) y ESPACIO (caída instantánea) para completar líneas. Las piezas
   brillantes son Chocolate Dubai: dan Matipuntos extra al limpiar su línea.
7. En **Lanzamientos de Básquet**: presiona ESPACIO/tap para fijar la
   barra de puntería, y de nuevo para fijar la de potencia — con ambas
   bien centradas encestas. Tienes 60 segundos y la dificultad sube con
   cada tiro; cada 5° tiro es un aro dorado que da Matipuntos extra.
8. En **Saltos de Porristas**: mueve la rebotadora con ← → (o los botones
   táctiles) para que quede debajo de tu Matichica antes de que caiga.
   Rebotar centrado suma combo, los pompones flotantes dan puntos extra;
   si se cae fuera de la rebotadora se acaba la partida.
9. En cualquier juego, cada cierto tiempo/con cierta probabilidad aparece
   un **Chocolate Dubai**: da Matipuntos persistentes entre partidas y entre
   juegos.
10. Usa esos Matipuntos en **Vestuario y Tienda** (~80 objetos: peinados, colores de
    pelo, caras, sombreros, anteojos, ropa, zapatos, capas, alas, estelas…) y pruébalos
    en 3D antes de comprar, para cualquiera de tus Matichicos. Puedes ir a la Tienda o
    volver al hub en cualquier momento con el botón 🏠 del HUD, y cambiar
    de perfil con el botón "Cambiar" junto a tu nombre.
11. Completa las canchas de Recolecta y Corre (8 de base y 12 de revancha: ¡20 niveles!) para ser Campeón Matichoc,
    o consigue el mejor puntaje posible en cualquier otro juego — todos
    quedan en la **Tabla de Puntajes**, con una pestaña por juego.

Todo el progreso (por perfil: personaje, objetos comprados, Matipuntos,
mejor puntaje, racha diaria, logros y tabla de puntajes por juego) se
guarda en el navegador (`localStorage`), sin necesidad de backend.

Toda la interfaz usa la paleta oficial de marca Matichoc (marrón, verde,
rosa y dorado) en vez de colores genéricos — ver `js/theme.js` y las
variables de `css/style.css`.

## Estructura del proyecto

```
index.html          Pantallas (perfiles, hub, tienda, puntajes, logros, juegos)
assets/brand/        Logos, patrón e íconos oficiales (copiados de matichoc.cl)
assets/fonts/        Baby Chipmunk y Adorable Mother Script (fuentes de marca; SIN comprobante de licencia comercial: solo la web las usa por defecto, ver docs/AUDITORIA-PREPUBLICACION.md)
assets/fonts-libres/ Fredoka y Dancing Script (SIL OFL): las que usa la app por defecto (MATIJUEGO_FONTS=marca|libres cambia la elección)
assets/products/     Recortes de fotos reales de productos
assets/games/        Capturas de cada juego (imagen de sus tarjetas en el menú)
vendor/              Three.js (MIT) y sus efectos de postprocesado
docs/                Propuestas y documentos de diseño
css/style.css        Estilos, paleta de marca y controles táctiles
js/theme.js           Paleta de marca Matichoc para usar en canvas
js/profiles.js        Perfiles de jugador (sesión por usuario en el navegador)
js/achievements.js    Definición de logros y sus condiciones
js/characters.js      Definición/dibujo procedural de los Matichicos y atuendos
js/games-catalog.js  Catálogo de modos de juego (disponibles y "próximamente")
js/levels.js          Camino/corredor, obstáculos, coleccionables y misiones
js/audio.js           Efectos de sonido generados con Web Audio API
js/parkour-game.js    Parkour Choco 3D (obby estilo Roblox: Aventura de 7 etapas, líneas rojas, paredes, casa y etapa troll)
js/events.js          Eventos de temporada (fichas, decoración, objetos exclusivos)
js/house-data.js, js/house3d.js  Mi Casa (cuarto decorable)
js/wardrobe-pets.js   Mascotas flotantes del Vestuario
js/town-game.js       Pueblo Matichoc (mundo abierto con vecinos, tiendas y arcade)
js/town-fun.js        Pueblo: actividades del día, trampolines, circuito, tesoros, parkour (Torre de Cacao y Escalera de Nubes) y casitas con puertas de juegos
js/town-puzzles.js    Pueblo: cuadro de los juegos chicos (El Gato, Mini Sudoku 4×4, Cachipún); la lógica pura está en js/puzzles-logic.js
js/progression.js     XP, niveles, misiones diarias y álbum de figuritas
js/parkour-infinite.js Parkour: Mundo infinito (generador procedural, poderes, vidas, récord)
js/wardrobe-data.js   Catálogo del Vestuario (~80 objetos, rarezas y precios en Matipuntos)
js/wardrobe3d.js      Cómo se ve cada objeto sobre el Matichico 3D
js/recolecta-game.js  Recolecta y Corre 3D (usa los niveles de js/levels.js)
js/tetris-pieces.js  Formas y colores de "Bloques de Productos"
js/tetris3d-game.js  Bloques de Productos 3D
js/basquet3d-game.js  Lanzamientos de Básquet 3D (física del balón, red, hinchada)
js/porristas3d-game.js  Saltos de Porristas 3D
js/lobby3d.js         Escenario 3D del menú principal (tu Matichico sobre un pedestal)
js/three-kit.js       Base 3D compartida (Game3D, bloom, partículas, popups)
js/matichico3d.js     Matichico en 3D con atuendo de la tienda
js/salto-game.js      Salto Choco 3D
js/autos-game.js      Autos de Chocolate 3D
js/memoria-game.js    Memoria Matichoc 3D
js/futbol-game.js     Fútbol Choco 3D (penales, tiros libres con efecto y atajapenales)
js/dulces-game.js     Choco Match 3D (3 en línea con productos Matichoc y jefes)
js/ciudad-game.js     Ciudad Choco 3D (mundo abierto con auto, mapa y misiones; las ya hechas vuelven cada día)
js/online.js          Ranking y monitoreo del creador (apagado hasta llenar js/online-config.js; ver docs/RANKING.md)
admin/ranking.html    Panel del creador: quién juega y ranking (solo apodos)
js/aventura-game.js   Aventura Choco 3D (plataformas por mundos; los niveles se arman con una semilla)
js/unlocks.js         Canje de juegos con Matipuntos (precio en una sola línea)
js/demo.js            Modo demo de la web (apagado por ahora; ver ROADMAP, etapa 11m)
js/creador-game.js    Crea tu Chocolate: asistente, galería, puntaje
js/creador-data.js    Opciones, maridajes, reto del día y etiqueta
js/creador-3d.js      Modelos 3D de los productos, toppings y envoltorios
js/fps-game.js        Motor de "Choco Blaster 3D" (primera persona, Three.js)
js/fps-world.js       Mundo 3D: feria de Matichoc
js/fps-enemies.js     Malvaviscos enemigos del juego 3D
js/storage.js         Progreso persistente por perfil (Matipuntos, vestuario, ranking, logros)
js/main.js            Perfiles, hub, tienda, puntajes y navegación entre juegos
.github/workflows/    Despliegue automático a GitHub Pages
ROADMAP.md            Plan por etapas hacia la plataforma multi-juego
```

Los personajes se dibujan con `canvas` (sin imágenes externas), lo que
mantiene el proyecto liviano y fácil de desplegar. Se pueden reemplazar por
sprites o spritesheets ilustrados más adelante sin tocar la lógica del juego.

## Ejecutar en local

La página sale de una plantilla (`app/index.template.html`) y se arma en dos variantes con `scripts/build.mjs`
(la `index.html` de la raíz solo redirige a matichoc.cl/matijuego). Requiere Node 22:

```bash
npm ci
npm run build:web                      # web-www/  (versión web completa)
python3 -m http.server -d web-www 8080 # abrir http://localhost:8080
# variante app (la que se empaqueta en Android): npm run build:app && npm run verify:app  → app-www/
```

No abras `index.html` con doble clic: los módulos ES y las rutas necesitan un servidor.
Pruebas de navegador (Playwright + Chromium, sin dependencias nuevas en el proyecto): ver `scripts/qa/` y
`docs/AUDITORIA-PREPUBLICACION.md`.

## Despliegue

- **Web (producción)**: `MATIJUEGO_DEMO=1 node scripts/deploy-matiweb.mjs <ruta-a-matiweb>` arma `web-www/` y la copia a
  `matijuego/` del repo `Matichoc/matiweb` (publica matichoc.cl/matijuego, incluida su página de política de privacidad
  `matijuego/privacy.html`). El despliegue lo hace quien hace merge en matiweb.
- **GitHub Pages de este repo**: `.github/workflows/deploy-pages.yml` publica **toda la raíz** del repositorio en cada push a
  `main` (no es la web de producción: la raíz solo redirige a matichoc.cl).
- **Android**: workflow "Compilar app Android" (`.github/workflows/android.yml`); pasos en `docs/PLAY-STORE.md`.

## Próximos pasos sugeridos

Ver [`ROADMAP.md`](./ROADMAP.md) para el plan detallado por etapas. En
resumen, lo siguiente:

- Reemplazar los sprites procedurales por ilustraciones/spritesheets finales
  (el techo de fidelidad visual actual está explicado en el ROADMAP).
- Mover cada juego a su propia carpeta `js/games/<id>/` (ver ROADMAP.md →
  Consideraciones técnicas: ya hay 4 módulos con el mismo patrón, así que
  el umbral para reorganizar ya se cumplió).
- Tabla de puntajes online (backend) para competir entre dispositivos.


## App de Android (Google Play)

El juego también se empaqueta como app de Android (versión **sin enlaces a matichoc.cl**, con el crédito
"Un juego promovido por Matichoc"). Todo está explicado, con los pasos que faltan, en
[`docs/PLAY-STORE.md`](./docs/PLAY-STORE.md). Los textos y el material gráfico de la ficha están en `store/`.
