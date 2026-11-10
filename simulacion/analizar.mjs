// Resume los resultados de un paso por elemento × brazo × modelo: éxito n/N con intervalo de Wilson al 95 %, costo
// mediano y total, turnos, minutos e intervenciones del líder. Imprime una tabla Markdown y guarda el resumen en
// <dir>/resumen.json (lo usan graficas.mjs y tablero.mjs).
//   node simulacion/analizar.mjs simulacion/resultados/paso4
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const dir = process.argv[2] ?? "simulacion/resultados/paso4";
const filas = readFileSync(join(dir, "resultados.jsonl"), "utf8").trim().split("\n").filter(Boolean).map((l) => JSON.parse(l));

export function wilson(k, n, z = 1.96) {
  if (!n) return { p: 0, bajo: 0, alto: 0 };
  const p = k / n, d = 1 + (z * z) / n;
  const c = (p + (z * z) / (2 * n)) / d;
  const m = (z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))) / d;
  return { p, bajo: Math.max(0, c - m), alto: Math.min(1, c + m) };
}
const mediana = (xs) => { const s = [...xs].sort((a, b) => a - b); return s.length ? (s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : 0; };
// Brazo = lo que sigue al elemento en la etiqueta: E3-con-A → «con-A», E5b-opus → «opus (E5b)».
const brazo = (r) => (/^E5b/.test(r.configuracion) ? "con-opus" : r.configuracion.replace(/^E\d+-/, ""));
const modeloCorto = (m) => (m ?? "").replace("claude-", "").replace("-5-5", " 5.5");

const grupos = new Map();
for (const r of filas) {
  if (!r.elemento || /paso1$/.test(r.elemento)) continue;
  const clave = `${r.elemento}|${brazo(r)}|${modeloCorto(r.modelo)}`;
  if (!grupos.has(clave)) grupos.set(clave, []);
  grupos.get(clave).push(r);
}
const orden = (e) => Number(e.replace(/\D/g, ""));
const resumen = [...grupos].map(([clave, rs]) => {
  const [elemento, b, modelo] = clave.split("|");
  const k = rs.filter((r) => r.exito).length;
  return {
    elemento, brazo: b, modelo, n: rs.length, k, wilson: wilson(k, rs.length),
    escenarios: [...new Set(rs.map((r) => r.tarea ?? r.escenario))],
    costo_mediano: mediana(rs.map((r) => r.costo_usd ?? 0)), costo_total: rs.reduce((s, r) => s + (r.costo_usd ?? 0), 0),
    turnos_mediana: mediana(rs.map((r) => r.turnos ?? 0)), minutos: rs.reduce((s, r) => s + (r.segundos ?? 0), 0) / 60,
    lider: rs.reduce((s, r) => s + (r.intervenciones_lider ?? 0), 0),
  };
}).sort((a, b) => orden(a.elemento) - orden(b.elemento) || a.brazo.localeCompare(b.brazo) || a.modelo.localeCompare(b.modelo));

writeFileSync(join(dir, "resumen.json"), JSON.stringify({ generado: new Date().toISOString(), corridas: filas.length, resumen }, null, 2));
const pct = (x) => `${Math.round(x * 100)}`;
const f2 = (x) => x.toFixed(2).replace(".", ",");
console.log("| Elemento | Brazo | Modelo | Éxito | IC 95 % | Costo mediano USD | Costo total USD | Turnos (mediana) | Minutos | Interv. líder |");
console.log("| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |");
for (const g of resumen)
  console.log(`| ${g.elemento} | ${g.brazo} | ${g.modelo} | ${g.k}/${g.n} | ${pct(g.wilson.bajo)}–${pct(g.wilson.alto)} % | ${f2(g.costo_mediano)} | ${f2(g.costo_total)} | ${g.turnos_mediana} | ${g.minutos.toFixed(1).replace(".", ",")} | ${g.lider} |`);
const total = filas.reduce((s, r) => s + (r.costo_usd ?? 0), 0);
console.log(`\nCorridas: ${filas.length} · costo total: ${f2(total)} USD · minutos de agente: ${(filas.reduce((s, r) => s + (r.segundos ?? 0), 0) / 60).toFixed(0)}`);
