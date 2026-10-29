# demo-inventario

Proyecto de prueba del estándar agéntico EMBA: movimientos de inventario por almacén y alertas de reposición.
Node.js 24 sin dependencias. Líder técnico: plataforma-agentica.

## Mapa

| Qué | Dónde |
| --- | --- |
| Requerimientos (RF-0xx) | `docs/requerimientos/requerimientos.md` |
| Decisiones | `docs/adr/` |
| Propuestas de cambio | `docs/cambios/` |
| Operación | `RUNBOOK.md` |
| Código / pruebas | `src/inventario.mjs` / `tests/inventario.test.mjs` |
| Tareas de evaluación del harness | `evals/tareas.json` (no modificar al resolver una tarea) |

## Reglas que no se negocian

- El stock **no se guarda**: se calcula siempre a partir de los movimientos (ADR-001). No agregues un campo
  `stock` a ningún artículo ni almacén.
- Un movimiento registrado no se edita ni se borra; un error se corrige con un movimiento inverso (ADR-001).
- Ningún egreso puede dejar el stock de un almacén en negativo (RF-002). Lo impone
  `tests/inventario.test.mjs`.
- "Almacén" y "stock mínimo" se usan con el significado del glosario de empresa
  (`emba-empresa:consultar-brain`).

## Cómo se verifica

- Pruebas: `npm test` (equivale a `node --test`).
- Brain del proyecto: `/emba-harness:verificar`.

## Flujo

Propuesta (`/emba-harness:proponer-cambio`) → aprobación → prueba que falla → implementación →
`/emba-harness:verificar` → `/emba-harness:revisar` → PR.
