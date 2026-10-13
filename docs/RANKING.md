# Ranking y monitoreo (para el creador)

Sirve para que **tú** veas quién juega (solo por **apodo**) y, más adelante, decidir si le muestras un ranking a los jugadores.
Mientras `js/online-config.js` esté vacío, **la app no envía nada a ningún servidor**.

## Qué se envía (solo si lo enciendes)
Apodo del perfil, un identificador al azar (no se puede rastrear a una persona), plataforma (app/web), versión del juego, XP, partidas (y cuántas de cada juego),
tiempo jugado, cuántas veces abrió el juego, los días en que jugó (últimos 30), Matipuntos y el mejor puntaje de cada juego. **No** se envía nombre real, correo, ubicación ni nada de los dispositivos.

## Cómo encenderlo (una sola vez, ~10 minutos)
1. Crea una cuenta gratis en <https://supabase.com> y un proyecto nuevo (región cercana, p. ej. São Paulo).
2. Abre `docs/ranking-supabase.sql`, **cambia la clave** `pon-aqui-tu-clave-de-creador` por una larga tuya y pégalo en
   *Supabase → SQL Editor → New query → Run*.
3. En *Project Settings → API* copia la **Project URL** y la llave **anon public**.
4. Pégalas en `js/online-config.js` (`url` y `anonKey`) y publica una nueva versión (web y APK). La web ya agrega sola el permiso de conexión.
5. Abre `admin/ranking.html` en tu computador (doble clic), pega la URL, la llave anon y **tu clave de creador**, y pulsa *Cargar jugadores*.

## Qué ves en el panel
Jugadores (apodo, última vez que jugó, desde cuándo, app o web, sesiones, días que jugó, versión, qué juegos juega más, XP, partidas, tiempo, Matipuntos, récords y misiones de Ciudad Choco),
cuántos están activos hoy y esta semana (🟢 = jugando ahora), un gráfico de jugadores distintos por día (últimos 14 días), los juegos más jugados y un ranking por juego.

**Ojo:** solo cuenta a quien juega con una versión que ya tenga la conexión encendida. Lo que pasó antes de encenderla no queda registrado en ninguna parte.

## Mostrar el ranking a los jugadores (cuando tú quieras)
En el panel, botón **“Abrir ranking a los jugadores”**. Desde ese momento la app muestra un botón **🌎 Ranking** con los 20 mejores
de cada juego (solo apodos y puntajes). Para cerrarlo, el mismo botón. No hace falta publicar una versión nueva.

## Importante antes de publicar con el ranking encendido
- Actualiza la ficha de Play Store → *Seguridad de los datos* (se recopilan: ID de usuario aleatorio y progreso del juego; no son datos personales).
  La política de privacidad (`app/privacy.html`) ya describe este envío.
- Pide a los niños que usen **apodos**, no nombres completos (ya lo recomienda la app).
- La clave de creador protege el panel: que sea larga. Los datos están en tu proyecto de Supabase (plan gratis: 500 MB, de sobra).
- Es un ranking “de confianza”: el puntaje lo informa el propio juego, así que alguien muy técnico podría falsearlo. Para una app infantil es suficiente.

## Más adelante
Con esta misma base se puede agregar la **ciudad compartida** (ver “fantasmas” de otros jugadores recorriendo Ciudad Choco).
