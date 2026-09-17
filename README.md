# MAtigame_v0 — Matichoc: La Aventura del Cacao

Minijuego web de Matichoc: elige a tu Matichico (Choco Capitán, Choco Estrella,
Choco Baller o Choco Cheer), personalízalo con atuendos comprados en la tienda,
y recórrelo por 5 canchas recolectando golosinas para cumplir la misión de
cada nivel antes de que se acabe el tiempo.

Es una v0 intencionalmente simple: HTML + CSS + JavaScript puro (sin frameworks
ni build step), pensada como base fácil de evolucionar (más niveles, power-ups,
sprites con arte final, multijugador, etc.).

## Cómo jugar

1. Escribe tu nombre y elige uno de los 4 Matichicos en la pantalla de inicio.
2. Muévete con las flechas / WASD, salta con ESPACIO (o usa el D-pad y el
   botón de salto táctiles en móvil).
3. Recolecta golosinas (chocolate, alfajor, cuchuflín, barquillo) para cumplir
   la misión de cada nivel antes de que se acabe el tiempo, y esquiva los
   conos y vallas de cada cancha.
4. Cada cierto tiempo aparece por solo 3 segundos un **Chocolate Dubai**: un
   bonus especial que da monedas persistentes entre partidas.
5. Usa esas monedas en la **Tienda** para comprar atuendos (recolores de
   uniforme) para cualquiera de tus Matichicos.
6. Completa las 5 canchas (Fútbol, Básquet, Cheer, Revancha en La Liga y
   Básquet Pro) para ser Campeón Matichoc y entrar a la **Tabla de Puntajes**.

Todo el progreso (personaje, atuendos comprados, monedas, mejor puntaje,
nivel desbloqueado y tabla de puntajes) se guarda en el navegador
(`localStorage`), sin necesidad de backend.

## Estructura del proyecto

```
index.html          Pantallas (menú, tienda, puntajes, HUD, overlays)
css/style.css        Estilos, tema visual y controles táctiles
js/characters.js      Definición/dibujo procedural de los Matichicos y atuendos
js/levels.js          Mapas, obstáculos, coleccionables y misiones por nivel
js/audio.js           Efectos de sonido generados con Web Audio API
js/game.js            Motor del juego: loop, física simple, colisiones, HUD
js/storage.js         Progreso persistente (personaje, monedas, atuendos, ranking)
js/main.js            Arranque: menú, tienda, tabla de puntajes y wiring de la UI
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
- Agregar más niveles y tipos de misión (rivales, combos, jefes de cancha).
- Sumar más power-ups además del Chocolate Dubai (velocidad, imán, tiempo extra).
- Botón para volver al menú/tienda sin recargar la página durante una partida.
- Tabla de puntajes online (backend) para competir entre dispositivos.
