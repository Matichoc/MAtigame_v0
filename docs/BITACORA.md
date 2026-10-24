# Bitácora de Matijuego

Registro de todo lo que se cambia, se decide y se prueba: lo más reciente arriba. Cada entrada dice **qué** se hizo, **dónde** (PR, rama, compilación), **qué se comprobó** y **qué quedó pendiente**. Las decisiones de la persona dueña se anotan como tales.

---

## 2026-10-23

### Aventura por etapas "Renovar el Pueblo", Pueblo y Ciudad más grandes y pedidos diarios en Mati Merge
- **Prueba de la persona dueña (APK nº 79):**
  - "Se ve un poco mejor", pero la aventura por etapas "no la estamos logrando" (como en Gossip Harbor).
  - Pidió agrandar la Ciudad y el Pueblo "para tener más mundo, para caminar, para conocer, para hacer más misiones", y que algunas misiones se reseteen.
  - "Hay algunas que las tengo tomadas desde ayer."
- **Decisiones de la persona dueña** (a mis preguntas):
  - Aventura con **"⭐ de todos los juegos"**.
  - Misiones atascadas: **"distintos personajes pidiendo para su día a día, pueden pedir 1 o 2 productos para combinar"** (los pedidos de Mati Merge).
  - Mundo: **"barrios nuevos en ambos"**.
  - Encargos: **"encargos diarios, historia fija"**.
- **Aventura "Renovar el Pueblo":**
  - 7 zonas: plaza, cancha, aro, festival, bosque de cacao, granja y lago.
  - Cada zona trae 4 tareas que cuestan ⭐; las ⭐ se ganan en cualquier juego, en pedidos de Merge y juntando lo de los barrios.
  - Lista de tareas con mapa de zonas y escena con el vecino al hacer cada una; premio por zona, una sola vez.
  - **Migración:** quien terminó el festival queda con 4 zonas hechas, sin cobrar de nuevo.
  - El nivel ahora se ve con 🏅, para no confundirlo con las ⭐.
- **Pueblo más grande:**
  - Bosque de cacao, Granja y Lago, con vecinos nuevos (Guardabosque Maní, Tía Avellana y Capitán Almendra).
  - Se ven descuidados hasta que la aventura los renueva.
  - Cada día hay mazorcas, huevos y conchitas para juntar (3 actividades nuevas: el premio del día pide 7 de 10).
- **Ciudad más grande:**
  - Parque Grande, Playa con muelle y Colegio.
  - 3 misiones nuevas que se renuevan cada día: patos, quitasoles y libros perdidos (ahora son 11).
- **Mati Merge:**
  - Los pedidos son de distintos vecinos para su día a día y traen 1 o 2 productos.
  - Se renuevan cada día; los antiguos atascados se cambian al abrir.
- **Problemas encontrados y arreglados en el camino:**
  - El cuadro para elegir estilo se abría detrás de la lista de tareas.
  - La entrada de la granja le quitaba su lugar a la "Escalera de Nubes" del parkour.
  - Los carteles de los barrios se leían al revés desde adentro.
  - Lo que se recolecta en los barrios se dibujaba aunque estuvieras lejos.
- **Rendimiento (teléfono):**
  - **Pueblo en la plaza:** 1.352 → 1.435 dibujos (+6%); dentro de un barrio, 1.515–1.562.
  - **Ciudad:** los barrios suman entre 9 y 73 dibujos (antes, ~1.107 en el centro).
  - **Pendiente aparte:** el Pueblo y la Ciudad ya eran pesados (1.300–1.800 dibujos).
- Detalle en `docs/EVOLUCION-JUGABILIDAD.md` §15.
- **Pruebas:**
  - Lógica: aventura, deportes, puzzles y merge-logica (nueva), en verde. `verify:app` OK.
  - Navegador, app: aventura 57/57, deportes 52/52, merge 30/30, ciudad-barrios 20/20 (nueva), atrás 24/24, juegos 15/15, temporada 29/29, pueblo 24/24, perfiles 13/13 y ciudad-diaria 6/6. Legal y enlaces OK.
  - Navegador, web (matiweb servida en local): aventura 57/57, deportes 52/52, merge 30/30, pueblo 24/24, temporada 29/29, legal OK y enlaces con 0 peticiones externas.
  - `juegos.cjs` en la web: 15/16. Choco Blaster sigue con la falla de la prueba ya anotada el 22-oct.
  - `ciudad-barrios.cjs` no corre en la web: la demo deja jugar solo las 2 primeras misiones de la Ciudad. Los barrios se pueden recorrer igual.
  - Pruebas puestas al día: `ciudad-diaria.cjs` ahora cuenta 11 misiones; antes contaba 8.
- App: PR [#46](https://github.com/Matichoc/MAtigame_v0/pull/46), el mismo, todavía sin merge. **APK de prueba: compilación nº 80**, en verde: https://github.com/Matichoc/MAtigame_v0/actions/runs/40043895224 (artefacto `matijuego-prueba-apk`).
- **Falta probar en el celular:**
  - La lista de tareas y las escenas.
  - Caminar a los barrios del Pueblo y de la Ciudad.
  - Los pedidos de 2 productos.
  - Que todo se vea fluido.
- Web: PR [Matichoc/matiweb#49](https://github.com/Matichoc/matiweb/pull/49), actualizado. Se publica cuando la persona dueña hace merge.

### Aventura que se entiende, Mati Merge en 3D y pantallas más alegres
- **Prueba de la persona dueña:**
  - La aventura "no se entiende": no queda claro qué es ni qué hay que completar, y las misiones son abstractas.
  - Los cuadros nuevos se ven "muy cuadrados, muy en ventana", toscos al lado del resto del juego.
  - Desde Mati Merge las piezas perdieron la alegría.
- **Decisiones de la persona dueña** (a mis preguntas):
  - Aventura **"Directo al Pueblo"**.
  - Mati Merge **"3D como Choco Match"**.
  - Revisar el **inicio de los partidos, la Ciudad y el Pueblo, elegir estilo y los botones del menú**.
- **Aventura:**
  - **Primera vez:** una viñeta con las caras de los 3 vecinos explica el festival, una sola vez. Después «Continuar mi aventura» lleva directo al Pueblo, junto al vecino que te necesita.
  - **Globito en el Pueblo:** la cara del vecino, un pedido concreto ("Bombi necesita chocolates para decorar: gánalos jugando una partida de cualquier juego 🎮") y un botón que lo hace (▶ Memoria / ▶ Pichanga / ▶ Básquet / 📍 Llévame).
  - **Lo que dicen los vecinos:** se reescribió con palabras simples.
  - **Pantalla de capítulos:** queda solo como «Mis lugares y copas».
  - Se agregó el campo `introSeen` al estado de la aventura, sin migración: los perfiles antiguos la reciben al abrir.
- **Mati Merge en 3D:**
  - Los 26 productos ahora tienen volumen y brillo (`js/merge-models.js`).
  - **Bandeja:** de madera, en perspectiva como Choco Match.
  - **Al juntar:** el producto nuevo salta.
  - **Pedidos:** un vecino con un globito; se pone verde y dice «¡Entregar!» cuando lo tienes.
  - **Juego y tablero guardado:** los mismos de antes.
  - **Costo por cuadro:** baja de 133 a **51 dibujos**, con 53.000 triángulos. Choco Match, que anda bien en su celular, usa 835 dibujos y 106.000 triángulos.
- **Pantallas más alegres:**
  - Fichas de color con dibujito en el inicio de los partidos (🌱 Accesible, ⭐ Normal, 🔥 Desafío, 🤝 Amistoso, 🏆 Copa).
  - Fichas grandes para elegir estilo. **Se arregló un error:** los nombres de los estilos salían en blanco sobre fondo claro y no se leían.
  - Fichas de color en «Mi personaje y mis espacios».
  - Botones del menú redondos y con brillo.
  - Panel de Actividades del Pueblo y lista de misiones de la Ciudad claros y redondos.
  - «Mis lugares y copas» con tarjetas claras.
- **Menú en celulares.** La persona dueña pidió revisarlo con ojo crítico: "esa foto grande quizás molesta, quisiera que sea muy buena la experiencia de usuario".
  - **De pie:** el escenario grande del personaje ocupaba una pantalla entera antes de los juegos. Ahora es una franja chica con el Matichico y los 4 para elegir, y «Elige un juego» se ve en la primera pantalla.
  - **Acostado:** la cabecera ocupaba media pantalla y los juegos quedaban en una ventanita de ~70 px de alto. Ahora la cabecera va en una fila y todo el menú se desplaza junto.
  - **Botones repetidos:** se quitaron «Vestuario y Tienda», «Mi Casa» y el cartel de Mi Casa; siguen en «Mi personaje y mis espacios».
  - **Tarjetas de juegos:** sin carteles encima de la foto; abajo, una línea corta "⚡ 8 · 📱 acostado".
  - **Aviso de temporada:** en una fila.
  - En computador el menú queda igual.
- Detalle en `docs/EVOLUCION-JUGABILIDAD.md` §14.
- **Pruebas:**
  - Lógica: aventura, deportes y puzzles, en verde. `verify:app` OK.
  - Navegador, app: aventura 43/43, deportes 52/52, merge 30/30 (prueba nueva), atrás 24/24, juegos 15/15, temporada 29/29, pueblo 24/24, perfiles 13/13, Ciudad 6/6. Legal y enlaces OK.
  - Navegador, web (matiweb servida en local): aventura 43/43, deportes 52/52, merge 30/30, temporada 29/29, legal OK, enlaces 0 peticiones externas.
  - `juegos.cjs` en la web: 15/16. Choco Blaster sigue con la misma falla de la prueba que ya estaba anotada el 22-oct.
- **Pruebas que se arreglaron** (fallaban por la prueba, no por el juego):
  - `atras.cjs`: ahora «Continuar mi aventura» abre la viñeta.
  - `aventura.cjs`: en la web los módulos llevan `?v=…`, y la prueba cargaba otra copia de `progression.js`, así que el menú no se enteraba de la partida.
- **Prueba de partidos (`deportes.cjs`):**
  - En pantalla grande, la prueba esperaba solo 15 s el fin del partido después de volver de segundo plano.
  - En el navegador de prueba sin tarjeta gráfica, la pausa corta de 1,6 s de juego tardó más que eso en tiempo real. Con `main` pasa lo mismo, así que no viene de este cambio.
  - Ahora espera hasta 60 s.
  - También espera a que se registre la primera jugada con teclado (con un tope de 30 s): el pase apretado durante el saque sale cuando termina el saque.
- App: PR [#46](https://github.com/Matichoc/MAtigame_v0/pull/46). **APK de prueba: compilación nº 79**, en verde: https://github.com/Matichoc/MAtigame_v0/actions/runs/40023255916 (artefacto `matijuego-prueba-apk`).
- Web: PR [Matichoc/matiweb#49](https://github.com/Matichoc/matiweb/pull/49). Se publica cuando la persona dueña hace merge.
- **Falta probar en el celular:** la viñeta y el globito de la aventura, Mati Merge en 3D (que se vea fluido) y el menú de pie y acostado.

### PR #45 y matiweb #48 mergeados (23-oct)
- El ajuste de dificultad quedó en `main` y en la web.

### Partidos más fáciles de aprender (Pichanga y Básquet 2 contra 2)
- **Prueba en el celular de la persona dueña** (APK nº 77): Pichanga y Básquet 2 contra 2 "súper difíciles de jugar al tiro". Cuesta coordinar pases y hacer goles, los rivales hacen goles mucho más fácil y quitar la pelota es muy difícil.
- **Causa:**
  - La dificultad se había calibrado con un robot que mueve el joystick perfecto y reacciona al instante.
  - Además, la dificultad marcada de entrada era "normal".
  - Con un jugador simulado que juega como persona (`scripts/qa/jugador-humano.mjs`: decide cada ~0,45 s y apunta con error), en "normal" ganaba 8 de 40 partidos de Pichanga y 11 de 40 de básquet.
- **Cambios:**
  - Rivales más lentos y con menos puntería.
  - Más alcance para quitar o robar, y menos castigo si fallas.
  - En **Accesible**, basta con chocar o pegarse al rival que lleva la pelota para intentar quitársela.
  - El compañero va a buscar tus pases, y en básquet tus pases se cortan menos.
  - Arquero de tu equipo un poco mejor.
  - Todos parten en **Accesible ("para aprender")**: quien venía en "normal" sin copas pasa a accesible (migración de `progress.sports` a la versión 2).
- **Resultado con el jugador simulado:**

| Dificultad | Pichanga | Básquet |
|---|---|---|
| Accesible (aprendiz) | gana 30/30, unos 7 a 1 | gana 30/30, unos 10 a 3 |
| Normal | gana 20–25/30 | gana 18–21/30 |
| Desafío | gana 7–12/30 | gana 7–12/30 |

  Quedó como prueba permanente en `scripts/qa/deportes-logica.mjs`.
- Pruebas:
  - Lógica: `deportes-logica.mjs` 58/58 y `aventura-logica.mjs` 64/64.
  - Navegador, app: `deportes.cjs` 52/52 y `aventura.cjs` 41/41.
  - Navegador, web: las mismas, también 52/52 y 41/41.
  - `verify:app` OK.
- App: PR #45. **APK de prueba: compilación nº 78**, en verde: https://github.com/Matichoc/MAtigame_v0/actions/runs/39893272151 (artefacto `matijuego-prueba-apk`).
- Web: PR [Matichoc/matiweb#48](https://github.com/Matichoc/matiweb/pull/48). Se publica cuando la persona dueña hace merge.
- Falta confirmarlo en el celular: el jugador simulado no reemplaza a una persona.

### PR #44 y matiweb #47 mergeados (22-oct)
- La evolución integral quedó en `main` y la web se publicó en matichoc.cl/matijuego: despliegue nº 46 de matiweb, en verde.

## 2026-10-22

### Las mejoras van siempre a la app y a la web
- **Decisión de la persona dueña:** toda mejora va a los dos lados, la app (APK) y la web (matichoc.cl/matijuego). Quedó como regla en `CLAUDE.md`.
- La web no se actualizaba desde el PR #46 de matiweb (antes del #37). El PR de matiweb con esta evolución lleva también todo lo acumulado:
  - Pueblo con parkour y puertas de juegos, Ciudad con misiones diarias, Mati Merge más claro y sonido más sobrio.
  - Arte de temporadas, "atrás" que cierra los cuadros y licencias.
- Se genera con `MATIJUEGO_DEMO=1 node scripts/deploy-matiweb.mjs`, en modo demo como siempre. **PR de la web: [Matichoc/matiweb#47](https://github.com/Matichoc/matiweb/pull/47)** (rama `claude/zealous-johnson-2ryf87`, commit `3ed08dc`). Se publica cuando la persona dueña hace merge.
- Pruebas contra la versión web servida en local:
  - `aventura.cjs` 41/41, `deportes.cjs` 52/52 y `temporada.cjs` 29/29.
  - `enlaces.cjs` y `legal.cjs`: OK. 0 peticiones externas.
  - `juegos.cjs`: 15/16. Choco Blaster "no salió de la tarjeta de inicio", pero la misma prueba falla igual con la web publicada hoy (matiweb `6374727`) y, abierto a mano, el juego carga bien. Pendiente: arreglar la prueba de Choco Blaster.
  - `atras.cjs` no aplica a la web: el botón es del celular, y en la demo web Fútbol no está bloqueado.

### Rendimiento para teléfonos de gama media-baja (mismo PR #44)
- **Decisión de la persona dueña:** todo lo que se desarrolle debe funcionar en teléfonos de gama media-baja hacia arriba. Quedó como regla en `CLAUDE.md`.
- Se midió lo nuevo. Dibujos por cuadro: Pichanga 858 (Fútbol de siempre: 302) y Básquet 2 contra 2: 548 (Lanzamientos: 209). La causa eran las sombras reales de 6 y 4 personajes.
- Ajuste en celulares: sombras redondas simples en un solo dibujo, sin brillo de posprocesado y tablas de la cancha agrupadas. Quedó en Pichanga **413** y Básquet 2 contra 2 **286**. Detalle en `docs/EVOLUCION-JUGABILIDAD.md` §12.
- **Compilación nº 77** (`da7ad2c`, con este ajuste y toda la evolución): APK de prueba sin `release`, en verde. Reemplaza a la nº 76 para probar en el celular: https://github.com/Matichoc/MAtigame_v0/actions/runs/39870514932 (artefacto `matijuego-prueba-apk`).
- Pendiente: medir en un celular real de gama media-baja.

### Evolución integral: aventura del festival, Pichanga 3 contra 3 y Básquet 2 contra 2 (rama `claude/zealous-johnson-2ryf87`)
- Encargo de la persona dueña: "Evolución integral de Matijuego". Situación: la app se prueba con APK en su celular y **no está subida a Play Console**. No se preparó ninguna publicación ni se tocaron credenciales, firmas ni el identificador de la app.
- Plan, decisiones, criterios y estado por fase: `docs/EVOLUCION-JUGABILIDAD.md`.
- **Fase 1, menú:** tres accesos grandes: "Continuar mi aventura", "Jugar libremente" y "Mi personaje y mis espacios". Sin Matichico elegido, un aviso amable reemplaza la alerta del navegador. "Atrás" funciona en la pantalla nueva y en los cuadros nuevos.
- **Fase 2, aventura "Preparar el gran festival del Pueblo":** 3 capítulos con Bombi (rincón de la plaza), Capi Menta (cancha) y Don Cuchufli (aro y festival).
  - En el Pueblo: "❗" sobre quien te espera, flecha guía y objetivo escrito. Cada capítulo tiene un estilo para elegir, que transforma el Pueblo y queda para siempre.
  - Avance en `progress.adventure` (versionado, no se reinicia cada día). Premios una sola vez. Los pasos de jugar aceptan alternativas libres; nunca se pide un juego bloqueado.
- **Fase 3, Pichanga Choco:** fútbol 3 contra 3 con IA local, saques de todo tipo, cambio de jugador predecible, controles táctiles y de teclado, amistoso y copa de 3 partidos, y tres dificultades. Se abre en la cancha del Pueblo y desde la tarjeta de Fútbol.
- **Fase 4, Básquet 2 contra 2:** media cancha, pases, tiros de 2 y 3 con barra de tiempo, robos, tapones y rebotes, con reglas simples (sacar desde arriba; sacarla detrás de la línea de 3 al recuperar). Amistoso, copa y dificultades. Se abre desde Lanzamientos y desde el aro del Pueblo.
- **Fase 5, integración:**
  - Los vecinos recuerdan y comentan lo construido. Copas y medallas visibles. 3 logros nuevos (`docs/LOGROS.md` regenerado).
  - Al volver después de más de 3 horas, un resumen corto. Meta personal visible en el menú.
  - En temporada: colores del evento en el festival, frase de temporada y un reto opcional que da fichas del evento, una vez por evento y año.
- Al pasar a segundo plano, la app anota la hora de salida dentro del guardado, para el resumen al volver. Solo cambia ese dato: no reescribe el resto ni revive un perfil borrado.
- Pruebas nuevas:
  - `scripts/qa/aventura-logica.mjs` y `scripts/qa/deportes-logica.mjs`, en Node.
  - `scripts/qa/aventura.cjs` y `scripts/qa/deportes.cjs`, en el navegador.
  - `scripts/qa/atras.cjs` ampliado con la pantalla de la aventura, el cuadro nuevo y un partido.
- Resultados de esta corrida: ver "Evidencia final" en `docs/EVOLUCION-JUGABILIDAD.md`.
- Ajuste tras revisar capturas de celular: los tres caminos del menú quedaban abajo en vertical; se movieron arriba de todo.
- Compilaciones desde la rama, con APK de prueba, sin `release`, `fonts=libres` e `icono=habitual`:
  - Nº 75 (`da3c4b6`): en verde.
  - **Nº 76 (`edd2d0a`, con todo, incluido el ajuste del menú): en verde.** Artefacto `matijuego-prueba-apk` en https://github.com/Matichoc/MAtigame_v0/actions/runs/39869164512.
  - No se subió nada a Play.
- Pendiente:
  - Compilar el APK con estos cambios y probar en el celular de la persona dueña: controles táctiles, rendimiento de los partidos y lectura de textos en pantalla chica.
  - No se puede afirmar más diversión ni más retención sin probar con personas.

### PR #43 mergeado
- La regla de la bitácora y la nota de la compilación 74 quedaron en `main`. Anotación pendiente desde el 21-oct, incluida en este PR siguiendo la regla de no abrir PRs solo para la bitácora.

## 2026-10-21

### Regla nueva: la bitácora no lleva PR propio
- Decisión de la persona dueña: no abrir PRs solo para la bitácora. Su commit va en el PR que esté abierto o, si no hay ninguno, en el siguiente. Anotado en `CLAUDE.md`.

### Compilación nº 74: versión para la prueba cerrada en Google Play
- Desde `main` `d31fde0` (merge del #42: "atrás" cierra todos los cuadros), con `release`, `fonts=libres` e **`icono=habitual`** (el Matichico). Decisión de la persona dueña: el ícono habitual, para que sea simple.
- Versión 1.0.0, `versionCode` 74. Todos los pasos en verde: APK de prueba revisado y `.aab` firmado con la llave de subida (no con la de pruebas). La llave se borró del servidor.
- Artefactos: https://github.com/Matichoc/MAtigame_v0/actions/runs/39633296344 (`matijuego-prueba-apk` y `matijuego-play-store-aab`).
- Pendiente: probar en el celular que "atrás" cierra Energía y Calendario. Después, crear la app en Play Console y subir este `.aab` a la prueba cerrada.

### PR #42 mergeado
- "Atrás" cierra Energía, Calendario, Canje y Ranking.

### Cuenta de Google Play validada
- La persona dueña informa que Google **validó su cuenta de desarrollador** (cuenta personal). Ya se puede crear la app en Play Console.
- Siguiente: merge del #42 → compilar el `.aab` definitivo → crear la app en Play Console → prueba cerrada (cuenta personal nueva: al menos 12 testers durante 14 días, según la consola) → solicitar acceso a producción.
- Recomendación sobre el ícono: compilar el `.aab` de la prueba cerrada con `icono=habitual` (el Matichico). La prueba de 14 días termina después del 2-nov, y así no hace falta otra versión al acabar Halloween.

### Arreglo: "atrás" no cerraba algunos cuadros (rama `claude/atras-cuadros`)
- Hallazgo de la revisión independiente: Energía y Calendario no se cerraban con "atrás". Al revisar aparecieron dos más con el mismo problema: Canje de juegos (`um-cancel`) y Ranking mundial (`wr-close`). El manejador hacía `modal.click()` y esos cuadros no se cierran tocando el fondo.
- Arreglo: cada cuadro marca su botón de cierre con `data-back` y "atrás" pulsa ese botón, así corre su propio cierre con su estado interno (por ejemplo `enOpen`). Si un cuadro no tuviera botón, se oculta igual.
- Prueba: `scripts/qa/atras.cjs` exige un `data-back` por cuadro y prueba que Energía, Calendario y Canje se cierran, se pueden reabrir y no sacan de la app. Con el código de `main` (`5a69ef7`) falla en esos 4 puntos; con el arreglo da 17/17.
- `scripts/qa/juegos.cjs`: antes de pulsar el inicio espera de verdad a que el botón esté visible, hasta 20 s, porque el Pueblo tarda en armarse en un equipo lento. Si el clic falla, guarda el error completo. No se relajó ninguna comprobación.
- Corrida de juegos sin red con este cambio: 15/15, 0 errores, 0 peticiones externas. La autoprueba de inicio roto sigue detectando el fallo. `legal`, `enlaces`, `perfiles` 13/13 y `pueblo` OK.

### Revisión independiente después del PR #41 (`5a69ef7`, matiweb `6374727`)
- Compilaron: build de la app, verificador, `cap sync`, `assembleDebug` y `bundleRelease`. Su AAB es local y sin firma: no es el que se sube.
- Pasaron: temporadas, perfiles 13/13, privacidad y licencias, enlaces sin Choco Blaster, misiones de la Ciudad, lógica de las puertas y la prueba negativa de inicio. El ícono habitual, el de Play y la política coinciden con la página de matichoc.cl.
- ❌ "Atrás" no cerraba Energía ni Calendario: corregido arriba.
- ⚠️ Corrida de juegos sin red: **14/15** la primera vez, porque el clic de inicio del Pueblo superó los 5 s. Al repetir solo el Pueblo, 1/1. No se confirma un defecto del juego. Se conservan ambos resultados: la primera corrida **no** cuenta como 15/15.
- La persona dueña confirmó: cuenta de Google Play **personal**, en verificación. El AAB está generado en GitHub y **todavía no se subió** a Play.
- Pendientes para la primera publicación, según la revisión:
  1. Generar el AAB firmado definitivo desde un `main` que incluya el #41 y este arreglo, con `versionCode` mayor que cualquiera ya subido.
  2. Terminar la verificación de la cuenta y las tareas de dispositivo que pida Play Console.
  3. Crear la app en Play Console, subir el AAB y revisar los avisos de paquete, firma, API y compatibilidad.
  4. Probar instalación y actualización desde una pista interna. Ojo: el APK de prueba tiene otro certificado; no desinstalar con progreso sin asumir que se pierde.
  5. Completar ficha, ícono, capturas, política, acceso, anuncios, datos, edades e IARC. Revisar la promoción de marca dirigida a menores.
  6. Cuenta personal nueva: **prueba cerrada con al menos 12 testers durante 14 días seguidos** y después solicitar acceso a producción. Confirmar en la consola; las pruebas internas no cuentan para ese plazo.
  7. Siguen pendientes: licencias transitivas, comprobantes de derechos y la revisión de marca y público infantil (informe de auditoría).
  8. Con acceso a producción, enviar a revisión de Google. Que verifiquen la identidad no significa que aprueben la app.

### PR #41 mergeado
- Ícono habitual con el Matichico y esta bitácora ya están en `main`.


### Ícono habitual: el Matichico (PR #41, mergeado)
- **Decisión de la persona dueña:** el ícono de todo el año pasa del logo del cacao al Matichico.
- Se copiaron los `ic_launcher*` de `resources/temporadas/habitual/android/res` a `android/app/src/main/res` y `store/temporadas/habitual/icon-512.png` a `store/icon-512.png`.
- Las compilaciones con `icono=habitual` (por defecto) llevan el Matichico; con `icono=evento`, el de la temporada.
- Pendiente: subir el nuevo `store/icon-512.png` a la ficha de Google Play cuando corresponda (a mano). No regenerar íconos con `@capacitor/assets`: volvería el logo (ver `docs/PLAY-STORE.md`).

### Prueba en el celular de la persona dueña (compilación nº 73, `main` con #39 y #40)
- ✅ El botón "atrás" funciona: avisa antes de salir en el menú, vuelve al menú desde los juegos y desde la tienda.

### Arte de todas las temporadas (PR #40, mergeado)
- Imágenes de Drive (carpeta "matijiego temporadas") para habitual, San Valentín, Pascua, Niñez (`dianino`), Fiestas Patrias y Navidad.
- Pantalla de carga por evento; sin evento, el arte habitual. Ícono Android e ícono de Play por temporada.
- Todas las imágenes generadas traían "Matjuego" (sin la i) y una insignia aproximada: quedan fuera de los recortes.
- Comprobado en el navegador: cada evento en su fecha real, el habitual, el respaldo, sin internet y el progreso. Ver `docs/TEMPORADAS.md` §9.

### Arreglo del botón "atrás" (PR #39, mergeado)
- En el celular (compilación nº 72) el botón no hacía nada. Causa: se usaba `Capacitor.registerPlugin`, que no existe sin empaquetador. Arreglo: se usa el puente nativo (`Capacitor.addListener` y `nativeCallback`).
- La prueba `scripts/qa/atras.cjs` simulaba mal el puente y por eso no lo detectó. Se corrigió, y ahora falla con el código viejo y pasa con el nuevo.

### Prueba en el celular (compilación nº 72, `icono=evento`)
- ✅ Ícono de Halloween (una sola vez en el escritorio y en el cajón de apps), progreso conservado, pantalla de carga de Halloween y sonido más sobrio.
- ❌ Botón "atrás" sin efecto, arreglado en el #39.

### Halloween: identidad de temporada (PR #38, mergeado)
- Pantalla de carga con arte del evento activo (`js/season-art.js`, `js/splash.js`) e indicador de carga real.
- Ícono Android por temporada al compilar (entrada `icono` del workflow) e ícono para Play.
- `activity-alias` se evaluó y se descartó (ver `docs/TEMPORADAS.md`).
- **Decisiones:** el logo de la polera se deja como está; el ícono de temporada muestra al personaje; las imágenes las generó la persona dueña con IA.

### Pueblo, Ciudad, Mati Merge y sonido (PR #37, mergeado)
- Pueblo: salto, Torre de Cacao, Escalera de Nubes y puertas de juegos (El Gato, Mini Sudoku, Cachipún).
- Ciudad: las misiones vuelven cada día.
- Mati Merge más claro, con botón de pista.
- Sonido con filtro de agudos y limitador.

### Botón "atrás" (PR #36, mergeado)
- Plugin `@capacitor/app`. Quedó sin efecto en el celular hasta el arreglo del #39.

### Google Play: cuenta, llave y primera compilación firmada
- La persona dueña pagó la cuenta de desarrollador; la verificación de identidad está en curso.
- Creó su llave de subida (`upload.keystore`, respaldada fuera del repositorio) y cargó los 4 secretos en GitHub.
- Compilación nº 71: APK de prueba y `.aab` firmado con su llave. La página `https://matichoc.cl/matijuego/privacy.html` está publicada; la persona dueña la vio en su navegador.

## 2026-10-20

### Preparación para Google Play (PR #35 de MAtigame_v0 y PR #46 de matiweb, mergeados)
- Privacidad y licencias dentro de la app, ranking apagado, tipografías libres por defecto, workflow que comprueba permisos y firma, ficha y capturas, y el informe `docs/AUDITORIA-PREPUBLICACION.md`.
- Revisión independiente: se corrigieron la ficha IARC (combate de fantasía), las pruebas de juegos (más estrictas) y las tipografías por defecto.
