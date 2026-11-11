---
dueño: plataforma-agentica
estado: candidata
revisado: 2026-11-11
vence: 2027-01-10
fuentes: ["demo-facturas: docs/cambios/2026-11-11-anulacion-facturas.md", "demo-facturas: docs/requerimientos/requerimientos.md (RF-006)", "demo-facturas: src/factura.mjs (validarMotivo)", "indicación de jviscafe: la corrección también ocurrió en otro proyecto"]
---
# Todo motivo de anulación, ajuste o corrección lleva al menos 10 caracteres sin contar los espacios de los bordes

**Regla.** Es una regla de auditoría de EMBA para todos los sistemas. El motivo se recorta (`trim`) y, si queda con
menos de 10 caracteres o no es texto, se rechaza. Se guarda el motivo ya recortado.

**Por qué es lección.** El agente propuso «motivo no vacío» porque el brain de empresa no recoge la regla, y una
persona tuvo que corregirlo. Ya había pasado en otro proyecto: es una corrección repetida.

**Cómo se aplicó en demo-facturas.** RF-006; función reutilizable `validarMotivo` en `src/factura.mjs`; pruebas
RF-006-a y RF-006-b en `tests/factura.test.mjs`.

**Propuesta para la retro.** Promoverla a estándar del brain (con su dueño de auditoría) o a prueba/compuerta
compartida, en vez de depender de que cada proyecto la recuerde. El mínimo de 10 y la definición de «sin espacios de
los bordes» deben confirmarse con quien lleva la auditoría.
