// Módulo de ventas (RF-002, RF-005): registra una venta y la publica como evento venta.registrada del contrato.
// El canal viaja en el evento: necesita que el contrato declare "canal" (lo agrega su dueño, el carril B).
import { crearVentaRegistrada } from "../../contratos/eventos.mjs";

export const MAX_UNIDADES = 1000;
export const CANALES_VENTA = ["tienda", "web"];

export function registrarVenta({ id, fecha, sku, cantidad, precioUnitarioCentavos, canal = "tienda" }) {
  if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > MAX_UNIDADES)
    throw new RangeError(`La cantidad debe ser un entero de 1 a ${MAX_UNIDADES}`);
  if (!Number.isInteger(precioUnitarioCentavos) || precioUnitarioCentavos < 0)
    throw new RangeError("El precio va en centavos enteros");
  if (!CANALES_VENTA.includes(canal)) throw new RangeError(`Canal desconocido: ${canal} (tienda o web)`);
  return crearVentaRegistrada({ id, fecha, sku: String(sku).trim().toUpperCase(), cantidad, precioUnitarioCentavos, canal });
}

export const totalVenta = (evento) => evento.cantidad * evento.precioUnitarioCentavos;
