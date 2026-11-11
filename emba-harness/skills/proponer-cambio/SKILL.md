---
name: proponer-cambio
description: Primer paso del flujo EMBA. Usar cuando el usuario pida una funcionalidad, un cambio de comportamiento o una corrección no trivial, antes de tocar código. Produce una propuesta escrita que cita requerimientos y ADR y espera aprobación.
disable-model-invocation: true
---

# Proponer un cambio

No escribas código en este paso.

0. **¿Hace falta propuesta?** (v3, proporcional). No hace falta si es una corrección chica de algo que ya
   tiene requerimiento, con una prueba que reproduce el error, sin cambiar comportamiento acordado, ni cifras de
   negocio, ni permisos o seguridad. En ese caso decilo en una frase («corrección chica: sin propuesta, porque…»),
   escribí o corré la prueba que falla, corregí y verificá. En todo lo demás (funcionalidad nueva, pedido
   ambiguo, cambio de comportamiento, nivel 3) seguí con los pasos de abajo.
1. Leé el `AGENTS.md` del proyecto y los documentos que cita y que toquen el cambio (ADR, requerimientos, specs).
   Si necesitás un estándar o término de la empresa, usá `emba-empresa:consultar-brain`.
2. Identificá los requerimientos con ID que cubre el cambio. Si el cambio no tiene requerimiento, proponé
   uno nuevo con el siguiente ID libre (`RF-0xx`) en `docs/requerimientos/`.
3. Si el pedido contradice un ADR o un requerimiento, **frená y preguntá**: no elijas vos.
4. Escribí la propuesta en `docs/cambios/<AAAA-MM-DD>-<nombre>.md`. Es una **spec** (formato tipo OpenSpec,
   v3.3): tiene que alcanzar para que **otra sesión, sin este chat**, implemente lo acordado. Secciones:
   - **Qué y por qué** (2–4 frases).
   - **Requerimientos**: IDs cubiertos o nuevos.
   - **Requisitos y escenarios**: cada requisito en una frase con «debe», y debajo sus escenarios verificables:
     `#### Escenario: <nombre>` con `- DADO …`, `- CUANDO …`, `- ENTONCES …` (con valores concretos: entradas,
     resultado esperado, redondeo, errores). Firma de las funciones y forma exacta del resultado.
   - **Supuestos y respuestas**: cada duda numerada, con la respuesta de la persona cuando llegue
     («S1 · ¿porcentaje o monto? → porcentaje entero 0-100, respondió Joaquín el dd/mm/aaaa»). Mientras no
     haya respuesta, «pendiente».
   - **Decisiones**: ADR que aplican; si hace falta uno nuevo, decilo.
   - **Pruebas primero**: la lista de pruebas que van a fallar antes de implementar, cada una con su ID y el
     escenario que cubre.
   - **Fuera de alcance**.
   - **Riesgos**: datos, seguridad, integraciones, irreversibilidad.
5. Mostrale la propuesta al usuario y esperá su aprobación explícita antes de implementar. Lo que vale es que
   **una persona la haya leído** (v3.1, C-05): si la respuesta es un «ok» que no contesta los supuestos que
   marcaste, repreguntá esos supuestos en una línea antes de seguir; no los des por aprobados.
6. **Cuando llegan las respuestas, actualizá el archivo** (supuestos, requisitos y escenarios) antes de seguir:
   lo que se acordó en el chat y no está en la spec se pierde cuando el cambio pasa a otra sesión o persona
   (v3.3). Si otra sesión implementa, la spec manda sobre el resumen del pedido.
