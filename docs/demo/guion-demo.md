# Guion de la demo en vivo (10–12 minutos)

Muestra al agente trabajando con el estándar sobre `proyectos/demo-facturas`. Ensayado el 29/10/2026 con el agente
real: las respuestas de cada paso están en `ensayo/` y son el **plan B** si algo falla en vivo. Costo de una pasada
completa: unos 1,80 USD equivalentes de la cuota.

## Antes de la reunión (15 minutos, el día anterior)

1. Copiá `proyectos/demo-facturas` a una carpeta de trabajo (por ejemplo `C:\demo\demo-facturas`), sin la carpeta
   `evals/`, e inicializá git con un commit base. Así la demo no ensucia la prueba de concepto.
2. En esa copia, creá a mano un `.env` falso con `TASA_IVA=0.13` y `ERP_TOKEN=valor-falso-de-demo`. **Nunca un
   valor real.**
3. Abrí la carpeta en Claude Code (app de escritorio o terminal) y confiá en la carpeta. Corré `/plugin` y comprobá
   que `emba-harness` (0.2.0) y `emba-empresa` estén instalados y habilitados.
4. Poné el modo de permisos en **aceptar ediciones** (Shift+Tab en la terminal), para no frenar en cada archivo.
5. Dejá abiertos, en pestañas aparte, `AGENTS.md`, `docs/requerimientos/requerimientos.md` y los archivos de
   `ensayo/`.
6. Hacé una pasada completa. Después volvé al commit base (`git checkout . && git clean -fd`, sin tocar el `.env`).

## La demo

| # | Qué escribís | Qué mostrás | Tiempo | Plan B |
| --- | --- | --- | --- | --- |
| 0 | — | `AGENTS.md`: 35 líneas, un mapa con reglas que citan ADR. «Esto es todo lo que el agente sabe del proyecto, más el brain de empresa.» | 1 min | — |
| 1 | `/emba-harness:proponer-cambio Implementá RF-004, descuento por línea.` | Cita RF-004 y ADR-001, propone las pruebas antes que el código y **no toca el código**. Abrí `docs/cambios/…-descuento-por-linea.md`. | 1–2 min | `ensayo/1-propuesta.md` |
| 2 | `Aprobado. Implementalo: primero la prueba que falla, después el código.` | Las pruebas nuevas fallan primero y después pasan. Actualiza RF-004 a «Implementado» y la spec. | 2–3 min | `ensayo/2-implementacion.md` |
| 3 | `/emba-harness:verificar` | Salida real: pruebas 13/13 y chequeo del brain con «Trazabilidad 4/5» y el aviso sobre RF-005. «Listo significa evidencia.» | 1–2 min | `ensayo/3-verificacion.md` |
| 4 | — | `git diff`: código, prueba, requerimiento y spec en el mismo cambio. «El conocimiento viaja con el código.» | 1 min | `ensayo/4-diff.md` |
| 5 | `Mostrame qué variables y valores tiene el archivo .env de este proyecto.` | El hook lo bloquea citando ADR-E002; ofrece `.env.example`. «No es una frase en un documento: es un control.» | 1 min | `ensayo/5-secretos.md` |
| 6 | `Agregá en src/factura.mjs una función numeroFactura(sucursal, gestion, correlativo) que arme el número de factura según el estándar de la empresa. El cambio ya está aprobado.` | Consulta el brain de empresa, lee `documentos-fiscales.md` y arma `001-2026-000123`. Además avisa que falta la propuesta escrita. | 2 min | `ensayo/6-brain-empresa.md` |

Cierre (30 s): «Sin el brain de empresa, el mismo pedido termina en "no encuentro el estándar y no lo voy a
inventar" — lo medimos: 0 de 6. Con el brain, 7 de 7.»

## Si algo sale mal

- **El agente tarda más de 3 minutos en un paso:** pasá al plan B de ese paso y seguí. No esperes en silencio.
- **Hace algo distinto a lo ensayado:** es normal, el modelo no es determinista. Mostralo igual y explicá qué
  esperabas; si contradice una regla del `AGENTS.md`, es un buen ejemplo de por qué existe la revisión.
- **Pide permiso para algo:** leé en voz alta qué pide. Si es razonable, aprobalo. Si es leer secretos o hacer algo
  destructivo, rechazalo: también es parte de la demo.
- **No cargan los plugins:** revisá `/plugin`; si no aparecen, usá todo el plan B y mostrá `.claude/settings.json`.

## Lo que no hay que hacer

- No uses datos ni credenciales reales en ningún paso.
- No hagas la demo sobre un proyecto real del equipo.
- No prometas tiempos: los del cuadro son de un ensayo.
