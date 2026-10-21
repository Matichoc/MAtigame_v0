# Matijuego en Google Play: qué está hecho y qué falta

La app de Android es **el mismo juego** empaquetado con [Capacitor](https://capacitorjs.com/): el código vive en `js/`, `css/` y `assets/`, y la carpeta `app/` tiene la página de la app. Diferencias de la versión app:

- **Sin enlaces a matichoc.cl** (ni a la tienda, ni a "La Maestra", ni el botón de WhatsApp del creador de chocolates).
- Se conserva el logo de Matichoc y aparece el crédito **"Un juego promovido por Matichoc"** en el menú.
- **Sin Choco Blaster** (el juego de disparos): la app queda con 14 juegos y mundos 3D más el taller "Crea tu Chocolate" (el menú los lista desde `js/games-catalog.js`; el recuento sale de ahí y de `scripts/qa/juegos.cjs`).
- Pantalla completa, sin barra de estado, y respeta la muesca de la cámara.
- Funciona sin conexión (todo va dentro de la app; no hace falta dominio ni servidor) y **no envía datos a ningún servidor**: el ranking en línea está apagado y el build de la app lo fuerza apagado (`scripts/build.mjs`, `MATIJUEGO_ONLINE=1` es la única forma de encenderlo y exige actualizar política y formularios).
- La política de privacidad y los créditos/licencias se leen **dentro** del juego (botones al pie del menú).

La web de matichoc.cl/matijuego **no cambia**: sigue con sus enlaces.

## ✅ Lo que ya está hecho (en el repositorio)

| Qué | Dónde |
| --- | --- |
| Página de la app sin enlaces + crédito de marca | `app/index.template.html` (el build genera `app-www/index.html`) |
| Botón de WhatsApp oculto en modo app | `js/creador-game.js` |
| Proyecto Android (nombre "Matijuego", id `cl.chocojuego.matichoc`, íconos, pantalla de carga, pantalla completa) | `android/`, `capacitor.config.json`, `resources/` |
| Compilación automática en GitHub (APK de prueba + paquete firmado `.aab`) | `.github/workflows/android.yml` |
| Política de privacidad (versión 1.0) y créditos/licencias | `app/privacy.html`, `app/licenses.html` (el build las copia a `app-www/`) |
| Textos de la ficha, respuestas sugeridas a los formularios | `store/listing-es.md` |
| Ícono 512, gráfico de funciones 1024×500 y 8 capturas 1080×1920 (generadas con `scripts/qa/capturas.cjs` desde la variante app) | `store/` |
| Comprobaciones automáticas de la carpeta de la app y pruebas de navegador | `scripts/verificar-app.mjs`, `scripts/qa/` |
| Informe de revisión previa a publicar (qué está comprobado y qué no) | `docs/AUDITORIA-PREPUBLICACION.md` |

## 🧭 Tu misión, paso a paso

### 0. Decisiones (respóndeme o cámbialas tú)
1. **Nombre público**: "Matijuego" (hoy). Máx. 30 caracteres.
2. **ID del paquete**: `cl.chocojuego.matichoc` (elegido por el dueño). **No se puede cambiar una vez publicada la app.**
3. **Correo de contacto público** y **política de privacidad**: usé los datos legales que ya publica matichoc.cl (Chocolatería Matichoc Inés Saavedra EIRL, i.saavedra.nu@gmail.com). Confirma que quieres mostrarlos en Google Play. La URL que se pega en Play Console es `https://matichoc.cl/matijuego/privacy.html`, que **solo existe después de desplegar** la página en matiweb (ver la auditoría): no la uses antes de abrirla y comprobarla.
4. ~~¿Choco Blaster dentro de la app?~~ **Decidido: no.** La app es solo para público infantil, así que Choco Blaster (el único juego con "disparos") queda fuera de la app. En la web de matichoc.cl sigue.
5. ~~Público objetivo~~ **Decidido: niñas y niños pequeños.** Al marcar rangos de edad infantiles, Google incluye la app en su política "Diseñada para familias": el juego ya cumple lo principal (sin anuncios, sin datos personales, sin enlaces externos, con política de privacidad). El campo de perfil pide un "Apodo (inventado)" y la política recomienda no usar nombres completos.

### 1. Cuenta de desarrollador de Google Play
1. Entra a <https://play.google.com/console> con una cuenta de Google que quieras dejar como dueña.
2. Paga el registro (pago único, unos US$25; confírmalo en la consola) y verifica tu identidad.
3. Elige el tipo de cuenta: **Personal** u **Organización**. La de organización suele pedir un número D-U-N-S de la empresa; la personal, para cuentas nuevas, suele exigir una **prueba cerrada con al menos 12 testers durante 14 días seguidos** antes de poder publicar. Estas reglas cambian: lee lo que te muestre la consola.

### 2. Crear la llave de firma (una sola vez, guárdala muy bien)
En tu computador con Java instalado (o en <https://shell.cloud.google.com>):

```bash
keytool -genkeypair -v -keystore upload.keystore -alias upload \
  -keyalg RSA -keysize 2048 -validity 10000
```
Te pedirá una contraseña y algunos datos. **Guarda `upload.keystore` y la contraseña en un lugar seguro con copia de respaldo.** Si los pierdes, solo se puede recuperar pidiéndole ayuda a Google. Nunca subas ese archivo al repositorio, ni lo pegues ni pegues sus contraseñas en un chat o correo: se cargan **solo** en los secretos de GitHub (paso siguiente). La llave `android/app/matijuego-test.keystore` del repositorio es pública y **no sirve para tienda**.

Conviértelo a texto para GitHub:
```bash
base64 -w0 upload.keystore        # en Mac: base64 -i upload.keystore
```

### 3. Cargar los secretos en GitHub
Repositorio `Matichoc/MAtigame_v0` → **Settings → Secrets and variables → Actions → New repository secret**. Crea estos cuatro:

| Nombre | Valor |
| --- | --- |
| `ANDROID_KEYSTORE_BASE64` | el texto largo del paso anterior |
| `ANDROID_KEYSTORE_PASSWORD` | la contraseña del keystore |
| `ANDROID_KEY_ALIAS` | `upload` |
| `ANDROID_KEY_PASSWORD` | la contraseña de la llave (la misma, si no pusiste otra) |

### 4. Compilar la app
Pestaña **Actions → "Compilar app Android" → Run workflow**. Pon el nombre de versión (por ejemplo `1.0.0`) y deja vacío el número de versión (sube solo; debe ser mayor en cada subida a Play). Marca **release** para que falle si faltan los secretos de firma. El **ícono** sale `habitual` por defecto; con `icono=evento` se usa el de la temporada activa ese día si tiene uno (hoy, Halloween). Queda fijo en esa versión, y el ícono de la ficha de Play se cambia aparte, a mano: ver `docs/TEMPORADAS.md`. Las **tipografías** salen por defecto **libres** (SIL OFL); `marca` (Baby Chipmunk / Adorable Mother Script) solo se acepta si además marcas `fuentes_marca_con_licencia` confirmando que tienes el comprobante de licencia comercial (ver `docs/AUDITORIA-PREPUBLICACION.md`). El workflow además comprueba el APK (solo el permiso `INTERNET`, sin librerías nativas, sin Choco Blaster, con privacidad y licencias) y que el `.aab` no esté firmado con la llave pública de pruebas. Al terminar (varios minutos) se descargan dos archivos desde la ejecución:
- `matijuego-prueba-apk` → un APK que puedes instalar **directo en un celular** (hay que permitir "instalar apps desconocidas"). **Pruébalo con tu hija antes de subir nada.**
- `matijuego-play-store-aab` → el paquete firmado que se sube a Google Play.

> Si la primera compilación falla, copia el error del registro y pásamelo: con ese texto lo corrijo.

### 5. Probar el APK (lista de revisión)
- [ ] Abre a pantalla completa, con el logo de Matichoc en la pantalla de carga.
- [ ] No hay ningún enlace que saque del juego (menú, creador de chocolates).
- [ ] Se ve el crédito "Un juego promovido por Matichoc".
- [ ] Todos los juegos abren y se pueden jugar con los controles táctiles.
- [ ] Al cerrar y volver a abrir, se conservan perfiles y Matipuntos.
- [ ] Sonido y rendimiento aceptables en un teléfono modesto.

### 6. Crear la app en Play Console
1. **Crear app** → nombre `Matijuego`, idioma Español (Chile), tipo **Juego**, **Gratis**.
2. **Contenido de la app**: política de privacidad (URL en `store/listing-es.md`), anuncios (no), acceso a la app (sin inicio de sesión), clasificación de contenido, público objetivo, seguridad de los datos (no recopila). Hay respuestas sugeridas en `store/listing-es.md`.
3. **Ficha de la tienda**: copia los textos de `store/listing-es.md` y sube de la carpeta `store/`: `icon-512.png`, `feature-graphic.png` y las capturas de `screenshots/`.

### 7. Publicar
1. **Pruebas → Pruebas internas** (o cerradas): sube el `.aab`, agrega a los testers (correos de Google) y pruébalo desde la tienda.
2. Cuando Google lo permita (ver paso 1.3), pasa a **Producción**, envía a revisión y espera la aprobación (puede tardar días).

### 8. Cada actualización
1. Se hacen los cambios en el repo (los hago yo).
2. Vuelve a correr "Compilar app Android" subiendo el número de versión (**debe ser mayor que el anterior**: 2, 3, 4…).
3. Sube el nuevo `.aab` en Play Console.

## Cómo se arma la app (para quien mantenga el repo)

```bash
npm ci
npm run sync:android   # arma app-www/ y lo copia al proyecto Android
npm run verify:app     # comprueba app-www/ (sin Blaster, sin enlaces, ranking apagado, legales)
cd android && ./gradlew assembleDebug   # requiere Android SDK y acceso a dl.google.com / maven.google.com
```
La carpeta `app-www/` se genera sola (`scripts/build.mjs app`) a partir de `app/index.template.html`, `app/privacy.html`, `app/licenses.html`, `js/`, `css/`, `assets/` y `vendor/`, sin Choco Blaster y con el ranking en línea apagado. `npm run verify:app` comprueba el resultado. Los íconos y la pantalla de carga se regeneran con `npx @capacitor/assets generate --android --assetPath resources`.

---

## APK de prueba que se actualiza encima (sin perder el progreso)

El APK de prueba que arma GitHub (`matijuego-prueba-apk`) va firmado con una **llave fija** (`android/app/matijuego-test.keystore`, pública a propósito, solo para pruebas) y su número de versión sube solo con cada compilación. Por eso un APK nuevo se instala **encima** del anterior y el progreso guardado se conserva.

- Si venías de un APK anterior a este cambio, **desinstálalo una sola vez** (Android no deja actualizar entre llaves distintas). Desde ahí, cada APK nuevo se instala por encima.
- No desinstales la app entre pruebas: ahí sí se borra el progreso.
- Esta llave **no sirve para Google Play**: el `.aab` de la tienda se firma con tu llave de subida (los cuatro secretos de arriba).
