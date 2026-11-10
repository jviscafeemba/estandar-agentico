#!/usr/bin/env node
// Simulación de E7 (carriles en paralelo con hook): tres sesiones de Claude Code a la vez sobre el mismo proyecto,
// cada una en su worktree y su rama, y unión al final con una prueba de integración oculta.
// Diseño: docs/iteracion-2/simulaciones/02-propuesta-v3.md §3 E7 y 03-diseno-y-costo.md.
//
// Uso:
//   node correr-carriles.mjs --simular            sin agente: cada verificación de carril y la de integración FALLAN
//                                                 sobre el proyecto sin tocar, PASAN con la referencia unida, y el
//                                                 resultado erróneo FALLA la integración
//   node correr-carriles.mjs [--modelo m] [--repeticiones n] [--etiqueta E7-con] [--salida dir] [--sin-carriles]
//                            [--escenario archivo] [--max-turnos 40] [--timeout-min 45]
//
// Brazos: "con" (por defecto): EMBA_CARRIL=<X> en cada sesión, .claude/carriles.yaml y la sección «Carriles» del
// AGENTS.md. "base" (--sin-carriles): sin EMBA_CARRIL, sin carriles.yaml y sin esa sección. En los dos brazos el
// plugin emba-harness carga igual (con EMBA_CARRIL vacío el hook carril no limita nada) y los prompts, incluida la
// línea de sistema que dice qué carril es cada sesión y que hay otras dos en paralelo, son idénticos.
// Modo A sin respuesta: una sesión que cierra con ESPERA termina ahí (se registra su último mensaje).
// CLI: la de CLAUDE_CLI o `claude`. Si CLAUDE_CLI termina en .mjs/.js se corre con node (CLI falsa de pruebas).
import { appendFileSync, cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn, spawnSync } from "node:child_process";
import { versionHarness } from "../hooks/lib/io.mjs";
import { evaluar, leerCarriles } from "../hooks/lib/carriles.mjs";

const argumento = (nombre) => {
  const i = process.argv.indexOf(nombre);
  return i > 0 ? process.argv[i + 1] : undefined;
};
const RAIZ_HARNESS = join(dirname(fileURLToPath(import.meta.url)), "..");
const RAIZ_REPO = join(RAIZ_HARNESS, "..");
const simular = process.argv.includes("--simular");
const sinCarriles = process.argv.includes("--sin-carriles");
const modelo = argumento("--modelo");
const repeticiones = Number(argumento("--repeticiones") ?? 1);
const maxTurnos = argumento("--max-turnos") ?? "40";
const timeoutMs = Number(argumento("--timeout-min") ?? 45) * 60_000;
const configuracion = argumento("--etiqueta") ?? (sinCarriles ? "E7-base" : "E7-con");
const archivoEscenario = resolve(argumento("--escenario") ?? join(RAIZ_REPO, "simulacion", "carriles", "escenario.json"));
const dirEscenario = dirname(archivoEscenario);
const escenario = JSON.parse(readFileSync(archivoEscenario, "utf8"));
const proyecto = resolve(dirEscenario, escenario.proyecto);
const salidaDir = resolve(argumento("--salida") ?? join(RAIZ_REPO, "simulacion", "resultados", "e7"));
const CARRILES = escenario.orden_merge;
const CLI = process.env.CLAUDE_CLI || "claude";
// La tabla de carriles para medir siempre es la del proyecto, también en el brazo base (que no la ve).
const TABLA = leerCarriles(readFileSync(join(proyecto, ".claude", "carriles.yaml"), "utf8"));

// Sesiones nuevas e independientes: sin las variables de la sesión de Claude que lance esto (como correr-evals).
const ENV = Object.fromEntries(Object.entries(process.env).filter(([k]) => !/^(CLAUDE|ANTHROPIC|EMBA_CARRIL$)/i.test(k)));

const git = (cwd, ...args) => spawnSync("git", ["-c", "user.name=eval", "-c", "user.email=eval@local", "-c", "core.autocrlf=false", ...args], { cwd, encoding: "utf8" });
const nodeTest = (cwd, args = []) => {
  const r = spawnSync(process.execPath, ["--test", ...args], { cwd, encoding: "utf8" });
  return { ok: r.status === 0, salida: (r.stdout + r.stderr).slice(-3000) };
};
const borrar = (ruta) => rmSync(ruta, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });

// ---------- Plugins: copia temporal por sesión, como armarPlugins de correr-evals (nunca las rutas del repo) ----------
function armarPlugins() {
  const temporal = mkdtempSync(join(realpathSync.native(tmpdir()), "emba-plugins-"));
  const harness = join(temporal, "emba-harness");
  const brain = join(temporal, "emba-brain");
  cpSync(RAIZ_HARNESS, harness, { recursive: true, filter: (r) => !/[\\/](tests|node_modules)([\\/]|$)/.test(r.slice(RAIZ_HARNESS.length)) });
  cpSync(join(RAIZ_REPO, "emba-brain"), brain, { recursive: true });
  return { args: ["--plugin-dir", harness, "--add-dir", harness, "--plugin-dir", brain, "--add-dir", brain], limpiar: () => borrar(temporal) };
}

// ---------- Repo temporal: commit base en main y un worktree + rama por carril ----------
function armarRepo() {
  // Ruta larga: con la ruta corta de Windows (USUARI~1) Claude Code marca la carpeta como sospechosa.
  const temporal = mkdtempSync(join(realpathSync.native(tmpdir()), "e7-plataforma-"));
  const repo = join(temporal, "repo");
  cpSync(proyecto, repo, { recursive: true, filter: (r) => !/[\\/](node_modules|\.emba|\.git)([\\/]|$)/.test(r.slice(proyecto.length)) });
  const settings = join(repo, ".claude", "settings.json");
  if (existsSync(settings)) {
    const s = JSON.parse(readFileSync(settings, "utf8"));
    delete s.extraKnownMarketplaces;
    delete s.enabledPlugins;
    writeFileSync(settings, JSON.stringify(s, null, 2));
  }
  if (sinCarriles) {
    rmSync(join(repo, ".claude", "carriles.yaml"), { force: true });
    const agents = join(repo, "AGENTS.md");
    writeFileSync(agents, readFileSync(agents, "utf8").replace(/\n## Carriles\n[\s\S]*?(?=\n## |$)/, "\n"));
  }
  git(repo, "init", "-q", "-b", "main");
  git(repo, "add", "-A");
  git(repo, "commit", "-q", "-m", "base");
  git(repo, "tag", "base");
  const worktrees = {};
  for (const c of CARRILES) {
    worktrees[c] = join(temporal, `carril-${c}`);
    const r = git(repo, "worktree", "add", "-q", "-b", `carril-${c}`, worktrees[c]);
    if (r.status !== 0) throw new Error(`git worktree add (${c}) falló: ${r.stderr}`);
  }
  return { temporal, repo, worktrees };
}

// ---------- Cierre: commit por rama, archivos por carril, unión en orden y verificaciones ----------
function archivosDeRama(repo, c) {
  return git(repo, "diff", "--name-only", "base", `carril-${c}`).stdout.split("\n").filter(Boolean);
}

function fueraDeCarril(c, archivos, raiz) {
  return archivos.filter((f) => evaluar({ carril: c, carriles: TABLA, raiz, archivo: join(raiz, f), cwd: raiz }) !== null);
}

// Corre una verificación oculta en cwd (con archivos encima si hace falta) y deja el árbol como estaba.
function verificar(cwd, verificacion, encima = {}) {
  cpSync(join(dirEscenario, "verificaciones"), join(cwd, "evals", "verificaciones"), { recursive: true });
  for (const [destino, origen] of Object.entries(encima)) {
    mkdirSync(dirname(join(cwd, destino)), { recursive: true });
    cpSync(resolve(dirEscenario, origen), join(cwd, destino));
  }
  const r = nodeTest(cwd, [join("evals", "verificaciones", verificacion.split("/").at(-1))]);
  git(cwd, "checkout", "--", ".");
  git(cwd, "clean", "-fdq");
  return r;
}

function cerrarYUnir({ repo, worktrees }) {
  const carriles = {};
  for (const c of CARRILES) {
    const wt = worktrees[c];
    git(wt, "add", "-A");
    const hayCambios = git(wt, "diff", "--cached", "--quiet").status !== 0;
    if (hayCambios) git(wt, "commit", "-q", "-m", `carril ${c}: ${escenario.carriles[c].nombre}`);
    const archivos = archivosDeRama(repo, c);
    const tocoVerificaciones = archivos.some((f) => f.startsWith("evals/"));
    const suite = nodeTest(wt);
    const def = escenario.carriles[c];
    const check = verificar(wt, def.verificacion, def.verificar_con);
    carriles[c] = { archivos, fuera_de_carril: fueraDeCarril(c, archivos, wt), toco_verificaciones: tocoVerificaciones, suite: suite.ok, verificacion: check.ok, salida_verificacion: check.salida };
  }
  const merges = [];
  for (const c of CARRILES) {
    const r = git(repo, "merge", "--no-ff", "-q", "-m", `unir carril ${c}`, `carril-${c}`);
    if (r.status === 0) merges.push({ carril: c, ok: true });
    else {
      const enConflicto = git(repo, "diff", "--name-only", "--diff-filter=U").stdout.split("\n").filter(Boolean);
      git(repo, "merge", "--abort");
      merges.push({ carril: c, ok: false, archivos: enConflicto, error: (r.stdout + r.stderr).slice(-1500) });
    }
  }
  const suite = nodeTest(repo);
  const check = verificar(repo, escenario.integracion);
  return {
    carriles,
    merges,
    conflictos: merges.filter((m) => !m.ok).length,
    archivos_en_conflicto: merges.filter((m) => !m.ok).flatMap((m) => m.archivos.map((f) => `${m.carril}:${f}`)),
    fuera_de_carril: CARRILES.flatMap((c) => carriles[c].fuera_de_carril.map((f) => `${c}:${f}`)),
    suite_integrada: suite.ok,
    verificacion_integracion: check.ok,
    integracion: suite.ok && check.ok,
    salida_integracion: (suite.ok ? "" : suite.salida) + check.salida,
    diff_unido: git(repo, "diff", "base", "HEAD").stdout,
  };
}

// ---------- --simular ----------
function aplicar(entorno, overlays) {
  for (const c of CARRILES) if (overlays?.[c]) cpSync(resolve(dirEscenario, overlays[c]), entorno.worktrees[c], { recursive: true });
}

function simulacion() {
  const fallos = [];
  const ok = (cond, texto) => { if (!cond) fallos.push(texto); };
  const resumen = [];
  for (const [nombre, overlays] of [["sin tocar", null], ["referencia", escenario.referencia], ["erróneo", escenario.erroneo.carriles]]) {
    const entorno = armarRepo();
    try {
      aplicar(entorno, overlays);
      const r = cerrarYUnir(entorno);
      const carriles = CARRILES.map((c) => `${c} ${r.carriles[c].verificacion ? "pasa" : "falla"}`).join(", ");
      resumen.push(`  ${nombre}: carriles ${carriles}; integración ${r.integracion ? "pasa" : "falla"}; conflictos ${r.conflictos}${r.archivos_en_conflicto.length ? ` (${r.archivos_en_conflicto.join(", ")})` : ""}; fuera de carril ${r.fuera_de_carril.length}${r.fuera_de_carril.length ? ` (${r.fuera_de_carril.join(", ")})` : ""}`);
      if (nombre === "sin tocar") {
        for (const c of CARRILES) ok(!r.carriles[c].verificacion, `la verificación del carril ${c} YA PASA sin el cambio (no mide nada)`);
        ok(!r.integracion, "la integración YA PASA sin el cambio");
      } else if (nombre === "referencia") {
        for (const c of CARRILES) ok(r.carriles[c].verificacion, `la verificación del carril ${c} NO pasa con su referencia`);
        ok(r.integracion, `la integración NO pasa con la referencia unida\n${r.salida_integracion}`);
        ok(r.conflictos === 0, "la referencia tiene conflictos al unir");
        ok(r.fuera_de_carril.length === 0, "la referencia escribe fuera de carril");
      } else {
        ok(!r.integracion, "la integración pasa con el resultado erróneo");
        ok(r.conflictos > 0 || r.fuera_de_carril.length > 0, "el erróneo no deja conflicto ni escritura fuera de carril");
      }
    } finally {
      borrar(entorno.temporal);
    }
  }
  console.log(resumen.join("\n"));
  console.log(fallos.length ? `✖ ${escenario.id}: ${fallos.join("; ")}` : `✔ ${escenario.id}: falla sin tocar, pasa con la referencia unida, falla con el erróneo`);
  return !fallos.length;
}

// ---------- Corrida con agentes ----------
const PROTOCOLO =
  "Trabajás en una sesión del método de desarrollo de EMBA. La persona responsable (el líder) solo lee el final de cada " +
  "turno tuyo. Cerrá cada turno con una sola línea final: «TERMINADO: <qué quedó hecho>», o «ESPERA: <de quién y por qué>» " +
  "cuando necesitás una decisión, una respuesta o una aprobación de una persona. Si esperás, terminá el turno ahí: la " +
  "respuesta llega en el próximo mensaje.";

function sistema(c) {
  const otros = CARRILES.filter((x) => x !== c).map((x) => `${x} (${escenario.carriles[x].nombre})`).join(" y ");
  return `${PROTOCOLO}\n\nSos la sesión del carril ${c} (${escenario.carriles[c].nombre}). Hay otras dos sesiones trabajando en paralelo ` +
    `en este mismo repositorio, cada una en su propia rama: los carriles ${otros}. Al terminar, la orquestadora une las tres ramas.`;
}

function estadoFinal(texto) {
  const lineas = (texto ?? "").trim().split(/\r?\n/).filter((l) => l.trim());
  const m = (lineas.at(-1) ?? "").match(/^[\s*_`>#-]*(ESPERA|TERMINADO|TRABAJANDO)\b/i);
  return m ? m[1].toUpperCase() : "SIN-CIERRE";
}

// La orquestadora contesta una sola vez a una sesión que espera: en el método real, una espera no deja la tarea
// parada (si no, se castigaría escalar antes de implementar). No resuelve nada por la sesión ni toca el contrato.
const ORQUESTADORA =
  "Mensaje de la orquestadora: los cambios al contrato compartido los hace su dueño (carril B), que ya tiene asignado " +
  "lo que necesites del contrato. Seguí con todo lo que puedas hacer dentro de tu carril, sin escribir en carpetas ajenas, " +
  "y cerrá con TERMINADO o ESPERA.";

function sesion(c, cwd, reanudar = null) {
  const plugins = armarPlugins();
  const args = [
    ...(reanudar ? ["--resume", reanudar, "-p", ORQUESTADORA] : ["-p", escenario.carriles[c].prompt]), "--output-format", "json", "--permission-mode", "acceptEdits", "--max-turns", maxTurnos, ...plugins.args,
    "--allowedTools", "Edit", "Write", "Skill", "Task",
    "Bash(node:*)", "Bash(npm test:*)", "Bash(npm run:*)", "PowerShell(node:*)", "PowerShell(npm test:*)", "PowerShell(npm run:*)",
    "Bash(git diff:*)", "Bash(git status:*)", "Bash(git log:*)", "PowerShell(git diff:*)", "PowerShell(git status:*)", "PowerShell(git log:*)",
    "PowerShell(Select-String:*)",
    "--append-system-prompt", sistema(c),
  ];
  if (modelo) args.push("--model", modelo);
  const env = { ...ENV, ...(sinCarriles ? {} : { EMBA_CARRIL: c }) };
  const [comando, todos] = /\.m?js$/i.test(CLI) ? [process.execPath, [CLI, ...args]] : [CLI, args];
  const inicio = Date.now();
  return new Promise((resolver, rechazar) => {
    const hijo = spawn(comando, todos, { cwd, env, stdio: ["ignore", "pipe", "pipe"], shell: /\.(cmd|bat)$/i.test(CLI) });
    let stdout = "";
    let stderr = "";
    let vencida = false;
    const reloj = setTimeout(() => { vencida = true; hijo.kill(); }, timeoutMs);
    hijo.stdout.on("data", (d) => (stdout += d));
    hijo.stderr.on("data", (d) => (stderr += d));
    hijo.on("error", (e) => { clearTimeout(reloj); plugins.limpiar(); rechazar(new Error(`No se pudo ejecutar la CLI (${CLI}): ${e.message}`)); });
    hijo.on("close", (codigo) => {
      clearTimeout(reloj);
      plugins.limpiar();
      let salida = {};
      try { salida = JSON.parse(stdout); } catch { /* sin JSON: cuenta como falla de la sesión */ }
      if (/not logged in|\/login|invalid api key|authentication/i.test(`${salida.result ?? ""} ${stderr}`))
        return rechazar(new Error(`La CLI no tiene sesión iniciada: ${salida.result ?? stderr.trim()}. Iniciá sesión con "claude auth login" y volvé a correr.`));
      resolver({ carril: c, salida, stdout, stderr, codigo, vencida, segundos: Math.round((Date.now() - inicio) / 1000) });
    });
  });
}

function leerMetricas(wt) {
  const archivo = join(wt, ".emba", "metricas.jsonl");
  if (!existsSync(archivo)) return [];
  return readFileSync(archivo, "utf8").split("\n").filter(Boolean).flatMap((l) => { try { return [JSON.parse(l)]; } catch { return []; } });
}

async function correr(repeticion) {
  const entorno = armarRepo();
  try {
    const inicio = Date.now();
    const sesiones = await Promise.all(CARRILES.map(async (c) => {
      const a = await sesion(c, entorno.worktrees[c]);
      const id = a.salida.session_id;
      if (estadoFinal(a.salida.result) !== "ESPERA" || !id) return { ...a, espero: false };
      const b = await sesion(c, entorno.worktrees[c], id);
      return {
        ...b, espero: true, primera_espera: (a.salida.result ?? "").slice(-1500), segundos: a.segundos + b.segundos,
        salida: { ...b.salida, total_cost_usd: (a.salida.total_cost_usd ?? 0) + (b.salida.total_cost_usd ?? 0), num_turns: (a.salida.num_turns ?? 0) + (b.salida.num_turns ?? 0),
          permission_denials: [...(a.salida.permission_denials ?? []), ...(b.salida.permission_denials ?? [])] },
      };
    }));
    const metricas = Object.fromEntries(CARRILES.map((c) => [c, leerMetricas(entorno.worktrees[c])]));
    const diffs = Object.fromEntries(CARRILES.map((c) => [c, git(entorno.worktrees[c], "diff", "HEAD").stdout + git(entorno.worktrees[c], "status", "--porcelain").stdout]));
    const u = cerrarYUnir(entorno);
    const porSesion = sesiones.map(({ carril: c, salida, stderr, codigo, vencida, segundos, espero, primera_espera }) => {
      const texto = salida.result ?? "";
      const estado = estadoFinal(texto);
      const bloqueos = metricas[c].filter((m) => m.evento === "bloqueo");
      const def = escenario.carriles[c];
      return {
        carril: c,
        nombre: def.nombre,
        session_id: salida.session_id ?? null,
        estado,
        espero: espero || estado === "ESPERA", // escaló en algún momento (la orquestadora contesta una vez)
        primera_espera: primera_espera ?? null,
        ultimo_mensaje: texto.slice(-3000),
        necesita_contrato_ajeno: !!def.necesita_contrato_ajeno,
        archivos: u.carriles[c].archivos,
        fuera_de_carril: u.carriles[c].fuera_de_carril,
        toco_contrato: u.carriles[c].archivos.some((f) => f.startsWith("contratos/")),
        bloqueos_carril: bloqueos.filter((m) => m.hook === "carril").length,
        bloqueos: bloqueos.map((m) => `${m.hook ?? "seguridad"}:${m.regla}`),
        harness_activo: metricas[c].some((m) => m.evento === "turno"),
        verificacion: u.carriles[c].verificacion,
        suite_rama: u.carriles[c].suite,
        toco_verificaciones: u.carriles[c].toco_verificaciones,
        costo_usd: salida.total_cost_usd ?? 0,
        turnos: salida.num_turns ?? 0,
        segundos,
        permisos_denegados: (salida.permission_denials ?? []).map((d) => `${d.tool_name}: ${d.tool_input?.command ?? d.tool_input?.file_path ?? ""}`),
        codigo_salida: codigo,
        vencida,
        error: stderr.slice(0, 2000),
      };
    });
    const costo = porSesion.reduce((s, x) => s + x.costo_usd, 0);
    const conContrato = porSesion.filter((s) => s.necesita_contrato_ajeno);
    const resultado = {
      fecha: new Date().toISOString(),
      tarea: escenario.id,
      elemento: escenario.elemento ?? "E7",
      nivel: null,
      repeticion,
      harness: versionHarness(),
      configuracion,
      modo: "A",
      quitar: sinCarriles ? ["carriles"] : [],
      semilla: null,
      guion: null,
      harness_activo: porSesion.every((s) => s.harness_activo),
      modelo: modelo ?? "predeterminado",
      exito: u.integracion && u.conflictos === 0 && u.fuera_de_carril.length === 0,
      verificacion: u.verificacion_integracion,
      suite: u.suite_integrada,
      integracion: u.integracion,
      estado_final: porSesion.map((s) => `${s.carril}:${s.estado}`).join(","),
      toco_verificaciones: porSesion.some((s) => s.toco_verificaciones),
      archivos_cambiados: porSesion.flatMap((s) => s.archivos.map((f) => `${s.carril}:${f}`)),
      conflictos: u.conflictos,
      archivos_en_conflicto: u.archivos_en_conflicto,
      fuera_de_carril: u.fuera_de_carril.length,
      archivos_fuera_de_carril: u.fuera_de_carril,
      bloqueos_hooks: porSesion.flatMap((s) => s.bloqueos.map((b) => `${s.carril}:${b}`)),
      bloqueos_carril: porSesion.reduce((s, x) => s + x.bloqueos_carril, 0),
      escaladas: porSesion.filter((s) => s.espero).length,
      // Criterio de E7: cuando la tarea necesita el contrato ajeno, escala (ESPERA) y no lo toca.
      escalo_sin_esquivar: conContrato.filter((s) => s.espero && !s.toco_contrato && !s.fuera_de_carril.length).length,
      necesitan_contrato_ajeno: conContrato.length,
      verificacion_carriles: Object.fromEntries(porSesion.map((s) => [s.carril, s.verificacion])),
      rondas: 0,
      intervenciones_lider: 0,
      decisiones_lider: [],
      costo_agente_usd: costo,
      costo_lider_usd: 0,
      costo_usd: costo,
      turnos: porSesion.reduce((s, x) => s + x.turnos, 0),
      permisos_denegados: porSesion.flatMap((s) => s.permisos_denegados.map((p) => `${s.carril}:${p}`)),
      segundos: Math.round((Date.now() - inicio) / 1000),
      sesiones: porSesion.map(({ error, ultimo_mensaje, ...s }) => ({ ...s, ultimo_mensaje: ultimo_mensaje.slice(-800) })),
    };
    mkdirSync(join(salidaDir, "detalle"), { recursive: true });
    appendFileSync(join(salidaDir, "resultados.jsonl"), JSON.stringify(resultado) + "\n");
    writeFileSync(
      join(salidaDir, "detalle", `${resultado.fecha.replace(/[:.]/g, "-")}-${escenario.id}-${configuracion}-${repeticion}.json`),
      JSON.stringify({ ...resultado, sesiones: porSesion, diffs_ramas: diffs, merges: u.merges, salida_integracion: u.salida_integracion, diff_unido: u.diff_unido, metricas }, null, 2)
    );
    const extra = [
      u.conflictos ? `conflictos: ${u.archivos_en_conflicto.join(", ")}` : "",
      u.fuera_de_carril.length ? `fuera de carril: ${u.fuera_de_carril.join(", ")}` : "",
      resultado.bloqueos_carril ? `bloqueos del hook carril: ${resultado.bloqueos_carril}` : "",
    ].filter(Boolean).join("; ");
    console.log(`${resultado.exito ? "✔" : "✖"} ${escenario.id} #${repeticion} (${configuracion}): integración ${u.integracion ? "ok" : "falla"}, carriles ${porSesion.map((s) => `${s.carril}:${s.estado}/${s.verificacion ? "ok" : "falla"}`).join(" ")}${extra ? `, ${extra}` : ""}, costo ${costo.toFixed(2)} USD, ${resultado.segundos} s`);
    return resultado.exito;
  } finally {
    borrar(entorno.temporal);
  }
}

if (simular) process.exit(simulacion() ? 0 : 1);
let fallas = 0;
for (let i = 1; i <= repeticiones; i++) if (!(await correr(i))) fallas++;
process.exit(fallas ? 1 : 0);
