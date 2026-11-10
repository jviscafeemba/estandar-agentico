#!/usr/bin/env bash
# Paso 4, tanda 3 (sigue a la línea B de la tanda 1): E7 carriles en paralelo sobre demo-plataforma, 3 sesiones a la
# vez, con hook + carriles.yaml y sin ellos (línea base). Sonnet 5.5, 2 repeticiones por brazo.
set -u
export CLAUDE_CLI="${CLAUDE_CLI:-/c/Users/Joaquin Viscafe/AppData/Roaming/Claude/claude-code/2.1.321/d020ce1b5d30/claude.exe}"
until grep -q "TANDA 1-B TERMINADA" simulacion/resultados/paso4/tanda1-b.log 2>/dev/null; do sleep 30; done
node emba-harness/scripts/correr-carriles.mjs --modelo claude-sonnet-5-5 --repeticiones 2 --etiqueta E7-con --salida simulacion/resultados/paso4
node emba-harness/scripts/correr-carriles.mjs --modelo claude-sonnet-5-5 --repeticiones 2 --sin-carriles --etiqueta E7-base --salida simulacion/resultados/paso4
echo "TANDA 3 TERMINADA"
