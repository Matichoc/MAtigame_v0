# MAtigame_v0 — Matichoc: La Aventura del Cacao

Arcade web de Matichoc: cada persona elige su perfil, su Matichico (Choco
Capitán, Choco Estrella, Choco Baller o Choco Cheer) y lo personaliza con
atuendos comprados en la tienda, para jugar cualquiera de los minijuegos
disponibles con ese mismo personaje: **Recolecta y Corre** (recorrer 6
canchas por un camino guiado recolectando golosinas) y **Tetris de
Productos** (encajar golosinas cayendo).

Es una v0 intencionalmente simple: HTML + CSS + JavaScript puro (sin frameworks
ni build step), pensada como base fácil de evolucionar. El plan es que esto
crezca hasta ser una pequeña **plataforma de arcade** con varios modos de
juego que comparten personaje, atuendos y monedas — ver
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
   tus **🏅 Logros** — ambos dan monedas Chocolate Dubai extra.
4. Elige un juego de la grilla: **Recolecta y Corre** y **Tetris de
   Productos** están disponibles; el resto son los próximos modos del
   [`ROADMAP.md`](./ROADMAP.md). Cada tarjeta muestra tu mejor puntaje en
   ese juego.
5. En **Recolecta y Corre**: sigue el camino marcado en cada cancha,
   recolectando golosinas (chocolate, alfajor, cuchuflín, barquillo) antes
   de que se acabe el tiempo, esquivando o saltando (ESPACIO) los
   obstáculos que aparecen sobre el camino. Muévete con las flechas / WASD
   (o el D-pad táctil en móvil). El Nivel 6 (Gran Final Cheer) es puro
   salto: siete vallas seguidas hasta la meta.
6. En **Tetris de Productos**: encaja las piezas con ← → ↑ (rotar) ↓
   (bajar) y ESPACIO (caída instantánea) para completar líneas. Las piezas
   brillantes son Chocolate Dubai: dan monedas extra al limpiar su línea.
7. En cualquier juego, cada cierto tiempo/con cierta probabilidad aparece
   un **Chocolate Dubai**: da monedas persistentes entre partidas y entre
   juegos.
8. Usa esas monedas en la **Tienda** para comprar atuendos (recolores de
   uniforme) para cualquiera de tus Matichicos. Puedes ir a la Tienda o
   volver al hub en cualquier momento con el botón 🏠 del HUD, y cambiar de
   perfil con el botón "Cambiar" junto a tu nombre.
9. Completa las 6 canchas de Recolecta y Corre para ser Campeón Matichoc, o
   consigue el mejor puntaje posible en Tetris — ambos quedan en la
   **Tabla de Puntajes**, con una pestaña por juego.

Todo el progreso (por perfil: personaje, atuendos comprados, monedas,
mejor puntaje, racha diaria, logros y tabla de puntajes por juego) se
guarda en el navegador (`localStorage`), sin necesidad de backend.

Toda la interfaz usa la paleta oficial de marca Matichoc (marrón, verde,
rosa y dorado) en vez de colores genéricos — ver `js/theme.js` y las
variables de `css/style.css`.

## Estructura del proyecto

```
index.html          Pantallas (perfiles, hub, tienda, puntajes, logros, juegos)
favicon.svg          Ícono de marca (vaina de cacao + chocolate)
css/style.css        Estilos, paleta de marca y controles táctiles
js/theme.js           Paleta de marca Matichoc para usar en canvas
js/profiles.js        Perfiles de jugador (sesión por usuario en el navegador)
js/achievements.js    Definición de logros y sus condiciones
js/characters.js      Definición/dibujo procedural de los Matichicos y atuendos
js/games-catalog.js  Catálogo de modos de juego (disponibles y "próximamente")
js/levels.js          Camino/corredor, obstáculos, coleccionables y misiones
js/audio.js           Efectos de sonido generados con Web Audio API
js/game.js            Motor de "Recolecta y Corre": loop, colisiones, HUD
js/tetris-pieces.js  Formas y colores de "Tetris de Productos"
js/tetris-game.js    Motor de "Tetris de Productos": tablero, piezas, HUD
js/storage.js         Progreso persistente por perfil (monedas, atuendos, ranking, logros)
js/main.js            Perfiles, hub, tienda, puntajes y navegación entre juegos
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

- Reemplazar los sprites procedurales por ilustraciones/spritesheets finales
  (el techo de fidelidad visual actual está explicado en el ROADMAP).
- Construir "Lanzamientos de Básquet" y "Saltos de Porristas", los dos
  juegos nuevos ya diseñados en el ROADMAP.
- Mover cada juego a su propia carpeta `js/games/<id>/` cuando se sume el
  tercero (ver ROADMAP.md → Consideraciones técnicas).
- Tabla de puntajes online (backend) para competir entre dispositivos.
