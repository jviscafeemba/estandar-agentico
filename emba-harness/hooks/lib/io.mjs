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

// 0.4.1: ajustes que un proyecto cambia a propósito, una línea por ajuste, en <proyecto>/.claude/ajustes-harness.txt
// (archivo de control: lo escribe una persona, el agente no puede).
//   pruebas-desde-raiz            E4: en shell, las rutas protegidas se calzan desde la raíz. Apagado por defecto.
//   secretos-patrones-citados     secretos: se ignoran el patrón entre comillas de sed, grep, awk, perl y rg, y el
//                                 texto de un heredoc a cat o tee. ENCENDIDO por defecto desde la 0.4.3 (Joaquín,
//                                 18/11/2026); la línea se acepta pero ya no hace falta.
//   sin-secretos-patrones-citados apaga el anterior y vuelve al comportamiento de la 0.4.0.
export const AJUSTES = ["pruebas-desde-raiz", "secretos-patrones-citados", "sin-secretos-patrones-citados"];
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
