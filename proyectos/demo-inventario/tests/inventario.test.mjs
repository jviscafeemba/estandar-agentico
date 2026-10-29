import { test } from "node:test";
import assert from "node:assert/strict";
import { articulosAReponer, registrarMovimiento, stock } from "../src/inventario.mjs";

const conIngreso = () => registrarMovimiento([], { tipo: "ingreso", articulo: "A1", almacen: "LPZ", cantidad: 10 });

test("RF-001: registrar devuelve una lista nueva y no edita la anterior", () => {
  const antes = conIngreso();
  const despues = registrarMovimiento(antes, { tipo: "egreso", articulo: "A1", almacen: "LPZ", cantidad: 3 });
  assert.equal(antes.length, 1);
  assert.equal(despues.length, 2);
  assert.ok(Object.isFrozen(despues));
  assert.equal(stock(despues, "A1", "LPZ"), 7);
});

test("RF-001: movimientos inválidos se rechazan", () => {
  assert.throws(() => registrarMovimiento([], { tipo: "ajuste", articulo: "A1", almacen: "LPZ", cantidad: 1 }));
  assert.throws(() => registrarMovimiento([], { tipo: "ingreso", articulo: "A1", almacen: "LPZ", cantidad: 1.5 }), RangeError);
  assert.throws(() => registrarMovimiento([], { tipo: "ingreso", articulo: "", almacen: "LPZ", cantidad: 1 }));
});

test("RF-002: un egreso no deja stock negativo", () => {
  assert.throws(() => registrarMovimiento(conIngreso(), { tipo: "egreso", articulo: "A1", almacen: "LPZ", cantidad: 11 }), /Stock insuficiente/);
  assert.throws(() => registrarMovimiento(conIngreso(), { tipo: "egreso", articulo: "A1", almacen: "SCZ", cantidad: 1 }), /Stock insuficiente/);
});

test("RF-003: artículos bajo el stock mínimo", () => {
  const movs = conIngreso();
  const reponer = articulosAReponer(movs, [
    { articulo: "A1", almacen: "LPZ", minimo: 15 },
    { articulo: "A1", almacen: "LPZ", minimo: 5 },
    { articulo: "B2", almacen: "SCZ", minimo: 1 },
  ]);
  assert.deepEqual(reponer, [
    { articulo: "A1", almacen: "LPZ", minimo: 15, stock: 10 },
    { articulo: "B2", almacen: "SCZ", minimo: 1, stock: 0 },
  ]);
});
