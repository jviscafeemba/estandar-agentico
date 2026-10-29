---
dueño: plataforma-agentica
estado: vigente
revisado: 2026-10-29
vence: 2027-01-27
fuentes: [../decisiones/ADR-E001-desarrollo-agentico-federado.md]
---
# Compuertas mínimas de CI

Todo proyecto con agentes tiene, como mínimo:

| Compuerta | Para qué |
| --- | --- |
| Pruebas del proyecto | El comportamiento no se rompe |
| gitleaks | Ningún secreto entra al repositorio |
| Brain del proyecto válido | AGENTS.md ≤ 150 líneas; los ADR y requerimientos citados existen |

Plantilla: `emba-harness/plantillas/ci.yml`. Sin CI, el equivalente local es
`node <emba-harness>/scripts/verificar-proyecto.mjs <proyecto>`.
