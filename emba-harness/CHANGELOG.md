# Cambios de emba-harness

## 0.4.2 · 16/11/2026

Lecciones de la corrida 1 de C-08 «Interfaz» en ai-desempeno, que se hizo con el método 0.4.1. Todo lo automático
pasó en verde (296 pruebas de web, axe sin violaciones y 5 rondas del revisor de spec), y la persona vio la app
«horrible». La causa fue del método (F-C08-05): Claude Design solo aparecía al final, como revisión, y nadie diseñó
nada visualmente. El plan lo aprobó Joaquín el 16/11/2026.

### Diseñar antes de la spec
- **Skill nueva `disenar-interfaz`**, en el primer cambio con pantallas cuando el plan dice «Claude Design»:
  1. el agente arma el catálogo inicial con datos sintéticos y propone 2 o 3 direcciones, con prompts para
     Claude Design;
  2. la persona corre `/design-sync`, explora y elige;
  3. recién después se escriben `estilo-visual.md` y la spec.

  El agente no abre Claude Design por su cuenta.
- **`estilo-visual.md` con prueba de diseño:** una sección «Dirección visual» con el enlace al proyecto de Claude
  Design, «Dirección elegida por: persona, dd/mm/aaaa» y capturas de lo elegido. `verificar-proyecto` falla si falta
  alguna de las tres cosas, cuando hay pantallas y el plan dice «Claude Design». También falla si una captura citada
  no existe en el repo.
- **Aprobación viéndolo:**
  - la plantilla `openspec-config.yaml` no deja escribir la propuesta sin la dirección elegida, y la sección
    «Pantallas» enlaza sus capturas;
  - `proponer-cambio` muestra las capturas al pedir la aprobación;
  - `revisor-spec` pregunta «¿alguien diseñó esto visualmente?» y marca como grave un estilo que es solo una tabla de
    tokens.
- `emba-brain/estandares/interfaz.md`, `plantillas/plan.md` y `PROPUESTA-METODOLOGIA.md` describen el paso de diseño.

### Mirar el producto antes del PR
- `mirar-producto` pide la mirada de la persona **antes** de abrir el PR. En los momentos obligatorios del plan,
  cierra con ESPERA hasta su respuesta.
- **Script nuevo `scripts/capturar.mjs`:** guarda capturas PNG con Chrome o Edge sin ventana, por el protocolo
  DevTools y sin dependencias.
  - Toma pantallas, anchos y modo claro u oscuro, con cookies sintéticas para ver pantallas con sesión.
  - Solo abre `localhost`, `127.x`, `[::1]` o `file:`.

  En la corrida 1 hubo que hacerlo con un script suelto, porque ni el navegador de la app ni Playwright guardaban
  PNG.

### Menores
- **F-C08-01:** `plantillas/plan.md` explica cómo subir la versión del harness: el commit vive en el CI y, si el
  proyecto lo fija también en una prueba del método, en esa prueba. Las dos se cambian juntas, con la prueba
  autorizada.
- **F-C08-02:** `verificar-proyecto` falla si la línea 1 de `docs/plan/plan.md` no es un `# título`.
- **`bloquear-salida`:** un push o PR permitido seguido de una tubería o una redirección de su salida
  (`git push -u origin feat/x 2>&1 | tail -3`) ya no se rechaza.
- **`salida-permitida.txt`:** línea nueva `pr-comment`, para `gh pr comment` con `--body` o `--body-file` en el repo
  actual (D-20: pegar el CI en el PR). `--repo`, `--web` y comentar sin cuerpo siguen bloqueados.
- **`proteger-pruebas`:** un texto entre comillas con espacios que solo menciona una ruta de pruebas (el cuerpo de un
  PR, una nota) no bloquea. Se sigue mirando si empieza como una ruta, o si el tramo lo lee un intérprete, asigna
  variables o tiene `$( )`.
- **`bloquear-secretos` con `sed` y `grep`:** los dos falsos positivos de la corrida vienen de patrones como `.*`
  entre comillas. Los resuelve el ajuste `secretos-patrones-citados` de la 0.4.1, que un proyecto activa en
  `.claude/ajustes-harness.txt`. No se cambió la regla por defecto.

### Al subir desde 0.4.1
Con pantallas y «Claude Design» en el plan, `verificar-proyecto` exige la «Dirección visual» en `estilo-visual.md`.
Es a propósito: es la corrida en limpio de C-08.

## 0.4.1 · 16/11/2026

Dos ajustes de hooks para falsos positivos que reportó ai-genesys (13 a 16/11/2026), más Claude Design como
estándar de interfaz (abajo). Los ajustes de hooks están **apagados por defecto:** sin
`.claude/ajustes-harness.txt`, los hooks se comportan igual que en la 0.4.0. Cada proyecto los activa en ese
archivo, que escribe una persona (archivo de control: el agente no puede escribirlo). No se afloja nada más.

- **`pruebas-desde-raiz`** (`proteger-pruebas`, E4): el shell calza las rutas protegidas desde la raíz del
  proyecto, con el mismo criterio que Edit y Write. Ya no frena `git checkout --ours platform/x/tests/t.py` ni
  `sed -i … src/app/tests/t.py` (19 bloqueos en ai-genesys). Siguen bloqueados:
  - `tests/x.py`, `./tests/x.py` y `tests\x.py`;
  - la ruta absoluta del proyecto (`C:/…`, `C:\…` y `/c/…` de Git Bash).
- **`secretos-patrones-citados`** (`bloquear-secretos`): en `sed`, `grep`, `awk`, `perl` y `rg` se ignora el
  argumento del patrón si está entero entre comillas y sin `$( )` ni backticks. Ya no frenan
  `sed -i '16s/.*/…/'` ni `grep 'secrets:' compose.yaml` (8 bloqueos en ai-genesys). Siguen mirándose:
  - los archivos y las opciones con valor (`-f`, `-g`, `--include`);
  - los patrones sin comillas;
  - las demás herramientas.

  En las pruebas, 30 accesos reales siguen bloqueados y 9 patrones pasan.
- Los bloqueos en `.emba/metricas.jsonl` registran qué ajustes estaban activos (`"ajustes": [...]`).
- Plantilla `plantillas/ajustes-harness.txt`; `nuevo-proyecto` la menciona.

### Claude Design como estándar «salvo que se indique lo contrario» (Joaquín, 16/11/2026; se prueba en C-08)
- `plantillas/plan.md`: la fila «Interfaz y marca» trae «Claude Design» por defecto. Para no usarlo:
  «sin Claude Design (OK: persona, dd/mm/aaaa)». `verificar-proyecto` falla si la fila asignada no dice ninguna de
  las dos, o si dice «sin Claude Design» sin OK y fecha. Si la interfaz está fuera de alcance, no se pide.
- `plantillas/estilo-visual.md`: sección «Claude Design» con el enlace al proyecto y lo que se sincroniza (tokens,
  componentes base, pantallas de ejemplo). Sincroniza una persona con `/design-sync`, que arranca a mano y aprueba
  cada plan de archivos. El repo es la fuente de verdad.
- `emba-brain/estandares/interfaz.md`:
  - Claude Design como herramienta estándar de diseño y revisión visual;
  - regla de datos: a claude.ai solo datos sintéticos, nunca la clase «Personal». Es una salida (E6) permitida
    solo para eso;
  - aviso de la mudanza: claude.ai/design cierra el 14/12/2026 y pasa a vivir dentro de Claude.
- Skill `mirar-producto`: si el plan usa Claude Design, se revisan los componentes sincronizados. El PR suma el
  enlace y la casilla «Componentes revisados en Claude Design». Los hallazgos van aparte en `mirada.md`, para medir
  si aportan algo distinto de las capturas.
- `plantillas/openspec-config.yaml`: una tarea deja la librería de componentes lista para `/design-sync`. El agente
  prepara; la persona sincroniza.
- **Al subir desde 0.4.0:** un plan con la interfaz asignada a un cambio tiene que decir «Claude Design» o «sin
  Claude Design (OK: …)».

## 0.4.0 · 13/11/2026

Ajustes del método que salieron del piloto de ai-desempeno (reporte final del 13/11/2026, fallas F-P-03 a F-P-15 y
lección P-029: la app pasó todas sus pruebas sin ningún estilo, porque ningún RF lo pedía y nadie la vio funcionando).

### Lo que el usuario espera y nadie pide
- **Temas transversales en el plan** (`plantillas/plan.md`): interfaz y marca, accesibilidad, rendimiento y
  operación se asignan a un cambio o quedan «fuera de alcance (OK: persona, dd/mm/aaaa)». `verificar-proyecto` falla
  si una fila queda sin asignar o si el plan no tiene la sección.
- **Estilo visual** (`plantillas/estilo-visual.md`, más el estándar de empresa `emba-brain/estandares/interfaz.md`).
  `verificar-proyecto` falla si un proyecto con pantallas no tiene `docs/diseno/estilo-visual.md`.
- **Revisor de spec** (agente nuevo `revisor-spec`): suma «qué espera ver el usuario que la spec no pide», exige que
  las specs con pantallas citen el estilo y hace la última revisión contra el código real del cambio del que depende.
- **Mirada al producto** (skill nueva `mirar-producto`): la app corre, las capturas van al PR y una persona la ve
  después del primer cambio con pantallas y al cierre.
- Plantillas de `AGENTS.md` y brief: lo que ninguna spec cubre se anota como pendiente o pregunta.

### Método
- **Verificación oculta** como elemento E12 (`plantillas/verificacion-oculta.md`): se escribe antes de implementar,
  fuera del repo, y cada falla se revisa antes de contarla como defecto (F-P-13, F-P-15).
- **OpenSpec en nivel 3**: `plantillas/openspec-config.yaml` con las lecciones del piloto (pruebas autorizadas,
  `## Purpose`, sección «Pantallas», pruebas nuevas con Write). `nuevo-proyecto` la instala en nivel 3.
- `nuevo-proyecto` deja a una persona creando `.claude/protegidos.txt` y `.claude/salida-permitida.txt` (F-P-12).

### Hooks
- `bloquear-salida`:
  - **loopback:** `curl`, `wget` e `Invoke-WebRequest` pasan si todas sus URL son `localhost`, `127.x.x.x` o `[::1]`,
    sin proxy, `--resolve`, `--connect-to`, archivos de configuración ni subcomandos;
  - **lista de salida** `.claude/salida-permitida.txt` (la escribe una persona) para push a ramas que no son
    `main` ni `master` y `gh pr create` en el repo actual (F-P-03). Unir, forzar, borrar ramas y otros repos siguen
    bloqueados.
- `proteger-pruebas` lee el comando tramo por tramo y mira el destino de cada redirección: un comando que solo nombra
  la carpeta de pruebas ya no se bloquea (F-P-04, 41 de los 56 bloqueos del piloto). Su mensaje dice que crear
  pruebas nuevas con Write está permitido (F-P-09).
- `.claude/salida-permitida.txt` es archivo de control: el agente no puede escribirlo.

### Ajustes del 16/11/2026 (OK de Joaquín, pedido de la orquestadora de ai-desempeno)
- **`proteger-pruebas`:** copiar o mover **desde** una carpeta de pruebas ya no se bloquea. En `cp`, `mv` y
  `Copy-Item` solo cuenta el destino; si no se puede leer con certeza, se mira el tramo entero.
- **`bloquear-secretos`:** `.env.sample` se puede leer, igual que `.env.example`. `.env`, `.env.local` y `secrets/`
  siguen bloqueados. P-019 no lo frenaba el hook, sino la regla «nunca `.env*`» de las instrucciones.
- **`bloquear-salida` mira lo que se ejecuta, no el texto.** Ya no cuentan:
  - un argumento entre comillas con espacios (mensaje de commit, cuerpo de PR);
  - el cuerpo de un heredoc que va a `cat` o `tee`.

  Falla cerrada: con un intérprete o envoltorio (`bash -c`, `sudo`, `node -e`), una asignación de variables o
  `$( )`, se mira el tramo entero. Además:
  - corrige un hueco propio de esta versión: el cuerpo de un heredoc dirigido a un intérprete
    (`bash <<EOF … git push … EOF`) se quitaba y no se miraba;
  - `git.exe push` y `gh.exe` también cuentan.
- **Uniones con alcance:** nueva línea `merge <rama base>` en `.claude/salida-permitida.txt`. `gh pr merge` pasa
  solo si se cumplen las dos condiciones:
  - la base del PR es esa rama, y nunca `main` ni `master` (aunque estén en la lista);
  - todos sus checks de CI pasaron. Sin checks, no se une.

  El hook lo lee con `gh pr view` (solo lectura); si no puede leerlo, bloquea. `--admin`, `--auto` y `--repo`
  siguen bloqueados.

### Scripts y skills
- `verificar-proyecto`:
  - la trazabilidad lee pytest (`test_*.py`, `*_test.py`) y `.spec`/`.tsx` (F-P-05). Sobre ai-desempeno da 41/44,
    el mismo conteo manual del piloto;
  - ignora `.claude/` (worktrees de agentes), entornos de Python y builds;
  - avisa si hay pruebas fuera de `tests/` sin `.claude/protegidos.txt`.
- `verificar` se puede invocar desde el agente (F-P-10).

### Al subir desde 0.3.3
`verificar-proyecto` puede empezar a fallar en dos casos:
- un proyecto con pantallas sin `docs/diseno/estilo-visual.md`;
- un `docs/plan/plan.md` sin la sección de temas transversales.

Los dos son a propósito. En ai-desempeno los resuelven el RNF de interfaz y C-08.

### Queda para 0.5
- El vigilante de progreso de las implementadoras (F-P-14, recomendación 7.4 del reporte).

## 0.3.3-sim

Versión de la simulación del método v2 y del piloto de ai-desempeno (commit `3193f0f`).
