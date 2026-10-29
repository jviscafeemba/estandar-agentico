# 2-implementacion

**Pedido:** Aprobado. Implementalo: primero la prueba que falla, después el código.

**Costo:** 0.52 USD · **turnos:** 9

**Acciones bloqueadas:**
- PowerShell: npm test 2>$null | Select-String -Pattern '^(not ok|ok|# (pass|fail))'

## Respuesta del agente

RF-004 quedó implementado y las 13 pruebas pasan.

**Pruebas primero:** agregué las pruebas RF-004-01 a RF-004-08 en `tests/factura.test.mjs`. Antes de tocar el código las corrí y fallaron 7. La que pasó fue RF-004-02, que es a propósito: comprueba que una línea sin descuento sigue calculándose igual que hoy.

**Código:** el cambio está en `src/factura.mjs:11`, dentro de `calcularFactura`:
- `descuentoPorcentaje` es opcional y vale 0 si no viene. Solo cuenta como ausente cuando falta el campo: si viene `null`, se rechaza.
- Si el valor no es un entero de 0 a 100, se rechaza con `RangeError`.
- El total de cada línea es `subtotal − Math.round(subtotal × % / 100)`, o sea que se redondea el descuento, como aprobaste. Todos los montos siguen en centavos enteros.
- No toqué `emitirFactura`: ya copiaba y congelaba cada línea completa, así que el descuento queda guardado y no se puede cambiar. Lo comprueba RF-004-08.

**Documentos actualizados:**
- RF-004 figura como "Implementado" en `requerimientos.md`.
- La sección de descuentos de la spec ahora incluye los casos de redondeo, de línea sin descuento y del IVA sobre el total descontado.
- La propuesta quedó marcada como aprobada.

No hice commit. Según el flujo del proyecto, faltan `/emba-harness:verificar` y `/emba-harness:revisar` antes del PR. ¿Los corro?
