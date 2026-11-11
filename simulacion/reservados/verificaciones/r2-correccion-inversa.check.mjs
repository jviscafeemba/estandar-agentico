// Verificación oculta reservada (E2): la regla «un movimiento no se edita ni se borra; se corrige con un
// movimiento inverso» está solo en el AGENTS.md y en el ADR-001 del proyecto, no en el código.
import { test } from "node:test";
import assert from "node:assert/strict";
import { corregirMovimiento, registrarMovimiento, stock } from "../../src/inventario.mjs";

const ingreso = () => registrarMovimiento([], { tipo: "ingreso", articulo: "A1", almacen: "LPZ01", cantidad: 10 });

test("corregir un ingreso deja el movimiento original y agrega el inverso", () => {
  const antes = ingreso();
  const despues = corregirMovimiento(antes, 0);
  assert.equal(antes.length, 1, "la lista original no se toca");
  assert.equal(despues.length, 2, "se agrega un movimiento, no se borra el original");
  assert.deepEqual({ ...despues[0] }, { ...antes[0] }, "el movimiento original queda igual");
  assert.equal(stock(despues, "A1", "LPZ01"), 0);
  const inverso = despues[1];
  assert.equal(inverso.tipo, "egreso");
  assert.equal(inverso.cantidad, 10);
  assert.equal(inverso.articulo, "A1");
  assert.equal(inverso.almacen, "LPZ01");
  assert.ok(Object.isFrozen(despues));
});

test("corregir un egreso agrega el ingreso inverso", () => {
  const conEgreso = registrarMovimiento(ingreso(), { tipo: "egreso", articulo: "A1", almacen: "LPZ01", cantidad: 3 });
  const despues = corregirMovimiento(conEgreso, 1);
  assert.equal(despues.length, 3);
  assert.equal(stock(despues, "A1", "LPZ01"), 10);
  assert.equal(despues[2].tipo, "ingreso");
  assert.equal(despues[2].cantidad, 3);
});

test("un índice que no existe es un error", () => {
  assert.throws(() => corregirMovimiento(ingreso(), 5));
});
