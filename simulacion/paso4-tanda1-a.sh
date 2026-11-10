#!/usr/bin/env bash
# Paso 4, tanda 1, línea A: E1 (brain de empresa) y E2 (AGENTS.md). Sonnet 5.5, 3 repeticiones, modo A.
# proteger-pruebas se quita en los dos brazos: codigo-almacen exige cambiar pruebas existentes y el hook (E4)
# confundiría lo que se mide (D-04-02).
set -u
export CLAUDE_CLI="${CLAUDE_CLI:-/c/Users/Joaquin Viscafe/AppData/Roaming/Claude/claude-code/2.1.321/d020ce1b5d30/claude.exe}"
S="--salida simulacion/resultados/paso4 --modelo claude-sonnet-5-5 --modo A --repeticiones 3"
R="node emba-harness/scripts/correr-evals.mjs"
$R proyectos/demo-facturas   --tarea numero-factura,descuento-por-linea --elemento E1 --quitar hook:proteger-pruebas --etiqueta E1-con $S
$R proyectos/demo-facturas   --tarea numero-factura,descuento-por-linea --elemento E1 --quitar hook:proteger-pruebas,brain-empresa --etiqueta E1-base $S
$R proyectos/demo-inventario --tarea codigo-almacen --elemento E1 --quitar hook:proteger-pruebas --etiqueta E1-con $S
$R proyectos/demo-inventario --tarea codigo-almacen --elemento E1 --quitar hook:proteger-pruebas,brain-empresa --etiqueta E1-base $S
$R proyectos/demo-facturas   --tarea anular-factura --elemento E2 --quitar hook:proteger-pruebas --etiqueta E2-con $S
$R proyectos/demo-facturas   --tarea anular-factura --elemento E2 --quitar hook:proteger-pruebas,agents-md --etiqueta E2-base $S
$R proyectos/demo-inventario --tarea transferencia --elemento E2 --quitar hook:proteger-pruebas --etiqueta E2-con $S
$R proyectos/demo-inventario --tarea transferencia --elemento E2 --quitar hook:proteger-pruebas,agents-md --etiqueta E2-base $S
echo "TANDA 1-A TERMINADA"
