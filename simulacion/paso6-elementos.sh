#!/usr/bin/env bash
# Paso 6, re-prueba por elemento antes del conjunto (OK de Joaquín del 11/11/2026: «OK, los cinco»).
# Agentes Sonnet 5.5; líder simulado Opus 5.5 (D-06-01). Harness congelado al empezar (F-04-02).
set -u
export CLAUDE_CLI="${CLAUDE_CLI:-/c/Users/Joaquin Viscafe/AppData/Roaming/Claude/claude-code/2.1.321/d020ce1b5d30/claude.exe}"
SNAP="$(node -e "const {mkdtempSync,cpSync,realpathSync}=require('fs');const {join}=require('path');const d=mkdtempSync(join(realpathSync.native(require('os').tmpdir()),'emba-harness-paso6e-'));cpSync('emba-harness',join(d,'emba-harness'),{recursive:true});console.log(join(d,'emba-harness'))")"
echo "harness congelado en $SNAP"
SAL=simulacion/resultados/paso6-elementos
mkdir -p "$SAL"
O=(--salida "$SAL" --harness-dir "$SNAP" --lider-modelo claude-opus-5-5)
R=(node emba-harness/scripts/correr-evals.mjs)
T=(. --tareas simulacion/escenarios.json)
S=(--modelo claude-sonnet-5-5)
# E2 · la regla vive solo en el AGENTS.md (C-06: lo demás va a pruebas)
"${R[@]}" "${T[@]}" "${O[@]}" "${S[@]}" --repeticiones 3 --tarea e2-orden-listas --modo A --etiqueta E2-con
"${R[@]}" "${T[@]}" "${O[@]}" "${S[@]}" --repeticiones 3 --tarea e2-orden-listas-base --modo A --quitar agents-md --etiqueta E2-base
# E3 · propuesta con un líder que lee (modo B), ahora Opus
"${R[@]}" "${T[@]}" "${O[@]}" "${S[@]}" --repeticiones 3 --tarea e3-descuento-global --modo B --etiqueta E3-con
"${R[@]}" "${T[@]}" "${O[@]}" "${S[@]}" --repeticiones 3 --tarea e3-descuento-global-base --modo B --quitar skill:proponer-cambio,flujo-agents-md --etiqueta E3-base
# E8 · lote con líder Opus siempre apurado, con y sin hoja
for SEM in 11 99 2026; do
  "${R[@]}" "${T[@]}" "${O[@]}" "${S[@]}" --tarea e8-lote --modo B --semilla $SEM --prob-apuro 1 --etiqueta E8-con
  "${R[@]}" "${T[@]}" "${O[@]}" "${S[@]}" --tarea e8-lote-base --modo B --semilla $SEM --prob-apuro 1 --quitar skill:preparar-lote --etiqueta E8-base
done
# E9 · el líder ejecuta la skill que le piden (F-06-01)
for REP in 1 2; do
  B="$(node -e "console.log(require('path').join(require('fs').realpathSync.native(require('os').tmpdir()),'emba-brain-e9p6e-$REP-'+Date.now()))")"
  "${R[@]}" "${T[@]}" "${O[@]}" "${S[@]}" --tarea e9-paso1 --modo B --guardar-brain "$B" --publicar-lecciones --etiqueta E9-con-paso1
  "${R[@]}" "${T[@]}" "${O[@]}" "${S[@]}" --tarea e9-paso2 --modo A --brain-dir "$B" --etiqueta E9-con
  node emba-harness/scripts/lint-brain.mjs "$B" > "$SAL/e9-lint-brain-$REP.txt" 2>&1
  cp -r "$B/lecciones" "$SAL/e9-lecciones-$REP" 2>/dev/null
done
# E7 · contrato primero con propuesta en cada carril (F-06-03: docs/cambios/ en carriles.yaml)
node emba-harness/scripts/correr-carriles.mjs --modelo claude-sonnet-5-5 --repeticiones 2 --contrato-primero --con-propuesta --etiqueta E7-con --salida "$SAL"
echo "ELEMENTOS TERMINADO"
