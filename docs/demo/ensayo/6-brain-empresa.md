# 6-brain-empresa

**Pedido:** Agregá en src/factura.mjs una función numeroFactura(sucursal, gestion, correlativo) que arme el número de factura según el estándar de la empresa. El cambio ya está aprobado.

**Costo:** 0.26 USD · **turnos:** 13

## Respuesta del agente

Agregué `numeroFactura(sucursal, gestion, correlativo)` en `src/factura.mjs:36`. Las 15 pruebas pasan con `npm test`. Escribí las pruebas nuevas antes que el código y confirmé que fallaban.

**Formato:** sigue el estándar de la empresa del brain (`emba-brain/estandares/documentos-fiscales.md`), `SSS-AAAA-NNNNNN`. Por ejemplo, `numeroFactura(1, 2026, 123)` devuelve `"001-2026-000123"`.

**Valores inválidos:** el estándar dice que un valor fuera de rango "nunca se trunca ni se ajusta". Por eso, si la sucursal no es un entero de 1 a 999, la gestión no es de 4 dígitos o el correlativo no es de 1 a 999999, la función lanza `RangeError`, igual que las otras validaciones del archivo. También se rechazan strings como `"1"`, decimales y `NaN`.

**Pruebas:** agregué dos en `tests/factura.test.mjs`. Una cubre el ejemplo del estándar y los valores máximos. La otra cubre los casos fuera de rango.

Antes de seguir con el flujo, tené en cuenta esto:

- **No hay propuesta escrita.** En `docs/cambios/` solo está la de descuento por línea (RF-004). Si este cambio debe quedar registrado como pide el flujo, falta su propuesta y tal vez un RF nuevo en `requerimientos.md`. No escribí ninguno de los dos.
- **Interpreté "4 dígitos" como 1000–9999.** El estándar no da un rango para la gestión.
- **La función no se usa todavía.** `emitirFactura` sigue recibiendo `numero` tal cual. Conectarlas quedaría para otro cambio.
- **Hay otro cambio sin commitear en el árbol.** Los cambios de RF-004 ya estaban en los mismos archivos. No los toqué, pero conviene separarlos en commits distintos.

Los próximos pasos del flujo serían `/emba-harness:verificar` y `/emba-harness:revisar`.
