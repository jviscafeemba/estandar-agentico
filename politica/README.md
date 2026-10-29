# Política administrada (ADR-E002)

`managed-settings.json` es la capa de seguridad que **no depende** de la versión del plugin de cada proyecto:
Claude Code la aplica por encima de cualquier configuración de usuario o de proyecto.

- En Windows va en `C:\Program Files\ClaudeCode\managed-settings.json` (requiere administrador).
- **En esta prueba de concepto no se instala.** Instalarla cambia el comportamiento de Claude Code en toda la
  máquina, incluidos los proyectos reales. La decide e instala una persona, después de revisarla.

Qué impone:

| Clave | Efecto |
| --- | --- |
| `permissions.deny` | Ningún agente lee ni edita archivos de entorno ni `secrets/`, ni hace push forzado o reset duro |
| `disableBypassPermissionsMode` | Nadie puede saltarse los permisos |
| `strictKnownMarketplaces` | Solo se instalan plugins del marketplace aprobado |

Endurecimiento posible para producción (no incluido para no romper configuraciones existentes):
`allowManagedHooksOnly` y `allowManagedPermissionRulesOnly`. Si se activan, los hooks del plugin deben
declararse acá. Ojo: `strictKnownMarketplaces` sin `{"source": "skills-dir"}` deja de cargar skills de directorio.
