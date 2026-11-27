---
dueño: plataforma-agentica
estado: candidata
revisado: 2026-11-27
vence: 2027-01-26
fuentes: ["ai-genesys, Fase 1.5 (gobernanza): docs/procesos/plantilla.md (23/11/2026)", README.md]
---
# Plantilla de página de proceso

Copiar el bloque a `docs/procesos/<area>/<proceso>.md` del proyecto y llenar. Reglas: [README.md](README.md).
Ejemplo lleno: [ai-genesys, Finanzas](https://github.com/gcastillo-emba/ai-genesys/tree/main/docs/procesos/finanzas).

```markdown
# <AREA>-Pnn · <Nombre del proceso>

<Una frase: qué abarca, desde dónde hasta dónde.> Dominios: <partes del producto que lo consumen>.
Dueño: <de la matriz de dueños; «(prov.)» si es provisional>.

**Lo que se sabe:** <3 a 5 frases. Cada afirmación con su nivel de evidencia y su fuente:
(dato: …), (declarado: documento:línea), (código: archivo:línea), (hipótesis).>

| ID | Operación | Frecuencia | Disparador | Responsable | Rastro | Evidencia | Sistema | Reglas | Dueño |
|---|---|---|---|---|---|---|---|---|---|
| <ID del catálogo del área; si no está, letra del bloque + número nuevo, «fuera del catálogo»> | | (nivel) | (nivel) | rol, nunca nombre (nivel) | qué queda registrado (nivel) | fuente citable | tablas, campos, tipos de documento | IDs de requisitos, o «—» | |

**Cuadrante:**

| | Impacto estructural bajo | Impacto estructural alto |
|---|---|---|
| **Alta frecuencia** | | |
| **Baja frecuencia** | | |

**Sin evidencia (a relevar):** <operaciones sin evidencia; van también a la lista de relevamiento del proyecto.>
Preguntas abiertas: <IDs del registro de preguntas del proyecto.>

**Requisitos sin fila:** <requisitos del proceso que no son de una operación (consultas, pantallas, controles), o «ninguno».>
```

## Matriz de dueños

Un archivo por proyecto, `docs/procesos/duenos.yaml`, una fila por proceso. El ID no se reutiliza ni se renumera.

```yaml
version: 1
procesos:
  - id: <AREA>-P01
    nombre: <proceso>
    pagina: <area>/<proceso>.md     # relativa a docs/procesos/
    dominios: []                    # el primero es el principal
    tablas: []                      # tablas fuente que deja el proceso
    fuera_del_sistema: []           # planillas, correos, papeles (sin nombres de archivo reales)
    dueno: {nombre: <persona>, rol: <rol>, provisional: true, desde: dd/mm/aaaa}
    relevar: true                   # true si hay operaciones sin evidencia
```
