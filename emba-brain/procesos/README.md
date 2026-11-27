---
dueño: plataforma-agentica
estado: candidata
revisado: 2026-11-27
vence: 2027-01-26
fuentes: ["ai-genesys, Fase 1.5 (gobernanza): docs/procesos/ (23/11/2026)", ../seguridad-datos/clasificacion.md]
---
# Páginas de proceso

> Candidata: sale de un solo proyecto (ai-genesys, Fase 1.5). Se aplica como las lecciones candidatas
> ([lecciones/README.md](../lecciones/README.md)) hasta que la retro la promueva o la descarte.

## Qué es

Una página de proceso describe un proceso de información de un área: qué operaciones tiene, con qué frecuencia,
quién las hace, qué rastro dejan en los sistemas y qué reglas las tocan. Una página por proceso. Vive en el repo del
proyecto, no aquí; la ubicación sugerida, no obligatoria, es `docs/procesos/<area>/`. Aquí están la plantilla y las
reglas comunes.

- Plantilla: [plantilla.md](plantilla.md).
- Ejemplo real (8 procesos de Finanzas, con matriz de dueños):
  [ai-genesys `docs/procesos/`](https://github.com/gcastillo-emba/ai-genesys/tree/main/docs/procesos).
  Se enlaza, no se copia.

## Cuándo se escribe

Antes de construir sobre los datos de un área: un dominio, un reporte o una integración. Así las reglas que el código
deja implícitas quedan escritas y con dueño. Se puede escribir **sin entrevistas**, deduciendo de la evidencia que ya
hay. Lo que no tiene evidencia no se inventa: queda para relevar.

La página se corrige cuando llega evidencia mejor (una medición, una respuesta del área). Escribirla no cambia cifras:
una regla que parece mal se anota como pregunta y el sistema sigue haciendo lo que hace.

## Niveles de evidencia

Cada atributo de una operación lleva su nivel entre paréntesis. De mayor a menor confianza:

| Nivel | Qué es | Cómo se cita |
| --- | --- | --- |
| **dato** | Conteos o proporciones medidos sobre los datos. Solo agregados | La consulta o la clave de la medición |
| **declarado** | Lo que dijo el área, por escrito | Documento y línea |
| **código** | Lo que hace un sistema existente o lo que midió un análisis | `archivo:línea` |
| **hipótesis** | Sin evidencia: solo un catálogo o lista de control | «a relevar» |

Una medición que todavía no corrió se escribe «dato pendiente» con el ID de la tarea que la va a correr.
Los datos reales no entran al contexto de un agente ([clasificación](../seguridad-datos/clasificacion.md)): la
página cita referencias, nunca importes ni nombres de clientes o personas.

## Responsable y dueño

- **Responsable** (columna de la tabla): quién hace la operación. Siempre un **rol**, nunca el nombre de una persona.
  En operaciones de diseño o configuración del sistema se abre en quién decide, quién ejecuta y quién autoriza. Si
  nadie sabe, eso es el hallazgo.
- **Dueño**: la persona que responde por el dato del proceso. Sale de la **matriz de dueños** del proyecto (un YAML,
  una fila por proceso; molde en la plantilla). Regla para toda EMBA (27/11/2026): mientras el área no nombre a
  alguien, el líder técnico del proyecto es dueño **provisional** y la página lo dice.

## Pendientes y preguntas

- Una operación sin evidencia va al pie de la página, «Sin evidencia (a relevar)», y a la lista de relevamiento o de
  pendientes del proyecto, ordenada por riesgo.
- El **cuadrante** frecuencia × impacto estructural ordena ese relevamiento: lo de baja frecuencia y alto impacto
  va primero.
- Una duda sobre una regla es una **pregunta abierta**: va al registro de preguntas del proyecto con su ID, y la
  página cita el ID. La página no la responde.
- La columna **Reglas** enlaza los IDs de los requisitos del proyecto (`<DOM>-Rnn`). Cada regla cita su proceso y su
  dueño; así se recorre proceso → regla → prueba.
