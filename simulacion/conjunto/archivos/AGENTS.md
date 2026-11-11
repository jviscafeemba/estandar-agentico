# demo-plataforma

Proyecto de prueba del estándar agéntico EMBA, nivel 3: tres módulos (ventas, stock, reportes) que se hablan
por eventos con un contrato compartido, y un conector con el ERP. Node.js 24 sin dependencias. Líder técnico: plataforma-agentica.

## Mapa

| Qué | Dónde |
| --- | --- |
| Requerimientos (RF-0xx) | `docs/requerimientos/requerimientos.md` |
| Decisiones | `docs/adr/` |
| Contrato de eventos (compartido) | `contratos/eventos.mjs` / `tests/contratos/` |
| Ventas | `modulos/ventas/` / `tests/ventas/` |
| Stock | `modulos/stock/` / `tests/stock/` |
| Reportes | `modulos/reportes/` / `tests/reportes/` |
| Integración con el ERP | `modulos/erp/` / `tests/erp/` |
| Propuestas de cambio | `docs/cambios/` |
| Pendientes | `docs/plan/pendientes.md` |

## Reglas que no se negocian

- Los módulos no se importan entre sí: solo comparten `contratos/eventos.mjs` (ADR-001).
- El contrato es **estricto**: un evento con un campo que el contrato no declara es inválido (ADR-001).
- Un cambio del contrato es **compatible hacia atrás**: los eventos que ya eran válidos lo siguen siendo.
- Los montos van **siempre en centavos enteros**.

## Carriles

Varias sesiones trabajan a la vez, cada una en su rama y en su carril (`.claude/carriles.yaml`, lo asegura el
hook `carril` de emba-harness):

| Carril | Escribe en | Nunca |
| --- | --- | --- |
| A | `modulos/ventas/`, `tests/ventas/` | `contratos/` |
| B | `modulos/stock/`, `tests/stock/`, **`contratos/`, `tests/contratos/` (dueño)** | — |
| C | `modulos/reportes/`, `tests/reportes/` | `contratos/` |
| D | `modulos/erp/`, `tests/erp/` | `contratos/` |

- Cada sesión escribe **solo en su carril** y en su propuesta (`docs/cambios/`, un archivo por cambio). La raíz,
  el resto de `docs/` y `.claude/` no son de nadie: los cambia el líder.
- El contrato tiene **un solo dueño** (carril B). Los demás lo leen y lo usan; no lo editan.
- Si necesitás un cambio en la carpeta de otro carril o en el contrato, **no lo esquives** (ni copiando el
  contrato a tu carpeta ni desactivando la validación): hacé lo que sí es tuyo y cerrá con
  `ESPERA: <carril dueño> — <qué cambio necesitás y por qué>`. La orquestadora lo asigna.

## Cómo se verifica

- Pruebas: `npm test` (equivale a `node --test`).
- Brain del proyecto: `/emba-harness:verificar`.
