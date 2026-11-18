---
name: mirar-producto
description: Mirada al producto del flujo EMBA. Levanta la app, saca capturas de las pantallas del cambio y pide la mirada de una persona ANTES de abrir el PR. Usar en todo cambio con pantallas antes del PR, y obligatoriamente después del primer cambio con pantallas y al cierre del plan.
---

# Mirada al producto

`<harness>` es la raíz del plugin: dos niveles arriba del directorio base de esta skill.

Las pruebas dicen si la app hace lo que la spec pide; no dicen si se ve bien ni si una persona entendería la
pantalla. En el piloto de ai-desempeno la app pasó 365 pruebas y no tenía ningún estilo (P-029). En la corrida 1 de
C-08 pasó todo y la persona la vio «horrible» recién al final (F-C08-05). Esta skill hace que alguien la vea **antes**
del PR, cuando todavía es barato corregir.

1. **Levantá la app** con el comando que diga el `AGENTS.md` o el `RUNBOOK.md` (por ejemplo `docker compose up -d`).
   Comprobá que responde: `curl -fsS http://localhost:<puerto>/<salud>`, que está permitido contra loopback. Usá
   solo datos sintéticos.
2. **Sacá las capturas con el script del harness**, que guarda PNG sin instalar nada (usa Chrome o Edge sin ventana y
   solo abre direcciones de la propia máquina):
   1. escribí `docs/capturas/<C-0n>/capturas.json` con las pantallas del cambio (las de la sección «Pantallas» de
      la spec y, al cierre del plan, todas las de `estilo-visual.md` §5), los anchos (escritorio y unos 400 px) y los
      esquemas (`light` y, si el estilo define modo oscuro, `dark`). Para ver una pantalla con sesión, usá una cookie
      **sintética** en `cookies`;
   2. si la app cambia de pantalla por estado y no por ruta (ingresar, elegir una pestaña), dale a cada pantalla sus
      **pasos**: `escribir`, `clic` (por texto o selector) y `esperarTexto` (0.4.3). Un paso que no encuentra su
      control hace fallar la captura en rojo: si falla, corregí el paso; no informes las demás como buenas;
   3. corré `node "<harness>/scripts/capturar.mjs" docs/capturas/<C-0n>/capturas.json --estricto`.

   Para los estados (vacío, error, sin permiso), sumá una pantalla por estado con los datos sintéticos que lo
   provocan. El formato completo está al comienzo del script.

   **Reflujo.** El script mide en cada captura si la página desborda a lo ancho y deja `reflujo.json`. Con
   `--estricto`, un desborde hace fallar el script: es un hallazgo del cambio. En la corrida 2 de C-08 esta medición
   encontró un desborde real en Responder.

   **Informá lo que salió, no lo que esperabas.** Mirá vos al menos una captura de cada pantalla antes de decir que
   están bien. En la corrida 2 de C-08 un script de capturas se informó «en verde» mientras fotografiaba la pantalla
   equivocada (D-C08v2-03).
3. **Contrastá cada captura con `docs/diseno/estilo-visual.md`**:
   - la dirección visual elegida y sus capturas;
   - tokens y marca;
   - componentes base y estados;
   - foco visible y etiquetas.

   Anotá lo que no coincide.
4. **Escribí `docs/capturas/<C-0n>/mirada.md`** con:
   - la lista de capturas y qué muestra cada una;
   - lo que no coincide con el estilo, y para cada cosa el pendiente P-0nn o la corrección dentro del cambio;
   - la línea `Vista por: <persona>, dd/mm/aaaa`, **vacía**. La completa la persona, no el agente.
5. **Si el plan usa Claude Design** (fila «Interfaz y marca» de `docs/plan/plan.md`):
   - llevá las capturas del cambio a Claude Design desde el navegador: la persona, o vos en el navegador de la app con
     su sesión, si ella lo pide y está presente. Compará con la dirección elegida. `/design-sync` es opcional, solo si
     hay una librería compilada;
   - en `mirada.md`, anotá los hallazgos de Claude Design en una sección aparte, «Hallazgos en Claude Design», para
     medir si aportan algo distinto de las capturas. Si no hubo ninguno, escribí «ninguno».
6. **Pedí la mirada de la persona antes de abrir el PR** (0.4.2).
   - Mostrale las capturas, `mirada.md` y la app corriendo (`http://localhost:<puerto>`), y preguntale si se ve como
     esperaba.
   - En los momentos obligatorios del plan (el primer cambio con pantallas y el cierre), cerrá con
     `ESPERA: <persona> (mirada al producto de <C-0n>)` y no abras el PR hasta su respuesta.
   - Si dice que no se ve bien, es un hallazgo del cambio, no un detalle para después.
7. **En el PR**:
   - copiá la lista de capturas a la descripción, con las imágenes enlazadas;
   - agregá la casilla `- [ ] Una persona vio la app funcionando (mirada al producto)`;
   - con Claude Design, sumá el enlace al proyecto y la casilla `- [ ] Componentes revisados en Claude Design`.

   El PR no se une con las casillas sin marcar en los momentos que fija el plan.
8. Bajá la app si la levantaste vos (`docker compose down`, solo la pila de esta corrida: nunca contenedores ajenos).

Si el script no encuentra navegador, indicá la ruta en `CHROME_PATH`. Si igual no se puede, decilo y cerrá con
`ESPERA: <persona> (mirada al producto de <C-0n>)`, con los pasos para que la persona la haga.
