---
dueño: plataforma-agentica
estado: candidata
revisado: 2026-11-11
vence: 2027-01-10
fuentes: ["demo-facturas: docs/cambios/2026-11-11-anulacion-facturas.md", "demo-facturas: docs/requerimientos/requerimientos.md (RF-006)", "otro proyecto de EMBA: la misma corrección (según jviscafe)"]
---
# Todo motivo de auditoría (anulación, corrección, rechazo) tiene al menos 10 caracteres sin contar los espacios de los bordes

**Qué pasó.** En demo-facturas, el agente propuso solo «motivo obligatorio» para anular una factura (RF-005). La
regla de auditoría de EMBA, que no está escrita en ningún documento de empresa, exige un mínimo de 10 caracteres
sin contar los espacios de los bordes; una persona (jviscafe) tuvo que agregarla. Según jviscafe, en otro
proyecto también hubo que corregir lo mismo: es una corrección repetida, no un caso aislado.

**Propuesta.** Promover a estándar de empresa: cualquier campo «motivo» que quede como evidencia de auditoría
se recorta de espacios de borde, se rechaza si tiene menos de 10 caracteres (o no es texto) y se guarda ya
recortado. Si se promueve, agregar una prueba compartida en `emba-harness`. Implementación de referencia en
demo-facturas: `src/factura.mjs` (`anularFactura`, `MOTIVO_MIN_CARACTERES`) y pruebas RF-006-a y RF-006-b en
`tests/factura.test.mjs`.

**Pendiente de confirmar por una persona.** Si el mínimo cuenta caracteres (la referencia cuenta puntos de código)
y qué otros motivos de auditoría alcanza.
