# Verificación oculta · <C-0n>

Elemento E12 del método (0.4.0; salió del piloto de ai-desempeno). Son chequeos que escribe la orquestadora (o una
persona) a partir de la spec aprobada, **antes** de lanzar la implementación, y que la implementadora no ve. Corren
sobre la rama integrada después de unir el cambio. Una falla que llegue ahí es un defecto escapado (indicador M4).

## Reglas

1. **Cuándo:** después de aprobar la spec y antes de lanzar la implementadora. Si se escribe después, se dice en el
   registro, porque pierde independencia (F-P-15).
2. **Dónde:** fuera del repositorio del proyecto y fuera del worktree de la implementadora (por ejemplo, la carpeta
   de notas de la orquestadora: `<carpeta>/verificacion-oculta/<C-0n>/`). En el repo solo queda el resultado.
3. **De dónde sale:** solo de la spec, los requerimientos y los ADR. Sin leer el código del cambio.
4. **Qué chequea:** los escenarios de la spec con valores propios, distintos de los de los ejemplos; los bordes
   (vacío, límite, redondeo, permisos); lo que el revisor de spec marcó como riesgo.
5. **Antes de contar una falla como defecto** se revisa: en el piloto hubo 19 falsas fallas por formatos que la spec
   no fijaba (F-P-13). Si la spec era ambigua, la falla se anota contra la spec, no contra el código.

## Chequeos

| ID | Escenario de la spec | Qué se ejecuta | Resultado esperado |
| --- | --- | --- | --- |
| VO-<C-0n>-01 | <requisito / escenario> | <comando o llamada> | <valor exacto> |

## Resultado sobre la rama integrada

| Fecha | Commit | Pasan | Fallan | Fallas revisadas | Defectos escapados |
| --- | --- | --- | --- | --- | --- |
| dd/mm/aaaa | <sha> | | | | |
