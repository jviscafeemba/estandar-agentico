# <Nombre del proyecto>

<Una o dos frases: qué hace y para quién.> Líder técnico: <rol o persona>.

## Mapa

| Qué | Dónde |
| --- | --- |
| Requerimientos (con ID RF-0xx) | `docs/requerimientos/` |
| Decisiones | `docs/adr/` |
| Propuestas de cambio | `docs/cambios/` |
| Operación | `RUNBOOK.md` |
| Código / pruebas | `src/` / `tests/` |

## Reglas que no se negocian

<Solo lo que el agente no puede deducir del código. Cada regla cita su ADR o requerimiento, y si existe una
prueba o hook que la impone, se nombra.>

- <Regla> (ADR-0xx; la impone `tests/<archivo>`).

## Cómo se verifica

- Pruebas: `<comando>`.
- Brain del proyecto: skill `/emba-harness:verificar`.

## Flujo

Propuesta (`/emba-harness:proponer-cambio`) → aprobación → prueba que falla → implementación →
`/emba-harness:verificar` → `/emba-harness:revisar` → PR. Estándares, glosario y sistemas de la empresa:
skill `emba-empresa:consultar-brain`.
