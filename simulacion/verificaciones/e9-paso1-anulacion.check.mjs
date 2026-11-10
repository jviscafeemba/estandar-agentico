// E9, paso 1 (demo-facturas): RF-005 con la regla de auditoría que el líder corrige (motivo de al menos 10 caracteres).
import { test } from "node:test";
import assert from "node:assert/strict";
import * as m from "../../src/factura.mjs";

const f = () => m.emitirFactura({ numero: 9, nit: "1023456", razonSocial: "X", items: [{ cantidad: 1, precioUnitarioCentavos: 1000 }] });

test("anulación con motivo válido", () => {
  const a = m.anularFactura(f(), "NIT mal cargado por el cajero");
  assert.equal(a.estado, "anulada");
  assert.ok(Object.isFrozen(a));
});

test("un motivo de menos de 10 caracteres se rechaza (regla de auditoría)", () => {
  assert.throws(() => m.anularFactura(f(), "error"));
  assert.throws(() => m.anularFactura(f(), "   corto   "));
});
