#!/usr/bin/env bash
# Paso 4, tanda 2 relanzada (la primera falló al arrancar: la ruta del harness congelado tiene un espacio y se partía,
# F-04-04; y el revisor se negaba a usar la skill por disable-model-invocation, F-04-03). Mismo contenido que
# paso4-tanda2.sh, con los argumentos en un arreglo de bash.
set -u
export CLAUDE_CLI="${CLAUDE_CLI:-/c/Users/Joaquin Viscafe/AppData/Roaming/Claude/claude-code/2.1.321/d020ce1b5d30/claude.exe}"
SNAP="$(node -e "const {mkdtempSync,cpSync,realpathSync}=require('fs');const {join}=require('path');const d=mkdtempSync(join(realpathSync.native(require('os').tmpdir()),'emba-harness-tanda2-'));cpSync('emba-harness',join(d,'emba-harness'),{recursive:true});console.log(join(d,'emba-harness'))")"
echo "harness congelado en $SNAP"
R=(node emba-harness/scripts/correr-evals.mjs .)
T=(--tareas simulacion/escenarios.json --salida simulacion/resultados/paso4 --harness-dir "$SNAP" --modelo claude-sonnet-5-5)
# E3 · corrección chica
"${R[@]}" "${T[@]}" --repeticiones 3 --tarea e3-correccion-chica --modo B --etiqueta E3-con
"${R[@]}" "${T[@]}" --repeticiones 3 --tarea e3-correccion-chica-base --modo B --quitar skill:proponer-cambio,flujo-agents-md --etiqueta E3-base
# E4 · cambio legítimo de una prueba existente
"${R[@]}" "${T[@]}" --repeticiones 3 --tarea e4-codigo-almacen --modo B --etiqueta E4-con-B
# E6 · comando destructivo sembrado
"${R[@]}" "${T[@]}" --repeticiones 3 --tarea e6-comando-destructivo --modo A --etiqueta E6-con
"${R[@]}" "${T[@]}" --repeticiones 3 --tarea e6-comando-destructivo --modo A --sin-harness --quitar settings-deny --etiqueta E6-base
# E10 · hallazgo fuera de alcance
"${R[@]}" "${T[@]}" --repeticiones 3 --tarea e10-hallazgo-fuera --modo A --etiqueta E10-con
"${R[@]}" "${T[@]}" --repeticiones 3 --tarea e10-hallazgo-fuera-base --modo A --etiqueta E10-base
# E5 · revisión v3 / v2 y E5b con Opus
node evals-revisor/correr.mjs --variante v3 --repeticiones 2 --salida simulacion/resultados/paso4 --harness-dir "$SNAP" --modelo claude-sonnet-5-5 --etiqueta E5-con
node evals-revisor/correr.mjs --variante v2 --repeticiones 2 --salida simulacion/resultados/paso4 --harness-dir "$SNAP" --modelo claude-sonnet-5-5 --etiqueta E5-base
node evals-revisor/correr.mjs --variante v3 --repeticiones 2 --escenario descripcion-enganosa,instruccion-en-comentario --salida simulacion/resultados/paso4 --harness-dir "$SNAP" --modelo claude-opus-5-5 --etiqueta E5b-opus
# E8 · lote, semillas 11 y 99 (apurado) y 2026 (con tiempo)
for SEM in 11 99 2026; do
  "${R[@]}" "${T[@]}" --tarea e8-lote --modo B --semilla $SEM --etiqueta E8-con
  "${R[@]}" "${T[@]}" --tarea e8-lote-base --modo B --semilla $SEM --quitar skill:preparar-lote --etiqueta E8-base
done
# E9 · cierre y lecciones
for REP in 1 2; do
  B="$(node -e "console.log(require('path').join(require('fs').realpathSync.native(require('os').tmpdir()),'emba-brain-e9-$REP-'+Date.now()))")"
  "${R[@]}" "${T[@]}" --tarea e9-paso1 --modo B --guardar-brain "$B" --etiqueta E9-con-paso1 --elemento E9-paso1
  "${R[@]}" "${T[@]}" --tarea e9-paso2 --modo A --brain-dir "$B" --etiqueta E9-con
  node emba-harness/scripts/lint-brain.mjs "$B" > "simulacion/resultados/paso4/e9-lint-brain-$REP.txt" 2>&1
  cp -r "$B/lecciones" "simulacion/resultados/paso4/e9-lecciones-$REP" 2>/dev/null
  "${R[@]}" "${T[@]}" --tarea e9-paso2 --modo A --etiqueta E9-base
done
echo "TANDA 2 TERMINADA (relanzada)"
