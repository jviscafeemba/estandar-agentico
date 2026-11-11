# 01 · Estado del arte al 10/11/2026

Paso 1 de 7 de la sesión `POC · simulacion-metodo-v2`. Actualiza [`analisis-experto.md`](../analisis-experto.md) del
09/11/2026: lo que ya estaba ahí no se repite. Los hallazgos llevan ID (`EA-nn`) para citarlos en la propuesta v3.

> **Resumen.** (1) La evidencia de 2026 confirma el diseño del método: controles en hooks y no en el prompt, revisión
> en contexto limpio y carriles asignados **antes** de escribir, que es lo único que rindió en los estudios de agentes
> en paralelo. (2) Hay dos cambios fuertes: la aprobación humana en lote es, medida, casi un sello de goma (93-97 % de
> aprobación y 13,6 % de detección, datos de Anthropic), y los hooks y las reglas `deny` son una alarma, no una
> frontera: la frontera es el sandbox con red cerrada. (3) Hay que proteger las pruebas: los agentes hacen trampa
> editándolas y pedirles que no lo hagan no sirve. (4) Para simular: escenarios con verificación probada, pareados,
> intervalos de Wilson, reservados aparte, y un líder simulado que va a inflar el éxito. (5) Con 1-3 repeticiones
> solo se pueden afirmar efectos grandes: los informes lo van a decir así.

Tipo de fuente: **[P]** revisado por pares · **[pre]** preprint · **[prov]** documento o dato del proveedor de la
herramienta · **[enc]** encuesta o material comercial de proveedor · **[exp]** blog de experto · **[adv]** aviso de
seguridad · **[gob]** organismo público. Cada fuente se abrió y se comprobó la cifra; las dos excepciones están
marcadas en su fila (EA-13, EA-18). Casi toda la evidencia de 2026 es preprint sin revisión por pares.

## 1. Hallazgos

| ID | Tema | Qué dice la evidencia | Fuente |
| --- | --- | --- | --- |
| EA-01 | Harness | Guías (antes de actuar: `AGENTS.md`, skills) y sensores (después: tests, linters, revisión IA); los controles computacionales son baratos y deterministas, los inferenciales caros y probabilísticos. Cuando un problema se repite, se corrige la guía o el sensor. Sin mediciones | Böckeler, Thoughtworks, 02/04/2026 [exp] |
| EA-02 | Harness | Para sesiones largas: archivo de progreso, `init.sh`, lista de funcionalidades en JSON donde el agente solo cambia `passes`, prueba de punta a punta al empezar cada sesión. Sin cifras | Anthropic, 26/11/2025 [prov] |
| EA-03 | Spec antes del código | Estudio de 266 repos y 470 795 specs: SDD se usa sobre todo en funcionalidades nuevas; más confiabilidad percibida, más costo de planificación y revisión; las specs se desactualizan y la coherencia spec-código se revisa solo al cierre | Agarwal, Vasilescu et al., CMU, 15/10/2026 [pre] |
| EA-04 | Spec antes del código | 50 tickets: tasa de merge OpenSpec 84 %, control sin spec 72 % (ruido ±10 pp); en tickets chicos y bugs empatan o gana el control. OpenSpec es el más barato de los SDD (2,71 USD por ticket integrado contra 2,43 del control) | Uvik, 15/10/2026 [enc] |
| EA-05 | Prueba primero | Los agentes hacen trampa en tareas imposibles editando las pruebas (Claude: > 79 % de sus trampas). Pruebas de solo lectura frenan la edición sin bajar el rendimiento legítimo; ocultarlas frena todo, pero rinde peor | Zhong, Carlini et al., ImpossibleBench, ICLR 2026 [P] |
| EA-06 | Prueba primero | Pedir «no hagas trampa» no cambió nada (80 % → 80 %, METR, 05/06/2025 [exp]). Pedir TDD solo por prompt **subió** las regresiones de 6,1 % a 9,9 %; un mapa código → tests las bajó a 1,8 % | TDAD, 18/03/2026 [pre] |
| EA-07 | Revisión independiente | Contexto limpio F1 28,6 % contra 21,7 % de autorrevisión repetida; la ventaja sobre una sola autorrevisión no es significativa (p = 0,26) | Song, 01/10/2026 [pre] |
| EA-08 | Revisión independiente | Con dos revisiones, una en sesión limpia + una de **otro modelo** detectan 56,7 % de los errores sembrados, contra 42,7 % de dos del mismo modelo (p = 0,006); solapan solo 41 % | Song, 01/10/2026 [pre] |
| EA-09 | Revisión independiente | Los jueces LLM prefieren su propio texto (Panickssery et al., NeurIPS 2024 [P]). Más comentarios = menos precisión; un modelo chico puede igualar a uno grande en recall | Kumar et al., 09/04/2026 [pre] |
| EA-10 | Paralelo | Agentes en paralelo sobre el mismo código: Claude Code cae de 62 % a 16 % en tareas en conflicto; avisarles que hay otro agente no ayuda (ParallACT, 30/10/2026 [pre]). Dos agentes colaborando: −30 % frente a cada uno solo (CooperBench, 19/01/2026 [pre]) | ver fila |
| EA-11 | Paralelo | Un planificador que asigna el trabajo **antes** de editar lleva la integración limpia de 1/9 a 9/9 escenarios y los conflictos de merge de 13 a 0; cada agente pasaba sus pruebas y la integración se rompía igual | NP-Bench, 05/10/2026 [pre] |
| EA-12 | Humano en el ciclo | Se aprueba el 93-97 % de los pedidos de permiso; en 1053 testers, los humanos frenaron el 13,6 % de los comandos peligrosos; la tasa de bloqueo cae de ≈ 17 % al inicio a ≈ 5 % después de 50 pedidos. El modo auto es el predeterminado desde el 14/08/2026 | Anthropic, 25/03 y 22/10/2026 [prov] |
| EA-13 | Humano / revisión IA | Un issue público llevó a un agente con el MCP de GitHub a filtrar repos privados: lo que escribe un tercero (issue, título y descripción de PR) es entrada no confiable, también para el revisor | Invariant Labs, 26/05/2025 [prov]. *Hay un preprint (arXiv 2603.18740) según el cual metadatos de PR manipulados hacen que el revisor IA pase por alto CVE; no se pudo abrir y no se usa como evidencia* |
| EA-14 | Seguridad | *Comment and Control*: un título de PR secuestró a Claude Code Security Review, Gemini CLI y Copilot en GitHub Actions y filtró claves; en Copilot esquivó las tres defensas (filtrado de variables, escáner de secretos con base64, salida por `github.com` permitido) | Guan, 15/04/2026 [exp, divulgación primaria] |
| EA-15 | Seguridad | Las reglas Bash «no son una frontera de seguridad»: la doc pide sandbox de archivos **y** red, y hooks `PreToolUse` sobre el comando completo. Hubo evasiones reales: CVE-2025-66032 (CVSS 8,7, `$IFS`) y reglas `deny` inactivas con > 50 subcomandos (corregido en v2.1.90) | Anthropic docs [prov]; GHSA-xq4m-mc3c-vvg3 [adv]; Adversa, 02/04/2026 [enc] |
| EA-16 | Seguridad | El sandbox redujo 84 % los pedidos de permiso en uso interno. Política administrada: `allowManagedPermissionRulesOnly`, `disableBypassPermissionsMode`. NIST abrió una iniciativa de estándares de agentes (17/02/2026), sin guía final | Anthropic, 20/10/2025 [prov]; NIST CAISI [gob] |
| EA-17 | Evaluar métodos | El harness mueve el resultado tanto o más que el modelo: hasta 11-15 pp en SWE-bench Verified solo por cambiar el scaffold | Epoch AI, 23/12/2025 [exp] |
| EA-18 | Evaluar métodos | Los benchmarks fallan por tests débiles o rotos: OpenAI dejó de usar SWE-bench Verified por tests defectuosos y contaminación (23/02/2026 [prov]; la página dio 403, la cifra de ≥ 59 % viene de citas secundarias); 24 % de las entradas afectadas por tests insuficientes (UTBoost, ACL 2025 [P]); un bug de calificación dejaba un 42 % que era 95 % (Anthropic, 09/01/2026 [prov]) | ver fila |
| EA-19 | Evaluar métodos | Con pocos datos, el intervalo ±1,96·SE subestima mucho la incertidumbre (Bowyer et al., ICML 2025 [P]); usar diferencias pareadas y repetir cada tarea (Anthropic, 19/11/2024 [prov]); pass^k mide si sale bien **siempre** (τ-bench [pre]); el ruido de infraestructura solo ya mueve 6 pp (Anthropic, 05/02/2026 [prov]) | ver fila |
| EA-20 | Usuario simulado | Con 451 humanos reales, los usuarios simulados por LLM resultaron demasiado cooperativos y uniformes: inflan el éxito (Zhou, Neubig, Sap et al., COLM 2026 [P]). El éxito cambia hasta 9 pp según qué modelo simula al usuario (Seshadri et al., 23/01/2026 [pre]) | ver fila |

## 2. Qué cambia para el método (entra en la propuesta v3)

| Elemento | Cambio | Por |
| --- | --- | --- |
| E4 prueba primero | Las pruebas y los oráculos pasan a **solo lectura** para el agente por hook mientras implementa; la verificación la corre un script, no el agente diciendo «pasó» | EA-05, EA-06 |
| E5 revisión | Revisor sin el resumen ni el título del autor: solo el diff y los requisitos. En lo crítico (cifras, permisos, seguridad, migraciones), segunda pasada con otro modelo | EA-07, EA-08, EA-13 |
| E6 seguridad | Hooks y `deny` se documentan como **alarma**, no frontera. Objetivo: sandbox con red cerrada, política administrada, versión mínima de Claude Code. El título y la descripción de PR e issues son entrada no confiable | EA-14, EA-15, EA-16 |
| E7 carriles | Se confirma: asignar antes de escribir es la mitigación que funcionó. Agregar una prueba de integración después de unir los carriles y un único carril dueño de cada contrato compartido | EA-10, EA-11 |
| E8 aprobación | El humano aprueba **pocas cosas de alto impacto** (propuesta, merge de lo crítico) con lectura obligatoria; el resto, con controles automáticos. Medir la tasa de aprobación sin cambios como alarma de sello de goma | EA-12 |
| E3 propuesta | Proporcional: obligatoria en funcionalidad nueva y nivel 3; no en bugs ni cambios chicos | EA-03, EA-04 |
| E2 / E9 | El patrón de progreso de EA-02 encaja con `pendientes.md` y el cierre; se toma como práctica, no como evidencia | EA-02 |

## 3. Reglas para diseñar la simulación (pasos 3-7)

1. **Verificación probada antes de usarla:** el repo sin tocar falla, la solución de referencia pasa y un parche
   erróneo plausible falla. Un escenario con 0/N en todos los modos se revisa antes de concluir (EA-18).
2. **Pareado:** mismo escenario, modelo y semilla con y sin el elemento; se informa ganó/perdió/empató por escenario.
3. **n/N con intervalo de Wilson** y la frase «exploratorio» cuando n < 5; diferencias menores a ≈ 10 pp con n chico
   se tratan como ruido; se informan pass@1 y, cuando haya 3 repeticiones, pass^3 (EA-19).
4. **Reservados:** 20-30 % de los escenarios no se miran hasta la re-prueba del paso 5 y se corren una sola vez.
5. **Líder simulado honesto:** reglas de decisión por evento en el guion (no «actuá como líder»), semilla, otro modelo
   que el agente si el presupuesto alcanza, decide sin leer primero la defensa del agente, deja motivo por decisión,
   y una muestra se audita contra el guion. Su éxito se informa como **cota optimista** (EA-20).
6. **Copia limpia por corrida**, sin historial git ni resultados previos, con el harness completo documentado (EA-17).
7. Se califica el **resultado** con las verificaciones ocultas; el cumplimiento del flujo se mide aparte con una
   rúbrica explícita.

## 4. Costo

| | Tokens | Uso del plan Team |
| --- | --- | --- |
| Paso 1 (3 investigaciones + redacción) | ≈ 270 k en subagentes + ≈ 120 k de la sesión | 7 % de la ventana de 5 h; 14 % de la semanal (incluye el uso previo de la semana) |
| Paso 2 estimado (propuesta v3 + capa del harness en `metodo-v2.html`) | ≈ 150-200 k, sin corridas de agentes | ≈ 3-5 % de la ventana de 5 h · 1,5-2 h |

Las corridas de simulación (pasos 3-7) informan costo en USD equivalente a la API (`total_cost_usd` de la CLI). Con el
plan Team no se cobran aparte (el uso extra está desactivado), pero **consumen el límite semanal**: ese es el freno
real, y el paso 3 lo va a medir con el piloto.

## Fuentes

Böckeler, *Harness engineering for coding agent users*: https://martinfowler.com/articles/harness-engineering.html ·
Böckeler, *Understanding SDD*: https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html ·
Anthropic, *Effective harnesses for long-running agents*: https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents ·
Anthropic, hooks: https://code.claude.com/docs/en/hooks-guide ·
Agarwal et al., *SDD as Prescribed and as Practiced*: https://arxiv.org/abs/2608.25202 ·
Uvik, *SDD Benchmark 2026*: https://uvik.net/blog/spec-driven-development-benchmark/ ·
Zhong, Raghunathan, Carlini, *ImpossibleBench*: https://arxiv.org/abs/2510.20270 ·
METR, *Recent frontier models are reward hacking*: https://metr.org/blog/2025-06-05-recent-reward-hacking/ ·
*TDAD*: https://arxiv.org/abs/2603.17973 ·
Song, *Cross-Context Review*: https://arxiv.org/abs/2603.12123 ·
Song, *When Does a Second Model Help?*: https://arxiv.org/abs/2610.01471 ·
Panickssery, Bowman, Feng: https://arxiv.org/abs/2404.13076 ·
Kumar et al., *Bigger Isn't Always Better*: https://arxiv.org/abs/2606.15689 ·
*ParallACT*: https://arxiv.org/abs/2611.00314 ·
*CooperBench*: https://arxiv.org/abs/2601.13295 ·
*NP-Bench*: https://arxiv.org/abs/2610.07261 ·
Anthropic, auto mode: https://www.anthropic.com/engineering/claude-code-auto-mode · https://claude.com/resources/articles/auto-mode-default-in-claude-code ·
Revisor IA manipulado por metadatos: https://arxiv.org/html/2603.18740 ·
Invariant Labs, GitHub MCP: https://invariantlabs.ai/blog/mcp-github-vulnerability ·
Guan, *Comment and Control*: https://oddguan.com/blog/comment-and-control-prompt-injection-credential-theft-claude-code-gemini-cli-github-copilot/ ·
Permisos de Claude Code: https://code.claude.com/docs/en/permissions · settings: https://code.claude.com/docs/en/settings ·
GHSA-xq4m-mc3c-vvg3: https://github.com/advisories/GHSA-xq4m-mc3c-vvg3 ·
Adversa AI: https://adversa.ai/blog/claude-code-security-bypass-deny-rules-disabled/ ·
Anthropic, sandboxing: https://www.anthropic.com/engineering/claude-code-sandboxing ·
NIST CAISI: https://www.nist.gov/caisi/ai-agent-standards-initiative ·
Epoch AI: https://epoch.ai/gradient-updates/why-benchmarking-is-hard ·
OpenAI, SWE-bench Verified: https://openai.com/index/why-we-no-longer-evaluate-swe-bench-verified/ ·
UTBoost: https://arxiv.org/abs/2506.09289 ·
Anthropic, *Demystifying evals for AI agents*: https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents ·
Bowyer et al.: https://arxiv.org/abs/2503.01747 ·
Anthropic, *A statistical approach to model evals*: https://www.anthropic.com/research/statistical-approach-to-model-evals ·
τ-bench: https://arxiv.org/abs/2406.12045 ·
Anthropic, *Infrastructure noise*: https://www.anthropic.com/engineering/infrastructure-noise ·
Zhou et al., *Sim2Real gap*: https://arxiv.org/abs/2603.11245 ·
Seshadri et al., *Lost in Simulation*: https://arxiv.org/abs/2601.17087
