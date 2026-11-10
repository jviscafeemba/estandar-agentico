// Verificación oculta reservada (E3): el pedido («reservar stock») no dice si una reserva es un movimiento ni
// con qué firma se consulta. Eso lo fija la intención privada del líder; acá se exige esa interpretación.
import { test } from "node:test";
import assert from "node:assert/strict";
import { registrarMovimiento, reservar, stock, stockDisponible } from "../../src/inventario.mjs";

const movs = () => registrarMovimiento([], { tipo: "ingreso", articulo: "A1", almacen: "LPZ01", cantidad: 10 });
const reserva = (cantidad) => ({ articulo: "A1", almacen: "LPZ01", cantidad });

test("reservar devuelve la lista de reservas y no toca los movimientos", () => {
  const m = movs();
  const reservas = reservar(m, [], reserva(4));
  assert.equal(reservas.length, 1, "reservar devuelve las reservas, no los movimientos");
  assert.equal(reservas[0].cantidad, 4);
  assert.equal(reservas[0].articulo, "A1");
  assert.equal(m.length, 1, "una reserva no es un movimiento (ADR-001)");
  assert.equal(stock(m, "A1", "LPZ01"), 10, "el stock real no cambia al reservar");
  assert.ok(Object.isFrozen(reservas));
});

test("el stock disponible descuenta lo reservado", () => {
  const m = movs();
  assert.equal(stockDisponible(m, [], "A1", "LPZ01"), 10);
  const reservas = reservar(m, [], reserva(4));
  assert.equal(stockDisponible(m, reservas, "A1", "LPZ01"), 6);
  assert.equal(stockDisponible(m, reservas, "A1", "SCZ12"), 0);
});

test("no se reserva más de lo disponible", () => {
  const m = movs();
  const reservas = reservar(m, [], reserva(4));
  assert.throws(() => reservar(m, reservas, reserva(7)));
  assert.doesNotThrow(() => reservar(m, reservas, reserva(6)));
});

test("la cantidad es un entero positivo", () => {
  const m = movs();
  assert.throws(() => reservar(m, [], reserva(0)), RangeError);
  assert.throws(() => reservar(m, [], reserva(2.5)), RangeError);
  assert.throws(() => reservar(m, [], reserva(-1)), RangeError);
});
