// Indicadores de E11 (C1) desde un registro de eventos como el de correr-conjunto.mjs (paso 6).
// El registro de ejemplo está contado a mano en los comentarios de cada aserción.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { indicadoresE11 } from "../scripts/metricas.mjs";

const aqui = dirname(fileURLToPath(import.meta.url));
const archivo = join(aqui, "datos", "registro-ejemplo.jsonl");
const eventos = readFileSync(archivo, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));

test("E11: los 4 indicadores coinciden con el conteo manual del registro de ejemplo", () => {
  const r = indicadoresE11(eventos);
  assert.equal(r.prs_abiertos, 4); // A, B, C, D (D abierto dos veces cuenta una)
  assert.equal(r.prs_unidos, 3); // A, B, D; C rechazado
  // B 10 min, A 30 min, D 60 min (desde el PRIMER pr_abierto) → mediana 30
  assert.deepEqual(r.tiempo_pr_a_main_min, { mediana: 30, n: 3 });
  // A (1 grave) y D (2 graves en la segunda revisión) sobre 4 PR → 50 %
  assert.equal(r.pct_pr_hallazgos_graves.valor, 50);
  assert.deepEqual(r.pct_pr_hallazgos_graves.prs.sort(), ["carril-A", "carril-D"]);
  // D unido con la verificación oculta roja; C también roja pero no se unió (no escapó)
  assert.equal(r.defectos_escapados.valor, 1);
  assert.deepEqual(r.defectos_escapados.prs, ["carril-D"]);
  assert.deepEqual(r.defectos_escapados.sin_verificar, []);
  // total 1,05 + 0,85 + 0,5 + 1,3 + 0,3 (común) = 4,0 → 1,0 por PR; directos 0,5 0,85 1,05 1,3 → mediana 0,95
  assert.equal(r.costo_por_pr_usd.total, 4);
  assert.equal(r.costo_por_pr_usd.valor, 1);
  assert.equal(r.costo_por_pr_usd.mediana_directo, 0.95);
});

test("E11: registro vacío no rompe y deja los indicadores sin valor", () => {
  const r = indicadoresE11([]);
  assert.equal(r.prs_abiertos, 0);
  assert.equal(r.tiempo_pr_a_main_min.mediana, null);
  assert.equal(r.pct_pr_hallazgos_graves.valor, null);
  assert.equal(r.defectos_escapados.valor, 0);
  assert.equal(r.costo_por_pr_usd.valor, null);
});

test("metricas --registro --json: la CLI da lo mismo que la función", () => {
  const r = spawnSync(process.execPath, [join(aqui, "..", "scripts", "metricas.mjs"), "--registro", archivo, "--json"], { encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(JSON.parse(r.stdout), indicadoresE11(eventos));
});
