---
name: mirar-producto
description: Mirada al producto del flujo EMBA. Levanta la app, saca capturas de las pantallas del cambio y prepara la revisión visual de una persona. Usar en todo cambio con pantallas antes de abrir el PR, y obligatoriamente después del primer cambio con pantallas y al cierre del plan.
---

# Mirada al producto

Las pruebas dicen si la app hace lo que la spec pide; no dicen si se ve bien ni si una persona entendería la
pantalla. En el piloto de ai-desempeno la app pasó 365 pruebas y no tenía ningún estilo, y nadie la vio funcionando
hasta el final (P-029). Esta skill hace que alguien la vea.

1. **Levantá la app** con el comando que diga el `AGENTS.md` o el `RUNBOOK.md` (por ejemplo `docker compose up -d`).
   Comprobá que responde: `curl -fsS http://localhost:<puerto>/<salud>`, que está permitido contra loopback. Usá
   solo datos sintéticos.
2. **Recorré las pantallas del cambio**: las que lista la sección «Pantallas» de la spec y, al cierre del plan,
   todas las de `docs/diseno/estilo-visual.md` §5. Usá la herramienta de navegador que tengas: el navegador de la
   app, o Playwright si el proyecto ya lo tiene como dependencia. No instales nada para esto.
3. **Sacá capturas** a `docs/capturas/<C-0n>/<pantalla>-<estado>.png`: el estado normal y los que pida la spec
   (vacío, error, sin permiso). Si el estilo define modo oscuro, una captura también en oscuro. Ancho de escritorio
   y uno angosto (unos 400 px).
4. **Contrastá cada captura con `docs/diseno/estilo-visual.md`**: tokens y marca, componentes base, estados, foco
   visible y etiquetas. Anotá lo que no coincide.
5. **Escribí `docs/capturas/<C-0n>/mirada.md`** con:
   - la lista de capturas y qué muestra cada una;
   - lo que no coincide con el estilo, y para cada cosa el pendiente P-0nn o la corrección dentro del cambio;
   - la línea `Vista por: <persona>, dd/mm/aaaa`, **vacía**. La completa la persona, no el agente.
6. **En el PR**: copiá la lista de capturas a la descripción, con las imágenes enlazadas, y agregá la casilla
   `- [ ] Una persona vio la app funcionando (mirada al producto)`. El PR no se une con la casilla sin marcar en los
   momentos que fija el plan: el primer cambio con pantallas y el cierre.
7. Bajá la app si la levantaste vos (`docker compose down`).

Si no podés sacar capturas (no hay navegador disponible), decilo y cerrá con `ESPERA: <persona> (mirada al
producto de <C-0n>)`, con los pasos para que la persona la haga.
