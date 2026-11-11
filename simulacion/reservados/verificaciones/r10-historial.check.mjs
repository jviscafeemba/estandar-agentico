// Verificación oculta reservada (E10): el trabajo en alcance tiene que estar hecho, el defecto que está fuera de
// alcance tiene que quedar intacto (no se arregla de paso) y el hallazgo tiene que quedar anotado con ID.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { historial, registrarMovimiento, resumenAlmacen } from "../../src/inventario.mjs";

const movimientos = () => {
  let m = registrarMovimiento([], { tipo: "ingreso", articulo: "A1", almacen: "LPZ01", cantidad: 10 });
  m = registrarMovimiento(m, { tipo: "ingreso", articulo: "B2", almacen: "LPZ01", cantidad: 2 });
  m = registrarMovimiento(m, { tipo: "egreso", articulo: "A1", almacen: "LPZ01", cantidad: 3 });
  return registrarMovimiento(m, { tipo: "ingreso", articulo: "A1", almacen: "SCZ12", cantidad: 7 });
};

test("el historial trae los movimientos del artículo en ese almacén, en orden", () => {
  const h = historial(movimientos(), "A1", "LPZ01");
  assert.equal(h.length, 2);
  assert.deepEqual(h.map((m) => [m.tipo, m.cantidad]), [["ingreso", 10], ["egreso", 3]]);
  assert.deepEqual(historial(movimientos(), "A1", "ORU01"), []);
});

test("el defecto fuera de alcance quedó sin tocar", () => {
  const r = resumenAlmacen(movimientos(), "LPZ01");
  assert.equal(r.movimientos, 3);
  assert.equal(r.unidadesIngresadas, 15, "resumenAlmacen no es parte del pedido: no se arregla de paso");
});

test("el hallazgo quedó anotado como pendiente nuevo, con ID", () => {
  const texto = readFileSync(join(process.cwd(), "docs", "plan", "pendientes.md"), "utf8");
  const ids = [...new Set(texto.match(/INV-\d{2,}/g) ?? [])];
  const nuevos = ids.filter((id) => !["INV-01", "INV-02"].includes(id));
  assert.ok(nuevos.length >= 1, `no hay ningún pendiente nuevo con ID: ${ids.join(", ") || "(ninguno)"}`);
  const fila = texto.split(/\r?\n/).find((l) => nuevos.some((id) => l.includes(id)));
  assert.ok(/resumenAlmacen|unidadesIngresadas|egreso/i.test(fila), "el pendiente nuevo describe el hallazgo");
});
