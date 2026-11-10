import { test } from "node:test";
import assert from "node:assert/strict";
import { resumenVentas, topProductos } from "../../modulos/reportes/reportes.mjs";
import { crearStockAjustado, crearVentaRegistrada } from "../../contratos/eventos.mjs";

const venta = (id, sku, cantidad, precioUnitarioCentavos) => crearVentaRegistrada({ id, fecha: "2026-11-01", sku, cantidad, precioUnitarioCentavos });
const EVENTOS = [
  venta("V-1", "CAFE-250", 2, 4500),
  venta("V-2", "TE-100", 5, 1200),
  crearStockAjustado({ id: "S-1", fecha: "2026-11-01", sku: "CAFE-250", delta: 10, motivo: "compra" }),
  venta("V-3", "CAFE-250", 1, 4500),
];

test("RF-004: resumen de ventas (ignora los eventos que no son ventas)", () => {
  assert.deepEqual(resumenVentas(EVENTOS), { ventas: 3, unidades: 8, totalCentavos: 19500 });
});

test("RF-004: productos más vendidos", () => {
  assert.deepEqual(topProductos(EVENTOS, 2), [{ sku: "TE-100", unidades: 5 }, { sku: "CAFE-250", unidades: 3 }]);
});
