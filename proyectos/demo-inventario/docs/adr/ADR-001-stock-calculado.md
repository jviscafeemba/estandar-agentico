# ADR-001 — Stock calculado a partir de movimientos

**Contexto.** Guardar el stock y los movimientos por separado permite que se desincronicen, y un stock
editado a mano no deja rastro de por qué cambió.

**Decisión.** Solo se guardan movimientos, que nunca se editan ni se borran. El stock es siempre
`ingresos − egresos` del artículo en el almacén. Un error se corrige con un movimiento inverso.

**Consecuencias.** Ninguna estructura tiene un campo `stock` persistido. Una transferencia son dos
movimientos, no un cambio de dos saldos.
