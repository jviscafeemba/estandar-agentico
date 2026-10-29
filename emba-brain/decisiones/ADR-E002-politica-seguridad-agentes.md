---
dueño: seguridad
estado: aceptada
revisado: 2026-10-29
vence: 2027-10-29
fuentes: ["informe Estándar agéntico EMBA, 29/10/2026"]
---
# ADR-E002 — Política de seguridad para agentes

**Decisión.** Los controles de seguridad no dependen de la versión del plugin de cada proyecto: van en la
política administrada de la organización (`politica/managed-settings.json`) y se repiten en CI.

Controles del día 1:
1. Lectura y escritura de `.env*` y `secrets/` negadas (política + hook con pruebas).
2. Modo que salta permisos deshabilitado.
3. Solo marketplaces de plugins aprobados.
4. Comandos destructivos (`rm -rf` fuera del proyecto, `git push --force`, `git reset --hard`) bloqueados por hook.
5. Revisión de dos personas y CODEOWNERS sobre `emba-harness/hooks/` y `politica/`.
