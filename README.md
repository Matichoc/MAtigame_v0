# MAtigame_v0 — Matichoc: La Aventura del Cacao

Arcade web de Matichoc: elige a tu Matichico (Choco Capitán, Choco Estrella,
Choco Baller o Choco Cheer), personalízalo con atuendos comprados en la
tienda, y juega cualquiera de los minijuegos disponibles con ese mismo
personaje: **Recolecta y Corre** (recorrer 5 canchas por un camino guiado
recolectando golosinas) y **Tetris de Productos** (encajar golosinas
cayendo).

Es una v0 intencionalmente simple: HTML + CSS + JavaScript puro (sin frameworks
ni build step), pensada como base fácil de evolucionar. El plan es que esto
crezca hasta ser una pequeña **plataforma de arcade** con varios modos de
juego que comparten personaje, atuendos y monedas — ver
[`ROADMAP.md`](./ROADMAP.md) para el plan por etapas y los 6 juegos
planeados (el hub ya muestra los 6, marcando cuáles están disponibles).

## Cómo jugar

1. En el **hub** (pantalla de inicio), escribe tu nombre y elige uno de los
   4 Matichicos. Ese personaje (y sus atuendos) se usa en todos los juegos.
2. Elige un juego de la grilla: **Recolecta y Corre** y **Tetris de
   Productos** están disponibles; el resto son los próximos modos del
   [`ROADMAP.md`](./ROADMAP.md). Cada tarjeta muestra tu mejor puntaje en
   ese juego.
3. En **Recolecta y Corre**: sigue el camino marcado en cada cancha,
   recolectando golosinas (chocolate, alfajor, cuchuflín, barquillo) antes
   de que se acabe el tiempo, esquivando o saltando (ESPACIO) los
   obstáculos que aparecen sobre el camino. Muévete con las flechas / WASD
   (o el D-pad táctil en móvil).
4. En **Tetris de Productos**: encaja las piezas con ← → ↑ (rotar) ↓
   (bajar) y ESPACIO (caída instantánea) para completar líneas. Las piezas
   brillantes son Chocolate Dubai: dan monedas extra al limpiar su línea.
5. En cualquier juego, cada cierto tiempo/con cierta probabilidad aparece
   un **Chocolate Dubai**: da monedas persistentes entre partidas y entre
   juegos.
6. Usa esas monedas en la **Tienda** para comprar atuendos (recolores de
   uniforme) para cualquiera de tus Matichicos. Puedes ir a la Tienda o
   volver al hub en cualquier momento con el botón 🏠 del HUD.
7. Completa las 5 canchas de Recolecta y Corre para ser Campeón Matichoc, o
   consigue el mejor puntaje posible en Tetris — ambos quedan en la
   **Tabla de Puntajes**, con una pestaña por juego.

Todo el progreso (personaje, atuendos comprados, monedas, mejor puntaje y
tabla de puntajes por juego) se guarda en el navegador (`localStorage`),
sin necesidad de backend.

Toda la interfaz usa la paleta oficial de marca Matichoc (marrón, verde,
rosa y dorado) en vez de colores genéricos — ver `js/theme.js` y las
variables de `css/style.css`.

## Estructura del proyecto

```
index.html          Pantallas (hub, tienda, puntajes, HUD y juegos)
favicon.svg          Ícono de marca (vaina de cacao + chocolate)
css/style.css        Estilos, paleta de marca y controles táctiles
js/theme.js           Paleta de marca Matichoc para usar en canvas
js/characters.js      Definición/dibujo procedural de los Matichicos y atuendos
js/games-catalog.js  Catálogo de modos de juego (disponibles y "próximamente")
js/levels.js          Camino/corredor, obstáculos, coleccionables y misiones
js/audio.js           Efectos de sonido generados con Web Audio API
js/game.js            Motor de "Recolecta y Corre": loop, colisiones, HUD
js/tetris-pieces.js  Formas y colores de "Tetris de Productos"
js/tetris-game.js    Motor de "Tetris de Productos": tablero, piezas, HUD
js/storage.js         Progreso persistente (personaje, monedas, atuendos, ranking por juego)
js/main.js            Hub, tienda, tabla de puntajes y navegación entre juegos
.github/workflows/    Despliegue automático a GitHub Pages
ROADMAP.md            Plan por etapas hacia la plataforma multi-juego
```

Los personajes se dibujan con `canvas` (sin imágenes externas), lo que
mantiene el proyecto liviano y fácil de desplegar. Se pueden reemplazar por
sprites o spritesheets ilustrados más adelante sin tocar la lógica del juego.

## Ejecutar en local

No requiere instalación. Basta con servir la carpeta como sitio estático,
por ejemplo:

```bash
python3 -m http.server 8080
# abrir http://localhost:8080
```

(Abrir `index.html` directamente con doble clic también funciona en la
mayoría de navegadores, aunque un servidor local evita restricciones de
módulos ES en algunos casos.)

## Despliegue

El repo incluye un workflow de GitHub Actions
(`.github/workflows/deploy-pages.yml`) que publica el sitio en GitHub Pages
en cada push a `main`. Para activarlo:

1. Ve a **Settings → Pages** del repositorio.
2. En "Build and deployment", selecciona **GitHub Actions** como fuente.
3. Haz push a `main`: el workflow construye y publica automáticamente.

También puedes desplegarlo en cualquier hosting estático (Netlify, Vercel,
Cloudflare Pages, etc.) apuntando a la raíz del repositorio.

## Próximos pasos sugeridos

Ver [`ROADMAP.md`](./ROADMAP.md) para el plan detallado por etapas. En
resumen, lo siguiente:

- Reemplazar los sprites procedurales por ilustraciones/spritesheets finales.
- Construir el tercer juego del catálogo (Salto Choco).
- Mover cada juego a su propia carpeta `js/games/<id>/` cuando se sume el
  tercero (ver ROADMAP.md → Consideraciones técnicas).
- Tabla de puntajes online (backend) para competir entre dispositivos.
