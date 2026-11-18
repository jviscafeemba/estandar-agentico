---
name: disenar-interfaz
description: Paso de diseño visual del flujo EMBA, antes de la spec. Usar en el primer cambio con pantallas (o en uno que agrega un tipo de pantalla nuevo) cuando la fila «Interfaz y marca» del plan dice «Claude Design». El agente prepara el catálogo y propone direcciones; una persona las explora en Claude Design desde el navegador y elige; recién después se escribe estilo-visual.md y la spec.
---

# Diseñar la interfaz antes de la spec

`<harness>` es la raíz del plugin: dos niveles arriba del directorio base de esta skill.

**Por qué existe (0.4.2, F-C08-05).** En la corrida 1 de C-08 de ai-desempeno todo lo automático pasó en verde: 296
pruebas, axe sin violaciones y 5 rondas del revisor. Aun así, la app salió «horrible». El estilo era una tabla de
tokens que nadie había visto dibujada, y Claude Design solo aparecía al final, como revisión. Un estilo visual se
elige **mirándolo**, no leyéndolo.

**Cómo se usa Claude Design (0.4.3, F-C08v2-02 y 03).** La vía principal es **el navegador**: Claude Design en
claude.ai, como cualquier página.
- La persona lo abre en su navegador, o le pide al agente que lo maneje desde el navegador de la app con la sesión de
  ella (D-22 de ai-desempeno). Esto último solo con su OK en el chat y con ella presente, y solo con datos sintéticos.
- `/design-sync` queda **opcional**: convierte una librería de componentes ya compilada (dist o Storybook), que en el
  primer cambio con pantallas todavía no existe, y su `/design-login` no se puede completar desde la app de
  escritorio.

**Lo que el agente no hace.** No elige la dirección y no entra a la cuenta de la persona sin que ella lo pida. Prepara,
propone y después escribe.

## Cuándo
- En el primer cambio con pantallas, antes de escribir su spec, si el plan dice «Claude Design».
- En un cambio que agrega un tipo de pantalla que la dirección elegida no cubre (por ejemplo, un tablero cuando
  solo había formularios).
- No hace falta si `docs/diseno/estilo-visual.md` ya tiene «Dirección elegida por» y el cambio usa lo que ya está.

## Pasos

1. **Leé** el estándar de empresa `estandares/interfaz.md` (skill `emba-empresa:consultar-brain`): accesibilidad,
   estados, textos y marca. Leé también el RNF de interfaz del proyecto y las pantallas que el plan pone en el cambio.
2. **Armá el catálogo inicial** en `docs/diseno/catalogo/`, **para mostrar**: páginas HTML estáticas que se abren sin
   servidor.
   - Tokens base: si no hay marca, una paleta neutra provisional, marcada así.
   - Los componentes base (botón, campo, tabla, mensaje, diálogo, encabezado) en todos sus estados.
   - Las pantallas actuales del producto, o un boceto de las que el cambio agrega, **solo con datos sintéticos**.

   Sacá capturas con `node "<harness>/scripts/capturar.mjs" docs/diseno/catalogo/capturas.json` (acepta rutas
   `file:`). Sirven de «antes» y de material para Claude Design.
3. **Proponé direcciones** en `docs/diseno/direcciones.md`: entre 2 y 3 direcciones visuales **distintas entre sí**.
   Cada una lleva:
   - un nombre corto y la idea en una frase, pensada desde quién usa la app y para qué;
   - el **prompt** listo para pegar en Claude Design: usuarios, tono, densidad de información, tipografía, uso del
     color, marca o su ausencia, accesibilidad AA y estados obligatorios;
   - qué capturas del catálogo adjuntar al prompt;
   - qué mirar para decidir: legibilidad de tablas largas, jerarquía, cómo se ve un error.
4. **Cerrá con ESPERA.** Pedile a la persona, con los pasos escritos:
   1. abrir Claude Design en el navegador (o pedirte que lo hagas en el navegador de la app con su sesión);
   2. crear un proyecto, pegar los prompts y adjuntar las capturas del catálogo;
   3. explorar las direcciones y elegir una;
   4. traer lo elegido al repo: exportar las capturas a `docs/diseno/direccion/` (o pedirte que las saques del
      navegador), y copiar la especificación que dé Claude Design (paleta, tipografía, componentes);
   5. responder con el enlace al proyecto y qué eligió.

   Si el proyecto ya tiene una librería de componentes compilada, `/design-sync` sirve para subirla; es opcional.

   `ESPERA: <persona> (dirección visual en Claude Design)`. No sigas sin la respuesta: sin dirección no hay spec.
5. **Con la respuesta, escribí `docs/diseno/estilo-visual.md`** desde `<harness>/plantillas/estilo-visual.md`,
   empezando por la sección «Dirección visual»:
   - `Proyecto de Claude Design: <enlace>`;
   - `Dirección elegida por: <persona>, dd/mm/aaaa`, con lo que dijo la persona y no con algo que supongas;
   - las capturas de la dirección elegida, con rutas relativas a `docs/diseno/`.

   Los tokens, los componentes y las pantallas de ejemplo salen **de la dirección elegida**, no de una tabla genérica.
   `verificar-proyecto` falla si falta cualquiera de los tres datos.
6. **Recién ahora la spec.** La propuesta del cambio cita `estilo-visual.md` y enlaza las capturas de la dirección.
   Quien aprueba la spec la aprueba **viendo** esas capturas o el proyecto de Claude Design, no leyendo tokens.
   Las pantallas que la dirección no dibujó se aprueban viéndolas en las capturas antes del PR (D-25 de
   ai-desempeno).

## Datos
A claude.ai se suben solo componentes y pantallas con datos sintéticos. Nunca datos de personas (clase «Personal»).
Si el catálogo necesita nombres o cifras, inventalos.
