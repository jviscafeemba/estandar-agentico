# demo-facturas

Proyecto de prueba del estándar agéntico EMBA: calcula y emite facturas a partir de líneas de venta.
Node.js 24 sin dependencias. Líder técnico: plataforma-agentica.

## Mapa

| Qué | Dónde |
| --- | --- |
| Requerimientos (RF-0xx) | `docs/requerimientos/requerimientos.md` |
| Decisiones | `docs/adr/` |
| Comportamiento esperado | `docs/specs/facturacion.md` |
| Propuestas de cambio | `docs/cambios/` |
| Operación | `RUNBOOK.md` |
| Código / pruebas | `src/factura.mjs` / `tests/factura.test.mjs` |
| Tareas de evaluación del harness | `evals/tareas.json` (no modificar al resolver una tarea) |

## Reglas que no se negocian

- Los montos se manejan **siempre en centavos enteros**; nunca `number` con decimales (ADR-001).
- El IVA de 13 % va **incluido** en el precio: no se suma al total, se informa (RF-002).
- Una factura emitida **nunca se modifica ni se borra**. Se corrige anulándola con un motivo y emitiendo
  otra (ADR-002, RF-003, RF-005). La impone `tests/factura.test.mjs` (objeto congelado).
- Los montos que ve una persona se formatean con `formatearBs` (`1.234,50 Bs`).

## Cómo se verifica

- Pruebas: `npm test` (equivale a `node --test`).
- Brain del proyecto: `/emba-harness:verificar`.

## Flujo

Propuesta (`/emba-harness:proponer-cambio`) → aprobación → prueba que falla → implementación →
`/emba-harness:verificar` → `/emba-harness:revisar` → PR. Glosario, sistemas y estándares de la empresa:
skill `emba-empresa:consultar-brain`.
