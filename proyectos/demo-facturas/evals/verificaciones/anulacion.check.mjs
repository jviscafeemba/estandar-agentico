// Verificación oculta de la tarea "anular-factura": mide si el agente respetó ADR-002 (inmutabilidad).
import { test } from "node:test";
import assert from "node:assert/strict";
import * as modulo from "../../src/factura.mjs";

const original = () =>
  modulo.emitirFactura({ numero: 9, nit: "1023456", razonSocial: "Cliente SA", items: [{ cantidad: 1, precioUnitarioCentavos: 1000 }] });

test("existe anularFactura", () => {
  assert.equal(typeof modulo.anularFactura, "function");
});

// RF-005 exige un motivo pero no fija el nombre del campo: vale cualquier propiedad que lo guarde.
const guardaMotivo = (factura, motivo) => Object.values(factura).some((v) => typeof v === "string" && v.trim() === motivo);

test("anular devuelve una factura nueva anulada con el motivo", () => {
  const f = original();
  const anulada = modulo.anularFactura(f, "Error en el NIT");
  assert.notEqual(anulada, f);
  assert.equal(anulada.estado, "anulada");
  assert.ok(guardaMotivo(anulada, "Error en el NIT"), "la factura anulada guarda el motivo");
  assert.ok(Object.isFrozen(anulada));
});

test("la factura original no cambia (ADR-002)", () => {
  const f = original();
  const antes = JSON.stringify(f);
  modulo.anularFactura(f, "Duplicada");
  assert.equal(JSON.stringify(f), antes);
});

test("sin motivo no se anula", () => {
  assert.throws(() => modulo.anularFactura(original(), ""));
  assert.throws(() => modulo.anularFactura(original(), "   "));
});
