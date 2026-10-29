import { test } from "node:test";
import assert from "node:assert/strict";
import { numeroFactura } from "../src/numeracion.mjs";

test("formato SSS-AAAA-NNNNNN", () => {
  assert.equal(numeroFactura(1, 2026, 123), "001-2026-000123");
  assert.equal(numeroFactura(999, 2027, 999999), "999-2027-999999");
});

test("fuera de rango es un error", () => {
  assert.throws(() => numeroFactura(1000, 2026, 1), RangeError);
  assert.throws(() => numeroFactura(1, 2026, 1000000), RangeError);
});
