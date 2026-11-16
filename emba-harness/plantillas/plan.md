# Plan de cambios · <proyecto>

Cada cambio tiene su spec (OpenSpec en nivel 3, `docs/cambios/` en los demás) con los supuestos respondidos, que una
persona aprueba antes de implementar, y su propio PR. Un cambio no empieza hasta que el cambio del que depende está
unido a la rama integrada.

## Cambios

| ID | Cambio | Requerimientos | Depende de | Pantallas | Meta |
| --- | --- | --- | --- | --- | --- |
| C-00 | Montaje del método: harness fijado, CI y pruebas del método | RNF-0xx | — | no | dd/mm/aaaa |

**Fijar o subir la versión del harness** (0.4.2, F-C08-01): el commit del harness vive en el CI
(`.github/workflows/ci.yml`) y, si el proyecto lo fija también en una prueba del método (por ejemplo
`tests/metodo.test.mjs`), en esa prueba. Al subir de versión se cambian los dos en el mismo commit. La prueba tiene que
estar en «Pruebas existentes autorizadas» del cambio que sube la versión. Antes de unir, leé la sección «Al subir» del
CHANGELOG del harness.
| C-01 | <cambio> | RF-0xx a RF-0xx | C-00 | sí / no | dd/mm/aaaa |

«Pantallas: sí» significa que el cambio agrega o modifica algo que ve una persona. Ese cambio cita
`docs/diseno/estilo-visual.md` en su spec, y su PR lleva capturas (skill `mirar-producto`).

## Temas transversales

Los requerimientos describen funciones. Lo que el usuario espera sin pedirlo (que la app se vea bien, que se pueda
usar con el teclado, que responda rápido, que alguien sepa operarla) no sale de ningún RF. Por eso el plan lo asigna
explícitamente (0.4.0, lección P-029 de ai-desempeno). Cada fila lleva un cambio `C-0n` o «fuera de alcance» con el OK
de una persona y la fecha: `fuera de alcance (OK: <persona>, dd/mm/aaaa)`. `verificar-proyecto` falla si una fila
queda sin ninguna de las dos.

La interfaz se diseña y se revisa con **Claude Design** salvo que una persona diga lo contrario (0.4.1). El diseño va
**antes** de la spec del primer cambio con pantallas (0.4.2): el agente prepara el catálogo y propone direcciones
(skill `disenar-interfaz`), una persona elige en Claude Design, y recién después se escriben el estilo visual y la
spec. Para no
usarlo, la fila dice `sin Claude Design (OK: <persona>, dd/mm/aaaa)` en lugar de `Claude Design`. `verificar-proyecto`
falla si la fila de interfaz no dice ninguna de las dos.

| Tema | Cambio | Qué incluye |
| --- | --- | --- |
| Interfaz y marca | C-0n · Claude Design | `docs/diseno/estilo-visual.md`: tokens, componentes base, marca por empresa o ámbito; revisión visual en Claude Design |
| Accesibilidad | C-0n | WCAG 2.2 AA: contraste, teclado, etiquetas, foco visible; prueba automática con axe |
| Rendimiento | C-0n | Tiempos de respuesta esperados y volumen de datos de prueba |
| Operación | C-0n | `RUNBOOK.md`: arranque, salud, respaldo, logs y a quién llamar |

## Mirada al producto

Una persona ve la app funcionando (skill `mirar-producto`) en dos momentos:
1. después del primer cambio con pantallas: <C-0n>;
2. al cierre del plan, antes del PR final a `main`.

## Fechas

| Fecha | Hito |
| --- | --- |
| dd/mm/aaaa | <hito> |
