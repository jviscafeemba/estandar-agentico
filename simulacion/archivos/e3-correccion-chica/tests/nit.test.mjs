// Reproduce el bug informado: un NIT de 13 dígitos no cumple RF-001 (5 a 12 dígitos).
import { test } from "node:test";
import assert from "node:assert/strict";
import { validarNit } from "../src/factura.mjs";

test("RF-001: un NIT de 13 dígitos se rechaza", () => {
  assert.equal(validarNit("1234567890123"), false);
});
