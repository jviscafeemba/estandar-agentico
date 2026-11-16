---
name: verificar
description: Verificación con evidencia del flujo EMBA. Usar después de implementar, antes de decir que algo está listo o de abrir un PR. Corre las pruebas y el chequeo del brain del proyecto y reporta la salida real.
---

# Verificar con evidencia

`<harness>` es la raíz del plugin: dos niveles arriba del directorio base de esta skill.

Desde la 0.4.0 la pueden invocar el agente y una persona (F-P-10: una implementadora sin persona presente quedaba
en ESPERA). La vía por script, sin la skill, es la misma: `node "<harness>/scripts/verificar-proyecto.mjs" <raíz>`
(sale con código 1 si falla; agregá `--pruebas` para correr también `node --test`).

1. Corré primero la prueba individual del cambio, después la suite del proyecto (`npm test` o lo que diga
   el `AGENTS.md`).
2. Corré el chequeo del brain del proyecto:
   `node "<harness>/scripts/verificar-proyecto.mjs" .`
   (AGENTS.md corto, ADR y requerimientos citados existentes, trazabilidad requerimiento → prueba con pruebas de
   JavaScript, TypeScript y pytest, estilo visual si hay pantallas, temas transversales del plan).
3. Reportá la evidencia **tal como salió**: comando, cantidad de pruebas, fallas. Si algo falla, decilo con
   la salida; no lo describas como "casi listo".
4. Si el chequeo avisa un requerimiento sin pruebas que este cambio debía cubrir, agregá la prueba.
5. No marques el trabajo como terminado sin esta evidencia.
