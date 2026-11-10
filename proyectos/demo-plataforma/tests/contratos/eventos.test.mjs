import { test } from "node:test";
import assert from "node:assert/strict";
import { crearStockAjustado, crearVentaRegistrada, validarEvento } from "../../contratos/eventos.mjs";

const VENTA = { id: "V-1", fecha: "2026-11-01", sku: "CAFE-250", cantidad: 2, precioUnitarioCentavos: 4500 };

test("RF-001: un evento válido se devuelve congelado y con su tipo", () => {
  const e = crearVentaRegistrada(VENTA);
  assert.equal(e.tipo, "venta.registrada");
  assert.equal(e.sku, "CAFE-250");
  assert.ok(Object.isFrozen(e));
});

test("RF-001: el contrato es estricto (ADR-001)", () => {
  assert.throws(() => crearVentaRegistrada({ ...VENTA, color: "rojo" }), TypeError);
  assert.throws(() => crearVentaRegistrada({ ...VENTA, sku: undefined }), TypeError);
  assert.throws(() => crearVentaRegistrada({ ...VENTA, cantidad: 0 }), RangeError);
  assert.throws(() => validarEvento({ tipo: "venta.anulada", id: "X" }), TypeError);
});

test("RF-001: stock.ajustado exige delta entero distinto de cero y motivo", () => {
  const e = crearStockAjustado({ id: "S-1", fecha: "2026-11-01", sku: "CAFE-250", delta: 10, motivo: "compra" });
  assert.equal(e.delta, 10);
  assert.throws(() => crearStockAjustado({ id: "S-2", fecha: "2026-11-01", sku: "CAFE-250", delta: 0, motivo: "x" }), RangeError);
  assert.throws(() => crearStockAjustado({ id: "S-3", fecha: "2026-11-01", sku: "CAFE-250", delta: 1 }), TypeError);
});
