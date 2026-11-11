// Verificación oculta del carril A (ventas, RF-005). Corre sobre la rama de A con el contrato ACORDADO
// (el de la referencia del dueño, carril B) puesto encima: mide si el código de ventas hace lo pedido contra el
// contrato que va a existir al unir, no si A tocó el contrato (eso lo miden fuera_de_carril y los conflictos).
import { test } from "node:test";
import assert from "node:assert/strict";
import { registrarVenta, totalVenta } from "../../modulos/ventas/ventas.mjs";
import { validarEvento } from "../../contratos/eventos.mjs";

const DATOS = { id: "V-77", fecha: "2026-11-10", sku: " te-100 ", cantidad: 4, precioUnitarioCentavos: 1200 };

test("una venta web publica el canal en el evento", () => {
  const e = registrarVenta({ ...DATOS, canal: "web" });
  assert.equal(e.canal, "web");
  assert.equal(e.tipo, "venta.registrada");
  assert.equal(validarEvento(e).canal, "web");
});

test("sin canal, la venta es de tienda", () => {
  const e = registrarVenta(DATOS);
  assert.equal(e.canal ?? "tienda", "tienda");
  assert.equal(registrarVenta({ ...DATOS, canal: "tienda" }).canal, "tienda");
});

test("un canal desconocido es RangeError", () => {
  for (const canal of ["fax", "WEB", ""]) assert.throws(() => registrarVenta({ ...DATOS, canal }), RangeError, canal);
});

test("lo que ya hacía ventas sigue igual (RF-002)", () => {
  const e = registrarVenta(DATOS);
  assert.equal(e.sku, "TE-100");
  assert.equal(totalVenta(e), 4800);
  assert.throws(() => registrarVenta({ ...DATOS, cantidad: 1001 }), RangeError);
});
