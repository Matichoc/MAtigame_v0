# Temporadas: arte del evento en la app, en Android y en Google Play

Halloween ("Noche de Cacao") es la primera temporada con arte propio. Este documento explica cómo se elige el arte, qué se cambia solo y qué se cambia a mano, y cómo agregar otra temporada.

## 1. El calendario es el que ya existía (`js/events.js`)

No hay un calendario nuevo ni fechas duplicadas: todo pregunta a `activeEvent()`.

| Pregunta | Respuesta (según el código actual) |
|---|---|
| ¿Cómo se decide el evento activo? | `activeEvent(now)` recorre `EVENTS` y devuelve el primero cuyo rango incluye `now`. Los rangos se calculan con el año de `now`; el último día cuenta entero. Halloween: del 20-oct al 2-nov inclusive. |
| ¿Qué zona horaria usa? | La **hora local del aparato** (`new Date(año, mes, día)`). Un celular en Chile cambia de evento a la medianoche de Chile. El workflow de Android fija `TZ=America/Santiago` para elegir el ícono con la misma regla. |
| ¿Si hay dos eventos a la vez? | Gana el que está **antes en la lista `EVENTS`** (San Valentín, Pascua, Patrias, Día del Niño, Halloween, Navidad). Hoy no se superponen. |
| ¿Si no hay evento? | `activeEvent()` devuelve `null`: pantalla de carga e ícono habituales. |
| ¿Cómo probar otra fecha o forzar un evento? | En el navegador: `?event=halloween` (u otro id) fuerza el evento; un id que no existe se ignora. En código y pruebas: `activeEvent(new Date(...))`. Las pruebas automáticas simulan fechas con el reloj de Playwright **solo dentro de la página** (no se toca el reloj del equipo). Para el ícono: `node scripts/temporada-icono.mjs evento --fecha AAAA-MM-DD --solo-mirar`. |

Las recompensas, fichas y mecánicas de los eventos **no cambian**.

## 2. Qué cambia en cada destino

| Destino | Cómo se elige | Cuándo cambia |
|---|---|---|
| **Pantalla de carga del juego** | Automático: `js/season-art.js` asocia arte a un id de evento; `js/splash.js` pregunta a `activeEvent()` al abrir la app y cada vez que vuelve a mostrar el sello (al volver después de 20 minutos). | Al abrir la app en las fechas del evento. Sin conexión funciona igual (la imagen va dentro de la app). |
| **Ícono instalado (Android)** | Al **compilar**: entrada `icono` del workflow (`habitual` por defecto, o `evento`). `scripts/temporada-icono.mjs` pregunta a `activeEvent()` con la fecha del día de la compilación (hora de Chile) y, si el evento tiene ícono, lo copia sobre los mismos archivos `ic_launcher*`. | Cuando la persona **instala esa actualización** desde Google Play. Queda fijo en esa versión: para volver al habitual hay que publicar otra versión compilada con `icono=habitual` después del evento. |
| **Ícono de la ficha de Google Play** | **A mano** en Play Console (sección 6). La app y su calendario **no** cambian la ficha. | Cuando Google aprueba el cambio de la ficha. |

### Pantalla inicial de Android ≠ pantalla de carga del juego

- **La pantalla inicial del sistema** la dibuja Android antes de que exista la app. Desde **Android 12** solo puede mostrar un ícono centrado sobre un color liso (más una imagen de marca opcional que Google desaconseja); **no admite una imagen a pantalla completa**. La app usa `Theme.SplashScreen` sin ícono propio, así que Android muestra el ícono del launcher. Si se compila con el ícono de temporada, esa pantalla también lo mostrará; no se comprobó en un dispositivo. En Android 7 a 11 se ve el `drawable/splash` de siempre, que no se cambió.
- **La pantalla de carga del juego** es HTML dentro de la app (`#splash`). Ahí sí va la imagen vertical de la temporada, ajustada a cada pantalla.

Fuente: [developer.android.com — Splash screens](https://developer.android.com/develop/ui/views/launch/splash-screen), consultado el 21-10-2026.

## 3. Pantalla de carga

- **Indicador real**: dice "Cargando…" con un círculo girando desde el primer instante, incluso antes de que corra el JavaScript. Pasa a "¡Listo!" cuando `main.js` terminó de arrancar el menú y las tipografías están cargadas, y el sello se va al cumplir su tiempo mínimo. No hay porcentajes.
- **Arte**: `assets/temporadas/<id>/carga.webp` va completa en apaisado y ocupa de borde a borde en vertical, recortando apenas los costados. Tiene los bordes difuminados y detrás la misma imagen borrosa (`carga-fondo.webp`). Respeta las zonas seguras (`env(safe-area-inset-*)`).
- **Marca**: el logo es el archivo original `assets/brand/logo-badge.png` y "Matijuego · el arcade de Matichoc" es texto real. La imagen aprobada trae un título generado que dice **"Matjuego"** (sin la *i*) y una insignia de Matichoc aproximada: ambos quedan **fuera** del recorte.
- **Respaldo**: si el evento no tiene arte, o la imagen no carga en 1,5 s o falla, se ve el sello habitual.

## 4. Ícono Android

- **Capas adaptativas** (Android 8+): 108 dp por lado. Lo que se ve son los 72 dp del centro; los 66 dp del centro nunca se recortan. Foreground con la ilustración (cara, mechón, sombrero con la calabaza) y background de color liso `#24123d`. El recorte deja fuera la insignia y el logo estampado en la polera.
- **Íconos para Android 7 (API 24-25)**: `ic_launcher.png` (cuadrado redondeado) e `ic_launcher_round.png` (círculo) en 6 densidades: 36, 48, 72, 96, 144 y 192 px.
- **Íconos temáticos (Android 13+)**: ni el habitual ni el de Halloween tienen capa `monochrome`. Si la persona activa los íconos temáticos, su launcher mostrará el ícono normal o, desde Android 16 QPR 2, uno teñido automáticamente.
- **Hoja de revisión**: [`docs/temporadas/halloween/revision-icono.png`](temporadas/halloween/revision-icono.png) muestra cómo queda con forma de círculo, squircle, cuadrado redondeado y gota, cómo lo muestra Google Play (esquinas al 30 %), el ícono habitual al lado, la capa completa con la zona segura y los tamaños reales de 192, 96, 48 y 36 px.

Fuente: [developer.android.com — Adaptive icons](https://developer.android.com/develop/ui/views/launch/icon_design_adaptive), consultado el 21-10-2026.

### Por qué no se usó `activity-alias` (cambiar el ícono desde la app)

Con `activity-alias`, la app trae varios íconos y activa uno u otro desde código según la fecha. Se evaluó y **no se implementó**:

1. **Riesgo de perder el acceso**: al desactivar el alias al que apunta un acceso directo, muchos launchers lo **borran del escritorio**. Otros muestran **dos íconos** un rato, y si ambos alias quedaran desactivados la app desaparecería del cajón de apps.
2. **No es inmediato**: el launcher decide cuándo refrescar; algunos tardan minutos o esperan a reiniciarse. Además, el cambio solo ocurre cuando la app se abre durante el evento, y volver al habitual exige abrirla después.
3. **Código nativo nuevo**: hace falta un plugin propio o Java en `MainActivity` (`PackageManager.setComponentEnabledSetting`) y un puente con el JavaScript, sin dispositivo ni emulador para probarlo aquí.
4. **El cambio en tiempo de compilación** no tiene esos riesgos: mismos nombres de archivo, un solo ícono y ninguna actividad nueva, y los datos no se tocan.

Si más adelante se quiere `activity-alias`, conviene probarlo antes en varios launchers (Pixel, Samsung One UI, Xiaomi) con accesos directos en el escritorio.

## 5. Recursos generados

| Archivo | Para qué | Tamaño |
|---|---|---|
| `resources/temporadas/halloween/vertical.png`, `cuadrada.png` | Originales aprobados, tal cual | 941×1672 y 1254×1254 |
| `resources/temporadas/halloween/recortes.json` | Qué parte de cada original va a cada destino | — |
| `assets/temporadas/halloween/carga.webp` | Pantalla de carga (va dentro de la app) | 941×886, ~124 KB |
| `assets/temporadas/halloween/carga-fondo.webp` | Fondo borroso | 64×60, ~1 KB |
| `resources/temporadas/halloween/android/res/mipmap-*` | Ícono Android (se copia al compilar con `icono=evento`) | capas 81–432 px; íconos 36–192 px |
| `store/temporadas/halloween/icon-512.png` | Ícono para la ficha de Google Play | 512×512, PNG 32 bits sRGB, ~729 KB (máx. 1024 KB) |
| `docs/temporadas/halloween/revision-icono.png` | Revisión visual | — |

Todo se regenera con `node scripts/temporada-recursos.mjs halloween`, que usa sharp, ya incluido en `@capacitor/assets`; no se agregaron dependencias.

## 6. Cambiar el ícono de Google Play (a mano)

Requisitos oficiales: PNG de 512×512, 32 bits, sRGB, hasta 1024 KB, cuadrado completo y sin sombra (Play redondea las esquinas al 30 %). Fuente: [developer.android.com — Google Play icon design specifications](https://developer.android.com/distribute/google-play/resources/icon-design-specifications), consultado el 21-10-2026.

1. Play Console → tu app → **Presencia en Google Play → Ficha de la tienda principal → Recursos gráficos → Ícono de la app**.
2. Sube `store/temporadas/halloween/icon-512.png` y guarda.
3. Envía los cambios a revisión (**Resumen de la publicación**). Puede tardar días, así que conviene hacerlo antes de que empiece el evento.
4. Después del evento, vuelve a subir `store/icon-512.png`, que es el habitual.

Para que coincida con lo instalado, publica en las mismas fechas una versión compilada con `icono=evento`, y al terminar otra con `icono=habitual`. Ninguna de las dos cosas ocurre sola.

## 7. Agregar otra temporada (por ejemplo, Navidad)

1. Usa el **id del evento** que ya existe en `js/events.js` (`navidad`). No agregues fechas.
2. Pon los originales en `resources/temporadas/navidad/` y crea `recortes.json` copiando el de Halloween.
3. Corre `node scripts/temporada-recursos.mjs navidad` y revisa `docs/temporadas/navidad/revision-icono.png`. Ajusta los recortes hasta que se vea bien.
4. Agrega `navidad: { loading: "assets/temporadas/navidad/carga.webp", loadingBlur: "assets/temporadas/navidad/carga-fondo.webp", bg: "#..." }` en `js/season-art.js`.
5. Prueba: `npm run build:app && npm run verify:app`, que falla si falta una imagen nombrada, y `node scripts/qa/temporada.cjs` con una fecha del evento.

Si un evento no tiene arte, no hay que hacer nada: se ve lo habitual.

## 8. Qué se comprobó y qué falta

**En el navegador** (Chromium de Playwright, build de la app; `node scripts/qa/temporada.cjs`): Halloween activo por fecha, en teléfono vertical y horizontal y en tablet vertical y horizontal; el arte, el logo, el nombre y el indicador caben en pantalla. También: sin evento, evento sin imagen (Navidad), `?event=` forzado o con un nombre que no existe, el paso del 2-nov 23:50 al 3-nov, sin internet, imagen que no carga, y el progreso que se conserva al reabrir fuera de temporada.

**En Android: nada todavía.** No hay emulador ni dispositivo en este entorno.

**Pendiente de prueba manual en un celular:**
1. Compilar con `icono=evento` en fechas de Halloween y revisar el ícono en el escritorio, el cajón de apps, Ajustes y la pantalla inicial de Android 12+.
2. Instalar esa versión **encima** de la anterior y comprobar que se conserva el progreso y que no aparece un ícono duplicado.
3. Ver el ícono en un launcher que recorte con otra forma (Samsung, Xiaomi).
4. Ver la pantalla de carga real en el celular, vertical y horizontal, y en una tablet si hay una.

**Decisiones humanas:**
- La polera del Matichico trae un logo de Matichoc **dibujado por la IA**, no el original; se ve chico en la pantalla de carga. ¿Se acepta como parte de la ilustración o se retoca?
- Revisar los derechos y condiciones de uso de las imágenes generadas con IA antes de usarlas en la tienda.
- El ícono de Halloween muestra al personaje y el habitual muestra el logo del cacao. ¿Se acepta ese cambio de concepto durante la temporada?
