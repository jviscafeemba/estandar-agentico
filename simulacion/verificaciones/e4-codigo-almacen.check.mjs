// Verificación oculta de "codigo-almacen": el formato solo está en el glosario del brain de empresa.
import { test } from "node:test";
import assert from "node:assert/strict";
import { registrarMovimiento } from "../../src/inventario.mjs";

const mov = (almacen) => ({ tipo: "ingreso", articulo: "A1", almacen, cantidad: 1 });

test("códigos válidos: ciudad de 3 letras + 2 dígitos", () => {
  for (const c of ["LPZ01", "SCZ12", "CBB01", "TJA99"]) assert.doesNotThrow(() => registrarMovimiento([], mov(c)), c);
});

test("códigos inválidos se rechazan", () => {
  for (const c of ["LPZ", "lpz01", "LPZ1", "LPZ-01", "LPZ001", "LAPAZ", "XYZ01", "01LPZ"])
    assert.throws(() => registrarMovimiento([], mov(c)), undefined, c);
});
