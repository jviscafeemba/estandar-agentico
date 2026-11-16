#!/usr/bin/env node
// Hook PreToolUse: bloquea el acceso a archivos de entorno y a secrets/ (ADR-E002).
// Salida 2 = la herramienta no se ejecuta y el agente recibe el motivo por stderr.
// 0.4.1: con el ajuste «secretos-patrones-citados» (.claude/ajustes-harness.txt), el patrón entre comillas de sed,
// grep, awk, perl y rg no se toma como ruta. Apagado por defecto.
import { leerAjustes, leerEntrada, registrar } from "./lib/io.mjs";
import { accesoASecreto } from "./lib/reglas.mjs";

const entrada = await leerEntrada();
const ajustes = leerAjustes(entrada);
const bloqueo = accesoASecreto(entrada.tool_name, entrada.tool_input ?? {}, { patronesCitados: ajustes.has("secretos-patrones-citados") });
if (bloqueo) {
  registrar(entrada, { evento: "bloqueo", regla: bloqueo.regla, herramienta: entrada.tool_name, ajustes: [...ajustes] });
  process.stderr.write(bloqueo.motivo + "\n");
  process.exit(2);
}
