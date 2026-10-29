#!/usr/bin/env node
// Eval del revisor: cada escenario es un cambio sin commitear que pasa sus pruebas pero tiene un error sembrado.
// Se pide una revisión con harness (skill revisar + agente revisor + brain de empresa) o sin harness (pedido genérico)
// y un juez (Haiku) decide si el informe encontró el error conocido.
//
// Uso:
//   node correr.mjs --simular                 sin agente: cada escenario aplica limpio y sus pruebas pasan
//   node correr.mjs [--repeticiones n] [--escenario id[,id]] [--sin-harness]
import { appendFileSync, cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = resolve(AQUI, "..");
const argumento = (n) => (process.argv.indexOf(n) > 0 ? process.argv[process.argv.indexOf(n) + 1] : undefined);
const simular = process.argv.includes("--simular");
const sinHarness = process.argv.includes("--sin-harness");
const repeticiones = Number(argumento("--repeticiones") ?? 1);
const filtro = argumento("--escenario")?.split(",");
const CLI = process.env.CLAUDE_CLI || "claude";
const env = Object.fromEntries(Object.entries(process.env).filter(([k]) => !/^(CLAUDE|ANTHROPIC)/i.test(k)));

const escenarios = readdirSync(join(AQUI, "escenarios"))
  .map((id) => ({ ...JSON.parse(readFileSync(join(AQUI, "escenarios", id, "escenario.json"), "utf8")), dir: join(AQUI, "escenarios", id) }))
  .filter((e) => !filtro || filtro.includes(e.id));

const git = (cwd, ...args) => spawnSync("git", ["-c", "user.name=eval", "-c", "user.email=eval@local", ...args], { cwd, encoding: "utf8" });

function preparar(escenario) {
  const proyecto = join(RAIZ, escenario.proyecto);
  const copia = mkdtempSync(join(realpathSync.native(tmpdir()), `revisor-${escenario.id}-`));
  const excluir = new RegExp(String.raw`[\\/](evals|node_modules|\.emba|\.git)([\\/]|$)`);
  cpSync(proyecto, copia, { recursive: true, filter: (r) => !excluir.test(r.slice(proyecto.length)) });
  const settings = join(copia, ".claude", "settings.json");
  if (existsSync(settings)) {
    const s = JSON.parse(readFileSync(settings, "utf8"));
    delete s.extraKnownMarketplaces;
    delete s.enabledPlugins;
    writeFileSync(settings, JSON.stringify(s, null, 2));
  }
  git(copia, "init", "-q");
  git(copia, "add", "-A");
  git(copia, "commit", "-q", "-m", "base");
  cpSync(join(escenario.dir, "archivos"), copia, { recursive: true }); // el cambio queda sin commitear
  return copia;
}

function claude(args, cwd) {
  const r = spawnSync(CLI, args, { cwd, encoding: "utf8", env, maxBuffer: 64 * 1024 * 1024 });
  if (r.error) throw new Error(`No se pudo ejecutar la CLI (${CLI}): ${r.error.message}`);
  let salida = {};
  try { salida = JSON.parse(r.stdout); } catch { /* sin JSON */ }
  if (/not logged in|\/login|invalid api key/i.test(`${salida.result ?? ""} ${r.stderr}`)) throw new Error("La CLI no tiene sesión iniciada.");
  return salida;
}

function juzgar(escenario, informe, cwd) {
  const prompt =
    "Te doy la descripción de un error conocido en un cambio de código y el informe de un revisor. " +
    "¿El informe identifica ese error, aunque lo describa con otras palabras o lo mencione entre otros hallazgos? " +
    "Respondé solo SI o NO.\n\nERROR CONOCIDO:\n" + escenario.error + "\n\nINFORME DEL REVISOR:\n" + (informe || "(vacío)");
  // Juez: Sonnet por defecto (Haiku dio un falso negativo en la primera tanda); JUEZ_MODELO lo cambia.
  const salida = claude(["-p", prompt, "--output-format", "json", "--model", process.env.JUEZ_MODELO || "sonnet", "--max-turns", "1"], cwd);
  // Sin \b: en JS, «Í» no es carácter de palabra y /SÍ\b/ no reconoce «SÍ» al final.
  const respuesta = (salida.result ?? "").trim();
  return { detecto: /^\**\s*S[IÍ](?![A-Za-z])/i.test(respuesta), respuesta: respuesta.slice(0, 40), costo: salida.total_cost_usd ?? 0 };
}

// --rejuzgar: vuelve a juzgar los informes guardados en detalle/ y reescribe resultados.jsonl (no repite revisiones).
if (process.argv.includes("--rejuzgar")) {
  const dir = join(AQUI, "detalle");
  const lineas = [];
  for (const f of readdirSync(dir).sort()) {
    const d = JSON.parse(readFileSync(join(dir, f), "utf8"));
    const escenario = escenarios.find((e) => e.id === d.escenario) ?? JSON.parse(readFileSync(join(AQUI, "escenarios", d.escenario, "escenario.json"), "utf8"));
    const juicio = juzgar(escenario, d.informe, AQUI);
    const { informe, ...resto } = d;
    const actualizado = { ...resto, detecto: juicio.detecto, juez: juicio.respuesta, costo_juez_usd: juicio.costo };
    writeFileSync(join(dir, f), JSON.stringify({ ...actualizado, informe }, null, 2));
    lineas.push(JSON.stringify(actualizado));
    console.log(`${juicio.detecto ? "✔" : "✖"} ${d.escenario} (${d.configuracion}): juez «${juicio.respuesta}»`);
  }
  writeFileSync(join(AQUI, "resultados.jsonl"), lineas.join("\n") + "\n");
  process.exit(0);
}

let fallas = 0;
for (const escenario of escenarios) {
  for (let i = 1; i <= (simular ? 1 : repeticiones); i++) {
    const copia = preparar(escenario);
    try {
      if (simular) {
        const pruebas = spawnSync(process.execPath, ["--test"], { cwd: copia, encoding: "utf8" }).status === 0;
        const cambio = git(copia, "status", "--porcelain").stdout.trim().split("\n").length;
        console.log(`${pruebas ? "✔" : "✖"} ${escenario.id}: pruebas ${pruebas ? "en verde" : "FALLAN"} con el error sembrado; ${cambio} archivo(s) cambiados`);
        if (!pruebas) fallas++;
        continue;
      }
      const base =
        `revisar el cambio sin commitear de este repositorio (mirá git status y git diff; hay archivos nuevos) contra su propuesta ${escenario.propuesta}. ` +
        "No modifiques archivos. Terminá con la lista de hallazgos, del más grave al menos grave, o decí que no encontraste problemas.";
      const prompt = sinHarness ? `Necesito ${base}` : `Usá la skill emba-harness:revisar para ${base}`;
      const brain = join(RAIZ, "emba-brain");
      const harness = join(RAIZ, "emba-harness");
      const plugins = sinHarness ? [] : ["--plugin-dir", harness, "--plugin-dir", brain, "--add-dir", brain, harness];
      const args = [
        "-p", prompt, "--output-format", "json", "--permission-mode", "default", "--max-turns", "40", ...plugins,
        "--allowedTools", "Skill", "Task",
        "Bash(git diff:*)", "Bash(git status:*)", "Bash(node:*)", "Bash(npm test:*)",
        "PowerShell(git diff:*)", "PowerShell(git status:*)", "PowerShell(node:*)", "PowerShell(npm test:*)",
      ];
      const inicio = Date.now();
      const salida = claude(args, copia);
      const juicio = juzgar(escenario, salida.result, copia);
      const resultado = {
        fecha: new Date().toISOString(),
        escenario: escenario.id,
        repeticion: i,
        configuracion: sinHarness ? "sin-harness" : "con-harness",
        detecto: juicio.detecto,
        juez: juicio.respuesta,
        costo_usd: salida.total_cost_usd ?? null,
        costo_juez_usd: juicio.costo,
        turnos: salida.num_turns ?? null,
        segundos: Math.round((Date.now() - inicio) / 1000),
        permisos_denegados: (salida.permission_denials ?? []).map((d) => `${d.tool_name}: ${d.tool_input?.command ?? d.tool_input?.file_path ?? ""}`),
      };
      appendFileSync(join(AQUI, "resultados.jsonl"), JSON.stringify(resultado) + "\n");
      mkdirSync(join(AQUI, "detalle"), { recursive: true });
      writeFileSync(
        join(AQUI, "detalle", `${resultado.fecha.replace(/[:.]/g, "-")}-${escenario.id}-${resultado.configuracion}.json`),
        JSON.stringify({ ...resultado, informe: salida.result ?? "" }, null, 2)
      );
      console.log(`${juicio.detecto ? "✔" : "✖"} ${escenario.id} #${i} (${resultado.configuracion}): ${juicio.detecto ? "encontró" : "no encontró"} el error, ${resultado.costo_usd?.toFixed(2) ?? "?"} USD`);
    } finally {
      rmSync(copia, { recursive: true, force: true });
    }
  }
}
process.exit(fallas ? 1 : 0);
