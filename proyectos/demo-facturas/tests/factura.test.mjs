import { test } from "node:test";
import assert from "node:assert/strict";
import { calcularFactura, emitirFactura, formatearBs, validarNit } from "../src/factura.mjs";

test("RF-001: NIT numérico de 5 a 12 dígitos", () => {
  assert.ok(validarNit("1023456"));
  assert.ok(!validarNit("12-345"));
  assert.ok(!validarNit("1234"));
  assert.throws(() => emitirFactura({ numero: 1, nit: "abc", razonSocial: "X", items: [{ cantidad: 1, precioUnitarioCentavos: 100 }] }));
});

test("RF-002: el IVA va incluido y se informa", () => {
  const f = calcularFactura([
    { cantidad: 2, precioUnitarioCentavos: 5000 },
    { cantidad: 1, precioUnitarioCentavos: 1050 },
  ]);
  assert.deepEqual(f, { totalCentavos: 11050, ivaCentavos: 1437, netoCentavos: 9613 });
});

test("ADR-001: montos en centavos enteros", () => {
  assert.throws(() => calcularFactura([{ cantidad: 1, precioUnitarioCentavos: 10.5 }]), RangeError);
  assert.throws(() => calcularFactura([]));
});

test("RF-003: una factura emitida no se puede modificar", () => {
  const f = emitirFactura({ numero: 7, nit: "1023456", razonSocial: "Cliente SA", items: [{ cantidad: 1, precioUnitarioCentavos: 1000 }] });
  assert.equal(f.estado, "emitida");
  assert.ok(Object.isFrozen(f));
  assert.ok(Object.isFrozen(f.items[0]));
  assert.throws(() => { "use strict"; f.totalCentavos = 1; }, TypeError);
});

test("formato de montos para personas", () => {
  assert.equal(formatearBs(123450), "1.234,50 Bs");
  assert.equal(formatearBs(5), "0,05 Bs");
  assert.equal(formatearBs(-100000000), "-1.000.000,00 Bs");
});
