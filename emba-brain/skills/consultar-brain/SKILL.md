---
name: consultar-brain
description: Consulta el brain de empresa EMBA. Usar cuando haga falta un estándar de la empresa (flujo de trabajo, secretos, CI, qué va en AGENTS.md), un término de negocio (empresa, base, consumidor, factura, almacén), el mapa de sistemas, la clasificación de datos o una decisión de empresa (ADR-E…), y el repositorio del proyecto no lo resuelve.
---

# Consultar el brain de empresa

Los documentos están en la raíz de este plugin, dos niveles arriba de este archivo
(`../../` respecto del directorio base de esta skill).

1. Leé primero `../../INDICE.md` y elegí **un** documento; no cargues el brain entero.
2. Antes de usar un documento como norma, mirá su front-matter:
   - `vence` anterior a hoy → avisá al usuario que está vencido y quién es el `dueño`; usalo solo como referencia.
   - `estado: candidata` → es una lección, todavía no un estándar. **Aplicala** si no contradice un estándar
     vigente ni una decisión escrita del proyecto, y decilo en la propuesta y en el PR («apliqué la lección
     candidata L-…»), para que la persona lo vea al aprobar. Si contradice algo escrito, no la apliques y
     señalá la contradicción para la retro (v3.3, F-05-06).
3. Citá el documento que usaste (ruta y ADR-E si aplica) en tu respuesta o propuesta.
4. Si el proyecto contradice al brain de empresa, gana la decisión escrita del proyecto (su ADR), pero
   señalá la contradicción para que se revise en la retro.
5. Si falta algo en el brain, no lo inventes: proponé una lección candidata con `/emba-harness:cerrar-fase`.
