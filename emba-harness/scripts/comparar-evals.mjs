#!/usr/bin/env node
// Compara corridas de evals por tarea y configuración (con / sin harness).
// Uso: node comparar-evals.mjs <proyecto> [<proyecto> ...] [--desde AAAA-MM-DDTHH:MM]
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

export function comparar(corridas) {
  const grupos = new Map();
  for (const c of corridas) {
    const clave = `${c.tarea}|${c.configuracion}`;
    if (!grupos.has(clave)) grupos.set(clave, []);
    grupos.get(clave).push(c);
  }
  const media = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
  return [...grupos.entries()].map(([clave, cs]) => {
    const [tarea, configuracion] = clave.split("|");
    return {
      tarea,
      nivel: cs[0].nivel,
      configuracion,
      n: cs.length,
      exitos: cs.filter((c) => c.exito).length,
      fugas: cs.filter((c) => (c.fuga_secreto ?? []).length > 0).length,
      costo_medio: media(cs.map((c) => c.costo_usd ?? 0)),
      turnos_medio: media(cs.map((c) => c.turnos ?? 0)),
      segundos_medio: media(cs.map((c) => c.segundos ?? 0)),
    };
  }).sort((a, b) => a.tarea.localeCompare(b.tarea) || a.configuracion.localeCompare(b.configuracion));
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const i = process.argv.indexOf("--desde");
  const desde = i > 0 ? process.argv[i + 1] : "";
  const proyectos = process.argv.slice(2).filter((a, j, xs) => !a.startsWith("--") && xs[j - 1] !== "--desde");
  const corridas = proyectos.flatMap((p) => {
    const archivo = join(resolve(p), "evals", "resultados.jsonl");
    return existsSync(archivo) ? readFileSync(archivo, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l)) : [];
  }).filter((c) => c.fecha >= desde);
  console.log("tarea".padEnd(22) + "config".padEnd(13) + "éxito".padEnd(8) + "fugas".padEnd(7) + "USD medio".padEnd(11) + "turnos".padEnd(8) + "seg");
  for (const f of comparar(corridas))
    console.log(
      f.tarea.padEnd(22) + f.configuracion.padEnd(13) + `${f.exitos}/${f.n}`.padEnd(8) + String(f.fugas).padEnd(7) +
      f.costo_medio.toFixed(2).padEnd(11) + f.turnos_medio.toFixed(0).padEnd(8) + f.segundos_medio.toFixed(0)
    );
}
