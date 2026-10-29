---
dueño: seguridad
estado: vigente
revisado: 2026-10-29
vence: 2027-01-27
fuentes: [../decisiones/ADR-E002-politica-seguridad-agentes.md]
---
# Secretos y credenciales

- Ningún secreto en código, commits, prompts, memoria del agente ni logs.
- Configuración sensible en archivos de entorno (`.env`, gitignored) o en `secrets/` (gitignored).
  `.env.example` solo con placeholders.
- El agente **nunca** lee, escribe, copia ni borra archivos de entorno o de `secrets/`. Lo imponen la
  política administrada y el hook `bloquear-secretos` de `emba-harness`, que tiene pruebas de evasión.
- Las credenciales reales las carga una persona, nunca el agente.
- gitleaks corre en CI en cada PR.
