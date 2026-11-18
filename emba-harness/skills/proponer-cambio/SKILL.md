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
4. Escribí la propuesta en `docs/cambios/<AAAA-MM-DD>-<nombre>.md`. Es una **spec** (formato propio inspirado en OpenSpec: requisitos y escenarios; no usa la herramienta,
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
   - **Pantallas** (0.4.0): qué pantallas agrega o cambia y qué secciones de `docs/diseno/estilo-visual.md`
     aplica, con escenarios de los estados vacío, cargando, error y sin permiso. Si no tiene, «ninguna».
     **Antes de escribir esta sección (0.4.2):** si el plan dice «Claude Design» y `estilo-visual.md` no tiene la
     «Dirección visual» elegida por una persona, frená y corré primero `/emba-harness:disenar-interfaz`. La sección
     enlaza las capturas de la dirección elegida o el proyecto de Claude Design.
   - **Fuera de alcance**. Incluye lo que el usuario esperaría y la spec no cubre, con su pendiente P-0nn o
     pregunta Q-0nn.
   - **Riesgos**: datos, seguridad, integraciones, irreversibilidad.
5. En nivel 3, o si la spec la va a implementar otra sesión, lanzá el agente `revisor-spec` de este plugin. Pasale
   solo la ruta de la spec, el número de ronda y, si el cambio depende de otro ya unido, su rama. Corregí los graves
   y hacé commit de la spec antes de cada ronda siguiente. **Máximo 3 rondas** (0.4.3):
   - en las rondas 2 y 3, pasale también el commit de la ronda anterior: revisa solo lo corregido, no la spec entera;
   - si después de la ronda 3 quedan graves, no lances una cuarta. Llevale a la persona la lista de graves abiertos
     y tres opciones: **seguir** con más rondas (decide cuántas), **aceptar** con los graves anotados como riesgos en
     la sección «Riesgos» de la propuesta, o **achicar** el cambio y pasar lo dudoso a otro C-0n. Cerrá con
     `ESPERA: <persona> (tope del revisor de spec en <C-0n>)` y anotá su decisión en la spec.
6. Si el cambio tiene pantallas, mostrale también las capturas de la dirección visual o el enlace al proyecto de
   Claude Design: la aprobación de una spec con pantallas se hace **viéndolas** (0.4.2).
   Mostrale la propuesta al usuario y esperá su aprobación explícita antes de implementar. Lo que vale es que
   **una persona la haya leído** (v3.1, C-05): si la respuesta es un «ok» que no contesta los supuestos que
   marcaste, repreguntá esos supuestos en una línea antes de seguir; no los des por aprobados.
7. **Cuando llegan las respuestas, actualizá el archivo** (supuestos, requisitos y escenarios) antes de seguir:
   lo que se acordó en el chat y no está en la spec se pierde cuando el cambio pasa a otra sesión o persona
   (v3.3). Si otra sesión implementa, la spec manda sobre el resumen del pedido.
