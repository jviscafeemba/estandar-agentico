# Segunda iteración del Método de Desarrollo agéntico: propuesta de alcance

Tarea de ClickUp «Segunda iteración del Método de Desarrollo» (#86e3zabcb, hija de «AI Factory»), vence el
**13/11/2026**. Redactada el 09/11/2026.

**Objetivo acordado:** el viernes 13/11 el método está **definido, probado y validado** por quienes asignaron la
tarea. Después, el equipo lo adopta **de a poco**. Se valida con la evidencia de las pruebas en la mesa, no antes; la
adopción va por olas (§4).

## 1. Dónde quedó la iteración 1

**Qué hay** (repo `jviscafeemba/estandar-agentico`, último cambio el 30/10/2026):
- `emba-brain` (plugin `emba-empresa`): 5 estándares, glosario, mapa de sistemas, clasificación de datos,
  ADR-E001/E002 y 1 lección (L-001). Todo con `revisado: 2026-10-29`.
- `emba-harness` 0.2.0: skills `proponer-cambio`, `verificar`, `revisar`, `cerrar-fase`, `nuevo-proyecto`; agente
  `revisor`; hooks de secretos, comandos y métricas, con pruebas; scripts `verificar-proyecto`, `lint-brain`,
  `metricas`, evals; plantillas (`AGENTS.md`, `settings.json`, `ci.yml`).
- Evidencia: evals del 29/10 (harness 21/21; revisor 10/10), propuesta en Word, presentación y guion de demo.

**Qué se usa de verdad** (ai-genesys, Fase 0 del 06/11 al 09/11, 20 PR unidos en carriles A–G):
- Los dos plugins, habilitados en `.claude/settings.json` y en las 11 copias de trabajo de los carriles.
- `verificar-proyecto` como compuerta «brain» de N1 y del nocturno, con el harness fijado por SHA (`200acda`).
- La revisión independiente en contexto fresco: citada en 16 de los 17 cambios archivados de OpenSpec.
- `AGENTS.md` ≤ 150 líneas que enlaza a `emba-brain/seguridad-datos/clasificacion.md`, y la regla de `.env*`/`secrets/`.

**Qué no se usa todavía:** `proponer-cambio` (lo reemplazó OpenSpec, ADR-002 de ai-genesys), `cerrar-fase`
(ninguna lección subió), `metricas` (no hay `.emba/` en ai-genesys), la política administrada (no instalada), las
evals (no se corrieron desde el 29/10). NEXO y GASTOS no usan los plugins.

## 2. Brechas, con evidencia

| # | Brecha | Evidencia |
| --- | --- | --- |
| B0 | **No hay un documento único del método para el equipo:** está repartido entre el estándar, NEXO, ai-genesys y el método personal de Joaquín, y en algunos puntos se contradicen | `estandares/flujo-de-trabajo.md`; `nexo-emba/docs/proceso/sesiones.md`; ai-genesys `AGENTS.md`; `PROPUESTA-METODOLOGIA.md` |
| B1 | El estándar no se puede instalar en otra PC: el marketplace es `directory` con la ruta de Joaquín; el `Makefile` busca el harness en `../../poc-agentico` | DWH-32; `ai-genesys/.claude/settings.json`; `ai-genesys/Makefile` (`EMBA_HARNESS`); `emba-harness/plantillas/settings.json` |
| B2 | `verificar-proyecto` solo entiende `docs/requerimientos` con `RF-xxx`; en ai-genesys la trazabilidad real (`FIN-R01`, `Verificado por:`) la hace un chequeo propio | `verificar-proyecto.mjs` l. 35-54; ai-genesys ADR-002 §5, DWH-42 |
| B3 | El flujo del estándar (`docs/cambios/` + `proponer-cambio`) y el de ai-genesys (OpenSpec, borrador 48 h, aprobación en lote) divergen; el estándar no dice cuál vale ni cuándo | `estandares/flujo-de-trabajo.md`; ai-genesys `AGENTS.md`, `PLAN.md` §7.3 |
| B4 | `sistemas/mapa.md` es un ejemplo inventado (ERP, demo-facturas); faltan SAP B1, Time Manager, Salar, DWH, NEXO, Gastos | DWH-09; `emba-brain/sistemas/mapa.md` |
| B5 | `emba-brain` sin revisión desde el 29/10 y sin cola de lecciones viva: L-01 a L-04 de `_brain` y lo aprendido en ai-genesys no subieron | `INDICE.md` (`revisado: 2026-10-29`); `_brain/lecciones.md`; `emba-brain/lecciones/README.md` (solo L-001) |
| B6 | ai-genesys inventó y probó cosas que el estándar no tiene: carriles con hook (`carriles.yaml`, `carril.mjs` con pruebas), gemelo sintético + oráculo, imagen saneada tras un incidente de datos reales, CI por áreas en un solo job a costo cero, N0–N3 | `.claude/carriles.yaml`; DWH-37, DWH-44; `.github/workflows/ci.yml`; `PLAN.md` §7.4, §8 |
| B7 | El trabajo con sesiones en paralelo (orquestadora, brief, cierre de una línea, candado, lote) vive solo en NEXO y en el método de Joaquín | `nexo-emba/docs/proceso/sesiones.md`; `PROPUESTA-METODOLOGIA.md` §6; `_brain/plantillas/brief-sesion.md` |
| B8 | Seguimiento de tareas (`pendientes.md` con ID), niveles de proyecto (1/2/3) y reporte de horas (`/reporte`, Clockify + ClickUp) existen solo en el `_brain` de Joaquín | `PROPUESTA-METODOLOGIA.md` §4-5; `~/.claude/skills/{dia,cierre,pendiente,reporte}`; `avance/README.md` |
| B9 | El propio estándar no tiene pendientes ni dueño nombrado («plataforma-agentica»), y vive en un repo personal | `_brain/portafolio.md` («por crear»); ADR-E001, Consecuencias |

## 3. Para el viernes 13/11: método definido, probado y validado (≈ 21 h)

### 3a. Definir

| ID | Entregable verificable | Cierra | h |
| --- | --- | --- | --- |
| V1 | **El método en un documento** (`emba-brain/estandares/metodo-de-desarrollo.md`, ≤ 2 páginas). Cubre: niveles de proyecto 1/2/3 y qué exige cada uno; el flujo propuesta → prueba → verificar → revisión independiente → PR → cierre; OpenSpec para el nivel 3; sesiones en paralelo y carriles; seguimiento (`pendientes.md` con ID, ClickUp); qué es obligatorio y qué es opcional. Cada regla enlaza a su origen (NEXO, ai-genesys, evals). **Prueba:** `lint-brain` en verde; `flujo-de-trabajo.md` sin contradicciones con el documento | B0, B3, B7, B8 | 5 |
| V2 | **Decisiones a validar**, como ADR en estado `propuesta`: E003 niveles de proyecto + OpenSpec en el nivel 3; E004 sesiones en paralelo y carriles; E005 datos sintéticos (gemelo, oráculo, imagen saneada; fuente: DWH-37) | B3, B6 | 2 |
| V3 | **Brain al día:** `sistemas/mapa.md` con los sistemas reales (cierra DWH-09); lecciones L-01 a L-04 y 3 de ai-genesys subidas como candidatas; `INDICE.md` revisado | B4, B5 | 3 |
| V4 | **Instalable por otra persona:** marketplace con `source` en GitHub, plantilla `settings.json` sin ruta fija y `EMBA_HARNESS` configurable (cierra DWH-32). **Prueba:** clon limpio en otro usuario o PC; `/plugin` muestra los dos plugins | B1 | 2,5 |

### 3b. Probar: tres pruebas, de la más barata a la más exigente

| ID | Prueba | Qué demuestra | Evidencia | h |
| --- | --- | --- | --- | --- |
| P1 | **Automática:** `node verificar-todo.mjs` en verde y evals de regresión del harness (21 tareas + revisor) comparadas con el 29/10 | Que los cambios de la semana no rompieron nada | Salida de los comandos y `comparar-evals` en `docs/iteracion-2/pruebas.md` | 1,5 + ≈ 10 USD |
| P2 | **En un proyecto real:** cada regla del método contra lo que pasó en la Fase 0 de ai-genesys | Que el método ya funcionó en un proyecto de nivel 3 (20 PR, revisión independiente, carriles, incidente DWH-37 contenido) | Tabla regla → PR o archivo que la prueba; las reglas sin evidencia quedan marcadas como «a probar» | 2 |
| P3 | **Con otra persona:** un compañero instala desde cero en su PC y hace un cambio chico real de nivel 2 (por ejemplo en GASTOS) siguiendo solo el documento. Joaquín observa sin ayudar | Que se entiende y se instala sin Joaquín: la condición para que lo use todo el equipo | Tiempo de instalación, PR resultante y tropiezos; cada tropiezo se corrige en el documento antes de la reunión | 3 + 2-3 del compañero |

### 3c. Validar

| ID | Entregable verificable | Cierra | h |
| --- | --- | --- | --- |
| V5 | **Validación:** resumen de 1 página con los resultados de P1-P3 y una reunión de 1 h el **jueves 12/11** con quienes validan. Las observaciones quedan en un acta (`docs/iteracion-2/validacion.md`) y se aplican el viernes. Con el OK, los ADR pasan a `aceptada` y el método a `vigente`. **Prueba:** acta con el OK y la fecha | — | 2,5 |

### 3d. Calendario

| Día | Qué |
| --- | --- |
| Lun 09/11 | Acordar el alcance; confirmar quiénes validan, la reunión del jueves y el compañero de P3 |
| Mar 10/11 | V1 método, V2 ADR, V4 instalable; P1 automática (lo que tarda queda corriendo) |
| Mié 11/11 | V3 brain; P2 contra ai-genesys; P3 con el compañero (tarde) |
| Jue 12/11 | Corregir los tropiezos de P3; resumen; reunión de validación |
| Vie 13/11 | Aplicar observaciones, acta, ADR aceptados, cerrar la tarea en ClickUp |

**Riesgos.** Son ≈ 21 h en 5 días, en paralelo con ai-genesys. Si no alcanza, se recorta primero V3 (las lecciones;
el mapa se queda) y después las evals de P1. P3 no se recorta: es la prueba que pide «lo va a usar todo el equipo».
Si la reunión no puede ser el jueves, el viernes se entrega el método probado con la fecha de validación acordada.

## 4. Después del viernes: adopción por olas

| Ola | Cuándo | Entregable verificable | h |
| --- | --- | --- | --- |
| 1 · Herramientas al día | 16/11–27/11 | `emba-harness` 0.3: `verificar-proyecto` reconoce OpenSpec (B2); hook de carriles opcional con sus pruebas; plantillas de `pendientes.md`, brief de sesión y `ci.yml` de un solo job; `nuevo-proyecto` pregunta el nivel; evals de regresión de la 0.3 | 11 |
| 2 · Piloto | diciembre | Una segunda persona o proyecto (GASTOS, nivel 2) adopta el método en menos de 1 día; guía de incorporación de 1 página; métricas de uso con `metricas.mjs`; lo aprendido vuelve como lecciones | 8 + horas del piloto |
| 3 · Todo el equipo | enero 2027 | Repo de la organización con `main` protegido, `CODEOWNERS` y dueño nombrado; plugin `emba-equipo` con `/dia`, `/cierre`, `/pendiente` y `/reporte` (claves de Clockify y ClickUp por persona, nunca en el repo); propuesta a TI de la política administrada | 14 + TI |

## 5. Fuera de alcance del viernes

- Código del harness, salvo lo necesario para instalarlo (V4). La versión 0.3 va en la ola 1.
- Adopción por otras personas más allá de la prueba P3 (olas 2 y 3).
- Pasar NEXO al harness o cambiar su proceso: funciona; solo se toman sus reglas.
- Instalar la política administrada en las PCs.
- La «plantilla de repo para EMBA» de ai-genesys (capacidad 11, Fase 6), una plataforma RAG (descartada en
  ADR-E001) y otros agentes (Copilot, Cursor).

## 6. Preguntas para quien asignó la tarea

1. ¿Quiénes validan y pueden reunirse 1 h el jueves 12/11? ¿Qué cuenta como «validado»: el OK en la reunión o la tarea aprobada en ClickUp?
2. ¿Qué compañero puede dedicar 2-3 h el miércoles 11/11 a la prueba P3, y en qué proyecto?
3. ¿El seguimiento de tareas y el registro de horas (ClickUp + Clockify) son parte del método del equipo o quedan como práctica personal?
4. ¿OpenSpec pasa a ser obligatorio en los proyectos de nivel 3?
5. ¿Dónde vive el estándar (el repo personal actual o uno de la organización) y quién es su dueño cuando lo use todo el equipo?

## 7. Borrador de subtareas para ClickUp (no creadas)

- V1 · Documento único del método de desarrollo (niveles, flujo, sesiones, seguimiento) · 5 h · 11/11
- V2 · ADR E003-E005 en estado propuesta para validar · 2 h · 11/11
- V3 · Mapa de sistemas real, lecciones subidas y revisión del brain (cierra DWH-09) · 3 h · 11/11
- V4 · Marketplace emba-local instalable desde Git (cierra DWH-32) · 2,5 h · 12/11
- P1 · Prueba automática: verificar-todo y evals de regresión · 1,5 h · 10/11–12/11
- P2 · Prueba en proyecto real: reglas del método contra la Fase 0 de ai-genesys · 2 h · 11/11
- P3 · Prueba con un compañero: instalación desde cero y un cambio real · 3 h · 11/11
- V5 · Resumen con resultados, reunión de validación y acta con el OK · 2,5 h · 12/11–13/11
- O1 · Ola 1: emba-harness 0.3, plantillas y evals de regresión · 11 h · 27/11
- O2 · Ola 2: piloto con una segunda persona o proyecto y guía de incorporación · 8 h · diciembre
- O3 · Ola 3: repo de la organización, plugin emba-equipo y política administrada · 14 h · enero 2027
