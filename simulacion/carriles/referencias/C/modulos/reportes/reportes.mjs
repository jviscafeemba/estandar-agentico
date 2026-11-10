// Módulo de reportes (RF-004, RF-007): resúmenes de ventas a partir de los eventos del contrato.
import { validarEvento } from "../../contratos/eventos.mjs";

const ventas = (eventos) => eventos.map(validarEvento).filter((e) => e.tipo === "venta.registrada");

export function resumenVentas(eventos) {
  const lista = ventas(eventos);
  return {
    ventas: lista.length,
    unidades: lista.reduce((s, e) => s + e.cantidad, 0),
    totalCentavos: lista.reduce((s, e) => s + e.cantidad * e.precioUnitarioCentavos, 0),
  };
}

// Los n SKU con más unidades vendidas, de mayor a menor (empate: orden alfabético).
export function topProductos(eventos, n = 3) {
  const unidades = {};
  for (const e of ventas(eventos)) unidades[e.sku] = (unidades[e.sku] ?? 0) + e.cantidad;
  return Object.entries(unidades)
    .sort(([a, x], [b, y]) => y - x || a.localeCompare(b))
    .slice(0, n)
    .map(([sku, total]) => ({ sku, unidades: total }));
}

// RF-007: unidades y total por canal. Una venta sin canal (eventos anteriores al campo) es de tienda.
export function ventasPorCanal(eventos) {
  const reporte = { tienda: { unidades: 0, totalCentavos: 0 }, web: { unidades: 0, totalCentavos: 0 } };
  for (const e of ventas(eventos)) {
    const fila = reporte[e.canal ?? "tienda"];
    fila.unidades += e.cantidad;
    fila.totalCentavos += e.cantidad * e.precioUnitarioCentavos;
  }
  return reporte;
}
