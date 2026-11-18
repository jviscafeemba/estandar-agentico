# Estilo visual · <proyecto>

Lo leen las specs y los cambios que tienen pantallas: cada una lo cita, y el revisor de spec y el de código lo
contrastan. La base común (accesibilidad, estados, tono, marca por empresa) está en el estándar de empresa
`estandares/interfaz.md` (skill `emba-empresa:consultar-brain`). Este archivo guarda solo lo propio del proyecto y
no repite la base.

- **Dueño:** <persona>. **Aprobado:** <persona>, dd/mm/aaaa.
- **Requerimiento:** RNF-0xx (interfaz).

## Dirección visual

La prueba de que alguien diseñó esto **mirándolo** (0.4.2). Se completa en el paso de diseño (skill
`disenar-interfaz`), antes de la spec del primer cambio con pantallas. Todo lo demás de este archivo sale de la
dirección elegida. Si el plan dice «sin Claude Design (OK: …)», esta sección dice cómo se eligió la dirección sin él.

- **Proyecto de Claude Design:** <enlace al proyecto>
- **Dirección elegida por:** <persona>, dd/mm/aaaa
- **Qué se eligió y por qué:** <una o dos frases de la persona>
- **Alternativas descartadas:** `docs/diseno/direcciones.md`

![<pantalla> en la dirección elegida](direccion/<pantalla>.png)

`verificar-proyecto` falla, si el plan usa Claude Design y hay pantallas, cuando falta el enlace, el nombre con la
fecha o una captura que exista en el repo.

## 1. Marca

| Empresa o ámbito | Logo (ruta en el repo) | Color primario | Nombre que se muestra |
| --- | --- | --- | --- |
| <empresa> | `web/public/marca/<empresa>.svg` | `#xxxxxx` | <nombre> |

Si falta un dato de marca, queda como pregunta Q-0nn con un valor neutro provisional. No se inventan colores ni
logos.

## 2. Tokens

Los tokens viven en un solo archivo de código (por ejemplo `web/src/estilos/tokens.css`) como variables CSS. Los
componentes usan las variables y nunca un valor suelto.

| Token | Claro | Oscuro | Uso |
| --- | --- | --- | --- |
| `--color-fondo` | | | Fondo de la página |
| `--color-superficie` | | | Tarjetas, tablas y diálogos |
| `--color-texto` | | | Texto principal (contraste ≥ 4,5:1 sobre fondo y superficie) |
| `--color-texto-suave` | | | Texto secundario (contraste ≥ 4,5:1) |
| `--color-primario` | | | Acción principal y enlaces |
| `--color-peligro` / `--color-exito` / `--color-aviso` | | | Mensajes y estados |
| `--color-borde` | | | Bordes y separadores (contraste ≥ 3:1 si delimita un control) |
| `--fuente` | | | Familia tipográfica, con su fuente de respaldo |
| `--texto-xs … --texto-xl` | | | Escala de tamaños (base 16 px) |
| `--espacio-1 … --espacio-6` | | | Escala de espaciado (múltiplos de 4 px) |
| `--radio` / `--sombra` | | | Bordes redondeados y elevación |

Modo oscuro: <sí, sigue al sistema / no, solo claro (decisión de <persona>, dd/mm/aaaa)>.

## 3. Componentes base

Cada pantalla se arma con estos componentes. Uno nuevo se agrega aquí antes de usarlo en una segunda pantalla.

| Componente | Archivo | Reglas |
| --- | --- | --- |
| Botón | | Primario, secundario y peligro; un solo primario por pantalla; deshabilitado con motivo visible |
| Campo de formulario | | Etiqueta visible siempre; ayuda y error debajo, asociados al campo |
| Tabla | | Encabezado fijo; números alineados a la derecha; estado vacío; orden y paginación si hay más de <n> filas |
| Mensaje | | Éxito, aviso y error; el error dice qué pasó y qué hacer |
| Diálogo | | Confirmación de lo irreversible; foco atrapado; Esc cierra |
| Encabezado y navegación | | Marca del ámbito, usuario, salir |

## 4. Librería o CSS propio

<Decisión y ADR. La recomendación del estándar es CSS propio con tokens. Para los controles difíciles de hacer
accesibles (diálogo, combobox, menú) se usa una librería sin estilos ("headless"), decidida en un ADR.>

## 5. Pantallas de ejemplo

Dos o tres pantallas representativas, descritas en texto (y con captura cuando existan). Sirven de referencia para
que los cambios siguientes se vean iguales.

### <Pantalla>
- **Quién la usa y para qué:**
- **Estructura:** encabezado → título y acción principal → filtros → tabla → paginación.
- **Estados:** cargando, vacío, error, sin permiso.
- **Captura:** `docs/capturas/<C-0n>/<pantalla>.png`

## 6. Claude Design

Por defecto, la interfaz se diseña y se revisa en Claude Design (estándar de empresa `estandares/interfaz.md`).
Si el plan dice «sin Claude Design (OK: persona, dd/mm/aaaa)», esta sección dice solo eso.

- **Proyecto de sistema de diseño:** el de «Dirección visual».
- **Cuándo:** primero **antes** de la spec, para elegir la dirección (paso de diseño); después en cada cambio con
  pantallas, para revisar lo implementado (skill `mirar-producto`).
- **Cómo se usa:** desde el navegador (vía principal, 0.4.3). Una persona abre el proyecto, o se lo pide al agente
  en el navegador de la app con su sesión, estando presente. Se le adjuntan las capturas del catálogo y de la app.
  Todo con datos sintéticos: ningún dato de personas sale del repositorio.
- **`/design-sync` (opcional):** solo si el proyecto tiene una librería de componentes compilada. Lo arranca una
  persona y aprueba cada plan de archivos.
- **Fuente de verdad:** el repositorio. En Claude Design se explora y se elige; lo elegido vuelve al repo y desde
  ahí manda este archivo y el código. Un cambio que nace después de un comentario en Claude Design entra al repo por
  el flujo de siempre (spec, prueba, PR), no copiándolo de vuelta.
- **Última revisión en Claude Design:** dd/mm/aaaa, commit `<sha>`, por <persona>.

## 7. Cómo se verifica

- Prueba automática de accesibilidad (axe) sobre cada pantalla de ejemplo: `<comando>`.
- Las capturas de cada PR con pantallas (skill `mirar-producto`) y la mirada de una persona en los momentos del plan.
- Si se usa Claude Design: la revisión de los componentes sincronizados, con sus hallazgos aparte en `mirada.md`.
