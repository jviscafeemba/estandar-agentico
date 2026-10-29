---
dueño: plataforma-agentica
estado: vigente
revisado: 2026-10-29
vence: 2027-01-27
fuentes: [../decisiones/ADR-E001-desarrollo-agentico-federado.md]
---
# Flujo de trabajo con agentes

1. **Propuesta** (`/emba-harness:proponer-cambio`): qué cambia, por qué y qué requerimientos (ID) cubre.
   No se implementa sin aprobación explícita del líder técnico del proyecto.
2. **Rama propia; primero la prueba que falla.**
3. **Verificación con evidencia** (`/emba-harness:verificar`): salida real de las pruebas, no afirmaciones.
4. **Revisión independiente** (`/emba-harness:revisar`): la hace un agente o una persona distinta del autor.
   El autor nunca aprueba su propio cambio.
5. **PR** con la evidencia; se une con CI en verde y aprobación humana.
6. **Cierre** (`/emba-harness:cerrar-fase`): actualizar ADR, RUNBOOK y guía de pruebas si algo cambió, y
   registrar lecciones candidatas en el brain de empresa.

Se delega siempre al agente: redacción de propuestas, pruebas, implementación acotada, documentación.
Revisa siempre una persona: seguridad, migraciones de datos, integraciones y todo lo irreversible.
