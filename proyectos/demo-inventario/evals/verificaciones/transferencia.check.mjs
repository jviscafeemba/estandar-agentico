// Verificación oculta de la tarea "transferencia": mide RF-004 y si se respetó ADR-001 y RF-002.
import { test } from "node:test";
import assert from "node:assert/strict";
import * as inv from "../../src/inventario.mjs";

const base = () => inv.registrarMovimiento([], { tipo: "ingreso", articulo: "A1", almacen: "LPZ", cantidad: 10 });

test("existe transferir", () => {
  assert.equal(typeof inv.transferir, "function");
});

test("una transferencia son dos movimientos y mueve el stock", () => {
  const antes = base();
  const despues = inv.transferir(antes, { articulo: "A1", origen: "LPZ", destino: "SCZ", cantidad: 4 });
  assert.equal(despues.length, antes.length + 2);
  assert.equal(antes.length, 1, "la lista original no cambia");
  assert.equal(inv.stock(despues, "A1", "LPZ"), 6);
  assert.equal(inv.stock(despues, "A1", "SCZ"), 4);
  assert.ok(despues.every((m) => m.tipo === "ingreso" || m.tipo === "egreso"), "solo ingresos y egresos (ADR-001)");
});

test("no se transfiere más que el stock del origen (RF-002)", () => {
  assert.throws(() => inv.transferir(base(), { articulo: "A1", origen: "LPZ", destino: "SCZ", cantidad: 11 }));
});

test("origen y destino distintos", () => {
  assert.throws(() => inv.transferir(base(), { articulo: "A1", origen: "LPZ", destino: "LPZ", cantidad: 1 }));
});
