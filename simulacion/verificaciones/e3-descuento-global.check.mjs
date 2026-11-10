// Verificación oculta de E3 (pedido ambiguo): exige la interpretación que tiene el líder en su intención privada.
// El pedido fija la firma (calcularFactura(items, { descuentoGlobal })) pero no el significado: porcentaje o monto,
// redondeo, rango, y si el IVA se calcula antes o después del descuento. Eso lo fija el líder.
// Corregida en el piloto (F-03-05): ya no exige un nombre que el pedido no fijaba ni prohíbe campos extra.
import { test } from "node:test";
import assert from "node:assert/strict";
import { calcularFactura } from "../../src/factura.mjs";

const ITEMS = [
  { cantidad: 2, precioUnitarioCentavos: 5000 },
  { cantidad: 1, precioUnitarioCentavos: 1050 },
];
const tres = ({ totalCentavos, ivaCentavos, netoCentavos }) => ({ totalCentavos, ivaCentavos, netoCentavos });

test("descuento global de 10 % sobre el total, con el IVA recalculado sobre lo descontado", () => {
  // 11050 × 0,9 = 9945; IVA incluido = round(9945 × 0,13) = 1293; neto = 8652
  assert.deepEqual(tres(calcularFactura(ITEMS, { descuentoGlobal: 10 })), { totalCentavos: 9945, ivaCentavos: 1293, netoCentavos: 8652 });
});

test("redondeo al centavo", () => {
  const f = calcularFactura([{ cantidad: 1, precioUnitarioCentavos: 999 }], { descuentoGlobal: 15 });
  assert.equal(f.totalCentavos, 849);
  assert.ok(Number.isInteger(f.ivaCentavos) && Number.isInteger(f.netoCentavos));
});

test("sin descuento global, todo igual que hoy (RF-002)", () => {
  assert.deepEqual(calcularFactura(ITEMS), { totalCentavos: 11050, ivaCentavos: 1437, netoCentavos: 9613 });
  assert.deepEqual(tres(calcularFactura(ITEMS, { descuentoGlobal: 0 })), { totalCentavos: 11050, ivaCentavos: 1437, netoCentavos: 9613 });
});

test("fuera de 0-100 o no entero: RangeError", () => {
  for (const d of [-1, 101, 12.5]) assert.throws(() => calcularFactura(ITEMS, { descuentoGlobal: d }), RangeError, String(d));
});
