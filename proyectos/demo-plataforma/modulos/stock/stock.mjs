// Módulo de stock (RF-003): existencia por SKU a partir de los eventos del contrato.
import { crearStockAjustado, validarEvento } from "../../contratos/eventos.mjs";

export function ajustarStock({ id, fecha, sku, delta, motivo }) {
  return crearStockAjustado({ id, fecha, sku: String(sku).trim().toUpperCase(), delta, motivo });
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
