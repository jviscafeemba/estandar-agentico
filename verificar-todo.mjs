#!/usr/bin/env node
// Equivalente local del CI de la prueba de concepto: corre todas las compuertas y resume.
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = dirname(fileURLToPath(import.meta.url));
const pasos = [
  ["Pruebas del harness (hooks y scripts)", ["--test"], join(raiz, "emba-harness")],
  ["Lint del brain de empresa", [join(raiz, "emba-harness/scripts/lint-brain.mjs"), join(raiz, "emba-brain")], raiz],
  ["Brain y pruebas de demo-facturas", [join(raiz, "emba-harness/scripts/verificar-proyecto.mjs"), "proyectos/demo-facturas", "--pruebas"], raiz],
  ["Brain y pruebas de demo-inventario", [join(raiz, "emba-harness/scripts/verificar-proyecto.mjs"), "proyectos/demo-inventario", "--pruebas"], raiz],
  ["Evals (simulación) de demo-facturas", [join(raiz, "emba-harness/scripts/correr-evals.mjs"), "proyectos/demo-facturas", "--simular"], raiz],
  ["Evals (simulación) de demo-inventario", [join(raiz, "emba-harness/scripts/correr-evals.mjs"), "proyectos/demo-inventario", "--simular"], raiz],
];

let fallas = 0;
for (const [nombre, args, cwd] of pasos) {
  const r = spawnSync(process.execPath, args, { cwd, encoding: "utf8" });
  const ok = r.status === 0;
  if (!ok) fallas++;
  console.log(`${ok ? "✔" : "✖"} ${nombre}`);
  if (!ok) console.log((r.stdout + r.stderr).split("\n").map((l) => `    ${l}`).join("\n"));
}
console.log(fallas ? `\n${fallas} compuerta(s) fallaron` : "\nTodas las compuertas en verde");
process.exit(fallas ? 1 : 0);
