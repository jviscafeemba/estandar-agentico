// Número de factura según el estándar de documentos fiscales de la empresa: SSS-AAAA-NNNNNN.

export function numeroFactura(sucursal, gestion, correlativo) {
  if (!Number.isInteger(sucursal) || sucursal < 1 || sucursal > 999) throw new RangeError("Sucursal fuera de rango");
  if (!Number.isInteger(gestion) || gestion < 1000 || gestion > 9999) throw new RangeError("Gestión inválida");
  if (!Number.isInteger(correlativo) || correlativo < 0 || correlativo > 999999) throw new RangeError("Correlativo fuera de rango");
  return `${String(sucursal).padStart(3, "0")}-${gestion}-${String(correlativo).padStart(6, "0")}`;
}
