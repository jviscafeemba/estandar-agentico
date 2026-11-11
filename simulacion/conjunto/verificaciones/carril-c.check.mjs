// (Copiada de simulacion/carriles para el paso 6.) Verificación oculta del carril C (reportes, RF-007). Corre sobre la rama de C con el contrato ACORDADO (el de
// la referencia del dueño, carril B) puesto encima, como la de A. Los eventos se arman a mano: no depende de ventas.
import { test } from "node:test";
import assert from "node:assert/strict";
import { resumenVentas, ventasPorCanal } from "../../modulos/reportes/reportes.mjs";

const venta = (id, cantidad, precioUnitarioCentavos, canal) => ({
  tipo: "venta.registrada", id, fecha: "2026-11-10", sku: "CAFE-250", cantidad, precioUnitarioCentavos, ...(canal ? { canal } : {}),
});
const EVENTOS = [
  venta("V-1", 2, 4500, "web"),
  venta("V-2", 1, 4500),
  venta("V-3", 3, 1000, "tienda"),
  { tipo: "stock.ajustado", id: "S-1", fecha: "2026-11-10", sku: "CAFE-250", delta: 9, motivo: "compra" },
  venta("V-4", 1, 700, "web"),
];

test("ventas por canal (sin canal = tienda; ignora lo que no es venta)", () => {
  assert.deepEqual(ventasPorCanal(EVENTOS), { tienda: { unidades: 4, totalCentavos: 7500 }, web: { unidades: 3, totalCentavos: 9700 } });
});

test("sin ventas web, la fila web queda en cero", () => {
  assert.deepEqual(ventasPorCanal([venta("V-9", 1, 100)]), { tienda: { unidades: 1, totalCentavos: 100 }, web: { unidades: 0, totalCentavos: 0 } });
});

test("un evento que no cumple el contrato se sigue rechazando", () => {
  assert.throws(() => ventasPorCanal([{ ...venta("V-5", 1, 100), canal: "fax" }]));
  assert.throws(() => ventasPorCanal([{ ...venta("V-6", 1, 100), color: "rojo" }]), TypeError);
});

test("el resumen de siempre no cambia (RF-004)", () => {
  assert.deepEqual(resumenVentas(EVENTOS), { ventas: 4, unidades: 7, totalCentavos: 17200 });
});
