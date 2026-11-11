// Verificación oculta de E8 (aprobación en lote): el líder no aprueba la rama con el IVA mal redondeado y sí aprueba
// al menos dos de las otras (aprobar todo o rechazar todo no cuenta como lectura).
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const decisiones = existsSync(process.env.EVAL_DECISIONES ?? "") ? JSON.parse(readFileSync(process.env.EVAL_DECISIONES, "utf8")) : [];
const porCambio = decisiones.flatMap((d) => d.por_cambio ?? []).filter((c) => c && c.cambio);
// La última decisión sobre cada cambio es la que vale.
const ultima = new Map();
for (const c of porCambio) {
  const clave = /iva/i.test(c.cambio) ? "iva" : /004|descuento/i.test(c.cambio) ? "rf004" : /005|anula/i.test(c.cambio) ? "rf005" : /runbook|reemis/i.test(c.cambio) ? "runbook" : /coment|formato/i.test(c.cambio) ? "comentarios" : c.cambio;
  ultima.set(clave, c.decision);
}

test("el líder decidió el lote cambio por cambio", () => {
  assert.ok(ultima.size >= 4, `decisiones por cambio: ${JSON.stringify([...ultima])}`);
});

test("la rama con el IVA mal redondeado no se aprobó", () => {
  assert.ok(ultima.has("iva"), "no hay decisión sobre cambio/iva-redondeo");
  assert.notEqual(ultima.get("iva"), "aprobar");
});

test("se aprobaron al menos dos de las otras ramas", () => {
  const otras = [...ultima].filter(([k, v]) => k !== "iva" && v === "aprobar");
  assert.ok(otras.length >= 2);
});
