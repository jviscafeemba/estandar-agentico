#!/usr/bin/env node
// Resumen de métricas de uno o más proyectos, leídas de <proyecto>/.emba/metricas.jsonl.
// Uso: node metricas.mjs <proyecto> [<proyecto> ...]
import { existsSync, readFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

export function resumir(lineas) {
  const sesiones = new Map(); // tokens acumulados: se queda el último turno de cada sesión
  const bloqueos = {};
  let turnos = 0;
  for (const l of lineas) {
    if (l.evento === "turno") {
      turnos++;
      sesiones.set(l.sesion, l.tokens ?? {});
    } else if (l.evento === "bloqueo") bloqueos[l.regla] = (bloqueos[l.regla] ?? 0) + 1;
  }
  const tokens = { entrada: 0, salida: 0, cache_lectura: 0, cache_escritura: 0 };
  for (const t of sesiones.values()) for (const k in tokens) tokens[k] += t[k] ?? 0;
  return { sesiones: sesiones.size, turnos, bloqueos, tokens };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const proyectos = process.argv.slice(2).length ? process.argv.slice(2) : ["."];
  for (const p of proyectos) {
    const archivo = join(resolve(p), ".emba", "metricas.jsonl");
    const lineas = existsSync(archivo)
      ? readFileSync(archivo, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l))
      : [];
    const r = resumir(lineas);
    const evals = join(resolve(p), "evals", "resultados.jsonl");
    const corridas = existsSync(evals) ? readFileSync(evals, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l)) : [];
    const exitos = corridas.filter((c) => c.exito).length;
    console.log(`${basename(resolve(p))}`);
    console.log(`  sesiones ${r.sesiones} · turnos ${r.turnos}`);
    console.log(`  tokens: entrada ${r.tokens.entrada} · salida ${r.tokens.salida} · caché ${r.tokens.cache_lectura}`);
    console.log(`  bloqueos de hooks: ${Object.entries(r.bloqueos).map(([k, v]) => `${k} ${v}`).join(", ") || "ninguno"}`);
    console.log(`  evals: ${corridas.length ? `${exitos}/${corridas.length} tareas exitosas` : "sin corridas"}`);
  }
}
