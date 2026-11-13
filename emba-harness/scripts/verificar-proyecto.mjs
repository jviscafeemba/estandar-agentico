#!/usr/bin/env node
// Chequeo del brain de un proyecto (compuerta de CI y equivalente local).
// Uso: node verificar-proyecto.mjs <proyecto> [--pruebas]
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const MAX_LINEAS_AGENTS = 150;
// 0.4.0: .claude (los worktrees de los agentes viven ahí y duplicaban el conteo), entornos de Python y builds.
const IGNORAR = new Set(["node_modules", ".git", ".emba", "evals", ".claude", ".venv", "venv", "__pycache__", "dist", "build", "coverage"]);

// 0.4.0 (F-P-05): pruebas de JavaScript/TypeScript y de pytest.
export const ES_PRUEBA = /(\.(test|spec)\.(mjs|cjs|js|jsx|ts|tsx)$)|((^|[\\/])test_[^\\/]*\.py$)|([\\/][^\\/]*_test\.py$)/;
const ES_CODIGO = /\.(mjs|cjs|js|jsx|ts|tsx|py)$/;
// Archivos que indican que el proyecto tiene pantallas (fuera de docs/, que guarda reportes en HTML).
const ES_PANTALLA = /\.(html|tsx|jsx|vue|svelte|css)$/;
export const ESTILO_VISUAL = "docs/diseno/estilo-visual.md";
export const TEMAS_TRANSVERSALES = [
  ["interfaz y marca", /interfaz/i],
  ["accesibilidad", /accesibilidad/i],
  ["rendimiento", /rendimiento/i],
  ["operación", /operaci[oó]n/i],
];

// Plan del proyecto (plantillas/plan.md): cada tema transversal se asigna a un cambio C-0n o queda «fuera de
// alcance» con el OK de una persona y la fecha. Devuelve los errores.
export function revisarTemasTransversales(textoPlan) {
  const errores = [];
  const seccion = textoPlan.split(/^## Temas transversales\s*$/m)[1];
  if (seccion === undefined) return ["docs/plan/plan.md no tiene la sección «## Temas transversales» (plantillas/plan.md)"];
  const filas = seccion.split(/^## /m)[0].split("\n").filter((l) => /^\|/.test(l) && !/^\|\s*-/.test(l)).slice(1);
  for (const [nombre, re] of TEMAS_TRANSVERSALES) {
    const fila = filas.find((f) => re.test(f.split("|")[1] ?? ""));
    if (!fila) {
      errores.push(`docs/plan/plan.md: falta el tema transversal «${nombre}»`);
      continue;
    }
    const resto = fila.split("|").slice(2).join("|");
    const asignado = /\bC-\d{2}\b/.test(resto);
    const fuera = /fuera de alcance/i.test(resto) && /OK:\s*[^,|]+,\s*\d{2}\/\d{2}\/\d{4}/.test(resto);
    if (!asignado && !fuera)
      errores.push(`docs/plan/plan.md: el tema «${nombre}» no tiene cambio C-0n ni «fuera de alcance (OK: persona, dd/mm/aaaa)»`);
  }
  return errores;
}

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
  const citantes = [agents, ...archivos(join(raiz, "docs", "specs"), (r) => r.endsWith(".md")), ...archivos(raiz, (r) => ES_CODIGO.test(r))].filter(existsSync);
  for (const r of citantes) {
    const texto = leer(r);
    for (const [id] of texto.matchAll(/\bADR-\d{3}\b/g))
      if (!adrs.has(id)) errores.push(`${relative(raiz, r)} cita ${id}, que no existe en docs/adr`);
    for (const [id] of texto.matchAll(/\b(?:RF|RNF)-\d{3}\b/g))
      if (!definidos.has(id)) errores.push(`${relative(raiz, r)} cita ${id}, que no está definido en docs/requerimientos`);
  }

  // Trazabilidad: cada requerimiento funcional debería tener al menos una prueba que lo nombre.
  const rutasPrueba = archivos(raiz, (r) => ES_PRUEBA.test(r));
  const pruebas = rutasPrueba.map(leer).join("\n");
  const sinPrueba = [...definidos].filter((id) => id.startsWith("RF-") && !pruebas.includes(id)).sort();
  const funcionales = [...definidos].filter((id) => id.startsWith("RF-")).length;
  for (const id of sinPrueba) avisos.push(`${id} no tiene ninguna prueba que lo nombre`);

  // 0.4.0 (F-P-12): sin .claude/protegidos.txt, proteger-pruebas solo cuida tests/.
  const rel = (r) => relative(raiz, r).replaceAll("\\", "/");
  const fueraDeTests = rutasPrueba.map(rel).filter((r) => !r.startsWith("tests/"));
  if (fueraDeTests.length && !existsSync(join(raiz, ".claude", "protegidos.txt")))
    avisos.push(`Hay pruebas fuera de tests/ (${fueraDeTests[0]}…) y falta .claude/protegidos.txt: el hook no las protege. Lo escribe una persona`);

  // 0.4.0 (P-029 de ai-desempeno): un proyecto con pantallas tiene documento de estilo visual.
  const pantallas = archivos(raiz, (r) => ES_PANTALLA.test(r)).map(rel).filter((r) => !r.startsWith("docs/"));
  if (pantallas.length && !existsSync(join(raiz, ESTILO_VISUAL)))
    errores.push(`El proyecto tiene pantallas (${pantallas[0]}…) y falta ${ESTILO_VISUAL} (plantillas/estilo-visual.md)`);

  // 0.4.0: los temas transversales del plan quedan asignados o fuera de alcance con OK humano.
  const plan = join(raiz, "docs", "plan", "plan.md");
  if (existsSync(plan)) errores.push(...revisarTemasTransversales(leer(plan)));

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
