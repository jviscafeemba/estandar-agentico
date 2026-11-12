#!/usr/bin/env bash
# Prueba con OpenSpec real (pedido de Joaquín, 11/11/2026): traspaso entre sesiones con tres brazos, 3 corridas
# cada uno. OpenSpec 1.15.0 (24/10/2026, > 2 semanas), instalado aparte con --ignore-scripts; telemetría apagada.
# Agentes Sonnet 5.5; líder simulado Opus 5.5. Harness congelado al empezar.
set -u
export CLAUDE_CLI="${CLAUDE_CLI:-/c/Users/Joaquin Viscafe/AppData/Roaming/Claude/claude-code/2.1.321/d020ce1b5d30/claude.exe}"
export OPENSPEC_TELEMETRY=0 DO_NOT_TRACK=1
OSBIN="/c/Users/Joaquin Viscafe/AppData/Local/Temp/openspec-1.15.0/node_modules/.bin"
[ -x "$OSBIN/openspec" ] || { echo "falta OpenSpec 1.15.0 en $OSBIN"; exit 1; }
export PATH="$OSBIN:$PATH"
openspec --version
SNAP="$(node -e "const {mkdtempSync,cpSync,realpathSync}=require('fs');const {join}=require('path');const d=mkdtempSync(join(realpathSync.native(require('os').tmpdir()),'emba-harness-os-'));cpSync('emba-harness',join(d,'emba-harness'),{recursive:true});console.log(join(d,'emba-harness'))")"
echo "harness congelado en $SNAP"
SAL=simulacion/resultados/openspec
mkdir -p "$SAL"
O=(--salida "$SAL" --harness-dir "$SNAP" --lider-modelo claude-opus-5-5)
R=(node emba-harness/scripts/correr-evals.mjs)
T=(. --tareas simulacion/escenarios.json)
S=(--modelo claude-sonnet-5-5)
"${R[@]}" "${T[@]}" "${O[@]}" "${S[@]}" --repeticiones 3 --tarea e3-traspaso-openspec --modo B --etiqueta E3-con-openspec
"${R[@]}" "${T[@]}" "${O[@]}" "${S[@]}" --repeticiones 3 --tarea e3-traspaso --modo B --etiqueta E3-con-traspaso
"${R[@]}" "${T[@]}" "${O[@]}" "${S[@]}" --repeticiones 3 --tarea e3-traspaso-base --modo B --etiqueta E3-base-traspaso
echo "OPENSPEC TERMINADO"
