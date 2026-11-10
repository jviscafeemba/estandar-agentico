# Registro de fallas · simulación del método v2

Archivo vivo. Una fila por falla; el ID (`F-<paso>-<n>`) no cambia y se arrastra a los informes siguientes.

- **Origen:** método · harness · brain · escenario/verificación · modelo · humano simulado · infraestructura.
- **Gravedad:** crítica (dato real, secreto o cifra mal en main) · alta (el flujo se rompe o se saltea un paso
  obligatorio) · media (más costo o más turnos) · baja (forma).
- **Estado:** abierta · corregida en el paso n · aceptada como riesgo.

| ID | Escenario | Qué pasó | Evidencia | Origen | Gravedad | Se repite | Estado |
| --- | --- | --- | --- | --- | --- | --- | --- |
| F-03-01 | evals de la iteración 1 (`--simular`) | La copia no traía la verificación: `node --test` fallaba por archivo inexistente y contaba como «falla antes del cambio». La compuerta de `verificar-todo.mjs` no medía nada desde el 29/10 | runner de `main` contra un archivo inexistente: sale con 1 → ✔ | infraestructura | alta | siempre | corregida en el paso 3 |
| F-03-02 | e3-descuento-global (con), e6 (con), e3 (base) | `proteger-pruebas` bloquea **agregar** pruebas a un archivo existente: rompe «prueba primero»; en E3-con no se implementó | `simulacion/resultados/piloto/detalle/*E3-con-B.json` | harness | alta | 3/3 corridas que agregaban pruebas | abierta (D-03-08) |
| F-03-03 | e3-descuento-global (con) | El guion del líder no cubre «autorizar pruebas nuevas»: no autorizó, rechazó el archivo nuevo, delegó y marcó `leyo_diff` sin diff | decisiones del líder, rondas 1-3 | humano simulado | media | 1/1 | abierta (D-03-08) |
| F-03-04 | e3 (con y base) | La lista de herramientas del runner niega `npm test … \| Select-String` en `acceptEdits` | `permisos_denegados` | infraestructura | baja | 2/6 | abierta |
| F-03-05 | e3-descuento-global | La verificación exigía un nombre y una forma de resultado que el pedido no fijaba | E3-base con el comportamiento correcto y otro nombre | escenario/verificación | media | 1/2 | corregida en el paso 3 |
| F-03-06 | e3-descuento-global (base) | Con la sección «Flujo» del `AGENTS.md`, la base también propone: no es línea base | respuesta 0 de E3-base | escenario | media | 1/1 | corregida en el paso 3 |
