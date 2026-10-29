---
name: cerrar-fase
description: Cierre de una fase o de un cambio grande en el flujo EMBA. Usar cuando se termina una fase, se une un PR importante o el usuario pide la retro. Actualiza la documentación del proyecto y propone lecciones para el brain de empresa.
disable-model-invocation: true
---

# Cerrar una fase

`<harness>` es la raíz del plugin: dos niveles arriba del directorio base de esta skill.

1. Revisá qué cambió desde el último cierre (`git log`).
2. Actualizá lo que corresponda del brain del proyecto:
   - un ADR nuevo si se tomó una decisión de arquitectura;
   - `RUNBOOK.md` si cambió la operación;
   - la guía de pruebas manuales si hay pantallas o flujos nuevos;
   - `AGENTS.md` solo si apareció una regla que el agente no puede deducir del código **y** no se puede
     convertir en prueba o hook. Mantenelo bajo 150 líneas.
3. Buscá correcciones repetidas: algo que una persona tuvo que corregirle al agente dos o más veces.
   - Si es propio del proyecto → prueba o regla en `AGENTS.md`.
   - Si es transversal → redactá una lección candidata para `emba-brain/lecciones/` con front-matter
     (`dueño`, `estado: candidata`, `revisado`, `vence` = hoy + 60 días, `fuentes`) y mostrásela al
     usuario. No la publiques: la aprueba la retro.
4. Resumí las métricas de la fase:
   `node "<harness>/scripts/metricas.mjs" .`
