# Brief de sesión

Nombre de la sesión: `PROYECTO · propósito` (ej. `NEXO · f4-carril-sap`).

1. **Propósito:** <qué tiene que quedar hecho; una o dos frases>.
2. **Lo que ya se sabe:** <archivos, PR, ADR, ID de pendiente donde está el detalle>.
3. **Fuera de alcance:** <lo que no se toca>.
4. **Terminado cuando:** <PR abierto con evidencia / decisión tomada / documento escrito>.
5. Las preguntas al dueño van en esta sesión, en un mensaje anterior al último.
6. Cada turno cierra con una sola línea:
   - `TRABAJANDO: <qué>`
   - `ESPERA: <de quién>`
   - `TERMINADO: PR #n` (o la decisión tomada)
7. Trabajo aparte que aparezca: se propone como sesión nueva, no se hace aquí.
8. **Orquestadora:** antes de lanzar cada cambio, se pregunta qué esperaría ver el usuario que ninguna spec cubre
   (temas transversales del plan: interfaz y marca, accesibilidad, rendimiento, operación). Lo que no esté asignado
   se anota como pendiente P-0nn o pregunta Q-0nn; no queda implícito (0.4.0, P-029 de ai-desempeno).
9. **Orquestadora:** la verificación oculta de cada cambio se escribe antes de lanzar la implementación
   (`plantillas/verificacion-oculta.md`), fuera del repo.
10. **Orquestadora, vigilante (0.4.3):** al lanzar una implementadora o un revisor como subagente, corré en segundo
    plano `node <harness>/scripts/vigilar.mjs <carpeta del subagente> --minutos 10`. Si termina con «SIN PROGRESO»,
    revisá al subagente. Si está colgado, relanzalo con su contexto o en uno nuevo, y anotalo en el registro. Cuando
    el subagente termina, pará el vigilante.
11. **Orquestadora, verificación propia (0.4.3):** antes de aceptar el verde de una implementadora, corré la suite
    completa **2 veces** desde tu propia copia (no la de la implementadora), con la pila de pruebas propia. Una falla
    intermitente es un defecto del cambio. En la corrida 2 de C-08 así aparecieron 2 pruebas intermitentes y 1 defecto
    que la implementadora había dado por buenos (D-C08v2-01 a 03).
