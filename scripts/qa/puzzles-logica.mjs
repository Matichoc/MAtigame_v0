// Prueba la lógica de los juegos de las puertas del pueblo (Gato, Mini Sudoku, Cachipún) sin navegador.
// Uso: node scripts/qa/puzzles-logica.mjs   (sale con código 1 si algo falla)
import { gatoWinner, gatoFull, gatoMachineMove, sudokuNew, sudokuSolved, sudokuCount, sudokuConflict, cachipun } from "../../js/puzzles-logic.js";

let fallos = 0;
const ok = (cond, texto) => { console.log(`${cond ? "OK " : "MAL"} ${texto}`); if (!cond) fallos++; };
const sembrar = (s) => () => ((s = (s * 16807) % 2147483647) / 2147483647);

// Gato
ok(gatoWinner([1, 1, 1, 0, 0, 0, 0, 0, 0]) === 1 && gatoWinner([2, 0, 0, 2, 0, 0, 2, 0, 0]) === 2 && gatoWinner([1, 2, 1, 2, 1, 2, 2, 1, 2]) === 0, "gato: detecta quién ganó");
ok(gatoMachineMove([2, 2, 0, 1, 1, 0, 0, 0, 0], { mistakes: 1 }) === 2, "gato: la máquina gana si puede, aunque se distraiga");
ok(gatoMachineMove([1, 1, 0, 0, 2, 0, 0, 0, 0], { mistakes: 0 }) === 2, "gato: la máquina bloquea la jugada ganadora");
ok(gatoMachineMove([0, 0, 0, 0, 0, 0, 0, 0, 0], { mistakes: 0 }) === 4, "gato: la máquina parte por el centro");
// partidas completas: la máquina nunca juega en un casillero ocupado y siempre termina
let maquinaGana = 0, humanaGana = 0, empates = 0, ilegales = 0;
for (let seed = 1; seed <= 400; seed++) {
  const rand = sembrar(seed * 7919);
  const b = Array(9).fill(0);
  let turno = 1;
  for (let k = 0; k < 9 && !gatoWinner(b) && !gatoFull(b); k++) {
    let i;
    if (turno === 1) { const libres = b.map((v, j) => (v ? -1 : j)).filter((j) => j >= 0); i = libres[Math.floor(rand() * libres.length)]; }
    else i = gatoMachineMove(b, { mistakes: 0.2, rand });
    if (i < 0 || b[i]) { ilegales++; break; }
    b[i] = turno;
    turno = turno === 1 ? 2 : 1;
  }
  const w = gatoWinner(b);
  if (w === 2) maquinaGana++; else if (w === 1) humanaGana++; else empates++;
}
ok(ilegales === 0, "gato: en 400 partidas nunca hubo una jugada ilegal");
ok(humanaGana > 0, `gato: se le puede ganar a la máquina (una jugadora al azar ganó ${humanaGana} de 400; la máquina ${maquinaGana}, empates ${empates})`);

// Sudoku
let todos = true, unicos = true, pistasOk = true;
for (let seed = 1; seed <= 200; seed++) {
  const { puzzle, solution } = sudokuNew({ rand: sembrar(seed * 104729) });
  if (!sudokuSolved(solution)) todos = false;
  if (sudokuCount(puzzle.slice(), 2) !== 1) unicos = false;
  const pistas = puzzle.filter(Boolean).length;
  if (pistas < 6 || pistas > 9) pistasOk = false;
  if (!puzzle.every((v, i) => !v || v === solution[i])) todos = false;
}
ok(todos, "sudoku: 200 soluciones válidas y las pistas coinciden con ellas");
ok(unicos, "sudoku: 200 tableros con una única solución");
ok(pistasOk, "sudoku: entre 6 y 9 pistas");
ok(!sudokuSolved([1, 1, 3, 4, 3, 4, 1, 2, 2, 1, 4, 3, 4, 3, 2, 1]) && sudokuConflict([1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 0), "sudoku: detecta repetidos");
const una = sudokuNew({ rand: sembrar(5) });
ok(sudokuCount(Array(16).fill(0), 2) === 2 && una.puzzle.length === 16, "sudoku: un tablero vacío tiene muchas soluciones y el generado mide 16");

// Cachipún
ok(cachipun(0, 2) === 1 && cachipun(1, 0) === 1 && cachipun(2, 1) === 1 && cachipun(2, 0) === -1 && cachipun(0, 1) === -1 && cachipun(1, 2) === -1 && cachipun(1, 1) === 0, "cachipún: piedra gana a tijera, papel a piedra, tijera a papel");

console.log(fallos ? `\nFALLAN ${fallos}` : "\nTodo OK");
process.exit(fallos ? 1 : 0);
