---
dueño: plataforma-agentica
estado: candidata
revisado: 2026-11-10
vence: 2027-01-09
fuentes: ["demo-facturas: docs/cambios/2026-11-10-anulacion-facturas.md (regla indicada por el líder)", "otro proyecto: el líder reportó que tuvo que corregir la misma regla (sin referencia)"]
---
# El motivo de una anulación o corrección exige al menos 10 caracteres sin contar espacios de borde

**Regla (auditoría).** En todo sistema, el motivo de una anulación o de cualquier corrección debe ser texto con
al menos 10 caracteres sin contar los espacios de los bordes; se guarda recortado. Ausente, no-texto, vacío o
más corto se rechaza.

**Por qué.** Un motivo vacío o de una palabra no sirve en una auditoría. El agente no la deduce del requerimiento
(solo dice «motivo obligatorio») y una persona ya tuvo que corregirla en dos proyectos.

**Cómo aplicarla.** Validar en el único punto que registra el motivo y probar los bordes: `undefined`, `""`,
solo espacios, 9 caracteres (rechaza), 10 exactos con espacios en los bordes (acepta).

**Pendiente.** Falta la referencia concreta del otro proyecto, para citarla en la retro.
