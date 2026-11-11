#!/usr/bin/env bash
# Paso 6, previo: re-prueba por separado de E3 (modo A) y E9 con las correcciones v3.3
# (F-05-03 guion, F-05-05 cierre mixto = espera, F-05-06 candidatas se aplican, F-05-07 fuentes como texto).
# Agente Sonnet 5.5; líder simulado Opus 5.5 (pedido de Joaquín, 11/11/2026). Harness congelado al empezar.
set -u
export CLAUDE_CLI="${CLAUDE_CLI:-/c/Users/Joaquin Viscafe/AppData/Roaming/Claude/claude-code/2.1.321/d020ce1b5d30/claude.exe}"
SNAP="$(node -e "const {mkdtempSync,cpSync,realpathSync}=require('fs');const {join}=require('path');const d=mkdtempSync(join(realpathSync.native(require('os').tmpdir()),'emba-harness-paso6-'));cpSync('emba-harness',join(d,'emba-harness'),{recursive:true});console.log(join(d,'emba-harness'))")"
echo "harness congelado en $SNAP"
SAL=simulacion/resultados/paso6-previo
O=(--salida "$SAL" --harness-dir "$SNAP" --lider-modelo claude-opus-5-5)
R=(node emba-harness/scripts/correr-evals.mjs)
T=(. --tareas simulacion/escenarios.json)
S=(--modelo claude-sonnet-5-5)
# E3 · propuesta aprobada sin leer, con el cierre mixto contado como espera
"${R[@]}" "${T[@]}" "${O[@]}" "${S[@]}" --repeticiones 3 --tarea e3-descuento-global --modo A --etiqueta E3-con-A
# E9 · lección publicada en la retro; en el segundo proyecto la candidata se aplica
for REP in 1 2; do
  B="$(node -e "console.log(require('path').join(require('fs').realpathSync.native(require('os').tmpdir()),'emba-brain-e9p6-$REP-'+Date.now()))")"
  "${R[@]}" "${T[@]}" "${O[@]}" "${S[@]}" --tarea e9-paso1 --modo B --guardar-brain "$B" --publicar-lecciones --etiqueta E9-con-paso1
  "${R[@]}" "${T[@]}" "${O[@]}" "${S[@]}" --tarea e9-paso2 --modo A --brain-dir "$B" --etiqueta E9-con
  node emba-harness/scripts/lint-brain.mjs "$B" > "$SAL/e9-lint-brain-$REP.txt" 2>&1
  cp -r "$B/lecciones" "$SAL/e9-lecciones-$REP" 2>/dev/null
done
echo "PREVIO TERMINADO"
