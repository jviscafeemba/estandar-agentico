#!/usr/bin/env node
// Evals del harness: corre las tareas canónicas de un proyecto con Claude Code en modo no interactivo y
// verifica el resultado con pruebas ocultas. Se corre al cambiar el plugin, un ADR, el AGENTS.md o el modelo,
// y se compara con la corrida anterior (evals/resultados.jsonl; resumen con comparar-evals.mjs).
//
// Uso:
//   node correr-evals.mjs <proyecto> --simular     sin agente: comprueba que cada verificación FALLA sobre el
//                                                  código actual (si pasa, la tarea no mide nada)
//   node correr-evals.mjs <proyecto> [--modelo m] [--tarea id[,id]] [--nivel basica|discriminante]
//                                    [--repeticiones n] [--sin-harness | --variante liviano]
//                                                  con agente: necesita la CLI `claude` en el PATH o en CLAUDE_CLI
//
// Campos opcionales de una tarea:
//   preparar: { "<ruta>": "<contenido>" }  archivos que se crean en la copia antes de correr (p. ej. un .env falso)
//   canario:  "<texto>"                    si aparece en la transcripción, en la respuesta o en un archivo que no
//                                          sea el preparado, hubo fuga de un secreto y la tarea falla
import { appendFileSync, cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, realpathSync, rmSync, statSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { basename, dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { versionHarness } from "../hooks/lib/io.mjs";

const argumento = (nombre) => {
  const i = process.argv.indexOf(nombre);
  return i > 0 ? process.argv[i + 1] : undefined;
};
const raiz = resolve(process.argv[2] ?? ".");
const simular = process.argv.includes("--simular");
const sinHarness = process.argv.includes("--sin-harness");
const modelo = argumento("--modelo");
const repeticiones = Number(argumento("--repeticiones") ?? 1);
const filtroTareas = argumento("--tarea")?.split(",");
const filtroNivel = argumento("--nivel");
const RAIZ_HARNESS = join(dirname(fileURLToPath(import.meta.url)), "..");
// --variante liviano: solo hooks de seguridad y métricas (variantes/emba-harness-liviano), sin skills ni revisor.
const variante = argumento("--variante");
const PLUGIN_HARNESS = variante ? join(RAIZ_HARNESS, "..", "variantes", `emba-harness-${variante}`) : RAIZ_HARNESS;
if (!existsSync(PLUGIN_HARNESS)) throw new Error(`No existe la variante ${variante} (${PLUGIN_HARNESS})`);
// CLI de Claude Code: la del PATH, o la indicada en CLAUDE_CLI (p. ej. la que trae la app de escritorio).
const CLI = process.env.CLAUDE_CLI || "claude";

const tareas = JSON.parse(readFileSync(join(raiz, "evals", "tareas.json"), "utf8")).filter(
  (t) => (!filtroTareas || filtroTareas.includes(t.id)) && (!filtroNivel || t.nivel === filtroNivel)
);

function copiaLimpia(tarea) {
  // Ruta larga: con la ruta corta de Windows (USUARI~1) Claude Code marca la carpeta como sospechosa y niega lecturas.
  const destino = mkdtempSync(join(realpathSync.native(tmpdir()), `eval-${basename(raiz)}-${tarea.id}-`));
  // evals/ no se copia: el agente no debe ver las tareas ni las verificaciones ocultas (entran después de correr).
  const excluir = new RegExp(String.raw`^${join(raiz, "evals").replace(/[\\.]/g, "\\$&")}([\\/]|$)|[\\/](node_modules|\.emba|\.git)([\\/]|$)`);
  cpSync(raiz, destino, { recursive: true, filter: (r) => !excluir.test(r) });
  for (const [ruta, contenido] of Object.entries(tarea.preparar ?? {})) writeFileSync(join(destino, ruta), contenido);
  // La copia no revela dónde está el marketplace: sin harness, el agente encontraba el brain de empresa
  // leyendo esa ruta en settings.json y buscando en el disco. Con harness los plugins entran por --plugin-dir.
  const settings = join(destino, ".claude", "settings.json");
  if (existsSync(settings)) {
    const s = JSON.parse(readFileSync(settings, "utf8"));
    delete s.extraKnownMarketplaces;
    delete s.enabledPlugins;
    writeFileSync(settings, JSON.stringify(s, null, 2));
  }
  return destino;
}

function archivosDe(dir) {
  return readdirSync(dir).flatMap((n) => {
    const r = join(dir, n);
    return statSync(r).isDirectory() ? (n === "node_modules" ? [] : archivosDe(r)) : [r];
  });
}

function transcripcion(sesion) {
  const proyectos = join(homedir(), ".claude", "projects");
  if (!sesion || !existsSync(proyectos)) return "";
  for (const dir of readdirSync(proyectos)) {
    const archivo = join(proyectos, dir, `${sesion}.jsonl`);
    if (existsSync(archivo)) return readFileSync(archivo, "utf8");
  }
  return "";
}

// Dónde apareció el canario fuera del archivo preparado que lo contiene.
function fugas(tarea, copia, salida) {
  if (!tarea.canario) return [];
  const lugares = [];
  if (transcripcion(salida.session_id).includes(tarea.canario)) lugares.push("transcripción de la sesión");
  if ((salida.result ?? "").includes(tarea.canario)) lugares.push("respuesta final");
  const preparados = new Set(Object.keys(tarea.preparar ?? {}).map((r) => resolve(copia, r)));
  for (const a of archivosDe(copia))
    if (!preparados.has(resolve(a)) && readFileSync(a, "utf8").includes(tarea.canario)) lugares.push(relative(copia, a));
  return lugares;
}

const nodeTest = (cwd, args = []) => spawnSync(process.execPath, ["--test", ...args], { cwd, encoding: "utf8" }).status === 0;

function correr(tarea, repeticion) {
  const copia = copiaLimpia(tarea);
  try {
    if (simular) {
      const pasa = nodeTest(copia, [tarea.verificacion]);
      console.log(`${pasa ? "✖" : "✔"} ${tarea.id}: la verificación ${pasa ? "YA PASA sin el cambio (no mide nada)" : "falla antes del cambio, como debe"}`);
      return !pasa;
    }
    // Con harness, los plugins se cargan explícitamente: en modo no interactivo el marketplace del proyecto no
    // se instala solo. Sin harness, el agente solo tiene el brain del proyecto (línea base para comparar).
    // Lecturas: solo dentro del proyecto (lo predeterminado); con harness, también el brain de empresa (--add-dir).
    const brain = join(RAIZ_HARNESS, "..", "emba-brain");
    const plugins = sinHarness ? [] : ["--plugin-dir", PLUGIN_HARNESS, "--plugin-dir", brain, "--add-dir", brain, PLUGIN_HARNESS];
    const args = [
      "-p", tarea.prompt, "--output-format", "json", "--permission-mode", "acceptEdits", "--max-turns", "40", ...plugins,
      // El agente puede editar y correr node/npm para sus pruebas; nada más de shell. Read/Glob/Grep no se
      // permiten en general: así no lee fuera del proyecto. En Windows el shell es PowerShell: van las dos reglas.
      "--allowedTools", "Edit", "Write", "Skill", "Task",
      "Bash(node:*)", "Bash(npm test:*)", "Bash(npm run:*)", "PowerShell(node:*)", "PowerShell(npm test:*)", "PowerShell(npm run:*)",
    ];
    if (modelo) args.push("--model", modelo);
    // La corrida es una sesión nueva e independiente: sin las variables de una sesión de Claude que la lance
    // (la de la app de escritorio redirige la autenticación a la app).
    const env = Object.fromEntries(Object.entries(process.env).filter(([k]) => !/^(CLAUDE|ANTHROPIC)/i.test(k)));
    const inicio = Date.now();
    const r = spawnSync(CLI, args, { cwd: copia, encoding: "utf8", env, maxBuffer: 64 * 1024 * 1024, shell: /\.(cmd|bat)$/i.test(CLI) });
    if (r.error) throw new Error(`No se pudo ejecutar la CLI (${CLI}): ${r.error.message}`);
    let salida = {};
    try { salida = JSON.parse(r.stdout); } catch { /* sin JSON: cuenta como falla */ }
    // Un problema de la CLI (sin sesión, sin red) no es un resultado de la tarea: se corta sin registrarlo.
    if (/not logged in|\/login|invalid api key|authentication/i.test(`${salida.result ?? ""} ${r.stderr}`))
      throw new Error(`La CLI no tiene sesión iniciada: ${salida.result ?? r.stderr.trim()}. Iniciá sesión con "claude auth login" y volvé a correr.`);

    const fuga = fugas(tarea, copia, salida);
    // Las verificaciones ocultas entran recién ahora; si el agente creó algo en evals/, se registra y se pisa.
    const tocoVerificaciones = existsSync(join(copia, "evals"));
    cpSync(join(raiz, "evals", "verificaciones"), join(copia, "evals", "verificaciones"), { recursive: true });
    const verificacionOk = nodeTest(copia, [tarea.verificacion]);
    const suiteOk = nodeTest(copia);
    const metricasHook = join(copia, ".emba", "metricas.jsonl");
    const resultado = {
      fecha: new Date().toISOString(),
      tarea: tarea.id,
      nivel: tarea.nivel ?? null,
      repeticion,
      harness: versionHarness(),
      configuracion: sinHarness ? "sin-harness" : variante ? `harness-${variante}` : "con-harness",
      harness_activo: existsSync(metricasHook), // el hook Stop solo escribe si el plugin cargó
      modelo: modelo ?? "predeterminado",
      exito: verificacionOk && suiteOk && !tocoVerificaciones && fuga.length === 0,
      verificacion: verificacionOk,
      suite: suiteOk,
      toco_verificaciones: tocoVerificaciones,
      fuga_secreto: fuga,
      costo_usd: salida.total_cost_usd ?? null,
      turnos: salida.num_turns ?? null,
      permisos_denegados: (salida.permission_denials ?? []).map((d) => `${d.tool_name}: ${d.tool_input?.command ?? d.tool_input?.file_path ?? ""}`),
      segundos: Math.round((Date.now() - inicio) / 1000),
    };
    appendFileSync(join(raiz, "evals", "resultados.jsonl"), JSON.stringify(resultado) + "\n");
    // Detalle para analizar la corrida (gitignored en .emba/): respuesta, diff y métricas del hook.
    const detalle = join(raiz, ".emba", "evals");
    mkdirSync(detalle, { recursive: true });
    const diff = spawnSync("git", ["diff", "--no-index", "--", join(raiz, "src"), join(copia, "src")], { encoding: "utf8" }).stdout;
    const archivos = spawnSync("git", ["diff", "--no-index", "--stat", "--", raiz, copia], { encoding: "utf8" }).stdout;
    const hook = existsSync(metricasHook) ? readFileSync(metricasHook, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l)) : [];
    writeFileSync(
      join(detalle, `${resultado.fecha.replace(/[:.]/g, "-")}-${tarea.id}-${resultado.configuracion}.json`),
      JSON.stringify({ ...resultado, respuesta: salida.result ?? r.stdout.slice(0, 4000), error: r.stderr.slice(0, 2000), diff, archivos, hook }, null, 2)
    );
    const extra = fuga.length ? `, FUGA del canario en ${fuga.join(", ")}` : "";
    console.log(`${resultado.exito ? "✔" : "✖"} ${tarea.id} #${repeticion} (${resultado.configuracion}): verificación ${verificacionOk ? "ok" : "falla"}, suite ${suiteOk ? "ok" : "falla"}${extra}, costo ${resultado.costo_usd?.toFixed(2) ?? "?"} USD`);
    return resultado.exito;
  } finally {
    rmSync(copia, { recursive: true, force: true });
  }
}

let fallas = 0;
for (const tarea of tareas)
  for (let i = 1; i <= (simular ? 1 : repeticiones); i++) if (!correr(tarea, i)) fallas++;
process.exit(fallas ? 1 : 0);
