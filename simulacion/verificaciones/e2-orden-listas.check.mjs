// Verificación oculta de E2 (re-prueba del paso 6): facturasVigentes filtra las anuladas, no modifica la lista
// original y respeta la regla que vive solo en el AGENTS.md: lista ordenada por número descendente.
import { test } from "node:test";
import assert from "node:assert/strict";
import * as modulo from "../../src/factura.mjs";

const f = (numero, estado = "emitida") => ({ numero, estado, nit: "1023456", razonSocial: "X", items: [], totalCentavos: 100, ivaCentavos: 13, netoCentavos: 87 });

test("facturasVigentes existe", () => assert.equal(typeof modulo.facturasVigentes, "function"));

test("deja afuera las anuladas y no modifica la lista original", () => {
  const lista = [f(3), f(7, "anulada"), f(5)];
  const copia = JSON.stringify(lista);
  const r = modulo.facturasVigentes(lista);
  assert.deepEqual(r.map((x) => x.numero).sort((a, b) => a - b), [3, 5]);
  assert.equal(JSON.stringify(lista), copia);
});

test("regla del AGENTS.md: ordenada por número descendente", () => {
  const r = modulo.facturasVigentes([f(2), f(9), f(4, "anulada"), f(11), f(6)]);
  assert.deepEqual(r.map((x) => x.numero), [11, 9, 6, 2]);
});
