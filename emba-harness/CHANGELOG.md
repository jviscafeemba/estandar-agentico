# Cambios de emba-harness

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
