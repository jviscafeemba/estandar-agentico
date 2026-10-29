# Propuesta — Descuento por línea

**Qué y por qué.** Cada línea de factura acepta un descuento en porcentaje (0 a 100).

**Requerimientos.** RF-004: el descuento se aplica antes del total de la línea, redondeado al centavo.

**Decisiones.** ADR-001: montos en centavos enteros.

**Pruebas primero.** 2 × 10,00 Bs con 10 % = 18,00 Bs; sin descuento no cambia; 150 % se rechaza.

**Fuera de alcance.** Descuento global de la factura.
