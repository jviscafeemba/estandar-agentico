# 1-propuesta

**Pedido:** /emba-harness:proponer-cambio Implementá RF-004, descuento por línea.

**Costo:** 0.30 USD · **turnos:** 12

**Acciones bloqueadas:**
- PowerShell: Get-ChildItem -Recurse -File -Exclude .git | Where-Object { $_.FullName -notmatch '\\.git\\' } | Select-Object -ExpandProperty FullName

## Respuesta del agente

Escribí la propuesta en `docs/cambios/2026-10-29-descuento-por-linea.md`. No toqué código.

**Qué y por qué:** RF-004 ya existe en estado "Pendiente" y ya figura en la spec. Cada línea puede llevar un descuento opcional en porcentaje (0–100). Ese descuento se resta del subtotal de la línea antes de sumar el total de la factura, y se redondea al centavo para que todos los montos sigan siendo enteros (ADR-001). El IVA incluido (RF-002) se calcula sobre el total ya descontado.

**Requerimientos y decisiones:** cubre RF-004 y no hace falta un RF nuevo. Se aplican ADR-001 y ADR-002: el porcentaje queda congelado dentro de la línea al emitir la factura. No hace falta un ADR nuevo, y el pedido no contradice ninguno de los existentes.

**Diseño propuesto:**
- Campo opcional `descuentoPorcentaje` en cada línea; si no viene, vale 0. Las llamadas actuales no cambian.
- Se aceptan solo enteros de 0 a 100. Cualquier otro valor se rechaza con `RangeError`.
- Se redondea el descuento de cada línea con `Math.round(subtotal × % / 100)` (mitad hacia arriba). El total de la línea es `subtotal − descuento`.

**Pruebas primero (deben fallar antes de implementar):**

| ID | Caso | Resultado esperado |
| --- | --- | --- |
| RF-004-01 | 2 × 10,00 Bs con 10 % (el caso de la spec) | 18,00 Bs |
| RF-004-02 | Línea sin descuento | Igual que hoy |
| RF-004-03 | Descuento de 0 % y de 100 % | Subtotal completo / 0 |
| RF-004-04 | Descuento fuera de rango (−1, 101) | `RangeError` |
| RF-004-05 | Descuento decimal o no numérico (12.5, `"10"`) | `RangeError` |
| RF-004-06 | 1 × 0,05 Bs con 10 % (el descuento da medio centavo) | 4 centavos |
| RF-004-07 | IVA sobre el total descontado | Total 10050, IVA 1307, neto 8743 |
| RF-004-08 | `emitirFactura` con descuento | La línea conserva el porcentaje, está congelada y el total ya viene descontado |

**Fuera de alcance:** descuentos en Bs, descuentos sobre toda la factura, porcentajes con decimales, mostrar el desglose del descuento y RF-005.

**Riesgos:** la regla de redondeo puede mover el total ±1 centavo por línea frente a otra regla, lo que pesa en lo fiscal. Además, mientras no exista RF-005 no hay forma de anular una factura emitida con un descuento equivocado.

**Necesito que decidas dos cosas:**
1. ¿El porcentaje es solo entero, o hay que aceptar decimales como 12,5 %? RF-004 no lo dice, y la propuesta asume enteros.
2. ¿Se redondea el descuento de cada línea (lo que propongo) o el total de la línea? Las dos reglas dan resultados distintos cuando el descuento da medio centavo: en RF-004-06 da 4 centavos con mi propuesta y 5 con la otra. No encontré ningún estándar de redondeo en el brain de empresa.

¿Apruebas la propuesta tal como está, o con cambios? Hasta que confirmes, no escribo las pruebas ni el código.
