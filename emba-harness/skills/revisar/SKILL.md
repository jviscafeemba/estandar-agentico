---
name: revisar
description: Revisión independiente del flujo EMBA. Usar cuando un cambio ya está verificado y antes del PR. Delega en el agente revisor, que no vio la implementación, para que juzgue el diff contra la propuesta, los ADR y los requerimientos.
disable-model-invocation: true
---

# Revisión independiente

El autor no aprueba su propio trabajo: el agente sobrevalora lo que acaba de hacer.

1. Juntá: la ruta de la propuesta (`docs/cambios/...`), la rama y el comando para ver el diff
   (`git diff main...HEAD`).
2. Lanzá el agente `revisor` de este plugin con **solo** esos datos. No le pases tu opinión ni tu resumen
   del cambio: tiene que leer el código por su cuenta.
3. Mostrale al usuario los hallazgos del revisor tal cual, ordenados por gravedad.
4. Corregí lo que el usuario apruebe y volvé a `/emba-harness:verificar`.
