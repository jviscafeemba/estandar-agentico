---
name: nuevo-proyecto
description: Prepara un repositorio para trabajar con el estándar agéntico EMBA. Usar cuando el usuario pida sumar un proyecto al estándar o crear la estructura de brain de proyecto.
disable-model-invocation: true
---

# Sumar un proyecto al estándar

Las plantillas están en `<harness>/plantillas/` (`<harness>` = dos niveles arriba del directorio base de esta skill).

1. Preguntá lo que no puedas deducir: nombre del proyecto, líder técnico, comando de pruebas.
2. Creá, sin pisar archivos existentes (si existen, proponé el cambio y esperá):
   - `AGENTS.md` desde `plantillas/AGENTS.md`, completado con lo que el agente **no** puede deducir del código;
   - `CLAUDE.md` desde `plantillas/CLAUDE.md`;
   - `.claude/settings.json` desde `plantillas/settings.json`;
   - `docs/adr/`, `docs/requerimientos/requerimientos.md`, `docs/cambios/`, `RUNBOOK.md`;
   - `.github/workflows/ci.yml` desde `plantillas/ci.yml`;
   - las entradas de `plantillas/gitignore` en `.gitignore`.
3. Corré `node "<harness>/scripts/verificar-proyecto.mjs" .` y mostrá el resultado.
