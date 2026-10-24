# Plan: Matijuego en Android y iOS

Plan para pasar de "juego web empaquetado para Android" a **una app publicada en Google Play y en el App Store**, con un mismo código.

- Escrito el 24-oct-2026, después de revisar el repositorio completo.
- Se actualiza a medida que avanza: la columna "Estado" dice dónde va cada paso.
- El detalle de lo ya auditado para Play está en:
  - `docs/AUDITORIA-PREPUBLICACION.md`
  - `docs/PLAY-STORE.md`
  - `docs/TEMPORADAS.md`
  - `docs/LEGAL-Y-TIENDAS.md`

## 1. Dónde estamos (revisión del 24-oct-2026)

| Área | Estado | Comentario |
|---|---|---|
| Juego (15 juegos y mundos en la app, perfiles, progreso) | ✅ | Funciona sin internet. Las pruebas de navegador están en verde (`scripts/qa/`). |
| Android: proyecto Capacitor 8, API 36 | ✅ | Pide permisos INTERNET y VIBRATE, sin librerías nativas propias. Está preparado para páginas de 16 KB. |
| Android: APK de prueba automático | ✅ | Workflow "Compilar app Android". La versión sube sola y el APK se instala encima del anterior. |
| Android: paquete firmado para Play (.aab) | ✅ | Los secretos de firma ya están en GitHub. La ejecución nº 80 generó `matijuego-play-store-aab`. |
| Botón "atrás" de Android | ✅ | Probado en el celular de la persona dueña. |
| Política de privacidad y créditos dentro de la app | ✅ | v1.1 (24-oct). Falta publicarla en matichoc.cl para tener la URL pública que piden ambas tiendas. |
| Ficha de Play, textos, capturas, gráfico, video | ✅ | En `store/` y `docs/VIDEO-PROMOCIONAL.md`. |
| Pruebas manuales en un teléfono real (bloque A de la auditoría) | 🟡 | Se probaron por partes en el celular de la persona dueña; falta la pasada completa con fecha y modelo. |
| Decisiones legales y de marca (auditoría §7 y §10) | 🟡 | Requieren a una persona: publicidad de alimentos a menores, parecido con Tetris y Mario, licencias de tipografías y fotos. |
| **Copia del progreso fuera del navegador interno** | ✅ nuevo | `js/native.js`. Antes todo vivía solo en localStorage, y en iPhone iOS puede borrarlo si falta espacio. |
| **Vibración en iPhone** | ✅ nuevo | iOS no tiene `navigator.vibrate`. Ahora se usa el plugin nativo (`@capacitor/haptics`), también en Android. |
| **Proyecto iOS** (`ios/`) | ✅ nuevo | Capacitor 8 con Swift Package Manager, sin CocoaPods. Incluye manifiesto de privacidad, íconos y pantalla de inicio. |
| **Compilación iOS automática** | 🟡 nuevo | Workflow "Compilar app iOS": compila en un Mac de GitHub, abre la app en iPhone y iPad simulados y saca capturas. No necesita cuenta de Apple. |
| Cuenta de Apple Developer, firma, TestFlight | ⬜ | Depende de la persona dueña (USD 99 al año). |

## 2. Calendario propuesto

```
         oct 27 ─ nov 2   nov 3 ─ 9   nov 10 ─ 16   nov 17 ─ 23   nov 24 ─ 30   dic 1 ─ 7   dic 8 ─ 21
Android  [A1 candidata ] [A2 Play  ] [══ A3 prueba cerrada 14 días ══] [A4 prod. ]
iOS      [C1 proyecto ✅] [C2 ajustes iPhone (simulador)   ]   [C3 cuenta] [C4 TestFlight] [C5-C6 revisión]
```

- **Android:** prueba cerrada desde la semana del 3-nov y producción hacia fines de noviembre. Si la cuenta de Play es de **organización**, Google no exige los 14 días de prueba cerrada y producción puede llegar ~2 semanas antes.
- **iOS:**
  - Todo lo que no necesita cuenta se hace ya, en paralelo y sin costo: proyecto, compilación, ajustes para iPhone y capturas.
  - La cuenta de Apple conviene pagarla cuando Android esté en prueba cerrada y vaya bien (decisión de la persona dueña).
  - Desde la cuenta aprobada: TestFlight en ~1 semana y App Store en ~2–3 semanas más.
  - Apple suele cerrar los envíos unos días en Navidad: hay que apuntar a enviar antes del ~20-dic, o pasar a enero.

## 3. Fase A — Android a Google Play

| Paso | Qué | Quién | Estado |
|---|---|---|---|
| A1.1 | Capa nativa (copia del progreso + vibración) e iOS en el mismo código | Claude | ✅ PR de este cambio |
| A1.2 | APK de prueba del PR → instalar encima del anterior y comprobar que el progreso sigue, que vibra con golpes y premios y que "atrás" funciona | Dueña | ⬜ |
| A1.3 | Pasada completa del **bloque A** de pruebas manuales (`AUDITORIA-PREPUBLICACION.md` §9): primera carga, modo avión, atrás, rotación, segundo plano, audio, rendimiento en un celular modesto, actualización sin perder progreso | Dueña (Claude prepara la lista) | ⬜ |
| A1.4 | Decisiones de la auditoría §10: tipografías (las libres ya van por defecto), países (**recomendado: solo Chile en la 1.ª versión**), `allowBackup`, tipo de cuenta | Dueña | ⬜ |
| A1.5 | Publicar la política v1.1 en matichoc.cl/matijuego/privacy.html (PR en matiweb; la persona dueña hace merge) | Claude + dueña | ⬜ |
| A2.1 | Play Console: crear la app, completar ficha (textos en `store/listing-es.md`), seguridad de los datos ("no recopila"), público objetivo (niñas y niños), cuestionario IARC, anuncios (no) | Dueña | ⬜ |
| A2.2 | Subir el `.aab` firmado (artefacto del workflow) a **prueba interna** y luego a **prueba cerrada** | Dueña | ⬜ |
| A2.3 | Conseguir **≥ 12 testers** (recomendado: un Grupo de Google y el video promocional para invitar) | Dueña | ⬜ |
| A3 | 14 días seguidos con ≥ 12 testers activos. Si bajan de 12, el plazo vuelve a cero, así que conviene invitar a 15–20. Ir corrigiendo lo que reporten: cada arreglo genera una APK y una versión nueva para la prueba cerrada | Dueña + Claude | ⬜ |
| A4 | Pedir acceso a producción (Google revisa; puede tardar días) → lanzar | Dueña | ⬜ |

## 4. Fase B — base común para las dos tiendas (hecho hoy)

- **`js/native.js`**: habla directo con el puente de Capacitor, porque la app no usa empaquetador. Ver la explicación en el archivo.
  - **Copia del progreso:** todas las claves `matichoc_*` (perfiles, progreso, ajustes) se copian en el almacenamiento propio de la app: UserDefaults en iOS, SharedPreferences en Android.
    - Se copia cada 20 s si algo cambió, al pasar a segundo plano y al cerrar.
    - Si al abrir no hay perfiles pero sí copia, se restaura **antes** de que arranque el juego.
    - Nunca se pisa una copia buena con una vacía.
    - Prueba: `scripts/qa/respaldo-nativo.cjs`, 13/13.
  - **Vibración:** `haptic()` de los juegos usa `@capacitor/haptics`.
    - En Android eso agrega el permiso **VIBRATE**, un permiso "normal": no muestra aviso ni da acceso a datos. Antes la vibración del juego no funcionaba en Android, porque `navigator.vibrate` necesita ese permiso.
    - El workflow de Android ahora acepta exactamente INTERNET + VIBRATE.
    - La política v1.1, los créditos y la ficha ya lo dicen.
- **El botón "atrás"** sigue igual. En iOS no existe, y la app nunca se cierra sola, cosa que Apple no permite.

## 5. Fase C — iOS

### C1. Proyecto y compilación (hecho hoy, sin cuenta de Apple)
- `ios/` lo generó `npx cap add ios --packagemanager SPM` (Capacitor 8.5.3).
  - Bundle ID **`cl.chocojuego.matichoc`**, el mismo de Android.
  - Mínimo **iOS 15**: WebGL2 funciona en todos.
- **`Info.plist`:**
  - Idioma español.
  - Requiere arm64. La plantilla traía armv7, que ya no existe.
  - Sin barra de estado: pantalla completa como en Android.
  - En iPad, siempre a pantalla completa.
  - `ITSAppUsesNonExemptEncryption = false`, para no responder la pregunta de cifrado en cada envío.
  - Orientaciones vertical y horizontal: los juegos que piden horizontal ya avisan "gira tu celular".
- **`PrivacyInfo.xcprivacy`** (Apple lo exige): sin rastreo, sin datos recopilados, uso de UserDefaults con motivo CA92.1, que es la copia del progreso.
- **`capacitor.config.json` → `ios`:** sin rebote al deslizar (`scrollEnabled: false`; el juego no usa el desplazamiento de la página), fondo color cacao y modo celular.
- **Íconos y pantalla de inicio:** los mismos de Android (`resources/`), generados con `@capacitor/assets`. El ícono va sin transparencia, como pide la App Store.
- **`.github/workflows/ios.yml`**, en un Mac de GitHub:
  - Compila para el simulador.
  - Comprueba que dentro de la app estén el juego, la política y el manifiesto de privacidad, y que no esté Choco Blaster.
  - Abre la app en un **iPhone y un iPad simulados** y saca capturas a los 20 y 45 s.
  - Falla si la app se cierra sola.
  - Las capturas quedan en el artefacto `matijuego-ios-capturas`.
  - Corre **solo a mano**. En repositorio privado, cada minuto de Mac cuenta como 10 del plan de GitHub; una corrida toma ~15 min.

### C2. Ajustes para iPhone (sin cuenta; con el simulador del workflow)
- [ ] Revisar las capturas del simulador: muesca/Dynamic Island, barra inferior de inicio, botones tapados, letra.
- [ ] **Sonido:** en iPhone, el interruptor de silencio apaga el sonido del juego (Web Audio), como en la mayoría de los juegos. Decidir si se deja así (recomendado) o si suena igual.
- [ ] Rendimiento: el simulador no lo mide. Hace falta un iPhone real vía TestFlight, idealmente uno antiguo (iPhone 8/SE 2.ª gen.). Aplica la regla de `CLAUDE.md` sobre gama media-baja.
- [ ] Teclado al escribir el apodo: que no tape el campo y que la página no se agrande.
- [ ] Capturas para la ficha de la App Store, sacadas del simulador en el workflow: iPhone 6,9" (1320×2868) y, si se publica para iPad, iPad 13" (2064×2752).
- [ ] Revisar los parecidos señalados en la auditoría §7.3 (Bloques ≈ Tetris; Hongo y Flor de fuego ≈ Mario): Apple es estricta con las copias (guías 4.1 y 5.2).

### C3. Cuenta de Apple (la persona dueña)
- **Apple Developer Program: USD 99 al año.**
  - **Individual:** no pide D-U-N-S; en la tienda aparece el nombre de la persona.
  - **Organización:** aparece "Matichoc", pero pide un número **D-U-N-S** de la empresa (gratis, tarda días o semanas) y que sea una persona jurídica.
  - Si Matichoc es una empresa constituida, conviene la cuenta de organización, y pedir el D-U-N-S ya, porque tarda.
- Crear la app en App Store Connect con el bundle ID `cl.chocojuego.matichoc`.
- Crear una **clave de API de App Store Connect** (rol App Manager) y cargarla como secretos en GitHub: `APP_STORE_CONNECT_KEY_ID`, `APP_STORE_CONNECT_ISSUER_ID` y `APP_STORE_CONNECT_KEY_P8`. Claude no ve ni maneja esas claves.

### C4. TestFlight automático (Claude, cuando estén los secretos)
- Agregar al workflow de iOS un trabajo "TestFlight", igual que el `.aab` de Android: firma automática con la clave de API, archivo `.ipa` de App Store y subida a TestFlight.
- Número de versión igual al de Android; número de compilación = número de ejecución.
- Probar en iPhones reales con TestFlight: familia y testers externos. Los externos pasan antes por una revisión corta de Apple.

### C5. Ficha y formularios de App Store Connect (la persona dueña, con textos de Claude)
- Textos (adaptados de `store/listing-es.md`), capturas, URL de privacidad (matichoc.cl/matijuego/privacy.html) y URL de soporte.
- **"Privacidad de la app":** "No se recopilan datos".
- **Clasificación por edad:** cuestionario nuevo de Apple. Ojo con el combate de fantasía de Aventura Choco y los choques de Autos, igual que en IARC.
- **¿Categoría Infantil (Kids)?** Apple exige ahí: nada de anuncios ni analítica de terceros, y un **control parental** antes de cualquier enlace, compra o pedido de datos. El juego hoy no tiene ninguno de los tres, así que cumple en lo técnico. La duda de fondo es la misma que en Play: la marca de una chocolatería integrada en un juego para niños (auditoría §7.2).

### C6. Revisión de Apple
Puntos de riesgo y cómo están cubiertos:
- **Guía 4.2 (funcionalidad mínima / "una web empaquetada"):** el juego funciona entero sin internet, en 3D y sin enlaces a la web. Riesgo bajo; hay que evitar que se vean cosas de página web, como texto seleccionable, rebote o enlaces.
- **Guía 2.1 (que esté completo):** nada de "próximamente" que se pueda tocar sin resultado.
- **Guía 5.1 (privacidad):** URL de la política publicada; nada sale del teléfono.
- **Guía 1.3 / 5.1.4 (niños):** ver C5.
- El primer envío suele tardar 1–3 días. Si rechazan algo, se corrige y se reenvía.

## 6. Fase D — después del lanzamiento: un código, dos tiendas

- Cada cambio se cierra con **APK (Android) + compilación iOS en simulador + PR en matiweb**: es la regla de `CLAUDE.md` con iOS sumado.
- Una sola versión para las dos tiendas (por ejemplo 1.1.0). Las notas de la versión salen de la bitácora.
- Íconos de temporada:
  - **Android:** el ícono va fijo en cada versión (`docs/TEMPORADAS.md`).
  - **iOS:** permite "íconos alternativos", pero el sistema muestra un aviso al cambiarlo. Recomendado: el mismo esquema de Android (ícono por versión).
- Respaldar el progreso entre dispositivos (Android ↔ iPhone) **no** está incluido. Necesitaría cuentas o un servidor, y eso cambia la privacidad para niños. No se recomienda en la 1.ª versión.

## 7. Riesgos principales

| Riesgo | Impacto | Qué se hizo / qué hacer |
|---|---|---|
| iOS borra los datos del navegador interno y se pierde el progreso de los niños | Alto | ✅ Copia nativa (`js/native.js`) |
| Bajan de 12 los testers de Play durante los 14 días | Medio (atraso) | Invitar 15–20; Grupo de Google; recordatorio a mitad de la prueba |
| Publicidad de alimentos a menores (Ley 20.606, políticas de Familias y de la categoría Kids) | Alto (rechazo o retiro) | Revisión legal antes de producción (auditoría §7.2) |
| Parecido con Tetris y Mario | Medio | Diferenciar los poderes de Aventura antes de iOS (auditoría §7.3) |
| Rendimiento en iPhones antiguos (memoria de WebGL dentro de la app) | Medio | Probar con TestFlight en un iPhone 8/SE; el modo de baja calidad automático ya existe |
| Licencias de tipografías de marca | Bajo (las libres van por defecto) | Comprobante si se quieren las de marca |
| Costos | Bajo | Apple USD 99 al año. Minutos de Mac en GitHub: ~150 por compilación iOS en repositorio privado (el plan gratis trae 2.000 al mes) |

## 8. Repositorio privado (decisión del 24-oct-2026)

- **MAtigame_v0 pasa a privado; matiweb sigue público.** matiweb es el sitio matichoc.cl, con la demo del juego, y en el plan gratis de GitHub un repositorio privado no puede publicar con Pages.
- **Lo que hizo Claude:** se borró `deploy-pages.yml`. Publicaba **todo** este repositorio en GitHub Pages (bitácora, auditoría, `admin/`, llave de pruebas), aunque la portada solo redirigía a matichoc.cl.
- **Lo que hace la persona dueña, en GitHub:**
  1. MAtigame_v0 → Settings → Pages → *Unpublish site*.
  2. Settings → General → *Danger Zone* → *Change visibility* → **Private**.
- **Lo que cambia y lo que no:**
  - Los secretos de firma, los workflows y el acceso de Claude siguen igual.
  - El plan gratis da 2.000 minutos de Actions al mes. Android usa ~4 por compilación. iOS usa ~150, porque el Mac cuenta 10×; por eso **iOS corre solo a mano**.
- **Autoría:** desde ahora, los commits van a nombre de la persona dueña y sin líneas de coautoría (regla en `CLAUDE.md`). Los commits antiguos no se reescriben.
- **Si algún día se abre al público:** publicar una copia nueva con la historia resumida en un commit inicial, sin documentos internos.

## 9. Decisiones que necesito de la persona dueña

1. **Cuenta de Google Play:** ¿personal (exige 14 días de prueba cerrada) o de organización?
2. **Cuenta de Apple:** ¿individual u organización ("Matichoc" como vendedor, con D-U-N-S)? ¿Y cuándo pagarla?
3. **Países** de la 1.ª versión. Recomendado: solo Chile en las dos tiendas.
4. **iPad:** ¿se publica también para iPad? Hoy el proyecto lo admite. Si no, se limita a iPhone y no hacen falta capturas de iPad.
5. **Categoría Infantil de Apple** (y "Diseñada para familias" en Play): ¿sí o no, después de la revisión legal?
6. **Sonido con el interruptor de silencio** del iPhone: ¿silencio (recomendado) o suena igual?
