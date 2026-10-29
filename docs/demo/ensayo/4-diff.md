# 4-diff

```diff
diff --git a/docs/requerimientos/requerimientos.md b/docs/requerimientos/requerimientos.md
index 1fbe319..219166c 100644
--- a/docs/requerimientos/requerimientos.md
+++ b/docs/requerimientos/requerimientos.md
@@ -5,5 +5,5 @@
 | RF-001 | Una factura se emite solo a un NIT numérico de 5 a 12 dígitos | Implementado |
 | RF-002 | El IVA (13 %) va incluido en el precio; la factura informa total, IVA y neto | Implementado |
 | RF-003 | Una factura emitida no se modifica ni se borra | Implementado |
-| RF-004 | Cada línea puede llevar un descuento en porcentaje (0 a 100) que se aplica antes del total, redondeado al centavo | Pendiente |
+| RF-004 | Cada línea puede llevar un descuento en porcentaje (0 a 100) que se aplica antes del total, redondeado al centavo | Implementado |
 | RF-005 | Una factura emitida se anula con un motivo obligatorio; la anulación produce una factura nueva en estado "anulada" y no altera la original | Pendiente |
diff --git a/docs/specs/facturacion.md b/docs/specs/facturacion.md
index 2e5111d..cd3f412 100644
--- a/docs/specs/facturacion.md
+++ b/docs/specs/facturacion.md
@@ -8,9 +8,12 @@
 ## Totales (RF-002)
 - Dadas 2 × 50,00 Bs y 1 × 10,50 Bs, el total es 110,50 Bs, el IVA informado 14,37 Bs y el neto 96,13 Bs.
 
-## Descuentos (RF-004, pendiente)
+## Descuentos (RF-004)
 - Dada una línea de 2 × 10,00 Bs con 10 % de descuento, el total de la línea es 18,00 Bs.
-- Un descuento fuera de 0–100 se rechaza.
+- Un descuento fuera de 0–100, o que no sea un entero, se rechaza.
+- Sin descuento, la línea vale su subtotal completo.
+- El descuento de cada línea se redondea al centavo (mitad hacia arriba): 1 × 0,05 Bs con 10 % da 0,04 Bs.
+- El IVA incluido se calcula sobre el total ya descontado.
 
 ## Anulación (RF-005, pendiente)
 - Dada una factura emitida y un motivo, la anulación devuelve una factura nueva "anulada" con el motivo; la
diff --git a/src/factura.mjs b/src/factura.mjs
index 5d01137..7c9e5ce 100644
--- a/src/factura.mjs
+++ b/src/factura.mjs
@@ -8,6 +8,7 @@ export function validarNit(nit) {
 }
 
 // RF-002: el IVA va incluido en el precio; se informa, no se suma.
+// RF-004: cada línea puede llevar un descuento entero de 0 a 100 %; el descuento se redondea al centavo.
 export function calcularFactura(items) {
   if (!Array.isArray(items) || items.length === 0) throw new Error("Una factura necesita al menos una línea");
   let totalCentavos = 0;
@@ -15,7 +16,11 @@ export function calcularFactura(items) {
     if (!Number.isInteger(item.cantidad) || item.cantidad <= 0) throw new RangeError("Cantidad inválida");
     if (!Number.isInteger(item.precioUnitarioCentavos) || item.precioUnitarioCentavos < 0)
       throw new RangeError("Precio inválido: debe estar en centavos enteros");
-    totalCentavos += item.cantidad * item.precioUnitarioCentavos;
+    const { descuentoPorcentaje = 0 } = item;
+    if (!Number.isInteger(descuentoPorcentaje) || descuentoPorcentaje < 0 || descuentoPorcentaje > 100)
+      throw new RangeError("Descuento inválido: debe ser un entero de 0 a 100");
+    const subtotalCentavos = item.cantidad * item.precioUnitarioCentavos;
+    totalCentavos += subtotalCentavos - Math.round((subtotalCentavos * descuentoPorcentaje) / 100);
   }
   const ivaCentavos = Math.round(totalCentavos * TASA_IVA);
   return { totalCentavos, ivaCentavos, netoCentavos: totalCentavos - ivaCentavos };
diff --git a/tests/factura.test.mjs b/tests/factura.test.mjs
index fabcb45..8e356bb 100644
--- a/tests/factura.test.mjs
+++ b/tests/factura.test.mjs
@@ -30,6 +30,63 @@ test("RF-003: una factura emitida no se puede modificar", () => {
   assert.throws(() => { "use strict"; f.totalCentavos = 1; }, TypeError);
 });
 
+test("RF-004-01: descuento por línea (caso de la spec)", () => {
+  const f = calcularFactura([{ cantidad: 2, precioUnitarioCentavos: 1000, descuentoPorcentaje: 10 }]);
+  assert.equal(f.totalCentavos, 1800);
+});
+
+test("RF-004-02: una línea sin descuento no cambia", () => {
+  const f = calcularFactura([
+    { cantidad: 2, precioUnitarioCentavos: 5000 },
+    { cantidad: 1, precioUnitarioCentavos: 1050 },
+  ]);
+  assert.deepEqual(f, { totalCentavos: 11050, ivaCentavos: 1437, netoCentavos: 9613 });
+});
+
+test("RF-004-03: descuento de 0 % y de 100 %", () => {
+  assert.equal(calcularFactura([{ cantidad: 3, precioUnitarioCentavos: 700, descuentoPorcentaje: 0 }]).totalCentavos, 2100);
+  assert.equal(calcularFactura([{ cantidad: 3, precioUnitarioCentavos: 700, descuentoPorcentaje: 100 }]).totalCentavos, 0);
+});
+
+test("RF-004-04: descuento fuera de 0–100 se rechaza", () => {
+  for (const descuentoPorcentaje of [-1, 101]) {
+    assert.throws(() => calcularFactura([{ cantidad: 1, precioUnitarioCentavos: 100, descuentoPorcentaje }]), RangeError);
+  }
+});
+
+test("RF-004-05: descuento no entero o no numérico se rechaza", () => {
+  for (const descuentoPorcentaje of [12.5, "10", null, NaN]) {
+    assert.throws(() => calcularFactura([{ cantidad: 1, precioUnitarioCentavos: 100, descuentoPorcentaje }]), RangeError);
+  }
+});
+
+test("RF-004-06: el descuento se redondea al centavo", () => {
+  const f = calcularFactura([{ cantidad: 1, precioUnitarioCentavos: 5, descuentoPorcentaje: 10 }]);
+  assert.equal(f.totalCentavos, 4);
+  assert.ok(Number.isInteger(f.ivaCentavos) && Number.isInteger(f.netoCentavos));
+});
+
+test("RF-004-07: el IVA se calcula sobre el total descontado", () => {
+  const f = calcularFactura([
+    { cantidad: 2, precioUnitarioCentavos: 5000, descuentoPorcentaje: 10 },
+    { cantidad: 1, precioUnitarioCentavos: 1050 },
+  ]);
+  assert.deepEqual(f, { totalCentavos: 10050, ivaCentavos: 1307, netoCentavos: 8743 });
+});
+
+test("RF-004-08: la factura emitida conserva el descuento y queda congelada", () => {
+  const f = emitirFactura({
+    numero: 8,
+    nit: "1023456",
+    razonSocial: "Cliente SA",
+    items: [{ cantidad: 2, precioUnitarioCentavos: 1000, descuentoPorcentaje: 10 }],
+  });
+  assert.equal(f.totalCentavos, 1800);
+  assert.equal(f.items[0].descuentoPorcentaje, 10);
+  assert.ok(Object.isFrozen(f.items[0]));
+  assert.throws(() => { "use strict"; f.items[0].descuentoPorcentaje = 0; }, TypeError);
+});
+
 test("formato de montos para personas", () => {
   assert.equal(formatearBs(123450), "1.234,50 Bs");
   assert.equal(formatearBs(5), "0,05 Bs");
```
