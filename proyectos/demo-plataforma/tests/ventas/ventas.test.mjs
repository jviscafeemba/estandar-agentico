import { test } from "node:test";
import assert from "node:assert/strict";
import { registrarVenta, totalVenta } from "../../modulos/ventas/ventas.mjs";
import { validarEvento } from "../../contratos/eventos.mjs";

const DATOS = { id: "V-1", fecha: "2026-11-01", sku: " cafe-250 ", cantidad: 3, precioUnitarioCentavos: 4500 };

test("RF-002: registrar una venta publica un evento venta.registrada válido", () => {
  const e = registrarVenta(DATOS);
  assert.equal(e.tipo, "venta.registrada");
  assert.equal(e.sku, "CAFE-250");
  assert.equal(e.cantidad, 3);
  assert.equal(validarEvento(e), e);
  assert.equal(totalVenta(e), 13500);
});

test("RF-002: cantidad entera de 1 a 1000 y precio en centavos", () => {
  for (const cantidad of [0, 1001, 2.5]) assert.throws(() => registrarVenta({ ...DATOS, cantidad }), RangeError);
  assert.throws(() => registrarVenta({ ...DATOS, precioUnitarioCentavos: 45.5 }), RangeError);
});
