---
dueño: plataforma-agentica
estado: vigente
revisado: 2026-11-13
vence: 2027-02-11
fuentes: ["ai-desempeno: P-029 y reporte final del piloto (13/11/2026)", "emba-harness 0.4.0: plantillas/estilo-visual.md"]
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
