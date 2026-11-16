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
  const ok = "| Interfaz y marca | C-08 · Claude Design | |\n| Accesibilidad | C-08 | |\n| Rendimiento | fuera de alcance (OK: Joaquín, 13/11/2026) | |\n| Operación | C-01 | |";
  assert.equal(verificarProyecto(armar({ ...BASE, "docs/plan/plan.md": plan(ok) })).errores.length, 0);
  const malo = "| Interfaz y marca | pendiente | |\n| Accesibilidad | fuera de alcance | |\n| Rendimiento | C-02 | |";
  const r = verificarProyecto(armar({ ...BASE, "docs/plan/plan.md": plan(malo) }));
  assert.ok(r.errores.some((e) => e.includes("«interfaz y marca» no tiene")));
  assert.ok(r.errores.some((e) => e.includes("«accesibilidad» no tiene")), "fuera de alcance sin OK");
  assert.ok(r.errores.some((e) => e.includes("falta el tema transversal «operación»")));
  const sinSeccion = verificarProyecto(armar({ ...BASE, "docs/plan/plan.md": "# Plan\n" }));
  assert.ok(sinSeccion.errores.some((e) => e.includes("## Temas transversales")));
});

// ---------- 0.4.1 · Claude Design por defecto ----------
test("interfaz y marca: Claude Design por defecto, o «sin Claude Design» con OK y fecha", () => {
  const plan = (interfaz) =>
    `# Plan\n\n## Temas transversales\n\n| Tema | Cambio | Nota |\n| --- | --- | --- |\n| Interfaz y marca | ${interfaz} | |\n| Accesibilidad | C-08 | |\n| Rendimiento | C-02 | |\n| Operación | C-01 | |\n`;
  const errores = (interfaz) => verificarProyecto(armar({ ...BASE, "docs/plan/plan.md": plan(interfaz) })).errores;
  assert.deepEqual(errores("C-08 · Claude Design"), []);
  assert.deepEqual(errores("C-08 · sin Claude Design (OK: Joaquín, 16/11/2026)"), []);
  assert.deepEqual(errores("fuera de alcance (OK: Joaquín, 16/11/2026)"), [], "fuera de alcance no pide Claude Design");
  assert.ok(errores("C-08").some((e) => e.includes("no dice «Claude Design»")));
  assert.ok(errores("C-08 · sin Claude Design").some((e) => e.includes("necesita el OK")));
});

// ---------- 0.4.2 · prueba de diseño (F-C08-05) y título del plan (F-C08-02) ----------
const PLAN_CD = (interfaz = "C-08 · Claude Design") =>
  `# Plan\n\n## Temas transversales\n\n| Tema | Cambio | Nota |\n| --- | --- | --- |\n| Interfaz y marca | ${interfaz} | |\n| Accesibilidad | C-08 | |\n| Rendimiento | C-02 | |\n| Operación | C-01 | |\n`;
const DIRECCION = (extra = {}) => {
  const d = { enlace: "- **Proyecto de Claude Design:** https://claude.ai/design/p/abc123", elegida: "- **Dirección elegida por:** Joaquín, 17/11/2026", captura: "![Lista](direccion/lista.png)", ...extra };
  return `# Estilo visual\n\n## Dirección visual\n\n${d.enlace}\n${d.elegida}\n\n${d.captura}\n\n## 1. Marca\n`;
};
const CON_PANTALLAS = { ...BASE, "web/src/App.tsx": "x", "docs/diseno/direccion/lista.png": "png" };

test("prueba de diseño: con Claude Design y pantallas, el estilo visual muestra la dirección elegida", () => {
  const ok = verificarProyecto(armar({ ...CON_PANTALLAS, "docs/plan/plan.md": PLAN_CD(), "docs/diseno/estilo-visual.md": DIRECCION() }));
  assert.deepEqual(ok.errores, []);
  const errores = (estilo, plan = PLAN_CD(), extra = {}) =>
    verificarProyecto(armar({ ...CON_PANTALLAS, ...extra, "docs/plan/plan.md": plan, "docs/diseno/estilo-visual.md": estilo })).errores;
  assert.ok(errores("# Estilo visual\n\n## 2. Tokens\n").some((e) => e.includes("falta la sección «## Dirección visual»")), "solo tokens: F-C08-05");
  assert.ok(errores(DIRECCION({ enlace: "- **Proyecto de Claude Design:** <enlace al proyecto>" })).some((e) => e.includes("Proyecto de Claude Design")));
  assert.ok(errores(DIRECCION({ elegida: "- **Dirección elegida por:** <persona>, dd/mm/aaaa" })).some((e) => e.includes("Dirección elegida por")));
  assert.ok(errores(DIRECCION({ captura: "" })).some((e) => e.includes("no tiene capturas")));
  assert.ok(errores(DIRECCION({ captura: "![Lista](direccion/no-existe.png)" })).some((e) => e.includes("no-existe.png no existe")));
});

test("prueba de diseño: no se pide sin Claude Design, con la interfaz fuera de alcance o sin pantallas", () => {
  const solo = "# Estilo visual\n\n## 2. Tokens\n";
  const errores = (archivos) => verificarProyecto(armar(archivos)).errores;
  assert.deepEqual(errores({ ...CON_PANTALLAS, "docs/plan/plan.md": PLAN_CD("C-08 · sin Claude Design (OK: Joaquín, 17/11/2026)"), "docs/diseno/estilo-visual.md": solo }), []);
  assert.deepEqual(errores({ ...CON_PANTALLAS, "docs/plan/plan.md": PLAN_CD("fuera de alcance (OK: Joaquín, 17/11/2026)"), "docs/diseno/estilo-visual.md": solo }), []);
  assert.deepEqual(errores({ ...BASE, "docs/plan/plan.md": PLAN_CD() }), [], "sin pantallas");
});

test("F-C08-02: la línea 1 del plan tiene que ser un título", () => {
  const r = verificarProyecto(armar({ ...BASE, "docs/plan/plan.md": "lan de cambios\n" + PLAN_CD().slice(7) }));
  assert.ok(r.errores.some((e) => e.includes("la línea 1 tiene que ser el título")));
  assert.ok(!verificarProyecto(armar({ ...BASE, "docs/plan/plan.md": PLAN_CD() })).errores.some((e) => e.includes("línea 1")));
});
