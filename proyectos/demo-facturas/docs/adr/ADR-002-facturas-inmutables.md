# ADR-002 — Facturas emitidas inmutables

**Contexto.** Una factura emitida es un documento fiscal. Corregirla en el lugar borra la evidencia.

**Decisión.** `emitirFactura` devuelve un objeto congelado (también sus líneas). Una corrección se hace
anulando la factura con un motivo y emitiendo otra (RF-005). Nada en el código modifica una factura existente.

**Consecuencias.** Las funciones que "cambian" una factura devuelven un objeto nuevo.
