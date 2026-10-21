# Economía de Matijuego (Matipuntos)

Revisión de precios hecha el 16-oct-2026 con los números reales del código (`scripts` de conteo en la sesión de trabajo).

## ¿Cuánto gana un jugador?

Estimación para una niña que juega ~1 hora al día (la energía es el freno: **200 de tope y se recuperan 15 por hora**, así que se gasta y se va reutilizando):

| Fuente | Matipuntos |
|---|---|
| Partidas (premio por puntaje, máx. 60 por partida; ~15 de promedio × ~6 partidas) | ~90 al día |
| Premio diario por entrar (10 → 50 con racha) | ~30 al día |
| 3 misiones del día (10–25 c/u) + cofre del día (30) | ~80 al día |
| Subir de nivel (`20 + 5×nivel`) | ~30 al día al principio, baja después |
| Niveles de campaña (premio por nivel + estrellas) y "Nueva vuelta" (100+) | ~40 al día |
| Logros (267 en total, **24.385** en total) | pago único, repartido en meses |
| Mati Merge: pedidos (5–120 c/u) y el ¡Mati Dubai! (+1.000 una vez) | extra, casi sin costo de energía |
| **Total jugando a diario** | **~250–350 al día** (≈ 9.000 al mes) |

## ¿Qué había para comprar? (antes del reajuste)

- Guardarropa: 13.795 (comunes 30 · raros 110 · épicos 260 · legendarios 520).
- Muebles: 7.110 · estilo de la casa (pisos, paredes, techos…): 9.530 · cuartos: 3.500 · tamaños: 300 / 900 por cuarto.

Un legendario costaba **dos días** de juego y casi todo el guardarropa se compraba en un par de semanas. Por eso nunca faltaban Matipuntos.

## Metas de precio (con ~300 🍫✨ de ganancia al día)

| Qué | Objetivo | Precio |
|---|---|---|
| Cosas comunes (peinados, anteojos, colores…) | 2–3 en un día | 45 – 135 |
| Raros | ≈ 1 día | 120 – 260 |
| Premium (épicos, muebles grandes) | ≈ 3 días | 910 – 1.120 |
| Lo más premium (legendarios, exclusivas) | ≈ 7 días | 2.080 – 2.160 |
| Un cuarto nuevo (todos iguales) | ≈ 3 días | 900 |
| Agrandar un cuarto: Mediano | ≈ 3 días más | 900 |
| Agrandar un cuarto: Grande (acumulado) | 6 días en total | 1.800 (los últimos 900) |
| Autos del garaje | 1,3 · 3 · 5 · 7 días | 400 · 900 · 1.500 · 2.100 |
| Candados de juego | ≈ 1 semana | 2.000 |
| Energía con Matipuntos (hasta el tope de 200) | gasto opcional | 80 por 20 ⚡, 10 veces al día |

Con eso, llevar un cuarto de "pequeño" a "grande" cuesta 2.700 en total (el doble de lo que costó el cuarto, más el cuarto): un jugador promedio llega al tamaño más grande de su primer cuarto extra en unas 2 semanas. Quien juega más llega antes; quien juega menos, después.

Lo que ya compraste **no cambia**: el reajuste solo sube lo que aún no tienes.

## Cambios aplicados

- **Guardarropa**: precio base × factor de rareza (común ×3 · raro ×2 · épico ×3,5 · legendario ×4). Total ≈ 60.000 con las prendas nuevas.
- **Casa**: muebles y estilos con los mismos factores (común ×2 · raro ×2 · épico ×3,5 · legendario ×4).
- **Ropa nueva** (28 tenidas en total, 16 nuevas): tutús, vestidos, uniformes cheerleader con pompones, vestido de gala, smoking, Súper Choco, traje espacial.
- **Exclusivas**: piden **nivel** (Súper Choco 10 · Tutú Arcoíris 12 · Traje espacial 14 · Cheer Campeona 15 · Princesa Cacao 20 · Vestido de Gala 25) o un **logro** (Edición Mati Dubai: llegar al ¡Mati Dubai! en Mati Merge). Mientras no se cumple sale "🔒 Nivel N".
- **Comprar otra unidad**: cualquier prenda o mueble de pago se puede comprar más de una vez (una unidad por Matichico a la vez). En la tienda, al tocar una prenda que ya llevas puesta aparece "Comprar otro".

## Pendiente

- Revisar con datos reales de partidas (cuando haya ranking online) si el ritmo de ~300 al día es correcto; si la gente gana más o menos, se ajusta en un solo lugar por sistema (`PRICE_X` en `wardrobe-data.js`, `HOUSE_X` en `house-data.js`, `UNLOCK_PRICE`, `ROOM_TYPES`/`HOUSE_SIZES`, autos en `autos-garage.js`).

## Catálogo (oct-2026): cómo se reparte lo que hay para gastar

- **Ropa y accesorios**: 178 cosas a la venta (80 comunes, 54 raras, 29 épicas, 15 legendarias) + 12 "Próximamente".
- **Casa**: 101 objetos a la venta (muebles, pisos, paredes, techos) + 4 "Próximamente".
- **Fácil acceso** = comunes y raros (45–260, hasta un día de juego). **Difícil** = épicos y legendarios (910–2.160) y las exclusivas por nivel (Súper Choco 10 … Vestido de Gala 25) o logro (Edición Mati Dubai).
- **Próximamente** (`soon(...)` en `wardrobe-data.js` y `house-data.js`): se ven y se prueban puestos, pero no se pueden comprar (la compra se rechaza en `buyItem`, `buyFurniture` y `buyHouseItem`). Son los que se cobrarán después con dinero real. Para abrir uno a la venta basta quitarle el `soon(...)`.
- Temas nuevos: cheerleader (tutús, uniformes con pompones, lazos, coletas), fútbol (botines, equipos, arco, futbolín, copa), básquet (zapatillas, uniforme, aro, marcador, cancha), ballet, deportes, hobbies (telescopio, acuario, caballete).

### Segunda tanda: cosas "para niñas" en todas las categorías

Ropa (vestidos, tutús, uniformes cheer, falda de volantes, disfraz de gatita, vestido de sirena, de reina…) · pelo (cola alta, coletas con lazos, bob, moño de bailarina, ondas, trenzas, flequillo con lazo, trenza gigante) · sombreros y pasadores (lazo, pompones, diadema, tiara, mariposas, pasadores, corona de flores) · **nueva categoría Mano** (varita, ramo, paraguas, carterita, helado, globo de corazón, osito de peluche, micrófono) · cara (pestañas y labios, brillitos, pendientes de corazón, maquillaje de estrellas) · cuello (collares de corazón y estrella, perlas, lazo de seda) · espalda (mochilas de unicornio, gatito y conejita, bolsito de corazón, alas de hada) · zapatos (ballet, bailarinas rojas, botas de corazones, zapatillas con luces, patines) · mascotas (Osito Rosa, Conejita Pompón, Mariposa Brillos, Pompi; Hada Madrina próximamente) · casa (**Princesas y cuentos**: casa de muñecas, tocador, mesa de té, caballito mecedor, castillo, biblioteca de cuentos, lámpara de unicornio, móvil de mariposas, mariposas y espejo de corazón en la pared, alfombra de flor, pisos y paredes rosadas; Castillo de princesa y Carruaje próximamente).

## Cofre del tesoro (energía)

Cada 40 minutos hay un cofre: **+10 ⚡ y +5 🍫✨**. Desde oct-2026 el cofre **no cuenta para el tope diario de energía extra (100)**, solo para el tope general de 400 ⚡ (antes, si ya habías llegado a los 50 extra del día por misiones, logros o niveles, el cofre daba solo puntos). El resultado queda escrito en la ventana de energía y el aviso aparece por encima de las ventanas.

## Energía (nov-2026): 200 de tope, 15 por hora

- Tope de energía: **200** (antes 100). Recarga: **+1 cada 4 minutos (15 por hora)**; durmiendo en Mi Casa se recarga más rápido.
- Energía extra por misiones, logros y niveles: hasta **100 por día**; tope total con extras: **400**.
- En la actualización, la energía se reinicia **una sola vez** a 200 llenas (versión de energía 2). Matipuntos, ropa, casa, niveles, logros y todo lo demás se mantienen.
- Consecuencia para la economía: con el doble de energía se juega más tiempo seguido, así que los ingresos por hora suben aproximadamente al doble en los juegos que pagan por partida. Si los precios se quedan cortos, el primer ajuste es subir los premios de las tiendas, no bajar la energía.

## Parkour (nov-2026)

La Aventura pasó a **7 etapas**: la 6 es el **Parkour Troll** (los bloques normales son trampa; solo se pisan las líneas rojas). Las líneas rojas sobre los bloques de las otras etapas hacen volver al último lugar seguro (en el Mundo infinito cuestan una vida). No cambian los premios de Matipuntos del Parkour.

## Pueblo y Ciudad: premios diarios nuevos (oct-2026)

- **Ciudad Choco**: las misiones ya hechas vuelven cada día. El "!" reaparece sobre el vecino si no la hiciste hoy; repetirla paga **la mitad** de la recompensa (antes un 25 %), con tope de **4 pedidos pagados por día** (`REPEAT_CAP`, `REPEAT_PAY` en `js/ciudad-game.js`). La primera vez sigue pagando el premio completo. Máximo extra por día: ~4 × 20–40 = **80–160 🍫✨** (cuesta 2 ⚡ cada una).
- **Pueblo Matichoc · parkour**: Torre de Cacao y Escalera de Nubes, **+10 🍫✨** cada cima, una vez al día (`COURSE_COINS` en `js/town-fun.js`).
- **Pueblo Matichoc · puertas de juegos**: El Gato **+4**, Mini Sudoku **+8**, Cachipún **+3**, solo la primera victoria del día de cada una (`PUZZLES` en `js/town-puzzles.js`); después se juega por diversión.
- Las "Actividades del día" del pueblo pasan de 5 a **7** (se agregan "sube a la cima" y "gana en las 3 puertas"); el premio por completarlas no cambia (+30 🍫✨, un sobre y 10 ⚡).
