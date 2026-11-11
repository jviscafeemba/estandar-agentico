---
dueño: plataforma-agentica
estado: candidata
revisado: 2026-10-29
vence: 2026-12-28
fuentes: ["demo-facturas: corrección repetida al formatear montos"]
---
# L-001 — Montos en bolivianos

**Qué pasó.** El agente formateó montos con punto decimal y sin separador de miles en dos cambios seguidos.

**Propuesta.** Promover a estándar: montos en Bs con 2 decimales, coma decimal y punto de miles
(`1.234,50 Bs`). Si se promueve, se agrega una prueba compartida en `emba-harness`.
