# Preguntas difíciles sobre el estándar agéntico

Respuestas cortas con los datos de la prueba de concepto (29/10/2026). Donde no hay dato, se dice.

## «¿Esto me reemplaza?»

No. El estándar deja tres decisiones siempre en manos de una persona: aprobar la propuesta, decidir qué se corrige
tras la revisión y unir el PR. Lo que cambia es dónde pone su tiempo cada uno: menos repetir contexto y escribir
código rutinario, más definir requerimientos, decidir y revisar. Las métricas son del equipo, nunca de personas.

## «¿Y si el agente se equivoca?»

Se equivoca, y el estándar lo asume. Por eso hay pruebas primero, verificación con la salida real y una revisión
en una sesión que no escribió el cambio. En la prueba, 5 errores que pasaban todas las pruebas fueron detectados
10 de 10 veces por esa revisión. Sin revisión, habrían llegado al PR.

## «¿Quién paga los tokens? ¿Cuánto cuesta?»

Con el plan Team, el consumo sale de la cuota de la suscripción; no hay un cobro por tarea. Como referencia medida:
una tarea típica del demo consume el equivalente a 0,28 USD (mediana) con Opus 5.5 y 0,10 USD con Sonnet 5.5, que
resolvió todas las tareas. El harness 0.2 no encarece el trabajo: cuesta lo mismo que trabajar sin él. Falta estimar la cuota mensual del equipo: depende de cuántas
personas y cuántas tareas por día.

## «¿Por qué no usamos Copilot / Cursor / otro agente?»

El contenido del estándar es portable: `AGENTS.md`, los ADR, los requerimientos y el brain de empresa son Markdown
que cualquier agente lee. Lo que hoy depende de Claude Code son los hooks y las skills. Probar el mismo brain con
otros agentes es una prueba pendiente; los controles críticos se repiten en CI, que no depende del agente.

## «¿Y si no quiero usar el agente?»

Las reglas del estándar valen para cualquier cambio: requerimiento con ID, prueba primero, evidencia y revisión.
Usar el agente es lo que lo hace barato, no lo que lo hace obligatorio. Las skills de flujo solo corren si alguien
las pide.

## «¿No es mucha burocracia para un cambio chico?»

Un cambio chico es un pedido de una línea con el ID del requerimiento: el agente encuentra el resto en el repo. La
primera versión del plugin sí agregaba pasos de más (+47 % de costo); por eso en la 0.2 las skills de flujo son a
pedido. Lo que no se negocia es la evidencia y la revisión.

## «¿Qué pasa con nuestros datos y nuestro código?»

Con el plan Team, Anthropic no entrena con el código ni los prompts de Claude Code y guarda las sesiones 30 días.
`/feedback` guardaría la conversación 5 años: la política lo desactiva. Bolivia no tiene todavía una ley de datos
personales; igual, la regla es solo datos sintéticos en el contexto del agente. Falta la revisión del responsable
legal. Detalle: `docs/investigacion-datos-y-proveedores.md`.

## «¿Puede el agente filtrar un secreto?»

Lo intenta cuando el pedido lo sugiere: en la prueba, 3 de 6 corridas quisieron leer el `.env`. Lo frenan dos
barreras: los permisos negados y el hook, que entiende comillas, comodines y PowerShell. No hubo ninguna fuga. Por
eso la política se instala en todas las máquinas y nadie puede saltarse los permisos.

## «¿Quién mantiene todo esto?»

Un dueño de la plataforma con horas asignadas, un curador del brain que rota y un campeón por proyecto. Sin dueño,
el estándar envejece: es el riesgo número uno que señaló el consejo de expertos, y la primera puerta de la hoja de
ruta.

## «¿Por qué no empezamos por el proyecto más crítico?»

Porque ya funciona con su propio flujo y no conviene arriesgarlo. El estándar se valida primero en dos pilotos;
los proyectos críticos, que inspiraron gran parte del estándar, lo adoptan cuando esté probado.

## «¿Esto está probado o es teoría?»

Está probado en pequeño: 2 proyectos demo, 7 tareas con verificaciones ocultas, 5 errores sembrados y más de 130
corridas del agente real. Las muestras son chicas y con un solo proveedor de modelos: es una señal, no una
estadística. El piloto de N1 da la evidencia con proyectos reales.
