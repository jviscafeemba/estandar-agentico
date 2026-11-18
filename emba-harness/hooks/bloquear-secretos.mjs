#!/usr/bin/env node
// Hook PreToolUse: bloquea el acceso a archivos de entorno y a secrets/ (ADR-E002).
// Salida 2 = la herramienta no se ejecuta y el agente recibe el motivo por stderr.
// 0.4.3: el patrón entre comillas de sed, grep, awk, perl y rg y el texto de un heredoc a cat o tee no se toman como
// rutas, por defecto (decisión de Joaquín, 18/11/2026, tras tres reportes de falsos positivos). Un proyecto vuelve al
// comportamiento anterior con la línea «sin-secretos-patrones-citados» en .claude/ajustes-harness.txt.
import { leerAjustes, leerEntrada, registrar } from "./lib/io.mjs";
import { accesoASecreto } from "./lib/reglas.mjs";

const entrada = await leerEntrada();
const ajustes = leerAjustes(entrada);
const patronesCitados = !ajustes.has("sin-secretos-patrones-citados");
const bloqueo = accesoASecreto(entrada.tool_name, entrada.tool_input ?? {}, { patronesCitados });
if (bloqueo) {
  registrar(entrada, { evento: "bloqueo", regla: bloqueo.regla, herramienta: entrada.tool_name, ajustes: [...ajustes], patronesCitados });
  process.stderr.write(bloqueo.motivo + "\n");
  process.exit(2);
}
