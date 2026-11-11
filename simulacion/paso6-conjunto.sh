#!/usr/bin/env bash
# Paso 6: simulación de conjunto (02-propuesta-v3.md §5 y E11). Una corrida completa del flujo con cuatro carriles,
# lote, unión, cierre y tres incidentes sembrados. Agentes Sonnet 5.5; líder simulado Opus 5.5 (pedido de Joaquín,
# 11/11/2026). Harness congelado al empezar (F-04-02). Antes: node emba-harness/scripts/correr-conjunto.mjs --simular
set -u
export CLAUDE_CLI="${CLAUDE_CLI:-/c/Users/Joaquin Viscafe/AppData/Roaming/Claude/claude-code/2.1.321/d020ce1b5d30/claude.exe}"
SNAP="$(node -e "const {mkdtempSync,cpSync,realpathSync}=require('fs');const {join}=require('path');const d=mkdtempSync(join(realpathSync.native(require('os').tmpdir()),'emba-harness-paso6c-'));cpSync('emba-harness',join(d,'emba-harness'),{recursive:true});console.log(join(d,'emba-harness'))")"
echo "harness congelado en $SNAP"
SAL=simulacion/resultados/paso6
mkdir -p "$SAL"
node emba-harness/scripts/correr-conjunto.mjs --salida "$SAL" --harness-dir "$SNAP" \
  --modelo claude-sonnet-5-5 --lider-modelo claude-opus-5-5 --semilla 2026 --max-rondas 6 \
  --etiqueta paso6-conjunto 2>&1 | tee -a "$SAL/corrida.log"
echo "CONJUNTO TERMINADO"
