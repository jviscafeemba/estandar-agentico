#!/usr/bin/env node
// Hook PreToolUse (E4): las pruebas que existían al empezar son de solo lectura para el agente.
// Rutas protegidas: .claude/protegidos.txt del proyecto (una por línea; "x/" = carpeta), o tests/ si no existe.
// Una persona autoriza una prueba agregándola a .emba/pruebas-autorizadas.txt. Las pruebas nuevas que crea el
// agente quedan en .emba/creados-por-agente.txt y las puede seguir editando.
import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import { leerEntrada, registrar } from "./lib/io.mjs";
import { PROTEGIDOS_POR_DEFECTO, comandoSobreProtegidos, conservaAserciones, escrituraProtegida, leerLista } from "./lib/reglas-v3.mjs";

const entrada = await leerEntrada();
const raiz = process.env.CLAUDE_PROJECT_DIR || entrada.cwd;
if (!raiz) process.exit(0);
const leer = (r) => (existsSync(join(raiz, r)) ? readFileSync(join(raiz, r), "utf8") : "");
const protegidos = existsSync(join(raiz, ".claude", "protegidos.txt")) ? leerLista(leer(".claude/protegidos.txt")) : PROTEGIDOS_POR_DEFECTO;
const autorizadas = leerLista(leer(".emba/pruebas-autorizadas.txt"));
const creados = leerLista(leer(".emba/creados-por-agente.txt"));

const herramienta = entrada.tool_name;
const datos = entrada.tool_input ?? {};
let bloqueo = null;
if (["Edit", "Write", "MultiEdit", "NotebookEdit"].includes(herramienta)) {
  const archivo = datos.file_path ?? datos.notebook_path;
  if (typeof archivo === "string") {
    const absoluto = isAbsolute(archivo) ? archivo : resolve(entrada.cwd || raiz, archivo);
    const rel = relative(raiz, absoluto).replaceAll("\\", "/");
    const existe = existsSync(absoluto);
    bloqueo = escrituraProtegida({ rel, existe, protegidos, autorizadas, creados });
    // v3.2 (C-01): pasa toda edición que conserve las aserciones existentes (agregar pruebas, imports, helpers);
    // el archivo de control nunca.
    if (bloqueo?.regla === "prueba-existente" && conservaAserciones(herramienta, datos, existe ? readFileSync(absoluto, "utf8") : "")) bloqueo = null;
    if (!bloqueo && !existe && protegidos.some((p) => (p.endsWith("/") ? rel.startsWith(p) : rel === p))) {
      mkdirSync(join(raiz, ".emba"), { recursive: true });
      appendFileSync(join(raiz, ".emba", "creados-por-agente.txt"), rel + "\n");
    }
  }
} else if (herramienta === "Bash" || herramienta === "PowerShell") {
  bloqueo = comandoSobreProtegidos(datos.command, protegidos);
}

if (bloqueo) {
  registrar(entrada, { evento: "bloqueo", regla: bloqueo.regla, herramienta, hook: "proteger-pruebas" });
  process.stderr.write(bloqueo.motivo + "\n");
  process.exit(2);
}
