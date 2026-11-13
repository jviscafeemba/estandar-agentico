---
name: nuevo-proyecto
description: Prepara un repositorio para trabajar con el estándar agéntico EMBA. Usar cuando el usuario pida sumar un proyecto al estándar o crear la estructura de brain de proyecto.
disable-model-invocation: true
---

# Sumar un proyecto al estándar

Las plantillas están en `<harness>/plantillas/` (`<harness>` = dos niveles arriba del directorio base de esta skill).

1. Preguntá lo que no puedas deducir: nombre del proyecto, líder técnico, comando de pruebas, nivel (1, 2 o 3),
   si tiene pantallas y dónde viven sus pruebas.
2. Creá, sin pisar archivos existentes (si existen, proponé el cambio y esperá):
   - `AGENTS.md` desde `plantillas/AGENTS.md`, completado con lo que el agente **no** puede deducir del código;
   - `CLAUDE.md` desde `plantillas/CLAUDE.md`;
   - `.claude/settings.json` desde `plantillas/settings.json`;
   - `docs/adr/`, `docs/requerimientos/requerimientos.md`, `docs/cambios/`, `RUNBOOK.md`;
   - `docs/plan/plan.md` desde `plantillas/plan.md`, con la tabla de **temas transversales**: cada tema se asigna a
     un cambio o queda «fuera de alcance (OK: persona, dd/mm/aaaa)». Preguntale a la persona; no lo decidas vos;
   - `docs/plan/pendientes.md` desde `plantillas/pendientes.md`;
   - si tiene pantallas: `docs/diseno/estilo-visual.md` desde `plantillas/estilo-visual.md` y un RNF de interfaz en
     los requerimientos. Lo común (accesibilidad, estados, marca) lo da el estándar de empresa
     `estandares/interfaz.md` (skill `emba-empresa:consultar-brain`);
   - si es nivel 3: `openspec/config.yaml` desde `plantillas/openspec-config.yaml`;
   - `.github/workflows/ci.yml` desde `plantillas/ci.yml`;
   - las entradas de `plantillas/gitignore` en `.gitignore`.
3. **Lo que escribe una persona** (son archivos de control: el agente no puede escribirlos, y si los escribiera se
   estaría autorizando solo). Mostrale a la persona el contenido sugerido y pedile que los cree ella:
   - `.claude/protegidos.txt`: una carpeta de pruebas por línea, terminada en `/` (por ejemplo `tests/`,
     `api/tests/`, `web/tests/`). Sin este archivo el hook solo protege `tests/` (F-P-12);
   - `.claude/salida-permitida.txt`, solo si una sesión orquestadora va a hacer push y abrir PR: desde
     `plantillas/salida-permitida.txt` (F-P-03).
   Cerrá con `ESPERA: <persona> (crear .claude/protegidos.txt…)` si todavía no están.
4. Corré `node "<harness>/scripts/verificar-proyecto.mjs" .` y mostrá el resultado.
