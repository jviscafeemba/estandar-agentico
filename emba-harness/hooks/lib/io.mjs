// Entrada de los hooks y registro de métricas en <proyecto>/.emba/metricas.jsonl (gitignored).
import { appendFileSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ_PLUGIN = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

export function versionHarness() {
  try {
    return JSON.parse(readFileSync(join(RAIZ_PLUGIN, ".claude-plugin", "plugin.json"), "utf8")).version;
  } catch {
    return "desconocida";
  }
}

export async function leerEntrada() {
  let crudo = "";
  for await (const trozo of process.stdin) crudo += trozo;
  try {
    return JSON.parse(crudo);
  } catch {
    return {}; // sin entrada legible no hay nada que evaluar
  }
}

// 0.4.1: ajustes que un proyecto activa a propósito. Apagados por defecto. Los activa una persona, una línea por
// ajuste, en <proyecto>/.claude/ajustes-harness.txt, que es archivo de control: el agente no puede escribirlo.
//   pruebas-desde-raiz          E4: en shell, las rutas protegidas se calzan desde la raíz del proyecto
//   secretos-patrones-citados   secretos: en sed, grep, awk, perl y rg se ignora el patrón entre comillas
export const AJUSTES = ["pruebas-desde-raiz", "secretos-patrones-citados"];
export function leerAjustes(entrada) {
  try {
    const proyecto = process.env.CLAUDE_PROJECT_DIR || entrada.cwd;
    if (!proyecto) return new Set();
    const texto = readFileSync(join(proyecto, ".claude", "ajustes-harness.txt"), "utf8");
    const lineas = texto.split(/\r?\n/).map((l) => l.replace(/#.*$/, "").trim());
    return new Set(lineas.filter((l) => AJUSTES.includes(l)));
  } catch {
    return new Set();
  }
}

export function registrar(entrada, datos) {
  try {
    const proyecto = process.env.CLAUDE_PROJECT_DIR || entrada.cwd;
    if (!proyecto) return;
    const dir = join(proyecto, ".emba");
    mkdirSync(dir, { recursive: true });
    const linea = { fecha: new Date().toISOString(), sesion: entrada.session_id, harness: versionHarness(), ...datos };
    appendFileSync(join(dir, "metricas.jsonl"), JSON.stringify(linea) + "\n");
  } catch {
    // las métricas nunca deben romper la sesión del agente
  }
}
