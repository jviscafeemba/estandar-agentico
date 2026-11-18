// Pruebas de la 0.4.3 (lecciones de las corridas 1 y 2 de C-08 en ai-desempeno, 18/11/2026): autorizar pruebas con el
// diálogo de permisos de la app, el vigilante de progreso y los pasos de capturar.mjs. Los secretos por defecto están
// en ajustes-041.test.mjs.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, realpathSync, utimesSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { comandoSobreProtegidos, pedidoDeAutorizacion } from "../hooks/lib/reglas-v3.mjs";
import { estado, ultimoCambio } from "../scripts/vigilar.mjs";
import { planDeCapturas } from "../scripts/capturar.mjs";

const RAIZ_HARNESS = join(dirname(fileURLToPath(import.meta.url)), "..");
const correrHook = (hook, entrada, proyecto) =>
  spawnSync(process.execPath, [join(RAIZ_HARNESS, "hooks", hook)], { input: JSON.stringify(entrada), encoding: "utf8", env: { ...process.env, CLAUDE_PROJECT_DIR: proyecto } });

// ---------- autorizar pruebas desde la app (F-C08v2-05) ----------
test("pedidoDeAutorizacion: solo node …/autorizar-prueba.mjs con rutas relativas, sin nada más", () => {
  assert.deepEqual(pedidoDeAutorizacion("node ../poc/emba-harness/scripts/autorizar-prueba.mjs tests/a.test.mjs"), ["tests/a.test.mjs"]);
  assert.deepEqual(pedidoDeAutorizacion('node "C:\\x\\emba-harness\\scripts\\autorizar-prueba.mjs" ./api/tests/test_a.py web/tests/b.test.tsx'), ["api/tests/test_a.py", "web/tests/b.test.tsx"]);
  for (const c of ["node autorizar-prueba.mjs", "node autorizar-prueba.mjs ../otro/tests/a.py", "node autorizar-prueba.mjs /etc/x", "node autorizar-prueba.mjs C:/x/tests/a.py",
    "node autorizar-prueba.mjs tests/*.py", "node autorizar-prueba.mjs --todas", "node autorizar-prueba.mjs tests/a.py && rm tests/b.py",
    "node autorizar-prueba.mjs tests/a.py > /dev/null", "node autorizar-prueba.mjs $(ls tests)", "bash -c 'node autorizar-prueba.mjs tests/a.py'",
    "echo tests/a.py >> .emba/pruebas-autorizadas.txt"])
    assert.equal(pedidoDeAutorizacion(c), null, c);
});

test("comandoSobreProtegidos: un pedido válido se pregunta; uno inválido se bloquea", () => {
  const ok = comandoSobreProtegidos("node h/scripts/autorizar-prueba.mjs tests/a.test.mjs", ["tests/"]);
  assert.equal(ok.preguntar, true);
  assert.deepEqual(ok.pruebas, ["tests/a.test.mjs"]);
  const mal = comandoSobreProtegidos("node h/scripts/autorizar-prueba.mjs tests/a.test.mjs; rm tests/b.test.mjs", ["tests/"]);
  assert.equal(mal.regla, "autorizar-prueba");
  assert.ok(!mal.preguntar);
});

test("hook proteger-pruebas de punta a punta: pide el OK en la app, registra el pedido y no escribe nada", () => {
  const p = realpathSync.native(mkdtempSync(join(tmpdir(), "emba-aut-")));
  const r = correrHook("proteger-pruebas.mjs", { tool_name: "Bash", tool_input: { command: "node ../h/scripts/autorizar-prueba.mjs tests/a.test.mjs" }, cwd: p }, p);
  assert.equal(r.status, 0);
  const salida = JSON.parse(r.stdout);
  assert.equal(salida.hookSpecificOutput.permissionDecision, "ask");
  assert.match(salida.hookSpecificOutput.permissionDecisionReason, /tests\/a\.test\.mjs/);
  const registro = readFileSync(join(p, ".emba", "metricas.jsonl"), "utf8");
  assert.match(registro, /"evento":"autorizacion-pedida"/);
  assert.throws(() => readFileSync(join(p, ".emba", "pruebas-autorizadas.txt")), "el hook no autoriza: lo hace el script si la persona aprueba");
  const mal = correrHook("proteger-pruebas.mjs", { tool_name: "Bash", tool_input: { command: "node x/autorizar-prueba.mjs tests/a.py && echo listo" }, cwd: p }, p);
  assert.equal(mal.status, 2);
});

test("autorizar-prueba.mjs (cuando la persona aprueba): anota la prueba, registra y rechaza rutas fuera del proyecto", () => {
  const p = realpathSync.native(mkdtempSync(join(tmpdir(), "emba-aut2-")));
  mkdirSync(join(p, "tests"));
  writeFileSync(join(p, "tests", "a.test.mjs"), "x");
  const r = spawnSync(process.execPath, [join(RAIZ_HARNESS, "scripts", "autorizar-prueba.mjs"), "tests/a.test.mjs", "../fuera.py"], { cwd: p, encoding: "utf8", env: { ...process.env, CLAUDE_PROJECT_DIR: p } });
  assert.equal(r.status, 0);
  assert.equal(readFileSync(join(p, ".emba", "pruebas-autorizadas.txt"), "utf8"), "tests/a.test.mjs\n");
  assert.match(r.stderr, /fuera del proyecto/);
  assert.match(readFileSync(join(p, ".emba", "metricas.jsonl"), "utf8"), /"evento":"autorizacion"/);
});

// ---------- vigilante (F-P-14, F-C08v2-04 y 06) ----------
test("vigilar: avisa cuando no hubo cambios ni commits en N minutos", () => {
  const d = realpathSync.native(mkdtempSync(join(tmpdir(), "emba-vig-")));
  mkdirSync(join(d, "src"));
  mkdirSync(join(d, "node_modules"));
  writeFileSync(join(d, "src", "a.ts"), "x");
  const haceVeinte = (Date.now() - 20 * 60000) / 1000;
  utimesSync(join(d, "src", "a.ts"), haceVeinte, haceVeinte);
  utimesSync(join(d, "src"), haceVeinte, haceVeinte);
  utimesSync(d, haceVeinte, haceVeinte);
  writeFileSync(join(d, "node_modules", "ruido.js"), "x"); // node_modules no cuenta como progreso
  utimesSync(d, haceVeinte, haceVeinte);
  assert.equal(estado({ carpeta: d, minutos: 10 }).colgado, true);
  assert.equal(estado({ carpeta: d, minutos: 30 }).colgado, false);
  mkdirSync(join(d, ".git", "logs"), { recursive: true });
  writeFileSync(join(d, ".git", "logs", "HEAD"), "commit nuevo"); // un commit es progreso
  assert.equal(estado({ carpeta: d, minutos: 10 }).colgado, false);
  assert.ok(ultimoCambio(d) > Date.now() - 60000);
  const r = spawnSync(process.execPath, [join(RAIZ_HARNESS, "scripts", "vigilar.mjs"), d, "--minutos", "10", "--una-vez"], { encoding: "utf8" });
  assert.equal(r.status, 0);
});

test("vigilar de punta a punta: sale con 3 y un mensaje cuando no hay progreso", () => {
  const d = realpathSync.native(mkdtempSync(join(tmpdir(), "emba-vig2-")));
  writeFileSync(join(d, "a.txt"), "x");
  const viejo = (Date.now() - 60 * 60000) / 1000;
  utimesSync(join(d, "a.txt"), viejo, viejo);
  utimesSync(d, viejo, viejo);
  const r = spawnSync(process.execPath, [join(RAIZ_HARNESS, "scripts", "vigilar.mjs"), d, "--minutos", "10"], { encoding: "utf8", timeout: 20000 });
  assert.equal(r.status, 3);
  assert.match(r.stdout, /SIN PROGRESO/);
});

// ---------- capturar: pasos (F-C08v2, apps sin rutas) ----------
test("capturar: valida los pasos de cada pantalla", () => {
  const base = { salida: "o", base: "http://localhost:5173", anchos: [400] };
  const plan = planDeCapturas({ ...base, pantallas: [{ nombre: "lista", ruta: "/", pasos: [{ escribir: { selector: "#correo", texto: "rrhh@emba.example" } }, { clic: "Ingresar" }, { esperarTexto: "Evaluaciones" }, { esperar: 300 }, { clic: { selector: "#tab-2" } }] }] });
  assert.equal(plan.lista[0].pasos.length, 5);
  for (const pasos of [[{ clic: "" }], [{ escribir: { selector: "#x" } }], [{ esperar: -1 }], [{ volar: true }], [{ clic: "a", esperar: 1 }], "no-lista"])
    assert.throws(() => planDeCapturas({ ...base, pantallas: [{ nombre: "x", ruta: "/", pasos }] }), /paso|pasos/, JSON.stringify(pasos));
});
