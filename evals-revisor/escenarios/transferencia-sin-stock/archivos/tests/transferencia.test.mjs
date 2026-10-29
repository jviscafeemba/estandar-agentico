import { test } from "node:test";
import assert from "node:assert/strict";
import { registrarMovimiento, stock } from "../src/inventario.mjs";
import { transferir } from "../src/transferencia.mjs";

const base = () => registrarMovimiento([], { tipo: "ingreso", articulo: "A1", almacen: "LPZ", cantidad: 10 });

test("RF-004: una transferencia son dos movimientos y mueve el stock", () => {
  const despues = transferir(base(), { articulo: "A1", origen: "LPZ", destino: "SCZ", cantidad: 4 });
  assert.equal(despues.length, 3);
  assert.equal(stock(despues, "A1", "LPZ"), 6);
  assert.equal(stock(despues, "A1", "SCZ"), 4);
});

test("RF-004: origen y destino distintos", () => {
  assert.throws(() => transferir(base(), { articulo: "A1", origen: "LPZ", destino: "LPZ", cantidad: 1 }));
});
