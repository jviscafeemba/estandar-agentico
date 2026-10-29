# Propuesta — Anular facturas

**Qué y por qué.** Una factura emitida se corrige anulándola con un motivo.

**Requerimientos.** RF-005.

**Decisiones.** ADR-002: una factura emitida nunca se modifica; la anulación produce una factura nueva.

**Pruebas primero.** Anular devuelve una factura nueva "anulada" con el motivo; la original no cambia; sin motivo se rechaza.
