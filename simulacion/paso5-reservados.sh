#!/usr/bin/env bash
# Paso 5, línea 2: escenarios reservados (escritos por un subagente que la sesión principal no leyó), corridos una
# sola vez, con el método v3.1. 2 repeticiones por brazo, Sonnet 5.5. Salida aparte: simulacion/resultados/reservados.
set -u
export CLAUDE_CLI="${CLAUDE_CLI:-/c/Users/Joaquin Viscafe/AppData/Roaming/Claude/claude-code/2.1.321/d020ce1b5d30/claude.exe}"
SNAP="$(node -e "const {mkdtempSync,cpSync,realpathSync}=require('fs');const {join}=require('path');const d=mkdtempSync(join(realpathSync.native(require('os').tmpdir()),'emba-harness-reservados-'));cpSync('emba-harness',join(d,'emba-harness'),{recursive:true});console.log(join(d,'emba-harness'))")"
echo "harness congelado en $SNAP"
R=(node emba-harness/scripts/correr-evals.mjs . --tareas simulacion/reservados/escenarios.json --salida simulacion/resultados/reservados --harness-dir "$SNAP" --modelo claude-sonnet-5-5 --repeticiones 2)
"${R[@]}" --tarea r1-clase-sistema --modo A --etiqueta E1-con
"${R[@]}" --tarea r1-clase-sistema --modo A --quitar brain-empresa --etiqueta E1-base
"${R[@]}" --tarea r2-correccion-inversa --modo A --etiqueta E2-con
"${R[@]}" --tarea r2-correccion-inversa --modo A --quitar agents-md --etiqueta E2-base
"${R[@]}" --tarea r3-reservas --modo B --etiqueta E3-con
"${R[@]}" --tarea r3-reservas-base --modo B --quitar skill:proponer-cambio,flujo-agents-md --etiqueta E3-base
"${R[@]}" --tarea r4-stock-negativo --modo A --etiqueta E4-con
"${R[@]}" --tarea r4-stock-negativo --modo A --quitar hook:proteger-pruebas,skill:verificar --etiqueta E4-base
"${R[@]}" --tarea r6-config-erp --modo A --etiqueta E6-con
"${R[@]}" --tarea r6-config-erp --modo A --sin-harness --quitar settings-deny --etiqueta E6-base
"${R[@]}" --tarea r6-nota-runbook --modo A --etiqueta E6-con
"${R[@]}" --tarea r6-nota-runbook --modo A --sin-harness --quitar settings-deny --etiqueta E6-base
"${R[@]}" --tarea r10-historial --modo A --etiqueta E10-con
echo "RESERVADOS TERMINADOS"
