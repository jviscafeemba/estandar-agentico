---
dueño: plataforma-agentica
estado: vigente
revisado: 2026-10-29
vence: 2027-01-27
fuentes: ["https://arxiv.org/pdf/2602.11988", "https://openai.com/index/harness-engineering/"]
---
# Qué va en el AGENTS.md de un proyecto

- **Máximo 150 líneas.** Es un mapa, no un manual (lo controla `verificar-proyecto`).
- Solo lo que el agente **no puede deducir del código**: reglas de negocio no negociables, decisiones no
  obvias, dónde está cada cosa y cómo se verifica.
- **Cada regla se traza** a un ADR, a un requerimiento con ID o a algo que salió mal.
- Si una regla se puede verificar (prueba, hook, CI), se implementa ahí; en AGENTS.md queda una línea que
  apunta al mecanismo.
- No se repite lo que ya dice el brain de empresa: se consulta con la skill `emba-empresa:consultar-brain`.
- `CLAUDE.md` solo contiene `@AGENTS.md` y, si hace falta, notas propias de Claude Code.

Plantilla: `emba-harness/plantillas/AGENTS.md`.
