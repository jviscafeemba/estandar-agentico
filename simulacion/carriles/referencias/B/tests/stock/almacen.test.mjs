import { test } from "node:test";
import assert from "node:assert/strict";
import { ajustarStock, stockPorAlmacen } from "../../modulos/stock/stock.mjs";
import { crearVentaRegistrada } from "../../contratos/eventos.mjs";

test("RF-006: existencia por almacén; sin almacén y ventas van a ALM-01", () => {
  const eventos = [
    ajustarStock({ id: "S-1", fecha: "2026-11-01", sku: "CAFE-250", delta: 10, motivo: "compra" }),
    ajustarStock({ id: "S-2", fecha: "2026-11-01", sku: "CAFE-250", delta: 4, motivo: "compra", almacen: "ALM-02" }),
    crearVentaRegistrada({ id: "V-1", fecha: "2026-11-02", sku: "CAFE-250", cantidad: 3, precioUnitarioCentavos: 4500 }),
  ];
  assert.deepEqual(stockPorAlmacen(eventos), { "ALM-01": { "CAFE-250": 7 }, "ALM-02": { "CAFE-250": 4 } });
});
