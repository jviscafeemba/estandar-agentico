#!/usr/bin/env node
// Hook PreToolUse (E7): cada sesión escribe solo en las carpetas de su carril. Adaptado del hook de ai-genesys
// (.claude/hooks/carril.mjs, probado en la Fase 0 con 20 PR en carriles A-G). El carril sale de EMBA_CARRIL
// (en el "env" del .claude/settings.local.json de cada worktree) y la tabla de .claude/carriles.yaml del
// proyecto. Sin EMBA_CARRIL no limita nada. Con carril definido falla cerrado: tabla ilegible → bloquea.
// Límite conocido: cubre Write, Edit, MultiEdit y NotebookEdit, no lo que escribe un comando de shell.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { leerEntrada, registrar } from "./lib/io.mjs";
import { evaluar, leerCarriles } from "./lib/carriles.mjs";

const carril = process.env.EMBA_CARRIL?.trim();
if (!carril) process.exit(0);

const entrada = await leerEntrada();
const raiz = process.env.CLAUDE_PROJECT_DIR || entrada.cwd;
let motivo;
try {
  const carriles = leerCarriles(readFileSync(join(raiz, ".claude", "carriles.yaml"), "utf8"));
  const datos = entrada.tool_input ?? {};
  motivo = evaluar({ carril, carriles, raiz, archivo: datos.file_path ?? datos.notebook_path, cwd: entrada.cwd });
} catch (error) {
  motivo = `Bloqueado por el hook de carriles: no se pudo evaluar la escritura (${error.message}).`;
}
if (motivo) {
  registrar(entrada, { evento: "bloqueo", regla: "carril", carril, herramienta: entrada.tool_name, hook: "carril" });
  process.stderr.write(motivo + "\n");
  process.exit(2);
}
