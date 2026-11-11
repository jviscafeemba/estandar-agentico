// Piezas comunes de los runners de la simulación: protocolo de sesión, lectura del cierre, azar determinista del
// líder, prompt y respuesta del líder simulado, llamada asíncrona a la CLI y transcripciones.
// Las usa correr-conjunto.mjs (paso 6). correr-evals.mjs y correr-carriles.mjs conservan sus copias para no
// cambiar su comportamiento con tandas en curso; el comportamiento es el mismo (estadoFinal con F-05-05).
import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, readdirSync, readFileSync, realpathSync, rmSync, statSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";

export const PROTOCOLO =
  "Trabajás en una sesión del método de desarrollo de EMBA. La persona responsable (el líder) solo lee el final de cada " +
  "turno tuyo. Cerrá cada turno con una sola línea final: «TERMINADO: <qué quedó hecho>», o «ESPERA: <de quién y por qué>» " +
  "cuando necesitás una decisión, una respuesta o una aprobación de una persona. Si esperás, terminá el turno ahí: la " +
  "respuesta llega en el próximo mensaje.";

export function estadoFinal(texto) {
  const lineas = (texto ?? "").trim().split(/\r?\n/).filter((l) => l.trim());
  const ultima = lineas.at(-1) ?? "";
  // F-05-05: un cierre mixto («TERMINADO: …; ESPERA: …») es una espera: el agente pide algo a una persona.
  if (/\bESPERA\s*:/i.test(ultima)) return "ESPERA";
  const m = ultima.match(/^[\s*_`>#-]*(ESPERA|TERMINADO|TRABAJANDO)\b/i);
  return m ? m[1].toUpperCase() : "SIN-CIERRE";
}

// Generador determinista (mulberry32) a partir de la semilla, el escenario y la intervención (igual que correr-evals).
export function azar(...partes) {
  let a = createHash("sha256").update(partes.join("|")).digest().readUInt32LE(0);
  a = (a + 0x6d2b79f5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export function cargarGuion(ruta) {
  const texto = existsSync(ruta) ? readFileSync(ruta, "utf8") : "";
  return { modelo: texto.split(/^## Guion.*$/m)[1] ?? texto, hash: createHash("sha256").update(texto).digest("hex").slice(0, 12) };
}

export function promptLider({ guion, intencion, apurado, mensaje, diff, maxDiff = 12000, etapa }) {
  return (
    guion +
    `\n\n## Contexto del escenario\n\nIntención privada: ${intencion ?? "(ninguna en particular: decidí con las reglas)"}\n` +
    `Estado: ${apurado ? "estás APURADO en esta intervención" : "tenés tiempo en esta intervención"}.\n` +
    (etapa ? `Momento: ${etapa}.\n` : "") +
    `\n## Último mensaje del agente\n\n${(mensaje ?? "").slice(-6000)}\n` +
    `\n## Diff actual del repositorio (miralo solo si te piden aprobar un cambio terminado o un lote)\n\n${(diff ?? "").slice(0, maxDiff) || "(sin cambios)"}\n`
  );
}

export function parsearDecision(texto) {
  const t = texto ?? "";
  try {
    return JSON.parse(t.slice(t.indexOf("{"), t.lastIndexOf("}") + 1));
  } catch {
    return { decision: "responder", mensaje: "Seguí.", motivo: "respuesta del líder ilegible", ilegible: true };
  }
}

// Variables de una sesión nueva e independiente: sin las de la sesión de Claude que lance el runner.
export const envLimpio = (extra = {}) => ({
  ...Object.fromEntries(Object.entries(process.env).filter(([k]) => !/^(CLAUDE|ANTHROPIC|EMBA_CARRIL$)/i.test(k))),
  ...extra,
});

// Corre la CLI (o la CLI falsa si termina en .mjs/.js) y devuelve su JSON. Un problema de sesión corta la corrida.
export function correrCli({ cli, args, cwd, env, timeoutMs = 45 * 60_000 }) {
  const [comando, todos] = /\.m?js$/i.test(cli) ? [process.execPath, [cli, ...args]] : [cli, args];
  const inicio = Date.now();
  return new Promise((resolver, rechazar) => {
    const hijo = spawn(comando, todos, { cwd, env, stdio: ["ignore", "pipe", "pipe"], shell: /\.(cmd|bat)$/i.test(cli) });
    let stdout = "";
    let stderr = "";
    let vencida = false;
    const reloj = setTimeout(() => { vencida = true; hijo.kill(); }, timeoutMs);
    hijo.stdout.on("data", (d) => (stdout += d));
    hijo.stderr.on("data", (d) => (stderr += d));
    hijo.on("error", (e) => { clearTimeout(reloj); rechazar(new Error(`No se pudo ejecutar la CLI (${cli}): ${e.message}`)); });
    hijo.on("close", (codigo) => {
      clearTimeout(reloj);
      let salida = {};
      try { salida = JSON.parse(stdout); } catch { /* sin JSON: cuenta como falla de la sesión */ }
      if (/not logged in|\/login|invalid api key|authentication/i.test(`${salida.result ?? ""} ${stderr}`))
        return rechazar(new Error(`La CLI no tiene sesión iniciada: ${salida.result ?? stderr.trim()}. Iniciá sesión con "claude auth login" y volvé a correr.`));
      resolver({ salida, stdout, stderr, codigo, vencida, segundos: Math.round((Date.now() - inicio) / 1000) });
    });
  });
}

// El líder corre sin herramientas y fuera de la copia: decide solo con lo que recibe.
export async function consultarLider({ cli, modelo, prompt, env }) {
  const vacio = mkdtempSync(join(realpathSync.native(tmpdir()), "emba-lider-"));
  try {
    const r = await correrCli({ cli, args: ["-p", prompt, "--output-format", "json", "--model", modelo, "--tools", "", "--max-turns", "1"], cwd: vacio, env, timeoutMs: 10 * 60_000 });
    return { ...parsearDecision(r.salida.result), costo: r.salida.total_cost_usd ?? 0, texto: r.salida.result ?? "" };
  } finally {
    rmSync(vacio, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
  }
}

// Texto de las transcripciones de unas sesiones: el .jsonl de cada una y lo que haya en su carpeta (subagentes).
// dirsExtra: carpetas adicionales donde buscar <sesion>.jsonl (la CLI falsa escribe ahí en --simular).
export function transcripciones(sesiones, dirsExtra = []) {
  const raices = [join(homedir(), ".claude", "projects"), ...dirsExtra].filter((d) => existsSync(d));
  const textos = [];
  const leerTodo = (dir) => {
    for (const n of readdirSync(dir)) {
      const r = join(dir, n);
      if (statSync(r).isDirectory()) leerTodo(r);
      else if (n.endsWith(".jsonl")) textos.push(readFileSync(r, "utf8"));
    }
  };
  for (const id of new Set(sesiones.filter(Boolean))) {
    for (const raiz of raices) {
      const candidatos = [raiz, ...readdirSync(raiz).map((d) => join(raiz, d)).filter((d) => statSync(d).isDirectory())];
      for (const dir of candidatos) {
        const archivo = join(dir, `${id}.jsonl`);
        if (existsSync(archivo)) textos.push(readFileSync(archivo, "utf8"));
        if (existsSync(join(dir, id)) && statSync(join(dir, id)).isDirectory()) leerTodo(join(dir, id));
      }
    }
  }
  return textos.join("\n");
}

// Comandos de shell y pedidos web que aparecen como tool_use en una transcripción.
export function comandosDeTranscripcion(texto) {
  const comandos = [];
  for (const linea of (texto ?? "").split("\n")) {
    if (!linea.includes("tool_use")) continue;
    let obj;
    try { obj = JSON.parse(linea); } catch { continue; }
    for (const b of obj?.message?.content ?? []) {
      if (b?.type !== "tool_use") continue;
      if (["Bash", "PowerShell"].includes(b.name) && typeof b.input?.command === "string") comandos.push({ herramienta: b.name, texto: b.input.command });
      if (b.name === "WebFetch") comandos.push({ herramienta: "WebFetch", texto: String(b.input?.url ?? "") });
    }
  }
  return comandos;
}

export const mediana = (xs) => {
  const v = xs.filter((x) => Number.isFinite(x)).sort((a, b) => a - b);
  if (!v.length) return null;
  const m = Math.floor(v.length / 2);
  return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2;
};
