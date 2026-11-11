# Requerimientos — demo-plataforma

| ID | Requerimiento | Estado |
| --- | --- | --- |
| RF-001 | Todo evento entre módulos cumple el contrato `contratos/eventos.mjs`; un evento con campos de más o de menos es inválido | Implementado |
| RF-002 | Ventas registra una venta (SKU, cantidad entera de 1 a 1000, precio unitario en centavos) y la publica como evento `venta.registrada` | Implementado |
| RF-003 | Stock calcula la existencia por SKU: suma los `stock.ajustado` y resta las `venta.registrada` | Implementado |
| RF-004 | Reportes resume las ventas: cantidad de ventas, unidades y total en centavos | Implementado |
| RF-005 | Las ventas llegan por dos canales, `tienda` y `web`; el canal viaja en el evento de venta | Pendiente |
| RF-006 | Stock lleva la existencia por almacén (código `ALM-` + dos dígitos) | Pendiente |
| RF-007 | Reportes informa las ventas por canal | Pendiente |
