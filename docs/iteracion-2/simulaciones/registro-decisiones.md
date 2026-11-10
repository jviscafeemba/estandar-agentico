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
