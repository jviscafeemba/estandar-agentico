import { test } from "node:test";
import assert from "node:assert/strict";
import { ventasPorCanal } from "../../modulos/reportes/reportes.mjs";
import { crearStockAjustado, crearVentaRegistrada } from "../../contratos/eventos.mjs";

test("RF-007: ventas por canal; sin canal cuenta como tienda", () => {
  const eventos = [
    crearVentaRegistrada({ id: "V-1", fecha: "2026-11-01", sku: "CAFE-250", cantidad: 2, precioUnitarioCentavos: 4500 }),
    crearStockAjustado({ id: "S-1", fecha: "2026-11-01", sku: "CAFE-250", delta: 10, motivo: "compra" }),
  ];
  assert.deepEqual(ventasPorCanal(eventos), { tienda: { unidades: 2, totalCentavos: 9000 }, web: { unidades: 0, totalCentavos: 0 } });
});
