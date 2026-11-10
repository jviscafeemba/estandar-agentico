# Método v2: contraste con el estado del arte, cambios sugeridos y riesgos

Revisión de [`propuesta-alcance.md`](propuesta-alcance.md) y [`metodo-v2.html`](metodo-v2.html), escrita el
09/11/2026 desde el punto de vista de un especialista en desarrollo con agentes. Las fuentes están al final. Casi
todas son de 2025-2026. Las cifras de encuestas de proveedores son indicativas.

> **Actualización del 10/11/2026** ([`simulaciones/01-estado-del-arte.md`](simulaciones/01-estado-del-arte.md),
> hallazgos EA-01 a EA-20). Refuerza R2 (aprobación de rutina: 93-97 % de aprobación, EA-12) y R4 (inyección:
> *Comment and Control* y evasiones reales de reglas `deny`, EA-14/15). Matiza C3: además de cuándo se lee el diff,
> el humano debe aprobar menos cosas y de más impacto. Suma dos riesgos:
> **R10 · trampa con las pruebas** (el agente edita las pruebas para pasar; pedirle que no lo haga no sirve, EA-05/06;
> mitigación: pruebas de solo lectura por hook y verificación por script) y **R11 · resultados inflados en la
> simulación** (el líder simulado es más cooperativo que una persona, EA-20; mitigación: guion con reglas por evento y
> resultados informados como cota optimista).

## 1. Veredicto

El núcleo del método está alineado con lo que hoy funciona: contexto corto escrito por personas, especificación
antes del código, revisión independiente, controles que no dependen del modelo y agentes en paralelo aislados por
carpeta. **Hay cuatro huecos que conviene cerrar antes de validarlo el jueves:**
1. Mide el proceso, no el resultado.
2. La revisión humana va a ser el cuello de botella.
3. La seguridad depende de listas de bloqueo y de un repo personal.
4. Una prueba con una sola persona no alcanza para decir que el método sirve para el equipo.

## 2. Estado del arte frente a la propuesta

| Tema | Qué dice la evidencia (2025-2026) | Dónde está el método | Ajuste |
| --- | --- | --- | --- |
| Archivos de contexto (`AGENTS.md`) | ETH Zürich: en promedio no mejoran el acierto y suben el costo más de 20 %. Los generados por el agente (`/init`) bajan el acierto ≈ 3 %; los escritos por personas lo suben ≈ 4 %. Sirven para lo que no se deduce del código | Bien: ≤ 150 líneas, solo lo no deducible, el brain de empresa se consulta a pedido | Prohibir los `AGENTS.md` generados sin edición humana. Bajar el tope a lo necesario, no llenarlo |
| Especificación antes del código | Spec Kit, OpenSpec y Kiro son la corriente principal. OpenSpec es el más liviano y el pensado para código existente. El riesgo conocido es la ceremonia: un bug chico convertido en 4 historias | Bien: OpenSpec solo en el nivel 3, y sin propuesta para correcciones chicas | El estándar debe definir **qué** pide (propuesta con deltas, requisitos con ID, trazabilidad) y dejar OpenSpec como la herramienta actual. Las herramientas cambian cada pocos meses |
| Productividad | METR (24/02/2026): el −19 % de 2025 «quedó desactualizado»; ahora es probable una mejora, pero su medición ya no es confiable. DORA 2025: la IA **amplifica** lo que el equipo ya hace, bien o mal | El método mide costo y tokens (`metricas.mjs`, sin usar en ai-genesys) | Medir el **resultado** con una línea base: tiempo de PR a main, tasa de cambios que fallan, defectos escapados, costo por PR |
| Calidad del código del agente | Más defectos que el humano (≈ 1,7×, CodeRabbit, proveedor). Un estudio de 302 579 commits encontró mejor estilo y peor corrección. El 81 % de los equipos unió código de IA que no entendía del todo (encuesta) | Revisión independiente en contexto fresco + CI | Bien encaminado. Falta definir **cuándo una persona lee el diff entero** |
| Cuello de botella de revisión | Revisar y validar código de IA es el cuello de botella más citado (Qodo 2026). Práctica: 3-4 agentes en paralelo por cada revisor; 200-400 líneas por revisión | ai-genesys: un solo aprobador, en lote, y «mirar el resumen del revisor alcanza» (`PLAN.md` §7.3) | Topes explícitos: sesiones en paralelo por revisor y tamaño de PR; lectura completa obligatoria en cifras, permisos, seguridad y migraciones |
| Agentes en paralelo | Los worktrees son el estándar de hecho. Aíslan el código, **no** los puertos, las bases ni la memoria; un agente no nota que otro cambió el código debajo | Carriles con hook: más que la práctica común | Sumar el límite de recursos (el candado de NEXO; DWH-47: el oráculo se quedó sin memoria con sesiones en paralelo) y la limpieza de worktrees (L-04) |
| Seguridad | OWASP Top 10 para aplicaciones agénticas (12/2025): mínima autonomía, cadena de suministro, uso indebido de herramientas. «Trifecta letal»: datos privados + contenido no confiable + salida al exterior. La defensa más fuerte es cortar la salida a internet (sandbox con red cerrada por defecto), no las instrucciones | Hooks y listas de bloqueo; política administrada **sin instalar**; plugins servidos desde un repo personal | Ver riesgos R3 y R4. Sandbox con red restringida, lista de servidores MCP permitidos, `strictKnownMarketplaces` y repo de la organización |
| Formación de las personas | Ensayo de Anthropic (01/2026), 52 programadores mayormente junior: con IA, 50 % en la evaluación posterior contra 67 % sin IA. Delegar todo fue lo peor; preguntar conceptos y escribir uno mismo, lo mejor | No lo contempla | Para la adopción por el equipo: el autor explica su PR; los junior escriben ellos las pruebas en sus primeros cambios |

## 3. Cambios sugeridos

**Para el viernes** (≈ +3 h; caben si se recorta V3 a solo el mapa):

| # | Cambio | Dónde | h |
| --- | --- | --- | --- |
| C1 | **Criterios de éxito con línea base.** 4 indicadores (tiempo de PR a main, % de PR con hallazgos graves del revisor, defectos escapados, costo por PR) con su valor actual en ai-genesys. Sin esto, los validadores aprueban un proceso, no un resultado | V1 | 1 |
| C2 | **Criterios de P3 escritos antes de la prueba:** instala en < 1 h sin ayuda; el PR pasa la CI; el revisor no deja hallazgos graves; la persona explica su cambio. Presentarla como «prueba de incorporación», no como prueba de que sirve para todo el equipo | P3 | 0,5 |
| C3 | **Regla de revisión humana:** cuándo alcanza el resumen del revisor y cuándo se lee el diff entero (cifras, permisos, seguridad, migraciones, los primeros 5 PR de cada persona). Tope de 3-4 sesiones en paralelo por aprobador | V1, ADR-E004 | 0,5 |
| C4 | **Una decisión de seguridad para el jueves** (ADR-E006): repo de la organización con `main` protegido **antes** de que otra persona instale; política administrada con `strictKnownMarketplaces`; sandbox con red restringida como objetivo de la ola 1. Hoy quien controle el repo personal controla los hooks de todas las PCs | V2 | 1 |
| C5 | **Disparadores de nivel:** cuándo un proyecto pasa de 1 a 2 y de 2 a 3 (usuarios reales, datos confidenciales, integraciones, más de 2 sesiones en paralelo). Evita que todo termine en nivel 3 por las dudas | V1 | incluido |

**Para las olas:**
- **Ola 1:** sumar a las evals dos escenarios de seguridad (instrucciones maliciosas dentro de un issue o de un `pendientes.md`; intento de leer `.env.example` u otra variante). Activar `metricas.mjs` en ai-genesys para tener datos reales. Fijar Sonnet por defecto con tope de costo (DWH-29).
- **Ola 2:** piloto con **dos** personas, idealmente una junior. Medir los indicadores de C1 y la comprensión del autor de su propio PR.
- **Ola 3:** revisión trimestral de herramientas (OpenSpec, Claude Code, modelos) con versiones fijadas, y un tablero con los 4 indicadores.

## 4. Riesgos

| # | Riesgo | Prob. | Impacto | Mitigación |
| --- | --- | --- | --- | --- |
| R1 | **Una sola persona:** Joaquín escribe el método, es dueño del estándar, único aprobador de ai-genesys y único responsable, sin suplente (DWH-27) | Alta | Alto | Nombrar dueño y suplente del estándar el jueves (pregunta 5); segundo aprobador en ai-genesys |
| R2 | **Aprobación de rutina:** con muchos PR en lote, la persona deja de leer y aprueba el resumen | Alta | Alto | C3; medir el % de PR con hallazgos después del merge |
| R3 | **Cadena de suministro:** los plugins y hooks salen de un repo personal sin protección; la política que lo impediría no está instalada | Media | Alto | C4; fijar por SHA como ya hace la CI de ai-genesys |
| R4 | **Inyección de instrucciones:** el agente lee issues, PR, páginas web y documentos de terceros con permisos de escritura y acceso a `gh`. Las listas de bloqueo son evadibles; el README ya registra que una regla bloqueaba `.env.example` | Media | Alto | Red restringida, aprobación para lo que sale de la máquina (push, publicar), escenarios de evals |
| R5 | **Burocracia percibida:** el equipo usa los agentes por fuera del método | Media | Medio | Nivel 1 muy liviano; C5; medir la adopción, no solo pedirla |
| R6 | **El estándar se desactualiza:** en 10 días `emba-brain` ya quedó atrás de lo que se hacía (B5) | Alta | Medio | Dueño nombrado; `lint-brain` en el nocturno; revisión cada 2 semanas durante las olas |
| R7 | **Herramientas que cambian:** OpenSpec, Claude Code y los modelos cambian cada mes | Alta | Bajo | El estándar fija principios; versiones fijadas; evals antes de cada actualización |
| R8 | **Pérdida de habilidades,** sobre todo en los junior | Media | Medio | El autor explica su PR; pruebas escritas por personas en los primeros cambios |
| R9 | **Calendario:** ≈ 21 h + 3 h de estos cambios, en paralelo con ai-genesys | Alta | Medio | Recortar V3 a solo el mapa; P3 no se recorta |

## 5. Lo que no cambiaría

- `AGENTS.md` corto y escrito por personas, con el brain de empresa consultado a pedido: es lo que respalda la evidencia.
- Lo verificable va a hooks, pruebas y CI, no a la prosa: es la misma idea que el «harness engineering» de OpenAI.
- La revisión en contexto fresco: las evals del 29/10 (10/10) y los 16 de 17 cambios de ai-genesys la respaldan.
- Los carriles con hook: van más allá de la práctica común, que solo usa worktrees.
- Datos sintéticos y costo cero: protegen de los dos riesgos que más frenan la adopción en una empresa (datos y gasto).

## Fuentes

- Gloaguen et al., *Evaluating AGENTS.md*, ETH Zürich, arXiv 2602.11988: https://arxiv.org/abs/2602.11988
- Khatri, *Do Context Files Help Coding Agents?*, arXiv 2607.27250: https://arxiv.org/abs/2607.27250
- METR, actualización del 24/02/2026: https://x.com/METR_Evals/status/2026355544668385373
- Google DORA, *State of AI-assisted Software Development 2025*: https://services.google.com/fh/files/misc/2025_state_of_ai_assisted_software_development.pdf
- OWASP, *Top 10 for Agentic Applications for 2026*: https://genai.owasp.org/resource/2025-12-09/owasp-top-10-for-agentic-applications-for-2026
- Trifecta letal y sandbox: https://agentpatterns.ai/security/lethal-trifecta-threat-model/ ·
  https://specstory.com/learning/environments/prompt-injection-in-coding-agents
- Qodo, *State of AI Code Quality 2026*: https://www.qodo.ai/state-of-ai-code-quality-report/
- *Debt Behind the AI Boom*, arXiv 2603.28592: https://arxiv.org/html/2603.28592v2
- TestMu AI, *State of AI in Quality Engineering 2026*: https://www.testmuai.com/research/state-of-ai-in-quality-engineering/
- Spec-driven development, comparaciones: https://www.augmentcode.com/tools/best-spec-driven-development-tools ·
  https://aicodingpatterns.com/en/patterns/openspec-vs-spec-kit-vs-bmad/
- Agentes en paralelo: https://addyosmani.com/blog/code-agent-orchestra/ ·
  https://www.augmentcode.com/guides/how-to-run-a-multi-agent-coding-workspace · https://arxiv.org/pdf/2609.00252
- Marketplaces y políticas de Claude Code: https://code.claude.com/docs/en/settings ·
  https://agentpatterns.ai/security/enterprise-managed-plugin-governance/
- Formación de habilidades (Anthropic, 01/2026): https://thenextweb.com/news/ai-never-skilling-critical-thinking-research
