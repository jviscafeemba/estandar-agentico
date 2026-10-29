import { test } from "node:test";
import assert from "node:assert/strict";
import { calcularFactura } from "../src/factura.mjs";

test("RF-004: 10 % de descuento sobre 2 × 10,00 Bs", () => {
  assert.equal(calcularFactura([{ cantidad: 2, precioUnitarioCentavos: 1000, descuentoPorcentaje: 10 }]).totalCentavos, 1800);
});

test("RF-004: sin descuento el total no cambia", () => {
  assert.equal(calcularFactura([{ cantidad: 1, precioUnitarioCentavos: 500 }]).totalCentavos, 500);
});

test("RF-004: un descuento fuera de 0–100 se rechaza", () => {
  assert.throws(() => calcularFactura([{ cantidad: 1, precioUnitarioCentavos: 100, descuentoPorcentaje: 150 }]), RangeError);
});
