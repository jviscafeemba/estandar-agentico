# ADR-001 — Un contrato de eventos estricto y compartido

**Contexto.** Ventas, stock y reportes evolucionan por separado. Si un módulo importa a otro, cualquier cambio
interno rompe a los demás; si cada uno arma sus eventos a mano, los campos se desalinean sin que nadie lo note.

**Decisión.** Los módulos no se importan entre sí: solo usan `contratos/eventos.mjs`, que declara los tipos de
evento, sus campos obligatorios y opcionales, y las funciones `crear…` y `validarEvento`. El contrato es
**estricto**: un campo no declarado invalida el evento (`TypeError`); un valor fuera de rango o de formato
también (`RangeError`). Así ningún consumidor depende de un campo que el contrato no publicó.

**Consecuencias.** Un campo nuevo se agrega primero al contrato, como opcional, para que los eventos ya
guardados sigan siendo válidos (cambio compatible hacia atrás). Quitar o volver obligatorio un campo es un
cambio incompatible y necesita una versión nueva del evento.
