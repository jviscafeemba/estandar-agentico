// Módulo de ventas (RF-002): registra una venta y la publica como evento venta.registrada del contrato.
import { crearVentaRegistrada } from "../../contratos/eventos.mjs";

export const MAX_UNIDADES = 1000;

export function registrarVenta({ id, fecha, sku, cantidad, precioUnitarioCentavos }) {
  if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > MAX_UNIDADES)
    throw new RangeError(`La cantidad debe ser un entero de 1 a ${MAX_UNIDADES}`);
  if (!Number.isInteger(precioUnitarioCentavos) || precioUnitarioCentavos < 0)
    throw new RangeError("El precio va en centavos enteros");
  return crearVentaRegistrada({ id, fecha, sku: String(sku).trim().toUpperCase(), cantidad, precioUnitarioCentavos });
}

export const totalVenta = (evento) => evento.cantidad * evento.precioUnitarioCentavos;
