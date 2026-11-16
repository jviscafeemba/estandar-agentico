---
dueño: plataforma-agentica
estado: vigente
revisado: 2026-11-16
vence: 2027-02-14
fuentes: ["ai-desempeno: P-029 y reporte final del piloto (13/11/2026)", "emba-harness 0.4.1: plantillas/estilo-visual.md", "Joaquín: Claude Design como estándar (16/11/2026)"]
---
# Interfaz de las aplicaciones internas

Base común para todo proyecto con pantallas. Lo propio de cada proyecto (tokens concretos, marca por ámbito,
componentes y pantallas de ejemplo) vive en su `docs/diseno/estilo-visual.md`, que se arma desde la plantilla
`emba-harness/plantillas/estilo-visual.md` y no repite este documento.

**Por qué existe.** En el piloto de ai-desempeno ningún requerimiento pedía diseño visual. La app pasó todas sus
pruebas y salió sin ningún estilo: lo que el usuario espera sin pedirlo no sale de ningún RF. Desde la 0.4.0 el
plan asigna la interfaz como tema transversal y el harness lo exige.

## Lo que todo proyecto con pantallas tiene

1. Un RNF de interfaz que cita su `docs/diseno/estilo-visual.md`.
2. Tokens (colores, tipografía, espaciado) en **un solo** archivo de código. Los componentes no usan valores sueltos.
3. Componentes base propios: botón, campo, tabla, mensaje, diálogo, encabezado.
4. **CSS propio con tokens** como opción por defecto. Para los controles difíciles de hacer accesibles (diálogo,
   combobox, menú) se usa una librería sin estilos ("headless"), decidida en un ADR del proyecto. Un framework visual
   completo también requiere ADR.
5. Capturas en cada PR con pantallas, y una persona que ve la app funcionando después del primer cambio con
   pantallas y al cierre (skill `emba-harness:mirar-producto`).
6. **Claude Design** para diseñar y revisar la interfaz, salvo que el plan diga «sin Claude Design (OK: persona,
   dd/mm/aaaa)». Ver la sección siguiente.

## Claude Design

Herramienta estándar de diseño y revisión visual de la empresa desde el 16/11/2026. Se prueba primero en C-08 de
ai-desempeno.

- **Para qué:** **diseñar** la dirección visual antes de la spec, y después ver y comentar los tokens, los componentes
  base y las pantallas de ejemplo de un proyecto.
- **Paso de diseño, antes de la spec** (desde 16/11/2026, lección F-C08-05 de ai-desempeno). En el primer cambio con
  pantallas, la secuencia es esta:
  1. el agente arma el catálogo inicial con datos sintéticos y propone 2 o 3 direcciones, con prompts para Claude
     Design (skill `emba-harness:disenar-interfaz`);
  2. una persona corre `/design-sync`, explora las direcciones en Claude Design y elige una;
  3. recién entonces se escribe `estilo-visual.md`, con el enlace, «Dirección elegida por: persona, dd/mm/aaaa» y
     capturas de lo elegido.

  Una spec con pantallas se aprueba **viendo** esas capturas o el proyecto, no leyendo una tabla de tokens.
- **Fuente de verdad:** el repositorio. `docs/diseno/estilo-visual.md` y el código mandan. Lo que se decide en
  Claude Design entra al repo por el flujo de siempre (spec, prueba, PR).
- **Sincronización:** la hace una persona con `/design-sync`. La arranca a mano y aprueba cada plan de archivos.
  El agente deja la librería de componentes lista, pero no sincroniza.
- **Regla de datos:** a claude.ai se suben solo componentes y pantallas con **datos sintéticos**. Nunca datos de
  personas: la clase «Personal» de [la clasificación](../seguridad-datos/clasificacion.md) no sale del repositorio.
  Es una salida de datos (E6) permitida solo para eso.
- **Aviso:** Claude Design independiente (claude.ai/design) cierra el 14/12/2026 y pasa a vivir dentro de Claude.
  Este estándar nombra «Claude Design» sin fijar la dirección web. Se revisa cuando termine la mudanza.

## Accesibilidad (WCAG 2.2 AA)

- Contraste de texto ≥ 4,5:1 (≥ 3:1 en texto grande, bordes de controles e íconos con significado).
- Todo se puede usar con el teclado, en un orden lógico y con el foco siempre visible.
- Todo campo tiene etiqueta visible; el error se asocia al campo y dice cómo corregirlo.
- El color nunca es la única señal: un estado también lleva texto o ícono.
- Una prueba automática (axe o equivalente) corre sobre las pantallas de ejemplo.

## Estados de cada pantalla

Toda pantalla que muestra datos define cuatro estados: **cargando**, **vacío** (qué hacer para que haya datos),
**error** (qué pasó y qué hacer) y **sin permiso** (a quién pedirlo). La spec los nombra en escenarios.

## Textos

- En español, con trato de usted y frases cortas. Los botones dicen la acción («Guardar borrador», no «Aceptar»).
- Fechas dd/mm/aaaa. Montos según [L-001](../lecciones/L-001-montos-en-bs.md) mientras sea candidata.
- Los mensajes no muestran detalles técnicos (trazas, SQL, IDs internos); esos van al log.
- Los términos de negocio siguen el [glosario](../glosario/negocio.md).

## Marca por empresa

| Empresa | Logo | Color primario | Fuente |
| --- | --- | --- | --- |
| EMBA | pendiente | pendiente | pendiente |
| Gabriel / GPTO | pendiente | pendiente | pendiente |

Pendiente: el manual de marca de cada empresa. Hasta que el área dueña lo entregue, cada proyecto usa una paleta
neutra provisional y deja la marca como pregunta abierta. **No se inventan colores ni logos.**

## Cómo se impone

Lo verificable no se escribe aquí. Lo impone `emba-harness` 0.4.0:
- `verificar-proyecto` falla si un proyecto con pantallas no tiene `docs/diseno/estilo-visual.md`, o si el plan
  deja un tema transversal sin asignar;
- la plantilla de `openspec/config.yaml` exige que toda spec con pantallas cite el estilo;
- los agentes `revisor-spec` y `revisor` lo contrastan.
