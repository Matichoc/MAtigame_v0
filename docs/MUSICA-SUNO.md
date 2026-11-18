# Música del Matijuego con Suno (versión 1.1)

Hoy la música del juego son notas simples que arma el propio código. En la versión 1.1 se cambia por **6 canciones hechas con Suno**: una canción con letra («¡Vamos al Matijuego!») y 5 temas instrumentales, uno por tipo de juego. El juego ya está preparado: cuando una canción está, suena esa; si falta, sigue sonando la música de siempre.

## Antes de empezar (importante)

- **Usa un plan pagado de Suno (Pro o Premier) mientras creas las canciones.** Las canciones hechas con el plan gratis no se pueden usar en algo comercial, y el juego promociona la marca Matichoc. Revisa las condiciones vigentes en suno.com antes de empezar, porque cambian.
- **Guarda el comprobante**: la boleta o el correo de la suscripción, y una captura de la biblioteca de Suno con la fecha de cada canción. Va junto a los comprobantes de las tipografías.
- **Suno inventa varias versiones de cada canción.** Escucha las dos que te da y quédate con la mejor; si ninguna te gusta, pídele otra vez.

## Cómo crear cada canción

1. En Suno, entra a **Create** y activa el modo **Custom** (personalizado).
2. Pega el **estilo** en el campo «Style of Music» (estilo de la música). Suno entiende el estilo escrito en español.
3. Para los temas sin letra, activa **Instrumental**. Para la canción con letra, pega la letra en «Lyrics».
4. Pon el **título**, crea, escucha y descarga la mejor en **WAV** (o MP3 si no aparece WAV).
5. Guarda todo en la carpeta `C:\Users\croco\Downloads\musica-matijuego\` (ya está creada), con el nombre exacto de la tabla de abajo, y me avisas. Yo las corto para que se repitan bien, les igualo el volumen y las dejo livianas (~1 MB cada una).

## Las 6 canciones

| Archivo | Dónde suena | Instrumental |
| --- | --- | --- |
| `cancion.wav` | Videos para redes (reels, TikTok) | No: con letra |
| `menu.wav` | Menú del juego | Sí (la misma canción, sin voz) |
| `pueblo.wav` | Pueblo Matichoc y Ciudad Choco | Sí |
| `deportes.wav` | Pichanga, básquet, fútbol | Sí |
| `aventura.wav` | Parkour, Aventura Choco, Salto, Autos, Recolecta | Sí |
| `cocina.wav` | Mati Merge, Bloques, Memoria, Choco Match | Sí |

### 1. «¡Vamos al Matijuego!» (con letra) → `cancion.wav`

**Estilo** (copiar tal cual):

```
pop infantil alegre, pop latino, ukelele, marimba, palmas, voz femenina brillante con coro de niños, coro pegajoso para cantar, 118 bpm, feliz, en español
```

**Letra** (copiar tal cual, con los títulos entre corchetes):

```
[Intro]
¡Uno, dos, tres... a jugar!

[Estrofa 1]
Me levanto con ganas de jugar,
mi Matichico me va a acompañar,
por el pueblo de chocolate voy,
saludando a todos: ¡aquí estoy!

[Antes del coro]
Junta estrellas, junta alfajores,
pinta tu casa de mil colores...

[Coro]
¡Ma-ti-jue-go! ¡Ma-ti-jue-go!
Salta, corre, ¡vamos, que ya llego!
Chocolate y diversión,
¡late fuerte el corazón!
¡Ma-ti-jue-go! ¡Ma-ti-jue-go!

[Estrofa 2]
Una pichanga, ¡golazo de chilena!
En el básquet la hinchada truena,
las porristas vuelan hasta el cielo,
y en el parkour salto sin miedo.

[Antes del coro]
Junta estrellas, junta alfajores,
pinta tu casa de mil colores...

[Coro]
¡Ma-ti-jue-go! ¡Ma-ti-jue-go!
Salta, corre, ¡vamos, que ya llego!
Chocolate y diversión,
¡late fuerte el corazón!
¡Ma-ti-jue-go! ¡Ma-ti-jue-go!

[Puente]
Papá, mamá, ¿me acompañan a jugar?
Con mis amigos, ¡nadie nos va a parar!

[Coro final]
¡Ma-ti-jue-go! ¡Ma-ti-jue-go!
Salta, corre, ¡vamos, que ya llego!
Chocolate y diversión,
¡late fuerte el corazón!
¡Ma-ti-jue-go! ¡Matichoc!

[Final]
Matichoc, pasión por el cacao.
```

### 2. Menú → `menu.wav`

La misma canción, sin voz. Hay dos caminos:
- **Lo mejor:** en la canción que elegiste, menú de los tres puntos → **Get Stems** o **Instrumental** (sacar la voz). Así la melodía es la misma.
- **Si no aparece esa opción:** crea una canción nueva con el mismo estilo de arriba, el título «Matijuego (instrumental)» e **Instrumental** activado.

### 3. Pueblo y Ciudad → `pueblo.wav`

```
música acústica tranquila de pueblo para un juego infantil, ukelele, glockenspiel, percusión suave de manos, cálida y relajada, 95 bpm, instrumental
```

### 4. Deportes → `deportes.wav`

```
himno deportivo enérgico para un juego infantil, palmas de estadio, batería potente, golpes de trompetas, cantos de hinchada sin palabras, 128 bpm, instrumental
```

### 5. Aventura → `aventura.wav`

```
música de aventura rápida y juguetona para un juego de plataformas, bajo de sintetizador saltarín, cuerdas en pizzicato, campanitas brillantes, 140 bpm, emocionante y amigable, instrumental
```

### 6. Cocina y puzzles → `cocina.wav`

```
música juguetona de cocina para un juego infantil de cocinar, marimba, pizzicato, swing jazzero suave, escobillas, 105 bpm, dulce y acogedora, instrumental
```

## Después (lo hago yo)

- Corto cada tema para que se repita sin salto, iguala el volumen y lo paso a `assets/music/*.m4a` (AAC, ~1 MB por tema). La app sube de unos 9 MB a unos 16 MB.
- Pruebo que suene en el menú y en cada juego, que se apague con el botón de sonido y al salir de la app, y que no ponga lento el juego en celulares baratos.
- Agrego a la política de privacidad, en «Uso de inteligencia artificial», que la música se hizo con IA.
- La canción con letra (`cancion.wav`) no va dentro del juego: queda para los videos de redes.
- Más adelante: versiones de temporada (Halloween, Navidad, Fiestas Patrias) con el mismo estilo.
