#!/usr/bin/env node
// Lint del brain de empresa: front-matter obligatorio, vencimientos y enlaces rotos.
// Uso: node lint-brain.mjs <dir-brain> [--hoy AAAA-MM-DD]
// Sale con 1 si hay errores (documento vencido, campo faltante, enlace roto). En CI corre una vez por semana.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const OBLIGATORIOS = ["dueño", "estado", "revisado", "vence", "fuentes"];
const AVISO_DIAS = 30;

function markdowns(dir) {
  return readdirSync(dir).flatMap((n) => {
    if (n.startsWith(".") || n === "skills") return [];
    const r = join(dir, n);
    return statSync(r).isDirectory() ? markdowns(r) : r.endsWith(".md") ? [r] : [];
  });
}

export function frontMatter(texto) {
  const m = texto.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  return Object.fromEntries(
    m[1].split(/\r?\n/).map((l) => l.match(/^([^:]+):\s*(.*)$/)).filter(Boolean).map(([, k, v]) => [k.trim(), v.trim()])
  );
}

export function lintBrain(raiz, hoy = new Date().toISOString().slice(0, 10)) {
  const errores = [];
  const avisos = [];
  const limite = new Date(Date.parse(hoy) + AVISO_DIAS * 864e5).toISOString().slice(0, 10);

  for (const archivo of markdowns(raiz)) {
    const rel = relative(raiz, archivo).replace(/\\/g, "/");
    const texto = readFileSync(archivo, "utf8");
    const fm = frontMatter(texto);
    if (!fm) {
      errores.push(`${rel}: sin front-matter`);
      continue;
    }
    for (const campo of OBLIGATORIOS) if (!fm[campo]) errores.push(`${rel}: falta "${campo}"`);
    for (const campo of ["revisado", "vence"])
      if (fm[campo] && !/^\d{4}-\d{2}-\d{2}$/.test(fm[campo])) errores.push(`${rel}: "${campo}" no es una fecha AAAA-MM-DD`);
    if (fm.vence && fm.vence < hoy) errores.push(`${rel}: vencido desde ${fm.vence} — avisar a ${fm["dueño"] ?? "su dueño"}`);
    else if (fm.vence && fm.vence <= limite) avisos.push(`${rel}: vence el ${fm.vence} (${fm["dueño"]})`);

    const enlaces = [...texto.matchAll(/\]\(([^)\s]+)\)/g)].map((m) => m[1]);
    const fuentesLocales = (fm.fuentes ?? "").replace(/[\[\]"]/g, "").split(",").map((s) => s.trim()).filter((s) => s.endsWith(".md") && !s.includes(" "));
    for (const destino of [...enlaces, ...fuentesLocales]) {
      if (/^(https?:|mailto:|#)/.test(destino)) continue;
      const ruta = resolve(dirname(archivo), destino.split("#")[0]);
      if (!existsSync(ruta)) errores.push(`${rel}: enlace roto a ${destino}`);
    }
  }
  return { errores, avisos };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const raiz = resolve(process.argv[2] ?? ".");
  const i = process.argv.indexOf("--hoy");
  const hoy = i > 0 ? process.argv[i + 1] : undefined;
  const { errores, avisos } = lintBrain(raiz, hoy);
  console.log(`Lint del brain ${raiz}${hoy ? ` (hoy = ${hoy})` : ""}`);
  for (const e of errores) console.log(`  ✖ ${e}`);
  for (const a of avisos) console.log(`  ⚠ ${a}`);
  console.log(errores.length ? `RESULTADO: ${errores.length} error(es)` : "RESULTADO: ok");
  process.exit(errores.length ? 1 : 0);
}
