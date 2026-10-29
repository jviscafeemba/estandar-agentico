#!/usr/bin/env node
// Hook Stop: al final de cada turno registra los tokens acumulados de la sesión, leídos del transcript.
// Nunca bloquea: cualquier error se ignora.
import { readFileSync } from "node:fs";
import { leerEntrada, registrar } from "./lib/io.mjs";

const entrada = await leerEntrada();
const tokens = { entrada: 0, salida: 0, cache_lectura: 0, cache_escritura: 0 };
try {
  for (const linea of readFileSync(entrada.transcript_path, "utf8").split("\n")) {
    if (!linea.includes('"usage"')) continue;
    const uso = JSON.parse(linea)?.message?.usage;
    if (!uso) continue;
    tokens.entrada += uso.input_tokens ?? 0;
    tokens.salida += uso.output_tokens ?? 0;
    tokens.cache_lectura += uso.cache_read_input_tokens ?? 0;
    tokens.cache_escritura += uso.cache_creation_input_tokens ?? 0;
  }
} catch {
  // sin transcript se registra el turno igual
}
registrar(entrada, { evento: "turno", tokens });
