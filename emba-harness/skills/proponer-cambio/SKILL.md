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
4. Escribí la propuesta en `docs/cambios/<AAAA-MM-DD>-<nombre>.md` con estas secciones:
   - **Qué y por qué** (2–4 frases).
   - **Requerimientos**: IDs cubiertos o nuevos.
   - **Decisiones**: ADR que aplican; si hace falta uno nuevo, decilo.
   - **Pruebas primero**: la lista de pruebas que van a fallar antes de implementar, cada una con su ID.
   - **Fuera de alcance**.
   - **Riesgos**: datos, seguridad, integraciones, irreversibilidad.
5. Mostrale la propuesta al usuario y esperá su aprobación explícita antes de implementar.
