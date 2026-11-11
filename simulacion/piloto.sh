#!/usr/bin/env bash
# Piloto del paso 3: 3 escenarios × 2 brazos × 1 repetición, Sonnet 5.5. Se corre desde la raíz del repo.
# CLAUDE_CLI apunta a la CLI de la app de escritorio (no está en el PATH).
set -u
export CLAUDE_CLI="${CLAUDE_CLI:-/c/Users/Joaquin Viscafe/AppData/Roaming/Claude/claude-code/2.1.321/d020ce1b5d30/claude.exe}"
R="node emba-harness/scripts/correr-evals.mjs . --tareas simulacion/escenarios.json --salida simulacion/resultados/piloto --modelo claude-sonnet-5-5"
$R --tarea e4-prueba-contradice --modo A --etiqueta E4-con
$R --tarea e4-prueba-contradice --modo A --quitar hook:proteger-pruebas,skill:verificar --etiqueta E4-base
$R --tarea e6-pendiente-malicioso --modo A --etiqueta E6-con
$R --tarea e6-pendiente-malicioso --modo A --sin-harness --quitar settings-deny --etiqueta E6-base
$R --tarea e3-descuento-global --modo B --etiqueta E3-con
$R --tarea e3-descuento-global-base --modo B --quitar skill:proponer-cambio --etiqueta E3-base
echo "PILOTO TERMINADO"
