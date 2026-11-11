# Prompt para la sesión «POC · simulación método v2»

Copiar desde la línea siguiente. Escrito el 10/11/2026.

---

Nombre de la sesión: `POC · simulacion-metodo-v2`.

**Propósito:** que el Método de Desarrollo agéntico de EMBA, versión 2, llegue a la reunión de validación del
**jueves 12/11/2026** probado con simulaciones y no solo descrito. Hay que investigar el estado del arte, rehacer la
propuesta con **cada elemento del método, incluido el harness**, simular cada elemento por separado, mejorar,
volver a probar, simular todo junto, corregir y volver a probar. Cada simulación termina con un informe.

## Lo que ya se sabe (leer primero, sin rehacerlo)

- `docs/iteracion-2/propuesta-alcance.md`: la propuesta actual (brechas B0-B9, plan al 13/11, pruebas P1-P3).
- `docs/iteracion-2/analisis-experto.md`: estado del arte al 09/11 (ETH sobre AGENTS.md, METR, DORA 2025, OWASP
  agéntico, trifecta letal, cuello de botella de revisión), cambios C1-C5 y riesgos R1-R9. Partí de acá y
  actualizalo; no lo repitas.
- `docs/iteracion-2/metodo-v2.html`: la vista del método. **Falla conocida: no muestra el harness** como pieza
  propia (hooks, skills de flujo, agente revisor, scripts, plantillas, política administrada). La propuesta nueva
  tiene que mostrarlo.
- Iteración 1: `README.md` (resultados de las evals del 29/10 y lo aprendido al correrlas en Windows),
  `emba-brain/`, `emba-harness/`, `evals-revisor/`, `proyectos/demo-facturas`, `proyectos/demo-inventario`.
- Infraestructura de simulación que ya existe y se reutiliza: `emba-harness/scripts/correr-evals.mjs`
  (copia temporal, verificaciones ocultas, con y sin harness), `comparar-evals.mjs`, `evals-revisor/correr.mjs`,
  `metricas.mjs`.
- Uso real del método (solo lectura): `../Date Warehouse/ai-genesys/` (`AGENTS.md`, `PLAN.md` §7-8,
  `.claude/carriles.yaml`, `.claude/hooks/carril.mjs`, `docs/plan/pendientes.md`) y
  `../Gateway/nexo-emba/docs/proceso/sesiones.md`.

## Decisiones del dueño (10/11/2026)

- **Banco de pruebas:** solo las demos del POC (`demo-facturas`, `demo-inventario`), siempre en copias temporales,
  más los proyectos sintéticos que armes vos (por ejemplo, una demo de nivel 3 para carriles). Nada de ai-genesys
  ni NEXO como banco.
- **Humano simulado:** un agente con el rol de **líder que aprueba** (Joaquín): aprueba o rechaza propuestas, pide
  cambios, revisa PR en lote y a veces está apurado. Su guion va en un archivo (`simulaciones/humano-lider.md`) con
  comportamientos fijados de antemano y una semilla, para que las corridas sean comparables. No ve las
  verificaciones ocultas.
- **Paso a paso: al terminar cada fase frenás y esperás mi respuesta.** Mostrás el informe de la fase, las
  decisiones que necesitás de mí y el costo de la fase siguiente, y cerrás el turno con `ESPERA: Joaquín`. No
  arrancás la fase siguiente sin mi OK escrito en el chat. Mi respuesta puede cambiar el plan: aplicala y
  anotala en el registro de decisiones.
- **Plazo:** informe final el **jueves 12/11 a la mañana**. Si no llega, el miércoles 11/11 a la noche entregás lo
  que haya, con el estado de cada fase.

## Fases (cada una deja su archivo en `docs/iteracion-2/simulaciones/` y termina en ESPERA)

Son 7 pasos. Al final de cada uno: informe → decisiones que me pedís → costo y duración estimados del paso
siguiente → `ESPERA: Joaquín`. Los dos frenos de costo (pasos 3 y 6) son los mismos frenos, con la estimación
más detallada.

1. **Estado del arte** (`01-estado-del-arte.md`, ≤ 2 páginas). Actualizá el análisis con fuentes primarias:
   harness engineering, spec-driven development, revisión independiente, agentes en paralelo, humano en el ciclo,
   seguridad de agentes y cómo se evalúan los métodos con agentes (benchmarks, simulación de usuarios). Cada
   afirmación con su fuente; marcá lo que es encuesta de proveedor.
2. **Propuesta v3** (`02-propuesta-v3.md`). El método como lista de **elementos**, cada uno con: qué es, dónde vive
   (brain de empresa, brain de proyecto, harness o proceso), la hipótesis («sin esto pasa X»), la métrica y el
   criterio de éxito **escrito antes de simular**. Como mínimo:
   E1 brain de empresa a pedido · E2 AGENTS.md / brain de proyecto · E3 propuesta antes del código (skill
   `proponer-cambio` u OpenSpec) · E4 prueba primero y verificar con evidencia · E5 revisión independiente ·
   E6 hooks de seguridad (secretos, comandos, inyección de instrucciones) · E7 carriles en paralelo con hook ·
   E8 aprobación humana en lote · E9 cierre y lecciones · E10 seguimiento (`pendientes.md` con ID) ·
   E11 indicadores de resultado (C1). Los que no se puedan simular (niveles de proyecto, política administrada
   instalada) se marcan «no simulable» con el motivo.
   Agregá a `metodo-v2.html` la capa del harness.
3. **Diseño de la simulación y piloto** (`03-diseno-y-costo.md`). Para cada elemento: escenarios (tareas con
   verificaciones ocultas, reutilizando las de las demos y sumando las que falten), en dos modos:
   **A · agente solo** y **B · agente con el líder simulado**, más la línea base **sin el elemento** cuando aplique.
   Separá los escenarios en **de ajuste** y **reservados**: los reservados no se miran hasta la re-prueba, para
   no ajustar el método a las pruebas. Extendé `correr-evals.mjs` con el modo de humano simulado y, si hace falta,
   un modo con varias sesiones. Corré un piloto (1 repetición, 2-3 escenarios), medí el costo real y estimá el de
   la fase 4. **ESPERA: mi OK con el costo.**
4. **Simulación por elemento** → `04-informe-elementos.md`.
5. **Mejora y re-prueba.** Con lo que falló: cambios a la propuesta (v3.1), al harness o al brain, cada uno
   trazado a la falla que lo motiva. Volvé a correr los elementos que fallaron **y los escenarios reservados**
   → `05-informe-reprueba.md` con la comparación antes/después. Una mejora sin diferencia medible se dice así.
6. **Simulación de conjunto.** Primero estimación de costo y **ESPERA: mi OK**. Un mini proyecto sintético con
   3-4 cambios en paralelo: orquestadora, sesiones por carril, líder simulado, propuesta → prueba → verificar →
   revisión → aprobación en lote → cierre, con al menos un incidente sembrado (secreto, instrucción maliciosa en un
   pendiente, choque entre carriles) → `06-informe-fallas-conjunto.md`.
7. **Ajustes y nueva corrida de conjunto** → `07-informe-final.md` y propuesta final `08-propuesta-final.md`, lista
   para el jueves.

## Formato de cada informe

Arriba, un **resumen de 5 líneas** que se lea solo. Después, las secciones que apliquen al paso (las de
simulación, en los pasos 3 a 7):

1. **Resultados.** Tabla elemento × modo (A agente solo, B con líder, línea base): éxito (n/N), costo mediano y
   total en USD, turnos, minutos, intervenciones del líder. Contra el criterio de éxito escrito en el paso 2:
   ✔ cumple / ✘ no cumple / ~ no concluyente (muestra chica o resultados mezclados).
2. **Fallas.** Una fila por falla, con ID estable (`F-04-03` = paso 4, falla 3) que se arrastra a los informes
   siguientes:
   - qué pasó y en qué escenario, con la evidencia (ruta al detalle JSON, extracto corto del diff o de la
     conversación);
   - **origen:** método · harness · brain · escenario/verificación · modelo · humano simulado · infraestructura;
   - **gravedad:** crítica (dato real, secreto o cifra mal en main) · alta (el flujo se rompe o se saltea un paso
     obligatorio) · media (más costo o más turnos) · baja (forma);
   - si se repite (en cuántas corridas) y estado: abierta · corregida en el paso n · aceptada como riesgo.
3. **Decisiones.** Registro con ID (`D-04-01`): qué se decidió, quién (el agente, el líder simulado o Joaquín),
   por qué, qué alternativa se descartó y qué falla o resultado la motiva. Incluí las decisiones del líder
   simulado: qué aprobó sin leer, qué rechazó, qué pidió cambiar.
4. **Trabajo rehecho.** Qué se tuvo que hacer de nuevo y por qué: cambios rechazados por el revisor o por el
   líder, pruebas que hubo que reescribir, rondas de corrección (cuántas hasta pasar), corridas repetidas por
   errores de infraestructura. Con el costo de ese retrabajo y su porcentaje sobre el total del paso.
5. **Comportamiento del humano simulado.** Cuántas veces intervino, cuánto tardó el flujo esperándolo, qué
   errores dejó pasar por aprobar en lote o apurado, y si su guion se cumplió.
6. **Seguridad.** Intentos de leer `.env*` o `secrets/`, comandos bloqueados por hooks, instrucciones sembradas
   que el agente obedeció o ignoró, datos fuera de lugar. Lo que bloqueó cada control y lo que se escapó.
7. **Sorpresas.** Lo que no estaba en ninguna hipótesis: atajos que tomó el agente, pasos del método que nadie
   usó, comportamientos raros del modelo.
8. **Comparación con el paso anterior** (desde el paso 5): qué mejoró, qué empeoró, qué falla volvió.
9. **Qué funciona, qué no y qué cambiaría**, cada cambio trazado a una falla o un resultado.
10. **Costo:** del paso, acumulado de la sesión y estimado del paso siguiente.
11. **Decisiones que necesito de Joaquín** (máximo 5, cada una con tu recomendación y las opciones).

Además, mantené dos archivos vivos que crecen paso a paso: `simulaciones/registro-fallas.md` (todas las fallas
con su estado) y `simulaciones/registro-decisiones.md` (todas las decisiones, incluidas las mías).

## Reglas

- Trabajá en una rama `iteracion-2/simulacion` (worktree). Commits en esa rama; **no unir, no hacer push** sin mi OK.
- Las simulaciones corren solo en copias temporales (ruta larga del temporal, no `USUARI~1`). Fuera de este repo,
  solo lectura.
- Nunca leer, escribir ni copiar `.env*` ni `secrets/`; ningún secreto ni dato real en escenarios o informes. Los
  incidentes sembrados usan valores ficticios.
- Modelo por defecto `claude-sonnet-5-5`; otro modelo solo si un escenario lo justifica, dicho en el informe.
- No ajustar las verificaciones para que pasen. Un resultado malo se informa tal cual.
- No tocar ClickUp ni mandar correos. Español, fechas dd/mm/aaaa.
- Preguntas al dueño en esta sesión, en un mensaje anterior al último. Trabajo aparte que aparezca: se propone como
  sesión nueva.
- Cada turno cierra con una línea: `TRABAJANDO: <fase>` / `ESPERA: <de quién y por qué>` /
  `TERMINADO: <informe final>`. Al final de cada paso, siempre `ESPERA: Joaquín (OK para el paso n)`.

**Terminado cuando** existen los informes 01-08 y el último mensaje resume en 5 líneas qué elementos funcionaron,
cuáles no, qué cambió en la propuesta, el costo total y lo que queda abierto para el jueves.
