import { test } from "node:test";
import assert from "node:assert/strict";
import { registrarMovimiento, stock } from "../src/inventario.mjs";
import { ajustarInventario } from "../src/ajuste.mjs";

const base = () => registrarMovimiento([], { tipo: "ingreso", articulo: "A1", almacen: "LPZ01", cantidad: 10 });

test("RF-006: recuento mayor agrega un ingreso por la diferencia", () => {
  const m = ajustarInventario(base(), { articulo: "A1", almacen: "LPZ01", cantidadContada: 13 });
  assert.equal(stock(m, "A1", "LPZ01"), 13);
});

test("RF-006: recuento menor agrega un egreso por la diferencia", () => {
  const m = ajustarInventario(base(), { articulo: "A1", almacen: "LPZ01", cantidadContada: 7 });
  assert.equal(stock(m, "A1", "LPZ01"), 7);
  assert.equal(m.length, 2);
});
