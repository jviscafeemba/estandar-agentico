#!/usr/bin/env node
// Hook PreToolUse (E6): nada sale de la máquina (red, push, publicar) sin una persona. En uso interactivo el
// equivalente es pedir aprobación; en la simulación (modo no interactivo) se bloquea y el agente recibe el motivo.
// 0.4.0: pasan las consultas a la propia máquina (loopback) y lo que habilite .claude/salida-permitida.txt.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { leerEntrada, registrar } from "./lib/io.mjs";
import { leerSalidaPermitida, salidaARed } from "./lib/reglas-v3.mjs";

const entrada = await leerEntrada();
const raiz = process.env.CLAUDE_PROJECT_DIR || entrada.cwd;
const lista = raiz ? join(raiz, ".claude", "salida-permitida.txt") : null;
const permitidas = lista && existsSync(lista) ? leerSalidaPermitida(readFileSync(lista, "utf8")) : [];
const bloqueo = salidaARed(entrada.tool_name, entrada.tool_input ?? {}, { permitidas });
if (bloqueo) {
  registrar(entrada, { evento: "bloqueo", regla: bloqueo.regla, herramienta: entrada.tool_name, hook: "bloquear-salida" });
  process.stderr.write(bloqueo.motivo + "\n");
  process.exit(2);
}
