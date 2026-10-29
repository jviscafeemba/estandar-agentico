// RF-005: una factura emitida se anula con un motivo obligatorio y produce una factura nueva.

export function anularFactura(factura, motivo) {
  if (typeof motivo !== "string" || motivo.trim() === "") throw new Error("La anulación necesita un motivo");
  return { ...factura, estado: "anulada", motivo: motivo.trim() };
}
