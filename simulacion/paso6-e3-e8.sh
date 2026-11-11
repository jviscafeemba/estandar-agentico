#!/usr/bin/env bash
# Paso 6: ajuste y re-prueba de E3 (spec tipo OpenSpec con traspaso entre sesiones) y E8 (la hoja filtra qué
# diffs ve el líder). OK de Joaquín del 11/11/2026; criterios fijados antes en D-06-05.
# Agentes Sonnet 5.5; líder simulado Opus 5.5. Harness congelado al empezar.
set -u
export CLAUDE_CLI="${CLAUDE_CLI:-/c/Users/Joaquin Viscafe/AppData/Roaming/Claude/claude-code/2.1.321/d020ce1b5d30/claude.exe}"
SNAP="$(node -e "const {mkdtempSync,cpSync,realpathSync}=require('fs');const {join}=require('path');const d=mkdtempSync(join(realpathSync.native(require('os').tmpdir()),'emba-harness-paso6s-'));cpSync('emba-harness',join(d,'emba-harness'),{recursive:true});console.log(join(d,'emba-harness'))")"
echo "harness congelado en $SNAP"
SAL=simulacion/resultados/paso6-e3-e8
mkdir -p "$SAL"
O=(--salida "$SAL" --harness-dir "$SNAP" --lider-modelo claude-opus-5-5)
R=(node emba-harness/scripts/correr-evals.mjs)
T=(. --tareas simulacion/escenarios.json)
S=(--modelo claude-sonnet-5-5)
"${R[@]}" "${T[@]}" "${O[@]}" "${S[@]}" --repeticiones 3 --tarea e3-traspaso --modo B --etiqueta E3-con-traspaso
"${R[@]}" "${T[@]}" "${O[@]}" "${S[@]}" --repeticiones 3 --tarea e3-traspaso-base --modo B --etiqueta E3-base-traspaso
for SEM in 11 99 2026; do
  "${R[@]}" "${T[@]}" "${O[@]}" "${S[@]}" --tarea e8-lote-hoja --modo B --semilla $SEM --prob-apuro 1 --etiqueta E8-con-hoja
  "${R[@]}" "${T[@]}" "${O[@]}" "${S[@]}" --tarea e8-lote-resumen --modo B --semilla $SEM --prob-apuro 1 --quitar skill:preparar-lote --etiqueta E8-base-resumen
done
echo "E3-E8 TERMINADO"
