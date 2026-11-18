#!/usr/bin/env bash
# CI local (plantilla de emba-harness 0.4.3, tomada de ai-desempeno, D-20). Los mismos pasos que .github/workflows/ci.yml,
# sobre un commit exacto y en una copia limpia del repo. Es la compuerta del método cuando GitHub Actions no puede correr.
#
# Uso:  bash scripts/ci-local.sh [commit] [--comentar <número de PR>]
#   commit         por defecto, HEAD
#   --comentar n   al terminar, pega el resultado en el PR n con gh pr comment. Un agente lo usa solo si
#                  .claude/salida-permitida.txt tiene «pr-comment»: los hooks no ven lo que hace un script por dentro,
#                  así que la regla es del método, no del hook.
# Necesita Node 24, Docker si las pruebas lo usan, y una copia local de jviscafeemba/estandar-agentico que tenga el commit
# del harness fijado en ci.yml (EMBA_HARNESS_REPO). El log queda fuera del repo, en $CI_LOCAL_LOGS/<sha>.log.
#
# Para adaptarlo a un proyecto, cambiá solo PROYECTO y la sección «Pasos del proyecto».
set -euo pipefail

PROYECTO="<proyecto>"
RAIZ="$(git rev-parse --show-toplevel)"
COMMIT="HEAD"
PR=""
while [ $# -gt 0 ]; do
  case "$1" in
    --comentar) PR="${2:?falta el número de PR}"; shift 2 ;;
    *) COMMIT="$1"; shift ;;
  esac
done
SHA="$(git -C "$RAIZ" rev-parse --verify "${COMMIT}^{commit}")"
HARNESS_REPO="${EMBA_HARNESS_REPO:-$RAIZ/../../poc-agentico}"
LOGS="${CI_LOCAL_LOGS:-$HOME/.ci-local/$PROYECTO}"
mkdir -p "$LOGS"
LOG="$LOGS/$SHA.log"

# El commit del harness se lee de ci.yml del commit que se verifica, igual que en GitHub.
HARNESS_SHA="$(git -C "$RAIZ" show "$SHA:.github/workflows/ci.yml" \
  | sed -n '/repository: jviscafeemba\/estandar-agentico/,/path:/s/^ *ref: *\([0-9a-f]\{40\}\).*/\1/p' | head -1)"
if [ -z "$HARNESS_SHA" ]; then echo "ci.yml no fija el harness por commit (ref: <40 hex>)" >&2; exit 2; fi
if ! git -C "$HARNESS_REPO" remote get-url origin | grep -q 'estandar-agentico'; then
  echo "EMBA_HARNESS_REPO ($HARNESS_REPO) no es una copia de jviscafeemba/estandar-agentico" >&2; exit 2
fi
git -C "$HARNESS_REPO" cat-file -e "$HARNESS_SHA^{commit}" 2>/dev/null \
  || { echo "La copia del harness no tiene $HARNESS_SHA: actualizala con git fetch" >&2; exit 2; }

TRABAJO="$(mktemp -d)"
# Pila de pruebas propia de esta corrida: nunca se pisa con otra ni se borra una ajena (F-C08-03).
export COMPOSE_PROJECT_NAME="${PROYECTO}-ci-${SHA:0:8}-$$"
limpiar() {
  if command -v docker > /dev/null 2>&1; then docker compose -p "$COMPOSE_PROJECT_NAME" down -v --remove-orphans > /dev/null 2>&1 || true; fi
  rm -rf "$TRABAJO"
}
trap limpiar EXIT
COPIA="$TRABAJO/repo"
HARNESS="$TRABAJO/harness"

exec > >(tee "$LOG") 2>&1
echo "CI local · $PROYECTO · commit $SHA · harness $HARNESS_SHA · pila $COMPOSE_PROJECT_NAME · $(date -u +%FT%TZ)"

# Copia limpia con todo el historial (gitleaks lo recorre), en el commit exacto.
git clone -q --no-checkout "$RAIZ" "$COPIA"
git -C "$COPIA" checkout -q --detach "$SHA"
mkdir -p "$HARNESS"
git -C "$HARNESS_REPO" archive "$HARNESS_SHA" emba-harness/scripts emba-harness/hooks | tar -x -C "$HARNESS"
cd "$COPIA"

RESULTADOS=()
paso() {
  local nombre="$1"; shift
  local inicio=$SECONDS
  echo "::: $nombre"
  if "$@"; then
    echo "::: $nombre: OK ($((SECONDS - inicio)) s)"
    RESULTADOS+=("- ✔ $nombre ($((SECONDS - inicio)) s)")
  else
    echo "::: $nombre: FALLA ($((SECONDS - inicio)) s)"
    RESULTADOS+=("- ✖ $nombre")
    terminar ROJO 1
  fi
}

terminar() {
  local color="$1" codigo="$2"
  echo "CI local: $color · commit $SHA · harness $HARNESS_SHA · $(date -u +%FT%TZ)"
  if [ -n "$PR" ]; then
    {
      echo "**CI local: $color** sobre \`$SHA\` (harness \`${HARNESS_SHA:0:7}\`), $(date -u +%d/%m/%Y\ %H:%M) UTC."
      echo
      printf '%s\n' "${RESULTADOS[@]}"
      echo
      echo "Log: \`$LOG\` (fuera del repo). Lo corre \`scripts/ci-local.sh\` porque GitHub Actions no está disponible."
    } > "$TRABAJO/comentario.md"
    (cd "$RAIZ" && gh pr comment "$PR" --body-file "$TRABAJO/comentario.md") || echo "No se pudo comentar el PR $PR" >&2
  fi
  exit "$codigo"
}

# ---------- Pasos del proyecto (cambiar según .github/workflows/ci.yml) ----------
paso "Pruebas del método" bash -c 'node --test "tests/**/*.test.mjs"'
# paso "Pruebas de la plataforma" bash scripts/probar-plataforma.sh
#   Con la máquina cargada, las pruebas lentas (axe en jsdom) pueden pasar el límite de 5 s de Vitest (P-044 de
#   ai-desempeno). Subí el tiempo SOLO en esas pruebas (it(..., { timeout: 15000 })), nunca globalmente, y anotalo.
# paso "Specs" env OPENSPEC_TELEMETRY=0 DO_NOT_TRACK=1 npm_config_ignore_scripts=true \
#   npx --yes @fission-ai/openspec@1.15.0 validate --all --strict
paso "Brain del proyecto" node "$HARNESS/emba-harness/scripts/verificar-proyecto.mjs" .
# En Git Bash de Windows, Docker necesita la ruta en formato Windows y sin conversión de MSYS.
ORIGEN="$(pwd -W 2>/dev/null || pwd)"
paso "Secretos" env MSYS_NO_PATHCONV=1 docker run --rm -v "$ORIGEN:/repo" zricethezav/gitleaks:v8.24.3 \
  detect --source /repo --redact --verbose
# ---------- Fin de los pasos del proyecto ----------

terminar VERDE 0
