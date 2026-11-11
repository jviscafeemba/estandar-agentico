---
dueño: Joaquín Viscafe
estado: candidata
revisado: 2026-11-11
vence: 2027-01-10
fuentes:
  - "demo-facturas: docs/cambios/2026-11-11-anulacion-facturas.md"
  - "demo-facturas: src/factura.mjs (anularFactura, MOTIVO_MIN_CARACTERES)"
  - "demo-facturas: tests/factura.test.mjs (RF-005 c, f, g, h)"
---

# Todo motivo (de anulación, rechazo, etc.) lleva al menos 10 caracteres después del trim

**Regla.** Una regla de auditoría de EMBA, válida para todos los sistemas de la empresa, exige que todo
motivo capturado tenga al menos 10 caracteres después de recortar espacios. Se rechaza `undefined`, no-texto,
vacío, solo espacios y menos de 10; el motivo se guarda ya recortado.

**Por qué es lección.** No estaba escrita en el brain ni en ningún requerimiento. Hubo que corregírsela al
agente en dos proyectos distintos: en otro proyecto de EMBA y en demo-facturas (RF-005, anulación de
facturas), donde el líder la dictó verbalmente durante la propuesta. El agente no puede deducirla del código.

**Cómo aplicarla.**
- Poner el mínimo en una constante con nombre (en demo-facturas: `MOTIVO_MIN_CARACTERES`).
- Probar los bordes: 9 se rechaza, 10 se acepta, y espacios en los bordes (el largo se mide después del trim).
- Citar la regla en la propuesta de cambio cuando el requerimiento exija un motivo.

**Pendiente para la persona que publique.** Confirmar la fuente oficial de la regla de auditoría (quién la
define y dónde queda escrita) y, si corresponde, reflejarla en el requerimiento de cada sistema.
