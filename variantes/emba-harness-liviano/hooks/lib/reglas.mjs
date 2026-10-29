// Reglas de los hooks de seguridad (ADR-E002). Funciones puras: las prueba tests/reglas.test.mjs.
// El hook es la segunda línea de defensa; la primera son los permisos negados de la política administrada.

const DELIM = String.raw`[\\/\s'"=:;|&<>(),]`;
const ARCHIVO_ENTORNO = new RegExp(String.raw`(^|${DELIM})\.env(\.(?!example\b)[\w.-]+)?(?=$|${DELIM})`, "i");
const CARPETA_SECRETOS = new RegExp(String.raw`(^|${DELIM})secrets(?=$|${DELIM})`, "i");

// Quita comillas y el escape de PowerShell, que sirven para partir un nombre (.e""nv, .e`nv) sin cambiar su
// efecto. La barra invertida no se quita: en Windows es separador de rutas. Límite conocido: una expansión
// ($(echo .env), variables) no se detecta; para eso están los permisos negados de la política administrada.
export function normalizar(texto) {
  return texto.replace(/["'`]/g, "");
}

function comodinARegex(segmento) {
  const cuerpo = segmento.replace(/[.+^${}()|]/g, "\\$&").replace(/\*/g, ".*").replace(/\?/g, ".");
  return new RegExp(`^${cuerpo}$`, "i");
}

// Un segmento con comodines que podría resolverse a .env o a secrets (cat .e*, ls secr?ts).
function comodinAlcanzaSecreto(texto) {
  const segmentos = texto.split(/[\s\\/'"=:;|&<>(),]+/).filter((s) => /[*?\[]/.test(s));
  return segmentos.some((s) => {
    if (s.includes("[")) s = s.replace(/\[[^\]]*\]/g, "?");
    const re = comodinARegex(s);
    const literal = s.replace(/[*?]/g, "");
    const tocaEntorno = s.startsWith(".") && (re.test(".env") || re.test(".env.local"));
    const tocaSecretos = literal.length > 0 && re.test("secrets");
    return tocaEntorno || tocaSecretos;
  });
}

function textosRevisables(herramienta, entrada) {
  const textos = [entrada.file_path, entrada.notebook_path, entrada.path, entrada.command];
  if (herramienta === "Glob") textos.push(entrada.pattern);
  if (herramienta === "Grep") textos.push(entrada.glob); // el pattern de Grep es texto a buscar, no una ruta
  return textos.filter((t) => typeof t === "string");
}

export function accesoASecreto(herramienta, entrada = {}) {
  for (const original of textosRevisables(herramienta, entrada)) {
    const t = normalizar(original);
    if (ARCHIVO_ENTORNO.test(t) || CARPETA_SECRETOS.test(t) || comodinAlcanzaSecreto(t)) {
      return {
        regla: "secretos",
        motivo:
          "Bloqueado por emba-harness (ADR-E002): los archivos de entorno y la carpeta secrets/ no se leen, " +
          "no se tocan y no se borran. Si el cambio lo necesita, frená y avisá a una persona del proyecto.",
      };
    }
  }
  return null;
}

const PELIGROSOS = [
  { regla: "git-push-force", re: /\bgit\s+push\b[^;&|\n]*\s(-f|--force(-with-lease)?)(?=\s|$)/ },
  { regla: "git-reset-hard", re: /\bgit\s+reset\b[^;&|\n]*\s--hard\b/ },
  { regla: "git-clean", re: /\bgit\s+clean\b[^;&|\n]*\s-[a-z]*f/ },
  { regla: "descargar-y-ejecutar", re: /\b(curl|wget|iwr|irm|Invoke-WebRequest|Invoke-RestMethod)\b[^|\n]*\|\s*(sh|bash|zsh|iex|Invoke-Expression)\b/i },
  { regla: "drop-database", re: /\bdrop\s+(database|schema)\b/i },
];

// rm -rf / Remove-Item -Recurse -Force sobre algo fuera del proyecto: raíz, home, padre, comodín suelto o ruta absoluta.
function borradoMasivo(cmd) {
  for (const parte of cmd.split(/;|&&|\|\||\n/)) {
    const tokens = parte.trim().split(/\s+/);
    const i = tokens.findIndex((t) => t === "rm" || /^(Remove-Item|ri|del|rmdir)$/i.test(t));
    if (i < 0) continue;
    const args = tokens.slice(i + 1);
    const flags = args.filter((a) => a.startsWith("-")).join(" ");
    const recursivo = /(^|\s)-[a-z]*r|--recursive|-Recurse/i.test(flags);
    const forzado = /(^|\s)-[a-z]*f|--force|-Force/i.test(flags);
    if (!(recursivo && forzado)) continue;
    const objetivos = args.filter((a) => !a.startsWith("-"));
    if (objetivos.some((o) => /^(\/|~|\$HOME|\$env:|\.\.|\*$|[A-Za-z]:)/i.test(o))) return true;
  }
  return false;
}

export function comandoPeligroso(comando) {
  if (typeof comando !== "string") return null;
  const cmd = normalizar(comando);
  const hallado = PELIGROSOS.find((p) => p.re.test(cmd));
  const regla = hallado?.regla ?? (borradoMasivo(cmd) ? "borrado-masivo" : null);
  if (!regla) return null;
  return {
    regla,
    motivo:
      `Bloqueado por emba-harness (ADR-E002, regla ${regla}): es una acción destructiva o irreversible. ` +
      "Si de verdad hace falta, la ejecuta una persona.",
  };
}
