---
dueño: negocio-finanzas
estado: vigente
revisado: 2026-10-29
vence: 2027-04-27
fuentes: ["entrevista con el área de finanzas (ejemplo de la prueba de concepto)"]
---
# Glosario de negocio

> Contenido de ejemplo para la prueba de concepto. El dueño de negocio lo valida antes de usarlo como norma.

| Término | Significado | No confundir con |
| --- | --- | --- |
| Empresa | Persona jurídica del grupo, con su propia contabilidad | Base (una empresa puede tener una base por ERP) |
| Base | Base de datos de una empresa en el ERP | Empresa |
| Consumidor | Sistema que llama a una API interna | Usuario (persona) |
| Factura | Documento fiscal emitido a un cliente, con NIT | Nota de venta (sin valor fiscal) |
| Monto en Bs | Importe en bolivianos, 2 decimales | Importe en USD |
| Almacén | Ubicación física de inventario con su propio código | Bodega lógica del ERP |
| Código de almacén | Código de 3 letras mayúsculas de la ciudad (LPZ, SCZ, CBB, ORU, PTS, TJA, SRE, TDD, CIJ) seguido de 2 dígitos del almacén en esa ciudad, sin separador: `LPZ01`, `SCZ12` | Nombre del almacén ("Central La Paz") |
| Número de factura | Ver [documentos fiscales](../estandares/documentos-fiscales.md) | Correlativo (es solo una parte del número) |
| Stock mínimo | Cantidad por debajo de la cual se repone un artículo | Stock de seguridad |
