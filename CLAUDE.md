# Instrucciones para trabajar en Matijuego

- Responder siempre en español.
- **Anotar siempre todo en la bitácora `docs/BITACORA.md`** (pedido de la persona dueña): cada cambio, PR, compilación, prueba en el celular, decisión y pendiente, con fecha y lo más reciente arriba. La bitácora se actualiza en el mismo PR del cambio. **Nunca abrir un PR solo para la bitácora**: si hay un PR abierto, agregar el commit de la bitácora a ese PR. Si no hay ninguno (por ejemplo, después de una compilación o una prueba en el celular), guardar la anotación e incluirla en el siguiente PR que se abra.
- Antes de publicar algo para Google Play, revisar `docs/PLAY-STORE.md`, `docs/TEMPORADAS.md` y `docs/AUDITORIA-PREPUBLICACION.md`.
- **Todo lo que se desarrolle debe funcionar en teléfonos Android de gama media-baja hacia arriba** (pedido de la persona dueña). Antes de dar algo por terminado, medir cuánto cuesta dibujarlo (dibujos por cuadro, triángulos, sombras) y compararlo con juegos que ya funcionan bien en su celular. En celulares, preferir sombras simples, piezas agrupadas (InstancedMesh) y sin efectos de pantalla completa cuando no sean necesarios. Ver `docs/EVOLUCION-JUGABILIDAD.md` §12.
