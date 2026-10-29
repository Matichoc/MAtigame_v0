# Bitácora de Matijuego

Registro de todo lo que se cambia, se decide y se prueba: lo más reciente arriba. Cada entrada dice **qué** se hizo, **dónde** (PR, rama, compilación), **qué se comprobó** y **qué quedó pendiente**. Las decisiones de la persona dueña se anotan como tales.

---

## 2026-10-29

### Merges de la persona dueña
- Hizo merge del **PR #50** (casas por dentro, mascotas, corrección del tema Android, `lintRelease` y capturas nuevas) y de su copia web **matiweb #53**: quedan publicados en matichoc.cl. `main` queda en `23e7355`.
- Como ese PR ya está cerrado, la rama `claude/zealous-johnson-2ryf87` se rehízo desde `main` para el grupo nuevo.

### Grupo de mejoras del 29-oct (rama `claude/zealous-johnson-2ryf87`, un solo PR al final)
**Pedidos de la persona dueña** (después de probar el APK 93):
1. Recolecta y Corre: las cintas se mezclan con el piso.
2. Las metas («Mi meta») ya las completó y no se renuevan.
3. Le sobran casi 500 calabazas y no tiene qué más comprar.
4. Pueblo: las casitas de visita quedaron encima de un aro.
5. Las casas que quería por dentro eran las de la **Ciudad** (las cerradas y la Fábrica), para entrar y mirar «como en Pokémon».
6. Parkour: aparecen árboles en los espacios (parece que se puede pasar por entremedio); faltan muros para escalar; casi no salen la casa ni la bajada.
7. Saltos de Porristas necesita un refresh: que la levanten, la lancen, la reciban.
8. Crea tu Chocolate más manual: revolver, llevar los ingredientes, conseguirlos dentro del juego.
9. Aventura Choco: más 3D que 2D y que el monito se vea mejor al avanzar.

**Decisiones de la persona dueña** (preguntas con opciones):
- Fichas que sobran: «Que haya más cosas, pero que al terminar el evento se devuelvan como Matipuntos».
- Metas: «Metas de la semana».
- Porristas: «Rutina de porristas» (equipo que la lanza, figuras en el aire, pirámide; se juega tocando al ritmo).
- Crea tu Chocolate: los ingredientes «se recogen jugando» (no se gastan Matipuntos).

**Qué se hizo** (un commit por tema):
- **`fffec85` Ciudad por dentro, temporada, Recolecta y Pueblo:**
  - Ciudad: 11 puertas se pueden abrir (7 casas, el Kiosco, la Panadería, la Fábrica y la sala del Colegio). Adentro hay muebles, escondites y cosas para «👀 Mirar»; la Fábrica tiene sus máquinas y una misión. Se entra con «🚪 Entrar» o «🚪 Visitar», como en Pokémon.
  - Temporadas: por evento, 5 prendas y 2 decoraciones de Mi Casa más (todas con fichas). Al terminar el evento, las fichas que sobran se cambian **una sola vez** por 2 Matipuntos cada una, con aviso. El cartel del evento ya lo dice.
  - Recolecta y Corre: las cintas van sobre un marco un poco más alto, así no se mezclan con el piso ni con el logo.
  - Pueblo: las casitas de visita respetan los aros del circuito.
- **`c46a31e` Metas de la semana** (reemplazan a «Mi meta», que eran 5 fijas y sin premio):
  - Cada lunes salen 3 metas sacadas de 13 (partidas, Matipuntos, ⭐, visitas, mascota, sobres, vecinos, alfajores, misiones, monedas de la Ciudad, partidos, Parkour). Las de la mascota solo salen si tiene una, y no se repiten las de la semana anterior.
  - Cada meta da +80 Matipuntos y una ⭐; con las 3 cobradas se abre el cofre de la semana (+150 Matipuntos y un sobre).
  - Miden lo que subió cada contador desde el lunes, así no hubo que tocar cada juego.
- **`92b513f` Parkour:**
  - **Los árboles:** eran adornos que flotaban muy cerca del camino, por eso parecía que se podía pasar entremedio. Ahora quedan lejos y más abajo, y no tapan la vista.
  - Muros para escalar (tablas con agarres de colores): empujando hacia el muro, la Matichica trepa con una animación nueva. En la Aventura están en las etapas 1, 4 y 7; en el Mundo infinito salen seguido.
  - Mundo infinito: hay una figura especial cada 6 tramos (45 %), con la casa por los balcones, la bajada y el muro mucho más presentes.
- **`357e5e4` Saltos de Porristas, rutina de equipo:**
  - Las bases cargan a la Matichica y la lanzan; en lo más alto hace una figura (estrella, giro, split; desde el nivel 5 el doble giro y desde el 8 el mortal) y la reciben. Al final del nivel arman una **pirámide** (base, suben, a la cima, ¡ta-dá!).
  - Se juega tocando al ritmo (la pantalla, el botón 👏 o la barra espaciadora) cuando el aro dorado se cierra: «¡Arriba!», la figura y «¡Atrapa!». Abajo, una barrita muestra los 8 tiempos y en cuáles tocar.
  - Si no la reciben a tiempo se pierde un ❤️ (hay 3). Tocar sin parar no sirve: cuenta como «¡Muy pronto!».
  - La música la marca el juego tiempo a tiempo (bombo, aplausos, bajo y una campanita cuando hay que tocar).
  - Se mantienen los 20 niveles (4 a 11 figuras y la pirámide; el ritmo sube de 88 a 132 por minuto), el modo infinito (se apura cada 2 figuras y hay pirámide cada 5), las estrellas (según la precisión) y la energía (1 ⚡ cada 2 figuras). La pirámide sin errores da 10 Matipuntos, como el pompón dorado de antes.
  - Las compañeras se dibujan con piezas agrupadas (InstancedMesh): 13 dibujos para las 5.
- **`7e0f22f` Crea tu Chocolate, cocina a mano:** después de diseñarlo, «👩‍🍳 ¡A la cocina!»:
  1. **Juntar:** en la despensa van apareciendo ingredientes; se tocan los de la receta. Tocar la cebolla, el queso o el pescado avisa «¡Eso no va en un chocolate!».
  2. **Llevar:** se arrastran del canasto a la olla.
  3. **Derretir:** se mantiene apretado para calentar, con el termómetro en lo verde (si se pasa, se quema).
  4. **Revolver:** 4 vueltas con el dedo alrededor de la olla; el relleno se va mezclando.
  5. **Al molde:** se mantiene apretado para verter y se suelta en la raya verde (si no, se rebalsa).
  6. **Decorar:** se toca el molde para espolvorear los toppings.
  - Nada se paga con Matipuntos. Lo hecho a mano suma hasta 150 puntos a la creación.
  - Ingredientes especiales que se **desbloquean cocinando:** el chocolate rosa y la frambuesa liofilizada (al cocinar el primero), el maracuyá y el kataifi (2 cocinados), el pistacho (3) y las hojuelas doradas (4). Las creaciones guardadas de antes cuentan. El reto del día solo pide ingredientes que todos tienen.
- **`de2ecb5` Aventura Choco más 3D:**
  - La cámara mira un poco desde arriba y de lado: se ve el borde de arriba del camino.
  - El camino tiene el doble de fondo, con pastito y florcitas en los bordes, y detrás hay un prado más bajo con árboles (estalagmitas en la cueva y motitas en el cielo de algodón, para que no se confundan con los pinchos).
  - La Matichica corre de tres cuartos (se le ve la cara), gira suave al darse vuelta, quieta mira hacia la cámara, se estira al saltar, se aplasta al caer y levanta polvito al correr y al aterrizar.

**Costo de dibujo** (un cuadro, con sombras; navegador de pruebas, antes → después):
- Saltos de Porristas: 239 → **228 dibujos**; 35.000 → 58.000 triángulos.
- Aventura Choco: 210 → **213 dibujos**; 46.000 → 80.000 triángulos (pastito, flores y árboles agrupados).
- La cocina de Crea tu Chocolate: **44 dibujos** y 6.000 triángulos (menos que la vista de diseño, que usa 197).
- Como referencia, Choco Match, que anda bien en su celular, usa 835 dibujos y 106.000 triángulos.

**Pruebas** (todas contra la variante app, salvo que se diga):
- **Nuevas:** `porristas-rutina.cjs` (una jugadora perfecta gana con 3 estrellas y la pirámide; sin tocar se pierden los 3 ❤️; tocar sin parar no sirve), `creador-cocina.cjs` (la cocina completa con el mouse; se desbloquea el chocolate rosa; no se gastan Matipuntos), `aventura-3d.cjs` (cámara, tres cuartos, estirarse, aplastarse y girar), `semanal-logica.mjs` (17), `parkour-escalar.cjs` y `fichas.cjs`. `visitas.cjs` se amplió a 85 revisiones.
- **Regresión completa, todo en verde (30 de 30):**
  - Lógica: aventura, deportes, merge, puzzles y semanal.
  - Navegador: juegos (15/15, sin conexiones externas), pueblo, contraste, interactivo, lago, puertas-toque, ciudad-barrios, ciudad-diaria, aventura, temporada, album, perfiles, visitas, mascota, fichas, parkour-escalar, porristas-rutina, creador-cocina, aventura-3d, deportes, merge, atras, legal, enlaces y respaldo-nativo.
- `enlaces.cjs` ahora termina la cocina para llegar al resultado de Crea tu Chocolate (en la app no hay botón de WhatsApp; en la web sí).
- **Capturas de la ficha renovadas** (`store/screenshots/*` y `store/feature-graphic.png`), porque Porristas y Crea tu Chocolate cambiaron. Se tomaron desde la variante app con la fecha del aparato en junio (`QA_FECHA`), para que no salga la decoración de Halloween. El único aviso de consola es el del reloj simulado de las pruebas, que no es del juego.

**Copia web:** Matichoc/matiweb#54 (`1d2ddad`), probada contra la demo:
- Pasaron porristas-rutina, creador-cocina, aventura-3d, visitas, fichas, parkour-escalar, mascota, interactivo, puertas-toque, legal y enlaces.
- juegos: 15 de 16. Falla Choco Blaster, el mismo fallo conocido de la web.

## 2026-10-28

### Política pública comprobada
- La persona dueña abrió en su celular la política publicada en matichoc.cl y mandó la captura.
- **Coincide con `app/privacy.html`:**
  - el título «Política de privacidad de Matijuego»;
  - «Versión 1.1 · última actualización: 24 de octubre de 2026»;
  - las 10 secciones, en el mismo orden: Quiénes somos, En resumen, Qué guarda el juego en tu dispositivo, Dónde queda y cómo borrarlo, Conexión a internet y permisos, Niñas y niños, Uso de inteligencia artificial, Software y licencias, Tus derechos y Cambios a esta política.
- La barra del navegador muestra solo el dominio, no la ruta completa.
- Con esto se actualizó la nota de `store/listing-es.md`: decía «NO publicada ni verificada» y ahora dice «publicada y comprobada», con lo que se comparó.

### Prueba en el celular: APK de la compilación 93
- La persona dueña instaló el APK de la compilación 93 (commit `fb23416`, con la corrección del tema Android, las casas por dentro y las mascotas) y contó que **todo funciona correctamente**.
- No se anotaron el modelo del celular ni la versión de Android, ni si se probó cada punto de la lista (muesca, pausa/atrás, modo avión y progreso al instalar encima).
- **Lo que sigue (persona dueña):**
  - Subir a la prueba cerrada en Play Console el AAB firmado de la compilación 93 (versionCode 93) y resolver los avisos de la consola.
  - Reclutar a los testers.
  - Hacer merge del PR #50 y de matiweb #53 cuando lo decida.

## 2026-10-27

### Revisión de publicación de `fdac606`: correcciones para la prueba cerrada (PR #50)
**Revisión independiente** (informe VEREDICTO.md) de `fdac606`, el merge del PR 49:
- **Lo que pasó:**
  - 21 ejecuciones de pruebas aprobadas.
  - Recorrido de los 15 minijuegos sin conexiones externas.
  - APK de prueba y AAB generados e inspeccionados.
- **Por qué no dio la aprobación técnica:** `lintRelease` fallaba con un error NewApi en el tema de recorte de pantalla (mínimo Android 7, API 24).
- **Qué más pidió:** renovar las capturas de la ficha, que eran anteriores al rediseño, y revisar la nota de la política pública.
- **Qué no es:** no es una aprobación de Google ni autoriza producción.
- **Decisión de la persona dueña:** sumar estas correcciones al PR #50. Por eso el APK y el AAB de esta entrega incluyen también todo el grupo del PR #50 (casas por dentro, mascotas y el resto), que la revisión no cubrió.
- **Qué se corrigió:**
  - **Tema Android (NewApi):** `android:windowLayoutInDisplayCutoutMode` salió de `values/styles.xml` y quedó en `values-v28/styles.xml`. Ahí se repite el mismo tema del juego (`AppTheme.NoActionBar`) con esa opción (`shortEdges`).
    - Desde Android 9 se ve igual que antes, también bajo la muesca. En Android 7 y 8 el tema ya no usa una opción que no existe.
    - No se subió el mínimo (sigue API 24), no se apagó la regla y no hay baseline.
    - El parche `correccion-compatibilidad-android.patch` que menciona el pedido no venía adjunto. La corrección se escribió siguiendo lo que describe el informe.
  - **`lintRelease` en el workflow «Compilar app Android»:** hasta ahora el workflow solo compilaba, sin el análisis completo.
    - Ahora `:app:lintRelease` corre en cada compilación y, si encuentra un error, la compilación falla.
    - Las advertencias se muestran en el registro, con la cantidad por regla y desde ahora también el detalle (regla, archivo, línea y mensaje). El informe completo queda como artefacto `matijuego-lint`.
- **Compilación 92** (commit `17c2259`, solo el tema y el paso nuevo), en verde:
  - `assembleDebug` correcto. La comprobación del APK (permisos INTERNET y VIBRATE, sin librerías nativas, sin Choco Blaster, con privacidad y licencias) también pasó.
  - **`lintRelease`: 0 errores y 18 advertencias:**

    | Regla | Advertencias |
    |---|---|
    | UnusedResources | 8 |
    | IconDuplicatesConfig | 2 |
    | MonochromeLauncherIcon | 2 |
    | AndroidGradlePluginVersion | 1 |
    | GradleDependency | 1 |
    | IconDipSize | 1 |
    | IconLocation | 1 |
    | ManifestOrder | 1 |
    | ObsoleteSdkInt | 1 |

    El candidato del revisor (sobre `fdac606`) tenía 16. La diferencia de 2 todavía no está explicada: el detalle de cada advertencia se imprime desde la compilación siguiente, y el informe no se pudo descargar desde este entorno. Ninguna es un error ni el motivo del fallo original.
  - `bundleRelease` firmado con la llave de subida. Huella SHA-256 `47:FE:F7:A3:…:3A:E7:9F`, distinta de la llave pública de pruebas. Sin librerías nativas.
  - versionCode 92.
- **Compilación 93: la final de esta entrega.** Commit `fb23416`, modo tienda (`release=true`: falla si falta la llave de firma), todo en verde: https://github.com/Matichoc/MAtigame_v0/actions/runs/40600386147
  - **Artefactos:**
    - `matijuego-prueba-apk`: APK de prueba con la llave fija de pruebas, que se instala encima del anterior.
    - `matijuego-play-store-aab`: **AAB firmado con la llave de subida**, versionCode **93** (mayor que cualquiera anterior) y versionName 1.0.0. Huella SHA-256 `47:FE:F7:A3:07:7F:4C:40:C3:0A:4F:33:A9:1C:D9:BA:F1:A0:E7:EF:79:F1:5F:62:86:5D:A9:87:89:3A:E7:9F`, distinta de la de pruebas. Sin librerías nativas.
    - `matijuego-lint`: el informe completo.
  - El de la compilación 92 también salió firmado, pero el que corresponde subir es el **93**.
  - **`lintRelease`: 0 errores y las mismas 18 advertencias, ahora con detalle:**

    | Regla | Advertencias | Qué marca |
    |---|---|---|
    | UnusedResources | 8 | `activity_main`, `config.xml`, `ic_launcher_background` (drawable y color), `ic_launcher_foreground`, `package_name`, `custom_url_scheme` y `AppTheme_NoActionBar` (Capacitor lo usa por su nombre desde el código, por eso lint no lo ve) |
    | MonochromeLauncherIcon | 2 | Íconos adaptables sin versión monocromática |
    | IconDuplicatesConfig | 2 | `splash.png` repetido en carpetas |
    | ObsoleteSdkInt | 1 | Carpeta `drawable-v24` innecesaria con mínimo 24 |
    | ManifestOrder | 1 | `<uses-permission>` después de `<application>` |
    | AndroidGradlePluginVersion | 1 | Gradle 8.14.6 disponible (se usa 8.14.3) |
    | GradleDependency | 1 | appcompat 1.8.0 disponible (se usa 1.7.1) |
    | IconDipSize | 1 | `splash.png` |
    | IconLocation | 1 | `splash.png` |

    Ninguna se ocultó y ninguna es un error. Probable causa de que el revisor contara 16: las 2 de «hay una versión más nueva» (Gradle y appcompat) dependen de lo que lint sabe de las versiones publicadas el día que corre. Es una suposición, no está comprobada.
  - No se cambiaron versiones ni recursos para bajar las advertencias (fuera del alcance de esta corrección).
- **Capturas de la ficha:** las 8 de `store/screenshots/` y `store/feature-graphic.png` se regeneraron desde la variante app de esta rama.
  - **Cómo se tomaron:** con los mismos archivos que lleva el APK, en el navegador a tamaño de teléfono y sin retoques.
  - **Formato comprobado:** menú, Bloques, Crea tu Chocolate y Salto en vertical, 1080×1920 JPEG; Parkour, Básquet, Recolecta y Porristas en horizontal, 1920×1080; el gráfico en 1024×500.
  - **Contenido revisado una por una:** el menú nuevo con pestañas y «Continuar mi aventura», y cada juego ya empezado.
  - **Fecha:** se tomaron con la fecha del aparato en junio (`QA_FECHA`), para que no salga la decoración de Halloween, que termina el 2/11. No se tocó el juego.
  - **Script:** `scripts/qa/capturas.cjs` seguía pensado para el menú anterior y apretaba los botones de inicio antes de que aparecieran, así que el primer intento salió con la tarjeta de inicio encima. Ahora espera el botón, comprueba que el juego empezó y espera a que se vaya el aviso de bienvenida.
  - **Errores registrados:** 0 conexiones externas. Los 11 «errores» son un mismo aviso del navegador (un marco vacío sin permiso de scripts), no del juego.
  - Se corrigió en `store/listing-es.md` la descripción de las capturas: decía que todas eran 1080×1920.
- **Política pública:** desde este entorno no se pudo abrir `https://matichoc.cl/matijuego/privacy.html`; la red de la sesión no permite ese dominio.
  - **Lo comprobado:** en matiweb `main` (`7469fcb`), `matijuego/privacy.html` es idéntico byte a byte a `app/privacy.html`. GitHub Pages desplegó ese commit con éxito (27-oct, 14:10) con el dominio matichoc.cl.
  - **La nota de la ficha no se cambió**, porque no se pudo comprobar el estado real de la URL. Para cerrarla hay dos caminos: abrirla en un navegador sin sesión (persona dueña) o permitir matichoc.cl en la red de la sesión.
- **Web:** estos cambios no tocan la web (tema Android, workflow, ficha, documentación y script de capturas): no hay copia en matiweb que actualizar.
- **Qué probar en el celular** con el APK de esta entrega:
  1. Que abra sin cerrarse.
  2. Que se vea a pantalla completa, sin barras.
  3. En un celular con muesca o cámara en la pantalla (Android 9 o más), que el juego llegue bajo la muesca igual que antes.
  4. Si hay un Android 7 u 8 a mano, que abra y se vea a pantalla completa.
  5. Pausa ⏸ y botón atrás.
  6. Modo avión.
  7. Que el progreso siga ahí al cerrar y abrir, y al instalar el APK encima del anterior.
- **Pendiente de la persona dueña** (nada de esto se hizo desde aquí: no hubo publicación, merge ni despliegue):
  - Crear o completar la app en Play Console y subir el AAB firmado de la compilación final de esta entrega a la prueba cerrada.
  - Resolver los avisos que muestre la consola.
  - Reclutar a los 15 voluntarios. El requisito conocido para cuentas personales nuevas es al menos 12 inscritos durante 14 días seguidos; hay que confirmarlo en la consola.
  - Comprobar la URL de la política.

### Casas por dentro y mascotas con vida (mismo grupo de mejoras, PR #50)
Decisiones de la persona dueña sobre la propuesta: casas **«Visitar por dentro»** y mascotas con **«Comida y ánimo»** y **«Jugar con ella»** («Adornarla» quedó fuera).
- **Visitas a las casas** (`js/interiors.js`), al estilo de las casas de Pokémon:
  - **Pueblo:** 3 casitas nuevas (Casa de Bombi, Casa de Capi y Don Cuchufli), ubicadas después de los rincones de la aventura y antes que los árboles, para que nada quede encima.
  - **Ciudad:** se entra por la puerta de Doña Rosa y de Don Pepe. Frente a Rosa sigue apareciendo «Hablar»; «Visitar» solo sale estando más cerca de la puerta que de ella.
  - En la puerta aparece «🚪 Visitar a …». Adentro hay una pieza 3D (vista de casa de muñecas, con el frente abierto) con el vecino, un sillón para sentarse, una mesa, una repisa, una cama y plantas; los muebles no se atraviesan.
  - **Misión del día:** el vecino perdió 3 cosas (libros, pelotas, cuchuflís, semillas o pinceles), que quedan en lugares que cambian cada día. Al encontrarlas y volver a hablarle da **+40 Matipuntos y una ⭐** (sirve para renovar el Pueblo). Una vez al día por casa; la segunda vez solo saluda.
  - El diálogo del Pueblo ahora pasa frase por frase («toca para seguir ▶»).
  - Al salir se vuelve frente a la puerta, con la cámara de frente y en diagonal (detrás del personaje quedaba dentro de la pared, y en la Ciudad el globito de Don Pepe la tapaba).
  - La pieza se arma lejos del mundo solo mientras dura la visita y se desarma al salir. Mientras tanto, las misiones de la Ciudad esperan.
  - **Costo de dibujo:** adentro se dibuja menos de la mitad que afuera (768 contra 1.989 dibujos en dos cuadros, Pueblo). Afuera se suman 3 casitas (unas 24 piezas).
- **Mascotas con vida** (`js/pet-care.js` y `js/pet-buddy.js`), para la mascota que lleva puesta el Matichico:
  - Tiene **🍗 pancita y 💖 ánimo**, que bajan solos con las horas (hambre en ~19 h, aburrida en ~14 h sin jugar).
  - Cuando necesita algo, aparece un globito sobre ella: 🍪 si tiene hambre, ⚽ si quiere jugar.
  - **Golosinas** con Matipuntos: Galletita (15, +30 de pancita) y Bombón (35, +60 y algo de ánimo). Llena, no come más.
  - **Acariciar:** salta y suelta corazones; sube el ánimo (hasta 10 caricias al día cuentan).
  - **Tirar la pelota:** la mascota se suelta del Matichico, va a buscarla, te la trae en la boca y vuelve a su lugar (hasta 8 juegos al día suben el ánimo; jugar da un poco de hambre).
  - **Feliz** (bien comida y contenta) baila cada tanto y a veces encuentra 10 a 20 Matipuntos, hasta 3 veces al día.
  - **Dónde:** en el Pueblo, con el botón 🐾 (solo si lleva una mascota puesta), que abre la tarjeta «Mi mascota»; en Mi Casa, la misma tarjeta arriba de la lista de Vivir. La pausa ⏸ cierra la tarjeta.
- **Pruebas nuevas:**
  - `scripts/qa/visitas.cjs`: 37/37, Pueblo y Ciudad.
  - `scripts/qa/mascota.cjs`: 23/23, con lógica, Pueblo y Mi Casa.
  - Se revisó también que los 8 escondites posibles se alcancen. Uno quedaba sobre la cama y no se podía recoger; se movió.
- **Pruebas de siempre, todas en verde:** interactivo 20, pueblo, lago, puertas-toque, ciudad-barrios, ciudad-diaria, aventura, temporada, contraste 36, juegos 15/15, perfiles 13 y album 15.
- **APK:** la compilación 90 falló en la revisión de privacidad de la app (`verificar-app.mjs`): la palabra `fetch` (el juego de ir a buscar la pelota) se confundía con una conexión a internet. Se renombró a `chase` en `js/pet-buddy.js`; la revisión queda igual de estricta y ahora pasa.
  La compilación 91 (`e106c40`) pasó en verde: https://github.com/Matichoc/MAtigame_v0/actions/runs/40595103683 . Copia web en matiweb #53 (`34632ba`): visitas 37/37, mascota 23/23, interactivo 20/20, juegos 15/16 (Choco Blaster, fallo conocido).

### Mundos más interactivos (mismo grupo de mejoras, PR #50)
Pedido de la persona dueña: que el Pueblo y la Ciudad sean interactivos (sentarse en bancas, puentes que se cruzan solo por el puente, binoculares para mirar el horizonte, publicidades bien puestas, entrar a casas con misiones y mascotas con más vida). En este grupo va lo primero; lo de casas y mascotas queda como propuesta para elegir.
- **Carteles al revés:** el logo de Matichoc (`makeLogo`, usado en la fábrica, la fuente, los autos y casi todos los juegos) y los letreros de las tiendas de la Ciudad eran una lámina de doble cara. Por detrás se leían espejados. Ahora son dos caras de un solo lado: cuesta un dibujo más por logo y se lee derecho por los dos lados.
- **Sentarse en las bancas:**
  - **Ciudad:** las 7 bancas.
  - **Pueblo:** 3 bancas nuevas junto a la fuente, y la del Rincón de Bombi cuando está arreglada.
  - Junto a una banca aparece «🪑 Sentarse». El personaje queda sentado sobre la tabla (pose "sit" de Mi Casa) y se levanta con «Levantarse», moviendo el joystick o saltando.
- **Puente del bosque:**
  - El arroyo ya no se cruza por cualquier parte: solo por el puente (o, antes de arreglarlo, por los tablones del mismo lugar).
  - Sobre el puente y el muelle del lago se camina por encima: son pisos de 0,48 de altura que se suben sin saltar.
- **Binoculares** (`js/binoculars.js`), en la punta del muelle de la playa (Ciudad), en la punta del muelle del lago y arriba del mirador (Pueblo; ambos cuando están arreglados):
  - Con «🔭 Mirar el horizonte», la cámara sube al binocular con zoom.
  - El joystick o arrastrar el dedo giran la vista; − y + cambian el zoom; «Dejar de mirar» vuelve.
  - Mientras se mira, se esconden los paneles del juego.
- **Costo de dibujo:** se agregan 3 bancas y 3 binoculares (unas 40 piezas, siempre dibujadas solo en su zona) y una cara más por logo. No hay efectos nuevos.
- **Pruebas:**
  - Nueva `scripts/qa/interactivo.cjs`: 20/20.
  - `lago.cjs` ampliada con el arroyo y los pisos del puente y el muelle: 9/9.
  - `puertas-toque.cjs` ahora espera el botón en vez de un tiempo fijo: con dos pruebas a la vez a veces no alcanzaba.
  - Además: juegos 15/15, ciudad-barrios 20, ciudad-diaria 6, pueblo 24, aventura 57, deportes 52, atras 26, contraste 36, album 15, puertas-toque 12.
- **APK y web:** APK de prueba en la compilación 89, en verde (https://github.com/Matichoc/MAtigame_v0/actions/runs/40585405873). Copia web en matiweb #53 (`9f9a1ac`): interactivo 20/20, juegos 15/16 (Choco Blaster, fallo conocido; Porristas falló una vez y al repetirla pasó).

### Grupo de mejoras (un solo PR): lago, Recolecta, playa y álbum
**Decisión de la persona dueña:** juntar las mejoras en grupos y abrir un solo PR por grupo. Este grupo se suma al PR #50, que sigue abierto, y a su copia web matiweb #53.
- **Pueblo, lago:** se podía caminar sobre el agua.
  - Causa: con el muelle arreglado, la franja por la que se puede pisar seguía 6,5 m más allá de la punta del muelle.
  - Ahora termina en la punta (`DOCK`/`DOCK_END` en `js/town-zones.js`).
  - Prueba nueva `scripts/qa/lago.cjs`: antes había 73 puntos de agua pisables, ahora 0. Caminando por el muelle, ahora se detiene en la punta (antes llegaba a z −9,9).
- **Recolecta y Corre:** al empujar contra una pared sonaba un zumbido en cada cuadro (unas 60 veces por segundo).
  - Contra paredes ya no suena nada: el personaje solo se detiene o se desliza.
  - El rebote con obstáculos que se mueven suena a lo más 2 veces por segundo.
- **Ciudad, playa:** 3 de las lomas de pasto decorativas que rodean la ciudad asomaban sobre la arena, y una junto al mar.
  - Ahora no se ponen sobre la playa, el parque, el colegio ni el mar.
  - Hay menos lomas que dibujar.
  - Al revisar la orilla completa (pedido de la persona dueña: nada de pasto entre la playa y el mar), fuera de la playa el pasto llegaba directo al agua. Ahora una franja de arena con espuma sigue por toda la orilla.
- **Álbum de figuritas** (análisis medido con simulación, decisiones de la persona dueña: kiosco, taller visible y página de temporada):
  - **Antes:** completar el álbum (96) costaba unos 300 sobres a pura suerte, o 130 usando el taller. Faltando 2 figuritas, se necesitaban unos 40 sobres si eran normales y unos 120 si eran brillantes (hasta 240). El taller existía, pero casi no se veía, y el botón «Vender repetidas» se llevaba las repetidas que servían para cambiar.
  - **Kiosco:** tocar una figurita que falta abre su cuadro. Se puede cambiar por repetidas (12 por una normal, 36 por una brillante) o comprar con Matipuntos (400 una normal, 1.200 una brillante).
  - **Taller visible:** las que se pueden cambiar dicen «🔄 ¡Cámbiala!». Antes de vender repetidas, el juego avisa cuántas faltan y cuántas se podrían cambiar.
  - **Página de temporada:** cada evento (San Valentín, Pascua, Fiestas Patrias, Día del Niño, Halloween, Navidad) tiene 12 figuritas + 2 brillantes.
    - Mientras dura el evento, el 40 % de las figuritas de los sobres son de su página.
    - Completarla da +300 Matipuntos y +30 fichas del evento.
    - Fuera de su temporada se ve al final del álbum con «vuelve en su temporada»: no se puede comprar ni cambiar.
    - El contador del álbum base (96) y sus premios no cambian.
    - Simulación: completar la página de temporada toma ~28 sobres (45 en el 10 % de peor suerte), alcanzable dentro de un evento.
  - Prueba nueva `scripts/qa/album.cjs` (15 revisiones).
- **APK de prueba:** compilación 87 (álbum, lago, Recolecta) y compilación 88 con todo el grupo, incluida la orilla (https://github.com/Matichoc/MAtigame_v0/actions/runs/40543820615), ambas en verde. Copia web en matiweb #53; en la demo, `ciudad-barrios` no pasa porque la demo solo deja las primeras misiones de la Ciudad (`DEMO_LIMITS.ciudad`), como es de esperar.
- **Pruebas:** lago 5/5, puertas-toque 12/12, album 15/15, atras 26, contraste 36, perfiles 13, temporada 29, pueblo 24 (corriendo junto a otra prueba falló el robot del parkour por lentitud del equipo; sola pasó).

### Minijuegos del Pueblo (Gato, Sudoku, Cachipún): se abrían y se cerraban solos
- **Prueba en el celular de la persona dueña:** con un toque corto en «Entrar», el minijuego no se quedaba abierto; había que mantener el dedo apretado unos segundos.
- **Causa:**
  - El botón de acción del Pueblo actúa al apoyar el dedo (para que responda rápido mientras se usa el joystick).
  - Al levantar el dedo, el celular envía además un "clic". Ese clic caía sobre el fondo del cuadro recién abierto, y tocar el fondo cierra el cuadro.
  - Con el dedo apretado varios segundos el celular no envía ese clic; por eso así sí funcionaba.
- **Arreglo:**
  - El fondo de los cuadros (minijuegos, pausa y privacidad) solo cierra si el toque empezó en el fondo (`closeOnBackdrop` en `js/main.js` y lo mismo en `js/town-puzzles.js`).
  - Nueva `eatGhostClick` en `js/three-kit.js`: los botones de acción del Pueblo y de la Ciudad descartan el clic que llega al levantar ese mismo dedo. Sigue al dedo y no usa un plazo fijo, porque abrir la tienda puede tardar más de un segundo.
  - Se encontró el mismo problema al entrar a la Boutique desde el Pueblo: el clic caía dentro de la tienda recién abierta. Ahora no toca nada.
- **Prueba nueva:** `scripts/qa/puertas-toque.cjs` toca como un dedo real. Antes del arreglo fallaba en las 3 puertas; ahora pasa 12/12 (las 3 puertas se quedan abiertas, el fondo las cierra, y la Boutique se abre sin tocar nada adentro).
- **Otras pruebas:** pueblo 24, ciudad-barrios 20, ciudad-diaria 6, atras 26, legal OK, deportes 52, juegos 15/15. Porristas falló una vez al correr junto a deportes; sola pasó.
- **PR y compilación:** PR #50; APK de prueba: compilación 86 en verde (https://github.com/Matichoc/MAtigame_v0/actions/runs/40522360058).
- **Copia web:** Matichoc/matiweb#53. Probada contra la demo: puertas-toque 12/12, juegos 15/16 (Choco Blaster, fallo conocido de la web), legal y enlaces OK.

### PR #49 y matiweb #52 mergeados
- La persona dueña hizo merge de #49 (rayas en la Ciudad y el Pueblo, y contraste de textos) y de su copia web Matichoc/matiweb#52: quedan publicados en matichoc.cl. Último APK de prueba: compilación 85.

### Rayas que parpadean en la Ciudad y el Pueblo; textos que no se leían
- **Prueba en el celular de la persona dueña:**
  - En la entrada de la Playa Choco, el suelo se veía "tildado": rayas que parpadean entre la calle y la arena.
  - En «Renovar el Pueblo», los botones de Pichanga y Básquet y los «Cambiar estilo» no se leían.
  - La bandera de Aventura ya se ve bien (con la M y el logo).
- **Causa de las rayas:** pisos superpuestos exactamente a la misma altura. El celular no sabe cuál va encima y alterna, cuadro a cuadro, entre uno y otro. Medido con un detector de pisos superpuestos (en el navegador, recorriendo la escena):
  - **Ciudad:** la arena de la playa, el pasto del parque y el patio del colegio estaban a 0,03, igual que el tope de las calles. El pasto de las manzanas quedaba a 0,005 de la vereda.
  - **Pueblo:** los suelos de la Granja y el Lago se tocaban a 0,02, y dos parches de la cancha estaban a 0,04.
- **Arreglo:**
  - Los suelos de los barrios de la Ciudad pasan a 0,015, bajo la calle; el pasto de las manzanas, a 0,075.
  - Cada barrio del Pueblo tiene su altura: bosque 0,02, granja 0,035 y lago 0,05, con la arena y el agua del lago por encima.
  - El plano cercano de la cámara sube de 0,1 a 0,3 en la Ciudad y el Pueblo. Así la cámara distingue tres veces mejor qué piso va encima.
  - Ahora ningún par de pisos superpuestos queda a menos de 0,015. El costo de dibujo no cambia: no se agregó nada que dibujar.
- **Textos:** prueba nueva `scripts/qa/contraste.cjs`. Recorre el menú (sus pestañas), los cuadros, las pantallas internas, las tarjetas de inicio, los juegos y la pausa, y mide el contraste de cada texto contra su fondo real. Se arregló todo lo que quedaba bajo 3:1:
  - **«Renovar el Pueblo»:** los botones claros sobre tarjetas claras tenían letra crema (1,0:1); ahora tienen letra oscura.
  - **Títulos:** el rosado de las cabeceras pasó de 2,8:1 a un rosado más claro.
  - **Barra de energía:** su fondo pasa a claro; con poca energía, el número oscuro caía sobre la parte vacía.
  - **Accesos del menú en el computador:** degradados más profundos bajo la letra blanca (antes 2,1:1).
  - **Pueblo:** «Actividades» y el botón del pedido del vecino con un rosado más profundo.
- **Pruebas:**
  - Bien: contraste (todo se lee), ciudad-barrios 20, ciudad-diaria 6, pueblo 24, juegos 15/15, merge 30, atras 26, deportes 52, aventura 57.
  - Pueblo, corriendo junto a otras 3 pruebas, dio 6 fallos del robot del parkour por lentitud del equipo. Sola pasó 24/24.
- **PR y compilación:** PR #49; APK de prueba: compilación 85 en verde (https://github.com/Matichoc/MAtigame_v0/actions/runs/40515591226).
- **Copia web:** Matichoc/matiweb#52. Probada contra la demo: juegos 15/16 (Choco Blaster, fallo conocido de la web), contraste 36 revisiones sin fallos, legal y enlaces OK.
- **Pregunta de la persona dueña:** cómo instalarlo en el iPhone de un amigo.
  - Hoy, con la demo web en Safari: Compartir → «Agregar a pantalla de inicio».
  - La app de verdad en iPhone necesita la cuenta de Apple Developer (USD 99 al año) y TestFlight (fases C3 y C4 de `docs/PLAN-ANDROID-IOS.md`). La compilación de iOS actual solo sirve para el simulador.

### PR #48 y matiweb #51 mergeados
- La persona dueña hizo merge de #48 (tirones, flor de chocolate y rediseño en el celular) y de su copia web Matichoc/matiweb#51: el rediseño queda publicado en matichoc.cl. Último APK de prueba: compilación 84.
- La rama `claude/zealous-johnson-2ryf87` se reinició desde `main`.
- Sigue pendiente: probar el APK en el celular, dejar privado el repositorio y apagar Pages.

### Juego bloqueado: el aviso de bienvenida ya no tapa los botones
- En la captura acostada, el aviso "¡Hola…! Ahora toca «Continuar mi aventura»" quedaba encima de «Ahora no». Además se tragaba los toques: los avisos van sobre los cuadros y no dejaban pasar el dedo.
- Ahora los avisos dejan pasar los toques (`pointer-events: none` en `.toast`) y se esconden al abrir un juego bloqueado (`openUnlockDialog`).
- Medido: el cuadro cabe entero en 915×412, 740×360, 412×915 y 360×640.
- `temporada.cjs` tenía la línea `clock.pauseAt` repetida: con el equipo cargado fallaba al "volver atrás" el reloj. Se quitó la repetida (29/29).
- Pruebas: atras 26, perfiles 13, juegos 15/15, temporada 29.
- APK de prueba: compilación 84 en verde sobre `d4b7140` (https://github.com/Matichoc/MAtigame_v0/actions/runs/40425424084). Copia web en Matichoc/matiweb#51 (`63080a9`): juegos 15/16 (Choco Blaster, conocido), perfiles 13, enlaces OK.

### Tarjeta de inicio: la ayuda "?" empieza cerrada
- En el computador la web abría sola todas las secciones "Cómo se juega". En la tarjeta nueva esa ayuda es un panel que tapa las opciones, así que no se podía elegir dificultad (Pichanga, Básquet 2v2) ni nivel (Parkour). Lo detectaron `deportes.cjs` y `juegos.cjs`.
- Ahora en la tarjeta la ayuda empieza cerrada y se abre con el "?" (`decorateIntro` y `foldSecondary` en `js/main.js`).
- APK de prueba: compilación 83 en verde sobre `adb6e01` (https://github.com/Matichoc/MAtigame_v0/actions/runs/40423543477).
- Copia web en Matichoc/matiweb#51 (`6d69611`). Probada contra la demo: juegos 15/16 (Choco Blaster, fallo conocido de la web), aventura 57, pueblo 24, deportes 52, legal y enlaces OK. `atras.cjs` es solo para la app: en la demo Fútbol viene desbloqueado y no aparece el cuadro de canje.
- Descripciones de #48 y matiweb#51 al día con el rediseño.
- Pruebas: deportes 52/52, juegos 15/15. El resto ya había pasado con el rediseño: aventura 57, pueblo 24, ciudad-barrios 20, ciudad-diaria 6, merge 30, atras 26, temporada 29, perfiles 13, respaldo-nativo 13, legal y enlaces OK.

## 2026-10-26

### Rediseño aprobado, construido: pantalla completa, pausa, tarjetas de inicio, menú con pestañas y juego bloqueado
- Construido en este mismo PR (#48), sobre las 5 maquetas aprobadas. Todo lo nuevo de pantalla y menú es **solo para pantallas táctiles**; en el computador la web queda como antes.
- **1 y 2 · Juegos a pantalla completa** (estilos comunes para los 15 juegos; `css/style.css` "CELULAR: JUEGOS A PANTALLA COMPLETA"):
  - El escenario 3D ocupa toda la pantalla, también bajo la muesca, sin marco ni barra de título.
  - Arriba flotan píldoras semitransparentes y botones redondos de 44 px, sin desenfoques: en celulares modestos obligan a recomponer la pantalla en cada cuadro.
  - En los minijuegos se esconde la píldora del total de Matipuntos, que no se usa al jugar; así no se apilan píldoras.
  - **Pueblo:** arriba solo ⭐, Matipuntos y el evento; el objetivo del vecino arriba al centro; Actividades bajo la pausa.
  - **Ciudad:** la misión arriba al centro; el minimapa y la brújula bajo los botones.
- **Pausa ⏸** (decisión de la persona dueña: pausa en vez de 🏠):
  - Cuadro "Pausa" con Seguir jugando, Sonido y Salir al menú.
  - El juego queda quieto: `Game3D.setPaused` congela el bucle. No se llama `hold` porque Bloques ya usa `hold` para la pieza guardada; se detectó con la prueba de "atrás".
  - El "atrás" del celular dentro de un juego ahora abre la pausa (antes avisaba "toca otra vez"); con la pausa abierta, la cierra.
  - El botón de sonido de cada juego pasó dentro de la pausa.
- **3 · Tarjeta de inicio** (`decorateIntro` en `js/main.js`, para todas las tarjetas):
  - Imagen del juego con su nombre a la izquierda (arriba en el celular de pie); a la derecha solo lo que se toca: modos, nivel y un botón grande.
  - "Cómo se juega" pasa a un botón **?** que abre las reglas encima. Las descripciones largas quedan dentro del "?".
- **4 · Menú en el celular:**
  - Barra de abajo: 🏠 Inicio · 🎮 Juegos · 🏘️ Pueblo (entra directo) · 👕 Mi Matichico.
  - Cabecera corta: tú, Matipuntos, energía, nivel y 🎁.
  - "Continuar mi aventura" es la tarjeta principal, con la imagen del Pueblo.
  - Juegos en cuadrícula de 2, con su imagen entera y el candado con el precio.
  - En "Mi Matichico" van el escenario del personaje, Vestuario, Mi Casa, Mis lugares, Nivel y álbum, Logros, Puntajes y Joystick.
  - Con un perfil nuevo sin Matichico, el menú abre en "Mi Matichico" para elegirlo; al elegirlo, vuelve a Inicio.
- **5 · Juego bloqueado:**
  - Imagen del juego, barra "1.240 / 2.000 🍫 · te faltan 760".
  - Si no alcanza, **"🎮 Ganar Matipuntos"** lleva al último juego jugado o al Pueblo; antes era un botón gris deshabilitado.
- **Error de antes, corregido:** el botón "Nuevo: Básquet 2 contra 2" estaba en la tarjeta de **Recolecta y Corre**; ahora está en la de **Lanzamientos de Básquet**.
- **Costo de dibujo:** el lienzo ocupa toda la pantalla, así que dibuja ~15–20 % más de píxeles; no hay efectos nuevos ni desenfoques. Lo compensa el ajuste de calidad continuo, pero hay que mirarlo en el celular modesto.
- **Pruebas actualizadas:** `atras.cjs` (pausa con atrás y con ⏸, Salir al menú), `aventura.cjs` y `deportes.cjs` (salen por la pausa).
- **Pendiente:** probarlo en el celular, en especial muescas, el "?" y la barra de abajo.

### Tirones en la Ciudad (playa) y en la bandera de Aventura; fuego → chocolate
- **Prueba de la persona dueña, en su celular de gama alta:**
  - En la Ciudad, al pasar hacia la playa, "se empieza a tildar la pantalla muchísimo… el mapa como que se pone en negro".
  - Lo mismo pasa al llegar a la bandera de Aventura.
  - Además, la flor sale poco. Pidió "camuflar" todo lo que sea fuego con chocolate, para que el chocolate cubra a los malvaviscos.
- **Causas encontradas (medidas en el navegador de prueba):**
  1. **Cosas que se preparaban recién al aparecer en pantalla.** El celular arma los efectos y las imágenes de cada objeto la primera vez que lo ve: el castillo y la bandera de la meta, los barrios de la Ciudad y los premios de los bloques ?.
     - Medido: al llegar a la bandera aparecían +2 efectos y +2 imágenes en un solo cuadro, de **516 ms** (lo normal son ~115).
     - Al cruzar hacia la playa aparecían efectos e imágenes nuevos entre los 50 y 60 m.
  2. **La calidad se ajustaba solo en los primeros ~3 s.** Si el comienzo era liviano, el juego decidía que el celular aguantaba todo y no volvía a mirar, aunque después llegara una zona pesada como la playa (mar y arena enormes).
  3. **El juego activo podía ser el "más viejo" para el sistema que suelta contextos 3D:** anotaba su uso solo al empezar. Es un riesgo de pantalla negra si se abre otro motor 3D a mitad de partida.
  4. **Cada disparo de la flor creaba una esfera y un brillo nuevos:** tirón en el primer disparo y memoria que se acumulaba.
- **Arreglos:**
  - **`Game3D.warmUp()`** (`js/three-kit.js`): con la tarjeta de inicio en pantalla, prepara todos los efectos e imágenes de la escena, también lo escondido, y dibuja un cuadro con todo. En Aventura se repite al pasar de nivel o elegir otro.
    - Después del arreglo: en la bandera, 0 efectos y 0 imágenes nuevos y el peor cuadro baja de 516 a **217 ms**. Camino a la playa no aparece nada nuevo.
  - **Calidad continua:** después de la calibración inicial sigue mirando durante el juego. Con ~6 s seguidos bajo 24 cuadros por segundo, baja otro escalón (brillo → resolución → sombras).
  - **El juego en uso anota que está activo en cada cuadro**, para que nunca sea el que se suelta.
- **Aventura, de fuego a chocolate:**
  - **Flor de cacao:** pétalos crema y caramelo con el corazón de chocolate.
  - **Disparos:** bolitas de chocolate brillante con una gotita. Hay 2 listas en el nivel, así que no se crea nada al disparar.
  - **Malvaviscos:** quedan **bañados en chocolate** y se derriten despacio ("¡Bañado! +150 🍫").
  - **Salpicadura y brillo:** la salpicadura es de chocolate y el brillo del personaje, crema.
  - **Botón y textos:** el botón es 🍫 color cacao y los textos y la ayuda hablan de chocolate.
  - **La flor sale más:** hay más bloques de poder (38 % en vez de 30 %). Si eres chico, la mitad de las veces sale directo la flor (antes solo el hongo); el primer bloque sigue dando el hongo, para aprender.
  - **Documentos al día:** ficha, auditoría y guía legal ya no hablan de fuego.
- **Pruebas (navegador, app):**

  | Prueba | Resultado |
  |---|---|
  | juegos | 15/15 |
  | aventura | 57 |
  | pueblo | 24 |
  | ciudad-barrios | 20 |
  | ciudad-diaria | 6 |
  | merge | 30 |
  | deportes | 52 |
  | atrás | 24 |
  | temporada | 29 |
  | perfiles | 13 |
  | respaldo-nativo | 13 |
  | lógica | OK |

  - Prueba directa del chocolate: el malvavisco queda café (`5a2d16`) y cada disparo crea 0 efectos y 0 piezas nuevas.

### Propuesta visual: 5 maquetas aprobadas
- La persona dueña pidió ser "altamente minucioso" con cómo se ve el juego, y mockups para idearlo juntos.
- **Maquetas** (en la carpeta local `maquetas/`, fuera de git): cada una tiene la captura real y la propuesta, hecha con la letra, los colores y las imágenes del juego.
  1. Juego a pantalla completa (Ciudad).
  2. Pueblo con un solo objetivo.
  3. Tarjeta de inicio con modos en dibujos.
  4. Menú con barra abajo.
  5. Juego bloqueado con barra de avance.
- **Decisión de la persona dueña:** aprobó **las 5** y el botón de **pausa ⏸** (seguir · sonido · salir) en vez de 🏠. Se construyen en orden, cada una con su APK.

## 2026-10-24

### PR #47 y matiweb #50 mergeados
- La persona dueña revisó las capturas de iOS y mergeó el **PR #47** (Android + iOS: copia del progreso, vibración, proyecto iOS, plan de publicación y repositorio listo para privado).
- **matiweb #50** también se mergeó: la política v1.1 queda publicada en matichoc.cl/matijuego/privacy.html, la dirección que piden Google Play y el App Store.
- **Pendientes de la persona dueña:**
  - Probar la APK nº 81 encima de la actual: que el progreso siga, que vibre y que "atrás" funcione.
  - Despublicar Pages y pasar este repositorio a privado.
  - Las 6 decisiones de `docs/PLAN-ANDROID-IOS.md` §9.

### Primera compilación de iOS: en verde
- **Workflow "Compilar app iOS"** (ejecuciones 1 y 2, Mac de GitHub con Xcode 26.3): compila para el simulador y la app abre en un **iPhone SE (3.ª gen.)** y un **iPad mini (A17 Pro)** simulados, sin cerrarse.
  - **Info.plist final:** `cl.chocojuego.matichoc`, versión 1.0.0, arm64, sin barra de estado, sin cifrado propio.
  - Dentro de la app están el juego, la política y `PrivacyInfo.xcprivacy`; Choco Blaster no está.
- **Capturas:** muestran la pantalla de perfiles con logo, letras y botones correctos, como la primera vez en Android. Las de los 20 s y los 45 s son iguales porque nadie toca la pantalla.
- **Cómo se ven sin descargar artefactos:** el entorno de Claude no llega al almacenamiento de artefactos de GitHub, así que el workflow ahora también deja una copia chica de cada captura en su registro.
- **Ajuste:** para la próxima corrida, el simulador elige el iPhone más nuevo (con Dynamic Island) en vez del SE, para revisar los bordes de la pantalla.
- **Pendiente:** que el workflow entre al juego (crear perfil, abrir un juego) para revisar más pantallas; hoy solo muestra la primera.

### Repositorio privado y autoría de los commits
- **Pedido de la persona dueña:**
  - Dejar privado el repositorio del juego, sin confundirlo con matiweb, que sigue público como la web con la demo.
  - Que los commits se vean más humanos.
- **Revisión:**
  - MAtigame_v0 es público y no tiene forks.
  - `deploy-pages.yml` publicaba **todo** el repositorio en GitHub Pages en cada merge a `main` (bitácora, auditoría, `admin/`, llave de pruebas), aunque la portada solo redirigía a matichoc.cl.
  - matiweb publica matichoc.cl con Pages y debe seguir público: en el plan gratis un repositorio privado no puede usar Pages.
- **Decisiones de la persona dueña:**
  - Commits **a su nombre, sin marcas**.
  - Borrar el Pages **solo de Matijuego**.
  - Compilación de iOS **solo a mano**.
- **Hecho:**
  - Se borró `deploy-pages.yml`.
  - `ios.yml` ahora corre solo a mano.
  - `CLAUDE.md` tiene la regla de autoría y la del repositorio privado.
  - `git config` en los dos repositorios: `Cristóbal <45877061+cristobalrocosaavedra@users.noreply.github.com>`.
  - Plan §8 y README actualizados.
  - Los commits antiguos no se reescriben: habría que forzar `main` y romper los PR ya mergeados.
- **Pendiente (persona dueña, en GitHub):** MAtigame_v0 → Settings → Pages → *Unpublish site* y Settings → General → *Change visibility* → Private.
- **Pruebas web de este PR (matiweb, demo):**

  | Prueba | Resultado |
  |---|---|
  | perfiles | 13/13 |
  | temporada | 29/29 |
  | pueblo | 24/24 |
  | legal | OK |
  | enlaces | 0 conexiones externas |
  | juegos | 14/16 |

  En juegos, Choco Blaster es el fallo conocido de la web. Porristas falló por lentitud del navegador de prueba y sola da OK.

### Plan Android + iOS y primeros pasos de iOS
- **Pedido de la persona dueña:** revisar el repositorio a fondo y armar y ejecutar un plan para que el juego esté en Android y iOS. Android debería ir a prueba y publicarse en 1–2 semanas; iOS, si le va bien.
- **Plan:** `docs/PLAN-ANDROID-IOS.md`. Tiene el estado, el calendario (Android en prueba cerrada desde la semana del 3-nov y producción hacia fines de noviembre), las fases, los riesgos y 6 decisiones pendientes de la persona dueña.
- **Revisión:**
  - Android está bien encaminado: la firma ya está en GitHub y la ejecución nº 80 generó el `.aab` firmado.
  - Riesgo nuevo encontrado: todo el progreso vivía solo en localStorage, y en iPhone iOS puede borrarlo si falta espacio.
  - La vibración no funcionaba en ningún celular: Android exige el permiso VIBRATE e iOS no tiene `navigator.vibrate`.
- **Hecho:**
  - **`js/native.js`** (se carga primero en `main.js`):
    - Copia de todas las claves `matichoc_*` en el almacenamiento propio de la app (`@capacitor/preferences`): cada 20 s si cambió algo, al pasar a segundo plano y al cerrar.
    - Si al abrir no hay perfiles pero sí copia, se restaura antes de leer los perfiles. Una copia buena nunca se pisa con una vacía.
    - Vibración con `@capacitor/haptics`.
    - En la web no hace nada.
  - **Prueba nueva `scripts/qa/respaldo-nativo.cjs`** (simula el puente de un iPhone): 13/13.
  - **Android:**
    - Permiso nuevo VIBRATE (normal, sin aviso).
    - El workflow ahora exige exactamente INTERNET + VIBRATE.
    - Política v1.1: menciona la vibración y la copia dentro del teléfono.
    - Créditos con los plugins nuevos, todos MIT.
    - Ficha (`store/listing-es.md`) al día.
  - **Proyecto iOS (`ios/`):**
    - Capacitor 8.5.3 con Swift Package Manager; bundle ID `cl.chocojuego.matichoc`, el mismo de Android; mínimo iOS 15.
    - `Info.plist`: español, arm64, sin barra de estado, pantalla completa en iPad, sin cifrado propio.
    - `PrivacyInfo.xcprivacy`: sin rastreo ni datos, UserDefaults con motivo CA92.1.
    - Íconos y pantalla de inicio desde `resources/`.
    - `capacitor.config.json`: sin rebote.
  - **Workflow nuevo "Compilar app iOS"** (Mac de GitHub, sin cuenta de Apple): compila para el simulador, revisa el contenido, abre la app en iPhone y iPad simulados y saca capturas.
- **Pruebas de la app (navegador):**

  | Prueba | Resultado |
  |---|---|
  | respaldo-nativo | 13/13 |
  | atrás | 24/24 |
  | perfiles | 13/13 |
  | legal | OK |
  | enlaces | OK |
  | lógica (aventura, merge, deportes, puzzles) | OK |
  | `verify:app` | OK |

- **Pendiente:** ver los workflows de Android e iOS en el PR, revisar las capturas del simulador, la prueba en el celular y las decisiones del plan (§8).

### Video promocional (para redes y para buscar testers)
- **Pedido de la persona dueña:** buscar una skill o una capacidad para generar un video atractivo con capturas del juego, publicitarlo en todos lados y empezar a buscar testers.
- **Plugins:** busqué en el catálogo y encontré `video-shotcraft` (videos con Remotion) y `ffmpeg-llm`. Le mostré la tarjeta para instalarlos, pero no hacen falta: aquí ya están ffmpeg y el navegador de pruebas.
- **Hecho (`scripts/video/`, guía en `docs/VIDEO-PROMOCIONAL.md`):**
  - **Grabador cuadro a cuadro** (`reloj.cjs` + `grabar.cjs`): el tiempo del juego avanza 1/30 s por cuadro, así el video sale fluido aunque el navegador sin tarjeta gráfica tarde ~1,5 s por cuadro.
  - **Escenas que se juegan solas, con partidas reales:**
    - Pueblo en monopatín y Renovar el Pueblo (lista de tareas y escena del lago).
    - Pichanga y Básquet 2v2, manejados por el "jugador humano" de las pruebas.
    - Ciudad con piloto automático por la avenida.
    - Parkour infinito con un piloto que salta en el borde de cada plataforma.
    - Mati Merge arrastrando productos con el dedo.
    - Cortes rápidos de Salto, Bloques, Crea tu Chocolate y Autos.
  - **Carteles** (`carteles.cjs`): portada, título por escena y cierre "¿Tienes Android? ¡Sé tester!" con matichoc.cl/matijuego. Usan la letra libre Fredoka y el logo.
  - **Montaje** (`montar.cjs`, ffmpeg): versión horizontal 1920×1080 (YouTube, ficha de Play) y vertical 1080×1920 (Reels, TikTok, Shorts, estados).
  - El audio va en silencio a propósito: la música se agrega en la app de cada red, con canciones que tienen permiso.
- **`scripts/qa/jugador-humano.mjs`:** ahora también se puede cargar en el navegador (no usa `process` fuera de Node).
- **Pendiente:**
  - La persona dueña revisa el video.
  - Definir por dónde se inscriben los testers (sugerencia: un Grupo de Google) y poner ese enlace en la publicación.

### PR #46 y matiweb #49 mergeados
- La persona dueña hizo merge de **PR #46** (aventura "Renovar el Pueblo", barrios nuevos en Pueblo y Ciudad, pedidos diarios de Mati Merge) y de **matiweb #49** (la misma versión en la web, matichoc.cl/matijuego).
- APK de prueba de esta versión: **nº 80** (run 40043895224), lista para probar en el celular.
- **Pendiente:** prueba en el celular de la APK nº 80 (lista de tareas, barrios, pedidos de 2 productos, fluidez).
- **Pendiente opcional (no pedido aún):** aliviar el costo de dibujo del Pueblo y la Ciudad (ya rondaban 1.300–1.800 dibujos por cuadro).

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
