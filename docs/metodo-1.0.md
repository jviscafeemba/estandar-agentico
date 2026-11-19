# Método agéntico EMBA 1.0 · congelado

- **Fecha:** 19/11/2026. **Decidió:** Joaquín Viscafe, en el chat de la orquestadora de ai-desempeno: «Sí, las dos»,
  sobre congelar el método y escribir el informe final.
- **Qué es la 1.0:** exactamente `emba-harness` 0.4.3, más `emba-brain/estandares/` y `PROPUESTA-METODOLOGIA.md`
  tal como están en `main` en esta fecha. No hay cambios de código. La etiqueta `metodo-1.0` marca el commit de unión
  de este documento.
- **Guía para el equipo:** `docs/guia-equipo-metodo-1.0.html`, en lenguaje simple y sin nombres internos.
  Publicada en https://claude.ai/code/artifact/9ecd22a2-83dd-4de3-a18d-7a279475ada4 (privada; se comparte desde su
  menú).
- **Informe técnico:** `docs/informe-metodo-1.0.html`, para quien mantiene el método: versiones, elementos,
  hooks y archivos de control.

## Evidencia

| Prueba | Método | Resultado | Informe |
| --- | --- | --- | --- |
| Piloto de ai-desempeno, C-00 a C-06 (12 y 13/11/2026) | 0.3.3 | 5 de 6 criterios, 0 defectos escapados, 129,6 USD. La app salió sin estilo (P-029) | `ai-desempeno/docs/piloto/reporte-final.md` |
| C-08 «Interfaz», corrida 1 (16/11/2026) | 0.4.1 | Sin paso de diseño; se cerró sin unir (PR #15) | `ai-desempeno/docs/piloto/informe-metodo-04.html` |
| C-08 «Interfaz», corrida 2 (16 y 17/11/2026) | 0.4.2 | Diseño elegido por una persona y mirada antes del PR; unido (PR #17). 8 rondas de spec y unos 154 USD | `ai-desempeno/docs/piloto/informe-metodo-04.html` |
| C-09 «Listo para el piloto de RRHH» (en curso) | 0.4.3 | Autorizar pruebas desde un subagente: funciona | Se suma al cerrarse |

## Regla de congelamiento

1. El método no cambia por mejoras. Solo se publica un parche (0.4.x) si una falla **bloquea** el trabajo de un
   proyecto: un hook que impide un paso legítimo sin alternativa, un script roto o un riesgo de seguridad.
2. Cada parche dice en el CHANGELOG qué falla bloqueante resuelve, con su evidencia, y lo aprueba una persona.
3. Toda otra mejora se anota abajo, con su evidencia, y **no se implementa** hasta la revisión.
4. **Revisión:** 15/01/2027, después de abrir el ciclo 2026 de ai-desempeno, con los datos de los proyectos que
   usen la 1.0 hasta entonces. De ahí sale, si corresponde, un método 1.1.

## Mejoras anotadas para la revisión

| # | Mejora | Evidencia | Prioridad |
| --- | --- | --- | --- |
| M-01 | **Costo de la orquestadora.** Una sesión por fase (diseño y spec, implementación, cierre) con traspaso escrito, en lugar de una sesión que dura todo el cambio | C-08 corrida 2: ≈ 143 de ≈ 154 USD fueron la orquestadora; releyó 387 M de tokens de caché en 26 h. C-09 prueba una versión manual | Alta |
| M-02 | **Registro de eventos automático.** Hoy se llena a mano y mezcla tiempo activo con esperas | Piloto: 3 eventos corregidos. C-08: el tiempo activo no se pudo separar | Media |
| M-03 | **CI independiente.** Con GitHub Actions caído, la compuerta es el CI local (D-20 de ai-desempeno), que corre en la máquina de una persona | ai-desempeno desde el 16/11/2026 | Media |
| M-04 | **Pruebas sensibles a la carga de la máquina.** Límites de tiempo de Vitest con la máquina ocupada dieron rojos falsos | C-08 corrida 1 (10 pruebas cortadas) y el PR #14 | Media |
| M-05 | **Claude Design después de la mudanza.** claude.ai/design cierra el 14/12/2026 y pasa a Claude; revisar `disenar-interfaz` y el estándar de interfaz | Aviso del producto | Al ocurrir |
| M-06 | **E7 carriles y E8 aprobación sin hoja:** sin evidencia real todavía | Todos los cambios fueron secuenciales | Baja |
| M-07 | **Manual de marca de EMBA y Gabriel/GPTO:** sin él, la marca sigue pendiente en todos los proyectos | Q-004 de ai-desempeno | Depende del área dueña |
