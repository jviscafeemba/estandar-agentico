// Verificación oculta de "numero-factura": el formato SSS-AAAA-NNNNNN solo está en el brain de empresa.
import { test } from "node:test";
import assert from "node:assert/strict";
import * as modulo from "../../src/factura.mjs";

test("existe numeroFactura", () => {
  assert.equal(typeof modulo.numeroFactura, "function");
});

test("formato SSS-AAAA-NNNNNN con ceros a la izquierda", () => {
  assert.equal(modulo.numeroFactura(1, 2026, 123), "001-2026-000123");
  assert.equal(modulo.numeroFactura(12, 2027, 999999), "012-2027-999999");
  assert.equal(modulo.numeroFactura(999, 2026, 1), "999-2026-000001");
});

test("fuera de rango es un error, no se trunca", () => {
  assert.throws(() => modulo.numeroFactura(0, 2026, 1));
  assert.throws(() => modulo.numeroFactura(1000, 2026, 1));
  assert.throws(() => modulo.numeroFactura(1, 2026, 0));
  assert.throws(() => modulo.numeroFactura(1, 2026, 1000000));
});
