#!/usr/bin/env node
// Hook PreToolUse: bloquea comandos destructivos o irreversibles (ADR-E002).
import { leerEntrada, registrar } from "./lib/io.mjs";
import { comandoPeligroso } from "./lib/reglas.mjs";

const entrada = await leerEntrada();
const bloqueo = comandoPeligroso(entrada.tool_input?.command);
if (bloqueo) {
  registrar(entrada, { evento: "bloqueo", regla: bloqueo.regla, herramienta: entrada.tool_name });
  process.stderr.write(bloqueo.motivo + "\n");
  process.exit(2);
}
