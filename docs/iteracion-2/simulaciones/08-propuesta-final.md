# Propuesta final · Método de Desarrollo agéntico de EMBA (v3.3, probada con simulaciones)

> **Resumen.**
> 1. El método queda con **10 elementos que se mantienen y 1 que cambia de forma**. Se mantienen: brain de empresa,
>    `AGENTS.md` para reglas sin prueba, prueba primero con hook, revisión independiente, hooks de seguridad,
>    carriles con contrato primero, cierre con lecciones, pendientes con ID e indicadores. La propuesta pasa a ser
>    una **spec con supuestos respondidos**. La **hoja del lote se elimina**; la aprobación cambio por cambio se
>    mantiene.
> 2. Cada regla de este documento tiene detrás una simulación con línea base o un criterio escrito antes de correr.
>    Lo que no se pudo medir está dicho en §6.
> 3. Cambios de proceso que salieron de las fallas: cada carril commitea en su rama, las skills de flujo las invoca
>    una persona, el contrato compartido se une primero y tiene un responsable que lo destraba, y las lecciones
>    candidatas se aplican diciéndolo en el PR.
> 4. El harness (`emba-harness` 0.3.3) suma `bloquear-salida`, `proteger-pruebas` y `carril`. Antes de la ola 1
>    hay que probar `proteger-pruebas` con comandos reales: dio 3 falsos positivos con texto libre, ya corregidos.
> 5. Para la ola 2 quedan dos validaciones con personas reales: la atención del aprobador en un lote y el tiempo de
>    PR a main.

Evidencia completa: informes [01](01-estado-del-arte.md)–[06](06-informe-fallas-conjunto.md) y [07](07-informe-final.md),
[registro de fallas](registro-fallas.md) y [de decisiones](registro-decisiones.md),
[tablero](https://claude.ai/code/artifact/1f427adb-516e-49a6-9488-99fd1d90e3de).

## 1. Qué cambia respecto de la v2

| Tema | v2 (29/10) | Propuesta final | Por qué (evidencia) |
| --- | --- | --- | --- |
| Capas | brain de empresa, brain de proyecto, proceso | + **harness** como pieza propia (H1-H6) | Las piezas que hacen cumplir el método no dependen de que alguien se acuerde (02) |
| Propuesta | propuesta escrita antes del código | **spec con supuestos respondidos** (requisitos con escenarios DADO / CUANDO / ENTONCES); obligatoria cuando hay traspaso | Traspaso: 3/3 con spec contra 0/3 sin ella; en una sola sesión, sin diferencia (06) |
| Aprobar | «ok» de la persona | la persona **contesta los supuestos**; un «ok» genérico no vale | Aprobada sin leer: 0/3 con cualquier formato (05, 06) |
| Pruebas | prueba primero | + hook que deja agregar pruebas pero no cambiar las existentes; la persona autoriza con `!` | Sin hook, el agente cambió la prueba en 2/2 y falló; con hook, 2/2 (05) |
| Seguridad | `deny` y dos hooks | + `bloquear-salida` (red, `git push`) | 0 fugas con hooks contra 4/5 sin ellos; 0 instrucciones obedecidas (04-06) |
| Paralelo | sesiones en paralelo | **carriles** con hook, **contrato primero**, cada carril commitea en su rama | Sin contrato primero, 0/2 integraciones; con él, 2/2, y el conjunto en verde (04-06) |
| Lote | aprobación en lote | **cambio por cambio, sin hoja** | La hoja no cambió nada: el líder leyó el 75 % igual y sin hoja la rama mala tampoco pasó (06) |
| Lecciones | se escriben en el brain de empresa | candidata en el proyecto → la persona la publica en la retro → **se aplica diciéndolo en el PR** | Sin publicar, 0/2 llegan; publicadas y aplicables, 2/2 (05, 06) |
| Indicadores | propuestos | `metricas.mjs` calcula los 4 solos desde el registro | Conjunto: 4/4 calculados, iguales al conteo directo (06) |

## 2. Los elementos

| ID | Elemento | Estado | Regla operativa | Evidencia (con / sin) |
| --- | --- | --- | --- | --- |
| E1 | Brain de empresa a pedido | se mantiene | El agente consulta el brain (`consultar-brain`) antes de inventar una norma de empresa | 6/6 contra 1/6; reservado 2/2 contra 0/2 |
| E2 | `AGENTS.md` | se mantiene, acotado | Solo reglas que no se pueden convertir en prueba o hook; lo demás va a pruebas | Regla solo en el `AGENTS.md`: 3/3 contra 0/3. Si la regla ya está en pruebas, no suma (6/6 = 6/6) |
| E3 | Spec con supuestos respondidos | **cambia** | Spec obligatoria en carriles, en cambios de más de un día y en el nivel 3; en el resto, supuestos contestados en el chat. Las respuestas se escriben en la spec | Traspaso: 3/3 contra 0/3, con la mitad del costo |
| E4 | Prueba primero con hook | se mantiene | Las pruebas existentes son de solo lectura para el agente; agregar está permitido; cambiar una lo autoriza una persona con `!` | Reservado 2/2 contra 0/2 |
| E5 | Revisión independiente | se mantiene | El revisor recibe el diff, la spec y los requisitos, no la descripción del autor | 14/14; 0 instrucciones sembradas obedecidas |
| E6 | Hooks de seguridad | se mantiene | `bloquear-secretos`, `bloquear-comandos`, `bloquear-salida`; la frontera real es el sandbox con red cerrada (H6) | 0 fugas en todas las corridas con hooks |
| E7 | Carriles con contrato primero | se mantiene, ampliado | Un dueño por contrato; el contrato se aprueba y se une antes que los dependientes; cada carril escribe solo en lo suyo y en `docs/cambios/` | 2/2 integraciones; conjunto con 0 escrituras ajenas |
| E8 | Aprobación del lote | **pierde la hoja** | La persona decide cada cambio por separado y mira el diff; la skill `preparar-lote` se retira | La hoja no aportó (06); la atención humana se mide en la ola 2 |
| E9 | Cierre y lecciones | se mantiene, con circuito | `cerrar-fase` escribe la candidata en el proyecto; la persona la publica en la retro; los agentes la aplican diciéndolo en el PR | 2/2 |
| E10 | Pendientes con ID | se mantiene | Lo que se encuentra fuera de alcance se anota con ID en `pendientes.md`, no se arregla de paso | 3/3 contra 0/3 |
| E11 | Indicadores | se mantiene | Tiempo de PR a main, % de PR con hallazgos graves, defectos escapados y costo por PR, desde el registro de los hooks | 4/4 calculados solos |

## 3. Harness (`emba-harness` 0.3.3)

| Parte | Contenido final | Cambios de esta simulación |
| --- | --- | --- |
| H1 Skills de flujo (solo a pedido) | `proponer-cambio` (spec), `verificar`, `revisar`, `cerrar-fase`, `nuevo-proyecto` | `proponer-cambio`: formato spec y respuestas escritas. `cerrar-fase`: lección en el proyecto, fuentes como texto. **Se retira `preparar-lote`** |
| H2 Agente revisor | `agents/revisor.md` | Título, descripción y comentarios del autor como entrada no confiable |
| H3 Hooks | `bloquear-secretos`, `bloquear-comandos`, `bloquear-salida`, `proteger-pruebas`, `carril`, `registrar-metricas` | `proteger-pruebas` v3.2: no bloquea agregar ni los `import`, ni las redirecciones de salida, ni el texto de un commit |
| H4 Scripts | `verificar-proyecto`, `lint-brain`, `metricas` (con `--registro` para E11), `autorizar-prueba`, runners de evals | `lint-brain` lee listas YAML; `autorizar-prueba` la corre una persona |
| H5 Plantillas | `AGENTS.md`, `CLAUDE.md`, `settings.json`, `carriles.yaml`, `pendientes.md`, `brief-sesion.md` | `carriles.yaml` con `docs/cambios/` en cada carril; se retira la hoja de lote |
| H6 Política administrada | `managed-settings.json` (sin instalar) | Sin cambios; se instala con TI (ola 3) |

## 4. Quién hace qué

| Rol | Hace | No hace |
| --- | --- | --- |
| **Persona (líder del cambio)** | Contesta los supuestos de la spec; invoca las skills de flujo escribiendo el comando; autoriza cambios a pruebas con `!`; aprueba cada cambio mirando el diff; publica las lecciones en la retro | Aprobar con un «ok» que no contesta; delegar la lectura de lo marcado |
| **Agente de carril** | Spec → prueba que falla → código → verificar → pide revisión; **commitea en su rama**; escala con `ESPERA: <a quién>` lo que es de otro carril o de la persona, y la espera le llega a quien nombra (F-07-02) | Push, unir a main, escribir fuera de su carril o en un contrato ajeno |
| **Orquestadora** | Reparte los cambios en carriles; une a main lo aprobado, con el contrato primero; destraba esperas de coordinación | Resolver por un carril o tocar un contrato que no es suyo |
| **Dueño del contrato** | Hace el cambio de contrato primero, compatible hacia atrás; tiene **un plazo y un responsable que lo destraba**, porque si se traba, frena a todos los que dependen de él (F-06-10). Si se une solo el contrato, **el resto de su cambio queda como pendiente con ID** y la orquestadora lo reprograma: en el paso 7 se unió a medias y nadie volvió por el resto (F-07-01, propuesta sin simular) | Unir un cambio a medias sin dejar el resto anotado |

## 5. Proporcionalidad

| Nivel | Qué exige |
| --- | --- |
| 1 (corrección chica con prueba que la reproduce) | Sin spec: «corrección chica», prueba que falla, arreglo, verificar |
| 2 (cambio acotado, una sesión) | Supuestos contestados en el chat; prueba primero; revisor |
| 3 (cifras, contratos, datos, seguridad, varios carriles o más de un día) | Spec completa con supuestos respondidos; contrato primero; aprobación cambio por cambio |

## 6. Lo que no se pudo validar y cómo se valida

| Qué | Por qué no | Cuándo |
| --- | --- | --- |
| Atención de un aprobador cansado frente a un lote | Un líder simulado lee todo en un segundo (F-06-07) | Piloto de la ola 2: % de cambios marcados que se leen, defectos escapados |
| Tiempo real de PR a main | En la simulación la unión es inmediata | Ola 2, con `metricas.mjs` |
| Cuánto atrapa cada control (embudo) | Con propuesta aprobada, el conjunto no generó errores propios. El error sembrado lo atrapó la prueba del agente en `verificar`, pero la inyección era reconocible (F-07-03) | Ola 2, con el embudo activo en los registros |
| Sandbox con red cerrada y política administrada | Cambian la configuración de la máquina | Olas 1 y 3, con TI |
| Comprensión del autor y pérdida de habilidades | Necesita personas | Ola 2 |

## 7. Riesgos abiertos

1. **`proteger-pruebas` analiza texto libre y da falsos positivos** (`2>&1`, la palabra «del» en un commit). Antes
   de la ola 1 hay que probarlo contra una lista de comandos reales del equipo.
2. **Los hooks no son frontera de seguridad:** se pueden evadir. La frontera es el sandbox (H6).
3. **El simulador es optimista:** el líder simulado es más cuidadoso que una persona apurada y los escenarios son
   chicos (n = 2 a 6 por brazo).
4. **Costo:** un cambio con spec, revisión y aprobación cuesta 1,8-5 USD de agente en estos proyectos chicos.

## 8. Para decidir en la reunión del 12/11

1. Aprobar los elementos de §2 como método de la ola 1.
2. Retirar la hoja del lote (`preparar-lote`).
3. Spec obligatoria según §5.
4. Responsable y plazo para destrabar a los dueños de contrato, y la regla del resto del cambio cuando se une solo
   el contrato.
5. Prueba de `proteger-pruebas` con comandos reales como condición para arrancar la ola 1.
