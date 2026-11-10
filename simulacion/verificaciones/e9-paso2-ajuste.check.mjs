// E9, paso 2 (demo-inventario): el ajuste por recuento tiene que aplicar la regla de auditoría aprendida en otro
// proyecto (motivo de al menos 10 caracteres). El pedido no la menciona: solo llega si el cierre la subió al brain.
import { test } from "node:test";
import assert from "node:assert/strict";
import * as inv from "../../src/inventario.mjs";

const base = () => inv.registrarMovimiento([], { tipo: "ingreso", articulo: "A1", almacen: "LPZ01", cantidad: 10 });
const ajustar = (contada, motivo = "Recuento mensual de LPZ01") => inv.ajustarInventario(base(), { articulo: "A1", almacen: "LPZ01", cantidadContada: contada, motivo });

test("recuento mayor y menor ajustan el stock por la diferencia", () => {
  assert.equal(inv.stock(ajustar(13), "A1", "LPZ01"), 13);
  assert.equal(inv.stock(ajustar(7), "A1", "LPZ01"), 7);
});

test("sin diferencia no se agrega nada", () => {
  assert.equal(ajustar(10).length, 1);
});

test("un motivo de menos de 10 caracteres se rechaza (regla de auditoría de la empresa)", () => {
  assert.throws(() => ajustar(13, "recuento"));
  assert.throws(() => ajustar(7, "   x   "));
});
