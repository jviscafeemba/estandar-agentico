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
