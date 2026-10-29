// Verificación oculta de la tarea "faltante-ordenado" (RF-005).
import { test } from "node:test";
import assert from "node:assert/strict";
import { articulosAReponer, registrarMovimiento } from "../../src/inventario.mjs";

test("informa el faltante y ordena de mayor a menor", () => {
  const movs = registrarMovimiento([], { tipo: "ingreso", articulo: "A1", almacen: "LPZ", cantidad: 10 });
  const r = articulosAReponer(movs, [
    { articulo: "A1", almacen: "LPZ", minimo: 12 },
    { articulo: "B2", almacen: "SCZ", minimo: 7 },
    { articulo: "C3", almacen: "CBBA", minimo: 3 },
  ]);
  assert.deepEqual(r.map((a) => [a.articulo, a.faltante]), [["B2", 7], ["C3", 3], ["A1", 2]]);
});

test("los que no faltan siguen fuera de la lista (RF-003)", () => {
  const movs = registrarMovimiento([], { tipo: "ingreso", articulo: "A1", almacen: "LPZ", cantidad: 10 });
  assert.deepEqual(articulosAReponer(movs, [{ articulo: "A1", almacen: "LPZ", minimo: 10 }]), []);
});
