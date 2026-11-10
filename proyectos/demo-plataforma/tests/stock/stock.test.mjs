import { test } from "node:test";
import assert from "node:assert/strict";
import { ajustarStock, stockActual } from "../../modulos/stock/stock.mjs";
import { crearVentaRegistrada } from "../../contratos/eventos.mjs";

test("RF-003: la existencia suma ajustes y resta ventas", () => {
  const eventos = [
    ajustarStock({ id: "S-1", fecha: "2026-11-01", sku: "cafe-250", delta: 20, motivo: "compra" }),
    ajustarStock({ id: "S-2", fecha: "2026-11-01", sku: "TE-100", delta: 5, motivo: "compra" }),
    crearVentaRegistrada({ id: "V-1", fecha: "2026-11-02", sku: "CAFE-250", cantidad: 3, precioUnitarioCentavos: 4500 }),
    ajustarStock({ id: "S-3", fecha: "2026-11-03", sku: "CAFE-250", delta: -1, motivo: "rotura" }),
  ];
  assert.deepEqual(stockActual(eventos), { "CAFE-250": 16, "TE-100": 5 });
});

test("RF-003: un evento que no cumple el contrato se rechaza", () => {
  assert.throws(() => stockActual([{ tipo: "stock.ajustado", id: "S-1", fecha: "2026-11-01", sku: "X", delta: 1 }]), TypeError);
});
