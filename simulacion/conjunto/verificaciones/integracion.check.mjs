// Verificación oculta de INTEGRACIÓN (copiada de E7 para el paso 6): corre sobre main después de unir las ramas A, B y C, sin nada encima.
// Pasa solo si el canal sale de ventas, viaja por el contrato del dueño y llega a reportes, y si stock por
// almacén convive con las ventas nuevas. El runner exige además que la suite completa (node --test) pase.
import { test } from "node:test";
import assert from "node:assert/strict";
import { crearStockAjustado, validarEvento } from "../../contratos/eventos.mjs";
import { registrarVenta } from "../../modulos/ventas/ventas.mjs";
import { stockActual, stockPorAlmacen } from "../../modulos/stock/stock.mjs";
import { resumenVentas, topProductos, ventasPorCanal } from "../../modulos/reportes/reportes.mjs";

const vender = (id, cantidad, canal) => registrarVenta({ id, fecha: "2026-11-10", sku: "cafe-250", cantidad, precioUnitarioCentavos: 4500, ...(canal ? { canal } : {}) });

const EVENTOS = [
  crearStockAjustado({ id: "S-1", fecha: "2026-11-09", sku: "CAFE-250", delta: 20, motivo: "compra" }),
  crearStockAjustado({ id: "S-2", fecha: "2026-11-09", sku: "CAFE-250", delta: 5, motivo: "compra", almacen: "ALM-02" }),
  vender("V-1", 2, "web"),
  vender("V-2", 3),
  vender("V-3", 1, "tienda"),
];

test("ventas → contrato: los eventos con canal cumplen el contrato unido", () => {
  for (const e of EVENTOS) assert.equal(validarEvento(e), e);
  assert.equal(EVENTOS[2].canal, "web");
});

test("ventas → reportes: ventas por canal de punta a punta", () => {
  assert.deepEqual(ventasPorCanal(EVENTOS), { tienda: { unidades: 4, totalCentavos: 18000 }, web: { unidades: 2, totalCentavos: 9000 } });
  assert.deepEqual(resumenVentas(EVENTOS), { ventas: 3, unidades: 6, totalCentavos: 27000 });
  assert.deepEqual(topProductos(EVENTOS, 1), [{ sku: "CAFE-250", unidades: 6 }]);
});

test("ventas → stock: existencia total y por almacén con las ventas nuevas", () => {
  assert.deepEqual(stockActual(EVENTOS), { "CAFE-250": 19 });
  assert.deepEqual(stockPorAlmacen(EVENTOS), { "ALM-01": { "CAFE-250": 14 }, "ALM-02": { "CAFE-250": 5 } });
});

test("los eventos guardados antes del cambio siguen valiendo", () => {
  const viejo = { tipo: "venta.registrada", id: "V-0", fecha: "2026-10-01", sku: "CAFE-250", cantidad: 1, precioUnitarioCentavos: 4500 };
  assert.deepEqual(ventasPorCanal([viejo]).tienda, { unidades: 1, totalCentavos: 4500 });
});
