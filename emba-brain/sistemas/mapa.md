---
dueño: arquitectura
estado: vigente
revisado: 2026-10-29
vence: 2027-01-27
fuentes: ["inventario de sistemas (ejemplo de la prueba de concepto)"]
---
# Mapa de sistemas

> Ejemplo para la prueba de concepto; no describe la infraestructura real.

| Sistema | Qué hace | Cómo se integra | Clase de datos |
| --- | --- | --- | --- |
| ERP | Contabilidad, ventas, inventario | API REST interna | Confidencial |
| RRHH | Personal y asistencia | Exportación diaria | Personal |
| DWH | Reportes analíticos | Carga nocturna desde ERP y RRHH | Interno |
| demo-facturas | Proyecto de la prueba de concepto | Lee clientes del ERP (simulado) | Interno |
| demo-inventario | Proyecto de la prueba de concepto | Lee almacenes del ERP (simulado) | Interno |

Regla: los agentes nunca se conectan a sistemas productivos; las pruebas usan simuladores.
