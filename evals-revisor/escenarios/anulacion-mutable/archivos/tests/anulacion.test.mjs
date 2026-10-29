import { test } from "node:test";
import assert from "node:assert/strict";
import { emitirFactura } from "../src/factura.mjs";
import { anularFactura } from "../src/anulacion.mjs";

const factura = () =>
  emitirFactura({ numero: 9, nit: "1023456", razonSocial: "Cliente SA", items: [{ cantidad: 1, precioUnitarioCentavos: 1000 }] });

test("RF-005: anular devuelve una factura nueva con estado y motivo", () => {
  const f = factura();
  const anulada = anularFactura(f, "Error en el NIT");
  assert.notEqual(anulada, f);
  assert.equal(anulada.estado, "anulada");
  assert.equal(anulada.motivo, "Error en el NIT");
});

test("RF-005: la original no cambia", () => {
  const f = factura();
  anularFactura(f, "Duplicada");
  assert.equal(f.estado, "emitida");
});

test("RF-005: sin motivo no se anula", () => {
  assert.throws(() => anularFactura(factura(), "  "));
});
