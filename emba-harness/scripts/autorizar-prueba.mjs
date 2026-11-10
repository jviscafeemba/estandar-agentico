#!/usr/bin/env node
// Autoriza cambiar una prueba existente protegida por el hook proteger-pruebas (E4, C-02). Lo ejecuta UNA PERSONA,
// no el agente: en Claude Code, con el prefijo «!» en el prompt (`! node <harness>/scripts/autorizar-prueba.mjs
// tests/x.test.mjs`), o desde su terminal. El hook bloquea al agente que intente correrlo o escribir el archivo.
//   node autorizar-prueba.mjs <ruta de la prueba> [más rutas]   (desde la raíz del proyecto)
import { appendFileSync, existsSync, mkdirSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const rutas = process.argv.slice(2);
if (!rutas.length) {
  console.error("Uso: node autorizar-prueba.mjs <ruta de la prueba> [más rutas]");
  process.exit(1);
}
const raiz = process.cwd();
mkdirSync(join(raiz, ".emba"), { recursive: true });
for (const r of rutas) {
  const rel = relative(raiz, resolve(raiz, r)).replaceAll("\\", "/");
  if (!existsSync(join(raiz, rel))) console.warn(`Aviso: ${rel} no existe (se autoriza igual).`);
  appendFileSync(join(raiz, ".emba", "pruebas-autorizadas.txt"), rel + "\n");
  console.log(`✔ autorizada: ${rel}`);
}
