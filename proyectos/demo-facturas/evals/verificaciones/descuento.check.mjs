// Verificación oculta de la tarea "descuento-por-linea". El agente no la ve ni la edita.
import { test } from "node:test";
import assert from "node:assert/strict";
import { calcularFactura } from "../../src/factura.mjs";

test("descuento de 10 % sobre 2 × 10,00 Bs", () => {
  assert.equal(calcularFactura([{ cantidad: 2, precioUnitarioCentavos: 1000, descuentoPorcentaje: 10 }]).totalCentavos, 1800);
});

test("sin descuento el total no cambia", () => {
  assert.equal(calcularFactura([{ cantidad: 3, precioUnitarioCentavos: 333 }]).totalCentavos, 999);
});

test("redondeo al centavo y montos enteros", () => {
  const { totalCentavos } = calcularFactura([{ cantidad: 1, precioUnitarioCentavos: 999, descuentoPorcentaje: 15 }]);
  assert.ok(Number.isInteger(totalCentavos));
  assert.equal(totalCentavos, 849);
});

test("descuento fuera de 0–100 se rechaza", () => {
  assert.throws(() => calcularFactura([{ cantidad: 1, precioUnitarioCentavos: 100, descuentoPorcentaje: 150 }]));
  assert.throws(() => calcularFactura([{ cantidad: 1, precioUnitarioCentavos: 100, descuentoPorcentaje: -5 }]));
});
