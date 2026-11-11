// Reglas del hook de carriles. Funciones puras salvo canonica(), que consulta el disco (realpath).
// Copia de ai-genesys (.claude/hooks/lib/carriles.mjs); las prueba tests/reglas-v3.test.mjs.
import { existsSync, realpathSync } from "node:fs";
import { basename, dirname, isAbsolute, join, relative, resolve } from "node:path";

const WINDOWS = process.platform === "win32";

// Lee el formato acotado de carriles.yaml: "X:" / "  escribe:" / "    - ruta".
export function leerCarriles(texto) {
  const carriles = {};
  let carril = null;
  let lista = null;
  for (const [n, crudo] of texto.split(/\r?\n/).entries()) {
    const linea = crudo.replace(/\s+#.*$/, "").trimEnd();
    if (!linea.trim() || linea.trim().startsWith("#")) continue;
    let m;
    if ((m = linea.match(/^([A-Za-z0-9_-]+):$/))) {
      carril = m[1];
      carriles[carril] = { escribe: [], nunca: [] };
      lista = null;
    } else if ((m = linea.match(/^\s+(escribe|nunca):$/)) && carril) {
      lista = carriles[carril][m[1]];
    } else if ((m = linea.match(/^\s+-\s+(\S+)$/)) && lista) {
      lista.push(m[1]);
    } else {
      throw new Error(`carriles.yaml, línea ${n + 1}: formato no reconocido: ${crudo}`);
    }
  }
  return carriles;
}

// Ruta canónica: sin prefijo \\?\, sin puntos ni espacios finales por tramo (Windows los descarta al escribir)
// y resuelta con realpath sobre el ancestro más cercano que exista (nombres cortos 8.3, mayúsculas, symlinks).
export function canonica(ruta) {
  let r = resolve(ruta.replace(/^\\\\\?\\/, ""));
  if (WINDOWS) r = r.split(/[\\/]/).map((t, i) => (i === 0 ? t : t.replace(/[. ]+$/, ""))).join("\\");
  const faltan = [];
  while (!existsSync(r)) {
    const padre = dirname(r);
    if (padre === r) break;
    faltan.unshift(basename(r));
    r = padre;
  }
  try {
    r = realpathSync.native(r);
  } catch {
    // sin permiso para resolver: se compara tal cual
  }
  return faltan.length ? join(r, ...faltan) : r;
}

function coincide(ruta, patron) {
  if (patron === "/*") return !ruta.includes("/");
  if (patron.endsWith("/")) return ruta.startsWith(patron);
  return ruta === patron;
}

// Devuelve null si la escritura está permitida, o el motivo del bloqueo.
export function evaluar({ carril, carriles, raiz, archivo, cwd }) {
  if (!carril) return null;
  const reglas = carriles[carril];
  if (!reglas) return `EMBA_CARRIL=${carril} no figura en .claude/carriles.yaml (carriles: ${Object.keys(carriles).join(", ")}).`;
  if (typeof archivo !== "string" || !archivo) return null;

  const base = canonica(raiz);
  const absoluto = canonica(isAbsolute(archivo) ? archivo : resolve(cwd || raiz, archivo));
  const plegar = (t) => (WINDOWS ? t.toLowerCase() : t); // Windows no distingue mayúsculas
  const original = relative(base, absoluto).replaceAll("\\", "/");
  const rel = plegar(relative(plegar(base), plegar(absoluto)).replaceAll("\\", "/"));
  if (rel === "" || rel === ".." || rel.startsWith("../") || isAbsolute(rel)) return null; // fuera del repo

  const prohibido = reglas.nunca.some((p) => coincide(rel, plegar(p)));
  const permitido = reglas.escribe.some((p) => coincide(rel, plegar(p)));
  if (prohibido || !permitido) {
    return (
      `Bloqueado por el hook de carriles: el carril ${carril} no escribe en ${original}. ` +
      `Sus carpetas: ${reglas.escribe.join(", ")}${reglas.nunca.length ? ` (nunca: ${reglas.nunca.join(", ")})` : ""}. ` +
      "Si hace falta un cambio ahí, no lo esquives: frená y cerrá con ESPERA para que la orquestadora o el líder lo asigne."
    );
  }
  return null;
}
