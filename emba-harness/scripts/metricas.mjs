#!/usr/bin/env node
// Resumen de métricas de uno o más proyectos, leídas de <proyecto>/.emba/metricas.jsonl.
// Uso: node metricas.mjs <proyecto> [<proyecto> ...]
//      node metricas.mjs --registro <registro.jsonl> [--json]   los 4 indicadores de E11 (C1) desde un registro de
//                                                                eventos (p. ej. el de correr-conjunto.mjs)
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

const mediana = (xs) => {
  const v = xs.filter((x) => Number.isFinite(x)).sort((a, b) => a - b);
  if (!v.length) return null;
  const m = Math.floor(v.length / 2);
  return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2;
};
const redondear = (x, d = 4) => (x === null || !Number.isFinite(x) ? null : Math.round(x * 10 ** d) / 10 ** d);

// E11 (C1): los 4 indicadores de resultado desde un registro de eventos, sin edición manual.
// Eventos que se leen (los demás se ignoran):
//   { evento: "pr_abierto", pr, ts }                       el agente pide la aprobación del cambio (ESPERA final)
//   { evento: "pr_unido", pr, ts }                         el cambio entra a main
//   { evento: "revision", pr, graves, otros }              hallazgos del revisor independiente
//   { evento: "verificacion_oculta", pr, ok, tras_aprobacion }  verificación oculta sobre main
//   { evento: "costo", pr | null, agente_usd, lider_usd }  costo atribuido a un PR (pr null = costo común)
// Definiciones:
//   tiempo de PR a main: minutos entre el primer pr_abierto y el pr_unido de cada PR unido (mediana);
//   % de PR con hallazgos graves: PR abiertos con alguna revisión con graves > 0, sobre los PR abiertos;
//   defectos escapados: PR unidos cuya verificación oculta posterior a la aprobación quedó roja;
//   costo por PR: costo total del registro (incluido el común) / PR abiertos; además la mediana del costo directo.
export function indicadoresE11(eventos) {
  const abiertos = new Map();
  const unidos = new Map();
  const graves = new Map();
  const ocultas = new Map();
  const directo = new Map();
  let costoTotal = 0;
  for (const e of eventos) {
    if (e.evento === "pr_abierto" && e.pr && !abiertos.has(e.pr)) abiertos.set(e.pr, Date.parse(e.ts));
    else if (e.evento === "pr_unido" && e.pr && !unidos.has(e.pr)) unidos.set(e.pr, Date.parse(e.ts));
    else if (e.evento === "revision" && e.pr) graves.set(e.pr, (graves.get(e.pr) ?? 0) + (Number(e.graves) || 0));
    else if (e.evento === "verificacion_oculta" && e.pr && e.tras_aprobacion !== false) ocultas.set(e.pr, ocultas.has(e.pr) ? ocultas.get(e.pr) && !!e.ok : !!e.ok);
    else if (e.evento === "costo") {
      const c = (Number(e.agente_usd) || 0) + (Number(e.lider_usd) || 0);
      costoTotal += c;
      if (e.pr) directo.set(e.pr, (directo.get(e.pr) ?? 0) + c);
    }
  }
  const prs = [...abiertos.keys()];
  const tiempos = [...unidos.entries()].filter(([pr]) => abiertos.has(pr)).map(([pr, t]) => (t - abiertos.get(pr)) / 60000);
  const conGraves = prs.filter((pr) => (graves.get(pr) ?? 0) > 0);
  const escapados = [...unidos.keys()].filter((pr) => ocultas.get(pr) === false);
  return {
    prs_abiertos: prs.length,
    prs_unidos: unidos.size,
    tiempo_pr_a_main_min: { mediana: redondear(mediana(tiempos), 2), n: tiempos.length },
    pct_pr_hallazgos_graves: { valor: prs.length ? redondear((100 * conGraves.length) / prs.length, 1) : null, prs: conGraves },
    defectos_escapados: { valor: escapados.length, sin_verificar: [...unidos.keys()].filter((pr) => !ocultas.has(pr)), prs: escapados },
    costo_por_pr_usd: {
      valor: prs.length ? redondear(costoTotal / prs.length) : null,
      mediana_directo: redondear(mediana(prs.map((pr) => directo.get(pr) ?? 0))),
      total: redondear(costoTotal),
    },
  };
}

const leerJsonl = (archivo) => readFileSync(archivo, "utf8").split("\n").filter((l) => l.trim()).map((l) => JSON.parse(l));

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const iRegistro = process.argv.indexOf("--registro");
  if (iRegistro > 0) {
    const archivo = resolve(process.argv[iRegistro + 1] ?? "");
    if (!existsSync(archivo)) {
      console.error(`No existe el registro ${archivo}`);
      process.exit(1);
    }
    const r = indicadoresE11(leerJsonl(archivo));
    if (process.argv.includes("--json")) console.log(JSON.stringify(r, null, 2));
    else {
      console.log(`Indicadores E11 · ${basename(archivo)} (${r.prs_abiertos} PR abiertos, ${r.prs_unidos} unidos)`);
      console.log(`  tiempo de PR a main: mediana ${r.tiempo_pr_a_main_min.mediana ?? "—"} min (n = ${r.tiempo_pr_a_main_min.n})`);
      console.log(`  PR con hallazgos graves del revisor: ${r.pct_pr_hallazgos_graves.valor ?? "—"} %${r.pct_pr_hallazgos_graves.prs.length ? ` (${r.pct_pr_hallazgos_graves.prs.join(", ")})` : ""}`);
      console.log(`  defectos escapados: ${r.defectos_escapados.valor}${r.defectos_escapados.prs.length ? ` (${r.defectos_escapados.prs.join(", ")})` : ""}${r.defectos_escapados.sin_verificar.length ? `; sin verificación oculta: ${r.defectos_escapados.sin_verificar.join(", ")}` : ""}`);
      console.log(`  costo por PR: ${r.costo_por_pr_usd.valor ?? "—"} USD (mediana directa ${r.costo_por_pr_usd.mediana_directo ?? "—"}, total ${r.costo_por_pr_usd.total} USD)`);
    }
    process.exit(0);
  }
  const proyectos = process.argv.slice(2).length ? process.argv.slice(2) : ["."];
  for (const p of proyectos) {
    const archivo = join(resolve(p), ".emba", "metricas.jsonl");
    const lineas = existsSync(archivo) ? leerJsonl(archivo) : [];
    const r = resumir(lineas);
    const evals = join(resolve(p), "evals", "resultados.jsonl");
    const corridas = existsSync(evals) ? leerJsonl(evals) : [];
    const exitos = corridas.filter((c) => c.exito).length;
    console.log(`${basename(resolve(p))}`);
    console.log(`  sesiones ${r.sesiones} · turnos ${r.turnos}`);
    console.log(`  tokens: entrada ${r.tokens.entrada} · salida ${r.tokens.salida} · caché ${r.tokens.cache_lectura}`);
    console.log(`  bloqueos de hooks: ${Object.entries(r.bloqueos).map(([k, v]) => `${k} ${v}`).join(", ") || "ninguno"}`);
    console.log(`  evals: ${corridas.length ? `${exitos}/${corridas.length} tareas exitosas` : "sin corridas"}`);
    // Si el proyecto trae un registro de eventos (.emba/registro.jsonl), también los indicadores de E11.
    const registro = join(resolve(p), ".emba", "registro.jsonl");
    if (existsSync(registro)) {
      const e11 = indicadoresE11(leerJsonl(registro));
      console.log(`  E11: PR a main ${e11.tiempo_pr_a_main_min.mediana ?? "—"} min · graves ${e11.pct_pr_hallazgos_graves.valor ?? "—"} % · escapados ${e11.defectos_escapados.valor} · costo/PR ${e11.costo_por_pr_usd.valor ?? "—"} USD`);
    }
  }
}
