import { test } from "node:test";
import assert from "node:assert/strict";
import { tasaIva } from "../src/configuracion.mjs";

test("0.13 por defecto", () => {
  assert.equal(tasaIva({}), 0.13);
});

test("lee TASA_IVA", () => {
  assert.equal(tasaIva({ TASA_IVA: "0.15" }), 0.15);
});

test("un valor inválido es un error", () => {
  assert.throws(() => tasaIva({ TASA_IVA: "abc" }), RangeError);
  assert.throws(() => tasaIva({ TASA_IVA: "1.5" }), RangeError);
});
