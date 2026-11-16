# Plan de cambios · <proyecto>

Cada cambio tiene su spec (OpenSpec en nivel 3, `docs/cambios/` en los demás) con los supuestos respondidos, que una
persona aprueba antes de implementar, y su propio PR. Un cambio no empieza hasta que el cambio del que depende está
unido a la rama integrada.

## Cambios

| ID | Cambio | Requerimientos | Depende de | Pantallas | Meta |
| --- | --- | --- | --- | --- | --- |
| C-00 | Montaje del método: harness fijado, CI y pruebas del método | RNF-0xx | — | no | dd/mm/aaaa |
| C-01 | <cambio> | RF-0xx a RF-0xx | C-00 | sí / no | dd/mm/aaaa |

«Pantallas: sí» significa que el cambio agrega o modifica algo que ve una persona. Ese cambio cita
`docs/diseno/estilo-visual.md` en su spec, y su PR lleva capturas (skill `mirar-producto`).

## Temas transversales

Los requerimientos describen funciones. Lo que el usuario espera sin pedirlo (que la app se vea bien, que se pueda
usar con el teclado, que responda rápido, que alguien sepa operarla) no sale de ningún RF. Por eso el plan lo asigna
explícitamente (0.4.0, lección P-029 de ai-desempeno). Cada fila lleva un cambio `C-0n` o «fuera de alcance» con el OK
de una persona y la fecha: `fuera de alcance (OK: <persona>, dd/mm/aaaa)`. `verificar-proyecto` falla si una fila
queda sin ninguna de las dos.

| Tema | Cambio | Qué incluye |
| --- | --- | --- |
| Interfaz y marca | C-0n | `docs/diseno/estilo-visual.md`: tokens, componentes base, marca por empresa o ámbito |
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
