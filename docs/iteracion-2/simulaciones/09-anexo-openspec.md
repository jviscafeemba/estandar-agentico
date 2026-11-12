# Anexo · Traspaso entre sesiones con OpenSpec real

> **Resumen.**
> 1. En los pasos 6 y 7 la «spec» era una spec **propia**, escrita por la skill `proponer-cambio` con un formato
>    inspirado en OpenSpec. No se usó la herramienta. Este anexo prueba OpenSpec real (D-08-00).
> 2. Con OpenSpec 1.15.0 tal como viene, la sesión 2 implementó lo acordado en **2/3**, la misma tasa que la spec
>    propia (2/3 en esta tanda; 5/6 sumando el paso 6). Sin spec: 0/3 (0/6 sumando el paso 6). **Cumple el
>    criterio** de D-08-01.
> 3. OpenSpec costó **2,5 veces más** que la spec propia (mediana de 2,46 contra 0,96 USD) y usó el doble de turnos.
>    Genera cuatro artefactos (propuesta, spec delta, diseño y tareas) y valida con `openspec validate --strict`.
> 4. Con n = 3 por brazo no hay diferencia de acierto entre las dos specs. Lo que sí está claro es que **una spec
>    escrita, de cualquiera de las dos formas, decide el traspaso**.
> 5. Costo del anexo: 14,04 USD. Acumulado de la sesión: ≈ 170,8 USD.

## 1. Montaje

- **OpenSpec 1.15.0** (24/10/2026): la última versión con más de dos semanas publicada. Instalado en un temporal
  aparte con `npm install --ignore-scripts`. Trae telemetría y se apagó con `OPENSPEC_TELEMETRY=0` y
  `DO_NOT_TRACK=1`.
- **En la copia de `demo-facturas`:** `openspec init --tools claude --language es`. Eso generó los comandos
  `/opsx:propose`, `/opsx:apply` (y cuatro más), seis skills en `.claude/skills/` y `openspec/config.yaml` con el
  esquema `spec-driven`. Se copió tal cual, en `simulacion/archivos/e3-openspec/`.
- **Escenario:** el del traspaso de E3 (descuento global, pedido ambiguo) y la misma intención privada del líder.
  1. La sesión 1 recibe `/opsx:propose …`; el líder Opus contesta y aprueba.
  2. Una sesión 2 **nueva**, sin el chat, recibe `/opsx:apply …`. La persona no está disponible para ella.
  - No se agregó ninguna instrucción propia además de las de OpenSpec.
- **Los otros dos brazos** (spec propia y sin spec) se volvieron a correr en la misma tanda, con el mismo harness
  congelado. Agente Sonnet 5.5; líder Opus 5.5.

## 2. Resultados

| Brazo | n/N | Costo mediano | Rondas | Turnos (mediana) | ✔/✘ contra D-08-01 |
| --- | --- | --- | --- | --- | --- |
| OpenSpec real | 2/3 | 2,46 USD | 6, 4, 3 | 59 | ✔ (≥ 2/3) |
| Spec propia (`proponer-cambio`) | 2/3 | 0,96 USD | 6, 3, 3 | 27 | — (paso 6: 3/3) |
| Sin spec (solo el pedido) | 0/3 | 0,78 USD | 3, 3, 2 | 26 | — (paso 6: 0/3) |

**Qué hizo OpenSpec:**
- En las 3 corridas, la sesión 1 creó el cambio en `openspec/changes/<nombre>/` (proposal, spec, design, tasks) y
  escribió las respuestas del líder en la propuesta y el diseño. En una corrida lo validó con
  `openspec validate --strict`.
- En las 3, la sesión 2 tomó el cambio con `/opsx:apply`, marcó las tareas y anotó en `tasks.md` lo que supuso.
- **La corrida que falló:** la sesión 1 terminó como «aprobada y ajustada» después de un «cambios» del líder, sin
  una segunda aprobación. La sesión 2 implementó y la verificación oculta falló. El runner no guarda el detalle de
  la aserción que falló.

**La corrida que falló con la spec propia (F-08-01):** el cambio necesitaba actualizar una prueba existente (la
forma del resultado de RF-002). El hook la bloqueó y, como la persona no estaba para autorizarla, la sesión 2 quedó
con la suite en rojo. Es un hueco del traspaso: **una autorización que solo da una persona no se puede pedir si la
persona no está**. Se resuelve dejándola autorizada en la spec aprobada.

## 3. Lectura

- **Para el traspaso, cualquiera de las dos specs sirve; sin spec, no** (2/3 y 2/3 contra 0/3).
- **OpenSpec es más pesado:** cuatro artefactos, validación y el doble de turnos. En este cambio chico costó 2,5
  veces más. Su valor esperado (specs vivas en `openspec/specs/`, deltas, archivo y validación) aparece en
  proyectos largos, como ai-genesys, y esta prueba no lo mide.
- **Recomendación para la propuesta final:** el método pide una **spec con supuestos respondidos** cuando hay
  traspaso. OpenSpec es la herramienta recomendada en el nivel 3 y donde ya se usa. En los niveles 1 y 2 basta la
  spec liviana de `proponer-cambio`. La decisión de fondo (si OpenSpec es obligatorio en el nivel 3) sigue abierta
  para la reunión, ahora con este dato de costo.

## 4. Fallas y decisiones

| ID | Qué | Estado |
| --- | --- | --- |
| F-08-01 | Traspaso: una autorización de prueba que da solo una persona no se puede pedir en la sesión 2 si la persona no está; suite en rojo | abierta: la spec aprobada tiene que dejar autorizadas las pruebas existentes que el cambio necesita tocar |
| D-08-00 | Corregir la redacción sobre OpenSpec y probarlo real | Joaquín |
| D-08-01 | OpenSpec 1.15.0, telemetría apagada, sin instrucciones propias; criterio ≥ 2/3 fijado antes | agente |

## 5. Costo

14,04 USD en 9 corridas. Acumulado de la sesión: 156,77 + 14,04 = **170,81 USD**, más la corrida parada del paso 6.
