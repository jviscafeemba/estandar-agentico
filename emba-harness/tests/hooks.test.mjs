// Prueba de punta a punta: el hook recibe el JSON de Claude Code por stdin, sale con 2 y deja la métrica.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HOOKS = join(dirname(fileURLToPath(import.meta.url)), "..", "hooks");

function correr(hook, entrada, proyecto) {
  return spawnSync(process.execPath, [join(HOOKS, hook)], {
    input: JSON.stringify(entrada),
    encoding: "utf8",
    env: { ...process.env, CLAUDE_PROJECT_DIR: proyecto },
  });
}

test("bloquear-secretos sale con 2, explica el motivo y registra el bloqueo", () => {
  const proyecto = mkdtempSync(join(tmpdir(), "emba-hook-"));
  const r = correr("bloquear-secretos.mjs", { session_id: "s1", tool_name: "Bash", tool_input: { command: "cat .env" } }, proyecto);
  assert.equal(r.status, 2);
  assert.match(r.stderr, /ADR-E002/);
  const linea = JSON.parse(readFileSync(join(proyecto, ".emba", "metricas.jsonl"), "utf8").trim());
  assert.equal(linea.evento, "bloqueo");
  assert.equal(linea.regla, "secretos");
  const version = JSON.parse(readFileSync(join(HOOKS, "..", ".claude-plugin", "plugin.json"), "utf8")).version;
  assert.equal(linea.harness, version);
});

test("bloquear-comandos deja pasar un comando normal sin registrar nada", () => {
  const proyecto = mkdtempSync(join(tmpdir(), "emba-hook-"));
  const r = correr("bloquear-comandos.mjs", { tool_name: "Bash", tool_input: { command: "node --test" } }, proyecto);
  assert.equal(r.status, 0);
});

test("una entrada ilegible no bloquea", () => {
  const r = spawnSync(process.execPath, [join(HOOKS, "bloquear-secretos.mjs")], { input: "no es json", encoding: "utf8" });
  assert.equal(r.status, 0);
});

test("registrar-metricas suma los tokens del transcript", () => {
  const proyecto = mkdtempSync(join(tmpdir(), "emba-hook-"));
  const transcript = join(proyecto, "t.jsonl");
  writeFileSync(
    transcript,
    [
      JSON.stringify({ type: "user", message: { content: "hola" } }),
      JSON.stringify({ type: "assistant", message: { usage: { input_tokens: 100, output_tokens: 20, cache_read_input_tokens: 5 } } }),
      JSON.stringify({ type: "assistant", message: { usage: { input_tokens: 50, output_tokens: 10 } } }),
    ].join("\n")
  );
  const r = correr("registrar-metricas.mjs", { session_id: "s2", transcript_path: transcript }, proyecto);
  assert.equal(r.status, 0);
  const linea = JSON.parse(readFileSync(join(proyecto, ".emba", "metricas.jsonl"), "utf8").trim());
  assert.deepEqual(linea.tokens, { entrada: 150, salida: 30, cache_lectura: 5, cache_escritura: 0 });
});
