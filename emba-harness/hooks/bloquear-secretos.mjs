#!/usr/bin/env node
// Hook PreToolUse: bloquea el acceso a archivos de entorno y a secrets/ (ADR-E002).
// Salida 2 = la herramienta no se ejecuta y el agente recibe el motivo por stderr.
import { leerEntrada, registrar } from "./lib/io.mjs";
import { accesoASecreto } from "./lib/reglas.mjs";

const entrada = await leerEntrada();
const bloqueo = accesoASecreto(entrada.tool_name, entrada.tool_input ?? {});
if (bloqueo) {
  registrar(entrada, { evento: "bloqueo", regla: bloqueo.regla, herramienta: entrada.tool_name });
  process.stderr.write(bloqueo.motivo + "\n");
  process.exit(2);
}
