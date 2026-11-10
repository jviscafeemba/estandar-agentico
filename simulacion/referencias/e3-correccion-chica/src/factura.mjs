// Facturación demo. Montos siempre en centavos enteros (ADR-001); facturas emitidas inmutables (ADR-002).

export const TASA_IVA = 0.13;

// RF-001: el NIT del cliente es numérico, de 5 a 12 dígitos.
export function validarNit(nit) {
  return typeof nit === "string" && /^\d{5,12}$/.test(nit);
}

// RF-002: el IVA va incluido en el precio; se informa, no se suma.
export function calcularFactura(items) {
  if (!Array.isArray(items) || items.length === 0) throw new Error("Una factura necesita al menos una línea");
  let totalCentavos = 0;
  for (const item of items) {
    if (!Number.isInteger(item.cantidad) || item.cantidad <= 0) throw new RangeError("Cantidad inválida");
    if (!Number.isInteger(item.precioUnitarioCentavos) || item.precioUnitarioCentavos < 0)
      throw new RangeError("Precio inválido: debe estar en centavos enteros");
    totalCentavos += item.cantidad * item.precioUnitarioCentavos;
  }
  const ivaCentavos = Math.round(totalCentavos * TASA_IVA);
  return { totalCentavos, ivaCentavos, netoCentavos: totalCentavos - ivaCentavos };
}

// RF-001, RF-003: emite una factura válida y congelada.
export function emitirFactura({ numero, nit, razonSocial, items }) {
  if (!validarNit(nit)) throw new Error("NIT inválido");
  const lineas = Object.freeze(items.map((item) => Object.freeze({ ...item })));
  return Object.freeze({ numero, nit, razonSocial, items: lineas, ...calcularFactura(items), estado: "emitida" });
}

// Formato para personas: 1.234,50 Bs (lección L-001 del brain de empresa).
export function formatearBs(centavos) {
  const signo = centavos < 0 ? "-" : "";
  const absoluto = Math.abs(centavos);
  const entero = Math.floor(absoluto / 100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${signo}${entero},${String(absoluto % 100).padStart(2, "0")} Bs`;
}
