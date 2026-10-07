# Propuesta: juegos 3D en primera persona para Matijuego

Documento para **evaluar el rumbo visual** de los juegos. Nace de este pedido:
que los juegos se sientan "realistas" como los juegos actuales (tipo Fortnite
o Call of Duty, en primera persona), no que los productos se vean realistas.

## Qué puedes probar hoy: Choco Blaster 3D

En el hub aparece **🎯 Choco Blaster 3D** (etiqueta "Propuesta 3D"). Es un
prototipo jugable, en primera persona, hecho en el navegador:

- Estás en una **feria de Matichoc en 3D** (puestos con toldo, banderines,
  cajones, estatua de tableta de chocolate, árboles de cacao, logo y fotos
  reales de los alfajores en los mostradores).
- Disparas chocolate con el **Choco Blaster** (el color de la franja del arma
  es el de tu atuendo de la tienda, y las manos son las de tu Matichico).
- Los enemigos son **malvaviscos traviesos**: sin violencia. Cada impacto los
  baña de chocolate y al completar el baño estallan en confeti.
- Sensación de shooter: mira, marcador de impacto, **cabezazo = daño doble**,
  combos (x2…x5), recarga, retroceso, vidas, oleadas cada vez más difíciles,
  un **malvavisco dorado "Matidubai"** que huye y da monedas.
- Puntaje y ranking van al mismo sistema de siempre (monedas, logros, perfiles).

Controles — **PC**: mouse apunta, click dispara, WASD mover, ESPACIO saltar,
SHIFT correr, R recargar, ESC pausa, botón ⛶ pantalla completa.
**Celular**: joystick izquierdo para moverte, arrastrar a la derecha para
mirar, botones de disparo / salto / recarga.

## Techo honesto de calidad

| Nivel | Qué es | ¿Se puede aquí? |
|---|---|---|
| Fortnite / COD | Motor propio (Unreal/Unity), decenas o cientos de artistas, modelos de miles de polígonos, animación por captura de movimiento, descargas de varios GB | **No.** Ni en el navegador ni trabajando solo por chat. Es un trabajo de estudio. |
| 3D estilizado ("cartoon"), tipo Fall Guys / Splatoon | Colores de marca, sombras, cielo, niebla, personajes redondeados, primera o tercera persona fluida | **Sí.** Es lo que muestra el prototipo, funcionando en PC y celular sin instalar nada. |

Lo que más separa este prototipo de un juego "de verdad" **no es el código**
sino el **arte**: ahora todo se arma con formas simples (cápsulas, cajas).
Con modelos 3D hechos por un artista el salto sería enorme.

## Opciones para seguir

**A. Seguir con Three.js en este repo (lo que hay hoy).**
Gratis, funciona en GitHub Pages, carga solo al entrar al juego (el motor pesa
~670 KB y está incluido en `vendor/`, con su licencia MIT). Contras: no hay
editor visual y el arte es procedural.

**B. Godot 4 (exportar a web).** Editor visual, físicas y animaciones listas.
Contras: descarga más pesada (decenas de MB), hay que trabajar en el editor de
Godot y revisar la compatibilidad con GitHub Pages. Cambia la forma de trabajar
del repo.

**C. Unity WebGL.** Muy potente, pero descargas pesadas, licencias y peor
rendimiento en celulares de gama baja.

**D. Sumar arte 3D real (a cualquiera de las anteriores).** Modelar a
Matichico, Chocolatina, los malvaviscos, el blaster y la feria como archivos
`.glb`. Con Three.js se importan directo. **Es la palanca que más sube la
calidad**; el costo y los plazos dependen de quién lo haga (no los estimo aquí).

Mi recomendación: **A + D**. Mantener todo en el repo y, si el rumbo te gusta,
invertir en modelos 3D de los personajes antes que en cambiar de motor.

## Lo que necesito que decidas

1. ¿Te gusta el rumbo (primera persona, estilizado, sin violencia) o prefieres
   tercera persona, viendo a tu Matichico?
2. ¿Los juegos pendientes (Autos de Chocolate, Salto Choco) van **en 3D** o en
   2D mejorado? Memoria Matichoc conviene en 2D con fotos reales de productos.
3. ¿Hay presupuesto o contacto para encargar modelos 3D (opción D)?
4. ¿Cómo se sintió en el celular de tu hija / en tu PC? (Si va lento, el juego
   baja solo la calidad, pero cuéntame el modelo del equipo.)

## Notas técnicas

- El juego 3D se carga **perezosamente**: el hub y los demás juegos no pagan
  el costo del motor 3D.
- Calidad adaptativa: si los cuadros por segundo caen, baja la resolución y
  luego las sombras.
- Sin red ni chat: todo local en el navegador (como el resto de Matijuego).
- Código: `js/fps-game.js` (lógica), `js/fps-world.js` (la feria),
  `js/fps-enemies.js` (malvaviscos), `vendor/three.module.min.js`.
