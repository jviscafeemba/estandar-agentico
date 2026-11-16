# Estilo visual · <proyecto>

Lo leen las specs y los cambios que tienen pantallas: cada una lo cita, y el revisor de spec y el de código lo
contrastan. La base común (accesibilidad, estados, tono, marca por empresa) está en el estándar de empresa
`estandares/interfaz.md` (skill `emba-empresa:consultar-brain`). Este archivo guarda solo lo propio del proyecto y
no repite la base.

- **Dueño:** <persona>. **Aprobado:** <persona>, dd/mm/aaaa.
- **Requerimiento:** RNF-0xx (interfaz).

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

## 6. Cómo se verifica

- Prueba automática de accesibilidad (axe) sobre cada pantalla de ejemplo: `<comando>`.
- Las capturas de cada PR con pantallas (skill `mirar-producto`) y la mirada de una persona en los momentos del plan.
