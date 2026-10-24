# Video promocional del Matijuego

Video corto para redes sociales y para buscar testers antes de publicar en Google Play. Se arma **solo, con partidas reales del juego**: no hay nada dibujado aparte, salvo la portada, los títulos y el cierre.

## Qué se genera

| Archivo | Formato | Para qué |
|---|---|---|
| `matijuego-horizontal.mp4` | 1920×1080 (16:9) | YouTube, ficha de Google Play (video promocional), web, Facebook |
| `matijuego-vertical.mp4` | 1080×1920 (9:16) | Reels de Instagram, TikTok, YouTube Shorts, estados de WhatsApp |

Dura unos 40 segundos y tiene este orden:
1. Portada con el logo.
2. Escenas, cada una con su título:
   - Pueblo
   - Renovar el Pueblo
   - Pichanga 3 contra 3
   - Ciudad en auto
   - Básquet 2 contra 2
   - Parkour infinito
   - Mati Merge
   - Cortes rápidos de otros juegos
3. Cierre con la invitación: **"¿Tienes Android? ¡Sé tester!"** y la dirección de la web.

El audio va **en silencio a propósito**. La música se agrega en la app de cada red social (Instagram, TikTok o CapCut), que tiene canciones con permiso para usarlas ahí. Así se evita publicar música con derechos de autor.

## Cómo volver a generarlo (por ejemplo, después de cambios grandes en el juego)

```bash
node scripts/build.mjs app
node scripts/qa/servidor.cjs app-www 8092 &          # servidor local de la app
export NODE_PATH=$(npm root -g)                       # Playwright instalado globalmente
node scripts/video/grabar.cjs http://127.0.0.1:8092/ video          # graba todas las escenas (20–40 min)
node scripts/video/carteles.cjs video                               # portada, títulos y cierre
node scripts/video/montar.cjs video                                 # arma los dos videos
```

- **Revisar el encuadre rápido:** `grabar.cjs … video pueblo,ciudad --muestra` guarda solo 3 cuadros por escena.
- **Grabar más rápido:** se pueden lanzar varias escenas en procesos separados, por ejemplo `… video pueblo,merge` y `… video pichanga,basquet` al mismo tiempo.
- **Cambiar los textos** (títulos, invitación, web): editar `TEXTOS` al principio de `scripts/video/carteles.cjs`.
- **Cambiar el orden o quitar escenas:** `node scripts/video/montar.cjs video pichanga,pueblo,merge`.

### Cómo funciona
- **`reloj.cjs`** congela el tiempo del juego y lo avanza 1/30 de segundo por cuadro. El navegador de prueba no tiene tarjeta gráfica y dibuja cada cuadro en ~1,5 s, pero el video sale fluido a 30 cuadros por segundo.
- **`grabar.cjs`** abre cada juego con un perfil avanzado (todo canjeado, nivel alto y el Pueblo casi renovado) y lo juega solo:
  - Los partidos los maneja el "jugador humano" de las pruebas (`scripts/qa/jugador-humano.mjs`).
  - El auto lleva piloto automático por la avenida.
  - El parkour tiene un piloto que salta al borde de cada plataforma.
  - En Mati Merge se arrastran productos con el dedo, como un toque real.
- **`carteles.cjs`** dibuja los carteles con la letra libre del juego (Fredoka) y el logo de Matichoc.
- **`montar.cjs`** junta todo con ffmpeg: fundidos, títulos y la versión vertical con el juego al medio.

## Para publicarlo y conseguir testers

- **Google Play pide una prueba cerrada antes de publicar:** al menos 12 testers durante 14 días seguidos (ver `docs/PLAY-STORE.md`).
  - Los testers necesitan una cuenta de Google y un celular Android.
  - Lo más simple es un **Grupo de Google**: quien se une queda como tester. Su enlace va en la publicación junto con el video.
- **Como el juego es para niñas y niños, el aviso va dirigido a mamás, papás y familias:** "¿Tus hijos juegan en Android? Ayúdanos a probarlo".
- **Textos sugeridos para la publicación:**
  > 🍫 ¡Llega el Matijuego, el arcade de Matichoc! 14 juegos y mundos en 3D, gratis y sin anuncios, para niñas y niños.
  > 🙋 Buscamos familias con Android que lo prueben antes que nadie. Escríbenos o únete al grupo de testers: [enlace]
  > 🎮 Pruébalo ya en matichoc.cl/matijuego
- **El video de la ficha de Play se sube a YouTube** (público o no listado) y se pega el enlace en Play Console. Para eso sirve la versión horizontal.
