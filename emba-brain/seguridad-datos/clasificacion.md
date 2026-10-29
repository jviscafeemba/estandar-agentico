---
dueño: seguridad
estado: vigente
revisado: 2026-10-29
vence: 2027-01-27
fuentes: [../decisiones/ADR-E002-politica-seguridad-agentes.md]
---
# Clasificación de datos

| Clase | Ejemplos | ¿Puede entrar al contexto de un agente? |
| --- | --- | --- |
| Público | Documentación publicada | Sí |
| Interno | Código, ADR, specs, este brain | Sí |
| Confidencial | Datos contables reales, credenciales de sistemas | No. Solo datos sintéticos |
| Personal | Datos identificables de empleados o clientes | No. Requiere revisión legal antes de cualquier uso |

Separación de capacidades: ninguna sesión de agente combina datos confidenciales, contenido externo no
confiable (correos, páginas web, tickets de terceros) y un canal de salida a internet.
