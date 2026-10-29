---
dueño: plataforma-agentica
estado: vigente
revisado: 2026-10-29
vence: 2027-01-27
fuentes: [decisiones/ADR-E001-desarrollo-agentico-federado.md]
---
# Brain de empresa EMBA — índice

Conocimiento transversal a todos los proyectos. Lo propio de un proyecto vive en su repositorio.
Este índice enlaza; no copia. Leé solo el documento que necesites.

| Necesito… | Documento |
| --- | --- |
| Cómo se trabaja con agentes (flujo, revisión, evidencia) | [estandares/flujo-de-trabajo.md](estandares/flujo-de-trabajo.md) |
| Qué va en el AGENTS.md de un proyecto | [estandares/contexto-agentes.md](estandares/contexto-agentes.md) |
| Manejo de secretos y credenciales | [estandares/secretos.md](estandares/secretos.md) |
| Compuertas mínimas de CI | [estandares/ci.md](estandares/ci.md) |
| Numeración de facturas y documentos fiscales | [estandares/documentos-fiscales.md](estandares/documentos-fiscales.md) |
| Términos de negocio (empresa, base, consumidor, código de almacén…) | [glosario/negocio.md](glosario/negocio.md) |
| Qué sistemas existen y cómo se integran | [sistemas/mapa.md](sistemas/mapa.md) |
| Clasificación de datos y qué puede ver un agente | [seguridad-datos/clasificacion.md](seguridad-datos/clasificacion.md) |
| Decisiones de empresa | [ADR-E001](decisiones/ADR-E001-desarrollo-agentico-federado.md), [ADR-E002](decisiones/ADR-E002-politica-seguridad-agentes.md) |
| Lecciones candidatas (aún no son estándar) | [lecciones/README.md](lecciones/README.md) |

Reglas del brain: cada documento lleva `dueño`, `estado`, `revisado`, `vence` y `fuentes`.
Un documento vencido no se usa como norma: se avisa a su dueño. Lo verificable no se escribe aquí:
se convierte en hook, prueba o compuerta de CI del plugin `emba-harness`.
