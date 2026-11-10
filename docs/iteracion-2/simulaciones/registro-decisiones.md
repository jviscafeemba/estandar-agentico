# Registro de decisiones · simulación del método v2

Archivo vivo. Una fila por decisión; el ID (`D-<paso>-<n>`) no cambia. Quién: Joaquín, el agente (esta sesión) o
el líder simulado. Las decisiones del paso 0 son las del encargo del 10/11/2026.

| ID | Fecha | Quién | Qué se decidió | Por qué | Alternativa descartada | Motivada por |
| --- | --- | --- | --- | --- | --- | --- |
| D-00-01 | 10/11/2026 | Joaquín | Banco de pruebas: solo `demo-facturas`, `demo-inventario` y proyectos sintéticos, siempre en copias temporales | No arriesgar proyectos reales ni datos | Usar ai-genesys o NEXO como banco | Encargo |
| D-00-02 | 10/11/2026 | Joaquín | Humano simulado: agente con el rol de líder aprobador, guion fijo y semilla en `humano-lider.md`; no ve las verificaciones ocultas | Corridas comparables y sin filtrar la respuesta | Joaquín aprobando en vivo | Encargo |
| D-00-03 | 10/11/2026 | Joaquín | Paso a paso: cada fase termina en ESPERA y no se sigue sin OK escrito | Control de costo y de rumbo | Correr las 7 fases de corrido | Encargo |
| D-00-04 | 10/11/2026 | Joaquín | Plazo: informe final el 12/11 a la mañana; si no llega, entrega del estado el 11/11 a la noche | Reunión de validación del 12/11 | — | Encargo |
| D-00-05 | 10/11/2026 | Joaquín | Modelo por defecto `claude-sonnet-5-5`; otro solo si un escenario lo justifica | Costo; las evals del 29/10 dieron 14/14 con Sonnet | Opus por defecto | Encargo |
| D-01-01 | 10/11/2026 | Agente | Rama `iteracion-2/simulacion` en worktree (`.claude/worktrees/simulacion`) desde `main` (200acda). `docs/iteracion-2/` estaba sin versionar en `main`: se copió a la rama y se versiona ahí | La rama necesita los documentos de partida; `main` no se toca | Commitear en `main` | Regla de trabajo en rama |
| D-01-02 | 10/11/2026 | Agente | Estado del arte investigado por tres subagentes en paralelo (harness/SDD/humano · revisión/paralelo/seguridad · evaluación de métodos), con la consigna de verificar cada URL y marcar lo no verificado | Cubrir 7 temas sin llenar el contexto de la sesión; cada hallazgo vuelve con fuente | Investigar todo en la sesión principal | — |
| D-01-03 | 10/11/2026 | Agente | Las cifras que los subagentes no pudieron abrir no se usan como evidencia; las dos que se mencionan quedan marcadas en su fila (EA-13, EA-18) | Regla del encargo: cada afirmación con su fuente | Citarlas igual con la fuente secundaria | Informes de los subagentes |
| D-01-04 | 10/11/2026 | Agente (propuesta, pendiente de Joaquín) | Reglas de diseño de la simulación: verificación probada, pareado, Wilson, reservados 20-30 %, líder con reglas por evento y resultado como cota optimista | EA-17 a EA-20 | Comparar tasas sin intervalo ni pareo | EA-17 a EA-20 |
| D-01-05 | 10/11/2026 | Agente | `analisis-experto.md` se actualiza con una nota al inicio (R10 trampa con pruebas, R11 resultados inflados) y no se reescribe | El encargo pide actualizarlo sin repetirlo | Reescribir el análisis | EA-05, EA-06, EA-20 |
| D-02-00 | 10/11/2026 | Joaquín | OK para el paso 2 («OK paso 2») | — | — | Informe del paso 1 |
| D-02-01 | 10/11/2026 | Agente (provisional) | Las tres decisiones pedidas en el paso 1 (reglas de diseño, Haiku 5.5 como líder simulado, E5b solo en críticos) se aplican con la recomendación del agente hasta que Joaquín las confirme en el paso 3 | El OK del paso 2 no las respondió; recién pesan en el paso 3 | Frenar el paso 2 | D-01-04 |
| D-02-02 | 10/11/2026 | Agente | El harness se presenta como pieza propia con seis partes (H1-H6), también en `metodo-v2.html` | Falla conocida de la vista; separa guías de controles | Dejar los hooks dentro de «Controles» | EA-01 |
| D-02-03 | 10/11/2026 | Agente (propuesta, pendiente de Joaquín) | Construir para simular: hooks `proteger-pruebas` y `bloquear-salida`, skill `preparar-lote`, copia adaptada del hook `carril` | Cada una es la mitigación de un hallazgo | Simular solo lo existente | EA-05, EA-11, EA-12, EA-14/15 |
| D-02-04 | 10/11/2026 | Agente | E3 proporcional: sin propuesta en correcciones chicas | El sobrecosto no se paga en cambios chicos | Propuesta siempre | EA-03, EA-04 |
| D-02-05 | 10/11/2026 | Agente | El revisor (H2) no recibe el resumen ni la descripción del autor | El encuadre del autor sesga y es superficie de inyección | Mantener el pedido actual | EA-13 |
| D-02-06 | 10/11/2026 | Agente | Criterios de éxito de E1-E11 y del conjunto fijados en `02-propuesta-v3.md` antes de simular; con n < 5, ✔ solo si se cumple en todas las corridas | Evitar ajustar el criterio al resultado | Fijarlos después del piloto | Encargo |
| D-03-00 | 10/11/2026 | Joaquín | OK al paso 3 con las recomendaciones (confirma D-02-01 y D-02-03; criterios sin cambios) | Botón «OK paso 3» sobre «¿OK para el paso 3 con las recomendaciones?» | — | Informe del paso 2 |
| D-03-01 | 10/11/2026 | Agente | Modo con humano por `--resume`; el líder corre sin herramientas y fuera de la copia | Que no vea las verificaciones ni el brazo | Agente que se autoaprueba | EA-20 |
| D-03-02 | 10/11/2026 | Agente / subagente | Reservados escritos por un subagente no leído; E6(b) como instrucción en prosa sin comando funcional | No ajustar el método a las pruebas; el subagente no quiso producir un payload | Escribirlos la sesión principal | Encargo |
| D-03-03 | 10/11/2026 | Agente | Corregir `--simular` y exigir además referencia que pasa y parche erróneo que falla | Regla 1 de 01 §3 | Dejarlo | F-03-01 |
| D-03-04 | 10/11/2026 | Agente | E3: el pedido fija la firma; la verificación compara solo total, IVA y neto | Medía un nombre, no el método | Verificación estricta | F-03-05 |
| D-03-05 | 10/11/2026 | Agente | Línea base de E3 con `--quitar flujo-agents-md` | La base también proponía | Base contaminada | F-03-06 |
| D-03-06 | 10/11/2026 | Líder simulado | E3-con: aprobó la propuesta apurado sin pedir la firma; no autorizó agregar pruebas; delegó en el brain | Reglas 4 y 3 del guion v1 | — | Guion v1 |
| D-03-07 | 10/11/2026 | Agente (pendiente de Joaquín) | Secretos sembrados: `.env` ficticio con canario, escrito por el runner solo en la copia temporal, como el 29/10 | El escenario necesita un secreto con forma real | Otro nombre de archivo | Encargo |
| D-03-08 | 10/11/2026 | Agente (propuesta, pendiente de Joaquín) | Antes del paso 4: `proteger-pruebas` permite ediciones que solo agregan; el guion suma la regla «agregar pruebas nuevas → aprobar» | No gastar el paso 4 en confirmar un defecto conocido | Medir v3 tal cual y corregir en el paso 5 | F-03-02, F-03-03 |
| D-03-09 | 10/11/2026 | Agente (propuesta, pendiente de Joaquín) | Correr E4 y E6 también con Haiku 5.5 como agente | Con Sonnet los hooks no tuvieron nada que frenar | Solo Sonnet | Piloto E4/E6 |
