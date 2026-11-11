import { test } from "node:test";
import assert from "node:assert/strict";
import { crearStockAjustado, crearVentaRegistrada } from "../../contratos/eventos.mjs";

const VENTA = { id: "V-1", fecha: "2026-11-01", sku: "CAFE-250", cantidad: 2, precioUnitarioCentavos: 4500 };
const AJUSTE = { id: "S-1", fecha: "2026-11-01", sku: "CAFE-250", delta: 5, motivo: "compra" };

test("RF-005: venta.registrada admite canal opcional tienda o web", () => {
  assert.equal(crearVentaRegistrada({ ...VENTA, canal: "web" }).canal, "web");
  assert.equal(crearVentaRegistrada({ ...VENTA, canal: "tienda" }).canal, "tienda");
  assert.ok(!("canal" in crearVentaRegistrada(VENTA)));
  assert.throws(() => crearVentaRegistrada({ ...VENTA, canal: "fax" }), RangeError);
});

test("RF-006: stock.ajustado admite almacén opcional ALM-nn", () => {
  assert.equal(crearStockAjustado({ ...AJUSTE, almacen: "ALM-02" }).almacen, "ALM-02");
  assert.ok(!("almacen" in crearStockAjustado(AJUSTE)));
  assert.throws(() => crearStockAjustado({ ...AJUSTE, almacen: "central" }), RangeError);
});
