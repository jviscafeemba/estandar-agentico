// Pasa una vez unida la rama del carril B (el contrato declara "canal"); en la rama de A sola, la venta web
// la rechaza el contrato v1. Es la dependencia que A escala con ESPERA.
import { test } from "node:test";
import assert from "node:assert/strict";
import { registrarVenta } from "../../modulos/ventas/ventas.mjs";

const DATOS = { id: "V-9", fecha: "2026-11-05", sku: "cafe-250", cantidad: 1, precioUnitarioCentavos: 4500 };

test("RF-005: el canal viaja en el evento de venta", () => {
  assert.equal(registrarVenta({ ...DATOS, canal: "web" }).canal, "web");
  assert.equal(registrarVenta(DATOS).canal, "tienda");
  assert.throws(() => registrarVenta({ ...DATOS, canal: "fax" }), RangeError);
});
