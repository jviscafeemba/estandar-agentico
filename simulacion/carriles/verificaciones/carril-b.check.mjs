// Verificación oculta del carril B (stock y dueño del contrato, RF-005 y RF-006). Corre sobre la rama de B tal
// cual. Exige que el cambio del contrato sea compatible hacia atrás y que el contrato siga siendo estricto.
import { test } from "node:test";
import assert from "node:assert/strict";
import { crearStockAjustado, crearVentaRegistrada, validarEvento } from "../../contratos/eventos.mjs";
import { stockActual, stockPorAlmacen } from "../../modulos/stock/stock.mjs";

const VENTA = { id: "V-1", fecha: "2026-11-01", sku: "CAFE-250", cantidad: 2, precioUnitarioCentavos: 4500 };
const AJUSTE = { id: "S-1", fecha: "2026-11-01", sku: "CAFE-250", delta: 10, motivo: "compra" };

test("compatible hacia atrás: los eventos v1 siguen siendo válidos y sin campos nuevos", () => {
  assert.ok(!("canal" in crearVentaRegistrada(VENTA)));
  assert.ok(!("almacen" in crearStockAjustado(AJUSTE)));
  validarEvento({ tipo: "venta.registrada", ...VENTA });
  validarEvento({ tipo: "stock.ajustado", ...AJUSTE });
});

test("venta.registrada: canal opcional tienda o web", () => {
  assert.equal(crearVentaRegistrada({ ...VENTA, canal: "web" }).canal, "web");
  assert.equal(validarEvento({ tipo: "venta.registrada", ...VENTA, canal: "tienda" }).canal, "tienda");
  for (const canal of ["fax", "WEB", 1]) assert.throws(() => crearVentaRegistrada({ ...VENTA, canal }), RangeError, String(canal));
});

test("stock.ajustado: almacén opcional ALM-nn", () => {
  assert.equal(crearStockAjustado({ ...AJUSTE, almacen: "ALM-07" }).almacen, "ALM-07");
  for (const almacen of ["ALM-7", "alm-07", "central"]) assert.throws(() => crearStockAjustado({ ...AJUSTE, almacen }), RangeError, almacen);
});

test("el contrato sigue estricto (ADR-001)", () => {
  assert.throws(() => crearVentaRegistrada({ ...VENTA, color: "rojo" }), TypeError);
  assert.throws(() => crearStockAjustado({ ...AJUSTE, canal: "web" }), TypeError);
  assert.throws(() => crearVentaRegistrada({ ...VENTA, almacen: "ALM-01" }), TypeError);
});

test("stock por almacén; sin almacén y las ventas van a ALM-01", () => {
  const eventos = [
    crearStockAjustado(AJUSTE),
    crearStockAjustado({ ...AJUSTE, id: "S-2", sku: "TE-100", delta: 6, almacen: "ALM-03" }),
    crearStockAjustado({ ...AJUSTE, id: "S-3", delta: 2, almacen: "ALM-03" }),
    crearVentaRegistrada({ ...VENTA, canal: "web" }),
  ];
  assert.deepEqual(stockPorAlmacen(eventos), { "ALM-01": { "CAFE-250": 8 }, "ALM-03": { "TE-100": 6, "CAFE-250": 2 } });
  assert.deepEqual(stockActual(eventos), { "CAFE-250": 10, "TE-100": 6 });
});
