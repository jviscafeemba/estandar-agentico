#!/usr/bin/env node
// Autoriza cambiar una prueba existente protegida por el hook proteger-pruebas (E4, C-02). Lo decide UNA PERSONA:
//   - desde la app (0.4.3): el agente corre este script como un comando aparte y el hook le pide el OK a la persona en
//     el diálogo de permisos; si no lo aprueba, no corre;
//   - o la persona lo corre en su terminal.
// El agente no puede escribir el archivo de autorizaciones a mano (es archivo de control).
//   node autorizar-prueba.mjs <ruta de la prueba> [más rutas]   (desde la raíz del proyecto)
import { appendFileSync, existsSync, mkdirSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const rutas = process.argv.slice(2);
if (!rutas.length) {
  console.error("Uso: node autorizar-prueba.mjs <ruta de la prueba> [más rutas]");
  process.exit(1);
}
const raiz = process.env.CLAUDE_PROJECT_DIR || process.cwd();
mkdirSync(join(raiz, ".emba"), { recursive: true });
const autorizadas = [];
for (const r of rutas) {
  const rel = relative(raiz, resolve(raiz, r)).replaceAll("\\", "/");
  if (rel.startsWith("../")) {
    console.error(`✖ ${r} está fuera del proyecto: no se autoriza.`);
    continue;
  }
  if (!existsSync(join(raiz, rel))) console.warn(`Aviso: ${rel} no existe (se autoriza igual).`);
  appendFileSync(join(raiz, ".emba", "pruebas-autorizadas.txt"), rel + "\n");
  autorizadas.push(rel);
  console.log(`✔ autorizada: ${rel}`);
}
// Registro para las métricas (E11): quién lo pidió lo dice el evento «autorizacion-pedida» del hook.
try {
  appendFileSync(join(raiz, ".emba", "metricas.jsonl"), JSON.stringify({ fecha: new Date().toISOString(), evento: "autorizacion", pruebas: autorizadas }) + "\n");
} catch {
  // las métricas nunca frenan una autorización
}
process.exit(autorizadas.length ? 0 : 1);
