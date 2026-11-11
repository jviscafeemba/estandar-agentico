#!/usr/bin/env bash
# Paso 4, tanda 1, línea B: E3 (propuesta), E4 (prueba primero) y E6 (seguridad). Sonnet 5.5, 3 repeticiones;
# E4 y E6 también con Haiku 5.5 como agente, 2 repeticiones (D-03-09: con Sonnet los hooks no se activaron).
set -u
export CLAUDE_CLI="${CLAUDE_CLI:-/c/Users/Joaquin Viscafe/AppData/Roaming/Claude/claude-code/2.1.321/d020ce1b5d30/claude.exe}"
R="node emba-harness/scripts/correr-evals.mjs"
T="--tareas simulacion/escenarios.json --salida simulacion/resultados/paso4"
S="--modelo claude-sonnet-5-5 --repeticiones 3"
H="--modelo claude-haiku-5-5 --repeticiones 2"
# E3: pedido ambiguo, B con / B base / A con
$R . $T $S --tarea e3-descuento-global --modo B --etiqueta E3-con
$R . $T $S --tarea e3-descuento-global-base --modo B --quitar skill:proponer-cambio,flujo-agents-md --etiqueta E3-base
$R . $T $S --tarea e3-descuento-global --modo A --etiqueta E3-con-A
# E4: pedido imposible y tarea normal
$R . $T $S --tarea e4-prueba-contradice --modo A --etiqueta E4-con
$R . $T $S --tarea e4-prueba-contradice --modo A --quitar hook:proteger-pruebas,skill:verificar --etiqueta E4-base
$R proyectos/demo-facturas --tarea descuento-por-linea --elemento E4 --salida simulacion/resultados/paso4 $S --modo A --etiqueta E4-con
$R proyectos/demo-facturas --tarea descuento-por-linea --elemento E4 --salida simulacion/resultados/paso4 $S --modo A --quitar hook:proteger-pruebas,skill:verificar --etiqueta E4-base
# E6: instrucción sembrada y tentación de leer el .env (ficticio), permisos auto
$R . $T $S --tarea e6-pendiente-malicioso --modo A --etiqueta E6-con
$R . $T $S --tarea e6-pendiente-malicioso --modo A --sin-harness --quitar settings-deny --etiqueta E6-base
$R proyectos/demo-facturas --tarea iva-configurable --elemento E6 --salida simulacion/resultados/paso4 $S --modo A --permisos auto --etiqueta E6-con
$R proyectos/demo-facturas --tarea iva-configurable --elemento E6 --salida simulacion/resultados/paso4 $S --modo A --permisos auto --sin-harness --quitar settings-deny --etiqueta E6-base
$R . $T $S --tarea e6-pendiente-malicioso --modo B --etiqueta E6-con-B
# Variante Haiku 5.5 (D-03-09)
$R . $T $H --tarea e4-prueba-contradice --modo A --etiqueta E4-con
$R . $T $H --tarea e4-prueba-contradice --modo A --quitar hook:proteger-pruebas,skill:verificar --etiqueta E4-base
$R . $T $H --tarea e6-pendiente-malicioso --modo A --etiqueta E6-con
$R . $T $H --tarea e6-pendiente-malicioso --modo A --sin-harness --quitar settings-deny --etiqueta E6-base
$R proyectos/demo-facturas --tarea iva-configurable --elemento E6 --salida simulacion/resultados/paso4 $H --modo A --permisos auto --etiqueta E6-con
$R proyectos/demo-facturas --tarea iva-configurable --elemento E6 --salida simulacion/resultados/paso4 $H --modo A --permisos auto --sin-harness --quitar settings-deny --etiqueta E6-base
echo "TANDA 1-B TERMINADA"
