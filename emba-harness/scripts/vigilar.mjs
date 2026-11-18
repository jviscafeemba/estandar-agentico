#!/usr/bin/env node
// Vigilante de progreso (0.4.3; F-P-14 del piloto, F-C08v2-04 y F-C08v2-06). Un subagente colgado no avisa: en el piloto
// una implementadora pasó 14 h trabada sin que nadie la viera. La orquestadora corre este script EN SEGUNDO PLANO
// sobre la carpeta (worktree) del subagente. Termina, y con eso la despierta, cuando pasan N minutos sin progreso.
//
// Progreso = cualquier archivo nuevo o modificado en la carpeta (sin node_modules ni carpetas de build), un commit
// nuevo (.git/logs/HEAD o los refs) o un cambio en los archivos extra que se pasen con --archivo (por ejemplo, la
// salida del subagente).
//
// Uso:  node vigilar.mjs <carpeta> [--minutos 10] [--cada 30] [--archivo <ruta>]... [--una-vez]
//   --minutos  minutos sin progreso para avisar (por defecto 10)
//   --cada     segundos entre revisiones (por defecto 30)
//   --una-vez  revisa una sola vez y sale: 0 si hay progreso reciente, 3 si no
// Sale con 3 y un mensaje cuando no hay progreso; nunca mata al subagente: decide la orquestadora.
import { existsSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const IGNORAR = new Set(["node_modules", ".venv", "venv", "__pycache__", "dist", "build", "coverage", ".pytest_cache", ".vite", ".emba"]);

// Momento (ms) del último cambio dentro de la carpeta. En .git solo cuentan logs/HEAD y refs (los commits).
export function ultimoCambio(carpeta, extras = []) {
  let ultimo = 0;
  const mirar = (ruta) => {
    try {
      const s = statSync(ruta);
      if (s.mtimeMs > ultimo) ultimo = s.mtimeMs;
      return s;
    } catch {
      return null;
    }
  };
  const recorrer = (dir, profundidad) => {
    if (profundidad > 12) return;
    let nombres;
    try {
      nombres = readdirSync(dir);
    } catch {
      return;
    }
    for (const nombre of nombres) {
      if (IGNORAR.has(nombre)) continue;
      const ruta = join(dir, nombre);
      if (nombre === ".git") {
        mirar(join(ruta, "logs", "HEAD"));
        const refs = join(ruta, "refs");
        if (existsSync(refs)) recorrer(refs, profundidad + 1);
        continue;
      }
      const s = mirar(ruta);
      if (s?.isDirectory()) recorrer(ruta, profundidad + 1);
    }
  };
  recorrer(carpeta, 0);
  for (const e of extras) mirar(e);
  return ultimo;
}

export function estado({ carpeta, extras = [], minutos = 10, ahora = Date.now() }) {
  const ultimo = ultimoCambio(carpeta, extras);
  const quieto = ultimo ? (ahora - ultimo) / 60000 : Infinity;
  return { ultimo, minutosQuieto: quieto, colgado: quieto >= minutos };
}

function leerArgs(argv) {
  const args = { carpeta: null, minutos: 10, cada: 30, extras: [], unaVez: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--minutos") args.minutos = Number(argv[++i]);
    else if (a === "--cada") args.cada = Number(argv[++i]);
    else if (a === "--archivo") args.extras.push(resolve(argv[++i]));
    else if (a === "--una-vez") args.unaVez = true;
    else if (!args.carpeta) args.carpeta = resolve(a);
  }
  return args;
}

const hora = (ms) => (ms ? new Date(ms).toISOString().replace("T", " ").slice(0, 16) + " UTC" : "nunca");

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = leerArgs(process.argv.slice(2));
  if (!args.carpeta || !existsSync(args.carpeta) || !(args.minutos > 0) || !(args.cada > 0)) {
    console.error("Uso: node vigilar.mjs <carpeta> [--minutos 10] [--cada 30] [--archivo <ruta>]... [--una-vez]");
    process.exit(2);
  }
  const avisar = (e) => {
    console.log(
      `SIN PROGRESO: ${Math.floor(e.minutosQuieto)} min sin cambios ni commits en ${args.carpeta} (último: ${hora(e.ultimo)}). ` +
        "Revisá al subagente: si está colgado, relanzalo con su contexto o en uno nuevo, y anotalo en el registro.",
    );
    process.exit(3);
  };
  const revisar = () => {
    const e = estado({ carpeta: args.carpeta, extras: args.extras, minutos: args.minutos });
    if (e.colgado) avisar(e);
    return e;
  };
  const primero = revisar();
  if (args.unaVez) {
    console.log(`Con progreso: último cambio ${hora(primero.ultimo)}.`);
    process.exit(0);
  }
  console.log(`Vigilando ${args.carpeta}: aviso si pasan ${args.minutos} min sin progreso (revisa cada ${args.cada} s).`);
  setInterval(revisar, args.cada * 1000);
}
