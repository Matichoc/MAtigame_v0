# MAtigame_v0 — Matichoc: La Aventura del Cacao

Arcade web de Matichoc: cada persona elige su perfil, su Matichico (Choco
Capitán, Choco Estrella, Choco Baller o Choco Cheer) y lo personaliza con
atuendos comprados en la tienda, para jugar cualquiera de los minijuegos
disponibles con ese mismo personaje. **Los 9 juegos son 3D** (Three.js),
con brillo (bloom), color vivo y un Matichico 3D que cambia con la tienda:
**Recolecta y Corre** (6 canchas 3D con camino guiado, vallas y golosinas),
**Tetris de Productos** (cubos de chocolate en una vitrina 3D),
**Lanzamientos de Básquet** (tiro libre con física real, aro y red),
**Saltos de Porristas** (rebotadora, volteretas y pompones), **Salto Choco**,
**Autos de Chocolate**, **Memoria Matichoc** (fotos reales de los productos),
**Choco Blaster** (primera persona, ver
[`docs/PROPUESTA-3D.md`](./docs/PROPUESTA-3D.md)) y **Crea tu Chocolate**
(configurador 3D: elige producto, sabor, toppings, envoltorio y diseña tu
etiqueta; puedes pedir algo parecido por WhatsApp).

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
4. Elige un juego de la grilla: **Recolecta y Corre**, **Tetris de
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
6. En **Tetris de Productos**: encaja las piezas con ← → ↑ (rotar) ↓
   (bajar) y ESPACIO (caída instantánea) para completar líneas. Las piezas
   brillantes son Chocolate Dubai: dan monedas extra al limpiar su línea.
7. En **Lanzamientos de Básquet**: presiona ESPACIO/tap para fijar la
   barra de puntería, y de nuevo para fijar la de potencia — con ambas
   bien centradas encestas. Tienes 60 segundos y la dificultad sube con
   cada tiro; cada 5° tiro es un aro dorado que da monedas extra.
8. En **Saltos de Porristas**: mueve la rebotadora con ← → (o los botones
   táctiles) para que quede debajo de tu Matichica antes de que caiga.
   Rebotar centrado suma combo, los pompones flotantes dan puntos extra;
   si se cae fuera de la rebotadora se acaba la partida.
9. En cualquier juego, cada cierto tiempo/con cierta probabilidad aparece
   un **Chocolate Dubai**: da monedas persistentes entre partidas y entre
   juegos.
10. Usa esas monedas en la **Tienda** para comprar atuendos (recolores de
    uniforme) para cualquiera de tus Matichicos. Puedes ir a la Tienda o
    volver al hub en cualquier momento con el botón 🏠 del HUD, y cambiar
    de perfil con el botón "Cambiar" junto a tu nombre.
11. Completa las 6 canchas de Recolecta y Corre para ser Campeón Matichoc,
    o consigue el mejor puntaje posible en cualquier otro juego — todos
    quedan en la **Tabla de Puntajes**, con una pestaña por juego.

Todo el progreso (por perfil: personaje, atuendos comprados, monedas,
mejor puntaje, racha diaria, logros y tabla de puntajes por juego) se
guarda en el navegador (`localStorage`), sin necesidad de backend.

Toda la interfaz usa la paleta oficial de marca Matichoc (marrón, verde,
rosa y dorado) en vez de colores genéricos — ver `js/theme.js` y las
variables de `css/style.css`.

## Estructura del proyecto

```
index.html          Pantallas (perfiles, hub, tienda, puntajes, logros, juegos)
assets/brand/        Logos, patrón e íconos oficiales (copiados de matichoc.cl)
assets/fonts/        Baby Chipmunk y Adorable Mother Script (fuentes de marca)
assets/products/     Recortes de fotos reales de productos
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
js/recolecta-game.js  Recolecta y Corre 3D (usa los niveles de js/levels.js)
js/tetris-pieces.js  Formas y colores de "Tetris de Productos"
js/tetris3d-game.js  Tetris de Productos 3D
js/basquet3d-game.js  Lanzamientos de Básquet 3D (física del balón, red, hinchada)
js/porristas3d-game.js  Saltos de Porristas 3D
js/three-kit.js       Base 3D compartida (Game3D, bloom, partículas, popups)
js/matichico3d.js     Matichico en 3D con atuendo de la tienda
js/salto-game.js      Salto Choco 3D
js/autos-game.js      Autos de Chocolate 3D
js/memoria-game.js    Memoria Matichoc 3D
js/creador-game.js    Crea tu Chocolate: asistente, galería, puntaje
js/creador-data.js    Opciones, maridajes, reto del día y etiqueta
js/creador-3d.js      Modelos 3D de los productos, toppings y envoltorios
js/fps-game.js        Motor de "Choco Blaster 3D" (primera persona, Three.js)
js/fps-world.js       Mundo 3D: feria de Matichoc
js/fps-enemies.js     Malvaviscos enemigos del juego 3D
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
- Mover cada juego a su propia carpeta `js/games/<id>/` (ver ROADMAP.md →
  Consideraciones técnicas: ya hay 4 módulos con el mismo patrón, así que
  el umbral para reorganizar ya se cumplió).
- Tabla de puntajes online (backend) para competir entre dispositivos.
