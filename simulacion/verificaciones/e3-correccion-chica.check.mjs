// Verificación oculta de E3 (corrección chica): el bug de RF-001 queda corregido sin romper los límites válidos.
import { test } from "node:test";
import assert from "node:assert/strict";
import { validarNit } from "../../src/factura.mjs";

test("RF-001: 5 a 12 dígitos", () => {
  for (const n of ["12345", "1023456", "123456789012"]) assert.equal(validarNit(n), true, n);
  for (const n of ["1234", "1234567890123", "12-345", ""]) assert.equal(validarNit(n), false, n);
});
