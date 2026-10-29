---
dueño: plataforma-agentica
estado: aceptada
revisado: 2026-10-29
vence: 2027-10-29
fuentes: ["informe Estándar agéntico EMBA, 29/10/2026"]
---
# ADR-E001 — Desarrollo agéntico federado

**Contexto.** Los proyectos usan agentes de IA en todo el ciclo. El conocimiento transversal se repetía por
proyecto y las reglas escritas solo en prosa se olvidaban.

**Decisión.** Modelo federado:
- Brain de proyecto dentro de cada repositorio (AGENTS.md, ADR, specs, requerimientos con ID, RUNBOOK).
- Brain de empresa en `emba-brain`, distribuido como plugin `emba-empresa`.
- Harness en dos piezas: política administrada (seguridad) y plugin versionado `emba-harness` (flujo).
- Medición desde el día 1 y evals del harness ante cada cambio.

**Alternativas descartadas.** Repositorio central de todo el conocimiento (deriva entre docs y código,
cuello de botella). Plataforma RAG con ingesta de correo y chats (costo, trifecta letal, conocimiento
viejo servido con autoridad).

**Consecuencias.** Hace falta un dueño de la plataforma con tiempo asignado y vencimientos en cada documento.
