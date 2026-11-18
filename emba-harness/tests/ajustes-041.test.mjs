// Pruebas de los ajustes por proyecto de la 0.4.1 (falsos positivos reportados por ai-genesys, 13 a 16/11/2026).
// Los dos ajustes están apagados por defecto: sin .claude/ajustes-harness.txt el comportamiento es el de la 0.4.0.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { comandoSobreProtegidos, escrituraProtegida, quitarRaiz } from "../hooks/lib/reglas-v3.mjs";
import { accesoASecreto, sinPatronesCitados } from "../hooks/lib/reglas.mjs";

const HOOKS = join(dirname(fileURLToPath(import.meta.url)), "..", "hooks");
const correr = (hook, entrada, proyecto) =>
  spawnSync(process.execPath, [join(HOOKS, hook)], { input: JSON.stringify(entrada), encoding: "utf8", env: { ...process.env, CLAUDE_PROJECT_DIR: proyecto } });
const proyectoCon = (ajustes) => {
  const p = realpathSync.native(mkdtempSync(join(tmpdir(), "emba-aj-")));
  if (ajustes !== null) {
    mkdirSync(join(p, ".claude"));
    writeFileSync(join(p, ".claude", "ajustes-harness.txt"), ajustes);
  }
  return p;
};

// ---------- E4 · pruebas-desde-raiz ----------
const P = ["tests/"];
const RAIZ = "C:/repos/ai-genesys";
const desdeRaiz = { desdeRaiz: true, raiz: RAIZ };

test("pruebas-desde-raiz apagado: se mantiene el calce en cualquier nivel de la 0.4.0", () => {
  assert.ok(comandoSobreProtegidos("git checkout --ours platform/x/tests/t.py", P));
  assert.ok(comandoSobreProtegidos("sed -i s/a/b/ src/app/tests/t.py", P));
});

test("pruebas-desde-raiz: una carpeta tests/ anidada pasa, como en Edit y Write", () => {
  for (const c of ["git checkout --ours platform/x/tests/t.py", "sed -i 's/a/b/' src/app/tests/t.py", "rm platform/x/tests/viejo.py",
    "echo x > dwh/tests/salida.txt", "cp a.py platform/tests/a.py", "git checkout -- C:/otro/repo/tests/x.py"])
    assert.equal(comandoSobreProtegidos(c, P, desdeRaiz), null, c);
  assert.equal(escrituraProtegida({ rel: "platform/x/tests/t.py", existe: true, protegidos: P }), null, "criterio de Edit y Write");
});

test("pruebas-desde-raiz: tests/ desde la raíz sigue bloqueado en todas sus formas", () => {
  for (const c of ["rm tests/x.py", "rm ./tests/x.py", "rm .\\tests\\x.py", "Remove-Item tests\\x.py", "sed -i 's/a/b/' tests/x.py",
    "echo x > tests/x.py", "git checkout --ours tests/t.py", "cp a.py ./tests/", "rm C:/repos/ai-genesys/tests/x.py",
    "rm C:\\repos\\ai-genesys\\tests\\x.py", "rm /c/repos/ai-genesys/tests/x.py", "cd x && rm \"tests/x.py\"",
    "echo x >> .claude/protegidos.txt", "echo x > ./.claude/ajustes-harness.txt"])
    assert.ok(comandoSobreProtegidos(c, P, desdeRaiz), c);
});

test("quitarRaiz reconoce la ruta del proyecto en sus tres formas", () => {
  assert.equal(quitarRaiz("rm C:/repos/ai-genesys/tests/x", RAIZ).trim(), "rm  tests/x".trim());
  assert.match(quitarRaiz("rm /c/repos/ai-genesys/tests/x", RAIZ), /rm\s+tests\/x/);
  assert.equal(quitarRaiz("rm tests/x", null), "rm tests/x");
});

test("el agente no puede escribir .claude/ajustes-harness.txt", () => {
  assert.equal(escrituraProtegida({ rel: ".claude/ajustes-harness.txt", existe: false, protegidos: P }).regla, "archivo-de-control");
  assert.ok(comandoSobreProtegidos("echo pruebas-desde-raiz >> .claude/ajustes-harness.txt", P));
});

// ---------- secretos-patrones-citados ----------
const ON = { patronesCitados: true };
const PATRONES = [
  "sed -i '16s/.*/VALOR = 1/' config.py",
  "sed -n '1,20p' src/app.py",
  "grep -n 'secrets:' compose.yaml",
  "grep -rn \"secrets\" docs/",
  "rg -n 'secrets\\.' platform/",
  "awk '/secrets/ {print $1}' compose.yaml",
  "perl -pi -e 's/.*secret.*//' notas.md",
  "grep -E '^\\.env' .gitignore",
  "sed -e 's/.*/x/' -e 's/a/b/' a.txt",
];
const ACCESOS = [
  "cat .env", "grep KEY .env", "grep 'KEY' .env", "grep -n 'x' .env.local", "sed -n 'p' .env", "sed -i 's/a/b/' .env",
  "awk '{print}' .env", "perl -ne 'print' .env", "rg 'x' secrets/", "grep -r 'x' secrets", "grep -f .env a.txt",
  "rg -g '.env*' KEY", "grep secrets compose.yaml", "sed \"s/x/$(cat .env)/\" a.txt", "grep \"`cat .env`\" a.txt",
  "grep 'x' a.txt; cat .env", "grep 'x' a.txt | sed -n 'p' .env", "sed -i 's/.*/x/' .e*", "cat secrets/token",
  "ls secr?ts", "grep -- '.env' .env", "cp .env.example .env", "sudo grep 'x' .env", "egrep 'a' .env", "gawk '{print}' .env",
  "sed -f .env a.txt", "awk -f .env a.txt", "grep -e 'x' -- .env", "rg --regexp 'x' .env.local", "grep 'x' 'secrets/a'",
];

test("secretos-patrones-citados apagado: los patrones siguen chocando como en la 0.4.0", () => {
  assert.ok(accesoASecreto("Bash", { command: "sed -i '16s/.*/x/' config.py" }));
  assert.ok(accesoASecreto("Bash", { command: "grep -n 'secrets:' compose.yaml" }));
});

test("secretos-patrones-citados: los patrones entre comillas pasan", () => {
  for (const c of PATRONES) assert.equal(accesoASecreto("Bash", { command: c }, ON), null, c);
});

test("secretos-patrones-citados: los accesos reales siguen bloqueados", () => {
  for (const c of ACCESOS) assert.ok(accesoASecreto("Bash", { command: c }, ON), c);
  assert.ok(accesoASecreto("Read", { file_path: ".env" }, ON), "las demás herramientas no cambian");
  assert.ok(accesoASecreto("Grep", { glob: ".env*", pattern: "KEY" }, ON));
});

test("sinPatronesCitados quita solo el patrón y conserva posiciones", () => {
  const c = "grep -n 'secrets:' compose.yaml";
  const r = sinPatronesCitados(c);
  assert.equal(r.length, c.length);
  assert.match(r, /^grep -n\s+compose\.yaml$/);
  assert.equal(sinPatronesCitados("grep secrets a.txt"), "grep secrets a.txt", "sin comillas no se quita");
});

// ---------- de punta a punta ----------
// 0.4.3 (Joaquín, 18/11/2026): «secretos-patrones-citados» pasa a encendido por defecto; «pruebas-desde-raiz» sigue
// apagado. «sin-secretos-patrones-citados» vuelve al comportamiento de la 0.4.0.
test("hooks de punta a punta: sin ajustes, el patrón citado pasa (0.4.3), E4 sigue como en la 0.4.0 y se registra", () => {
  const p = proyectoCon(null);
  const sec = (command) => correr("bloquear-secretos.mjs", { tool_name: "Bash", tool_input: { command }, cwd: p }, p).status;
  assert.equal(sec("grep -n 'secrets:' compose.yaml"), 0);
  assert.equal(sec("cat > notas.md <<'EOF'\nla carpeta secrets/ y el .env no se tocan\nEOF"), 0, "heredoc a cat (F-C08v2-01)");
  assert.equal(sec("grep 'x' .env"), 2);
  assert.equal(sec("bash <<'EOF'\ncat .env\nEOF"), 2, "heredoc a un intérprete se sigue mirando");
  const s = correr("proteger-pruebas.mjs", { tool_name: "Bash", tool_input: { command: "rm platform/x/tests/t.py" }, cwd: p }, p);
  assert.equal(s.status, 2);
  const registro = readFileSync(join(p, ".emba", "metricas.jsonl"), "utf8");
  assert.match(registro, /"regla":"secretos"/);
  assert.match(registro, /"regla":"prueba-por-shell"/);
});

test("sin-secretos-patrones-citados vuelve al comportamiento de la 0.4.0", () => {
  const p = proyectoCon("sin-secretos-patrones-citados\n");
  const r = correr("bloquear-secretos.mjs", { tool_name: "Bash", tool_input: { command: "grep -n 'secrets:' compose.yaml" }, cwd: p }, p);
  assert.equal(r.status, 2);
  assert.match(readFileSync(join(p, ".emba", "metricas.jsonl"), "utf8"), /"patronesCitados":false/);
});

test("hooks de punta a punta: con los ajustes activos, pasan los falsos positivos y se bloquea lo real", () => {
  const p = proyectoCon("# lo escribe una persona\npruebas-desde-raiz\nsecretos-patrones-citados\notra-cosa-desconocida\n");
  const sec = (command) => correr("bloquear-secretos.mjs", { tool_name: "Bash", tool_input: { command }, cwd: p }, p).status;
  const pru = (command) => correr("proteger-pruebas.mjs", { tool_name: "Bash", tool_input: { command }, cwd: p }, p).status;
  assert.equal(sec("grep -n 'secrets:' compose.yaml"), 0);
  assert.equal(sec("sed -i '16s/.*/x/' config.py"), 0);
  assert.equal(sec("grep 'x' .env"), 2);
  assert.equal(pru("git checkout --ours platform/x/tests/t.py"), 0);
  assert.equal(pru("rm tests/t.py"), 2);
  assert.equal(pru(`rm ${p.replaceAll("\\", "/")}/tests/t.py`), 2);
  const registro = readFileSync(join(p, ".emba", "metricas.jsonl"), "utf8");
  assert.match(registro, /"ajustes":\["pruebas-desde-raiz","secretos-patrones-citados"\]/);
});
