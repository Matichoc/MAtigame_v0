// Prueba la lógica de los pedidos de Mati Merge, sin navegador: los piden distintos vecinos (1 o 2 productos), se renuevan
// cada día, entregar usa todos los productos del pedido y los pedidos del formato antiguo se convierten sin perder nada.
// Uso: node scripts/qa/merge-logica.mjs   (sale con código 1 si algo falla)
import { mergeOf, deliverOrder, canDeliver, orderCells, orderHave, codeOf, CUSTOMERS, CELLS, itemInfo } from "../../js/merge-data.js";
import { NEIGHBORS } from "../../js/neighbors.js";
import { todayKey } from "../../js/storage.js";

let fallos = 0;
const ok = (cond, texto) => { console.log(`${cond ? "OK " : "MAL"} ${texto}`); if (!cond) fallos++; };
const nuevo = () => ({ coins: 0, xp: 0, packs: 0, stats: { totalCoinsEarned: 0 } });

// ---------- clientes ----------
ok(CUSTOMERS.every((c) => NEIGHBORS.some((n) => n.name === c.name)), "todos los clientes son vecinos del Pueblo (tienen cara)");

// ---------- pedidos nuevos ----------
let dos = 0, total = 0, repetidos = 0;
for (let k = 0; k < 200; k++) {
  const m = mergeOf(nuevo());
  total += m.orders.length;
  dos += m.orders.filter((o) => o.items.length === 2).length;
  if (new Set(m.orders.map((o) => o.who)).size !== m.orders.length) repetidos++;
  if (!m.orders.every((o) => o.items.length >= 1 && o.items.length <= 2 && o.items.every((it) => itemInfo(codeOf(it.c, it.t))) && o.coins > 0 && typeof o.why === "string")) { ok(false, "pedido mal formado"); break; }
}
ok(total === 600, "siempre hay 3 pedidos");
ok(dos > 120 && dos < 360, `algunos pedidos traen 2 productos (${dos} de ${total})`);
ok(repetidos === 0, "los 3 pedidos son de vecinos distintos");

// ---------- entregar ----------
const p = nuevo();
const m = mergeOf(p);
m.grid = new Array(CELLS).fill(0);
m.orders[0] = { who: "Bombi", why: "para la once", items: [{ c: 0, t: 2 }, { c: 0, t: 2 }], coins: 20, xp: 10 };
m.grid[5] = codeOf(0, 2);
ok(!canDeliver(m, 0) && JSON.stringify(orderHave(m, m.orders[0])) === "[true,false]", "con 1 de los 2 productos: todavía no se puede entregar y se marca el que tienes");
ok(deliverOrder(p, 0) === null && m.grid[5] === codeOf(0, 2), "intentar entregar incompleto no saca nada del tablero");
m.grid[9] = codeOf(0, 2);
const antes = p.coins;
const r = deliverOrder(p, 0);
ok(r && r.cells.length === 2 && m.grid[5] === 0 && m.grid[9] === 0, "con los 2 productos: se entregan y salen los dos del tablero");
ok(p.coins === antes + 20 && m.delivered === 1, "paga los Matipuntos del pedido una vez");
ok(m.orders.length === 3 && m.orders[0] !== r, "el cliente se va y llega un pedido nuevo");
ok(orderCells(m, { items: [{ c: 1, t: 1 }] }) === null, "sin el producto, no hay casilleros para entregar");

// ---------- se renuevan cada día ----------
const q = nuevo();
const mq = mergeOf(q);
const hoy = JSON.stringify(mq.orders);
mergeOf(q);
ok(JSON.stringify(q.merge.orders) === hoy, "el mismo día los pedidos no cambian");
q.merge.day = "2000-01-01";
mergeOf(q);
ok(q.merge.day === todayKey() && JSON.stringify(q.merge.orders) !== hoy, "al día siguiente los pedidos sin entregar se cambian por otros");

// ---------- formato antiguo ----------
const viejo = { coins: 50, xp: 0, stats: { totalCoinsEarned: 0 }, merge: { v: 2, grid: new Array(CELLS).fill(0).map((_, i) => (i === 3 ? codeOf(2, 3) : 0)), bests: [2, 2, 3, 1], delivered: 7, merges: 30, spawned: 40, orders: [{ c: 2, t: 3, coins: 14, xp: 13 }, { c: 9, t: 9 }, "basura"] } };
const mv = mergeOf(viejo);
ok(mv.delivered === 7 && mv.merges === 30 && mv.grid[3] === codeOf(2, 3) && viejo.coins === 50, "perfil con pedidos antiguos: conserva tablero, entregas y Matipuntos");
ok(mv.orders.length === 3 && mv.orders.every((o) => Array.isArray(o.items) && o.who), "los pedidos antiguos (atascados) se renuevan con el formato nuevo");
const copia = JSON.stringify(mv);
mergeOf(viejo);
ok(JSON.stringify(viejo.merge) === copia, "convertir dos veces da lo mismo");

console.log(fallos ? `\n${fallos} con problemas` : "\nTodo bien");
process.exit(fallos ? 1 : 0);
