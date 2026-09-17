# MAtigame_v0 — Matichoc: La Aventura del Cacao

Minijuego web de Matichoc: elige a tu Matichico (Choco Capitán, Choco Estrella,
Choco Baller o Choco Cheer) y recórrelo por distintas canchas recolectando
chocolates para cumplir la misión de cada nivel antes de que se acabe el tiempo.

Es una v0 intencionalmente simple: HTML + CSS + JavaScript puro (sin frameworks
ni build step), pensada como base fácil de evolucionar (más niveles, power-ups,
sprites con arte final, multijugador, etc.).

## Cómo jugar

1. Elige uno de los 4 Matichicos en la pantalla de inicio.
2. Muévete con las flechas / WASD (o el D-pad táctil en móvil).
3. Recolecta los chocolates para cumplir la misión de cada nivel antes de que
   se acabe el tiempo.
4. Completa las 3 canchas (Fútbol, Básquet, Cheer) para ser Campeón Matichoc.

El progreso (mejor puntaje y nivel desbloqueado) se guarda en el navegador
(`localStorage`), sin necesidad de backend.

## Estructura del proyecto

```
index.html          Pantallas (menú, HUD, overlays) y estructura del juego
css/style.css        Estilos, tema visual y controles táctiles
js/characters.js      Definición y dibujo procedural de los Matichicos
js/levels.js          Mapas, obstáculos, chocolates y misiones por nivel
js/audio.js           Efectos de sonido generados con Web Audio API
js/game.js            Motor del juego: loop, física simple, colisiones, HUD
js/main.js            Arranque: selección de personaje y wiring de la UI
.github/workflows/    Despliegue automático a GitHub Pages
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

- Reemplazar los sprites procedurales por ilustraciones/spritesheets finales.
- Agregar más niveles y tipos de misión (cronómetro, evitar rivales, combos).
- Sumar power-ups (velocidad, imán de chocolates, tiempo extra).
- Tabla de puntajes o compartir resultado en redes.
