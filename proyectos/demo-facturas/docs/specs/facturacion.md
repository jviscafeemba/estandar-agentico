# Spec — Facturación

## Emisión (RF-001, RF-003)
- Dado un NIT válido y al menos una línea, cuando se emite, entonces la factura queda en estado "emitida" y
  no se puede modificar.
- Dado un NIT inválido, cuando se emite, entonces se rechaza con un error.

## Totales (RF-002)
- Dadas 2 × 50,00 Bs y 1 × 10,50 Bs, el total es 110,50 Bs, el IVA informado 14,37 Bs y el neto 96,13 Bs.

## Descuentos (RF-004, pendiente)
- Dada una línea de 2 × 10,00 Bs con 10 % de descuento, el total de la línea es 18,00 Bs.
- Un descuento fuera de 0–100 se rechaza.

## Anulación (RF-005, pendiente)
- Dada una factura emitida y un motivo, la anulación devuelve una factura nueva "anulada" con el motivo; la
  original no cambia.
- Sin motivo, la anulación se rechaza.
