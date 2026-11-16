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
    // 0.4.1: la interfaz usa Claude Design salvo que una persona diga que no, con su OK y la fecha.
    if (nombre === "interfaz y marca" && asignado && !fuera) {
      const sin = /sin Claude Design/i.test(resto);
      const sinConOK = sin && /sin Claude Design\s*\(OK:\s*[^,|)]+,\s*\d{2}\/\d{2}\/\d{4}\)/i.test(resto);
      if (sin && !sinConOK)
        errores.push("docs/plan/plan.md: «sin Claude Design» necesita el OK de una persona y la fecha: «sin Claude Design (OK: persona, dd/mm/aaaa)»");
      else if (!sin && !/Claude Design/i.test(resto))
        errores.push("docs/plan/plan.md: el tema «interfaz y marca» no dice «Claude Design» ni «sin Claude Design (OK: persona, dd/mm/aaaa)»");
    }
  }
  return errores;
}

// La fila «Interfaz y marca» del plan dice Claude Design (y no «sin Claude Design» ni «fuera de alcance»).
export function usaClaudeDesign(textoPlan) {
  const seccion = textoPlan.split(/^## Temas transversales\s*$/m)[1];
  if (seccion === undefined) return false;
  const fila = seccion.split(/^## /m)[0].split("\n").find((l) => /^\|\s*[^|]*interfaz/i.test(l));
  return Boolean(fila) && /Claude Design/i.test(fila) && !/sin Claude Design/i.test(fila) && !/fuera de alcance/i.test(fila);
}

// 0.4.2 (F-C08-05): la sección «Dirección visual» de estilo-visual.md prueba que una persona eligió un diseño mirándolo:
// enlace al proyecto de Claude Design, quién eligió y cuándo, y al menos una captura que existe en el repo.
export function revisarPruebaDeDiseno(textoEstilo, carpetaDiseno) {
  const errores = [];
  const donde = "docs/diseno/estilo-visual.md";
  const seccion = textoEstilo.split(/^## [^\n]*Direcci[oó]n visual[^\n]*$/im)[1];
  if (seccion === undefined)
    return [`${donde}: el plan usa Claude Design y falta la sección «## Dirección visual» (paso de diseño, skill disenar-interfaz)`];
  const cuerpo = seccion.split(/^## /m)[0];
  if (!/Proyecto de Claude Design:\**\s*<?https?:\/\/\S+/i.test(cuerpo))
    errores.push(`${donde}: falta el enlace «Proyecto de Claude Design: https://…» en «Dirección visual»`);
  if (!/Direcci[oó]n elegida por:\**\s*[^<\s,][^,\n]*,\s*\d{2}\/\d{2}\/\d{4}/i.test(cuerpo))
    errores.push(`${donde}: falta «Dirección elegida por: persona, dd/mm/aaaa» en «Dirección visual»`);
  const imagenes = [...cuerpo.matchAll(/!\[[^\]]*\]\(([^)\s]+\.(?:png|jpe?g|webp))\)/gi)].map((m) => m[1]);
  if (!imagenes.length) errores.push(`${donde}: «Dirección visual» no tiene capturas de la dirección elegida (![…](….png))`);
  for (const img of imagenes)
    if (!/^https?:/i.test(img) && !existsSync(join(carpetaDiseno, img)))
      errores.push(`${donde}: la captura ${img} no existe (las rutas son relativas a docs/diseno/)`);
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
  if (existsSync(plan)) {
    const textoPlan = leer(plan);
    // 0.4.2 (F-C08-02): un script dejó corrupta la línea 1 del plan y nada lo detectó.
    if (!/^# \S/.test(textoPlan.replace(/^﻿/, "")))
      errores.push("docs/plan/plan.md: la línea 1 tiene que ser el título («# Plan de cambios · …»)");
    errores.push(...revisarTemasTransversales(textoPlan));
    // 0.4.2 (F-C08-05): con Claude Design y pantallas, el estilo visual tiene que mostrar que alguien diseñó.
    const estilo = join(raiz, ESTILO_VISUAL);
    if (pantallas.length && usaClaudeDesign(textoPlan) && existsSync(estilo))
      errores.push(...revisarPruebaDeDiseno(leer(estilo), join(raiz, "docs", "diseno")));
  }

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
