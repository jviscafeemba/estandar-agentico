#!/usr/bin/env node
// Chequeo del brain de un proyecto (compuerta de CI y equivalente local).
// Uso: node verificar-proyecto.mjs <proyecto> [--pruebas]
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const MAX_LINEAS_AGENTS = 150;
const IGNORAR = new Set(["node_modules", ".git", ".emba", "evals"]);

function archivos(dir, filtro) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((nombre) => {
    if (IGNORAR.has(nombre)) return [];
    const ruta = join(dir, nombre);
    return statSync(ruta).isDirectory() ? archivos(ruta, filtro) : filtro(ruta) ? [ruta] : [];
  });
}

export function verificarProyecto(raiz) {
  const errores = [];
  const avisos = [];
  const leer = (r) => readFileSync(r, "utf8");

  const agents = join(raiz, "AGENTS.md");
  if (!existsSync(agents)) errores.push("Falta AGENTS.md");
  else {
    const lineas = leer(agents).split("\n").length;
    if (lineas > MAX_LINEAS_AGENTS) errores.push(`AGENTS.md tiene ${lineas} líneas (máximo ${MAX_LINEAS_AGENTS})`);
  }
  const claude = join(raiz, "CLAUDE.md");
  if (!existsSync(claude) || !/^@AGENTS\.md\s*$/m.test(leer(claude))) errores.push("CLAUDE.md debe importar @AGENTS.md");

  // Lo que existe: ADR por nombre de archivo, requerimientos por definición en docs/requerimientos.
  const adrs = new Set(archivos(join(raiz, "docs", "adr"), (r) => r.endsWith(".md")).map((r) => r.match(/ADR-\d{3}/)?.[0]).filter(Boolean));
  const definidos = new Set();
  for (const r of archivos(join(raiz, "docs", "requerimientos"), (r) => r.endsWith(".md")))
    for (const m of leer(r).matchAll(/^(?:#+\s*|\|\s*)((?:RF|RNF)-\d{3})\b/gm)) definidos.add(m[1]);

  // Lo que se cita: AGENTS.md, specs, código y pruebas.
  const citantes = [agents, ...archivos(join(raiz, "docs", "specs"), (r) => r.endsWith(".md")), ...archivos(raiz, (r) => /\.(mjs|js|ts)$/.test(r))].filter(existsSync);
  for (const r of citantes) {
    const texto = leer(r);
    for (const [id] of texto.matchAll(/\bADR-\d{3}\b/g))
      if (!adrs.has(id)) errores.push(`${relative(raiz, r)} cita ${id}, que no existe en docs/adr`);
    for (const [id] of texto.matchAll(/\b(?:RF|RNF)-\d{3}\b/g))
      if (!definidos.has(id)) errores.push(`${relative(raiz, r)} cita ${id}, que no está definido en docs/requerimientos`);
  }

  // Trazabilidad: cada requerimiento funcional debería tener al menos una prueba que lo nombre.
  const pruebas = archivos(raiz, (r) => /\.test\.(mjs|js|ts)$/.test(r)).map(leer).join("\n");
  const sinPrueba = [...definidos].filter((id) => id.startsWith("RF-") && !pruebas.includes(id)).sort();
  const funcionales = [...definidos].filter((id) => id.startsWith("RF-")).length;
  for (const id of sinPrueba) avisos.push(`${id} no tiene ninguna prueba que lo nombre`);

  return { errores: [...new Set(errores)], avisos, cobertura: { funcionales, conPrueba: funcionales - sinPrueba.length } };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const raiz = resolve(process.argv[2] ?? ".");
  const { errores, avisos, cobertura } = verificarProyecto(raiz);
  console.log(`Brain del proyecto ${raiz}`);
  for (const e of errores) console.log(`  ✖ ${e}`);
  for (const a of avisos) console.log(`  ⚠ ${a}`);
  console.log(`  Trazabilidad: ${cobertura.conPrueba}/${cobertura.funcionales} requerimientos funcionales con prueba`);
  let fallo = errores.length > 0;
  if (process.argv.includes("--pruebas")) {
    console.log("Pruebas del proyecto (node --test):");
    const r = spawnSync(process.execPath, ["--test"], { cwd: raiz, encoding: "utf8" });
    const resumen = (r.stdout + r.stderr).split("\n").filter((l) => /^ℹ (tests|pass|fail) /.test(l));
    for (const l of resumen) console.log(`  ${l}`);
    fallo ||= r.status !== 0;
  }
  console.log(fallo ? "RESULTADO: falla" : "RESULTADO: ok");
  process.exit(fallo ? 1 : 0);
}
