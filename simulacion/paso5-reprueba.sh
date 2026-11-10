#!/usr/bin/env bash
# Paso 5, línea 1: re-prueba de lo que falló en el paso 4, con la propuesta v3.1 (C-01 a C-06). Sonnet 5.5 salvo
# donde dice. Harness congelado al empezar.
set -u
export CLAUDE_CLI="${CLAUDE_CLI:-/c/Users/Joaquin Viscafe/AppData/Roaming/Claude/claude-code/2.1.321/d020ce1b5d30/claude.exe}"
SNAP="$(node -e "const {mkdtempSync,cpSync,realpathSync}=require('fs');const {join}=require('path');const d=mkdtempSync(join(realpathSync.native(require('os').tmpdir()),'emba-harness-paso5-'));cpSync('emba-harness',join(d,'emba-harness'),{recursive:true});console.log(join(d,'emba-harness'))")"
echo "harness congelado en $SNAP"
O=(--salida simulacion/resultados/paso5 --harness-dir "$SNAP")
R=(node emba-harness/scripts/correr-evals.mjs)
T=(. --tareas simulacion/escenarios.json)
S=(--modelo claude-sonnet-5-5)
H=(--modelo claude-haiku-5-5)
# C-01/C-02 · E6 y E10 con el hook v3.2 (antes fallaban por falsos positivos), E4 cambio legítimo
"${R[@]}" proyectos/demo-facturas --tarea iva-configurable --elemento E6 "${O[@]}" "${S[@]}" --repeticiones 3 --modo A --permisos auto --etiqueta E6-con
"${R[@]}" proyectos/demo-facturas --tarea iva-configurable --elemento E6 "${O[@]}" "${H[@]}" --repeticiones 2 --modo A --permisos auto --etiqueta E6-con
"${R[@]}" "${T[@]}" "${O[@]}" "${S[@]}" --repeticiones 3 --tarea e6-comando-destructivo --modo A --etiqueta E6-con
"${R[@]}" "${T[@]}" "${O[@]}" "${H[@]}" --repeticiones 2 --tarea e6-pendiente-malicioso --modo A --etiqueta E6-con
"${R[@]}" "${T[@]}" "${O[@]}" "${S[@]}" --repeticiones 3 --tarea e10-hallazgo-fuera --modo A --etiqueta E10-con
"${R[@]}" "${T[@]}" "${O[@]}" "${S[@]}" --repeticiones 3 --tarea e4-codigo-almacen --modo B --etiqueta E4-con-B
"${R[@]}" "${T[@]}" "${O[@]}" "${S[@]}" --repeticiones 3 --tarea e4-prueba-contradice --modo A --etiqueta E4-con
# C-05 · propuesta aprobada sin leer (modo A): ¿el agente repregunta los supuestos?
"${R[@]}" "${T[@]}" "${O[@]}" "${S[@]}" --repeticiones 3 --tarea e3-descuento-global --modo A --etiqueta E3-con-A
# E8 · líder siempre apurado (D-05-01)
for SEM in 11 99 2026; do
  "${R[@]}" "${T[@]}" "${O[@]}" "${S[@]}" --tarea e8-lote --modo B --semilla $SEM --prob-apuro 1 --etiqueta E8-con
  "${R[@]}" "${T[@]}" "${O[@]}" "${S[@]}" --tarea e8-lote-base --modo B --semilla $SEM --prob-apuro 1 --quitar skill:preparar-lote --etiqueta E8-base
done
# C-04 · E9 con la lección publicada por la persona en la retro (simulado con --publicar-lecciones)
for REP in 1 2; do
  B="$(node -e "console.log(require('path').join(require('fs').realpathSync.native(require('os').tmpdir()),'emba-brain-e9p5-$REP-'+Date.now()))")"
  "${R[@]}" "${T[@]}" "${O[@]}" "${S[@]}" --tarea e9-paso1 --modo B --guardar-brain "$B" --publicar-lecciones --etiqueta E9-con-paso1
  "${R[@]}" "${T[@]}" "${O[@]}" "${S[@]}" --tarea e9-paso2 --modo A --brain-dir "$B" --etiqueta E9-con
  node emba-harness/scripts/lint-brain.mjs "$B" > "simulacion/resultados/paso5/e9-lint-brain-$REP.txt" 2>&1
  cp -r "$B/lecciones" "simulacion/resultados/paso5/e9-lecciones-$REP" 2>/dev/null
done
# C-03 · E7 con contrato primero
node emba-harness/scripts/correr-carriles.mjs --modelo claude-sonnet-5-5 --repeticiones 2 --contrato-primero --etiqueta E7-con --salida simulacion/resultados/paso5
echo "REPRUEBA TERMINADA"
