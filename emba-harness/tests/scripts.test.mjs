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
    "tests/x.test.mjs": "// RF-001",
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

// ---------- 0.4.0 ----------
const BASE = { "AGENTS.md": "x", "CLAUDE.md": "@AGENTS.md\n", "docs/requerimientos/r.md": "| RF-001 | a |\n| RF-002 | b |\n| RF-003 | c |\n" };

test("F-P-05: la trazabilidad lee pytest y pruebas .spec/.tsx; ignora los worktrees de .claude", () => {
  const raiz = armar({
    ...BASE,
    "api/tests/test_ingreso.py": "def test_x():  # RF-001\n    assert True\n",
    "web/tests/Lista.test.tsx": "// RF-002",
    ".claude/worktrees/x/tests/test_y.py": "# RF-003",
    ".claude/protegidos.txt": "api/tests/\nweb/tests/\n",
    "docs/diseno/estilo-visual.md": "# Estilo",
  });
  const r = verificarProyecto(raiz);
  assert.deepEqual(r.cobertura, { funcionales: 3, conPrueba: 2 });
  assert.deepEqual(r.avisos, ["RF-003 no tiene ninguna prueba que lo nombre"]);
});

test("F-P-12: pruebas fuera de tests/ sin .claude/protegidos.txt dan aviso", () => {
  const r = verificarProyecto(armar({ ...BASE, "api/tests/test_a.py": "# RF-001 RF-002 RF-003" }));
  assert.ok(r.avisos.some((a) => a.includes("protegidos.txt")));
  assert.equal(r.errores.length, 0);
});

test("P-029: un proyecto con pantallas sin estilo visual falla; los HTML de docs/ no cuentan", () => {
  const sin = verificarProyecto(armar({ ...BASE, "web/src/App.tsx": "x" }));
  assert.ok(sin.errores.some((e) => e.includes("docs/diseno/estilo-visual.md")));
  const reporte = verificarProyecto(armar({ ...BASE, "docs/piloto/reporte.html": "<p>" }));
  assert.ok(!reporte.errores.some((e) => e.includes("estilo-visual")));
  const con = verificarProyecto(armar({ ...BASE, "web/src/App.tsx": "x", "docs/diseno/estilo-visual.md": "# Estilo" }));
  assert.ok(!con.errores.some((e) => e.includes("estilo-visual")));
});

test("temas transversales del plan: asignados o fuera de alcance con OK y fecha", () => {
  const plan = (filas) => `# Plan\n\n## Cambios\n\n| ID | x |\n| --- | --- |\n| C-01 | a |\n\n## Temas transversales\n\n| Tema | Cambio | Nota |\n| --- | --- | --- |\n${filas}\n\n## Fechas\n`;
  const ok = "| Interfaz y marca | C-08 | |\n| Accesibilidad | C-08 | |\n| Rendimiento | fuera de alcance (OK: Joaquín, 13/11/2026) | |\n| Operación | C-01 | |";
  assert.equal(verificarProyecto(armar({ ...BASE, "docs/plan/plan.md": plan(ok) })).errores.length, 0);
  const malo = "| Interfaz y marca | pendiente | |\n| Accesibilidad | fuera de alcance | |\n| Rendimiento | C-02 | |";
  const r = verificarProyecto(armar({ ...BASE, "docs/plan/plan.md": plan(malo) }));
  assert.ok(r.errores.some((e) => e.includes("«interfaz y marca» no tiene")));
  assert.ok(r.errores.some((e) => e.includes("«accesibilidad» no tiene")), "fuera de alcance sin OK");
  assert.ok(r.errores.some((e) => e.includes("falta el tema transversal «operación»")));
  const sinSeccion = verificarProyecto(armar({ ...BASE, "docs/plan/plan.md": "# Plan\n" }));
  assert.ok(sinSeccion.errores.some((e) => e.includes("## Temas transversales")));
});
