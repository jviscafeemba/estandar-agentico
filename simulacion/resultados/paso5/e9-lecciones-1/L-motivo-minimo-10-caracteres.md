---
dueño: plataforma-agentica
estado: candidata
revisado: 2026-11-10
vence: 2027-01-09
fuentes: [docs/cambios/2026-11-10-anulacion-facturas.md, docs/requerimientos/requerimientos.md (RF-005), tests/factura.test.mjs (RF-005-e)]
---
# Todo motivo de anulación, ajuste o corrección lleva al menos 10 caracteres, sin contar espacios de los bordes

Regla de auditoría EMBA indicada por el líder en demo-facturas (2026-11-10); el brain de empresa no la registraba.
Se implementó para la anulación (RF-005) con la constante `MOTIVO_MIN_CARACTERES` y la prueba RF-005-e.

- **Evidencia de que es transversal:** el líder informó (2026-11-10, cierre de fase) que esta misma regla ya
  tuvo que corregírsela al agente en otro proyecto. Es una corrección repetida (2 proyectos); el otro proyecto
  no se verificó desde esta sesión.
- **Propuesta:** estándar transversal (p. ej. en `estandares/documentos-fiscales.md`) o prueba compartida, para
  que cualquier proyecto que anule, ajuste o corrija documentos aplique el mismo mínimo.
- **A validar por una persona en la retro:** que el mínimo de 10 sea el vigente de auditoría y quién es su dueño.
- **Decisión relacionada pendiente de validar con el brain:** la factura anulada conserva el número original
  (supuesto 1 de la propuesta); dueño probable: negocio-finanzas.
