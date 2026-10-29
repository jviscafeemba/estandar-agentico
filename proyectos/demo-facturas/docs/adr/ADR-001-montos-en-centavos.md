# ADR-001 — Montos en centavos enteros

**Contexto.** Los decimales binarios de JavaScript producen errores de redondeo (0,1 + 0,2 ≠ 0,3) que en una
factura son errores fiscales.

**Decisión.** Todos los montos se guardan y calculan en centavos enteros (`Number.isInteger`). Solo
`formatearBs` convierte a texto para personas.

**Consecuencias.** Cualquier función que reciba un monto con decimales lo rechaza con `RangeError`.
