// Genera docs/LOGROS.md con la lista completa de logros (para revisarla y decidir qué cambiar).
// Uso: node scripts/logros-doc.mjs
import { writeFileSync } from "node:fs";
globalThis.document = { documentElement: { dataset: {} }, addEventListener() {}, visibilityState: "visible" };
globalThis.window = globalThis;
globalThis.addEventListener = () => {};
globalThis.location = { search: "", hostname: "x" };
globalThis.localStorage = { getItem: () => null, setItem: () => {} };
const { ACHIEVEMENT_CHAINS, CATEGORIES } = await import("../js/achievements.js");
let md = "# Logros de Matichoc Arcade\n\n";
md += "Generado con `node scripts/logros-doc.mjs` desde `js/achievements.js`. Para cambiar una meta o un premio, edita ese archivo.\n";
md += "Los logros de **cadena** suben por escalones (🥉 → 🥈 → 🥇 → 💎 → 👑): se ve uno a la vez y, al reclamarlo, aparece el siguiente.\n\n";
let total = 0;
let coins = 0;
for (const cat of CATEGORIES) {
  const chains = ACHIEVEMENT_CHAINS.filter((c) => c.cat === cat.id);
  if (!chains.length) continue;
  md += `## ${cat.icon} ${cat.name}\n\n| Logro | Meta | Premio (Matipuntos) |\n|---|---|---|\n`;
  for (const c of chains) {
    const rewards = c.tiers.map((t) => t.reward);
    const goals = c.tiers.map((t) => t.desc.replace(/\.$/, "")).join(" → ");
    md += `| ${c.icon} **${c.name}** | ${c.tiers.length > 1 ? goals : c.tiers[0].desc} | ${rewards.join(" / ")} |\n`;
    total += c.tiers.length;
    coins += rewards.reduce((a, b) => a + b, 0);
  }
  md += "\n";
}
md += `**Total: ${total} logros · ${coins.toLocaleString("es-CL")} Matipuntos en premios.**\n`;
writeFileSync("docs/LOGROS.md", md);
console.log(`docs/LOGROS.md: ${total} logros, ${coins} Matipuntos`);
