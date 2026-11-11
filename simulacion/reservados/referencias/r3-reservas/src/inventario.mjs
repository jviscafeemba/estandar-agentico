// Inventario demo. El stock no se guarda: se calcula de los movimientos, que nunca se editan (ADR-001).

const TIPOS = new Set(["ingreso", "egreso"]);

export function stock(movimientos, articulo, almacen) {
  return movimientos
    .filter((m) => m.articulo === articulo && m.almacen === almacen)
    .reduce((total, m) => total + (m.tipo === "ingreso" ? m.cantidad : -m.cantidad), 0);
}

// RF-001: registra un movimiento válido y devuelve una lista nueva; la anterior no cambia.
// RF-002: un egreso no puede dejar el stock en negativo.
export function registrarMovimiento(movimientos, movimiento) {
  const { tipo, articulo, almacen, cantidad } = movimiento;
  if (!TIPOS.has(tipo)) throw new Error(`Tipo de movimiento inválido: ${tipo}`);
  if (!articulo || !almacen) throw new Error("El movimiento necesita artículo y almacén");
  if (!Number.isInteger(cantidad) || cantidad <= 0) throw new RangeError("La cantidad debe ser un entero positivo");
  if (tipo === "egreso" && stock(movimientos, articulo, almacen) < cantidad)
    throw new Error(`Stock insuficiente de ${articulo} en ${almacen}`);
  return Object.freeze([...movimientos, Object.freeze({ ...movimiento })]);
}

// RF-003: artículos por debajo de su stock mínimo en cada almacén.
export function articulosAReponer(movimientos, minimos) {
  return minimos
    .map(({ articulo, almacen, minimo }) => ({ articulo, almacen, minimo, stock: stock(movimientos, articulo, almacen) }))
    .filter((a) => a.stock < a.minimo);
}

// Una reserva no es un movimiento (ADR-001): se guarda aparte y solo baja el stock disponible.
export function reservado(reservas, articulo, almacen) {
  return reservas
    .filter((r) => r.articulo === articulo && r.almacen === almacen)
    .reduce((total, r) => total + r.cantidad, 0);
}

export function stockDisponible(movimientos, reservas, articulo, almacen) {
  return stock(movimientos, articulo, almacen) - reservado(reservas, articulo, almacen);
}

export function reservar(movimientos, reservas, reserva) {
  const { articulo, almacen, cantidad } = reserva;
  if (!articulo || !almacen) throw new Error("La reserva necesita artículo y almacén");
  if (!Number.isInteger(cantidad) || cantidad <= 0) throw new RangeError("La cantidad debe ser un entero positivo");
  if (stockDisponible(movimientos, reservas, articulo, almacen) < cantidad)
    throw new Error(`Stock disponible insuficiente de ${articulo} en ${almacen}`);
  return Object.freeze([...reservas, Object.freeze({ ...reserva })]);
}
