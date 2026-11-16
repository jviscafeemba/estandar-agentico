# <Nombre del proyecto>

<Una o dos frases: qué hace y para quién.> Líder técnico: <rol o persona>.

## Mapa

| Qué | Dónde |
| --- | --- |
| Requerimientos (con ID RF-0xx) | `docs/requerimientos/` |
| Decisiones | `docs/adr/` |
| Propuestas de cambio | `docs/cambios/` (o `openspec/changes/` en nivel 3) |
| Plan, temas transversales y pendientes | `docs/plan/plan.md`, `docs/plan/pendientes.md` |
| Cómo se ven las pantallas (si hay) | `docs/diseno/estilo-visual.md`; capturas en `docs/capturas/` |
| Operación | `RUNBOOK.md` |
| Código / pruebas | `src/` / `tests/` |

Lo que el usuario esperaría y ninguna spec cubre (una pantalla sin estilo, un estado sin mensaje, algo que nadie
pidió pero falta) se anota como pendiente P-0nn o pregunta Q-0nn. No se arregla de paso ni se deja implícito.

## Reglas que no se negocian

<Solo lo que el agente no puede deducir del código. Cada regla cita su ADR o requerimiento. Si la regla se puede
imponer con una prueba, primero se escribe la prueba y acá solo se la nombra: en la simulación del 10/11/2026 el
agente respetó igual las reglas impuestas por pruebas aunque no hubiera AGENTS.md (v3.1, C-06).>

- <Regla> (ADR-0xx; la impone `tests/<archivo>`).

## Cómo se verifica

- Pruebas: `<comando>`.
- Brain del proyecto: skill `/emba-harness:verificar`.

## Flujo

Propuesta (`/emba-harness:proponer-cambio`) → aprobación → prueba que falla → implementación →
`/emba-harness:verificar` → `/emba-harness:revisar` → (si hay pantallas) `/emba-harness:mirar-producto` → PR.
Estándares, glosario y sistemas de la empresa:
skill `emba-empresa:consultar-brain`.
