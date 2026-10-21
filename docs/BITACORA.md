# Bitácora de Matijuego

Registro de todo lo que se cambia, se decide y se prueba: lo más reciente arriba. Cada entrada dice **qué** se hizo, **dónde** (PR, rama, compilación), **qué se comprobó** y **qué quedó pendiente**. Las decisiones de la persona dueña se anotan como tales.

---

## 2026-10-21

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
