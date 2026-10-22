# Bitácora de Matijuego

Registro de todo lo que se cambia, se decide y se prueba: lo más reciente arriba. Cada entrada dice **qué** se hizo, **dónde** (PR, rama, compilación), **qué se comprobó** y **qué quedó pendiente**. Las decisiones de la persona dueña se anotan como tales.

---

## 2026-10-22

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
- Compilación nº 75 (APK de prueba, sin `release`) desde la rama: en verde. Se lanzó otra con el ajuste del menú (número y enlace en la entrada de abajo, cuando termine).
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
