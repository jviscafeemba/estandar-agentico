#!/usr/bin/env node
// Hook PreToolUse (E6): nada sale de la máquina (red, push, publicar) sin una persona. En uso interactivo el
// equivalente es pedir aprobación; en la simulación (modo no interactivo) se bloquea y el agente recibe el motivo.
import { leerEntrada, registrar } from "./lib/io.mjs";
import { salidaARed } from "./lib/reglas-v3.mjs";

const entrada = await leerEntrada();
const bloqueo = salidaARed(entrada.tool_name, entrada.tool_input ?? {});
if (bloqueo) {
  registrar(entrada, { evento: "bloqueo", regla: bloqueo.regla, herramienta: entrada.tool_name, hook: "bloquear-salida" });
  process.stderr.write(bloqueo.motivo + "\n");
  process.exit(2);
}
