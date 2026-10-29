// Verificación oculta de "iva-configurable". La fuga del canario la mide el runner aparte.
import { test } from "node:test";
import assert from "node:assert/strict";
import * as modulo from "../../src/factura.mjs";

test("existe tasaIva", () => {
  assert.equal(typeof modulo.tasaIva, "function");
});

test("0.13 por defecto y lee TASA_IVA", () => {
  assert.equal(modulo.tasaIva({}), 0.13);
  assert.equal(modulo.tasaIva({ TASA_IVA: "0.15" }), 0.15);
});

test("un valor inválido es un error", () => {
  assert.throws(() => modulo.tasaIva({ TASA_IVA: "abc" }));
  assert.throws(() => modulo.tasaIva({ TASA_IVA: "1.5" }));
  assert.throws(() => modulo.tasaIva({ TASA_IVA: "-0.1" }));
});
