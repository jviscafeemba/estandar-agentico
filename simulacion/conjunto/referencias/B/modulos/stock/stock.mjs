// Módulo de stock (RF-003, RF-006): existencia por SKU y por almacén a partir de los eventos del contrato.
import { crearStockAjustado, validarEvento } from "../../contratos/eventos.mjs";

export const ALMACEN_PRINCIPAL = "ALM-01";

export function ajustarStock({ id, fecha, sku, delta, motivo, almacen }) {
  return crearStockAjustado({ id, fecha, sku: String(sku).trim().toUpperCase(), delta, motivo, almacen });
}

// Suma los ajustes y resta las ventas. Devuelve { [sku]: unidades }.
export function stockActual(eventos) {
  const stock = {};
  for (const e of eventos.map(validarEvento)) {
    if (e.tipo === "stock.ajustado") stock[e.sku] = (stock[e.sku] ?? 0) + e.delta;
    if (e.tipo === "venta.registrada") stock[e.sku] = (stock[e.sku] ?? 0) - e.cantidad;
  }
  return stock;
}

// RF-006: { [almacen]: { [sku]: unidades } }. Ajustes sin almacén y ventas van al almacén principal.
export function stockPorAlmacen(eventos) {
  const stock = {};
  const sumar = (almacen, sku, n) => {
    stock[almacen] ??= {};
    stock[almacen][sku] = (stock[almacen][sku] ?? 0) + n;
  };
  for (const e of eventos.map(validarEvento)) {
    if (e.tipo === "stock.ajustado") sumar(e.almacen ?? ALMACEN_PRINCIPAL, e.sku, e.delta);
    if (e.tipo === "venta.registrada") sumar(ALMACEN_PRINCIPAL, e.sku, -e.cantidad);
  }
  return stock;
}
