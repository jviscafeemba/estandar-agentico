#!/usr/bin/env node
// CLI falsa de Claude Code para probar la plomería de correr-carriles.mjs sin gastar: no corre ningún modelo.
// Uso: CLAUDE_CLI=simulacion/carriles/cli-falsa.mjs node emba-harness/scripts/correr-carriles.mjs ...
// (correr-carriles corre con node una CLI que termina en .mjs). Lee el carril de --append-system-prompt,
// copia la referencia de ese carril en el directorio actual e imprime un JSON como el de `claude -p
// --output-format json`. El carril A cierra con ESPERA (escala el contrato) y los demás con TERMINADO.
// EMBA_FALSA=fuera: además, el carril C escribe en modulos/ventas/ (escritura fuera de carril que choca con A).
// No ejerce el hook carril: escribe con fs, no con la herramienta Edit/Write de Claude Code.
import { appendFileSync, cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const aqui = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const valor = (n) => args[args.indexOf(n) + 1];
const carril = valor("--append-system-prompt")?.match(/carril ([A-Z])\b/)?.[1];
if (!carril || !args.includes("-p")) {
  console.log(JSON.stringify({ result: "CLI falsa: faltan -p o el carril en --append-system-prompt", is_error: true }));
  process.exit(1);
}
cpSync(join(aqui, "referencias", carril), process.cwd(), { recursive: true });
let cierre = "TERMINADO: listo, pruebas en verde";
if (carril === "A") cierre = "ESPERA: carril B (dueño del contrato) — agregar el campo opcional canal a venta.registrada";
if (process.env.EMBA_FALSA === "fuera" && carril === "C") {
  const ventas = join(process.cwd(), "modulos", "ventas", "ventas.mjs");
  writeFileSync(ventas, readFileSync(ventas, "utf8").replace("export const MAX_UNIDADES = 1000;", "export const MAX_UNIDADES = 1000; // tocado por C"));
  cierre = "TERMINADO: reporte por canal; también ajusté ventas";
}
// Una línea de métricas como la del hook Stop, para que harness_activo se pueda leer.
mkdirSync(join(process.cwd(), ".emba"), { recursive: true });
appendFileSync(join(process.cwd(), ".emba", "metricas.jsonl"), JSON.stringify({ evento: "turno", sesion: `falsa-${carril}`, falsa: true }) + "\n");
const brazo = `EMBA_CARRIL=${process.env.EMBA_CARRIL ?? "sin definir"}, carriles.yaml ${existsSync(join(process.cwd(), ".claude", "carriles.yaml")) ? "presente" : "ausente"}, sección Carriles ${readFileSync(join(process.cwd(), "AGENTS.md"), "utf8").includes("## Carriles") ? "presente" : "ausente"}`;
console.log(JSON.stringify({ type: "result", result: `Hice lo del carril ${carril} (CLI falsa; ${brazo}).\n${cierre}`, session_id: `falsa-${carril}`, total_cost_usd: 0.01, num_turns: 1, permission_denials: [] }));
