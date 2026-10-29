---
dueño: negocio-finanzas
estado: vigente
revisado: 2026-10-29
vence: 2027-04-27
fuentes: ["norma interna de numeración (ejemplo de la prueba de concepto)"]
---
# Documentos fiscales

> Contenido de ejemplo para la prueba de concepto.

## Número de factura

Formato `SSS-AAAA-NNNNNN`:

| Parte | Qué es | Regla |
| --- | --- | --- |
| `SSS` | Código de sucursal | 3 dígitos con ceros a la izquierda; de 1 a 999 |
| `AAAA` | Gestión (año fiscal) | 4 dígitos |
| `NNNNNN` | Correlativo | 6 dígitos con ceros a la izquierda; de 1 a 999999; se reinicia cada gestión |

Ejemplo: sucursal 1, gestión 2026, correlativo 123 → `001-2026-000123`.
Un valor fuera de rango es un error: nunca se trunca ni se ajusta.
