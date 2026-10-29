// Pruebas de los scripts del harness con proyectos y brains de juguete.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { lintBrain } from "../scripts/lint-brain.mjs";
import { verificarProyecto } from "../scripts/verificar-proyecto.mjs";
import { resumir } from "../scripts/metricas.mjs";

function armar(archivos) {
  const raiz = mkdtempSync(join(tmpdir(), "emba-"));
  for (const [ruta, contenido] of Object.entries(archivos)) {
    mkdirSync(dirname(join(raiz, ruta)), { recursive: true });
    writeFileSync(join(raiz, ruta), contenido);
  }
  return raiz;
}

const fm = (vence, extra = "") => `---\ndueño: x\nestado: vigente\nrevisado: 2026-01-01\nvence: ${vence}\nfuentes: [a.md]\n${extra}---\n`;

test("lint-brain: vencido, por vencer, campo faltante y enlace roto", () => {
  const raiz = armar({
    "a.md": fm("2027-06-01") + "[ok](b.md) [roto](no-existe.md) [web](https://x.com)",
    "b.md": fm("2026-11-10"),
    "c.md": fm("2026-10-01"),
    "d.md": "---\ndueño: x\n---\n",
  });
  const { errores, avisos } = lintBrain(raiz, "2026-10-29");
  assert.ok(errores.some((e) => e.includes("a.md: enlace roto a no-existe.md")));
  assert.ok(errores.some((e) => e.startsWith("c.md: vencido")));
  assert.ok(errores.some((e) => e.includes('d.md: falta "vence"')));
  assert.ok(avisos.some((a) => a.startsWith("b.md: vence")));
  assert.ok(!errores.some((e) => e.includes("https://x.com")));
});

test("verificar-proyecto: IDs citados que no existen y trazabilidad", () => {
  const raiz = armar({
    "AGENTS.md": "Reglas: ADR-001, ADR-009, RF-001, RF-007",
    "CLAUDE.md": "@AGENTS.md\n",
    "docs/adr/ADR-001-algo.md": "# ADR-001",
    "docs/requerimientos/r.md": "| RF-001 | a |\n| RF-002 | b |\n",
    "src/x.test.mjs": "// RF-001",
  });
  const r = verificarProyecto(raiz);
  assert.ok(r.errores.some((e) => e.includes("ADR-009")));
  assert.ok(r.errores.some((e) => e.includes("RF-007")));
  assert.deepEqual(r.avisos, ["RF-002 no tiene ninguna prueba que lo nombre"]);
  assert.deepEqual(r.cobertura, { funcionales: 2, conPrueba: 1 });
});

test("verificar-proyecto: AGENTS.md largo y CLAUDE.md sin import", () => {
  const raiz = armar({ "AGENTS.md": "x\n".repeat(200), "CLAUDE.md": "nada" });
  const r = verificarProyecto(raiz);
  assert.ok(r.errores.some((e) => e.includes("líneas")));
  assert.ok(r.errores.some((e) => e.includes("@AGENTS.md")));
});

test("metricas: tokens por sesión toman el último turno; bloqueos por regla", () => {
  const r = resumir([
    { evento: "turno", sesion: "a", tokens: { entrada: 10, salida: 1 } },
    { evento: "turno", sesion: "a", tokens: { entrada: 30, salida: 3 } },
    { evento: "turno", sesion: "b", tokens: { entrada: 5, salida: 2 } },
    { evento: "bloqueo", regla: "secretos" },
    { evento: "bloqueo", regla: "secretos" },
  ]);
  assert.equal(r.sesiones, 2);
  assert.equal(r.turnos, 3);
  assert.equal(r.tokens.entrada, 35);
  assert.deepEqual(r.bloqueos, { secretos: 2 });
});
