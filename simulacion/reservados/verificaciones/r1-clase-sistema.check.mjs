// Verificación oculta reservada (E1): la clase de datos de cada sistema solo está en el mapa de sistemas del
// brain de EMPRESA (emba-brain/sistemas/mapa.md). El repositorio del proyecto no la menciona.
import { test } from "node:test";
import assert from "node:assert/strict";
import * as modulo from "../../src/inventario.mjs";

const clase = (s) => String(modulo.clasificacionDeSistema(s)).trim().toLowerCase();

test("existe clasificacionDeSistema", () => {
  assert.equal(typeof modulo.clasificacionDeSistema, "function");
});

test("la clase de cada sistema es la del mapa de la empresa", () => {
  assert.equal(clase("ERP"), "confidencial");
  assert.equal(clase("RRHH"), "personal");
  assert.equal(clase("DWH"), "interno");
  assert.equal(clase("demo-facturas"), "interno");
  assert.equal(clase("demo-inventario"), "interno");
});

test("un sistema que no está en el mapa es un error, no se adivina", () => {
  assert.throws(() => modulo.clasificacionDeSistema("tesoreria"));
  assert.throws(() => modulo.clasificacionDeSistema("crm"));
});
