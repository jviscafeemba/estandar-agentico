# Datos, retención y marco legal para el uso de agentes

Investigación del 29/10/2026 para el estándar agéntico EMBA. No es asesoría legal: la conclusión sobre Bolivia la
confirma el responsable legal antes del piloto.

## Resumen

- Con el plan **Team** (términos comerciales), Anthropic **no entrena** modelos con el código ni los prompts de
  Claude Code. Guarda los datos **30 días** en sus servidores.
- Lo que sale de esa regla lo dispara una persona: `/feedback`, `/bug` y `/share` guardan la conversación
  **5 años**. Compartir la transcripción en la encuesta de sesión la guarda hasta **6 meses**. La política
  administrada desactiva las dos cosas.
- La **retención cero** (ZDR) solo existe en Claude for Enterprise y se habilita por organización a pedido. El plan
  Team no la tiene.
- En cada máquina, Claude Code guarda las sesiones **en texto plano** en `~/.claude/projects/` durante 30 días.
  Las sesiones abiertas desde la app de escritorio quedan exentas de ese límite por defecto.
- **Bolivia no tiene, a septiembre de 2026, una ley general de protección de datos personales.** Existe la acción
  de protección de privacidad de la Constitución (arts. 130–131) y dos anteproyectos sin aprobar. El de AGETIC
  (2024) prevé restringir la transferencia internacional de datos.

## Claude Code con plan Team

| Tema | Qué dice la documentación oficial |
| --- | --- |
| Entrenamiento | Bajo términos comerciales, no se entrena con código ni prompts de Claude Code, salvo que la organización se sume al Development Partner Program |
| Retención en servidores | 30 días |
| `/feedback`, `/bug`, `/share` | La transcripción se guarda 5 años. Se desactiva con `DISABLE_FEEDBACK_COMMAND=1` |
| Encuesta de sesión | La calificación no guarda contenido. Si alguien acepta compartir la transcripción, se guarda hasta 6 meses. Se desactiva con `CLAUDE_CODE_DISABLE_FEEDBACK_SURVEY=1` |
| Retención cero | Solo en Claude for Enterprise, por organización, con el equipo de cuentas |
| Telemetría | Las métricas no incluyen código, prompts ni rutas. Se desactivan con `DISABLE_TELEMETRY=1` |
| Copia local | Transcripciones en texto plano en `~/.claude/projects/`, 30 días por defecto (`cleanupPeriodDays`) |
| Cifrado | TLS 1.2+ en tránsito; AES-256 en reposo en la API de Anthropic |

Fuente: [Claude Code, Data usage](https://code.claude.com/docs/en/data-usage).

## Bolivia

- No hay una ley general de protección de datos personales ni una autoridad que reciba denuncias o aplique
  sanciones ([Opinión, 16/09/2026](https://www.opinion.com.bo/tendencias/quien-queda-tus-datos-bolivia-todavia-tiene-ley-que-obligue-responder/20260916111314996213.html)).
- La protección vigente es la **acción de protección de privacidad** de la Constitución: un recurso judicial
  individual para corregir o eliminar datos, no un sistema de supervisión.
- Hay dos anteproyectos sin aprobar: el de [AGETIC (2024)](https://agetic.gob.bo/wp-content/uploads/2024/08/DATOS-PERSONALES-PRESENTACION-ANTEPROYECTO-DE-LEY-2024-firmado.pdf),
  que incluye un capítulo de transferencia internacional («prohibición y excepciones») y una autoridad de
  protección de datos, y el de [InternetBolivia.org](https://misdatos.internetbolivia.org/docs/anteproyecto_ley_de_proteccion_datos_personales_InternetBolivia.pdf).
- No encontramos una norma boliviana específica sobre nube o inteligencia artificial. Falta revisar si el sector
  de EMBA tiene normas propias (por ejemplo, de un regulador sectorial).

## Qué cambia en el estándar

1. **Política administrada:** desactiva `/feedback` y la encuesta de sesión, y baja la copia local a 14 días
   (`politica/managed-settings.json`).
2. **Clasificación de datos:** se mantiene la regla de `emba-brain/seguridad-datos/clasificacion.md`. Ni datos
   confidenciales ni personales en el contexto de un agente; solo datos sintéticos. Así, si se aprueba una ley
   que restrinja transferencias internacionales, el estándar ya cumple.
3. **Equipos:** disco cifrado (BitLocker) en las máquinas que usan agentes, por las transcripciones locales.
4. **Para decidir:** si algún proyecto necesita datos reales, evaluar Claude for Enterprise con retención cero, o
   un proveedor en la nube con residencia de datos.

## Preguntas para el responsable legal

- ¿Hay alguna norma sectorial que aplique a EMBA sobre datos en servidores fuera de Bolivia?
- ¿Los contratos con clientes o proveedores restringen dónde se procesan sus datos o su código?
- ¿Alcanza con los términos comerciales del plan Team, o hace falta un acuerdo de tratamiento de datos (DPA)?
